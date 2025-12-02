import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Buscamos el header estándar 'authorization' (Minúsculas automático en Express)
  const authHeader = req.headers.authorization; 

  // Formato esperado: "Bearer <ID>"
  if (!authHeader) {
    return res.status(401).json({ error: "Falta autorización" });
  }

  // 2. Extraemos el ID (quitamos la palabra "Bearer ")
  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ error: "Formato inválido" });
  }
  
  const userId = tokenParts[1];

  try {
    const user = await prisma.usuario.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return res.status(401).json({ error: "Usuario eliminado" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Error de verificación" });
  }
};