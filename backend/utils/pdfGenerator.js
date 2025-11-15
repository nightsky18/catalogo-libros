const PDFDocument = require('pdfkit');
const path = require('path');
/**
 * Generador de PDFs con estilo de la aplicación
 * SIN emojis (causan caracteres raros)
 * SIN páginas en blanco (control preciso de paginación)
 */
class PDFReportBuilder {
  constructor() {
    this.doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      bufferPages: true
    });
    
    // Colores de la aplicación
    this.colors = {
      primary: [8, 52, 140],       // #08348C
      primaryDark: [9, 44, 115],   // #092C73
      secondary: [70, 140, 81],    // #468C51
      accent: [242, 149, 94],      // #F2955E
      gray900: [26, 34, 51],       // #1a2233
      gray700: [55, 65, 81],       // #374451
      gray600: [75, 85, 99],       // #4b5563
      gray500: [107, 114, 128],    // #6b7280
      gray300: [209, 213, 219],    // #afefffff
      gray100: [242, 242, 242],    // #f2f2f2
      black: [0, 0, 0],
      white: [255, 255, 255]
    };
    
    this.currentY = 80;
    // Ruta absoluta del logo
    this.logoPath = path.resolve(__dirname, '../assets/Logo.png');
  }

  /**
   * Añade encabezado con degradado
   */
