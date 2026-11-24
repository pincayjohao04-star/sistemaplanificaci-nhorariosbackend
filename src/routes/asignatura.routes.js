const express = require("express");

const router = express.Router();


const asignaturaController = require("../controllers/asignatura.controller");



router.get(

    "/",

    asignaturaController.obtener

);



router.post(

    "/",

    asignaturaController.crear

);



router.put(

    "/:id",

    asignaturaController.actualizar

);



router.delete(

    "/:id",

    asignaturaController.eliminar

);



module.exports = router;