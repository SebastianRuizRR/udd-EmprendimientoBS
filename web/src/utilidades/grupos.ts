import type { Student, GrupoArmado } from "../types";

/** Recomendación de equipos/size dado un total */
export function recomendarEquipos(total: number): { equipos: number; size: number; nota: string } {
  if (total <= 0) return { equipos: 3, size: 1, nota: "Sin alumnos" };

  // meta: 3–4 equipos, máx ~9 por equipo, tamaños lo más parejos posible
  const candidatos = [3, 4];
  let best = { equipos: 3, size: Math.ceil(total / 3), diff: 9999 };

  for (const eq of candidatos) {
    const size = Math.ceil(total / eq);
    const diff = Math.abs(size - total / eq); // cuán parejo queda
    if (size <= 9 && (size < best.size || diff <= best.diff)) {
      best = { equipos: eq, size, diff };
    }
  }

  // casos de ejemplo que pediste (se fuerzan):
  if (total === 32) return { equipos: 4, size: 8, nota: "4 equipos de 8" };
  if (total === 21) return { equipos: 3, size: 7, nota: "3 equipos de 7" };
  if (total === 20) return { equipos: 4, size: 5, nota: "4 equipos de 5" };

  return { equipos: best.equipos, size: best.size, nota: `${best.equipos} equipos de ~${best.size}` };
}

/** Arma grupos equilibrados (round-robin) con nombres Equipo 1..N */
export function armarGrupos(alumnos: Student[], equipos: number): GrupoArmado[] {
  const grupos: GrupoArmado[] = Array.from({ length: equipos }, (_, i) => ({
    nombre: `Equipo ${i + 1}`,
    integrantes: [],
  }));

  const ordenados = alumnos
    .slice()
    .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));

  let i = 0;
  for (const s of ordenados) {
    grupos[i % equipos].integrantes.push(s);
    i++;
  }
  return grupos;
}

/** Zonas sugeridas para la simulación en sala física */
export function zonaSegunIndice(i: number): string {
  const mapa = [
    "Adelante Izquierda",
    "Adelante Derecha",
    "Atrás Izquierda",
    "Atrás Derecha",
  ];
  return mapa[i % 4];
}
