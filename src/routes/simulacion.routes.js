const express =
    require("express");

const router =
    express.Router();

const simulacionController =
    require(
        "../controllers/simulacion.controller"
    );


router.post(
    "/planes/:planId/comision/aprobar",
    simulacionController.comisionAprueba
);


router.post(
    "/planes/:planId/comision/rechazar",
    simulacionController.comisionRechaza
);


router.post(
    "/planes/:planId/coordinacion/aprobar",
    simulacionController.coordinacionAprueba
);


router.post(
    "/planes/:planId/coordinacion/rechazar",
    simulacionController.coordinacionRechaza
);


module.exports =
    router;