-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "esAdmin" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "salas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "anfitrionId" INTEGER NOT NULL,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "faseActual" TEXT NOT NULL DEFAULT 'lobby',
    "timerCorriendo" BOOLEAN NOT NULL DEFAULT false,
    "segundosRestantes" INTEGER NOT NULL DEFAULT 0,
    "t_rompehielo" INTEGER NOT NULL DEFAULT 180,
    "t_diferencias" INTEGER NOT NULL DEFAULT 300,
    "t_empatia" INTEGER NOT NULL DEFAULT 300,
    "t_creatividad" INTEGER NOT NULL DEFAULT 900,
    "t_pitch_prep" INTEGER NOT NULL DEFAULT 600,
    "t_pitch_fuego" INTEGER NOT NULL DEFAULT 90,
    CONSTRAINT "salas_anfitrionId_fkey" FOREIGN KEY ("anfitrionId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "salaId" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "desafioId" INTEGER,
    "mapaEmpatia" TEXT,
    "fotoLegoUrl" TEXT,
    "feedbackData" TEXT,
    CONSTRAINT "equipos_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "salas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "equipos_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES "desafios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "integrantes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "carrera" TEXT,
    "equipoId" INTEGER NOT NULL,
    CONSTRAINT "integrantes_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origenId" INTEGER NOT NULL,
    "destinoId" INTEGER NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "detalleJson" TEXT NOT NULL,
    "comentario" TEXT,
    CONSTRAINT "evaluaciones_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evaluaciones_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reflexiones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipoId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    CONSTRAINT "reflexiones_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "eventos_analitica" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "fase" TEXT,
    "detalle" TEXT,
    "salaId" INTEGER NOT NULL,
    "equipoId" INTEGER,
    CONSTRAINT "eventos_analitica_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "salas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "eventos_analitica_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "temas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "personaNombre" TEXT,
    "personaBio" TEXT,
    "personaImg" TEXT
);

-- CreateTable
CREATE TABLE "desafios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imgUrl" TEXT,
    "temaId" TEXT NOT NULL,
    CONSTRAINT "desafios_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "temas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "config_ruleta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "peso" INTEGER NOT NULL,
    "color" TEXT
);

-- CreateTable
CREATE TABLE "config_checklist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "esFijo" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "salas_codigo_key" ON "salas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_salaId_nombre_key" ON "equipos"("salaId", "nombre");

-- CreateIndex
CREATE INDEX "eventos_analitica_tipo_timestamp_idx" ON "eventos_analitica"("tipo", "timestamp");
