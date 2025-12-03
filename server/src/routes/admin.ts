import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { verifyUser } from "../middleware/auth.js";

export default function adminRouter(prisma: PrismaClient) {
  const r = Router();
  r.use(verifyUser); // Protección global

  // 1. OBTENER CONFIGURACIÓN (CON TRADUCCIÓN DE DATOS)
  r.get("/config", async (req: Request, res: Response) => {
    try {
      const [temas, ruleta, checklist] = await Promise.all([
        prisma.tema.findMany({ include: { desafios: true } }),
        prisma.opcionRuleta.findMany(),
        prisma.itemChecklist.findMany()
      ]);

      // Transformar Temas (BD -> Frontend)
      const temasObj: any = {};
      temas.forEach(t => {
          temasObj[t.id] = {
              label: t.label,
              persona: { 
                  nombre: t.personaNombre || "", 
                  bio: t.personaBio || "", 
                  img: t.personaImg || "" 
              },
              // 🔥 AQUÍ ESTÁ EL ARREGLO: Mapeamos imgUrl -> img
              desafios: t.desafios.map(d => ({
                  id: d.id, // Guardamos ID real para usarlo luego
                  titulo: d.titulo,
                  descripcion: d.descripcion,
                  img: d.imgUrl || "" // Traducción crítica
              }))
          };
      });

      const ruletaFrontend = ruleta.map(r => ({
          id: String(r.id), label: r.label, desc: r.descripcion, 
          type: r.tipo, delta: r.delta, weight: r.peso, color: r.color,
          // Recuperar campos extra si existen en tu lógica frontend
          hasTokenEffect: r.delta !== 0, 
          tokenAmount: Math.abs(r.delta)
      }));

      const checklistFrontend = checklist.map(c => ({
          id: String(c.id), label: c.label, value: c.valor, isFixed: c.esFijo
      }));

      // Si la BD tiene datos, los enviamos. Si no, null para que el front use defaults.
      const payload = {
          temas: Object.keys(temasObj).length > 0 ? temasObj : null,
          ruleta: ruletaFrontend.length > 0 ? ruletaFrontend : null,
          checklist: checklistFrontend.length > 0 ? checklistFrontend : null
      };

      res.json(payload);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error cargando config" });
    }
  });

  // 2. GUARDAR TEMAS (Borrar y Recrear para consistencia)
  r.post("/themes", async (req: Request, res: Response) => {
    const themesObj = req.body; 
    try {
        await prisma.$transaction(async (tx) => {
            for (const key of Object.keys(themesObj)) {
                const t = themesObj[key];
                // Upsert del Tema
                await tx.tema.upsert({
                    where: { id: key },
                    update: { 
                        label: t.label,
                        personaNombre: t.persona?.nombre,
                        personaBio: t.persona?.bio,
                        personaImg: t.persona?.img
                    },
                    create: {
                        id: key,
                        label: t.label,
                        personaNombre: t.persona?.nombre,
                        personaBio: t.persona?.bio,
                        personaImg: t.persona?.img
                    }
                });

                // Reemplazar desafíos
                await tx.desafio.deleteMany({ where: { temaId: key } });
                
                if (t.desafios && t.desafios.length > 0) {
                    await tx.desafio.createMany({
                        data: t.desafios.map((d: any) => ({
                            temaId: key,
                            titulo: d.titulo,
                            descripcion: d.descripcion,
                            imgUrl: d.img // Frontend manda 'img', guardamos en 'imgUrl'
                        }))
                    });
                }
            }
        });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error guardando temas" });
    }
  });

  // 3. GUARDAR RULETA
  r.post("/roulette", async (req: Request, res: Response) => {
      const items = req.body; 
      try {
          await prisma.$transaction(async (tx) => {
              await tx.opcionRuleta.deleteMany();
              for(const item of items) {
                  await tx.opcionRuleta.create({
                      data: {
                          label: item.label, 
                          descripcion: item.desc, 
                          tipo: item.type,
                          delta: Number(item.delta), 
                          peso: Number(item.weight), 
                          color: item.color
                      }
                  });
              }
          });
          res.json({ ok: true });
      } catch(e) { console.error(e); res.status(500).json({error:"Error ruleta"}); }
  });

  // 4. GUARDAR CHECKLIST
  r.post("/checklist", async (req: Request, res: Response) => {
      const items = req.body; 
      try {
        await prisma.$transaction(async (tx) => {
            await tx.itemChecklist.deleteMany();
            for(const item of items) {
                await tx.itemChecklist.create({
                    data: {
                        label: item.label, 
                        valor: Number(item.value), 
                        esFijo: !!item.isFixed
                    }
                });
            }
        });
        res.json({ ok: true });
      } catch(e) {
        console.error(e);
        res.status(500).json({ error: "Error checklist" });
      }
  });

  // 5. ANALYTICS & USERS (Igual que antes)
  r.get("/analytics", async (req, res) => {
      try {
        const [users, rooms, teams] = await Promise.all([
            prisma.usuario.count(), prisma.sala.count(), prisma.equipo.count()
        ]);
        res.json({ users, rooms, teams, challenges: {} });
      } catch (e) { res.status(500).json({ error: "Error stats" }); }
  });
  
  r.get("/users", async (req, res) => {
     const users = await prisma.usuario.findMany({ orderBy: { nombre: 'asc' } });
     res.json(users.map(u => ({ id: String(u.id), name: u.nombre, user: u.username, isAdmin: u.esAdmin })));
  });
  r.delete("/users/:id", async (req, res) => {
     try { await prisma.usuario.delete({ where: { id: Number(req.params.id) } }); res.json({ ok: true }); }
     catch(e) { res.status(500).json({error: "No se pudo borrar"}); }
  });
  r.post("/users", async (req, res) => {
      const { name, user, pass, isAdmin } = req.body;
      try {
          await prisma.usuario.upsert({
              where: { username: user },
              update: { nombre: name, password: pass, esAdmin: !!isAdmin },
              create: { nombre: name, username: user, password: pass, esAdmin: !!isAdmin }
          });
          res.json({ ok: true });
      } catch(e) { res.status(400).json({error: "Error creando"}); }
  });
  
  // Historial
  r.get("/sessions", async (req, res) => {
      try {
          const salas = await prisma.sala.findMany({
              include: { anfitrion: true, _count: { select: { equipos: true } } },
              orderBy: { creadaEn: 'desc' }, take: 50
          });
          res.json(salas.map(s => ({
              roomCode: s.codigo, profName: s.anfitrion.nombre,
              timestamp: s.creadaEn, estado: s.estado, equiposCount: s._count.equipos
          })));
      } catch(e) { res.status(500).json({ error: "Error historial" }); }
  });

  return r;
}