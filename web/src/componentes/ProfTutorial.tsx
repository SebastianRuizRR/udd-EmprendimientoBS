import React from "react";


const theme = {
  azul: "#0D6EFD",
  rosa: "#E91E63",
  amarillo: "#FFC107",
  textoLight: "#F7FAFF",
  texto: "#0B1220", 
};

// ** CONTENIDO DEL TUTORIAL ACTUALIZADO Y DETALLADO **
const pasos = [
  {
    titulo: "Mini Tutorial para Facilitadores UDD",
    contenido: [
      "Bienvenido al juego de Emprendimiento UDD. Este recorrido te muestra cómo usar la app para facilitar la experiencia a tus alumnos.",
      "El objetivo es fomentar las habilidades clave (Equipo, Empatía, Creatividad, Comunicación) en un ambiente dinámico.",
    ],
  },
  {
    titulo: "1) Configuración de la Sala y Alumnos",
    contenido: [
      "Haz clic en 'Crear sala'.",
      "Sube el archivo Excel con la lista de alumnos (debe tener las columnas 'Nombre' y 'Carrera').",
      "El sistema valida la creación de 3 o 4 equipos con un máximo de 8 personas cada uno.",
      "Genera el código único de la sala y compártelo con los equipos para que puedan unirse.",
    ],
  },
  {
    titulo: "2) Fases Clave del Juego (Habilidades)",
    contenido: [
      "El juego está estructurado en 6 etapas cronometradas (aprox. 45 min):",
      "1. Equipo (5 min) | 2. Empatía (10 min) | 3. Creatividad (15 min) | 4. Pitch (10 min).",
      "5. Evaluación entre Pares (variable) | 6. Cierre y Reflexión (5 min).",
    ],
  },
  {
    titulo: "3) Control del Flujo (Panel Profesor)",
    contenido: [
      "El Panel del Profesor es tu centro de control para toda la actividad.",
      "Visualiza el estado de los equipos ('Listos', 'En Fase').",
      "El profesor es quien controla y avanza manualmente el juego de una fase a la siguiente, marcando el ritmo.",
      "Usa los botones para pausar el tiempo o reiniciar la sala si es necesario.",
    ],
  },
  {
    titulo: "4) Evaluación por Tokens",
    contenido: [
      "Los equipos ganan 'Tokens' al completar exitosamente las dinámicas de cada etapa.",
      "En la Etapa 5 (Evaluación entre Pares), los equipos se puntúan entre sí (no se autoevalúan) usando 4 criterios.",
      "Esto suma tokens adicionales y fomenta el feedback y apoyo entre pares.",
    ],
  },
  {
    titulo: "5) Sugerencias para el Facilitador",
    contenido: [
      "Proyecta siempre el panel del profesor en pantalla para marcar el ritmo y el tiempo de juego.",
      "Usa timeboxing estricto. Mantén la energía y el foco dando instrucciones claras al inicio de cada fase.",
      "Al finalizar, guía una reflexión personal sobre las habilidades adquiridas y a mejorar.",
    ],
  },
];
// FIN DEL CONTENIDO ACTUALIZADO

interface Props {
  onExit: () => void;
  hideClose: boolean;
  hideBackdrop?: boolean; 
}

// Estilos de botones
const btnPrimary: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "none",
  background: theme.azul,
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "2px solid rgba(0,0,0,.15)",
  background: "transparent",
  color: "#0B1220",
  fontWeight: 700,
  cursor: "pointer",
};

const ProfTutorial: React.FC<Props> = ({ onExit }) => {
  const [i, setI] = React.useState(0);
  const paso = pasos[i];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        // Fondo semitransparente
        background: "rgba(0,0,0,.65)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={(e)=> e.stopPropagation()} 
    >
      <div
        style={{
          width: "clamp(320px, 92vw, 920px)",
          borderRadius: 18,
          background: "#fff",
          color: "#0B1220",
          boxShadow: "0 20px 60px rgba(0,0,0,.35)",
          padding: "22px 22px 16px 22px",
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Título */}
        <div
          style={{
            fontWeight: 900,
            fontSize: 22,
            marginBottom: 12,
            backgroundImage: `linear-gradient(90deg, ${theme.rosa}, ${theme.amarillo}, ${theme.azul})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {paso.titulo}
        </div>

        {/* Contenido */}
        <ul style={{ margin: 0, paddingLeft: 18, listStyleType: 'disc' }}> 
          {paso.contenido.map((t, idx) => (
            <li key={idx} style={{ margin: "6px 0", lineHeight: 1.5 }}>
              {t}
            </li>
          ))}
        </ul>

        {/* Footer: botones + paginación */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {i > 0 && (
              <button
                onClick={() => setI((v) => v - 1)}
                style={btnGhost}
              >
                ◀ Anterior
              </button>
            )}
            {i < pasos.length - 1 ? (
              <button
                onClick={() => setI((v) => v + 1)}
                style={btnPrimary}
              >
                Siguiente ▶
              </button>
            ) : (
              <button onClick={onExit} style={btnPrimary}>
                Listo, volver
              </button>
            )}
          </div>

          {/* Puntos de paginación */}
          <div style={{ display: "flex", gap: 6 }}>
            {pasos.map((_, k) => (
              <span
                key={k}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  display: "inline-block",
                  background: k === i ? theme.azul : "rgba(0,0,0,.15)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfTutorial;