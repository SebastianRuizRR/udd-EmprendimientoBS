import { 
  createRoom as createRoomMock, 
  joinRoom as joinRoomMock 
} from "./api"; 


const CLOUD_URL = (import.meta as any).env?.VITE_API_URL || "http://3.139.79.95:4001";
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
  const savedAuth = ProfAuth.getUser();
  const headers: HeadersInit = { 
      "Content-Type": "application/json",
      // CAMBIO: Usamos 'Authorization' con el prefijo 'Bearer' (Estándar universal)
      ...(savedAuth?.id ? { "Authorization": `Bearer ${savedAuth.id}` } : {}) 
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  // 2. Manejo de sesión expirada (Si el backend te patea con 401)
  if (response.status === 401) {
      console.warn("⛔ Sesión expirada o usuario eliminado.");
      ProfAuth.logout();
      throw new Error("Sesión inválida");
  }

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
        body: JSON.stringify({ username: email, password: pass }) 
      });

      if (res.ok) {
        const data = await res.json();
        
        // --- CORRECCIÓN CRÍTICA: Guardar datos planos ---
        const authData: ProfAuthType = {
            user: data.user.username,
            pass: pass,
            id: String(data.user.id), 
            name: data.user.nombre
        };

        localStorage.setItem(PROF_KEY, JSON.stringify(authData));
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
// FUNCIONES DE NEGOCIO
// ==========================================

export async function createRoom(payload: { hostName: string }) {
  const data = await request<any>("/salas", "POST", { anfitrion: payload.hostName });
  return { roomCode: data.codigoSala || data.roomCode };
}

export async function joinRoom(roomCode: string, student: any) {
  return request(`/salas/${roomCode}/unirse`, "POST", {
    nombre: student.name,
    carrera: student.career,
    equipoNombre: student.equipoNombre 
  });
}

// 🔥 FUNCIÓN FALTANTE: MARCAR EQUIPO COMO LISTO (Corresponde a PATCH /equipos/:id/ready)
export async function setTeamReadyDB(equipoId: number) {
  return request<any>(`/equipos/${equipoId}/ready`, "PATCH", {});
}
// -------------------------------------------------------------------------------------

export async function getRoomState(roomCode: string) {
  try {
    const data = await request<any>(`/salas/${roomCode}/estado`, "GET");
    return {
      step: data.faseActual || data.step || "lobby",
      remaining: data.segundosRestantes ?? 300,
      running: data.timerCorriendo ?? false,
      formation: data.formacion || "manual", 
      expectedTeams: data.equiposEsperados || 0,
      equipos: Array.isArray(data.equipos) ? data.equipos.map((e: any) => ({
         teamName: e.nombre,
         integrantes: e.integrantes || [],
         roomCode: roomCode,
         listo: !!e.listo, // Necesario para el contador del profesor
         id: e.id // Necesario para llamar a setTeamReadyDB
      })) : [],
      wheel: data.datosJuego?.wheel,
      presentOrder: data.datosJuego?.presentOrder || []
    };
  } catch (e) {
    return null;
  }
}

export async function updateRoomState(roomCode: string, payload: any) {
  try {
    const dbPayload: any = {};
    if (payload.step !== undefined) dbPayload.faseActual = payload.step;
    if (payload.remaining !== undefined) dbPayload.segundosRestantes = payload.remaining;
    if (payload.running !== undefined) dbPayload.timerCorriendo = payload.running;
    if (payload.formation !== undefined) dbPayload.formacion = payload.formation;
    if (payload.estado !== undefined) dbPayload.estado = payload.estado;
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

// --- ANALYTICS ---
export async function getAnalytics() {
  return request<any>("/admin/analytics", "GET");
}



// --- GESTIÓN DE USUARIOS ---
export async function getUsersDB() {
  return request<any[]>("/admin/users", "GET");
}

export async function deleteUserDB(id: string) {
  return request<any>(`/admin/users/${id}`, "DELETE");
}

export async function createUserDB(data: { name: string; user: string; pass: string; isAdmin?: boolean }) {
  return request<any>("/admin/users", "POST", data);
}