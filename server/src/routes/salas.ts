// server/src/routes/salas.ts (VERSION DEFINITIVA "CONTADOR OK")

import { PrismaClient, Sala } from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express"; 
import type { CustomRequest } from "../types.d.ts"; 
import { z } from "zod";

const cuerpoCrearSala = z.object({
  anfitrion: z.string().min(1, "El nombre del anfitrión es obligatorio"),
});

const cuerpoUnirseSala = z.object({
  nombre: z.string().min(1, "El nombre del estudiante es obligatorio"),
  carrera: z.string().optional().nullable(),
  equipoNombre: z.string().optional().nullable() 
});

const cuerpoCargaMasiva = z.object({
  equipos: z.array(z.object({
    nombre: z.string(),
    integrantes: z.array(z.object({
      nombre: z.string(),
      carrera: z.string().optional()
    }))
  }))
});

const cuerpoActualizarEstado = z.object({
    faseActual: z.string().optional(),
    segundosRestantes: z.number().optional(),
    timerCorriendo: z.boolean().optional(),
    formacion: z.string().optional(), 
    estado: z.string().optional(),
    datosJuego: z.any().optional() 
}).partial();

export default function salasRouter(prisma: PrismaClient) {
  const r = Router();
  
  const findSalaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const codigoParam = String(req.params.codigo || "").toUpperCase();
    const sala: Sala | null = await prisma.sala.findUnique({ where: { codigo: codigoParam } });
    
    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });
    
    (req as CustomRequest).sala = sala;
    next();
  };

  /* POST /salas */
  r.post("/", async (req: Request, res: Response) => { 
    const parse = cuerpoCrearSala.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

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
      data: { codigo, anfitrionId: anfitrion.id }
    });

    res.json({ codigoSala: sala.codigo });
  });

  /* POST /unirse -> CORREGIDO (VALIDA NOMBRE Y MARCA LISTO) */
  r.post("/:codigo/unirse", findSalaMiddleware, async (req: Request, res: Response) => {
    const customReq = req as CustomRequest; 
    const parse = cuerpoUnirseSala.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    const nombreEquipo = parse.data.equipoNombre?.trim();
    
    // VALIDA QUE TENGA NOMBRE (Adiós "Equipo Temporal")
    if (!nombreEquipo) {
        return res.status(400).json({ error: "El nombre del equipo es obligatorio." });
    }

    const equipo = await prisma.equipo.upsert({
      where: { salaId_nombre: { salaId: customReq.sala.id, nombre: nombreEquipo } },
      update: {},
      create: { 
          nombre: nombreEquipo, 
          salaId: customReq.sala.id,
          listo: true // <--- ¡AQUÍ ESTÁ LA CLAVE! Nace listo si es manual.
      }
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

  /* POST /masivo -> CORREGIDO (MARCA AUTO) */
  r.post("/:codigo/masivo", findSalaMiddleware, async (req: Request, res: Response) => {
      const customReq = req as CustomRequest;
      const parse = cuerpoCargaMasiva.safeParse(req.body);
      if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

      await prisma.$transaction(async (tx) => {
          await tx.equipo.deleteMany({ where: { salaId: customReq.sala.id } });

          for (const eq of parse.data.equipos) {
              const ne = await tx.equipo.create({
                  data: {
                      nombre: eq.nombre,
                      salaId: customReq.sala.id,
                      listo: false // <--- Nace NO listo (espera confirmación)
                  }
              });
              
              if (eq.integrantes.length > 0) {
                  await tx.integrante.createMany({
                      data: eq.integrantes.map(i => ({
                          nombre: i.nombre,
                          carrera: i.carrera,
                          equipoId: ne.id
                      }))
                  });
              }
          }

          await tx.sala.update({
              where: { id: customReq.sala.id },
              data: { formacion: "auto" } // <--- Fuerza modo AUTO
          });
      });

      res.json({ ok: true });
  });

  /* GET /estado -> CORREGIDO (DEVUELVE 'listo') */
  r.get("/:codigo/estado", findSalaMiddleware, async (req: Request, res: Response) => {
    const salaFull = await prisma.sala.findUnique({
        where: { id: (req as CustomRequest).sala.id },
        include: { equipos: { include: { integrantes: true } } }
    });

    if (!salaFull) return res.status(404).json({ error: "Sala no encontrada" });
    
    res.json({
        faseActual: salaFull.faseActual,
        segundosRestantes: salaFull.segundosRestantes,
        timerCorriendo: salaFull.timerCorriendo,
        roomCode: salaFull.codigo,
        formacion: salaFull.formacion, 
        datosJuego: salaFull.datosJuego, 
        
        equipos: salaFull.equipos.map(e => ({
            id: e.id,                
            nombre: e.nombre,
            listo: e.listo, // <--- ¡ESTO FALTABA PARA EL CONTADOR!
            puntos: e.puntos,        
            foto: e.fotoLegoUrl,     
            desafioId: e.desafioId,
            integrantes: e.integrantes.map(i => ({ nombre: i.nombre, carrera: i.carrera || "" }))
        }))
    });
  });

  /* PATCH /estado */
  r.patch("/:codigo/estado", findSalaMiddleware, async (req: Request, res: Response) => {
    const parse = cuerpoActualizarEstado.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    const dataToUpdate: any = { ...parse.data };
    if (dataToUpdate.datosJuego) dataToUpdate.datosJuego = dataToUpdate.datosJuego;

    const updated = await prisma.sala.update({
        where: { id: (req as CustomRequest).sala.id },
        data: dataToUpdate,
    });

    res.json({
        faseActual: updated.faseActual,
        formacion: updated.formacion, 
        datosJuego: updated.datosJuego, 
    });
  });

  return r;
}