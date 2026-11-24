-- CreateEnum
CREATE TYPE "TipoRevisionPlan" AS ENUM ('REVISION', 'APROBACION');

-- CreateEnum
CREATE TYPE "DecisionRevision" AS ENUM ('APROBADO', 'RECHAZADO');

-- AlterEnum
ALTER TYPE "EstadoPlanTrabajo" ADD VALUE 'REVISADO';

-- CreateTable
CREATE TABLE "RevisionPlanTrabajo" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "tipo" "TipoRevisionPlan" NOT NULL,
    "decision" "DecisionRevision" NOT NULL,
    "nombreResponsable" TEXT NOT NULL,
    "cargoResponsable" TEXT,
    "observacion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionPlanTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevisionPlanTrabajo_planId_idx" ON "RevisionPlanTrabajo"("planId");

-- CreateIndex
CREATE INDEX "RevisionPlanTrabajo_fecha_idx" ON "RevisionPlanTrabajo"("fecha");

-- AddForeignKey
ALTER TABLE "RevisionPlanTrabajo" ADD CONSTRAINT "RevisionPlanTrabajo_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PlanTrabajoDocente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
