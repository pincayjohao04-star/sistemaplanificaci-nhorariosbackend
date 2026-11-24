const express = require("express");

const router = express.Router();

const {
    crearPeriodo,
    obtenerPeriodos,
    obtenerPeriodo,
    actualizarPeriodo,
    eliminarPeriodo
} = require("../controllers/periodo.controller");


router.post("/", crearPeriodo);

router.get("/", obtenerPeriodos);

router.get("/:id", obtenerPeriodo);

router.put("/:id", actualizarPeriodo);

router.delete("/:id", eliminarPeriodo);


module.exports = router;