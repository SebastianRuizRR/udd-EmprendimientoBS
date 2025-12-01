import React from "react";

/* ===================== TYPES & THEME ===================== */
const defaultTheme = {
  rosa: "#E91E63",
  azul: "#1976D2",
  verde: "#2E7D32",
  naranja: "#F57C00",
  morado: "#7B1FA2",
  cian: "#00BCD4",
  texto: "#0B1B3F",
  border: "#E3E8EF",
  blanco: "#FFFFFF",
  shadow: "0 16px 36px rgba(16,24,40,.14)",
};

type PieDatum = { label: string; value: number };

// Propiedades que recibe desde AdminDashboard
interface Props {
  realData?: {
    users: number;
    rooms: number;
    teams: number;
    challenges: Record<string, number>;
  };
}

/* ===================== CHARTS (SVG puros - Tus componentes originales) ===================== */
const Card: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode; }> = ({ title, children, right }) => (
  <div style={{
    border:`1px solid ${defaultTheme.border}`,
    borderRadius:20, background:defaultTheme.blanco, boxShadow:defaultTheme.shadow,
    padding:"clamp(12px,2.6vw,18px)", display:"grid", gap:10
  }}>
    <div style={{display:"grid", gridTemplateColumns:right?"1fr auto":"1fr", alignItems:"center"}}>
      <h3 style={{margin:0,fontSize:"clamp(16px,2.6vw,18px)"}}>{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const PieChart: React.FC<{ data: PieDatum[]; size?: number; }> = ({ data, size=220 }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size/2;
  let ang = -Math.PI/2;
  const colors = [defaultTheme.azul, defaultTheme.rosa, defaultTheme.naranja, defaultTheme.verde, defaultTheme.morado, defaultTheme.cian];
  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{maxWidth: size}}>
      <g transform={`translate(${r},${r})`}>
        {data.map((d: PieDatum, i: number) => {
          const slice = (d.value/total) * Math.PI * 2;
          const x1 = Math.cos(ang)*r, y1 = Math.sin(ang)*r;
          const x2 = Math.cos(ang+slice)*r, y2 = Math.sin(ang+slice)*r;
          const large = slice > Math.PI ? 1 : 0;
          const path = `M0,0 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
          ang += slice;
          return <path key={i} d={path} fill={colors[i%colors.length]} opacity={0.9}/>;
        })}
      </g>
    </svg>
  );
};

const BarChart: React.FC<{ data: { label: string; value: number }[]; height?: number; }> = ({ data, height=180 }) => {
  const max = Math.max(...data.map(d=>d.value), 1);
  const barW = Math.max(16, 280/Math.max(3, data.length));
  const width = Math.max(320, barW*data.length + 40);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height+40}`} style={{maxWidth: width}}>
      {data.map((d: {label: string; value: number}, i: number)=>{
        const h = (d.value/max) * height; const x = 20 + i*barW; const y = height - h + 10;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW*0.7} height={h} rx={8} fill={defaultTheme.azul} opacity={0.9}/>
            <text x={x + barW*0.35} y={height+30} textAnchor="middle" fontSize="11" fill="#345">{d.label}</text>
            <text x={x + barW*0.35} y={y-6} textAnchor="middle" fontSize="11" fill="#123">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ===================== PANEL ANALYTICS CONECTADO ===================== */
const AdminAnalytics: React.FC<Props> = ({ realData }) => {
  
  // 1. Datos por defecto si no ha cargado
  const stats = realData || { users: 0, rooms: 0, teams: 0, challenges: {} };

  // 2. Preparar datos para el gráfico de torta (Desafíos)
  const pieData: PieDatum[] = Object.entries(stats.challenges).map(([key, count]) => {
      // key viene como "salud#0", lo limpiamos visualmente
      const [tema, idx] = key.split("#");
      return { 
          label: `${tema.charAt(0).toUpperCase() + tema.slice(1)} ${Number(idx)+1}`, 
          value: count as number 
      };
  }).sort((a,b) => b.value - a.value);

  // 3. Preparar datos para gráfico de barras (Resumen General)
  const generalData = [
      { label: "Profesores", value: stats.users },
      { label: "Salas", value: stats.rooms },
      { label: "Equipos", value: stats.teams },
  ];

  return (
    <div style={{display:"grid", gap:16, padding:"clamp(10px, 2.6vw, 18px)"}}>
      <div style={{display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center"}}>
        <h2 style={{margin:0, fontSize:"clamp(18px,3vw,22px)"}}>📊 Analítica en Tiempo Real</h2>
        <div style={{fontSize:12, color:"#666", background:"#f5f5f5", padding:"4px 8px", borderRadius:8}}>
            Datos directos de Base de Datos
        </div>
      </div>

      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))"}}>
        
        {/* TARJETA 1: DESAFÍOS MÁS USADOS (Pie Chart) */}
        <Card title="Desafíos más seleccionados">
          {pieData.length > 0 ? (
            <div style={{display:"grid", gridTemplateColumns:"minmax(220px, 1fr) 1fr", gap:12, alignItems:"center"}}>
                <PieChart data={pieData}/>
                <div style={{display:"grid", gap:6}}>
                {pieData.map((d: PieDatum, i: number)=>(
                    <div key={i} style={{display:"grid", gridTemplateColumns:"auto 1fr auto", gap:8, alignItems:"center"}}>
                    <span style={{
                        width:12, height:12, borderRadius:3,
                        background: [defaultTheme.azul, defaultTheme.rosa, defaultTheme.naranja, defaultTheme.verde, defaultTheme.morado, defaultTheme.cian][i%6]
                    }}/>
                    <div style={{fontSize:13, color:"#223"}}>{d.label}</div>
                    <div style={{fontSize:12, color:"#456"}}>{d.value}</div>
                    </div>
                ))}
                </div>
            </div>
          ) : (
            <div style={{padding: 20, textAlign:'center', color:'#888', fontStyle:'italic'}}>
                Aún no hay datos de desafíos seleccionados.
            </div>
          )}
        </Card>

        {/* TARJETA 2: RESUMEN GENERAL (Bar Chart) */}
        <Card title="Métricas Globales del Sistema">
          <BarChart data={generalData} height={200}/>
          <div style={{fontSize:12, color:"#567", marginTop:10, textAlign:'center'}}>
              Total histórico de registros en la plataforma
          </div>
        </Card>

        {/* NOTA: Ocultamos temporalmente los gráficos de "Tiempo" y "Línea de tiempo" 
            porque el backend aún no envía esos datos históricos detallados. 
            Cuando agregues más métricas al backend, puedes descomentarlos aquí. */}
            
      </div>
    </div>
  );
};

export default AdminAnalytics;