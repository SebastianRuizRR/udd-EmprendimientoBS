import { getConfig, saveThemesConfig, saveRouletteConfigDB, saveChecklistConfigDB } from "./api";
import { 
  createRoom, joinRoom, API, ProfAuth, generateCode, health,
  getRoomState, updateRoomState, 
  updateTeamScore, updateTeamData, submitPeerEvaluation, getTeamIdByName
} from "./api";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  memo,
  useCallback,
} from "react";

// Componentes de animación/UI/Core (Asumidos en la carpeta "componentes/")
import TeamworkMiniAnim from "./componentes/TeamworkMiniAnim";
import EmpathyAnimacion from "./componentes/EmpathyAnimacion";
import CreatividadAnimacion from "./componentes/CreatividadAnimacion";
import PitchAnimacion from "./componentes/PitchAnimacion";
import LoginProfesor from "./componentes/LoginProfesor";
import * as XLSX from "xlsx";
import CierreReflexion from "./componentes/CierreReflexion";
import { ScoreSlider } from "./componentes/ScoreSlider";
import AnimEva from "./componentes/AnimEva";
import AdminAnalytics from "./componentes/AdminAnalytics"; 
import IntroVideo from "./componentes/IntroVideo";
import ProfTutorial from "./componentes/ProfTutorial";
import RuedaPresentacion from "./componentes/RuedaPresentacion"; 
import RuletaDesafioLego from "./componentes/RuletaDesafioLego";
import { FlowState, ESTADO_INICIAL, FlowStep, TITULOS_PASOS } from "./componentes/flow";

import originalImg from "./componentes/assets/original.jpg";
import modificadaImg from "./componentes/assets/modificada.jpg";
import imgQR from "./componentes/assets/QR.jpg";

function mmss(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0));
  const mStr = String(Math.floor(s / 60)).padStart(2, "0");
  const sStr = String(s % 60).padStart(2, "0");
  return `${mStr}:${sStr}`;
}

// Inicializador de estado de ruleta para el flujo
const initializeWheelState = (teams: string[]) => ({
    angulo: 0,
    girando: false,
    segments: teams,
    remaining: teams,
    picked: [],
    lastWinner: null,
});


/* --THEME-- */
const theme = {
  rosa: "#E91E63",
  azul: "#1976D2",
  amarillo: "#FFEB3B",
  blanco: "#FFFFFF",
  surfaceAlt: "#F7F9FC",
  gris: "#ECEFF1",
  texto: "#0D47A1",
  muted: "#6B7A90",
  border: "#E3E8EF",
  shadow: "0 16px 36px rgba(16,24,40,.14)",
  verde: "#2E7D32", 
};

const GlobalFormCSS = () => (
  <style>{`
  *{-webkit-tap-highlight-color:transparent;} input,textarea,select{box-sizing:border-box;max-width:100%} body{margin:0}
  button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #93C5FD;outline-offset:2px}
  @keyframes crownFloat{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:0% 0}100%{background-position:120% 0}}
  @keyframes fall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(360deg);opacity:.9}}
  @keyframes floatY{0%{transform:translateY(0)}50%{transform:translateY(-18px)}100%{transform:translateY(0)}}
  @keyframes pulseSoft{0%{transform:scale(1);opacity:.65}50%{transform:scale(1.06);opacity:.85}100%{transform:scale(1);opacity:.65}}
  @keyframes drift{0%{transform:translateX(0)}50%{transform:translateX(12px)}100%{transform:translateX(0)}}
  @keyframes pulse { 
    0% { transform: scale(1); opacity: 1; } 
    50% { transform: scale(1.04); opacity: .95; } 
    100% { transform: scale(1); opacity: 1; } 
  }
  @keyframes drumroll { 
    0% { transform: rotate(0deg) scale(1); } 
    25% { transform: rotate(-3deg) scale(1.1); } 
    75% { transform: rotate(3deg) scale(1.1); } 
    100% { transform: rotate(0deg) scale(1); }
`}</style>
);

/* --BASE STYLES-- */
const appStyles: React.CSSProperties = {
  position: "relative",
  minHeight: "100dvh",
  overflowY: "auto",
  overflowX: "hidden",
  fontFamily:
    "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  color: theme.texto,
};
const baseInput: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
  maxWidth: "100%",
  background: theme.blanco,
};
const panelBox: React.CSSProperties = {
  background: theme.blanco,
  border: `1px solid ${theme.border}`,
  borderRadius: 16,
  padding: 12,
  position: "relative",
  zIndex: 2,
  boxShadow: theme.shadow,
};
const badgeTitle: React.CSSProperties = {
  fontWeight: 900,
  color: theme.azul,
  marginBottom: 6,
};
const smallHint: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  marginTop: 8,
};

/* ============ SONIDO DE ALARMA ============ */


/* ============ AUDIO MEJORADO ============ */
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

function unlockAudio() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// Alarma tipo "Beep-Beep" fuerte
// = A. REEMPLAZAR ESTA FUNCIÓN (Al principio del archivo) =
function playAlarm() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;
  
  // Oscilador principal (Tono suave)
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  // Onda 'sine' es la más suave (sin armónicos chillones)
  osc.type = 'sine';
  
  // Melodía "Ding-Dong" suave (dos tonos)
  osc.frequency.setValueAtTime(523.25, t); // Do (C5)
  osc.frequency.exponentialRampToValueAtTime(392.00, t + 0.4); // Sol (G4)
  
  // Volumen: Ataque suave y caída lenta
  gain.gain.setValueAtTime(0, t); 
  gain.gain.linearRampToValueAtTime(0.3, t + 0.1); // Sube suave
  gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5); // Se desvanece lento
  
  osc.start(t);
  osc.stop(t + 1.5);
}

function playDrumroll() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;
  const DURATION = 4.0; 

  const bufferSize = audioCtx.sampleRate * 0.5; 
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 100; 

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.01, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.8, t + DURATION - 0.1); 
  noiseGain.gain.linearRampToValueAtTime(0, t + DURATION); 

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  
  noise.start(t);
  noise.stop(t + DURATION + 0.1);

  const crashTime = t + DURATION; 
  const crashSrc = audioCtx.createBufferSource();
  crashSrc.buffer = buffer;
  crashSrc.loop = true;
  
  const crashFilter = audioCtx.createBiquadFilter();
  crashFilter.type = "lowpass"; 
  crashFilter.frequency.value = 3000; 
  
  const crashGain = audioCtx.createGain();
  crashGain.gain.setValueAtTime(0, crashTime);
  crashGain.gain.linearRampToValueAtTime(0.2, crashTime + 0.05); 
  crashGain.gain.exponentialRampToValueAtTime(0.001, crashTime + 1.5);
  
  crashSrc.connect(crashFilter);
  crashFilter.connect(crashGain);
  crashGain.connect(audioCtx.destination);
  crashSrc.start(crashTime);
  crashSrc.stop(crashTime + 2.0);


  const notes = [196.00, 261.63, 329.63, 523.25];
  
  notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine"; 
      osc.frequency.value = freq;
      
      const noteStart = crashTime + (i * 0.05); 
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 3.0);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(noteStart);
      osc.stop(noteStart + 3.5);
  });
}

const AutoCenter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [center, setCenter] = useState(true);
  const recompute = () => {
    const vp = window.innerHeight;
    const padding = 48;
    const contentH = contentRef.current?.offsetHeight ?? 0;
    setCenter(contentH + padding <= vp);
  };
  useLayoutEffect(() => {
    recompute();
    const ro = new ResizeObserver(recompute);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, []);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: center ? "center" : "flex-start",
        alignItems: "center",
        padding: 24,
      }}
    >
      <div
        ref={contentRef}
        style={{ width: "100%", display: "grid", justifyItems: "center" }}
      >
        {children}
      </div>
    </div>
  );
};

type CardProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  width?: number;
  tight?: boolean;
}>;

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  width = 520,
  children,
  tight,
}) => (
  <div
    style={{
      width: `clamp(320px,92vw,${width}px)`,
      background: "rgba(255,255,255,0.96)",
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
      borderRadius: 20,
      padding: tight ? 18 : 24,
      textAlign: "center",
      backdropFilter: "blur(2px)",
      position: "relative",
      zIndex: 3,
      margin: "12px auto",
    }}
  >
    <h2
      style={{
        margin: 0,
        marginBottom: 8,
        fontSize: 26,
        fontWeight: 900,
        color: theme.rosa,
      }}
    >
      {title}
    </h2>
    {subtitle && (
      <p style={{ marginTop: 0, marginBottom: 16, color: theme.azul }}>
        {subtitle}
      </p>
    )}
    {children}
  </div>
);
const Btn: React.FC<{
  onClick?: () => void;
  bg?: string;
  fg?: string;
  label: string;
  full?: boolean;
  disabled?: boolean;
  variant?: "solid" | "outline";
  title?: string;
  style?: React.CSSProperties;
}> = memo(
  ({
    onClick,
    bg = theme.azul,
    fg = theme.blanco,
    label,
    full = true,
    disabled,
    variant = "solid",
    title,
    style
  }) => (
    <button
      onClick={() => onClick?.()}
      disabled={disabled}
      title={title}
      style={{
        width: full ? "100%" : undefined,
        padding: "12px 16px",
        borderRadius: 14,
        border: variant === "outline" ? `2px solid ${theme.azul}` : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 800,
        letterSpacing: 0.2,
        background: disabled
          ? "#cfd8dc"
          : variant === "outline"
          ? "transparent"
          : bg,
        color: disabled ? "#607d8b" : variant === "outline" ? theme.azul : fg,
        boxShadow:
          variant === "outline" ? "none" : "0 6px 12px rgba(0,0,0,.12)",
        transition:
          "transform .06s ease, opacity .15s ease, box-shadow .15s ease",
        whiteSpace: "nowrap",
        ...style
      }}
      onMouseDown={(e) =>
        !disabled && (e.currentTarget.style.transform = "scale(.98)")
      }
      onMouseUp={(e) =>
        !disabled && (e.currentTarget.style.transform = "scale(1)")
      }
      onMouseEnter={(e) => {
        if (!disabled && variant === "solid")
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,.16)";
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === "solid")
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,.12)";
      }}
    >
      {label}
    </button>
  )
);

/* --FONDO-- */
const Background = memo(() => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(145deg, ${theme.rosa} 0%, ${theme.azul} 60%)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(40% 35% at 85% 15%, ${theme.amarillo}55, transparent 65%)`,
        filter: "blur(2px)",
      }}
    />
    <Orb
      left="6%"
      top="72%"
      size={220}
      color={`${theme.amarillo}55`}
      delay={0.2}
    />
    <Orb
      left="78%"
      top="68%"
      size={180}
      color={`${theme.rosa}44`}
      delay={0.6}
    />
    <Orb
      left="12%"
      top="18%"
      size={140}
      color={`${theme.azul}55`}
      delay={0.1}
    />
    <Wave color={`${theme.azul}`} opacity={0.18} top={100} />
    <Wave color={`${theme.rosa}`} opacity={0.14} top={170} reverse />
    <GeoPiece
      left="70%"
      top="22%"
      size={140}
      color={`${theme.blanco}18`}
      rotate
    />
    <GeoPiece left="28%" top="78%" size={160} color={`${theme.blanco}14`} />
  </div>
));
const Orb: React.FC<{
  left: string;
  top: string;
  size: number;
  color: string;
  delay?: number;
}> = ({ left, top, size, color, delay = 0 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      filter: "blur(6px)",
      animation: `floatY ${
        5.5 + Math.random() * 2
      }s ease-in-out ${delay}s infinite`,
    }}
  />
);
const Wave: React.FC<{
  color: string;
  opacity?: number;
  top?: number;
  reverse?: boolean;
}> = ({ color, opacity = 0.2, top = 120, reverse }) => (
  <svg
    viewBox="0 0 1440 320"
    preserveAspectRatio="xMidYMid slice"
    style={{
      position: "absolute",
      top,
      left: 0,
      width: "100%",
      height: 240,
      opacity,
      transform: reverse ? "scaleY(-1)" : undefined,
      animation: "drift 12s ease-in-out infinite",
    }}
  >
    <path
      fill={color}
      d="M0,192 C240,240 480,240 720,192 C960,144 1200,144 1440,192 L1440,320 L0,320 Z"
    />
  </svg>
);

const GeoPiece: React.FC<{
  left: string;
  top: string;
  size: number;
  color: string;
  rotate?: boolean;
}> = ({ left, top, size, color, rotate }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: size,
      height: size,
      borderRadius: 26,
      background: color,
      transform: "rotate(12deg)",
      animation: rotate
        ? "pulseSoft 7s ease-in-out infinite"
        : "floatY 8s ease-in-out infinite",
      boxShadow: "0 20px 40px rgba(0,0,0,.08)",
    }}
  />
);

const FLOW_KEY = "udd_flow_state_v1",
  READY_KEY = "udd_ready_teams_v1",
  COINS_KEY = "udd_coins_v1";
const THEMES_KEY = "udd_themes_v1",
  ANALYTICS_KEY = "udd_analytics_v1";
const ROSTER_KEY = "udd_roster_v1";

// === CONFIGURACIÓN DE GRUPOS ===
const MIN_GROUPS = 3;
const MAX_GROUPS = 4;
const HARD_MAX_GROUPS = 5;
const MAX_PER_GROUP = 9;

/* ====== ELECCIÓN DE DESAFÍO (persistencia por sala/equipo) ====== */
const CHOICE_KEY = "udd_choice_v1";

/* ====== FOTOS DE PROTOTIPO (por sala/equipo) ====== */
const PHOTOS_KEY = "udd_team_photos_v1";

function saveTeamPhoto(roomCode: string, teamName: string, dataUrl: string) {
  const all = readJSON<Record<string, string>>(PHOTOS_KEY, {});
  all[teamKey(roomCode, teamName)] = dataUrl;
  writeJSON(PHOTOS_KEY, all);
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PHOTOS_KEY,
        newValue: JSON.stringify(all),
      })
    );
  } catch {}
}

function getTeamPhoto(roomCode: string, teamName: string) {
  const all = readJSON<Record<string, string>>(PHOTOS_KEY, {});
  return all[teamKey(roomCode, teamName)];
}

/* Comprimir imagen a dataURL JPG para evitar que no cargue por tamaño */
async function compressImageToDataURL(
  file: File,
  maxW = 1280,
  quality = 0.82
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/* id único por sala+equipo */
function teamKey(roomCode: string, teamName: string) {
  return `${roomCode}::${teamName}`;
}

/* guardar elección (y si está confirmada) */
function saveTeamChoice(
  roomCode: string,
  teamName: string,
  themeId: string,
  desafioIndex: number,
  confirmed: boolean
) {
  const all = readJSON<
    Record<
      string,
      { themeId: string; desafioIndex: number; confirmed: boolean }
    >
  >(CHOICE_KEY, {});
  all[teamKey(roomCode, teamName)] = { themeId, desafioIndex, confirmed };
  writeJSON(CHOICE_KEY, all);
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CHOICE_KEY,
        newValue: JSON.stringify(all),
      })
    );
  } catch {}
}

/* leer elección de un equipo (o undefined) */
function getTeamChoice(roomCode: string, teamName: string) {
  const all = readJSON<
    Record<
      string,
      { themeId: string; desafioIndex: number; confirmed: boolean }
    >
  >(CHOICE_KEY, {});
  return all[teamKey(roomCode, teamName)];
}

/* cuántos equipos confirmaron en una sala */
function countConfirmedChoices(roomCode: string, teams: string[]) {
  const all = readJSON<
    Record<
      string,
      { themeId: string; desafioIndex: number; confirmed: boolean }
    >
  >(CHOICE_KEY, {});
  let ok = 0;
  for (const t of teams) {
    const ch = all[teamKey(roomCode, t)];
    if (ch?.confirmed) ok++;
  }
  return ok;
}

type ThemeId = "salud" | "sustentabilidad" | "educacion";
type ThemePersona = { 
  nombre: string; 
  edad: number; 
  bio: string; 
  img?: string; 
};

type ThemeChallenge = { 
  titulo: string; 
  descripcion: string; 
  img?: string; 
};

type ThemeConfig = Record<
  ThemeId,
  { label: string; desafios: ThemeChallenge[]; persona: ThemePersona }
>;
type Analytics = {
  roomsCreated: number;
  challengeUsage: Record<string, number>;
  teams: {
    roomCode: string;
    teamName: string;
    integrantes: { nombre: string; carrera: string }[];
    ts: number;
  }[];
  reflections: {
    roomCode: string;
    teamName: string;
    text: string;
    ts: number;
  }[];
  feedbacks: {
    roomCode: string;
    fromTeam: string;
    targetTeam: string;
    ratings: number[];
    comment?: string;
    ts: number;
  }[];
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function normalizeFlow(f: any, initial: FlowState): FlowState {
  const base = { ...initial, ...(f || {}) };
  return {
    ...base,
    presentOrder: Array.isArray(f?.presentOrder) ? f.presentOrder : [],
    currentIdx: typeof f?.currentIdx === "number" || f?.currentIdx === null ? f.currentIdx : 0,
    
    pitchSeconds: typeof f?.pitchSeconds === "number" ? f.pitchSeconds : 90,
    f0Seconds: typeof f?.f0Seconds === "number" ? f.f0Seconds : 180,      
    f1Seconds: typeof f?.f1Seconds === "number" ? f.f1Seconds : 300,    
    f2Seconds: typeof f?.f2Seconds === "number" ? f.f2Seconds : 300,      
    f3Seconds: typeof f?.f3Seconds === "number" ? f.f3Seconds : 900,      
    f4PrepSeconds: typeof f?.f4PrepSeconds === "number" ? f.f4PrepSeconds : 600, 
    
    finishedPitch: !!f?.finishedPitch,
    formation: f?.formation === "auto" || f?.formation === "manual" ? f.formation : "manual",
    wheel: f?.wheel && Array.isArray(f.wheel.segments) ? { ...f.wheel } : initializeWheelState([]),
  };
}

/* --STORAGE SIGNAL-- */
function useStorageSignal(keys: string[], pollMs = 800) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (keys.includes(e.key)) setTick((t) => t + 1);
    };
    window.addEventListener("storage", onStorage);
    const id = window.setInterval(() => setTick((t) => t + 1), pollMs);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(id);
    };
  }, [keys, pollMs]);
  return tick;
}



// web/src/App.tsx

function useSharedFlow(isTeacher: boolean, initial: FlowState, roomCode: string) {
  const [flow, setFlow] = useState<FlowState>(initial);
  const [remoteTeams, setRemoteTeams] = useState<any[]>([]);

  // 1. Polling (Lectura)
  useEffect(() => {
    if (!roomCode) return;
    const fetchState = async () => {
      const data = await getRoomState(roomCode);
      if (data) {
        setFlow(prev => {
            // Solo actualizamos si hay cambios reales para evitar re-renders innecesarios
            if (prev.step === data.faseActual && prev.remaining === data.segundosRestantes && prev.running === data.timerCorriendo) {
                return prev;
            }
            return {
                ...prev,
                step: data.faseActual as any,
                remaining: data.segundosRestantes,
                running: data.timerCorriendo,
                formation: data.formation === "auto" ? "auto" : "manual",
                roomCode: data.roomCode,
            };
        });
        
        if (Array.isArray(data.equipos)) {
            // Comparación simple para evitar bucles de actualización de equipos
            setRemoteTeams(prev => {
                if (prev.length === data.equipos.length) return prev; 
                return data.equipos;
            });
        }
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, [roomCode]);

  // 2. Clock Local
  useEffect(() => {
    if (!isTeacher || !flow.running) return;
    const id = setInterval(() => {
      setFlow(f => {
        const nextTime = Math.max(0, f.remaining - 1);
        const isRunning = nextTime > 0;
        updateRoomState(roomCode, { remaining: nextTime, running: isRunning });
        return { ...f, remaining: nextTime, running: isRunning };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isTeacher, flow.running, roomCode]);

  // 3. FUNCIONES DE CONTROL (¡AHORA CON USECALLBACK!)
  const publish = useCallback((next: Partial<FlowState>) => {
    setFlow(prev => {
      const newState = { ...prev, ...next };
      updateRoomState(roomCode, next);
      return newState;
    });
  }, [roomCode]); // Solo cambia si roomCode cambia

  const setStep = useCallback((step: FlowStep, remaining?: number) => 
    publish({ step, remaining: remaining, running: false }), [publish]);

  const startTimer = useCallback((seconds?: number) => 
    publish({ remaining: seconds, running: true }), [publish]);

  const pauseTimer = useCallback(() => 
    publish({ running: false }), [publish]);

  const resetTimer = useCallback((seconds: number) => 
    publish({ remaining: seconds, running: false }), [publish]);

  return { flow, setStep, startTimer, pauseTimer, resetTimer, publish, remoteTeams };
}

/* --ANALYTICS HOOK-- */
function useAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics>(() =>
    readJSON<Analytics>(ANALYTICS_KEY, {
      roomsCreated: 0,
      challengeUsage: {},
      teams: [],
      reflections: [],
      feedbacks: [],
    })
  );
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ANALYTICS_KEY && e.newValue) {
        try {
          setAnalytics(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const update = (updater: (a: Analytics) => Analytics) => {
    setAnalytics((prev) => {
      const next = updater(prev);
      writeJSON(ANALYTICS_KEY, next);
      try {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: ANALYTICS_KEY,
            newValue: JSON.stringify(next),
          })
        );
      } catch {}
      return next;
    });
  };
  return { analytics, update };
}

/* ===================== APP ===================== */
export default function App() {
  const [mode, setMode] = useState<"inicio" | "prof" | "alumno" | "admin">(
    "inicio"
  );

  useEffect(() => {
    const unlock = () => {
      if (audioCtx.state === "suspended") audioCtx.resume();
      // Removemos los listeners una vez desbloqueado
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("touchstart", unlock);
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);
  
  const [equiposQty, setEquiposQty] = useState(4);
  const [roomCode, setRoomCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [miNombre, setMiNombre] = useState("");
  const [miCarrera, setMiCarrera] = useState("");
  const [integrantes, setIntegrantes] = useState<
    { nombre: string; carrera: string }[]
  >([]);
  const [teamReady, setTeamReady] = useState(false);
  const [coins, setCoins] = useState(0);
  const [f1Tab, setF1Tab] = useState<"spot" | "sopa">("spot");
  const [podiumPhase, setPodiumPhase] = useState<'hidden' | 'drumroll' | 'reveal'>('hidden'); 
  
  const lastPlayedZeroRef = useRef<boolean>(false); 
  const [intro, setIntro] = React.useState<"playing" | "done">("playing");
  const [showIntro, setShowIntro] = React.useState(true);

  // === Estado UI F4 (alumno) ===
  const [showPhoto, setShowPhoto] = React.useState(false);
  const [showOrder, setShowOrder] = React.useState(true);
  const [sent, setSent] = useState(false);
  const [scores, setScores] = useState([0, 0, 0, 0, 0, 0]);

  const isTablet = useMediaQuery("(max-width: 1180px)");
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [profAuth, setProfAuth] = useState<ProfAuth | null>(null);
  const [showProfLogin, setShowProfLogin] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [showProfTutorial, setShowProfTutorial] = React.useState(false);
  const [profStartView, setProfStartView] = useState<
    "menu" | "crear" | "tutorial"
  >("menu");

  const imgOrig = originalImg;
  const imgMod = modificadaImg;
  const [confirmed, setConfirmed] = useState(false);

  // Estados para Ruleta LEGO (Fase 3) - Controla visibilidad MODAL en Alumno
  const [showLegoRoulette, setShowLegoRoulette] = useState(false);

  // Notificación de tiempo
  const [showTimeEndNotification, setShowTimeEndNotification] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  // === F1: Spot the Difference ===
  const F1_SPOT_IMAGE_URL = "/diferencia.jpg"; // Original
  const F1_SPOT_IMAGE_URL_B = "/diferencia.jpg"; // Modificada (usa la misma si no tienes otra)
  const F1_DIFFS = [
    { x: 0.1929, y: 0.2881, r: 0.055 }, // Mariposa / ojo / cabeza
    { x: 0.4823, y: 0.2306, r: 0.055 }, // Nube derecha
    { x: 0.687, y: 0.2153, r: 0.055 }, // Sol
    { x: 0.6969, y: 0.4739, r: 0.055 }, // Casa / ventana
    { x: 0.9154, y: 0.5371, r: 0.055 }, // Casa / detalle muro
    { x: 0.2283, y: 0.4605, r: 0.055 }, // Pata levantada / mancha
    { x: 0.4272, y: 0.4432, r: 0.055 }, // Nariz / boca
    { x: 0.2165, y: 0.6348, r: 0.055 }, // Flor centro
    { x: 0.8996, y: 0.7095, r: 0.055 }, // Arbusto / pasto atrás
    { x: 0.498, y: 0.8877, r: 0.055 }, // Hoja inferior / planta
  ];

  // --- Progreso de "Diferencias" (persistente) ---
  const DIFF_KEY = "fase1_diff_found_v1";

  const [diffFound, setDiffFound] = React.useState<boolean[]>(() => {
    // intenta recuperar desde localStorage
    try {
      const saved = localStorage.getItem(DIFF_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed as boolean[];
    } catch {}
    // si no hay nada guardado, inicializa con todo en false
    return Array(F1_DIFFS.length).fill(false);
  });

  // guarda progreso cada vez que cambie
  React.useEffect(() => {
    localStorage.setItem(DIFF_KEY, JSON.stringify(diffFound));
  }, [diffFound]);

  const [recommendedGroups, setRecommendedGroups] = useState<
    { nombre: string; integrantes: { nombre: string; carrera: string }[] }[]
  >([]);
  // --- Acordeón: equipos (estado global del componente) ---
  const [openTeams, setOpenTeams] = React.useState<Record<string, boolean>>({});
  const toggleTeamOpen = (k: string) =>
    setOpenTeams((prev) => ({ ...prev, [k]: !prev[k] }));

  const [openReco, setOpenReco] = useState(false);

  const [soupFound, setSoupFound] = React.useState<Record<string, boolean>>({});

  useEffect(() => {
    // Si no hay progreso cargado, inicializar
    if (Object.keys(soupFound).length === 0) {
      const words = [
        "INNOVACION",
        "USUARIO",
        "EMPATIA",
        "EQUIPO",
        "PROTOTIPO",
        "ITERAR",
        "IDEAR",
        "MERCADO",
      ];
      setSoupFound(Object.fromEntries(words.map((w) => [w, false])));
    }
  }, []); // ✅ solo una vez

  const OrderBoard: React.FC<{
    order: string[];
    currentIdx?: number;
    width?: number;
    title?: string;
  }> = ({
    order,
    currentIdx = -1,
    width = 980,
    title = "Orden de Presentación",
  }) => {
    const all = [...order];
    const alpha = [...order].sort((a, b) => a.localeCompare(b));
    return (
      <Card title={title} width={width}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div style={{ ...panelBox }}>
            <div
              style={{ fontWeight: 900, color: theme.azul, marginBottom: 8 }}
            >
              Equipos
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {alpha.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 12,
                    background: "#fff",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...panelBox }}>
            <div
              style={{ fontWeight: 900, color: theme.azul, marginBottom: 8 }}
            >
              Orden de presentación
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {all.map((t, i) => {
                const active = i === currentIdx;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      border: `1px solid ${active ? theme.azul : theme.border}`,
                      borderRadius: 12,
                      background: active ? "#E3F2FD" : "#fff",
                      display: "grid",
                      gridTemplateColumns: "28px 1fr",
                      gap: 8,
                      alignItems: "center",
                      fontWeight: active ? 800 : 600,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: active ? theme.azul : "#EEF2F6",
                        color: active ? "#fff" : "#334155",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>{t}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // === Lista de alumnos desde Excel + nombres sugeridos de equipo
  const [soupSeed] = React.useState(() => {
    const k = "soupSeed";
    const saved = sessionStorage.getItem(k);
    if (saved) return Number(saved);
    const seed = Math.floor(Math.random() * 1e9);
    sessionStorage.setItem(k, String(seed));
    return seed;
  });
  const [roster, setRoster] = useState<{ nombre: string; carrera: string }[]>(
    () => readJSON("udd_roster_v1", [])
  );
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "udd_roster_v1" && e.newValue) {
        try {
          setRoster(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const TEAM_SUGGESTIONS = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Eureka",
    "Nexus",
    "Aurora",
    "Pioneros",
    "Vector",
    "Quántum",
    "Phoenix",
    "Impulse",
    "Órbita",
    "Catalizadores",
    "Momentum",
    "Centella",
    "Nebula",
    "Vertex",
  ];

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [maxSpins, setMaxSpins] = useState(3); 

  function mulberry32(a: number) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }


  const [allProfs] = useState(() => readJSON("udd_professors_db_v1", [
    { id: "admin", name: "Administrador", user: "admin", pass: "admin", isAdmin: true },
    { id: "demo", name: "Profesor Demo", user: "prof", pass: "prof", isAdmin: false }
]));

function handleProfLoginSuccess(auth: ProfAuth) {
  const validProf = allProfs.find((p:any) => p.user === auth.user && p.pass === auth.pass);

  if (validProf) {
      if (validProf.isAdmin) {
          setMode('admin');
      } else {
          setProfAuth({ user: validProf.user, pass: validProf.pass, name: validProf.name, id: validProf.id });
          setMode("prof");
          setProfStartView("menu");
      }
      setShowProfLogin(false);
  } else {
      alert("Credenciales incorrectas.");
  }
}

  function handleProfLogout() {
    setProfAuth(null);
    setMode("inicio");
  }

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/health`);
        console.log("Health:", r.status, "API:", API);
      } catch (e) {
        console.error("No alcanzo el backend:", API, e);
      }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room");
    if (urlRoom) {
      setRoomCode(urlRoom);
    }
  }, []);

  const initialFlow: FlowState = {
    step: "lobby",
    running: false,
    remaining: 5 * 60,
    roomCode: "",
    expectedTeams: 0,
    presentOrder: [],
    currentIdx: 0,
    pitchSeconds: 90,
    formation: "manual",
  };
  const isTeacher = mode === "prof";
  const { flow, setStep, startTimer, pauseTimer, resetTimer, publish, remoteTeams } = 
       useSharedFlow(isTeacher, initialFlow, joinedRoom);


