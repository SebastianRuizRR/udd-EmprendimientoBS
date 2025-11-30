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
          desc: r.descripcion, // BD -> Frontend
          type: r.tipo,        // BD -> Frontend
          delta: r.delta,
          weight: r.peso,      // BD -> Frontend
          color: r.color || "#9C27B0"
      }));

      res.json({ temas, ruleta: ruletaFrontend, checklist });
    } catch (e) {
      res.status(500).json({ error: "Error cargando config" });
    }
  });

  // 2. GUARDAR TEMAS Y DESAFÍOS (Masivo)
  r.post("/themes", async (req: Request, res: Response) => {
    const themesObj = req.body; 
    
    await prisma.$transaction(async (tx) => {
        for (const key of Object.keys(themesObj)) {
            const t = themesObj[key];
            
            await tx.tema.upsert({
                where: { id: key },
                update: { label: t.label, personaNombre: t.persona?.nombre, personaImg: t.persona?.img },
                create: { id: key, label: t.label, personaNombre: t.persona?.nombre, personaImg: t.persona?.img }
            });
            
            await tx.desafio.deleteMany({ where: { temaId: key } });
            
            for (const d of t.desafios) {
                await tx.desafio.create({
                    data: { 
                        temaId: key,
                        titulo: d.titulo,
                        descripcion: d.descripcion,
                        imgUrl: d.img
                    }
                });
            }
        }
    });
    res.json({ ok: true });
  });

  // 3. GUARDAR RULETA
  r.post("/roulette", async (req: Request, res: Response) => {
      const items = req.body; // Array de items del frontend
      
      await prisma.$transaction(async (tx) => {
          await tx.opcionRuleta.deleteMany();
          
          for(const item of items) {
              await tx.opcionRuleta.create({
                  data: {
                      label: item.label,
                      // 🚨 AQUÍ ESTABA EL ERROR: MAPEAMOS LOS NOMBRES
                      descripcion: item.desc, // Frontend 'desc' -> BD 'descripcion'
                      tipo: item.type,        // Frontend 'type' -> BD 'tipo'
                      delta: item.delta,
                      peso: item.weight,      // Frontend 'weight' -> BD 'peso'
                      color: item.color
                  }
              });
          }
      });
      res.json({ ok: true });
  });

  return r;
}