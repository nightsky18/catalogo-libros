const Book = require('../models/Book');
const { generateCatalogoXML } = require('../utils/xmlGenerator');
const { generateCatalogoPDF } = require('../utils/pdfGenerator');

/**
 * Controlador de Reportes - Maneja la generación de informes XML, PDF y estadsticas
 * Aplica Principio de Responsabilidad Única (SRP)
 */

/**
 * Genera el informe XML completo del catálogo
 * @route GET /api/reports/xml
 * @access Public
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
    console.error('Error en generateXMLReport:', error);
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
 * @access Public
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
    console.error('Error en downloadXMLReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar el reporte',
      error: error.message
    });
  }
};

/**
 * Genera y descarga el informe completo en formato PDF
 * @route GET /api/reports/pdf
 * @access Public
 */
const downloadPDFReport = async (req, res) => {
  try {
    console.log('📄 Iniciando generación de PDF...');

    // Obtener todos los libros
    const libros = await Book.find().sort({ createdAt: -1 });
    console.log(`📚 Libros encontrados: ${libros.length}`);

    if (libros.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay libros en el catálogo para generar el reporte'
      });
    }

    // Generar estadísticas (usando la función interna)
    const estadisticas = calcularEstadisticas(libros);
    console.log('📊 Estadísticas calculadas');

    // Generar PDF
    console.log('🔄 Generando PDF con PDFKit...');
    const pdfBuffer = await generateCatalogoPDF(libros, estadisticas);
    console.log('✅ PDF generado exitosamente');

    // Configurar headers para descarga
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `catalogo-libros-${fecha}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache'
    });

    res.status(200).send(pdfBuffer);
    console.log('📥 PDF enviado al cliente');

  } catch (error) {
    console.error('❌ Error en downloadPDFReport:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte PDF',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Obtiene estadísticas del catálogo en formato JSON
 * @route GET /api/reports/stats
 * @access Public
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

    const estadisticas = calcularEstadisticas(libros);

    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * Función auxiliar para calcular estadísticas del catálogo
 * Implementa el patrón Strategy para diferentes tipos de análisis
 * @param {Array} libros - Array de documentos de libros
 * @returns {Object} - Objeto con todas las estadísticas calculadas
 */
function calcularEstadisticas(libros) {
  // Resumen general
  const totalLibros = libros.length;
  const totalPaginas = libros.reduce((sum, libro) => sum + (libro.numeroPaginas || 0), 0);
  const promedioPaginasPorLibro = totalPaginas / totalLibros;
  const promedioAnioPublicacion = libros.reduce((sum, l) => sum + l.anioPublicacion, 0) / totalLibros;
  
  // Editoriales únicas
  const editorialesSet = new Set(libros.map(l => l.editorial).filter(Boolean));
  const editorialesUnicas = editorialesSet.size;

  // Años
  const anios = libros.map(l => l.anioPublicacion);
  const anioMin = Math.min(...anios);
  const anioMax = Math.max(...anios);

  // Estadísticas por género
  const generos = {};
  libros.forEach(libro => {
    const genero = libro.genero || 'Sin clasificar';
    if (!generos[genero]) {
      generos[genero] = {
        genero,
        cantidad: 0,
        totalPaginas: 0,
        libros: []
      };
    }
    generos[genero].cantidad++;
    generos[genero].totalPaginas += libro.numeroPaginas || 0;
    generos[genero].libros.push(libro);
  });

  const porGenero = Object.values(generos).map(g => ({
    genero: g.genero,
    cantidad: g.cantidad,
    porcentaje: (g.cantidad / totalLibros) * 100,
    totalPaginas: g.totalPaginas,
    promedioPaginas: g.totalPaginas / g.cantidad,
    libroMasLargo: g.libros.reduce((max, libro) => 
      (libro.numeroPaginas || 0) > (max.numeroPaginas || 0) ? libro : max
    , g.libros[0])
  })).sort((a, b) => b.cantidad - a.cantidad);

  // Estadísticas por década
  const decadas = {};
  libros.forEach(libro => {
    const decada = Math.floor(libro.anioPublicacion / 10) * 10;
    const key = `${decada}s`;
    if (!decadas[key]) {
      decadas[key] = {
        decada: key,
        cantidad: 0,
        anios: []
      };
    }
    decadas[key].cantidad++;
    decadas[key].anios.push(libro.anioPublicacion);
  });

  const porDecada = Object.values(decadas).map(d => ({
    decada: d.decada,
    cantidad: d.cantidad,
    porcentaje: (d.cantidad / totalLibros) * 100,
    rangoAnios: `${Math.min(...d.anios)}-${Math.max(...d.anios)}`
  })).sort((a, b) => {
    const decadaA = parseInt(a.decada);
    const decadaB = parseInt(b.decada);
    return decadaA - decadaB;
  });

  // Estadísticas por editorial
  const editoriales = {};
  libros.forEach(libro => {
    const editorial = libro.editorial || 'Sin editorial';
    if (!editoriales[editorial]) {
      editoriales[editorial] = {
        editorial,
        cantidad: 0,
        totalPaginas: 0
      };
    }
    editoriales[editorial].cantidad++;
    editoriales[editorial].totalPaginas += libro.numeroPaginas || 0;
  });

  const porEditorial = Object.values(editoriales).map(e => ({
    editorial: e.editorial,
    cantidad: e.cantidad,
    porcentaje: (e.cantidad / totalLibros) * 100,
    totalPaginas: e.totalPaginas
  })).sort((a, b) => b.cantidad - a.cantidad);

  // Top autores - LIMITAR A 10
  const autores = {};
  libros.forEach(libro => {
    const autor = libro.autor || 'Autor desconocido';
    if (!autores[autor]) {
      autores[autor] = {
        autor,
        cantidad: 0,
        totalPaginas: 0,
        anios: []
      };
    }
    autores[autor].cantidad++;
    autores[autor].totalPaginas += libro.numeroPaginas || 0;
    autores[autor].anios.push(libro.anioPublicacion);
  });

  const topAutores = Object.values(autores).map(a => ({
    autor: a.autor,
    cantidad: a.cantidad,
    porcentaje: (a.cantidad / totalLibros) * 100,
    totalPaginas: a.totalPaginas,
    promedioAnio: a.anios.reduce((sum, year) => sum + year, 0) / a.anios.length
  })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10); // AGREGAR .slice(0, 10)

  // AGREGAR: Rankings
  const librosConPaginas = libros.filter(l => l.numeroPaginas && l.numeroPaginas > 0);
  const libroMasAntiguo = libros.reduce((min, libro) => 
    libro.anioPublicacion < min.anioPublicacion ? libro : min, libros[0]);
  const libroMasReciente = libros.reduce((max, libro) => 
    libro.anioPublicacion > max.anioPublicacion ? libro : max, libros[0]);
  const libroMasLargo = librosConPaginas.length > 0 
    ? librosConPaginas.reduce((max, libro) => 
        libro.numeroPaginas > max.numeroPaginas ? libro : max, librosConPaginas[0])
    : null;
  const libroMasCorto = librosConPaginas.length > 0
    ? librosConPaginas.reduce((min, libro) => 
        libro.numeroPaginas < min.numeroPaginas ? libro : min, librosConPaginas[0])
    : null;

  // AGREGAR: Análisis temporal
  const anioActual = new Date().getFullYear();
  const librosUltimos5Anios = libros.filter(l => l.anioPublicacion >= anioActual - 5).length;
  const librosUltimos10Anios = libros.filter(l => l.anioPublicacion >= anioActual - 10).length;
  const librosMas50Anios = libros.filter(l => anioActual - l.anioPublicacion > 50).length;
  const decadaMasProductiva = porDecada.reduce((max, d) => 
    d.cantidad > max.cantidad ? d : max, porDecada[0]);

  return {
    resumen: {
      totalLibros,
      totalPaginas,
      promedioPaginasPorLibro,
      promedioAnioPublicacion,
      editorialesUnicas,
      anioMin,
      anioMax,
      fechaGeneracion: new Date().toISOString()
    },
    porGenero,
    porDecada,
    porEditorial,
    topAutores, // Ahora limitado a 10
    // AGREGAR estas dos secciones:
    rankings: {
      libroMasAntiguo,
      libroMasReciente,
      libroMasLargo,
      libroMasCorto
    },
    analisisTemporal: {
      librosUltimos5Anios,
      librosUltimos10Anios,
      librosMas50Anios,
      decadaMasProductiva: decadaMasProductiva.decada
    }
  };
}

module.exports = {
  generateXMLReport,
  downloadXMLReport,
  downloadPDFReport,
  getEstadisticas
};