useEffect(() => {
  if (flow.step === 'f5_podium') {
      setPodiumPhase('drumroll');
      playDrumroll(); 

      const t = setTimeout(() => {
          setPodiumPhase('reveal');
      }, 4000); 
      return () => clearTimeout(t);
  } else {
      setPodiumPhase('hidden');
  }
}, [flow.step]); 


  const activeRoom = flow.roomCode || joinedRoom || "";
  const forceNextPhase = React.useCallback(() => {
    setStep("f5_video");
    publish({ finishedPitch: true, currentIdx: null, running: false });
  }, [publish, setStep]);

  React.useEffect(() => {
    if (!flow.roomCode && joinedRoom) {
      setJoinedRoom("");
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("room");
        window.history.replaceState({}, "", url.toString());
      } catch {}
    }
  }, [flow.roomCode, joinedRoom]);
  // Arriba, junto con tus otros useState/useEffect del componente App:
  const [f0Tip, setF0Tip] = React.useState<string>("");
  const F0_DEFAULT_SEC = flow.f0Seconds ?? 3 * 60;


  // Cada vez que entras a f0_activity, elige un tip nuevo
  React.useEffect(() => {
    if (flow.step === "f0_activity") {
      const idx = Math.floor(Math.random() * F0_TIPS.length);
      setF0Tip(F0_TIPS[idx]);
    }
  }, [flow.step]); // <- importante: depende del step

  // === F4 helpers (definir dentro de App, debajo de resetTimer) ===
  const hardResetPitch = React.useCallback(() => {
    const seconds = flow.pitchSeconds ?? 90;
    resetTimer(seconds);
    publish({ running: false });
    setStep("f4_present", seconds);
  }, [flow.pitchSeconds, resetTimer, publish, setStep]);
  function availableTeams(): string[] {
    const segments = flow.wheel?.segments || [];
    const picked = flow.wheel?.picked || [];
    return segments.filter((t) => !picked.includes(t));
  }
  
  // Delegamos el giro a la ruleta para sincronización
// --- REEMPLAZAR LA FUNCIÓN spinWheel POR ESTA ---
function spinWheel() {
  const avail = availableTeams();
  if (avail.length === 0) return;

  // 1. Publicar estado GIRANDO a todos (Alumnos ven la animación)
publish({ wheel: { ...flow.wheel, girando: true, lastWinner: null } as any });
  // 2. Esperar 4.5 segundos (drama) y luego elegir ganador
  setTimeout(() => {
    const winner = avail[Math.floor(Math.random() * avail.length)];
    const nextRemaining = avail.filter((t) => t !== winner);
    const nextPicked = [...(flow.wheel?.picked || []), winner];

    // 3. Publicar GANADOR y detener giro
    publish({
      wheel: {
        segments: flow.wheel?.segments || [], // Mantener segmentos originales
        remaining: nextRemaining,
        picked: nextPicked,
        lastWinner: winner,
        girando: false, // Detener animación
      },
    });

    // Si ya no quedan equipos, definir el orden final automáticamente
    if (nextRemaining.length === 0) {
      publish({ presentOrder: nextPicked, currentIdx: 0 });
    }
  }, 4500);
}

  // Cambiar al siguiente equipo en presentaciones
  // ---- Cambiar al siguiente equipo ----
  const goNextTeam = React.useCallback(() => {
    const total = flow.presentOrder?.length || 0;
    if (total === 0) return;

    const nextIdx = (flow.currentIdx ?? 0) + 1;

    if (nextIdx >= total) {
      // Último equipo -> pasar a F5
      setStep("f5_podium"); // <- un solo dueño del cambio de fase
      publish({
        currentIdx: null,
        running: false,
        finishedPitch: true,
      });
    } else {
      // Siguiente equipo
      publish({
        currentIdx: nextIdx,
        running: false,
        // (NO seteamos step aquí)
      });
        resetTimer(flow.pitchSeconds || 90); 
        setStep("f4_present", flow.pitchSeconds); // <- step aquí, sin publicar currentIdx otra vez
    }
  }, [
    flow.presentOrder,
    flow.currentIdx,
    flow.pitchSeconds,
    publish,
    resetTimer,
    setStep,
  ]);

  // Arrancar juego desde LOBBY respetando Fase 0
  function startFirstPhaseFromLobby() {
    const sec = flow.f0Seconds ?? 3 * 60;
    if (flow.includeF0) {
      resetTimer(sec);
      publish({ running: false });
      setStep("f0_instr", sec);
    } else {
      setStep("f1_video");
    }
  }

  // Efecto para sonido de alarma
// --- CORRECCIÓN ALARMA TIMER ---
useEffect(() => {
  // Si el tiempo llega a 0 y NO hemos tocado la alarma aún
  if (flow.remaining === 0 && !lastPlayedZeroRef.current && flow.expectedTeams > 0) {
      if (isTeacher) {
          playAlarm(); // Sonido
      }
      // Notificación visual
      setShowTimeEndNotification(true);
      setTimeout(() => setShowTimeEndNotification(false), 4000);
      
      // Marcamos que ya sonó para este cero
      lastPlayedZeroRef.current = true;
  } 
  // Si el tiempo se resetea (es mayor a 1), reseteamos la marca
  else if (flow.remaining > 1) {
      lastPlayedZeroRef.current = false;
  }
}, [flow.remaining, isTeacher, flow.expectedTeams]);




const goPrevStep = React.useCallback(() => {
  const s = flow.step;

  if (s === "f5_podium") {
      publish({ currentIdx: (flow.presentOrder?.length || 1) - 1, running: false });
      setStep("f4_present");
      return;
  }
  if (s === "f4_rank") {
    publish({ currentIdx: null, running: false });
    setStep("f4_wheel");
    return;
  }
  if (s === "f4_present") {
    const idx = flow.currentIdx ?? 0;
    if (idx > 0) {
      publish({ currentIdx: idx - 1, running: false });
      resetTimer(flow.pitchSeconds || 90);
      setStep("f4_present", flow.pitchSeconds || 90);
      return;
    }
    publish({ currentIdx: null, running: false });
    setStep("f4_wheel");
    return;
  }

  const order: FlowStep[] = [
    "lobby",
    "f0_instr", "f0_activity",
    "f1_video", "f1_instr", "f1_activity", "f1_rank",
    "f2_video", "f2_instr", "f2_theme", "f2_instrucciones", "f2_activity", "f2_rank", 
    "f3_video", "f3_instr", "f3_activity", "f3_rank",
    "f4_video", "f4_instr", "f4_prep", "f4_wheel", "f4_present",
    "f5_podium", "f5_video",
    "pre_qr_reflex", "qr",
  ];

  const i = order.indexOf(s);
  
  if (i === 0 && s === "lobby") {
      resetSalaActual(false);
      setProfStartView("menu");
      return;
  }
  if (i > 0) {
    setStep(order[i - 1]);
  }
}, [flow.step, flow.currentIdx, flow.pitchSeconds, publish, resetTimer, setStep]);

  const storageTick = useStorageSignal(
    mode === "prof"
      ? [READY_KEY, COINS_KEY, FLOW_KEY, ANALYTICS_KEY, THEMES_KEY, ROSTER_KEY]
      : mode === "alumno"
      ? [COINS_KEY, FLOW_KEY, ANALYTICS_KEY, THEMES_KEY, ROSTER_KEY]
      : [FLOW_KEY, ANALYTICS_KEY, THEMES_KEY],
    800
  );
  useEffect(() => {
      getConfig().then(conf => {
          if (conf?.ruleta) {
             const mapped = conf.ruleta.map((r:any) => ({
                 id: String(r.id), label: r.label, desc: r.desc, 
                 delta: r.delta, type: r.type, weight: r.weight, color: r.color
             }));
             if(mapped.length) setRouletteConfig(mapped);
          }
      }).catch(() => console.log("Usando config por defecto"));

  }, []);


  const readyNow = useMemo(
    () => readyCount(activeRoom),
    [storageTick, activeRoom, flow.expectedTeams]
  );
  const readySet = readyTeamNames(activeRoom);

  const teamId =
    activeRoom && (groupName || "(sin-nombre)")
      ? `${activeRoom}::${(groupName || "").trim() || "sin-nombre"}`
      : "";
  // --- Sync desafío confirmado al entrar a f2_activity ---
  React.useEffect(() => {
    if (!flow || flow.step !== "f2_activity") return;

    const myTeamName = teamId?.split("::")[1] || "Equipo";
    const ch = getTeamChoice(activeRoom, myTeamName);

    if (ch && THEMES[ch.themeId as keyof typeof THEMES]) {
      if (temaSel !== ch.themeId) setTemaSel(ch.themeId as any);
      if (desafioIndex !== ch.desafioIndex) setDesafioIndex(ch.desafioIndex);
    }
  }, [flow?.step, activeRoom, teamId]);

  // === Pestañas de evaluación por equipo (alumno) ===
  const myTeam = teamId?.split("::")[1] || ""; // tu equipo actual (derivado de teamId)
  const allTeams = flow.presentOrder || []; // lista global del orden

  // Equipo actualmente visible en la pestaña
  const [currentTeam, setCurrentTeam] = React.useState<string>("");

  // Estado local por equipo: { [teamName]: { scores:number[6], sent:boolean } }
  const evalStorageKey = `udd_eval_${activeRoom}_${myTeam}`;
  const [localEval, setLocalEval] = React.useState<
    Record<string, { scores: number[]; sent: boolean }>
  >(() =>
    readJSON<Record<string, { scores: number[]; sent: boolean }>>(
      evalStorageKey,
      {}
    )
  );

  // Persistir cada cambio
  React.useEffect(() => {
    writeJSON(evalStorageKey, localEval);
  }, [localEval, evalStorageKey]);

  // Inicializar pestaña la primera vez (toma el primer equipo del orden, si existe; si es tu equipo, avanza al siguiente)
  React.useEffect(() => {
    if (currentTeam) return;
    if (!allTeams?.length) return;
    const first = allTeams[0] || "";
    setCurrentTeam(first === myTeam && allTeams[1] ? allTeams[1] : first);
  }, [currentTeam, allTeams, myTeam]);

  // Helpers para leer/escribir el estado del equipo visible
  const currentData = localEval[currentTeam] || {
    scores: [0, 0, 0, 0, 0, 0],
    sent: false,
  };

  const updateScores = (idx: number, value: number) => {
    setLocalEval((prev) => ({
      ...prev,
      [currentTeam]: {
        scores: (prev[currentTeam]?.scores || [0, 0, 0, 0, 0, 0]).map((x, i) =>
          i === idx ? value : x
        ),
        sent: !!prev[currentTeam]?.sent,
      },
    }));
  };

  const markSent = () => {
    setLocalEval((prev) => ({
      ...prev,
      [currentTeam]: {
        scores: prev[currentTeam]?.scores || [0, 0, 0, 0, 0, 0],
        sent: true,
      },
    }));
  };

  const analyticsApi = useAnalytics();
  const { analytics, update } = analyticsApi;

  // --- Inicializar ruleta cuando cambian los equipos ---
  const wheelTeamsKey = React.useMemo(
    () => JSON.stringify(getTeamsForRoom(analytics, activeRoom)),
    [analytics, activeRoom]
  );

  React.useEffect(() => {
    const teams = getTeamsForRoom(analytics, activeRoom);
    const w = flow.wheel;

    const needsInit =
      !w ||
      !Array.isArray(w.segments) ||
      w.segments.length !== teams.length ||
      w.segments.some((t, i) => t !== teams[i]);

    if (needsInit) {
        publish({ wheel: { ...flow.wheel, girando: true, lastWinner: null } as any });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheelTeamsKey, publish, flow.wheel]);
// --- SMART RESET (Reinicia el timer según la configuración del Admin) ---
const handleSmartReset = () => {
  let seconds = 300; // Valor por defecto de seguridad

  switch (flow.step) {
      case "f0_instr": 
      case "f0_activity": 
          seconds = flow.f0Seconds || 180; 
          break;
      case "f1_instr": 
      case "f1_activity": 
          seconds = flow.f1Seconds || 300; 
          break;
      case "f2_instrucciones": 
      case "f2_activity": 
          seconds = flow.f2Seconds || 300; 
          break;
      case "f3_instr": 
      case "f3_activity": 
          seconds = flow.f3Seconds || 900; 
          break;
      case "f4_instr": 
      case "f4_prep": 
          seconds = flow.f4PrepSeconds || 600; 
          break;
      case "f4_present": 
          seconds = flow.pitchSeconds || 90; 
          break;
      default:
          console.warn("Fase sin tiempo configurado, usando default");
  }
  
  resetTimer(seconds);
};
  // --- Estado del equipo seleccionado ---
  const teamIdx = analytics.teams.findIndex(
    (t) => t.roomCode === activeRoom && t.teamName === groupName
  );
  const currentMembers =
    teamIdx >= 0 ? analytics.teams[teamIdx].integrantes || [] : [];
  const [myTeamId, setMyTeamId] = useState<number | null>(null);
  const teamFull = currentMembers.length >= MAX_PER_GROUP;
  const alreadyIn =
    (miNombre || "").trim() &&
    currentMembers.some(
      (p) => p.nombre.trim().toLowerCase() === miNombre.trim().toLowerCase()
    );

  const markReady = () => {
    const set = new Set<string>(readJSON<string[]>(READY_KEY, []));
    if (teamId) set.add(teamId);
    const arr = Array.from(set);
    writeJSON(READY_KEY, arr);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: READY_KEY,
          newValue: JSON.stringify(arr),
        })
      );
    } catch {}
    if (teamId) {
      const teamName = teamId.split("::")[1] || "Equipo";
      update((a) => ({
        ...a,
        teams: [
          ...a.teams,
          {
            roomCode: activeRoom,
            teamName,
            integrantes: integrantes.length
              ? integrantes
              : [
                  {
                    nombre: miNombre || "Integrante",
                    carrera: miCarrera || "—",
                  },
                ],
            ts: Date.now(),
          },
        ],
      }));
    }
    setTeamReady(true);
  };
  function readyCount(roomCode: string) {
    const set = new Set<string>(readJSON<string[]>(READY_KEY, []));
    return Array.from(set).filter((id) => id.startsWith(`${roomCode}::`))
      .length;
  }

  const clearReadyForRoom = () => {
    const arr = readJSON<string[]>(READY_KEY, []);
    const filtered = arr.filter((id) => !id.startsWith(`${activeRoom}::`));
    writeJSON(READY_KEY, filtered);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: READY_KEY,
          newValue: JSON.stringify(filtered),
        })
      );
    } catch {}
  };
  function teamsForCurrentRoom(analytics: Analytics, roomCode: string) {
    return analytics.teams
      .filter((t) => t.roomCode === roomCode)
      .map((t) => t.teamName)
      .filter(Boolean);
  }
  function getTeamsForRoom(analytics: Analytics, roomCode: string): string[] {
    return teamsForCurrentRoom(analytics, roomCode);
  }

  function readyTeamNames(roomCode: string) {
    const arr = readJSON<string[]>(READY_KEY, []);
    return new Set(
      arr
        .filter((id) => id.startsWith(`${roomCode}::`))
        .map((id) => id.split("::")[1] || "")
    );
  }

  useEffect(() => {
    if (!teamId || mode !== "alumno" || !teamReady) return;
    const map = readJSON<Record<string, number>>(COINS_KEY, {});
    map[teamId] = coins;
    writeJSON(COINS_KEY, map);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: COINS_KEY,
          newValue: JSON.stringify(map),
        })
      );
    } catch {}
  }, [coins, teamId, mode, teamReady]);

  const ranking = useMemo(() => {
    const source = remoteTeams || [];
    
    const pairs = source.map((t: any) => ({
        equipo: t.nombre,
        total: t.puntos || 0 
    }));

    return pairs.sort((a: any, b: any) => b.total - a.total);
  }, [remoteTeams]);

  type Diff = {
    x: number;
    y: number;
    r: number;
    zone: number;
    found?: boolean;
  };
  const [diffs, setDiffs] = useState<Diff[]>([
    { x: 0.2, y: 0.25, r: 0.05, zone: 0 },
    { x: 0.35, y: 0.7, r: 0.05, zone: 1 },
    { x: 0.68, y: 0.35, r: 0.05, zone: 2 },
    { x: 0.8, y: 0.7, r: 0.05, zone: 3 },
  ]);
  const [hintsLeft, setHintsLeft] = useState(2);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const clickSpot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotRef.current || !flow.running) return;
    const rect = spotRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width;
    const cy = (e.clientY - rect.top) / rect.height;
    setDiffs((arr) =>
      arr.map((d) => {
        if (d.found) return d;
        const dx = d.x - cx,
          dy = d.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < d.r) {
          setCoins((c) => c + 1);
          
          return { ...d, found: true };
        }
        return d;
      })
    );
  };
  const useHint = () => {
    if (hintsLeft <= 0 || !spotRef.current) return;
    const hidden = diffs.find((d) => !d.found);
    if (!hidden) return;
    setHintsLeft((h) => h - 1);
    setCoins((c) => Math.max(0, c - 1));
    const tip = document.createElement("div");
    Object.assign(tip.style, {
      position: "absolute",
      left: `${hidden.x * 100}%`,
      top: `${hidden.y * 100}%`,
      transform: "translate(-50%,-50%)",
      width: `${hidden.r * 150}px`,
      height: `${hidden.r * 150}px`,
      border: `3px dashed ${theme.amarillo}`,
      borderRadius: "50%",
      pointerEvents: "none",
    } as CSSStyleDeclaration);
    spotRef.current.appendChild(tip);
    setTimeout(() => tip.remove(), 1200);
  };

  const size = 5;
  const makeGrid = () =>
    Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false)
    );
  const [goal] = useState<boolean[][]>(() => {
    const g = makeGrid();
    [
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 4],
      [3, 1],
      [3, 2],
      [3, 3],
      [4, 2],
    ].forEach(([r, c]) => (g[r][c] = true));
    return g;
  });
  const [grid, setGrid] = useState<boolean[][]>(() => makeGrid());
  const [scored, setScored] = useState<boolean[][]>(() => makeGrid());
  const toggleCell = (r: number, c: number) => {
    if (!flow.running) return;
    setGrid((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = !next[r][c];
      if (next[r][c] === goal[r][c] && !scored[r][c]) {
        setCoins((cn) => cn + 1);
        setScored((sc) => {
          const cp = sc.map((row) => row.slice());
          cp[r][c] = true;
          return cp;
        });
      }
      return next;
    });
  };

  const EMPATIA_FIELDS = [
    { key: "perfil", label: "Perfil" },
    { key: "entorno", label: "Entorno" },
    { key: "emociones", label: "Emociones" },
    { key: "necesidades", label: "Necesidades" },
    { key: "limitaciones", label: "Limitaciones" },
    { key: "motivaciones", label: "Motivaciones" },
  ] as const;
  type EmpKey = (typeof EMPATIA_FIELDS)[number]["key"];
  const [empatia, setEmpatia] = useState<Record<EmpKey, string>>({
    perfil: "",
    entorno: "",
    emociones: "",
    necesidades: "",
    limitaciones: "",
    motivaciones: "",
  });
  const [activeBubble, setActiveBubble] = useState<EmpKey>("perfil");
