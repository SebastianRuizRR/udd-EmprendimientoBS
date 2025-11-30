import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import salasRouter from "./routes/salas.js";
import authRouter from "./routes/auth.js";

const prisma = new PrismaClient();
const app = express();

app.use(cors({
    origin: [
      /.*\.app\.github\.dev$/, 
      "http://localhost:5173", 
      "https://udd-emprendimiento.netlify.app", 
    ],
    credentials: true,
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, t: Date.now(), db: "connected" });
});

// Registrar rutas
app.use("/auth", authRouter(prisma));
app.use("/salas", salasRouter(prisma));

const PUERTO = Number(process.env.PORT || 4000);
app.listen(PUERTO, () => {
  console.log(`🚀 API lista en puerto :${PUERTO}`);
});