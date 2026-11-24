const express = require("express");

const router = express.Router();

const docenteController =
    require("../controllers/docente.controller");


// Obtener dedicaciones disponibles
router.get(
    "/dedicaciones",
    docenteController.obtenerDedicaciones
);


// Obtener todos los docentes
router.get(
    "/",
    docenteController.obtener
);


// Obtener un docente
router.get(
    "/:id",
    docenteController.obtenerPorId
);


// Crear docente
router.post(
    "/",
    docenteController.crear
);


// Actualizar docente
router.put(
    "/:id",
    docenteController.actualizar
);


// Eliminar docente
router.delete(
    "/:id",
    docenteController.eliminar
);


module.exports = router;