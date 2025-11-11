const PDFDocument = require('pdfkit');

/**
 * Generador de PDFs ultra-simplificado sin moveDown() para evitar NaN
 * Usa solo coordenadas absolutas
 */
class PDFReportBuilder {
  constructor() {
    this.doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      bufferPages: true
    });
    
    this.currentY = 80; // Posición Y inicial
  }

  /**
   * Añade encabezado
   */
  addHeader(title, subtitle = '') {
    this.doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#355934')
      .text(title, 50, 50, { align: 'center', width: 495 });

    if (subtitle) {
      this.doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#666666')
        .text(subtitle, 50, 85, { align: 'center', width: 495 });
      
      this.currentY = 115;
    } else {
      this.currentY = 90;
    }

    // Línea separadora
    this.doc
      .moveTo(50, this.currentY)
      .lineTo(545, this.currentY)
      .strokeColor('#AD5940')
      .lineWidth(2)
      .stroke();

    this.currentY += 15;
    return this;
  }

  /**
   * Añade resumen
   */
  addSummarySection(stats) {
    this._checkPageSpace(150);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#355934')
      .text('RESUMEN GENERAL', 50, this.currentY);
    
    this.currentY += 25;

    const { totalLibros, totalPaginas, promedioPaginasPorLibro, 
            promedioAnioPublicacion, editorialesUnicas } = stats.resumen;

    const data = [
      ['Total de Libros', totalLibros],
      ['Total de Páginas', totalPaginas.toLocaleString('es-CO')],
      ['Promedio Páginas/Libro', Math.round(promedioPaginasPorLibro)],
      ['Año Promedio Publicación', Math.round(promedioAnioPublicacion)],
      ['Editoriales Únicas', editorialesUnicas]
    ];

    data.forEach(([label, value]) => {
      this._checkPageSpace(25);
      
      this.doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#555555')
        .text(label, 70, this.currentY);
      
      this.doc
        .font('Helvetica-Bold')
        .fillColor('#355934')
        .text(String(value), 320, this.currentY, { width: 200, align: 'right' });
      
      this.currentY += 22;
    });

    this.currentY += 20;
    return this;
  }

  /**
   * Añade estadísticas por género
   */
  addGenreStatistics(genreStats) {
    this._checkPageSpace(150);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#355934')
      .text('ESTADISTICAS POR GENERO', 50, this.currentY);
    
    this.currentY += 25;

    this._renderSimpleTable(
      ['Genero', 'Cantidad', 'Porcentaje', 'Total Paginas'],
      genreStats.map(g => [
        g.genero,
        g.cantidad.toString(),
        `${g.porcentaje.toFixed(1)}%`,
        g.totalPaginas.toLocaleString('es-CO')
      ]),
      [140, 80, 100, 120]
    );

    this.currentY += 20;
    return this;
  }

  /**
   * Añade estadísticas por década
   */
  addDecadeStatistics(decadeStats) {
    this._checkPageSpace(150);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#355934')
      .text('ESTADISTICAS POR DECADA', 50, this.currentY);
    
    this.currentY += 25;

    this._renderSimpleTable(
      ['Decada', 'Cantidad', 'Porcentaje', 'Rango Años'],
      decadeStats.map(d => [
        d.decada,
        d.cantidad.toString(),
        `${d.porcentaje.toFixed(1)}%`,
        d.rangoAnios
      ]),
      [100, 80, 100, 160]
    );

    this.currentY += 20;
    return this;
  }

  /**
   * Añade top autores
   */
  addTopAuthors(topAutores) {
    this._checkPageSpace(150);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#355934')
      .text('TOP 10 AUTORES', 50, this.currentY);
    
    this.currentY += 25;

    this._renderSimpleTable(
      ['Autor', 'Libros', 'Porcentaje', 'Total Paginas'],
      topAutores.slice(0, 10).map(a => [
        a.autor,
        a.cantidad.toString(),
        `${a.porcentaje.toFixed(1)}%`,
        a.totalPaginas.toLocaleString('es-CO')
      ]),
      [180, 60, 90, 110]
    );

    this.currentY += 20;
    return this;
  }

  /**
   * Añade catálogo de libros
   */
  addBooksCatalog(libros, maxBooks = 50) {
    this._checkPageSpace(150);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#355934')
      .text('CATALOGO DE LIBROS', 50, this.currentY);
    
    this.currentY += 25;

    this._renderSimpleTable(
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
        .fillColor('#666666')
        .text(`* Mostrando ${maxBooks} de ${libros.length} libros`, 50, this.currentY, { 
          align: 'right',
          width: 495
        });
      this.currentY += 15;
    }

    return this;
  }

  /**
   * Añade footer
   */
  addFooter() {
    const range = this.doc.bufferedPageRange();
    const fecha = new Date().toLocaleString('es-CO', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    });
    
    for (let i = 0; i < range.count; i++) {
      this.doc.switchToPage(i);
      
      const footerY = 807; // Posición fija cerca del final (A4 = 842pt)
      
      this.doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#999999')
        .text(`Generado: ${fecha}`, 50, footerY, { width: 240 })
        .text(`Pagina ${i + 1} de ${range.count}`, 320, footerY, { 
          width: 225, 
          align: 'right' 
        });
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
   * Verifica si hay espacio en la página
   */
  _checkPageSpace(needed) {
    if (this.currentY + needed > 750) { // Dejar margen para footer
      this.doc.addPage();
      this.currentY = 50;
    }
  }

  /**
   * Renderiza tabla simple
   */
  _renderSimpleTable(headers, rows, widths) {
    const startX = 50;
    const rowHeight = 20;

    // Headers
    this._checkPageSpace(25 + rows.length * rowHeight);
    
    this.doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#355934');

    let x = startX;
    headers.forEach((h, i) => {
      this.doc.text(h, x, this.currentY, { width: widths[i], align: 'center' });
      x += widths[i];
    });

    this.currentY += 18;

    // Línea
    this.doc
      .moveTo(startX, this.currentY)
      .lineTo(startX + widths.reduce((a, b) => a + b), this.currentY)
      .strokeColor('#AD5940')
      .stroke();

    this.currentY += 5;

    // Rows
    this.doc.font('Helvetica').fontSize(9).fillColor('#000000');

    rows.forEach((row, idx) => {
      this._checkPageSpace(rowHeight);

      // Fondo alternado
      if (idx % 2 === 0) {
        this.doc
          .rect(startX, this.currentY - 3, widths.reduce((a, b) => a + b), rowHeight)
          .fillColor('#f5f5f5')
          .fill()
          .fillColor('#000000');
      }

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

    this.currentY += 10;
  }

  /**
   * Trunca texto
   */
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
      .addFooter();

    return await builder.build();
  } catch (error) {
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
}

module.exports = { generateCatalogoPDF, PDFReportBuilder };