// src/App.tsx

const onEmpatiaChange = (k: EmpKey, v: string) => {
  setEmpatia((prev) => {
    const wasEmpty = !prev[k]?.trim();
    const next = { ...prev, [k]: v };
    
    if (myTeamId) {
        updateTeamData(myTeamId, { mapaEmpatia: JSON.stringify(next) });
    }

    if (wasEmpty && next[k].trim()) {
        setCoins((c) => c + 1); 
        if (myTeamId) updateTeamScore(myTeamId, 1); 
    }
    return next;
  });
};
  const CHECKLIST_KEY = "udd_checklist_config_v1";
  const DEFAULT_CHECKLIST = [
      { id: "montado", label: "Prototipo montado y estable", isFixed: true, value: 3 },
      { id: "foto", label: "Foto clara subida (Automático)", isFixed: true, value: 3 }
  ];
  const DEFAULT_ROULETTE = [
    { id: "1", label: "+5 Tokens", desc: "¡Recompensa inmediata! Sumas +5 Tokens.", delta: 5, type: 'ventaja', weight: 15, color: "#4CAF50", hasTokenEffect: true, tokenAmount: 5 },
    { id: "2", label: "-3 Tokens", desc: "Mala suerte: pierdes 3 Tokens.", delta: -3, type: 'desventaja', weight: 15, color: "#F44336", hasTokenEffect: true, tokenAmount: 3 },
    { id: "3", label: "Espía", desc: "Tienes 2 minutos para visitar a otro equipo.", delta: 0, type: 'neutral', weight: 10, color: "#9C27B0", hasTokenEffect: false },
    { id: "4", label: "Bloqueo", desc: "Usa solo 3 colores de LEGO.", delta: 0, type: 'neutral', weight: 10, color: "#FF9800", hasTokenEffect: false }, // FF9800 forzado manual si quieres naranja, sino usa logica
    { id: "5", label: "Comodín", desc: "Pide ayuda al profesor.", delta: 2, type: 'ventaja', weight: 15, color: "#00BCD4", hasTokenEffect: true, tokenAmount: 2 },
    { id: "6", label: "Reglas Extra", desc: "Incluye una figura animal.", delta: -2, type: 'desventaja', weight: 15, color: "#E91E63", hasTokenEffect: true, tokenAmount: 2 },
    { id: "7", label: "Reafirmar", desc: "Revisa tu Bubble Map.", delta: 0, type: 'neutral', weight: 10, color: "#9E007E", hasTokenEffect: false },
    { id: "8", label: "Ayuda Ext.", desc: "El profesor te da un prompt.", delta: 3, type: 'ventaja', weight: 10, color: "#4CAF50", hasTokenEffect: true, tokenAmount: 3 }
];
const ROULETTE_KEY = "udd_roulette_config_v1";

const defaultTHEMES: any = {
  salud: {
    label: "Salud",
    desafios: [
      {
        titulo: "Autogestión de tratamientos",
        descripcion: "Muchos errores médicos y complicaciones surgen al cambiar de un centro de salud a otro, por falta de continuidad y seguimiento personalizado. Don Humberto de 50 años, fue dado de alta con indicaciones médicas complejas, pero no entendió qué debía seguir tomando ni a quién acudir si se sentía mal.",
        img: ""
      },
      {
        titulo: "Obesidad",
        descripcion: "Más de un 70% de la población en Chile presenta sobrepeso u obesidad (MINSAL). Esta situación se debe múltiples factores, entre ellos la falta de ejercicio y educación nutricional, disponibilidad de productos ultraprocesados y la desinformación. Simona tiene 27 años, una hija pequeña y trabaja tiempo completo. Sabe que la alimentación es clave, pero no ha podido organizar ni aprender a darle una nutrición buena a su hija.",
        img: ""
      },
      {
        titulo: "Envejecimiento activo",
        descripcion: "La población chilena está envejeciendo rápidamente y muchos adultos mayores enfrentan soledad, pérdida de movilidad y falta de programas de prevención. Juana, de 72 años, vive sola desde que sus hijos se independizaron. Le gustaría mantenerse activa, pero no conoce programas accesibles que la motiven a hacer ejercicio, socializar y prevenir enfermedades.",
        img: ""
      },
    ],
  },
  educacion: {
    label: "Educación",
    desafios: [
      {
        titulo: "Educación financiera accesible",
        descripcion: "La ausencia de educación financiera en realidades económicas inestables dificulta la planificación y el uso responsable del dinero. Martina, joven emprendedora de 22 años, vende productos por redes sociales. Aunque gana dinero, no sabe cómo organizarlo ni cuánto debe ahorrar o invertir, lo que lo mantiene en constante inestabilidad.",
        img: ""
      },
      {
        titulo: "Inicio de vida laboral",
        descripcion: "Muchos estudiantes recién titulados enfrentan barreras para conseguir su primer empleo, ya que se les exige experiencia previa que aún no han podido adquirir. Andrés, de 23 años, acaba de egresar de odontología. Le preocupa no poder trabajar pronto, pero ninguna clínica lo ha llamado porque no tiene experiencia previa.",
        img: ""
      },
      {
        titulo: "Tecnología adultos mayores",
        descripcion: "El avance tecnológico en los últimos años ha sido incremental. Esto ha beneficiado a múltiples sectores, sin embargo el conocimiento y adaptación para los adultos mayores ha sido una gran dificultad. Osvaldo es un adulto mayor de 70 años y debe pedir ayuda a sus hijos o nietos cada vez que debe hacer tramites.",
        img: ""
      },
    ],
  },
  sustentabilidad: {
    label: "Sustentabilidad",
    desafios: [
      {
        titulo: "Contaminación por fast fashion",
        descripcion: "La moda rápida ha traído graves consecuencias al medio ambiente. Especialmente en sectores del norte de Chile en donde los vertederos y basurales están afectando el diario vivir de las personas. Gabriela es una estudiante de 18 años que vive cerca de esta zona y debe pasar a diario por lugares con desagradables olores.",
        img: ""
      },
      {
        titulo: "Acceso al agua en la agricultura",
        descripcion: "El agua dulce es un recurso natural fundamental para la vida. Hay zonas rurales en que el agua se ha hecho escasa. Camila es una agricultora de 50 años que cultiva paltas de exportación, ella está complicada de perder su negocio por la cantidad de agua que debe utilizar.",
        img: ""
      },
      {
        titulo: "Gestión de residuos electrónicos",
        descripcion: "El aumento del consumo tecnológico ha generado toneladas de desechos electrónicos difíciles de reciclar. Francisco, de 29 años, cambió su celular y computador el año pasado, pero no sabe dónde llevar los antiguos dispositivos. Terminó guardándolos en un cajón, como millones de personas que desconocen alternativas de reciclaje.",
        img: ""
      },
    ],
  },
};

  const [THEMES, setTHEMES] = useState<ThemeConfig>(() =>
    readJSON<ThemeConfig>(THEMES_KEY, defaultTHEMES)
  );
  const saveTHEMES = (next: ThemeConfig) => {
    setTHEMES(next);
    writeJSON(THEMES_KEY, next);
    saveThemesConfig(next);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: THEMES_KEY,
          newValue: JSON.stringify(next),
        })
      );
    } catch {}
  };
  const [temaSel, setTemaSel] = useState<ThemeId>("salud");
  const [desafioIndex, setDesafioIndex] = useState(0);
  const desafioActual = THEMES[temaSel].desafios[desafioIndex];
// web/src/App.tsx

useEffect(() => {
    const loadConfig = async () => {
        try {
            const conf = await getConfig();
            if (conf) {
                // 1. Cargar Temas (Mapeo de DB -> Formato App)
                if (conf.temas && conf.temas.length > 0) {
                    const mappedThemes: any = {};
                    conf.temas.forEach((t: any) => {
                        mappedThemes[t.id] = {
                            label: t.label,
                            persona: {
                                nombre: t.personaNombre || "Persona",
                                edad: 0,
                                bio: t.personaBio || "",
                                img: t.personaImg || ""
                            },
                            desafios: t.desafios.map((d: any) => ({
                                titulo: d.titulo,
                                descripcion: d.descripcion,
                                img: d.imgUrl
                            }))
                        };
                    });
                    setTHEMES(mappedThemes);
                }
                
                // 2. Cargar Ruleta
                if (conf.ruleta && conf.ruleta.length > 0) {
                     const mappedRoulette = conf.ruleta.map((r:any) => ({
                         id: String(r.id), 
                         label: r.label, 
                         desc: r.desc || "", // Nota: tu backend envía 'desc' mapeado en routes/admin.ts
                         delta: r.delta, 
                         type: r.type, 
                         weight: r.weight, 
                         color: r.color
                     }));
                     setRouletteConfig(mappedRoulette);
                }

                // 3. Cargar Checklist
                if (conf.checklist && conf.checklist.length > 0) {
                    const mappedChecklist = conf.checklist.map((c: any) => ({
                        id: String(c.id), // Convertir ID numérico a string para el frontend
                        label: c.label,
                        value: c.valor,   // Backend usa 'valor', Frontend usa 'value'
                        isFixed: c.esFijo
                    }));
                    setChecklistConfig(mappedChecklist);
                }
            }
        } catch (e) { console.error("Usando config por defecto (offline/error)"); }
    };
    loadConfig();
}, []);


// --- DEFINICIONES DE TAMAÑO PARA BUBBLE MAP ---
const bubbleSize = isMobile ? 84 : isTablet ? 96 : 108;
const centerBubbleSize = isMobile ? 115 : isTablet ? 128 : 138;

// --- POSICIONES CORREGIDAS (MÁS SEPARADAS) ---
const bubblePositions = useMemo(() => ({
  perfil:       { left: "2%", top: "5%" },
  limitaciones: { left: "32%", top: "2%" },
  motivaciones: { right: "32%", top: "2%" },
  entorno:      { right: "2%", top: "5%" },
  emociones:    { left: "5%", bottom: "5%" },
  necesidades:  { right: "5%", bottom: "5%" },
}), []);

