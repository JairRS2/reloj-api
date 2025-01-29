const sql = require('mssql');
const { poolGrupo, poolCentral } = require('../config/db'); // Conexión a las bases de datos

// Función para validar el usuario en la base de datos
const validarUsuario = async ( nickname,device_password, poolConnection) => {
  try {
    const result = await poolConnection.request()
      .input('nickname', sql.NVarChar, nickname)
      .input('device_password', sql.NVarChar, device_password)
      .query(
        'SELECT * FROM personnel_employee WHERE nickname = @nickname AND device_password = @device_password;'
      );

    const user = result.recordset[0];

    return user;
  } catch (error) {
    throw new Error('Error al validar el usuario: ' + error.message);
  }
};

const login = async (req, res) => {
  const {  nickname,device_password, db } = req.body; // Puedes enviar qué base de datos usar (db: 'grupo' o 'central')

  // Validar que se hayan enviado los datos necesarios
  if (!nickname || !device_password) {
    return res.status(400).json({ message: 'Se requieren usuario y contraseña.' });
  }

  // Seleccionar el pool correspondiente basado en el parámetro 'db'
  const poolConnection = db === 'central' ? poolCentral : poolGrupo;

  try {
    // Llamar a la función para validar al usuario
    const user = await validarUsuario(nickname, device_password, poolConnection);

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

// Obtener las checadas según el departamento del jefe y la base de datos seleccionada
const getChecadasPorDepartamento = async (req, res) => {
  const { departamentoId, db } = req.params; // Obtener departamentoId y db (grupo o central)

  // Validar que se haya enviado un departamentoId válido
  if (!departamentoId) {
    return res.status(400).json({ message: 'Se requiere un ID de departamento.' });
  }

  // Seleccionar el pool de conexión basado en el parámetro 'db'
  const poolConnection = db === 'central' ? poolCentral : poolGrupo;

  // Definir las vistas correspondientes según el departamento para cada base de datos
  const vistasPorDepartamentoGrupo = {
    '1': 'Checadas_Generales',
    '2': 'Checadas_Sistemas',
    '5': 'Checadas_Tesoreria',
    '4': 'Checadas_Nominas',
    '3': 'Checadas_Contabilidad',
    '6': 'Checadas_Direccion_Admva',
  };

  const vistasPorDepartamentoCentral = {
    '4': 'Checadas_Central_Generales',
    '2': 'Checadas_Central_Sistemas',
    '5': 'Checadas_Central_Tesoreria',
    '1': 'Checadas_Central_Nominas',
    '3': 'Checadas_Central_Contabilidad',
    '6': 'Checadas_Central_Direccion_Admva',
    '7': 'Checadas_Central_Tramites_Legales',
  };

  // Seleccionar el mapa de vistas correspondiente según la base de datos
  const vistasPorDepartamento = db === 'central' ? vistasPorDepartamentoCentral : vistasPorDepartamentoGrupo;

  const vista = vistasPorDepartamento[departamentoId];
  if (!vista) {
    return res.status(400).json({ message: 'Departamento no válido.' });
  }

  try {
    // Consulta para obtener las checadas de la vista correspondiente
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
    const poolConnection = await poolGrupo; // Usamos poolGrupo como ejemplo (puedes cambiar a poolCentral si es necesario)

    const query = `SELECT * FROM Checadas_Generales ORDER BY idChecada;`;

    const result = await poolConnection.request().query(query);

    if (result.recordset.length > 0) {
      return res.json(result.recordset); // Responde con los datos de las checadas
    } else {
      return res.status(404).json({ message: 'No se encontraron checadas.' });
    }
  } catch (error) {
    console.error("Error al obtener las checadas:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Exportar los controladores
module.exports = {
  login,
  getChecadas,
  getChecadasPorDepartamento,
};
