// TeamWorkMiniAnim.tsx
import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  /** duración del ciclo completo (descoordinado→sincronía→celebra→loop) */
  durationSec?: number;
  /** ajuste fino para alinear la meta con tu check real (altura) */
  goalBottomPct?: number; // % relativo a la escena (recomendado 18–24)
  /** escala global del bote/remeros */
  boatScale?: number; // 1 = normal, 1.25 = más grande
};

const theme = {
  rosa: "#E91E63",
  azul: "#1976D2",
  verde: "#2E7D32",
  morado: "#7C4DFF",
  texto: "#0D47A1",
  border: "#E3E8EF",
  agua1: "#DDEAFB",
  agua2: "#C9D8F4",
};

const TeamWorkMiniAnim: React.FC<Props> = ({
  title = "Trabajo en equipo",
  subtitle = "Si remamos a la vez, avanzamos",
  durationSec = 6,
  goalBottomPct = 20, // mueve esto si tu círculo real está algo más alto/bajo
  boatScale = 1.25,   // tamaño general del bote
}) => {
  return (
    <div
      style={{
        width: "clamp(320px, 94vw, 980px)",
        margin: "0 auto",
        background: "#fff",
        borderRadius: 20,
        padding: 16,
        border: `1px solid ${theme.border}`,
        boxShadow: "0 16px 36px rgba(16,24,40,.14)",
        textAlign: "center",
      }}
    >
      <style>{css(durationSec, goalBottomPct, boatScale)}</style>

      <div style={{ fontWeight: 900, color: theme.rosa, fontSize: 24 }}>
        {title}
      </div>
      <div style={{ color: theme.texto, opacity: 0.85, marginBottom: 12 }}>
        {subtitle}
      </div>

      <div className="scene">
        {/* Cielo/gradientes suaves */}
        <div className="sky" />

        {/* Agua */}
        <div className="water">
          <div className="wave w1" />
          <div className="wave w2" />
          <div className="wave w3" />
        </div>

        {/* Meta “dummy” para alinear con tu círculo real */}
        <div className="goal" aria-hidden />

        {/* Bote + tripulación */}
        <div className="boat">
          <svg
            viewBox="0 0 1200 380"
            className="boatSvg"
            role="img"
            aria-label="Equipo remando sincronizado"
          >
            {/* Sombra del bote sobre el agua */}
            <ellipse cx="600" cy="290" rx="480" ry="20" fill="rgba(0,0,0,.10)" />

            {/* Casco (gradiente suave) */}
            <defs>
              <linearGradient id="hullG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A6B3BE" />
                <stop offset="100%" stopColor="#909EAA" />
              </linearGradient>

              {/* máscara para simular que la pala entra al agua */}
              <mask id="waterMask">
                <rect x="0" y="0" width="1200" height="380" fill="white" />
                {/* zona de agua “recorta” un poco la pala al bajar */}
                <rect x="0" y="228" width="1200" height="152" fill="black" />
              </mask>
            </defs>

            <g id="hull">
              <path
                d="M130 240 L1070 240 L1020 270 L180 270 Z"
                fill="url(#hullG)"
                stroke="#8EA0AC"
                strokeWidth="2"
              />
              {/* Proa */}
              <path
                d="M1070 240 L1100 222"
                stroke="#8EA0AC"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </g>

            {/* Tripulación articulada */}
            <Crew x={260} color={theme.azul} delay={0.0} />
            <Crew x={480} color={theme.rosa} delay={0.06} />
            <Crew x={700} color={theme.verde} delay={0.12} />
            <Crew x={920} color={theme.morado} delay={0.18} />
          </svg>
        </div>

        {/* Banner de éxito arriba (reemplaza el check) */}
        <div className="successBanner">
          <span className="trophy" aria-hidden>🏆</span>
          <span className="text">¡Logrado!</span>
        </div>
      </div>
    </div>
  );
};

export default TeamWorkMiniAnim;

