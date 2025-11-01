// componentes/PreSalaProfesor.tsx
import React, { useState } from "react";

type Alumno = { nombre: string; carrera: string };

type Props = {
  theme: any;
  onElegirModo: (modo: "aleatorio" | "manual", lista?: Alumno[]) => void;
  onCancelar: () => void;

  // NUEVO: lo pasa el padre (App) para crear la sala realmente
  generateCode: (len?: number) => string;
  publishFlow: (patch: any) => void;
};

export default function PreSalaProfesor({
  theme,
  onElegirModo,
  onCancelar,
  generateCode,
  publishFlow,
}: Props) {
  const [modo, setModo] = useState<"aleatorio" | "manual" | null>(null);
  const [equiposQty, setEquiposQty] = useState<number>(4);
  const [roomPreview, setRoomPreview] = useState<string>("");

  const baseInput: React.CSSProperties = {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${theme?.border || "#E3E8EF"}`,
    boxSizing: "border-box",
    background: "#fff",
  };

  const crearSala = () => {
    const code = roomPreview || generateCode(5);
    const qty = Math.max(1, Number(equiposQty) || 4);

    // Publica en el flujo compartido (App/useSharedFlow)
    publishFlow({
      roomCode: code.toUpperCase(),
      expectedTeams: qty,
      step: "lobby",
      running: false,
    });
  };

  return (
    <div
      style={{
        width: "clamp(320px,92vw,680px)",
        background: "rgba(255,255,255,.96)",
        border: `1px solid ${theme?.border || "#E3E8EF"}`,
        borderRadius: 20,
        padding: 24,
        boxShadow: theme?.shadow || "0 16px 36px rgba(16,24,40,.14)",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 26,
          fontWeight: 900,
          color: theme?.rosa || "#E91E63",
        }}
      >
        Pre-sala (Profesor)
      </h2>
      <p style={{ marginTop: 0, color: theme?.azul || "#1976D2" }}>
        Elige cómo formar los equipos y crea la sala.
      </p>

      {/* Config básica de la sala */}
      <div style={{ display: "grid", gap: 10, marginTop: 8, textAlign: "left" }}>
        <label style={{ fontWeight: 800, color: theme?.azul || "#1976D2" }}>
          Cantidad de equipos esperados
        </label>
        <input
          type="number"
          min={1}
          value={equiposQty}
          onChange={(e) => setEquiposQty(Number(e.target.value))}
          style={baseInput}
        />

        <label style={{ fontWeight: 800, color: theme?.azul || "#1976D2" }}>
          Código de sala (opcional, deja vacío para generar uno)
        </label>
        <input
          placeholder="Ej: UDD42 (opcional)"
          value={roomPreview}
          onChange={(e) => setRoomPreview(e.target.value.toUpperCase())}
          style={baseInput}
        />
      </div>

      {/* Selección de modo */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 16,
        }}
      >
        <button
          onClick={() => {
            setModo("aleatorio");
            onElegirModo("aleatorio");
          }}
          style={{
            padding: "12px 16px",
            borderRadius: 14,
            border: "none",
            background: theme?.azul || "#1976D2",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Formar equipos aleatoriamente
        </button>

        <button
          onClick={() => {
            setModo("manual");
            onElegirModo("manual", []);
          }}
          style={{
            padding: "12px 16px",
            borderRadius: 14,
            border: `2px solid ${theme?.azul || "#1976D2"}`,
            background: "transparent",
            color: theme?.azul || "#1976D2",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Cargar Excel / Manual
        </button>
      </div>

      {modo === "manual" && (
        <div style={{ marginTop: 16, textAlign: "left" }}>
          <div
            style={{
              fontWeight: 800,
              color: theme?.azul || "#1976D2",
              marginBottom: 6,
            }}
          >
            (Opcional) Vista previa de alumnos
          </div>
          <input
            placeholder="Aquí podrías listar alumnos cargados…"
            style={baseInput}
            disabled
          />
        </div>
      )}

      {/* Acciones finales */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
          marginTop: 18,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onCancelar}
          style={{
            padding: "12px 16px",
            borderRadius: 14,
            border: "none",
            background: theme?.amarillo || "#FFEB3B",
            color: theme?.texto || "#0D47A1",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          ⬅ Volver
        </button>

        <button
          onClick={crearSala}
          style={{
            padding: "12px 16px",
            borderRadius: 14,
            border: "none",
            background: theme?.rosa || "#E91E63",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: theme?.shadow || "0 10px 24px rgba(16,24,40,.18)",
          }}
        >
          Crear sala ▶
        </button>
      </div>
    </div>
  );
}
