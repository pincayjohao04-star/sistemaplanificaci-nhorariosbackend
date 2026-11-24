/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `PeriodoAcademico` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ModalidadCarrera" AS ENUM ('PRESENCIAL', 'SEMIPRESENCIAL', 'VIRTUAL', 'HIBRIDA');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "CategoriaActividad" AS ENUM ('DOCENCIA', 'TUTORIA', 'INVESTIGACION', 'VINCULACION', 'GESTION', 'OTRA');

-- CreateEnum
CREATE TYPE "EstadoPlanTrabajo" AS ENUM ('BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "Carrera" ADD COLUMN     "modalidad" "ModalidadCarrera" NOT NULL DEFAULT 'PRESENCIAL';

-- AlterTable
ALTER TABLE "Docente" ADD COLUMN     "dedicacionId" INTEGER;

-- AlterTable
ALTER TABLE "PeriodoAcademico" ADD COLUMN     "codigo" TEXT;

-- CreateTable
CREATE TABLE "DedicacionDocente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "horasSemanales" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DedicacionDocente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocenteCarrera" (
    "id" SERIAL NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "carreraId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocenteCarrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionHorarioCarrera" (
    "id" SERIAL NOT NULL,
    "carreraId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "lunes" BOOLEAN NOT NULL DEFAULT true,
    "martes" BOOLEAN NOT NULL DEFAULT true,
    "miercoles" BOOLEAN NOT NULL DEFAULT true,
    "jueves" BOOLEAN NOT NULL DEFAULT true,
    "viernes" BOOLEAN NOT NULL DEFAULT true,
    "sabado" BOOLEAN NOT NULL DEFAULT false,
    "domingo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionHorarioCarrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoActividad" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "CategoriaActividad" NOT NULL,
    "descripcion" TEXT,
    "requiereInforme" BOOLEAN NOT NULL DEFAULT true,
    "requiereEvidencia" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTrabajoDocente" (
    "id" SERIAL NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "carreraId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "horasRequeridas" INTEGER NOT NULL,
    "estado" "EstadoPlanTrabajo" NOT NULL DEFAULT 'BORRADOR',
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanTrabajoDocente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetallePlanTrabajo" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "horasSemanales" INTEGER NOT NULL,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetallePlanTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioActividadDocente" (
    "id" SERIAL NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "detallePlanId" INTEGER NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "ubicacion" TEXT,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorarioActividadDocente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DedicacionDocente_nombre_key" ON "DedicacionDocente"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "DocenteCarrera_docenteId_carreraId_fechaInicio_key" ON "DocenteCarrera"("docenteId", "carreraId", "fechaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionHorarioCarrera_carreraId_periodoId_key" ON "ConfiguracionHorarioCarrera"("carreraId", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogoActividad_codigo_key" ON "CatalogoActividad"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTrabajoDocente_docenteId_periodoId_carreraId_key" ON "PlanTrabajoDocente"("docenteId", "periodoId", "carreraId");

-- CreateIndex
CREATE UNIQUE INDEX "DetallePlanTrabajo_planId_actividadId_key" ON "DetallePlanTrabajo"("planId", "actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "HorarioActividadDocente_docenteId_periodoId_diaSemana_horaI_key" ON "HorarioActividadDocente"("docenteId", "periodoId", "diaSemana", "horaInicio", "horaFin");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoAcademico_codigo_key" ON "PeriodoAcademico"("codigo");

-- AddForeignKey
ALTER TABLE "Docente" ADD CONSTRAINT "Docente_dedicacionId_fkey" FOREIGN KEY ("dedicacionId") REFERENCES "DedicacionDocente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocenteCarrera" ADD CONSTRAINT "DocenteCarrera_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocenteCarrera" ADD CONSTRAINT "DocenteCarrera_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfiguracionHorarioCarrera" ADD CONSTRAINT "ConfiguracionHorarioCarrera_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfiguracionHorarioCarrera" ADD CONSTRAINT "ConfiguracionHorarioCarrera_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTrabajoDocente" ADD CONSTRAINT "PlanTrabajoDocente_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTrabajoDocente" ADD CONSTRAINT "PlanTrabajoDocente_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTrabajoDocente" ADD CONSTRAINT "PlanTrabajoDocente_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePlanTrabajo" ADD CONSTRAINT "DetallePlanTrabajo_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PlanTrabajoDocente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePlanTrabajo" ADD CONSTRAINT "DetallePlanTrabajo_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "CatalogoActividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioActividadDocente" ADD CONSTRAINT "HorarioActividadDocente_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioActividadDocente" ADD CONSTRAINT "HorarioActividadDocente_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioActividadDocente" ADD CONSTRAINT "HorarioActividadDocente_detallePlanId_fkey" FOREIGN KEY ("detallePlanId") REFERENCES "DetallePlanTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
