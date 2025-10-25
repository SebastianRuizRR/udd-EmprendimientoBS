import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

// --- CORS dinámico ---
const origins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.length ? origins : false, // si no hay, deshabilita orígenes
    credentials: false, // pon true sólo si usas cookies/sesión
  })
);

app.use(express.json());

// --- RUTAS BÁSICAS ---
app.get("/", (_req, res) => {
  res.send("Servidor activo 🚀");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "dev" });
});

// Verifica conexión real a la BD
app.get("/dbcheck", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, message: "Conexión a la base de datos exitosa 🚀" });
  } catch (err) {
    console.error("Error al conectar con la base de datos:", err);
    res.status(500).json({ ok: false, error: "Error al conectar con la base de datos" });
  }
});

// ----- PROFESORES -----
app.post("/profesores", async (req, res) => {
  try {
    const { idProfesor, correo, contrasena } = req.body;
    if (!idProfesor || !contrasena) {
      return res.status(400).json({ error: "idProfesor y contrasena son requeridos" });
    }
    const prof = await prisma.profesor.create({
      data: { idProfesor, correo, contrasena },
    });
    res.status(201).json(prof);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----- SALAS -----
app.post("/salas", async (req, res) => {
  try {
    const { idSala, fecha, profesorId } = req.body;
    if (!idSala || !fecha || !profesorId) {
      return res.status(400).json({ error: "idSala, fecha (ISO) y profesorId son requeridos" });
    }
    const sala = await prisma.sala.create({
      data: {
        idSala,
        fecha: new Date(fecha),
        profesor: { connect: { idProfesor: profesorId } },
      },
    });
    res.status(201).json(sala);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/salas/:idSala", async (req, res) => {
  try {
    const sala = await prisma.sala.findUnique({
      where: { idSala: req.params.idSala },
      // include: { equipos: true },
    });
    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });
    res.json(sala);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Arranque ---
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

// --- Apagado elegante ---
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
