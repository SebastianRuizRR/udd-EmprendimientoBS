
// src/components/TeamworkAnimacion.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";

/** Opciones:
 *  - loop: el ciclo se repite (default true)
 *  - stopAtEnd: si true, el ciclo se detiene al terminar y llama onFinished
 *  - onFinished: callback cuando llega al final con stopAtEnd=true
 */
type Props = {
  loop?: boolean;
  stopAtEnd?: boolean;
  onFinished?: () => void;
};

export default function TeamworkMiniAnim({
  loop = true,
  stopAtEnd = false,
  onFinished,
}: Props) {
  // playhead 0..1 dentro de un ciclo
  const [t, setT] = useState(0);

  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  const DURATION = 12000; // ms por ciclo (ajústalo)

  useEffect(() => {
    let start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;

      if (stopAtEnd) {
        const clamped = Math.min(elapsed / DURATION, 1);
        setT(clamped);
        if (clamped >= 1 && !doneRef.current) {
          doneRef.current = true;
          onFinished?.();
        }
      } else {
        const mod = loop ? (elapsed % DURATION) / DURATION : Math.min(elapsed / DURATION, 1);
        setT(mod);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loop, stopAtEnd, onFinished]);

  // Posiciones en porcentaje (0..1 del ancho/alto del lienzo)
  const { a, b, showNoLlego, showAyudo, showGracias, confetti } = useMemo(
    () => computeTimeline(t),
    [t]
  );

  return (
    <div
      style={{
        width: "clamp(320px, 92vw, 900px)",
        margin: "0 auto",
        background: "#fff",
        border: "1px solid #E3E8EF",
        borderRadius: 20,
        boxShadow: "0 16px 36px rgba(16,24,40,.14)",
        padding: 20,
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 8, fontSize: 26, fontWeight: 900, color: "#1976D2" }}>
        Trabajo en equipo
      </h2>
      <p style={{ marginTop: 0, color: "#0D47A1" }}>
        A no llega, B aparece, se coordinan y ¡lo logran!
      </p>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: 16,
          border: "2px dashed #E3E8EF",
          overflow: "hidden",
          background: "linear-gradient(180deg,#EEF6FF, #FFFFFF)",
        }}
      >
        {/* Cornisa */}
        <div
          style={{
            position: "absolute",
            left: "60%",
            bottom: "40%",
            width: 260,
            height: 16,
            background: "#90CAF9",
            borderRadius: 8,
            transform: "translateX(-50%)",
          }}
        />

        {/* Globos de texto */}
        {showNoLlego && <Speech xPct={40} yPct={70} text="No llego :(" />}
        {showAyudo && <Speech xPct={48} yPct={64} text="¡Yo te ayudo!" />}
        {showGracias && <Speech xPct={63} yPct={30} text="GRACIAS :)" />}

        {/* Bichitos */}
        <Bug x={a.x} y={a.y} color="#F48FB1" label="A" />
        <Bug x={b.x} y={b.y} color="#A5D6A7" label="B" />

        {confetti && <Confetti />}
      </div>

      <p style={{ fontSize: 13, opacity: 0.8, marginTop: 10 }}>
        Moraleja: cooperando, alcanzamos lo que solos no.
      </p>
    </div>
  );
}

