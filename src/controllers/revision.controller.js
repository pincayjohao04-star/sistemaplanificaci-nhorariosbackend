const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// ======================================================
// FUNCIONES AUXILIARES
// ======================================================


// ======================================================
// CONVERTIR HORA A MINUTOS
// ======================================================

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


    return (
        horas * 60
    ) + minutos;

}


// ======================================================
// CALCULAR DURACIÓN ENTRE DOS HORAS
// ======================================================

function calcularDuracion(
    horaInicio,
    horaFin
) {

    const inicio =
        horaAMinutos(
            horaInicio
        );


    const fin =
        horaAMinutos(
            horaFin
        );


    if (
        inicio === null ||
        fin === null ||
        fin <= inicio
    ) {

        return 0;

    }


    return (
        fin - inicio
    ) / 60;

}


// ======================================================
// INCLUDE COMPLETO DEL PLAN
// ======================================================

function includePlanCompleto() {

    return {

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

        },


        revisiones: {

            orderBy: {

                fecha: "asc"

            }

        }

    };

}


// ======================================================
// CALCULAR HORAS DISTRIBUIDAS DE UNA ACTIVIDAD
// ======================================================

function calcularHorasDistribuidasActividad(
    horarios = []
) {

    return horarios.reduce(

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

}


// ======================================================
// CALCULAR RESUMEN COMPLETO DE LA PLANIFICACIÓN
// ======================================================

async function construirResumenPlan(plan) {

    // ==================================================
    // CLASES DEL DOCENTE
    // ==================================================

    const clases =
        await prisma.horario.findMany({

            where: {

                docenteId:
                    plan.docenteId,

                periodoId:
                    plan.periodoId

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


    // ==================================================
    // HORAS DE CLASE
    // ==================================================

    const horasClase =
        clases.reduce(

            (total, clase) => {

                return (
                    total +
                    calcularDuracion(
                        clase.horaInicio,
                        clase.horaFin
                    )
                );

            },

            0

        );


    // ==================================================
    // HORAS DE ACTIVIDADES
    // ==================================================

    const horasActividades =
        plan.detalles.reduce(

            (total, detalle) => {

                return (
                    total +
                    Number(
                        detalle.horasSemanales ||
                        0
                    )
                );

            },

            0

        );


    // ==================================================
    // TOTAL
    // ==================================================

    const horasPlanificadas =
        horasClase +
        horasActividades;


    const diferencia =
        Number(
            plan.horasRequeridas
        )
        -
        horasPlanificadas;


    let estadoCarga =
        "COMPLETA";


    if (diferencia > 0) {

        estadoCarga =
            "INCOMPLETA";

    }


    if (diferencia < 0) {

        estadoCarga =
            "EXCEDIDA";

    }


    // ==================================================
    // VALIDAR DISTRIBUCIÓN DE ACTIVIDADES
    // ==================================================

    const actividades =
        plan.detalles.map(
            (detalle) => {

                const distribuidas =
                    calcularHorasDistribuidasActividad(
                        detalle.horarios || []
                    );


                const asignadas =
                    Number(
                        detalle.horasSemanales ||
                        0
                    );


                return {

                    detalleId:
                        detalle.id,

                    codigo:
                        detalle.actividad?.codigo ||
                        "",

                    nombre:
                        detalle.actividad?.nombre ||
                        "",

                    horasAsignadas:
                        asignadas,

                    horasDistribuidas:
                        Number(
                            distribuidas.toFixed(2)
                        ),

                    horasPendientes:
                        Number(
                            Math
                                .max(
                                    0,
                                    asignadas -
                                    distribuidas
                                )
                                .toFixed(2)
                        ),

                    completa:

                        Math.abs(
                            asignadas -
                            distribuidas
                        ) < 0.001

                };

            }
        );


    const actividadesCompletas =
        actividades.every(
            (actividad) =>
                actividad.completa
        );


    return {

        clases,


        resumen: {

            horasRequeridas:
                Number(
                    plan.horasRequeridas
                ),


            horasClase:
                Number(
                    horasClase.toFixed(2)
                ),


            horasActividades:
                Number(
                    horasActividades.toFixed(2)
                ),


            horasPlanificadas:
                Number(
                    horasPlanificadas.toFixed(2)
                ),


            horasRestantes:

                diferencia > 0

                    ? Number(
                        diferencia.toFixed(2)
                    )

                    : 0,


            horasExcedidas:

                diferencia < 0

                    ? Number(
                        Math
                            .abs(diferencia)
                            .toFixed(2)
                    )

                    : 0,


            estadoCarga,


            actividadesCompletas,


            actividades

        }

    };

}


// ======================================================
// VALIDAR ID
// ======================================================

function validarId(valor) {

    const id =
        Number(valor);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        return null;

    }


    return id;

}


// ======================================================
// OBTENER PLANIFICACIONES PENDIENTES
//
// REVISION   -> Comisión Académica
// APROBACION -> Coordinación
// ======================================================

exports.obtenerPendientes = async (
    req,
    res
) => {

    try {

        const etapa =
            String(
                req.query.etapa ||
                "REVISION"
            )
                .trim()
                .toUpperCase();


        const carreraId =
            req.query.carreraId

                ? Number(
                    req.query.carreraId
                )

                : null;


        let estado;


        // ==================================================
        // COMISIÓN
        // ==================================================

        if (
            etapa ===
            "REVISION"
        ) {

            estado =
                "ENVIADO";

        }


        // ==================================================
        // COORDINACIÓN
        // ==================================================

        else if (
            etapa ===
            "APROBACION"
        ) {

            estado =
                "REVISADO";

        }


        else {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La etapa debe ser REVISION o APROBACION."

                });

        }


        const where = {

            estado

        };


        if (
            carreraId !== null &&
            Number.isInteger(
                carreraId
            )
        ) {

            where.carreraId =
                carreraId;

        }


        const planes =
            await prisma
                .planTrabajoDocente
                .findMany({

                    where,


                    include:
                        includePlanCompleto(),


                    orderBy: {

                        updatedAt:
                            "asc"

                    }

                });


        // ==================================================
        // AGREGAR RESUMEN A CADA PLAN
        // ==================================================

        const resultado =
            await Promise.all(

                planes.map(

                    async (plan) => {

                        const datos =
                            await construirResumenPlan(
                                plan
                            );


                        return {

                            ...plan,


                            resumen:
                                datos.resumen

                        };

                    }

                )

            );


        return res.json(
            resultado
        );

    }
    catch (error) {

        console.error(
            "ERROR obtenerPendientes:",
            error
        );


        return res
            .status(500)
            .json({

                mensaje:
                    "Error obteniendo las planificaciones pendientes."

            });

    }

};


// ======================================================
// OBTENER UNA PLANIFICACIÓN COMPLETA
// ======================================================

exports.obtenerPlanRevision = async (
    req,
    res
) => {

    try {

        const planId =
            validarId(
                req.params.planId
            );


        if (!planId) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La planificación seleccionada no es válida."

                });

        }


        const plan =
            await prisma
                .planTrabajoDocente
                .findUnique({

                    where: {

                        id:
                            planId

                    },


                    include:
                        includePlanCompleto()

                });


        if (!plan) {

            return res
                .status(404)
                .json({

                    mensaje:
                        "La planificación no existe."

                });

        }


        const datos =
            await construirResumenPlan(
                plan
            );


        return res.json({

            plan,


            clases:
                datos.clases,


            resumen:
                datos.resumen

        });

    }
    catch (error) {

        console.error(
            "ERROR obtenerPlanRevision:",
            error
        );


        return res
            .status(500)
            .json({

                mensaje:
                    "Error obteniendo la planificación."

            });

    }

};


