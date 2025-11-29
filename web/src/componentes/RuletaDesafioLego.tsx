import React, { useState } from 'react';
import RuletaEquipos from './RuletaEquipos';

// Definimos el tema aquí para evitar errores de importación
const theme = {
  rosa: "#E91E63",
  azul: "#1976D2",
  verde: "#2E7D32",
  morado: "#7C4DFF",
  texto: "#0D47A1",
  border: "#E3E8EF",
};

export type RouletteItem = {
    id: string;
    label: string;
    desc: string;
    delta: number;
    type: 'ventaja' | 'neutral' | 'desventaja';
    weight: number;
    color: string;
};

type Props = {
    onClose: () => void;
    esProfesor: boolean;
    onTokenChange?: (delta: number) => void;
    items: RouletteItem[];
    maxSpins: number;     // Límite configurado
    teamName?: string;    // Nombre del equipo para guardar progreso
};

const Btn = ({ label, onClick, disabled, full, style }: any) => (
  <button onClick={onClick} disabled={disabled} style={{
      padding: "12px 24px", borderRadius: 99,
      background: disabled ? "#ccc" : "#1976D2", color: "#fff",
      border: "none", fontWeight: "bold", cursor: disabled ? "not-allowed" : "pointer",
      width: full ? "100%" : "auto", boxShadow: disabled ? "none" : "0 4px 10px rgba(0,0,0,0.15)",
      ...style
    }}
  >
    {label}
  </button>
);

