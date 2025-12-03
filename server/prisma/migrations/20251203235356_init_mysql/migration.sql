-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `esAdmin` BOOLEAN NOT NULL DEFAULT false,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `anfitrionId` INTEGER NOT NULL,
    `datosJuego` JSON NULL,
    `creadaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(191) NOT NULL DEFAULT 'ACTIVA',
    `faseActual` VARCHAR(191) NOT NULL DEFAULT 'lobby',
    `timerCorriendo` BOOLEAN NOT NULL DEFAULT false,
    `segundosRestantes` INTEGER NOT NULL DEFAULT 0,
    `formacion` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `t_rompehielo` INTEGER NOT NULL DEFAULT 180,
    `t_diferencias` INTEGER NOT NULL DEFAULT 300,
    `t_empatia` INTEGER NOT NULL DEFAULT 300,
    `t_creatividad` INTEGER NOT NULL DEFAULT 900,
    `t_pitch_prep` INTEGER NOT NULL DEFAULT 600,
    `t_pitch_fuego` INTEGER NOT NULL DEFAULT 90,

    UNIQUE INDEX `salas_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `salaId` INTEGER NOT NULL,
    `puntos` INTEGER NOT NULL DEFAULT 0,
    `desafioId` INTEGER NULL,
    `listo` BOOLEAN NOT NULL DEFAULT false,
    `mapaEmpatia` TEXT NULL,
    `feedbackData` TEXT NULL,
    `fotoLegoUrl` LONGTEXT NULL,

    UNIQUE INDEX `equipos_salaId_nombre_key`(`salaId`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `integrantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `carrera` VARCHAR(191) NULL,
    `equipoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `origenId` INTEGER NOT NULL,
    `destinoId` INTEGER NOT NULL,
    `puntaje` INTEGER NOT NULL,
    `detalleJson` TEXT NOT NULL,
    `comentario` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reflexiones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `equipoId` INTEGER NOT NULL,
    `texto` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos_analitica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipo` VARCHAR(191) NOT NULL,
    `fase` VARCHAR(191) NULL,
    `detalle` TEXT NULL,
    `salaId` INTEGER NOT NULL,
    `equipoId` INTEGER NULL,

    INDEX `eventos_analitica_tipo_timestamp_idx`(`tipo`, `timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `temas` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `personaNombre` VARCHAR(191) NULL,
    `personaBio` TEXT NULL,
    `personaImg` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `desafios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `imgUrl` LONGTEXT NULL,
    `temaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_ruleta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `delta` INTEGER NOT NULL,
    `peso` INTEGER NOT NULL,
    `color` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_checklist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `valor` INTEGER NOT NULL,
    `esFijo` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `salas` ADD CONSTRAINT `salas_anfitrionId_fkey` FOREIGN KEY (`anfitrionId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `equipos_salaId_fkey` FOREIGN KEY (`salaId`) REFERENCES `salas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `equipos_desafioId_fkey` FOREIGN KEY (`desafioId`) REFERENCES `desafios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `integrantes` ADD CONSTRAINT `integrantes_equipoId_fkey` FOREIGN KEY (`equipoId`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluaciones` ADD CONSTRAINT `evaluaciones_origenId_fkey` FOREIGN KEY (`origenId`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluaciones` ADD CONSTRAINT `evaluaciones_destinoId_fkey` FOREIGN KEY (`destinoId`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reflexiones` ADD CONSTRAINT `reflexiones_equipoId_fkey` FOREIGN KEY (`equipoId`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_analitica` ADD CONSTRAINT `eventos_analitica_salaId_fkey` FOREIGN KEY (`salaId`) REFERENCES `salas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_analitica` ADD CONSTRAINT `eventos_analitica_equipoId_fkey` FOREIGN KEY (`equipoId`) REFERENCES `equipos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `desafios` ADD CONSTRAINT `desafios_temaId_fkey` FOREIGN KEY (`temaId`) REFERENCES `temas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
