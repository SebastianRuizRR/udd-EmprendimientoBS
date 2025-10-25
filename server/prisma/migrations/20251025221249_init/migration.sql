-- CreateTable
CREATE TABLE "Profesor" (
    "idProfesor" TEXT NOT NULL PRIMARY KEY,
    "correo" TEXT,
    "contrasena" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sala" (
    "idSala" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "profesorId" TEXT,
    CONSTRAINT "Sala_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor" ("idProfesor") ON DELETE SET NULL ON UPDATE CASCADE
);
