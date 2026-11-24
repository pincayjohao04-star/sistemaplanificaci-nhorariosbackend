const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();



exports.obtener = async(req,res)=>{


    try{


        const [

            carreras,

            niveles,

            asignaturas,

            docentes,

            aulas,

            horarios,


            ultimaCarrera,

            ultimoNivel,

            ultimaAsignatura,

            ultimoDocente,

            ultimaAula


        ] = await Promise.all([



            prisma.carrera.count(),


            prisma.nivel.count(),


            prisma.asignatura.count(),


            prisma.docente.count(),


            prisma.aula.count(),


            prisma.horario.count(),






            prisma.carrera.findFirst({

                orderBy:{

                    createdAt:"desc"

                }

            }),





            prisma.nivel.findFirst({

                orderBy:{

                    id:"desc"

                },

                include:{

                    carrera:true

                }

            }),






            prisma.asignatura.findFirst({

                orderBy:{

                    id:"desc"

                },

                include:{

                    nivel:true

                }

            }),







            prisma.docente.findFirst({

                orderBy:{

                    createdAt:"desc"

                }

            }),






            prisma.aula.findFirst({

                orderBy:{

                    createdAt:"desc"

                }

            })



        ]);





        res.json({


            carreras,

            niveles,

            asignaturas,

            docentes,

            aulas,

            horarios,


            actividad:[


                {

                    tipo:"Carrera",

                    mensaje:

                    ultimaCarrera

                    ?

                    `Nueva carrera registrada: ${ultimaCarrera.nombre}`

                    :

                    "Sin registros"

                },



                {

                    tipo:"Nivel",

                    mensaje:

                    ultimoNivel

                    ?

                    `Nivel creado: ${ultimoNivel.nombre} - ${ultimoNivel.carrera.nombre}`

                    :

                    "Sin registros"

                },




                {

                    tipo:"Asignatura",

                    mensaje:

                    ultimaAsignatura

                    ?

                    `Asignatura registrada: ${ultimaAsignatura.nombre}`

                    :

                    "Sin registros"

                },




                {

                    tipo:"Docente",

                    mensaje:

                    ultimoDocente

                    ?

                    `Docente registrado: ${ultimoDocente.nombres} ${ultimoDocente.apellidos}`

                    :

                    "Sin registros"

                },




                {

                    tipo:"Aula",

                    mensaje:

                    ultimaAula

                    ?

                    `Aula creada: ${ultimaAula.codigo}`

                    :

                    "Sin registros"

                }


            ]



        });



    }
    catch(error){


        console.error(error);



        res.status(500).json({

            mensaje:"Error obteniendo dashboard"

        });



    }


};