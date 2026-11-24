const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();



// Obtener aulas
exports.obtener = async(req,res)=>{


    try{


        const aulas = await prisma.aula.findMany({

            orderBy:{

                id:"asc"

            }

        });



        res.json(aulas);



    }
    catch(error){


        console.error(error);



        res.status(500).json({

            mensaje:"Error obteniendo aulas"

        });


    }


};







// Crear aula
exports.crear = async(req,res)=>{


    try{


        const {

            codigo,

            capacidad,

            tipo

        } = req.body;



        const aula = await prisma.aula.create({

            data:{


                codigo,


                capacidad:Number(capacidad),


                tipo


            }

        });



        res.json(aula);



    }
    catch(error){


        console.error(error);



        if(error.code === "P2002"){


            return res.status(400).json({

                mensaje:"El código del aula ya existe."

            });


        }



        res.status(500).json({

            mensaje:"Error creando aula"

        });



    }


};








// Actualizar aula
exports.actualizar = async(req,res)=>{


    try{


        const id = Number(req.params.id);



        const {

            codigo,

            capacidad,

            tipo,

            estado

        } = req.body;



        const aula = await prisma.aula.update({

            where:{

                id:id

            },


            data:{


                codigo,


                capacidad:Number(capacidad),


                tipo,


                estado:Boolean(estado)


            }


        });



        res.json(aula);



    }
    catch(error){


        console.error(error);



        res.status(500).json({

            mensaje:"Error actualizando aula"

        });


    }


};








// Eliminar aula
exports.eliminar = async(req,res)=>{


    try{


        const id = Number(req.params.id);



        await prisma.aula.delete({

            where:{

                id:id

            }

        });



        res.json({

            mensaje:"Aula eliminada correctamente"

        });



    }
    catch(error){


        console.error(error);



        if(error.code === "P2003"){


            return res.status(400).json({

                mensaje:
                "No se puede eliminar el aula porque tiene horarios asociados."

            });


        }



        res.status(500).json({

            mensaje:"Error eliminando aula"

        });



    }


};