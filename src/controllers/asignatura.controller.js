const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// Obtener asignaturas
exports.obtener = async (req, res) => {

    try {


        const asignaturas = await prisma.asignatura.findMany({

            include: {

                nivel: {

                    include: {

                        carrera:true

                    }

                }

            }

        });


        res.json(asignaturas);


    }
    catch(error){

        console.error(error);


        res.status(500).json({

            mensaje:"Error obteniendo asignaturas"

        });

    }

};




// Crear asignatura
exports.crear = async(req,res)=>{


    try{


        const {

            codigo,

            nombre,

            creditos,

            horasSemana,

            nivelId

        } = req.body;



        const asignatura = await prisma.asignatura.create({

            data:{


                codigo,


                nombre,


                creditos:Number(creditos),


                horasSemana:Number(horasSemana),


                nivelId:Number(nivelId)


            }

        });



        res.json(asignatura);



    }
    catch(error){


        console.error(error);



        res.status(500).json({

            mensaje:"Error creando asignatura"

        });


    }


};






// Actualizar asignatura
exports.actualizar = async(req,res)=>{


    try{


        const id = Number(req.params.id);



        const {

            codigo,

            nombre,

            creditos,

            horasSemana,

            nivelId

        } = req.body;



        const asignatura = await prisma.asignatura.update({

            where:{

                id:id

            },


            data:{


                codigo,


                nombre,


                creditos:Number(creditos),


                horasSemana:Number(horasSemana),


                nivelId:Number(nivelId)


            }


        });



        res.json(asignatura);



    }
    catch(error){


        console.error(error);


        res.status(500).json({

            mensaje:"Error actualizando asignatura"

        });


    }


};







// Eliminar asignatura
exports.eliminar = async(req,res)=>{


    try{


        const id = Number(req.params.id);



        await prisma.asignatura.delete({

            where:{

                id:id

            }

        });



        res.json({

            mensaje:"Asignatura eliminada correctamente"

        });



    }
    catch(error){


        console.error(error);



        if(error.code === "P2003"){


            return res.status(400).json({

                mensaje:
                "No se puede eliminar la asignatura porque tiene horarios asociados."

            });


        }



        res.status(500).json({

            mensaje:"Error eliminando asignatura"

        });


    }


};