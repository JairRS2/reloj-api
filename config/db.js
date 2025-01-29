require("dotenv").config(); // Cargar variables desde el archivo .env
const sql = require("mssql");

// Configuración de conexión para las bases de datos
const dbConfigRelojBioTimeGrupo = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASEGRUPO,
  port: 1433,
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};

const dbConfigRelojBioTimeCentral = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASECENTRAL,
  port: 1433,
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};

// Crear las conexiones a las bases de datos
const poolGrupo = new sql.ConnectionPool(dbConfigRelojBioTimeGrupo);
const poolCentral = new sql.ConnectionPool(dbConfigRelojBioTimeCentral);

(async () => {
  try {
    // Intentar conectar a ambas bases de datos
    await poolGrupo.connect();
    console.log("✅ Conexión a RelojBioTimeGrupo exitosa");

    await poolCentral.connect();
    console.log("✅ Conexión a RelojBioTimeCentral exitosa");

  } catch (error) {
    console.error("❌ Error al conectar con SQL Server:", error.message);
  }
})();

// Cerrar las conexiones de forma segura al salir
process.on("SIGINT", async () => {
  try {
    await poolGrupo.close();
    console.log("🔌 Conexión a RelojBioTimeGrupo cerrada correctamente");

    await poolCentral.close();
    console.log("🔌 Conexión a RelojBioTimeCentral cerrada correctamente");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al cerrar las conexiones:", error.message);
    process.exit(1);
  }
});

// Exportar las conexiones para otros módulos
module.exports = { poolGrupo, poolCentral };
