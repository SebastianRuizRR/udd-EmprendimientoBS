// src/api.ts

// 1. Defino la URL base (necesaria para el error de importación en App.tsx)
export const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 2. Actualizo el tipo para incluir id y name (necesario para el error en App.tsx)
export type ProfAuth = { 
  user: string; 
  pass: string;
  id?: string;
  name?: string;
};

// --- AUTENTICACIÓN PROFESOR ---
const PROF_KEY = "udd_prof_auth_v1";

// --- HELPERS LOCALSTORAGE ---
const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error writing to localStorage", e);
  }
};

// --- ROOMS DB ---
const ROOMS_KEY = "udd_rooms_v1";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 3. Exporto esta función (necesario para el error en App.tsx)
export function generateCode(len = 5): string {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

// --- API SIMULADA ---
export async function createRoom(
  payload: { hostName: string },
  auth?: ProfAuth
): Promise<{ roomCode: string }> {
  await delay(200);
  const code = generateCode();
  const db = readJSON<Record<string, { hostName: string }>>(ROOMS_KEY, {});
  db[code] = { hostName: payload.hostName || "Host" };
  writeJSON(ROOMS_KEY, db);
  return { roomCode: code };
}

export async function joinRoom(
  roomCode: string,
  student: { name: string; career?: string }
): Promise<{ ok: true }> {
  await delay(150);
  const db = readJSON<Record<string, { hostName: string }>>(ROOMS_KEY, {});
  if (!db[roomCode]) throw new Error("Room not found (stub)");
  return { ok: true };
}

export async function health(): Promise<{ ok: true }> {
  return { ok: true };
}

// --- LÓGICA DE AUTENTICACIÓN LOCAL ---
// (Mantenemos esto aparte del tipo ProfAuth de arriba)
export const ProfAuthLogic = {
  login: (email: string, pass: string): boolean => {
    if (email === "1" && pass === "1") {
      writeJSON(PROF_KEY, { email, loggedAt: Date.now() });
      return true;
    }
    return false;
  },

  isLoggedIn: (): boolean => {
    const data = readJSON<{ email: string } | null>(PROF_KEY, null);
    return !!data?.email;
  },

  getUser: (): string | null => {
    const data = readJSON<{ email: string } | null>(PROF_KEY, null);
    return data?.email || null;
  },

  logout: () => localStorage.removeItem(PROF_KEY),
};