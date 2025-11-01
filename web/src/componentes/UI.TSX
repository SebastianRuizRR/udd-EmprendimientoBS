// src/componentes/UI.tsx
import React from "react";

const theme = {
  rosa:"#E91E63",
  azul:"#1976D2",
  amarillo:"#FFEB3B",
  blanco:"#FFFFFF",
  border:"#E3E8EF",
  texto:"#0D47A1",
  shadow:"0 16px 36px rgba(16,24,40,.14)"
};

export const Card: React.FC<{
  title: string;
  subtitle?: string;
  width?: number;
  tight?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, width = 520, children, tight }) => (
  <div style={{
    width:`clamp(320px,92vw,${width}px)`,
    background:"rgba(255,255,255,0.96)",
    boxShadow:theme.shadow,
    border:`1px solid ${theme.border}`,
    borderRadius:20,
    padding:tight?18:24,
    textAlign:"center",
    backdropFilter:"blur(2px)",
    position:"relative",
    zIndex:3,
    margin:"12px auto"
  }}>
    <h2 style={{margin:0,marginBottom:8,fontSize:26,fontWeight:900,color:theme.rosa}}>{title}</h2>
    {subtitle && <p style={{marginTop:0,marginBottom:16,color:theme.azul}}>{subtitle}</p>}
    {children}
  </div>
);

export const Btn: React.FC<{
  onClick?:()=>void;
  bg?:string;
  fg?:string;
  label:string;
  full?:boolean;
  disabled?:boolean;
  variant?:"solid"|"outline";
}> = ({onClick,bg=theme.azul,fg=theme.blanco,label,full=true,disabled,variant="solid"}) => (
  <button
    onClick={()=>onClick?.()}
    disabled={disabled}
    style={{
      width: full ? "100%" : undefined,
      padding:"12px 16px",
      borderRadius:14,
      border: variant==="outline" ? `2px solid ${theme.azul}` : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight:800,
      letterSpacing:.2,
      background: disabled ? "#cfd8dc" : (variant==="outline" ? "transparent" : bg),
      color: disabled ? "#607d8b" : (variant==="outline" ? theme.azul : fg),
      boxShadow: variant==="outline" ? "none" : "0 6px 12px rgba(0,0,0,.12)",
      transition:"transform .06s ease, opacity .15s ease, box-shadow .15s ease",
      whiteSpace:"nowrap"
    }}
    onMouseDown={e=>!disabled&&(e.currentTarget.style.transform="scale(.98)")}
    onMouseUp={e=>!disabled&&(e.currentTarget.style.transform="scale(1)")}
    onMouseEnter={e=>{ if(!disabled&&variant==="solid") e.currentTarget.style.boxShadow="0 8px 16px rgba(0,0,0,.16)"; }}
    onMouseLeave={e=>{ if(!disabled&&variant==="solid") e.currentTarget.style.boxShadow="0 6px 12px rgba(0,0,0,.12)"; }}
  >
    {label}
  </button>
);

export default { Btn, Card };
