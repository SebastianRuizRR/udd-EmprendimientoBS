import React from "react";

const faces = ["😡","😕","😐","🙂","😄","🤩"];
const colors = ["#d32f2f","#f57c00","#fbc02d","#7cb342","#388e3c","#2e7d32"];

export function ScoreSlider({
  value,
  onChange
}: {
  value: number;
  onChange: (v:number)=>void;
}) {

  const pct = (value / 5) * 100;

  return (
    <div style={{display:"flex", alignItems:"center", gap:12, width:"100%"}}>
      
      <input
        type="range"
        min={0}
        max={5}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          flex: 1,
          appearance: "none",
          height: "10px",
          borderRadius: "6px",
          background: `linear-gradient(to right, ${colors[value]} ${pct}%, #ddd ${pct}%)`,
          cursor: "pointer",
          outline: "none",
          transition: "background 0.25s ease, transform 0.1s ease",

          // Glow animado cuando cambia
          boxShadow: `0 0 10px ${colors[value]}55`,
        }}

        // Feedback táctil visual
        onMouseDown={e => (e.currentTarget.style.transform = "scale(1.03)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        onTouchStart={e => (e.currentTarget.style.transform = "scale(1.03)")}
        onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}

      />

      <span 
        style={{ 
          fontSize:"28px", 
          width:"32px", 
          textAlign:"center",
          transition:"transform 0.1s ease",
          display:"inline-block"
        }}
        // Emoji bounce
        onAnimationEnd={e => (e.currentTarget.style.animation = "")}
        onClick={e => {
          (e.target as HTMLElement).style.animation = "bounce 0.3s ease";
        }}
      >
        {faces[value]}
      </span>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
