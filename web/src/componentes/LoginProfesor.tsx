import React, { useState } from "react";
import { ProfAuth, ProfAuthType } from "../api"; 

type Props = {
  onSuccess: (auth: ProfAuthType) => void;
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
  marginBottom: 10
};

export default function LoginProfesor({ onSuccess, onCancel }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
      if (!user || !pass) {
          setErr("Completa todos los campos");
          return;
      }
      // La validación real ocurre en App.tsx
      onSuccess({ user, pass });
  };

  return (
    <div
      style={{
        width: "clamp(300px,90vw,480px)",
        background: "rgba(255,255,255,0.98)",
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: 30,
        textAlign: "center",
        position: "relative",
        zIndex: 3,
        margin: "12px auto",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: theme.rosa }}>
        Acceso Docente
      </h2>
      <p style={{ margin: "0 0 24px", color: theme.texto, opacity: 0.8 }}>Ingresa tus credenciales para gestionar la sala.</p>

      <div style={{ textAlign: "left" }}>
        <label style={{fontSize:12, fontWeight:700, color:'#666', marginLeft:4}}>USUARIO</label>
        <input
          placeholder="ej: prof.garcia"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={baseInput}
        />
        
        <label style={{fontSize:12, fontWeight:700, color:'#666', marginLeft:4}}>CONTRASEÑA</label>
        <input
          placeholder="••••••"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={baseInput}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        
        {err && <div style={{ color: "#D32F2F", fontWeight: 700, fontSize: 13, marginTop: 5, textAlign:'center' }}>{err}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 24 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "12px 20px", borderRadius: 14, border: "none",
              background: theme.amarillo, color: theme.texto, fontWeight: 800, cursor: "pointer",
            }}
          >
            ⬅ Volver
          </button>

          <button
            onClick={handleLogin}
            style={{
              padding: "12px 24px", borderRadius: 14, border: "none",
              background: theme.azul, color: theme.blanco, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(25,118,210,.2)"
            }}
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}