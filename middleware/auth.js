const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_por_defecto');
    req.user = decoded; // Agregar el usuario decodificado al request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(403).json({ message: 'El token ha expirado' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(403).json({ message: 'Token mal formado o inválido' });
    } else {
      res.status(403).json({ message: 'Error al verificar el token', error: error.message });
    }
  }
};

module.exports = authenticateToken;
