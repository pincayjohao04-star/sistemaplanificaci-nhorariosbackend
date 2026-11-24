const express = require("express");
const cors = require("cors");
const revisionRoutes =
    require("./routes/revision.routes");
const app = express();
const simulacionRoutes =
    require("./routes/simulacion.routes");

// ======================================================
// MIDDLEWARES
// ======================================================

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());


// ======================================================
// RUTA DE PRUEBA
// ======================================================

app.get("/", (req, res) => {

    res.json({
        mensaje: "API Sistema de Horarios UNESUM funcionando"
    });

});


// ======================================================
// RUTAS
// ======================================================

app.use(
    "/api/auth",
    require("./routes/auth.routes")
);

app.use(
    "/api/carreras",
    require("./routes/carrera.routes")
);

app.use(
    "/api/niveles",
    require("./routes/nivel.routes")
);

app.use(
    "/api/docentes",
    require("./routes/docente.routes")
);

app.use(
    "/api/asignaturas",
    require("./routes/asignatura.routes")
);

app.use(
    "/api/aulas",
    require("./routes/aula.routes")
);

app.use(
    "/api/periodos",
    require("./routes/periodo.routes")
);

app.use(
    "/api/secciones",
    require("./routes/seccion.routes")
);

app.use(
    "/api/horarios",
    require("./routes/horario.routes")
);


// MUY IMPORTANTE:
// PLANIFICACIÓN DEBE ESTAR ANTES DEL 404

app.use(
    "/api/planificacion",
    require("./routes/planificacion.routes")
);
app.use(
    "/api/revisiones",
    revisionRoutes
);
app.use(
    "/api/simulacion",
    simulacionRoutes
);

// ======================================================
// 404 - SIEMPRE AL FINAL
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });

});


// ======================================================
// SERVIDOR
// ======================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Servidor ejecutándose en puerto ${PORT}`);

});