
const sql = require('mssql');
const { pool } = require('../config/db'); // Conexión a la base de datos

const bcrypt = require('bcrypt');

const login = async (req, res) => {
  const { firstName, nickname } = req.body;

  try {
    const poolConnection = await pool;

    // Buscar al usuario por nombre y nickname
    const result = await poolConnection.request()
      .input('firstName', sql.NVarChar, firstName)
      .input('nickname', sql.NVarChar, nickname)
      .query(
        'SELECT * FROM personnel_employee WHERE first_name = @firstName AND nickname = @nickname'
      );

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Retornar el departamento al cual pertenece el usuario
    return res.json({
      message: 'Inicio de sesión exitoso',
      departamento: user.department_id,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

// Obtener las checadas según el departamento del jefe
const getChecadasPorDepartamento = async (req, res) => {
  const { departamentoId } = req.params;

  try {
    const poolConnection = await pool;

    const vistasPorDepartamento = {
      '1': 'Checadas_Generales',
      '2': 'Checadas_Sistemas',
      '5': 'Checadas_Tesoreria',
      '4': 'Checadas_Nominas',
      '3': 'Checadas_Contabilidad',
      '6': 'Checadas_Direccion_Admva',
      '7': 'Checadas_Tramites_Legales',
    };

    const vista = vistasPorDepartamento[departamentoId];
    if (!vista) {
      return res.status(400).json({ message: 'Departamento no válido.' });
    }

    const query = `SELECT * FROM ${vista} ORDER BY idChecada;`;
    const result = await poolConnection.request().query(query);

    if (result.recordset.length > 0) {
      return res.json(result.recordset);
    } else {
      return res.status(404).json({ message: 'No se encontraron checadas.' });
    }
  } catch (error) {
    console.error('Error al obtener las checadas por departamento:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Función para obtener las checadas
const getChecadas = async (req, res) => {
  try {
    const poolConnection = await pool; // Usa la conexión existente desde db.js

    const query = `
SELECT * FROM Checadas_Generales
order by idChecada;

    `;

    // Ejecutar la consulta con los parámetros
    const result = await poolConnection.request()
      .query(query);

    // Verifica si hay resultados
    if (result.recordset.length > 0) {
      return res.json(result.recordset); // Responde con los datos de las checadas
    } else {
      // Si no hay datos, enviar una respuesta vacía o un mensaje
      return res.status(404).json({ message: 'No se encontraron checadas.' });
    }
  } catch (error) {
    console.error("Error al obtener las checadas:", error);
    // Responder con error interno del servidor
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Exportar los controladores
module.exports = {
  login,
  getChecadas,
  getChecadasPorDepartamento
};