const bubbleHelpers: Record<string, string> = {
  perfil: "¿Quién es? (Edad, oficio, rol)",
  entorno: "¿Dónde está? ¿Qué ve/oye?",
  emociones: "¿Qué siente? (Miedos, alegrías)",
  necesidades: "¿Qué necesita urgentemente?",
  limitaciones: "¿Qué le frustra o detiene?",
  motivaciones: "¿Qué le impulsa a actuar?",
};
  React.useEffect(() => {
    if (flow.step === "f4_present") {
      setSent(false); // reset envío
      setScores([0, 0, 0, 0, 0, 0]); // reset sliders
      setShowPhoto(false); // cerrar foto del grupo anterior
    }
  }, [flow.step, flow.currentIdx, activeRoom]);

  // === CONTADOR: uso de desafíos por selección del ALUMNO ===
  const incrementChallengeUsage = React.useCallback(
    (themeId: keyof typeof THEMES, idx: number) => {
      try {
        // 1) guarda en tus métricas (analytics.challengeUsage)
        update((a: any) => {
          const key = `${String(themeId)}#${Number(idx)}`;
          const next = { ...(a.challengeUsage || {}) };
          next[key] = (next[key] || 0) + 1;
          return { ...a, challengeUsage: next };
        });
      } catch (e) {
        // 2) fallback: deja evidencia mínima para el panel de Analítica
        try {
          const raw = localStorage.getItem("ANALYTICS_KEY");
          const arr = raw ? JSON.parse(raw) : [];
          const ts = Date.now();
          arr.push({
            ts,
            type: "activity_start",
            phase: "f2",
            activity: `${String(themeId)}:${Number(idx)}`,
          });
          arr.push({
            ts,
            type: "activity_end",
            phase: "f2",
            activity: `${String(themeId)}:${Number(idx)}`,
            durationMs: 5 * 60 * 1000,
          });
          localStorage.setItem("ANALYTICS_KEY", JSON.stringify(arr));
        } catch {}
      }
    },
    [update]
  );

  const VideoSpace: React.FC<{ title: string }> = ({ title }) => (
    <Card
      title={`Por qué es importante: ${title}`}
      subtitle="(Video corto explicativo)"
      width={900}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          background: theme.gris,
          borderRadius: 16,
          border: `2px dashed ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#90A4AE",
          fontWeight: 700,
          pointerEvents: "none",
        }}
      >
        Video aquí
      </div>
    </Card>
  );
  // NUEVO — reemplaza Instructions por GuidePanel
  const RoleTag: React.FC<{ label: "Alumno" | "Profesor" }> = ({ label }) => (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: label === "Alumno" ? "#E3F2FD" : "#FFF3E0",
        color: label === "Alumno" ? "#0D47A1" : "#6D4C41",
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: 0.2,
        border: "1px solid #e5e7eb",
      }}
    >
      {label}
    </span>
  );

  const StepRow: React.FC<{ n: number; text: string }> = ({ n, text }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr",
        gap: 10,
        alignItems: "start",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: "#EEF2F6",
          color: "#111827",
          fontWeight: 900,
          display: "grid",
          placeItems: "center",
          border: "1px solid #E5E7EB",
        }}
      >
        {n}
      </div>
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );

  const MiniKPI: React.FC<{ label: string; value: string }> = ({
    label,
    value,
  }) => (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "10px 12px",
        background: "#fff",
        display: "grid",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ fontWeight: 900, color: theme.azul }}>{value}</div>
    </div>
  );

  const GuidePanel = ({
    phaseTitle,
    alumno = [],
    profesor = [],
    objetivo,
    tiempo,
    showProfesor = true, // ✅ NUEVA PROP OPCIONAL
  }: {
    phaseTitle: string;
    alumno?: string[];
    profesor?: string[];
    objetivo?: string;
    tiempo?: string;
    showProfesor?: boolean; // ✅ NUEVA PROP OPCIONAL
  }) => {
    return (
      <Card title="Instrucciones" subtitle={phaseTitle} width={1100}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: showProfesor ? "1fr 1fr" : "1fr", // ✅ si no se muestra profesor → 1 sola columna
            gap: 12,
          }}
        >
          {/* --- COLUMNA IZQUIERDA (alumno) --- */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              padding: 16,
            }}
          >
            <h4 style={{ color: "#0D6EFD", marginBottom: 10 }}>
              Pasos para el equipo
            </h4>
            {alumno.map((t, i) => (
              <div key={i} style={{ display: "flex", marginBottom: 6 }}>
                <div
                  style={{
                    background: "#EAF3FF",
                    color: "#0D6EFD",
                    fontWeight: "bold",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  {i + 1}
                </div>
                <div dangerouslySetInnerHTML={{ __html: t }} />
              </div>
            ))}
          </div>

          {/* --- COLUMNA DERECHA (profesor) --- */}
          {showProfesor && (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                padding: 16,
              }}
            >
              <h4 style={{ color: "#9E007E", marginBottom: 10 }}>
                Guía del profesor
              </h4>
              {profesor.map((t, i) => (
                <div key={i} style={{ display: "flex", marginBottom: 6 }}>
                  <div
                    style={{
                      background: "#F9E7F3",
                      color: "#9E007E",
                      fontWeight: "bold",
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: t }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- OBJETIVO Y TIEMPO --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 18,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              textAlign: "center",
              padding: 8,
              fontWeight: "bold",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Objetivo</div>
            {objetivo}
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              textAlign: "center",
              padding: 8,
              fontWeight: "bold",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Tiempo máximo</div>
            {tiempo}
          </div>
        </div>
      </Card>
    );
  };
// Configuración Ruleta
const [rouletteConfig, setRouletteConfig] = useState<any[]>(() => readJSON(ROULETTE_KEY, DEFAULT_ROULETTE));

const saveRouletteConfig = (items: any[]) => {
    setRouletteConfig(items);
    writeJSON(ROULETTE_KEY, items); 
    saveRouletteConfigDB(items);    
};

const BigTimer: React.FC<{ label?: string; defaultSec?: number }> = ({ label }) => (
  <div style={{ ...panelBox, textAlign: "center", padding: 30 }}>
    {label && (
      <div style={{ fontWeight: 900, color: theme.azul, marginBottom: 8, fontSize: 14, textTransform:'uppercase', letterSpacing:1 }}>
        {label}
      </div>
    )}
    <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: -2, marginBottom: 20, color: '#333' }}>
      {mmss(flow.remaining)}
    </div>
    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <Btn onClick={() => startTimer()} label="▶ Iniciar" full={false} />
      <Btn onClick={() => pauseTimer()} label="⏸ Pausa" full={false} />
      <Btn 
          onClick={handleSmartReset} 
          label="⟲ Reset" 
          full={false} 
          variant="outline" 
      />
    </div>
  </div>
);

function handleCreateRoom() {
  (async () => {
    if (!profAuth) {
      setShowProfLogin(true);
      return;
    }
    const host = (miNombre || "").trim() || "Host";
    
    writeJSON(READY_KEY, []);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: READY_KEY,
          newValue: JSON.stringify([]),
        })
      );
    } catch {}
    writeJSON(COINS_KEY, {});
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: COINS_KEY,
          newValue: JSON.stringify({}),
        })
      );
    } catch {}

    let code = "";
    try {
      const r = await fetch(`${API}/health`, { method: "GET" });
      if (r.ok) {
        const res = await createRoom(
          { hostName: host },
          profAuth || undefined
        );
        code = res.roomCode;
      } else {
        code = generateCode(5);
      }
    } catch {
      code = generateCode(5);
    }

    const newSession = {
        roomCode: code,
        profId: profAuth.id || "unknown",
        profName: profAuth.name || profAuth.user, 
        timestamp: Date.now()
    };
    
    // Leemos el historial actual y agregamos la nueva sesión
    const sessions = readJSON("udd_sessions_log_v1", []);
    writeJSON("udd_sessions_log_v1", [...sessions, newSession]);
    // ----------------------------------------------------

    const expected = recommendedGroups.length
      ? Math.max(MIN_GROUPS, Math.min(recommendedGroups.length, MAX_GROUPS))
      : equiposQty;

    publish({
      roomCode: code,
      expectedTeams: expected,
      step: "lobby",
      remaining: 5 * 60,
      running: false,
      formation: "manual",
    });

    setRoomCode(code);
    setJoinedRoom(code);
    const url = new URL(window.location.href);
    url.searchParams.set("room", code);
    window.history.replaceState({}, "", url.toString());
    update((a) => ({ ...a, roomsCreated: a.roomsCreated + 1 }));
  })();
}

  function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const wb = XLSX.read(data, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const parsed = rows.map((r) => ({
        nombre: r.Nombre || r.name || "",
        carrera: r.Carrera || r.career || "",
      }));

      // guarda roster global
      setRoster(parsed);
      writeJSON(ROSTER_KEY, parsed);
      try {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: ROSTER_KEY,
            newValue: JSON.stringify(parsed),
          })
        );
      } catch {}

      generarGrupos(parsed); // si también quieres sugerencias automáticas
    };
    reader.readAsBinaryString(file);
  }

  function generarGrupos(lista: { nombre: string; carrera: string }[]) {
    if (!lista.length) return;

    const n = lista.length;
    const needed = Math.ceil(n / MAX_PER_GROUP);

    let gruposCount = Math.max(MIN_GROUPS, Math.min(MAX_GROUPS, needed));

    // Caso límite 37–45 alumnos: permitir 5 grupos
    if (needed > MAX_GROUPS && needed <= HARD_MAX_GROUPS) {
      gruposCount = HARD_MAX_GROUPS;
    }

    // Si excede lo tolerable: sugerir dos sesiones
    if (needed > HARD_MAX_GROUPS) {
      const gruposReales = Math.ceil(n / MAX_PER_GROUP);
      const sesionesSugeridas = Math.ceil(gruposReales / MAX_GROUPS);
      alert(
        `Hay ${n} alumnos. Esto supera el límite práctico (máx. 4–5 grupos de hasta 9 cada uno).
  Sugerencia: divide en ${sesionesSugeridas} sesión(es) y crea 2 códigos de sala si es necesario.`
      );
      gruposCount = MAX_GROUPS; // genera una propuesta parcial igualmente
    }

    const shuffled = [...lista].sort(() => Math.random() - 0.5);

    // repartir balanceado
    const grupos: {
      nombre: string;
      integrantes: { nombre: string; carrera: string }[];
    }[] = Array.from({ length: gruposCount }, (_, i) => ({
      nombre: `Grupo ${i + 1}`,
      integrantes: [],
    }));

    for (let i = 0; i < shuffled.length; i++) {
      const idx = i % gruposCount;
      if (grupos[idx].integrantes.length < MAX_PER_GROUP) {
        grupos[idx].integrantes.push(shuffled[i]);
      } else {
        // si ese grupo llegó a 9, busca el siguiente con espacio
        const target = grupos.find((g) => g.integrantes.length < MAX_PER_GROUP);
        (target || grupos[idx]).integrantes.push(shuffled[i]);
      }
    }

    setRecommendedGroups(grupos);
  }

  function downloadRecommended(filename = "grupos_sugeridos.json") {
    if (!recommendedGroups.length) {
      alert("No hay grupos sugeridos todavía.");
      return;
    }
    const blob = new Blob([JSON.stringify(recommendedGroups, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function aplicarGruposSugeridos() {
    const code = flow.roomCode || activeRoom;
    if (!code) {
      alert("Primero crea una sala.");
      return;
    }
    if (!recommendedGroups.length) {
      alert("No hay grupos sugeridos para aplicar.");
      return;
    }

    // 1. VERIFICACIÓN DE SEGURIDAD (Anti-Carrera)
    const equiposActuales = teamsForCurrentRoom(analytics, code);
    
    if (equiposActuales.length > 0) {
        const confirmar = window.confirm(
            `⚠️ ¡ADVERTENCIA DE SOBRESCRITURA!\n\nYa se han detectado ${equiposActuales.length} equipos en esta sala (probablemente creados manualmente por alumnos).\n\nSi continúas, se BORRARÁN esos equipos y se impondrán los grupos sugeridos del Excel.\n\n¿Estás seguro de eliminar lo existente y aplicar los sugeridos?`
        );
        if (!confirmar) return; // Cancelar si el profe se arrepiente
    }

    // 2. PURGA Y SOBRESCRITURA EN LA "BASE DE DATOS"
    update((a) => {
      // a) Borramos TODOS los equipos que pertenezcan a esta sala actual
      const otrosEquipos = a.teams.filter((t) => t.roomCode !== code);
      
      // b) Insertamos los nuevos desde la sugerencia
      const nuevos = recommendedGroups.map((g) => ({
        roomCode: code,
        teamName: g.nombre,
        integrantes: g.integrantes || [],
        ts: Date.now(),
      }));
      
      return { ...a, teams: [...otrosEquipos, ...nuevos] };
    });

    // 3. RESETEAR ESTADO "LISTO" (Esto "patea" a los alumnos que ya habían entrado)
    const prevReady = readJSON<string[]>(READY_KEY, []);
    const filteredReady = prevReady.filter((id) => !id.startsWith(`${code}::`));
    writeJSON(READY_KEY, filteredReady);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: READY_KEY,
          newValue: JSON.stringify(filteredReady),
        })
      );
    } catch {}

    // 4. ACTUALIZAR CONFIGURACIÓN DE LA SALA
    const clamped = Math.max(
      MIN_GROUPS,
      Math.min(recommendedGroups.length, MAX_GROUPS)
    );
    publish({
      expectedTeams: clamped,
      formation: "auto", // Forzamos que la sala pase a modo Automático
    });

    alert(
      "✅ Grupos aplicados correctamente. Se han eliminado los equipos manuales anteriores."
    );
  }

  function resetSalaActual(keepCode: boolean = true) {
    const code = flow.roomCode;
    if (!code) {
      if(!keepCode) {
          setJoinedRoom("");
          setMode("inicio");
      }
      return;
    }
    const prevReady = readJSON<string[]>(READY_KEY, []);
    const newReady = prevReady.filter((id) => !id.startsWith(`${code}::`));
    writeJSON(READY_KEY, newReady);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: READY_KEY,
          newValue: JSON.stringify(newReady),
        })
      );
    } catch {}
    const prevCoins = readJSON<Record<string, number>>(COINS_KEY, {});
    const newCoins: Record<string, number> = {};
    for (const [k, v] of Object.entries(prevCoins)) {
      if (!k.startsWith(`${code}::`)) newCoins[k] = v;
    }
    writeJSON(COINS_KEY, newCoins);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: COINS_KEY,
          newValue: JSON.stringify(newCoins),
        })
      );
    } catch {}
    update((a) => {
      return {
        ...a,
        teams: a.teams.filter((t) => t.roomCode !== code),
        reflections: a.reflections.filter((r) => r.roomCode !== code),
        feedbacks: a.feedbacks.filter((f) => f.roomCode !== code),
      };
    });
    if (keepCode) {
      publish({
        step: "lobby",
        running: false,
        remaining: 5 * 60,
        expectedTeams: 0,
        presentOrder: [],
        currentIdx: 0,
        pitchSeconds: flow.pitchSeconds,
      });
    } else {
      publish({
        roomCode: "",
        step: "lobby",
        running: false,
        remaining: 5 * 60,
        expectedTeams: 0,
        presentOrder: [],
        currentIdx: 0,
        pitchSeconds: flow.pitchSeconds,
      });
      setJoinedRoom("");
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      window.history.replaceState({}, "", url.toString());
      setMode("inicio");
    }
    if(!keepCode) {
        alert("Sala cerrada. Vuelve a crear una nueva.");
    } else {
        alert("Sala reiniciada (se mantiene el código).");
    }
  }

// web/src/App.tsx

async function handleJoinRoom() {
  const code = (roomCode || "").trim().toUpperCase();
  if (!code) {
    alert("Ingresa el código de sala");
    return;
  }
  // SOLO verificamos si la sala existe consultando su estado
  const state = await getRoomState(code);
  
  if (state && state.roomCode) {
    publish({ roomCode: code });
    setJoinedRoom(code);
    // Actualizamos la URL sin recargar
    const url = new URL(window.location.href);
    url.searchParams.set("room", code);
    window.history.replaceState({}, "", url.toString());
  } else {
    alert("Sala no encontrada o error de conexión.");
  }
}
  const [flowState, setFlowState] = useState<FlowState>(ESTADO_INICIAL);

useEffect(() => {
    if (flow.step === 'f5_podium') {
        // Iniciamos redoble
        setPodiumPhase('drumroll');
        
        // Solo el profesor dispara el audio (para no saturar)
        if (mode === 'prof') {
             playDrumroll();
        }

        // Esperamos 4 segundos (duración del redoble) para mostrar ganador
        const t = setTimeout(() => {
            setPodiumPhase('reveal');
        }, 4000);
        
        return () => clearTimeout(t);
    } else {
        // Si salimos de la fase, reseteamos
        setPodiumPhase('hidden');
    }
  }, [flow.step, mode]); // <--- Agregamos 'mode' para asegurar consistencia
  function handleEndGameRedirects() {
    // 1) Publicar flow "cerrado" + volver step al lobby
    publish({
      roomCode: "",
      expectedTeams: 0,
      step: "lobby",
      running: false,
      presentOrder: [],
      currentIdx: 0,
      finishedPitch: false,
    });

    // 2) Limpiar estado local y URL (aplica a cualquier cliente)
    setJoinedRoom("");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      window.history.replaceState({}, "", url.toString());
    } catch {}


    setMode("inicio");
  }
// Configuración Checklist
const [checklistConfig, setChecklistConfig] = useState<any[]>(() => readJSON(CHECKLIST_KEY, DEFAULT_CHECKLIST));
const saveChecklistConfig = (items: any[]) => {
    setChecklistConfig(items);
    writeJSON(CHECKLIST_KEY, items);
    saveChecklistConfigDB(items); 
};
  const F0_TIPS = [
    "tu hobby o pasatiempo",
    "tu superpoder para el equipo hoy",
    "la app que más usas",
    "tu comida o bebida favorita",
    "tu emoji del día",
    "una canción que te suba el ánimo",
    "algo que te gustaría aprender",
    "un emprendimiento que admires",
    "una meta personal para este semestre",
  ];

  function useRandomF0Tip() {
    const [tip, setTip] = React.useState<string>("");
    React.useEffect(() => {
      const idx = Math.floor(Math.random() * F0_TIPS.length);
      setTip(F0_TIPS[idx]);
    }, []);
    return tip;
  }

useEffect(() => {
    if (mode === "alumno" && activeRoom && groupName) { 
        
        const equiposValidos = getTeamsForRoom(analytics, activeRoom);
        const miGrupoExiste = equiposValidos.includes(groupName);

        if (!miGrupoExiste) {
            setGroupName("");    
            setTeamReady(false); // Ya no están listos
            setMiNombre("");     
            setMiCarrera("");
            
            if (teamReady) { 
                alert("⚠️ El profesor ha reiniciado los grupos de la sala. Por favor selecciona tu equipo nuevamente.");
            }
        }
    }
}, [analytics, activeRoom, groupName, mode, teamReady]);

const pulseKeyframes = `
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.04); opacity: .95; }
  100% { transform: scale(1); opacity: 1; }
}`;
  const pulseStyle: React.CSSProperties = {
    animation: "pulse 1.6s ease-in-out infinite",
    display: "inline-block",
  };

  if (mode === "inicio")
    return (
      <div style={appStyles}>
        <Background />
        <GlobalFormCSS />
        <AutoCenter>
          {showProfLogin && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                background: "rgba(0,0,0,.35)",
                backdropFilter: "blur(2px)",
                display: "grid",
                placeItems: "center",
                padding: 16,
              }}
            >
              <div style={{ width: "clamp(320px,92vw,520px)" }}>
                <LoginProfesor
                  onSuccess={handleProfLoginSuccess}
                  onCancel={() => setShowProfLogin(false)}
                />
              </div>
            </div>
          )}
          {intro === "playing" ? (
            <IntroVideo
              onSkip={() => setIntro("done")}
              onFinish={() => setIntro("done")}
            />
          ) : // MOSTRAR EL MENÚ NORMAL DESPUÉS DEL VIDEO
          !showAdminLogin ? (
            <Card
              title="Misión Emprende"
              subtitle="Selecciona tu perfil"
              width={900}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Btn
                  onClick={() => setShowProfLogin(true)}
                  label="👩‍🏫 Profesor"
                />
                <Btn
                  onClick={() => setMode("alumno")}
                  bg={theme.rosa}
                  label="🧑‍🎓 Alumno"
                />
                <Btn
                  onClick={() => {
                    setShowAdminLogin(true);
                    setAdminUser("");
                    setAdminPass("");
                    setAdminErr("");
                  }}
                  bg={theme.amarillo}
                  fg={theme.texto}
                  label="🛠️ Administrador"
                />
              </div>
            </Card>
          ) : (
            <Card
              title="Acceso Administrador"
              subtitle="Ingresa tus credenciales"
              width={520}
            >
              {/* Aquí va la lógica de login simple para Admin */}
               <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                <input
                    placeholder="Usuario (admin)"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    style={baseInput}
                />
                <input
                    placeholder="Contraseña (admin)"
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    style={baseInput}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           if (adminUser === 'admin' && adminPass === 'admin') setMode('admin');
                           else setAdminErr("Credenciales incorrectas");
                        }
                    }}
                />
                {adminErr && <div style={{ color: "#D32F2F", fontWeight: 700, fontSize: 13 }}>{adminErr}</div>}
                
                <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6 }}>
                    <Btn
                        onClick={() => setShowAdminLogin(false)}
                        label="⬅ Volver"
                        bg={theme.amarillo}
                        fg={theme.texto}
                        full={false}
                    />
                    <Btn
                        onClick={() => {
                           if (adminUser === 'admin' && adminPass === 'admin') setMode('admin');
                           else setAdminErr("Credenciales incorrectas");
                        }}
                        label="Ingresar"
                        full={false}
                    />
                </div>
              </div>
            </Card>
          )}
        </AutoCenter>
      </div>
    );
  if (mode === "admin") {
    return (
      <div style={appStyles}>
        <Background />
        <GlobalFormCSS />
        <AutoCenter>
          <AdminDashboard
            analytics={analytics}
            maxSpins={maxSpins}
            setMaxSpins={setMaxSpins}
            THEMES={THEMES}
            setTHEMES={saveTHEMES}
            flow={flow}
            onBack={() => setMode("inicio")}
            ranking={ranking}
            clearMetrics={() =>
              update(() => ({
                roomsCreated: 0,
                challengeUsage: {},
                teams: [],
                reflections: [],
                feedbacks: [],
              }))
            }
            activeRoom={activeRoom}
            publish={publish}
            rouletteConfig={rouletteConfig}
            saveRouletteConfig={saveRouletteConfig}
            checklistConfig={checklistConfig}
            saveChecklistConfig={saveChecklistConfig}
          />
        </AutoCenter>
      </div>
    );
  }

  if (mode === "prof") {
    return (
      <div style={appStyles}>
        <Background />
        <GlobalFormCSS />

        {/* Notificación Flotante de Tiempo Terminado */}
{/* Notificación Centrada (Fix Definitivo para Profesor) */}
{showTimeEndNotification && (
          <div style={{
            position: 'fixed',
            top: 20,
            left: 0,
            width: '100%', 
            display: 'flex',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none' 
          }}>
            <div style={{
              background: '#F44336',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 50,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              fontSize: '18px',
              marginTop: 20,
              animation: 'pulse 1s infinite', 
              pointerEvents: 'auto'
            }}>
              ⏰ ¡TIEMPO TERMINADO!
            </div>
          </div>
        )}

        <AutoCenter>
          {!activeRoom ? (
            // ===== Menú inicial del profesor / o crear sala / o tutorial =====
            profStartView === "menu" ? (
              <Card title="Profesor" subtitle="¿Qué quieres hacer?" width={720}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 10,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <Btn
                    label="🆕 Crear sala"
                    onClick={() => setProfStartView("crear")}
                  />
                  <Btn
                    label="📘 Ver mini-tutorial"
                    bg={theme.amarillo}
                    fg={theme.texto}
                    onClick={() => setProfStartView("tutorial")}
                  />
                </div>
              </Card>
            ) : profStartView === "tutorial" || showProfTutorial ? (
              // ===== Mini-tutorial =====
              <ProfTutorial
                onExit={() => setProfStartView("menu")}
                hideBackdrop
                hideClose
              />
            ) : (
              // ===== Crear Nueva Sala =====
              <>
                {!showProfTutorial && (
                  <div
                    style={{
                      position: "fixed",
                      top: 16,
                      right: 24,
                      zIndex: 1000,
                      pointerEvents: "auto",
                    }}
                  >
                    <Btn
                      label="⬅ Retroceder"
                      onClick={() => setProfStartView("menu")}
                      full={false}
                    />
                  </div>
                )}

                <Card
                  title="Crear Nueva Sala"
                  subtitle="Define cantidad de equipos"
                  width={820}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: theme.azul,
                        }}
                      >
                        Cantidad de equipos
                      </label>
                      <select
                        value={String(equiposQty)}
                        onChange={(e) => setEquiposQty(Number(e.target.value))}
                        style={{ ...baseInput, padding: 10, marginTop: 6 }}
                      >
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: theme.azul,
                        }}
                      >
                        Subir Excel de alumnos
                      </label>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelUpload}
                        style={{ ...baseInput, padding: 10, marginTop: 6 }}
                      />
                    </div>

                    {/* 🔘 Botones + Checkbox Fase 0 alineados */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 14,
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      {/* Botón Volver */}
                      <Btn
                        onClick={() => setProfStartView("menu")}
                        bg={theme.amarillo}
                        fg={theme.texto}
                        label="⬅ Volver"
                      />

                      {/* Botón Generar Código */}
                      <Btn
                        onClick={handleCreateRoom}
                        bg={theme.rosa}
                        label="Generar Código"
                      />

                      {/* Checkbox Fase 0 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <input
                          id="includeF0"
                          type="checkbox"
                          checked={!!flow.includeF0}
                          onChange={(e) =>
                            publish({ includeF0: e.target.checked })
                          }
                          style={{
                            width: 20,
                            height: 20,
                            accentColor: theme.azul,
                            cursor: "pointer",
                          }}
                        />
                        <label
                          htmlFor="includeF0"
                          style={{
                            fontWeight: 600,
                            color: theme.azul,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Incluir Fase 1 — Presentación rápida
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ▾ Grupos sugeridos (colapsable) */}
                {recommendedGroups?.length > 0 && (
                  <div
                    style={{
                      border: `1px solid ${theme.border}`,
                      borderRadius: 12,
                      marginTop: 16,
                      overflow: "hidden",
                      background: "#fff",
                      boxShadow: "0 6px 14px rgba(16,24,40,.08)",
                    }}
                  >
                    {/* Barra de cabecera */}
                    <button
                      onClick={() => setOpenReco((v) => !v)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "12px 14px",
                        border: "none",
                        background: "#F7F9FC",
                        cursor: "pointer",
                        fontWeight: 800,
                        color: theme.azul,
                      }}
                      title="Clic para mostrar/ocultar"
                    >
                      <span>Grupos sugeridos</span>
                      <span style={{ fontWeight: 900 }}>
                        {openReco ? "▴" : "▾"}
                      </span>
                    </button>

                    {/* Contenido colapsable */}
                    <div
                      style={{
                        maxHeight: openReco ? 320 : 0,
                        transition: "max-height .25s ease",
                        overflowY: "auto",
                        padding: openReco ? "10px 12px" : "0 12px",
                      }}
                    >
                      {recommendedGroups.map((g, i) => (
                        <div
                          key={i}
                          style={{
                            marginBottom: 10,
                            borderBottom: `1px dashed ${theme.border}`,
                            paddingBottom: 8,
                          }}
                        >
                          <div style={{ fontWeight: 700, color: theme.azul }}>
                            {g.nombre}{" "}
                            <span style={{ opacity: 0.7, fontWeight: 600 }}>
                              ({g.integrantes.length})
                            </span>
                          </div>
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: 18,
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            {g.integrantes.map((p, j) => (
                              <li key={j}>
                                {p.nombre} — {p.carrera}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Acciones: aplicar/guardar */}
                    </div>
                  </div>
                )}
              </>
            )
          ) : null}

          {/* ★ Oculta todo el lobby/ajustes cuando el tutorial está activo */}
          {profStartView !== "tutorial" &&
            activeRoom &&
            flow.step === "lobby" /* ★ */ && (
              <div
                style={{
                  width: "clamp(320px,92vw,1100px)",
                  display: "grid",
                  gridTemplateColumns: "1fr 320px",
                  gap: 12,
                }}
              >
                <Card
                  title="Sala creada"
                  subtitle="Comparte el código y espera a los equipos"
                  width={700}
                >
                  <div
                    style={{
                      fontSize: 32,
                      fontFamily:
                        "Roboto Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
                      marginBottom: 8,
                      color: theme.azul,
                    }}
                  >
                    {activeRoom}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
                    Equipos listos: <b>{readyNow}</b> /{" "}
                    <b>{flow.expectedTeams}</b>
                  </div>
                  <Btn
                    onClick={startFirstPhaseFromLobby}
                    label="Continuar con todos"
                    disabled={readyNow < flow.expectedTeams}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "center",
                      marginTop: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Btn
                      onClick={() => resetSalaActual(true)}
                      bg="#FFC107"
                      fg={theme.texto}
                      label="↻ Reiniciar sala (mantener código)"
                      full={false}
                    />
                    <Btn
                      onClick={() => {
                        if (confirm("¿Cerrar la sala y volver a crear otra?"))
                          resetSalaActual(false);
                      }}
                      bg="#F44336"
                      label="🗑 Cerrar sala"
                      full={false}
                    />
                  </div>
                </Card>

                {recommendedGroups.length > 0 && (
                  <div style={{ ...panelBox, marginTop: 0 }}>
                    <div style={badgeTitle}>
                      📥 Grupos sugeridos desde Excel
                    </div>
                    <div
                      style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}
                    >
                      {recommendedGroups.length} grupo(s) listos para aplicar en
                      la sala <b>{activeRoom}</b>.
                    </div>
                    <Btn
                      onClick={aplicarGruposSugeridos}
                      label="Aplicar grupos sugeridos a la sala"
                      full={false}
                      disabled={!flow.roomCode}
                    />
                  </div>
                )}

                <div
                  style={{ display: "grid", gap: 12, alignContent: "start" }}
                >
                  <div style={{ ...panelBox }}>
                    <div style={badgeTitle}>
                      👥 Equipos en sala {activeRoom}
                    </div>

                    {remoteTeams.length === 0 ? (
  <div style={{ opacity: 0.7 }}>
    Aún no se crean grupos…
  </div>
) : (
  <div style={{ display: "grid", gap: 8 }}>
    {remoteTeams.map((team: any, i: number) => {
        const name = team.nombre;
        const integrantes = team.integrantes || [];
        const key = `${activeRoom}::${name}`;
        const abierto = !!openTeams[key];

        return (
          <div
            key={key}
            style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              background: "#fff",
            }}
          >
            {/* Cabecera del grupo */}
            <button
              onClick={() => toggleTeamOpen(key)}
              style={{
                all: "unset",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                padding: "10px 12px",
                cursor: "pointer",
              }}
              aria-expanded={abierto}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: theme.azul,
                }}
              >
                {name}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {abierto
                  ? "▲ ocultar"
                  : "▼ ver integrantes"}
              </div>
            </button>

            {/* Lista de integrantes */}
            {abierto && (
              <div style={{ padding: "0 14px 10px 20px" }}>
                {integrantes.length ? (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 16,
                      fontSize: 13,
                    }}
                  >
                    {integrantes.map(
                      (p: any, j: number) => (
                        <li key={j}>
                          {p.nombre} — {p.carrera || "—"}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <div
                    style={{ opacity: 0.6, fontSize: 13 }}
                  >
                    (sin integrantes registrados)
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    )}
  </div>
)}
                  </div>
                </div>
              </div>
            )}

          {flow.step === "f1_video" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <TeamworkMiniAnim loop />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Btn
                  onClick={() => setStep("f1_instr")}
                  label="Continuar con todos"
                  full={false}
                />
              </div>
            </>
          )}

          {flow.step === "f1_instr" && (
            <>
              <Card
                title="Instrucciones"
                subtitle="Fase 1 — Guía del profesor"
                width={1100}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 16,
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 10 }}>
                    Guía del profesor
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6 }}>
                    <li>
                      Ahora jugarán a <b>ver las diferencias</b> (
                      <i>Spot the Difference</i>).
                    </li>
                    <li>
                      Inicie y controle el temporizador cuando todos estén
                      listos.
                    </li>
                    <li>
                      Al finalizar, pulse <b>Terminar y ver ranking</b> para
                      continuar.
                    </li>
                  </ol>
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <Btn
                  onClick={() => {
                    resetTimer(flow.f1Seconds || 300);
                    setStep("f1_activity", 5 * 60);
                  }}
                  label="Abrir juegos y timer"
                  full={false}
                />
              </div>
            </>
          )}
          {flow.step === "f1_activity" && (
            <Card
              title="Fase 1 — En curso"
              subtitle="Timer visible para todos"
              width={720}
            >
              <BigTimer
                label="Tiempo F1 (Diferencias/Matriz)"
                defaultSec={5 * 60}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <Btn
                  onClick={() => setStep("f1_rank")}
                  label="Terminar y ver ranking"
                  full={false}
                />
              </div>
            </Card>
          )}
          {flow.step === "f1_rank" && (
            <Card
              title="Ranking — Fase 1"
              subtitle="Resultados en vivo"
              width={900}
            >
              <ConfettiBurst />
              <RankingBars
                data={ranking}
                onContinue={() => setStep("f2_video")}
                isTeacher={isTeacher} // Corregido: pasar isTeacher
              />
            </Card>
          )}
          {mode === "prof" && activeRoom && flow.step !== "lobby" && (
            <div
              style={{
                position: "fixed",
                top: 16,
                right: 16,
                display: "flex",
                gap: 8,
                zIndex: 999,
              }}
            >
              <button
                onClick={goPrevStep}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #E3E8EF",
                  background: "#fff",
                  boxShadow: "0 8px 20px rgba(16,24,40,.08)",
                  cursor: "pointer",
                }}
                title="Volver a la fase anterior"
              >
                ⬅️ Retroceder
              </button>
            </div>
          )}

          {/* KEYFRAMES de la animación pulse (una sola vez) */}
          <style>{pulseKeyframes}</style>
          {/* ===== FASE 0 — INSTRUCCIONES ===== */}
          {flow.step === "f0_instr" && (
            <Card
              title="Fase 1 — Presentación exprés"
              subtitle="Rompehielo rápido por equipo"
              width={900}
            >
              <div style={{ textAlign: "left", lineHeight: 1.6 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  🗣️ ¿Qué haremos?
                </div>
                <ol>
                  <li>
                    En tu equipo, cada persona dice: <b>nombre</b>,{" "}
                    <b>carrera/área</b> y un <b>dato entretenido</b> (hobby,
                    talento, app favorita o canción que motive).
                  </li>
                  <li>
                    Máximo <b>20–25 segundos</b> por persona. No se escribe
                    nada: <b>solo conversan</b>.
                  </li>
                  <li>
                    Al sonar el timer, cierren la ronda con{" "}
                    <b>un acuerdo simple</b> (por ejemplo, cómo se organizarán).
                  </li>
                </ol>
                <div style={{ opacity: 0.85, marginTop: 8 }}>
                  Sugerencia: elijan a alguien que controle el tiempo dentro del
                  equipo ⏱️
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                <Btn
                  onClick={() => {
                    const sec = flow.f0Seconds ?? 3 * 60;
                    resetTimer(flow.f0Seconds || 180);
                    publish({ running: false });
                    setStep("f0_activity", sec);
                  }}
                  label="Iniciar Fase 1"
                  full={false}
                />
              </div>
            </Card>
          )}


{flow.step === "f0_activity" && (
            <Card
              title="Fase 1 — Presentación en equipos"
              subtitle="Dinámica de Rompehielo"
              width={980}
            >
              <div style={{ display: "grid", gap: 20 }}>
                <div style={{ fontSize: 16, opacity: 0.9, background:'#E3F2FD', padding:'10px', borderRadius:'8px' }}>
                  💡 <b>Tip de conversación:</b> {f0Tip || "Cuenten su hobby favorito"}
                </div>

                {/* Usamos BigTimer para que se vea consistente y use el tiempo del Admin */}
                <BigTimer label="Tiempo Restante" />

                {/* Botón de avance */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Btn
                    onClick={() => setStep("f1_video")}
                    label="Continuar al juego ▶"
                    full={false}
                  />
                </div>
              </div>
            </Card>
          )}

          {flow.step === "f2_video" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <EmpathyAnimacion loop />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Btn
                  onClick={() => setStep("f2_instr")}
                  label="Continuar con todos"
                  full={false}
                />
              </div>
            </>
          )}

{/* FASE 2: INSTRUCCIONES PREVIAS A LA SELECCIÓN */}
{flow.step === "f2_instr" && (
            <>
              <Card
                title="Instrucciones Fase 2"
                subtitle="Empatía — Guía del profesor"
                width={900}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 20,
                    textAlign: "left"
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 12, marginTop: 0 }}>
                    ¿Qué viene ahora?
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, fontSize: 16 }}>
                    <li>
                      Los equipos deberán <b>elegir una Temática y un Desafío</b> en sus tablets.
                    </li>
                    <li>
                      Luego, realizarán un <b>Mapa de Empatía</b> digital para entender a su usuario.
                    </li>
                    <li>
                      Presione "Habilitar Selección" para que los alumnos vean las opciones en sus pantallas.
                    </li>
                  </ol>
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                <Btn
                  onClick={() => setStep("f2_theme")}
                  label="Habilitar Selección de Desafíos ▶"
                  full={false}
                />
              </div>
            </>
          )}

          {/* ===== PROFESOR: paso f2_theme ===== */}
          {flow.step === "f2_theme" && (
            <>
              <ThemeChallengeSection
                THEMES={THEMES}
                temaSel={temaSel}
                setTemaSel={setTemaSel}
                desafioIndex={desafioIndex}
                setDesafioIndex={setDesafioIndex}
                desafioActual={desafioActual}
                isTablet={isTablet}
                onContinue={() => {
                  const tId = temaSel as keyof typeof THEMES;
                  if (!tId) return;
                  const key = `${String(tId)}#${desafioIndex}`;
                  update((a) => ({
                    ...a,
                    challengeUsage: {
                      ...a.challengeUsage,
                      [key]: (a.challengeUsage[key] || 0) + 1,
                    },
                  }));
                }}
                hideConfirm={true}
              />

              {/* Panel contador + botón para abrir mapa */}
              {(() => {
                const teams = getTeamsForRoom(analytics, activeRoom);
                const ok = countConfirmedChoices(activeRoom, teams);
                const need = flow.expectedTeams || teams.length || 0;

                return (
                  <div
                    style={{
                      display: "grid",
                      gap: "16px",
                      justifyItems: "center",
                      marginTop: "20px",
                    }}
                  >
                    
                    {/* Contador de equipos confirmados */}
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        backgroundColor: "#E3F2FD",
                        color: "#1976D2",
                        padding: "16px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>Equipos con desafío confirmado:</span>
                      <b>
                        {ok}/{need}
                      </b>
                    </div>

                    {/* Botón para abrir mapa y timer */}
                    <Btn
                      label="Seguir con instrucciones"
                      onClick={() => {
                        console.log("Botón clickeado");
                        setStep("f2_instrucciones"); // Aquí agregamos el cambio de flujo
                      }}
                      full={false}
                      disabled={ok < need}
                      title={
                        ok < need
                          ? "Aún faltan equipos por confirmar"
                          : "Iniciar etapa 2"
                      }
                      style={{
                        backgroundColor: "#1976D2",
                        color: "#fff",
                        padding: "14px 30px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        fontWeight: "bold",
                        cursor: ok < need ? "not-allowed" : "pointer",
                        opacity: ok < need ? 0.6 : 1,
                      }}
                    />
                  </div>
                );
              })()}
            </>
          )}

          {/* ===== PROFESOR: paso f2_activity (instrucciones + timer) ===== */}
          {flow.step === "f2_instrucciones" && (
            <>
              <Card
                title="Fase 2 — Empatía"
                width={1100}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 16,
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 10 }}>
                    Guía del profesor
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6 }}>
                    <li>
                      Indica a los equipos que completen su mapa de empatía
                      centrado en un usuario real.
                    </li>
                    <li>
                      Supervisa el trabajo y controla el temporizador (puedes
                      pausarlo o reiniciarlo según el ritmo de la clase).
                    </li>
                    <li>
                      Cuando todos terminen, avanza al ranking o a la siguiente
                      fase.
                    </li>
                  </ol>
                </div>

                {/* Controles de tiempo */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 16,
                  }}
                >
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                <Btn
                  onClick={() => setStep("f2_activity")}
                  label="Abrir BubbleMap y Timer"
                  full={false}
                />
              </div>
            </>
          )}
{flow.step === "f2_activity" && (
            <Card
              title="Fase 2 — En curso"
              subtitle="Timer visible para todos"
              width={720}
            >
              <BigTimer 
                 label="Tiempo F2 Bubble Map" 
                 defaultSec={flow.f2Seconds || 300} 
              />
              
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                <Btn
                  onClick={() => setStep("f2_rank")}
                  label="Terminar y ver ranking"
                  full={false}
                />
              </div>
            </Card>
          )}

          {flow.step === "f2_rank" && (
            <Card
              title="Ranking — Fase 2"
              subtitle="Resultados en vivo"
              width={900}
            >
              <RankingBars
                data={ranking}
                onContinue={() => setStep("f3_video")}
                isTeacher={isTeacher} // Corregido: pasar isTeacher
              />
            </Card>
          )}

          {flow.step === "f3_video" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <CreatividadAnimacion loop />
              </div>
              <Btn
                onClick={() => {
                  resetTimer(15 * 60);
                  setStep("f3_instr", 15 * 60);
                }}
                label="Abrir actividad y timer"
                full={false}
              />
            </>
          )}

