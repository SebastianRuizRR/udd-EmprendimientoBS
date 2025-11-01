import React from "react";

/**
 * AnimEva — Animación de autoevaluación individual (sin dependencias externas)
 * Metáforas visuales:
 *  - Avatar con anillo de progreso
 *  - Tarjeta de "reflexión personal" con 3 barras que se llenan (COSTÓ / APRENDÍ / HARÍA DISTINTO)
 *  - Cursor/lápiz que "marca" los checks
 *  - Chips de foco/esfuerzo/aprendizaje (para reforzar que es individual)
 */
export default function AnimEva() {
  return (
    <div style={{ display: "grid", gap: 18, justifyItems: "center", padding: 12 }}>
      <style>{`
        @keyframes floaty { 0%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } 100%{ transform: translateY(0) } }
        @keyframes ring { 0% { stroke-dashoffset: 314 } 100% { stroke-dashoffset: 94 } } /* ~65% */
        @keyframes fill { 0%{ width:0% } 100%{ width:100% } }
        @keyframes tick { 0%{ transform: scale(.8); opacity:0 } 60%{ opacity:1 } 100%{ transform: scale(1); opacity:1 } }
        @keyframes write { 0%{ transform: translate(0,0) rotate(-8deg) } 50%{ transform: translate(8px,-4px) rotate(4deg) } 100%{ transform: translate(0,0) rotate(-8deg) } }

        .card { background:#fff; border:1px solid #E3E8EF; border-radius:16px; box-shadow:0 16px 36px rgba(16,24,40,.10); padding:16px; width:420px }
        .row  { display:grid; grid-template-columns:110px 1fr 22px; align-items:center; gap:12px; margin:10px 0 }
        .tag  { font-size:11px; font-weight:700; color:#0D47A1; background:#EAF3FF; border:1px solid #CFE3FF; border-radius:999px; padding:4px 10px; margin:0 6px }
        .bar  { height:8px; background:#EEF2F7; border-radius:999px; overflow:hidden }
        .fill { height:100%; background:#6366F1; border-radius:999px; animation:fill 1200ms ease forwards }
        .lbl  { font-size:12px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:.6px }
        .tick { font-weight:900; color:#16A34A; animation:tick 600ms ease both }
        .note { font-size:12px; opacity:.8; text-align:center }
        .chips{ display:flex; gap:8px; flex-wrap:wrap; justify-content:center }

        .avatarWrap{ position:relative; width:120px; height:120px }
        .avatar{ width:100%; height:100%; border-radius:999px; background:linear-gradient(135deg,#FDE68A,#FCA5A5); display:grid; place-items:center; box-shadow:0 10px 24px rgba(16,24,40,.14) }
        .initial{ font-weight:900; color:#1F2937; font-size:46px }
        .ring{ position:absolute; inset:-8px; }
        .pen { position:absolute; right:-8px; bottom:-6px; width:26px; height:26px; border-radius:6px; background:#1F2937; color:#fff; display:grid; place-items:center; animation:write 1.8s ease-in-out infinite }
      `}</style>

      {/* Encabezado mini */}
      <div className="chips">
        <span className="tag">Foco</span>
        <span className="tag">Esfuerzo</span>
        <span className="tag">Aprendizaje</span>
      </div>

      {/* Avatar + ring de progreso (metáfora de avance personal) */}
      <div className="avatarWrap" style={{ animation: "floaty 2.6s ease-in-out infinite" }}>
        <div className="avatar"><div className="initial">Tú</div></div>
        <svg className="ring" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" stroke="#E5E7EB" strokeWidth="8" fill="none" />
          <circle
            cx="60" cy="60" r="50"
            stroke="#6366F1" strokeWidth="8" fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: 314,
              strokeDashoffset: 314,
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              animation: "ring 1800ms ease forwards 300ms"
            }}
          />
        </svg>
        <div className="pen">✎</div>
      </div>

      {/* Tarjeta de reflexión personal */}
      <div className="card">
        {/* COSTÓ */}
        <div className="row">
          <div className="lbl">Me costó</div>
          <div className="bar"><div className="fill" style={{ animationDelay: "200ms", width:"72%" }}/></div>
          <div className="tick" style={{ animationDelay: "900ms" }}>✓</div>
        </div>
        {/* APRENDÍ */}
        <div className="row">
          <div className="lbl">Aprendí</div>
          <div className="bar"><div className="fill" style={{ animationDelay: "500ms", width:"85%" }}/></div>
          <div className="tick" style={{ animationDelay: "1200ms" }}>✓</div>
        </div>
        {/* HARÍA DISTINTO */}
        <div className="row">
          <div className="lbl">Haría distinto</div>
          <div className="bar"><div className="fill" style={{ animationDelay: "800ms", width:"60%" }}/></div>
          <div className="tick" style={{ animationDelay: "1500ms" }}>✓</div>
        </div>

        <div className="note" style={{ marginTop: 6 }}>
          Piensa en un ejemplo concreto para cada punto antes de responder el QR
        </div>
      </div>
    </div>
  );
}
