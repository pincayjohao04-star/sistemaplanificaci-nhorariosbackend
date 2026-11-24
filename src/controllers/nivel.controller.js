const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// Obtener niveles
exports.obtener = async (req, res) => {

    try {


        const niveles = await prisma.nivel.findMany({

            include: {

                carrera: true

            }

        });


        res.json(niveles);


    }
    catch(error){


        console.error(error);


        res.status(500).json({

            mensaje:"Error obteniendo niveles"

        });


    }

};





// Crear nivel
exports.crear = async (req,res)=>{


    try{


        const { nombre, semestre, carreraId } = req.body;



        const nivel = await prisma.nivel.create({

            data:{

                nombre,

                semestre:Number(semestre),

                carreraId:Number(carreraId)

            }

        });



        res.json(nivel);



    }
    catch(error){


        console.error(error);


        res.status(500).json({

            mensaje:"Error creando nivel"

        });


    }


};







// Actualizar nivel
exports.actualizar = async(req,res)=>{


    try{


        const id = Number(req.params.id);


        const { nombre, semestre, carreraId } = req.body;



        const nivel = await prisma.nivel.update({

            where:{

                id:id

            },

            data:{

                nombre,

                semestre:Number(semestre),

                carreraId:Number(carreraId)

            }

        });



        res.json(nivel);



    }
    catch(error){


        console.error(error);


        res.status(500).json({

            mensaje:"Error actualizando nivel"

        });


    }


};







exports.eliminar = async(req,res)=>{


    try{


        const id = Number(req.params.id);



        const asignaturas = await prisma.asignatura.count({

            where:{
                nivelId:id
            }

        });



        const horarios = await prisma.horario.count({

            where:{
                nivelId:id
            }

        });



        if(asignaturas > 0 || horarios > 0){


            return res.status(400).json({

                mensaje:
                `No se puede eliminar este nivel porque tiene ${asignaturas} asignaturas y ${horarios} horarios asociados.`

            });


        }



        await prisma.nivel.delete({

            where:{
                id:id
            }

        });



        res.json({

            mensaje:"Nivel eliminado correctamente"

        });



    }
    catch(error){


        console.error(error);


        res.status(500).json({

            mensaje:"Error eliminando nivel"

        });


    }


};