const RuletaDesafioLego: React.FC<Props> = ({ onClose, esProfesor, onTokenChange, items, maxSpins, teamName }) => {
    const [resultado, setResultado] = useState<RouletteItem | null>(null);
    const [girando, setGirando] = useState(false);
    const [rotation, setRotation] = useState(0);
    
    // Persistencia de intentos por equipo
    const storageKey = `spin_count_${teamName || 'default'}`;
    const [spinsUsed, setSpinsUsed] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? parseInt(saved, 10) : 0;
        } catch { return 0; }
    });

    const totalWeight = items.reduce((acc, item) => acc + (Number(item.weight) || 0), 0);

    const pickWeightedIndex = () => {
        let random = Math.random() * totalWeight;
        for (let i = 0; i < items.length; i++) {
            if (random < (items[i].weight || 1)) return i;
            random -= (items[i].weight || 1);
        }
        return 0;
    };

    const handleGiro = () => {
        if (spinsUsed >= maxSpins && !esProfesor) return;

        setGirando(true);
        setResultado(null);
        
        const winningIndex = pickWeightedIndex();
        const ganador = items[winningIndex];

        // Cálculo de rotación visual exacta para alinear el segmento ganador arriba (270deg)
        const segmentAngle = 360 / items.length;
        // Offset aleatorio para que no caiga siempre en el centro exacto del segmento
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.6); 
        const spins = 5 + Math.floor(Math.random() * 3); // Vueltas completas
        
        // Nota: 270 es la posición "Norte/Arriba" en CSS rotate.
        // El SVG dibuja desde 0° (derecha).
        // Target = Ángulo necesario para que el centro del segmento ganador quede en 270°
        const targetAngleForSegment = 270 - (winningIndex * segmentAngle) - (segmentAngle / 2);
        
        const currentMod = rotation % 360;
        // Calculamos la distancia positiva para llegar al target
        const distance = (360 * spins) + (targetAngleForSegment - currentMod);
        
        // Ajuste: Asegurar que siempre sumamos grados positivos para girar a la derecha (horario)
        const finalRotation = rotation + distance + randomOffset + 360; // +360 extra buffer

        setRotation(finalRotation);
        
        if (!esProfesor) {
            const newCount = spinsUsed + 1;
            setSpinsUsed(newCount);
            localStorage.setItem(storageKey, String(newCount));
        }

        setTimeout(() => {
            setResultado(ganador);
            setGirando(false);
            if (ganador.delta !== 0 && onTokenChange) {
                onTokenChange(ganador.delta);
            }
        }, 4000);
    };

    const spinsLeft = Math.max(0, maxSpins - spinsUsed);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: '1000px', maxWidth: '95vw', background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                
                {/* Header */}
                <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <h2 style={{ margin: 0, color: '#E91E63', fontSize: 28 }}>🎲 Desafío LEGO (Opcional)</h2>
                    <p style={{ margin: '5px 0 0', color: '#666' }}>Gira la ruleta para obtener una ventaja o un reto.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', flex: 1 }}>
                    
                    {/* COLUMNA IZQ: RULETA */}
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', borderRight: '1px solid #eee', position: 'relative' }}>
                        
                        {/* Flecha Indicadora (Estática) */}
                        <div style={{ position: 'absolute', top: 35, zIndex: 20, width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '30px solid #333', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}></div>

                        {/* Contenedor Giratorio */}
                        <div style={{ width: 340, height: 340, margin: '20px 0', position: 'relative' }}>
                            <div style={{ width: '100%', height: '100%', transition: 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)', transform: `rotate(${rotation}deg)` }}>
                                 <RuletaEquipos 
                                     segmentos={items.map(d => d.label)} 
                                     esProfesor={false} 
                                     onFinalizarGiro={()=>{}} 
                                     simpleMode={true} // IMPORTANTE: Modo limpio
                                 />
                            </div>
                        </div>
                        
                        {/* Botonera */}
                        <div style={{ marginTop: 20, zIndex: 20, textAlign:'center' }}>
                             {!resultado ? (
                                 <>
                                    <div style={{marginBottom: 10, fontWeight: 800, color: spinsLeft > 0 ? theme.azul : 'red'}}>
                                        {esProfesor ? "Modo Profesor (Giros ilimitados)" : `Intentos restantes: ${spinsLeft}/${maxSpins}`}
                                    </div>
                                    <Btn
                                        label={girando ? "Girando..." : spinsLeft > 0 || esProfesor ? "🎲 TIRAR AHORA" : "Sin intentos"}
                                        onClick={() => { if (!girando) handleGiro(); }}
                                        disabled={girando || (spinsLeft <= 0 && !esProfesor)}
                                        style={{ fontSize: 18, padding: "14px 40px", background: (spinsLeft > 0 || esProfesor) && !girando ? "#E91E63" : "#90A4AE" }}
                                    />
                                 </>
                             ) : (
                                 <div style={{textAlign:'center', animation:'popIn 0.5s'}}>
                                     <div style={{fontSize:14, textTransform:'uppercase', color:'#888', fontWeight:'bold', marginBottom:4}}>Resultado:</div>
                                     <div style={{fontSize:24, color: resultado.color, fontWeight:900, background:'#fff', padding:'10px 20px', borderRadius:12, border:`3px solid ${resultado.color}`, boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
                                         {resultado.label}
                                     </div>
                                     {(spinsLeft > 0 || esProfesor) && (
                                        <button onClick={() => setResultado(null)} style={{marginTop: 10, background:'transparent', border:'none', color:'#1976D2', textDecoration:'underline', cursor:'pointer'}}>
                                            Girar de nuevo ({spinsLeft} restantes)
                                        </button>
                                     )}
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* COLUMNA DER: TABLA */}
                    <div style={{ padding: 20, overflowY: 'auto', maxHeight: '60vh' }}>
                        <h4 style={{ marginTop: 0, color: '#1976D2', textAlign:'center', borderBottom:'2px solid #E3F2FD', paddingBottom: 10 }}>Tabla de Oportunidades</h4>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {items.map((item, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr auto', gap: 12, alignItems: 'center', padding: '12px', borderRadius: 10, background: resultado?.id === item.id ? '#FFF8E1' : '#fff', border: resultado?.id === item.id ? `2px solid ${item.color}` : '1px solid #f0f0f0', opacity: resultado && resultado.id !== item.id ? 0.4 : 1, transition: 'all 0.3s' }}>
                                    <div style={{ fontWeight: 900, color: item.color, fontSize: 16, textAlign:'center', background: item.color+'15', padding:'4px', borderRadius:6 }}>{item.delta > 0 ? `+${item.delta}` : item.delta}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{item.label}</div>
                                        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{item.desc}</div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#999', background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{Math.round((item.weight / totalWeight) * 100)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ padding: 15, borderTop: '1px solid #eee', textAlign: 'center', background: '#fff' }}>
                    <Btn label="Cerrar y Volver" onClick={onClose} full={false} style={{ background: '#546E7A' }} />
                </div>
            </div>
            <style>{`@keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
};

export default RuletaDesafioLego;