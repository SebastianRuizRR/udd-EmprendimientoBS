// server/src/routes/evaluacion.ts
import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { z } from "zod";

const cuerpoEvaluacion = z.object({
  origenId: z.number(),  // Quién evalúa (ID Equipo)
  destinoId: z.number(), // A quién evalúan (ID Equipo)
  puntaje: z.number(),   // Total de puntos otorgados
  detalleJson: z.string(), // El array de sliders [3, 5, 4...]
  comentario: z.string().optional()
});

const cuerpoAnalitica = z.object({
  salaId: z.number(),
  tipo: z.string(), // Ej: "fase_start", "click_help"
  fase: z.string().optional(),
  detalle: z.string().optional(), // JSON extra
  equipoId: z.number().optional()
});

export default function evaluacionRouter(prisma: PrismaClient) {
  const r = Router();

  // POST /evaluacion -> Guardar feedback de un equipo a otro
  r.post("/", async (req: Request, res: Response) => {
    const parse = cuerpoEvaluacion.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    const { origenId, destinoId, puntaje, detalleJson, comentario } = parse.data;

    // 1. Guardar el registro de evaluación
    await prisma.evaluacion.create({
      data: { origenId, destinoId, puntaje, detalleJson, comentario }
    });

    // 2. Sumar los puntos al equipo destino (para el Ranking en vivo)
    await prisma.equipo.update({
      where: { id: destinoId },
      data: { puntos: { increment: puntaje } }
    });

    res.json({ ok: true });
  });

  // POST /evaluacion/analytics -> Guardar logs para gráficos
  r.post("/analytics", async (req: Request, res: Response) => {
    const parse = cuerpoAnalitica.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    await prisma.eventoAnalitica.create({
      data: parse.data
    });

    res.json({ ok: true });
  });

  // GET /evaluacion/ranking/:salaId -> Obtener tabla de posiciones en vivo
  r.get("/ranking/:salaId", async (req: Request, res: Response) => {
    const salaId = Number(req.params.salaId);
    
    const equipos = await prisma.equipo.findMany({
      where: { salaId },
      select: { nombre: true, puntos: true },
      orderBy: { puntos: 'desc' }
    });

    // Formato compatible con RankingBars del frontend
    const ranking = equipos.map(e => ({ equipo: e.nombre, total: e.puntos }));
    
    res.json(ranking);
  });

  return r;
}