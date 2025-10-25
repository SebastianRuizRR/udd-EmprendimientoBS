import React, { useEffect, useRef } from "react";

/**
 * CreatividadAnimacion
 * Escenas (~12s total):
 *  1) (0–5s) Piezas caen y se ensamblan en un prototipo.
 *  2) (5–9s) Resaltamos/iteramos partes (idea mejorada).
 *  3) (9–12s) Aparece una bombilla que late (¡eureka!).
 * Si loop=true, reinicia; de lo contrario dispara onFinished al final.
 */
type Props = {
  loop?: boolean;
  onFinished?: () => void;
};

export default function CreatividadAnimacion({ loop = true, onFinished }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const resize = () => {
      const w = canvas.clientWidth || 900;
      const h = Math.max(280, Math.round((w * 9) / 16));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      canvas.style.width = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const DUR = 12; // segundos
    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const P = (x: number, y: number) => ({
      x: (x * canvas.width) / dpr,
      y: (y * canvas.height) / dpr,
    });

    function drawBG() {
      const w = canvas.width / dpr, h = canvas.height / dpr;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#F1F8E9"); // verde muy suave
      g.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // “mesa” o base
      ctx.fillStyle = "#E8F5E9";
      const mw = Math.min(560, w * 0.62);
      ctx.fillRect(w * 0.5 - mw / 2, h * 0.68, mw, 10);
      ctx.fillStyle = "#C8E6C9";
      ctx.fillRect(w * 0.5 - mw / 2, h * 0.68 + 10, mw, 4);
    }

    type Piece = {
      color: string;
      size: number; // lado del rectángulo
      from: { x: number; y: number };
      to: { x: number; y: number; rot?: number };
      delay: number; // 0..1 relativo a escena 1
      rot?: number;
      r?: number; // para piezas redondas
      type?: "rect" | "round";
    };

    // Posiciones finales del “prototipo” (to: 0..1 coordenadas relativas)
    const pieces: Piece[] = [
      { color: "#90CAF9", size: 80, from: P(0.15, -0.2), to: P(0.43, 0.60), delay: 0.00, rot: 0.02, type: "rect" },
      { color: "#F48FB1", size: 90, from: P(0.85, -0.2), to: P(0.55, 0.60), delay: 0.08, rot: -0.03, type: "rect" },
      { color: "#FFF59D", size: 56, from: P(0.30, -0.3), to: P(0.50, 0.50), delay: 0.18, type: "round", r: 28 },
      { color: "#A5D6A7", size: 70, from: P(0.70, -0.35), to: P(0.50, 0.68), delay: 0.26, rot: 0.12, type: "rect" },
      { color: "#CE93D8", size: 60, from: P(0.10, -0.4), to: P(0.62, 0.52), delay: 0.34, rot: 0.18, type: "rect" },
    ];

    function drawPiece(p: Piece, x: number, y: number, t: number) {
      const wob = Math.sin(t * 6) * 2; // leve respiración
      ctx.save();
      ctx.translate(x, y + wob);
      ctx.rotate(p.rot || 0);
      ctx.fillStyle = p.color;
      if (p.type === "round") {
        const r = (p.r || p.size / 2);
        // sombra
        ctx.fillStyle = "rgba(0,0,0,0.10)";
        ctx.beginPath();
        ctx.ellipse(0, p.size / 2 + 8, r * 0.9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // sombra
        ctx.fillStyle = "rgba(0,0,0,0.10)";
        ctx.beginPath();
        ctx.ellipse(0, p.size / 2 + 10, p.size * 0.42, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        // conectores (puntitos tipo LEGO)
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        const dots = 3;
        const step = p.size / (dots + 1);
        for (let i = 1; i <= dots; i++) {
          for (let j = 1; j <= dots; j++) {
            ctx.beginPath();
            ctx.arc(-p.size / 2 + step * i, -p.size / 2 + step * j, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    function drawHighlightRing(x: number, y: number, r: number, alpha: number) {
      ctx.save();
      ctx.strokeStyle = `rgba(25,118,210,${alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    function drawBulb(x: number, y: number, t: number) {
      const pulse = 0.85 + Math.sin(t * 4) * 0.15;
      ctx.save();
      ctx.translate(x, y);
      // halo
      ctx.globalAlpha = 0.20 * pulse;
      ctx.fillStyle = "#FFEB3B";
      ctx.beginPath();
      ctx.arc(0, -20, 72 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // bombilla
      ctx.fillStyle = "#FFEB3B";
      ctx.beginPath();
      ctx.ellipse(0, -22, 30, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      // casquillo
      ctx.fillStyle = "#607D8B";
      ctx.fillRect(-16, 6, 32, 10);

      // rayos
      ctx.strokeStyle = "#FFC107";
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 42, -22 + Math.sin(a) * 42);
        ctx.lineTo(Math.cos(a) * (52 + 4 * pulse), -22 + Math.sin(a) * (52 + 4 * pulse));
        ctx.stroke();
      }
      ctx.restore();
    }

    const loopFn = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const tSec = (now - startRef.current) / 1000;
      const mod = loop ? tSec % DUR : Math.min(tSec, DUR);

      drawBG();

      // ESCENA 1 — caída/ensamble (0–5s)
      const s1 = clamp(mod / 5);
      pieces.forEach((p) => {
        // progreso individual con delay
        const tt = clamp((s1 - p.delay) / 0.55);
        const x = lerp(p.from.x, p.to.x, ease(tt));
        const y = lerp(p.from.y, p.to.y, ease(tt));
        // rotación sutil durante caída
        p.rot = (p.rot || 0) + (1 - tt) * 0.02;
        drawPiece(p, x, y, tSec);
      });

      // ESCENA 2 — resaltar/iterar (5–9s)
      const s2 = clamp((mod - 5) / 4);
      if (s2 > 0) {
        const center = P(0.50, 0.56);
        // “sketch” de conexión para sugerir iteración
        ctx.save();
        ctx.strokeStyle = "rgba(25,118,210,0.6)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(center.x - 120, center.y - 60);
        ctx.lineTo(center.x + 120, center.y + 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(center.x + 120, center.y - 40);
        ctx.lineTo(center.x - 100, center.y + 30);
        ctx.stroke();
        ctx.restore();

        // anillos que van apareciendo sobre piezas
        pieces.forEach((p, i) => {
          const px = p.to.x, py = p.to.y;
          const appear = ease(clamp(s2 * 1.2 - i * 0.12));
          if (appear > 0) drawHighlightRing(px, py, 50, appear);
        });
      }

      // ESCENA 3 — bombilla (9–12s)
      const s3 = clamp((mod - 9) / 3);
      if (s3 > 0) {
        const b = P(0.80, 0.28);
        drawBulb(b.x, b.y, tSec);
      }

      if (!loop && mod >= DUR - 0.001) {
        onFinished?.();
        return;
      }
      rafRef.current = requestAnimationFrame(loopFn);
    };

    rafRef.current = requestAnimationFrame(loopFn);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [loop, onFinished]);

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
        Creatividad y Prototipado
      </h2>
      <p style={{ marginTop: 0, color: "#0D47A1" }}>
        Probamos piezas, iteramos y ¡encendemos la idea!
      </p>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: 16,
          border: "2px dashed #E3E8EF",
          overflow: "hidden",
          background: "linear-gradient(180deg,#F1F8E9, #FFFFFF)",
        }}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

