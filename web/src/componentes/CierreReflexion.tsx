import React from "react";

type Props = {
  onContinue?: () => void;
  theme?: any; // Mantenemos theme por compatibilidad, aunque usaremos uno interno si falta
};

const defaultTheme = {
  azul: "#1976D2",
  naranja: "#E65100",
  morado: "#7B1FA2",
  texto: "#0B1B3F",
  blanco: "#FFFFFF",
  border: "#E3E8EF",
  shadow: "0 16px 36px rgba(16,24,40,.14)",
};

const GroupReflexion: React.FC<Props> = ({ onContinue }) => {
  
  // Estilos base
  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    borderRadius: 20,
    background: defaultTheme.blanco,
    border: `1px solid ${defaultTheme.border}`,
    boxShadow: defaultTheme.shadow,
    padding: "clamp(16px, 4vw, 32px)",
    textAlign: "center",
    boxSizing: "border-box",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: 900,
    color: defaultTheme.azul,
    margin: "0 0 8px 0",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#556",
    marginBottom: "24px",
  };

  // Estilo para las tarjetas de preguntas
  const questionCardStyle = (bgColor: string, borderColor: string): React.CSSProperties => ({
    background: bgColor,
    borderLeft: `6px solid ${borderColor}`,
    borderRadius: "12px",
    padding: "16px",
    textAlign: "left",
    marginBottom: "16px",
  });

  const questionTitle: React.CSSProperties = {
    fontWeight: 800,
    fontSize: "18px",
    marginBottom: "4px",
    display: "block",
  };

  const questionText: React.CSSProperties = {
    margin: 0,
    fontSize: "15px",
    color: "#334",
    lineHeight: 1.5,
  };

  const btnStyle: React.CSSProperties = {
    marginTop: "24px",
    padding: "14px 28px",
    borderRadius: "99px",
    border: "none",
    background: defaultTheme.azul,
    color: "#fff",
    fontWeight: 800,
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
    transition: "transform 0.1s ease",
  };

  return (
    <div style={{ padding: 12, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Reflexión Final de Equipo</h2>
        <p style={subtitleStyle}>Antes de terminar, tómense 1 minuto para conversar:</p>

        {/* Pregunta 1: Lo bueno */}
        <div style={questionCardStyle("#E3F2FD", defaultTheme.azul)}>
          <span style={{ ...questionTitle, color: defaultTheme.azul }}>1. ¿Qué salió bien? 🚀</span>
          <p style={questionText}>
            Mencionen una cosa que lograron coordinar perfectamente o una idea que les gustó mucho.
          </p>
        </div>

        {/* Pregunta 2: La mejora */}
        <div style={questionCardStyle("#FFF3E0", defaultTheme.naranja)}>
          <span style={{ ...questionTitle, color: defaultTheme.naranja }}>2. ¿Qué harían distinto? 🔧</span>
          <p style={questionText}>
            Si tuvieran que repetir el desafío mañana, ¿qué cambiarían en su forma de trabajar?
          </p>
        </div>

        {/* Pregunta 3: Agradecimiento */}
        <div style={questionCardStyle("#F3E5F5", defaultTheme.morado)}>
          <span style={{ ...questionTitle, color: defaultTheme.morado }}>3. Agradecimientos 🤝</span>
          <p style={questionText}>
            Dense las gracias por el esfuerzo. ¡El emprendimiento es un deporte de equipo!
          </p>
        </div>

        <div style={{ marginTop: "32px" }}>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
            ¿Listos? Ahora cada uno escaneará el QR individualmente para cerrar.
          </p>
          <button 
            style={btnStyle} 
            onClick={onContinue}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Ir al QR Final →
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupReflexion;