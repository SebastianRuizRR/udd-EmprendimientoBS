import React, { useEffect, useRef } from "react";

/**
 * EmpathyAnimacion
 * Escenas (duración total ~12s):
 *  1) Lupa busca a la persona (0–4s)
 *  2) Aparecen burbujas: emociones, necesidades, entorno… (4–8s)
 *  3) “Mapa” conecta burbujas (8–12s) y reinicia si loop=true
 *
 * Props:
 *  - loop: reinicia automáticamente al terminar (default: true)
 *  - onFinished: callback al terminar (si loop=false)
 */
type Props = {
  loop?: boolean;
  onFinished?: () => void;
};

export default function EmpathyAnimacion({ loop = true, onFinished }: Props) {
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

    /** Coordenadas relativas (0..1) a píxeles */
    const P = (x: number, y: number) => ({
      x: x * canvas.width / dpr,
      y: y * canvas.height / dpr,
    });

    function drawPerson(x: number, y: number, scale = 1) {
      const rHead = 28 * scale;
      ctx.save();
      ctx.translate(x, y);
      // sombra
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.ellipse(0, rHead + 35 * scale, 40 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // cabeza
      ctx.fillStyle = "#FFD54F";
      ctx.beginPath();
      ctx.arc(0, 0, rHead, 0, Math.PI * 2);
      ctx.fill();
      // sonrisa
      ctx.strokeStyle = "#5D4037";
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(0, 6 * scale, 12 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      // torso simple
      ctx.fillStyle = "#90CAF9";
      ctx.fillRect(-18 * scale, rHead, 36 * scale, 36 * scale);
      ctx.restore();
    }

    function drawMagnifier(cx: number, cy: number, rot: number, scale = 1) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      // cristal
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = "#1976D2";
      ctx.fillStyle = "rgba(144,202,249,0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, 38 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // mango
      ctx.strokeStyle = "#1976D2";
      ctx.lineWidth = 6 * scale;
      ctx.beginPath();
      ctx.moveTo(24 * scale, 24 * scale);
      ctx.lineTo(60 * scale, 60 * scale);
      ctx.stroke();
      ctx.restore();
    }

    function drawBubble(text: string, x: number, y: number, r: number, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#FFFDE7";
      ctx.strokeStyle = "#E91E63";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0D47A1";
      ctx.font = "700 14px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function drawConnection(a: { x: number; y: number }, b: { x: number; y: number }, t = 1) {
      // curva simple
      const mx = (a.x + b.x) / 2;
      const my = Math.min(a.y, b.y) - 40;
      ctx.save();
      ctx.strokeStyle = "#1976D2";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      // dibujo progresivo
      const p1 = { x: lerp(a.x, mx, t), y: lerp(a.y, my, t) };
      const p2 = { x: lerp(a.x, mx, t), y: lerp(a.y, my, t) };
      const pEnd = { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
      ctx.quadraticCurveTo(p1.x, p1.y, pEnd.x, pEnd.y);
      ctx.stroke();
      ctx.restore();
    }

    function drawBackground() {
      const w = canvas.width / dpr, h = canvas.height / dpr;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#EEF6FF");
      grad.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // cornisa / mesa ligera al centro
      ctx.fillStyle = "#E3F2FD";
      ctx.fillRect(w * 0.56 - 140, h * 0.52, 280, 12);
      ctx.fillStyle = "#BBDEFB";
      ctx.fillRect(w * 0.56 - 140, h * 0.52 + 12, 280, 4);
    }

    const loopFn = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const tSec = (now - startRef.current) / 1000;
      const mod = loop ? tSec % DUR : Math.min(tSec, DUR);

      drawBackground();

      // ESCENA 1 (0–4s): la lupa busca a la persona (barrido)
      const pCenter = P(0.56, 0.52 - 0.14);
      drawPerson(pCenter.x, pCenter.y, 1);

      const t1 = clamp(mod / 4);
      const pathX = easeInOut(t1) * 0.5 + 0.18; // 0.18 → 0.68
      const pathY = 0.28 + Math.sin(easeInOut(t1) * Math.PI) * 0.12;
      const mg = P(pathX, pathY);
      drawMagnifier(mg.x, mg.y, Math.sin(tSec) * 0.1, 1);

      // luz “spot” de la lupa acercándose a la persona
      const approach = clamp((mod - 1.2) / 2.5);
      if (approach > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(255,235,59,0.18)";
        ctx.beginPath();
        ctx.arc(pCenter.x, pCenter.y, 60 * approach, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ESCENA 2 (4–8s): burbujas con fade-in
      const t2 = clamp((mod - 4) / 4);
      const bubbles = [
        { label: "Emociones", pos: P(0.28, 0.30), r: 42 },
        { label: "Necesidades", pos: P(0.78, 0.32), r: 48 },
        { label: "Entorno", pos: P(0.20, 0.68), r: 40 },
        { label: "Limitaciones", pos: P(0.84, 0.66), r: 44 },
        { label: "Motivaciones", pos: P(0.56, 0.18), r: 46 },
      ];

      bubbles.forEach((b, i) => {
        const appear = ease(clamp(t2 * 1.2 - i * 0.12));
        if (appear > 0) drawBubble(b.label, b.pos.x, b.pos.y, b.r, appear);
      });

      // ESCENA 3 (8–12s): conexiones desde la persona a cada burbuja
      const t3 = clamp((mod - 8) / 4);
      bubbles.forEach((b, i) => {
        const delay = i * 0.12;
        const tt = clamp((t3 - delay) / 0.9);
        if (tt > 0) drawConnection(pCenter, b.pos, ease(tt));
      });

      // fin
      if (!loop && mod >= DUR - 0.001) {
        if (onFinished) onFinished();
        return; // no pedir más frames
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
        Empatía con el usuario
      </h2>
      <p style={{ marginTop: 0, color: "#0D47A1" }}>
        Observamos al usuario, identificamos sentimientos y necesidades, y conectamos los puntos.
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
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

