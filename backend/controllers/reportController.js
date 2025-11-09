const Book = require('../models/Book');
const { generateCatalogoXML, generateEstadisticasJSON } = require('../utils/xmlGenerator');

/**
 * Controlador de Reportes - Maneja la generación de informes XML y estadísticas
 */

/**
 * Genera el informe XML completo del catálogo
 * @route GET /api/reports/xml
 */
const generateXMLReport = async (req, res) => {
  try {
    // Obtener todos los libros
    const libros = await Book.find().sort({ createdAt: -1 });

    if (libros.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay libros en el catálogo para generar el reporte'
      });
    }

    // Generar XML
    const xmlContent = await generateCatalogoXML(libros);

    // Retornar como texto plano para visualización
    res.set('Content-Type', 'application/xml');
    res.status(200).send(xmlContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte XML',
      error: error.message
    });
  }
};

/**
 * Descarga el informe XML como archivo
 * @route GET /api/reports/download
 */
const downloadXMLReport = async (req, res) => {
  try {
    const libros = await Book.find().sort({ createdAt: -1 });

    if (libros.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay libros en el catálogo'
      });
    }

    const xmlContent = await generateCatalogoXML(libros);

    // Configurar headers para descarga
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `catalogo-libros-${fecha}.xml`;

    res.set({
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="${filename}"`
    });

    res.status(200).send(xmlContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al descargar el reporte',
      error: error.message
    });
  }
};

/**
 * Obtiene estadísticas del catálogo en formato JSON
 * @route GET /api/reports/stats
 */
const getEstadisticas = async (req, res) => {
  try {
    const libros = await Book.find();

    if (libros.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay libros en el catálogo',
        data: {
          resumen: {
            totalLibros: 0,
            totalPaginas: 0,
            promedioAnioPublicacion: 0,
            fechaGeneracion: new Date().toISOString()
          },
          porGenero: [],
          porDecada: []
        }
      });
    }

    const estadisticas = generateEstadisticasJSON(libros);

    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  generateXMLReport,
  downloadXMLReport,
  getEstadisticas
};
