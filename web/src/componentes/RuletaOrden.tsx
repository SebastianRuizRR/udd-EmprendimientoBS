import React from "react";
import { motion, useAnimationControls } from "framer-motion";

/** ======================= TIPOS ======================= */
export type RuletaSignal =
  | { state: "idle" }
  | {
      state: "spinning";
      seed: number;            // para determinismo
      durationMs: number;      // duración del giro
      targetAngle: number;     // ángulo absoluto (deg) al que debe llegar (negativo, rota CCW)
      winnerIndex: number;     // índice ganador
      startedAt: number;       // Date.now() en profe (opcional, por si sincronizas latencia)
    }
  | {
      state: "stopped";
      seed: number;
      targetAngle: number;
      winnerIndex: number;
    };

export type RuletaOrdenProps = {
  /** Lista de equipos/segmentos en orden horario */
  segments: string[];
  /** ¿Render con botón y control de giro? */
  isTeacher?: boolean;
  /** Tamaño del canvas (px) */
  size?: number;
  /** Señal entrante (desde storage/pub-sub) para ESPECTADORES */
  incoming?: RuletaSignal;
  /** Emite señales para que las publiques y las reciban los alumnos */
  onBroadcast?: (signal: RuletaSignal) => void;
  /** Texto del header encima de la ruleta */
  title?: string;
  /** Muestra el ganador bajo la ruleta */
  showWinnerLabel?: boolean;
};

/** ======================= UTILES ======================= */

/** Hash determinístico simple */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paleta UDD/ASP-friendly */
const COLORS = [
  "#1976D2", // azul
  "#E91E63", // rosa
  "#FFEB3B", // amarillo
  "#9E007E", // morado ASP
  "#00A3E0", // celeste ASP
  "#26A69A", // teal
];

/** Audios base64 muy livianos */
const TICK_SRC =
  "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAAACaWQAAACAgIAAAAB/f39/f39/f3//";
const DING_SRC =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAAAAaWQAAACAgICA";

function useSounds() {
  const tickRef = React.useRef<HTMLAudioElement | null>(null);
  const dingRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    tickRef.current = new Audio(TICK_SRC);
    tickRef.current.volume = 0.25;
    dingRef.current = new Audio(DING_SRC);
    dingRef.current.volume = 0.35;
  }, []);

  return {
    tick: () => {
      const a = tickRef.current;
      if (!a) return;
      try {
        a.currentTime = 0;
        a.play().catch(() => {});
      } catch {}
    },
    ding: () => {
      const a = dingRef.current;
      if (!a) return;
      try {
        a.currentTime = 0;
        a.play().catch(() => {});
      } catch {}
    },
  };
}

