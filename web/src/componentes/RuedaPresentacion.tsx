import React, { useEffect, useState, useRef } from "react";
import { FlowState } from "../componentes/flow"; // Ajusta la ruta si es necesario

// Paleta de colores para la ruleta
const COLORS = [
  "#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#00BCD4", 
  "#4CAF50", "#8BC34A", "#FFC107", "#FF9800", "#FF5722", 
  "#795548", "#607D8B"
];

interface Props {
  flujo: FlowState;
  equiposTotal: string[];
  publicar: (update: Partial<FlowState>) => void;
  setStep: (step: any) => void;
  resetTimer: (sec: number) => void;
  isProfesor: boolean;
}

export default function RuedaPresentacion({
  flujo,
  publicar,
  setStep,
  resetTimer,
  isProfesor,
}: Props) {
  // Estado local derivado del flujo (sincronizado)
  const w = flujo.wheel || { segments: [], remaining: [], picked: [], angulo: 0, girando: false };
  const segments = w.remaining && w.remaining.length > 0 ? w.remaining : ["¡Fin!"];
  
  // --- LÓGICA DE GIRO (Solo Profesor) ---
  const handleSpin = () => {
    if (!isProfesor || w.girando || segments.length <= 1) return;

    // 1. Calcular ganador y ángulo al azar
    const newRounds = 5 + Math.floor(Math.random() * 3); // Entre 5 y 8 vueltas completas
    const randomSegment = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    
    // El ángulo final debe apuntar al ganador (ajustando el offset)
    const winnerIndex = randomSegment;
    // IMPORTANTE: Sumamos al ángulo actual para que siga girando, no se resetee
    const finalAngle = (w.angulo || 0) + (newRounds * 360) + (360 - (winnerIndex * segmentAngle)) + (Math.random() * 20);

    // 2. PUBLICAR ESTADO "GIRANDO" (Todos ven esto)
    publicar({
      wheel: {
        ...w,
        girando: true,
        angulo: finalAngle, // Enviamos el destino final
        lastWinner: null
      }
    });

    // 3. FINALIZAR GIRO (Después de 4.5 seg)
    setTimeout(() => {
      const winnerName = segments[winnerIndex];
      const nextRemaining = segments.filter(s => s !== winnerName);
      const nextPicked = [...(w.picked || []), winnerName];

      publicar({
        wheel: {
          ...w,
          segments: w.segments, // Mantenemos el original
          remaining: nextRemaining,
          picked: nextPicked,
          lastWinner: winnerName,
          girando: false,
          angulo: finalAngle
        },
        // Actualizamos el orden oficial del juego también
        presentOrder: nextPicked
      });
    }, 4500);
  };

  // --- BOTÓN PARA IR AL PITCH (Solo aparece si hay ganador) ---
  const handleGoToPitch = () => {
    if (w.lastWinner) {
      const idx = (w.picked?.length || 1) - 1;
      publicar({ currentIdx: idx });
      resetTimer(flujo.pitchSeconds || 90);
      setStep("f4_present");
    }
  };

  return (
    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      boxSizing: "border-box",
      overflow: "hidden" 
    }}>
      <h2 style={{ color: "#1976D2", textAlign: "center", marginBottom: 10, fontSize: "24px" }}>
        {w.girando ? "¡Girando! 🎰" : w.lastWinner ? `¡Turno de: ${w.lastWinner}!` : "Sorteo de Orden"}
      </h2>

      {/* --- CONTENEDOR DE LA RUEDA (RESPONSIVE) --- */}
      <div style={{
        position: "relative",
        width: "300px",        // <--- TAMAÑO FIJO MÁS PEQUEÑO Y CONTROLADO
        height: "300px",       // <--- CUADRADO PERFECTO
        margin: "0 auto 20px"
      }}>
        {/* FLECHA INDICADORA */}
        <div style={{
          position: "absolute",
          top: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0, 
          height: 0, 
          borderLeft: "15px solid transparent",
          borderRight: "15px solid transparent",
          borderTop: "25px solid #333",
          zIndex: 10,
          filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.3))"
        }} />

        {/* EL CÍRCULO GIRATORIO */}
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: "8px solid #333",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          // TRANSICIÓN FORZADA: Siempre anima la rotación si cambia el ángulo
          transition: "transform 4.5s cubic-bezier(0.25, 0.1, 0.25, 1)", 
          transform: `rotate(${w.angulo || 0}deg)`, // <--- AQUÍ OCURRE LA MAGIA SINCRONIZADA
          background: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}>
          {/* FONDO CONIC GRADIENT (Mejor solución visual para los quesitos) */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -2,
            background: `conic-gradient(
              ${segments.map((_, i) => `${COLORS[i % COLORS.length]} ${(i / segments.length) * 100}% ${((i + 1) / segments.length) * 100}%`).join(", ")}
            )`
          }} />

          {/* TEXTOS */}
          {segments.map((seg: string, i: number) => {
             const angle = 360 / segments.length;
             const rotation = (angle * i) + (angle / 2); // Centro del gajo
             return (
               <div key={i} style={{
                 position: "absolute",
                 top: "50%", left: "50%",
                 width: "45%", // No llegar al borde
                 height: "20px",
                 transformOrigin: "center left",
                 // Ajuste matemático para centrar el texto en el gajo
                 transform: `translateY(-50%) rotate(${rotation - 90}deg) translateX(10px)`, 
                 textAlign: "right",
                 color: "#fff",
                 fontWeight: "bold",
                 textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                 fontSize: segments.length > 8 ? "12px" : "14px",
                 whiteSpace: "nowrap",
                 overflow: "hidden",
                 textOverflow: "ellipsis"
               }}>
                 {seg}
               </div>
             )
          })}
        </div>
        
        {/* CENTRO DE LA RUEDA (Decorativo) */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "40px", height: "40px", background: "#fff", borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)", border: "4px solid #1976D2", zIndex: 5
        }} />
      </div>

      {/* --- CONTROLES (Solo Profesor) --- */}
      {isProfesor && (
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button 
            onClick={handleSpin} 
            disabled={w.girando || segments.length <= 1}
            style={{
              padding: "12px 24px",
              fontSize: "18px",
              fontWeight: "bold",
              background: w.girando ? "#ccc" : "#E91E63",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: w.girando ? "wait" : "pointer",
              boxShadow: "0 4px 0 #AD1457"
            }}
          >
            {w.girando ? "Girando..." : "¡GIRAR!"}
          </button>

          {w.lastWinner && !w.girando && (
            <button 
              onClick={handleGoToPitch} 
              style={{
                padding: "12px 24px",
                fontSize: "18px",
                fontWeight: "bold",
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #2E7D32",
                animation: "pulse 1s infinite"
              }}
            >
              Ir al Pitch ▶
            </button>
          )}
        </div>
      )}

      {/* --- MENSAJE PARA ALUMNOS --- */}
      {!isProfesor && (
        <div style={{ marginTop: 10, color: "#666", fontStyle: "italic", fontSize: "16px" }}>
          {w.girando ? "¡Atentos a la pantalla!" : "Esperando al profesor..."}
        </div>
      )}

      {/* --- LISTA DE GANADORES (Orden) --- */}
      {w.picked && w.picked.length > 0 && (
        <div style={{ marginTop: 20, width: "100%", maxWidth: "400px", background: "#f0f0f0", padding: 15, borderRadius: 10 }}>
            <h4 style={{margin: "0 0 10px 0", color: "#333"}}>Orden Definido:</h4>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
                {w.picked.map((team: string, i: number) => (
                    <li key={i} style={{fontWeight: "bold", marginBottom: 5}}>{team}</li>
                ))}
            </ol>
        </div>
      )}
    </div>
  );
}