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

// web/src/api.ts

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

const PROF_KEY = "udd_prof_auth_v1";

export const ProfAuthLogic = {
  login: (email: string, pass: string): boolean => {
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



export async function getRoomState(roomCode: string) {
  try {
    return await request<any>(`/salas/${roomCode}/estado`, "GET");
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

    return await request<any>(`/salas/${roomCode}/estado`, "PATCH", dbPayload);
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


// --- ADMIN & CONFIGURACIÓN ---

export async function getConfig() {
    return request<any>("/admin/config", "GET");
}

export async function saveThemesConfig(themes: any) {
    return request("/admin/themes", "POST", themes);
}

export async function saveRouletteConfigDB(items: any[]) {
    return request("/admin/roulette", "POST", items);
}

// web/src/api.ts

// ... (resto del archivo)

export async function saveChecklistConfigDB(items: any[]) {

  return request("/admin/checklist", "POST", items);
}

