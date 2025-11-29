import React, { useEffect, useMemo, useRef, useState } from "react";

/** Paleta UDD Emprende */
const palette = {
  rosa: "#E91E63",
  azul: "#0D6EFD",
  azulDeep: "#0057D9",
  amarillo: "#FFC107",
  violeta: "#9E007E",
  celeste: "#00A3E0",
  texto: "#0B1220",
  textoLight: "#F7FAFF",
};

/* * ========= ASSETS: URLs DE ARCHIVOS SUBIDOS POR EL USUARIO ========= 
 * Se usan funciones que generan la URL para los archivos que SÍ se pudieron
 * resolver en el entorno (los que causaron el error anterior).
 */
import imgWelcome from "./assets/Olá - Relaxing.png";
import imgTeam from "./assets/Big Shoes - Discussion.png";
import imgDesafio from "./assets/Allura - Online Searching.png";
import imgCreat from "./assets/Miroodles - Color Comp.png";
import imgPitch from "./assets/Croods - Sitting on Floor.png";
import imgTokens from "./assets/Hands - Coin.png";

/* ========= Tipos ========= */
type Slide = {
  title: string;
  lines: string[];
  img?: string;
  imgRatio?: number;
  alt?: string;
};

type Props = {
  onFinish: () => void;
  onSkip: () => void;
};

/* ========= Botón reutilizable ========= */
const Btn: React.FC<{
  label: string;
  onClick: () => void;
  variant?: "primary" | "ghost";
}> = ({ label, onClick, variant = "primary" }) => {
  const styles: React.CSSProperties =
    variant === "primary"
      ? {
          padding: "12px 18px",
          borderRadius: 999,
          border: "none",
          background: palette.azul,
          color: "#fff",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 10px 22px rgba(13,110,253,.28)",
          transition: "transform 0.1s ease",
        }
      : {
          padding: "12px 18px",
          borderRadius: 999,
          border: `2px solid rgba(255,255,255,.35)`,
          background: "transparent",
          color: palette.textoLight,
          fontWeight: 800,
          cursor: "pointer",
          transition: "opacity 0.1s ease",
        };

  return (
    <button onClick={onClick} style={styles}>
      {label}
    </button>
  );
};

