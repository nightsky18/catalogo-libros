const PDFDocument = require('pdfkit');

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
      primary: [102, 126, 234],      // #667eea
      primaryDark: [85, 104, 211],   // #5568d3
      secondary: [118, 75, 162],     // #764ba2
      success: [34, 197, 94],        // #22c55e
      gray900: [31, 41, 55],         // #1f2937
      gray700: [55, 65, 81],         // #374151
      gray600: [75, 85, 99],         // #4b5563
      gray500: [107, 114, 128],      // #6b7280
      gray300: [209, 213, 219],      // #d1d5db
      gray100: [243, 244, 246],      // #f3f4f6
      white: [255, 255, 255]
    };
    
    this.currentY = 80;
  }

  /**
   * Añade encabezado con degradado
   */
  addHeader(title, subtitle = '') {
    const headerHeight = subtitle ? 100 : 75;
    
    // Degradado de primary a secondary
    for (let i = 0; i < headerHeight; i++) {
      const ratio = i / headerHeight;
      const r = Math.round(this.colors.primary[0] + (this.colors.secondary[0] - this.colors.primary[0]) * ratio);
      const g = Math.round(this.colors.primary[1] + (this.colors.secondary[1] - this.colors.primary[1]) * ratio);
      const b = Math.round(this.colors.primary[2] + (this.colors.secondary[2] - this.colors.primary[2]) * ratio);
      
      this.doc
        .rect(0, i, 595.28, 1)
        .fillColor([r, g, b])
        .fill();
    }
    
    // Título
    this.doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor(this.colors.white)
      .text(title, 50, 25, { align: 'center', width: 495 });

    if (subtitle) {
      this.doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor([255, 255, 255, 0.95])
        .text(subtitle, 50, 60, { align: 'center', width: 495 });
      
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
      ['Total de Paginas', totalPaginas.toLocaleString('es-CO')],
      ['Promedio Paginas/Libro', Math.round(promedioPaginasPorLibro)],
      ['Año Promedio Publicacion', Math.round(promedioAnioPublicacion)],
      ['Editoriales Unicas', editorialesUnicas]
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
      .text('ESTADISTICAS POR GENERO', 50, this.currentY);
    
    this.currentY += 30;

    this._renderTable(
      ['Genero', 'Cantidad', 'Porcentaje', 'Total Paginas'],
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
      .text('ESTADISTICAS POR DECADA', 50, this.currentY);
    
    this.currentY += 30;

    this._renderTable(
      ['Decada', 'Cantidad', 'Porcentaje', 'Rango Años'],
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
      ['Autor', 'Libros', 'Porcentaje', 'Total Paginas'],
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

  /**
   * Añade catálogo de libros - SIN EMOJI
   */
  addBooksCatalog(libros, maxBooks = 50) {
    this._checkPageSpace(180);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.colors.primary)
      .text('CATALOGO DE LIBROS', 50, this.currentY);
    
    this.currentY += 30;

    this._renderTable(
      ['Titulo', 'Autor', 'Año', 'Pag.', 'Genero'],
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
        'Catalogo de Libros - Informe Completo',
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