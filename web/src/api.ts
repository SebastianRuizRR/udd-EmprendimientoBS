// web/src/api.ts

// 1. URL PÚBLICA DEL PUERTO 4001 (Asegúrate de que sea la correcta)
const CLOUD_URL = "https://damp-skeleton-5g9grvx6wj942qqj-4001.app.github.dev"; 

// CAMBIO CRÍTICO: Quitamos "/api" porque tu server devuelve 404 con él.
const BASE_URL = CLOUD_URL; 

export const API = {
  baseUrl: BASE_URL
};

console.log("🔗 Conectando API a:", BASE_URL);

// --- TYPES Y HELPERS ---

export type ProfAuthType = { 
  user: string; 
  pass: string;
  id?: string;
  name?: string;
};

export function generateCode(len = 5): string {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

// Helper genérico para peticiones fetch
async function request<T>(endpoint: string, method: string, body?: any): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  
  // OJO: endpoint ya trae la barra "/" al inicio (ej: "/salas")
  // Así que queda: "https://...dev/salas"
  const response = await fetch(`${BASE_URL}${endpoint}`, {
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

// --- AUTENTICACIÓN ---
const PROF_KEY = "udd_auth_prof";

export const ProfAuth = {
  login: async (email: string, pass: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }) 
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(PROF_KEY, JSON.stringify(data));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error login:", e);
      return false;
    }
  },
  isLoggedIn: () => !!localStorage.getItem(PROF_KEY),
  isAuthenticated: () => !!localStorage.getItem(PROF_KEY),
  logout: () => {
    localStorage.removeItem(PROF_KEY);
    window.location.reload();
  },
  getUser: () => {
    try {
      const raw = localStorage.getItem(PROF_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
};

export const ProfAuthLogic = ProfAuth;

// --- FUNCIONES DE SALA ---

export async function createRoom(
  payload: { hostName: string },
  auth?: any
): Promise<{ roomCode: string }> { 
  const res = await request<{ codigoSala: string }>("/salas", "POST", {
    anfitrion: payload.hostName, 
  });
  // Manejo de respuesta flexible (por si tu backend devuelve algo distinto)
  return { 
    roomCode: res.codigoSala || (res as any).roomCode 
  };
}

export async function joinRoom(
  roomCode: string,
  student: { name: string; career?: string; equipoNombre?: string } 
): Promise<{ ok: true; equipoId?: number; integranteId?: number }> {
  return request(`/salas/${roomCode}/unirse`, "POST", {
    nombre: student.name,
    carrera: student.career,
    equipoNombre: student.equipoNombre
  });
}

export async function health(): Promise<{ ok: boolean; t: number }> {
  return request<{ ok: boolean; t: number }>("/health", "GET");
}

// --- ESTADO Y ADMIN ---

export async function getRoomState(roomCode: string) {
  try {
    return await request<any>(`/salas/${roomCode}/estado`, "GET");
  } catch (e) {
    return null;
  }
}

export async function updateRoomState(roomCode: string, payload: any) {
  try {
    return await request<any>(`/salas/${roomCode}/estado`, "PATCH", payload);
  } catch (e) {
    console.error("Error sync state", e);
  }
}

export async function updateTeamScore(equipoId: number, delta: number) {
  return request<any>(`/equipos/${equipoId}/score`, "PATCH", { delta });
}

export async function updateTeamData(equipoId: number, data: { 
  fotoLegoUrl?: string; 
  mapaEmpatia?: string; 
  desafioId?: number; 
}) {
  return request<any>(`/equipos/${equipoId}/data`, "PATCH", data);
}

export async function submitPeerEvaluation(data: {
  origenId: number;
  destinoId: number; 
  puntaje: number;
  detalleJson: string;
  comentario?: string;
}) {
  return request<any>(`/evaluacion`, "POST", data);
}

export async function getTeamIdByName(roomCode: string, teamName: string): Promise<number | null> {
    const state = await getRoomState(roomCode);
    const team = state?.equipos?.find((t:any) => t.nombre === teamName);
    return team ? team.id : null;
}

export async function getConfig() {
    return request<any>("/admin/config", "GET");
}

export async function saveThemesConfig(themes: any) {
    return request("/admin/themes", "POST", themes);
}

export async function saveRouletteConfigDB(items: any[]) {
    return request("/admin/roulette", "POST", items);
}

export async function saveChecklistConfigDB(items: any[]) {
  return request("/admin/checklist", "POST", items);
}

export async function uploadTeamsBatch(roomCode: string, teamsData: any[]) {
  return request(`/salas/${roomCode}/masivo`, "POST", { equipos: teamsData });
}