const express = require('express');
const router = express.Router();
const checadasController = require('../controllers/checadascontroller');

// Rutas de autenticación (sin protección)
router.post('/login', checadasController.login);

// Rutas de checadas (protegidas con el middleware)
router.get('/checadas', checadasController.getChecadas); // Si necesitas filtrar checadas generales
router.get('/checadas/departamento/:departamentoId/:db', checadasController.getChecadasPorDepartamento); // Actualizada la ruta con barra entre grupo y db

module.exports = router;
