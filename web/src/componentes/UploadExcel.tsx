import React from "react";
import * as XLSX from "xlsx";
import type { Student } from "../types";

type Props = {
  onLoaded: (alumnos: Student[]) => void;
  accept?: string;
};

const UploadExcel: React.FC<Props> = ({ onLoaded, accept = ".xlsx,.xls" }) => {
  const handleFile = async (f: File) => {
    const data = await f.arrayBuffer();
    const wb = XLSX.read(data, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    // Espera columnas: RUT | NOMBRE (o Nombre) | CARRERA (si no está, queda vacía)
    const alumnos: Student[] = rows.map((r) => ({
      rut: r["RUT"] || r["Rut"] || r["rut"] || "",
      nombre: r["NOMBRE"] || r["Nombre"] || r["nombre"] || "",
      carrera: r["CARRERA"] || r["Carrera"] || r["carrera"] || "",
    })).filter(a => a.nombre?.trim());

    onLoaded(alumnos);
  };

  return (
    <label style={{ display: "block" }}>
      <input
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div style={{
        padding: 12,
        borderRadius: 12,
        border: "2px dashed #E3E8EF",
        background: "#fff",
        textAlign: "center",
        cursor: "pointer",
        fontWeight: 800
      }}>
        📄 Subir Excel (XLSX/XLS)
      </div>
    </label>
  );
};

export default UploadExcel;
