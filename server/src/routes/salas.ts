// server/src/routes/salas.ts (Código Final Type-Safe y Compatible)

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

// Esquema para actualizar el estado del juego
const cuerpoActualizarEstado = z.object({
    faseActual: z.string().optional(),
    segundosRestantes: z.number().optional(),
    timerCorriendo: z.boolean().optional(),
}).strict().partial(); 

export default function salasRouter(prisma: PrismaClient) {
  const r = Router();
  
  // 🚨 ARREGLO CRÍTICO: Usamos Request base, pero forzamos el casting internamente para escribir req.sala
  const findSalaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const codigoParam = String(req.params.codigo || "").toUpperCase();
    const sala: Sala | null = await prisma.sala.findUnique({ where: { codigo: codigoParam } });
    
    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });
    
    // Forzar la asignación para que el siguiente handler (CustomRequest) lo reciba
    (req as CustomRequest).sala = sala;
    next();
  };

  /* POST /salas -> Crea sala */
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

  /* POST /salas/:codigo/unirse -> Alumnos */
  // 🚨 Usamos Request en la firma para compatibilidad, pero casteamos req a CustomRequest dentro
  r.post("/:codigo/unirse", findSalaMiddleware, async (req: Request, res: Response) => {
    const customReq = req as CustomRequest; 
    const sala = customReq.sala; // Acceso seguro después del casting
    
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

  /* GET /salas/:codigo/estado */
  r.get("/:codigo/estado", findSalaMiddleware, async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;
    const sala = customReq.sala; 
    
    res.json({
        faseActual: sala.faseActual,
        segundosRestantes: sala.segundosRestantes,
        timerCorriendo: sala.timerCorriendo,
        roomCode: sala.codigo,
    });
  });

  /* PATCH /salas/:codigo/estado */
  r.patch("/:codigo/estado", findSalaMiddleware, async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;
    const sala = customReq.sala;
    
    const parse = cuerpoActualizarEstado.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Cuerpo inválido", detalle: parse.error.flatten() });

    const updatedSala = await prisma.sala.update({
        where: { id: sala.id },
        data: parse.data,
    });

    res.json({
        faseActual: updatedSala.faseActual,
        segundosRestantes: updatedSala.segundosRestantes,
        timerCorriendo: updatedSala.timerCorriendo,
        roomCode: updatedSala.codigo,
    });
  });

  return r;
}