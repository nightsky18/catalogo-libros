const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  createBulkBooks
} = require('../controllers/bookController');

/**
 * Rutas de Libros - Define los endpoints del recurso Book
 */

// Rutas base: /api/books
router.route('/')
  .get(getAllBooks)      // GET /api/books - Listar todos
  .post(createBook);     // POST /api/books - Crear nuevo

router.post('/bulk', createBulkBooks);

  // Rutas con parámetro ID: /api/books/:id
router.route('/:id')
  .get(getBookById)      // GET /api/books/:id - Obtener por ID
  .put(updateBook)       // PUT /api/books/:id - Actualizar
  .delete(deleteBook);   // DELETE /api/books/:id - Eliminar

module.exports = router;
