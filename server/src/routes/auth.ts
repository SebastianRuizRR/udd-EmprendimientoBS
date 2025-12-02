import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
// Importamos al guardia que acabamos de crear
// Nota los dos puntos '..' para salir de 'routes' y entrar a 'middleware'
import { verifyUser } from "../middleware/auth.js"; 

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  nombre: z.string().optional(),
});

export default function authRouter(prisma: PrismaClient) {
  const r = Router();

  // LOGIN (Igual que antes)
  r.post("/login", async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Datos inválidos" });

    const { username, password, nombre } = parse.data;
    
    // Lógica de Upsert (Buscar o Crear)
    let user = await prisma.usuario.findUnique({ where: { username } });

    if (!user) {
      user = await prisma.usuario.create({
        data: {
          username,
          password,
          nombre: nombre || username,
          esAdmin: username === "admin",
        }
      });
    } else {
      if (user.password !== password) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }
    }

    res.json({ 
      ok: true, 
      user: { id: user.id, nombre: user.nombre, username: user.username, esAdmin: user.esAdmin } 
    });
  });

  // NUEVA RUTA: VERIFICAR SESIÓN
  // Usamos 'verifyUser' para protegerla. Si el usuario fue borrado, esto fallará.
  r.get("/verify", verifyUser, (req, res) => {
      res.json({ ok: true, msg: "Sigues vivo" });
  });

  return r;
}