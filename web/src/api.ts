import { 
  createRoom as createRoomMock, 
  joinRoom as joinRoomMock 
} from "./api"; 

// 1. CONFIGURACIÓN DE RED
const CLOUD_URL = (import.meta as any).env?.VITE_API_URL || "http://18.191.239.111:4001";
const BASE_URL = CLOUD_URL; 

console.log("🔗 Conectando API a:", BASE_URL);

export const API = { baseUrl: BASE_URL };

// --- TYPES ---
export type ProfAuthType = { user: string; pass: string; id?: string; name?: string; };
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
      ...(savedAuth?.id ? { "Authorization": `Bearer ${savedAuth.id}` } : {}) 
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (response.status === 401) { ProfAuth.logout(); throw new Error("Sesión inválida"); }
  if (!response.ok) { const e = await response.json().catch(() => ({})); throw new Error(e.error || `Error ${response.status}`); }
  return response.json();
}

// --- AUTENTICACIÓN ---
const PROF_KEY = "udd_auth_prof";
export const ProfAuth = {
  login: async (email: string, pass: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: email, password: pass }) 
      });
      if (res.ok) {
        const data = await res.json();
        const authData: ProfAuthType = { user: data.user.username, pass, id: String(data.user.id), name: data.user.nombre };
        localStorage.setItem(PROF_KEY, JSON.stringify(authData));
        return true;
      }
      return false;
    } catch (e) { return false; }
  },
  isLoggedIn: () => !!localStorage.getItem(PROF_KEY),
  isAuthenticated: () => !!localStorage.getItem(PROF_KEY),
  logout: () => { localStorage.removeItem(PROF_KEY); window.location.reload(); },
  getUser: () => { try { return JSON.parse(localStorage.getItem(PROF_KEY) || 'null'); } catch { return null; } }
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
  return request(`/salas/${roomCode}/unirse`, "POST", { nombre: student.name, carrera: student.career, equipoNombre: student.equipoNombre });
}
export async function setTeamReadyDB(equipoId: number) {
  return request<any>(`/equipos/${equipoId}/ready`, "PATCH", {});
}

export async function getRoomState(roomCode: string) {
  try {
    const data = await request<any>(`/salas/${roomCode}/estado`, "GET");
    return {
      step: data.faseActual || "lobby",
      remaining: data.segundosRestantes ?? 300,
      running: data.timerCorriendo ?? false,
      formation: data.formacion || "manual", 
      expectedTeams: data.equiposEsperados || 0,
      
      // MAPEO DE TIEMPOS
      f0Seconds: data.t_rompehielo, f1Seconds: data.t_diferencias, f2Seconds: data.t_empatia,
      f3Seconds: data.t_creatividad, f4PrepSeconds: data.t_pitch_prep, pitchSeconds: data.t_pitch_fuego,

      equipos: Array.isArray(data.equipos) ? data.equipos.map((e: any) => ({
         id: e.id, listo: !!e.listo, puntos: e.puntos || 0, fotoLegoUrl: e.foto, desafioId: e.desafioId,
         roomCode: roomCode, teamName: e.nombre, integrantes: e.integrantes || []
      })) : [],
      wheel: data.datosJuego?.wheel, presentOrder: data.datosJuego?.presentOrder || []
    };
  } catch { return null; }
}

export async function updateRoomState(roomCode: string, payload: any) {
  try {
    const dbPayload: any = {};
    if (payload.step!==undefined) dbPayload.faseActual = payload.step;
    if (payload.remaining!==undefined) dbPayload.segundosRestantes = payload.remaining;
    if (payload.running!==undefined) dbPayload.timerCorriendo = payload.running;
    if (payload.formation!==undefined) dbPayload.formacion = payload.formation;
    if (payload.estado!==undefined) dbPayload.estado = payload.estado;
    
    // Tiempos
    if (payload.f0Seconds!==undefined) dbPayload.t_rompehielo = payload.f0Seconds;
    if (payload.f1Seconds!==undefined) dbPayload.t_diferencias = payload.f1Seconds;
    if (payload.f2Seconds!==undefined) dbPayload.t_empatia = payload.f2Seconds;
    if (payload.f3Seconds!==undefined) dbPayload.t_creatividad = payload.f3Seconds;
    if (payload.f4PrepSeconds!==undefined) dbPayload.t_pitch_prep = payload.f4PrepSeconds;
    if (payload.pitchSeconds!==undefined) dbPayload.t_pitch_fuego = payload.pitchSeconds;

    if (payload.wheel || payload.presentOrder) dbPayload.datosJuego = { wheel: payload.wheel, presentOrder: payload.presentOrder };
    return await request<any>(`/salas/${roomCode}/estado`, "PATCH", dbPayload);
  } catch (e) { console.error(e); }
}

export async function updateTeamScore(id: number, delta: number) { return request(`/equipos/${id}/score`, "PATCH", { delta }); }
export async function updateTeamData(id: number, data: any) { return request(`/equipos/${id}/data`, "PATCH", data); }
export async function submitPeerEvaluation(d: any) { return request(`/evaluacion`, "POST", d); }
export async function getTeamIdByName(code: string, name: string) {
    const s = await getRoomState(code);
    return s?.equipos?.find((t:any) => t.teamName === name)?.id || null;
}
export async function health() { return request("/health", "GET"); }

// --- ADMIN ---
export async function getConfig() { 
    const data = await request<any>("/admin/config", "GET");
    // TRADUCCIÓN VITAL: La BD devuelve imgUrl, el front usa img.
    if (data.temas) {
        Object.keys(data.temas).forEach(k => {
            if (data.temas[k].desafios) {
                data.temas[k].desafios = data.temas[k].desafios.map((d:any) => ({
                    ...d, img: d.img // El backend ya debe enviar 'img' si lo mapeamos en admin.ts, pero por seguridad:
                }));
            }
        });
    }
    return data; 
}
export async function saveThemesConfig(t: any) { return request("/admin/themes", "POST", t); }
export async function saveRouletteConfigDB(i: any[]) { return request("/admin/roulette", "POST", i); }
export async function saveChecklistConfigDB(i: any[]) { return request("/admin/checklist", "POST", i); }
export async function uploadTeamsBatch(code: string, teams: any[]) { return request(`/salas/${code}/masivo`, "POST", { equipos: teams }); }

// --- ANALYTICS & USERS ---
export async function getAnalytics() { return request<any>("/admin/analytics", "GET"); }
export async function getUsersDB() { return request<any[]>("/admin/users", "GET"); }
export async function deleteUserDB(id: string) { return request<any>(`/admin/users/${id}`, "DELETE"); }
export async function createUserDB(d: any) { return request<any>("/admin/users", "POST", d); }
export function getSessionsDB() { return request<any[]>("/admin/sessions", "GET"); }