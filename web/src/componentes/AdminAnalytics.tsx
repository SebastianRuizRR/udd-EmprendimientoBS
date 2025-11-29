import React from "react";

/* ===================== TYPES & HELPERS (lib-safe) ===================== */
// Evita depender de lib ES2017+ si tu tsconfig es antiguo
function entries<T extends Record<string, any>>(obj: T): [string, any][] {
  return Object.keys(obj).map((k) => [k, (obj as any)[k]]);
}
const pad2 = (v: number | string) => {
    const s = String(v);
    return s.length >= 2 ? s : "0" + s;
  };
  
// Tipos auxiliares para map/reduce tipados
type EntryNum = [string, number];
type EntryTime = [string, number[]];
type EntryPhaseAgg = [string, { completed: number; total: number }];
type PieDatum = { label: string; value: number };

/* ===================== THEME ===================== */
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

type TimeRange = "semester" | "year" | "all";

/* ===================== ANALYTICS MODEL ===================== */
// Estructura de evento que consume este panel
type AnalyticEvent = {
  ts: number;
  type: string;
  phase?: string;
  activity?: string;
  team?: string;
  user?: string;
  value?: number;
  durationMs?: number;
};

const ANALYTICS_KEY = "ANALYTICS_KEY";

/* ===================== MOCK + LECTURA ===================== */
function makeMockData(): AnalyticEvent[] {
  const now = Date.now();
  const days = 365;
  const phases = ["f1","f2","f3","f4","f5"];
  const activities = ["spot","empathy","soup","pitch","theme"];
  const teams = ["Equipo A","Equipo B","Equipo C","Equipo D","Equipo E"];
  const res: AnalyticEvent[] = [];
  for (let i=0;i<950;i++){
    const d = Math.floor(Math.random()*days);
    const ts = now - d*24*3600*1000 + Math.floor(Math.random()*5_000_000);
    const phase = phases[Math.floor(Math.random()*phases.length)];
    const activity = activities[Math.floor(Math.random()*activities.length)];
    const team = teams[Math.floor(Math.random()*teams.length)];
    const completed = Math.random()>0.22;
    res.push(
      { ts, type:"join", team },
      { ts, type:"activity_start", phase, activity, team },
      { ts: ts + Math.floor(Math.random()*18+2)*60*1000, type: completed?"activity_end":"activity_abort", phase, activity, team, durationMs: Math.floor(Math.random()*12+4)*60*1000 },
      { ts, type:"interact", phase, activity, team, value: Math.floor(Math.random()*5)+1 },
    );
  }
  return res.sort((a,b)=>a.ts-b.ts);
}

function readAnalytics(): AnalyticEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return makeMockData();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return makeMockData();
    return arr as AnalyticEvent[];
  } catch { return makeMockData(); }
}

/* ===================== FILTRO DE TIEMPO ===================== */
function filterByRange(data: AnalyticEvent[], range: TimeRange): AnalyticEvent[] {
  if (range === "all") return data;
  const days = range === "year" ? 365 : 182;
  const since = Date.now() - days*24*3600*1000;
  return data.filter(d=>d.ts >= since);
}

/* ===================== AGREGACIONES ===================== */
type Aggregates = {
  byActivityCount: Record<string, number>;
  timelineParticipation: { day: string; count: number }[];
  completionByPhase: { phase: string; completionRate: number; completed: number; total: number }[];
  avgTimeByPhase: { phase: string; avgMin: number }[];
  topTeamsInteraction: { team: string; score: number }[];
};