// ======================================================
// COMISIÓN ACADÉMICA REVISA PLAN
//
// ENVIADO -> REVISADO
// ======================================================

exports.revisarPlan = async (
    req,
    res
) => {

    try {

        const planId =
            validarId(
                req.params.planId
            );


        const {

            nombreResponsable,

            cargoResponsable,

            observacion

        } = req.body;


        // ==================================================
        // VALIDAR ID
        // ==================================================

        if (!planId) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La planificación seleccionada no es válida."

                });

        }


        // ==================================================
        // RESPONSABLE
        // ==================================================

        if (
            !nombreResponsable ||
            String(
                nombreResponsable
            ).trim() === ""
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "Debes indicar quién realiza la revisión."

                });

        }


        // ==================================================
        // PLAN
        // ==================================================

        const plan =
            await prisma
                .planTrabajoDocente
                .findUnique({

                    where: {

                        id:
                            planId

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


        if (!plan) {

            return res
                .status(404)
                .json({

                    mensaje:
                        "La planificación no existe."

                });

        }


        // ==================================================
        // DEBE ESTAR EN COMISIÓN
        // ==================================================

        if (
            plan.estado !==
            "ENVIADO"
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "Solo una planificación ENVIADA puede ser revisada por Comisión."

                });

        }


        // ==================================================
        // VALIDAR CARGA
        // ==================================================

        const datos =
            await construirResumenPlan(
                plan
            );


        if (
            datos.resumen.estadoCarga !==
            "COMPLETA"
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La carga semanal de la planificación no está completa."

                });

        }


        // ==================================================
        // VALIDAR ACTIVIDADES DISTRIBUIDAS
        // ==================================================

        if (
            !datos.resumen
                .actividadesCompletas
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "Existen actividades cuyas horas todavía no están completamente distribuidas."

                });

        }


        // ==================================================
        // TRANSACCIÓN
        // ==================================================

        const resultado =
            await prisma.$transaction(

                async (tx) => {


                    // ==========================================
                    // REGISTRAR HISTORIAL
                    // ==========================================

                    const revision =
                        await tx
                            .revisionPlanTrabajo
                            .create({

                                data: {

                                    planId,


                                    tipo:
                                        "REVISION",


                                    decision:
                                        "APROBADO",


                                    versionPlan:
                                        plan.version || 1,


                                    nombreResponsable:
                                        String(
                                            nombreResponsable
                                        ).trim(),


                                    cargoResponsable:

                                        cargoResponsable &&
                                        String(
                                            cargoResponsable
                                        ).trim() !== ""

                                            ? String(
                                                cargoResponsable
                                            ).trim()

                                            : null,


                                    observacion:

                                        observacion &&
                                        String(
                                            observacion
                                        ).trim() !== ""

                                            ? String(
                                                observacion
                                            ).trim()

                                            : null

                                }

                            });


                    // ==========================================
                    // PASAR A COORDINACIÓN
                    // ==========================================

                    const planActualizado =
                        await tx
                            .planTrabajoDocente
                            .update({

                                where: {

                                    id:
                                        planId

                                },


                                data: {

                                    estado:
                                        "REVISADO",


                                    observacion:
                                        null

                                },


                                include:
                                    includePlanCompleto()

                            });


                    return {

                        revision,

                        plan:
                            planActualizado

                    };

                }

            );


        return res.json({

            mensaje:
                "Planificación revisada correctamente. Ahora pasa a Coordinación.",


            ...resultado

        });

    }
    catch (error) {

        console.error(
            "ERROR revisarPlan:",
            error
        );


        return res
            .status(500)
            .json({

                mensaje:
                    "Error revisando la planificación."

            });

    }

};