/* --------- Remero articulado (hombro→codo→remo con máscara de agua) --------- */
function Crew({ x, color, delay }: { x: number; color: string; delay: number }) {
  const d = `calc(var(--dur) * ${delay})`;
  return (
    <g transform={`translate(${x},0)`} style={{ animationDelay: d }}>
      {/* tolete / pivote */}
      <rect x={-22} y={218} width={12} height={18} rx={3} fill="#7F8E99" />
      <rect x={-44} y={232} width={40} height={10} rx={5} fill="#AAB7C2" />

      {/* piernas (pequeño empuje) */}
      <g className="legs" transform="translate(0,240)">
        <line
          x1={0}
          y1={0}
          x2={30}
          y2={20}
          stroke="#6C7A86"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* asiento */}
      <rect x={-16} y={232} width={32} height={8} rx={4} fill="#BFCAD3" />

      {/* grupo superior: hombro → codo → manos → remo */}
      <g className="upper" transform="translate(0,220)">
        {/* torso (se inclina) */}
        <g className="torso" transform="translate(0,0)">
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={-32}
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* cabeza */}
          <circle cx={0} cy={-46} r={12} fill="#F4CCA6" stroke="#E2B58D" strokeWidth="2" />
        </g>

        {/* brazo superior (hombro->codo) */}
        <g className="armUpper" transform="translate(0,-18)">
          <line x1={0} y1={0} x2={28} y2={-6} stroke={color} strokeWidth="10" strokeLinecap="round" />
          {/* brazo inferior (codo->mano) */}
          <g className="armLower" transform="translate(28,-6)">
            <line x1={0} y1={0} x2={26} y2={2} stroke={color} strokeWidth="10" strokeLinecap="round" />
            {/* mano -> mango del remo */}
            <g className="oarGroup" transform="translate(26,2)" mask="url(#waterMask)">
              {/* pértiga del remo */}
              <line x1={0} y1={0} x2={140} y2={0} stroke="#5B6B7A" strokeWidth="12" strokeLinecap="round" />
              {/* pala */}
              <rect className="blade" x={140} y={-14} width={30} height={28} rx={4} fill="#5B6B7A" />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

