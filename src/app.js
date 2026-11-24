const express = require("express");
const cors = require("cors");

const app = express();


app.use(cors({
    origin:"http://localhost:5173"
}));


app.use(express.json());


// Rutas
const statusRoutes = require("./routes/status.routes");
const authRoutes = require("./routes/auth.routes");
const carreraRoutes = require("./routes/carrera.routes");
const nivelRoutes = require("./routes/nivel.routes");
const asignaturaRoutes = require("./routes/asignatura.routes");
const docenteRoutes = require("./routes/docente.routes");
const aulaRoutes = require("./routes/aula.routes");
const periodoRoutes = require("./routes/periodo.routes");
const seccionRoutes = require("./routes/seccion.routes");
const horarioRoutes = require("./routes/horario.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

// Middleware rutas
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/carreras", carreraRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/niveles", nivelRoutes);

app.use("/api/asignaturas", asignaturaRoutes);

app.use("/api/docentes", docenteRoutes);

app.use("/api/aulas", aulaRoutes);

app.use("/api/periodos", periodoRoutes);

app.use("/api/secciones", seccionRoutes);

app.use("/api/horarios", horarioRoutes);


module.exports = app;