/* ===================== Timeline ===================== */
/** Curvas de easing */
const easeInOut = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** t 0..1 → posiciones y estados */
function computeTimeline(t: number) {
  // Fases (en fracciones del timeline)
  const P1 = 0.00, P2 = 0.18; // A corre y salta, no llega
  const P3 = 0.36;            // B se acerca
  const P4 = 0.58;            // A sube a B (apilado)
  const P5 = 0.72;            // A alcanza cornisa
  const P6 = 0.86;            // Celebración
  const P7 = 1.00;            // Reset/loop

  // Posiciones base (en porcentaje 0..1 del contenedor)
  const startA = { x: 0.18, y: 0.74 };
  const missEdge = { x: 0.48, y: 0.48 }; // intento de A
  const meetPoint = { x: 0.46, y: 0.66 }; // donde A y B se encuentran
  const stackedA = { x: 0.50, y: 0.58 }; // A arriba de B
  const edgeTop  = { x: 0.60, y: 0.40 }; // bajo cornisa
  const onLedgeA = { x: 0.62, y: 0.30 }; // A sobre cornisa
  const startB = { x: 0.06, y: 0.78 };

  // Helpers
  const between = (a: number, b: number) => clamp01((t - a) / (b - a));
  const inRange = (a: number, b: number) => t >= a && t < b;

  // A
  let Ax = startA.x, Ay = startA.y;

  if (inRange(P1, P2)) {
    const k = easeInOut(between(P1, P2));
    Ax = lerp(startA.x, missEdge.x, k);
    // pequeño arco hacia arriba y caída
    const up = Math.sin(k * Math.PI) * 0.10;
    Ay = lerp(startA.y, missEdge.y, k) - up;
  } else if (inRange(P2, P3)) {
    const k = easeInOut(between(P2, P3));
    Ax = lerp(missEdge.x, meetPoint.x, k);
    Ay = lerp(missEdge.y, meetPoint.y, k);
  } else if (inRange(P3, P4)) {
    const k = easeInOut(between(P3, P4));
    Ax = lerp(meetPoint.x, stackedA.x, k);
    Ay = lerp(meetPoint.y, stackedA.y - 0.10, k); // A se sube
  } else if (inRange(P4, P5)) {
    const k = easeInOut(between(P4, P5));
    Ax = lerp(stackedA.x, edgeTop.x, k);
    Ay = lerp(stackedA.y - 0.10, edgeTop.y - 0.06, k);
  } else if (inRange(P5, P6)) {
    const k = easeInOut(between(P5, P6));
    Ax = lerp(edgeTop.x, onLedgeA.x, k);
    Ay = lerp(edgeTop.y - 0.06, onLedgeA.y, k); // A sube a la cornisa
  } else if (inRange(P6, P7)) {
    // vuelve a origen (suave) para el loop
    const k = easeInOut(between(P6, P7));
    Ax = lerp(onLedgeA.x, startA.x, k);
    Ay = lerp(onLedgeA.y, startA.y, k);
  }

  // B
  let Bx = startB.x, By = startB.y;

  if (inRange(P1, P3)) {
    // B se acerca mientras A falla y luego se reagrupa
    const k = easeInOut(between(P1, P3));
    Bx = lerp(startB.x, meetPoint.x - 0.02, k);
    By = lerp(startB.y, meetPoint.y + 0.02, k);
  } else if (inRange(P3, P4)) {
    // B se “coloca” para hacer de soporte (baja un poquito)
    const k = easeInOut(between(P3, P4));
    Bx = lerp(meetPoint.x - 0.02, stackedA.x, k);
    By = lerp(meetPoint.y + 0.02, stackedA.y + 0.06, k);
  } else if (inRange(P4, P5)) {
    // A y B se mueven juntos hacia la cornisa
    const k = easeInOut(between(P4, P5));
    Bx = lerp(stackedA.x, edgeTop.x - 0.02, k);
    By = lerp(stackedA.y + 0.06, edgeTop.y + 0.06, k);
  } else if (inRange(P5, P6)) {
    // B se queda abajo, empujando; luego baja un poco más
    const k = easeInOut(between(P5, P6));
    Bx = lerp(edgeTop.x - 0.02, edgeTop.x - 0.04, k);
    By = lerp(edgeTop.y + 0.06, edgeTop.y + 0.10, k);
  } else if (inRange(P6, P7)) {
    // vuelve a origen
    const k = easeInOut(between(P6, P7));
    Bx = lerp(edgeTop.x - 0.04, startB.x, k);
    By = lerp(edgeTop.y + 0.10, startB.y, k);
  }

  // Globos de texto y confetti en ventanas concretas
  const showNoLlego = t >= P1 + 0.10 && t < P2 + 0.02;
  const showAyudo   = t >= P3 - 0.06 && t < P4 - 0.02;
  const showGracias = t >= P5 + 0.06 && t < P6 - 0.04;
  const confetti    = t >= P6 - 0.04 && t < P6 + 0.06;

  return { a: { x: Ax, y: Ay }, b: { x: Bx, y: By }, showNoLlego, showAyudo, showGracias, confetti };
}

/* ===================== Primitivas visuales ===================== */

function Bug({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  // leve “bobbing” para que no se vean rígidos
  const [time, setTime] = useState(0);
  useEffect(() => {
    let r: number;
    const s = performance.now();
    const loop = (n: number) => {
      setTime((n - s) / 1000);
      r = requestAnimationFrame(loop);
    };
    r = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(r);
  }, []);
  const bob = Math.sin(time * 4) * 6;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
      aria-label={`Bicho ${label}`}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: color,
          transform: `translateY(${-bob}px)`,
          boxShadow: "0 6px 14px rgba(0,0,0,.15)",
        }}
      />
    </div>
  );
}

function Speech({ xPct, yPct, text }: { xPct: number; yPct: number; text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, -100%)",
        background: "#FFFFFF",
        border: "2px solid #E3E8EF",
        borderRadius: 12,
        padding: "6px 10px",
        fontWeight: 800,
        color: "#0D47A1",
        boxShadow: "0 8px 16px rgba(0,0,0,.08)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

function Confetti() {
  const items = useMemo(() => {
    const EMO = ["🎉", "🎊", "✨", "⭐", "🎈"];
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      emoji: EMO[(Math.random() * EMO.length) | 0],
    }));
  }, []);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: -20,
            left: `${p.left}%`,
            fontSize: 22,
            animation: `fall 1.8s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style>
        {`@keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: .9 }
            100% { transform: translateY(120%) rotate(360deg); opacity: .9 }
        }`}
      </style>
    </div>
  );
}
