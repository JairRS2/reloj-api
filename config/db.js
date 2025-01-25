require("dotenv").config(); // Cargar variables desde el archivo .env
const sql = require("mssql");

// Configuración de conexión para la base de datos
const dbConfig = {
  user: process.env.DB_USER, // Usuario de SQL Server
  password: process.env.DB_PASSWORD, // Contraseña
  server: process.env.DB_SERVER, // Dirección IP o nombre del servidor
  database: process.env.DB_DATABASE, // Nombre de la base de datos
  port: 1433, // Puerto de SQL Server
  options: {
    encrypt: false, // Cambiar a true si la conexión requiere encriptación
    enableArithAbort: true, // Requerido en algunas configuraciones de SQL Server
  },
};

// Crear la conexión a la base de datos
const pool = new sql.ConnectionPool(dbConfig);

(async () => {
  try {
    // Intentar conectar
    await pool.connect();
    console.log("✅ Conexión a RelojBioTimeGrupo exitosa");
  } catch (error) {
    console.error("❌ Error al conectar con SQL Server:", error.message);
  }
})();

// Cerrar la conexión de forma segura al salir
process.on("SIGINT", async () => {
  try {
    await pool.close();
    console.log("🔌 Conexión a dbAlmacen cerrada correctamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al cerrar la conexión:", error.message);
    process.exit(1);
  }
});

// Exportar la conexión para otros módulos
module.exports = { pool };
