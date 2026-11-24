const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// ======================================================
// OBTENER DEDICACIONES
// ======================================================

exports.obtenerDedicaciones = async (req, res) => {

    try {

        const dedicaciones = await prisma.dedicacionDocente.findMany({

            where: {
                activo: true
            },

            orderBy: {
                horasSemanales: "desc"
            }

        });

        res.json(dedicaciones);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error obteniendo las dedicaciones docentes"
        });

    }

};


// ======================================================
// OBTENER DOCENTES
// ======================================================

exports.obtener = async (req, res) => {

    try {

        const docentes = await prisma.docente.findMany({

            include: {

                dedicacion: true

            },

            orderBy: {

                id: "asc"

            }

        });

        res.json(docentes);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            mensaje: "Error obteniendo docentes"

        });

    }

};


// ======================================================
// OBTENER DOCENTE POR ID
// ======================================================

exports.obtenerPorId = async (req, res) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {

            return res.status(400).json({

                mensaje: "El ID del docente no es válido"

            });

        }

        const docente = await prisma.docente.findUnique({

            where: {

                id

            },

            include: {

                dedicacion: true,

                carreras: {

                    include: {

                        carrera: true

                    },

                    orderBy: {

                        fechaInicio: "desc"

                    }

                }

            }

        });

        if (!docente) {

            return res.status(404).json({

                mensaje: "Docente no encontrado"

            });

        }

        res.json(docente);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            mensaje: "Error obteniendo el docente"

        });

    }

};


// ======================================================
// CREAR DOCENTE
// ======================================================

exports.crear = async (req, res) => {

    try {

        const {

            cedula,
            nombres,
            apellidos,
            correo,
            telefono,
            titulo,
            dedicacionId

        } = req.body;


        // --------------------------------------------------
        // Validaciones básicas
        // --------------------------------------------------

        if (!cedula || !nombres || !apellidos || !correo) {

            return res.status(400).json({

                mensaje:
                    "Cédula, nombres, apellidos y correo son obligatorios."

            });

        }


        let dedicacionIdNormalizado = null;


        if (
            dedicacionId !== undefined &&
            dedicacionId !== null &&
            dedicacionId !== ""
        ) {

            dedicacionIdNormalizado = Number(dedicacionId);

            if (!Number.isInteger(dedicacionIdNormalizado)) {

                return res.status(400).json({

                    mensaje: "La dedicación seleccionada no es válida."

                });

            }


            const dedicacionExiste =
                await prisma.dedicacionDocente.findFirst({

                    where: {

                        id: dedicacionIdNormalizado,
                        activo: true

                    }

                });


            if (!dedicacionExiste) {

                return res.status(400).json({

                    mensaje:
                        "La dedicación seleccionada no existe o está inactiva."

                });

            }

        }


        // --------------------------------------------------
        // Crear docente
        // --------------------------------------------------

        const docente = await prisma.docente.create({

            data: {

                cedula: cedula.trim(),

                nombres: nombres.trim(),

                apellidos: apellidos.trim(),

                correo: correo.trim(),

                telefono:
                    telefono && telefono.trim() !== ""
                        ? telefono.trim()
                        : null,

                titulo:
                    titulo && titulo.trim() !== ""
                        ? titulo.trim()
                        : null,

                dedicacionId: dedicacionIdNormalizado

            },

            include: {

                dedicacion: true

            }

        });


        res.status(201).json(docente);

    }
    catch (error) {

        console.error(error);


        if (error.code === "P2002") {

            return res.status(400).json({

                mensaje:
                    "La cédula o el correo ya están registrados."

            });

        }


        res.status(500).json({

            mensaje: "Error creando docente"

        });

    }

};


// ======================================================
// ACTUALIZAR DOCENTE
// ======================================================

exports.actualizar = async (req, res) => {

    try {

        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            return res.status(400).json({

                mensaje: "El ID del docente no es válido."

            });

        }


        const docenteExiste = await prisma.docente.findUnique({

            where: {

                id

            }

        });


        if (!docenteExiste) {

            return res.status(404).json({

                mensaje: "Docente no encontrado."

            });

        }


        const {

            cedula,
            nombres,
            apellidos,
            correo,
            telefono,
            titulo,
            estado,
            dedicacionId

        } = req.body;


        const data = {};


        // --------------------------------------------------
        // Solo actualizar los campos recibidos
        // --------------------------------------------------

        if (cedula !== undefined) {

            data.cedula = cedula.trim();

        }


        if (nombres !== undefined) {

            data.nombres = nombres.trim();

        }


        if (apellidos !== undefined) {

            data.apellidos = apellidos.trim();

        }


        if (correo !== undefined) {

            data.correo = correo.trim();

        }


        if (telefono !== undefined) {

            data.telefono =
                telefono && telefono.trim() !== ""
                    ? telefono.trim()
                    : null;

        }


        if (titulo !== undefined) {

            data.titulo =
                titulo && titulo.trim() !== ""
                    ? titulo.trim()
                    : null;

        }


        // --------------------------------------------------
        // Estado
        // --------------------------------------------------

        if (estado !== undefined) {

            if (typeof estado === "boolean") {

                data.estado = estado;

            }
            else {

                data.estado =
                    String(estado).toLowerCase() === "true";

            }

        }


        // --------------------------------------------------
        // Dedicación
        // --------------------------------------------------

        if (dedicacionId !== undefined) {

            if (
                dedicacionId === null ||
                dedicacionId === ""
            ) {

                data.dedicacionId = null;

            }
            else {

                const dedicacionIdNormalizado =
                    Number(dedicacionId);


                if (!Number.isInteger(dedicacionIdNormalizado)) {

                    return res.status(400).json({

                        mensaje:
                            "La dedicación seleccionada no es válida."

                    });

                }


                const dedicacionExiste =
                    await prisma.dedicacionDocente.findFirst({

                        where: {

                            id: dedicacionIdNormalizado,
                            activo: true

                        }

                    });


                if (!dedicacionExiste) {

                    return res.status(400).json({

                        mensaje:
                            "La dedicación seleccionada no existe o está inactiva."

                    });

                }


                data.dedicacionId =
                    dedicacionIdNormalizado;

            }

        }


        // --------------------------------------------------
        // Actualizar
        // --------------------------------------------------

        const docente = await prisma.docente.update({

            where: {

                id

            },

            data,

            include: {

                dedicacion: true

            }

        });


        res.json(docente);

    }
    catch (error) {

        console.error(error);


        if (error.code === "P2002") {

            return res.status(400).json({

                mensaje:
                    "La cédula o el correo ya están registrados."

            });

        }


        res.status(500).json({

            mensaje: "Error actualizando docente"

        });

    }

};


// ======================================================
// ELIMINAR DOCENTE
// ======================================================

exports.eliminar = async (req, res) => {

    try {

        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            return res.status(400).json({

                mensaje: "El ID del docente no es válido."

            });

        }


        await prisma.docente.delete({

            where: {

                id

            }

        });


        res.json({

            mensaje: "Docente eliminado correctamente"

        });

    }
    catch (error) {

        console.error(error);


        if (error.code === "P2025") {

            return res.status(404).json({

                mensaje: "Docente no encontrado."

            });

        }


        if (error.code === "P2003") {

            return res.status(400).json({

                mensaje:
                    "No se puede eliminar el docente porque tiene asignaciones, horarios, planes de trabajo u otros registros asociados."

            });

        }


        res.status(500).json({

            mensaje: "Error eliminando docente"

        });

    }

};