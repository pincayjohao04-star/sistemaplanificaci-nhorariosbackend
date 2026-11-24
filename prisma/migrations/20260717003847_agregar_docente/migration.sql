/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Docente` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Docente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correo]` on the table `Docente` will be added. If there are existing duplicate values, this will fail.
  - Made the column `correo` on table `Docente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Docente" DROP COLUMN "createdAt",
DROP COLUMN "estado",
ALTER COLUMN "correo" SET NOT NULL;

-- CreateTable
CREATE TABLE "AsignaturaDocente" (
    "id" SERIAL NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "asignaturaId" INTEGER NOT NULL,

    CONSTRAINT "AsignaturaDocente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Docente_correo_key" ON "Docente"("correo");

-- AddForeignKey
ALTER TABLE "AsignaturaDocente" ADD CONSTRAINT "AsignaturaDocente_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignaturaDocente" ADD CONSTRAINT "AsignaturaDocente_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
