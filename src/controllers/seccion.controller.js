const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// Crear sección
exports.crearSeccion = async(req,res)=>{

    try{

        const seccion = await prisma.seccion.create({

            data:req.body

        });

        res.json(seccion);


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }

};



// Obtener todas
exports.obtenerSecciones = async(req,res)=>{

    const secciones = await prisma.seccion.findMany();

    res.json(secciones);

};



// Obtener una
exports.obtenerSeccion = async(req,res)=>{

    const seccion = await prisma.seccion.findUnique({

        where:{
            id:Number(req.params.id)
        }

    });

    res.json(seccion);

};



// Actualizar
exports.actualizarSeccion = async(req,res)=>{


    const seccion = await prisma.seccion.update({

        where:{
            id:Number(req.params.id)
        },

        data:req.body

    });


    res.json(seccion);

};



// Eliminar
exports.eliminarSeccion = async(req,res)=>{


    await prisma.seccion.delete({

        where:{
            id:Number(req.params.id)
        }

    });


    res.json({

        mensaje:"Sección eliminada"

    });

};