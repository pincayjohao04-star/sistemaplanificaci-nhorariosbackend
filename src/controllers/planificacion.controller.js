const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

function normalizarDia(dia) {

    if (!dia) {
        return "";
    }

    return String(dia)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();
}


function horaAMinutos(hora) {

    if (!hora) {
        return null;
    }

    const normalizada = String(hora)
        .trim()
        .toUpperCase()
        .replace("H", ":");


    const partes = normalizada.split(":");


    if (partes.length < 2) {
        return null;
    }


    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);


    if (
        Number.isNaN(horas) ||
        Number.isNaN(minutos)
    ) {
        return null;
    }


    return (horas * 60) + minutos;
}


function calcularDuracion(horaInicio, horaFin) {

    const inicio = horaAMinutos(horaInicio);
    const fin = horaAMinutos(horaFin);


    if (
        inicio === null ||
        fin === null ||
        fin <= inicio
    ) {
        return 0;
    }


    return (fin - inicio) / 60;
}


function horariosSeCruzan(
    inicio1,
    fin1,
    inicio2,
    fin2
) {

    const i1 = horaAMinutos(inicio1);
    const f1 = horaAMinutos(fin1);
    const i2 = horaAMinutos(inicio2);
    const f2 = horaAMinutos(fin2);


    if (
        i1 === null ||
        f1 === null ||
        i2 === null ||
        f2 === null
    ) {
        return false;
    }


    return i1 < f2 && f1 > i2;
}


function fechasSeCruzan(
    inicio1,
    fin1,
    inicio2,
    fin2
) {

    const i1 = new Date(inicio1);
    const f1 = new Date(fin1);
    const i2 = new Date(inicio2);
    const f2 = new Date(fin2);


    return i1 <= f2 && f1 >= i2;
}


// ======================================================
// OBTENER HORAS DE CLASE DEL DOCENTE
// ======================================================

async function obtenerHorasClase(docenteId, periodoId) {

    const horarios = await prisma.horario.findMany({

        where: {
            docenteId,
            periodoId
        },

        include: {

            Asignatura: true,
            aula: true,
            Carrera: true,
            Nivel: true,
            Seccion: true

        },

        orderBy: [
            {
                diaSemana: "asc"
            },
            {
                horaInicio: "asc"
            }
        ]

    });


    let horasClase = 0;


    for (const horario of horarios) {

        horasClase += calcularDuracion(
            horario.horaInicio,
            horario.horaFin
        );

    }


    return {

        horarios,

        horasClase:
            Number(horasClase.toFixed(2))

    };
}


// ======================================================
// CONSTRUIR RESUMEN DE CARGA
// ======================================================

function construirResumen(
    horasRequeridas,
    horasClase,
    detalles
) {

    const horasActividades = detalles.reduce(

        (total, detalle) =>
            total + Number(detalle.horasSemanales || 0),

        0

    );


    const horasPlanificadas =
        horasClase + horasActividades;


    const diferencia =
        horasRequeridas - horasPlanificadas;


    let estadoCarga = "COMPLETA";


    if (diferencia > 0) {

        estadoCarga = "INCOMPLETA";

    }


    if (diferencia < 0) {

        estadoCarga = "EXCEDIDA";

    }


    return {

        horasRequeridas,

        horasClase,

        horasActividades,

        horasPlanificadas,

        horasRestantes:
            diferencia > 0
                ? diferencia
                : 0,

        horasExcedidas:
            diferencia < 0
                ? Math.abs(diferencia)
                : 0,

        estadoCarga

    };
}


// ======================================================
// OBTENER ACTIVIDADES DISPONIBLES
// ======================================================

exports.obtenerActividades = async (req, res) => {

    try {

        const actividades =
            await prisma.catalogoActividad.findMany({

                where: {
                    activo: true
                },

                orderBy: [
                    {
                        categoria: "asc"
                    },
                    {
                        codigo: "asc"
                    }
                ]

            });


        res.json(actividades);

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error obteniendo las actividades docentes."

        });

    }

};


// ======================================================
// INICIAR PLANIFICACIÓN DEL DOCENTE
// ======================================================

