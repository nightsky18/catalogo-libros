import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBooks, deleteBook } from '../services/api';
import './BookList.css';

/**
 * Página de lista de libros con CRUD
 */
function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ genero: '', autor: '', titulo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await getBooks(filters);
      setBooks(response.data.data);
    } catch (error) {
      console.error('Error al cargar libros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, titulo) => {
    if (window.confirm(`¿Eliminar "${titulo}"?`)) {
      try {
        await deleteBook(id);
        loadBooks();
      } catch (error) {
        alert('Error al eliminar el libro');
      }
    }
  };

  return (
    <div className="booklist-container">
      <div className="booklist-header">
        <h1>📚 Catálogo de Libros</h1>
        <Link to="/books/new" className="btn btn-primary">
          + Agregar Libro
        </Link>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={filters.titulo}
          onChange={(e) => setFilters({ ...filters, titulo: e.target.value })}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Buscar por autor..."
          value={filters.autor}
          onChange={(e) => setFilters({ ...filters, autor: e.target.value })}
          className="filter-input"
        />
        <select
          value={filters.genero}
          onChange={(e) => setFilters({ ...filters, genero: e.target.value })}
          className="filter-select"
        >
          <option value="">Todos los géneros</option>
          <option value="Ficción">Ficción</option>
          <option value="No Ficción">No Ficción</option>
          <option value="Ciencia">Ciencia</option>
          <option value="Historia">Historia</option>
          <option value="Tecnología">Tecnología</option>
          <option value="Arte">Arte</option>
          <option value="Biografía">Biografía</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Cargando libros...</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <p>No hay libros en el catálogo</p>
          <Link to="/books/new" className="btn btn-primary">Agregar el primero</Link>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-genre">{book.genero}</div>
              <h3>{book.titulo}</h3>
              <p className="book-author">por {book.autor}</p>
              <div className="book-details">
                <span>📅 {book.anioPublicacion}</span>
                <span>📄 {book.numeroPaginas || 'N/A'} pág.</span>
              </div>
              <div className="book-actions">
                <button
                  onClick={() => navigate(`/books/edit/${book.id}`)}
                  className="btn-edit"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(book.id, book.titulo)}
                  className="btn-delete"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookList;
