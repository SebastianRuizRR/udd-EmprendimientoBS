// server/src/index.ts
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import salasRouter from "./routes/salas.js";
import authRouter from "./routes/auth.js";
import equiposRouter from "./routes/equipos.js";
import evaluacionRouter from "./routes/evaluacion.js";
import adminRouter from "./routes/admin.js"; 

const prisma = new PrismaClient();
const app = express();


app.use(cors({
    origin: true, 
    credentials: true,
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, t: Date.now(), db: "connected" });
});

// Registrar todas las rutas
app.use("/auth", authRouter(prisma));
app.use("/salas", salasRouter(prisma));
app.use("/equipos", equiposRouter(prisma));
app.use("/evaluacion", evaluacionRouter(prisma));
app.use("/admin", adminRouter(prisma));

const PUERTO = Number(process.env.PORT || 4000);
app.listen(PUERTO, () => {
  console.log(`🚀 SERVIDOR REINICIADO CON CORS - PUERTO :${PUERTO}`);
});