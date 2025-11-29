import React, { useEffect, useRef } from "react";

/**
 * CreatividadAnimacion (Versión Profesional + Audio)
 * 1. Plano (Diseño)
 * 2. Construcción (Bloques con sonido pop)
 * 3. Escáner (Sonido tecnológico)
 * 4. Validación (Tarjeta limpia con sonido de éxito)
 */

type Props = {
  loop?: boolean;
  onFinished?: () => void;
};

export default function CreatividadAnimacion({ loop = true, onFinished }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  
  // Refs para controlar que los sonidos suenen solo una vez por ciclo
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playedBlocksRef = useRef<Set<number>>(new Set());
  const playedScanRef = useRef(false);
  const playedWinRef = useRef(false);

  // --- SISTEMA DE SONIDO SINTETIZADO ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playPop = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    // Sonido corto tipo madera/plástico
    osc.type = "sine";
    osc.frequency.setValueAtTime(300 + Math.random() * 100, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playScan = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    // Barrido futurista
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  };

  const playSuccess = () => {
    const ctx = initAudio();
    // Acorde mayor simple (Ding!)
    [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const now = ctx.currentTime + (i * 0.05);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const w = parent.clientWidth;
        const h = Math.max(280, Math.round((w * 9) / 16));
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = "100%";
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    if(canvas.parentElement) ro.observe(canvas.parentElement);

    // --- CONFIG ---
    const COLS = 3;
    const ROWS = 3;
    const BLOCK_SIZE = 50;
    const GAP = 6;
    const PALETTE = ["#1976D2", "#42A5F5", "#E91E63", "#FFC107", "#AB47BC"];

    const blocks: {id:number, r:number, c:number, color:string, delay:number}[] = [];
    let count = 0;
    for(let r=0; r<ROWS; r++){
        for(let c=0; c<COLS; c++){
            blocks.push({
                id: count++,
                r, c,
                color: PALETTE[(r+c) % PALETTE.length],
                delay: 3 + (c * 0.2 + (ROWS - r) * 0.3) 
            });
        }
    }

    const clamp = (v: number, a=0, b=1) => Math.max(a, Math.min(b, v));
    const easeOutElastic = (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    };
    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const drawGrid = (w: number, h: number, opacity: number) => {
        if(opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = opacity * 0.15;
        ctx.strokeStyle = "#1976D2";
        ctx.beginPath();
        const step = 40;
        for (let x = 0; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();
        ctx.restore();
    };

    const drawBlueprint = (cx: number, cy: number, progress: number) => {
        if(progress <= 0) return;
        ctx.save();
        ctx.translate(cx, cy);
        const totalW = COLS * BLOCK_SIZE + (COLS-1)*GAP;
        const totalH = ROWS * BLOCK_SIZE + (ROWS-1)*GAP;
        ctx.strokeStyle = "#1976D2";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        const perim = 2 * (totalW + totalH);
        ctx.lineDashOffset = -perim * progress;
        ctx.strokeRect(-totalW/2 - 5, -totalH/2 - 5, totalW + 10, totalH + 10);
        
        if(progress > 0.5) {
            ctx.globalAlpha = (progress - 0.5) * 2;
            ctx.fillStyle = "#1976D2";
            ctx.font = "700 12px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("1. IDEAR", 0, -totalH/2 - 15);
        }
        ctx.restore();
    };

    const drawBlocks = (cx: number, cy: number, t: number) => {
        const totalW = COLS * BLOCK_SIZE + (COLS-1)*GAP;
        const totalH = ROWS * BLOCK_SIZE + (ROWS-1)*GAP;
        const x0 = cx - totalW / 2;
        const y0 = cy - totalH / 2;

        blocks.forEach(b => {
            const localT = t - b.delay; 
            if(localT < 0) return;

            // Trigger Sound
            if (localT > 0 && localT < 0.1 && !playedBlocksRef.current.has(b.id)) {
                playPop();
                playedBlocksRef.current.add(b.id);
            }

            const progress = clamp(localT / 1.2);
            const eased = easeOutElastic(progress);
            const targetX = x0 + b.c * (BLOCK_SIZE + GAP);
            const currentY = -150 + (y0 + b.r * (BLOCK_SIZE + GAP) + 150) * eased;
            
            ctx.save();
            ctx.fillStyle = b.color;
            ctx.shadowColor = "rgba(0,0,0,0.15)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;
            ctx.beginPath();
            ctx.roundRect(targetX, currentY, BLOCK_SIZE, BLOCK_SIZE, 6);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.2)"; // Brillo
            ctx.fillRect(targetX, currentY, BLOCK_SIZE, BLOCK_SIZE/3);
            ctx.restore();
        });

        if(t > 3.5 && t < 8) {
            ctx.fillStyle = "#333";
            ctx.font = "700 12px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.globalAlpha = clamp((t - 3.5));
            ctx.fillText("2. CONSTRUIR", cx, y0 + totalH + 25);
        }
    };

    const drawScanner = (cx: number, cy: number, t: number) => {
        if(t < 8) return;
        const localT = t - 8;
        
        // Trigger Scan Sound
        if (localT > 0 && localT < 0.1 && !playedScanRef.current) {
            playScan();
            playedScanRef.current = true;
        }

        const scanProgress = clamp(localT / 2);
        const easeScan = easeInOutQuad(scanProgress);
        const totalH = ROWS * BLOCK_SIZE + (ROWS-1)*GAP + 20;
        const yStart = cy - totalH/2 - 20;
        const yEnd = cy + totalH/2 + 20;
        const currentScanY = yStart + (yEnd - yStart) * easeScan;

        if (scanProgress < 1) {
            ctx.save();
            ctx.strokeStyle = "#00C853";
            ctx.lineWidth = 3;
            ctx.shadowColor = "#00C853";
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(cx - 100, currentScanY);
            ctx.lineTo(cx + 100, currentScanY);
            ctx.stroke();
            ctx.restore();
        }

        // --- VALIDATION BADGE (Tarjeta flotante corregida) ---
        if(localT > 2.2) {
            // Trigger Win Sound
            if (!playedWinRef.current) {
                playSuccess();
                playedWinRef.current = true;
            }

            const appear = clamp((localT - 2.2) * 3); // Aparece rápido
            const scale = easeOutElastic(appear);
            
            ctx.save();
            ctx.translate(cx, cy + 20); // Bajamos un poco el badge para que no tape los bloques
            ctx.scale(scale, scale);

            // Fondo Tarjeta (Blanco sólido para tapar lo de atrás)
            ctx.shadowColor = "rgba(0,0,0,0.2)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 10;
            ctx.fillStyle = "#FFFFFF";
            
            // Dibujar rectángulo redondeado centrado
            const badgeW = 160;
            const badgeH = 140;
            ctx.beginPath();
            ctx.roundRect(-badgeW/2, -badgeH/2, badgeW, badgeH, 16);
            ctx.fill();

            // Círculo Verde
            ctx.fillStyle = "#E8F5E9";
            ctx.beginPath();
            ctx.arc(0, -15, 35, 0, Math.PI*2);
            ctx.fill();

            // Checkmark
            ctx.fillStyle = "#2E7D32";
            ctx.font = "900 36px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("✓", 0, -13);

            // Textos
            ctx.fillStyle = "#1B5E20";
            ctx.font = "800 16px Inter, sans-serif";
            ctx.fillText("¡VALIDADO!", 0, 35);
            
            ctx.fillStyle = "#666";
            ctx.font = "500 11px Inter, sans-serif";
            ctx.fillText("Prototipo listo", 0, 52);

            ctx.restore();
        }
    };

    const loopFn = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const tSec = (now - startRef.current) / 1000;
      const DUR = 12;
      const mod = loop ? tSec % DUR : Math.min(tSec, DUR);

      // Reset sounds on loop
      if (tSec > DUR && loop && playedWinRef.current && mod < 1) {
          playedBlocksRef.current.clear();
          playedScanRef.current = false;
          playedWinRef.current = false;
      }

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      
      const grad = ctx.createLinearGradient(0,0,0,h);
      grad.addColorStop(0, "#F5F7FA");
      grad.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      drawGrid(w, h, 1);
      const cx = w / 2;
      const cy = h / 2;

      drawBlueprint(cx, cy, clamp(mod / 2.5));
      drawBlocks(cx, cy, mod);
      drawScanner(cx, cy, mod);

      if (!loop && mod >= DUR - 0.05) {
        onFinished?.();
        return;
      }
      rafRef.current = requestAnimationFrame(loopFn);
    };

    rafRef.current = requestAnimationFrame(loopFn);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if(canvas.parentElement) ro.unobserve(canvas.parentElement);
    };
  }, [loop, onFinished]);

  return (
    <div style={{ width: "clamp(320px, 92vw, 900px)", margin: "0 auto", background: "#fff", border: "1px solid #E3E8EF", borderRadius: 20, boxShadow: "0 16px 36px rgba(16,24,40,.14)", padding: 20, textAlign: "center" }}>
      <h2 style={{ margin: 0, marginBottom: 8, fontSize: 26, fontWeight: 900, color: "#1976D2" }}>Prototipar para Validar</h2>
      <p style={{ marginTop: 0, color: "#0D47A1", fontSize: 15, lineHeight: 1.5, maxWidth: 600, margin: "0 auto 16px auto" }}>
        No basta con tener la idea. Hay que <b>construirla rápido</b> para ver si funciona.
      </p>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 16, border: "1px solid #E3E8EF", overflow: "hidden", background: "#F5F7FA" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}