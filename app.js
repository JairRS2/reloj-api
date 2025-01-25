require("dotenv").config(); // Cargar variables desde .env
const express = require("express");
const cors = require("cors");

// Crear la aplicación de Express
const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Importar y usar rutas
const checadasRoutes = require("./routes/checadasrouter");
app.use("/api", checadasRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("❌ Error inesperado:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
