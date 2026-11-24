
-- CreateEnum
CREATE TYPE "EstadoRegistro" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "TipoDedicacion" AS ENUM ('TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'TIEMPO_PARCIAL');

-- CreateEnum
CREATE TYPE "TipoJornada" AS ENUM ('MATUTINA', 'VESPERTINA', 'NOCTURNA', 'INTENSIVA');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO');

-- CreateEnum
CREATE TYPE "TipoHorario" AS ENUM ('PRESENCIAL', 'SINCRONICO');

-- CreateEnum
CREATE TYPE "TipoEvidencia" AS ENUM ('PDF', 'WORD', 'EXCEL', 'IMAGEN', 'PRESENTACION', 'OTRO');

-- DropForeignKey
ALTER TABLE "AsignaturaDocente" DROP CONSTRAINT "AsignaturaDocente_asignaturaId_fkey";

-- DropForeignKey
ALTER TABLE "AsignaturaDocente" DROP CONSTRAINT "AsignaturaDocente_docenteId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_asignaturaId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_carreraId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_docenteId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_nivelId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_periodoId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_seccionId_fkey";

-- DropIndex
DROP INDEX "Horario_diaSemana_horaInicio_horaFin_aulaId_key";

-- DropIndex
DROP INDEX "Horario_diaSemana_horaInicio_horaFin_docenteId_key";

-- DropIndex
DROP INDEX "Horario_diaSemana_horaInicio_horaFin_seccionId_key";

-- AlterTable
ALTER TABLE "Asignatura" ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "horasPresenciales" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "horasSincronicas" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "creditos" SET DEFAULT 0,
ALTER COLUMN "horasSemana" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Aula" DROP COLUMN "createdAt",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "ubicacion" TEXT,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "Carrera" DROP COLUMN "createdAt",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "Docente" DROP COLUMN "createdAt",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "horasClase" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "horasExtracurricular" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tipoDedicacion" "TipoDedicacion" NOT NULL DEFAULT 'TIEMPO_COMPLETO',
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "Horario" DROP COLUMN "asignaturaId",
DROP COLUMN "carreraId",
DROP COLUMN "createdAt",
DROP COLUMN "diaSemana",
DROP COLUMN "docenteId",
DROP COLUMN "horaFin",
DROP COLUMN "horaInicio",
DROP COLUMN "nivelId",
DROP COLUMN "periodoId",
DROP COLUMN "seccionId",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "asignacionId" INTEGER NOT NULL,
ADD COLUMN     "bloqueId" INTEGER NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "tipo" "TipoHorario" NOT NULL DEFAULT 'PRESENCIAL';

-- AlterTable
ALTER TABLE "Nivel" ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PeriodoAcademico" DROP COLUMN "createdAt",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Rol" ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "Seccion" DROP COLUMN "createdAt",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "capacidad" INTEGER,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "nivelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "docenteId" INTEGER,
ADD COLUMN     "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO';

-- DropTable
DROP TABLE "AsignaturaDocente";

-- CreateTable
CREATE TABLE "AsignacionDocente" (
    "id" SERIAL NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    "seccionId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "jornada" "TipoJornada" NOT NULL DEFAULT 'MATUTINA',
    "horasPresenciales" INTEGER NOT NULL DEFAULT 0,
    "horasSincronicas" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsignacionDocente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloqueHorario" (
    "id" SERIAL NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloqueHorario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuncionAcademica" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuncionAcademica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActividadAcademica" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "funcionId" INTEGER NOT NULL,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActividadAcademica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependencia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "responsable" TEXT,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dependencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTrabajo" (
    "id" SERIAL NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "horasInvestigacion" INTEGER NOT NULL DEFAULT 0,
    "horasVinculacion" INTEGER NOT NULL DEFAULT 0,
    "horasTutorias" INTEGER NOT NULL DEFAULT 0,
    "horasGestionAcademica" INTEGER NOT NULL DEFAULT 0,
    "horasOtrasDocencia" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanActividad" (
    "id" SERIAL NOT NULL,
    "planTrabajoId" INTEGER NOT NULL,
    "funcionId" INTEGER NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "dependenciaId" INTEGER,
    "horasAsignadas" INTEGER NOT NULL,
    "productoEntregar" TEXT,
    "meta" TEXT,
    "evidenciaEsperada" TEXT,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActividadRealizada" (
    "id" SERIAL NOT NULL,
    "planActividadId" INTEGER NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "productoObtenido" TEXT,
    "horasRealizadas" INTEGER,
    "observacion" TEXT,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActividadRealizada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidencia" (
    "id" SERIAL NOT NULL,
    "actividadRealizadaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoEvidencia" NOT NULL,
    "archivo" TEXT NOT NULL,
    "ruta" TEXT,
    "descripcion" TEXT,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Evidencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionDocente_docenteId_asignaturaId_seccionId_periodoI_key" ON "AsignacionDocente"("docenteId", "asignaturaId", "seccionId", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "BloqueHorario_diaSemana_horaInicio_horaFin_key" ON "BloqueHorario"("diaSemana", "horaInicio", "horaFin");

-- CreateIndex
CREATE UNIQUE INDEX "FuncionAcademica_nombre_key" ON "FuncionAcademica"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ActividadAcademica_codigo_key" ON "ActividadAcademica"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Dependencia_nombre_key" ON "Dependencia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTrabajo_docenteId_periodoId_key" ON "PlanTrabajo"("docenteId", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanActividad_planTrabajoId_actividadId_key" ON "PlanActividad"("planTrabajoId", "actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_asignacionId_bloqueId_key" ON "Horario"("asignacionId", "bloqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Nivel_carreraId_semestre_key" ON "Nivel"("carreraId", "semestre");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoAcademico_codigo_key" ON "PeriodoAcademico"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Seccion_nivelId_nombre_key" ON "Seccion"("nivelId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_docenteId_key" ON "Usuario"("docenteId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seccion" ADD CONSTRAINT "Seccion_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionDocente" ADD CONSTRAINT "AsignacionDocente_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionDocente" ADD CONSTRAINT "AsignacionDocente_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionDocente" ADD CONSTRAINT "AsignacionDocente_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "Seccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionDocente" ADD CONSTRAINT "AsignacionDocente_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "AsignacionDocente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "BloqueHorario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadAcademica" ADD CONSTRAINT "ActividadAcademica_funcionId_fkey" FOREIGN KEY ("funcionId") REFERENCES "FuncionAcademica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTrabajo" ADD CONSTRAINT "PlanTrabajo_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTrabajo" ADD CONSTRAINT "PlanTrabajo_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanActividad" ADD CONSTRAINT "PlanActividad_planTrabajoId_fkey" FOREIGN KEY ("planTrabajoId") REFERENCES "PlanTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanActividad" ADD CONSTRAINT "PlanActividad_funcionId_fkey" FOREIGN KEY ("funcionId") REFERENCES "FuncionAcademica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanActividad" ADD CONSTRAINT "PlanActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "ActividadAcademica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanActividad" ADD CONSTRAINT "PlanActividad_dependenciaId_fkey" FOREIGN KEY ("dependenciaId") REFERENCES "Dependencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadRealizada" ADD CONSTRAINT "ActividadRealizada_planActividadId_fkey" FOREIGN KEY ("planActividadId") REFERENCES "PlanActividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadRealizada" ADD CONSTRAINT "ActividadRealizada_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidencia" ADD CONSTRAINT "Evidencia_actividadRealizadaId_fkey" FOREIGN KEY ("actividadRealizadaId") REFERENCES "ActividadRealizada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
