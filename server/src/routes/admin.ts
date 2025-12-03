// server/src/routes/admin.ts
import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { verifyUser } from "../middleware/auth.js";

export default function adminRouter(prisma: PrismaClient) {
  const r = Router();
  r.use(verifyUser); // Seguridad global

  // 1. CONFIGURACIÓN
  r.get("/config", async (req: Request, res: Response) => {
    try {
      const [temas, ruleta, checklist] = await Promise.all([
        prisma.tema.findMany({ include: { desafios: true } }),
        prisma.opcionRuleta.findMany(),
        prisma.itemChecklist.findMany()
      ]);

      const ruletaFrontend = ruleta.map(r => ({
          id: String(r.id), label: r.label, desc: r.descripcion, 
          type: r.tipo, delta: r.delta, weight: r.peso, color: r.color
      }));

      const checklistFrontend = checklist.map(c => ({
          id: String(c.id), label: c.label, value: c.valor, isFixed: c.esFijo
      }));

      res.json({ temas, ruleta: ruletaFrontend, checklist: checklistFrontend });
    } catch (e) { res.status(500).json({ error: "Error config" }); }
  });

  // 2. GUARDAR CONFIGURACIONES
  r.post("/themes", async (req, res) => { res.json({ ok: true }); }); // (Implementar lógica real si se requiere)
  
  r.post("/roulette", async (req, res) => {
      await prisma.$transaction(async (tx) => {
          await tx.opcionRuleta.deleteMany();
          for(const item of req.body) {
              await tx.opcionRuleta.create({
                  data: { label: item.label, descripcion: item.desc, tipo: item.type, delta: item.delta, peso: item.weight, color: item.color }
              });
          }
      });
      res.json({ ok: true });
  });

  r.post("/checklist", async (req, res) => {
      await prisma.$transaction(async (tx) => {
          await tx.itemChecklist.deleteMany();
          for(const item of req.body) {
              await tx.itemChecklist.create({
                  data: { label: item.label, valor: item.value, esFijo: !!item.isFixed }
              });
          }
      });
      res.json({ ok: true });
  });

  // 3. ANALÍTICAS GENERALES
  r.get("/analytics", async (req, res) => {
    try {
      const [users, rooms, teams] = await Promise.all([
        prisma.usuario.count(),
        prisma.sala.count(),
        prisma.equipo.count()
      ]);
      res.json({ users, rooms, teams, challenges: {} });
    } catch (e) { res.status(500).json({ error: "Error stats" }); }
  });

  // 4. GESTIÓN DE USUARIOS
  r.get("/users", async (req, res) => {
     const users = await prisma.usuario.findMany({ orderBy: { nombre: 'asc' } });
     res.json(users.map(u => ({ id: String(u.id), name: u.nombre, user: u.username, isAdmin: u.esAdmin })));
  });
  r.delete("/users/:id", async (req, res) => {
     await prisma.usuario.delete({ where: { id: Number(req.params.id) } });
     res.json({ ok: true });
  });
  r.post("/users", async (req, res) => {
      const { name, user, pass, isAdmin } = req.body;
      await prisma.usuario.upsert({
          where: { username: user },
          update: { nombre: name, password: pass, esAdmin: !!isAdmin },
          create: { nombre: name, username: user, password: pass, esAdmin: !!isAdmin }
      });
      res.json({ ok: true });
  });

  // 5. 🔥 NUEVA RUTA: HISTORIAL DE SESIONES (Para llenar la pestaña que faltaba)
  r.get("/sessions", async (req, res) => {
      try {
          const salas = await prisma.sala.findMany({
              include: { anfitrion: true, _count: { select: { equipos: true } } },
              orderBy: { creadaEn: 'desc' },
              take: 50
          });
          
          const formatted = salas.map(s => ({
              roomCode: s.codigo,
              profName: s.anfitrion.nombre,
              timestamp: s.creadaEn,
              estado: s.estado,
              equiposCount: s._count.equipos
          }));
          
          res.json(formatted);
      } catch(e) { res.status(500).json({ error: "Error historial" }); }
  });

  return r;
}