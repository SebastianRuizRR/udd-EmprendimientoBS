import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";

/* =====================  THEME  ===================== */
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
};

/* =====================  GLOBAL CSS  ===================== */
const GlobalFormCSS = () => (
  <style>{`
    * { -webkit-tap-highlight-color: transparent; }
    input, textarea, select { box-sizing: border-box; max-width: 100%; }
    body { margin: 0; }
    button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
      outline: 3px solid #93C5FD;
      outline-offset: 2px;
    }
    @frames crownFloat { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
    @frames shimmer { 0% { background-position: 0% 0; } 100% { background-position: 120% 0; } }
    @frames fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0.9; } }
    @frames floatY { 0% { transform: translateY(0px); } 50% { transform: translateY(-18px); } 100% { transform: translateY(0px); } }
    @frames drift { 0% { transform: translateX(0) rotate(0deg); } 50% { transform: translateX(20px) rotate(8deg); } 100% { transform: translateX(0) rotate(0deg); } }
    @frames pulseSoft { 0% { transform: scale(1); opacity: .65; } 50% { transform: scale(1.06); opacity: .85; } 100% { transform: scale(1); opacity: .65; }
  `}</style>
);

/* =====================  BASE  ===================== */
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

const Card: React.FC<{
  title: string;
  subtitle?: string;
  width?: number;
  tight?: boolean;
  children?: React.ReactNode;
}> = ({ title, subtitle, width = 520, children, tight }) => (
  <div
    style={{
      width: `clamp(320px, 92vw, ${width}px)`,
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
}> = memo(
  ({
    onClick,
    bg = theme.azul,
    fg = theme.blanco,
    label,
    full = true,
    disabled,
    variant = "solid",
  }) => (
    <button
      onClick={() => onClick?.()}
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

/* ==============  BACKGROUND  ============== */
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

/* =====================  SHARED FLOW (localStorage)  ===================== */
type FlowStep =
  | "lobby"
  | "f1_video"
  | "f1_instr"
  | "f1_activity"
  | "f1_rank"
  | "f2_video"
  | "f2_instr"
  | "f2_theme"
  | "f2_activity"
  | "f2_rank"
  | "f3_video"
  | "f3_activity"
  | "f3_rank"
  | "f4_video"
  | "f4_prep"
  | "f4_pitch"
  | "f5_video"
  | "f5_eval"
  | "f5_rank"
  | "f6_video"
  | "f6_close"
  | "qr";

type FlowState = {
  step: FlowStep;
  running: boolean;
  remaining: number; // secs
  roomCode: string;
  expectedTeams: number;
};

const FLOW_ = "udd_flow_state_v1";
const READY_{(Object.keys(THEMES) as (keyof typeof THEMES)[]).map((key) => {
  const active = temaSel === key;
  return (
    <Btn
      key={String(key)}                   // ← fuerza string
      onClick={() => setTemaSel(key as ThemeId)}}
      bg={active ? theme.azul : "#BBDEFB"}
      fg={active ? theme.blanco : theme.texto}
      label={THEMES[key].label}
      full={false}
    />
  );
})}
 = "udd_ready_teams_v1";
const COINS_KEY = "udd_coins_v1";

/* ==== NUEVO: persistencia de Temáticas y Analíticas ==== */
const THEMES_KEY = "udd_themes_v1";
const ANALYTICS_KEY = "udd_analytics_v1";

type ThemeId = "salud" | "sustentabilidad" | "educacion";
type ThemePersona = { nombre: string; edad: number; bio: string };
type ThemeChallenge = { titulo: string; descripcion: string };
type ThemeConfig = Record<
  ThemeId,
  { label: string; desafios: ThemeChallenge[]; persona: ThemePersona }
>;

type Analytics = {
  roomsCreated: number;
  challengeUsage: Record<string, number>; // key: `${themeId}#${idx}`
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

/* ---- Señal de cambios de storage (con fallback polling) ---- */
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

function useSharedFlow(isTeacher: boolean, initial: FlowState) {
  const [flow, setFlow] = useState<FlowState>(() =>
    readJSON(FLOW_KEY, initial)
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FLOW_KEY && e.newValue) {
        try {
          setFlow(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const publish = (next: Partial<FlowState>) => {
    const newFlow = { ...flow, ...next };
    setFlow(newFlow);
    writeJSON(FLOW_KEY, newFlow);
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: FLOW_KEY,
          newValue: JSON.stringify(newFlow),
        })
      );
    } catch {}
  };

  // Timer controlado por el profesor
  useEffect(() => {
    if (!isTeacher) return;
    if (!flow.running) return;
    const id = window.setInterval(() => {
      setFlow((f) => {
        const left = Math.max(0, f.remaining - 1);
        const nf = { ...f, remaining: left, running: left > 0 && f.running };
        writeJSON(FLOW_KEY, nf);
        try {
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: FLOW_KEY,
              newValue: JSON.stringify(nf),
            })
          );
        } catch {}
        return nf;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isTeacher, flow.running]);

  const setStep = (step: FlowStep, remaining?: number) => {
    publish({ step, remaining: remaining ?? flow.remaining, running: false });
  };
  const startTimer = (seconds?: number) => {
    publish({ remaining: seconds ?? flow.remaining, running: true });
  };
  const pauseTimer = () => publish({ running: false });
  const resetTimer = (seconds: number) =>
    publish({ remaining: seconds, running: false });

  return { flow, setStep, startTimer, pauseTimer, resetTimer, publish };
}

/* ====== helpers analíticas ====== */
function useAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics>(() =>
    readJSON<Analytics>(ANALYTICS_KEY, {
      roomsCreated: 0,
      challengeUsage: {},
      teams: [],
      reflections: [],
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

/* =====================  APP  ===================== */
export default function App() {
  const [mode, setMode] = useState<"inicio" | "prof" | "alumno" | "admin">(
    "inicio"
  );

  // sala / grupos
  const [equiposQty, setEquiposQty] = useState(4);
  const [roomCode, setRoomCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [miNombre, setMiNombre] = useState("");
  const [miCarrera, setMiCarrera] = useState("");
  const [integrantes, setIntegrantes] = useState<
    { nombre: string; carrera: string }[]
  >([]);
  const [teamReady, setTeamReady] = useState(false);

  // monedas locales del equipo
  const [coins, setCoins] = useState(0);

  // Responsive
  const isTablet = useMediaQuery("(max-width: 1180px)");
  const isMobile = useMediaQuery("(max-width: 640px)");

  const initialFlow: FlowState = {
    step: "lobby",
    running: false,
    remaining: 6 * 60,
    roomCode: "",
    expectedTeams: 0,
  };
  const isTeacher = mode === "prof";
  const { flow, setStep, startTimer, pauseTimer, resetTimer, publish } =
    useSharedFlow(isTeacher, initialFlow);

  /* ===== storage signal (top-level) ===== */
  const storageTick = useStorageSignal(
    mode === "prof"
      ? [READY_KEY, COINS_KEY, FLOW_KEY, ANALYTICS_KEY, THEMES_KEY]
      : mode === "alumno"
      ? [COINS_KEY, FLOW_KEY, ANALYTICS_KEY, THEMES_KEY]
      : [FLOW_KEY, ANALYTICS_KEY, THEMES_KEY],
    800
  );

  /* ===== Helpers ready/coins ===== */
  const teamId =
    flow.roomCode && (groupName || "(sin-nombre)")
      ? `${flow.roomCode}::${(groupName || "").trim() || "sin-nombre"}`
      : "";

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
    // registrar equipo + integrantes en analíticas
    if (teamId) {
      const { update } = analyticsApi;
      const teamName = teamId.split("::")[1] || "Equipo";
      update((a) => ({
        ...a,
        teams: [
          ...a.teams,
          {
            roomCode: flow.roomCode,
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

  const readyCount = () => {
    const set = new Set<string>(readJSON<string[]>(READY_KEY, []));
    return Array.from(set).filter((id) => id.startsWith(`${flow.roomCode}::`))
      .length;
  };
  const clearReadyForRoom = () => {
    const arr = readJSON<string[]>(READY_KEY, []);
    const filtered = arr.filter((id) => !id.startsWith(`${flow.roomCode}::`));
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

  // Report coins (alumno)
  useEffect(() => {
    if (!teamId || mode !== "alumno") return;
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
  }, [coins, teamId, mode]);

  const ranking = useMemo(() => {
    const map = readJSON<Record<string, number>>(COINS_KEY, {});
    const pairs = Object.entries(map)
      .filter(([id]) => id.startsWith(`${flow.roomCode}::`))
      .map(([id, v]) => ({
        equipo: id.split("::")[1] || "Equipo",
        total: v || 0,
      }));
    return pairs.sort((a, b) => b.total - a.total);
  }, [flow.roomCode, flow.step, storageTick]);

  // ====== Games state ======
  // F1 – Spot
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
        const dx = d.x - cx;
        const dy = d.y - cy;
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

  // F1 – Matrix
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

  // F2 – Empatía
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
  const onEmpatiaChange = (k: EmpKey, v: string) => {
    setEmpatia((prev) => {
      const wasEmpty = !prev[k]?.trim();
      const next = { ...prev, [k]: v };
      if (wasEmpty && next[k].trim()) setCoins((c) => c + 1);
      return next;
    });
  };

  /* ===== Temas/Desafíos persistentes ===== */
  const defaultTHEMES: ThemeConfig = {
    salud: {
      label: "Salud",
      desafios: [
        {
          titulo: "Desafío 1",
          descripcion: "Mejorar acceso a atención básica en barrios alejados.",
        },
        {
          titulo: "Desafío 2",
          descripcion: "Reducir tiempos de espera en consultas no críticas.",
        },
        {
          titulo: "Desafío 3",
          descripcion: "Apoyo a cuidadores de adultos mayores.",
        },
      ],
      persona: {
        nombre: "María",
        edad: 62,
        bio: "Cuida a su pareja con movilidad reducida; vive a 40 min del centro de salud.",
      },
    },
    sustentabilidad: {
      label: "Sustentabilidad",
      desafios: [
        {
          titulo: "Desafío 1",
          descripcion: "Disminuir residuos en campus y comunidad.",
        },
        {
          titulo: "Desafío 2",
          descripcion: "Optimizar uso de agua y energía en hogares.",
        },
        {
          titulo: "Desafío 3",
          descripcion: "Movilidad sostenible para trayectos cortos.",
        },
      ],
      persona: {
        nombre: "Diego",
        edad: 24,
        bio: "Estudiante que vive en residencia; quiere reducir su huella y ahorrar.",
      },
    },
    educacion: {
      label: "Educación",
      desafios: [
        {
          titulo: "Desafío 1",
          descripcion:
            "Motivar hábitos de estudio en estudiantes con poco tiempo.",
        },
        {
          titulo: "Desafío 2",
          descripcion: "Facilitar aprendizaje práctico en primer año.",
        },
        {
          titulo: "Desafío 3",
          descripcion: "Mejorar integración de estudiantes internacionales.",
        },
      ],
      persona: {
        nombre: "Aisha",
        edad: 19,
        bio: "Estudiante internacional de primer año; barrera idiomática y poco tiempo.",
      },
    },
  };
  const [THEMES, setTHEMES] = useState<ThemeConfig>(() =>
    readJSON<ThemeConfig>(THEMES_KEY, defaultTHEMES)
  );
  const saveTHEMES = (next: ThemeConfig) => {
    setTHEMES(next);
    writeJSON(THEMES_KEY, next);
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

  // Bubble sizes
  const isTabletMedia = useMediaQuery("(max-width: 1180px)");
  const isMobileMedia = useMediaQuery("(max-width: 640px)");
  const bubbleSize = isMobileMedia ? 84 : isTabletMedia ? 96 : 108;
  const centerBubbleSize = isMobileMedia ? 115 : isTabletMedia ? 128 : 138;
  const bubblePositions: Record<EmpKey, React.CSSProperties> = useMemo(
    () => ({
      perfil: { left: "8%", top: "12%" },
      limitaciones: { left: "26%", top: "8%" },
      motivaciones: { right: "26%", top: "8%" },
      entorno: { right: "8%", top: "12%" },
      emociones: { left: "10%", bottom: "10%" },
      necesidades: { right: "10%", bottom: "10%" },
    }),
    [isTabletMedia, isMobileMedia]
  );

  // ===== NUEVO: pestaña activa F1 en alumno =====
  const [f1Tab, setF1Tab] = useState<"spot" | "matrix">("spot");

  /* ====== Analytics hook instance ====== */
  const analyticsApi = useAnalytics();
  const { analytics, update } = analyticsApi;

  /* ========== UI HELPERS ========== */
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

  const Instructions: React.FC<{ title: string; bullets: string[] }> = ({
    title,
    bullets,
  }) => (
    <Card title="Instrucciones" subtitle={title} width={900} tight>
      <div style={{ textAlign: "left" }}>
        <ol>
          {bullets.map((b, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
          ))}
        </ol>
      </div>
    </Card>
  );

  const BigTimer: React.FC<{ label?: string; defaultSec: number }> = ({
    label,
    defaultSec,
  }) => (
    <div style={{ ...panelBox, textAlign: "center" }}>
      {label && (
        <div style={{ fontWeight: 900, color: theme.azul, marginBottom: 6 }}>
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        {mmss(flow.remaining)}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Btn onClick={() => startTimer()} label="▶ Iniciar" full={false} />
        <Btn onClick={() => pauseTimer()} label="⏸ Pausa" full={false} />
        <Btn
          onClick={() => resetTimer(defaultSec)}
          label="⟲ Reset"
          full={false}
          variant="outline"
        />
      </div>
    </div>
  );

  function mmss(sec: number) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  const readyNow = useMemo(
    () => readyCount(),
    [storageTick, flow.roomCode, flow.expectedTeams]
  );

  /* ========== SCREENS ========== */

  // Landing
  if (mode === "inicio")
    return (
      <div style={appStyles}>
        <Background />
        <GlobalFormCSS />
        <AutoCenter>
          <Card
            title="Juego de Emprendimiento UDD"
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
              <Btn onClick={() => setMode("prof")} label="Profesor" />
              <Btn
                onClick={() => setMode("alumno")}
                bg={theme.rosa}
                label="Alumno"
              />
              <Btn
                onClick={() => setMode("admin")}
                bg={theme.amarillo}
                fg={theme.texto}
                label="Administrador"
              />
            </div>
          </Card>
        </AutoCenter>
      </div>
    );

  /* =====================  ADMIN  ===================== */
  if (mode === "admin") {
    return (
      <div style={appStyles}>
        <Background />
        <GlobalFormCSS />
        <AutoCenter>
          <AdminDashboard
            analytics={analytics}
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
              }))
            }
          />
        </AutoCenter>
      </div>
    );
  }

  // ====== PROFESOR ======
  if (mode === "prof") {
    return (
      <div style={appStyles}>
        <Background />
        <GlobalFormCSS />
        <AutoCenter>
          {/* Crear sala */}
          {!flow.roomCode ? (
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
                    style={{ fontSize: 12, fontWeight: 800, color: theme.azul }}
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
                <div style={{ alignSelf: "end" }}>
                  <Btn
                    onClick={() => {
                      const code = generateCode();
                      clearReadyForRoom();
                      writeJSON(COINS_KEY, {});
                      try {
                        window.dispatchEvent(
                          new StorageEvent("storage", {
                            key: COINS_KEY,
                            newValue: JSON.stringify({}),
                          })
                        );
                      } catch {}
                      publish({
                        roomCode: code,
                        expectedTeams: equiposQty,
                        step: "lobby",
                        remaining: 6 * 60,
                        running: false,
                      });
                      // Analítica: room creada
                      update((a) => ({
                        ...a,
                        roomsCreated: a.roomsCreated + 1,
                      }));
                    }}
                    bg={theme.rosa}
                    label="Generar Código"
                  />
                </div>
              </div>
            </Card>
          ) : null}

          {/* Lobby */}
          {flow.roomCode && flow.step === "lobby" && (
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
                {flow.roomCode}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
                Equipos listos: <b>{readyNow}</b> / <b>{flow.expectedTeams}</b>
              </div>
              <Btn
                onClick={() => {
                  if (readyNow < flow.expectedTeams) return;
                  setStep("f1_video");
                }}
                label="Continuar con todos"
                disabled={readyNow < flow.expectedTeams}
              />
            </Card>
          )}

          {/* F1 */}
          {flow.step === "f1_video" && (
            <>
              <VideoSpace title="Trabajo en equipo" />
              <Btn
                onClick={() => setStep("f1_instr")}
                label="Continuar con todos"
                full={false}
              />
            </>
          )}
          {flow.step === "f1_instr" && (
            <>
              <Instructions
                title="Fase 1 — Trabajo en equipo"
                bullets={[
                  "Juego 1: <b>Spot the Difference</b>.",
                  "Juego 2: <b>Matriz de luces</b>.",
                  "El tiempo es compartido; ustedes deciden cómo distribuirlo.",
                ]}
              />
              <Btn
                onClick={() => {
                  resetTimer(6 * 60);
                  setStep("f1_activity", 6 * 60);
                }}
                label="Abrir juegos y timer"
                full={false}
              />
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
                defaultSec={6 * 60}
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
              />
            </Card>
          )}

          {/* F2 */}
          {flow.step === "f2_video" && (
            <>
              <VideoSpace title="Empatía con el usuario" />
              <Btn
                onClick={() => setStep("f2_instr")}
                label="Continuar con todos"
                full={false}
              />
            </>
          )}
          {flow.step === "f2_instr" && (
            <>
              <Instructions
                title="Fase 2 — Empatía"
                bullets={[
                  "Elige temática y desafío.",
                  "Completen el <b>mapa de empatía</b> (8:00).",
                ]}
              />
              <Btn
                onClick={() => setStep("f2_theme")}
                label="Ir a Temática y Desafío"
                full={false}
              />
            </>
          )}
          {flow.step === "f2_theme" && (
            <>
              <Card
                title="Temáticas y desafío"
                subtitle="Cuando estén listos, inicia el mapa"
                width={980}
              >
                <ThemeChallengeSection
                  THEMES={THEMES}
                  temaSel={temaSel}
                  setTemaSel={setTemaSel}
                  desafioIndex={desafioIndex}
                  setDesafioIndex={setDesafioIndex}
                  desafioActual={desafioActual}
                  isTablet={isTablet}
                  onContinue={() => {}}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 12,
                  }}
                >
                  <Btn
                    onClick={() => {
                      // Analítica: contar uso de desafío elegido al abrir la actividad
                      update((a) => {
                        const key = `${temaSel}#${desafioIndex}`;
                        const usage = { ...a.challengeUsage };
                        usage[key] = (usage[key] || 0) + 1;
                        return { ...a, challengeUsage: usage };
                      });
                      resetTimer(8 * 60);
                      setStep("f2_activity", 8 * 60);
                    }}
                    label="Abrir mapa y timer"
                    full={false}
                  />
                </div>
              </Card>
            </>
          )}
          {flow.step === "f2_activity" && (
            <Card
              title="Fase 2 — En curso"
              subtitle="Mapa de empatía (timer)"
              width={720}
            >
              <BigTimer label="Tiempo F2 (Empatía)" defaultSec={8 * 60} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
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
              />
            </Card>
          )}

          {/* F3 */}
          {flow.step === "f3_video" && (
            <>
              <VideoSpace title="Creatividad" />
              <Btn
                onClick={() => {
                  resetTimer(12 * 60);
                  setStep("f3_activity", 12 * 60);
                }}
                label="Abrir actividad y timer"
                full={false}
              />
            </>
          )}
          {flow.step === "f3_activity" && (
            <Card
              title="Fase 3 — En curso"
              subtitle="Creatividad (timer)"
              width={720}
            >
              <BigTimer label="Tiempo F3 (Creatividad)" defaultSec={12 * 60} />
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
              />
            </Card>
          )}

          {/* F4 */}
          {flow.step === "f4_video" && (
            <>
              <VideoSpace title="Comunicación" />
              <Btn
                onClick={() => {
                  resetTimer(8 * 60);
                  setStep("f4_prep", 8 * 60);
                }}
                label="Preparación (abrir timer)"
                full={false}
              />
            </>
          )}
          {flow.step === "f4_prep" && (
            <Card
              title="Fase 4 — Preparación del Pitch"
              subtitle="Timer visible"
              width={720}
            >
              <BigTimer label="Tiempo F4 (Preparación)" defaultSec={8 * 60} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <Btn
                  onClick={() => setStep("f4_pitch")}
                  label="Ir a zona de Pitch"
                  full={false}
                />
              </div>
            </Card>
          )}
          {flow.step === "f4_pitch" && (
            <Card
              title="Zona de Pitch"
              subtitle="Presentaciones de 90s (demo)"
              width={900}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  background: "#F0F4F8",
                  borderRadius: 12,
                  border: `2px dashed ${theme.border}`,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  color: "#90A4AE",
                  marginBottom: 12,
                  pointerEvents: "none",
                }}
              >
                Área de presentación (sin temporizador)
              </div>
              <Btn
                onClick={() => setStep("f5_video")}
                label="Continuar con todos"
                full={false}
              />
            </Card>
          )}

          {/* F5 */}
          {flow.step === "f5_video" && (
            <>
              <VideoSpace title="Evaluación y retroalimentación" />
              <Btn
                onClick={() => setStep("f5_eval")}
                label="Abrir evaluación"
                full={false}
              />
            </>
          )}
          {flow.step === "f5_eval" && (
            <Card
              title="Fase 5 — Evaluación"
              subtitle="Cada equipo califica (demo)"
              width={900}
            >
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
                (En tu versión final conectaremos formularios/criterios; aquí
                solo continuamos)
              </div>
              <Btn
                onClick={() => setStep("f5_rank")}
                label="Ver ranking"
                full={false}
              />
            </Card>
          )}
          {flow.step === "f5_rank" && (
            <Card
              title="Ranking — Fase 5"
              subtitle="Resultados en vivo"
              width={900}
            >
              <RankingBars
                data={ranking}
                onContinue={() => setStep("f6_video")}
              />
            </Card>
          )}

          {/* F6 */}
          {flow.step === "f6_video" && (
            <>
              <VideoSpace title="Cierre y reflexión" />
              <Btn
                onClick={() => setStep("f6_close")}
                label="Ir a cierre"
                full={false}
              />
            </>
          )}
          {flow.step === "f6_close" && (
            <Card
              title="Cierre y Apoyo"
              subtitle="Reflexión final (demo)"
              width={900}
              tight
            >
              <div style={{ textAlign: "left" }}>
                <p style={{ marginTop: 0 }}>
                  🎉 ¡Felicitaciones! Escribe tu reflexión final.
                </p>
                <textarea
                  placeholder="Escribe tu reflexión..."
                  style={{ ...baseInput, minHeight: 120 }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <Btn
                  onClick={() => setStep("qr")}
                  bg={theme.azul}
                  label="Ir a QR"
                  full={false}
                />
              </div>
            </Card>
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
                  border: `3px dashed ${theme.border}`,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  color: "#90A4AE",
                  fontWeight: 800,
                }}
              >
                QR aquí
              </div>
              <Btn
                onClick={() => {
                  publish({
                    roomCode: "",
                    expectedTeams: 0,
                    step: "lobby",
                    remaining: 6 * 60,
                    running: false,
                  });
                  clearReadyForRoom();
                  writeJSON(COINS_KEY, {});
                  try {
                    window.dispatchEvent(
                      new StorageEvent("storage", {
                        key: COINS_KEY,
                        newValue: JSON.stringify({}),
                      })
                    );
                  } catch {}
                }}
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

  // ====== ALUMNO ======
  if (mode === "alumno") {
    return (
      <div style={appStyles}>
        <Background />
        <GlobalFormCSS />
        <AutoCenter>
          {/* Unirse a sala */}
          {!flow.roomCode && (
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
              <Btn
                onClick={() => {
                  if (!roomCode.trim()) return;
                  const f = readJSON<FlowState>(FLOW_KEY, initialFlow);
                  if (!f.roomCode) {
                    alert("Aún no hay sala activa. Espera al profesor.");
                    return;
                  }
                  if (f.roomCode !== roomCode.trim()) {
                    alert("Código incorrecto. Verifica con el profesor.");
                    return;
                  }
                }}
                label="Entrar a la sala"
              />
              <Btn
                onClick={() => setMode("inicio")}
                bg={theme.amarillo}
                fg={theme.texto}
                label="⬅ Back"
              />
            </Card>
          )}

          {/* Crear grupo */}
          {flow.roomCode && !teamReady && (
            <Card
              title={`Sala ${flow.roomCode}`}
              subtitle="Crea tu grupo y marca listo"
              width={980}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr auto",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <input
                  placeholder="Nombre de grupo"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={baseInput}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <input
                    placeholder="Tu nombre"
                    value={miNombre}
                    onChange={(e) => setMiNombre(e.target.value)}
                    style={baseInput}
                  />
                  <input
                    placeholder="Tu carrera"
                    value={miCarrera}
                    onChange={(e) => setMiCarrera(e.target.value)}
                    style={baseInput}
                  />
                </div>
                <Btn
                  onClick={() => {
                    if (!groupName.trim()) return;
                    setIntegrantes((arr) => [
                      ...arr,
                      {
                        nombre: miNombre || "Integrante",
                        carrera: miCarrera || "—",
                      },
                    ]);
                    setMiNombre("");
                    setMiCarrera("");
                  }}
                  bg={theme.rosa}
                  label="Agregar integrante"
                  full={false}
                />
              </div>

              <div
                style={{
                  textAlign: "left",
                  maxHeight: 220,
                  overflowY: "auto",
                  padding: 8,
                  border: `1px dashed ${theme.border}`,
                  borderRadius: 12,
                  background: "#fff",
                }}
              >
                {integrantes.length === 0 && (
                  <div style={{ opacity: 0.7 }}>Aún no hay integrantes…</div>
                )}
                {integrantes.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 1fr",
                      gap: 10,
                      padding: "8px 0",
                      alignItems: "center",
                      borderBottom:
                        i < integrantes.length - 1 ? "1px solid #eee" : "none",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: theme.azul }}>
                      {i + 1}.
                    </div>
                    <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                    <div style={{ opacity: 0.8 }}>{p.carrera}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 12,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  onClick={() => setMode("inicio")}
                  bg={theme.amarillo}
                  fg={theme.texto}
                  label="⬅ Back"
                  full={false}
                />
                <Btn
                  onClick={markReady}
                  label="Marcar listo y esperar al profesor"
                  full={false}
                  disabled={!groupName.trim()}
                />
              </div>
            </Card>
          )}

          {/* Espera */}
          {flow.roomCode && teamReady && flow.step === "lobby" && (
            <Card
              title="Esperando al profesor…"
              subtitle="Tu grupo está listo"
              width={720}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  background: "#F0F4F8",
                  borderRadius: 12,
                  border: `2px dashed ${theme.border}`,
                  display: "grid",
                  placeItems: "center",
                  color: "#90A4AE",
                  fontWeight: 700,
                  marginBottom: 12,
                  pointerEvents: "none",
                }}
              >
                Pantalla de espera
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Esperando a que el profesor continúe…
              </div>
            </Card>
          )}

          {/* ======== FASE 1 (Alumno con pestañas) ======== */}
          {flow.step === "f1_video" && <VideoSpace title="Trabajo en equipo" />}
          {flow.step === "f1_instr" && (
            <Instructions
              title="Fase 1 — Trabajo en equipo"
              bullets={[
                "El profesor controla el tiempo y el avance.",
                "Usa las pestañas para cambiar entre <b>Diferencias</b> y <b>Matriz</b>.",
                "Ambos comparten el mismo temporizador.",
              ]}
            />
          )}
          {flow.step === "f1_activity" && (
            <Card
              title="Fase 1 — Actividades"
              subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`}
              width={1100}
            >
              {/* Tabs */}
              <div
                style={{
                  position: "sticky",
                  top: 12,
                  zIndex: 5,
                  background: "transparent",
                  paddingBottom: 6,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                  {[
                    { key: "spot", label: "🔎 Diferencias" },
                    { key: "matrix", label: "🔲 Matriz" },
                  ].map((t) => {
                    const active = f1Tab === (t.key as "spot" | "matrix");
                    return (
                      <button
                        key={t.key}
                        onClick={() => setF1Tab(t.key as "spot" | "matrix")}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 12,
                          border: `2px solid ${
                            active ? theme.rosa : theme.border
                          }`,
                          background: active ? "#FFF3F7" : "#fff",
                          fontWeight: 800,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contenido por tab */}
              {f1Tab === "spot" ? (
                <>
                  <div style={{ fontSize: 13, marginBottom: 8, opacity: 0.9 }}>
                    Toca en la <b>imagen izquierda</b> donde veas una
                    diferencia. Puedes usar hasta 2 pistas (−1 moneda).
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    {/* izquierda: clickeable */}
                    <div
                      ref={spotRef}
                      onClick={clickSpot}
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/7",
                        background: "#fff",
                        borderRadius: 16,
                        overflow: "hidden",
                        cursor: flow.running ? "crosshair" : "not-allowed",
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <rect
                          x="5"
                          y="10"
                          width="20"
                          height="20"
                          fill="#90CAF9"
                        />
                        <circle cx="50" cy="25" r="10" fill="#F48FB1" />
                        <polygon points="80,15 90,35 70,35" fill="#A5D6A7" />
                        <polygon
                          points="30,70 40,90 20,90"
                          fill={theme.amarillo}
                        />
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gridTemplateRows: "1fr 1fr",
                        }}
                      >
                        {["A", "B", "C", "D"].map((z) => (
                          <div
                            key={z}
                            style={{
                              outline: "1px dashed rgba(0,0,0,.06)",
                              padding: 6,
                              fontSize: 12,
                              color: "#78909C",
                            }}
                          >
                            {z}
                          </div>
                        ))}
                      </div>
                      {diffs
                        .filter((d) => d.found)
                        .map((d, i) => (
                          <div
                            key={i}
                            style={{
                              position: "absolute",
                              left: `${d.x * 100}%`,
                              top: `${d.y * 100}%`,
                              transform: "translate(-50%,-50%)",
                              width: d.r * 200,
                              height: d.r * 200,
                              borderRadius: "50%",
                              border: `3px solid ${theme.rosa}`,
                              boxShadow: "0 0 0 4px rgba(233,30,99,.2)",
                            }}
                          />
                        ))}
                    </div>

                    {/* derecha: referencia */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/7",
                        ...panelBox,
                        overflow: "hidden",
                      }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <rect
                          x="5"
                          y="10"
                          width="20"
                          height="22"
                          fill="#90CAF9"
                        />
                        <circle cx="50" cy="25" r="9" fill="#F48FB1" />
                        <polygon points="82,17 92,37 72,37" fill="#A5D6A7" />
                        <rect
                          x="22"
                          y="80"
                          width="16"
                          height="8"
                          fill={theme.amarillo}
                        />
                      </svg>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                      Encontradas: {diffs.filter((d) => d.found).length}/4 ·
                      Pistas: {hintsLeft}
                    </div>
                    <Btn
                      onClick={useHint}
                      bg={theme.amarillo}
                      fg={theme.texto}
                      label="💡 Pista (−1)"
                      full={false}
                      disabled={hintsLeft <= 0 || !flow.running}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, marginBottom: 8, opacity: 0.9 }}>
                    Reproduce el <b>patrón objetivo</b> en tu tablero. El tiempo
                    sigue corriendo.
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr",
                      gap: 16,
                      alignItems: "start",
                    }}
                  >
                    <div style={panelBox}>
                      <div style={badgeTitle}>Patrón objetivo</div>
                      <GridView
                        readOnly
                        grid={goal}
                        size={5}
                        onClickCell={() => {}}
                      />
                      <div style={smallHint}>
                        Celdas encendidas: {goal.flat().filter(Boolean).length}
                      </div>
                    </div>
                    <div style={panelBox}>
                      <div style={badgeTitle}>Tablero del equipo</div>
                      <GridView grid={grid} size={5} onClickCell={toggleCell} />
                      <div style={smallHint}>
                        Progreso:{" "}
                        {
                          grid.flat().filter((v, i) => v === goal.flat()[i])
                            .length
                        }
                        /{5 * 5} coincidencias
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}

          {/* ======== FASE 2 ======== */}
          {flow.step === "f2_video" && (
            <VideoSpace title="Empatía con el usuario" />
          )}
          {flow.step === "f2_instr" && (
            <Instructions
              title="Fase 2 — Empatía"
              bullets={[
                "El profesor anunciará la temática/desafío.",
                "Completa el mapa de empatía. El tiempo lo controla el profesor.",
              ]}
            />
          )}
          {flow.step === "f2_theme" && (
            <Card
              title="Temática y desafío"
              subtitle="Esperando al profesor para iniciar el mapa"
              width={980}
            >
              <ThemeChallengeSection
                THEMES={THEMES}
                temaSel={temaSel}
                setTemaSel={setTemaSel}
                desafioIndex={desafioIndex}
                setDesafioIndex={setDesafioIndex}
                desafioActual={desafioActual}
                isTablet={isTablet}
                onContinue={() => {}}
              />
            </Card>
          )}
          {flow.step === "f2_activity" && (
            <Card
              title={`Etapa 2 — ${THEMES[temaSel].label}: ${desafioActual.titulo}`}
              subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`}
              width={1100}
            >
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

          {/* ======== FASE 3 ======== */}
          {flow.step === "f3_video" && <VideoSpace title="Creatividad" />}
          {flow.step === "f3_activity" && (
            <Card
              title="Etapa 3 — Creatividad (LEGO)"
              subtitle={`Tiempo: ${mmss(flow.remaining)} · Monedas: ${coins}`}
              width={900}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ marginTop: 0 }}>
                    Sube una foto de tu solución (demo):
                  </p>
                  <input type="file" accept="image/*" />
                </div>
                <div>
                  <p style={{ marginTop: 0 }}>Mini-retos (3 monedas c/u):</p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {[
                      "Prototipo montado",
                      "Solución explicada",
                      "Foto clara",
                    ].map((r) => (
                      <Btn
                        key={r}
                        onClick={() => setCoins((c) => c + 3)}
                        bg={"#C8E6C9"}
                        fg={"#1B5E20"}
                        label={`✔ ${r}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ======== FASE 4 ======== */}
          {flow.step === "f4_video" && <VideoSpace title="Comunicación" />}
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
            </Card>
          )}
          {flow.step === "f4_pitch" && (
            <Card
              title="Zona de Pitch"
              subtitle="Esperando el turno del equipo"
              width={900}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  background: "#F0F4F8",
                  borderRadius: 12,
                  border: `2px dashed ${theme.border}`,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  color: "#90A4AE",
                  marginBottom: 12,
                  pointerEvents: "none",
                }}
              >
                Área de presentación (sin temporizador)
              </div>
            </Card>
          )}

          {/* ======== FASE 5 ======== */}
          {flow.step === "f5_video" && (
            <VideoSpace title="Evaluación y retroalimentación" />
          )}
          {flow.step === "f5_eval" && (
            <Card
              title="Etapa 5 — Evaluación"
              subtitle="Completa las evaluaciones (demo)"
              width={900}
            >
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                (En producción conectaremos formularios de evaluación.)
              </div>
            </Card>
          )}

          {/* ======== FASE 6 / QR ======== */}
          {flow.step === "f6_video" && (
            <VideoSpace title="Cierre y reflexión" />
          )}
          {flow.step === "f6_close" && (
            <Card
              title="Cierre y Apoyo"
              subtitle={`Monedas finales: ${coins}`}
              width={900}
              tight
            >
              <div style={{ textAlign: "left" }}>
                <p style={{ marginTop: 0 }}>
                  🎉 ¡Felicitaciones! Escribe tu reflexión final.
                </p>
                <textarea
                  id="reflexionText"
                  placeholder="Escribe tu reflexión..."
                  style={{ ...baseInput, minHeight: 120 }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <Btn
                    label="Enviar reflexión"
                    full={false}
                    onClick={() => {
                      const ta = document.getElementById(
                        "reflexionText"
                      ) as HTMLTextAreaElement | null;
                      const text = (ta?.value || "").trim();
                      if (!text) {
                        alert("Escribe una reflexión primero");
                        return;
                      }
                      const teamName = teamId.split("::")[1] || "Equipo";
                      update((a) => ({
                        ...a,
                        reflections: [
                          ...a.reflections,
                          {
                            roomCode: flow.roomCode,
                            teamName,
                            text,
                            ts: Date.now(),
                          },
                        ],
                      }));
                      alert("¡Gracias! Reflexión registrada.");
                      ta!.value = "";
                    }}
                  />
                </div>
              </div>
            </Card>
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
                  border: `3px dashed ${theme.border}`,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  color: "#90A4AE",
                  fontWeight: 800,
                }}
              >
                QR aquí
              </div>
            </Card>
          )}
        </AutoCenter>
      </div>
    );
  }

  return null;
}

/* =====================  COMPONENTES REUTILIZADOS  ===================== */
function GridView({
  grid,
  size,
  onClickCell,
  readOnly,
}: {
  grid: boolean[][];
  size: number;
  onClickCell: (r: number, c: number) => void;
  readOnly?: boolean;
}) {
  const isTablet = useMediaQuery("(max-width: 1180px)");
  const isMobile = useMediaQuery("(max-width: 640px)");
  const cell = isMobile ? 22 : isTablet ? 28 : 34;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${size}, ${cell}px)`,
        gap: 6,
        justifyContent: "center",
      }}
    >
      {grid.map((row, r) =>
        row.map((on, c) => (
          <button
            key={`${r}-${c}`}
            onClick={() => !readOnly && onClickCell(r, c)}
            style={{
              width: cell,
              height: cell,
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: on ? theme.rosa : "#FFFFFF",
              boxShadow: on ? "inset 0 0 0 3px rgba(233,30,99,.15)" : "none",
              cursor: readOnly ? "default" : "pointer",
            }}
          />
        ))
      )}
    </div>
  );
}

function ThemeChallengeSection({
  THEMES,
  temaSel,
  setTemaSel,
  desafioIndex,
  setDesafioIndex,
  desafioActual,
  isTablet,
  onContinue,
}: any) {
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          position: "relative",
          zIndex: 3,
        }}
      >
        {(Object.keys(THEMES) as (keyof typeof THEMES)[]).map((key) => {
          const active = temaSel === key;
          return (
            <Btn
              key={key}
              onClick={() => setTemaSel(key)}
              bg={active ? theme.azul : "#BBDEFB"}
              fg={active ? theme.blanco : theme.texto}
              label={THEMES[key].label}
              full={false}
            />
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "280px 1fr 360px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* izquierda: desafíos */}
        <div style={panelBox}>
          <div style={{ ...badgeTitle, marginBottom: 8 }}>Desafíos</div>
          <div style={{ display: "grid", gap: 8 }}>
            {THEMES[temaSel].desafios.map((d: any, idx: number) => {
              const active = desafioIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setDesafioIndex(idx)}
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderRadius: 12,
                    border: `2px solid ${active ? theme.rosa : theme.border}`,
                    background: active ? "#FFF3F7" : "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {d.titulo}
                </button>
              );
            })}
          </div>
        </div>

        {/* centro: video */}
        <div style={{ ...panelBox, padding: 10 }}>
          <div style={{ ...badgeTitle, marginBottom: 6 }}>
            Video de contexto
          </div>
          <div
            style={{
              width: "100%",
              aspectRatio: "16/9",
              background: theme.surfaceAlt,
              borderRadius: 12,
              border: `2px dashed ${theme.border}`,
              display: "grid",
              placeItems: "center",
              color: "#90A4AE",
              fontWeight: 700,
              pointerEvents: "none",
            }}
          >
            Video aquí
          </div>
        </div>

        {/* derecha: detalle */}
        <div style={{ ...panelBox, textAlign: "left", padding: 16 }}>
          <div style={{ fontWeight: 900, color: theme.rosa, marginBottom: 6 }}>
            {desafioActual.titulo}
          </div>
          <p style={{ marginTop: 0 }}>{desafioActual.descripcion}</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 12,
              alignItems: "center",
              background: "#FAFAFA",
              padding: 10,
              borderRadius: 12,
              border: "1px solid #eee",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: theme.rosa,
                color: theme.blanco,
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                boxShadow: "0 0 0 4px rgba(233,30,99,.15)",
              }}
            >
              {THEMES[temaSel].persona.nombre.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: theme.azul }}>
                {THEMES[temaSel].persona.nombre} ·{" "}
                {THEMES[temaSel].persona.edad} años
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                {THEMES[temaSel].persona.bio}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={onContinue} label="Elegir y continuar" full={false} />
          </div>
        </div>
      </div>
    </>
  );
}

function EmpathySection(props: any) {
  const {
    isTablet,
    isMobile,
    bubbleSize,
    centerBubbleSize,
    bubblePositions,
    EMPATIA_FIELDS,
    empatia,
    setActiveBubble,
    activeBubble,
    onEmpatiaChange,
  } = props;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isTablet ? "1fr" : "420px 1fr",
        gap: 16,
        textAlign: "left",
      }}
    >
      {/* Bubble map */}
      <div
        style={{
          position: "relative",
          height: isMobile ? 300 : 340,
          ...panelBox,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "55%",
            transform: "translate(-50%,-50%)",
            width: centerBubbleSize,
            height: centerBubbleSize,
            borderRadius: "50%",
            background: "#FFF3F7",
            border: `3px solid ${theme.rosa}`,
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            color: theme.rosa,
            textAlign: "center",
            padding: 12,
          }}
        >
          Persona
        </div>
        {EMPATIA_FIELDS.map((f: any) => {
          const filled = !!empatia[f.key]?.trim();
          const active = activeBubble === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveBubble(f.key)}
              style={{
                position: "absolute",
                ...(bubblePositions[f.key] || {}),
                width: bubbleSize,
                height: bubbleSize,
                borderRadius: "50%",
                border: `3px solid ${active ? theme.azul : theme.rosa}`,
                background: filled ? "#E1F5FE" : "#FFFDE7",
                color: theme.texto,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: active
                  ? "0 0 0 6px rgba(25,118,210,.15)"
                  : "0 6px 14px rgba(0,0,0,.08)",
              }}
            >
              {filled ? "✔ " : ""}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div style={panelBox}>
        <div style={{ fontWeight: 900, color: theme.azul, marginBottom: 6 }}>
          {EMPATIA_FIELDS.find((x: any) => x.key === activeBubble)?.label}
        </div>
        <textarea
          value={empatia[activeBubble]}
          onChange={(e) => onEmpatiaChange(activeBubble, e.target.value)}
          placeholder={`Escribe sobre ${
            EMPATIA_FIELDS.find((x: any) => x.key === activeBubble)?.label
          }...`}
          style={{ ...baseInput, minHeight: 160 }}
        />
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
          Consejos: ejemplos concretos, verbos en acción, datos o citas del
          usuario.
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 12 }}>
          Completadas:{" "}
          {EMPATIA_FIELDS.filter((f: any) => empatia[f.key].trim()).length}/
          {EMPATIA_FIELDS.length}
        </div>
      </div>
    </div>
  );
}

/* ====== Confetti (emoji) ====== */
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

/* ====== Ranking ====== */
function RankingBars({
  data,
  onContinue,
}: {
  data: { equipo: string; total: number }[];
  onContinue: () => void;
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
          const secondOrThird = !isFirst && !isLast;
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
                  fontWeight: 900,
                  fontSize: 18,
                  color: theme.blanco,
                  textShadow: "0 1px 2px rgba(0,0,0,.3)",
                }}
              >
                {i + 1}
                {isFirst && (
                  <div
                    style={{
                      fontSize: 22,
                      lineHeight: "16px",
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
                    position: "absolute",
                    left: 10,
                    top: -18,
                    fontWeight: 800,
                    color: isLast ? "#607D8B" : theme.texto,
                  }}
                >
                  {r.equipo}
                  {i === 1 && data.length >= 2
                    ? " 🥈"
                    : i === 2 && data.length >= 3
                    ? " 🥉"
                    : ""}
                </div>
                <div
                  style={{
                    height: 28,
                    background: "#F1F5F9",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "inset 0 0 0 1px #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: mounted ? `${pct}%` : 0,
                      transition: "width .9s ease",
                      background: barBg,
                      backgroundSize: isFirst ? "200% 100%" : undefined,
                      animation: isFirst
                        ? "shimmer 2.4s linear infinite"
                        : undefined,
                      borderRadius: 14,
                      position: "relative",
                      filter: isLast ? "grayscale(0.3)" : "none",
                    }}
                  />
                </div>
              </div>
              <div
                style={{ textAlign: "right", fontWeight: 900, fontSize: 18 }}
              >
                {r.total}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          marginTop: 12,
        }}
      >
        <Btn onClick={onContinue} label="Continuar" full={false} />
      </div>
    </>
  );
}

/* =====================  ADMIN DASHBOARD  ===================== */
function AdminDashboard({
  analytics,
  THEMES,
  setTHEMES,
  flow,
  onBack,
  ranking,
  clearMetrics,
}: {
  analytics: Analytics;
  THEMES: ThemeConfig;
  setTHEMES: (t: ThemeConfig) => void;
  flow: FlowState;
  onBack: () => void;
  ranking: { equipo: string; total: number }[];
  clearMetrics: () => void;
}) {
  const [tab, setTab] = useState<
    "resumen" | "temas" | "equipos" | "reflexiones" | "uso" | "ranking"
  >("resumen");

  const exportJSON = (name: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = {
    equipos: analytics.teams.length,
    estudiantes: analytics.teams.reduce(
      (acc, t) => acc + (t.integrantes?.length || 0),
      0
    ),
    reflexiones: analytics.reflections.length,
    rooms: analytics.roomsCreated,
  };

  return (
    <Card
      title="Panel de Administrador"
      subtitle="Configura el juego y revisa métricas"
      width={1100}
    >
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
      >
        {[
          ["resumen", "📊 Resumen"],
          ["temas", "🎯 Temáticas & Desafíos"],
          ["equipos", "👥 Equipos"],
          ["reflexiones", "📝 Reflexiones"],
          ["uso", "📈 Uso de desafíos"],
          ["ranking", "🏆 Ranking/Monedas"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k as any)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: `2px solid ${tab === k ? theme.azul : theme.border}`,
              background: tab === k ? "#E3F2FD" : "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Btn
            label="Exportar métricas"
            full={false}
            variant="outline"
            onClick={() => exportJSON("udd_metrics", analytics)}
          />
          <Btn
            label="Exportar configuración"
            full={false}
            variant="outline"
            onClick={() => exportJSON("udd_themes", THEMES)}
          />
          <Btn
            label="Resetear métricas"
            bg="#F44336"
            full={false}
            onClick={() => {
              if (
                confirm(
                  "¿Seguro que quieres borrar todas las métricas (equipos/uso/reflexiones)?"
                )
              ) {
                clearMetrics();
                alert("Métricas reseteadas.");
              }
            }}
          />
          <Btn
            label="⬅ Volver"
            full={false}
            bg={theme.amarillo}
            fg={theme.texto}
            onClick={onBack}
          />
        </div>
      </div>

      {/* CONTENIDO */}
      {tab === "resumen" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {[
            { k: "Salas creadas", v: totals.rooms },
            { k: "Equipos registrados", v: totals.equipos },
            { k: "Estudiantes (aprox.)", v: totals.estudiantes },
            { k: "Reflexiones recibidas", v: totals.reflexiones },
          ].map((card) => (
            <div key={card.k} style={panelBox}>
              <div style={{ fontSize: 13, color: theme.muted }}>{card.k}</div>
              <div style={{ fontSize: 32, fontWeight: 900 }}>{card.v}</div>
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1", ...panelBox }}>
            <div style={badgeTitle}>Sala actual</div>
            <div
              style={{
                fontFamily: "Roboto Mono, monospace",
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              Código: {flow.roomCode || "—"} · Paso: {flow.step} · Equipos
              esperados: {flow.expectedTeams || "—"}
            </div>
          </div>
        </div>
      )}

      {tab === "temas" && <ThemeEditor THEMES={THEMES} setTHEMES={setTHEMES} />}

      {tab === "equipos" && (
        <div style={{ ...panelBox, textAlign: "left" }}>
          <div style={badgeTitle}>Equipos registrados</div>
          {analytics.teams.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Sin equipos aún.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {analytics.teams
                .slice()
                .reverse()
                .map((t, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${theme.border}`,
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      {t.teamName}{" "}
                      <span style={{ color: theme.muted }}>
                        · sala {t.roomCode}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: theme.muted }}>
                      {new Date(t.ts).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
                      {t.integrantes?.map((p, j) => (
                        <div key={j}>
                          • <b>{p.nombre}</b> — {p.carrera}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {tab === "reflexiones" && (
        <div style={{ ...panelBox, textAlign: "left" }}>
          <div style={badgeTitle}>Reflexiones finales</div>
          {analytics.reflections.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Aún no hay reflexiones.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {analytics.reflections
                .slice()
                .reverse()
                .map((r, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${theme.border}`,
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      {r.teamName}{" "}
                      <span style={{ color: theme.muted }}>
                        · sala {r.roomCode}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: theme.muted }}>
                      {new Date(r.ts).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                      {r.text}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {tab === "uso" && (
        <div style={{ ...panelBox, textAlign: "left" }}>
          <div style={badgeTitle}>Uso de desafíos</div>
          <div style={{ fontSize: 12, color: theme.muted, marginBottom: 8 }}>
            (Se incrementa cuando el profesor abre el mapa de empatía con un
            desafío seleccionado)
          </div>
          {Object.keys(analytics.challengeUsage).length === 0 ? (
            <div style={{ opacity: 0.7 }}>Aún no hay datos de uso.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(analytics.challengeUsage)
                .sort((a, b) => b[1] - a[1])
                .map(([key, count]) => {
                  const [themeId, idxStr] = key.split("#");
                  const idx = Number(idxStr);
                  const t = THEMES[themeId as keyof typeof THEMES];
                  const label =
                    t?.label && t.desafios[idx]
                      ? `${t.label} — ${t.desafios[idx].titulo}`
                      : key;
                  return (
                    <div
                      key={key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 8,
                      }}
                    >
                      <div>{label}</div>
                      <div style={{ fontWeight: 900 }}>{count}</div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {tab === "ranking" && (
        <div style={{ ...panelBox }}>
          <div style={{ marginBottom: 8, textAlign: "left", ...badgeTitle }}>
            Monedas (sala actual {flow.roomCode || "—"})
          </div>
          <RankingBars data={ranking} onContinue={() => {}} />
        </div>
      )}
    </Card>
  );
}

function ThemeEditor({
  THEMES,
  setTHEMES,
}: {
  THEMES: ThemeConfig;
  setTHEMES: (t: ThemeConfig) => void;
}) {
  const [current, setCurrent] = useState<keyof ThemeConfig>("salud");
  const [local, setLocal] = useState<ThemeConfig>(THEMES);

  useEffect(() => setLocal(THEMES), [THEMES]);

  const t = local[current];

  const save = () => {
    setTHEMES(local);
    alert("Configuración guardada.");
  };

  const addChallenge = () => {
    const next = { ...local };
    next[current].desafios.push({
      titulo: "Nuevo desafío",
      descripcion: "Descripción...",
    });
    setLocal(next);
  };
  const removeChallenge = (i: number) => {
    const next = { ...local };
    next[current].desafios.splice(i, 1);
    setLocal(next);
  };
  const updateChallenge = (i: number, patch: Partial<ThemeChallenge>) => {
    const next = { ...local };
    next[current].desafios[i] = { ...next[current].desafios[i], ...patch };
    setLocal(next);
  };

  const updatePersona = (patch: Partial<ThemePersona>) => {
    const next = { ...local };
    next[current].persona = { ...next[current].persona, ...patch };
    setLocal(next);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {(Object.keys(local) as (keyof ThemeConfig)[]).map((k) => (
          <button
            key={k}
            onClick={() => setCurrent(k)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: `2px solid ${current === k ? theme.azul : theme.border}`,
              background: current === k ? "#E3F2FD" : "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {local[k].label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        {/* Persona */}
        <div style={{ ...panelBox, textAlign: "left" }}>
          <div style={badgeTitle}>Persona</div>
          <label>Nombre</label>
          <input
            style={{ ...baseInput, marginBottom: 8 }}
            value={t.persona.nombre}
            onChange={(e) => updatePersona({ nombre: e.target.value })}
          />
          <label>Edad</label>
          <input
            type="number"
            style={{ ...baseInput, marginBottom: 8 }}
            value={t.persona.edad}
            onChange={(e) =>
              updatePersona({ edad: Number(e.target.value) || 0 })
            }
          />
          <label>Bio</label>
          <textarea
            style={{ ...baseInput, minHeight: 100 }}
            value={t.persona.bio}
            onChange={(e) => updatePersona({ bio: e.target.value })}
          />
        </div>

        {/* Desafíos */}
        <div style={{ ...panelBox, textAlign: "left" }}>
          <div style={badgeTitle}>Desafíos</div>
          <div style={{ display: "grid", gap: 10 }}>
            {t.desafios.map((d, i) => (
              <div
                key={i}
                style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Título</label>
                  <input
                    style={baseInput}
                    value={d.titulo}
                    onChange={(e) =>
                      updateChallenge(i, { titulo: e.target.value })
                    }
                  />
                  <label>Descripción</label>
                  <textarea
                    style={{ ...baseInput, minHeight: 80 }}
                    value={d.descripcion}
                    onChange={(e) =>
                      updateChallenge(i, { descripcion: e.target.value })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <Btn
                    label="Eliminar"
                    full={false}
                    bg="#F44336"
                    onClick={() => {
                      if (confirm("¿Eliminar desafío?")) removeChallenge(i);
                    }}
                  />
                </div>
              </div>
            ))}
            <Btn label="Agregar desafío" full={false} onClick={addChallenge} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn label="Guardar cambios" onClick={save} full={false} />
      </div>
    </div>
  );
}

/* =====================  UTILS  ===================== */
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
function generateCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const nums = "123456789";
  const pick = (s: string, n: number) =>
    Array.from(
      { length: n },
      () => s[Math.floor(Math.random() * s.length)]
    ).join("");
  return pick(letters, 2) + pick(nums, 3);
}
