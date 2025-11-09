const xml2js = require('xml2js');

/**
 * Generador de XML para reportes de catálogo de libros
 */

/**
 * Genera el documento XML completo del catálogo con estadísticas enriquecidas
 * @param {Array} libros - Array de libros desde MongoDB
 * @returns {String} - Documento XML como string
 */
const generateCatalogoXML = async (libros) => {
  const estadisticas = calcularEstadisticas(libros);
  
  const xmlObject = {
    catalogoLibros: {
      $: { 
        version: '1.0',
        generado: new Date().toISOString(),
        totalRegistros: libros.length
      },
      
      // Resumen general
      resumen: [{
        totalLibros: libros.length,
        totalPaginas: estadisticas.totalPaginas,
        promedioPaginasPorLibro: estadisticas.promedioPaginas.toFixed(0),
        fechaGeneracion: new Date().toISOString().split('T')[0],
        horaGeneracion: new Date().toLocaleTimeString('es-CO'),
        promedioAnioPublicacion: estadisticas.promedioAnio.toFixed(0),
        rangoAnios: `${estadisticas.anioMin} - ${estadisticas.anioMax}`,
        editorialesUnicas: estadisticas.editorialesUnicas
      }],

      // Estadísticas por género
      estadisticasPorGenero: [{
        total: estadisticas.porGenero.length,
        genero: estadisticas.porGenero.map(g => ({
          $: { nombre: g.genero },
          cantidad: g.cantidad,
          porcentaje: g.porcentaje.toFixed(2),
          promedioPaginas: g.promedioPaginas.toFixed(0),
          totalPaginas: g.totalPaginas,
          libroMasLargo: g.libroMasLargo ? {
            titulo: g.libroMasLargo.titulo,
            paginas: g.libroMasLargo.numeroPaginas
          } : 'N/A'
        }))
      }],

      // Estadísticas por década
      estadisticasPorDecada: [{
        total: estadisticas.porDecada.length,
        decada: estadisticas.porDecada.map(d => ({
          $: { periodo: d.decada },
          cantidad: d.cantidad,
          porcentaje: d.porcentaje.toFixed(2),
          rangoAnios: d.rangoAnios
        }))
      }],

      // Estadísticas por editorial
      estadisticasPorEditorial: [{
        total: estadisticas.porEditorial.length,
        editorial: estadisticas.porEditorial.slice(0, 10).map(e => ({ // Top 10
          $: { nombre: e.editorial },
          cantidad: e.cantidad,
          porcentaje: e.porcentaje.toFixed(2),
          totalPaginas: e.totalPaginas
        }))
      }],

      // Top autores
      topAutores: [{
        autor: estadisticas.topAutores.map(a => ({
          $: { nombre: a.autor },
          cantidadLibros: a.cantidad,
          porcentaje: a.porcentaje.toFixed(2),
          totalPaginas: a.totalPaginas,
          promedioAnioPublicacion: a.promedioAnio.toFixed(0)
        }))
      }],

      // Rankings
      rankings: [{
        libroMasAntiguo: estadisticas.libroMasAntiguo ? {
          titulo: estadisticas.libroMasAntiguo.titulo,
          autor: estadisticas.libroMasAntiguo.autor,
          anio: estadisticas.libroMasAntiguo.anioPublicacion
        } : 'N/A',
        libroMasReciente: estadisticas.libroMasReciente ? {
          titulo: estadisticas.libroMasReciente.titulo,
          autor: estadisticas.libroMasReciente.autor,
          anio: estadisticas.libroMasReciente.anioPublicacion
        } : 'N/A',
        libroMasLargo: estadisticas.libroMasLargo ? {
          titulo: estadisticas.libroMasLargo.titulo,
          autor: estadisticas.libroMasLargo.autor,
          paginas: estadisticas.libroMasLargo.numeroPaginas
        } : 'N/A',
        libroMasCorto: estadisticas.libroMasCorto ? {
          titulo: estadisticas.libroMasCorto.titulo,
          autor: estadisticas.libroMasCorto.autor,
          paginas: estadisticas.libroMasCorto.numeroPaginas
        } : 'N/A'
      }],

      // Análisis temporal
      analisisTemporal: [{
        librosUltimos5Anios: estadisticas.librosUltimos5Anios,
        librosUltimos10Anios: estadisticas.librosUltimos10Anios,
        librosMas50Anios: estadisticas.librosMas50Anios,
        decadaMasProductiva: estadisticas.decadaMasProductiva
      }],

      // Catálogo completo de libros
      libros: [{
        libro: libros.map(libro => ({
          $: { 
            id: libro.id || libro._id,
            agregadoEl: libro.createdAt ? libro.createdAt.toISOString().split('T')[0] : 'N/A'
          },
          titulo: libro.titulo,
          autor: libro.autor,
          isbn: libro.isbn,
          genero: libro.genero,
          anioPublicacion: libro.anioPublicacion,
          editorial: libro.editorial || 'Desconocida',
          numeroPaginas: libro.numeroPaginas || 0,
          descripcion: libro.descripcion || 'Sin descripción',
          antiguedad: new Date().getFullYear() - libro.anioPublicacion,
          categoria: categorizarPorPaginas(libro.numeroPaginas)
        }))
      }]
    }
  };

  const builder = new xml2js.Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '  ', newline: '\n' }
  });

  return builder.buildObject(xmlObject);
};

