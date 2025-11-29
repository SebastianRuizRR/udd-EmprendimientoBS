import React from "react";
import RuletaEquipos from "./RuletaEquipos";
import { Btn, Card } from "./Ui"; 

// --- DEFINICIÓN COMPLETA DE PROPS ---
type Props = {
  flujo: any;
  equiposTotal?: string[];
  isProfesor?: boolean;
  
  // Estas son las funciones críticas que faltaban
  publicar?: (data: any) => void;
  setStep?: (step: any, seconds?: number) => void;
  resetTimer?: (seconds: number) => void;
  
  // Props visuales y de estado
  segmentos?: string[]; 
  pistaGanador?: string | null;
  onFinalizarGiro?: (ganador: string) => void;
  angulo?: number;
  girando?: boolean;
  setAngulo?: (a: number) => void;
  setGirando?: (b: boolean) => void;
};

export const initializeWheelState = (teams: string[]) => ({
    angulo: 0,
    girando: false,
    segments: teams,
    remaining: teams,
    picked: [],
    lastWinner: null,
});

export default function RuedaPresentacion({
  flujo,
  equiposTotal = [], 
  isProfesor,
  publicar,
  setStep,
  resetTimer
}: Props) {
  
  const wheelState = flujo.wheel || initializeWheelState(equiposTotal);

  React.useEffect(() => {
    if (wheelState.segments.length !== equiposTotal.length || wheelState.segments.some((t: string, i: number) => t !== equiposTotal[i])) {
       publicar?.({ wheel: initializeWheelState(equiposTotal) });
    }
  }, [equiposTotal.length, wheelState.segments, publicar, equiposTotal]);

  const handleFinalizarGiro = (ganador: string) => {
    const nuevosRestantes = wheelState.remaining.filter((t: string) => t !== ganador);
    const nuevosElegidos = [...wheelState.picked, ganador];

    const nextWheel = {
        ...wheelState,
        girando: false, 
        remaining: nuevosRestantes,
        picked: nuevosElegidos,
        lastWinner: ganador
    };

    if (nuevosRestantes.length === 0) {
       publicar?.({ 
         wheel: nextWheel,
         presentOrder: nuevosElegidos, 
         currentIdx: 0 
       });
       resetTimer?.(flujo.pitchSeconds || 90);
       setStep?.("f4_present", flujo.pitchSeconds || 90);

    } else {
        publicar?.({ wheel: nextWheel });
    }
  };

  const setAngulo = (a: number) => publicar?.({ wheel: { ...wheelState, angulo: a } });
  const setGirando = (b: boolean) => publicar?.({ wheel: { ...wheelState, girando: b } });
  
  const elegirUltimo = () => {
    if (isProfesor && wheelState.remaining.length === 1) {
      handleFinalizarGiro(wheelState.remaining[0]);
    }
  };

  return (
    <Card
      title="Fase 4 — Orden de Presentación"
      subtitle={isProfesor ? "Gira la ruleta para definir quién pasa al escenario" : "Esperando al profesor para definir el orden"}
      width={900}
    >
      <div style={{ display: "grid", gap: 24, justifyItems: "center" }}>
        
        <RuletaEquipos
          segmentos={wheelState.remaining} 
          esProfesor={isProfesor} 
          pistaGanador={wheelState.lastWinner}
          onFinalizarGiro={handleFinalizarGiro} 
          angulo={wheelState.angulo}
          girando={wheelState.girando}
          setAngulo={setAngulo}   
          setGirando={setGirando} 
        />
        
        {isProfesor && wheelState.remaining.length === 1 && (
          <div style={{marginTop: -10}}>
            <Btn 
              label={`Elegir automáticamente a ${wheelState.remaining[0]}`}
              onClick={elegirUltimo}
              disabled={wheelState.girando}
            />
          </div>
        )}

        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "left" }}>
          <div style={{ padding: 12, background: "#F8F9FA", borderRadius: 12, border: "1px dashed #ccc" }}>
             <div style={{fontWeight: "bold", marginBottom: 8, color: "#666"}}>Por elegir ({wheelState.remaining.length})</div>
             <div style={{fontSize: 14}}>
               {wheelState.remaining.length > 0 ? wheelState.remaining.join(", ") : "¡Todos seleccionados!"}
             </div>
          </div>

          <div style={{ padding: 12, background: "#E3F2FD", borderRadius: 12, border: "1px solid #90CAF9" }}>
             <div style={{fontWeight: "bold", marginBottom: 8, color: "#1565C0"}}>Orden Oficial</div>
             <ol style={{margin: 0, paddingLeft: 20, fontWeight: 600}}>
               {wheelState.picked.map((t: string, i: number) => (
                 <li key={t} style={{marginBottom: 4}}>
                    <span style={{fontWeight: 900, marginRight: 5, color: "#E91E63"}}>{i+1}.</span>{t}
                </li>
               ))}
             </ol>
          </div>
        </div>

        {isProfesor && (
            <div style={{ width: "100%", borderTop: "1px solid #eee", paddingTop: 20 }}>
            <Btn
                label="Confirmar Orden e Iniciar Pitch ▶"
                disabled={wheelState.remaining.length > 0 || wheelState.girando} 
                onClick={() => {
                    if (wheelState.remaining.length === 0) {
                        resetTimer?.(flujo.pitchSeconds || 90);
                        setStep?.("f4_present", flujo.pitchSeconds || 90);
                    }
                }}
                full
            />
            {wheelState.remaining.length > 0 && (
                <p style={{fontSize: 12, color: "#E91E63", marginTop: 8}}>
                * Debes sortear a todos los equipos antes de continuar.
                </p>
            )}
            </div>
        )}
      </div>
    </Card>
  );
}