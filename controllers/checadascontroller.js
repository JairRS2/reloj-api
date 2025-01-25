
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
      departamento: user.department_id, // Ajusta según el nombre exacto de la columna en tu tabla
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
SELECT 
    chec.id AS idChecada,
    pers.nickname AS ClaveEmpleado,
    pers.first_name AS Nombre,
    dep.dept_name AS Departamento,
    zona.alias AS Zona,
    FORMAT(chec.punch_time, 'yyyy-MM-dd') AS FechaChecada,
    pos.position_name AS Puesto,
    pos.position_code AS ClavePuesto,
    0 AS Activos,
    0 AS Checados,
    (SELECT FORMAT(MIN(ct.punch_time), 'HH:mm')
     FROM iclock_transaction ct
     WHERE ct.emp_code = chec.emp_code 
       AND FORMAT(ct.punch_time, 'dd/MM/yyyy') = FORMAT(chec.punch_time, 'dd/MM/yyyy')
    ) AS HoraEntrada, -- Subconsulta para obtener la primera checada
    (SELECT FORMAT(MAX(ct.punch_time), 'HH:mm')
     FROM iclock_transaction ct
     WHERE ct.emp_code = chec.emp_code 
       AND FORMAT(ct.punch_time, 'dd/MM/yyyy') = FORMAT(chec.punch_time, 'dd/MM/yyyy')
    ) AS HoraSalida -- Subconsulta para obtener la última checada
FROM iclock_transaction AS chec
LEFT JOIN personnel_employee AS pers ON chec.emp_code = pers.emp_code
INNER JOIN personnel_position AS pos ON pers.position_id = pos.id
INNER JOIN personnel_department AS dep ON pers.department_id = dep.id
INNER JOIN iclock_terminal AS zona ON chec.terminal_id = zona.id
ORDER BY chec.id, chec.punch_time;

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
