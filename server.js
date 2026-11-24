require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("=================================");
    console.log("🚀 Sistema de Horarios");
    console.log(`✅ Servidor iniciado en el puerto ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("=================================");
});