function formatDay(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = pad2(d.getMonth()+1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function computeAggregates(data: AnalyticEvent[]): Aggregates {
  const byActivityCount: Record<string, number> = {};
  const timelineBucket: Record<string, number> = {};
  const perPhaseTot: Record<string, { completed: number; total: number }> = {};
  const timeByPhase: Record<string, number[]> = {};
  const teamScore: Record<string, number> = {};

  for (const ev of data) {
    // participación (joins) por día
    if (ev.type === "join") {
      const k = formatDay(ev.ts);
      timelineBucket[k] = (timelineBucket[k] || 0) + 1;
      if (ev.team) teamScore[ev.team] = (teamScore[ev.team] || 0) + 1;
    }
    // desafíos usados
    if (ev.type === "activity_start" || ev.type === "activity_end" || ev.type === "activity_abort") {
      const act = ev.activity || "actividad";
      byActivityCount[act] = (byActivityCount[act] || 0) + 1;
    }
    // completitud por fase
    if ((ev.type === "activity_end" || ev.type === "activity_abort") && ev.phase) {
      const p = ev.phase;
      perPhaseTot[p] = perPhaseTot[p] || { completed: 0, total: 0 };
      perPhaseTot[p].total += 1;
      if (ev.type === "activity_end") perPhaseTot[p].completed += 1;
    }
    // tiempo promedio por fase
    if ((ev.type === "activity_end" || ev.type === "activity_abort") && ev.phase && typeof ev.durationMs === "number") {
      const p = ev.phase;
      timeByPhase[p] = timeByPhase[p] || [];
      timeByPhase[p].push(ev.durationMs);
    }
    // interacción por equipo
    if (ev.type === "interact" && ev.team && typeof ev.value === "number") {
      teamScore[ev.team] = (teamScore[ev.team] || 0) + ev.value;
    }
  }

  const timelineParticipation = entries(timelineBucket)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]: EntryNum) => ({ day, count }));

  const completionByPhase = entries(perPhaseTot)
    .map(([phase, v]: EntryPhaseAgg) => ({
      phase,
      completionRate: v.total ? Math.round((v.completed / v.total) * 100) : 0,
      completed: v.completed,
      total: v.total,
    }))
    .sort((a, b) => a.phase.localeCompare(b.phase));

  const avgTimeByPhase = entries(timeByPhase)
    .map(([phase, arr]: EntryTime) => {
      const avgMs = arr.reduce((s: number, x: number) => s + x, 0) / arr.length;
      return { phase, avgMin: Math.round(avgMs / 60000) };
    })
    .sort((a, b) => a.phase.localeCompare(b.phase));

  const topTeamsInteraction = entries(teamScore)
    .map(([team, score]: EntryNum) => ({ team, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    byActivityCount,
    timelineParticipation,
    completionByPhase,
    avgTimeByPhase,
    topTeamsInteraction,
  };
}

/* ===================== CHARTS (SVG puros) ===================== */
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

const HBarChart: React.FC<{ data: { label: string; value: number }[]; height?: number; }> = ({ data, height=220 }) => {
  const max = Math.max(...data.map(d=>d.value), 1);
  const rowH = 30; const width = 380; const totalH = Math.max(height, data.length * (rowH+14) + 10);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${totalH}`} style={{maxWidth: width}}>
      {data.map((d: {label:string; value:number}, i: number) => {
        const w = (d.value/max) * (width - 120);
        const y = 10 + i*(rowH+14);
        return (
          <g key={i}>
            <text x={10} y={y+18} fontSize="12" fill="#345">{d.label}</text>
            <rect x={110} y={y} width={w} height={rowH} rx={10} fill={defaultTheme.verde} opacity={0.9}/>
            <text x={110 + w + 6} y={y+18} fontSize="12" fill="#123">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

const LineChart: React.FC<{ data: { x: string; y: number }[]; height?: number; }> = ({ data, height=180 }) => {
  if (!data.length) return null;
  const width = Math.max(360, data.length * 24 + 60);
  const maxY = Math.max(...data.map(d=>d.y), 1);
  const pts = data.map((d, i) => {
    const x = 30 + i * ((width-60)/Math.max(1, data.length-1));
    const y = 10 + (1 - d.y/maxY) * (height-20);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{maxWidth: width}}>
      <polyline fill="none" stroke={defaultTheme.morado} strokeWidth={3} points={pts} opacity={0.9}/>
      {data.map((d, i) => {
        const x = 30 + i * ((width-60)/Math.max(1, data.length-1));
        const y = 10 + (1 - d.y/maxY) * (height-20);
        return <circle key={i} cx={x} cy={y} r={3.5} fill={defaultTheme.morado}/>;
      })}
      {data.map((d, i) => i%Math.ceil(data.length/8)===0 ? (
        <text key={`t${i}`} x={30 + i*((width-60)/Math.max(1, data.length-1))} y={height-2} fontSize="10" textAnchor="middle" fill="#456">{d.x.slice(5)}</text>
      ) : null)}
    </svg>
  );
};

/* ===================== SELECTOR DE RANGO ===================== */
const RangeSelect: React.FC<{ value: TimeRange; onChange: (v:TimeRange)=>void; }> = ({ value, onChange }) => (
  <div style={{display:"grid", gridAutoFlow:"column", gap:8, alignItems:"center"}}>
    <button onClick={()=>onChange("semester")} style={segBtn(value==="semester")}>Último semestre</button>
    <button onClick={()=>onChange("year")} style={segBtn(value==="year")}>Último año</button>
    <button onClick={()=>onChange("all")} style={segBtn(value==="all")}>Histórico</button>
  </div>
);
function segBtn(active:boolean): React.CSSProperties {
  return {
    padding:"8px 12px", borderRadius:12,
    border:`1px solid ${active?defaultTheme.azul:defaultTheme.border}`,
    background: active? "rgba(25,118,210,.10)" : "#FFF",
    color: active? "#0B3A8A" : "#233", fontWeight:700, cursor:"pointer",
  };
}

/* ===================== PANEL ADMIN ===================== */
const AdminAnalytics: React.FC = () => {
  const [range, setRange] = React.useState<TimeRange>("semester");
  const raw = React.useMemo(()=>readAnalytics(), []);
  const filtered = React.useMemo(()=>filterByRange(raw, range), [raw, range]);
  const agg = React.useMemo(()=>computeAggregates(filtered), [filtered]);

  // Datos tipados para charts
  const pieData: PieDatum[] = entries(agg.byActivityCount)
    .sort((a: EntryNum, b: EntryNum)=>b[1]-a[1])
    .slice(0,6)
    .map(([label, value]: EntryNum) => ({ label, value }));

  const lineData: { x: string; y: number }[] =
    agg.timelineParticipation.map(d => ({ x: d.day, y: d.count }));

  const compBars: { label: string; value: number }[] =
    agg.completionByPhase.map(x => ({ label: x.phase, value: x.completionRate }));

  const timeHBar: { label: string; value: number }[] =
    agg.avgTimeByPhase.map(x => ({ label: x.phase, value: x.avgMin }));

  const topTeams: { label: string; value: number }[] =
    agg.topTeamsInteraction.map(x => ({ label: x.team, value: x.score }));

  return (
    <div style={{display:"grid", gap:16, padding:"clamp(10px, 2.6vw, 18px)"}}>
      {/* Header + rango */}
      <div style={{display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center"}}>
        <h2 style={{margin:0, fontSize:"clamp(18px,3vw,22px)"}}>📊 Panel de Analítica</h2>
        <RangeSelect value={range} onChange={setRange}/>
      </div>

      {/* Grid responsive */}
      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))"}}>
        <Card title="Desafíos más usados">
          <div style={{display:"grid", gridTemplateColumns:"minmax(220px, 1fr) 1fr", gap:12, alignItems:"center"}}>
            <PieChart data={pieData.length? pieData : [{label:"—", value:1}]}/>
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
        </Card>

        <Card title="Participación por día">
          <LineChart data={lineData}/>
          <div style={{fontSize:12, color:"#567"}}>Cantidad de uniones/participaciones registradas por día</div>
        </Card>

        <Card title="Tasa de completitud por fase">
          <BarChart data={compBars}/>
          <div style={{fontSize:12, color:"#567"}}>% de actividades finalizadas sobre total por fase</div>
        </Card>

        <Card title="Tiempo promedio por fase (min)">
          <HBarChart data={timeHBar}/>
          <div style={{fontSize:12, color:"#567"}}>Duración promedio de actividades (END o ABORT)</div>
        </Card>

        <Card title="Top equipos por interacción">
          <BarChart data={topTeams}/>
          <div style={{fontSize:12, color:"#567"}}>Suma de interacciones (clicks, aportes, etc.)</div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
