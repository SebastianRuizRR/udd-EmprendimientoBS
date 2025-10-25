-- CreateTable
CREATE TABLE `Profesor` (
    `idProfesor` VARCHAR(50) NOT NULL,
    `correo` VARCHAR(50) NULL,
    `contrasena` VARCHAR(60) NOT NULL,

    PRIMARY KEY (`idProfesor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sala` (
    `idSala` VARCHAR(10) NOT NULL,
    `fecha` DATE NOT NULL,
    `profesorId` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`idSala`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipo` (
    `idEquipo` INTEGER NOT NULL AUTO_INCREMENT,
    `idSala` VARCHAR(10) NOT NULL,
    `nombreEquipo` VARCHAR(50) NOT NULL,
    `tokens` INTEGER NOT NULL DEFAULT 0,

    INDEX `Equipo_idSala_idx`(`idSala`),
    PRIMARY KEY (`idEquipo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estudiante` (
    `idEstudiante` INTEGER NOT NULL AUTO_INCREMENT,
    `idEquipo` INTEGER NOT NULL,
    `nombreEstudiante` VARCHAR(50) NOT NULL,
    `carrera` VARCHAR(50) NOT NULL,

    INDEX `Estudiante_idEquipo_idx`(`idEquipo`),
    PRIMARY KEY (`idEstudiante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Sala` ADD CONSTRAINT `Sala_profesorId_fkey` FOREIGN KEY (`profesorId`) REFERENCES `Profesor`(`idProfesor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipo` ADD CONSTRAINT `Equipo_idSala_fkey` FOREIGN KEY (`idSala`) REFERENCES `Sala`(`idSala`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_idEquipo_fkey` FOREIGN KEY (`idEquipo`) REFERENCES `Equipo`(`idEquipo`) ON DELETE CASCADE ON UPDATE CASCADE;
