const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// ======================================================
// COMISIÓN APRUEBA REVISIÓN
// ======================================================

exports.comisionAprueba = async (req, res) => {

    try {

        const planId =
            Number(req.params.planId);


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


        if (plan.estado !== "ENVIADO") {

            return res.status(400).json({

                mensaje:
                    "La planificación debe estar en Comisión Académica."

            });

        }


        await prisma.$transaction(async (tx) => {

            await tx.revisionPlanTrabajo.create({

                data: {

                    planId,

                    tipo:
                        "REVISION",

                    decision:
                        "APROBADO",

                    versionPlan:
                        plan.version,

                    nombreResponsable:
                        "Comisión Académica",

                    cargoResponsable:
                        "Responsable de Comisión Académica",

                    observacion:
                        "Planificación revisada satisfactoriamente."

                }

            });


            await tx.planTrabajoDocente.update({

                where: {
                    id: planId
                },

                data: {

                    estado:
                        "REVISADO",

                    observacion:
                        null

                }

            });

        });


        res.json({

            mensaje:
                "Comisión Académica revisó la planificación. Ahora pasa a Coordinación."

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error simulando la revisión de Comisión."

        });

    }

};


// ======================================================
// COMISIÓN SOLICITA CORRECCIÓN
// ======================================================

exports.comisionRechaza = async (req, res) => {

    try {

        const planId =
            Number(req.params.planId);


        const observacion =
            String(
                req.body.observacion ||
                "La Comisión Académica solicita realizar correcciones."
            ).trim();


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


        if (plan.estado !== "ENVIADO") {

            return res.status(400).json({

                mensaje:
                    "La planificación no se encuentra en Comisión."

            });

        }


        await prisma.$transaction(async (tx) => {

            await tx.revisionPlanTrabajo.create({

                data: {

                    planId,

                    tipo:
                        "REVISION",

                    decision:
                        "RECHAZADO",

                    versionPlan:
                        plan.version,

                    nombreResponsable:
                        "Comisión Académica",

                    cargoResponsable:
                        "Responsable de Comisión Académica",

                    observacion

                }

            });


            await tx.planTrabajoDocente.update({

                where: {
                    id: planId
                },

                data: {

                    estado:
                        "RECHAZADO",

                    observacion

                }

            });

        });


        res.json({

            mensaje:
                "Comisión Académica solicitó una corrección."

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error simulando la observación de Comisión."

        });

    }

};


// ======================================================
// COORDINACIÓN APRUEBA
// ======================================================

exports.coordinacionAprueba = async (req, res) => {

    try {

        const planId =
            Number(req.params.planId);


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


        if (plan.estado !== "REVISADO") {

            return res.status(400).json({

                mensaje:
                    "La planificación debe haber pasado primero por Comisión Académica."

            });

        }


        await prisma.$transaction(async (tx) => {

            await tx.revisionPlanTrabajo.create({

                data: {

                    planId,

                    tipo:
                        "APROBACION",

                    decision:
                        "APROBADO",

                    versionPlan:
                        plan.version,

                    nombreResponsable:
                        "Coordinación de Carrera",

                    cargoResponsable:
                        "Coordinador/a de Carrera",

                    observacion:
                        "Planificación aprobada."

                }

            });


            await tx.planTrabajoDocente.update({

                where: {
                    id: planId
                },

                data: {

                    estado:
                        "APROBADO",

                    observacion:
                        null

                }

            });

        });


        res.json({

            mensaje:
                "Planificación aprobada por Coordinación."

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error simulando la aprobación de Coordinación."

        });

    }

};


// ======================================================
// COORDINACIÓN SOLICITA CORRECCIÓN
// ======================================================

exports.coordinacionRechaza = async (req, res) => {

    try {

        const planId =
            Number(req.params.planId);


        const observacion =
            String(
                req.body.observacion ||
                "Coordinación solicita realizar correcciones."
            ).trim();


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


        if (plan.estado !== "REVISADO") {

            return res.status(400).json({

                mensaje:
                    "La planificación no se encuentra en Coordinación."

            });

        }


        await prisma.$transaction(async (tx) => {

            await tx.revisionPlanTrabajo.create({

                data: {

                    planId,

                    tipo:
                        "APROBACION",

                    decision:
                        "RECHAZADO",

                    versionPlan:
                        plan.version,

                    nombreResponsable:
                        "Coordinación de Carrera",

                    cargoResponsable:
                        "Coordinador/a de Carrera",

                    observacion

                }

            });


            await tx.planTrabajoDocente.update({

                where: {
                    id: planId
                },

                data: {

                    estado:
                        "RECHAZADO",

                    observacion

                }

            });

        });


        res.json({

            mensaje:
                "Coordinación solicitó una corrección. El plan volverá al docente."

        });

    }
    catch (error) {

        console.error(error);


        res.status(500).json({

            mensaje:
                "Error simulando la observación de Coordinación."

        });

    }

};