const express = require("express");

const router =
    express.Router();


const revisionController =
    require(
        "../controllers/revision.controller"
    );


// ======================================================
// PLANIFICACIONES PENDIENTES
//
// ?etapa=REVISION
// ?etapa=APROBACION
// ======================================================

router.get(
    "/pendientes",
    revisionController.obtenerPendientes
);


// ======================================================
// DETALLE DE PLANIFICACIÓN
// ======================================================

router.get(
    "/planes/:planId",
    revisionController.obtenerPlanRevision
);


// ======================================================
// HISTORIAL
// ======================================================

router.get(
    "/planes/:planId/historial",
    revisionController.obtenerHistorial
);


// ======================================================
// RESPONSABLE / REVISOR
// ======================================================

router.post(
    "/planes/:planId/revisar",
    revisionController.revisarPlan
);


// ======================================================
// COORDINADOR
// ======================================================

router.post(
    "/planes/:planId/aprobar",
    revisionController.aprobarPlan
);


// ======================================================
// RECHAZAR
// ======================================================

router.post(
    "/planes/:planId/rechazar",
    revisionController.rechazarPlan
);


module.exports =
    router;