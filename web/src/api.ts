export const API =
  (window as any).REACT_APP_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";
// Tipo de autenticación para profesor
export type ProfAuth = { user: string; pass: string };

type CreateRoomReq = { hostName: string };
type CreateRoomRes = { roomCode: string };

type JoinRoomReq = { name: string; career?: string };
type JoinRoomRes = { ok: boolean; room: any };

export async function createRoom(
  payload: CreateRoomReq,
  auth?: { user: string; pass: string }
): Promise<CreateRoomRes> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    headers.Authorization = `Basic ${btoa(`${auth.user}:${auth.pass}`)}`;
  }
  const r = await fetch(`${API}/rooms`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("No se pudo crear la sala");
  return r.json();
}

export async function joinRoom(code: string, payload: JoinRoomReq): Promise<JoinRoomRes> {
  const r = await fetch(`${API}/rooms/${code}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Código inválido o sala cerrada");
  return r.json();
}
