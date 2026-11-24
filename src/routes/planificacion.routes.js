const express = require("express");

const router = express.Router();

const planificacionController =
    require("../controllers/planificacion.controller");


// ======================================================
// CATÁLOGO DE ACTIVIDADES
// ======================================================

router.get(
    "/actividades",
    planificacionController.obtenerActividades
);


// ======================================================
// PLANIFICACIÓN DEL DOCENTE
// ======================================================

router.post(
    "/iniciar",
    planificacionController.iniciarPlanificacion
);


router.get(
    "/docente/:docenteId/periodo/:periodoId",
    planificacionController.obtenerPlanificacion
);


// ======================================================
// ACTIVIDADES DEL PLAN
// ======================================================

router.post(
    "/planes/:planId/actividades",
    planificacionController.agregarActividad
);


router.put(
    "/actividades/:detalleId",
    planificacionController.actualizarActividad
);


router.delete(
    "/actividades/:detalleId",
    planificacionController.eliminarActividad
);


// ======================================================
// HORARIOS DE LAS ACTIVIDADES
// ======================================================

router.post(
    "/actividades/:detalleId/horarios",
    planificacionController.agregarHorarioActividad
);


router.delete(
    "/horarios/:horarioId",
    planificacionController.eliminarHorarioActividad
);


// ======================================================
// CONFIRMAR PLANIFICACIÓN
// ======================================================

router.put(
    "/planes/:planId/confirmar",
    planificacionController.confirmarPlanificacion
);
// ======================================================
// CORREGIR PLANIFICACIÓN OBSERVADA
// ======================================================

router.put(
    "/planes/:planId/corregir",
    planificacionController.iniciarCorreccion
);

module.exports = router;