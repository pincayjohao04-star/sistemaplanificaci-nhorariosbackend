const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {

    const administrador = await prisma.rol.upsert({
        where:{
            nombre:"Administrador"
        },
        update:{},
        create:{
            nombre:"Administrador"
        }
    });


    const coordinador = await prisma.rol.upsert({
        where:{
            nombre:"Coordinador"
        },
        update:{},
        create:{
            nombre:"Coordinador"
        }
    });


    const docente = await prisma.rol.upsert({
        where:{
            nombre:"Docente"
        },
        update:{},
        create:{
            nombre:"Docente"
        }
    });


    const password = await bcrypt.hash("admin123",10);


    await prisma.usuario.upsert({

        where:{
            nombre:"admin"
        },

        update:{},

        create:{
            nombre:"admin",
            contrasena:password,
            rolId: administrador.id
        }

    });


    console.log("✅ Datos iniciales creados");

}


main()
.catch((e)=>{
    console.error(e);
    process.exit(1);
})
.finally(async()=>{
    await prisma.$disconnect();
});