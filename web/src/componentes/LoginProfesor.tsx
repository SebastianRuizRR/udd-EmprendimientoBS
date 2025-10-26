import React, { useState } from "react";
import type { ProfAuth } from "../api";

type Props = {
  onSuccess: (auth: ProfAuth) => void;
  onCancel: () => void;
};

const theme = {
  azul: "#1976D2",
  rosa: "#E91E63",
  amarillo: "#FFEB3B",
  texto: "#0D47A1",
  border: "#E3E8EF",
  blanco: "#FFFFFF",
  shadow: "0 16px 36px rgba(16,24,40,.14)",
};

const baseInput: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
  maxWidth: "100%",
  background: theme.blanco,
};

export default function LoginProfesor({ onSuccess, onCancel }: Props) {
  const [user, setUser] = useState("1");
  const [pass, setPass] = useState("1");
  const [err, setErr] = useState("");

  return (
    <div
      style={{
        width: "clamp(320px,92vw,520px)",
        background: "rgba(255,255,255,0.96)",
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: 24,
        textAlign: "center",
        backdropFilter: "blur(2px)",
        position: "relative",
        zIndex: 3,
        margin: "12px auto",
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 8, fontSize: 26, fontWeight: 900, color: theme.rosa }}>
        Acceso Profesor
      </h2>
      <p style={{ marginTop: 0, marginBottom: 16, color: theme.azul }}>Ingresa tus credenciales</p>

      <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
        <input
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={baseInput}
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={baseInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (user && pass) onSuccess({ user, pass });
              else setErr("Completa usuario y contraseña");
            }
          }}
        />
        {err && <div style={{ color: "#D32F2F", fontWeight: 700, fontSize: 13 }}>{err}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "none",
              background: theme.amarillo,
              color: theme.texto,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ⬅ Volver
          </button>

          <button
            onClick={() => {
              if (user && pass) onSuccess({ user, pass });
              else setErr("Completa usuario y contraseña");
            }}
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "none",
              background: theme.azul,
              color: theme.blanco,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}
