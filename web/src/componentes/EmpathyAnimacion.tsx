import React, { useEffect, useRef } from "react";

// Importa la imagen de la persona con la ruta especificada
import personImageSrc from "./assets/Open Peeps - Bust.png";

/**
 * EmpathyAnimacion
 * Escenas (duración total ~12s):
 * 1) Lupa busca a la persona (0–4s)
 * 2) Aparecen burbujas: emociones, necesidades, entorno… (4–8s)
 * 3) “Mapa” conecta burbujas (8–12s) y reinicia si loop=true
 *
 * Props:
 * - loop: reinicia automáticamente al terminar (default: true)
 * - onFinished: callback al terminar (si loop=false)
 */
type Props = {
  loop?: boolean;
  onFinished?: () => void;
};

export default function EmpathyAnimacion({ loop = true, onFinished }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Crear una imagen y cargarla desde la ruta proporcionada
  const personImage = new Image();
  personImage.src = personImageSrc; // Utiliza la ruta importada para la imagen

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // 1. Definir tamaño de referencia (proporción 16:9)
    const BASE_WIDTH = 900;
    // const BASE_HEIGHT = 506.25; // 900 * 9 / 16

    let scaleFactor = 1;

    // Función para ajustar el tamaño del canvas a su contenedor
    const adjustCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        // Asegúrate de que el canvas tenga el tamaño en píxeles de su contenedor
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        // Calcular el factor de escala
        scaleFactor = canvas.width / BASE_WIDTH;
      }
    };

    // Inicializar el tamaño del canvas
    adjustCanvasSize();

    // Crear un ResizeObserver para reajustar el tamaño del canvas si el contenedor cambia
    observerRef.current = new ResizeObserver(() => {
        adjustCanvasSize();
        // Forzar un redibujo inmediatamente
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(loopFn);
        }
    });

    // Observar el contenedor del canvas
    if (canvas.parentElement) {
        observerRef.current.observe(canvas.parentElement);
    }
    
    // 2. Funciones de ayuda
    const DUR = 12; // segundos
    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    /** Coordenadas relativas (0..1) a píxeles */
    const P = (x: number, y: number) => ({
      x: x * canvas.width,
      y: y * canvas.height,
    });

    // 3. Funciones de Dibujo Ajustadas con scaleFactor
    
    // Dibuja la persona con la imagen importada
    function drawPerson(x: number, y: number, scale = 0.12) {
      ctx.save();
      ctx.translate(x, y);
      
      const adjustedScale = scale * scaleFactor;

      // Verifica si la imagen está cargada y la dibuja
      if (personImage.complete) {
        ctx.drawImage(
          personImage,
          (-personImage.width * adjustedScale) / 2,
          0,
          personImage.width * adjustedScale,
          personImage.height * adjustedScale
        );
      }

      ctx.restore();
    }

    function drawMagnifier(cx: number, cy: number, rot: number, scale = 1) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      
      const adjustedScale = scale * scaleFactor;

      // cristal
      ctx.lineWidth = 3 * adjustedScale;
      ctx.strokeStyle = "#1976D2";
      ctx.fillStyle = "rgba(144,202,249,0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, 24 * adjustedScale, 0, Math.PI * 2); 
      ctx.fill();
      ctx.stroke();
      // mango
      ctx.strokeStyle = "#1976D2";
      ctx.lineWidth = 5 * adjustedScale;
      ctx.beginPath();
      ctx.moveTo(18 * adjustedScale, 18 * adjustedScale);
      ctx.lineTo(48 * adjustedScale, 48 * adjustedScale);
      ctx.stroke();
      ctx.restore();
    }

    function drawBubble(
      text: string,
      x: number,
      y: number,
      r: number,
      alpha = 1
    ) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#FFFDE7";
      ctx.strokeStyle = "#E91E63";
      ctx.lineWidth = 3 * scaleFactor; 
      ctx.beginPath();
      ctx.arc(x, y, r * scaleFactor, 0, Math.PI * 2); // Ajustado con scaleFactor
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0D47A1";
      // Aumento del tamaño de la fuente para que el texto quepa mejor
      const fontSize = Math.max(12, 16 * scaleFactor); 
      ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`; 
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function drawConnection(
      a: { x: number; y: number },
      b: { x: number; y: number },
      t = 1
    ) {
      // curva simple
      const mx = (a.x + b.x) / 2;
      // Reducción de la altura de la curva proporcional al factor de escala
      const my = Math.min(a.y, b.y) - 30 * scaleFactor; 
      ctx.save();
      ctx.strokeStyle = "#1976D2";
      ctx.lineWidth = 3 * scaleFactor; // Ajustado con scaleFactor
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
      const w = canvas.width,
        h = canvas.height;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#EEF6FF");
      grad.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // 4. Bucle principal de animación
    const loopFn = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const tSec = (now - startRef.current) / 1000;
      const mod = loop ? tSec % DUR : Math.min(tSec, DUR);

      drawBackground();

      const pCenter = P(0.5, 0.3); // Ajustada la posición vertical
      drawPerson(pCenter.x, pCenter.y, 0.85); // Escala aumentada a 0.65

      const t1 = clamp(mod / 4);
      // Ajuste de las coordenadas para la lupa, para que pase por encima de la persona
      // Empezará a la izquierda, pasará por el centro y terminará a la derecha
      const mg_x = lerp(0.2, 0.8, easeInOut(t1)); // De izquierda a derecha
      // La altura se ajusta para que pase por encima de la cabeza de la persona
      const mg_y = lerp(0.25, 0.38, Math.sin(easeInOut(t1) * Math.PI * 0.8)); // Curva más pronunciada sobre la persona
      const mg = P(mg_x, mg_y);
      drawMagnifier(mg.x, mg.y, Math.sin(tSec * 0.8) * 0.2, 1); // Rotación más sutil


      // ESCENA 2 (4–8s): burbujas con fade-in
      const t2 = clamp((mod - 4) / 4);
      const bubbles = [
        // Aumento de los radios de las burbujas para el texto y ajuste de posiciones
        // Reubicadas para no colisionar con la persona más grande y subida
        { label: "Emociones", pos: P(0.18, 0.28), r: 48 }, // Radio aumentado
        { label: "Necesidades", pos: P(0.82, 0.30), r: 52 }, // Radio aumentado
        { label: "Entorno", pos: P(0.18, 0.72), r: 48 }, // Radio aumentado, posición más baja
        { label: "Limitaciones", pos: P(0.82, 0.70), r: 50 }, // Radio aumentado, posición más baja
        { label: "Motivaciones", pos: P(0.5, 0.12), r: 52 }, // Radio aumentado, posición más alta y centrada
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
      if (observerRef.current && canvas.parentElement) {
          observerRef.current.unobserve(canvas.parentElement);
      }
    };
  }, [loop, onFinished]); // Dependencias se mantienen

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
      <h2
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 26,
          fontWeight: 900,
          color: "#1976D2",
        }}
      >
        Empatía con el usuario
      </h2>
      <p style={{ marginTop: 0, color: "#0D47A1" }}>
        Observamos al usuario, identificamos sentimientos y necesidades, y
        conectamos los puntos.
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
        {/* El canvas se dimensionará dentro de este div */}
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} /> 
      </div>
    </div>
  );
}