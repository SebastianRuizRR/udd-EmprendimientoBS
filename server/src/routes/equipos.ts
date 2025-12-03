import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { z } from "zod";

const cuerpoScore = z.object({ delta: z.number() });
// 🔥 AQUÍ ESTABA EL FALLO: Faltaba 'feedbackData' en la validación
const cuerpoData = z.object({
  mapaEmpatia: z.string().optional(),
  fotoLegoUrl: z.string().optional(),
  desafioId: z.number().optional(),
  feedbackData: z.string().optional() // <--- AHORA SÍ DEJAMOS GUARDAR ESTO
});

export default function equiposRouter(prisma: PrismaClient) {
  const r = Router();

  r.patch("/:id/score", async (req, res) => {
    const id = Number(req.params.id);
    const parse = cuerpoScore.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos" });
    try {
      const equipo = await prisma.equipo.update({ where: { id }, data: { puntos: { increment: parse.data.delta } } });
      res.json({ ok: true, puntos: equipo.puntos });
    } catch { res.status(404).json({ error: "No existe" }); }
  });

  r.patch("/:id/data", async (req, res) => {
    const id = Number(req.params.id);
    const parse = cuerpoData.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos" });
    try {
      await prisma.equipo.update({ where: { id }, data: parse.data });
      res.json({ ok: true });
    } catch { res.status(404).json({ error: "No existe" }); }
  });

  r.patch("/:id/ready", async (req, res) => {
      const id = Number(req.params.id);
      try { await prisma.equipo.update({ where: { id }, data: { listo: true } }); res.json({ ok: true }); }
      catch { res.status(404).json({ error: "Error" }); }
  });
  return r;
}