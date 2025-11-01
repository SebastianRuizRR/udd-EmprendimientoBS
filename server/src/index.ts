import express from "express";

import cors from "cors";
import { PrismaClient } from "@prisma/client";
import salasRouter from "./routes/salas.js";

const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: [
      /.*\.app\.github\.dev$/,   // Codespaces
      "http://localhost:5173",   // por si pruebas local
    ],
    credentials: true,
  })
);app.use(express.json());

// Salud del servicio (en español)
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, t: Date.now() });
});

// Rutas de salas/equipos/integrantes
app.use("/salas", salasRouter(prisma));

const PUERTO = Number(process.env.PORT || 4000);
app.listen(PUERTO, () => {
  console.log(`API escuchando en :${PUERTO}`);
});
