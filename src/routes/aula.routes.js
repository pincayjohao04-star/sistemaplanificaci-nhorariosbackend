const express = require("express");

const router = express.Router();


const aulaController = require("../controllers/aula.controller");



router.get(

    "/",

    aulaController.obtener

);



router.post(

    "/",

    aulaController.crear

);



router.put(

    "/:id",

    aulaController.actualizar

);



router.delete(

    "/:id",

    aulaController.eliminar

);



module.exports = router;