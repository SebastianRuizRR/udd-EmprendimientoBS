import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { verifyUser } from "../middleware/auth.js"; 

export default function adminRouter(prisma: PrismaClient) {
  const r = Router();
  r.use(verifyUser); 

  // 1. LEER CONFIGURACIÓN (Traducción BD -> Frontend)
  r.get("/config", async (req: Request, res: Response) => {
    try {
      const [temas, ruleta, checklist] = await Promise.all([
        prisma.tema.findMany({ include: { desafios: true } }),
        prisma.opcionRuleta.findMany(),
        prisma.itemChecklist.findMany()
      ]);

      const temasObj: any = {};
      temas.forEach(t => {
          temasObj[t.id] = {
              label: t.label,
              persona: { 
                  nombre: t.personaNombre || "", 
                  bio: t.personaBio || "", 
                  img: t.personaImg || "" 
              },
              desafios: t.desafios.map(d => ({
                  id: d.id, 
                  titulo: d.titulo, 
                  descripcion: d.descripcion, 
                  img: d.imgUrl || "" // 🔥 TRADUCCIÓN CLAVE: imgUrl a img
              }))
          };
      });

      const ruletaFrontend = ruleta.map(r => ({
          id: String(r.id), label: r.label, desc: r.descripcion, 
          type: r.tipo, delta: r.delta, weight: r.peso, color: r.color,
          hasTokenEffect: r.delta !== 0, tokenAmount: Math.abs(r.delta)
      }));

      const checklistFrontend = checklist.map(c => ({
          id: String(c.id), label: c.label, value: c.valor, isFixed: c.esFijo
      }));

      res.json({ 
          temas: Object.keys(temasObj).length > 0 ? temasObj : null,
          ruleta: ruletaFrontend.length > 0 ? ruletaFrontend : null,
          checklist: checklistFrontend.length > 0 ? checklistFrontend : null
      });
    } catch (e) { res.status(500).json({ error: "Error config" }); }
  });

  // 2. GUARDAR TEMAS (Traducción Frontend -> BD)
  r.post("/themes", async (req: Request, res: Response) => {
    const themesObj = req.body; 
    try {
        await prisma.$transaction(async (tx) => {
            for (const key of Object.keys(themesObj)) {
                const t = themesObj[key];
                await tx.tema.upsert({
                    where: { id: key },
                    update: { label: t.label, personaNombre: t.persona?.nombre, personaBio: t.persona?.bio, personaImg: t.persona?.img },
                    create: { id: key, label: t.label, personaNombre: t.persona?.nombre, personaBio: t.persona?.bio, personaImg: t.persona?.img }
                });

                await tx.desafio.deleteMany({ where: { temaId: key } });
                
                if (t.desafios && t.desafios.length > 0) {
                    await tx.desafio.createMany({
                        data: t.desafios.map((d: any) => ({
                            temaId: key, 
                            titulo: d.titulo, 
                            descripcion: d.descripcion, 
                            imgUrl: d.img // 🔥 TRADUCCIÓN CLAVE: img a imgUrl
                        }))
                    });
                }
            }
        });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: "Error saving" }); }
  });

  // 4. GUARDAR CHECKLIST
  r.post("/checklist", async (req: Request, res: Response) => {
      const items = req.body; 
      try {
        await prisma.$transaction(async (tx) => {
            await tx.itemChecklist.deleteMany();
            for(const item of items) {
                await tx.itemChecklist.create({
                    data: { label: item.label, valor: Number(item.value), esFijo: !!item.isFixed }
                });
            }
        });
        res.json({ ok: true });
      } catch(e) { res.status(500).json({ error: "Error checklist" }); }
  });

  // 5. OTROS
  r.get("/analytics", async (req, res) => {
      try {
        const [users, rooms, teams] = await Promise.all([prisma.usuario.count(), prisma.sala.count(), prisma.equipo.count()]);
        res.json({ users, rooms, teams, challenges: {} });
      } catch (e) { res.status(500).json({ error: "Error stats" }); }
  });
  
  r.get("/users", async (req, res) => {
     const users = await prisma.usuario.findMany({ orderBy: { nombre: 'asc' } });
     res.json(users.map(u => ({ id: String(u.id), name: u.nombre, user: u.username, isAdmin: u.esAdmin })));
  });
  r.delete("/users/:id", async (req, res) => {
     try { await prisma.usuario.delete({ where: { id: Number(req.params.id) } }); res.json({ ok: true }); } catch { res.status(500).json({error:"Error"}); }
  });
  r.post("/users", async (req, res) => {
      const { name, user, pass, isAdmin } = req.body;
      try {
          await prisma.usuario.upsert({ where: { username: user }, update: { nombre: name, password: pass, esAdmin: !!isAdmin }, create: { nombre: name, username: user, password: pass, esAdmin: !!isAdmin } });
          res.json({ ok: true });
      } catch { res.status(400).json({error:"Error"}); }
  });
  
  r.get("/sessions", async (req, res) => {
      try {
          const salas = await prisma.sala.findMany({ include: { anfitrion: true, _count: { select: { equipos: true } } }, orderBy: { creadaEn: 'desc' }, take: 50 });
          res.json(salas.map(s => ({ roomCode: s.codigo, profName: s.anfitrion.nombre, timestamp: s.creadaEn, estado: s.estado, equiposCount: s._count.equipos })));
      } catch { res.status(500).json({ error: "Error" }); }
  });

  return r;
}