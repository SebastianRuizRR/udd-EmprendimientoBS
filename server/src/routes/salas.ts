// server/src/routes/salas.ts (Versión Final Fullstack Optimizado)

import { PrismaClient, Sala } from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express"; 
import type { CustomRequest } from "../types.d.ts"; 
import { z } from "zod";

/* Validación de cuerpos */
const cuerpoCrearSala = z.object({
  anfitrion: z.string().min(1, "El nombre del anfitrión es obligatorio"),
});

const cuerpoUnirseSala = z.object({
  nombre: z.string().min(1, "El nombre del estudiante es obligatorio"),
  carrera: z.string().optional().nullable(),
  equipoNombre: z.string().optional().nullable() 
});

// Nuevo esquema para carga masiva (Excel)
const cuerpoCargaMasiva = z.object({
  equipos: z.array(z.object({
    nombre: z.string(),
    integrantes: z.array(z.object({
      nombre: z.string(),
      carrera: z.string().optional()
    }))
  }))
});

// Esquema para actualizar el estado del juego (Incluye 'formacion')
const cuerpoActualizarEstado = z.object({
    faseActual: z.string().optional(),
    segundosRestantes: z.number().optional(),
    timerCorriendo: z.boolean().optional(),
    formacion: z.string().optional(), 
    estado: z.string().optional(), 
}).strict().partial(); 

export default function salasRouter(prisma: PrismaClient) {
  const r = Router();
  
  // Middleware: Encuentra sala y la adjunta (con casting interno)
  const findSalaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const codigoParam = String(req.params.codigo || "").toUpperCase();
    const sala: Sala | null = await prisma.sala.findUnique({ where: { codigo: codigoParam } });
    
    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });
    
    // Casting para asignar al request
    (req as CustomRequest).sala = sala;
    next();
  };

  /* POST /salas -> Crea sala y usuario */
  r.post("/", async (req: Request, res: Response) => { 
    const parse = cuerpoCrearSala.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Cuerpo inválido", detalle: parse.error.flatten() });
    }

    const nombreAnfitrion = parse.data.anfitrion;
    const usernameGen = nombreAnfitrion.toLowerCase().replace(/\s+/g, '.');

    const anfitrion = await prisma.usuario.upsert({
        where: { username: usernameGen },
        update: {},
        create: {
            username: usernameGen,
            nombre: nombreAnfitrion,
            password: "123",
            esAdmin: true
        }
    });

    const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";
    let existe = true;
    
    while(existe) {
        codigo = Array.from({ length: 5 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join("");
        const check = await prisma.sala.findUnique({ where: { codigo }});
        if(!check) existe = false;
    }

    const sala = await prisma.sala.create({
      data: { 
          codigo, 
          anfitrionId: anfitrion.id,
      }
    });

    res.json({ codigoSala: sala.codigo });
  });

  /* POST /salas/:codigo/unirse -> Alumnos (Individual) */
  r.post("/:codigo/unirse", findSalaMiddleware, async (req: Request, res: Response) => {
    const customReq = req as CustomRequest; 
    const sala = customReq.sala; 
    
    const parse = cuerpoUnirseSala.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    const nombreEquipo = (parse.data.equipoNombre?.trim() || "Equipo Temporal");

    const equipo = await prisma.equipo.upsert({
      where: { salaId_nombre: { salaId: sala.id, nombre: nombreEquipo } },
      update: {},
      create: { nombre: nombreEquipo, salaId: sala.id }
    });

    await prisma.integrante.create({
      data: {
        nombre: parse.data.nombre,
        carrera: parse.data.carrera ?? undefined,
        equipoId: equipo.id
      }
    });

    res.json({ ok: true, equipo: equipo.nombre, equipoId: equipo.id });
  });

  /* POST /salas/:codigo/masivo -> Carga Equipos desde Excel (Optimizado) */
  r.post("/:codigo/masivo", findSalaMiddleware, async (req: Request, res: Response) => {
      const customReq = req as CustomRequest;
      const sala = customReq.sala;
      
      const parse = cuerpoCargaMasiva.safeParse(req.body);
      if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

      // Transacción para velocidad y consistencia
      await prisma.$transaction(async (tx) => {
          for (const eq of parse.data.equipos) {
              // Crear equipo
              const nuevoEquipo = await tx.equipo.create({
                  data: {
                      nombre: eq.nombre,
                      salaId: sala.id
                  }
              });
              
              // Crear sus integrantes en lote
              if (eq.integrantes.length > 0) {
                  await tx.integrante.createMany({
                      data: eq.integrantes.map(i => ({
                          nombre: i.nombre,
                          carrera: i.carrera,
                          equipoId: nuevoEquipo.id
                      }))
                  });
              }
          }
      });

      res.json({ ok: true });
  });

  /* GET /salas/:codigo/estado -> Polling completo (Estado + Equipos con ID) */
  r.get("/:codigo/estado", findSalaMiddleware, async (req: Request, res: Response) => {
    const customReq = req as CustomRequest; 
    
    const salaFull = await prisma.sala.findUnique({
        where: { id: customReq.sala.id },
        include: { 
            equipos: {
                include: { integrantes: true }
            }
        }
    });

    if (!salaFull) return res.status(404).json({ error: "Sala no encontrada" });
    
    res.json({
        faseActual: salaFull.faseActual,
        segundosRestantes: salaFull.segundosRestantes,
        timerCorriendo: salaFull.timerCorriendo,
        roomCode: salaFull.codigo,
        formation: salaFull.formacion, 
        
        equipos: salaFull.equipos.map(e => ({
            id: e.id,                
            nombre: e.nombre,
            puntos: e.puntos,        
            foto: e.fotoLegoUrl,     
            desafioId: e.desafioId,
            integrantes: e.integrantes.map(i => ({ nombre: i.nombre, carrera: i.carrera || "" }))
        }))
    });
  });

  /* PATCH /salas/:codigo/estado -> Actualiza estado (Profesor) */
  r.patch("/:codigo/estado", findSalaMiddleware, async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;
    const sala = customReq.sala;
    
    const parse = cuerpoActualizarEstado.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Cuerpo inválido", detalle: parse.error.flatten() });

    const dataToUpdate: any = { ...parse.data };
    if (dataToUpdate.formacion) {
        dataToUpdate.formacion = dataToUpdate.formacion;
    }

    const updatedSala = await prisma.sala.update({
        where: { id: sala.id },
        data: dataToUpdate,
    });

    res.json({
        faseActual: updatedSala.faseActual,
        segundosRestantes: updatedSala.segundosRestantes,
        timerCorriendo: updatedSala.timerCorriendo,
        roomCode: updatedSala.codigo,
        formation: updatedSala.formacion, 
    });
  });

  return r;
}