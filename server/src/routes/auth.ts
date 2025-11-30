import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  nombre: z.string().optional(),
});

export default function authRouter(prisma: PrismaClient) {
  const r = Router();

  // POST /auth/login (o registro automático si no existe)
  r.post("/login", async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    const { username, password, nombre } = parse.data;

    // Buscamos si existe el usuario
    let user = await prisma.usuario.findUnique({ where: { username } });

    if (!user) {
      // Si no existe, lo creamos (Registro implícito)
      user = await prisma.usuario.create({
        data: {
          username,
          password, // En prod: usar bcrypt
          nombre: nombre || username,
          esAdmin: username === "admin", // Lógica simple para admin
        }
      });
    } else {
      // Si existe, verificamos contraseña
      if (user.password !== password) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }
    }

    // Retornamos usuario sin password
    res.json({ 
      ok: true, 
      user: { id: user.id, username: user.username, nombre: user.nombre, esAdmin: user.esAdmin } 
    });
  });

  return r;
}