/** ======================= COMPONENTE ======================= */
const RuletaOrden: React.FC<RuletaOrdenProps> = ({
  segments,
  isTeacher = false,
  size = 420,
  incoming,
  onBroadcast,
  title = "Orden de Presentación",
  showWinnerLabel = true,
}) => {
  const controls = useAnimationControls();
  const [angle, setAngle] = React.useState(0); // ángulo absoluto
  const [winnerIndex, setWinnerIndex] = React.useState<number | null>(null);
  const [spinning, setSpinning] = React.useState(false);
  const { tick, ding } = useSounds();

  const SEG = Math.max(1, segments.length);
  const SLICE = 360 / SEG;
  const center = size / 2;

  /** ====== DIBUJO: segmentos ====== */
  const paths = React.useMemo(() => {
    const r = center - 8;
    const makeArc = (startDeg: number, endDeg: number) => {
      const rad = (d: number) => (Math.PI * d) / 180;
      const x = (deg: number) => center + r * Math.cos(rad(deg - 90));
      const y = (deg: number) => center + r * Math.sin(rad(deg - 90));
      const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
      const sx = x(startDeg), sy = y(startDeg);
      const ex = x(endDeg), ey = y(endDeg);
      return `M ${center} ${center} L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`;
    };

    return Array.from({ length: SEG }).map((_, i) => {
      const start = i * SLICE;
      const end = (i + 1) * SLICE;
      return {
        d: makeArc(start, end),
        color: COLORS[i % COLORS.length],
        labelAngle: start + SLICE / 2,
      };
    });
  }, [SEG, SLICE, center, size]);

  /** ====== TICK sound por cruce de sector ====== */
  const tickState = React.useRef({ lastTick: -1 });
  React.useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => {
      // Normalizamos a [0..360)
      const a = ((angle % 360) + 360) % 360;
      const idx = Math.floor(a / SLICE);
      if (idx !== tickState.current.lastTick) {
        tickState.current.lastTick = idx;
        tick();
      }
    }, 80);
    return () => clearInterval(id);
  }, [spinning, angle, SLICE, tick]);

  /** ====== ANIMAR giro ====== */
  async function animateTo(targetAngle: number, durationMs: number) {
    setSpinning(true);
    await controls.start({
      rotate: targetAngle,
      transition: {
        type: "tween",
        ease: [0.12, 0.01, 0.08, 1],
        duration: durationMs / 1000,
      },
    });
    setSpinning(false);
    ding();
    setAngle(targetAngle);
  }

  /** ====== PROFESOR: iniciar giro ====== */
  const startSpinTeacher = () => {
    if (!isTeacher || segments.length === 0 || spinning) return;

    // seed determinístico y ganador
    const seed = Date.now();
    const rng = mulberry32(seed);
    const wIdx = Math.floor(rng() * segments.length);

    // Centro del sector ganador (puntero arriba a 0°, ruleta rota en negativo)
    const sectorCenter = wIdx * SLICE + SLICE / 2;
    // Vueltas extra para "sabor"
    const extraTurns = 4 + Math.floor(rng() * 3); // 4..6 vueltas
    const target = -(extraTurns * 360 + sectorCenter);

    const durationMs = 3800 + Math.floor(rng() * 1400);

    // Broadcast "spinning"
    onBroadcast?.({
      state: "spinning",
      seed,
      durationMs,
      targetAngle: target,
      winnerIndex: wIdx,
      startedAt: Date.now(),
    });

    // Animación local (profesor)
    setWinnerIndex(null);
    animateTo(target, durationMs).then(() => {
      setWinnerIndex(wIdx);
      onBroadcast?.({
        state: "stopped",
        seed,
        targetAngle: target,
        winnerIndex: wIdx,
      });
    });
  };

  /** ====== ESPECTADOR: reaccionar a incoming ====== */
  React.useEffect(() => {
    if (!incoming) return;

    if (incoming.state === "spinning") {
      setWinnerIndex(null);
      animateTo(incoming.targetAngle, incoming.durationMs).then(() => {
        setWinnerIndex(incoming.winnerIndex);
      });
    } else if (incoming.state === "stopped") {
      setWinnerIndex(incoming.winnerIndex);
      setAngle(incoming.targetAngle);
      controls.set({ rotate: incoming.targetAngle });
    } else if (incoming.state === "idle") {
      setWinnerIndex(null);
      setAngle(0);
      controls.set({ rotate: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming?.state, (incoming as any)?.targetAngle]);

  /** ====== UI ====== */
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        justifyItems: "center",
        userSelect: "none",
      }}
    >
      <div style={{ fontWeight: 900, color: "#E91E63" }}>{title}</div>

      {/* Puntero */}
      <div
        aria-hidden
        style={{
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderBottom: "22px solid #1976D2",
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))",
          marginBottom: -8,
        }}
      />

      {/* RUEDA */}
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          borderRadius: "50%",
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.9), rgba(255,255,255,.4))",
          boxShadow: "0 18px 36px rgba(16,24,40,.18)",
          border: "4px solid #E3E8EF",
        }}
      >
        <motion.svg
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0 }}
          animate={controls}
          onUpdate={(latest) => {
            const r = (latest as any)?.rotate;
            if (typeof r === "number") setAngle(r);
          }}
        >
          {/* anillo exterior */}
          <circle
            cx={center}
            cy={center}
            r={center - 6}
            fill="#FFFFFF"
            stroke="#E3E8EF"
            strokeWidth={4}
          />
          {/* segmentos */}
          {paths.map((p, i) => (
            <path key={i} d={p.d} fill={p.color} opacity={0.95} />
          ))}

          {/* separadores finos */}
          {Array.from({ length: SEG }).map((_, i) => {
            const a = (i * SLICE * Math.PI) / 180;
            const r = center - 6;
            const x = center + r * Math.cos(a - Math.PI / 2);
            const y = center + r * Math.sin(a - Math.PI / 2);
            return (
              <line
                key={`sep-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,.7)"
                strokeWidth={1.2}
              />
            );
          })}

          {/* etiquetas */}
          {paths.map((p, i) => {
            const rad = ((p.labelAngle - 90) * Math.PI) / 180;
            const r = center * 0.72;
            const x = center + r * Math.cos(rad);
            const y = center + r * Math.sin(rad);
            return (
              <text
                key={`lbl-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(11, size * 0.028)}
                fontWeight={800}
                fill="#0D47A1"
                style={{ pointerEvents: "none" }}
              >
                {segments[i]}
              </text>
            );
          })}

          {/* disco central */}
          <circle cx={center} cy={center} r={center * 0.22} fill="#FFFFFF" />
          <circle
            cx={center}
            cy={center}
            r={center * 0.22}
            fill="none"
            stroke="#1976D2"
            strokeWidth={3}
          />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight={900}
            fontSize={Math.max(14, size * 0.036)}
            fill="#1976D2"
          >
            {spinning ? "Girando…" : "GIRAR"}
          </text>
        </motion.svg>
      </div>

      {/* Controles profesor */}
      {isTeacher && (
        <button
          onClick={startSpinTeacher}
          disabled={spinning || segments.length === 0}
          title="Girar ruleta"
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            fontWeight: 900,
            background: spinning ? "#cfd8dc" : "#1976D2",
            color: "#fff",
            border: "none",
            cursor: spinning ? "not-allowed" : "pointer",
            boxShadow: "0 8px 16px rgba(0,0,0,.16)",
          }}
        >
          🎡 Girar ruleta
        </button>
      )}

      {/* Ganador visible */}
      {showWinnerLabel && winnerIndex != null && (
        <div
          style={{
            fontWeight: 900,
            color: "#E91E63",
            background: "#FFFFFF",
            border: "1px solid #E3E8EF",
            padding: "8px 12px",
            borderRadius: 12,
            boxShadow: "0 8px 16px rgba(0,0,0,.08)",
          }}
        >
          Ganador: <span style={{ color: "#1976D2" }}>{segments[winnerIndex]}</span>
        </div>
      )}
    </div>
  );
};

export default RuletaOrden;
