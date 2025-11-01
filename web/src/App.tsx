// App.tsx
import { createRoom, joinRoom, API } from "./api"; 
import React,{useEffect,useLayoutEffect,useMemo,useRef,useState,memo} from "react";
import TeamworkMiniAnim from "./componentes/TeamworkMiniAnim";
import EmpathyAnimacion from "./componentes/EmpathyAnimacion";
import CreatividadAnimacion from "./componentes/CreatividadAnimacion";
import PitchAnimacion from "./componentes/PitchAnimacion";
import LoginProfesor from "./componentes/LoginProfesor";
import { ProfAuth } from "./api";
import TeamListProfesor from "./componentes/TeamListProfesor";
import * as XLSX from "xlsx";
import originalImg from "./componentes/assets/original.jpg?url";
import modificadaImg from "./componentes/assets/modificada.jpg?url";
import RuletaOrden, { RuletaSignal } from "./componentes/RuletaOrden";
import PrettyWheel from "./componentes/PrettyWheel";
import { ScoreSlider } from "./componentes/ScoreSlider";
import AnimEva from "./componentes/AnimEva";

/* ============ UTILES ============ */

function mmss(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0));
  const mStr = String(Math.floor(s / 60)).padStart(2, "0");
  const sStr = String(s % 60).padStart(2, "0");
  return `${mStr}:${sStr}`;
}

/* --THEME-- */
const theme={rosa:"#E91E63",azul:"#1976D2",amarillo:"#FFEB3B",blanco:"#FFFFFF",surfaceAlt:"#F7F9FC",gris:"#ECEFF1",texto:"#0D47A1",muted:"#6B7A90",border:"#E3E8EF",shadow:"0 16px 36px rgba(16,24,40,.14)"};

/* --GLOBAL CSS-- */
const GlobalFormCSS=()=>(<style>{`
  *{-webkit-tap-highlight-color:transparent;} input,textarea,select{box-sizing:border-box;max-width:100%} body{margin:0}
  button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #93C5FD;outline-offset:2px}
  @keyframes crownFloat{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:0% 0}100%{background-position:120% 0}}
  @keyframes fall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(360deg);opacity:.9}}
  @keyframes floatY{0%{transform:translateY(0)}50%{transform:translateY(-18px)}100%{transform:translateY(0)}}
  @keyframes pulseSoft{0%{transform:scale(1);opacity:.65}50%{transform:scale(1.06);opacity:.85}100%{transform:scale(1);opacity:.65}}
  @keyframes drift{0%{transform:translateX(0)}50%{transform:translateX(12px)}100%{transform:translateX(0)}}
`}</style>);


/* --BASE STYLES-- */
const appStyles:React.CSSProperties={position:"relative",minHeight:"100dvh",overflowY:"auto",overflowX:"hidden",fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",color:theme.texto};
const baseInput:React.CSSProperties={width:"100%",padding:12,borderRadius:12,border:`1px solid ${theme.border}`,boxSizing:"border-box",maxWidth:"100%",background:theme.blanco};
const panelBox:React.CSSProperties={background:theme.blanco,border:`1px solid ${theme.border}`,borderRadius:16,padding:12,position:"relative",zIndex:2,boxShadow:theme.shadow};
const badgeTitle:React.CSSProperties={fontWeight:900,color:theme.azul,marginBottom:6};
const smallHint:React.CSSProperties={fontSize:12,opacity:.7,marginTop:8};

const AutoCenter:React.FC<{children:React.ReactNode}>=({children})=>{
  const contentRef=useRef<HTMLDivElement|null>(null); const [center,setCenter]=useState(true);
  const recompute=()=>{const vp=window.innerHeight;const padding=48;const contentH=contentRef.current?.offsetHeight??0;setCenter(contentH+padding<=vp);};
  useLayoutEffect(()=>{recompute();const ro=new ResizeObserver(recompute);if(contentRef.current)ro.observe(contentRef.current);window.addEventListener("resize",recompute);return()=>{ro.disconnect();window.removeEventListener("resize",recompute)};},[]);
  return(<div style={{position:"relative",width:"100%",minHeight:"100dvh",display:"flex",flexDirection:"column",justifyContent:center?"center":"flex-start",alignItems:"center",padding:24}}>
    <div ref={contentRef} style={{width:"100%",display:"grid",justifyItems:"center"}}>{children}</div>
  </div>);
};

type CardProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  width?: number;
  tight?: boolean;
}>;

const Card: React.FC<CardProps> = ({ title, subtitle, width = 520, children, tight }) => (
  <div style={{width:`clamp(320px,92vw,${width}px)`,background:"rgba(255,255,255,0.96)",boxShadow:theme.shadow,border:`1px solid ${theme.border}`,borderRadius:20,padding:tight?18:24,textAlign:"center",backdropFilter:"blur(2px)",position:"relative",zIndex:3,margin:"12px auto"}}>
    <h2 style={{margin:0,marginBottom:8,fontSize:26,fontWeight:900,color:theme.rosa}}>{title}</h2>
    {subtitle && <p style={{marginTop:0,marginBottom:16,color:theme.azul}}>{subtitle}</p>}
    {children}
  </div>
);
// Asegúrate de tener importado React y memo:
// import React, { memo } from "react";

