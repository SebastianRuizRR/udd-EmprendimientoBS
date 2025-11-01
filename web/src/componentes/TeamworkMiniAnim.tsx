// TeamWorkMiniAnim.tsx
import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  durationSec?: number; // duración del ciclo completo
  loop?: boolean;
};

const theme = {
  rosa: "#E91E63",
  azul: "#1976D2",
  verde: "#2E7D32",
  amarillo: "#FFB300",
  texto: "#0D47A1",
  border: "#E3E8EF",
  bgSoft:
    "radial-gradient(140% 100% at 50% 8%, #F7F9FC 0%, #fff 55%, #EFF4FA 100%)",
};

const TeamWorkMiniAnim: React.FC<Props> = ({
  title = "Trabajo en equipo",
  subtitle = "Cuando sincronizamos la fuerza, lo imposible se mueve",
  durationSec = 9,
}) => {
  return (
    <div
      style={{
        width: "clamp(320px,92vw,900px)",
        margin: "0 auto",
        background: "#fff",
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: 16,
        boxShadow: "0 16px 36px rgba(16,24,40,.14)",
        textAlign: "center",
      }}
    >
      <style>{css(durationSec)}</style>

      <div style={{ fontWeight: 900, color: theme.rosa, fontSize: 22 }}>
        {title}
      </div>
      <div style={{ color: theme.texto, opacity: 0.85, marginBottom: 12 }}>
        {subtitle}
      </div>

      <div className="sync-scene">
        {/* HUD suave */}
        <div className="sync-hud sync-anim" />

        {/* Suelo / pista */}
        <div className="ground" />

        {/* Bloque pesado */}
        <div className="block sync-anim">
          <div className="block-face">■</div>
        </div>

        {/* Flechas de dirección (se encienden en sincronía) */}
        <div className="arrows sync-anim">
          <span className="a a1">→</span>
          <span className="a a2">→</span>
          <span className="a a3">→</span>
          <span className="a a4">→</span>
          <span className="a a5">→</span>
        </div>

        {/* Equipo (5 personas) — llegan, se alinean, empujan a la vez */}
        <Person idx={1} xStart="18%" xPush="28%" color={theme.azul}    emoji="🧠" />
        <Person idx={2} xStart="10%" xPush="22%" color={theme.rosa}    emoji="🤝" />
        <Person idx={3} xStart="6%"  xPush="18%" color={theme.verde}   emoji="💪" />
        <Person idx={4} xStart="2%"  xPush="14%" color={theme.amarillo} emoji="🎯" />
        <Person idx={5} xStart="-4%" xPush="10%" color="#7C4DFF"        emoji="⚡" />

        {/* Banda de “sincronización” (metrónomo visual) */}
        <div className="syncline sync-anim" />

        {/* Meta y celebración */}
        <div className="goal">
          <div className="flag">★</div>
        </div>
        <div className="confetti sync-anim" />
        <div className="done sync-anim">✓</div>
      </div>
    </div>
  );
};

export default TeamWorkMiniAnim;

/* ================= Subcomponentes ================= */
function Person({
  idx,
  xStart,
  xPush,
  color,
  emoji,
}: {
  idx: 1 | 2 | 3 | 4 | 5;
  xStart: string; // posición horizontal de llegada
  xPush: string;  // posición cuando empuja
  color: string;
  emoji: string;
}) {
  // Cada persona tiene su propio timing: llegan (0–25%), se alinean (25–40%),
  // EMPUJAN (40–65% todos a la vez), celebran (65–75%), vuelven (75–100%).
  return (
    <div
      className={`person p${idx} sync-anim`}
      style={
        {
          // punto base vertical
          bottom: "22%",
          // se anima left vía keyframes
          "--xStart": xStart,
          "--xPush": xPush,
          "--c": color,
        } as React.CSSProperties
      }
    >
      <div className="avatar" />
      <div className="emoji">{emoji}</div>
      {/* efecto “fuerza” al empujar */}
      <div className="force sync-anim" />
    </div>
  );
}

