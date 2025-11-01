import React from "react";
import type { Student } from "../types";

type Props = {
  onLoaded: (alumnos: Student[]) => void;
  /** Extensiones aceptadas (incluye CSV además de Excel) */
  accept?: string;
  /** Tamaño máximo (MB) */
  maxMB?: number;
};

/** Sanitizar strings: corta largo y remueve caracteres de control */
const clampStr = (s: unknown, max = 300) =>
  String(s ?? "")
    .slice(0, max)
    .replace(/[\u0000-\u001F\u007F]/g, "");

const normalizaAlumno = (r: Record<string, any>): Student => ({
  rut: clampStr(r["RUT"] ?? r["Rut"] ?? r["rut"] ?? ""),
  nombre: clampStr(r["NOMBRE"] ?? r["Nombre"] ?? r["nombre"] ?? ""),
  carrera: clampStr(r["CARRERA"] ?? r["Carrera"] ?? r["carrera"] ?? "")
});

const isCSV = (f: File) => /\.csv$/i.test(f.name) || f.type === "text/csv";
const isExcel = (f: File) =>
  /\.xlsx$/i.test(f.name) ||
  /\.xls$/i.test(f.name) ||
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
  ].includes(f.type);

const UploadExcel: React.FC<Props> = ({
  onLoaded,
  accept = ".xlsx,.xls,.csv",
  maxMB = 5
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const handlePick = () => inputRef.current?.click();

  const parseCSV = async (file: File): Promise<Record<string, any>[]> => {
    const Papa = (await import("papaparse")).default;
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => resolve(res.data as Record<string, any>[]),
        error: (err) => reject(err)
      });
    });
  };

  const parseExcel = async (file: File): Promise<Record<string, any>[]> => {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();

    // Leer como ArrayBuffer y cargar
    const buf = await file.arrayBuffer();
    // Nota: .xlsx es soportado. Para .xls antiguos ExcelJS no siempre funciona;
    // si te pasan .xls y falla, conviene pedir que exporten a .xlsx o usar un conversor.
    await wb.xlsx.load(buf);

    const sheet = wb.worksheets[0];
    if (!sheet) return [];

    // Tomamos la primera fila como encabezados
    const rows: Record<string, any>[] = [];
    const headerRow = sheet.getRow(1);
    const headers: string[] = [];

    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = clampStr(cell.value);
    });

    // Recorremos desde la fila 2
    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      // Salta filas vacías
      if (!row || row.actualCellCount === 0) continue;

      const obj: Record<string, any> = {};
      for (let c = 1; c <= headers.length; c++) {
        const key = headers[c - 1] ?? `Col${c}`;
        const cellVal = row.getCell(c)?.value;
        // ExcelJS puede devolver objetos (RichText, Formula, Date…)
        let v: any = cellVal;
        if (typeof cellVal === "object" && cellVal && "text" in (cellVal as any)) {
          v = (cellVal as any).text; // RichText
        }
        obj[key] = v ?? "";
      }
      rows.push(obj);
    }
    return rows;
  };

  const handleFile = async (file: File) => {
    try {
      setError(null);
      setBusy(true);

      // Validaciones
      const sizeOK = file.size <= maxMB * 1024 * 1024;
      if (!sizeOK) {
        setError(`El archivo excede ${maxMB} MB.`);
        return;
      }
      const tipoOK = isCSV(file) || isExcel(file);
      if (!tipoOK) {
        setError("Tipo no permitido. Usa .xlsx, .xls o .csv.");
        return;
      }

      let rows: Record<string, any>[] = [];
      if (isCSV(file)) {
        rows = await parseCSV(file);
      } else {
        rows = await parseExcel(file);
      }

      // Normaliza + filtra (se requiere nombre)
      const alumnos = rows.map(normalizaAlumno).filter(a => a.nombre.trim().length > 0);
      onLoaded(alumnos);
    } catch (e: any) {
      console.error(e);
      setError("No se pudo procesar el archivo. Verifica formato y contenido.");
    } finally {
      setBusy(false);
      // Permitir re-subir el mismo archivo
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <label style={{ display: "block" }}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <div
        onClick={handlePick}
        style={{
          padding: 12,
          borderRadius: 12,
          border: "2px dashed #E3E8EF",
          background: "#fff",
          textAlign: "center",
          cursor: "pointer",
          fontWeight: 800,
          opacity: busy ? 0.7 : 1
        }}
      >
        {busy ? "Procesando..." : "📄 Subir Excel/CSV"}
      </div>
      {error && (
        <div style={{ color: "#b00020", marginTop: 8 }}>
          {error}
        </div>
      )}
    </label>
  );
};

export default UploadExcel;