/**
 * Calcula todas las estadísticas del catálogo
 * @param {Array} libros - Array de libros
 * @returns {Object} - Objeto con estadísticas completas
 */
const calcularEstadisticas = (libros) => {
  const total = libros.length;
  
  if (total === 0) {
    return estadisticasVacias();
  }

  // Cálculos básicos
  const totalPaginas = libros.reduce((sum, libro) => sum + (libro.numeroPaginas || 0), 0);
  const promedioPaginas = totalPaginas / total;
  const sumaAnios = libros.reduce((sum, libro) => sum + libro.anioPublicacion, 0);
  const promedioAnio = sumaAnios / total;

  // Rangos
  const anios = libros.map(l => l.anioPublicacion);
  const anioMin = Math.min(...anios);
  const anioMax = Math.max(...anios);

  // Editoriales únicas
  const editorialesSet = new Set(libros.map(l => l.editorial).filter(e => e));
  const editorialesUnicas = editorialesSet.size;

  // Estadísticas por género
  const generos = {};
  libros.forEach(libro => {
    if (!generos[libro.genero]) {
      generos[libro.genero] = {
        cantidad: 0,
        totalPaginas: 0,
        libros: []
      };
    }
    generos[libro.genero].cantidad++;
    generos[libro.genero].totalPaginas += (libro.numeroPaginas || 0);
    generos[libro.genero].libros.push(libro);
  });

  const porGenero = Object.entries(generos).map(([genero, datos]) => ({
    genero,
    cantidad: datos.cantidad,
    porcentaje: (datos.cantidad / total) * 100,
    promedioPaginas: datos.totalPaginas / datos.cantidad,
    totalPaginas: datos.totalPaginas,
    libroMasLargo: datos.libros.reduce((max, libro) => 
      (libro.numeroPaginas || 0) > (max.numeroPaginas || 0) ? libro : max, datos.libros[0])
  })).sort((a, b) => b.cantidad - a.cantidad);

  // Estadísticas por década
  const decadas = {};
  libros.forEach(libro => {
    const decada = Math.floor(libro.anioPublicacion / 10) * 10;
    const periodo = `${decada}s`;
    if (!decadas[periodo]) {
      decadas[periodo] = {
        cantidad: 0,
        anios: []
      };
    }
    decadas[periodo].cantidad++;
    decadas[periodo].anios.push(libro.anioPublicacion);
  });

  const porDecada = Object.entries(decadas).map(([decada, datos]) => ({
    decada,
    cantidad: datos.cantidad,
    porcentaje: (datos.cantidad / total) * 100,
    rangoAnios: `${Math.min(...datos.anios)}-${Math.max(...datos.anios)}`
  })).sort((a, b) => a.decada.localeCompare(b.decada));

  // Estadísticas por editorial
  const editoriales = {};
  libros.forEach(libro => {
    const editorial = libro.editorial || 'Desconocida';
    if (!editoriales[editorial]) {
      editoriales[editorial] = {
        cantidad: 0,
        totalPaginas: 0
      };
    }
    editoriales[editorial].cantidad++;
    editoriales[editorial].totalPaginas += (libro.numeroPaginas || 0);
  });

  const porEditorial = Object.entries(editoriales).map(([editorial, datos]) => ({
    editorial,
    cantidad: datos.cantidad,
    porcentaje: (datos.cantidad / total) * 100,
    totalPaginas: datos.totalPaginas
  })).sort((a, b) => b.cantidad - a.cantidad);

  // Top autores
  const autores = {};
  libros.forEach(libro => {
    if (!autores[libro.autor]) {
      autores[libro.autor] = {
        cantidad: 0,
        totalPaginas: 0,
        anios: []
      };
    }
    autores[libro.autor].cantidad++;
    autores[libro.autor].totalPaginas += (libro.numeroPaginas || 0);
    autores[libro.autor].anios.push(libro.anioPublicacion);
  });

  const topAutores = Object.entries(autores)
    .map(([autor, datos]) => ({
      autor,
      cantidad: datos.cantidad,
      porcentaje: (datos.cantidad / total) * 100,
      totalPaginas: datos.totalPaginas,
      promedioAnio: datos.anios.reduce((a, b) => a + b, 0) / datos.anios.length
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  // Rankings
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

  // Análisis temporal
  const anioActual = new Date().getFullYear();
  const librosUltimos5Anios = libros.filter(l => l.anioPublicacion >= anioActual - 5).length;
  const librosUltimos10Anios = libros.filter(l => l.anioPublicacion >= anioActual - 10).length;
  const librosMas50Anios = libros.filter(l => anioActual - l.anioPublicacion > 50).length;
  const decadaMasProductiva = porDecada.reduce((max, d) => 
    d.cantidad > max.cantidad ? d : max, porDecada[0]);

  return {
    totalPaginas,
    promedioPaginas,
    promedioAnio,
    anioMin,
    anioMax,
    editorialesUnicas,
    porGenero,
    porDecada,
    porEditorial,
    topAutores,
    libroMasAntiguo,
    libroMasReciente,
    libroMasLargo,
    libroMasCorto,
    librosUltimos5Anios,
    librosUltimos10Anios,
    librosMas50Anios,
    decadaMasProductiva: decadaMasProductiva.decada
  };
};

/**
 * Categoriza un libro según su número de páginas
 * @param {Number} paginas - Número de páginas
 * @returns {String} - Categoría del libro
 */
const categorizarPorPaginas = (paginas) => {
  if (!paginas || paginas === 0) return 'Sin clasificar';
  if (paginas < 100) return 'Folleto';
  if (paginas < 200) return 'Libro corto';
  if (paginas < 400) return 'Libro medio';
  if (paginas < 600) return 'Libro largo';
  return 'Libro extenso';
};

/**
 * Retorna estructura de estadísticas vacías
 * @returns {Object} - Estadísticas por defecto
 */
const estadisticasVacias = () => ({
  totalPaginas: 0,
  promedioPaginas: 0,
  promedioAnio: 0,
  anioMin: 0,
  anioMax: 0,
  editorialesUnicas: 0,
  porGenero: [],
  porDecada: [],
  porEditorial: [],
  topAutores: [],
  libroMasAntiguo: null,
  libroMasReciente: null,
  libroMasLargo: null,
  libroMasCorto: null,
  librosUltimos5Anios: 0,
  librosUltimos10Anios: 0,
  librosMas50Anios: 0,
  decadaMasProductiva: 'N/A'
});

/**
 * Genera estadísticas en formato JSON (para el frontend)
 * @param {Array} libros - Array de libros
 * @returns {Object} - Estadísticas en JSON
 */
const generateEstadisticasJSON = (libros) => {
  const estadisticas = calcularEstadisticas(libros);
  
  return {
    resumen: {
      totalLibros: libros.length,
      totalPaginas: estadisticas.totalPaginas,
      promedioPaginasPorLibro: Math.round(estadisticas.promedioPaginas),
      promedioAnioPublicacion: Math.round(estadisticas.promedioAnio),
      rangoAnios: `${estadisticas.anioMin} - ${estadisticas.anioMax}`,
      editorialesUnicas: estadisticas.editorialesUnicas,
      fechaGeneracion: new Date().toISOString()
    },
    porGenero: estadisticas.porGenero,
    porDecada: estadisticas.porDecada,
    porEditorial: estadisticas.porEditorial.slice(0, 10),
    topAutores: estadisticas.topAutores,
    rankings: {
      libroMasAntiguo: estadisticas.libroMasAntiguo,
      libroMasReciente: estadisticas.libroMasReciente,
      libroMasLargo: estadisticas.libroMasLargo,
      libroMasCorto: estadisticas.libroMasCorto
    },
    analisisTemporal: {
      librosUltimos5Anios: estadisticas.librosUltimos5Anios,
      librosUltimos10Anios: estadisticas.librosUltimos10Anios,
      librosMas50Anios: estadisticas.librosMas50Anios,
      decadaMasProductiva: estadisticas.decadaMasProductiva
    }
  };
};

module.exports = {
  generateCatalogoXML,
  generateEstadisticasJSON
};
