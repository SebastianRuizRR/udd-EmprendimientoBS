// web/src/componentes/RuletaEquipos.tsx
import React from "react";

// 1. Agregamos las nuevas props aquí
type Props = {
  segmentos: string[];
  esProfesor?: boolean;
  pistaGanador?: string | null;
  onFinalizarGiro?: (ganador: string) => void;
  simpleMode?: boolean;
  
  // Estas son las que faltaban y causan el error:
  angulo?: number;
  girando?: boolean;
  setAngulo?: (a: number) => void;
  setGirando?: (b: boolean) => void;
};

const COLORES = ["#1976D2", "#E91E63", "#FFEB3B", "#00BCD4", "#9C27B0", "#4CAF50"];

function gradosPorSegmento(n: number) {
  return 360 / Math.max(1, n);
}

export default function RuletaEquipos({
  segmentos,
  esProfesor,
  pistaGanador,
  onFinalizarGiro,
  simpleMode = false,
  // 2. Las recibimos con alias
  angulo: anguloProp,
  girando: girandoProp,
  setAngulo: setAnguloProp,
  setGirando: setGirandoProp,
}: Props) {
  // Estado interno (fallback)
  const [anguloInterno, setAnguloInterno] = React.useState(0);
  const [girandoInterno, setGirandoInterno] = React.useState(false);
  const [ganador, setGanador] = React.useState<string | null>(pistaGanador || null);

  React.useEffect(() => {
    if (pistaGanador) setGanador(pistaGanador);
  }, [pistaGanador]);

  const lista = React.useMemo(() => (segmentos || []).filter(Boolean), [segmentos]);

  // 3. Lógica híbrida: usar prop del padre O estado interno
  const anguloActual = anguloProp !== undefined ? anguloProp : anguloInterno;
  const estaGirando = girandoProp !== undefined ? girandoProp : girandoInterno;

  const setAngulo = (val: number) => {
      if (setAnguloProp) setAnguloProp(val);
      else setAnguloInterno(val);
  };

  const setGirando = (val: boolean) => {
      if (setGirandoProp) setGirandoProp(val);
      else setGirandoInterno(val);
  };

  const radio = 180;
  const cx = 200, cy = 200;
  const dps = gradosPorSegmento(lista.length);

  const girar = () => {
    if (simpleMode || !esProfesor || estaGirando || lista.length === 0) return;
    setGanador(null);
    setGirando(true);
    
    const idx = Math.floor(Math.random() * lista.length);
    const centroSegmento = idx * dps + dps / 2;
    const ajusteFlecha = 90; 
    const vueltas = 5 + Math.floor(Math.random() * 3);
    const anguloObjetivo = 360 - centroSegmento + ajusteFlecha; 
    // Usamos el ángulo actual para calcular el destino
    const anguloFinal = anguloActual + (360 * vueltas) + (anguloObjetivo - (anguloActual % 360));

    setAngulo(anguloFinal);

    setTimeout(() => {
      const g = lista[idx];
      setGanador(g);
      setGirando(false);
      onFinalizarGiro?.(g);
    }, 4200);
  };

  const sectores = lista.map((etiqueta, i) => {
    const inicio = i * dps * (Math.PI / 180);
    const fin = (i + 1) * dps * (Math.PI / 180);
    const x1 = cx + radio * Math.cos(inicio);
    const y1 = cy + radio * Math.sin(inicio);
    const x2 = cx + radio * Math.cos(fin);
    const y2 = cy + radio * Math.sin(fin);
    const arcoGrande = dps > 180 ? 1 : 0;
    const color = COLORES[i % COLORES.length];

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radio} ${radio} 0 ${arcoGrande} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    const medio = (inicio + fin) / 2;
    const tx = cx + radio * 0.65 * Math.cos(medio);
    const ty = cy + radio * 0.65 * Math.sin(medio);

    return (
      <g key={i}>
        <path d={d} fill={color} stroke="#fff" strokeWidth={2} />
        <text
          x={tx} y={ty}
          textAnchor="middle" dominantBaseline="middle"
          style={{ 
            fontWeight: 800, 
            fill: "#fff", 
            fontSize: lista.length > 8 ? "10px" : "12px",
            textShadow: "0px 1px 2px rgba(0,0,0,0.5)"
          }}
          transform={`rotate(${medio * (180 / Math.PI) + 90}, ${tx}, ${ty})`}
        >
          {etiqueta}
        </text>
      </g>
    );
  });

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 16, width: '100%', height: '100%' }}>
      <div style={{ position: "relative", width: '100%', height: '100%', minWidth: 300, minHeight: 300 }}>
        {!simpleMode && (
          <div
            style={{
              position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0, zIndex: 10,
              borderLeft: "15px solid transparent", borderRight: "15px solid transparent",
              borderBottom: "25px solid #333",
            }}
          />
        )}
        
        <svg width="100%" height="100%" viewBox="0 0 400 400" style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,.15))" }}>
          <circle cx={cx} cy={cy} r={radio + 4} fill="#fff" stroke="#E3E8EF" strokeWidth={1} />
          <g style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${anguloActual}deg)`, // Usamos la variable unificada
              transition: estaGirando ? "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
            }}
          >
            {sectores}
          </g>
          <circle cx={cx} cy={cy} r={35} fill="#fff" stroke="#E3E8EF" strokeWidth={4} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: 900, fill: "#1976D2", fontSize: 14 }}>
            {estaGirando ? "..." : "UDD"}
          </text>
        </svg>
      </div>

      {!simpleMode && (
        esProfesor ? (
            <button onClick={girar} disabled={estaGirando || lista.length === 0}
                style={{ padding: "12px 24px", borderRadius: 99, background: estaGirando ? "#B0BEC5" : "#1976D2", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer" }}>
                {lista.length === 0 ? "¡Orden Completo!" : "🌀 Girar Ruleta"}
            </button>
        ) : (
            <div style={{ padding: "12px 20px", background: "#F1F5F9", borderRadius: 12, fontWeight: 700, color: "#334155" }}>
                {ganador ? <span>Ganador: {ganador}</span> : estaGirando ? "Girando..." : "Esperando..."}
            </div>
        )
      )}
    </div>
  );
}