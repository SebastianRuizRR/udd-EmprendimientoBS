export type AuthProfesor = {
  user: string;
  pass: string;
  token?: string;
};
export type ProfAuth = AuthProfesor;

// Base de la API: viene de Vite (.env) y cae a localhost:4000 en dev local
// URL base del backend (desde Vite)
export const API = import.meta.env.VITE_API_URL as string;

async function comoJSON<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function crearSala(cuerpo: { anfitrion: string }, _auth?: AuthProfesor) {
  const res = await fetch(`${API}/salas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  });
  return comoJSON<{ codigoSala: string }>(res);
}

export async function unirseSala(
  codigoSala: string,
  cuerpo: { nombre: string; carrera?: string; equipoNombre?: string }
) {
  const res = await fetch(`${API}/salas/${encodeURIComponent(codigoSala)}/unirse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  });
  return comoJSON<{ ok: true; equipo: string }>(res);
}

/* Aliases usados por tu App.tsx */
export async function createRoom(body: { hostName: string }, auth?: ProfAuth) {
  const r = await crearSala({ anfitrion: body.hostName }, auth as any);
  return { roomCode: r.codigoSala };
}

export async function joinRoom(
  roomCode: string,
  body: { name: string; career?: string; teamName?: string }
) {
  const r = await unirseSala(roomCode, {
    nombre: body.name,
    carrera: body.career,
    equipoNombre: body.teamName
  });
  return { ok: r.ok, team: r.equipo };
}
