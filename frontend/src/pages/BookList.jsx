import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBooks, deleteBook } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatIsbn } from '../utils/formatters';
import './BookList.css';

function BookList() {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    bookId: null,
    bookTitle: ''
  });
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ 
    genero: '', 
    autor: '', 
    titulo: '',
    editorial: '',
    anioDesde: '',
    anioHasta: '',
    paginasMin: '',
    paginasMax: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 12
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, [currentPage, filters]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage
      };
      const response = await getBooks(params);
      setBooks(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error al cargar libros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ 
      genero: '', 
      autor: '', 
      titulo: '',
      editorial: '',
      anioDesde: '',
      anioHasta: '',
      paginasMin: '',
      paginasMax: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 12
    });
    setCurrentPage(1);
  };

    const handleDelete = async (id, titulo) => {
    setConfirmDialog({
        isOpen: true,
        bookId: id,
        bookTitle: titulo
    });
    };

    const confirmDelete = async () => {
    try {
        await deleteBook(confirmDialog.bookId);
        loadBooks();
    } catch (error) {
        alert('Error al eliminar el libro');
    }
    };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        ← Anterior
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)} className="pagination-btn">
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button
          key={pagination.totalPages}
          onClick={() => setCurrentPage(pagination.totalPages)}
          className="pagination-btn"
        >
          {pagination.totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === pagination.totalPages}
        className="pagination-btn"
      >
        Siguiente →
      </button>
    );

    return pages;
  };

  const hasActiveFilters = 
    filters.genero || 
    filters.autor || 
    filters.titulo || 
    filters.editorial ||
    filters.anioDesde ||
    filters.anioHasta ||
    filters.paginasMin ||
    filters.paginasMax;

  return (
    <div className="booklist-container fade-in">
      <div className="booklist-header">
        <div className="header-text">
          <h1>Biblioteca Digital</h1>
          <p>Explora nuestra colección de {pagination.totalBooks || 0} libros</p>
        </div>
        <Link to="/books/new" className="btn btn-primary">
          + Agregar Libro
        </Link>
      </div>

      {/* Filtros básicos */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>🔍 Filtros de Búsqueda</h3>
          <div className="filters-actions">
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
              className="advanced-filters-btn"
            >
              {showAdvancedFilters ? '− Menos filtros' : '+ Más filtros'}
            </button>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="clear-filters-btn">
                ✕ Limpiar todo
              </button>
            )}
          </div>
        </div>
        
        {/* Filtros principales */}
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="filter-titulo">Buscar por título</label>
            <input
              id="filter-titulo"
              type="text"
              placeholder="Ej: Cien años de soledad..."
              value={filters.titulo}
              onChange={(e) => handleFilterChange('titulo', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-autor">Buscar por autor</label>
            <input
              id="filter-autor"
              type="text"
              placeholder="Ej: Gabriel García Márquez..."
              value={filters.autor}
              onChange={(e) => handleFilterChange('autor', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-genero">Filtrar por género</label>
            <select
              id="filter-genero"
              value={filters.genero}
              onChange={(e) => handleFilterChange('genero', e.target.value)}
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
        </div>

        {/* Filtros avanzados */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="filter-editorial">Editorial</label>
                <input
                  id="filter-editorial"
                  type="text"
                  placeholder="Ej: Planeta, Penguin..."
                  value={filters.editorial}
                  onChange={(e) => handleFilterChange('editorial', e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Año de publicación</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Desde"
                    value={filters.anioDesde}
                    onChange={(e) => handleFilterChange('anioDesde', e.target.value)}
                    className="filter-input-small"
                    min="1000"
                    max="2025"
                  />
                  <span className="range-separator">—</span>
                  <input
                    type="number"
                    placeholder="Hasta"
                    value={filters.anioHasta}
                    onChange={(e) => handleFilterChange('anioHasta', e.target.value)}
                    className="filter-input-small"
                    min="1000"
                    max="2025"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Número de páginas</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.paginasMin}
                    onChange={(e) => handleFilterChange('paginasMin', e.target.value)}
                    className="filter-input-small"
                    min="1"
                  />
                  <span className="range-separator">—</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.paginasMax}
                    onChange={(e) => handleFilterChange('paginasMax', e.target.value)}
                    className="filter-input-small"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ordenamiento y resultados por página */}
        <div className="filters-toolbar">
          <div className="sort-controls">
            <label htmlFor="sortBy">Ordenar por:</label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Más recientes</option>
              <option value="titulo">Título (A-Z)</option>
              <option value="autor">Autor (A-Z)</option>
              <option value="anioPublicacion">Año (nuevo-antiguo)</option>
              <option value="numeroPaginas">Páginas (más-menos)</option>
            </select>

            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-direction-btn"
              title={filters.sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="per-page-controls">
            <label htmlFor="limit">Mostrar:</label>
            <select
              id="limit"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="limit-select"
            >
              <option value="6">6 libros</option>
              <option value="12">12 libros</option>
              <option value="24">24 libros</option>
              <option value="48">48 libros</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resto del código permanece igual... */}
      {/* Contador, grid, paginación, etc. */}
      
      {!loading && books.length > 0 && (
        <div className="results-info">
          Mostrando <strong>{(currentPage - 1) * filters.limit + 1}</strong> - 
          <strong> {Math.min(currentPage * filters.limit, pagination.totalBooks)}</strong> de 
          <strong> {pagination.totalBooks}</strong> libros
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando libros...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No se encontraron libros</h2>
          <p>
            {hasActiveFilters 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer libro a la colección'
            }
          </p>
          {!hasActiveFilters && (
            <Link to="/books/new" className="btn btn-primary">
              + Agregar el primer libro
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book, index) => (
              <div 
                key={book.id} 
                className="book-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="book-card-header">
                  <span className="book-genre">{book.genero}</span>
                  <span className="book-year">{book.anioPublicacion || '—'}</span>
                </div>
                
                <div className="book-card-body">
                  <h3 className="book-title">{book.titulo}</h3>
                  <p className="book-author">por {book.autor}</p>
                  
                  {book.editorial && (
                    <p className="book-publisher">
                      <span className="label">Editorial:</span> {book.editorial}
                    </p>
                  )}
                  
                  <div className="book-details">
                    <div className="detail-item">
                      <span className="icon">📄</span>
                      <span>{book.numeroPaginas || 'N/A'} páginas</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">📖</span>
                      <span>{book.isbnFormateado ?? formatIsbn(book.isbn)}</span>
                    </div>
                  </div>
                </div>


                <div className="book-card-actions">
                  <button
                    onClick={() => navigate(`/books/edit/${book.id}`)}
                    className="btn-action btn-edit"
                  >
                    <span className="icon">✏️</span>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(book.id, book.titulo)}
                    className="btn-action btn-delete"
                  >
                    <span className="icon">🗑️</span>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination">
                {renderPagination()}
              </div>
              <div className="pagination-info">
                Página {currentPage} de {pagination.totalPages}
              </div>
            </div>
          )}
        </>
      )}
      <ConfirmDialog
      isOpen={confirmDialog.isOpen}
      onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      onConfirm={confirmDelete}
      title="¿Eliminar libro?"
      message={`¿Estás seguro de que deseas eliminar "${confirmDialog.bookTitle}"? Esta acción no se puede deshacer.`}
      confirmText="Sí, eliminar"
      cancelText="Cancelar"
      type="danger"
    />
    </div>
  );
}

export default BookList;