const Btn: React.FC<{
  onClick?: () => void;
  bg?: string;
  fg?: string;
  label: string;
  full?: boolean;
  disabled?: boolean;
  variant?: "solid" | "outline";
  title?: string;                // <-- NUEVO
}> = memo(
  ({
    onClick,
    bg = theme.azul,
    fg = theme.blanco,
    label,
    full = true,
    disabled,
    variant = "solid",
    title,                        // <-- NUEVO
  }) => (
    <button

      title={title}
      disabled={disabled}
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
const Background=memo(()=>(
  <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,background:`linear-gradient(145deg, ${theme.rosa} 0%, ${theme.azul} 60%)`}}/>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(40% 35% at 85% 15%, ${theme.amarillo}55, transparent 65%)`,filter:"blur(2px)"}}/>
    <Orb left="6%" top="72%" size={220} color={`${theme.amarillo}55`} delay={.2}/>
    <Orb left="78%" top="68%" size={180} color={`${theme.rosa}44`} delay={.6}/>
    <Orb left="12%" top="18%" size={140} color={`${theme.azul}55`} delay={.1}/>
    <Wave color={`${theme.azul}`} opacity={.18} top={100}/>
    <Wave color={`${theme.rosa}`} opacity={.14} top={170} reverse/>
    <GeoPiece left="70%" top="22%" size={140} color={`${theme.blanco}18`} rotate/>
    <GeoPiece left="28%" top="78%" size={160} color={`${theme.blanco}14`}/>
  </div>
));
const Orb:React.FC<{left:string;top:string;size:number;color:string;delay?:number}>=({left,top,size,color,delay=0})=>(<div style={{position:"absolute",left,top,width:size,height:size,borderRadius:"50%",background:color,filter:"blur(6px)",animation:`floatY ${5.5+Math.random()*2}s ease-in-out ${delay}s infinite`}}/>);
const Wave:React.FC<{color:string;opacity?:number;top?:number;reverse?:boolean}>=({color,opacity=.2,top=120,reverse})=>(
  <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMid slice" style={{position:"absolute",top,left:0,width:"100%",height:240,opacity,transform:reverse?"scaleY(-1)":undefined,animation:"drift 12s ease-in-out infinite"}}>
    <path fill={color} d="M0,192 C240,240 480,240 720,192 C960,144 1200,144 1440,192 L1440,320 L0,320 Z"/>
  </svg>
);
const GeoPiece:React.FC<{left:string;top:string;size:number;color:string;rotate?:boolean}>=({left,top,size,color,rotate})=>(
  <div style={{position:"absolute",left,top,width:size,height:size,borderRadius:26,background:color,transform:"rotate(12deg)",animation:rotate?"pulseSoft 7s ease-in-out infinite":"floatY 8s ease-in-out infinite",boxShadow:"0 20px 40px rgba(0,0,0,.08)"}}/>
);

/* ============ FLOW/STATE ============ */
type WheelState = {
  segments: string[];
  remaining: string[];
  picked: string[];
  lastWinner?: string;
  spinning?: boolean;
};

type FlowStep =
  | "lobby"
  | "f0_instr"
  | "f0_activity"
  // Fase 1
  | "f1_video"
  | "f1_instr"
  | "f1_activity"
  | "f1_rank"
  // Fase 2
  | "f2_video"
  | "f2_instr"
  | "f2_theme"
  | "f2_activity"
  | "f2_rank"
  // Fase 3
  | "f3_video"
  | "f3_activity"
  | "f3_rank"
  // Fase 4
  | "f4_video"
  | "f4_prep"
  | "f4_wheel"
  | "f4_present"
  | "f4_rank"

  // Finales
  | "f5_video"
  // QR (si lo usas en JSX / setStep)
  | "qr";



type FlowState = {
  step: FlowStep;
  remaining: number;
  running: boolean;
  pitchSeconds: number;
  empatiaSeconds?: number;

  includeF0: boolean;
  f0Seconds: number;

  wheel: WheelState;

  presentOrder: string[];
  currentIdx: number | null;   // ← permite null cuando cierras ciclo

  finishedPitch?: boolean;
  formation?: "auto" | "manual";

  // ← estos campos los usa tu código varias veces
  roomCode?: string;
  expectedTeams?: number;
};





const initialFlow: FlowState = {
  step: "lobby",
  remaining: 0,
  running: false,

  pitchSeconds: 180,
  empatiaSeconds: 60,

  includeF0: false,
  f0Seconds: 180,

  wheel: { segments: [], remaining: [], picked: [], spinning: false },
  presentOrder: [],
  currentIdx: 0,

  finishedPitch: false,
  formation: "manual",

  roomCode: "",
  expectedTeams: 0
};


/* ========= Helpers de actualización ========= */
// === Determinar modo desde query ?mode=prof|alumno o último guardado ===
const _qsMode = new URLSearchParams(window.location.search).get("mode");
const mode = ((_qsMode || localStorage.getItem("mode") || "alumno") as "prof" | "alumno");
localStorage.setItem("mode", mode);

const isTeacher = mode === "prof";






/* ========= THEMES con firma de índice (evita error 7053) ========= */
type ThemeConfig = Record<string, any>;

const ORDER: FlowStep[] = [
  "lobby",
  "f0_instr",
  "f0_activity",

  "f1_video",
  "f1_instr",
  "f1_activity",
  "f1_rank",

  "f2_video",
  "f2_instr",
  "f2_theme",
  "f2_activity",
  "f2_rank",

  "f3_video",
  "f3_activity",
  "f3_rank",

  "f4_video",
  "f4_prep",
  "f4_wheel",
  "f4_present",
  "f4_rank",

  "f5_video",

  "qr", // si efectivamente navegas a QR
];

function getPrevStep(curr: FlowStep): FlowStep {
  const i = ORDER.indexOf(curr);
  return i > 0 ? ORDER[i - 1] : ORDER[0];
}


function useFlowStore() {
  // 1) estado base
  const [flow, setFlow] = React.useState<FlowState>(initialFlow);

  // 2) helpers que SÍ dependen de flow
  const publish = (next: Partial<FlowState>) => {
    setFlow(prev => normalizeFlow({ ...prev, ...next } as FlowState, initialFlow));
  };
  const startTimer = (seconds?: number) =>
    publish({ remaining: seconds ?? flow.remaining, running: true });
  const pauseTimer = () => publish({ running: false });
  const resetTimer = (seconds: number) =>
    publish({ remaining: seconds, running: false });
  const setStep = (step: FlowStep) => publish({ step });

  // 3) retorno del hook
  return { flow, setStep, startTimer, pauseTimer, resetTimer, publish };
}


 

const FLOW_KEY="udd_flow_state_v1",READY_KEY="udd_ready_teams_v1",COINS_KEY="udd_coins_v1";
const THEMES_KEY="udd_themes_v1",ANALYTICS_KEY="udd_analytics_v1";
const ROSTER_KEY = "udd_roster_v1";

// === CONFIGURACIÓN DE GRUPOS ===
const MIN_GROUPS = 3;
const MAX_GROUPS = 4;
const HARD_MAX_GROUPS = 5;
const MAX_PER_GROUP = 9;

/* ====== ELECCIÓN DE DESAFÍO (persistencia por sala/equipo) ====== */
const CHOICE_KEY = "udd_choice_v1";

/* ====== FOTOS DE PROTOTIPO (por sala/equipo) ====== */
/* ====== FOTOS DE PROTOTIPO (por sala/equipo) ====== */
const PHOTOS_KEY = "udd_team_photos_v1";

function saveTeamPhoto(roomCode:string, teamName:string, dataUrl:string){
  const all = readJSON<Record<string,string>>(PHOTOS_KEY, {});
  all[teamKey(roomCode, teamName)] = dataUrl;
  writeJSON(PHOTOS_KEY, all);
  try{
    window.dispatchEvent(new StorageEvent("storage", { key: PHOTOS_KEY, newValue: JSON.stringify(all) }));
  }catch{}
}

function getTeamPhoto(roomCode:string, teamName:string){
  const all = readJSON<Record<string,string>>(PHOTOS_KEY, {});
  return all[teamKey(roomCode, teamName)];
}

/* Comprimir imagen a dataURL JPG para evitar que no cargue por tamaño */
async function compressImageToDataURL(file: File, maxW=1280, quality=0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}





/* id único por sala+equipo */
function teamKey(roomCode:string, teamName:string){
  return `${roomCode}::${teamName}`;
}

/* guardar elección (y si está confirmada) */
function saveTeamChoice(roomCode:string, teamName:string, themeId:string, desafioIndex:number, confirmed:boolean){
  const all = readJSON<Record<string,{themeId:string;desafioIndex:number;confirmed:boolean}>>(CHOICE_KEY, {});
  all[teamKey(roomCode,teamName)] = { themeId, desafioIndex, confirmed };
  writeJSON(CHOICE_KEY, all);
  try{ window.dispatchEvent(new StorageEvent("storage",{key:CHOICE_KEY,newValue:JSON.stringify(all)})); }catch{}
}

/* leer elección de un equipo (o undefined) */
function getTeamChoice(roomCode:string, teamName:string){
  const all = readJSON<Record<string,{themeId:string;desafioIndex:number;confirmed:boolean}>>(CHOICE_KEY, {});
  return all[teamKey(roomCode,teamName)];
}

/* cuántos equipos confirmaron en una sala */
function countConfirmedChoices(roomCode:string, teams:string[]){
  const all = readJSON<Record<string,{themeId:string;desafioIndex:number;confirmed:boolean}>>(CHOICE_KEY, {});
  let ok = 0;
  for(const t of teams){
    const ch = all[teamKey(roomCode,t)];
    if(ch?.confirmed) ok++;
  }
  return ok;
}



type ThemeId="salud"|"sustentabilidad"|"educacion";
type ThemePersona={nombre:string;edad:number;bio:string};
type ThemeChallenge={titulo:string;descripcion:string};
type Analytics={
  roomsCreated:number;
  challengeUsage:Record<string,number>;
  teams:{roomCode:string;teamName:string;integrantes:{nombre:string;carrera:string}[];ts:number;}[];
  reflections:{roomCode:string;teamName:string;text:string;ts:number;}[];
  feedbacks:{roomCode:string;fromTeam:string;targetTeam:string;ratings:number[];comment?:string;ts:number;}[];
};

function readJSON<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback}}
function writeJSON(key:string,value:any){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}

function normalizeFlow(f: any, initial: FlowState): FlowState {
  const base = { ...initial, ...(f || {}) };
  const w = f?.wheel;
  return {
    ...base,
    presentOrder: Array.isArray(f?.presentOrder) ? f.presentOrder : [],
    currentIdx: typeof f?.currentIdx === "number" ? f.currentIdx : 0,
    pitchSeconds: typeof f?.pitchSeconds === "number" ? f.pitchSeconds : initial.pitchSeconds,
    empatiaSeconds: typeof f?.empatiaSeconds === "number" ? f.empatiaSeconds : initial.empatiaSeconds,
    finishedPitch: !!f?.finishedPitch,
    formation: f?.formation === "auto" || f?.formation === "manual" ? f.formation : "manual",
    wheel: (w && Array.isArray(w.segments))
      ? {
          segments: w.segments,
          remaining: Array.isArray(w.remaining) ? w.remaining : [],
          picked: Array.isArray(w.picked) ? w.picked : [],
          lastWinner: w.lastWinner,
          spinning: !!w.spinning
        }
      : { segments: [], remaining: [], picked: [], spinning: false }
  };
  
}
// ---- helpers de estado/tiempo (DECLARAR ANTES DEL return) ----





/* --STORAGE SIGNAL-- */
function useStorageSignal(keys:string[],pollMs=800){const [tick,setTick]=useState(0);
  useEffect(()=>{const onStorage=(e:StorageEvent)=>{if(!e.key)return;if(keys.includes(e.key))setTick(t=>t+1)};window.addEventListener("storage",onStorage);const id=window.setInterval(()=>setTick(t=>t+1),pollMs);return()=>{window.removeEventListener("storage",onStorage);window.clearInterval(id)};},[keys,pollMs]);
  return tick;
}

/* --SHARED FLOW-- */
function useSharedFlow(isTeacher: boolean, initial: FlowState) {
  const [flow, setFlow] = React.useState<FlowState>(() =>
    normalizeFlow(readJSON(FLOW_KEY, initial), initial)
  );

  // Helpers que publican SIEMPRE via setFlow
  const publish = React.useCallback((next: Partial<FlowState>) => {
    setFlow(prev => {
      const nf = normalizeFlow({ ...prev, ...next }, initial);
      writeJSON(FLOW_KEY, nf);
      try {
        window.dispatchEvent(new StorageEvent("storage", { key: FLOW_KEY, newValue: JSON.stringify(nf) }));
      } catch {}
      return nf;
    });
  }, [initial]);

  const setStep   = React.useCallback((s: FlowStep) => publish({ step: s }), [publish]);
  const startTimer= React.useCallback((sec?: number) => publish({ remaining: sec ?? flow.remaining, running: true }), [publish, flow.remaining]);
  const pauseTimer= React.useCallback(() => publish({ running: false }), [publish]);
  const resetTimer= React.useCallback((sec: number) => publish({ remaining: Math.max(0, sec), running: false }), [publish]);

  // Sync por storage
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FLOW_KEY && e.newValue) {
        try { setFlow(normalizeFlow(JSON.parse(e.newValue), initial)); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [initial]);

  // Tick de countdown (solo profe)
  React.useEffect(() => {
    if (!isTeacher || !flow.running) return;
    const id = window.setInterval(() => {
      setFlow(f => {
        const left = Math.max(0, (f.remaining ?? 0) - 1);
        const nf = { ...f, remaining: left, running: left > 0 && f.running };
        writeJSON(FLOW_KEY, nf);
        try {
          window.dispatchEvent(new StorageEvent("storage", { key: FLOW_KEY, newValue: JSON.stringify(nf) }));
        } catch {}
        return nf;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isTeacher, flow.running]);

  // === ÚNICO return ===
  return { flow, setStep, startTimer, pauseTimer, resetTimer, publish };
}




/* --ANALYTICS HOOK-- */
function useAnalytics(){const [analytics,setAnalytics]=useState<Analytics>(()=>readJSON<Analytics>(ANALYTICS_KEY,{roomsCreated:0,challengeUsage:{},teams:[],reflections:[],feedbacks:[]}));
  useEffect(()=>{const onStorage=(e:StorageEvent)=>{if(e.key===ANALYTICS_KEY&&e.newValue){try{setAnalytics(JSON.parse(e.newValue))}catch{}}};window.addEventListener("storage",onStorage);return()=>window.removeEventListener("storage",onStorage)},[]);
  const update=(updater:(a:Analytics)=>Analytics)=>{setAnalytics(prev=>{const next=updater(prev);writeJSON(ANALYTICS_KEY,next);try{window.dispatchEvent(new StorageEvent("storage",{key:ANALYTICS_KEY,newValue:JSON.stringify(next)}))}catch{};return next})};
  return {analytics,update};
}

/* ===================== APP ===================== */
export default function App(){

const [preSalaElegida, setPreSalaElegida] =
  React.useState<null | "aleatorio" | "manual">(null);

// (si usas un tema/desafío en alumno)
const [temaSel, setTemaSel] = React.useState<any>("salud"); 
const [desafioIndex, setDesafioIndex] = React.useState<number>(0);

// (si usas el sopaletras / hallazgos)
const [foundState, setFoundState] = React.useState<boolean[]>([]);

// (si guardas notas por equipo, p.ej. 5 criterios numéricos)
const [ratingsByTeam, setRatingsByTeam] =
  React.useState<Record<string, number[]>>({});

  
  const [mode,setMode]=useState<"inicio"|"prof"|"alumno"|"admin">("inicio");
  const [equiposQty,setEquiposQty]=useState(4);
  const [roomCode,setRoomCode]=useState(""); const [groupName,setGroupName]=useState(""); const [miNombre,setMiNombre]=useState(""); const [miCarrera,setMiCarrera]=useState("");
  const [integrantes,setIntegrantes]=useState<{nombre:string;carrera:string}[]>([]); const [teamReady,setTeamReady]=useState(false);
  const [coins,setCoins]=useState(0);
  const [f1Tab, setF1Tab] = useState<'spot'|'sopa'>('spot');
// === Estado UI F4 (alumno) ===
const [showPhoto, setShowPhoto] = React.useState(false);
const [showOrder, setShowOrder] = React.useState(true);
const [sent, setSent] = useState(false);
const [scores, setScores] = useState([0,0,0,0,0,0]);
  

  const isTablet=useMediaQuery("(max-width: 1180px)"); const isMobile=useMediaQuery("(max-width: 640px)");
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [profAuth, setProfAuth] = useState<ProfAuth | null>(null);
  const [showProfLogin, setShowProfLogin] = useState(false);
const [selectedMember, setSelectedMember] = useState<string>("");

const imgOrig = originalImg;
const imgMod  = modificadaImg;
const [confirmed, setConfirmed] = useState(false);


// === F1: Spot the Difference ===
const F1_SPOT_IMAGE_URL  = "/diferencia.jpg"; // Original
const F1_SPOT_IMAGE_URL_B = "/diferencia.jpg"; // Modificada (usa la misma si no tienes otra)
const F1_DIFFS = [
  { x:0.1929, y:0.2881, r:0.055 }, // Mariposa / ojo / cabeza
  { x:0.4823, y:0.2306, r:0.055 }, // Nube derecha
  { x:0.6870, y:0.2153, r:0.055 }, // Sol
  { x:0.6969, y:0.4739, r:0.055 }, // Casa / ventana
  { x:0.9154, y:0.5371, r:0.055 }, // Casa / detalle muro
  { x:0.2283, y:0.4605, r:0.055 }, // Pata levantada / mancha
  { x:0.4272, y:0.4432, r:0.055 }, // Nariz / boca
  { x:0.2165, y:0.6348, r:0.055 }, // Flor centro
  { x:0.8996, y:0.7095, r:0.055 }, // Arbusto / pasto atrás
  { x:0.4980, y:0.8877, r:0.055 }, // Hoja inferior / planta
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

  const [soupFound, setSoupFound] = React.useState<Record<string,boolean>>({});

  useEffect(() => {
    // Si no hay progreso cargado, inicializar
    if (Object.keys(soupFound).length === 0) {
      const words = [
        "INNOVACION","USUARIO","EMPATIA","EQUIPO",
        "PROTOTIPO","ITERAR","IDEAR","MERCADO"
      ];
      setSoupFound(Object.fromEntries(words.map(w => [w, false])));
    }
  }, []); // ✅ solo una vez

  

  
  const OrderBoard: React.FC<{
    order: string[];
    currentIdx?: number;
    width?: number;
    title?: string;
  }> = ({ order, currentIdx=-1, width=980, title="Orden de Presentación" }) => {
    const all = [...order];
    const alpha = [...order].sort((a,b)=>a.localeCompare(b));
    return (
      <Card title={title} width={width}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
          <div style={{...panelBox}}>
            <div style={{fontWeight:900, color:theme.azul, marginBottom:8}}>Equipos</div>
            <div style={{display:"grid", gap:6}}>
              {alpha.map((t,i)=>(
                <div key={i} style={{
                  padding:"10px 12px", border:`1px solid ${theme.border}`, borderRadius:12,
                  background:"#fff"
                }}>{t}</div>
              ))}
            </div>
          </div>
          <div style={{...panelBox}}>
            <div style={{fontWeight:900, color:theme.azul, marginBottom:8}}>Orden de presentación</div>
            <div style={{display:"grid", gap:6}}>
              {all.map((t,i)=>{
                const active = i===currentIdx;
                return (
                  <div key={i} style={{
                    padding:"10px 12px", border:`1px solid ${active? theme.azul : theme.border}`,
                    borderRadius:12, background: active? "#E3F2FD" : "#fff",
                    display:"grid", gridTemplateColumns:"28px 1fr", gap:8, alignItems:"center",
                    fontWeight: active? 800 : 600
                  }}>
                    <div style={{width:28, height:28, borderRadius:8, background:active? theme.azul : "#EEF2F6",
                      color: active? "#fff" : "#334155", display:"grid", placeItems:"center"}}>
                      {i+1}
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
        try { setRoster(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  
const TEAM_SUGGESTIONS = [
  "Alpha", "Beta", "Gamma", "Delta", "Eureka", "Nexus", "Aurora",
  "Pioneros", "Vector", "Quántum", "Phoenix", "Impulse", "Órbita",
  "Catalizadores", "Momentum", "Centella", "Nebula", "Vertex"
];



  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminErr, setAdminErr] = useState("");

  

  // RNG determinístico basado en semilla
function mulberry32(a:number){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
function prevRunning(get?: (p: FlowState)=>boolean){
  // truco: React no da "prev" fuera de setState; aquí asumimos false si no hay getter.
  return get ? get(flow) : false;
}
 /* ========= util seguro para leer equipo actual ========= */
const currentTeamSafe = () => {
  const order = flow.presentOrder ?? [];
  const idx = flow.currentIdx ?? 0;
  return order[idx] ?? "-";
};
  
  // Acción principal de retroceso (profesor)
  function goPrevStep1() {
    const s = flow.step;
  
    // ===== CASOS ESPECIALES =====
    // F4: si estamos presentando y hay equipo anterior
    if (s === "f4_present") {
      const idx = flow.currentIdx ?? 0;
      if (idx > 0) {
        // Retrocede al equipo anterior y resetea cronómetro del pitch
        publish({ currentIdx: idx - 1, finishedPitch: false });
        resetTimer(flow.pitchSeconds);
        setStep("f4_present"); // asegura sincronía en alumnos
        return;
      }
      // Primer equipo: vuelve a rueda (si ya hubo sorteos) o a preparación
      if (flow.wheel?.picked?.length) {
        resetTimer(0);
        setStep("f4_wheel");
        return;
      }
      resetTimer(0);
      setStep("f4_prep");
      return;
    }
  
    // F4: desde rueda → preparación
    if (s === "f4_wheel") {
      resetTimer(0);
      setStep("f4_prep");
      return;
    }
    // F4: desde preparación → video
    if (s === "f4_prep") {
      resetTimer(0);
      setStep("f4_video");
      return;
    }
  
    // Final: desde QR → volver a animación de F5
    if (s === "qr") {
      setStep("f5_video");
      return;
    }
  
    // ===== RETROCESO GENÉRICO =====
    const prev = getPrevStep(s);
    setStep(prev);
    // Si quieres tiempos distintos por fase, puedes mapear aquí:
    // resetTimer(secondsByStep[prev] ?? 0);
  }
  
  
// Guarda el tablero y paths para que no cambien
const [soupData, setSoupData] = React.useState<any>(null);


  function handleProfLoginSuccess(auth: ProfAuth) {
    setProfAuth(auth);
    setShowProfLogin(false);
    setMode("prof");
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



  const isTeacher = mode === "prof";
  const {flow,setStep,startTimer,pauseTimer,resetTimer,publish} = useSharedFlow(isTeacher, initialFlow);
  const activeRoom = flow.roomCode || joinedRoom || "";


const teamId = activeRoom && (groupName || "(sin-nombre)")
  ? `${activeRoom}::${(groupName || "").trim() || "sin-nombre"}`
  : "";

  // --- Sync desafío confirmado al entrar a f2_activity ---
React.useEffect(() => {
  if (!flow || flow.step !== "f2_activity") return;
  if (!activeRoom || !teamId) return;

  const myTeamName = (teamId.split("::")[1] || "Equipo");
  const prev = getTeamChoice(activeRoom, myTeamName);

  if (prev) {
    if ((THEMES as any)?.[prev.themeId]) setTemaSel?.(prev.themeId as any);
    if (!Number.isNaN(prev.desafioIndex)) setDesafioIndex?.(prev.desafioIndex);
  }
}, [flow?.step, activeRoom, teamId]);

React.useEffect(() => {
  // Corre sólo cuando aplica
  if (mode !== "alumno") return;
  if (!activeRoom) return;
  if (typeof teamId === "undefined" || teamId === null) return;

  const myTeamName = (String(teamId).split("::")[1] || "Equipo");
  const prev = getTeamChoice(activeRoom as any, myTeamName);
  if (!prev) return;

  if ((THEMES as any)[prev.themeId]) setTemaSel(prev.themeId as any);
  if (!Number.isNaN(prev.desafioIndex)) setDesafioIndex(prev.desafioIndex);
}, [mode, activeRoom, teamId, setTemaSel, setDesafioIndex]);


  const forceNextPhase = React.useCallback(() => {
    setStep("f5_video");
    publish({ finishedPitch: true, currentIdx: null, running: false });
  }, [publish, setStep]);
  // Arriba, junto con tus otros useState/useEffect del componente App:
const [f0Tip, setF0Tip] = React.useState<string>("");

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
resetTimer(flow.pitchSeconds);
setStep("f4_present");}, [flow.pitchSeconds, resetTimer, publish, setStep]);
function availableTeams(): string[] {
const order = flow.presentOrder ?? [];
  const picked = flow.wheel?.picked || [];
  return order.filter(t => !picked.includes(t));
}

function pickLastDirect() {
  const avail = availableTeams();
  if (avail.length !== 1) return;
  const winnerTeam = avail[0];
publish({
  wheel: {
    segments: flow.wheel?.segments ?? [],
    remaining: flow.wheel?.remaining?.filter(t => t !== winnerTeam) ?? [],
    picked: [ ...(flow.wheel?.picked ?? []), winnerTeam ],
    lastWinner: winnerTeam,
    spinning: false,
  },
});
  resetTimer(flow.pitchSeconds);
  setStep("f4_present");
}

function spinWheel() {
  const avail = availableTeams();
  if (avail.length === 0) return;       // todos presentaron
  if (avail.length === 1) {             // último: ir directo
    pickLastDirect();
    return;
  }
  const idx = Math.floor(Math.random()*avail.length);

const prevWheel: WheelState = flow.wheel ?? {
  segments: [],
  remaining: [],
  picked: [],
  spinning: false
};

const winnerTeam =
  prevWheel.lastWinner ??
  prevWheel.remaining[0] ??
  prevWheel.segments.find(s => !prevWheel.picked.includes(s)) ??
  "Equipo";

publish({
  wheel: {
    segments: prevWheel.segments,
    remaining: prevWheel.remaining.filter(s => s !== winnerTeam),
    picked: [...prevWheel.picked, winnerTeam],
    lastWinner: winnerTeam,
    spinning: false
  }
});
  resetTimer(flow.pitchSeconds);
  setStep("f4_present");
}

// Cambiar al siguiente equipo en presentaciones
// ---- Cambiar al siguiente equipo ----
const goNextTeam = React.useCallback(() => {
  const total = flow.presentOrder?.length || 0;
  if (total === 0) return;

  const nextIdx = (flow.currentIdx ?? 0) + 1;

  if (nextIdx >= total) {
    // Último equipo -> pasar a F5
    setStep("f5_video");  // <- un solo dueño del cambio de fase
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
    resetTimer(flow.pitchSeconds);
    resetTimer(flow.pitchSeconds);
    setStep("f4_present");  }
}, [flow.presentOrder, flow.currentIdx, flow.pitchSeconds, publish, resetTimer, setStep]);

// Arrancar juego desde LOBBY respetando Fase 0
function startFirstPhaseFromLobby(){
  const sec = flow.f0Seconds ?? 3*60;
  if (flow.includeF0) {
    resetTimer(sec);
    publish({ running:false });
    resetTimer(sec);
    setStep("f0_instr");
  } else {
    setStep("f1_video");
  }
}

// ---- Retroceder fase/equipo ----
const goPrevStep = React.useCallback(() => {
  const s = flow.step;

  // Caso especial: Presentaciones (Fase 4)
  if (s === "f4_present") {
    const idx = flow.currentIdx ?? 0;

    // Si hay un equipo anterior, retrocede a ese equipo
    if (idx > 0) {
      publish({ currentIdx: idx - 1, running: false });
      resetTimer(flow.pitchSeconds);
      resetTimer(flow.pitchSeconds);
      setStep("f4_present");
      return;
    }

    // Si estábamos en el primer equipo, volver a la rueda de orden
    publish({ currentIdx: null, running: false });
    setStep("f4_wheel");
    return;
  }

  // Secuencia lineal de pasos (según tu tipo FlowStep)
const order: FlowStep[] = [
  "lobby",
  "f1_video","f1_instr","f1_activity","f1_rank",
  "f2_video","f2_instr","f2_theme","f2_activity","f2_rank",
  "f3_video","f3_activity","f3_rank",
  "f4_video","f4_prep","f4_wheel","f4_present","f4_rank",
  "f5_video",
  "qr"
];


  const i = order.indexOf(s);
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
  
  

  const readyNow = useMemo(
    () => readyCount(activeRoom),
    [storageTick, activeRoom, flow.expectedTeams]
  );
  const readySet = readyTeamNames(activeRoom);



// --- Sync desafío confirmado al entrar a f2_activity ---
// --- Sync desafío confirmado al entrar a f2_activity ---
// --- Sync desafío confirmado al entrar a f2_activity ---
React.useEffect(() => {
  if (!flow || flow.step !== "f2_activity") return;
  if (!activeRoom || !teamId) return;

  const myTeamName = (teamId.split("::")[1] || "Equipo");
  const prev = getTeamChoice(activeRoom, myTeamName);

  if (prev) {
    if ((THEMES as any)[prev.themeId]) setTemaSel(prev.themeId as any);
    if (!Number.isNaN(prev.desafioIndex)) setDesafioIndex(prev.desafioIndex);
  }
}, [flow?.step, activeRoom, teamId]);



// === Pestañas de evaluación por equipo (alumno) ===
const myTeam = (teamId?.split("::")[1] || "");
const allTeams = flow.presentOrder || [];

const [currentTeam, setCurrentTeam] = React.useState<string>("");

const evalStorageKey = `udd_eval_${activeRoom}_${myTeam}`;
const [localEval, setLocalEval] = React.useState<Record<string,{scores:number[]; sent:boolean}>>(
  () => readJSON<Record<string,{scores:number[]; sent:boolean}>>(evalStorageKey, {})
);

React.useEffect(()=>{
  writeJSON(evalStorageKey, localEval);
}, [localEval, evalStorageKey]);

React.useEffect(()=>{
  if (currentTeam) return;
  if (!allTeams?.length) return;
  const first = allTeams[0] || "";
  setCurrentTeam(first === myTeam && allTeams[1] ? allTeams[1] : first);
}, [currentTeam, allTeams, myTeam]);

const currentData = localEval[currentTeam] || { scores:[0,0,0,0,0,0], sent:false };

const updateScores = (idx:number, value:number) => {
  setLocalEval(prev => ({
    ...prev,
    [currentTeam]: {
      scores: (prev[currentTeam]?.scores || [0,0,0,0,0,0]).map((x,i)=> i===idx ? value : x),
      sent: !!prev[currentTeam]?.sent
    }
  }));
};

const markSent = () => {
  setLocalEval(prev => ({
    ...prev,
    [currentTeam]: {
      scores: prev[currentTeam]?.scores || [0,0,0,0,0,0],
      sent: true
    }
  }));
};






  const analyticsApi=useAnalytics(); const {analytics,update}=analyticsApi;

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
  publish({
    wheel: {
      segments: teams,
      remaining: teams.slice(),
      picked: [],
      lastWinner: undefined,
      spinning: false
    }
  });
}

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [wheelTeamsKey, publish, flow.wheel]);




  // --- Estado del equipo seleccionado ---
  const teamIdx = analytics.teams.findIndex(
    t => t.roomCode === activeRoom && t.teamName === groupName
  );
  const currentMembers =
    teamIdx >= 0 ? (analytics.teams[teamIdx].integrantes || []) : [];

const teamFull = currentMembers.length >= MAX_PER_GROUP;
const alreadyIn =
  (miNombre || "").trim() &&
  currentMembers.some(
    p => p.nombre.trim().toLowerCase() === miNombre.trim().toLowerCase()
  );

  const markReady=()=>{const set=new Set<string>(readJSON<string[]>(READY_KEY,[])); if(teamId)set.add(teamId); const arr=Array.from(set); writeJSON(READY_KEY,arr); try{window.dispatchEvent(new StorageEvent("storage",{key:READY_KEY,newValue:JSON.stringify(arr)}))}catch{}; if(teamId){const teamName=teamId.split("::")[1]||"Equipo"; update(a=>({...a,teams:[...a.teams,{roomCode:activeRoom,teamName,integrantes:integrantes.length?integrantes:[{nombre:miNombre||"Integrante",carrera:miCarrera||"—"}],ts:Date.now()}]}));} setTeamReady(true);};
  function readyCount(roomCode: string){
    const set = new Set<string>(readJSON<string[]>(READY_KEY, []));
    return Array.from(set).filter(id => id.startsWith(`${roomCode}::`)).length;
  }

  const clearReadyForRoom=()=>{const arr=readJSON<string[]>(READY_KEY,[]); const filtered=arr.filter(id=>!id.startsWith(`${activeRoom}::`)); writeJSON(READY_KEY,filtered); try{window.dispatchEvent(new StorageEvent("storage",{key:READY_KEY,newValue:JSON.stringify(filtered)}))}catch{};};
  function teamsForCurrentRoom(analytics:Analytics, roomCode:string){
    return analytics.teams
      .filter(t=>t.roomCode===roomCode)
      .map(t=>t.teamName)
      .filter(Boolean);
  }
  function getTeamsForRoom(analytics: Analytics, roomCode: string): string[] {
    return teamsForCurrentRoom(analytics, roomCode);
  }

  function readyTeamNames(roomCode:string){
    const arr = readJSON<string[]>(READY_KEY,[]);
    return new Set(
      arr
        .filter(id=>id.startsWith(`${roomCode}::`))
        .map(id=>id.split("::")[1]||"")
    );
  }

  useEffect(()=>{
    if(!teamId || mode!=="alumno" || !teamReady) return;
    const map = readJSON<Record<string,number>>(COINS_KEY,{});
    map[teamId] = coins;
    writeJSON(COINS_KEY,map);
    try {
      window.dispatchEvent(new StorageEvent("storage",{key:COINS_KEY,newValue:JSON.stringify(map)}));
    } catch {}
  }, [coins, teamId, mode, teamReady]);

  const ranking = useMemo(()=>{
    const map = readJSON<Record<string,number>>(COINS_KEY,{});
    const ready = readyTeamNames(activeRoom);
    const pairs = Object.entries(map)
      .filter(([id]) => id.startsWith(`${activeRoom}::`))
      .map(([id, v]) => ({ equipo: id.split("::")[1] || "Equipo", total: v || 0 }))
      .filter(({equipo}) => ready.has(equipo));
    return pairs.sort((a,b)=> b.total - a.total);
  }, [activeRoom, flow.step, storageTick]);

  type Diff={x:number;y:number;r:number;zone:number;found?:boolean};
  const [diffs,setDiffs]=useState<Diff[]>([{x:.2,y:.25,r:.05,zone:0},{x:.35,y:.7,r:.05,zone:1},{x:.68,y:.35,r:.05,zone:2},{x:.8,y:.7,r:.05,zone:3}]);
  const [hintsLeft,setHintsLeft]=useState(2); const spotRef=useRef<HTMLDivElement|null>(null);
  const clickSpot=(e:React.MouseEvent<HTMLDivElement>)=>{if(!spotRef.current||!flow.running)return; const rect=spotRef.current.getBoundingClientRect(); const cx=(e.clientX-rect.left)/rect.width; const cy=(e.clientY-rect.top)/rect.height;
    setDiffs(arr=>arr.map(d=>{if(d.found)return d; const dx=d.x-cx,dy=d.y-cy; const dist=Math.hypot(dx,dy); if(dist<d.r){setCoins(c=>c+1); return {...d,found:true}} return d;}));
  };
  const useHint=()=>{if(hintsLeft<=0||!spotRef.current)return; const hidden=diffs.find(d=>!d.found); if(!hidden)return; setHintsLeft(h=>h-1); setCoins(c=>Math.max(0,c-1)); const tip=document.createElement("div");
    Object.assign(tip.style,{position:"absolute",left:`${hidden.x*100}%`,top:`${hidden.y*100}%`,transform:"translate(-50%,-50%)",width:`${hidden.r*150}px`,height:`${hidden.r*150}px`,border:`3px dashed ${theme.amarillo}`,borderRadius:"50%",pointerEvents:"none"} as CSSStyleDeclaration);
    spotRef.current.appendChild(tip); setTimeout(()=>tip.remove(),1200);
  };
  
  const size=5; const makeGrid=()=>Array.from({length:size},()=>Array.from({length:size},()=>false));
  const [goal]=useState<boolean[][]>(()=>{const g=makeGrid(); [[1,1],[1,2],[1,3],[2,0],[2,4],[3,1],[3,2],[3,3],[4,2]].forEach(([r,c])=>g[r][c]=true); return g;});
  const [grid,setGrid]=useState<boolean[][]>(()=>makeGrid()); const [scored,setScored]=useState<boolean[][]>(()=>makeGrid());
  const toggleCell=(r:number,c:number)=>{if(!flow.running)return; setGrid(prev=>{const next=prev.map(row=>row.slice()); next[r][c]=!next[r][c]; if(next[r][c]===goal[r][c]&&!scored[r][c]){setCoins(cn=>cn+1); setScored(sc=>{const cp=sc.map(row=>row.slice()); cp[r][c]=true; return cp;});} return next;});};

  const EMPATIA_FIELDS=[{key:"perfil",label:"Perfil"},{key:"entorno",label:"Entorno"},{key:"emociones",label:"Emociones"},{key:"necesidades",label:"Necesidades"},{key:"limitaciones",label:"Limitaciones"},{key:"motivaciones",label:"Motivaciones"}] as const;
  type EmpKey=(typeof EMPATIA_FIELDS)[number]["key"];
  const [empatia,setEmpatia]=useState<Record<EmpKey,string>>({perfil:"",entorno:"",emociones:"",necesidades:"",limitaciones:"",motivaciones:""});
  const [activeBubble,setActiveBubble]=useState<EmpKey>("perfil");
  const onEmpatiaChange=(k:EmpKey,v:string)=>{setEmpatia(prev=>{const wasEmpty=!prev[k]?.trim(); const next={...prev,[k]:v}; if(wasEmpty&&next[k].trim())setCoins(c=>c+1); return next;});};

  const defaultTHEMES:ThemeConfig={salud:{label:"Salud",desafios:[{titulo:"Desafío 1",descripcion:"Mejorar acceso a atención básica en barrios alejados."},{titulo:"Desafío 2",descripcion:"Reducir tiempos de espera en consultas no críticas."},{titulo:"Desafío 3",descripcion:"Apoyo a cuidadores de adultos mayores."}],persona:{nombre:"María",edad:62,bio:"Cuida a su pareja con movilidad reducida; vive a 40 min del centro de salud."}},
    sustentabilidad:{label:"Sustentabilidad",desafios:[{titulo:"Desafío 1",descripcion:"Disminuir residuos en campus y comunidad."},{titulo:"Desafío 2",descripcion:"Optimizar uso de agua y energía en hogares."},{titulo:"Desafío 3",descripcion:"Movilidad sostenible para trayectos cortos."}],persona:{nombre:"Diego",edad:24,bio:"Estudiante que vive en residencia; quiere reducir su huella y ahorrar."}},
    educacion:{label:"Educación",desafios:[{titulo:"Desafío 1",descripcion:"Motivar hábitos de estudio en estudiantes con poco tiempo."},{titulo:"Desafío 2",descripcion:"Facilitar aprendizaje práctico en primer año."},{titulo:"Desafío 3",descripcion:"Mejorar integración de estudiantes internacionales."}],persona:{nombre:"Aisha",edad:19,bio:"Estudiante internacional de primer año; barrera idiomática y poco tiempo."}}
  };
  const [THEMES,setTHEMES]=useState<ThemeConfig>(()=>readJSON<ThemeConfig>(THEMES_KEY,defaultTHEMES));
  const saveTHEMES=(next:ThemeConfig)=>{setTHEMES(next); writeJSON(THEMES_KEY,next); try{window.dispatchEvent(new StorageEvent("storage",{key:THEMES_KEY,newValue:JSON.stringify(next)}))}catch{}};
  const temaObj   = THEMES?.[temaSel];
  const desafios  = temaObj?.desafios ?? [];
  const desafioActual = desafios[desafioIndex] ?? desafios[0] ?? { titulo: "", descripcion: "" };

  const bubbleSize=isMobile?84:isTablet?96:108; const centerBubbleSize=isMobile?115:isTablet?128:138;
  const bubblePositions:Record<EmpKey,React.CSSProperties>=useMemo(()=>({perfil:{left:"8%",top:"12%"},limitaciones:{left:"26%",top:"8%"},motivaciones:{right:"26%",top:"8%"},entorno:{right:"8%",top:"12%"},emociones:{left:"10%",bottom:"10%"},necesidades:{right:"10%",bottom:"10%"},
  }),[isTablet,isMobile]);
// === Estado UI para el pitch (en el tope del componente, NO dentro de IIFE)

// Si quieres que se reinicie cada vez que cambia el equipo actual:
React.useEffect(() => {
  if (flow.step === "f4_present") {
    setSent(false);                 // reset envío
    setScores([0,0,0,0,0,0]);       // reset sliders
    setShowPhoto(false);            // cerrar foto del grupo anterior
  }
}, [flow.step, flow.currentIdx, activeRoom]);




  const VideoSpace:React.FC<{title:string}>=({title})=>(
    <Card title={`Por qué es importante: ${title}`} subtitle="(Video corto explicativo)" width={900}>
      <div style={{width:"100%",aspectRatio:"16/9",background:theme.gris,borderRadius:16,border:`2px dashed ${theme.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:"#90A4AE",fontWeight:700,pointerEvents:"none"}}>Video aquí</div>
    </Card>
  );
  const Instructions:React.FC<{title:string;bullets:string[]}>=({title,bullets})=>(
    <Card title="Instrucciones" subtitle={title} width={900} tight>
      <div style={{textAlign:"left"}}><ol>{bullets.map((b,i)=>(<li key={i} dangerouslySetInnerHTML={{__html:b}}/>))}</ol></div>
    </Card>
  );
  const BigTimer:React.FC<{label?:string;defaultSec:number}>=({label,defaultSec})=>(
    <div style={{...panelBox,textAlign:"center"}}>
      {label&&<div style={{fontWeight:900,color:theme.azul,marginBottom:6}}>{label}</div>}
      <div style={{fontSize:64,fontWeight:900,letterSpacing:1,marginBottom:12}}>{mmss(flow.remaining)}</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        <Btn onClick={()=>startTimer()} label="▶ Iniciar" full={false}/>
        <Btn onClick={()=>pauseTimer()} label="⏸ Pausa" full={false}/>
        <Btn onClick={()=>resetTimer(defaultSec)} label="⟲ Reset" full={false} variant="outline"/>
      </div>
    </div>
  );

  function handleCreateRoom() {
    (async () => {
      if (!profAuth) { setShowProfLogin(true); return; }
      const host = (miNombre || "").trim() || "Host";
      writeJSON(READY_KEY, []);
      try { window.dispatchEvent(new StorageEvent("storage", { key: READY_KEY, newValue: JSON.stringify([]) })); } catch {}
      writeJSON(COINS_KEY, {});
      try { window.dispatchEvent(new StorageEvent("storage", { key: COINS_KEY, newValue: JSON.stringify({}) })); } catch {}
      let code = "";
      try {
        const r = await fetch(`${API}/health`, { method: "GET" });
        if (r.ok) {
          const res = await createRoom({ hostName: host }, profAuth || undefined);
          code = res.roomCode;
        } else {
          code = generateCode(5);
        }
      } catch {
        code = generateCode(5);
      }
  
      const expected =
        recommendedGroups.length
          ? Math.max(MIN_GROUPS, Math.min(recommendedGroups.length, MAX_GROUPS))
          : equiposQty;
  
      publish({
        roomCode: code,
        expectedTeams: expected,
        step: "lobby",
        remaining: 5 * 60,
        running: false,
        formation: "manual" // <- NUEVO

      });
  
      setRoomCode(code);
      setJoinedRoom(code);
      const url = new URL(window.location.href);
      url.searchParams.set("room", code);
      window.history.replaceState({}, "", url.toString());
      update(a => ({ ...a, roomsCreated: a.roomsCreated + 1 }));
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
  
      const parsed = rows.map(r => ({
        nombre: r.Nombre || r.name || "",
        carrera: r.Carrera || r.career || ""
      }));
  
      // guarda roster global
      setRoster(parsed);
      writeJSON(ROSTER_KEY, parsed);
      try {
        window.dispatchEvent(
          new StorageEvent("storage", { key: ROSTER_KEY, newValue: JSON.stringify(parsed) })
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
    const grupos: { nombre: string; integrantes: { nombre: string; carrera: string }[] }[] =
      Array.from({ length: gruposCount }, (_, i) => ({
        nombre: `Grupo ${i + 1}`,
        integrantes: []
      }));
  
    for (let i = 0; i < shuffled.length; i++) {
      const idx = i % gruposCount;
      if (grupos[idx].integrantes.length < MAX_PER_GROUP) {
        grupos[idx].integrantes.push(shuffled[i]);
      } else {
        // si ese grupo llegó a 9, busca el siguiente con espacio
        const target = grupos.find(g => g.integrantes.length < MAX_PER_GROUP);
        (target || grupos[idx]).integrantes.push(shuffled[i]);
      }
    }
  
    setRecommendedGroups(grupos);
  }
  function aplicarGruposSugeridos(){
    const code = flow.roomCode || activeRoom;
    if(!code){ alert("Primero crea una sala."); return; }
    if(!recommendedGroups.length){ alert("No hay grupos sugeridos para aplicar."); return; }
  
    // 1) Escribir equipos en métricas (evita duplicados por sala)
    update(a=>{
      const existing = new Set(
        a.teams.filter(t=>t.roomCode===code).map(t=>t.teamName)
      );
      const nuevos = recommendedGroups
        .filter(g=>!existing.has(g.nombre))
        .map(g=>({
          roomCode: code,
          teamName: g.nombre,
          integrantes: g.integrantes || [],
          ts: Date.now()
        }));
      return {...a, teams:[...a.teams, ...nuevos]};
    });
  // ✅ AÑADIR (cerca de otros hooks)
    // 2) Marcar todos esos equipos como "listos" (READY_KEY)
    const prev = readJSON<string[]>(READY_KEY, []);
    const keepOthers = prev.filter(id => !id.startsWith(`${code}::`));
    const addReady = recommendedGroups.map(g=>`${code}::${g.nombre}`);
    const nextReady = Array.from(new Set([...keepOthers, ...addReady]));
    writeJSON(READY_KEY, nextReady);
    try{ window.dispatchEvent(new StorageEvent("storage",{key:READY_KEY,newValue:JSON.stringify(nextReady)})); }catch{}
  
    // 3) Publicar formación AUTO y ajustar expectedTeams
    const clamped = Math.max(
      MIN_GROUPS,
      Math.min(recommendedGroups.length, MAX_GROUPS)
    );
    publish({
      expectedTeams: clamped,
      formation: "auto"   // <- MODO AUTO
    });
  
    alert("Grupos aplicados. Los equipos quedaron marcados como listos.");
  }
  


  
  

  function resetSalaActual(keepCode:boolean=true){
    const code = flow.roomCode;
    if(!code){ alert("No hay sala activa."); return; }
    const prevReady = readJSON<string[]>(READY_KEY, []);
    const newReady = prevReady.filter(id => !id.startsWith(`${code}::`));
    writeJSON(READY_KEY, newReady);
    try{ window.dispatchEvent(new StorageEvent("storage",{key:READY_KEY,newValue:JSON.stringify(newReady)})); } catch{}
    const prevCoins = readJSON<Record<string,number>>(COINS_KEY, {});
    const newCoins: Record<string,number> = {};
    for(const [k,v] of Object.entries(prevCoins)){
      if(!k.startsWith(`${code}::`)) newCoins[k] = v;
    }
    writeJSON(COINS_KEY, newCoins);
    try{ window.dispatchEvent(new StorageEvent("storage",{key:COINS_KEY,newValue:JSON.stringify(newCoins)})); } catch{}
    update(a=>{
      return {
        ...a,
        teams: a.teams.filter(t=>t.roomCode!==code),
        reflections: a.reflections.filter(r=>r.roomCode!==code),
        feedbacks: a.feedbacks.filter(f=>f.roomCode!==code)
      };
    });
    if(keepCode){
      publish({
        step: "lobby",
        running: false,
        remaining: 5*60,
        expectedTeams: 0,
        presentOrder: [],
        currentIdx: 0,
        pitchSeconds: flow.pitchSeconds
      });
    }else{
      publish({
        roomCode: "",
        step: "lobby",
        running: false,
        remaining: 5*60,
        expectedTeams: 0,
        presentOrder: [],
        currentIdx: 0,
        pitchSeconds: flow.pitchSeconds
      });
      setJoinedRoom("");
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      window.history.replaceState({}, "", url.toString());
    }
    alert(keepCode ? "Sala reiniciada (se mantiene el código)." : "Sala cerrada. Vuelve a crear una nueva.");
  }

  async function handleJoinRoom() {
    const code = (roomCode || "").trim().toUpperCase();
    if (!code) { alert("Ingresa el código de sala"); return; }
    try {
      await joinRoom(code, { name: miNombre || "Alumno", career: miCarrera || "" });
      publish({ roomCode: code });
      setJoinedRoom(code);
      const url = new URL(window.location.href);
      url.searchParams.set("room", code);
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      console.error(err);
      alert("No se pudo unir a la sala. Verifica el código o la conexión.");
    }
  }
// === Fase 0: tips aleatorios (solo conversación, sin inputs) ===
const F0_TIPS = [
  "tu hobby o pasatiempo",
  "tu superpoder para el equipo hoy",
  "la app que más usas",
  "tu comida o bebida favorita",
  "tu emoji del día",
  "una canción que te suba el ánimo",
  "algo que te gustaría aprender",
  "un emprendimiento que admires",
  "una meta personal para este semestre"
];

function useRandomF0Tip() {
  const [tip, setTip] = React.useState<string>("");
  React.useEffect(()=>{
    const idx = Math.floor(Math.random() * F0_TIPS.length);
    setTip(F0_TIPS[idx]);
  },[]);
  return tip;
}

// === Mini-animación (latido) ===
const pulseKeyframes = `
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.04); opacity: .95; }
  100% { transform: scale(1); opacity: 1; }
}`;
const pulseStyle: React.CSSProperties = { animation: "pulse 1.6s ease-in-out infinite", display: "inline-block" };

  if(mode==="inicio")return(
    <div style={appStyles}>
      <Background/>
      <GlobalFormCSS/>
      <AutoCenter>
{showProfLogin && (
  <div style={{position:"fixed", inset:0, zIndex:50,background:"rgba(0,0,0,.35)", backdropFilter:"blur(2px)",display:"grid", placeItems:"center", padding:16}}>
    <div style={{width:"clamp(320px,92vw,520px)"}}>
      <LoginProfesor
        onSuccess={handleProfLoginSuccess}
        onCancel={()=> setShowProfLogin(false)}
      />
    </div>
  </div>
)}
        {!showAdminLogin ? (
          <Card title="Mision Emprende" subtitle="Selecciona tu perfil" width={900}>
            <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap",justifyContent:"center"}}>
              <Btn onClick={() => setShowProfLogin(true)} label="👩‍🏫 Profesor"/>
              <Btn onClick={()=>setMode("alumno")} bg={theme.rosa} label="🧑‍🎓 Alumno"/>
              <Btn onClick={()=>{ setShowAdminLogin(true); setAdminUser(""); setAdminPass(""); setAdminErr(""); }} bg={theme.amarillo} fg={theme.texto} label="🛠️ Administrador"/>
            </div>
          </Card>
        ) : (
          <Card title="Acceso Administrador" subtitle="Ingresa tus credenciales" width={520}>
            <div style={{display:"grid",gap:10,marginTop:8}}>
              <input placeholder="Usuario" value={adminUser} onChange={e=>setAdminUser(e.target.value)} style={baseInput}/>
              <input placeholder="Contraseña" type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} style={baseInput}
                onKeyDown={e=>{
                  if(e.key==="Enter"){
                    if(adminUser==="1" && adminPass==="1"){ setMode("admin"); setShowAdminLogin(false); setAdminUser(""); setAdminPass(""); setAdminErr(""); }
                    else{ setAdminErr("Usuario o contraseña incorrectos"); }
                  }
                }}
              />
              {adminErr && <div style={{color:"#D32F2F",fontWeight:700,fontSize:13}}>{adminErr}</div>}
              <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:6}}>
                <Btn label="⬅ Volver" bg={theme.amarillo} fg={theme.texto} full={false} onClick={()=>{ setShowAdminLogin(false); setAdminErr(""); }}/>
                <Btn label="Ingresar" full={false} onClick={()=>{ if(adminUser==="1" && adminPass==="1"){ setMode("admin"); setShowAdminLogin(false); setAdminUser(""); setAdminPass(""); setAdminErr(""); } else{ setAdminErr("Usuario o contraseña incorrectos"); } }}/>
              </div>
            </div>
          </Card>
        )}
      </AutoCenter>
    </div>
  );
  if(mode==="admin"){return(<div style={appStyles}><Background/><GlobalFormCSS/><AutoCenter>
    <AdminDashboard
      analytics={analytics}
      THEMES={THEMES}
      setTHEMES={saveTHEMES}
      flow={flow}
      onBack={()=>setMode("inicio")}
      ranking={ranking}
      clearMetrics={()=>update(()=>({roomsCreated:0,challengeUsage:{},teams:[],reflections:[],feedbacks:[]}))}
      activeRoom={activeRoom}
    />
  </AutoCenter></div>)}

  if(mode==="prof"){return(<div style={appStyles}><Background/><GlobalFormCSS/><AutoCenter>
{!activeRoom?(
  <Card title="Crear Nueva Sala" subtitle="Define cantidad de equipos" width={820}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
  <div>
    <label style={{fontSize:12,fontWeight:800,color:theme.azul}}>Cantidad de equipos</label>
    <select value={String(equiposQty)} onChange={e=>setEquiposQty(Number(e.target.value))} style={{...baseInput,padding:10,marginTop:6}}>
      <option value="3">3</option>
      <option value="4">4</option>
    </select>
  </div>

  <div>
    <label style={{fontSize:12,fontWeight:800,color:theme.azul}}>Subir Excel de alumnos</label>
    <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} style={{...baseInput,padding:10,marginTop:6}} />
    <div style={{fontSize:12,opacity:.8,marginTop:6}}>
      Columnas esperadas: <b>Nombre</b> y <b>Carrera</b>
    </div>
  </div>

  <div style={{alignSelf:"end"}}>
    <Btn onClick={handleCreateRoom} bg={theme.rosa} label="Generar Código"/>
  </div>
</div>


    {recommendedGroups.length > 0 && (
      <div style={{maxHeight: 280,overflowY: "auto",border: `1px solid ${theme.border}`,borderRadius: 12,padding: 10,marginTop: 16}}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Grupos sugeridos automáticamente:</div>
        {recommendedGroups.map((g, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, color: theme.azul }}>
              {g.nombre} ({g.integrantes.length})
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
              {g.integrantes.map((p, j) => (
                <li key={j}>{p.nombre} — {p.carrera}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}
  </Card>
):null}

    {activeRoom&&flow.step==="lobby"&&(
  <div style={{width:"clamp(320px,92vw,1100px)", display:"grid", gridTemplateColumns:"1fr 320px", gap:12}}>
    <Card title="Sala creada" subtitle="Comparte el código y espera a los equipos" width={700}>
      <div style={{fontSize:32,fontFamily:"Roboto Mono, ui-monospace, SFMono-Regular, Menlo, monospace",marginBottom:8,color:theme.azul}}>
        {activeRoom}
      </div>
      <div style={{fontSize:13,opacity:.8,marginBottom:12}}>
        Equipos listos: <b>{readyNow}</b> / <b>{flow.expectedTeams}</b>
      </div>
      <Btn onClick={startFirstPhaseFromLobby} label="Continuar con todos" disabled={readyNow < (flow.expectedTeams ?? Number.MAX_SAFE_INTEGER)}
/>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
        <Btn onClick={()=>resetSalaActual(true)} bg="#FFC107" fg={theme.texto} label="↻ Reiniciar sala (mantener código)" full={false}/>
        <Btn onClick={()=>{ if(confirm("¿Cerrar la sala y volver a crear otra?")) resetSalaActual(false); }} bg="#F44336" label="🗑 Cerrar sala" full={false}/>
      </div>
    </Card>

    {recommendedGroups.length > 0 && (
      <div style={{ ...panelBox, marginTop: 0 }}>
        <div style={badgeTitle}>📥 Grupos sugeridos desde Excel</div>
        <div style={{ fontSize: 13, opacity: .8, marginBottom: 8 }}>
          {recommendedGroups.length} grupo(s) listos para aplicar en la sala <b>{activeRoom}</b>.
        </div>
        <Btn onClick={aplicarGruposSugeridos} label="Aplicar grupos sugeridos a la sala" full={false} disabled={!flow.roomCode}/>
      </div>
    )}

    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
      <TeamListProfesor
        activeRoom={activeRoom}
        teams={analytics.teams as any}
        readySet={readyTeamNames(activeRoom)}
        border={theme.border}
        azul={theme.azul}
        muted={theme.muted}
        panelBox={panelBox as React.CSSProperties}
        badgeTitle={badgeTitle as React.CSSProperties}
      />
    </div>

    <div style={panelBox as React.CSSProperties}>
      <div style={badgeTitle}>👥 Equipos creados</div>
      {teamsForCurrentRoom(analytics, activeRoom).length === 0 ? (
        <div style={{opacity:.7}}>Aún no se crean grupos…</div>
      ) : (
        <div style={{display:"grid", gap:6}}>
          {teamsForCurrentRoom(analytics, activeRoom).map((name,i)=>(
            <div key={i} style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8}}>
              <div><b>{name}</b></div>
              <div style={{fontSize:12, opacity:.7}}>#{i+1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{flow.step==="f1_video" && (
  <>
    <div style={{ marginBottom: 12 }}>
      <TeamworkMiniAnim loop /> 
    </div>
    <div style={{ display:"flex", justifyContent:"center" }}>
      <Btn onClick={()=>setStep("f1_instr")} label="Continuar con todos" full={false}/>
    </div>
  </>
)}

{flow.step==="f1_instr"&&(<><Instructions title="Fase 1 — Trabajo en equipo" bullets={["Juego 1: <b>Spot the Difference</b>.","Juego 2: <b>Matriz de luces</b>.","El tiempo es compartido; ustedes deciden cómo distribuirlo."]}/><Btn
  onClick={() => { resetTimer(5*60); setStep("f1_activity"); }}
  label="Abrir juegos y timer"
  full={false}
/>
</>)}
{flow.step==="f1_activity"&&(<Card title="Fase 1 — En curso" subtitle="Timer visible para todos" width={720}><BigTimer label="Tiempo F1 (Diferencias/Matriz)" defaultSec={5*60}/><div style={{display:"flex",justifyContent:"center",marginTop:12}}><Btn onClick={()=>setStep("f1_rank")} label="Terminar y ver ranking" full={false}/></div></Card>)}
{flow.step==="f1_rank"&&(<Card title="Ranking — Fase 1" subtitle="Resultados en vivo" width={900}><ConfettiBurst/><RankingBars data={ranking} onContinue={()=>setStep("f2_video")}/></Card>)}
{mode === "prof" && (
  <div style={{position:"fixed", top:16, right:16, display:"flex", gap:8, zIndex:999}}>
    <button
      onClick={goPrevStep1}
      style={{
        padding:"10px 14px",
        borderRadius:10,
        border:"1px solid #E3E8EF",
        background:"#fff",
        boxShadow:"0 8px 20px rgba(16,24,40,.08)",
        cursor:"pointer"
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
{flow.step==="f0_instr" && (
  <Card title="Fase 0 — ¡Nos conocemos rápido!"
        subtitle="Presentación breve si no se conocen"
        width={900}>
    <div style={{textAlign:"left", lineHeight:1.6}}>
      <div style={{fontSize:18, fontWeight:700, marginBottom:8}}>
        <span style={pulseStyle}>🗣️</span> Indicaciones
      </div>
      <ul>
        <li>En equipos, preséntense rápidamente</li>
        <li>Nombre y apellido, carrera o área</li>
        <li>Compartan un <b>dato entretenido</b> (hobby, talento, app favorita, canción que les motive, etc.)</li>
      </ul>
      <div style={{opacity:.8, marginTop:8}}>
        No es necesario escribir nada — solo conversen 😊
      </div>
    </div>

    <div style={{display:"flex", justifyContent:"center", gap:10, marginTop:14}}>
      <Btn onClick={()=>{
        const sec = flow.f0Seconds ?? 3*60;
        resetTimer(sec);
        publish({ running:false });
        resetTimer(sec);
        setStep("f0_activity");
      }} label="Abrir Fase 0 con timer" full={false}/>
    </div>
  </Card>
)}

{/* ===== FASE 0 — ACTIVIDAD (timer + tip aleatorio) ===== */}
{flow.step === "f0_activity" && (
  <Card
    title="Fase 0 — Presentación en equipos"
    subtitle={`Tiempo: ${mmss(flow.remaining)} — 3 minutos recomendados`}
    width={980}
  >
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, opacity: .8 }}>
        Tip: pueden contar <b>{f0Tip}</b>, o cualquier otro dato entretenido
      </div>

      {/* Controles del timer (profe) */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 4 }}>
        <Btn onClick={() => startTimer()} label="▶ Iniciar" full={false} />
        <Btn onClick={() => pauseTimer()} label="⏸ Pausa" full={false} />
        <Btn
          onClick={() => {
            const sec = flow.f0Seconds ?? 3 * 60;
            resetTimer(sec);
            publish({ running: false });
          }}
          label="⟲ Reset"
          full={false}
          variant="outline"
        />
      </div>

      {/* Continuar */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
        <Btn onClick={() => setStep("f1_video")} label="Continuar al juego" full={false} />
      </div>
    </div>
  </Card>
)}


{/* Ajustes previos en LOBBY (solo profesor) */}
{mode==="prof" && flow.step==="lobby" && (
  <div style={{position:"fixed", bottom:16, left:16, zIndex:999, background:"#fff",
               border:"1px solid #E3E8EF", borderRadius:12, padding:12,
               boxShadow:"0 10px 24px rgba(16,24,40,.10)", maxWidth:360}}>
    <div style={{fontWeight:700, marginBottom:6}}>Ajustes previos</div>

    <label style={{display:"grid", gridTemplateColumns:"auto 1fr", gap:8, alignItems:"start", cursor:"pointer"}}>
      <input
        type="checkbox"
        checked={!!flow.includeF0}
        onChange={e=>publish({ includeF0: e.target.checked })}
      />
      <div>
        <div><b>Incluir Fase 0 — Presentación rápida</b></div>
        <div style={{fontSize:12, opacity:.8}}>
          Si los alumnos no se conocen: breve presentación verbal por equipo (3 min)
        </div>
      </div>
    </label>

{/* Botón: marcar Fase 0 activada (NO navega) */}
<div style={{display:"flex", gap:8, marginTop:10}}>
  <button
    onClick={()=>{
      // marca Fase 0 activa (no cambia de pantalla)
      publish({ includeF0: true });
      alert("Fase 0 activada: al continuar, iniciaremos con la presentación rápida.");
    }}
    disabled={!flow.roomCode || !(flow.expectedTeams && flow.expectedTeams>0)}
    style={{
      padding:"8px 12px",
      borderRadius:10,
      border:"1px solid #E3E8EF",
      background: (!flow.roomCode || !(flow.expectedTeams && flow.expectedTeams>0)) ? "#f3f4f6" : "#fff",
      cursor: (!flow.roomCode || !(flow.expectedTeams && flow.expectedTeams>0)) ? "not-allowed" : "pointer"
    }}
    title={!flow.roomCode ? "Primero genera el código de sala" :
           !(flow.expectedTeams && flow.expectedTeams>0) ? "Define la cantidad de equipos" :
           "Fase 0 quedará activada para cuando comiences"}
  >
    Activar Fase 0 (se ejecutará al comenzar)
  </button>
</div>
  </div>
)}

{flow.step==="f2_video" && (
  <>
    <div style={{ marginBottom: 12 }}>
      <EmpathyAnimacion loop />
    </div>
    <div style={{ display:"flex", justifyContent:"center" }}>
      <Btn onClick={()=>setStep("f2_instr")} label="Continuar con todos" full={false}/>
    </div>
  </>
)}

{flow.step === "f2_instr" && (
  <Card
    title="Fase 2 — Instrucciones"
    subtitle="Seleccionen temáticas y desafíos"
    width={900}
  >
    <div style={{textAlign:"left"}}>
      <ol>
        <li>El profesor elegirá las <b>temáticas</b> disponibles.</li>
        <li>Cada equipo debe <b>elegir y confirmar</b> su desafío.</li>
        <li>
          Cuando todos confirmen, el profesor abrirá el <b>mapa de empatía</b> y el <b>timer</b>.
        </li>
      </ol>
    </div>

    <div style={{display:"flex",justifyContent:"center",marginTop:12}}>
      <Btn
        label="Ir a selección de desafíos"
        full={false}
        onClick={()=> setStep("f2_theme")}
      />
    </div>
  </Card>
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
        update(a => ({
          ...a,
          challengeUsage: { ...a.challengeUsage, [key]: (a.challengeUsage[key] || 0) + 1 }
        }));
      }}
      hideConfirm={true}     // <<--- ESTO APAGA EL BOTÓN AZUL EN PROFESOR
    />

    {/* Panel contador + botón para abrir mapa */}
    {(() => {
      const teams = getTeamsForRoom(analytics, activeRoom);
      const ok = countConfirmedChoices(activeRoom, teams);
      const need = flow.expectedTeams || teams.length || 0;

      return (
        <div style={{display:"grid", gap:8, justifyItems:"center", marginTop:10}}>
          <div style={{fontSize:14, opacity:.8}}>
            Equipos con desafío confirmado: <b>{ok}/{need}</b>
          </div>
          <Btn
  label="Abrir mapa y timer"
  full={false}
  disabled={ok < need}
  title={ok<need ? "Aún faltan equipos por confirmar" : "Iniciar etapa 2"}
  onClick={()=>{
    const EMPATIA_SECONDS = flow.empatiaSeconds ?? 10*60;
    resetTimer(EMPATIA_SECONDS);

    publish({ running:false });

    setStep("f2_activity");
  }}
/>

        </div>
      );
    })()}
  </>
)}
{/* ===== PROFESOR: paso f2_activity (instrucciones + timer) ===== */}
{flow.step === "f2_activity" && (
  <Card
    title="Fase 2 — Empatía"
    subtitle={`Tiempo: ${mmss(flow.remaining)}`}
    width={1100}
  >
    {/* INSTRUCCIONES (PROFESOR) */}
    <Instructions
      title="Instrucciones para la Fase 2"
      bullets={[
        "Anuncia la temática y el desafío seleccionados.",
        "Indica a cada equipo que complete el mapa de empatía (centrarse en usuario real).",
        "El tiempo lo controlas tú: inicia, pausa o resetea cuando corresponda.",
        "Cuando todos terminen, avanza al ranking o siguiente fase."
      ]}
    />

    {/* Controles del timer */}
    <div style={{display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:12}}>
      <Btn onClick={()=>startTimer()} label="▶ Iniciar" full={false}/>
      <Btn onClick={()=>pauseTimer()} label="⏸ Pausa" full={false}/>
      <Btn
        onClick={()=>{
          const EMPATIA_SECONDS = flow.empatiaSeconds ?? 10*60;
          resetTimer(EMPATIA_SECONDS);
          publish({ running:false });
        }}
        label="⟲ Reset"
        full={false}
        variant="outline"
      />
    </div>

    {/* ✅ Botones para avanzar de etapa */}
    <div style={{display:"flex", gap:10, justifyContent:"center", marginTop:14, flexWrap:"wrap"}}>
      <Btn
        onClick={()=>setStep("f2_rank")}
        label="Terminar etapa y ver ranking"
        full={false}
      />
    </div>

    <div style={{textAlign:"center",opacity:.8, marginTop:8}}>
      Controla el tiempo mientras los equipos completan el mapa de empatía.
    </div>
  </Card>
)}




{flow.step==="f2_rank"&&(<Card title="Ranking — Fase 2" subtitle="Resultados en vivo" width={900}><RankingBars data={ranking} onContinue={()=>setStep("f3_video")}/></Card>)}

{flow.step==="f3_video"&&(
  <>
    <div style={{ marginBottom: 12 }}>
      <CreatividadAnimacion loop />
    </div>
    <Btn onClick={()=>{ resetTimer(15*60); resetTimer(15*60);setStep("f3_activity"); }} label="Abrir actividad y timer" full={false}/>
  </>
)}

{flow.step==="f3_activity"&&(<Card title="Fase 3 — En curso" subtitle="Creatividad (timer)" width={720}><BigTimer label="Tiempo F3 (Creatividad)" defaultSec={15*60}/><div style={{display:"flex",justifyContent:"center",marginTop:12}}><Btn onClick={()=>setStep("f3_rank")} label="Terminar y ver ranking" full={false}/></div></Card>)}
{flow.step==="f3_rank"&&(<Card title="Ranking — Fase 3" subtitle="Resultados en vivo" width={900}><RankingBars data={ranking} onContinue={()=>setStep("f4_video")}/></Card>)}

{flow.step==="f4_video"&&(
  <PitchAnimacion
    showContinue
    onContinue={()=>{ resetTimer(10*60); resetTimer(flow.pitchSeconds);
setStep("f4_present");; }}
  />
)}

{flow.step==="f4_prep"&&(
  <Card title="Fase 4 — Preparación del Pitch" subtitle="Timer visible" width={720}>
    <BigTimer label="Tiempo F4 (Preparación)" defaultSec={10*60}/>
    <div style={{display:"flex",justifyContent:"center",marginTop:12}}>
      <Btn onClick={()=>setStep("f4_wheel")} label="Ir a RUEDA de orden" full={false}/>
    </div>
  </Card>
)}
{flow.step==="f4_wheel"&&(
  <Card title="Fase 4 — Orden de Presentación" subtitle="Gira la ruleta para ir definiendo el orden" width={980}>
    {(() => {

      const wheel = flow.wheel || {segments:[], remaining:[], picked:[]};

      const publishWheel = (partial: Partial<NonNullable<FlowState["wheel"]>>) =>
        publish({ wheel: { ...(flow.wheel || {segments:[],remaining:[],picked:[]}), ...partial } });
      const avail = availableTeams();
<Btn
  label={avail.length<=1 ? "Ir al último equipo" : "Girar ruleta"}
  onClick={avail.length<=1 ? pickLastDirect : spinWheel}
  disabled={avail.length===0}
/>


      return (
        <div style={{display:"grid", justifyItems:"center", gap:16}}>
<PrettyWheel
  segments={(wheel.remaining?.length ? wheel.remaining : wheel.segments) || []}
  isTeacher
  winnerHint={wheel.lastWinner}
  onSpinEnd={(winner) => {
    const base = (wheel.remaining?.length ? wheel.remaining : wheel.segments) || [];
    const newRemaining = base.filter(t => t !== winner);
    const newPicked = [...(wheel.picked || []), winner];

    publishWheel({
      lastWinner: winner,
      remaining: newRemaining,
      picked: newPicked,
      spinning: false,
    });

    if (newRemaining.length === 0) {
      publish({ presentOrder: newPicked, currentIdx: 0 });
    }
  }}
/>


          {/* Orden parcial en vivo */}
          <div style={{...panelBox, width:"100%", maxWidth:780}}>
            <div style={{fontWeight:900,color:theme.azul, marginBottom:6}}>Orden (parcial)</div>
            {wheel.picked?.length ? (
              <ol style={{margin:0,paddingLeft:18}}>
                {wheel.picked.map((t,i)=>(<li key={i}>{t}</li>))}
              </ol>
            ) : <div style={{opacity:.8}}>Aún no hay equipos seleccionados.</div>}
          </div>

          {/* Avanzar a Pitch cuando ya se definió todo el orden */}
          <Btn
            label={ (flow.presentOrder?.length||0) > 0 ? "Confirmar orden y abrir Pitch" : "Gira hasta completar el orden" }
            full={false}
            disabled={!(flow.presentOrder?.length>0)}
            onClick={()=>{
              resetTimer(flow.pitchSeconds);
              publish({ running:false });
              resetTimer(flow.pitchSeconds);
              setStep("f4_present");

            }}
          />
        </div>
      );
    })()}
  </Card>
)}

{flow.step==="f4_present" && (
  <Card
    title="Fase 4 — Presentaciones (Pitch)"
    subtitle={`Equipo actual: ${currentTeamSafe()}`}

  >
    {(() => {
      const totalTeams = flow.presentOrder?.length || 0;
      const currentIdx = flow.currentIdx ?? 0;
      const currentTeam = flow.presentOrder?.[flow.currentIdx ?? 0] ?? "-";

      // ✅ Si no hay currentIdx, inicializamos una vez
      if (totalTeams > 0 && (flow.currentIdx === null || flow.currentIdx === undefined)) {
        publish({ currentIdx: 0, running:false });
      }

      // ✅ Foto LEGO
      const lego = readJSON<Record<string,{legoPhoto?:string}>>("udd_lego_v1", {});
      const legoPhoto = lego[`${activeRoom}::${currentTeam}`]?.legoPhoto || "";

      // ✅ Foto fallback
      const fallbackPhoto = getTeamPhoto(activeRoom, currentTeam) || "";
      const scenarioUrl = legoPhoto || fallbackPhoto;
      if (flow.presentOrder?.length && (flow.currentIdx == null)) {
        publish({ currentIdx: 0, step: "f4_present", running:false });
      }
      
      return (
        <div style={{display:"grid",gap:12}}>
          
          {/* Escenario */}
          <div style={{
            ...panelBox,
            display:"grid",
            gridTemplateColumns:isTablet?"1fr":"380px 1fr",
            gap:12
          }}>
            <div style={{position:"relative"}}>
              <div style={{
                position:"absolute", top:-10, left:-10,
                background:theme.rosa, color:"#fff",
                padding:"4px 10px", borderRadius:12, fontWeight:900
              }}>
                Escenario
              </div>

              <div style={{
                border:`1px solid ${theme.border}`,
                borderRadius:16, overflow:"hidden", background:"#fff"
              }}>
                {scenarioUrl ? (
                  <img
                    src={scenarioUrl}
                    alt={`Prototipo ${currentTeam}`}
                    style={{width:"100%",maxHeight:420,objectFit:"contain"}}
                  />
                ) : (
                  <div style={{height:260,display:"grid",placeItems:"center"}}>
                    Sin foto del equipo
                  </div>
                )}
              </div>
            </div>


            {/* Controles timer */}
            <div>
              <div style={{fontSize:22,fontWeight:900,color:theme.azul}}>
                {currentTeam}
              </div>
              <div style={{opacity:.8}}>
                Presenta su prototipo — {currentIdx+1} de {totalTeams}
              </div>

              <div style={{...panelBox,marginTop:12,textAlign:"center"}}>
                <div style={{fontWeight:900,color:theme.azul,marginBottom:6}}>
                  Tiempo — {mmss(flow.remaining)}
                </div>

                <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                  <Btn onClick={()=>startTimer()} label="▶ Iniciar" full={false}/>
                  <Btn onClick={()=>pauseTimer()} label="⏸ Pausa" full={false}/>
                  <Btn onClick={hardResetPitch} label="⟲ Reset" full={false} variant="outline"/>
                </div>

<div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
  <Btn
    label="Siguiente equipo"
    full={false}
    onClick={goNextTeam}
  />

  <Btn
    label="Forzar siguiente (dev)"
    full={false}
    variant="outline"
    onClick={forceNextPhase}  // <- antes llamaba goNextTeam en una versión
  />
</div>

              </div>
            </div>
          </div>

          {/* Orden */}
          {totalTeams>0 && (
            <OrderBoard order={flow.presentOrder} currentIdx={currentIdx} title="Orden de presentación"/>
          )}

          {flow.finishedPitch && (
            <div style={{textAlign:"center",marginTop:12,fontWeight:900,color:"#2e7d32"}}>
              ✅ Presentaciones completadas
            </div>
          )}

        </div>
      );
    })()}
  </Card>
)}


{flow.step==="f5_video"&&(
  <Card title="Autoevaluación y retroalimentación" subtitle="Cierre visual" width={900}>
    <AnimEva/>
    <div style={{ display:"flex", justifyContent:"center", marginTop:12 }}>
      <Btn onClick={()=>setStep("qr")} label="Ir a QR" full={false}/>
    </div>
  </Card>
)}

{flow.step==="qr"&&(
  <Card title="¡Evalúa el juego!" subtitle="Escanea el código QR con tu celular" width={700}>
    <div style={{width:260,height:260,margin:"12px auto",background:"#fff",border:`3px dashed ${theme.border}`,borderRadius:16,display:"grid",placeItems:"center",color:"#90A4AE",fontWeight:800}}>QR aquí</div>
    <Btn onClick={()=>{ publish({roomCode:"",expectedTeams:0,step:"lobby",remaining:5*60,running:false}); clearReadyForRoom(); writeJSON(COINS_KEY,{}); try{window.dispatchEvent(new StorageEvent("storage",{key:COINS_KEY,newValue:JSON.stringify({})}))}catch{}; }} bg={theme.rosa} label="Terminar" full={false}/>
  </Card>
)}
</AutoCenter></div>)}

if(mode==="alumno"){return(<div style={appStyles}><Background/><GlobalFormCSS/><AutoCenter>
{(!joinedRoom) && (
  <Card title="Alumno" subtitle="Ingresa el código de sala para continuar" width={520}>
    <input placeholder="Código de sala" value={roomCode} onChange={e=>setRoomCode(e.target.value.toUpperCase())} style={{...baseInput,textAlign:"center",fontWeight:700,marginBottom:14}}/>
    <Btn onClick={handleJoinRoom} label="Entrar a la sala"/>
    <Btn onClick={()=>setMode("inicio")} bg={theme.amarillo} fg={theme.texto} label="⬅ Back"/>
  </Card>
)}

{joinedRoom === activeRoom && activeRoom && !teamReady && (
  flow.formation === "auto" ? (
    <Card title={`Sala ${activeRoom}`} subtitle="Elige tu equipo y únete" width={720}>
      <div style={{fontSize:13, opacity:.8, marginBottom:10}}>
        Los equipos ya fueron definidos por el profesor. Solo elige tu equipo y agrega tu nombre.
      </div>
  
      <div style={{display:"grid",gridTemplateColumns:isTablet?"1fr":"1fr 1fr",gap:10,marginBottom:12}}>
        {/* Equipo */}
        <div>
          <label style={{fontSize:12,fontWeight:800,color:theme.azul}}>Equipo</label>
          <select
            value={groupName}
            onChange={e=>{
              setGroupName(e.target.value);
              setSelectedMember("");
              setMiNombre("");
              setMiCarrera("");
            }}
            style={{...baseInput, padding:10, marginTop:6}}
          >
            <option value="">Selecciona tu equipo…</option>
            {getTeamsForRoom(analytics, activeRoom).map((t,i)=>(
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>
  
{/* Identificación */}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignSelf:"end"}}>
  {currentMembers.length > 0 ? (
    <>
      <div>
        <label style={{fontSize:12,fontWeight:800,color:theme.azul}}>Soy:</label>
        <select
          value={selectedMember}
          onChange={(e)=>{
            const sel = e.target.value;
            setSelectedMember(sel);
            if (sel && sel !== "__OTRO__") {
              setMiNombre(sel);
              const found = roster.find(r => r.nombre.trim().toLowerCase() === sel.trim().toLowerCase());
              setMiCarrera(found?.carrera || "");
            } else {
              setMiNombre("");
              setMiCarrera("");
            }
          }}
          style={{...baseInput, padding:10, marginTop:6}}
          disabled={!groupName}
        >
          <option value="">Selecciona tu nombre…</option>
          {currentMembers.map((m,idx)=>(
            <option key={idx} value={m.nombre}>{m.nombre}</option>
          ))}
          <option value="__OTRO__">Otro…</option>
        </select>
      </div>

      {/* Campos dinámicos */}
      {selectedMember === "__OTRO__" ? (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignSelf:"end"}}>
          <input
            placeholder="Tu nombre"
            value={miNombre}
            onChange={e=>{
              const v = e.target.value;
              setMiNombre(v);
              const found = roster.find(r => r.nombre.trim().toLowerCase() === v.trim().toLowerCase());
              if (found) setMiCarrera(found.carrera || "");
            }}
            style={baseInput}
          />
          <select
            value={miCarrera}
            onChange={e=>setMiCarrera(e.target.value)}
            style={baseInput}
          >
            <option value="">Carrera…</option>
            <option value="Medicina">Medicina</option>
            <option value="Informática">Informática</option>
            <option value="Derecho">Derecho</option>
            <option value="Psicología">Psicología</option>
          </select>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10,alignSelf:"end"}}>
          <select
            value={miCarrera}
            onChange={e=>setMiCarrera(e.target.value)}
            style={baseInput}
          >
            <option value="">Carrera…</option>
            <option value="Medicina">Medicina</option>
            <option value="Informática">Informática</option>
            <option value="Derecho">Derecho</option>
            <option value="Psicología">Psicología</option>
          </select>
        </div>
      )}
    </>
  ) : (
    <>
      <input
        placeholder="Tu nombre"
        value={miNombre}
        onChange={e=>{
          const v = e.target.value;
          setMiNombre(v);
          const found = roster.find(r => r.nombre.trim().toLowerCase() === v.trim().toLowerCase());
          if (found) setMiCarrera(found.carrera || "");
        }}
        style={baseInput}
        disabled={!groupName}
      />
      <select
        value={miCarrera}
        onChange={e=>setMiCarrera(e.target.value)}
        style={baseInput}
        disabled={!groupName}
      >
        <option value="">Carrera…</option>
        <option value="Medicina">Medicina</option>
        <option value="Informática">Informática</option>
        <option value="Derecho">Derecho</option>
        <option value="Psicología">Psicología</option>
      </select>
    </>
  )}
</div>

      </div>
  
      <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
        <Btn onClick={()=>setMode("inicio")} bg={theme.amarillo} fg={theme.texto} label="⬅ Back" full={false}/>
        <Btn
          label="Unirme a este equipo"
          full={false}
          onClick={()=>{
            if(!groupName){ alert("Elige un equipo."); return; }
  
            if(currentMembers.length > 0){
              const nombre = (miNombre || "").trim();
  
              if(!selectedMember && !nombre){
                alert("Selecciona tu nombre de la lista o elige 'Otro…' y escribe tu nombre.");
                return;
              }
  
              if(selectedMember && selectedMember !== "__OTRO__"){
                // Ya estaba precargado → no escribimos (evita duplicados)
                setTeamReady(true);
                setMiNombre(""); setMiCarrera(""); setSelectedMember("");
                return;
              }
  
              if(alreadyIn){
                alert("Ese nombre ya está registrado en este equipo.");
                return;
              }
              if(teamFull){
                alert(`Este equipo ya está completo (máximo ${MAX_PER_GROUP}).`);
                return;
              }
  
              // “Otro…”: agregamos a integrantes
              update(a=>{
                const next = {...a};
                const idx = next.teams.findIndex(t=>t.roomCode===activeRoom && t.teamName===groupName);
                if(idx>=0){
                  const integ = next.teams[idx].integrantes || [];
                  integ.push({ nombre, carrera: (miCarrera || "—").trim() });
                  next.teams[idx] = {...next.teams[idx], integrantes: integ};
                }
                return next;
              });
  
              setTeamReady(true);
              setMiNombre(""); setMiCarrera(""); setSelectedMember("");
              return;
            }
  
            // Equipo sin integrantes aún
            const nombre = (miNombre || "").trim();
            if(!nombre){ alert("Escribe tu nombre."); return; }
            if(teamFull){
              alert(`Este equipo ya está completo (máximo ${MAX_PER_GROUP}).`);
              return;
            }
  
            update(a=>{
              const next = {...a};
              const idx = next.teams.findIndex(t=>t.roomCode===activeRoom && t.teamName===groupName);
              if(idx>=0){
                const integ = next.teams[idx].integrantes || [];
                if(!integ.some(p=>p.nombre.trim().toLowerCase()===nombre.toLowerCase())){
                  integ.push({ nombre, carrera:(miCarrera||"—").trim() });
                }
                next.teams[idx] = {...next.teams[idx], integrantes: integ};
              }
              return next;
            });
  
            setTeamReady(true);
            setMiNombre(""); setMiCarrera(""); setSelectedMember("");
          }}
        />
      </div>
    </Card>
  ) : (
  
    // ====== MODO MANUAL (dejas tu card actual) ======
    <Card title={`Sala ${activeRoom}`} subtitle="Crea tu grupo y marca listo" width={980}>
<Card title={`Sala ${activeRoom}`} subtitle="Crea tu grupo y marca listo" width={980}>
  <div style={{display:"grid", gridTemplateColumns:isTablet?"1fr":"1fr 1fr", gap:12, textAlign:"left"}}>
    {/* COLUMNA IZQUIERDA: Nombre del equipo */}
    <div style={{...panelBox}}>
      <div style={badgeTitle}>Nombre del equipo</div>

      {/** nombres tomados en esta sala para evitar duplicados */}
      {(() => {
        const taken = new Set(getTeamsForRoom(analytics, activeRoom));
        const nameTaken = groupName.trim() && taken.has(groupName.trim());

        const nextSuggestion =
          TEAM_SUGGESTIONS.find(s => !taken.has(s)) ||
          `Grupo ${taken.size + 1}`;

        return (
          <>
            <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8}}>
              <input
                placeholder="Ej: Aurora, Nexus..."
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                style={{
                  ...baseInput,
                  border: nameTaken ? "2px solid #EF5350" : baseInput.border
                }}
              />
              <Btn
                label="Sugerir"
                full={false}
                variant="outline"
                onClick={() => setGroupName(nextSuggestion)}
              />
            </div>
            {nameTaken && (
              <div style={{color:"#D32F2F", fontSize:12, marginTop:6, fontWeight:700}}>
                Ya existe un equipo con ese nombre en esta sala. Prueba otra opción o usa “Sugerir”.
              </div>
            )}
            {!nameTaken && groupName && (
              <div style={{opacity:.7, fontSize:12, marginTop:6}}>
                Este nombre está disponible ✔
              </div>
            )}
            {!groupName && (
              <div style={{opacity:.7, fontSize:12, marginTop:6}}>
                Si lo dejas vacío, se propondrá “Grupo {getTeamsForRoom(analytics, activeRoom).length + 1}”.
              </div>
            )}
          </>
        );
      })()}
    </div>

    {/* COLUMNA DERECHA: Integrantes (única tablet) */}
    <div style={{...panelBox}}>
      <div style={badgeTitle}>Integrantes del equipo</div>
      <div style={{fontSize:12, opacity:.8, marginBottom:6}}>
        Máximo {MAX_PER_GROUP} por equipo. Usa el autocompletar con la lista del Excel o escribe manualmente.
      </div>

      {/** Estado local del constructor de integrantes */}
      {(() => {
        // Guardamos el estado en un ref usando el estado que ya tienes:
        // reutilizamos "integrantes" como arreglo de todo el equipo en la tablet.
        // Si está vacío, inicializa con 1 fila.
        if (!integrantes.length) {
          setIntegrantes([{ nombre: "", carrera: "Medicina" }]);
        }

        // Helpers
        const usedNames = new Set(
          integrantes.map(i => i.nombre.trim().toLowerCase()).filter(Boolean)
        );
        const canAddMore = integrantes.length < MAX_PER_GROUP;

        // OPCIONES de carreras (extiende si agregas más)
        const carreras = ["Medicina", "Informática"];

        // Lista de nombres del roster que aún no están en este equipo
        const rosterDisponibles = roster
          .filter(r => !usedNames.has(r.nombre.trim().toLowerCase()))
          .sort((a,b) => a.nombre.localeCompare(b.nombre));

        return (
          <>
            {/* Datalist para autocompletar nombres desde Excel */}
            <datalist id="roster-nombres">
              {rosterDisponibles.map((r, i) => (
                <option key={i} value={r.nombre}>{r.carrera || "Medicina"}</option>
              ))}
            </datalist>

            <div style={{display:"grid", gap:8}}>
              {integrantes.map((m, idx) => {
                const duplicate =
                  m.nombre.trim() &&
                  integrantes.some((x, j) => j !== idx && x.nombre.trim().toLowerCase() === m.nombre.trim().toLowerCase());

                return (
                  <div key={idx} style={{display:"grid", gridTemplateColumns:"1fr 160px 36px", gap:8, alignItems:"center"}}>
                    <input
                      list="roster-nombres"
                      placeholder="Nombre y apellido"
                      value={m.nombre}
                      onChange={e => {
                        const v = e.target.value;
                        // Si el nombre existe en el roster, trae su carrera por defecto
                        const found = roster.find(r => r.nombre.toLowerCase() === v.trim().toLowerCase());
                        setIntegrantes(arr => {
                          const next = arr.slice();
                          next[idx] = {
                            nombre: v,
                            carrera: found?.carrera || next[idx].carrera || "Medicina"
                          };
                          return next;
                        });
                      }}
                      style={{
                        ...baseInput,
                        border: duplicate ? "2px solid #EF5350" : baseInput.border
                      }}
                    />
                    <select
                      value={m.carrera}
                      onChange={e => {
                        const v = e.target.value;
                        setIntegrantes(arr => {
                          const next = arr.slice();
                          next[idx] = { ...next[idx], carrera: v };
                          return next;
                        });
                      }}
                      style={baseInput}
                    >
                      {carreras.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                      onClick={() => {
                        setIntegrantes(arr => arr.filter((_, j) => j !== idx));
                      }}
                      title="Quitar"
                      style={{width:36, height:36, borderRadius:10, border:`1px solid ${theme.border}`, cursor:"pointer"}}
                    >✕</button>

                    {duplicate && (
                      <div style={{gridColumn:"1 / -1", color:"#D32F2F", fontSize:12}}>
                        Ya agregaste a esta persona. Revisa nombres duplicados.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8}}>
              <Btn
                label="➕ Agregar integrante"
                full={false}
                onClick={() => {
                  if (!canAddMore) return;
                  setIntegrantes(arr => [...arr, { nombre: "", carrera: "Medicina" }]);
                }}
                disabled={!canAddMore}
              />
              <div style={{fontSize:12, opacity:.7}}>
                Ahora: {integrantes.length}/{MAX_PER_GROUP}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  </div>

  {/* ACCIONES */}
  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12}}>
    <Btn onClick={()=>setMode("inicio")} bg={theme.amarillo} fg={theme.texto} label="⬅ Back" full={false}/>
    <Btn
      label="Marcar listo y crear equipo"
      full={false}
      onClick={() => {
        const sala = activeRoom;
        if (!sala) { alert("No hay sala activa."); return; }

        // Nombre del equipo (propón si vacío)
        const existing = new Set(getTeamsForRoom(analytics, sala));
        let finalName = (groupName || "").trim();
        if (!finalName) {
          let i = existing.size + 1;
          let candidate = `Grupo ${i}`;
          while (existing.has(candidate)) { i++; candidate = `Grupo ${i}`; }
          finalName = candidate;
        }
        if (existing.has(finalName)) {
          alert("Ese nombre ya existe en la sala. Usa 'Sugerir' o cambia el nombre.");
          return;
        }

        // Validaciones integrantes
        const clean = integrantes
          .map(x => ({ nombre: (x.nombre||"").trim(), carrera: (x.carrera||"").trim() || "Medicina" }))
          .filter(x => x.nombre);
        if (clean.length === 0) { alert("Agrega al menos 1 integrante."); return; }
        if (clean.length > MAX_PER_GROUP) { alert(`Máximo ${MAX_PER_GROUP} integrantes por equipo.`); return; }

        // Registrar equipo en métricas
        update(a => ({
          ...a,
          teams: [
            ...a.teams,
            { roomCode: sala, teamName: finalName, integrantes: clean, ts: Date.now() }
          ]
        }));

        // Marcar listo
        const prev = readJSON<string[]>(READY_KEY, []);
        const next = Array.from(new Set([...prev, `${sala}::${finalName}`]));
        writeJSON(READY_KEY, next);
        try { window.dispatchEvent(new StorageEvent("storage", { key: READY_KEY, newValue: JSON.stringify(next) })); } catch {}

        // Ajustar expected si hace falta (mín 3, máx 4)
        publish({
          expectedTeams: Math.max(MIN_GROUPS, Math.min((flow.expectedTeams||0) || 0, MAX_GROUPS)) || MIN_GROUPS
        });

        setGroupName("");
        setTeamReady(true);
        alert(`Equipo "${finalName}" creado y marcado como listo.`);
      }}
    />
  </div>
</Card>

    </Card>
  )
)}

{joinedRoom===activeRoom && activeRoom && teamReady && flow.step==="lobby" && (
  <Card title="Esperando al profesor" subtitle="Aún no inicia la fase 1" width={720}>
    <div style={{textAlign:"center",fontSize:18,padding:20}}>⏳ Esperando a que el profesor comience...</div>
    <div style={{textAlign:"center",opacity:.7,fontSize:14}}>Verifica en la sala del profesor que tu grupo aparece como <b>listo</b>.</div>
  </Card>
)}
{/* ===== FASE 0 — INSTRUCCIONES (ALUMNO) ===== */}
{flow.step === "f0_instr" && (
  <Card
    title="Fase 0 — ¡Nos conocemos rápido!"
    subtitle="Presentación breve si no se conocen"
    width={900}
  >
    <div style={{ textAlign: "left", lineHeight: 1.6 }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        <span style={{ animation: "pulse 1.6s ease-in-out infinite", display: "inline-block" }}>🗣️</span> Indicaciones
      </div>
      <ul>
        <li>En equipos, preséntense rápidamente</li>
        <li>Nombre y apellido, carrera o área</li>
        <li>Compartan un <b>dato entretenido</b> (hobby, talento, app favorita, canción que les motive, etc.)</li>
      </ul>
      <div style={{ opacity: .8, marginTop: 8 }}>
        No es necesario escribir nada — solo conversen 😊
      </div>
      <div style={{ marginTop: 12, fontSize: 13, opacity: .7 }}>
        El/la profe iniciará el tiempo
      </div>
    </div>
  </Card>
)}

{/* ===== FASE 0 — ACTIVIDAD (ALUMNO) ===== */}
{flow.step === "f0_activity" && (
  <Card
    title="Fase 0 — Presentación en equipos"
    subtitle={`Tiempo: ${mmss(flow.remaining)} — 3 minutos recomendados`}
    width={980}
  >
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, opacity: .8 }}>
        Tip: pueden contar <b>{f0Tip}</b>, o cualquier otro dato entretenido
      </div>

      {/* Nota: en alumno NO mostramos controles de timer */}
      <div style={{ fontSize: 12, opacity: .7 }}>
        Cuando termine el tiempo, continuarán automáticamente
      </div>
    </div>
  </Card>
)}

{flow.step==="f1_video"&&<TeamworkMiniAnim />}
{flow.step==="f1_instr"&&<Instructions title="Fase 1 — Trabajo en equipo" bullets={["El profesor controla el tiempo y el avance.","Usa las pestañas para cambiar entre <b>Diferencias</b> y <b>Matriz</b>.","Ambos comparten el mismo temporizador."]}/>}

{flow.step==="f1_activity"&&(
  <Card title="Fase 1 — Actividades" subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`} width={1100}>
  <div style={{position:"sticky",top:12,zIndex:5,background:"transparent",paddingBottom:6,marginBottom:10}}>
    <div style={{display:"flex",gap:8,overflowX:"auto"}}>
      {[{key:"spot",label:"🔎 Diferencias"},{key:"sopa",label:"🔤 Sopa de letras"}].map(t=>{
        const active=f1Tab===(t.key as "spot"|"sopa");
        return(
          <button key={t.key} onClick={()=>setF1Tab(t.key as "spot"|"sopa")} style={{padding:"8px 12px",borderRadius:12,border:`2px solid ${active?theme.rosa:theme.border}`,background:active?"#FFF3F7":"#fff",fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>{t.label}</button>
        );
      })}
    </div>
  </div>

  {f1Tab==="spot" ? (

<SpotWithImage
  imgUrlA={originalImg}
  imgUrlB={modificadaImg}
  diffs={F1_DIFFS}
  running={flow.running}
  theme={theme}
  targetHeight={560}
  foundState={diffFound}          // <-- ahora sí existe
  setFoundState={setDiffFound}    // <-- pasas el setter del padre
  onFoundDiff={() => setCoins(c => c + 1)} // sólo suma en hallazgo NUEVO
/>







  ) : (
<WordSoup
  size={12}
  words={["INNOVACION","USUARIO","EMPATIA","EQUIPO","PROTOTIPO","ITERAR","IDEAR","MERCADO"]}
  foundState={soupFound}
  setFoundState={setSoupFound}
  onFindWord={() => setCoins(c => c + 2)}
  theme={theme}
  seed={soupSeed}
/>




  )}


</Card>

)}
{flow.step==="f1_rank"&&(<Card title="Ranking — Fase 1" subtitle="Resultados en vivo" width={900}><RankingBars data={ranking} onContinue={()=>setStep("f2_video")}/></Card>)}
{flow.step==="f2_video" && <EmpathyAnimacion loop /> }
{flow.step==="f2_instr"&&<Instructions title="Fase 2 — Empatía" bullets={["El profesor anunciará la temática/desafío.","Completa el mapa de empatía. El tiempo lo controla el profesor."]}/>}
{flow.step === "f2_theme" && (() => {
  const myTeamName = (teamId.split("::")[1] || "Equipo");

  const confirmChoice = () => {
    const tId = temaSel as keyof typeof THEMES;
    const valid = tId && THEMES[tId] && desafioIndex >= 0 && desafioIndex < (THEMES[tId].desafios?.length || 0);
    if (!valid) { alert("Elige una temática y un desafío."); return; }

    // guarda la elección del equipo (no cambia de fase)
    saveTeamChoice(activeRoom, myTeamName, String(tId), Number(desafioIndex), true);
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
      hideConfirm={false}  // mostrar botón azul en alumno
    />
  );
})()}




{flow.step === "f2_activity" && (
  <Card
    title={`Etapa 2 — ${THEMES[temaSel]?.label || "—"}: ${
      THEMES[temaSel]?.desafios?.[desafioIndex]?.titulo || "Desafío"
    }`}
    subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`}
    width={1100}
  >

    {/* ✅ Bloque de descripción del desafío para alumnos */}
    <div style={{
      background: theme.surfaceAlt,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 14,
      textAlign: "left"
    }}>
      <div style={{fontWeight: 900, color: theme.azul, marginBottom: 4}}>
        Desafío seleccionado
      </div>

      <div style={{marginBottom: 4}}>
        <b>{THEMES[temaSel]?.label}</b> — {THEMES[temaSel]?.desafios?.[desafioIndex]?.titulo}
      </div>

      <div style={{fontSize: 14, lineHeight: 1.35}}>
        {THEMES[temaSel]?.desafios?.[desafioIndex]?.descripcion}
      </div>
    </div>
    {/* ✅ Fin bloque descripción */}

    <EmpathySection
      isTablet={isTablet}
      isMobile={isMobile}
      bubbleSize={bubbleSize}
      centerBubbleSize={centerBubbleSize}
      bubblePositions={bubblePositions}
      EMPATIA_FIELDS={EMPATIA_FIELDS}
      empatia={empatia}
      setActiveBubble={setActiveBubble}
      activeBubble={activeBubble}
      onEmpatiaChange={onEmpatiaChange}
    />
  </Card>
)}




{flow.step==="f2_rank"&&(<Card title="Ranking — Fase 2" subtitle="Resultados en vivo" width={900}><RankingBars data={ranking} onContinue={()=>setStep("f3_video")}/></Card>)}
{flow.step==="f3_video" && <CreatividadAnimacion loop /> }
{flow.step==="f3_activity"&&(
  <Card title="Etapa 3 — Creatividad (LEGO)" subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`} width={900}>
    <div style={{display:"grid",gridTemplateColumns:isTablet?"1fr":"1fr 1fr",gap:10,alignItems:"center"}}>
      <div>
<div style={{margin:"8px 0 14px"}}>
  <div style={{fontWeight:700, marginBottom:6}}>Sube una foto de tu solución (demo):</div>
  <input
    type="file"
    accept="image/*"
    onChange={async (e)=>{
      const file = e.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        const teamName = (teamId.split("::")[1] || "Equipo");
        saveTeamPhoto(activeRoom, teamName, dataUrl);
        // opcional: sumar monedas por “mini-reto completado”
        // setCoins(c=>c+3);
        alert("¡Foto guardada para el pitch!");
      };
      reader.readAsDataURL(file);
    }}
  />
</div>
      </div>
      <div>
        <p style={{marginTop:0}}>Mini-retos (3 monedas c/u):</p>
        <div style={{display:"grid",gap:8}}>
          {["Prototipo montado","Solución explicada","Foto clara"].map(r=>(
            <Btn key={r} onClick={()=>setCoins(c=>c+3)} bg={"#C8E6C9"} fg={"#1B5E20"} label={`✔ ${r}`}/>
          ))}
        </div>
      </div>
    </div>
  </Card>
)}
{flow.step==="f3_rank"&&(<Card title="Ranking — Fase 3" subtitle="Resultados en vivo" width={900}><RankingBars data={ranking} onContinue={()=>setStep("f4_video")}/></Card>)}
{flow.step==="f4_video"&&(<PitchAnimacion />)}
{flow.step==="f4_prep"&&(
  <Card title="Etapa 4 — Comunicación (preparación)" subtitle={`Tiempo: ${mmss(flow.remaining)}`} width={1100} tight>
    <div style={{display:"grid",gridTemplateColumns:isTablet?"1fr":"380px 1fr",gap:12,textAlign:"left"}}>
      <div style={{...panelBox}}>
        <div style={badgeTitle}>Estructura recomendada</div>
        <ol style={{marginTop:0,paddingLeft:18}}>
          <li><b>Hook</b> (problema en 1 frase)</li>
          <li><b>Usuario</b> y evidencia breve</li>
          <li><b>Solución</b> y cómo funciona</li>
          <li><b>Valor</b> (qué mejora, métricas)</li>
          <li><b>Impacto</b> y próximos pasos</li>
        </ol>
      </div>
      <div style={{...panelBox}}>
        <div style={badgeTitle}>Borrador del pitch</div>
        <textarea placeholder="Escribe tu pitch..." style={{...baseInput,minHeight:260}}/>
      </div>
    </div>
  </Card>
)}
{/* === ALUMNO: ver resultado de la ruleta (dos columnas) === */}
{flow.step==="f4_wheel" && (
  <Card title="Orden de presentación"
        subtitle="El/la profe está sorteando el próximo equipo"
        width={900}>
    <div style={{display:"grid", gap:8, textAlign:"center"}}>
      {flow.wheel?.lastWinner ? (
        <div><b>Siguiente:</b> {flow.wheel.lastWinner}</div>
      ) : (
        <div style={{opacity:.7}}>Esperando sorteo…</div>
      )}
      <div style={{fontSize:13, opacity:.8}}>
        Pendientes: {availableTeams().join(", ") || "—"}
      </div>
    </div>
  </Card>
)}




{/* === ALUMNO: ver el PITCH (equipo actual + foto + orden) === */}
{flow.step==="f4_present" && mode === "alumno" && (
  <Card title="Presentación en curso" subtitle={`Tiempo: ${mmss(flow.remaining)} — Orden visible`} width={980}>
    
    {(() => {
      // =============== CONTEXT VARIABLES ===============
      const currentTeam = flow.presentOrder?.[flow.currentIdx ?? 0] ?? "-";
      const myTeam = groupName || "(sin-nombre)";
      const isSelf = currentTeam === myTeam;

      // Foto LEGO del equipo actual
      const photo = getTeamPhoto(activeRoom, currentTeam) || "";


      const submitEval = () => {
        if (isSelf || sent) return;
      
        // 1) Guardar feedback (solo en memoria/analytics local)
        update(a => ({
          ...a,
          feedbacks: [
            ...a.feedbacks,
            {
              roomCode: activeRoom,
              fromTeam: myTeam,
              targetTeam: currentTeam,
              ratings: scores,
              ts: Date.now(),
            }
          ]
        }));
      
        // 2) SUMAR TOKENS AL EQUIPO EVALUADO (solo una vez, al hacer clic)
        const totalPoints = scores.reduce((sum, n) => sum + n, 0);
        const coinsMap = readJSON<Record<string, number>>(COINS_KEY, {});
        const key = `${activeRoom}::${currentTeam}`;
        coinsMap[key] = (coinsMap[key] || 0) + totalPoints;
        writeJSON(COINS_KEY, coinsMap);
        try {
          window.dispatchEvent(new StorageEvent("storage", { key: COINS_KEY }));
        } catch {}
      
        setSent(true);
      };
      

      // =============== UI RETURN ===============
      return (
        <div style={{display:"grid", gap:12}}>

          {/* ORDEN === */}
          <div style={{...panelBox}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div style={{fontWeight:900, color:theme.azul}}>Orden de presentación</div>
              <Btn
  label={showOrder ? "Ocultar" : "Mostrar"}
  full={false}
  onClick={() => setShowOrder(v => !v)}
/>
            </div>

            {showOrder && flow.presentOrder?.length>0 && (
              <ol style={{margin:0, paddingLeft:18}}>
                {flow.presentOrder.map((t,i)=>(
                  <li
                    key={i}
                    style={{
                      fontWeight: i===flow.currentIdx? 900: 500,
                      color: i===flow.currentIdx? theme.rosa: undefined
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* FOTO === */}
          <div style={{...panelBox}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div style={{fontWeight:900, color:theme.azul}}>Prototipo del equipo</div>
              <Btn label={showPhoto ? "Ocultar foto" : "Ver foto"} full={false} onClick={()=>setShowPhoto(v=>!v)} />
            </div>

            {showPhoto && (
              photo
                ? <img
                    src={photo}
                    alt={`Prototipo ${currentTeam}`}
                    style={{
                      maxWidth:"100%", borderRadius:12,
                      border:`1px solid ${theme.border}`, marginTop:8,
                      objectFit:"contain", background:"#fff"
                    }}
                  />
                : <div style={{opacity:.7, marginTop:8}}>Aún no hay foto subida por este equipo.</div>
            )}
          </div>

          {/* EVALUACIÓN === */}
          <div style={{...panelBox}}>
            <div style={{fontWeight:900, color:theme.azul, marginBottom:6}}>Evalúa esta presentación</div>

            {isSelf ? (
              <div style={{opacity:.7}}>No evalúas a tu propio equipo.</div>
            ) : sent ? (
              <div style={{color:"#2E7D32", fontWeight:700}}>¡Gracias! Tu evaluación fue enviada.</div>
            ) : (
              <>
                <div style={{display:"grid", gap:12}}>
                  {["Claridad","Valor de la solución","Viabilidad","Creatividad","Trabajo en equipo","Impacto"].map((lbl,idx)=>(
                    <div key={idx} style={{display:"grid", gridTemplateColumns:"180px 1fr", alignItems:"center", gap:10}}>
                      <div style={{fontSize:13}}>{lbl}</div>
                      <ScoreSlider
                        value={scores[idx]}
                        onChange={(v)=>setScores(arr => arr.map((x,i)=> i===idx ? v : x))}
                      />
                    </div>
                  ))}
                </div>

                <div style={{display:"flex", justifyContent:"center", marginTop:12}}>
                  <Btn label="Enviar evaluación" full={false} onClick={submitEval}/>
                </div>
              </>
            )}
          </div>

        </div>
      );
    })()}

  </Card>
)}





{flow.step==="f5_video"&&(
  <Card title="Autoevaluación y retroalimentación" subtitle="Cierre visual" width={900}>
  <AnimEva/>
  <div style={{ display:"flex", justifyContent:"center", marginTop:12 }}>
    <Btn onClick={()=>setStep("qr")} label="Ir a QR" full={false}/>
  </div>
</Card>

)}


{flow.step==="qr"&&(
  <Card title="¡Evalúa el juego!" subtitle="Escanea el código QR con tu celular" width={700}>
    <div style={{width:260,height:260,margin:"12px auto",background:"#fff",border:`3px dashed ${theme.border}`,borderRadius:16,display:"grid",placeItems:"center",color:"#90A4AE",fontWeight:800}}>QR aquí</div>
  </Card>
)}
</AutoCenter></div>)}

return null;
}

/* ===================== REUSABLES ===================== */
function GridView({grid,size,onClickCell,readOnly}:{grid:boolean[][];size:number;onClickCell:(r:number,c:number)=>void;readOnly?:boolean;}){
  const isTablet=useMediaQuery("(max-width: 1180px)"); const isMobile=useMediaQuery("(max-width: 640px)"); const cell=isMobile?22:isTablet?28:34;
  return(<div style={{display:"grid",gridTemplateColumns:`repeat(${size}, ${cell}px)`,gap:6,justifyContent:"center"}}>
    {grid.map((row,r)=>row.map((on,c)=>(
      <button key={`${r}-${c}`} onClick={()=>!readOnly&&onClickCell(r,c)} style={{width:cell,height:cell,borderRadius:8,border:`1px solid ${theme.border}`,background:on?theme.rosa:"#FFFFFF",boxShadow:on?"inset 0 0 0 3px rgba(233,30,99,.15)":"none",cursor:readOnly?"default":"pointer"}}/>
    )))}
  </div>);
}

// ====== F1: Spot the Difference con imagen real ======


type DiffPoint = { x:number; y:number; r:number; found?:boolean };

function SpotWithImage({
  imgUrlA, imgUrlB,
  diffs,
  onFoundDiff,
  running,
  theme,
  targetHeight = 560,
  foundState,                    // boolean[]
  setFoundState,                 // (next: boolean[]) => void
}: {
  imgUrlA: string;
  imgUrlB: string;
  diffs: DiffPoint[];
  onFoundDiff: () => void;
  running: boolean;
  theme: any;
  targetHeight?: number;
  foundState: boolean[];
  setFoundState: React.Dispatch<React.SetStateAction<boolean[]>>; // ✅

}){
  const aRef = React.useRef<HTMLDivElement|null>(null);

  const handleClick = (e:React.MouseEvent)=>{
    if(!running) return;
    const el = aRef.current; if(!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX-rect.left)/rect.width;
    const y = (e.clientY-rect.top)/rect.height;

    const idx = diffs.findIndex((d,i)=>!foundState[i] && Math.hypot(d.x-x, d.y-y) <= d.r);
    if(idx>=0){
      // marcar solo si es NUEVO hallazgo
// ✅ usa prev tipado y devuelve siempre boolean[]
      setFoundState((prev: boolean[]) => {
         const next = prev.slice();
         if (idx >= 0) next[idx] = true;
         return next;
});

    }
  };

  const total = diffs.length;
  const count = foundState.filter(Boolean).length;

  const panelStyle: React.CSSProperties = {
    display:"grid", gridTemplateColumns:"1fr 1fr", gap:16
  };
  const imgBox: React.CSSProperties = {
    position:"relative", width:"100%", height: targetHeight,
    borderRadius:16, overflow:"hidden", border:`1px solid ${theme.border}`, background:"#fff",
    display:"flex", alignItems:"center", justifyContent:"center"
  };
  const imgStyle: React.CSSProperties = {
    position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain",  background:"#fff"
  };
  const ring = (d:DiffPoint):React.CSSProperties => ({
    position:"absolute",
    left:`${d.x*100}%`, top:`${d.y*100}%`, transform:"translate(-50%,-50%)",
    width:`${d.r*200}%`, height:`${d.r*200}%`,
    borderRadius:"50%", border:`4px solid ${theme.rosa}`,
    boxShadow:"0 0 0 6px rgba(233,30,99,.18)"
  });

  return (
    <>
      <div style={{fontSize:13,marginBottom:8,opacity:.9}}>
        Toca en la <b>imagen</b> donde veas una diferencia. Encontradas: {count}/{total}
      </div>

      <div style={panelStyle}>
        {/* Izquierda (clickable) */}
        <div ref={aRef} onClick={handleClick} style={imgBox}>
          <img src={imgUrlA} alt="Original" style={imgStyle}/>
          {diffs.map((d,i)=> foundState[i] && <div key={i} style={ring(d)}/>)}
        </div>

        {/* Derecha (referencia) */}
        <div style={imgBox}>
          <img src={imgUrlB} alt="Modificada" style={imgStyle}/>
        </div>
      </div>
    </>
  );
}



// ================== WORD SOUP (compacto y sin espacio extra) ==================

// -- Tipos
type WS_Props = {
  size: number;
  words: string[];
  foundState: Record<string, boolean>;
  setFoundState: (f: Record<string, boolean>) => void;
  onFindWord: () => void;
  theme: any;
  seed: number;
};
type Cell = { r:number; c:number };

// -- PRNG determinista
function mulberry32(seed:number){
  let t = seed >>> 0;
  return function(){
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// -- Shuffle con RNG
function shuffleInPlace<T>(arr:T[], rnd:()=>number){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(rnd()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
}

// -- Generador de sopa (grid + paths)
function makeWordSoup(rows:number, cols:number, words:string[], rnd:()=>number){
  const DIRS:[number,number][]= [
    [0,1],[1,0],[0,-1],[-1,0],
    [1,1],[1,-1],[-1,1],[-1,-1]
  ];
  const grid = Array.from({length:rows},()=>Array.from({length:cols},()=>"-"));
  const paths: Record<string, Cell[]> = {};

  const place = (w:string)=>{
    for(let tries=0; tries<700; tries++){
      const [dr,dc] = DIRS[Math.floor(rnd()*DIRS.length)];
      const r0 = Math.floor(rnd()*rows);
      const c0 = Math.floor(rnd()*cols);
      const r1 = r0 + dr*(w.length-1);
      const c1 = c0 + dc*(w.length-1);
      if(r1<0||r1>=rows||c1<0||c1>=cols) continue;

      let ok=true;
      for(let k=0;k<w.length;k++){
        const rr=r0+dr*k, cc=c0+dc*k;
        const cell=grid[rr][cc];
        if(cell!=="-" && cell!==w[k]){ ok=false; break; }
      }
      if(!ok) continue;

      const path:Cell[] = [];
      for(let k=0;k<w.length;k++){
        const rr=r0+dr*k, cc=c0+dc*k;
        grid[rr][cc]=w[k];
        path.push({r:rr,c:cc});
      }
      paths[w] = path;
      return true;
    }
    return false;
  };

  const shuffled = words.slice();
  shuffleInPlace(shuffled, rnd);
  shuffled.forEach(w=>place(w));

  const ABC="ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++)
    if(grid[r][c]==="-") grid[r][c]=ABC[Math.floor(rnd()*ABC.length)];

  return {grid, paths};
}

// ================== Componente ==================
function WordSoup({
  size = 12,
  words,
  onFindWord,
  theme,
  foundState,
  setFoundState,
  seed,
}: WS_Props){

  // Constantes visuales
  const CELL = 34; // tamaño celda
  const GAP  = 6;  // separación

  // Normalizar palabras + RNG
  const upWords = React.useMemo(
    ()=> words.map(w=>w.replace(/\s+/g,"").toUpperCase()),
    [words]
  );
  const rng = React.useMemo(()=>mulberry32(seed), [seed]);

  // Generar sopa (una sola vez por cambios relevantes)
  const memoGen = React.useMemo(()=> makeWordSoup(size, size, upWords, rng), [size, upWords, rng]);
  const [grid] = React.useState<string[][]>(memoGen.grid);
  const pathsRef = React.useRef<Record<string, Cell[]>>(memoGen.paths);

  // Selección y estado de hallazgos
  const [sel, setSel] = React.useState<Cell[]>([]);
  const [found, setFound] = [foundState, setFoundState];


  
  

  React.useEffect(() => {
    if(Object.keys(found).length === 0){
      setFound(Object.fromEntries(upWords.map(w => [w,false])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (Object.keys(found).length === 0) {
      setFound(Object.fromEntries(upWords.map(w => [w, false])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  
  
  const isCellOfFoundWord = (r:number,c:number)=>{
    for(const w of upWords){
      if(found[w]){
        const path = pathsRef.current[w] || [];
        if(path.some(p=>p.r===r && p.c===c)) return true;
      }
    }
    return false;
  };

  const maxLen = React.useMemo(
    () => Math.max(...words.map(w => w.replace(/\s+/g,"").length)),
    [words]
  );

  const matchesAnyPrefix = (txt: string, pend: string[]) => {
    const rev = txt.split("").reverse().join("");
    return pend.some(w => w.startsWith(txt) || w.startsWith(rev));
  };

  const clickCell = (r: number, c: number) => {
    const pending = Object.keys(found).filter(w => !found[w]);

    if (sel.length === 0) { setSel([{ r, c }]); return; }

    if (sel.length === 1) {
      const [p0] = sel;
      const dr = Math.sign(r - p0.r);
      const dc = Math.sign(c - p0.c);
      if (dr === 0 && dc === 0) { setSel([{ r, c }]); return; }

      const next = [p0, { r, c }];
      const letters = next.map(p => grid[p.r][p.c]).join("");
      if (!matchesAnyPrefix(letters, pending)) setSel([{ r, c }]);
      else setSel(next);
      return;
    }

    const p0 = sel[0];
    const p1 = sel[1];
    const dr = Math.sign(p1.r - p0.r);
    const dc = Math.sign(p1.c - p0.c);
    const expR = sel[sel.length - 1].r + dr;
    const expC = sel[sel.length - 1].c + dc;
    if (r !== expR || c !== expC) { setSel([{ r, c }]); return; }

    let next = [...sel, { r, c }];
    if (next.length > maxLen) next = next.slice(-maxLen);

    const letters = next.map(p => grid[p.r][p.c]).join("");
    const rev = letters.split("").reverse().join("");
    const hit = pending.find(w => w === letters || w === rev);
    if (hit) {
      setFound({ ...found, [hit]: true });
      setSel([]);
      try { onFindWord(); } catch {}
      return;
    }
    if (!matchesAnyPrefix(letters, pending)) { setSel([{ r, c }]); return; }
    setSel(next);
  };

  // ===== UI (ajuste clave: auto 280px elimina el espacio “muerto”) =====
  const panelBox: React.CSSProperties = {
    background:"#fff",
    border:`1px solid ${theme.border}`,
    borderRadius:16,
    padding:16
  };
  const badgeTitle: React.CSSProperties = {
    fontSize:13, textTransform:"uppercase", letterSpacing:.6, opacity:.7, marginBottom:8
  };

  return (
    <div
      style={{
        display:"grid",
        gridTemplateColumns:"auto 280px", // <<--- ¡importante! se ajusta al contenido
        gap:16,
        justifyContent:"center",
        alignItems:"start"
      }}
    >
      {/* COLUMNA IZQUIERDA: solo ocupa el ancho exacto del grid */}
      <div style={panelBox}>
        <div
          style={{
            display:"grid",
            gridTemplateColumns:`repeat(${grid[0]?.length || size}, ${CELL}px)`,
            gap:GAP,
            justifyContent:"center"
          }}
        >
          {grid.map((row,r)=>
            row.map((ch,c)=>{
              const active = sel.some(p=>p.r===r && p.c===c);
              const foundLetter = isCellOfFoundWord(r,c);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={()=>clickCell(r,c)}
                  style={{
                    width:CELL, height:CELL, borderRadius:8,
                    border:`1px solid ${theme.border}`,
                    background: foundLetter ? "#FFF59D" : (active ? "#E1F5FE" : "#fff"),
                    fontWeight:900, fontSize:16, lineHeight:`${CELL}px`,
                    padding:0, margin:0, boxSizing:"border-box", cursor:"pointer"
                  }}
                >
                  {ch}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: lista de palabras (280px) */}
      <div style={panelBox}>
        <div style={badgeTitle}>Palabras</div>
        {upWords.map(w=>(
          <div key={w} style={{ display:"flex", justifyContent:"space-between" }}>
            <b>{w}</b> {found[w] ? "✅" : "—"}
          </div>
        ))}
      </div>
    </div>
  );
}
// ================== /WORD SOUP ==================



function EmpathySection(props:any){
  const {
    isTablet,isMobile,
    bubbleSize,centerBubbleSize,bubblePositions,
    EMPATIA_FIELDS,empatia,
    setActiveBubble,activeBubble,
    onEmpatiaChange
  } = props;

  return (
    <div style={{display:"grid",gridTemplateColumns:isTablet?"1fr":"420px 1fr",gap:16,textAlign:"left"}}>
<div style={{ position:"relative", height: isMobile ? 300 : 340, ...panelBox, overflow:"hidden" }}>
        <div style={{
          position:"absolute",left:"50%",top:"55%",
          transform:"translate(-50%,-50%)",
          width:centerBubbleSize,height:centerBubbleSize,
          borderRadius:"50%",background:"#FFF3F7",
          border:`3px solid ${theme.rosa}`,
          display:"grid",placeItems:"center",
          fontWeight:900,color:theme.rosa,textAlign:"center",padding:12
        }}>
          Persona
        </div>

        {EMPATIA_FIELDS.map((f:any)=>{
          const filled = !!empatia[f.key]?.trim();
          const active = activeBubble===f.key;
          return (
            <button
              key={f.key}
              onClick={()=>setActiveBubble(f.key)}
              style={{
                position:"absolute",
                ...(bubblePositions[f.key]||{}),
                width:bubbleSize,height:bubbleSize,borderRadius:"50%",
                border:`3px solid ${active?theme.azul:theme.rosa}`,
                background:filled?"#E1F5FE":"#FFFDE7",
                color:theme.texto,fontWeight:800,cursor:"pointer",
                boxShadow:active?"0 0 0 6px rgba(25,118,210,.15)":"0 6px 14px rgba(0,0,0,.08)"
              }}
              title={f.label}
            >
              {filled?"✔ ":""}{f.label}
            </button>
          )
        })}
      </div>

      <div style={panelBox}>
        <div style={{fontWeight:900,color:theme.azul,marginBottom:6}}>
          {EMPATIA_FIELDS.find((x:any)=>x.key===activeBubble)?.label}
        </div>
        <textarea
          value={empatia[activeBubble]}
          onChange={e=>onEmpatiaChange(activeBubble,e.target.value)}
          placeholder={`Escribe sobre ${EMPATIA_FIELDS.find((x:any)=>x.key===activeBubble)?.label}...`}
          style={{...baseInput,minHeight:160}}
        />
        <div style={{fontSize:12,opacity:.75,marginTop:8}}>
          Consejos: ejemplos concretos, verbos en acción, datos o citas del usuario.
        </div>
        <div style={{fontSize:13,opacity:.85,marginTop:12}}>
          Completadas: {EMPATIA_FIELDS.filter((f:any)=>empatia[f.key].trim()).length}/{EMPATIA_FIELDS.length}
        </div>
      </div>
    </div>
  );
}

const ConfettiBurst:React.FC=()=>{
  const [items,setItems]=useState<{id:number;left:number;delay:number;emoji:string}[]>([]);
  useEffect(()=>{
    const EMOJIS=["🎉","🎊","✨","🏆","🎈","💥","⭐"];
    const arr=Array.from({length:28}).map((_,i)=>({
      id:i,left:Math.random()*100,delay:Math.random()*.8,
      emoji:EMOJIS[Math.floor(Math.random()*EMOJIS.length)]
    }));
    setItems(arr);
    const t=setTimeout(()=>setItems([]),2500);
    return()=>clearTimeout(t);
  },[]);
  return(
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {items.map(p=>(
        <div
          key={p.id}
          style={{
            position:"absolute",top:-20,left:`${p.left}%`,
            fontSize:22,animation:`fall ${1.8+Math.random()*.9}s ease-in ${p.delay}s forwards`
          }}>
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

function RankingBars({data,onContinue}:{data:{equipo:string;total:number}[];onContinue:()=>void;}){
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);
  const max=Math.max(1,...data.map(d=>d.total||0));

  return (
    <>
      <div style={{...panelBox}}>
        {data.length===0 && <div style={{opacity:.7}}>Aún no hay datos de equipos…</div>}
        {data.map((r,i)=>{
          const pct=Math.round((r.total/max)*100);
          const isFirst=i===0;
          const isLast=i===data.length-1;
          const secondOrThird=!isFirst&&!isLast;
          const barBg=isFirst
            ? `linear-gradient(90deg, ${theme.amarillo}, #FFF59D, ${theme.amarillo})`
            : secondOrThird
            ? `linear-gradient(90deg, ${theme.azul}22, ${theme.azul}66)`
            : "#CFD8DC";
          return (
            <div key={r.equipo} style={{display:"grid",gridTemplateColumns:"56px 1fr 90px",gap:8,alignItems:"center",marginBottom:12}}>
              <div style={{fontWeight:900,fontSize:18,color:theme.blanco,textShadow:"0 1px 2px rgba(0,0,0,.3)"}}>
                {i+1}
                {isFirst && <div style={{fontSize:22,lineHeight:"16px",animation:"crownFloat 1.6s ease-in-out infinite"}}>👑</div>}
                {isLast && <div style={{fontSize:18,lineHeight:"16px"}}>🔗</div>}
              </div>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:10,top:-18,fontWeight:800,color:isLast?"#607D8B":theme.texto}}>
                  {r.equipo}{i===1&&data.length>=2?" 🥈":i===2&&data.length>=3?" 🥉":""}
                </div>
                <div style={{height:28,background:"#F1F5F9",borderRadius:14,overflow:"hidden",boxShadow:"inset 0 0 0 1px #e2e8f0"}}>
                  <div
                    style={{
                      height:"100%",width:mounted?`${pct}%`:0,transition:"width .9s ease",
                      background:barBg,backgroundSize:isFirst?"200% 100%":undefined,
                      animation:isFirst?"shimmer 2.4s linear infinite":undefined,
                      borderRadius:14,position:"relative",filter:isLast?"grayscale(.3)":"none"
                    }}
                  />
                </div>
              </div>
              <div style={{textAlign:"right",fontWeight:900,fontSize:18}}>{r.total}</div>
            </div>
          )
        })}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:12}}>
        <Btn onClick={onContinue} label="Continuar" full={false}/>
      </div>
    </>
  );
}

function WheelOrder({teams,onConfirm}:{teams:string[];onConfirm:(order:string[])=>void;}){
  const [order,setOrder]=useState<string[]>([]);
  const remaining=teams.filter(t=>!order.includes(t));

  return(
    <div style={{...panelBox}}>
      <div style={{...badgeTitle}}>Ruleta / Orden aleatorio</div>
      <div style={{display:"grid",gap:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <div style={{fontWeight:800,marginBottom:6}}>Equipos disponibles</div>
            <div style={{border:`1px dashed ${theme.border}`,borderRadius:12,padding:10,background:"#fff",minHeight:80}}>
              {remaining.length===0
                ? <div style={{opacity:.6}}>Sin equipos pendientes</div>
                : remaining.map((t,i)=>(<div key={i}>• {t}</div>))}
            </div>
          </div>
          <div>
            <div style={{fontWeight:800,marginBottom:6}}>Orden elegido</div>
            <div style={{border:`1px dashed ${theme.border}`,borderRadius:12,padding:10,background:"#fff",minHeight:80}}>
              {order.length===0
                ? <div style={{opacity:.6}}>Aún no hay orden…</div>
                : order.map((t,i)=>(<div key={i}><b>{i+1}.</b> {t}</div>))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn full={false} label="🎰 Girar (agrega 1 equipo)" onClick={()=>{ if(remaining.length===0) return; const next=remaining[Math.floor(Math.random()*remaining.length)]; setOrder(o=>[...o,next]); }}/>
          <Btn full={false} variant="outline" label="🎲 Girar 3 veces" onClick={()=>{ let pool=remaining.slice(); const picks:string[]=[]; for(let i=0;i<3 && pool.length;i++){ const idx=Math.floor(Math.random()*pool.length); picks.push(pool[idx]); pool.splice(idx,1);} setOrder(o=>[...o,...picks]); }}/>
          <Btn full={false} variant="outline" label="🔀 Generar todo al azar" onClick={()=> setOrder(o=>[...o, ...shuffle(remaining)])}/>
          <Btn full={false} bg="#F44336" label="↺ Limpiar" onClick={()=>setOrder([])}/>
          <div style={{marginLeft:"auto"}}>
            <Btn full={false} label="✅ Confirmar orden y comenzar" onClick={()=>{ const finalOrder=order.length?order:[...shuffle(teams)]; onConfirm(finalOrder); }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function PresentStageTeacher({
  currentTeam,onNext,pitchSec,startTimer,pauseTimer,resetTimer,remaining
}:{currentTeam:string;onNext:()=>void;pitchSec:number;startTimer:()=>void;pauseTimer:()=>void;resetTimer:(s:number)=>void;remaining:number;}){
  return(
    <div style={{display:"grid",gap:12}}>
      <Card title="Pitch en curso" subtitle={`Presenta: ${currentTeam}`} width={900}>
        <div style={{width:"100%",aspectRatio:"16/7",borderRadius:16,border:`2px solid ${theme.border}`,display:"grid",placeItems:"center",background:"linear-gradient(135deg,#fff 0%, #F1F5F9 60%)"}}>
          <div style={{fontSize:28,fontWeight:900,color:theme.azul}}>🎤 Escenario — {currentTeam}</div>
        </div>
        <div style={{marginTop:12}}>
          <div style={{...panelBox,textAlign:"center"}}>
            <div style={{fontWeight:900,color:theme.azul,marginBottom:6}}>Tiempo de pitch</div>
            <div style={{fontSize:64,fontWeight:900,letterSpacing:1,marginBottom:12}}>{mmss(remaining)}</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <Btn onClick={()=>startTimer()} label="▶ Iniciar" full={false}/>
              <Btn onClick={()=>pauseTimer()} label="⏸ Pausa" full={false}/>
              <Btn onClick={()=>resetTimer(pitchSec)} label="⟲ Reset" full={false} variant="outline"/>
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginTop:12}}>
          <Btn onClick={onNext} label="Siguiente grupo" full={false}/>
        </div>
      </Card>
    </div>
  );
}

function EvaluationPanelStudent({
  roomCode,teams,analyticsUpdate,fromTeam
}:{roomCode:string;teams:string[];analyticsUpdate:(fn:(a:Analytics)=>Analytics)=>void;fromTeam:string;}){
  const [active,setActive]=useState(teams[0]||"");
  const [ratingsByTeam,setRatingsByTeam]=useState<Record<string,number[]>>(
    ()=>Object.fromEntries(teams.map(t=>[t,[0,0,0,0,0,0]]))
  );
  const [commentByTeam,setCommentByTeam]=useState<Record<string,string>>(
    ()=>Object.fromEntries(teams.map(t=>[t,""]))
  );

  useEffect(()=>{
    if(teams.length && !active) setActive(teams[0]);
  },[teams,active]);

const rate = (team: string, idx: number, value: number) => {
function setNotaEquipo(currentTeam: string, idx: number, value: number | string) {
  setRatingsByTeam((prev) => {
    const current = prev[currentTeam] ?? [0, 0, 0, 0, 0];
    const next = [...current];
    const num = typeof value === "string" ? Number(value) : value;
    const old = Number(next[idx] ?? 0);

    next[idx] = Number.isFinite(num) ? num : 0;
    return { ...prev, [currentTeam]: next };
  });
}

};

  const submitFeedback=(team:string)=>{
    const ratings=ratingsByTeam[team]||[0,0,0,0,0,0];
    const comment=(commentByTeam[team]||"").trim();
    analyticsUpdate(a=>({...a,feedbacks:[...a.feedbacks,{ roomCode, fromTeam, targetTeam:team, ratings, comment:comment||undefined, ts:Date.now() }]}));
    alert("¡Gracias! Evaluación registrada para " + team);
  };

  return(
    <Card title="Evaluación de equipos" subtitle="Elige equipo y califica 0–5 (cada punto = 1 moneda para ese equipo)" width={1100}>
      <div style={{position:"sticky",top:12,zIndex:5,background:"transparent",paddingBottom:6,marginBottom:10}}>
        <div style={{display:"flex",gap:8,overflowX:"auto"}}>
          {teams.map(t=>{
            const activeTab=active===t;
            return(
              <button key={t} onClick={()=>setActive(t)} style={{padding:"8px 12px",borderRadius:12,border:`2px solid ${activeTab?theme.rosa:theme.border}`,background:activeTab?"#FFF3F7":"#fff",fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>{t}</button>
            );
          })}
        </div>
      </div>

      {active && (
        <div style={{...panelBox}}>
          <div style={{fontWeight:900,color:theme.azul,marginBottom:8}}>{active}</div>
          <div style={{display:"grid",gap:10}}>
            {Array.from({ length: 6 }).map((_, i) => {
              const val = ratingsByTeam[active]?.[i] || 0;
              const bg = ratingTrackBg(val);
              const col = ratingColor(val);
              return (
                <div key={i} style={{display:"grid",gridTemplateColumns:"160px 1fr 70px",gap:10,alignItems:"center"}}>
                  <div style={{ fontWeight: 800 }}>Criterio {i + 1}</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{height:10,borderRadius:999,background:bg,boxShadow:"inset 0 0 0 1px #e2e8f0"}}/>
                    <input type="range" min={0} max={5} step={1} value={val} onChange={(e) => rate(active, i, Number(e.target.value))} style={{width:"100%",background:"transparent",accentColor: col as any}}/>
                  </div>
                  <div style={{ textAlign: "right", fontWeight: 900, color: col }}>
                    {val}/5 <span style={{ fontSize: 20, marginLeft: 4 }}>{ratingEmoji(val)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{marginTop:12}}>
            <div style={{fontWeight:800,marginBottom:6}}>Comentario (opcional)</div>
            <textarea value={commentByTeam[active]||""} onChange={e=>setCommentByTeam(s=>({...s,[active]:e.target.value}))} style={{...baseInput,minHeight:80}} placeholder="Escribe feedback para este equipo (opcional)…"/>
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
            <Btn label="Enviar evaluación de este equipo" full={false} onClick={()=>submitFeedback(active)}/>
          </div>
        </div>
      )}
    </Card>
  );
}

function ratingEmoji(v: number) {
  const E = ["😞", "😕", "😐", "🙂", "😄", "🤩"];
  return E[Math.max(0, Math.min(5, v))];
}
function ratingColor(v: number) {
  const t = Math.max(0, Math.min(5, v)) / 5;
  const hue = 210 + (330 - 210) * t;
  const sat = 30 + 55 * t;
  const light = 82 - 24 * t;
  return `hsl(${hue}deg, ${sat}%, ${light}%)`;
}
function ratingTrackBg(v: number) {
  const pct = (Math.max(0, Math.min(5, v)) / 5) * 100;
  const col = ratingColor(v);
  return `linear-gradient(90deg, ${col} ${pct}%, #E5E7EB ${pct}%)`;
}

/* ========= F2 — Selección de Tema & Desafío ========= */

function ThemeChallengeSection({
  THEMES,
  temaSel,
  setTemaSel,
  desafioIndex,
  setDesafioIndex,
  desafioActual,
  isTablet,
  onContinue,
  // --- NUEVO:
  hideConfirm,
  confirmLabel,
  confirmed
}: {
  THEMES:any;
  temaSel:string|null;
  setTemaSel:(x:any)=>void;
  desafioIndex:number;
  setDesafioIndex:(n:number)=>void;
  desafioActual:any;
  isTablet:boolean;
  onContinue:()=>void;
  // --- NUEVO:
  hideConfirm?: boolean;
  confirmLabel?: string;
  confirmed?: boolean;
}) {


  const tema = temaSel ? THEMES[temaSel] : null;

  return (
    <Card title="Elige temática y desafío" subtitle="Seleccionen qué reto trabajarán" width={980}>
      
      {/* TEMAS */}
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:900,marginBottom:6}}>Temáticas</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {Object.keys(THEMES).map(k=>{
            const active = temaSel === k;
            return (
              <button
                key={k}
                onClick={()=>{ setTemaSel(k); setDesafioIndex(0); }}
                style={{
                  padding:"10px 14px",
                  borderRadius:12,
                  border:`2px solid ${active?"#1976D2":"#ccc"}`,
                  background:active?"#E3F2FD":"#fff",
                  fontWeight:800,
                  cursor:"pointer"
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
  <div style={{marginBottom:20}}>
    <div style={{fontWeight:900,marginBottom:6}}>Desafíos</div>
    <div style={{display:"grid",gap:10}}>
      {tema.desafios.map((d:any,i:number)=>{
        const active = desafioIndex === i;
        const approved = !!confirmed && active; // seleccionado y confirmado
        return (
          <button
            key={i}
            onClick={()=>setDesafioIndex(i)}
            style={{
              padding:14,
              borderRadius:12,
              border:`2px solid ${approved ? "#2E7D32" : (active ? "#D81B60" : "#ddd")}`,
              background: approved ? "#E8F5E9" : (active ? "#FFF3F7" : "#fff"),
              textAlign:"left",
              cursor:"pointer",
              fontWeight:800,
              display:"grid",
              gridTemplateColumns:"auto 1fr",
              alignItems:"start",
              gap:8
            }}
          >
            {/* ✔ verde cuando confirmado */}
            <div style={{width:22, textAlign:"center"}}>
              {approved ? <span style={{color:"#2E7D32"}}>✔</span> : null}
            </div>
            <div>
              {`Desafío ${i+1}`}
              <div style={{fontSize:13,fontWeight:400,opacity:.8,marginTop:4}}>
                {d.descripcion}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
)}

{/* BOTÓN CONFIRMAR (interno) */}
{!hideConfirm && (
  <div style={{display:"flex",justifyContent:"center",marginTop:18}}>
    <Btn label={confirmLabel || "Confirmar y abrir mapa de empatía"} onClick={onContinue} full={false}/>
  </div>
)}


    </Card>
  );
}


/* --ADMIN DASHBOARD-- */
function AdminDashboard({
  analytics,THEMES,setTHEMES,flow,onBack,ranking,clearMetrics,activeRoom
}:{analytics: Analytics;THEMES: any;setTHEMES: (t:any)=>void;flow: any;onBack: ()=>void;ranking: {equipo:string;total:number}[];clearMetrics: ()=>void;activeRoom: string;}) {

  const [tab,setTab]=useState<"resumen"|"temas"|"equipos"|"reflexiones"|"uso"|"ranking">("resumen");

  const exportJSON=(name:string,data:any)=>{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`${name}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const totals={
    equipos:analytics.teams.length,
    estudiantes:analytics.teams.reduce((acc,t)=>acc+(t.integrantes?.length||0),0),
    reflexiones:analytics.reflections.length,
    rooms:analytics.roomsCreated
  };

  return(
    <Card title="Panel de Administrador" subtitle="Configura el juego y revisa métricas" width={1100}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        {[
          ["resumen","📊 Resumen"],
          ["temas","🎯 Temáticas & Desafíos"],
          ["equipos","👥 Equipos"],
          ["reflexiones","📝 Reflexiones"],
          ["uso","📈 Uso de desafíos"],
          ["ranking","🏆 Ranking/Monedas"]
        ].map(([k,label])=>(
          <button key={k} onClick={()=>setTab(k as any)} style={{padding:"8px 12px",borderRadius:12,border:`2px solid ${tab===k?theme.azul:theme.border}`,background:tab===k?"#E3F2FD":"#fff",fontWeight:800,cursor:"pointer"}}>{label}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Btn label="Exportar métricas" full={false} variant="outline" onClick={()=>exportJSON("udd_metrics",analytics)}/>
          <Btn label="Exportar configuración" full={false} variant="outline" onClick={()=>exportJSON("udd_themes",THEMES)}/>
          <Btn label="Resetear métricas" bg="#F44336" full={false} onClick={()=>{ if(confirm("¿Seguro que quieres borrar todas las métricas (equipos/uso/reflexiones)?")){ clearMetrics(); alert("Métricas reseteadas."); } }}/>
          <Btn label="⬅ Volver" full={false} bg={theme.amarillo} fg={theme.texto} onClick={onBack}/>
        </div>
      </div>

      {tab==="resumen"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:12}}>
          {[
            {k:"Salas creadas",v:totals.rooms},
            {k:"Equipos registrados",v:totals.equipos},
            {k:"Estudiantes (aprox.)",v:totals.estudiantes},
            {k:"Reflexiones recibidas",v:totals.reflexiones}
          ].map(card=>(
            <div key={card.k} style={panelBox}>
              <div style={{fontSize:13,color:theme.muted}}>{card.k}</div>
              <div style={{fontSize:32,fontWeight:900}}>{card.v}</div>
            </div>
          ))}
          <div style={{gridColumn:"1 / -1",...panelBox}}>
            <div style={badgeTitle}>Sala actual</div>
            <div style={{fontFamily:"Roboto Mono, monospace",fontWeight:900,fontSize:18}}>
              Código: {activeRoom||"—"} · Paso: {flow.step} · Equipos esperados: {flow.expectedTeams||"—"}
            </div>
          </div>
        </div>
      )}

      {tab==="temas"&&<ThemeEditor THEMES={THEMES} setTHEMES={setTHEMES}/>}

      {tab==="equipos"&&(
        <div style={{...panelBox,textAlign:"left"}}>
          <div style={badgeTitle}>Equipos registrados</div>
          {analytics.teams.length===0
            ? (<div style={{opacity:.7}}>Sin equipos aún.</div>)
            : (
              <div style={{display:"grid",gap:10}}>
                {analytics.teams.slice().reverse().map((t:any,i:number)=>(
                  <div key={i} style={{border:`1px solid ${theme.border}`,borderRadius:12,padding:10}}>
                    <div style={{fontWeight:800}}>{t.teamName} <span style={{color:theme.muted}}>· sala {t.roomCode}</span></div>
                    <div style={{fontSize:12,color:theme.muted}}>{new Date(t.ts).toLocaleString()}</div>
                    <div style={{marginTop:6,display:"grid",gap:4}}>
                      {t.integrantes?.map((p:any,j:number)=>(
                        <div key={j}>• <b>{p.nombre}</b> — {p.carrera}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {tab==="reflexiones"&&(
        <div style={{...panelBox,textAlign:"left"}}>
          <div style={badgeTitle}>Reflexiones finales</div>
          {analytics.reflections.length===0
            ? (<div style={{opacity:.7}}>Aún no hay reflexiones.</div>)
            : (
              <div style={{display:"grid",gap:10}}>
                {analytics.reflections.slice().reverse().map((r:any,i:number)=>(
                  <div key={i} style={{border:`1px solid ${theme.border}`,borderRadius:12,padding:10}}>
                    <div style={{fontWeight:800}}>{r.teamName} <span style={{color:theme.muted}}>· sala {r.roomCode}</span></div>
                    <div style={{fontSize:12,color:theme.muted}}>{new Date(r.ts).toLocaleString()}</div>
                    <div style={{marginTop:6,whiteSpace:"pre-wrap"}}>{r.text}</div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {tab==="uso"&&(
        <div style={{...panelBox,textAlign:"left"}}>
          <div style={badgeTitle}>Uso de desafíos</div>
          <div style={{fontSize:12,color:theme.muted,marginBottom:8}}>(Se incrementa cuando el profesor abre el mapa de empatía con un desafío seleccionado)</div>
          {Object.keys(analytics.challengeUsage).length===0
            ? (<div style={{opacity:.7}}>Aún no hay datos de uso.</div>)
            : (
              <div style={{display:"grid",gap:8}}>
                {Object.entries(analytics.challengeUsage).sort((a,b)=>b[1]-a[1]).map(([key,count])=>{
                  const [themeId,idxStr]=key.split("#"); const idx=Number(idxStr);
                  const t=THEMES[themeId as keyof typeof THEMES];
                  const label=t?.label&&t.desafios[idx]?`${t.label} — ${t.desafios[idx].titulo}`:key;
                  return(
                    <div key={key} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
                      <div>{label}</div>
                      <div style={{fontWeight:900}}>{count}</div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      )}

      {tab==="ranking"&&(
        <div style={{...panelBox}}>
          <div style={{marginBottom:8,textAlign:"left",...badgeTitle}}>Monedas (sala actual {activeRoom||"—"})</div>
          <RankingBars data={ranking} onContinue={()=>{}}/>
        </div>
      )}
    </Card>
  );
}

function ThemeEditor({THEMES,setTHEMES}:{THEMES:any;setTHEMES:(t:any)=>void;}){
  type ThemeId = keyof typeof THEMES;
  const [current,setCurrent]=useState<ThemeId>(Object.keys(THEMES)[0] as ThemeId);
  const [local,setLocal]=useState<any>(THEMES);
  useEffect(()=>setLocal(THEMES),[THEMES]);

  const t=local[current];
  const save=()=>{ setTHEMES(local); alert("Configuración guardada."); };
  const addChallenge=()=>{ const next={...local}; next[current].desafios.push({titulo:"Nuevo desafío",descripcion:"Descripción..."}); setLocal(next); };
  const removeChallenge=(i:number)=>{ const next={...local}; next[current].desafios.splice(i,1); setLocal(next); };
  const updateChallenge=(i:number,patch:Partial<{titulo:string;descripcion:string}>)=>{
    const next={...local}; next[current].desafios[i]={...next[current].desafios[i],...patch}; setLocal(next);
  };
  const updatePersona=(patch:Partial<{nombre:string;edad:number;bio:string}>)=>{
    const next={...local}; next[current].persona={...next[current].persona,...patch}; setLocal(next);
  };

  return(
    <div style={{display:"grid",gap:12}}>
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        {(Object.keys(local) as ThemeId[]).map(k=>(
          <button key={String(k)} onClick={()=>setCurrent(k)} style={{padding:"8px 12px",borderRadius:12,border:`2px solid ${current===k?theme.azul:theme.border}`,background:current===k?"#E3F2FD":"#fff",fontWeight:800,cursor:"pointer"}}>{local[k].label}</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,alignItems:"start"}}>
        <div style={{...panelBox,textAlign:"left"}}>
          <div style={badgeTitle}>Persona</div>
          <label>Nombre</label>
          <input style={{...baseInput,marginBottom:8}} value={t.persona.nombre} onChange={e=>updatePersona({nombre:e.target.value})}/>
          <label>Edad</label>
          <input type="number" style={{...baseInput,marginBottom:8}} value={t.persona.edad} onChange={e=>updatePersona({edad:Number(e.target.value)||0})}/>
          <label>Bio</label>
          <textarea style={{...baseInput,minHeight:100}} value={t.persona.bio} onChange={e=>updatePersona({bio:e.target.value})}/>
        </div>

        <div style={{...panelBox,textAlign:"left"}}>
          <div style={badgeTitle}>Desafíos</div>
          <div style={{display:"grid",gap:10}}>
            {t.desafios.map((d:any,i:number)=>(
              <div key={i} style={{border:`1px solid ${theme.border}`,borderRadius:12,padding:10}}>
                <div style={{display:"grid",gap:6}}>
                  <label>Título</label>
                  <input style={baseInput} value={d.titulo} onChange={e=>updateChallenge(i,{titulo:e.target.value})}/>
                  <label>Descripción</label>
                  <textarea style={{...baseInput,minHeight:80}} value={d.descripcion} onChange={e=>updateChallenge(i,{descripcion:e.target.value})}/>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                  <Btn label="Eliminar" full={false} bg="#F44336" onClick={()=>{ if(confirm("¿Eliminar desafío?")) removeChallenge(i); }}/>
                </div>
              </div>
            ))}
            <Btn label="Agregar desafío" full={false} onClick={addChallenge}/>
          </div>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <Btn label="Guardar cambios" onClick={save} full={false}/>
      </div>
    </div>
  );
}

/* ===================== UTILS (final) ===================== */
function useMediaQuery(q:string){
  const [m,setM]=useState(false);
  useEffect(()=>{
    const mq=window.matchMedia(q);
    const h=()=>setM(mq.matches);
    h();
    mq.addEventListener("change",h);
    return()=>mq.removeEventListener("change",h)
  },[q]);
  return m;
}

function shuffle<T>(arr:T[]):T[]{
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function generateCode(len:number=5): string {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i=0;i<len;i++){
    out += CHARS[Math.floor(Math.random()*CHARS.length)];
  }
  return out;
}

/* sumar monedas a un equipo arbitrario (no necesariamente el propio) */
function awardCoinsToTeam(roomCode:string, teamName:string, delta:number){
  if(!roomCode||!teamName||!delta) return;
  const map=readJSON<Record<string,number>>(COINS_KEY,{});
  const key=`${roomCode}::${teamName}`;
  map[key]=(map[key]||0)+delta;
  writeJSON(COINS_KEY,map);
  try{window.dispatchEvent(new StorageEvent("storage",{key:COINS_KEY,newValue:JSON.stringify(map)}))}catch{}
}