addHeader(title, subtitle = '') {
    const headerHeight = subtitle ? 100 : 75;

    // Fondo sólido azul institucional
    this.doc
      .rect(0, 0, this.doc.page.width, headerHeight)  // Usar this.doc.page.width para ancho
      .fillColor(this.colors.gray300)                 // Color azul institucional sólido
      .fill();

    // Agregar logo (ajusta la ruta y tamaño)
     this.doc.image(this.logoPath, 60, 15, { width: 100 })

    // Título, con texto blanco y posición adecuada
    this.doc
      .font('Helvetica-Bold')
      .fontSize(28)
      .fillColor(this.colors.black)
      .text(title, 180, 35, { align: 'left', width: this.doc.page.width - 220 });

    // Subtítulo, si hay
    if (subtitle) {
      this.doc
        .font('Helvetica')
        .fontSize(13)
        .fillColor(['black'])
        .text(subtitle, 180, 70, { align: 'left', width: this.doc.page.width - 220 });
      this.currentY = 115;
    } else {
      this.currentY = 90;
    }

    return this;
  }


  /**
   * Añade resumen - SIN EMOJI
   */
  addSummarySection(stats) {
    this._checkPageSpace(180);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.colors.primary)
      .text('RESUMEN GENERAL', 50, this.currentY);
    
    this.currentY += 30;

    const { totalLibros, totalPaginas, promedioPaginasPorLibro, 
            promedioAnioPublicacion, editorialesUnicas } = stats.resumen;

    const data = [
      ['Total de Libros', totalLibros],
      ['Total de Páginas', totalPaginas.toLocaleString('es-CO')],
      ['Promedio Páginas/Libro', Math.round(promedioPaginasPorLibro)],
      ['Año Promedio Publicación', Math.round(promedioAnioPublicacion)],
      ['Editoriales Únicas', editorialesUnicas]
    ];

    data.forEach(([label, value], index) => {
      this._checkPageSpace(30);
      
      // Fondo alternado
      if (index % 2 === 0) {
        this.doc
          .rect(50, this.currentY - 5, 495, 28)
          .fillColor(this.colors.gray100)
          .fill();
      }
      
      this.doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(this.colors.gray700)
        .text(label, 70, this.currentY);
      
      this.doc
        .font('Helvetica-Bold')
        .fillColor(this.colors.primary)
        .text(String(value), 320, this.currentY, { width: 200, align: 'right' });
      
      this.currentY += 28;
    });

    this.currentY += 25;
    return this;
  }

  /**
   * Añade estadísticas por género - SIN EMOJI
   */
  addGenreStatistics(genreStats) {
    this._checkPageSpace(180);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.colors.primary)
      .text('ESTADÍSTICAS POR GÉNERO', 50, this.currentY);
    
    this.currentY += 30;

    this._renderTable(
      ['Género', 'Cantidad', 'Porcentaje', 'Total Páginas'],
      genreStats.map(g => [
        g.genero,
        g.cantidad.toString(),
        `${g.porcentaje.toFixed(1)}%`,
        g.totalPaginas.toLocaleString('es-CO')
      ]),
      [140, 80, 100, 120]
    );

    this.currentY += 25;
    return this;
  }

  /**
   * Añade estadísticas por década - SIN EMOJI
   */
  addDecadeStatistics(decadeStats) {
    this._checkPageSpace(180);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.colors.primary)
      .text('ESTADÍSTICAS POR DÉCADA', 50, this.currentY);
    
    this.currentY += 30;

    this._renderTable(
      ['Década', 'Cantidad', 'Porcentaje', 'Rango Años'],
      decadeStats.map(d => [
        d.decada,
        d.cantidad.toString(),
        `${d.porcentaje.toFixed(1)}%`,
        d.rangoAnios
      ]),
      [100, 80, 100, 160]
    );

    this.currentY += 25;
    return this;
  }

  /**
   * Añade top autores - SIN EMOJI
   */
  addTopAuthors(topAutores) {
    this._checkPageSpace(180);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.colors.primary)
      .text('TOP 10 AUTORES', 50, this.currentY);
    
    this.currentY += 30;

    this._renderTable(
      ['Autor', 'Libros', 'Porcentaje', 'Total Páginas'],
      topAutores.slice(0, 10).map(a => [
        a.autor,
        a.cantidad.toString(),
        `${a.porcentaje.toFixed(1)}%`,
        a.totalPaginas.toLocaleString('es-CO')
      ]),
      [180, 60, 90, 110]
    );

    this.currentY += 25;
    return this;
  }

 
  addBooksCatalog(libros, maxBooks = 50) {
    this._checkPageSpace(180);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.colors.primary)
      .text('CATÁLOGO DE LIBROS', 50, this.currentY);
    
    this.currentY += 30;

    this._renderTable(
      ['Título', 'Autor', 'Año', 'Pág.', 'Género'],
      libros.slice(0, maxBooks).map(libro => [
        this._truncate(libro.titulo, 35),
        this._truncate(libro.autor, 28),
        libro.anioPublicacion.toString(),
        libro.numeroPaginas ? libro.numeroPaginas.toString() : 'N/A',
        this._truncate(libro.genero, 15)
      ]),
      [140, 120, 50, 60, 70]
    );

    if (libros.length > maxBooks) {
      this.doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(this.colors.gray600)
        .text(`* Mostrando ${maxBooks} de ${libros.length} libros`, 50, this.currentY, { 
          align: 'right',
          width: 495
        });
      this.currentY += 20;
    }

    return this;
  }

  /**
   * Finaliza el PDF
   */
  async build() {
    return new Promise((resolve, reject) => {
      const buffers = [];
      this.doc.on('data', buffers.push.bind(buffers));
      this.doc.on('end', () => resolve(Buffer.concat(buffers)));
      this.doc.on('error', reject);
      this.doc.end();
    });
  }

  // =================== HELPERS ===================

  /**
   * Verifica espacio - OPTIMIZADO para evitar páginas en blanco
   */
  _checkPageSpace(needed) {
    // Dejar margen generoso de 70px para footer
    if (this.currentY + needed > 730) {
      this.doc.addPage();
      this.currentY = 50;
    }
  }

  /**
   * Renderiza tabla
   */
  _renderTable(headers, rows, widths) {
    const startX = 50;
    const rowHeight = 22;
    const estimatedHeight = 30 + (rows.length * rowHeight);

    // Verificar espacio para tabla completa
    this._checkPageSpace(estimatedHeight);
    
    // Headers con fondo primary
    this.doc
      .rect(startX, this.currentY, widths.reduce((a, b) => a + b), 22)
      .fillAndStroke(this.colors.primary, this.colors.primary);

    this.doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(this.colors.white);

    let x = startX;
    headers.forEach((h, i) => {
      this.doc.text(h, x, this.currentY + 6, { width: widths[i], align: 'center' });
      x += widths[i];
    });

    this.currentY += 25;

    // Rows
    this.doc.font('Helvetica').fontSize(9);

    rows.forEach((row, idx) => {
      // Verificar espacio para cada fila
      this._checkPageSpace(rowHeight + 10);

      // Fondo alternado
      if (idx % 2 === 0) {
        this.doc
          .rect(startX, this.currentY - 3, widths.reduce((a, b) => a + b), rowHeight)
          .fillColor(this.colors.gray100)
          .fill();
      }

      this.doc.fillColor(this.colors.gray900);

      x = startX;
      row.forEach((cell, i) => {
        this.doc.text(
          String(cell), 
          x + 5, 
          this.currentY, 
          { 
            width: widths[i] - 10, 
            align: i === 0 ? 'left' : 'center' 
          }
        );
        x += widths[i];
      });

      this.currentY += rowHeight;
    });

    this.currentY += 5;
  }

  _truncate(text, max) {
    if (!text) return 'N/A';
    return text.length > max ? text.substring(0, max - 3) + '...' : text;
  }
}

/**
 * Función principal
 */
async function generateCatalogoPDF(libros, estadisticas) {
  try {
    const builder = new PDFReportBuilder();

    await builder
      .addHeader(
        'Informe Completo',
        `Fecha de generacion: ${new Date().toLocaleDateString('es-CO', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`
      )
      .addSummarySection(estadisticas)
      .addGenreStatistics(estadisticas.porGenero)
      .addDecadeStatistics(estadisticas.porDecada)
      .addTopAuthors(estadisticas.topAutores)
      .addBooksCatalog(libros)

    return await builder.build();
  } catch (error) {
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
}

module.exports = { generateCatalogoPDF, PDFReportBuilder };