/* ========= Componente principal ========= */
const IntroVideo: React.FC<Props> = ({ onFinish, onSkip }) => {
  const [step, setStep] = useState(0);

  // Contenido actualizado con mecánica de Tokens y tiempos.
  const slides: Slide[] = useMemo(
    () => [
      {
        title: "¡Misión Emprende! Lanza tu Idea Ganadora 🚀",
        lines: [
          "Bienvenidos al desafío que impulsará tus habilidades clave: Equipo, Empatía, Creatividad y Comunicación.",
          "Trabajarás en equipo para resolver un problema real, ¡y usarás LEGO físico para construir la solución!",
          "Tu objetivo final es conseguir la mayor cantidad de **Tokens de Apoyo**.",
          "¿Listos para transformar una idea en un emprendimiento ganador? ¡Comencemos con el flujo!",
        ],
        img: imgWelcome,
        imgRatio: 0.36,
        alt: "Persona relajada, bienvenida al juego",
      },
      {
        title: "Etapa 1: Habilidad de Equipo | 5 Min",
        lines: [
          "**Tu Misión:** ¡Conéctate! Dependiendo si ya se conocen o no, la app les guiará a través de una dinámica rompehielos o un juego rápido.",
          "**Habilidad:** Es la base de todo. Un equipo coordinado y con roles claros (facilitador, *timekeeper*, relator) es imparable.",
          "**Recompensa:** El sistema les otorgará **Tokens** por completar la dinámica inicial. ¡Asegúrenlos rápido!",
        ],
        img: imgTeam,
        imgRatio: 0.33,
        alt: "Personas conversando en equipo",
      },
      {
        title: "Etapa 2: Desafío & Empatía | 8 Min",
        lines: [
          "**Tu Misión:** Elige uno de los grandes desafíos (Salud, Sustentabilidad o Educación) y enfócate en el usuario que lo vive.",
          "**Herramienta Clave:** Completen el **Bubble Map** interactivo en la app para mapear sus necesidades, emociones y motivaciones.",
          "**Habilidad:** La Empatía es la capacidad de ponerse en los zapatos de otro. Es esencial para identificar problemas reales que valgan la pena resolver.",
          "**Recompensa:** Ganan **Tokens** por caracterizar a fondo a su usuario. ¡La claridad paga!",
        ],
        img: imgDesafio,
        imgRatio: 0.38,
        alt: "Persona investigando en pantalla, empatizando",
      },
      {
        title: "Etapa 3: Creatividad & Prototipo | 10 Min",
        lines: [
          "**Tu Misión:** ¡A construir! Usando los **LEGO físicos**, diseñen una solución que responda directamente a la necesidad del usuario que mapearon.",
          "**Apoyo Digital:** La app les dará *prompts* de apoyo para desafiar su imaginación.",
          "**Habilidad:** La Creatividad no es solo tener ideas, es la capacidad de materializarlas de forma original y funcional.",
          "**Paso Final:** Deberán subir una foto del prototipo LEGO a la app y definir su Frase de Valor.",
        ],
        img: imgCreat,
        imgRatio: 0.36,
        alt: "Manos creando un prototipo con legos",
      },
      {
        title: "Etapa 4: Comunicación (Pitch) | 10 Min Prep. + 90 Seg",
        lines: [
          "**Tu Misión:** Preparen un **Pitch de 90 segundos** siguiendo la rúbrica: Problema, Solución LEGO y Cierre invitando al apoyo.",
          "**Habilidad:** La Comunicación efectiva es lo que transforma una gran idea en una gran empresa. Debes ser conciso, claro y persuasivo.",
          "**¡Crono!: Tienen 10 minutos para preparar y 90 segundos exactos para presentar.**",
        ],
        img: imgPitch,
        imgRatio: 0.34,
        alt: "Persona presentando y otros escuchando",
      },
      {
        title: "Etapa 5: Evaluación y ¡La Batalla por los Tokens! 🏆",
        lines: [
          "**Mecánica de Evaluación:** Recibirán una **dotación inicial de Tokens** para invertir en los Pitch de los demás equipos.",
          "**Tu Tarea:** Usen la rúbrica simple de la app para evaluar (y apoyar) a *todos* sus compañeros. **No se pueden autoevaluar.**",
          "**El Resultado:** El equipo con el total más alto de **Tokens** (ganados en las etapas + recibidos en la evaluación) será el ganador.",
        ],
        img: imgTokens,
        imgRatio: 0.36,
        alt: "Animación de un trofeo con tokens",
      },
      {
        title: "¡A Emprender! Tu Misión Comienza Ahora",
        lines: [
          "El juego es *autoexplicativo* en cada paso, pero no pierdan de vista el cronómetro.",
          "Disfruten el proceso, colaboren y recuerden: cada **Token** cuenta.",
          "Presiona 'Empezar el Desafío' para ir al Lobby y configurar tu equipo.",
        ],
        img: imgTeam,
        imgRatio: 0.33,
        alt: "Equipo celebrando el inicio del juego",
      },
    ],
    []
  );

  // Precarga de imágenes
  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current) return;
    slides.forEach((s) => {
      if (!s.img) return;
      const im = new Image();
      im.src = s.img;
    });
    preloaded.current = true;
  }, [slides]);

  // Avanzar manualmente
  const goNext = () => {
    if (step < slides.length - 1) setStep((s) => s + 1);
    else onFinish();
  };

  const s = slides[step];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        pointerEvents: "auto",
      }}
    >
      {/* Contenedor centrado */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          padding: 16,
        }}
      >
        {/* key={step} reinicia la animación al cambiar de slide */}
        <Card key={step} slide={s} />

        {/* Botonera bajo el card */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {step < slides.length - 1 && (
            <Btn label="Saltar todo" variant="ghost" onClick={onSkip} />
          )}
          <Btn
            label={step < slides.length - 1 ? "Siguiente ▶" : "Empezar el Desafío"}
            onClick={goNext}
          />
        </div>
      </div>
    </div>
  );
};

export default IntroVideo;

