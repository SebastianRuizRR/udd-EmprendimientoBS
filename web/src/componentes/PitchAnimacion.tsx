
import React, { useEffect, useRef } from "react";

type Props = {
  /** Si true, muestra un botón “Continuar” (para el profesor). */
  showContinue?: boolean;
  /** Callback cuando el profe quiere pasar a la siguiente pantalla. */
  onContinue?: () => void;
};

/**
 * Animación fluida en canvas (loop):
 * 0-2s: micro aparece (fade & scale-in)
 * 2-5s: burbujas (Problema, Usuario, Solución) orbitan
 * 5-7s: gráfico de barras crece (resultado)
 * 7-8s: aplausos + “¡Excelente presentación!”
 * 8s -> reinicia
 */
export default function PitchAnimacion({ showContinue, onContinue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // util: map and clamp
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t: number) => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    let width = 1200, height = 675;
    const resize = () => {
      const parent = canvas.parentElement!;
      const w = parent.clientWidth;
      const h = (w * 9) / 16;
      width = Math.floor(w * DPR);
      height = Math.floor(h * DPR);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${Math.floor(w)}px`;
      canvas.style.height = `${Math.floor(h)}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // para no dibujar “chico”
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const loop = (now: number) => {
      if (!startRef.current) startRef.current = now;
      let t = (now - startRef.current) / 1000; // seg
      const DURATION = 8;                       // loop cada 8s
      t = t % DURATION;

      // background
      ctx.clearRect(0, 0, width, height);
      const W = width / DPR, H = height / DPR;

      // gradiente sutil
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#EEF6FF");
      g.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // “escenario” (tarima)
      ctx.fillStyle = "#E3E8EF";
      ctx.fillRect(0, H - 64, W, 64);

      // timeline por fases
      // F0: 0–2 (micro aparece)
      // F1: 2–5 (burbujas orbitando)
      // F2: 5–7 (barras suben)
      // F3: 7–8 (aplausos + texto)
      drawMicrophone(ctx, W, H, t);
      drawBubbles(ctx, W, H, t);
      drawBars(ctx, W, H, t, easeInOut);
      drawApplause(ctx, W, H, t, easeOut);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

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
        Comunicación y Pitch
      </h2>
      <p style={{ marginTop: 0, color: "#0D47A1" }}>
        Presenta tu idea, comunica valor y ¡genera impacto!
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
        <canvas ref={canvasRef} />
      </div>

      {showContinue && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={onContinue}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "#1976D2",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 6px 12px rgba(0,0,0,.12)",
            }}
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- DRAW HELPERS ---------- */

function drawMicrophone(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  // 0–2s: aparece (scale+fade)
  const p = clamp01((t - 0) / 2);
  const s = 0.7 + 0.3 * easeOut(p);
  const alpha = 0.2 + 0.8 * easeOut(p);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(W * 0.5, H * 0.62);
  ctx.scale(s, s);

  // base
  ctx.fillStyle = "#90A4AE";
  roundedRect(ctx, -26, 30, 52, 14, 7);
  ctx.fill();
  // cuerpo
  ctx.fillStyle = "#546E7A";
  roundedRect(ctx, -8, -30, 16, 60, 8);
  ctx.fill();
  // cabeza
  ctx.fillStyle = "#1976D2";
  ctx.beginPath();
  ctx.ellipse(0, -52, 22, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  // rejilla
  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.lineWidth = 2;
  for (let i = -14; i <= 14; i += 6) {
    ctx.beginPath();
    ctx.moveTo(-18, -52 + i);
    ctx.lineTo(18, -52 + i);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBubbles(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  // 2–5s: orbitan alrededor del micrófono (centro)
  const p = clamp01((t - 2) / 3);
  if (p <= 0) return;

  const cx = W * 0.5, cy = H * 0.42;
  const r = 120;
  const a = 1 * Math.PI * p; // gira medio círculo en 3s

  const items = [
    { label: "Problema", color: "#F48FB1", shift: 0 },
    { label: "Usuario", color: "#FFCA28", shift: 0.7 },
    { label: "Solución", color: "#66BB6A", shift: 1.4 },
  ];

  items.forEach((it, i) => {
    const ang = a + it.shift;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * (r * 0.6);

    ctx.save();
    ctx.globalAlpha = 0.25 + 0.75 * p;
    ctx.fillStyle = it.color;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // etiqueta
    ctx.font = "bold 14px Inter, ui-sans-serif";
    ctx.fillStyle = "#0D47A1";
    ctx.textAlign = "center";
    ctx.fillText(it.label, x, y + 42);
    ctx.restore();
  });

  // líneas “conexión”
  ctx.save();
  ctx.strokeStyle = "rgba(25,118,210,.5)";
  ctx.lineWidth = 2;
  items.forEach((it) => {
    const ang = a + it.shift;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * (r * 0.6);
    ctx.beginPath();
    ctx.moveTo(cx, cy + 60);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  ctx.restore();
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  easeInOut: (x: number) => number
) {
  // 5–7s: barras crecen
  const p = clamp01((t - 5) / 2);
  if (p <= 0) return;

  const x0 = W * 0.22, y0 = H * 0.78;
  const w = W * 0.56, h = H * 0.28;

  // eje
  ctx.save();
  ctx.strokeStyle = "#B0BEC5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0, y0 - h);
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + w, y0);
  ctx.stroke();
  ctx.restore();

  const bars = [0.35, 0.55, 0.7, 0.88]; // alturas objetivo
  const bw = (w * 0.7) / bars.length;
  const gap = (w * 0.3) / (bars.length + 1);

  bars.forEach((target, i) => {
    const x = x0 + gap * (i + 1) + bw * i;
    const grow = easeInOut(p) * target;
    const hBar = h * grow;

    const col = ["#90CAF9", "#64B5F6", "#42A5F5", "#1E88E5"][i % 4];
    ctx.fillStyle = col;
    ctx.fillRect(x, y0 - hBar, bw, hBar);
  });
}

function drawApplause(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, easeOut: (x: number) => number) {
  // 7–8s
  const p = clamp01((t - 7) / 1);
  if (p <= 0) return;

  // confetti
  const N = 20;
  for (let i = 0; i < N; i++) {
    const px = (i / N) * W + Math.sin(i * 17.23) * 20;
    const py = H * 0.12 + easeOut(p) * (H * 0.5) + (Math.sin(i * 9.1) * 8);
    const size = 6 + ((i * 13) % 6);
    ctx.fillStyle = ["#FFEE58", "#F48FB1", "#80DEEA", "#A5D6A7", "#90CAF9"][i % 5];
    ctx.fillRect(px, py, size, size);
  }

  // texto
  ctx.save();
  ctx.globalAlpha = p;
  ctx.font = "900 28px Inter, ui-sans-serif";
  ctx.fillStyle = "#1976D2";
  ctx.textAlign = "center";
  ctx.fillText("¡Excelente presentación!", W * 0.5, H * 0.2);
  ctx.restore();
}

/* ---------- mini utils ---------- */
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
// ---- Faltaba esta función de easing ----
function easeOut(t: number): number {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}
