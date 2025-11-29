export type FlowStep =
  | "lobby"
  | "f0_instr" | "f0_activity"
  | "f1_video" | "f1_instr" | "f1_activity" | "f1_rank"
  | "f2_video" | "f2_instr" | "f2_theme" | "f2_instrucciones" | "f2_activity" | "f2_rank"
  | "f3_video" | "f3_instr" | "f3_activity" | "f3_rank"
  | "f4_video" | "f4_instr" | "f4_prep" | "f4_wheel" | "f4_present" | "f4_rank"
  | "f5_podium" | "f5_video"
  | "pre_qr_reflex" | "qr";

export interface FlowState {
  // --- Propiedades Principales ---
  step: FlowStep;
  running: boolean;
  remaining: number;
  roomCode: string;
  expectedTeams: number;
  presentOrder: string[];
  currentIdx: number | null;
  
  // --- CONFIGURACIÓN DE TIEMPOS (Aquí está la solución al error) ---
  pitchSeconds?: number;
  f0Seconds?: number;      // Rompehielos
  f1Seconds?: number;      // Diferencias
  f2Seconds?: number;      // Empatía
  f3Seconds?: number;      // Creatividad
  f4PrepSeconds?: number;  // Preparación Pitch
  empatiaSeconds?: number;
  includeF0?: boolean;

  // --- Estado de alumnos / Grupos ---
  teamName?: string;
  formation?: "auto" | "manual";
  finishedPitch?: boolean;

  // --- Ruleta (Wheel) ---
  wheel?: {
    segments: string[];
    remaining: string[];
    picked: string[];
    lastWinner?: string | null;
    girando?: boolean;
    angulo?: number;
  } | null;

  // --- Compatibilidad Legacy (No borrar) ---
  paso?: FlowStep;
  ejecutando?: boolean;
  segundosRestantes?: number;
  ruleta?: any;
  ts?: number;
}

export const ESTADO_INICIAL: FlowState = {
  step: "lobby",
  running: false,
  remaining: 0,
  roomCode: "",
  expectedTeams: 0,
  presentOrder: [],
  currentIdx: 0,
  pitchSeconds: 90,
  wheel: null,
};

export const TITULOS_PASOS: Partial<Record<FlowStep, string>> = {
  lobby: "Lobby",
  f0_activity: "Actividad Inicial",
  f1_activity: "Diferencias",
  f2_activity: "Mapa de Empatía",
  f3_activity: "Prototipo LEGO",
  f4_present: "Pitch",
  f5_podium: "Ganadores"
};