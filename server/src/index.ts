import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

// === Auth súper simple (profe) ===
const PROF_USER = process.env.PROF_USER || "1";
const PROF_PASS = process.env.PROF_PASS || "1";

function requireProfAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Basic ")) {
    return res.status(401).json({ error: "Auth requerida (Basic)" });
  }
  const decoded = Buffer.from(h.slice(6), "base64").toString("utf8");
  const [u, p] = decoded.split(":");
  if (u === PROF_USER && p === PROF_PASS) return next();
  return res.status(401).json({ error: "Credenciales inválidas" });
}


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
// === ROOMS (compatibilidad con el front) ===
// SOLO EL PROFESOR (user: 1, pass: 1) PUEDE CREAR
app.post("/rooms", requireProfAuth, async (req, res) => {
  try {
    const { hostName } = req.body;
    if (!hostName) return res.status(400).json({ error: "hostName es requerido" });

    const code = Math.random().toString(36).substring(2, 7).toUpperCase();

    const sala = await prisma.sala.create({
      data: { idSala: code, fecha: new Date() },
    });

    res.status(201).json({ roomCode: sala.idSala });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/rooms/:code/join", async (req, res) => {
  try {
    const { code } = req.params;
    const sala = await prisma.sala.findUnique({
      where: { idSala: code },
    });

    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });

    // Puedes registrar aquí el alumno/equipo si lo deseas
    res.json({ ok: true, room: sala });
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
