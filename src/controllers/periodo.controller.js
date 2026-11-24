const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


exports.crearPeriodo = async (req, res) => {

    try {

        const {

            nombre,

            fechaInicio,

            fechaFin,

            activo

        } = req.body;

        const periodo = await prisma.periodoAcademico.create({

            data: {

                nombre,

                fechaInicio: new Date(fechaInicio),

                fechaFin: new Date(fechaFin),

                activo

            }

        });

        res.json(periodo);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            error: error.message

        });

    }

};


// Obtener todos
exports.obtenerPeriodos = async(req,res)=>{

    const periodos = await prisma.periodoAcademico.findMany();

    res.json(periodos);

};


// Obtener uno
exports.obtenerPeriodo = async(req,res)=>{

    const periodo = await prisma.periodoAcademico.findUnique({

        where:{
            id:Number(req.params.id)
        }

    });

    res.json(periodo);

};


// Actualizar
exports.actualizarPeriodo = async (req, res) => {

    try {

        const {

            nombre,

            fechaInicio,

            fechaFin,

            activo

        } = req.body;

        const periodo = await prisma.periodoAcademico.update({

            where: {

                id: Number(req.params.id)

            },

            data: {

                nombre,

                fechaInicio: new Date(fechaInicio),

                fechaFin: new Date(fechaFin),

                activo

            }

        });

        res.json(periodo);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            error: error.message

        });

    }

};


// Eliminar
exports.eliminarPeriodo = async(req,res)=>{

    await prisma.periodoAcademico.delete({

        where:{
            id:Number(req.params.id)
        }

    });


    res.json({
        mensaje:"Periodo eliminado"
    });

};