exports.iniciarPlanificacion = async (req, res) => {

    try {

        const {
            docenteId,
            periodoId,
            carreraId,
            dedicacionId
        } = req.body;


        const idDocente = Number(docenteId);
        const idPeriodo = Number(periodoId);
        const idCarrera = Number(carreraId);
        const idDedicacion = Number(dedicacionId);


        // ==================================================
        // VALIDAR IDS
        // ==================================================

        if (
            !Number.isInteger(idDocente) ||
            !Number.isInteger(idPeriodo) ||
            !Number.isInteger(idCarrera) ||
            !Number.isInteger(idDedicacion)
        ) {

            return res.status(400).json({

                mensaje:
                    "Docente, período, carrera y dedicación son obligatorios."

            });

        }


        // ==================================================
        // DEDICACIÓN
        // ==================================================

        const dedicacion =
            await prisma.dedicacionDocente.findFirst({

                where: {

                    id: idDedicacion,
                    activo: true

                }

            });


        if (!dedicacion) {

            return res.status(404).json({

                mensaje:
                    "La dedicación seleccionada no existe o está inactiva."

            });

        }


        // ==================================================
        // DOCENTE
        // ==================================================

        const docente =
            await prisma.docente.findUnique({

                where: {
                    id: idDocente
                }

            });


        if (!docente) {

            return res.status(404).json({

                mensaje:
                    "Docente no encontrado."

            });

        }


        // ==================================================
        // PERÍODO
        // ==================================================

        const periodo =
            await prisma.periodoAcademico.findUnique({

                where: {
                    id: idPeriodo
                }

            });


        if (!periodo) {

            return res.status(404).json({

                mensaje:
                    "Período académico no encontrado."

            });

        }


        if (periodo.fechaFin < periodo.fechaInicio) {

            return res.status(400).json({

                mensaje:
                    "Las fechas del período académico no son válidas."

            });

        }


        // ==================================================
        // CARRERA
        // ==================================================

        const carrera =
            await prisma.carrera.findUnique({

                where: {
                    id: idCarrera
                }

            });


        if (!carrera) {

            return res.status(404).json({

                mensaje:
                    "Carrera no encontrada."

            });

        }


        // ==================================================
        // PLAN EXISTENTE
        // ==================================================

        const planExistente =
            await prisma.planTrabajoDocente.findUnique({

                where: {

                    docenteId_periodoId_carreraId: {

                        docenteId: idDocente,
                        periodoId: idPeriodo,
                        carreraId: idCarrera

                    }

                }

            });


        if (
            planExistente &&
            planExistente.estado !== "BORRADOR"
        ) {

            return res.status(400).json({

                mensaje:
                    "La planificación ya fue enviada o procesada."

            });

        }


        // ==================================================
        // ASIGNAR DEDICACIÓN
        //
        // TEMPORAL:
        // después vendrá desde la base institucional.
        // ==================================================

        await prisma.docente.update({

            where: {
                id: idDocente
            },

            data: {
                dedicacionId: idDedicacion
            }

        });


        // ==================================================
        // CREAR O ACTUALIZAR PLAN
        // ==================================================

        const plan =
            await prisma.planTrabajoDocente.upsert({

                where: {

                    docenteId_periodoId_carreraId: {

                        docenteId: idDocente,
                        periodoId: idPeriodo,
                        carreraId: idCarrera

                    }

                },

                update: {

                    fechaInicio:
                        periodo.fechaInicio,

                    fechaFin:
                        periodo.fechaFin,

                    horasRequeridas:
                        dedicacion.horasSemanales

                },

                create: {

                    docenteId:
                        idDocente,

                    periodoId:
                        idPeriodo,

                    carreraId:
                        idCarrera,

                    fechaInicio:
                        periodo.fechaInicio,

                    fechaFin:
                        periodo.fechaFin,

                    horasRequeridas:
                        dedicacion.horasSemanales

                },

                include: {

                    docente: {

                        include: {
                            dedicacion: true
                        }

                    },

                    periodo: true,

                    carrera: true,

                    detalles: {

                        include: {

                            actividad: true,

                            horarios: {

                                orderBy: [
                                    {
                                        diaSemana: "asc"
                                    },
                                    {
                                        horaInicio: "asc"
                                    }
                                ]

                            }

                        },

                        orderBy: {
                            id: "asc"
                        }

                    }

                }

            });


        // ==================================================
        // CLASES
        // ==================================================

        const resultadoClases =
            await obtenerHorasClase(
                idDocente,
                idPeriodo
            );


        // ==================================================
        // RESUMEN
        // ==================================================

        const resumen =
            construirResumen(

                plan.horasRequeridas,

                resultadoClases.horasClase,

                plan.detalles

            );


        res.status(201).json({

            mensaje:
                "Planificación iniciada correctamente.",

            plan,

            clases:
                resultadoClases.horarios,

            resumen

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error iniciando la planificación del docente."

        });

    }

};