// ======================================================
// COORDINACIÓN APRUEBA PLAN
//
// REVISADO -> APROBADO
// ======================================================

exports.aprobarPlan = async (
    req,
    res
) => {

    try {

        const planId =
            validarId(
                req.params.planId
            );


        const {

            nombreResponsable,

            cargoResponsable,

            observacion

        } = req.body;


        // ==================================================
        // VALIDAR ID
        // ==================================================

        if (!planId) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La planificación seleccionada no es válida."

                });

        }


        // ==================================================
        // RESPONSABLE
        // ==================================================

        if (
            !nombreResponsable ||
            String(
                nombreResponsable
            ).trim() === ""
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "Debes indicar quién aprueba la planificación."

                });

        }


        // ==================================================
        // PLAN
        // ==================================================

        const plan =
            await prisma
                .planTrabajoDocente
                .findUnique({

                    where: {

                        id:
                            planId

                    }

                });


        if (!plan) {

            return res
                .status(404)
                .json({

                    mensaje:
                        "La planificación no existe."

                });

        }


        // ==================================================
        // DEBE HABER PASADO POR COMISIÓN
        // ==================================================

        if (
            plan.estado !==
            "REVISADO"
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La planificación debe estar REVISADA antes de ser aprobada por Coordinación."

                });

        }


        // ==================================================
        // TRANSACCIÓN
        // ==================================================

        const resultado =
            await prisma.$transaction(

                async (tx) => {


                    // ==========================================
                    // REGISTRAR APROBACIÓN
                    // ==========================================

                    const revision =
                        await tx
                            .revisionPlanTrabajo
                            .create({

                                data: {

                                    planId,


                                    tipo:
                                        "APROBACION",


                                    decision:
                                        "APROBADO",


                                    versionPlan:
                                        plan.version || 1,


                                    nombreResponsable:
                                        String(
                                            nombreResponsable
                                        ).trim(),


                                    cargoResponsable:

                                        cargoResponsable &&
                                        String(
                                            cargoResponsable
                                        ).trim() !== ""

                                            ? String(
                                                cargoResponsable
                                            ).trim()

                                            : null,


                                    observacion:

                                        observacion &&
                                        String(
                                            observacion
                                        ).trim() !== ""

                                            ? String(
                                                observacion
                                            ).trim()

                                            : null

                                }

                            });


                    // ==========================================
                    // APROBAR PLAN
                    // ==========================================

                    const planActualizado =
                        await tx
                            .planTrabajoDocente
                            .update({

                                where: {

                                    id:
                                        planId

                                },


                                data: {

                                    estado:
                                        "APROBADO",


                                    enCorreccion:
                                        false,


                                    observacion:
                                        null

                                },


                                include:
                                    includePlanCompleto()

                            });


                    return {

                        revision,

                        plan:
                            planActualizado

                    };

                }

            );


        return res.json({

            mensaje:
                "Planificación aprobada correctamente por Coordinación.",


            ...resultado

        });

    }
    catch (error) {

        console.error(
            "ERROR aprobarPlan:",
            error
        );


        return res
            .status(500)
            .json({

                mensaje:
                    "Error aprobando la planificación."

            });

    }

};


