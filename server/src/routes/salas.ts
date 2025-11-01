import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

/* Validación de cuerpos */
const cuerpoCrearSala = z.object({
  anfitrion: z.string().min(1, "El nombre del anfitrión es obligatorio")
});

const cuerpoUnirseSala = z.object({
  nombre: z.string().min(1, "El nombre del estudiante es obligatorio"),
  carrera: z.string().optional().nullable(),
  equipoNombre: z.string().optional().nullable() // si no viene, usamos "Equipo Temporal"
});

export default function salasRouter(prisma: PrismaClient) {
  const r = Router();

  /* POST /salas  -> crea sala y devuelve { codigoSala } */
  r.post("/", async (req, res) => {
    const parse = cuerpoCrearSala.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Cuerpo inválido", detalle: parse.error.flatten() });
    }

    // Generar código legible (5 caracteres)
    const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const codigo = Array.from({ length: 5 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join("");

    const sala = await prisma.sala.create({
      data: { codigo, anfitrion: parse.data.anfitrion }
    });

    res.json({ codigoSala: sala.codigo });
  });

  /* POST /salas/:codigo/unirse  -> agrega integrante a un equipo */
  r.post("/:codigo/unirse", async (req, res) => {
    const codigoParam = String(req.params.codigo || "").toUpperCase();
    const parse = cuerpoUnirseSala.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Cuerpo inválido", detalle: parse.error.flatten() });
    }

    const sala = await prisma.sala.findUnique({ where: { codigo: codigoParam } });
    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });

    const nombreEquipo = (parse.data.equipoNombre?.trim() || "Equipo Temporal");

    // upsert por (salaId,nombre)
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

    res.json({ ok: true, equipo: equipo.nombre });
  });

  return r;
}
