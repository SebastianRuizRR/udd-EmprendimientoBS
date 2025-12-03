// server/src/routes/equipos.ts

import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { z } from "zod";

const cuerpoScore = z.object({ delta: z.number() });
const cuerpoData = z.object({
  mapaEmpatia: z.string().optional(),
  fotoLegoUrl: z.string().optional(),
  desafioId: z.number().optional(),
});

export default function equiposRouter(prisma: PrismaClient) {
  const r = Router();

  // PATCH /equipos/:id/score
  r.patch("/:id/score", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parse = cuerpoScore.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    try {
      const equipo = await prisma.equipo.update({
        where: { id },
        data: { puntos: { increment: parse.data.delta } }
      });
      res.json({ ok: true, puntos: equipo.puntos });
    } catch (e) { res.status(404).json({ error: "Equipo no encontrado" }); }
  });

  // PATCH /equipos/:id/data
  r.patch("/:id/data", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parse = cuerpoData.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    try {
      await prisma.equipo.update({
        where: { id },
        data: parse.data
      });
      res.json({ ok: true });
    } catch (e) { res.status(404).json({ error: "Equipo no encontrado" }); }
  });

  // PATCH /equipos/:id/ready -> NUEVA RUTA PARA CONFIRMAR EQUIPO
  r.patch("/:id/ready", async (req: Request, res: Response) => {
      const id = Number(req.params.id);
      try {
          await prisma.equipo.update({
              where: { id },
              data: { listo: true } // Marca el equipo como confirmado
          });
          res.json({ ok: true });
      } catch(e) { res.status(404).json({ error: "No se pudo marcar listo" }); }
  });

  return r;
}