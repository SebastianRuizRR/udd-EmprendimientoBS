// Define URL del Backend (Puerto 4000)
export const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export type ProfAuth = { 
  user: string; 
  pass: string;
  id?: string;
  name?: string;
};

// --- HELPER FETCH ---
async function request<T>(endpoint: string, method: string, body?: any): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const response = await fetch(`${API}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}`);
  }
  return response.json();
}

export function generateCode(len = 5): string {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

// --- ENDPOINTS ---

export async function createRoom(
  payload: { hostName: string },
  auth?: ProfAuth
): Promise<{ roomCode: string }> { 
  
  const res = await request<{ codigoSala: string }>("/salas", "POST", {
    anfitrion: payload.hostName, 
  });
  return { 
    roomCode: res.codigoSala 
  };
}

export async function joinRoom(
  roomCode: string,
  student: { name: string; career?: string }
): Promise<{ ok: true; equipoId?: number; integranteId?: number }> {
  return request(`/salas/${roomCode}/unirse`, "POST", {
    nombre: student.name,
    carrera: student.career
  });
}

export async function health(): Promise<{ ok: boolean; t: number }> {
  return request<{ ok: boolean; t: number }>("/health", "GET");
}

// --- AUTH LOCAL (Para compatibilidad UI) ---
const PROF_KEY = "udd_prof_auth_v1";

export const ProfAuthLogic = {
  login: (email: string, pass: string): boolean => {
    // Aquí podrías llamar a /auth/login si quieres validación real en el futuro
    if ((email === "prof" && pass === "prof") || (email === "admin" && pass === "admin")) {
      try {
        localStorage.setItem(PROF_KEY, JSON.stringify({ email, loggedAt: Date.now() }));
      } catch {}
      return true;
    }
    return false;
  },
  isLoggedIn: (): boolean => {
    try {
      const raw = localStorage.getItem(PROF_KEY);
      const data = raw ? JSON.parse(raw) : null;
      return !!data?.email;
    } catch { return false; }
  },
  getUser: (): string | null => {
    try {
      const raw = localStorage.getItem(PROF_KEY);
      const data = raw ? JSON.parse(raw) : null;
      return data?.email || null;
    } catch { return null; }
  },
  logout: () => localStorage.removeItem(PROF_KEY),
};