/*
  Warnings:

  - A unique constraint covering the columns `[docenteId,asignaturaId]` on the table `AsignaturaDocente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[diaSemana,horaInicio,horaFin,aulaId]` on the table `Horario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[diaSemana,horaInicio,horaFin,docenteId]` on the table `Horario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[diaSemana,horaInicio,horaFin,seccionId]` on the table `Horario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `carreraId` to the `Horario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivelId` to the `Horario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aula" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Docente" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "titulo" TEXT;

-- AlterTable
ALTER TABLE "Horario" ADD COLUMN     "carreraId" INTEGER NOT NULL,
ADD COLUMN     "nivelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PeriodoAcademico" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Seccion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "AsignaturaDocente_docenteId_asignaturaId_key" ON "AsignaturaDocente"("docenteId", "asignaturaId");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_diaSemana_horaInicio_horaFin_aulaId_key" ON "Horario"("diaSemana", "horaInicio", "horaFin", "aulaId");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_diaSemana_horaInicio_horaFin_docenteId_key" ON "Horario"("diaSemana", "horaInicio", "horaFin", "docenteId");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_diaSemana_horaInicio_horaFin_seccionId_key" ON "Horario"("diaSemana", "horaInicio", "horaFin", "seccionId");

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
