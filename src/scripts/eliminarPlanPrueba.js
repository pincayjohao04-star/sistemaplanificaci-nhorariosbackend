const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

    // ======================================================
    // DATOS DE LA PLANIFICACIÓN QUE QUIERES ELIMINAR
    // ======================================================

    const docenteId = 2;
    const periodoId = 2;
    const carreraId = 1;


    console.log("Buscando planificación...");
    console.log({
        docenteId,
        periodoId,
        carreraId
    });


    // ======================================================
    // BUSCAR PLAN
    // ======================================================

    const plan =
        await prisma.planTrabajoDocente.findFirst({

            where: {
                docenteId,
                periodoId,
                carreraId
            },

            include: {

                detalles: {
                    include: {
                        horarios: true,
                        actividad: true
                    }
                },

                revisiones: true,

                docente: true,

                carrera: true,

                periodo: true

            }

        });


    // ======================================================
    // SI NO EXISTE
    // ======================================================

    if (!plan) {

        console.log("");
        console.log("No existe una planificación con esos datos.");

        return;

    }


    console.log("");
    console.log("Planificación encontrada:");
    console.log("------------------------------------");
    console.log("ID:", plan.id);
    console.log(
        "Docente:",
        `${plan.docente.nombres} ${plan.docente.apellidos}`
    );
    console.log(
        "Carrera:",
        plan.carrera.nombre
    );
    console.log(
        "Periodo:",
        plan.periodo.nombre
    );
    console.log(
        "Estado:",
        plan.estado
    );
    console.log(
        "Versión:",
        plan.version
    );
    console.log(
        "Actividades:",
        plan.detalles.length
    );
    console.log(
        "Revisiones:",
        plan.revisiones.length
    );


    const totalHorarios =
        plan.detalles.reduce(
            (total, detalle) =>
                total + detalle.horarios.length,
            0
        );


    console.log(
        "Bloques de actividades:",
        totalHorarios
    );

    console.log("------------------------------------");


    // ======================================================
    // ELIMINAR PLAN
    //
    // Gracias a onDelete: Cascade también se eliminan:
    //
    // - DetallePlanTrabajo
    // - HorarioActividadDocente
    // - RevisionPlanTrabajo
    //
    // NO elimina:
    //
    // - Docente
    // - Carrera
    // - PeriodoAcademico
    // - CatalogoActividad
    // ======================================================

    await prisma.planTrabajoDocente.delete({

        where: {
            id: plan.id
        }

    });


    console.log("");
    console.log("✅ Planificación eliminada correctamente.");
    console.log("");
    console.log("Ya puedes entrar nuevamente a Mi Planificación");
    console.log("y crear una planificación desde cero.");

}


main()
    .catch((error) => {

        console.error("");
        console.error("❌ Error eliminando la planificación:");
        console.error(error);

        process.exit(1);

    })
    .finally(async () => {

        await prisma.$disconnect();

    });