// ======================================================
// OBTENER PLANIFICACIÓN
// ======================================================

exports.obtenerPlanificacion = async (req, res) => {

    try {

        const docenteId =
            Number(req.params.docenteId);

        const periodoId =
            Number(req.params.periodoId);

        const carreraId =
            req.query.carreraId
                ? Number(req.query.carreraId)
                : null;


        if (
            !Number.isInteger(docenteId) ||
            !Number.isInteger(periodoId)
        ) {

            return res.status(400).json({

                mensaje:
                    "Docente o período no válido."

            });

        }


        const where = {

            docenteId,
            periodoId

        };


        if (Number.isInteger(carreraId)) {

            where.carreraId = carreraId;

        }


        const plan =
            await prisma.planTrabajoDocente.findFirst({

                where,

                include: {

                    docente: {

                        include: {
                            dedicacion: true
                        }

                    },

                    periodo: true,

                    carrera: true,

                    detalles: {

                        include: {

                            actividad: true,

                            horarios: {

                                orderBy: [
                                    {
                                        diaSemana: "asc"
                                    },
                                    {
                                        horaInicio: "asc"
                                    }
                                ]

                            }

                        },

                        orderBy: {
                            id: "asc"
                        }

                    }

                }

            });


        if (!plan) {

            return res.status(404).json({

                mensaje:
                    "El docente todavía no tiene una planificación para este período."

            });

        }


        const resultadoClases =
            await obtenerHorasClase(
                docenteId,
                periodoId
            );


        const resumen =
            construirResumen(

                plan.horasRequeridas,

                resultadoClases.horasClase,

                plan.detalles

            );


        res.json({

            plan,

            clases:
                resultadoClases.horarios,

            resumen

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error obteniendo la planificación."

        });

    }

};


// ======================================================
// AGREGAR ACTIVIDAD AL PLAN
// ======================================================

