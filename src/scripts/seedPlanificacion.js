const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

    console.log("=======================================");
    console.log(" CARGANDO CONFIGURACION DE PLANIFICACION");
    console.log("=======================================\n");

    // =====================================================
    // DEDICACIONES DOCENTES
    // =====================================================

    const tiempoCompleto = await prisma.dedicacionDocente.upsert({
        where: {
            nombre: "TIEMPO COMPLETO"
        },
        update: {
            horasSemanales: 40,
            activo: true
        },
        create: {
            nombre: "TIEMPO COMPLETO",
            horasSemanales: 40,
            activo: true
        }
    });

    const medioTiempo = await prisma.dedicacionDocente.upsert({
        where: {
            nombre: "MEDIO TIEMPO"
        },
        update: {
            horasSemanales: 20,
            activo: true
        },
        create: {
            nombre: "MEDIO TIEMPO",
            horasSemanales: 20,
            activo: true
        }
    });

    console.log(
        "Tiempo completo:",
        tiempoCompleto.horasSemanales,
        "horas"
    );

    console.log(
        "Medio tiempo:",
        medioTiempo.horasSemanales,
        "horas"
    );


    // =====================================================
    // ACTIVIDADES
    // =====================================================

    const actividades = [

        {
            codigo: "DOC.1",
            nombre: "Preparacion y actualizacion de clases, seminarios, talleres, entre otros",
            categoria: "DOCENCIA",
            descripcion:
                "Preparacion y actualizacion de materiales y recursos para el desarrollo de clases.",
            requiereInforme: true,
            requiereEvidencia: true
        },

        {
            codigo: "DOC.2",
            nombre: "Diseño y elaboracion de libros, material didactico, guias docentes o syllabus",
            categoria: "DOCENCIA",
            descripcion:
                "Diseño y elaboracion de material didactico, programas analiticos, guias didacticas y syllabus.",
            requiereInforme: true,
            requiereEvidencia: true
        },

        {
            codigo: "DOC.4",
            nombre: "Preparacion, elaboracion, aplicacion y calificacion de examenes, trabajos y practicas",
            categoria: "DOCENCIA",
            descripcion:
                "Preparacion, aplicacion, revision y calificacion de evaluaciones, ejercicios, trabajos y practicas.",
            requiereInforme: true,
            requiereEvidencia: true
        },

        {
            codigo: "TUT.1",
            nombre: "Tutorias academicas",
            categoria: "TUTORIA",
            descripcion:
                "Actividades de orientacion, acompañamiento y tutoria academica.",
            requiereInforme: true,
            requiereEvidencia: true
        },

        {
            codigo: "VIN.4",
            nombre: "Vinculacion con la sociedad mediante proyectos de investigacion e innovacion",
            categoria: "VINCULACION",
            descripcion:
                "Actividades de vinculacion con la sociedad mediante proyectos de investigacion e innovacion.",
            requiereInforme: true,
            requiereEvidencia: true
        }

    ];

    for (const actividad of actividades) {

        await prisma.catalogoActividad.upsert({

            where: {
                codigo: actividad.codigo
            },

            update: {
                nombre: actividad.nombre,
                categoria: actividad.categoria,
                descripcion: actividad.descripcion,
                requiereInforme: actividad.requiereInforme,
                requiereEvidencia: actividad.requiereEvidencia,
                activo: true
            },

            create: {
                codigo: actividad.codigo,
                nombre: actividad.nombre,
                categoria: actividad.categoria,
                descripcion: actividad.descripcion,
                requiereInforme: actividad.requiereInforme,
                requiereEvidencia: actividad.requiereEvidencia,
                activo: true
            }

        });

        console.log("Actividad creada:", actividad.codigo);
    }


    // =====================================================
    // MOSTRAR RESULTADOS
    // =====================================================

    const dedicaciones = await prisma.dedicacionDocente.findMany({
        orderBy: {
            horasSemanales: "desc"
        }
    });

    const catalogo = await prisma.catalogoActividad.findMany({
        orderBy: {
            codigo: "asc"
        }
    });

    console.log("\nDEDICACIONES");

    console.table(
        dedicaciones.map((d) => ({
            id: d.id,
            nombre: d.nombre,
            horas: d.horasSemanales
        }))
    );

    console.log("\nACTIVIDADES");

    console.table(
        catalogo.map((a) => ({
            id: a.id,
            codigo: a.codigo,
            categoria: a.categoria,
            nombre: a.nombre
        }))
    );

    console.log("\nDatos cargados correctamente.");
}


main()
    .catch((error) => {

        console.error("ERROR:");

        console.error(error);

        process.exit(1);

    })
    .finally(async () => {

        await prisma.$disconnect();

    });