// ======================================================
// RECHAZAR / SOLICITAR CORRECCIÓN
//
// Puede ocurrir:
// ENVIADO  -> rechazo de Comisión
// REVISADO -> rechazo de Coordinación
//
// Siempre vuelve al docente.
// ======================================================

exports.rechazarPlan = async (
    req,
    res
) => {

    try {

        const planId =
            validarId(
                req.params.planId
            );


        const {

            nombreResponsable,

            cargoResponsable,

            observacion

        } = req.body;


        // ==================================================
        // VALIDAR ID
        // ==================================================

        if (!planId) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La planificación seleccionada no es válida."

                });

        }


        // ==================================================
        // RESPONSABLE
        // ==================================================

        if (
            !nombreResponsable ||
            String(
                nombreResponsable
            ).trim() === ""
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "Debes indicar quién solicita la corrección."

                });

        }


        // ==================================================
        // OBSERVACIÓN OBLIGATORIA
        // ==================================================

        if (
            !observacion ||
            String(
                observacion
            ).trim() === ""
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "Debes indicar el motivo de la corrección solicitada."

                });

        }


        // ==================================================
        // PLAN
        // ==================================================

        const plan =
            await prisma
                .planTrabajoDocente
                .findUnique({

                    where: {

                        id:
                            planId

                    }

                });


        if (!plan) {

            return res
                .status(404)
                .json({

                    mensaje:
                        "La planificación no existe."

                });

        }


        // ==================================================
        // SOLO COMISIÓN O COORDINACIÓN
        // ==================================================

        if (
            plan.estado !== "ENVIADO" &&
            plan.estado !== "REVISADO"
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La planificación no se encuentra en una etapa que permita solicitar correcciones."

                });

        }


        // ==================================================
        // DETERMINAR QUIÉN RECHAZÓ
        // ==================================================

        const tipo =

            plan.estado ===
            "REVISADO"

                ? "APROBACION"

                : "REVISION";


        const etapaNombre =

            plan.estado ===
            "REVISADO"

                ? "Coordinación"

                : "Comisión Académica";


        // ==================================================
        // TRANSACCIÓN
        // ==================================================

        const resultado =
            await prisma.$transaction(

                async (tx) => {


                    // ==========================================
                    // HISTORIAL DEL RECHAZO
                    // ==========================================

                    const revision =
                        await tx
                            .revisionPlanTrabajo
                            .create({

                                data: {

                                    planId,


                                    tipo,


                                    decision:
                                        "RECHAZADO",


                                    versionPlan:
                                        plan.version || 1,


                                    nombreResponsable:
                                        String(
                                            nombreResponsable
                                        ).trim(),


                                    cargoResponsable:

                                        cargoResponsable &&
                                        String(
                                            cargoResponsable
                                        ).trim() !== ""

                                            ? String(
                                                cargoResponsable
                                            ).trim()

                                            : null,


                                    observacion:
                                        String(
                                            observacion
                                        ).trim()

                                }

                            });


                    // ==========================================
                    // VOLVER AL DOCENTE
                    // ==========================================

                    const planActualizado =
                        await tx
                            .planTrabajoDocente
                            .update({

                                where: {

                                    id:
                                        planId

                                },


                                data: {

                                    estado:
                                        "RECHAZADO",


                                    enCorreccion:
                                        false,


                                    observacion:
                                        String(
                                            observacion
                                        ).trim()

                                },


                                include:
                                    includePlanCompleto()

                            });


                    return {

                        revision,

                        plan:
                            planActualizado

                    };

                }

            );


        return res.json({

            mensaje:
                `${etapaNombre} solicitó correcciones. La planificación vuelve al docente.`,


            etapa:
                etapaNombre,


            version:
                plan.version || 1,


            ...resultado

        });

    }
    catch (error) {

        console.error(
            "ERROR rechazarPlan:",
            error
        );


        return res
            .status(500)
            .json({

                mensaje:
                    "Error solicitando correcciones en la planificación."

            });

    }

};