/* ================= CSS ================= */
function css(DUR: number) {
  return `
:root { --dur: ${DUR}s; }

/* Escena */
.sync-scene{
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border: 1px solid ${theme.border};
  border-radius: 16px;
  overflow: hidden;
  background: ${theme.bgSoft};
}

/* HUD sutil */
.sync-hud{
  position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(40% 20% at 60% 0%, rgba(25,118,210,.10), transparent 60%),
    radial-gradient(40% 26% at 20% 10%, rgba(233,30,99,.08), transparent 60%);
  animation: drift var(--dur) ease-in-out infinite;
}

/* Suelo */
.ground{
  position:absolute; left:0; right:0; bottom:18%;
  height: 8px; border-radius: 6px;
  background: linear-gradient(180deg,#E0E7EF 0%, #CBD5E1 100%);
  box-shadow: 0 10px 22px rgba(0,0,0,.08);
}

/* Bloque pesado */
.block{
  position:absolute; left: 34%; bottom: calc(18% + 8px);
  width: 180px; height: 90px; border-radius: 14px;
  background: linear-gradient(180deg,#B0BEC5 0%, #90A4AE 100%);
  border: 2px solid ${theme.border};
  box-shadow: 0 18px 30px rgba(0,0,0,.12);
  transform: translateX(0);
  animation: blockMove var(--dur) ease-in-out infinite;
}
.block-face{
  position:absolute; left: 10px; top: 8px; font-size: 20px; color: #5B6B7A; opacity:.7;
}

/* Flechas de dirección */
.arrows{
  position:absolute; left: 36%; bottom: calc(18% + 100px);
  display:flex; gap: 6px;
}
.a{ font-weight: 900; color: ${theme.texto}; opacity:.12; transform: translateY(0); }
.a1{ animation: arrowBlink var(--dur) linear infinite; animation-delay: calc(var(--dur) * .38); }
.a2{ animation: arrowBlink var(--dur) linear infinite; animation-delay: calc(var(--dur) * .42); }
.a3{ animation: arrowBlink var(--dur) linear infinite; animation-delay: calc(var(--dur) * .46); }
.a4{ animation: arrowBlink var(--dur) linear infinite; animation-delay: calc(var(--dur) * .50); }
.a5{ animation: arrowBlink var(--dur) linear infinite; animation-delay: calc(var(--dur) * .54); }

/* Línea de sincronía (metrónomo) */
.syncline{
  position:absolute; left:8%; right:8%; bottom: calc(18% + 120px);
  height: 6px; border-radius: 6px;
  background: repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 14px, transparent 14px 28px);
  overflow:hidden;
}
.syncline::after{
  content:\"\"; position:absolute; left: -20%; top:0; bottom:0; width: 40%;
  background: linear-gradient(90deg, rgba(25,118,210,.15), rgba(233,30,99,.15));
  animation: sweep var(--dur) linear infinite;
}

/* Personas */
.person{
  position:absolute; left: var(--xStart); /* se animará en keyframes */
  transform: translate(-50%, 0);
  display:grid; justify-items:center; gap: 6px;
}
.avatar{
  width: 58px; height: 58px; border-radius: 50%;
  background: #fff; border: 5px solid var(--c);
  box-shadow: 0 10px 22px rgba(0,0,0,.12);
}
.emoji{ font-size: 22px; line-height: 1; transform: translateY(-44px); }

/* efecto “fuerza” */
.force{
  position:absolute; left:50%; bottom: 64px; transform: translate(-50%, 0) scale(.7);
  width: 90px; height: 90px; border-radius: 50%;
  background: conic-gradient(rgba(0,0,0,0) 0 25%, rgba(0,0,0,0) 25% 100%);
  mix-blend-mode: multiply; opacity: 0;
  animation: forcePulse var(--dur) ease-out infinite;
}

/* Meta */
.goal{
  position:absolute; right: 10%; bottom: calc(18% + 50px);
}
.flag{
  width: 50px; height: 50px; border-radius: 50%;
  display:grid; place-items:center; font-size: 22px;
  background: #fff; border: 4px solid ${theme.verde}; color:${theme.verde};
  box-shadow: 0 10px 22px rgba(46,125,50,.20);
  animation: breathe 2.4s ease-in-out infinite;
}

/* Celebración */
.confetti{
  position:absolute; right: 9%; bottom: calc(18% + 120px);
  width: 140px; height: 140px; pointer-events:none; opacity:0; filter: blur(.2px);
  background:
    radial-gradient(6px 6px at 20% 30%, rgba(255,179,0,.95), transparent 40%),
    radial-gradient(6px 6px at 60% 40%, rgba(233,30,99,.95), transparent 40%),
    radial-gradient(6px 6px at 40% 70%, rgba(25,118,210,.95), transparent 40%),
    radial-gradient(6px 6px at 80% 60%, rgba(46,125,50,.95), transparent 40%),
    radial-gradient(5px 5px at 30% 60%, rgba(0,0,0,.35), transparent 40%);
  animation: confetti var(--dur) steps(1) infinite;
}
.done{
  position:absolute; right: 12%; bottom: calc(18% + 70px);
  width: 56px; height: 56px; border-radius: 50%;
  display:grid; place-items:center; font-weight:900;
  background: #fff; border: 4px solid ${theme.verde}; color:${theme.verde};
  box-shadow: 0 8px 18px rgba(46,125,50,.20);
  transform: scale(0);
  animation: donePop var(--dur) ease-out infinite;
}

/* ===== Animaciones ===== */

/* HUD */
@keyframes drift{
  0%{ transform: translateY(0) }
  50%{ transform: translateY(-8px) }
  100%{ transform: translateY(0) }
}

/* metrónomo */
@keyframes sweep{
  0%{ left: -30% }
  50%{ left: 100% }
  100%{ left: -30% }
}

/* flechas se encienden solo en la ventana de empuje */
@keyframes arrowBlink{
  0%, 38% { opacity:.12; transform: translateY(0) }
  40%     { opacity:1;   transform: translateY(-2px) }
  65%     { opacity:1;   transform: translateY(-2px) }
  67%,100%{ opacity:.12; transform: translateY(0) }
}

/* “fuerza” de cada persona: ON durante el empuje */
@keyframes forcePulse{
  0%, 38% { opacity:0; transform: translate(-50%,0) scale(.7) }
  40%     { opacity:.9; transform: translate(-50%,0) scale(1) }
  65%     { opacity:.9; transform: translate(-50%,0) scale(1.05) }
  67%,100%{ opacity:0;  transform: translate(-50%,0) scale(.7) }
}

/* Personas: llegada → alineación → empuje → retorno */
.p1{ animation: personMove1 var(--dur) ease-in-out infinite; }
.p2{ animation: personMove2 var(--dur) ease-in-out infinite; }
.p3{ animation: personMove3 var(--dur) ease-in-out infinite; }
.p4{ animation: personMove4 var(--dur) ease-in-out infinite; }
.p5{ animation: personMove5 var(--dur) ease-in-out infinite; }

@keyframes personMove1{
  0%   { left: var(--xStart); }
  20%  { left: var(--xPush); }   /* llega */
  38%  { left: var(--xPush); }   /* alinea */
  65%  { left: calc(var(--xPush) + 2%); } /* empuja (ligero avance) */
  80%  { left: var(--xPush); }
  100% { left: var(--xStart); }
}
@keyframes personMove2{
  0%   { left: var(--xStart); }
  22%  { left: var(--xPush); }
  38%  { left: var(--xPush); }
  65%  { left: calc(var(--xPush) + 2%); }
  80%  { left: var(--xPush); }
  100% { left: var(--xStart); }
}
@keyframes personMove3{
  0%   { left: var(--xStart); }
  24%  { left: var(--xPush); }
  38%  { left: var(--xPush); }
  65%  { left: calc(var(--xPush) + 2%); }
  80%  { left: var(--xPush); }
  100% { left: var(--xStart); }
}
@keyframes personMove4{
  0%   { left: var(--xStart); }
  26%  { left: var(--xPush); }
  38%  { left: var(--xPush); }
  65%  { left: calc(var(--xPush) + 2%); }
  80%  { left: var(--xPush); }
  100% { left: var(--xStart); }
}
@keyframes personMove5{
  0%   { left: var(--xStart); }
  28%  { left: var(--xPush); }
  38%  { left: var(--xPush); }
  65%  { left: calc(var(--xPush) + 2%); }
  80%  { left: var(--xPush); }
  100% { left: var(--xStart); }
}

/* Bloque: primero vibra (intentos descoordinados), luego AVANZA fuerte cuando todos empujan */
@keyframes blockMove{
  0%   { transform: translateX(0) }
  10%  { transform: translateX(0) }
  18%  { transform: translateX(-2px) }
  26%  { transform: translateX(2px) }
  34%  { transform: translateX(-2px) }
  /* ventana de empuje coordinado */
  40%  { transform: translateX(0) }
  65%  { transform: translateX(220px) }
  75%  { transform: translateX(220px) } /* pausa celebración */
  100% { transform: translateX(0) }     /* reset suave */
}

/* celebración */
@keyframes confetti{
  0%, 74% { opacity: 0 }
  76%     { opacity: .95 }
  88%     { opacity: 0 }
  100%    { opacity: 0 }
}
@keyframes donePop{
  0%, 74% { transform: scale(0) }
  76%     { transform: scale(1.05) }
  80%     { transform: scale(1) }
  100%    { transform: scale(0) }
}
@keyframes breathe{
  0%{ transform: scale(1) }
  50%{ transform: scale(1.06) }
  100%{ transform: scale(1) }
}

/* Celebración elementos */
.confetti{
  position:absolute; right: 14%; bottom: calc(18% + 160px);
  width: 140px; height: 140px; pointer-events:none; opacity:0; filter: blur(.2px);
  background:
    radial-gradient(6px 6px at 20% 30%, rgba(255,179,0,.95), transparent 40%),
    radial-gradient(6px 6px at 60% 40%, rgba(233,30,99,.95), transparent 40%),
    radial-gradient(6px 6px at 40% 70%, rgba(25,118,210,.95), transparent 40%),
    radial-gradient(6px 6px at 80% 60%, rgba(46,125,50,.95), transparent 40%),
    radial-gradient(5px 5px at 30% 60%, rgba(0,0,0,.35), transparent 40%);
}
.done{
  position:absolute; right: 16%; bottom: calc(18% + 110px);
  width: 56px; height: 56px; border-radius: 50%;
  display:grid; place-items:center; font-weight:900;
  background: #fff; border: 4px solid ${theme.verde}; color:${theme.verde};
  box-shadow: 0 8px 18px rgba(46,125,50,.20);
  transform: scale(0);
}

/* Responsive */
@media (max-width: 640px){
  .block{ width: 160px; height: 80px; }
  .avatar{ width: 54px; height: 54px; }
  .emoji{ font-size: 20px; transform: translateY(-40px); }
}
`;
}
