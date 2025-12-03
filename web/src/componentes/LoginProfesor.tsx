import React, { useState } from "react";
import { ProfAuth, ProfAuthType } from "../api"; // Usamos la API real

type Props = {
  onSuccess: (auth: ProfAuthType) => void;
  onCancel: () => void;
};

export default function LoginProfesor({ onSuccess, onCancel }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Intentar Login con la API (Base de Datos)
      const ok = await ProfAuth.login(user, pass);
      
      if (ok) {
        // 2. Si la API dice SI, recuperamos los datos y entramos
        const authData = ProfAuth.getUser();
        if (authData) {
            onSuccess(authData);
        } else {
            setError("Error al recuperar datos de sesión.");
        }
      } else {
        // 3. Si la API dice NO, mostramos error
        setError("Credenciales incorrectas (Base de Datos)");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
      <h2 style={{ marginTop: 0, color: "#1976D2", textAlign: "center" }}>Iniciar Sesión</h2>
      <p style={{ textAlign: "center", color: "#666", fontSize: 14, marginBottom: 20 }}>
        Ingresa tus credenciales de profesor o administrador.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          autoFocus
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc", width: "100%", boxSizing: "border-box" }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc", width: "100%", boxSizing: "border-box" }}
        />
        
        {error && <div style={{ color: "red", fontSize: 13, fontWeight: "bold", textAlign: "center" }}>{error}</div>}
        
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "#ECEFF1", color: "#333", fontWeight: "bold", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "#1976D2", color: "#fff", fontWeight: "bold", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}