/* -------------------------------- CSS-in-JS -------------------------------- */
function css(DUR: number, GOAL_BOTTOM: number, BOAT_SCALE: number) {
  return `
:root { --dur: ${DUR}s; }

/* Escena general */
.scene{
  position: relative; width: 100%; aspect-ratio: 16/7;
  border: 1px solid ${theme.border}; border-radius: 16px; overflow: hidden;
  background: #fff;
}

/* Cielo suave */
.sky{
  position:absolute; inset:0;
  background:
    radial-gradient(40% 26% at 18% 6%, rgba(233,30,99,.10), transparent 60%),
    radial-gradient(40% 20% at 72% 0%, rgba(25,118,210,.12), transparent 60%);
  animation: skyDrift var(--dur) ease-in-out infinite;
}

/* Agua */
.water{
  position:absolute; left:0; right:0; bottom:0; top:44%;
  background: linear-gradient(180deg, ${theme.agua1}, ${theme.agua2});
  box-shadow: inset 0 12px 24px rgba(0,0,0,.06);
}
.wave{
  position:absolute; left:-20%; right:-20%; height:12px; border-radius:8px;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,.50) 0 16px, transparent 16px 32px);
  opacity:.7; filter: blur(.2px);
}
.w1{ top: 12%; animation: wave var(--dur) linear infinite; }
.w2{ top: 42%; animation: wave var(--dur) linear infinite reverse; opacity:.55; }
.w3{ top: 68%; animation: wave var(--dur) linear infinite; opacity:.45; }

@keyframes wave{ 0%{transform:translateX(0)} 100%{transform:translateX(18%)} }
@keyframes skyDrift{ 0%{transform:translateY(0)} 50%{transform:translateY(-6px)} 100%{transform:translateY(0)} }

/* Meta “dummy”: ajustable para calzar con tu check real */
.goal{
  position:absolute; right: 6%;
  bottom: ${GOAL_BOTTOM}%;
  width: 56px; height: 56px; border-radius: 50%;
  background:#fff; border:4px solid ${theme.border};
  box-shadow: 0 10px 20px rgba(0,0,0,.06);
}

/* Bote */
.boat{
  position:absolute; left: 8%;
  bottom: calc(${GOAL_BOTTOM}% + 5.5%);  /* se apoya en la misma “línea” */
  width: 84%;
  transform: scale(${BOAT_SCALE});
  transform-origin: left bottom;
  animation: boatMove var(--dur) cubic-bezier(.22,.61,.36,1) infinite;
}
.boatSvg{ width: 100%; display:block; }

/* Avance del bote: arranca MÁS ATRÁS, progresa fuerte en sincronía (35–70%) */
@keyframes boatMove{
  0%   { transform: translateX(-120px) scale(${BOAT_SCALE}) }  /* ← empieza más atrás */
  34%  { transform: translateX(-100px) scale(${BOAT_SCALE}) }
  70%  { transform: translateX(420px) scale(${BOAT_SCALE}) }
  84%  { transform: translateX(420px) scale(${BOAT_SCALE}) }
  100% { transform: translateX(-120px) scale(${BOAT_SCALE}) }
}

/* --------- Cinemática del remero (fluida y natural) --------- */
/* Piernas empujan ligeramente */
.legs{ animation: legPush var(--dur) linear infinite; transform-box: fill-box; }
@keyframes legPush{
  0%{ transform: translate(0,240) }
  40%{ transform: translate(3px,240) }
  55%{ transform: translate(5px,240) }
  70%{ transform: translate(2px,240) }
  100%{ transform: translate(0,240) }
}

/* Torso se inclina con la brazada */
.torso{ transform-origin: 0px 0px; transform-box: fill-box; animation: torsoLean var(--dur) linear infinite; }
@keyframes torsoLean{
  0%{  transform: rotate(-7deg) }
  35%{ transform: rotate(-12deg) }
  55%{ transform: rotate(12deg) }
  70%{ transform: rotate(-8deg) }
  100%{ transform: rotate(-7deg) }
}

/* Hombro->codo */
.armUpper{ transform-origin: 0px 0px; transform-box: fill-box; animation: armUp var(--dur) linear infinite; }
@keyframes armUp{
  0%{  transform: rotate(-6deg) }
  40%{ transform: rotate(-12deg) }
  55%{ transform: rotate(10deg) }
  70%{ transform: rotate(-8deg) }
  100%{ transform: rotate(-6deg) }
}

/* Codo->mano */
.armLower{ transform-origin: 0px 0px; transform-box: fill-box; animation: armLow var(--dur) linear infinite; }
@keyframes armLow{
  0%{  transform: rotate(6deg) }
  40%{ transform: rotate(0deg) }
  55%{ transform: rotate(12deg) }
  70%{ transform: rotate(2deg) }
  100%{ transform: rotate(6deg) }
}

/* Mano + remo (grupo) */
.oarGroup{ transform-origin: 0px 0px; transform-box: fill-box; animation: oarStroke var(--dur) linear infinite; }
@keyframes oarStroke{
  0%{  transform: rotate(-10deg) }
  40%{ transform: rotate(-16deg) }   /* entra al agua */
  55%{ transform: rotate(18deg) }    /* empuje */
  70%{ transform: rotate(-12deg) }   /* recuperación */
  100%{ transform: rotate(-10deg) }
}
/* Pala baja/ sube un poco para sentir "agua" */
.blade{ animation: bladeDip var(--dur) ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
@keyframes bladeDip{
  0%{  transform: translateY(0) }
  40%{ transform: translateY(3px) }
  55%{ transform: translateY(5px) }
  70%{ transform: translateY(1px) }
  100%{ transform: translateY(0) }
}

/* --------- Banner de éxito arriba (reemplaza al check) --------- */
.successBanner{
  position:absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%) scale(0);
  padding: 10px 22px;
  border-radius: 12px;
  background: #ffffff;
  border: 3px solid ${theme.verde};
  box-shadow: 0 10px 22px rgba(46,125,50,.18);
  display: flex; align-items: center; gap: 10px;
  font-weight: 800; color: ${theme.verde};
  animation: successPop var(--dur) ease-out infinite;
}
.trophy{ display:inline-block; font-size: 18px; animation: wobble var(--dur) ease-in-out infinite; }
.text{ font-size: 16px; letter-spacing: .3px; }

@keyframes successPop{
  0%,78% { transform: translateX(-50%) scale(0); opacity: 0; }
  82%    { transform: translateX(-50%) scale(1.08); opacity: 1; }
  88%    { transform: translateX(-50%) scale(1); opacity: 1; }
  100%   { transform: translateX(-50%) scale(0); opacity: 0; }
}
@keyframes wobble{
  0%,78%,100% { transform: rotate(0deg); }
  82% { transform: rotate(-10deg); }
  85% { transform: rotate(6deg); }
  88% { transform: rotate(0deg); }
}

/* Responsivo */
@media (max-width: 720px){
  .boat{ width: 92%; left: 4%; }
}
`;
}
