// server/src/routes/salas.ts (Con soporte para Tiempos)
import { PrismaClient, Sala } from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express"; 
import type { CustomRequest } from "../types.d.ts"; 
import { z } from "zod";

const cuerpoCrearSala = z.object({ anfitrion: z.string().min(1) });
const cuerpoUnirseSala = z.object({ nombre: z.string().min(1), carrera: z.string().optional().nullable(), equipoNombre: z.string().optional().nullable() });
const cuerpoCargaMasiva = z.object({ equipos: z.array(z.object({ nombre: z.string(), integrantes: z.array(z.object({ nombre: z.string(), carrera: z.string().optional() })) })) });

// 🔥 ACTUALIZADO: Ahora acepta los tiempos
const cuerpoActualizarEstado = z.object({
    faseActual: z.string().optional(),
    segundosRestantes: z.number().optional(),
    timerCorriendo: z.boolean().optional(),
    formacion: z.string().optional(), 
    estado: z.string().optional(),
    datosJuego: z.any().optional(),
    // Tiempos
    t_rompehielo: z.number().optional(),
    t_diferencias: z.number().optional(),
    t_empatia: z.number().optional(),
    t_creatividad: z.number().optional(),
    t_pitch_prep: z.number().optional(),
    t_pitch_fuego: z.number().optional()
}).partial();

export default function salasRouter(prisma: PrismaClient) {
  const r = Router();
  
  const findSalaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const codigoParam = String(req.params.codigo || "").toUpperCase();
    const sala = await prisma.sala.findUnique({ where: { codigo: codigoParam } });
    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });
    (req as CustomRequest).sala = sala;
    next();
  };

  r.post("/", async (req: Request, res: Response) => { 
    const parse = cuerpoCrearSala.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos" });
    
    const anfitrion = await prisma.usuario.upsert({
        where: { username: parse.data.anfitrion.toLowerCase().replace(/\s+/g, '.') },
        update: {},
        create: { username: parse.data.anfitrion.toLowerCase().replace(/\s+/g, '.'), nombre: parse.data.anfitrion, password: "123", esAdmin: true }
    });

    const codigo = Math.random().toString(36).substring(2, 7).toUpperCase();
    const sala = await prisma.sala.create({ data: { codigo, anfitrionId: anfitrion.id } });
    res.json({ codigoSala: sala.codigo });
  });

  r.post("/:codigo/unirse", findSalaMiddleware, async (req: Request, res: Response) => {
    const customReq = req as CustomRequest; 
    const parse = cuerpoUnirseSala.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos" });

    const nombreEquipo = parse.data.equipoNombre?.trim();
    if (!nombreEquipo) return res.status(400).json({ error: "Falta nombre equipo" });

    const equipo = await prisma.equipo.upsert({
      where: { salaId_nombre: { salaId: customReq.sala.id, nombre: nombreEquipo } },
      update: {},
      create: { nombre: nombreEquipo, salaId: customReq.sala.id, listo: true }
    });

    await prisma.integrante.create({
      data: { nombre: parse.data.nombre, carrera: parse.data.carrera, equipoId: equipo.id }
    });
    res.json({ ok: true, equipo: equipo.nombre, equipoId: equipo.id });
  });

  r.post("/:codigo/masivo", findSalaMiddleware, async (req: Request, res: Response) => {
      const customReq = req as CustomRequest;
      const parse = cuerpoCargaMasiva.safeParse(req.body);
      if (!parse.success) return res.status(400).json({ error: "Datos" });

      await prisma.$transaction(async (tx) => {
          await tx.equipo.deleteMany({ where: { salaId: customReq.sala.id } });
          for (const eq of parse.data.equipos) {
              const ne = await tx.equipo.create({ data: { nombre: eq.nombre, salaId: customReq.sala.id, listo: false } });
              if (eq.integrantes.length) {
                  await tx.integrante.createMany({ data: eq.integrantes.map(i => ({ nombre: i.nombre, carrera: i.carrera, equipoId: ne.id })) });
              }
          }
          await tx.sala.update({ where: { id: customReq.sala.id }, data: { formacion: "auto" } });
      });
      res.json({ ok: true });
  });

  r.get("/:codigo/estado", findSalaMiddleware, async (req: Request, res: Response) => {
    const salaFull = await prisma.sala.findUnique({
        where: { id: (req as CustomRequest).sala.id },
        include: { equipos: { include: { integrantes: true } } }
    });
    if (!salaFull) return res.status(404).json({ error: "Sala no encontrada" });
    
    res.json({
        // Datos básicos
        faseActual: salaFull.faseActual,
        segundosRestantes: salaFull.segundosRestantes,
        timerCorriendo: salaFull.timerCorriendo,
        roomCode: salaFull.codigo,
        formacion: salaFull.formacion, 
        datosJuego: salaFull.datosJuego, 
        
        // 🔥 TIEMPOS (Se envían al frontend)
        t_rompehielo: salaFull.t_rompehielo,
        t_diferencias: salaFull.t_diferencias,
        t_empatia: salaFull.t_empatia,
        t_creatividad: salaFull.t_creatividad,
        t_pitch_prep: salaFull.t_pitch_prep,
        t_pitch_fuego: salaFull.t_pitch_fuego,

        equipos: salaFull.equipos.map(e => ({
            id: e.id, nombre: e.nombre, listo: e.listo, puntos: e.puntos, foto: e.fotoLegoUrl, desafioId: e.desafioId,
            integrantes: e.integrantes.map(i => ({ nombre: i.nombre, carrera: i.carrera || "" }))
        }))
    });
  });

  r.patch("/:codigo/estado", findSalaMiddleware, async (req: Request, res: Response) => {
    const parse = cuerpoActualizarEstado.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });
    
    // Prisma acepta directamente el objeto parseado si coincide con el schema
    const updated = await prisma.sala.update({
        where: { id: (req as CustomRequest).sala.id },
        data: parse.data,
    });

    res.json(updated); // Devolvemos todo actualizado
  });

  return r;
}