exports.agregarActividad = async (req, res) => {

    try {

        const planId =
            Number(req.params.planId);


        const {
            actividadId,
            horasSemanales,
            observacion
        } = req.body;


        const idActividad =
            Number(actividadId);

        const horas =
            Number(horasSemanales);


        if (!Number.isInteger(planId)) {

            return res.status(400).json({

                mensaje:
                    "El plan de trabajo no es válido."

            });

        }


        if (!Number.isInteger(idActividad)) {

            return res.status(400).json({

                mensaje:
                    "La actividad seleccionada no es válida."

            });

        }


        if (
            !Number.isFinite(horas) ||
            horas <= 0
        ) {

            return res.status(400).json({

                mensaje:
                    "Las horas semanales deben ser mayores que cero."

            });

        }


        const plan =
            await prisma.planTrabajoDocente.findUnique({

                where: {
                    id: planId
                }

            });


        if (!plan) {

            return res.status(404).json({

                mensaje:
                    "Planificación no encontrada."

            });

        }


        if (plan.estado !== "BORRADOR") {

            return res.status(400).json({

                mensaje:
                    "La planificación ya fue enviada y no puede modificarse."

            });

        }


        const actividad =
            await prisma.catalogoActividad.findFirst({

                where: {

                    id: idActividad,
                    activo: true

                }

            });


        if (!actividad) {

            return res.status(404).json({

                mensaje:
                    "La actividad seleccionada no existe o está inactiva."

            });

        }


        const detalle =
            await prisma.detallePlanTrabajo.upsert({

                where: {

                    planId_actividadId: {

                        planId,
                        actividadId: idActividad

                    }

                },

                update: {

                    horasSemanales:
                        horas,

                    observacion:
                        observacion &&
                        String(observacion).trim() !== ""
                            ? String(observacion).trim()
                            : null

                },

                create: {

                    planId,

                    actividadId:
                        idActividad,

                    horasSemanales:
                        horas,

                    observacion:
                        observacion &&
                        String(observacion).trim() !== ""
                            ? String(observacion).trim()
                            : null

                },

                include: {

                    actividad: true,
                    horarios: true

                }

            });


        const planActualizado =
            await prisma.planTrabajoDocente.findUnique({

                where: {
                    id: planId
                },

                include: {

                    detalles: {

                        include: {

                            actividad: true,
                            horarios: true

                        }

                    }

                }

            });


        const resultadoClases =
            await obtenerHorasClase(
                plan.docenteId,
                plan.periodoId
            );


        const resumen =
            construirResumen(

                plan.horasRequeridas,

                resultadoClases.horasClase,

                planActualizado.detalles

            );


        res.status(201).json({

            mensaje:
                "Actividad agregada a la planificación.",

            detalle,

            resumen

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error agregando la actividad a la planificación."

        });

    }

};


// ======================================================
// ACTUALIZAR ACTIVIDAD
// ======================================================

exports.actualizarActividad = async (req, res) => {

    try {

        const detalleId =
            Number(req.params.detalleId);


        const {
            horasSemanales,
            observacion
        } = req.body;


        const horas =
            Number(horasSemanales);


        if (!Number.isInteger(detalleId)) {

            return res.status(400).json({

                mensaje:
                    "El detalle de la actividad no es válido."

            });

        }


        if (
            !Number.isFinite(horas) ||
            horas <= 0
        ) {

            return res.status(400).json({

                mensaje:
                    "Las horas semanales deben ser mayores que cero."

            });

        }


        const detalleExistente =
            await prisma.detallePlanTrabajo.findUnique({

                where: {
                    id: detalleId
                },

                include: {

                    plan: true,
                    horarios: true

                }

            });


        if (!detalleExistente) {

            return res.status(404).json({

                mensaje:
                    "La actividad no se encuentra en la planificación."

            });

        }


        if (
            detalleExistente.plan.estado !==
            "BORRADOR"
        ) {

            return res.status(400).json({

                mensaje:
                    "La planificación ya fue enviada y no puede modificarse."

            });

        }


        const horasDistribuidas =
            detalleExistente.horarios.reduce(

                (total, horario) =>
                    total +
                    calcularDuracion(
                        horario.horaInicio,
                        horario.horaFin
                    ),

                0

            );


        if (horas < horasDistribuidas) {

            return res.status(400).json({

                mensaje:
                    `La actividad ya tiene ${horasDistribuidas} hora(s) distribuidas en el horario.`

            });

        }


        const detalle =
            await prisma.detallePlanTrabajo.update({

                where: {
                    id: detalleId
                },

                data: {

                    horasSemanales:
                        horas,

                    observacion:
                        observacion &&
                        String(observacion).trim() !== ""
                            ? String(observacion).trim()
                            : null

                },

                include: {

                    actividad: true,
                    horarios: true

                }

            });


        res.json({

            mensaje:
                "Actividad actualizada correctamente.",

            detalle

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error actualizando la actividad."

        });

    }

};


// ======================================================
// ELIMINAR ACTIVIDAD
// ======================================================

