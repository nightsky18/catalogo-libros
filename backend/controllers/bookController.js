const Book = require('../models/Book');

/**
 * Controlador de Libros - Maneja la lógica de negocio del CRUD
 */

/**
 * Obtener todos los libros con paginación y filtros opcionales
 * @route GET /api/books
 */
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, genero, autor, titulo } = req.query;
    
    // Construcción dinámica de filtros (Open/Closed Principle)
    const filtros = {};
    if (genero) filtros.genero = genero;
    if (autor) filtros.autor = new RegExp(autor, 'i'); // Búsqueda case-insensitive
    if (titulo) filtros.titulo = new RegExp(titulo, 'i');

    const skip = (page - 1) * limit;

    const [libros, total] = await Promise.all([
      Book.find(filtros)
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      Book.countDocuments(filtros)
    ]);

    res.status(200).json({
      success: true,
      data: libros,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
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

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