// ======================================================
// OBTENER HISTORIAL DE UNA PLANIFICACIÓN
// ======================================================

exports.obtenerHistorial = async (
    req,
    res
) => {

    try {

        const planId =
            validarId(
                req.params.planId
            );


        if (!planId) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "La planificación seleccionada no es válida."

                });

        }


        // ==================================================
        // VERIFICAR PLAN
        // ==================================================

        const plan =
            await prisma
                .planTrabajoDocente
                .findUnique({

                    where: {

                        id:
                            planId

                    },


                    select: {

                        id: true,

                        estado: true,

                        version: true,

                        enCorreccion: true,

                        observacion: true,

                        createdAt: true,

                        updatedAt: true

                    }

                });


        if (!plan) {

            return res
                .status(404)
                .json({

                    mensaje:
                        "La planificación no existe."

                });

        }


        // ==================================================
        // REVISIONES
        // ==================================================

        const revisiones =
            await prisma
                .revisionPlanTrabajo
                .findMany({

                    where: {

                        planId

                    },


                    orderBy: {

                        fecha:
                            "asc"

                    }

                });


        return res.json({

            plan,


            revisiones

        });

    }
    catch (error) {

        console.error(
            "ERROR obtenerHistorial:",
            error
        );


        return res
            .status(500)
            .json({

                mensaje:
                    "Error obteniendo el historial de la planificación."

            });

    }

};