{/* FASE 3: INSTRUCCIONES DE PROTOTIPADO */}
{flow.step === "f3_instr" && (
            <>
              <Card
                title="Instrucciones Fase 3"
                subtitle="Creatividad y Prototipo — Guía del profesor"
                width={1100}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 20,
                    textAlign: "left"
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 12, marginTop: 0 }}>
                    ¡Hora de construir!
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, fontSize: 16 }}>
                    <li>
                      <b>Entregue los kits de LEGO</b> a cada equipo ahora.
                    </li>
                    <li>
                      Explique la misión: Deben construir una solución física que resuelva el problema de su usuario (el que definieron en la fase anterior).
                    </li>
                    <li>
                      Recuérdeles que pueden usar la <b>Ruleta de Desafío (Opcional)</b> en su tablet para obtener ventajas o retos divertidos.
                    </li>
                    <li>
                      Al finalizar el tiempo, deberán subir una foto de su creación.
                    </li>
                  </ol>
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                <Btn
                  onClick={() => {
                    // CORRECCIÓN: Usar tiempo dinámico F3
                    const sec = flow.f3Seconds || 900; 
                    resetTimer(sec);
                    setStep("f3_activity", sec);
                  }}
                  label={`Iniciar Construcción (${Math.round((flow.f3Seconds||900)/60)} min) ▶`}
                  full={false}
                />
              </div>
            </>
          )}

          {flow.step === "f3_activity" && (
            <Card
              title="Fase 3 — En curso"
              subtitle="Creatividad (timer)"
              width={720}
            >
              <BigTimer label="Tiempo F3 (Creatividad)" defaultSec={15 * 60} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <Btn
                  onClick={() => setStep("f3_rank")}
                  label="Terminar y ver ranking"
                  full={false}
                />
              </div>
            </Card>
          )}
          {flow.step === "f3_rank" && (
            <Card
              title="Ranking — Fase 3"
              subtitle="Resultados en vivo"
              width={900}
            >
              <RankingBars
                data={ranking}
                onContinue={() => setStep("f4_video")}
                isTeacher={isTeacher} // Corregido: pasar isTeacher
              />
            </Card>
          )}

{flow.step === "f4_video" && (
            <PitchAnimacion
              showContinue
              onContinue={() => {
                const sec = flow.f4PrepSeconds || 600; // 10 min default
                resetTimer(sec);
                setStep("f4_instr", sec);
              }}
            />
          )}

{flow.step === "f4_instr" && (
            <>
              <Card
                title="Instrucciones"
                subtitle="Fase 4: Comunicación (Guía del Profesor)"
                width={1100}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 16,
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 10 }}>
                    Guía del profesor
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6 }}>
                    <li>
                      Anuncie la <b>Fase de Pitch</b>. Explique que tendrán <b>{flow.pitchSeconds || 90} segundos</b> para convencer a la audiencia.
                    </li>
                    <li>
                      Dirija la atención a la estructura de Pitch que verán en su tablet (Hook, Problema, Solución LEGO, Valor).
                    </li>
                    <li>
                      Presione "Iniciar preparación" para que comience el reloj para todos los equipos.
                    </li>
                    <li>
                      Al finalizar la preparación, avance a la <b>Ruleta de Orden</b> para sortear la secuencia de presentaciones.
                    </li>
                  </ol>
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <Btn
                  onClick={() => {
                    const sec = flow.f4PrepSeconds || 600;
                    resetTimer(sec);
                    setStep("f4_prep", sec); 
                  }}
                  label={`Iniciar preparación (${Math.round((flow.f4PrepSeconds || 600)/60)} min) ▶`}
                  full={false}
                />
              </div>
            </>
          )}

          {flow.step === "f4_prep" && (
            <Card
              title="Fase 4 — Preparación del Pitch"
              subtitle="Timer visible"
              width={720}
            >
              <BigTimer label="Tiempo F4 (Preparación)" defaultSec={10 * 60} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <Btn
                  onClick={() => setStep("f4_wheel")}
                  label="Ir a RUEDA de orden"
                  full={false}
                />
              </div>
            </Card>
          )}
          {flow.step === "f4_wheel" && (
            <RuedaPresentacion
              flujo={flow}
              equiposTotal={getTeamsForRoom(analytics, activeRoom)} // Tu función para obtener lista de strings
              publicar={publish}
              setStep={setStep}
              resetTimer={resetTimer}
              // PROPS NECESARIAS PARA QUE EL PROFESOR PUEDA CONTROLAR EL GIRO
              isProfesor={isTeacher}
            />
          )}

{flow.step === "f4_present" && (
             <PresentStageTeacher 
                currentTeam={flow.presentOrder[flow.currentIdx ?? 0]}
                activeRoom={activeRoom} 
                onNext={goNextTeam} 
                pitchSec={flow.pitchSeconds || 90} 
                startTimer={startTimer} 
                pauseTimer={pauseTimer} 
                
                onReset={handleSmartReset} 
                
                remaining={flow.remaining}
             />
          )}

{flow.step === "f5_podium" && (
              <Card title="🏆 Resultados Finales" width={900}>
                  {podiumPhase === 'drumroll' ? (
                      <div style={{padding: 60, textAlign: 'center'}}>
                          <div style={{fontSize: 80, animation: 'drumroll 0.1s infinite'}}>🥁</div>
                          <h2 style={{color: theme.azul}}>Calculando puntajes...</h2>
                      </div>
                  ) : (
                      <div style={{textAlign:'center', animation: 'popIn 0.5s'}}>
                          <ConfettiBurst />
                          <h3>Equipo con más tokens:</h3>
                          <div style={{
                              fontSize: 60, 
                              fontWeight: 900, 
                              color: theme.amarillo, 
                              margin: "20px 0"
                          }}>
                              {ranking[0]?.equipo || "..."}
                          </div>
                          <div style={{fontSize: 24, fontWeight: 700, color: theme.texto}}>
                              {ranking[0]?.total} Tokens Totales
                          </div>
                          
                          <div style={{marginTop: 40, textAlign: 'left'}}>
                             <RankingBars 
                                data={ranking} 
                                isTeacher={true} 
                                onContinue={() => setStep("f5_video")} 
                             />
                          </div>
                      </div>
                  )}
              </Card>
          )}

          {flow.step === "f5_video" && (
            <Card
              title="Cierre: Resumen de la Misión"
              subtitle="Habilidades Activas: Empatía, Equipo, Creatividad, Comunicación"
              width={900}
            >
              <div style={{ padding: 20, textAlign: 'left' }}>
                  <h3 style={{ color: theme.azul, marginTop: 0 }}>¡Misión Cumplida!</h3>
                  <p>Hoy navegaste por 4 fases clave del emprendimiento:</p>
                  <ul style={{ paddingLeft: 20, margin: 0, fontSize: 15, lineHeight: 1.6 }}>
                      <li><b>Fase 1 (Equipo):</b> Lograste la coordinación y roles claros.</li>
                      <li><b>Fase 2 (Empatía):</b> Identificaste un problema real en un usuario mapeando sus necesidades.</li>
                      <li><b>Fase 3 (Creatividad):</b> Materializaste una solución innovadora en un prototipo LEGO.</li>
                      <li><b>Fase 4 (Comunicación):</b> Presentaste tu idea de forma concisa y persuasiva (Pitch).</li>
                  </ul>
                  <p style={{ marginTop: 15 }}>A continuación, realizarás una autoevaluación personal sobre tu desempeño en estas áreas. ¡Recuerda, cada desafío es una oportunidad de crecimiento!</p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <Btn
                  onClick={() => setStep("pre_qr_reflex")}
                  label="Ir a Autoevaluación"
                  full={false}
                />{" "}
              </div>
            </Card>
          )}

{flow.step === "pre_qr_reflex" && <CierreReflexion onContinue={() => mode === 'prof' ? setStep("qr") : publish({ ...flow, step: 'qr' })} />}

