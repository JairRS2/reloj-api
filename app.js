require("dotenv").config(); // Cargar variables desde .env
const express = require("express");
const cors = require("cors");

// Crear la aplicación de Express
const app = express();

// Middleware global
app.use(cors({ origin: "*" }));
app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {

  res.send("Bienvenido a la API");
});

// Importar y usar rutas
const checadasRoutes = require("./routes/checadasrouter");
app.use("/api", checadasRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("❌ Error inesperado:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`);
}); 