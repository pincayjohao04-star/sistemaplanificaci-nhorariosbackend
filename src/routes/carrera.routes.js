const express = require("express");

const router = express.Router();

const carreraController = require("../controllers/carrera.controller");



router.get(
    "/",
    carreraController.obtenerCarreras
);


router.post(
    "/",
    carreraController.crearCarrera
);


router.put(
    "/:id",
    carreraController.actualizarCarrera
);


router.delete(
    "/:id",
    carreraController.eliminarCarrera
);



module.exports = router;