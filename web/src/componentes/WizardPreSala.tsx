import React, { useMemo, useState } from "react";
import UploadExcel from "./UploadExcel";
import { recomendarEquipos, armarGrupos } from "../utilidades/grupos";
import { zonaSegunIndice } from "../utilidades/grupos";
import type { Student, PreSalaPayload } from "../types";

type Props = {
  theme: any;
  baseInput: React.CSSProperties;
  panelBox: React.CSSProperties;
  Btn: React.FC<any>;
  publishFlow: (patch: any) => void;
  writeJSON: (k: string, v: any) => void;
  generateCode: () => string;
};

const STUDENTS_KEY = "udd_students_by_room_v1";   // { [roomCode]: Student[] }
const PREGROUPS_KEY = "udd_pre_groups_by_room_v1"; // { [roomCode]: GrupoArmado[] }

const WizardPreSala: React.FC<Props> = ({
  theme, baseInput, panelBox, Btn, publishFlow, writeJSON, generateCode
}) => {
  const [alumnos, setAlumnos] = useState<Student[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [preArmar, setPreArmar] = useState<boolean>(true);
  const [equipos, setEquipos] = useState<number>(4);

  const rec = useMemo(() => recomendarEquipos(total || alumnos.length || 0), [total, alumnos]);
  const equiposSugeridos = rec.equipos;

  React.useEffect(() => {
    setEquipos(equiposSugeridos);
  }, [equiposSugeridos]);

  const crearSala = () => {
    const code = generateCode();
    const lista = alumnos.length ? alumnos : Array.from({ length: total || 0 }).map((_, i) => ({
      nombre: `Alumno ${i + 1}`, carrera: ""
    }));

    // guarda lista
    const mapStudents = JSON.parse(localStorage.getItem(STUDENTS_KEY) || "{}");
    mapStudents[code] = lista;
    writeJSON(STUDENTS_KEY, mapStudents);

    // si pre-arma, guarda grupos
    if (preArmar) {
      const grupos = armarGrupos(lista, equipos);
      const mapGroups = JSON.parse(localStorage.getItem(PREGROUPS_KEY) || "{}");
      mapGroups[code] = grupos;
      writeJSON(PREGROUPS_KEY, mapGroups);
    }

    // publica flow para la app
    publishFlow({
      roomCode: code,
      expectedTeams: equipos,
      step: "lobby",
      running: false,
      remaining: 5 * 60
    });
    alert(`Sala creada: ${code}\nEquipos esperados: ${equipos}\nPre-armado: ${preArmar ? "Sí" : "No"}`);
  };

  return (
    <div style={{ ...panelBox, textAlign: "left" }}>
      <div style={{ fontWeight: 900, color: theme.azul, marginBottom: 6 }}>
        Pre-Crear Sala (Profesor)
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>1) Subir Excel de alumnos (opcional)</div>
          <UploadExcel onLoaded={(lista) => {
            setAlumnos(lista);
            setTotal(lista.length);
          }} />
          <div style={{ fontSize: 12, opacity: .75, marginTop: 8 }}>
            Columnas esperadas: RUT | NOMBRE | CARRERA
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>2) Total alumnos</div>
            <input
              type="number"
              value={total}
              onChange={e => setTotal(Math.max(0, Number(e.target.value || 0)))}
              style={baseInput}
              placeholder="Ej. 32"
            />
            <div style={{ fontSize: 12, opacity: .75, marginTop: 6 }}>
              Si subiste Excel no es necesario, se toma el largo del archivo.
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>3) ¿Pre-armar grupos?</div>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={preArmar} onChange={() => setPreArmar(v => !v)} />
              <span>Sí, quiero que lleguen con grupos listos y zonas en la sala</span>
            </label>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Recomendación</div>
          <div style={{
            padding: 10, border: `1px solid ${theme.border}`, borderRadius: 12, background: "#fff"
          }}>
            <div><b>Sugerencia:</b> {rec.nota}</div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontWeight: 800 }}>Equipos esperados</label>
              <select value={String(equipos)} onChange={e => setEquipos(Number(e.target.value))} style={{ ...baseInput, marginTop: 6 }}>
                {[3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 12, opacity: .75, marginTop: 6 }}>
              Máximo deseado ≈ 9 alumnos por equipo.
            </div>

            {preArmar && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Vista previa de zonas</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {Array.from({ length: equipos }).map((_, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8 }}>
                      <b>Equipo {i + 1}</b>
                      <div>{zonaSegunIndice(i)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 8 }}>
            <Btn label="Crear Sala" onClick={crearSala} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardPreSala;
export { STUDENTS_KEY, PREGROUPS_KEY };
