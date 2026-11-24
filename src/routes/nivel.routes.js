const express = require("express");

const router = express.Router();


const nivelController = require("../controllers/nivel.controller");



// GET
router.get(
    "/",
    nivelController.obtener
);


// POST
router.post(
    "/",
    nivelController.crear
);


// PUT
router.put(
    "/:id",
    nivelController.actualizar
);


// DELETE
router.delete(
    "/:id",
    nivelController.eliminar
);



module.exports = router;