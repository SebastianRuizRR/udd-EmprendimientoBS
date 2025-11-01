import React from "react";

type Integrante = { nombre: string; carrera: string };
type Team = { roomCode: string; teamName: string; integrantes: Integrante[]; ts: number };

type Props = {
  activeRoom: string;
  teams: Team[];
  readySet: Set<string>;
  border: string;
  azul: string;
  muted: string;
  panelBox: React.CSSProperties;
  badgeTitle: React.CSSProperties;
};

const TeamListProfesor: React.FC<Props> = ({
  activeRoom, teams, readySet, border, azul, muted, panelBox, badgeTitle
}) => {
  const roomTeams = teams.filter(t => t.roomCode === activeRoom);

  if (!activeRoom) {
    return <div style={panelBox as React.CSSProperties}>
      <div style={badgeTitle}>👥 Equipos (sala)</div>
      <div style={{opacity:.7}}>Crea una sala para ver los equipos.</div>
    </div>;
  }

  if (roomTeams.length === 0) {
    return <div style={panelBox as React.CSSProperties}>
      <div style={badgeTitle}>👥 Equipos (sala {activeRoom})</div>
      <div style={{opacity:.7}}>Aún no hay equipos.</div>
    </div>;
  }

  return (
    <div style={{display:"grid",gap:12}}>
      <div style={panelBox as React.CSSProperties}>
        <div style={badgeTitle}>👥 Equipos en sala {activeRoom}</div>
        <div style={{display:"grid",gap:10}}>
          {roomTeams.map((t, i) => {
            const isReady = readySet.has(t.teamName);
            return (
              <div key={i} style={{border:`1px solid ${border}`, borderRadius:12, padding:10}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center"}}>
                  <div style={{fontWeight:800, color: azul}}>
                    {t.teamName} {isReady ? "✅" : "⏳"}
                  </div>
                  <div style={{fontSize:12, color: muted}}>
                    {new Date(t.ts).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{marginTop:8, display:"grid", gap:4}}>
                  {t.integrantes?.length ? t.integrantes.map((p, j) => (
                    <div key={j}>• <b>{p.nombre}</b>{p.carrera ? ` — ${p.carrera}` : ""}</div>
                  )) : <div style={{opacity:.7}}>— sin integrantes aún —</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamListProfesor;
