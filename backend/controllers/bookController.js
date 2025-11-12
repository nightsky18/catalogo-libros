const Book = require('../models/Book');

/**
 * Controlador de Libros - Maneja la lógica de negocio del CRUD
 */

/**
 * Obtener todos los libros con paginación y filtros avanzados
 * @route GET /api/books
 * @access Public
 */
const getAllBooks = async (req, res) => {
  try {
    const { 
      genero, 
      autor, 
      titulo,
      editorial,
      anioDesde,
      anioHasta,
      paginasMin,
      paginasMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1, 
      limit = 12 
    } = req.query;

    // Construir el objeto de filtros
    const filters = {};
    
    if (genero) {
      filters.genero = genero;
    }
    
    if (autor) {
      filters.autor = { $regex: autor, $options: 'i' };
    }
    
    if (titulo) {
      filters.titulo = { $regex: titulo, $options: 'i' };
    }

    if (editorial) {
      filters.editorial = { $regex: editorial, $options: 'i' };
    }

    // Filtro por rango de años
    if (anioDesde || anioHasta) {
      filters.anioPublicacion = {};
      if (anioDesde) {
        filters.anioPublicacion.$gte = parseInt(anioDesde);
      }
      if (anioHasta) {
        filters.anioPublicacion.$lte = parseInt(anioHasta);
      }
    }

    // Filtro por rango de páginas
    if (paginasMin || paginasMax) {
      filters.numeroPaginas = {};
      if (paginasMin) {
        filters.numeroPaginas.$gte = parseInt(paginasMin);
      }
      if (paginasMax) {
        filters.numeroPaginas.$lte = parseInt(paginasMax);
      }
    }

    // Convertir a números
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construir el objeto de ordenamiento
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Ejecutar queries en paralelo
    const [books, totalBooks] = await Promise.all([
      Book.find(filters)
        .sort(sortObject)
        .skip(skip)
        .limit(limitNum),
      Book.countDocuments(filters)
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(totalBooks / limitNum);

    res.json({
      success: true,
      data: books,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBooks,
        booksPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los libros',
      error: error.message
    });
  }
};

/**
 * Obtener un libro por ID
 * @route GET /api/books/:id
 */
const getBookById = async (req, res) => {
  try {
    const libro = await Book.findById(req.params.id);

    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: libro
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el libro',
      error: error.message
    });
  }
};

/**
 * Crear un nuevo libro
 * @route POST /api/books
 */
const createBook = async (req, res) => {
  try {
    const libro = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Libro creado exitosamente',
      data: libro
    });
  } catch (error) {
    // Manejo específico de errores de validación y duplicados
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'El ISBN ya existe en la base de datos'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el libro',
      error: error.message
    });
  }
};

/**
 * Actualizar un libro existente
 * @route PUT /api/books/:id
 */
const updateBook = async (req, res) => {
  try {
    const libro = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Retorna el documento actualizado
        runValidators: true // Ejecuta validaciones del schema
      }
    );

    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Libro actualizado exitosamente',
      data: libro
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'El ISBN ya existe en la base de datos'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar el libro',
      error: error.message
    });
  }
};

/**
 * Eliminar un libro
 * @route DELETE /api/books/:id
 */
const deleteBook = async (req, res) => {
  try {
    const libro = await Book.findByIdAndDelete(req.params.id);

    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Libro eliminado exitosamente',
      data: libro
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el libro',
      error: error.message
    });
  }
};

/**
 * Crear múltiples libros de una vez
 * @route POST /api/books/bulk
 */
const createBulkBooks = async (req, res) => {
  try {
    const books = req.body;

    // Validar que sea un array
    if (!Array.isArray(books)) {
      return res.status(400).json({
        success: false,
        message: 'El body debe ser un array de libros'
      });
    }

    // Validar que no esté vacío
    if (books.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El array de libros no puede estar vacío'
      });
    }

    // Insertar todos los libros
    const result = await Book.insertMany(books, { ordered: false });

    res.status(201).json({
      success: true,
      message: `${result.length} libros creados exitosamente`,
      data: result,
      count: result.length
    });
  } catch (error) {
    // Manejar errores de duplicados
    if (error.code === 11000) {
      const inserted = error.insertedDocs ? error.insertedDocs.length : 0;
      return res.status(207).json({
        success: true,
        message: `${inserted} libros insertados. Algunos ISBNs ya existían.`,
        data: error.insertedDocs,
        count: inserted
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error al crear los libros',
      error: error.message
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  createBulkBooks
};