exports.eliminarActividad = async (req, res) => {

    try {

        const detalleId =
            Number(req.params.detalleId);


        if (!Number.isInteger(detalleId)) {

            return res.status(400).json({

                mensaje:
                    "El detalle de la actividad no es válido."

            });

        }


        const detalle =
            await prisma.detallePlanTrabajo.findUnique({

                where: {
                    id: detalleId
                },

                include: {

                    plan: true,
                    actividad: true

                }

            });


        if (!detalle) {

            return res.status(404).json({

                mensaje:
                    "La actividad no existe en la planificación."

            });

        }


        if (detalle.plan.estado !== "BORRADOR") {

            return res.status(400).json({

                mensaje:
                    "La planificación ya fue enviada y no puede modificarse."

            });

        }


        await prisma.detallePlanTrabajo.delete({

            where: {
                id: detalleId
            }

        });


        res.json({

            mensaje:
                `${detalle.actividad.codigo} eliminada de la planificación.`

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error eliminando la actividad de la planificación."

        });

    }

};


// ======================================================
// AGREGAR HORARIO A UNA ACTIVIDAD
// ======================================================

exports.agregarHorarioActividad = async (req, res) => {

    try {

        const detalleId =
            Number(req.params.detalleId);


        const {
            diaSemana,
            horaInicio,
            horaFin,
            fechaInicio,
            fechaFin,
            ubicacion,
            observacion
        } = req.body;


        if (!Number.isInteger(detalleId)) {

            return res.status(400).json({

                mensaje:
                    "La actividad seleccionada no es válida."

            });

        }


        const diasValidos = [

            "LUNES",
            "MARTES",
            "MIERCOLES",
            "JUEVES",
            "VIERNES",
            "SABADO",
            "DOMINGO"

        ];


        const diaNormalizado =
            normalizarDia(diaSemana);


        if (!diasValidos.includes(diaNormalizado)) {

            return res.status(400).json({

                mensaje:
                    "El día seleccionado no es válido."

            });

        }


        const inicioMinutos =
            horaAMinutos(horaInicio);

        const finMinutos =
            horaAMinutos(horaFin);


        if (
            inicioMinutos === null ||
            finMinutos === null ||
            finMinutos <= inicioMinutos
        ) {

            return res.status(400).json({

                mensaje:
                    "La hora final debe ser posterior a la hora inicial."

            });

        }


        // ==================================================
        // DETALLE Y PLAN
        // ==================================================

        const detalle =
            await prisma.detallePlanTrabajo.findUnique({

                where: {
                    id: detalleId
                },

                include: {

                    actividad: true,

                    horarios: true,

                    plan: {

                        include: {

                            carrera: true,
                            periodo: true

                        }

                    }

                }

            });


        if (!detalle) {

            return res.status(404).json({

                mensaje:
                    "La actividad no pertenece a ninguna planificación."

            });

        }


        if (detalle.plan.estado !== "BORRADOR") {

            return res.status(400).json({

                mensaje:
                    "La planificación ya fue confirmada y no puede modificarse."

            });

        }


        // ==================================================
        // FECHAS
        // ==================================================

        const inicioVigencia =
            fechaInicio
                ? new Date(fechaInicio)
                : new Date(detalle.plan.fechaInicio);


        const finVigencia =
            fechaFin
                ? new Date(fechaFin)
                : new Date(detalle.plan.fechaFin);


        if (
            Number.isNaN(inicioVigencia.getTime()) ||
            Number.isNaN(finVigencia.getTime())
        ) {

            return res.status(400).json({

                mensaje:
                    "Las fechas seleccionadas no son válidas."

            });

        }


        if (finVigencia < inicioVigencia) {

            return res.status(400).json({

                mensaje:
                    "La fecha final no puede ser menor que la fecha inicial."

            });

        }


        if (
            inicioVigencia <
                new Date(detalle.plan.fechaInicio) ||

            finVigencia >
                new Date(detalle.plan.fechaFin)
        ) {

            return res.status(400).json({

                mensaje:
                    "La actividad debe estar dentro de las fechas del plan de trabajo."

            });

        }


        // ==================================================
        // CONFIGURACIÓN DE CARRERA
        // ==================================================

        const configuracion =
            await prisma.configuracionHorarioCarrera.findUnique({

                where: {

                    carreraId_periodoId: {

                        carreraId:
                            detalle.plan.carreraId,

                        periodoId:
                            detalle.plan.periodoId

                    }

                }

            });


        if (configuracion) {

            const campoDia = {

                LUNES: "lunes",
                MARTES: "martes",
                MIERCOLES: "miercoles",
                JUEVES: "jueves",
                VIERNES: "viernes",
                SABADO: "sabado",
                DOMINGO: "domingo"

            }[diaNormalizado];


            if (!configuracion[campoDia]) {

                return res.status(400).json({

                    mensaje:
                        `${diaNormalizado} no está habilitado para esta carrera.`

                });

            }


            const inicioPermitido =
                horaAMinutos(
                    configuracion.horaInicio
                );


            const finPermitido =
                horaAMinutos(
                    configuracion.horaFin
                );


            if (
                inicioPermitido !== null &&
                finPermitido !== null &&
                (
                    inicioMinutos < inicioPermitido ||
                    finMinutos > finPermitido
                )
            ) {

                return res.status(400).json({

                    mensaje:
                        `El horario permitido es de ${configuracion.horaInicio} a ${configuracion.horaFin}.`

                });

            }

        }


        // ==================================================
        // CONFLICTO CON CLASES
        // ==================================================

        const clases =
            await prisma.horario.findMany({

                where: {

                    docenteId:
                        detalle.plan.docenteId,

                    periodoId:
                        detalle.plan.periodoId

                }

            });


        const conflictoClase =
            clases.find((clase) => {

                return (

                    normalizarDia(
                        clase.diaSemana
                    ) === diaNormalizado

                    &&

                    horariosSeCruzan(

                        horaInicio,
                        horaFin,

                        clase.horaInicio,
                        clase.horaFin

                    )

                );

            });


        if (conflictoClase) {

            return res.status(400).json({

                mensaje:
                    `El horario se cruza con una clase de ${conflictoClase.horaInicio} a ${conflictoClase.horaFin}.`

            });

        }


        // ==================================================
        // CONFLICTO CON OTRAS ACTIVIDADES
        // ==================================================

        const actividadesDocente =
            await prisma.horarioActividadDocente.findMany({

                where: {

                    docenteId:
                        detalle.plan.docenteId,

                    periodoId:
                        detalle.plan.periodoId,

                    diaSemana:
                        diaNormalizado

                }

            });


        const conflictoActividad =
            actividadesDocente.find((horario) => {

                return (

                    fechasSeCruzan(

                        inicioVigencia,
                        finVigencia,

                        horario.fechaInicio,
                        horario.fechaFin

                    )

                    &&

                    horariosSeCruzan(

                        horaInicio,
                        horaFin,

                        horario.horaInicio,
                        horario.horaFin

                    )

                );

            });


        if (conflictoActividad) {

            return res.status(400).json({

                mensaje:
                    `El docente ya tiene otra actividad de ${conflictoActividad.horaInicio} a ${conflictoActividad.horaFin}.`

            });

        }


        // ==================================================
        // HORAS DISTRIBUIDAS
        // ==================================================

        const minutosNuevos =
            finMinutos - inicioMinutos;


        const minutosDistribuidos =
            detalle.horarios.reduce(

                (total, horario) => {

                    const inicio =
                        horaAMinutos(
                            horario.horaInicio
                        );

                    const fin =
                        horaAMinutos(
                            horario.horaFin
                        );


                    if (
                        inicio === null ||
                        fin === null
                    ) {
                        return total;
                    }


                    return total + (fin - inicio);

                },

                0

            );


        const minutosPermitidos =
            detalle.horasSemanales * 60;


        if (
            minutosDistribuidos +
            minutosNuevos >
            minutosPermitidos
        ) {

            const restantes =

                (
                    minutosPermitidos -
                    minutosDistribuidos
                ) / 60;


            return res.status(400).json({

                mensaje:
                    `${detalle.actividad.codigo} solo tiene ${Math.max(0, restantes)} hora(s) pendientes por distribuir.`

            });

        }


        // ==================================================
        // CREAR HORARIO
        // ==================================================

        const horario =
            await prisma.horarioActividadDocente.create({

                data: {

                    docenteId:
                        detalle.plan.docenteId,

                    periodoId:
                        detalle.plan.periodoId,

                    detallePlanId:
                        detalle.id,

                    diaSemana:
                        diaNormalizado,

                    horaInicio:
                        String(horaInicio).trim(),

                    horaFin:
                        String(horaFin).trim(),

                    fechaInicio:
                        inicioVigencia,

                    fechaFin:
                        finVigencia,

                    ubicacion:
                        ubicacion &&
                        String(ubicacion).trim() !== ""
                            ? String(ubicacion).trim()
                            : null,

                    observacion:
                        observacion &&
                        String(observacion).trim() !== ""
                            ? String(observacion).trim()
                            : null

                }

            });


        res.status(201).json({

            mensaje:
                "Horario de la actividad agregado correctamente.",

            horario

        });

    }
    catch (error) {

        console.error(error);


        if (error.code === "P2002") {

            return res.status(400).json({

                mensaje:
                    "Ese bloque horario ya está registrado."

            });

        }


        res.status(500).json({

            mensaje:
                "Error agregando el horario de la actividad."

        });

    }

};


