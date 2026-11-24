const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// Crear horario
exports.crearHorario = async(req,res)=>{

    try{

        const horario = await prisma.horario.create({

            data:req.body

        });


        res.json(horario);


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }

};



// Obtener todos
exports.obtenerHorarios = async(req,res)=>{

    const horarios = await prisma.horario.findMany({

        include:{
            docente:true,
            asignatura:true,
            aula:true,
            periodo:true,
            seccion:true
        }

    });


    res.json(horarios);

};



// Obtener uno
exports.obtenerHorario = async(req,res)=>{


    const horario = await prisma.horario.findUnique({

        where:{
            id:Number(req.params.id)
        },

        include:{
            docente:true,
            asignatura:true,
            aula:true,
            periodo:true,
            seccion:true
        }

    });


    res.json(horario);

};



// Actualizar
exports.actualizarHorario = async(req,res)=>{


    const horario = await prisma.horario.update({

        where:{
            id:Number(req.params.id)
        },

        data:req.body

    });


    res.json(horario);

};



// Eliminar
exports.eliminarHorario = async(req,res)=>{


    await prisma.horario.delete({

        where:{
            id:Number(req.params.id)
        }

    });


    res.json({

        mensaje:"Horario eliminado"

    });

};