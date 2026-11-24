const express = require("express");

const router = express.Router();

const {
    crearSeccion,
    obtenerSecciones,
    obtenerSeccion,
    actualizarSeccion,
    eliminarSeccion
} = require("../controllers/seccion.controller");


router.post("/", crearSeccion);

router.get("/", obtenerSecciones);

router.get("/:id", obtenerSeccion);

router.put("/:id", actualizarSeccion);

router.delete("/:id", eliminarSeccion);


module.exports = router;