// ======================================================
// ELIMINAR HORARIO DE UNA ACTIVIDAD
// ======================================================

exports.eliminarHorarioActividad = async (req, res) => {

    try {

        const horarioId =
            Number(req.params.horarioId);


        if (!Number.isInteger(horarioId)) {

            return res.status(400).json({

                mensaje:
                    "El horario seleccionado no es válido."

            });

        }


        const horario =
            await prisma.horarioActividadDocente.findUnique({

                where: {
                    id: horarioId
                },

                include: {

                    detallePlan: {

                        include: {
                            plan: true
                        }

                    }

                }

            });


        if (!horario) {

            return res.status(404).json({

                mensaje:
                    "El bloque horario no existe."

            });

        }


        if (
            horario.detallePlan.plan.estado !==
            "BORRADOR"
        ) {

            return res.status(400).json({

                mensaje:
                    "La planificación ya no puede modificarse."

            });

        }


        await prisma.horarioActividadDocente.delete({

            where: {
                id: horarioId
            }

        });


        res.json({

            mensaje:
                "Bloque horario eliminado correctamente."

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error eliminando el bloque horario."

        });

    }

};
// ======================================================
// CONFIRMAR / ENVIAR PLANIFICACIÓN
// ======================================================

// ======================================================
// CONFIRMAR / REENVIAR PLANIFICACIÓN
// ======================================================

