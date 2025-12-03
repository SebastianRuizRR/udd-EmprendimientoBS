import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
// IMPORTA AL GUARDIA (Fíjate que busca en la carpeta ../middleware)
import { verifyUser } from "../middleware/auth.js";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  nombre: z.string().optional(),
});

export default function authRouter(prisma: PrismaClient) {
  const r = Router();

  // POST /auth/login
  r.post("/login", async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    const { username, password } = parse.data;

    const user = await prisma.usuario.findUnique({ where: { username } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json({ 
      ok: true, 
      user: { id: user.id, nombre: user.nombre, username: user.username, esAdmin: user.esAdmin } 
    });
  });

  // GET /auth/verify
  r.get("/verify", verifyUser, (req, res) => {
      res.json({ ok: true, msg: "Sesión válida" });
  });

  return r;
}