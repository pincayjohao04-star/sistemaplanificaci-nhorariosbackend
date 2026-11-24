const express = require("express");

const router = express.Router();

const {
    crearHorario,
    obtenerHorarios,
    obtenerHorario,
    actualizarHorario,
    eliminarHorario
} = require("../controllers/horario.controller");


router.post("/", crearHorario);

router.get("/", obtenerHorarios);

router.get("/:id", obtenerHorario);

router.put("/:id", actualizarHorario);

router.delete("/:id", eliminarHorario);


module.exports = router;