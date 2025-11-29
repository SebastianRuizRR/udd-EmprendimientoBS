import React, { useEffect, useRef } from "react";

type Props = {
  showContinue?: boolean;
  onContinue?: () => void;
};

/**
 * PitchAnimacion (Versión Final Robusta: Loop Estable)
 */
export default function PitchAnimacion({ showContinue, onContinue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSpeechRef = useRef<number>(0);
  const lastClapRef = useRef<number>(0);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playCartoonVoice = () => {
    const ctx = initAudio();
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
        const start = t + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "triangle"; 
        const pitch = 400 + Math.random() * 300; 
        osc.frequency.setValueAtTime(pitch, start);
        osc.frequency.linearRampToValueAtTime(pitch - 100, start + 0.08);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
        osc.start(start); osc.stop(start + 0.09);
    }
  };

  const playClap = () => {
    const ctx = initAudio();
    const t = ctx.currentTime;
    for(let i=0; i<3; i++) {
        const start = t + Math.random() * 0.05; 
        const bufferSize = ctx.sampleRate * 0.15; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) data[j] = (Math.random() * 2 - 1) * 0.8;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.playbackRate.value = 0.8 + Math.random() * 0.4;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000; 
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, start); 
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        noise.start(start);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    // --- FIX DE REDIMENSIONADO ---
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const w = rect.width || 900; 
        const h = rect.height || (w * 9 / 16);
        
        const newWidth = Math.round(w * dpr);
        const newHeight = Math.round(h * dpr);

        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        
        canvas.style.width = "100%";
        canvas.style.height = "100%";
      }
    };
    
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const DUR = 8; 
    const PALETTE = {
      bg: "#101828",       
      floor: "#1F2937",
      speakerSkin: "#FFCCBC",
      speakerSuit: "#1976D2",
      speakerHair: "#3E2723",
      mic: "#CFD8DC",
      podium: "#37474F",
      audienceSkin: "#FFCCBC", 
      audienceClothes: ["#546E7A", "#455A64", "#607D8B"], 
      clapSkin: "#FFCCBC",
      seat: "#263238"
    };

    const audience = [
        { x: 0.60, y: 0.55, scale: 0.85, color: PALETTE.audienceClothes[1] },
        { x: 0.75, y: 0.55, scale: 0.85, color: PALETTE.audienceClothes[2] },
        { x: 0.90, y: 0.55, scale: 0.85, color: PALETTE.audienceClothes[0] },
        { x: 0.65, y: 0.75, scale: 1.0, color: PALETTE.audienceClothes[0] },
        { x: 0.85, y: 0.75, scale: 1.0, color: PALETTE.audienceClothes[1] },
    ];

    const drawSpotlight = (w: number, h: number) => {
        ctx.save();
        const grad = ctx.createRadialGradient(w*0.25, 0, 20, w*0.25, h*0.8, 300);
        grad.addColorStop(0, "rgba(255,255,255,0.25)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(w*0.25 - 60, -50);
        ctx.lineTo(w*0.25 + 60, -50);
        ctx.lineTo(w*0.25 + 140, h);
        ctx.lineTo(w*0.25 - 140, h);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.ellipse(w*0.25, h*0.75, 100, 30, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    };

    const drawSpeaker = (w: number, h: number, t: number) => {
        const cx = w * 0.25;
        const cy = h * 0.75;
        const bob = Math.sin(t * 12) * 1.5; 
        const armWaving = Math.sin(t * 8) * 5;
        const armRightWaving = Math.cos(t * 7) * 3; 

        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = PALETTE.speakerSuit;
        ctx.beginPath(); ctx.moveTo(-35, -90 + bob); ctx.lineTo(35, -90 + bob); ctx.lineTo(40, 20); ctx.lineTo(-40, 20); ctx.fill();
        ctx.fillStyle = PALETTE.speakerSkin; ctx.fillRect(-8, -105 + bob, 16, 20);
        ctx.fillStyle = PALETTE.speakerSkin; ctx.beginPath(); ctx.arc(0, -115 + bob, 22, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = PALETTE.speakerHair; ctx.beginPath();
        ctx.moveTo(-22, -128 + bob); ctx.quadraticCurveTo(0, -155 + bob, 22, -128 + bob);
        ctx.lineTo(24, -110 + bob); ctx.quadraticCurveTo(26, -95 + bob, 0, -100 + bob);
        ctx.quadraticCurveTo(-26, -95 + bob, -24, -110 + bob); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = PALETTE.speakerSuit; ctx.lineWidth = 12; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-30, -80 + bob); ctx.quadraticCurveTo(-50 - armWaving, -90 - armWaving, -60, -60 - armWaving); ctx.stroke();
        ctx.fillStyle = PALETTE.speakerSkin; ctx.beginPath(); ctx.arc(-60, -60 - armWaving, 7, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(30, -80 + bob); ctx.quadraticCurveTo(50 + armRightWaving, -85 + armRightWaving, 55, -55 - armRightWaving); ctx.stroke();
        ctx.beginPath(); ctx.arc(55, -55 - armRightWaving, 7, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = PALETTE.podium; ctx.beginPath(); ctx.moveTo(-50, -80); ctx.lineTo(50, -80); ctx.lineTo(40, 40); ctx.lineTo(-40, 40); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(-48, -80, 96, 5);
        ctx.strokeStyle = "#263238"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(0, -100, 0, -110); ctx.stroke();
        ctx.fillStyle = PALETTE.mic; ctx.beginPath(); ctx.ellipse(0, -110, 6, 9, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#78909C"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, -110); ctx.lineTo(4, -110); ctx.moveTo(-4, -113); ctx.lineTo(4, -113); ctx.stroke();
        ctx.restore();
    };

    const drawWaves = (w: number, h: number, t: number) => {
        const cx = w * 0.25 + 10; const cy = h * 0.75 - 110; 
        if (t % 2.5 < 0.1 && Date.now() - lastSpeechRef.current > 2000 && t < 5.5) {
            playCartoonVoice(); lastSpeechRef.current = Date.now();
        }
        ctx.save(); ctx.translate(cx, cy);
        for(let i=0; i<3; i++) {
            const localT = (t + i*0.6) % 1.8;
            const r = 10 + localT * 180;
            const alpha = Math.max(0, 1 - localT);
            if (t < 6) { 
                ctx.beginPath(); ctx.arc(0, 0, r, -0.5, 0.5);
                ctx.strokeStyle = `rgba(255, 202, 40, ${alpha * 0.8})`; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke();
            }
        }
        ctx.restore();
    };

    const drawAudience = (w: number, h: number, t: number) => {
        const isClapping = t > 5 && t < 7.5;
        if (isClapping && Date.now() - lastClapRef.current > 80) { 
            playClap(); lastClapRef.current = Date.now();
        }
        audience.forEach((m, i) => {
            const ax = w * m.x; const ay = h * m.y;
            const bounce = isClapping ? Math.abs(Math.sin(t * 15 + i)) * 5 : 0;
            ctx.save(); ctx.translate(ax, ay - bounce); ctx.scale(m.scale, m.scale);
            ctx.fillStyle = PALETTE.seat; ctx.beginPath(); 
            if(ctx.roundRect) ctx.roundRect(-35, -10, 70, 60, 8); else ctx.rect(-35,-10,70,60);
            ctx.fill();
            ctx.fillStyle = "#37474F"; ctx.fillRect(-30, 40, 60, 20);
            ctx.fillStyle = m.color; ctx.beginPath(); ctx.ellipse(0, 40, 25, 35, 0, Math.PI, 0); ctx.fill();
            ctx.fillStyle = PALETTE.audienceSkin; ctx.fillRect(-6, 5, 12, 10);
            ctx.beginPath(); ctx.arc(0, -5, 18, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#3E2723"; ctx.beginPath(); ctx.arc(0, -8, 20, Math.PI*1.1, -Math.PI*0.1); ctx.closePath(); ctx.fill();
            if (isClapping) {
                const clapCycle = Math.sin(t * 20 + i); const handDist = Math.max(0, clapCycle * 8);
                ctx.fillStyle = PALETTE.clapSkin;
                ctx.beginPath(); ctx.ellipse(-10 - handDist, 25, 6, 8, -0.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(10 + handDist, 25, 6, 8, 0.5, 0, Math.PI*2); ctx.fill();
                if (handDist < 2) {
                    ctx.strokeStyle = "#FFF"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(-15, 15); ctx.lineTo(-20, 10);
                    ctx.moveTo(15, 15); ctx.lineTo(20, 10); ctx.stroke();
                }
            }
            ctx.restore();
        });
    };

    const drawText = (w: number, h: number, t: number) => {
        if (t > 5.5) {
            const alpha = Math.min(1, (t - 5.5) * 2);
            const scale = 1 + Math.sin(t*10)*0.05; 
            ctx.save(); ctx.translate(w/2, h*0.2); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
            ctx.fillStyle = "#FFCA28"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10;
            ctx.font = "900 42px Inter, sans-serif"; ctx.textAlign = "center";
            ctx.fillText("¡GRAN IDEA!", 0, 0); ctx.restore();
        }
    };

    const loopFn = (now: number) => {
        if (!startRef.current) startRef.current = now;
        const tSec = (now - startRef.current) / 1000;
        const mod = tSec % DUR;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        // IMPORTANTE: Dibujar siempre el fondo para borrar el frame anterior
        ctx.fillStyle = PALETTE.bg;
        ctx.fillRect(0, 0, w, h);
        
        if (w > 0 && h > 0) {
             ctx.fillStyle = PALETTE.floor;
             ctx.fillRect(0, h * 0.75, w, h * 0.25);
             drawSpotlight(w, h);
             drawAudience(w, h, mod); 
             drawSpeaker(w, h, mod);
             if (mod < 5) drawWaves(w, h, mod);
             drawText(w, h, mod);
        }

        // FIX: Siempre pedir el siguiente frame, independientemente de showContinue
        rafRef.current = requestAnimationFrame(loopFn);
    };

    rafRef.current = requestAnimationFrame(loopFn);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if(canvas.parentElement) ro.unobserve(canvas.parentElement);
    };
  }, []); // Se eliminó la dependencia [showContinue] para que el loop sea eterno y estable

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
      <p style={{ marginTop: 0, color: "#0D47A1", marginBottom: 16 }}>
        Transmite tu idea con claridad. ¡Haz que te escuchen!
      </p>

      <div style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: 16,
          overflow: "hidden",
          background: "#101828",
          boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)"
      }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {showContinue && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={onContinue}
            style={{
              padding: "12px 24px",
              borderRadius: 99,
              border: "none",
              background: "#1976D2",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(25,118,210,.3)",
              fontSize: 16
            }}
          >
            Continuar a Preparación
          </button>
        </div>
      )}
    </div>
  );
}