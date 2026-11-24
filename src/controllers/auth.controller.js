const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");


exports.login = async (req,res)=>{

    const {nombre, contrasena} = req.body;


    const usuario = await prisma.usuario.findUnique({
        where:{
            nombre:nombre
        }
    });


    if(!usuario){
        return res.status(404).json({
            mensaje:"Usuario no encontrado"
        });
    }


    const validar = await bcrypt.compare(
        contrasena,
        usuario.contrasena
    );


    if(!validar){
        return res.status(401).json({
            mensaje:"Contraseña incorrecta"
        });
    }


    res.json({
        mensaje:"Login correcto",
        usuario
    });

}