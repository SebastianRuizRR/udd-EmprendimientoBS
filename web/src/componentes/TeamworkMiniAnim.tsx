// TeamWorkMiniAnim.tsx
import React, { useEffect, useRef } from "react";

type Props = {
  durationSec?: number;
  boatScale?: number;
  loop?: boolean;
};

const theme = {
  rosa: "#E91E63",
  azul: "#1976D2",
  verde: "#2E7D32",
  morado: "#7C4DFF",
  gris: "#CFD8DC",
  grisOscuro: "#546E7A",
  meta: "#D32F2F",
  aguaClaro: "#E3F2FD",
  aguaMedio: "#BBDEFB",
  aguaOscuro: "#90CAF9",
};

const TeamWorkMiniAnim: React.FC<Props> = ({
  durationSec = 8,
  boatScale = 0.85,
}) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSplashRef = useRef<number>(0);
  const hasWonRef = useRef<boolean>(false);

  // --- AUDIO ENGINE ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playSplash = () => {
    const ctx = initAudio();
    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(100, t + 0.2);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(t);
  };

  const playWin = () => {
    const ctx = initAudio();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = f;
        osc.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, t + i*0.08);
        g.gain.linearRampToValueAtTime(0.1, t + i*0.08 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + i*0.08 + 0.6);
        osc.start(t + i*0.08); osc.stop(t + i*0.08 + 0.6);
    });
  };

  // --- SYNC LOOP ---
  useEffect(() => {
    let raf: number;
    const start = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - start) / 1000;
      const progress = (elapsed % durationSec) / durationSec;

      // 1. SPLASH: Sincronizado (evita sonar durante la pausa final > 0.7)
      if (progress < 0.7 && (Date.now() - lastSplashRef.current > 800)) {
          playSplash();
          lastSplashRef.current = Date.now();
      }

      // 2. META: Cruzan aprox al 60%, suena el éxito
      if (progress > 0.6 && !hasWonRef.current) {
          playWin();
          hasWonRef.current = true;
      }
      if (progress < 0.1) hasWonRef.current = false;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [durationSec]);

  return (
    <div style={{ width: "clamp(320px, 94vw, 980px)", margin: "0 auto", background: "#fff", borderRadius: 20, padding: 20, border: `1px solid ${theme.gris}`, boxShadow: "0 16px 36px rgba(16,24,40,.14)" }}>
      <style>{getStyles(durationSec, boatScale)}</style>
      
      <h2 style={{margin: "0 0 4px 0", color: theme.azul}}>Sincronización = Velocidad</h2>
      <p style={{margin: "0 0 20px 0", color: "#666", fontSize: 14}}>Mira la diferencia entre remar todos juntos vs. esfuerzo individual</p>

      <div className="scene">
        {/* Fondo de Agua Mejorado */}
        <div className="water-container">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
        </div>
        
        {/* Meta */}
        <div className="finish-line">
            <div className="finish-flag">🏁 META</div>
        </div>

        {/* --- CARRIL 1: EQUIPO (RÁPIDO) --- */}
        <div className="lane">
            <div className="label-tag sync">Trabajo en Equipo</div>
            <div className="boat-wrapper fast-boat">
                <BoatSVG team="sync" />
            </div>
        </div>

        {/* Separador */}
        <div style={{height: 1, background: "rgba(255,255,255,0.3)", margin: "15px 0", position: "relative", zIndex: 2}} />

        {/* --- CARRIL 2: INDIVIDUAL (LENTO) --- */}
        <div className="lane">
            <div className="label-tag solo">Esfuerzo Individual</div>
            <div className="boat-wrapper slow-boat">
                <BoatSVG team="solo" />
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE SVG DEL BOTE ---
const BoatSVG = ({ team }: { team: "sync" | "solo" }) => (
  <svg viewBox="0 0 1100 300" className="boat-svg">
    <g transform="translate(0, 20)">
        <ellipse cx="550" cy="240" rx="480" ry="15" fill="rgba(0,0,0,0.15)" /> {/* Sombra más fuerte */}
        <path d="M120 180 L980 180 L940 220 L160 220 Z" fill="#CFD8DC" />
        <path d="M100 180 L140 220 L960 220 L1000 180 Z" fill="#90A4AE" stroke="#546E7A" strokeWidth="2" />
        <rect x="120" y="175" width="860" height="8" rx="2" fill="#78909C" />
    </g>
    
    {[0, 1, 2, 3].map((i) => {
        const isRowing = team === "sync" || i === 3; 
        const color = [theme.azul, theme.rosa, theme.verde, theme.morado][i];
        return (
            <g key={i} transform={`translate(${240 + i * 190}, 160)`}>
                <rect x="-20" y="35" width="40" height="6" fill="#546E7A" />
                <g className={isRowing ? "rower-anim" : "rower-idle"}>
                    <path d="M-10 35 L10 10 L40 35" stroke="#546E7A" strokeWidth="10" strokeLinecap="round" fill="none" />
                    <path d="M0 10 L0 -50" stroke={color} strokeWidth="22" strokeLinecap="round" />
                    <circle cx="0" cy="-70" r="16" fill="#FFCCBC" />
                    <path d="M-14 -76 Q0 -86 14 -76" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
                    <g className={isRowing ? "arm-anim" : ""}>
                        <path d="M-10 -45 L20 -25" stroke={color} strokeWidth="10" strokeLinecap="round" />
                        <g transform="translate(20, -25) rotate(15)">
                            <rect x="-10" y="-4" width="160" height="8" fill="#5D4037" rx="2" />
                            <path d="M140 -10 L180 -10 L180 18 L140 18 Z" fill="#8D6E63" />
                        </g>
                        <circle cx="20" cy="-25" r="7" fill="#FFCCBC" /> 
                    </g>
                </g>
            </g>
        );
    })}
  </svg>
);

// --- ESTILOS CSS ---
function getStyles(DUR: number, SCALE: number) {
  return `
    .scene {
        position: relative; width: 100%; height: 360px;
        border-radius: 16px; overflow: hidden;
        display: flex; flex-direction: column; justify-content: space-evenly;
        padding: 20px 0;
        /* Fondo base del agua */
        background: linear-gradient(180deg, ${theme.aguaClaro} 0%, ${theme.aguaMedio} 100%);
    }

    /* --- AGUA MEJORADA (Capas de olas) --- */
    .water-container {
        position: absolute; inset: 0; pointer-events: none;
        overflow: hidden;
    }
    .wave {
        position: absolute; left: -50%; width: 200%; height: 120%;
        background-repeat: repeat-x;
        transform-origin: center top;
    }
    /* Definición de las formas de ola usando gradientes radiales */
    .wave1 {
        bottom: -20px; opacity: 0.4;
        background-image: radial-gradient(circle at 50% 100%, ${theme.aguaOscuro} 25%, transparent 26%);
        background-size: 60px 30px;
        animation: waveMove 8s linear infinite;
    }
    .wave2 {
        bottom: 10px; opacity: 0.3;
        background-image: radial-gradient(circle at 50% 100%, ${theme.aguaMedio} 35%, transparent 36%);
        background-size: 90px 45px;
        animation: waveMove 12s linear infinite reverse;
    }
    .wave3 {
        bottom: 40px; opacity: 0.2;
        background-image: radial-gradient(circle at 50% 100%, ${theme.aguaClaro} 45%, transparent 46%);
        background-size: 120px 60px;
        animation: waveMove 15s linear infinite;
    }
    @keyframes waveMove {
        0% { transform: translateX(0) scaleY(1); }
        50% { transform: translateX(-25%) scaleY(1.1); }
        100% { transform: translateX(-50%) scaleY(1); }
    }
    
    /* Meta (Ajustada posición) */
    .finish-line {
        position: absolute; right: 20%; /* Más a la izquierda para dar espacio */
        top: 0; bottom: 0; width: 8px;
        background: repeating-linear-gradient(45deg, ${theme.meta}, ${theme.meta} 10px, #fff 10px, #fff 20px);
        z-index: 1; opacity: 0.8;
        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    }
    .finish-flag {
        position: absolute; top: -10px; right: -40px;
        background: #fff; border: 2px solid ${theme.meta}; color: ${theme.meta};
        font-weight: 900; font-size: 14px; padding: 6px 12px; border-radius: 4px;
        z-index: 2; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transform: rotate(5deg);
    }

    /* Carriles */
    .lane { position: relative; height: 140px; width: 100%; z-index: 2; }
    .label-tag {
        position: absolute; left: 10px; top: 10px;
        background: rgba(255,255,255,0.95); padding: 6px 12px;
        border-radius: 12px; font-size: 12px; font-weight: 700; z-index: 10;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    .sync { color: ${theme.azul}; border: 2px solid ${theme.azul}; }
    .solo { color: ${theme.grisOscuro}; border: 2px solid ${theme.gris}; }

    /* Contenedor del bote */
    .boat-wrapper {
        position: absolute; bottom: 0; width: 45%;
        transform-origin: bottom center; will-change: transform, opacity;
    }
    .boat-svg { width: 100%; overflow: visible; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.2)); }

    /* --- ANIMACIÓN BOTE RÁPIDO (CRUZA LA META) --- */
    .fast-boat {
        left: -15%;
        animation: raceFast ${DUR}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
    }
    
    @keyframes raceFast {
        0%   { transform: translateX(0) scale(${SCALE}); opacity: 1; }
        /* Cruza la meta (aprox al 65%) llegando hasta el 150% de distancia */
        65%  { transform: translateX(150%) scale(${SCALE}); opacity: 1; } 
        /* Se queda celebrando post-meta */
        85%  { transform: translateX(155%) scale(${SCALE}); opacity: 1; } 
        /* Desvanece */
        95%  { transform: translateX(160%) scale(${SCALE}); opacity: 0; } 
        /* Reset */
        100% { transform: translateX(0) scale(${SCALE}); opacity: 0; }     
    }

    /* --- ANIMACIÓN BOTE LENTO --- */
    .slow-boat {
        left: -15%;
        animation: raceSlow ${DUR}s ease-out infinite;
    }
    @keyframes raceSlow {
        0%   { transform: translateX(0) scale(${SCALE}); opacity: 1; }
        60%  { transform: translateX(35%) scale(${SCALE}); opacity: 1; }
        85%  { transform: translateX(38%) scale(${SCALE}); opacity: 1; }
        95%  { transform: translateX(38%) scale(${SCALE}); opacity: 0; }
        100% { transform: translateX(0) scale(${SCALE}); opacity: 0; }
    }

    /* --- ANIMACIONES REMEROS (Igual que antes) --- */
    .rower-anim { transform-origin: 0 0; animation: bodyRow 1.2s ease-in-out infinite; }
    .arm-anim { transform-origin: 0 -45px; animation: oarRow 1.2s ease-in-out infinite; }
    .rower-idle { transform: rotate(-5deg); transition: transform 0.5s; }
    @keyframes bodyRow {
        0%, 45%, 100% { transform: rotate(12deg); } 65% { transform: rotate(-12deg); }
    }
    @keyframes oarRow {
        0%, 45% { transform: rotate(-25deg); } 65% { transform: rotate(15deg); } 100% { transform: rotate(-25deg); }
    }

    @media (max-width: 720px){ .boat-wrapper { width: 85%; left: -10%; } .finish-line{ right: 5%; } }
  `;
}

export default TeamWorkMiniAnim;