{flow.step === "qr" && (
            <Card
              title="¡Evalúa el juego!"
              subtitle="Escanea el código QR con tu celular"
              width={700}
            >
              <div
                style={{
                  width: 260,
                  height: 260,
                  margin: "12px auto",
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img 
                  src={imgQR} 
                  alt="QR Code"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain" 
                  }}
                />
              </div>
              <Btn
                onClick={handleEndGameRedirects}
                bg={theme.rosa}
                label="Terminar"
                full={false}
              />
            </Card>
          )}
        </AutoCenter>
      </div>
    );
  }

  if (mode === "alumno") {
    return (
      <div style={appStyles}>
        <Background />
        <GlobalFormCSS />

{showTimeEndNotification && (
          <div style={{
            position: 'fixed',
            top: 20,
            left: 0, 
            width: '100%', 
            display: 'flex',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none', 
          }}>
            <div style={{
              background: '#F44336',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 50,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              fontSize: '18px',
              animation: 'pulse 1s infinite', 
              pointerEvents: 'auto',
              marginTop: 20,
            }}>
              ⏰ ¡TIEMPO TERMINADO!
            </div>
          </div>
        )}

        <AutoCenter>
          {!joinedRoom && (
            <Card
              title="Alumno"
              subtitle="Ingresa el código de sala para continuar"
              width={520}
            >
              <input
                placeholder="Código de sala"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                style={{
                  ...baseInput,
                  textAlign: "center",
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              />
              <Btn onClick={handleJoinRoom} label="Entrar a la sala" />
              <Btn
                onClick={() => setMode("inicio")}
                bg={theme.amarillo}
                fg={theme.texto}
                label="⬅ Back"
              />
            </Card>
          )}

{/* --- LOBBY / FORMACIÓN DE EQUIPOS (CORREGIDO) --- */}
{flow.step === "lobby" && !teamReady && (
    flow.formation === "auto" ? (
        // === MODO AUTO (Originalmente: SELECT) ===
        // 🚨 CAMBIO: Muestra la vista MANUAL cuando la formación es "auto" (Excel subido)
        <Card title={`Sala ${activeRoom}`} subtitle="Crea tu grupo y marca listo" width={980}>
            <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", gap: 12, textAlign: "left" }}>
                
                {/* Columna Izq: Nombre Equipo */}
                <div style={{ ...panelBox }}>
                    <div style={badgeTitle}>Nombre del equipo</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                        <input placeholder="Ej: Aurora..." value={groupName} onChange={(e) => setGroupName(e.target.value)} style={baseInput} />
                        <Btn label="Sugerir" full={false} variant="outline" onClick={() => {
                            const taken = new Set(remoteTeams);
                            const sug = TEAM_SUGGESTIONS.find(s => !taken.has(s)) || `Grupo ${taken.size + 1}`;
                            setGroupName(sug);
                        }} />
                    </div>
                </div>

                {/* Columna Der: Integrantes (SOLO NOMBRES, SIN CARRERA) */}
                <div style={{ ...panelBox }}>
                    <div style={badgeTitle}>Integrantes</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Máximo {MAX_PER_GROUP}. Solo nombres.</div>
                    
                    <div style={{ display: "grid", gap: 8 }}>
                        {/* Inicializar si vacío con estructura simple */}
                        {integrantes.length === 0 && setIntegrantes([{ nombre: "", carrera: "" }]) as any}
                        
                        {integrantes.map((m, idx) => (
                            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 36px", gap: 8, alignItems: "center" }}>
                                <input 
                                    placeholder={`Nombre integrante ${idx + 1}`} 
                                    value={m.nombre} 
                                    onChange={e => {
                                        const v = e.target.value;
                                        const next = [...integrantes];
                                        next[idx] = { nombre: v, carrera: "" }; 
                                        setIntegrantes(next);
                                    }}
                                    style={baseInput} 
                                />
                                <button onClick={() => setIntegrantes(prev => prev.filter((_, i) => i !== idx))} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>✕</button>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 8, textAlign: 'right' }}>
                        <Btn label="+ Integrante" full={false} onClick={() => { if (integrantes.length < MAX_PER_GROUP) setIntegrantes([...integrantes, { nombre: "", carrera: "" }]) }} disabled={integrantes.length >= MAX_PER_GROUP} />
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, borderTop: "1px solid #eee", paddingTop: 15 }}>
                <Btn onClick={() => setMode("inicio")} bg={theme.amarillo} fg={theme.texto} label="⬅ Volver" full={false} />
// web/src/App.tsx (Dentro del renderizado del Alumno - Modo Manual)

<Btn label="Crear Equipo y Entrar" full={false} onClick={async () => {
    if (!groupName.trim()) return alert("Ponle nombre al equipo");
    const clean = integrantes.filter(x => x.nombre.trim());
    if (clean.length === 0) return alert("Agrega al menos 1 persona");
    
    try {
        // 1. Llamada real al Backend
        const res = await joinRoom(activeRoom, {
            name: miNombre || "Alumno", 
            career: miCarrera || "",
            equipoNombre: groupName
        });

        if (res.ok && res.equipoId) {
            setMyTeamId(res.equipoId); 
            setTeamReady(true);       
        }
    } catch (e) {
        console.error(e);
        alert("Error al crear equipo. Intenta con otro nombre.");
    }
}} />
            </div>
        </Card>
    ) : (
        <Card title={`Sala ${activeRoom}`} subtitle="Confirma tu equipo para ingresar" width={600}>
            <div style={{ textAlign: 'left', marginBottom: 20 }}>
                <label style={{ fontWeight: 800, color: theme.azul, display: 'block', marginBottom: 8 }}>Selecciona tu Equipo</label>
                <select value={groupName} onChange={(e) => setGroupName(e.target.value)} style={{ ...baseInput, padding: 12, fontSize: 16 }}>
                    <option value="">-- Elige tu grupo --</option>
                    {remoteTeams.map((t, i) => (<option key={i} value={t}>{t}</option>))}
                </select>
            </div>
            {groupName && (
                <div style={{ background: "#F8F9FA", padding: 16, borderRadius: 12, border: "1px solid #E3E8EF", marginBottom: 20, textAlign: "left" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 8, textTransform: "uppercase" }}>Integrantes registrados:</div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: theme.texto }}>
                        {(analytics.teams.find(t => t.roomCode === activeRoom && t.teamName === groupName)?.integrantes || []).map((m:any, i:number) => (
                            <li key={i}><strong>{m.nombre}</strong></li>
                        ))}
                    </ul>
                </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <Btn onClick={() => setMode("inicio")} bg={theme.amarillo} fg={theme.texto} label="⬅ Volver" full={false} />
<Btn label="✅ Confirmar y Entrar" full={false} disabled={!groupName} onClick={async () => {
    try {
        const res = await joinRoom(activeRoom, {
            name: miNombre || "Alumno",
            career: miCarrera || "",
            equipoNombre: groupName // Aquí groupName viene del <select>
        });

        if (res.ok && res.equipoId) {
            setMyTeamId(res.equipoId);
            setTeamReady(true);
        }
    } catch (e) {
        alert("Error al unirse al equipo.");
    }
}} />            </div>
        </Card>
    )
)}
          {joinedRoom === activeRoom &&
            activeRoom &&
            teamReady &&
            flow.step === "lobby" && (
              <Card
                title="Esperando al profesor"
                subtitle="Aún no inicia la fase 1"
                width={720}
              >
                <div style={{ textAlign: "center", fontSize: 18, padding: 20 }}>
                  ⏳ Esperando a que el profesor comience...
                </div>
                <div
                  style={{ textAlign: "center", opacity: 0.7, fontSize: 14 }}
                >
                  Verifica en la sala del profesor que tu grupo aparece como{" "}
                  <b>listo</b>.
                </div>

                {/* --- Botón de marcar grupo como listo --- */}
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <button
                    onClick={() => {
                      const room = activeRoom || flow.roomCode;
                      const team = (groupName || flow.teamName || "").trim();

                      if (!room) {
                        alert("No hay sala activa.");
                        return;
                      }
                      if (!team) {
                        alert("Selecciona tu equipo antes de marcar listo.");
                        return;
                      }

                      const teamKey = `${room}::${team}`;
                      const prev = readJSON<string[]>(READY_KEY, []);
                      if (!prev.includes(teamKey)) {
                        const nuevos = [...prev, teamKey];
                        writeJSON(READY_KEY, nuevos);
                        try {
                          window.dispatchEvent(
                            new StorageEvent("storage", {
                              key: READY_KEY,
                              newValue: JSON.stringify(nuevos),
                            })
                          );
                        } catch {}
                        alert(`✅ Tu grupo (${team}) fue marcado como listo.`);
                      } else {
                        alert(
                          `Tu grupo (${team}) ya estaba marcado como listo.`
                        );
                      }
                    }}
                    style={{
                      background: "#0D6EFD",
                      color: "#fff",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 18px",
                      cursor: "pointer",
                      fontSize: 15,
                      boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    ✅ Marcar grupo como listo
                  </button>
                </div>
              </Card>
            )}

          {/* ===== FASE 0 — INSTRUCCIONES (ALUMNO) ===== */}
          {flow.step === "f0_instr" && (
            <Card
              title="Fase 1 — ¡Nos conocemos rápido!"
              subtitle="Presentación breve si no se conocen"
              width={900}
            >
              <div style={{ textAlign: "left", lineHeight: 1.6 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  <span
                    style={{
                      animation: "pulse 1.6s ease-in-out infinite",
                      display: "inline-block",
                    }}
                  >
                    🗣️
                  </span>{" "}
                  Indicaciones
                </div>
                <ul>
                  <li>En equipos, preséntense rápidamente</li>
                  <li>Nombre y apellido, carrera o área</li>
                  <li>
                    Compartan un <b>dato entretenido</b> (hobby, talento, app
                    favorita, canción que les motive, etc.)
                  </li>
                </ul>
                <div style={{ opacity: 0.8, marginTop: 8 }}>
                  No es necesario escribir nada — solo conversen 😊
                </div>
                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
                  El/la profe iniciará el tiempo
                </div>
              </div>
            </Card>
          )}

          {/* ===== FASE 0 — ACTIVIDAD (ALUMNO) ===== */}
{/* ===== FASE 0 — ACTIVIDAD (ALUMNO - DISEÑO MEJORADO) ===== */}
{flow.step === "f0_activity" && (
            <Card
              title="👋 ¡Rompiendo el Hielo!"
              subtitle="Conoce a tu equipo en 3 minutos"
              width={700}
            >
              <div style={{ display: "grid", gap: 24, textAlign: "center", marginTop: 10 }}>
                
                {/* 1. TIMER HERO: Grande y con gradiente */}
                <div style={{
                    background: "linear-gradient(135deg, #0D6EFD 0%, #0057D9 100%)",
                    borderRadius: 24,
                    padding: "24px",
                    color: "white",
                    boxShadow: "0 10px 25px rgba(13, 110, 253, 0.25)",
                    transform: "scale(1.02)"
                }}>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.9, marginBottom: 5, fontWeight: 700 }}>
                        Tiempo Restante
                    </div>
                    <div style={{ fontSize: 64, fontWeight: 900, fontVariantNumeric: "tabular-nums", lineHeight: 1, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                        {mmss(flow.remaining)}
                    </div>
                </div>

                {/* 2. TOPIC CARD: Estilo tarjeta de juego */}
                <div style={{
                    background: "#FFF9C4", 
                    border: "3px dashed #FBC02D", 
                    borderRadius: 18, 
                    padding: "28px 20px",
                    position: "relative",
                    marginTop: 10
                }}>
                    <div style={{
                        position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                        background: "#FBC02D", color: "#5D4037", padding: "6px 18px", borderRadius: 99,
                        fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1,
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}>
                        Tema de conversación
                    </div>
                    <div style={{ fontSize: 20, color: "#5D4037", lineHeight: 1.5 }}>
                        "Cuéntales a tu equipo sobre <br/><b style={{color: "#E65100", fontSize: 22}}>{f0Tip}</b>"
                    </div>
                    <div style={{ fontSize: 13, color: "#8D6E63", marginTop: 10, fontStyle: "italic" }}>
                        (O cualquier otro dato curioso que quieran compartir)
                    </div>
                </div>
              </div>
            </Card>
          )}
          {flow.step === "f1_video" && <TeamworkMiniAnim />}
          {flow.step === "f1_instr" && (
            <>
              <GuidePanel
                phaseTitle="Fase 1 — Trabajo en equipo"
                alumno={[
                  "Actividad: <b>Spot the Difference</b> — encuentren las diferencias en equipo.",
                  "Coordinen la búsqueda: cada integrante revisa un área distinta de la imagen.",
                  "Cada diferencia encontrada les dará 2 tokens. ¡Recuerden que el equipo con más gana!",
                ]}
                profesor={[]}
                objetivo="Colaborar para detectar diferencias rápidamente."
                tiempo="5 minutos"
                showProfesor={false}
              />

              {/* Botón de avance forzado para el alumno (debe eliminarse, el avance es automático o por profe) */}
              {/* Dejamos solo el inicio de la actividad */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >

              </div>
            </>
          )}

          {flow.step === "f1_activity" && (
            <Card
              title="Fase 1 — Diferencias"
              subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`}
              width={1100}
            >
              <div style={{ marginBottom: 10, fontSize: 13, opacity: 0.75 }}>
                Tip: dividan la imagen en zonas y revisen simultáneamente.
              </div>

<SpotWithImage
  imgUrlA={originalImg}
  imgUrlB={modificadaImg}
  diffs={F1_DIFFS}
  running={flow.running}
  theme={theme}
  targetHeight={560}
  foundState={diffFound}
  setFoundState={setDiffFound}
  onFoundDiff={() => {
    setCoins((c) => c + 1);
    if (myTeamId) updateTeamScore(myTeamId, 1);
  }}
/>

              {/* Eliminamos el botón de avance del alumno */}
            </Card>
          )}

          {flow.step === "f1_rank" && (
            <Card
              title="Ranking — Fase 1"
              subtitle="Resultados en vivo"
              width={900}
            >
              <RankingBars
                data={ranking}
                onContinue={() => setStep("f2_video")}
                isTeacher={isTeacher} // Corregido: pasar isTeacher
              />
            </Card>
          )}
          {flow.step === "f2_video" && <EmpathyAnimacion loop />}

          {flow.step === "f2_instr" && (
            <>
              <Card
                title="Instrucciones"
                subtitle="Fase 2 — Guía del alumno"
                width={1100}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 16,
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 10 }}>
                    Guía del alumno
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6 }}>
                    <li>Vean y eligan un desafio.</li>
                    <li>
                      Luego tendran que identificar las problemas del usuario
                      con un Bubble Map!
                    </li>
                  </ol>
                </div>
              </Card>
            </>
          )}
          {flow.step === "f2_theme" &&
            (() => {
              const myTeamName = teamId.split("::")[1] || "Equipo";

              const confirmChoice = () => {
                const tId = temaSel as keyof typeof THEMES;
                const valid =
                  tId &&
                  THEMES[tId] &&
                  desafioIndex >= 0 &&
                  desafioIndex < (THEMES[tId].desafios?.length || 0);
                if (!valid) {
                  alert("Elige una temática y un desafío.");
                  return;
                }

                // ✅ AUMENTAR USO — ESTE ES EL LUGAR
                incrementChallengeUsage(tId, desafioIndex);

                // guarda la elección del equipo (no cambia de fase)
                saveTeamChoice(
                  activeRoom,
                  myTeamName,
                  String(tId),
                  Number(desafioIndex),
                  true
                );

                setConfirmed(true);
                alert("¡Desafío confirmado para tu equipo!");
              };

              return (
                <ThemeChallengeSection
                  THEMES={THEMES}
                  temaSel={temaSel}
                  setTemaSel={setTemaSel}
                  desafioIndex={desafioIndex}
                  setDesafioIndex={setDesafioIndex}
                  desafioActual={desafioActual}
                  isTablet={isTablet}
                  // IMPORTANTE: aquí no avanzamos la fase. Solo confirmamos.
                  onContinue={confirmChoice}
                  confirmLabel="Elegir desafío"
                  confirmed={confirmed}
                  hideConfirm={false} // mostrar botón azul en alumno
                />
              );
            })()}
          {mode === "alumno" && flow.step === "f2_instrucciones" && (
            <>
              <Card
                title="Instrucciones"
                subtitle="Fase 2 — Empatía"
                width={1100}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 16,
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 10 }}>
                    Instrucciones del equipo
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6 }}>
                    <li>
                      En esta etapa trabajarán con el <b>Mapa de Empatía</b>.
                    </li>
                    <li>
                      Seleccionen un <b>usuario real</b> relacionado con el
                      desafío asignado.
                    </li>
                    <li>
                      Piensen en lo que esa persona{" "}
                      <b>piensa, siente, ve, dice y hace</b>.
                    </li>
                    <li>
                      Completen las burbujas del mapa con frases breves que
                      representen sus ideas.
                    </li>
                    <li>
                      Coordinen: una persona escribe mientras el resto propone y
                      valida.
                    </li>
                    <li>
                      Sean creativos y trabajen en equipo, ¡cada aporte cuenta!
                    </li>
                  </ol>
                </div>

                {/* Indicador de tiempo */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 12,
                  }}
                >
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
              </div>
            </>
          )}

          {flow.step === "f2_activity" && (
            <Card
              title={`Etapa 2 — ${THEMES[temaSel]?.label || "—"}: ${
                THEMES[temaSel]?.desafios?.[desafioIndex]?.titulo || "Desafío"
              }`}
              subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`}
              width={1100}
            >
              {/* ✅ Bloque de descripción del desafío para alumnos */}
              <div
                style={{
                  background: theme.surfaceAlt,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 14,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontWeight: 900,
                    color: theme.azul,
                    marginBottom: 4,
                  }}
                >
                  Desafío seleccionado
                </div>

                <div style={{ marginBottom: 4 }}>
                  <b>{THEMES[temaSel]?.label}</b> —{" "}
                  {THEMES[temaSel]?.desafios?.[desafioIndex]?.titulo}
                </div>

                <div style={{ fontSize: 14, lineHeight: 1.35 }}>
                  {THEMES[temaSel]?.desafios?.[desafioIndex]?.descripcion}
                </div>
              </div>
              {/* ✅ Fin bloque descripción */}

              <EmpathySection
  isTablet={isTablet}
  isMobile={isMobile}
  bubbleSize={bubbleSize}
  centerBubbleSize={centerBubbleSize}
  EMPATIA_FIELDS={EMPATIA_FIELDS}
  empatia={empatia}
  setActiveBubble={setActiveBubble}
  activeBubble={activeBubble}
  onEmpatiaChange={onEmpatiaChange}
  personaImg={THEMES[temaSel]?.desafios?.[desafioIndex]?.img}  />
            </Card>
          )}

          {flow.step === "f2_rank" && (
            <Card
              title="Ranking — Fase 2"
              subtitle="Resultados en vivo"
              width={900}
            >
              <RankingBars
                data={ranking}
                onContinue={() => setStep("f3_video")}
                isTeacher={isTeacher} // Corregido: pasar isTeacher
              />
            </Card>
          )}
          {flow.step === "f3_video" && <CreatividadAnimacion loop />}
          {flow.step === "f3_instr" && (
            <>
              <Card
                title="Instrucciones"
                subtitle="Fase 3 — Guía del alumno"
                width={1100}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 16,
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 10 }}>
                    Guía del alumno
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6 }}>
                    <li>
                      ¡Manos a la obra! Usen el <b>kit de LEGOs</b> que se les proporcionará para construir su prototipo.
                    </li>
                    <li>
                      Materialicen su solución física basándose en el problema que identificaron.
                    </li>
                    <li>
                      ¿Se atreven? Usen la <b>Ruleta de Desafío (Opcional)</b> que aparecerá en la siguiente pantalla para ganar Tokens extra o recibir un reto.
                    </li>
                    <li>
                      Al terminar, deberán subir una foto de su creación y marcar los puntos cumplidos.
                    </li>
                  </ol>
                </div>
              </Card>
            </>
          )}

{/* FASE 3: CREATIVIDAD (ALUMNO) */}
{mode === "alumno" && flow.step === "f3_activity" && (
            <Card
              title="Creatividad en Acción"
              subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`}
              width={900}
            >
              <div style={{ marginBottom: 20 }}>
                <Btn
                  label="🎲 Girar Ruleta de Desafío (Opcional)"
                  onClick={() => setShowLegoRoulette(true)}
                  bg="#9C27B0"
                />
              </div>
              {showLegoRoulette && (
<RuletaDesafioLego
  onClose={() => setShowLegoRoulette(false)}
  esProfesor={false}
  onTokenChange={(delta) => {
    setCoins((c) => c + delta);
    if (myTeamId) updateTeamScore(myTeamId, delta);
  }}
  items={rouletteConfig} 
  maxSpins={maxSpins}
  teamName={groupName || "Equipo"}
/>
              )}
              
              <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", gap: 20, alignItems: "start", textAlign: "left" }}>
                
                <div style={{ background: "#F8F9FA", padding: 16, borderRadius: 12, border: "1px solid #E3E8EF" }}>
                    <div style={{ fontWeight: 800, marginBottom: 8, color: theme.azul }}>1. Sube tu prototipo</div>
                    <p style={{fontSize: 13, marginBottom: 12, color: "#666"}}>Toma una foto clara de tu construcción LEGO.</p>
                    
                    <label style={{ 
                        display: 'block', padding: 20, border: '2px dashed #ccc', borderRadius: 12, 
                        textAlign: 'center', cursor: 'pointer', background: '#fff' 
                    }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{display: 'none'}}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const dataUrl = String(reader.result || "");
                              const teamName = teamId.split("::")[1] || "Equipo";
                              saveTeamPhoto(activeRoom, teamName, dataUrl);
                              alert("¡Foto guardada!");
                              
                              // Lógica automática: Marcar "Foto clara" si no estaba marcada
                              // Busca el valor dinámico configurado por el admin para el ítem "foto"
                              const photoItem = checklistConfig.find((i:any) => i.id === 'foto');
                              const val = photoItem ? (photoItem.value || 3) : 3;

                              if (!completedTasks["foto"]) {
                                  setCompletedTasks(prev => ({ ...prev, "foto": true }));
                                  setCoins(c => c + val);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <span style={{fontWeight: 700, color: theme.azul}}>📷 Seleccionar archivo</span>
                    </label>
                </div>

                {/* LADO DERECHO: CHECKLIST DINÁMICO */}
                <div>
                  <div style={{ fontWeight: 800, marginBottom: 8, color: theme.azul }}>2. Checklist de Calidad</div>
                  <p style={{fontSize: 13, marginBottom: 12, color: "#666"}}>Marca los hitos cumplidos:</p>
                  
                  <div style={{ display: "grid", gap: 10 }}>
                    {/* Iteramos sobre la configuración dinámica del Admin */}
                    {checklistConfig.map((item: any) => {
                        const isDone = !!completedTasks[item.id];
                        const val = item.value || 0;


const toggleTask = () => {
    if (item.id === 'foto') return; 
    
    const newState = !isDone;
    setCompletedTasks(prev => ({ ...prev, [item.id]: newState }));
    
    const delta = newState ? val : -val;
    
    setCoins(c => c + delta); 
    
    if (myTeamId) {
        updateTeamScore(myTeamId, delta);
    }
};
                        return (
                          <div 
                            key={item.id}
                            onClick={toggleTask}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: "12px 16px", borderRadius: 10,
                                background: isDone ? "#E8F5E9" : "#FFEBEE",
                                border: `1px solid ${isDone ? "#4CAF50" : "#FFCDD2"}`,
                                cursor: item.id === 'foto' ? "default" : "pointer",
                                transition: "all 0.2s ease"
                            }}
                          >
                              <div style={{
                                  width: 24, height: 24, borderRadius: 6,
                                  background: isDone ? "#4CAF50" : "#fff",
                                  border: `2px solid ${isDone ? "#4CAF50" : "#F44336"}`,
                                  display: "grid", placeItems: "center",
                                  color: isDone ? "#fff" : "#F44336",
                                  fontWeight: 900, fontSize: 14, flexShrink: 0
                              }}>
                                  {isDone ? "✓" : "✕"}
                              </div>
                              <div style={{flex:1}}>
                                  <span style={{ fontWeight: 600, color: isDone ? "#2E7D32" : "#C62828", fontSize: 14, display:'block' }}>
                                      {item.label}
                                  </span>
                                  <span style={{fontSize: 11, color: '#666'}}>
                                      Recompensa: {val} Monedas
                                  </span>
                              </div>
                          </div>
                        );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {flow.step === "f3_rank" && (
            <Card
              title="Ranking — Fase 3"
              subtitle="Resultados en vivo"
              width={900}
            >
              <RankingBars
                data={ranking}
                onContinue={() => setStep("f4_video")}
                isTeacher={isTeacher}
              />
            </Card>
          )}

          {flow.step === "f4_video" && <PitchAnimacion />}

{/* FASE 4: INSTRUCCIONES ALUMNO (TIEMPO DINÁMICO) */}
{flow.step === "f4_instr" && (
            <>
              <Card
                title="Instrucciones"
                subtitle="Fase 4 — Guía del alumno"
                width={1100}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    padding: 16,
                    textAlign: "left"
                  }}
                >
                  <h4 style={{ color: "#9E007E", marginBottom: 10, marginTop: 0 }}>
                    Instrucciones del equipo
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6, fontSize: 16 }}>
                    <li>
                      Preparen un <b>Pitch de {flow.pitchSeconds || 90} segundos</b> siguiendo la rúbrica.
                    </li>
                    <li>
                      Asegúrense de que su foto de prototipo haya sido subida en la fase anterior.
                    </li>
                    <li>
                      Esperen a que el profesor inicie el tiempo de preparación.
                    </li>
                  </ol>
                </div>
              </Card>
              
              <div style={{ marginTop: 20, textAlign: 'center', opacity: 0.7, fontSize: 14 }}>
                 ⏳ Esperando inicio de la preparación...
              </div>
            </>
          )}

          {flow.step === "f4_prep" && (
            <Card
              title="Etapa 4 — Comunicación (preparación)"
              subtitle={`Tiempo: ${mmss(flow.remaining)}`}
              width={1100}
              tight
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isTablet ? "1fr" : "380px 1fr",
                  gap: 12,
                  textAlign: "left",
                }}
              >
                <div style={{ ...panelBox }}>
                  <div style={badgeTitle}>Estructura recomendada</div>
                  <ol style={{ marginTop: 0, paddingLeft: 18 }}>
                    <li>
                      <b>Hook</b> (problema en 1 frase)
                    </li>
                    <li>
                      <b>Usuario</b> y evidencia breve
                    </li>
                    <li>
                      <b>Solución</b> y cómo funciona
                    </li>
                    <li>
                      <b>Valor</b> (qué mejora, métricas)
                    </li>
                    <li>
                      <b>Impacto</b> y próximos pasos
                    </li>
                  </ol>
                </div>
                <div style={{ ...panelBox }}>
                  <div style={badgeTitle}>Borrador del pitch</div>
                  <textarea
                    placeholder="Escribe tu pitch..."
                    style={{ ...baseInput, minHeight: 260 }}
                  />
                </div>
              </div>
              {/* Eliminamos el botón de avance del alumno */}
            </Card>
          )}
          {/* === ALUMNO: ver resultado de la ruleta (dos columnas) === */}
          {flow.step === "f4_wheel" && (
            <RuedaPresentacion
              flujo={flow}
              equiposTotal={getTeamsForRoom(analytics, activeRoom)}
              publicar={isTeacher ? publish : () => {}}
              setStep={isTeacher ? setStep : () => {}}
              resetTimer={isTeacher ? resetTimer : () => {}}
              // PROPS NECESARIAS PARA QUE EL PROFESOR PUEDA CONTROLAR EL GIRO
              isProfesor={isTeacher}
            />
          )}

          {/* === ALUMNO: ver el PITCH (equipo actual + foto + orden) === */}
          {flow.step === "f4_present" && mode === "alumno" && (
            <Card
              title="Presentación en curso"
              subtitle={`Tiempo: ${mmss(flow.remaining)} — Orden visible`}
              width={980}
            >
              {(() => {
                // =============== CONTEXT VARIABLES ===============
                const currentTeam = flow.presentOrder?.[flow.currentIdx ?? 0] ?? "-";
                const myTeam = groupName || "(sin-nombre)";
                const isSelf = currentTeam === myTeam;

                const teamData = remoteTeams.find((t: any) => t.nombre === currentTeam);
                const photo = teamData?.foto || ""; 

const submitEval = async () => {
  if (isSelf || sent) return;

  const targetId = await getTeamIdByName(activeRoom, currentTeam);

  if (myTeamId && targetId) {
      const totalPoints = scores.reduce((sum, n) => sum + n, 0);
      
      await submitPeerEvaluation({
          origenId: myTeamId,
          destinoId: targetId,
          puntaje: totalPoints,
          detalleJson: JSON.stringify(scores),
          comentario: "Evaluación de pares"
      });

      setSent(true);
      alert("Evaluación enviada al servidor.");
  } else {
      alert("Error: No se pudo identificar al equipo destino.");
  }
};

                // =============== UI RETURN ===============
                return (
                  <div style={{ display: "grid", gap: 12 }}>
                    {/* ORDEN === */}
                    <div style={{ ...panelBox }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontWeight: 900, color: theme.azul }}>
                          Orden de presentación
                        </div>
                        <Btn
                          label={showOrder ? "Ocultar" : "Mostrar"}
                          full={false}
                          onClick={() => setShowOrder((v) => !v)}
                        />
                      </div>

                      {showOrder && flow.presentOrder?.length > 0 && (
                        <ol style={{ margin: 0, paddingLeft: 18 }}>
                          {flow.presentOrder.map((t, i) => (
                            <li
                              key={i}
                              style={{
                                fontWeight: i === flow.currentIdx ? 900 : 500,
                                color:
                                  i === flow.currentIdx
                                    ? theme.rosa
                                    : undefined,
                              }}
                            >
                              {t}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>

                    {/* FOTO === */}
                    <div style={{ ...panelBox }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontWeight: 900, color: theme.azul }}>
                          Prototipo del equipo
                        </div>
                        <Btn
                          label={showPhoto ? "Ocultar foto" : "Ver foto"}
                          full={false}
                          onClick={() => setShowPhoto((v) => !v)}
                        />
                      </div>

                      {showPhoto &&
                        (photo ? (
                          <img
                            src={photo}
                            alt={`Prototipo ${currentTeam}`}
                            style={{
                              maxWidth: "100%",
                              borderRadius: 12,
                              border: `1px solid ${theme.border}`,
                              marginTop: 8,
                              objectFit: "contain",
                              background: "#fff",
                            }}
                          />
                        ) : (
                          <div style={{ opacity: 0.7, marginTop: 8 }}>
                            Aún no hay foto subida por este equipo.
                          </div>
                        ))}
                    </div>

                    {/* EVALUACIÓN === */}
                    <div style={{ ...panelBox }}>
                      <div
                        style={{
                          fontWeight: 900,
                          color: theme.azul,
                          marginBottom: 6,
                        }}
                      >
                        Evalúa esta presentación
                      </div>

                      {isSelf ? (
                        <div style={{ opacity: 0.7 }}>
                          No evalúas a tu propio equipo.
                        </div>
                      ) : sent ? (
                        <div style={{ color: "#2E7D32", fontWeight: 700 }}>
                          ¡Gracias! Tu evaluación fue enviada.
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "grid", gap: 12 }}>
                            {[
                              "Claridad",
                              "Valor de la solución",
                              "Viabilidad",
                              "Creatividad",
                              "Trabajo en equipo",
                              "Impacto",
                            ].map((lbl, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "180px 1fr",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <div style={{ fontSize: 13 }}>{lbl}</div>
                                <ScoreSlider
                                  value={scores[idx]}
                                  onChange={(v) =>
                                    setScores((arr) =>
                                      arr.map((x, i) => (i === idx ? v : x))
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              marginTop: 12,
                            }}
                          >
                            <Btn
                              label="Enviar evaluación de este equipo"
                              full={false}
                              onClick={submitEval}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Card>
          )}

{flow.step === "f5_podium" && (
            <Card title="Resultados Finales" width={900}>
                {podiumPhase === 'drumroll' ? (
                    <div style={{padding: 40}}>
                        <div style={{fontSize: 80, animation: 'drumroll 0.1s infinite'}}>🥁</div>
                        <h2 style={{color: theme.azul}}>Calculando puntajes...</h2>
                    </div>
                ) : (
                    <div style={{animation: 'pulse 0.5s ease-out'}}>
                        <ConfettiBurst /> 
                        <div style={{fontSize: 20, marginBottom: 10, opacity: 0.8}}>El equipo ganador es...</div>
                        <h1 style={{fontSize: 48, color: theme.amarillo, fontWeight: 900, margin: "10px 0"}}>
                            🏆 {ranking[0]?.equipo || "..."} 🏆
                        </h1>
                        <h2 style={{color: theme.texto}}>
                            {ranking[0]?.total} Tokens
                        </h2>
                        
                        {/* Mostrar ranking completo */}
                        <div style={{marginTop: 20}}>
                           <RankingBars data={ranking} isTeacher={isTeacher} />
                        </div>

                        {isTeacher && (
                            <Btn onClick={() => setStep("f5_video")} label="Ir al Cierre" style={{marginTop: 20}} />
                        )}
                    </div>
                )}
            </Card>
          )}

          {flow.step === "f5_video" && (
            <Card
              title="Cierre: Resumen de la Misión"
              subtitle="Habilidades Activas: Empatía, Equipo, Creatividad, Comunicación"
              width={900}
            >
              <div style={{ padding: 20, textAlign: 'left' }}>
                  <h3 style={{ color: theme.azul, marginTop: 0 }}>¡Misión Cumplida!</h3>
                  <p>Hoy navegaste por 4 fases clave del emprendimiento:</p>
                  <ul style={{ paddingLeft: 20, margin: 0, fontSize: 15, lineHeight: 1.6 }}>
                      <li><b>Fase 1 (Equipo):</b> Lograste la coordinación y roles claros.</li>
                      <li><b>Fase 2 (Empatía):</b> Identificaste un problema real en un usuario mapeando sus necesidades.</li>
                      <li><b>Fase 3 (Creatividad):</b> Materializaste una solución innovadora en un prototipo LEGO.</li>
                      <li><b>Fase 4 (Comunicación):</b> Presentaste tu idea de forma concisa y persuasiva (Pitch).</li>
                  </ul>
                  <p style={{ marginTop: 15 }}>A continuación, realizarás una autoevaluación personal sobre tu desempeño en estas áreas. ¡Recuerda, cada desafío es una oportunidad de crecimiento!</p>
              </div>
            </Card>
          )}

{flow.step === "pre_qr_reflex" && (
  <CierreReflexion 
    onContinue={() => publish({ ...flow, step: "qr" })} 
  />
)}
{flow.step === "qr" && (
            <Card
              title="¡Evalúa el juego!"
              subtitle="Escanea el código QR con tu celular"
              width={700}
            >
              <div
                style={{
                  width: 260,
                  height: 260,
                  margin: "12px auto",
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <img 
                  src={imgQR} 
                  alt="QR Code"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain" 
                  }}
                />
              </div>
              
              <div style={{ marginTop: 20, fontSize: 14, color: "#666" }}>
                ¡Gracias por participar!
              </div>
            </Card>
          )}
        </AutoCenter>
      </div>
    );
  }

  return null;
}

// ===================== UTILS Y COMPONENTES AUXILIARES =====================

/* --- UTILS --- */
function useMediaQuery(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const h = () => setM(mq.matches);
    h();
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [q]);
  return m;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* sumar monedas a un equipo arbitrario (no necesariamente el propio) */
function awardCoinsToTeam(roomCode: string, teamName: string, delta: number) {
  if (!roomCode || !teamName || !delta) return;
  const map = readJSON<Record<string, number>>(COINS_KEY, {});
  const key = `${roomCode}::${teamName}`;
  map[key] = (map[key] || 0) + delta;
  writeJSON(COINS_KEY, map);
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: COINS_KEY,
        newValue: JSON.stringify(map),
      })
    );
  } catch {}
}

function ThemeEditor({ THEMES, setTHEMES, flow, publish }: any) {
  const [activeTab, setActiveTab] = React.useState<"times" | "content">("content");
  const [selectedTheme, setSelectedTheme] = React.useState<string>("salud");
  const [openChallengeIdx, setOpenChallengeIdx] = React.useState<number | null>(null);
  
  const [showCropper, setShowCropper] = React.useState(false);
  const [cropperTargetIdx, setCropperTargetIdx] = React.useState<number | null>(null);

  const [f0Sec, setF0Sec] = useState(flow.f0Seconds ?? 180);
  const [f1Sec, setF1Sec] = useState(flow.f1Seconds ?? 300);
  const [f2Sec, setF2Sec] = useState(flow.f2Seconds ?? 300);
  const [f3Sec, setF3Sec] = useState(flow.f3Seconds ?? 900);
  const [f4PrepSec, setF4PrepSec] = useState(flow.f4PrepSeconds ?? 600);
  const [pitchSec, setPitchSec] = useState(flow.pitchSeconds ?? 90);

const saveAll = () => {
    if (publish) {
        publish({ 
            f0Seconds: f0Sec, 
            f1Seconds: f1Sec, 
            f2Seconds: f2Sec, 
            f3Seconds: f3Sec, 
            f4PrepSeconds: f4PrepSec, 
            pitchSeconds: pitchSec 
        });
        alert("¡Tiempos de la sesión actual actualizados!");
    } else {
        alert("⚠️ Aviso: Los tiempos solo se pueden guardar cuando estás dentro de una sala activa.");
    }
};

  const updateChallenge = (idx: number, field: string, val: string) => {
    const newThemes = { ...THEMES };
    newThemes[selectedTheme].desafios[idx][field] = val;
    setTHEMES(newThemes);
  };

  const handleImageSave = (dataUrl: string) => {
    if (cropperTargetIdx === null) return;
    const newThemes = { ...THEMES };
    newThemes[selectedTheme].desafios[cropperTargetIdx].img = dataUrl; 
    setTHEMES(newThemes);
    setShowCropper(false);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {showCropper && <ImageCropper onCancel={() => setShowCropper(false)} onSave={handleImageSave} />}

      <div style={{ border: `2px solid ${theme.azul}`, borderRadius: 16, overflow: "hidden", background: "#fff" }}>
        <button 
          onClick={() => setActiveTab(activeTab === "times" ? "content" : "times")}
          style={{ width: "100%", padding: 16, background: "#E3F2FD", border: "none", textAlign: "left", fontWeight: 900, color: theme.azul, display: "flex", justifyContent: "space-between", cursor: "pointer", fontSize: 16 }}
        >
          <span>⏱️ Ajustes de Tiempos</span>
          <span>{activeTab === "times" ? "▲" : "▼"}</span>
        </button>
        
        {activeTab === "times" && (
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div><label style={{fontWeight:700}}>F0: Rompehielos ({Math.floor(f0Sec/60)} min)</label><input type="range" min={60} max={600} step={30} value={f0Sec} onChange={e => setF0Sec(Number(e.target.value))} style={{ width: '100%' }} /></div>
            <div><label style={{fontWeight:700}}>F1: Diferencias ({Math.floor(f1Sec/60)} min)</label><input type="range" min={60} max={900} step={30} value={f1Sec} onChange={e => setF1Sec(Number(e.target.value))} style={{ width: '100%' }} /></div>
            <div><label style={{fontWeight:700}}>F2: Bubble Map ({Math.floor(f2Sec/60)} min)</label><input type="range" min={60} max={900} step={30} value={f2Sec} onChange={e => setF2Sec(Number(e.target.value))} style={{ width: '100%' }} /></div>
            <div><label style={{fontWeight:700}}>F3: Creatividad ({Math.floor(f3Sec/60)} min)</label><input type="range" min={300} max={1800} step={30} value={f3Sec} onChange={e => setF3Sec(Number(e.target.value))} style={{ width: '100%' }} /></div>
            <div><label style={{fontWeight:700}}>F4: Prep. Pitch ({Math.floor(f4PrepSec/60)} min)</label><input type="range" min={300} max={1200} step={30} value={f4PrepSec} onChange={e => setF4PrepSec(Number(e.target.value))} style={{ width: '100%' }} /></div>
            <div><label style={{fontWeight:700}}>F4: Duración Pitch ({pitchSec} seg)</label><input type="range" min={30} max={300} step={15} value={pitchSec} onChange={e => setPitchSec(Number(e.target.value))} style={{ width: '100%' }} /></div>
          </div>
        )}
      </div>

      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 16, overflow: "hidden", background: "#fff" }}>
        <button 
          onClick={() => setActiveTab(activeTab === "content" ? "times" : "content")}
          style={{ width: "100%", padding: 16, background: "#F5F5F5", border: "none", textAlign: "left", fontWeight: 900, color: "#333", display: "flex", justifyContent: "space-between", cursor: "pointer", fontSize: 16 }}
        >
          <span>🎯 Gestión de Contenido</span>
          <span>{activeTab === "content" ? "▲" : "▼"}</span>
        </button>

        {activeTab === "content" && (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 10 }}>
              {Object.keys(THEMES).map(k => (
                <button key={k} onClick={() => { setSelectedTheme(k); setOpenChallengeIdx(null); }}
                  style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 700, border: "none", background: selectedTheme === k ? theme.azul : "#eee", color: selectedTheme === k ? "#fff" : "#666" }}
                >
                  {THEMES[k].label}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {THEMES[selectedTheme].desafios.map((d: any, i: number) => {
                const isOpen = openChallengeIdx === i;
                return (
                  <div key={i} style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
                    <div 
                      onClick={() => setOpenChallengeIdx(isOpen ? null : i)}
                      style={{ padding: "12px 16px", background: isOpen ? "#E3F2FD" : "#fff", cursor: "pointer", fontWeight: 600, display: "flex", justifyContent: "space-between" }}
                    >
                      <span>Desafío {i + 1}: {d.titulo.substring(0, 40)}...</span>
                      <span>{isOpen ? "▲" : "▼"}</span>
                    </div>

                    {isOpen && (
                      <div style={{ padding: 16, background: "#fff", borderTop: "1px solid #eee" }}>
                        <label style={{display:'block', fontSize:12, fontWeight:700, marginBottom:4}}>Título del Desafío</label>
                        <input value={d.titulo} onChange={e => updateChallenge(i, 'titulo', e.target.value)} style={{...baseInput, marginBottom: 12}} />
                        
                        <label style={{display:'block', fontSize:12, fontWeight:700, marginBottom:4}}>Descripción (Historia del usuario)</label>
                        <textarea value={d.descripcion} onChange={e => updateChallenge(i, 'descripcion', e.target.value)} style={{...baseInput, minHeight: 100, marginBottom: 12}} />

                        {/* SUBIDA DE IMAGEN */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#FAFAFA', padding: 12, borderRadius: 10, border: "1px dashed #ccc" }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eee', overflow: 'hidden', flexShrink: 0, border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                                {d.img ? <img src={d.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" /> : <span style={{display:'grid', placeItems:'center', height:'100%', fontSize:10}}>Sin Foto</span>}
                            </div>
                            <div>
                                <div style={{fontWeight: 700, fontSize: 13, marginBottom: 4}}>Foto de la Persona</div>
                                <button 
                                  onClick={() => { setCropperTargetIdx(i); setShowCropper(true); }}
                                  style={{ background: theme.rosa, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                                >
                                  📷 Cargar / Ajustar
                                </button>
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <Btn label="💾 Guardar Cambios" onClick={saveAll} full={false} />
      </div>
    </div>
  );
}
const PROFS_KEY = "udd_professors_db_v1";
const SESSIONS_KEY = "udd_sessions_log_v1";

// Componente Dashboard Admin (Completo con Gestión de Usuarios y Sesiones)
function AdminDashboard({
  analytics, THEMES, setTHEMES, flow, onBack, ranking, clearMetrics, activeRoom, publish,
  rouletteConfig, saveRouletteConfig,
  checklistConfig, saveChecklistConfig
}: any) {
  const [tab, setTab] = useState<"resumen" | "profesores" | "sesiones" | "temas" | "ruleta" | "checklist" | "analitica">("resumen");

  // --- ESTADO PROFESORES ---
  const [professors, setProfessors] = useState<any[]>(() => readJSON(PROFS_KEY, [
      { id: "admin", name: "Administrador", user: "admin", pass: "admin", isAdmin: true },
      { id: "demo", name: "Profesor Demo", user: "prof", pass: "prof", isAdmin: false }
  ]));
  const [newProf, setNewProf] = useState({ name: "", user: "", pass: "" });

  // --- ESTADO SESIONES ---
  const [sessions, setSessions] = useState<any[]>(() => readJSON(SESSIONS_KEY, []));
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // --- HELPERS PROFESORES ---
  const saveProfs = (list: any[]) => {
      setProfessors(list);
      writeJSON(PROFS_KEY, list);
  };
  const addProf = () => {
      if (!newProf.name || !newProf.user || !newProf.pass) return alert("Completa todos los campos");
      if (professors.some(p => p.user === newProf.user)) return alert("El usuario ya existe");
      saveProfs([...professors, { ...newProf, id: Date.now().toString(), isAdmin: false }]);
      setNewProf({ name: "", user: "", pass: "" });
      alert("Profesor creado exitosamente.");
  };
  const deleteProf = (id: string) => {
      if (confirm("¿Eliminar este perfil de profesor?")) {
          saveProfs(professors.filter(p => p.id !== id));
      }
  };

  // --- HELPER SESIONES ---
  // Obtener equipos de una sesión específica (histórico)
  const getSessionTeams = (code: string) => {
      return analytics.teams.filter((t: any) => t.roomCode === code);
  };

  return (
    <Card title="Panel de Administrador Maestro" subtitle="Gestión Global" width={1100}>
      
      {/* MENU DE NAVEGACIÓN */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, borderBottom:'1px solid #eee', paddingBottom:15 }}>
        {[
            ["resumen", "📊 Resumen"],
            ["profesores", "👨‍🏫 Profesores"],
            ["sesiones", "📅 Historial Sesiones"],
            ["temas", "🎯 Contenido"],
            ["ruleta", "🎡 Ruleta"],
            ["checklist", "✅ Checklist"],
            ["analitica", "📈 Datos"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k as any)}
            style={{
              padding: "8px 14px", borderRadius: 8, border: "none",
              background: tab === k ? theme.azul : "#F1F5F9",
              color: tab === k ? "#fff" : "#475569", fontWeight: 700, cursor: "pointer"
            }}
          >
            {label}
          </button>
        ))}
        <div style={{marginLeft:'auto'}}>
            <Btn label="Salir" onClick={onBack} bg="#333" full={false} />
        </div>
      </div>

      {/* --- PESTAÑA: RESUMEN --- */}
      {tab === "resumen" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }}>
           <div style={{...panelBox, textAlign:'center'}}>
               <div style={{fontSize:32, fontWeight:900, color:theme.azul}}>{professors.length}</div>
               <div style={{fontSize:12, color:'#666'}}>Usuarios Registrados</div>
           </div>
           <div style={{...panelBox, textAlign:'center'}}>
               <div style={{fontSize:32, fontWeight:900, color:theme.rosa}}>{sessions.length}</div>
               <div style={{fontSize:12, color:'#666'}}>Sesiones Realizadas</div>
           </div>
           <div style={{...panelBox, textAlign:'center'}}>
               <div style={{fontSize:32, fontWeight:900, color:theme.verde}}>{analytics.teams.length}</div>
               <div style={{fontSize:12, color:'#666'}}>Equipos Totales Históricos</div>
           </div>
        </div>
      )}

      {/* --- PESTAÑA: GESTIÓN DE PROFESORES --- */}
      {tab === "profesores" && (
          <div style={{textAlign:'left'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
                  {/* Lista */}
                  <div style={panelBox}>
                      <h4 style={{marginTop:0}}>Listado de Docentes</h4>
                      <div style={{display:'grid', gap:8}}>
                          {professors.map(p => (
                              <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, border:'1px solid #eee', borderRadius:8}}>
                                  <div>
                                      <div style={{fontWeight:700}}>{p.name} {p.isAdmin && "👑"}</div>
                                      <div style={{fontSize:12, color:'#666'}}>User: {p.user}</div>
                                  </div>
                                  {!p.isAdmin && (
                                      <button onClick={()=>deleteProf(p.id)} style={{color:'red', background:'transparent', border:'none', cursor:'pointer', fontWeight:'bold'}}>Eliminar</button>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Crear Nuevo */}
                  <div style={{...panelBox, height:'fit-content'}}>
                      <h4 style={{marginTop:0, color:theme.azul}}>Registrar Nuevo Profesor</h4>
                      <div style={{display:'grid', gap:10}}>
                          <input placeholder="Nombre Completo" value={newProf.name} onChange={e=>setNewProf({...newProf, name:e.target.value})} style={baseInput} />
                          <input placeholder="Usuario" value={newProf.user} onChange={e=>setNewProf({...newProf, user:e.target.value})} style={baseInput} />
                          <input placeholder="Contraseña" value={newProf.pass} onChange={e=>setNewProf({...newProf, pass:e.target.value})} style={baseInput} />
                          <Btn label="Crear Cuenta" onClick={addProf} />
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- PESTAÑA: HISTORIAL DE SESIONES --- */}
      {tab === "sesiones" && (
          <div style={{textAlign:'left', display:'grid', gridTemplateColumns: selectedSession ? '1fr 1fr' : '1fr', gap:20}}>
              {/* Lista de Sesiones */}
              <div style={panelBox}>
                  <h4 style={{marginTop:0}}>Historial de Partidas</h4>
                  <div style={{maxHeight:400, overflowY:'auto', display:'grid', gap:8}}>
                      {sessions.slice().reverse().map((s, i) => (
                          <div 
                            key={i} 
                            onClick={()=>setSelectedSession(s)}
                            style={{
                                padding:12, border: `1px solid ${selectedSession === s ? theme.azul : '#eee'}`, 
                                borderRadius:8, cursor:'pointer', background: selectedSession === s ? '#E3F2FD' : '#fff'
                            }}
                          >
                              <div style={{fontWeight:700, display:'flex', justifyContent:'space-between'}}>
                                  <span>Sala: {s.roomCode}</span>
                                  <span style={{fontSize:12, color:'#666'}}>{new Date(s.timestamp).toLocaleDateString()}</span>
                              </div>
                              <div style={{fontSize:12, color:'#555'}}>
                                  Profesor: <b>{s.profName}</b>
                              </div>
                          </div>
                      ))}
                      {sessions.length === 0 && <div style={{opacity:0.6}}>No hay sesiones registradas aún.</div>}
                  </div>
              </div>

              {/* Detalles de la Sesión */}
              {selectedSession && (
                  <div style={panelBox}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                        <h4 style={{margin:0, color:theme.azul}}>Detalle Sala {selectedSession.roomCode}</h4>
                        <button onClick={()=>setSelectedSession(null)} style={{background:'transparent', border:'none', cursor:'pointer'}}>✕</button>
                      </div>
                      
                      <div style={{marginBottom:15, fontSize:13}}>
                          <div>📅 <b>Fecha:</b> {new Date(selectedSession.timestamp).toLocaleString()}</div>
                          <div>👨‍🏫 <b>Profesor:</b> {selectedSession.profName}</div>
                          <div>👥 <b>Equipos:</b> {getSessionTeams(selectedSession.roomCode).length}</div>
                      </div>

                      <div style={{display:'grid', gap:8, maxHeight:300, overflowY:'auto'}}>
                          {getSessionTeams(selectedSession.roomCode).map((t:any, i:number) => (
                              <div key={i} style={{padding:10, background:'#f9f9f9', borderRadius:8, border:'1px solid #eee'}}>
                                  <div style={{fontWeight:700}}>{t.teamName}</div>
                                  <ul style={{margin:'5px 0 0 0', paddingLeft:20, fontSize:12}}>
                                      {t.integrantes.map((m:any, j:number) => (
                                          <li key={j}>{m.nombre} ({m.carrera})</li>
                                      ))}
                                  </ul>
                              </div>
                          ))}
                          {getSessionTeams(selectedSession.roomCode).length === 0 && (
                              <div style={{fontSize:12, color:'#999', fontStyle:'italic'}}>
                                  No se encontraron registros de equipos para esta sala.
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- OTRAS PESTAÑAS (Reutilizadas) --- */}
      {tab === "temas" && <ThemeEditor THEMES={THEMES} setTHEMES={setTHEMES} flow={flow} publish={publish} />}
      {tab === "ruleta" && <RouletteEditor items={rouletteConfig} setItems={saveRouletteConfig} maxSpins={0} setMaxSpins={()=>{}} />}
      {tab === "checklist" && <ChecklistEditor items={checklistConfig} setItems={saveChecklistConfig} />}
      {tab === "analitica" && <AdminAnalytics />}
    </Card>
  );
}
// ===================== UTILS Y COMPONENTES AUXILIARES (DEFINICIONES) =====================

/* Componente ConfettiBurst (Completo) */
const ConfettiBurst: React.FC = () => {
  const [items, setItems] = useState<
    { id: number; left: number; delay: number; emoji: string }[]
  >([]);
  useEffect(() => {
    const EMOJIS = ["🎉", "🎊", "✨", "🏆", "🎈", "💥", "⭐"];
    const arr = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));
    setItems(arr);
    const t = setTimeout(() => setItems([]), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: -20,
            left: `${p.left}%`,
            fontSize: 22,
            animation: `fall ${1.8 + Math.random() * 0.9}s ease-in ${
              p.delay
            }s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};


/* Componente RankingBars (Completo) */
function RankingBars({
  data, onContinue, isTeacher,
}: {
  data: { equipo: string; total: number }[];
  onContinue?: () => void;
  isTeacher: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const max = Math.max(1, ...data.map((d) => d.total || 0));

  return (
    <>
      <div style={{ ...panelBox }}>
        {data.length === 0 && (
          <div style={{ opacity: 0.7 }}>Aún no hay datos de equipos…</div>
        )}
        {data.map((r, i) => {
          const pct = Math.round((r.total / max) * 100);
          const isFirst = i === 0;
          const isLast = i === data.length - 1;
          const secondOrThird = !isFirst && i < 3;
          const barBg = isFirst
            ? `linear-gradient(90deg, ${theme.amarillo}, #FFF59D, ${theme.amarillo})`
            : secondOrThird
            ? `linear-gradient(90deg, ${theme.azul}22, ${theme.azul}66)`
            : "#CFD8DC";
          return (
            <div
              key={r.equipo}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr 90px",
                gap: 8,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 900, fontSize: 18, color: theme.blanco, textShadow: "0 1px 2px rgba(0,0,0,.3)",
                }}
              >
                {i + 1}
                {isFirst && (
                  <div
                    style={{
                      fontSize: 22, lineHeight: "16px",
                      animation: "crownFloat 1.6s ease-in-out infinite",
                    }}
                  >
                    👑
                  </div>
                )}
                {isLast && (
                  <div style={{ fontSize: 18, lineHeight: "16px" }}>🔗</div>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute", left: 10, top: -18,
                    fontWeight: 800, color: isLast ? "#607D8B" : theme.texto,
                  }}
                >
                  {r.equipo}
                  {i === 1 && data.length >= 2 ? " 🥈" : i === 2 && data.length >= 3 ? " 🥉" : ""}
                </div>
                <div
                  style={{
                    height: 28, background: "#F1F5F9", borderRadius: 14, overflow: "hidden", boxShadow: "inset 0 0 0 1px #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: mounted ? `${pct}%` : 0,
                      transition: "width .9s ease",
                      background: barBg,
                      backgroundSize: isFirst ? "200% 100%" : undefined,
                      animation: isFirst ? "shimmer 2.4s linear infinite" : undefined,
                      borderRadius: 14,
                      position: "relative",
                      filter: isLast ? "grayscale(.3)" : "none",
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: "right", fontWeight: 900, fontSize: 18 }}>
                {r.total}
              </div>
            </div>
          );
        })}
      </div>
      {isTeacher && ( // Solo muestra el botón si es Profesor
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12, }}>
            <Btn onClick={onContinue} label="Continuar" full={false} />
          </div>
      )}
    </>
  );
}


function ThemeChallengeSection({
  THEMES, temaSel, setTemaSel, desafioIndex, setDesafioIndex, desafioActual, isTablet, onContinue, hideConfirm, confirmLabel, confirmed,
}: {
  THEMES: any; temaSel: string | null; setTemaSel: (x: any) => void; desafioIndex: number; setDesafioIndex: (n: number) => void;
  desafioActual: any; isTablet: boolean; onContinue: () => void; hideConfirm?: boolean; confirmLabel?: string; confirmed?: boolean;
}) {
  const tema = temaSel ? THEMES[temaSel] : null;

  return (
    <Card title="Elige temática y desafío" subtitle="Seleccionen qué reto trabajarán" width={980}>
      
      {/* TEMAS */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Temáticas</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.keys(THEMES).map((k) => {
            const active = temaSel === k;
            return (
              <button key={k} 
                onClick={() => { 
                    if (!confirmed) { setTemaSel(k); setDesafioIndex(0); }
                }}
                disabled={!!confirmed} // Bloqueamos si ya confirmó
                style={{
                  padding: "10px 14px", borderRadius: 12,
                  border: `2px solid ${active ? "#1976D2" : "#ccc"}`,
                  background: active ? "#E3F2FD" : "#fff",
                  fontWeight: 800, 
                  cursor: confirmed ? "default" : "pointer",
                  opacity: confirmed && !active ? 0.5 : 1 // Atenuamos los no seleccionados
                }}
              >
                {THEMES[k].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* DESAFÍOS */}
      {tema && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 900, marginBottom: 6, fontSize: "22px", color: "#1976D2", }}>
            Desafíos
          </div>
          <div style={{ display: "grid", gap: 20 }}>
            {tema.desafios.map((d: any, i: number) => {
              const active = desafioIndex === i;
              const approved = !!confirmed && active; // seleccionado y confirmado
              
              return (
                <button
                  key={i} 
                  onClick={() => { if(!confirmed) setDesafioIndex(i); }}
                  disabled={!!confirmed} // Bloqueamos interacción
                  style={{
                    padding: "20px", width: "100%", borderRadius: "16px",
                    border: `2px solid ${ approved ? "#4CAF50" : active ? "#FF8A65" : "#E0F7FA" }`,
                    background: approved ? "#C8E6C9" : active ? "#FFCCBC" : "#E0F7FA",
                    textAlign: "left", 
                    cursor: confirmed ? "default" : "pointer", 
                    fontWeight: "bold", fontSize: "18px",
                    display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "start", gap: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: active ? "0 6px 12px rgba(0, 0, 0, 0.15)" : "0 2px 5px rgba(0, 0, 0, 0.1)",
                    transform: active && !confirmed ? "scale(1.01)" : "scale(1)",
                    opacity: confirmed && !active ? 0.5 : 1 // Atenuamos los otros
                  }}
                >
                  <div style={{ width: 22, textAlign: "center" }}>
                    {approved ? (<span style={{ color: "#2E7D32" }}>✔</span>) : null}
                  </div>
                  <div>
                    {`Desafío ${i + 1}`}
                    <div style={{ fontSize: "16px", fontWeight: 400, opacity: 0.8, marginTop: 6, }}>
                      {d.descripcion}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BOTÓN CONFIRMAR (Se oculta al confirmar) */}
      {!hideConfirm && !confirmed && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
          <Btn
            label={confirmLabel || "Confirmar y abrir mapa de empatía"}
            onClick={onContinue}
            full={false}
          />
        </div>
      )}
      
      {/* MENSAJE DE BLOQUEO */}
      {confirmed && !hideConfirm && (
          <div style={{marginTop: 20, padding: 12, background: '#E8F5E9', borderRadius: 8, color: '#2E7D32', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
              <span>🔒</span> Selección guardada. Espera a que el profesor habilite la siguiente fase.
          </div>
      )}
    </Card>
  );
}

function PresentStageTeacher({
  currentTeam, 
  onNext, 
  pitchSec, 
  startTimer, 
  pauseTimer, 
  onReset, 
  remaining,
  activeRoom, 
}: {
  currentTeam: string; 
  onNext: () => void; 
  pitchSec: number;
  startTimer: () => void; 
  pauseTimer: () => void; 
  onReset: () => void; 
  remaining: number;
  activeRoom?: string; 
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card title="Pitch en curso" subtitle={`Presenta: ${currentTeam}`} width={900}>
        
        <div style={{ marginTop: 12 }}>
          <div style={{ ...panelBox, textAlign: "center" }}>
            {/* ... */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", }}>
              <Btn onClick={() => startTimer()} label="▶ Iniciar" full={false} />
              <Btn onClick={() => pauseTimer()} label="⏸ Pausa" full={false} />
              
              <Btn 
                onClick={onReset} 
                label={`⟲ Reset (${pitchSec}s)`} 
                full={false} 
                variant="outline" 
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <Btn onClick={onNext} label="Siguiente grupo" full={false} />
        </div>
      </Card>
    </div>
  );
}


function EmpathySection(props: any) {
  const {
    isTablet, isMobile, bubbleSize, centerBubbleSize, 
    EMPATIA_FIELDS, empatia, setActiveBubble, activeBubble, onEmpatiaChange,
    personaImg 
  } = props;

  const positions: any = {
    perfil:       { left: 10, top: 40 },
    entorno:      { right: 10, top: 40 },
    limitaciones: { left: 140, top: 10 },
    motivaciones: { right: 140, top: 10 },
    emociones:    { left: 40, bottom: 20 },
    necesidades:  { right: 40, bottom: 20 },
  };

  const helpers: Record<string, string> = {
    perfil: "¿Quién es? (Edad, oficio, rol)",
    entorno: "¿Dónde está? ¿Qué ve/oye?",
    emociones: "¿Qué siente? (Miedos, alegrías)",
    necesidades: "¿Qué necesita urgentemente?",
    limitaciones: "¿Qué le frustra o detiene?",
    motivaciones: "¿Qué le impulsa a actuar?",
  };

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: isMobile ? "1fr" : "600px 1fr", 
      gap: 24, 
      alignItems: "center" 
    }}>
      
      <div style={{ 
        position: "relative", 
        height: 420, 
        width: "100%",
        background: "#fff",
        border: "1px solid #E3E8EF",
        borderRadius: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}>
        
        <div style={{ 
          position: "absolute", left: "50%", top: "50%", 
          transform: "translate(-50%,-50%)", 
          width: centerBubbleSize, height: centerBubbleSize, 
          borderRadius: "50%", 
          background: "#FFF3F7", 
          border: `4px solid ${theme.rosa}`,
          display: "grid", placeItems: "center", 
          overflow: "hidden", 
          zIndex: 10,
          boxShadow: "0 8px 16px rgba(233,30,99,0.2)"
        }}>
          {personaImg ? (
            <img 
              src={personaImg} 
              alt="Persona" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          ) : (
            <span style={{fontWeight: 900, color: theme.rosa}}>Persona</span>
          )}
        </div>

        {EMPATIA_FIELDS.map((f: any) => {
          const filled = !!empatia[f.key]?.trim();
          const active = activeBubble === f.key;
          
          const posStyle = positions[f.key] ? 
            (positions[f.key].left !== undefined ? { left: positions[f.key].left } : 
             positions[f.key].right !== undefined ? { right: positions[f.key].right } : {}) 
            : {};
          const topStyle = positions[f.key]?.top !== undefined ? { top: positions[f.key].top } : { bottom: positions[f.key].bottom };

          return (
            <button key={f.key} onClick={() => setActiveBubble(f.key)} style={{
                position: "absolute", 
                ...posStyle, ...topStyle,
                width: bubbleSize, height: bubbleSize,
                borderRadius: "50%", 
                border: `3px solid ${active ? theme.azul : filled ? "#4CAF50" : theme.muted}`,
                background: active ? "#E3F2FD" : filled ? "#E8F5E9" : "#FFFFFF", 
                color: "#0D47A1", fontWeight: 700, fontSize: isMobile ? 11 : 13,
                cursor: "pointer",
                boxShadow: active ? "0 0 0 4px rgba(25,118,210,.2)" : "0 4px 8px rgba(0,0,0,.08)",
                zIndex: 5,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2
              }}
            >
              {filled && <span style={{fontSize: 10}}>✅</span>}
              {f.label}
            </button>
          );
        })}

        <svg style={{position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0}}>
           <line x1="50%" y1="50%" x2="15%" y2="20%" stroke="#E0E0E0" strokeWidth="2" />
           <line x1="50%" y1="50%" x2="85%" y2="20%" stroke="#E0E0E0" strokeWidth="2" />
           <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#E0E0E0" strokeWidth="2" />
           <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="#E0E0E0" strokeWidth="2" />
           <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="#E0E0E0" strokeWidth="2" />
        </svg>
      </div>

      <div style={panelBox}>
        <div style={{ fontWeight: 900, color: theme.azul, fontSize: 18, marginBottom: 4 }}>
          {EMPATIA_FIELDS.find((x: any) => x.key === activeBubble)?.label}
        </div>
        
        <div style={{ fontSize: 14, color: theme.rosa, marginBottom: 12, fontStyle: "italic", background: "#FFF0F5", padding: "6px 10px", borderRadius: 8, display: "inline-block" }}>
           💡 {helpers[activeBubble]}
        </div>
        
        <textarea
          value={empatia[activeBubble]}
          onChange={(e) => onEmpatiaChange(activeBubble, e.target.value)}
          placeholder="Escribe tus observaciones aquí..."
          style={{ ...baseInput, minHeight: 200, fontSize: 16, lineHeight: 1.5, border: "2px solid #E3E8EF", padding: 16 }}
        />
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 12, textAlign:"right", fontWeight: 600, color: theme.azul }}>
          {EMPATIA_FIELDS.filter((f: any) => empatia[f.key].trim()).length} / 6 Completados
        </div>
      </div>
    </div>
  );
}

const ChecklistEditor = ({ items, setItems }: { items: any[], setItems: (i: any[]) => void }) => {
  const [localItems, setLocalItems] = useState<any[]>(items || []);
  const [openItemIdx, setOpenItemIdx] = useState<number | null>(null); // Controla cuál está abierto

  // Sincronizar props
  useEffect(() => { if (items) setLocalItems(items); }, [items]);

  const save = () => {
      setItems(localItems);
      alert("✅ Checklist actualizado y guardado.");
  };

  const addItem = () => {
      const newIdx = localItems.length;
      setLocalItems([...localItems, {
          id: `custom_${Date.now()}`,
          label: "Nuevo requisito",
          value: 3,
          isFixed: false
      }]);
      setOpenItemIdx(newIdx); // Abrir el nuevo automáticamente
  };

  const deleteItem = (idx: number) => {
      if (localItems[idx].isFixed) return;
      setLocalItems(localItems.filter((_, i) => i !== idx));
      if (openItemIdx === idx) setOpenItemIdx(null);
  };

  const updateItem = (idx: number, field: string, val: any) => {
      const next = [...localItems];
      next[idx] = { ...next[idx], [field]: val };
      setLocalItems(next);
  };

  return (
      <div style={{ ...panelBox, maxWidth: 900 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: theme.azul }}>✅ Configuración Checklist LEGO</h3>
              <Btn label="💾 Guardar Cambios" onClick={save} full={false} />
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
              {localItems.map((item, i) => {
                  const isOpen = openItemIdx === i;
                  return (
                      <div key={i} style={{ border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                          
                          {/* HEADER DEL ACORDEÓN */}
                          <div 
                              onClick={() => setOpenItemIdx(isOpen ? null : i)}
                              style={{ 
                                  padding: "12px 16px", 
                                  background: isOpen ? "#E3F2FD" : item.isFixed ? "#F5F5F5" : "#fff", 
                                  cursor: "pointer", 
                                  display: "flex", 
                                  justifyContent: "space-between", 
                                  alignItems: "center",
                                  transition: "background 0.2s"
                              }}
                          >
                              <div style={{display:'flex', gap:10, alignItems:'center'}}>
                                  <span style={{fontWeight: 700, color: theme.texto}}>
                                      {item.label.substring(0, 50)}{item.label.length > 50 ? "..." : ""}
                                  </span>
                                  {item.isFixed && <span style={{fontSize:10, background:'#eee', padding:'2px 6px', borderRadius:4, color:'#666'}}>FIJO</span>}
                              </div>
                              <div style={{display:'flex', gap:15, alignItems:'center'}}>
                                  <span style={{fontWeight: 800, color: theme.azul}}>{item.value} Tokens</span>
                                  <span style={{color: '#888', fontSize: 12}}>{isOpen ? "▲" : "▼"}</span>
                              </div>
                          </div>

                          {/* CONTENIDO DEL ACORDEÓN */}
                          {isOpen && (
                              <div style={{ padding: 16, borderTop: '1px solid #eee', animation: 'fadeIn 0.3s' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 16, alignItems: 'end' }}>
                                      {/* Nombre */}
                                      <div>
                                          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display:'block', marginBottom:4 }}>DESCRIPCIÓN</label>
                                          <input 
                                              style={{ ...baseInput, background: item.isFixed ? '#f9f9f9' : '#fff' }} 
                                              value={item.label} 
                                              onChange={e => updateItem(i, 'label', e.target.value)}
                                              disabled={item.isFixed} 
                                          />
                                          {item.isFixed && <div style={{fontSize:11, color:'#999', marginTop:4}}>* Este texto es estándar y no se puede cambiar.</div>}
                                      </div>

                                      {/* Valor */}
                                      <div>
                                          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display:'block', marginBottom:4 }}>TOKENS</label>
                                          <input 
                                              type="number" 
                                              style={{ ...baseInput, textAlign: 'center' }} 
                                              value={item.value} 
                                              onChange={e => updateItem(i, 'value', Number(e.target.value))}
                                          />
                                      </div>

                                      {/* Borrar */}
                                      <div>
                                          {!item.isFixed && (
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); deleteItem(i); }} 
                                                  style={{ background: '#FFEBEE', color: 'red', border: '1px solid red', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontWeight:'bold' }}
                                                  title="Eliminar requisito"
                                              >
                                                  Eliminar 🗑
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Btn label="+ Agregar Nuevo Requisito" onClick={addItem} bg={theme.amarillo} fg={theme.texto} full={false} />
          </div>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
  );
};

// --- EDITOR DE RULETA (ADMIN) - CON CONFIGURACIÓN DE GIROS ---
const RouletteEditor = ({ items, setItems, maxSpins, setMaxSpins }: { items: any[], setItems: (i: any[]) => void, maxSpins: number, setMaxSpins: (n: number) => void }) => {
  const [localItems, setLocalItems] = useState<any[]>(items || []);
  const [openItemIdx, setOpenItemIdx] = useState<number | null>(null);

  // Sincronizar
  useEffect(() => { if (items && items.length > 0) setLocalItems(items); }, [items]);

  const save = () => {
    const total = localItems.reduce((s, i) => s + (Number(i.weight) || 0), 0);
    if (total !== 100) {
        alert(`⚠️ Error de Probabilidad\n\nSuma actual: ${total}%\nObjetivo: 100%\n\nAjusta los pesos.`);
        return;
    }
    if (setItems) {
        setItems(localItems);
        alert("✅ Configuración y Giros guardados.");
    }
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const next = [...localItems];
    next[idx] = { ...next[idx], [field]: value };
    
    // Lógica automática (colores y delta)
    if (field === 'type' || field === 'hasTokenEffect' || field === 'tokenAmount') {
        const item = next[idx];
        if (item.type === 'ventaja') item.color = "#4CAF50"; 
        else if (item.type === 'desventaja') item.color = "#F44336"; 
        else item.color = "#9C27B0"; 

        if (!item.hasTokenEffect) item.delta = 0;
        else {
            const amount = Math.abs(item.tokenAmount || 0);
            item.delta = item.type === 'ventaja' ? amount : item.type === 'desventaja' ? -amount : 0;
        }
    }
    setLocalItems(next);
  };

  const addItem = () => {
    const newIdx = localItems.length;
    setLocalItems([...localItems, {
        id: Date.now().toString(), label: "Nueva Opción", desc: "...", type: "neutral",
        delta: 0, weight: 0, color: "#9C27B0", hasTokenEffect: false, tokenAmount: 0
    }]);
    setOpenItemIdx(newIdx);
  };

  const deleteItem = (idx: number) => {
      if(confirm("¿Borrar este ítem?")) {
          setLocalItems(localItems.filter((_, i) => i !== idx));
          if(openItemIdx===idx) setOpenItemIdx(null);
      }
  };

  const totalWeight = localItems.reduce((s, i) => s + (Number(i.weight)||0), 0);

  return (
    <div style={{...panelBox, maxWidth: 900}}>
        
        {/* --- AQUÍ ESTÁ LO QUE FALTABA: EL PANEL DE GIROS --- */}
        <div style={{background:'#E3F2FD', padding:16, borderRadius:12, marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', border: `1px solid ${theme.azul}`}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:24}}>⚙️</span>
                <div>
                    <h4 style={{margin:0, color:theme.azul}}>Configuración General</h4>
                    <div style={{fontSize:12, color:'#666'}}>Límite de intentos para los alumnos</div>
                </div>
            </div>
            <label style={{fontWeight:700, display:'flex', alignItems:'center', gap:10, background:'#fff', padding:'8px 16px', borderRadius:8, border: '1px solid #ccc'}}>
                Giros permitidos:
                <input 
                    type="number" min="1" max="10" 
                    value={maxSpins} 
                    onChange={e => setMaxSpins(Number(e.target.value))} 
                    style={{...baseInput, width:60, padding:8, textAlign:'center', fontSize:16, border:'none', background:'#f5f5f5'}}
                />
            </label>
        </div>
        {/* ------------------------------------------------- */}

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16}}>
            <div>
                <h3 style={{margin:0, color: theme.azul}}>🎡 Opciones de la Ruleta</h3>
                <div style={{fontSize: 12, fontWeight: 'bold', color: totalWeight === 100 ? 'green' : 'red', marginTop:4}}>
                    Probabilidad Total: {totalWeight}% {totalWeight !== 100 && "(Debe sumar 100)"}
                </div>
            </div>
            <Btn label="💾 Guardar Todo" onClick={save} full={false} />
        </div>

        <div style={{display:'grid', gap: 10}}>
            {localItems.map((item, i) => {
                const isOpen = openItemIdx === i;
                return (
                <div key={i} style={{border: `1px solid ${isOpen ? item.color : '#ddd'}`, borderLeft: `5px solid ${item.color}`, borderRadius: 8, background: '#fff', overflow:'hidden'}}>
                    
                    {/* HEADER ACORDEÓN */}
                    <div 
                        onClick={() => setOpenItemIdx(isOpen ? null : i)}
                        style={{
                            padding: "10px 16px", cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: isOpen ? '#FAFAFA' : '#fff'
                        }}
                    >
                        <div style={{display:'flex', gap:10, alignItems:'center'}}>
                            <span style={{fontWeight:700, fontSize:14}}>{item.label}</span>
                            <span style={{fontSize:10, background: item.color, color:'#fff', padding:'2px 6px', borderRadius:4, textTransform:'uppercase'}}>{item.type}</span>
                        </div>
                        <div style={{display:'flex', gap:15, alignItems:'center', fontSize:13, color:'#666'}}>
                            <span>{item.weight}%</span>
                            <span>{item.delta !== 0 ? (item.delta > 0 ? `+${item.delta}💰` : `${item.delta}💰`) : "Neutral"}</span>
                            <span>{isOpen ? "▲" : "▼"}</span>
                        </div>
                    </div>

                    {/* BODY ACORDEÓN */}
                    {isOpen && (
                        <div style={{padding: 16, borderTop:'1px solid #eee', animation: 'fadeIn 0.3s'}}>
                            <div style={{display:'grid', gap: 12}}>
                                <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 12}}>
                                    <div>
                                        <label style={{fontSize:11, fontWeight:700}}>Título</label>
                                        <input style={baseInput} value={item.label} onChange={e=>updateItem(i, 'label', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{fontSize:11, fontWeight:700}}>Tipo</label>
                                        <select style={baseInput} value={item.type} onChange={e=>updateItem(i, 'type', e.target.value)}>
                                            <option value="ventaja">Ventaja (Verde)</option>
                                            <option value="neutral">Neutral (Morado)</option>
                                            <option value="desventaja">Desventaja (Rojo)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{fontSize:11, fontWeight:700}}>Descripción</label>
                                    <textarea style={{...baseInput, minHeight: 50}} value={item.desc} onChange={e=>updateItem(i, 'desc', e.target.value)} />
                                </div>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap: 12, alignItems:'end', background:'#f5f5f5', padding:12, borderRadius:8}}>
                                    <div>
                                        <label style={{display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, marginBottom:4, cursor:'pointer'}}>
                                            <input type="checkbox" checked={!!item.hasTokenEffect} onChange={e=>updateItem(i, 'hasTokenEffect', e.target.checked)} />
                                            Modificar Tokens
                                        </label>
                                        {item.hasTokenEffect && (
                                            <input type="number" min="0" style={{...baseInput, padding: 8, width: 80}} value={item.tokenAmount || 0} onChange={e=>updateItem(i, 'tokenAmount', Number(e.target.value))} />
                                        )}
                                    </div>
                                    <div>
                                        <label style={{fontSize:11, fontWeight:700}}>Probabilidad (%)</label>
                                        <input type="number" min="1" max="100" style={{...baseInput, padding: 8, borderColor: totalWeight !== 100 ? 'red' : '#ccc'}} value={item.weight} onChange={e=>updateItem(i, 'weight', Number(e.target.value))} />
                                    </div>
                                    <button onClick={()=>deleteItem(i)} style={{background:'#FFEBEE', color:'red', border:'1px solid red', borderRadius: 8, padding: '8px 12px', cursor:'pointer'}}>🗑</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )})}
        </div>
        <div style={{marginTop: 20, textAlign:'center'}}>
            <Btn label="+ Agregar Opción" onClick={addItem} bg={theme.amarillo} fg={theme.texto} full={false} />
        </div>
    </div>
  );
};

const ImageCropper = ({ onCancel, onSave }: { onCancel: () => void, onSave: (dataUrl: string) => void }) => {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });
  const imgRef = React.useRef<HTMLImageElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement('canvas');
    const size = 300; 
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.clip();
    
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,size,size);
    const scale = zoom;
    const img = imgRef.current;
    const dWidth = img.naturalWidth * scale;
    const dHeight = img.naturalHeight * scale;
    const dx = (size - dWidth) / 2 + offset.x;
    const dy = (size - dHeight) / 2 + offset.y;
    ctx.drawImage(img, dx, dy, dWidth, dHeight);
    
    onSave(canvas.toDataURL('image/jpeg', 0.9));
  };

  const handleMouseDown = (e: React.MouseEvent) => { setDragging(true); setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const handleMouseMove = (e: React.MouseEvent) => { if (dragging) setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y }); };
  const handleMouseUp = () => setDragging(false);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'grid', placeItems: 'center' }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 20, width: 400, maxWidth: '90vw', textAlign: 'center', position: 'relative' }}>
        
        <button 
          onClick={onCancel}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'transparent', border: 'none',
            fontSize: 20, fontWeight: 'bold', color: '#888',
            cursor: 'pointer', padding: 4
          }}
          title="Cerrar sin guardar"
        >
          ✕
        </button>

        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Ajustar Imagen</h3>
        {!imageSrc ? (
          <div style={{ padding: 40, border: '2px dashed #ccc', borderRadius: 12 }}>
            <input type="file" accept="image/*" onChange={onFileChange} />
          </div>
        ) : (
          <>
            <div 
              style={{ width: 300, height: 300, margin: '0 auto', border: '2px solid #1976D2', borderRadius: '50%', overflow: 'hidden', position: 'relative', cursor: dragging ? 'grabbing' : 'grab', background: '#eee' }}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            >
              <img ref={imgRef} src={imageSrc} alt="Crop" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center', pointerEvents: 'none', maxWidth: 'none', height: '100%', width: 'auto' }} />
            </div>
            <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
              <label>Zoom: {zoom.toFixed(1)}x</label>
              <input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10 }}>
                <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 99, border: '1px solid #ccc', background: 'transparent', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: 99, border: 'none', background: '#1976D2', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface DiffPoint {
  x: number;
  y: number;
  r: number;
  zone?: number; 
  found?: boolean;
}

