-- AlterTable
ALTER TABLE "PlanTrabajoDocente" ADD COLUMN     "enCorreccion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "RevisionPlanTrabajo" ADD COLUMN     "versionPlan" INTEGER NOT NULL DEFAULT 1;
