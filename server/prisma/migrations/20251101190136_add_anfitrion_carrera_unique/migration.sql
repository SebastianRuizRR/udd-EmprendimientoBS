/*
  Warnings:

  - A unique constraint covering the columns `[sala_id,nombre]` on the table `equipos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `anfitrion` to the `salas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `integrantes` ADD COLUMN `carrera` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salas` ADD COLUMN `anfitrion` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `equipos_sala_id_nombre_key` ON `equipos`(`sala_id`, `nombre`);