function SpotWithImage({
  imgUrlA, imgUrlB, diffs, onFoundDiff, running, theme, targetHeight = 560, foundState, setFoundState,
}: {
  imgUrlA: string; imgUrlB: string; diffs: DiffPoint[]; onFoundDiff: () => void;
  running: boolean; theme: any; targetHeight?: number; foundState: boolean[];
  setFoundState: React.Dispatch<React.SetStateAction<boolean[]>>;}) 
  {
  const aRef = React.useRef<HTMLDivElement | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!running) return;
    const el = aRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const idx = diffs.findIndex(
      (d, i) => !foundState[i] && Math.hypot(d.x - x, d.y - y) <= d.r
    );
    if (idx >= 0) {
      setFoundState((prev: boolean[]) => {
        if (prev[idx]) return prev;
        const next = prev.slice();
        next[idx] = true;
        try {
          onFoundDiff();
        } catch {}
        return next;
      });
    }
  };

  const total = diffs.length;
  const count = foundState.filter(Boolean).length;

  const panelStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, };
  const imgBox: React.CSSProperties = { position: "relative", width: "100%", height: targetHeight, borderRadius: 16,
    overflow: "hidden", border: `1px solid ${theme.border}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", };
  const imgStyle: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#fff", };
  const ring = (d: DiffPoint): React.CSSProperties => ({
    position: "absolute", left: `${d.x * 100}%`, top: `${d.y * 100}%`, transform: "translate(-50%,-50%)",
    width: `${d.r * 200}%`, height: `${d.r * 200}%`, borderRadius: "50%", border: `4px solid ${theme.rosa}`,
    boxShadow: "0 0 0 6px rgba(233,30,99,.18)",
  });

  return (
    <>
      <div style={{ fontSize: 13, marginBottom: 8, opacity: 0.9 }}>
        Toca en la <b>imagen</b> donde veas una diferencia. Encontradas: {count}
        /{total}
      </div>
      <div style={panelStyle}>
        {/* Izquierda (clickable) */}
        <div ref={aRef} onClick={handleClick} style={imgBox}>
          <img src={imgUrlA} alt="Original" style={imgStyle} />
          {diffs.map( (d, i) => foundState[i] && <div key={i} style={ring(d)} /> )}
        </div>
        {/* Derecha (referencia) */}
        <div style={imgBox}>
          <img src={imgUrlB} alt="Modificada" style={imgStyle} />
        </div>
      </div>
    </>
  );
}