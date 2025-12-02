import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({ error: "Falta identificación" });
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return res.status(401).json({ error: "Usuario eliminado o inválido" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Error de verificación" });
  }
};