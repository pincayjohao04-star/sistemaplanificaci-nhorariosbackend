const prisma = require("../config/prisma");


// LISTAR CARRERAS
exports.obtenerCarreras = async(req,res)=>{

    try{

        const carreras = await prisma.carrera.findMany({
            include:{
                niveles:true
            }
        });


        res.json(carreras);


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }

};



// CREAR CARRERA
exports.crearCarrera = async(req,res)=>{

    try{

        const {nombre,codigo}=req.body;


        const carrera = await prisma.carrera.create({

            data:{
                nombre,
                codigo
            }

        });


        res.json(carrera);


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }

};



// ACTUALIZAR CARRERA
exports.actualizarCarrera = async(req,res)=>{

    try{

        const {id}=req.params;

        const carrera = await prisma.carrera.update({

            where:{
                id:Number(id)
            },

            data:req.body

        });


        res.json(carrera);


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }

};



// ELIMINAR CARRERA
exports.eliminarCarrera = async(req,res)=>{

    try{

        const {id}=req.params;


        await prisma.carrera.delete({

            where:{
                id:Number(id)
            }

        });


        res.json({
            mensaje:"Carrera eliminada"
        });


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }

};