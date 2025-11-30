import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

const cuerpoCrearSala = z.object({
  anfitrion: z.string().min(1, "El nombre del anfitrión es obligatorio"),
});

const cuerpoUnirseSala = z.object({
  nombre: z.string().min(1, "El nombre del estudiante es obligatorio"),
  carrera: z.string().optional().nullable(),
  equipoNombre: z.string().optional().nullable() 
});

export default function salasRouter(prisma: PrismaClient) {
  const r = Router();

  /* POST /salas -> Crea sala y busca/crea al usuario profesor */
  r.post("/", async (req, res) => {
    const parse = cuerpoCrearSala.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Cuerpo inválido", detalle: parse.error.flatten() });
    }

    // 1. Buscar/Crear al Profesor (Usuario) para no romper la relación
    const nombreAnfitrion = parse.data.anfitrion;
    const usernameGen = nombreAnfitrion.toLowerCase().replace(/\s+/g, '.');

    const anfitrion = await prisma.usuario.upsert({
        where: { username: usernameGen },
        update: {},
        create: {
            username: usernameGen,
            nombre: nombreAnfitrion,
            password: "123", // Password default
            esAdmin: true
        }
    });

    // 2. Generar código único de 5 letras
    const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";
    let existe = true;
    while(existe) {
        codigo = Array.from({ length: 5 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join("");
        const check = await prisma.sala.findUnique({ where: { codigo }});
        if(!check) existe = false;
    }

    // 3. Crear Sala vinculada
    const sala = await prisma.sala.create({
      data: { 
          codigo, 
          anfitrionId: anfitrion.id // Relación clave
      }
    });

    res.json({ codigoSala: sala.codigo });
  });

  /* POST /salas/:codigo/unirse -> Alumnos */
  r.post("/:codigo/unirse", async (req, res) => {
    const codigoParam = String(req.params.codigo || "").toUpperCase();
    const parse = cuerpoUnirseSala.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    const sala = await prisma.sala.findUnique({ where: { codigo: codigoParam } });
    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });

    const nombreEquipo = (parse.data.equipoNombre?.trim() || "Equipo Temporal");

    // Upsert Equipo
    const equipo = await prisma.equipo.upsert({
      where: { salaId_nombre: { salaId: sala.id, nombre: nombreEquipo } },
      update: {},
      create: { nombre: nombreEquipo, salaId: sala.id }
    });

    // Crear Integrante
    await prisma.integrante.create({
      data: {
        nombre: parse.data.nombre,
        carrera: parse.data.carrera ?? undefined,
        equipoId: equipo.id
      }
    });

    res.json({ ok: true, equipo: equipo.nombre, equipoId: equipo.id });
  });

  return r;
}