/* ========= UI del “card” con efecto de escritura ========= */
const CHAR_MS = 18; // velocidad por carácter (ms)
const LINE_PAUSE_MS = 280; // pausa entre líneas (ms)

// Función auxiliar para convertir el formato **negrita** a <strong>negrita</strong>
const formatMarkdown = (text: string) => {
    // Reemplaza **texto** con <strong>texto</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const Card: React.FC<{ slide: Slide }> = ({ slide }) => {
  const width = "clamp(340px, 95vw, 1120px)";
  const minH = 220;

  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLineIdx(0);
    setTyped("");
    setDone(false);
  }, [slide]);

  useEffect(() => {
    if (!slide.lines?.length || done) return;

    const text = slide.lines[lineIdx] ?? "";
    if (typed.length >= text.length) {
      if (lineIdx < slide.lines.length - 1) {
        // La línea actual ha terminado, pasar a la siguiente
        const t = setTimeout(() => {
          setLineIdx((i) => i + 1);
          setTyped("");
        }, LINE_PAUSE_MS);
        return () => clearTimeout(t);
      } else {
        // Todas las líneas han terminado
        setDone(true);
        return;
      }
    }
    
    // Si no ha terminado, continúa escribiendo
    const id = setInterval(() => {
      setTyped((prev) => text.slice(0, prev.length + 1));
    }, CHAR_MS);
    return () => clearInterval(id);
  }, [slide, lineIdx, typed, done]);

  // 🔹 Si ya terminó, muestra todas las líneas completas
  // NOTA: Se corrige el error de repetición eliminando `currentLine` del array `fullLines` si `done` es true,
  // ya que la última línea ya se encuentra en `fullLines`.
  const fullLines = done 
    ? slide.lines.map(formatMarkdown) // Muestra todas las líneas formateadas si ha terminado
    : slide.lines.slice(0, lineIdx).map(formatMarkdown); // Muestra solo las líneas completas formateadas

  const currentLineText = slide.lines[lineIdx] ?? "";
  const typedFormatted = formatMarkdown(typed); // Formateamos el texto que se está escribiendo

  return (
    <div
      style={{
        width,
        minHeight: minH,
        borderRadius: 28,
        padding: "26px 28px",
        color: palette.textoLight,
        background:
          "linear-gradient(180deg, rgba(30,45,70,.88) 0%, rgba(20,30,60,.92) 100%)",
        boxShadow: "0 25px 50px rgba(0,0,0,.25)",
        maxWidth: "90%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: palette.amarillo }}>
          {slide.title}
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 24,
            alignItems: "center",
          }}
        >
          {slide.img && (
            <div
              style={{
                flexShrink: 0,
                width: slide.imgRatio ? `${slide.imgRatio * 100}%` : "30%",
                maxWidth: 300,
                aspectRatio: "4/3",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 10px 20px rgba(0,0,0,.3)",
              }}
            >
              <img
                src={slide.img}
                alt={slide.alt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div style={{ flexGrow: 1 }}>
            <ul style={{ padding: "0 0 0 20px", margin: 0, lineHeight: 1.6 }}>
              {fullLines.map((line, i) => (
                // Las líneas completas siempre usan dangerouslySetInnerHTML
                <li key={i} dangerouslySetInnerHTML={{ __html: line }} style={{ margin: "6px 0" }}/>
              ))}
              {/* Mostramos la línea actual SÓLO si no hemos terminado el slide completo */}
              {!done && currentLineText && (
                <li style={{ margin: "6px 0" }}>
                  {/* El texto tipiado (que incluye el formato) también usa dangerouslySetInnerHTML */}
                  <span dangerouslySetInnerHTML={{ __html: typedFormatted }} />
                  {/* Cursor de escritura */}
                  {typed.length < currentLineText.length && (
                    <span
                      style={{
                        animation: "blink 1s step-end infinite",
                        display: "inline-block",
                        width: 8,
                        height: "1em",
                        backgroundColor: palette.textoLight,
                        marginLeft: 2,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                </li>
              )}
            </ul>
            <style>
              {`
                @keyframes blink {
                  from, to { opacity: 1; }
                  50% { opacity: 0; }
                }
              `}
            </style>
          </div>
        </div>
      </div>
    </div>
  );
};