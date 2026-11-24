const express = require("express");

const router = express.Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();



router.get("/", async(req,res)=>{


    try{


        await prisma.$queryRaw`SELECT 1`;



        res.json({

            backend:true,

            database:true,

            system:true

        });



    }
    catch(error){


        console.error(error);



        res.status(500).json({

            backend:true,

            database:false,

            system:true

        });


    }


});



module.exports = router;