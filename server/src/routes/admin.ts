// server/src/routes/admin.ts
import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";

export default function adminRouter(prisma: PrismaClient) {
  const r = Router();

  // 1. OBTENER TODA LA CONFIGURACIÓN (Al cargar la App)
  r.get("/config", async (req: Request, res: Response) => {
    try {
      const [temas, ruleta, checklist] = await Promise.all([
        prisma.tema.findMany({ include: { desafios: true } }),
        prisma.opcionRuleta.findMany(),
        prisma.itemChecklist.findMany()
      ]);

      // Mapeamos la respuesta de la BD al formato del Frontend
      const ruletaFrontend = ruleta.map(r => ({
          id: String(r.id),
          label: r.label,
          desc: r.descripcion, 
          type: r.tipo,        
          delta: r.delta,
          weight: r.peso,      
          color: r.color || "#9C27B0"
      }));

      // Mapeamos checklist (BD: label, valor, esFijo -> Front: label, value, isFixed)
      const checklistFrontend = checklist.map(c => ({
          id: String(c.id),
          label: c.label,
          value: c.valor,
          isFixed: c.esFijo
      }));

      res.json({ temas, ruleta: ruletaFrontend, checklist: checklistFrontend });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error cargando config" });
    }
  });

  // 2. GUARDAR TEMAS Y DESAFÍOS (Masivo)
  r.post("/themes", async (req: Request, res: Response) => {
    // Aquí iría tu lógica de guardado de temas si la implementas
    res.json({ ok: true });
  });

  // 3. GUARDAR RULETA
  r.post("/roulette", async (req: Request, res: Response) => {
      const items = req.body; 
      await prisma.$transaction(async (tx) => {
          await tx.opcionRuleta.deleteMany();
          for(const item of items) {
              await tx.opcionRuleta.create({
                  data: {
                      label: item.label,
                      descripcion: item.desc,
                      tipo: item.type,
                      delta: item.delta,
                      peso: item.weight,
                      color: item.color
                  }
              });
          }
      });
      res.json({ ok: true });
  });

  // 4. GUARDAR CHECKLIST (CORREGIDO)
  r.post("/checklist", async (req: Request, res: Response) => {
      const items = req.body; 
      
      try {
        await prisma.$transaction(async (tx) => {
            await tx.itemChecklist.deleteMany();
            
            for(const item of items) {
                await tx.itemChecklist.create({
                    data: {
                        // Usamos los nombres del schema.prisma
                        label: item.label, 
                        valor: item.value, // El frontend manda 'value', la BD tiene 'valor'
                        esFijo: !!item.isFixed
                    }
                });
            }
        });
        res.json({ ok: true });
      } catch(e) {
        console.error(e);
        res.status(500).json({ error: "Error guardando checklist" });
      }
  });

  // 5. OBTENER ANALÍTICAS REALES
  r.get("/analytics", async (req: Request, res: Response) => {
    try {
      const [users, rooms, teams] = await Promise.all([
        prisma.usuario.count(),
        prisma.sala.count(),
        prisma.equipo.count()
      ]);
      
      res.json({
        users,
        rooms,
        teams,
        challenges: {} 
      });
    } catch (e) {
      res.status(500).json({ error: "Error stats" });
    }
  });

// --- GESTIÓN DE USUARIOS (REAL EN BASE DE DATOS) ---

  // 6. OBTENER LISTA DE PROFESORES
  r.get("/users", async (req: Request, res: Response) => {
    try {
      const users = await prisma.usuario.findMany({
        orderBy: { nombre: 'asc' }
      });
      // Devolvemos datos seguros (sin password)
      const safeUsers = users.map(u => ({
        id: String(u.id),
        name: u.nombre,
        user: u.username,
        isAdmin: u.esAdmin
      }));
      res.json(safeUsers);
    } catch (e) {
      res.status(500).json({ error: "Error al listar usuarios" });
    }
  });

  // 7. ELIMINAR USUARIO
  r.delete("/users/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      // Evitar que se borre a sí mismo o al admin principal si quieres
      // if (id === 1) return res.status(400).json({ error: "No se puede borrar al Admin maestro" });

      await prisma.usuario.delete({ where: { id } });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  });

  // 8. CREAR USUARIO (Desde el panel)
  r.post("/users", async (req: Request, res: Response) => {
      try {
          const { name, user, pass, isAdmin } = req.body;
          // Upsert para evitar duplicados por nombre de usuario
          const newUser = await prisma.usuario.upsert({
              where: { username: user },
              update: { nombre: name, password: pass, esAdmin: !!isAdmin },
              create: {
                  nombre: name,
                  username: user,
                  password: pass,
                  esAdmin: !!isAdmin
              }
          });
          res.json({ ok: true, id: newUser.id });
      } catch(e) {
          res.status(400).json({ error: "Error creando usuario" });
      }
  });

  return r;
}