exports.confirmarPlanificacion = async (req, res) => {

    try {

        const planId =
            Number(req.params.planId);


        if (!Number.isInteger(planId)) {

            return res.status(400).json({

                mensaje:
                    "La planificación seleccionada no es válida."

            });

        }


        // ==================================================
        // OBTENER PLAN
        // ==================================================

        const plan =
            await prisma.planTrabajoDocente.findUnique({

                where: {
                    id: planId
                },

                include: {

                    docente: {

                        include: {
                            dedicacion: true
                        }

                    },

                    periodo: true,

                    carrera: true,

                    detalles: {

                        include: {

                            actividad: true,

                            horarios: true

                        }

                    },

                    revisiones: {

                        orderBy: {
                            fecha: "asc"
                        }

                    }

                }

            });


        if (!plan) {

            return res.status(404).json({

                mensaje:
                    "La planificación no existe."

            });

        }


        if (plan.estado !== "BORRADOR") {

            return res.status(400).json({

                mensaje:
                    "Solo una planificación en borrador puede ser enviada."

            });

        }


        // ==================================================
        // HORAS DE CLASE
        // ==================================================

        const resultadoClases =
            await obtenerHorasClase(

                plan.docenteId,

                plan.periodoId

            );


        // ==================================================
        // RESUMEN
        // ==================================================

        const resumen =
            construirResumen(

                plan.horasRequeridas,

                resultadoClases.horasClase,

                plan.detalles

            );


        // ==================================================
        // VALIDAR CARGA
        // ==================================================

        if (
            resumen.estadoCarga ===
            "INCOMPLETA"
        ) {

            return res.status(400).json({

                mensaje:
                    `Faltan ${resumen.horasRestantes} hora(s) para completar la carga semanal.`

            });

        }


        if (
            resumen.estadoCarga ===
            "EXCEDIDA"
        ) {

            return res.status(400).json({

                mensaje:
                    `La planificación excede la carga permitida por ${resumen.horasExcedidas} hora(s).`

            });

        }


        // ==================================================
        // VALIDAR DISTRIBUCIÓN DE ACTIVIDADES
        // ==================================================

        for (const detalle of plan.detalles) {

            const horasDistribuidas =
                detalle.horarios.reduce(

                    (total, horario) => {

                        return (
                            total +
                            calcularDuracion(
                                horario.horaInicio,
                                horario.horaFin
                            )
                        );

                    },

                    0

                );


            const horasAsignadas =
                Number(
                    detalle.horasSemanales
                );


            if (
                Math.abs(
                    horasAsignadas -
                    horasDistribuidas
                ) > 0.001
            ) {

                return res.status(400).json({

                    mensaje:
                        `${detalle.actividad.codigo} tiene ${horasAsignadas} hora(s) asignadas, pero ${horasDistribuidas} hora(s) distribuidas.`

                });

            }

        }


        // ==================================================
        // SI ERA UNA CORRECCIÓN, CREAR NUEVA VERSIÓN
        // ==================================================

        const nuevaVersion =

            plan.enCorreccion
                ? plan.version + 1
                : plan.version;


        // ==================================================
        // ENVIAR NUEVAMENTE A COMISIÓN
        // ==================================================

        const planActualizado =
            await prisma.planTrabajoDocente.update({

                where: {
                    id: planId
                },

                data: {

                    estado:
                        "ENVIADO",

                    version:
                        nuevaVersion,

                    enCorreccion:
                        false,

                    observacion:
                        null

                },

                include: {

                    docente: {

                        include: {
                            dedicacion: true
                        }

                    },

                    periodo: true,

                    carrera: true,

                    detalles: {

                        include: {

                            actividad: true,

                            horarios: {

                                orderBy: [

                                    {
                                        diaSemana: "asc"
                                    },

                                    {
                                        horaInicio: "asc"
                                    }

                                ]

                            }

                        }

                    },

                    revisiones: {

                        orderBy: {
                            fecha: "asc"
                        }

                    }

                }

            });


        res.json({

            mensaje:

                plan.enCorreccion
                    ? `Corrección enviada correctamente. Versión ${nuevaVersion}.`
                    : "Planificación enviada correctamente a Comisión Académica.",

            plan:
                planActualizado,

            clases:
                resultadoClases.horarios,

            resumen

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error enviando la planificación."

        });

    }

};
// ======================================================
// INICIAR CORRECCIÓN DE PLANIFICACIÓN RECHAZADA
// ======================================================

exports.iniciarCorreccion = async (req, res) => {

    try {

        const planId =
            Number(req.params.planId);


        if (!Number.isInteger(planId)) {

            return res.status(400).json({

                mensaje:
                    "La planificación seleccionada no es válida."

            });

        }


        const plan =
            await prisma.planTrabajoDocente.findUnique({

                where: {
                    id: planId
                },

                include: {

                    revisiones: {

                        orderBy: {
                            fecha: "desc"
                        }

                    }

                }

            });


        if (!plan) {

            return res.status(404).json({

                mensaje:
                    "La planificación no existe."

            });

        }


        if (
            plan.estado !==
            "RECHAZADO"
        ) {

            return res.status(400).json({

                mensaje:
                    "Solo una planificación observada puede entrar en corrección."

            });

        }


        const planActualizado =
            await prisma.planTrabajoDocente.update({

                where: {
                    id: planId
                },

                data: {

                    estado:
                        "BORRADOR",

                    enCorreccion:
                        true

                }

            });


        res.json({

            mensaje:
                "La planificación está habilitada para corrección.",

            plan:
                planActualizado

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error habilitando la planificación para corrección."

        });

    }

};