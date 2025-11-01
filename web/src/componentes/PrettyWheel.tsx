// src/componentes/PrettyWheel.tsx
import React from "react";

type Props = {
  segments: string[];                 // nombres de equipos (en el orden de dibujo, horario)
  isTeacher?: boolean;                // si true, muestra botón Girar
  onSpinEnd?: (winner: string, orderFromWinner: string[]) => void; // callback al terminar
  winnerHint?: string;                // ganador ya conocido (para vista alumno)
};

const COLORS = ["#1976D2", "#E91E63", "#FFEB3B", "#00BCD4", "#9C27B0", "#4CAF50"];

function degPerSeg(n: number) {
  return 360 / Math.max(1, n);
}

export default function PrettyWheel({ segments, isTeacher, onSpinEnd, winnerHint }: Props) {
  const [spinning, setSpinning] = React.useState(false);
  const [angle, setAngle] = React.useState(0);
  const [winner, setWinner] = React.useState<string | null>(winnerHint || null);

  // Si cambia el hint desde fuera (alumno), actualizar “winner”
  React.useEffect(() => {
    if (winnerHint) setWinner(winnerHint);
  }, [winnerHint]);

  const segs = React.useMemo(
    () => segments.filter(Boolean),
    [segments.join("|")]
  );

  const radius = 180;
  const cx = 200, cy = 200;
  const r = radius;

  const dps = degPerSeg(segs.length);

  const spin = () => {
    if (!isTeacher || spinning || segs.length === 0) return;
    setWinner(null);
    setSpinning(true);

    // Elegimos un segmento ganador
    const idx = Math.floor(Math.random() * segs.length);
    const centerDeg = idx * dps + dps / 2; // centro del segmento (0° a la derecha, positivo horario)
    // darle varias vueltas + caer en el centro del segmento
    const extraTurns = 5 + Math.floor(Math.random() * 3); // 5–7 vueltas
    const finalDeg = extraTurns * 360 + (360 - centerDeg); // 0° apunta a la derecha; el puntero está arriba

    // animación
    setAngle(prev => prev + finalDeg);

    // Al terminar la transición (~4s), fijamos ganador y orden
    setTimeout(() => {
      const w = segs[idx];
      setWinner(w);
      setSpinning(false);

      // Orden: ganador primero y luego los siguientes en sentido horario
      const order = [ ...segs.slice(idx), ...segs.slice(0, idx) ];
      onSpinEnd?.(w, order);
    }, 4200);
  };

  // Dibujo de sectores con SVG
  const sectors = segs.map((label, i) => {
    const start = i * dps * (Math.PI/180);
    const end   = (i+1) * dps * (Math.PI/180);

    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);

    const largeArc = dps > 180 ? 1 : 0;
    const color = COLORS[i % COLORS.length];

    // arco de sector
    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z"
    ].join(" ");

    // posición del texto (centro del sector)
    const mid = (start + end) / 2;
    const tx = cx + (r * 0.6) * Math.cos(mid);
    const ty = cy + (r * 0.6) * Math.sin(mid);

    return (
      <g key={i}>
        <path d={d} fill={color} stroke="#fff" strokeWidth={4} />
        <text
          x={tx}
          y={ty}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{fontWeight:800, fill:"#123", fontSize:"12px"}}
          transform={`rotate(${(mid*180/Math.PI) - 90}, ${tx}, ${ty})`}
        >
          {label}
        </text>
      </g>
    );
  });

  return (
    <div style={{display:"grid", justifyItems:"center", gap:12}}>
      {/* Puntero */}
      <div style={{width:0, height:0, borderLeft:"12px solid transparent", borderRight:"12px solid transparent",
        borderBottom:"18px solid #0D47A1", marginBottom:-8}} />

      <svg width={400} height={400} style={{filter:"drop-shadow(0 6px 12px rgba(0,0,0,.22))"}}>
        {/* fondo */}
        <circle cx={cx} cy={cy} r={r+10} fill="#F7F9FC" stroke="#E3E8EF" strokeWidth={6}/>
        {/* disco giratorio */}
        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${angle}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(.19,.77,.17,.99)" : undefined
          }}
        >
          {sectors}
        </g>
        {/* botón centro */}
        <circle cx={cx} cy={cy} r={40} fill="#fff" stroke="#E3E8EF" strokeWidth={3}/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          style={{fontWeight:900, fill:"#1976D2"}}>GIRAR</text>
      </svg>

      {isTeacher ? (
        <button
          onClick={spin}
          disabled={spinning || segs.length===0}
          style={{padding:"10px 14px", borderRadius:12, background:"#1976D2", color:"#fff",
            border:"none", fontWeight:800, cursor:spinning?"not-allowed":"pointer"}}
        >
          🌀 Girar ruleta
        </button>
      ) : (
        <div style={{opacity:.8, fontSize:13}}>
          {winner ? "Ganador: " : "Esperando giro… "}
          {winner && <b>{winner}</b>}
        </div>
      )}

      {!!winner && (
        <div style={{padding:"8px 12px", borderRadius:10, background:"#F1F5FF", border:"1px solid #E3E8EF"}}>
          <b>Ganador:</b> {winner}
        </div>
      )}
    </div>
  );
}
