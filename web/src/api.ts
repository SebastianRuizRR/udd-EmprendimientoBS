import { 
  createRoom as createRoomMock, // Alias para evitar conflictos si usabas mocks
  joinRoom as joinRoomMock 
} from "./api"; // Autoreferencia para mantener compatibilidad si algo importaba de aquí

// 1. CONFIGURACIÓN DE RED
// IMPORTANTE: Asegúrate de que este puerto sea el 4001 (Backend Docker)
const CLOUD_URL = import.meta.env.VITE_API_URL || "http://18.191.239.111:4001";
const BASE_URL = CLOUD_URL; 

console.log("🔗 Conectando API a:", BASE_URL);

export const API = {
  baseUrl: BASE_URL
};

// --- TYPES ---
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

// --- HELPER FETCH ---
async function request<T>(endpoint: string, method: string, body?: any): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
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
        body: JSON.stringify({ username: email, password: pass }) // Ajustado a username
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

// ==========================================
// 🔥 FUNCIONES CRÍTICAS (AQUÍ ESTABA EL ERROR)
// ==========================================

// 1. Crear Sala
export async function createRoom(payload: { hostName: string }) {
  const data = await request<any>("/salas", "POST", { anfitrion: payload.hostName });
  return { roomCode: data.codigoSala || data.roomCode };
}

// 2. Unirse (Alumno)
export async function joinRoom(roomCode: string, student: any) {
  return request(`/salas/${roomCode}/unirse`, "POST", {
    nombre: student.name,
    carrera: student.career,
    equipoNombre: student.equipoNombre // Vital para que el profe lo vea
  });
}

// 3. Obtener Estado (EL TRADUCTOR)
export async function getRoomState(roomCode: string) {
  try {
    const data = await request<any>(`/salas/${roomCode}/estado`, "GET");
    
    // TRADUCCIÓN: BACKEND (DB) -> FRONTEND (REACT)
    return {
      // Mapeo de Fases
      step: data.faseActual || data.step || "lobby",
      remaining: data.segundosRestantes ?? 300,
      running: data.timerCorriendo ?? false,
      
      // Mapeo de Configuración
      // Aquí arreglamos el problema del "Modo Manual":
      // El server manda 'formacion', el front quiere 'formation'.
      formation: data.formacion || "manual", 
      expectedTeams: data.equiposEsperados || 0,

      // Mapeo de Equipos
      // Aquí arreglamos que el profesor no vea los equipos:
      // El server manda 'nombre', el front quiere 'teamName'.
      equipos: Array.isArray(data.equipos) ? data.equipos.map((e: any) => ({
         teamName: e.nombre, // <--- ESTO ARREGLA LA LISTA DEL PROFESOR
         integrantes: e.integrantes || [],
         roomCode: roomCode
      })) : [],

      // Datos extra
      wheel: data.datosJuego?.wheel,
      presentOrder: data.datosJuego?.presentOrder || []
    };
  } catch (e) {
    return null;
  }
}

// 4. Actualizar Estado (Profesor)
export async function updateRoomState(roomCode: string, payload: any) {
  try {
    const dbPayload: any = {};
    // Traducción Inversa: Frontend -> Backend
    if (payload.step !== undefined) dbPayload.faseActual = payload.step;
    if (payload.remaining !== undefined) dbPayload.segundosRestantes = payload.remaining;
    if (payload.running !== undefined) dbPayload.timerCorriendo = payload.running;
    if (payload.formation !== undefined) dbPayload.formacion = payload.formation;
    
    if (payload.wheel || payload.presentOrder) {
       dbPayload.datosJuego = {
          wheel: payload.wheel,
          presentOrder: payload.presentOrder
       };
    }

    return await request<any>(`/salas/${roomCode}/estado`, "PATCH", dbPayload);
  } catch (e) {
    console.error("Error sync state", e);
  }
}

// --- OTRAS FUNCIONES ---
export async function updateTeamScore(equipoId: number, delta: number) {
  return request<any>(`/equipos/${equipoId}/score`, "PATCH", { delta });
}
export async function updateTeamData(equipoId: number, data: any) {
  return request<any>(`/equipos/${equipoId}/data`, "PATCH", data);
}
export async function submitPeerEvaluation(data: any) {
  return request<any>(`/evaluacion`, "POST", data);
}
export async function getTeamIdByName(roomCode: string, teamName: string): Promise<number | null> {
    const state = await getRoomState(roomCode);
    const team = state?.equipos?.find((t:any) => t.teamName === teamName);
    return team ? team.id : null;
}
export async function health() { return request("/health", "GET"); }

// --- ADMIN ---
export async function getConfig() { return request<any>("/admin/config", "GET"); }
export async function saveThemesConfig(t: any) { return request("/admin/themes", "POST", t); }
export async function saveRouletteConfigDB(i: any[]) { return request("/admin/roulette", "POST", i); }
export async function saveChecklistConfigDB(i: any[]) { return request("/admin/checklist", "POST", i); }
export async function uploadTeamsBatch(roomCode: string, teamsData: any[]) {
  return request(`/salas/${roomCode}/masivo`, "POST", { equipos: teamsData });
}