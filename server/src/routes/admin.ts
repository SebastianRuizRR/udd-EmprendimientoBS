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

      // Mapeamos checklist
      const checklistFrontend = checklist.map(c => ({
          id: String(c.id), // Aseguramos string para el frontend
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
    const themesObj = req.body; 
    // Nota: Asumimos que themesObj viene como objeto { salud: {...}, educacion: {...} }
    // Aquí deberías iterar y guardar. Si ya lo tienes implementado, mantén tu lógica.
    // ... Tu lógica actual de temas ...
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

  // 4. GUARDAR CHECKLIST (¡NUEVO!)
  r.post("/checklist", async (req: Request, res: Response) => {
      const items = req.body; // Array de items del frontend
      
      try {
        await prisma.$transaction(async (tx) => {
            // Borramos los anteriores (estrategia simple: reemplazar todo)
            await tx.itemChecklist.deleteMany();
            
            for(const item of items) {
                await tx.itemChecklist.create({
                    data: {
                        label: item.label, // Frontend 'label' -> BD 'titulo'
                        valor: item.value, // Frontend 'value' -> BD 'puntos'
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

  // 5. OBTENER ANALÍTICAS REALES (¡NUEVO!)
  r.get("/analytics", async (req: Request, res: Response) => {
    try {
      const [users, rooms, teams] = await Promise.all([
        prisma.usuario.count(),
        prisma.sala.count(),
        prisma.equipo.count()
      ]);

      // Métricas de uso de desafíos (Agrupación)
      // Si tienes una tabla de analytics o campo en equipo, úsalo aquí.
      // Por ahora devolvemos conteos generales.
      
      res.json({
        users,
        rooms,
        teams,
        challenges: {} // Implementar si tienes tabla de métricas detallada
      });
    } catch (e) {
      res.status(500).json({ error: "Error stats" });
    }
  });

  return r;
}