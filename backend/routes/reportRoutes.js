const express = require('express');
const router = express.Router();
const {
  generateXMLReport,
  downloadXMLReport,
  getEstadisticas
} = require('../controllers/reportController');

/**
 * Rutas de Reportes - Define los endpoints de informes y estadísticas
 * Responsabilidad única: enrutamiento de reportes
 */

// GET /api/reports/xml - Visualizar XML en el navegador
router.get('/xml', generateXMLReport);

// GET /api/reports/download - Descargar archivo XML
router.get('/download', downloadXMLReport);

// GET /api/reports/stats - Obtener estadísticas JSON
router.get('/stats', getEstadisticas);

module.exports = router;
