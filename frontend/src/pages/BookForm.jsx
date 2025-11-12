import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBook, getBook, updateBook } from '../services/api';
import './BookForm.css';

/**
 * Formulario profesional para crear/editar libros
 * Validación completa y feedback visual
 */
function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    genero: 'Ficción',
    anioPublicacion: new Date().getFullYear(),
    editorial: '',
    numeroPaginas: '',
    descripcion: ''
  });

  useEffect(() => {
    if (isEditMode) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const response = await getBook(id);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error al cargar el libro:', error);
      alert('Error al cargar el libro');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!formData.autor.trim()) {
      newErrors.autor = 'El autor es obligatorio';
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'El ISBN es obligatorio';
    } else if (!/^[0-9-]+$/.test(formData.isbn)) {
      newErrors.isbn = 'El ISBN solo puede contener números y guiones';
    }

    if (!formData.genero) {
      newErrors.genero = 'Selecciona un género';
    }

    const year = parseInt(formData.anioPublicacion);
    if (!year || year < 1000 || year > new Date().getFullYear() + 1) {
      newErrors.anioPublicacion = 'Ingresa un año válido';
    }

    if (!formData.editorial.trim()) {
      newErrors.editorial = 'La editorial es obligatoria';
    }

    const pages = parseInt(formData.numeroPaginas);
    if (!pages || pages < 1) {
      newErrors.numeroPaginas = 'El número de páginas debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const bookData = {
        ...formData,
        anioPublicacion: parseInt(formData.anioPublicacion),
        numeroPaginas: parseInt(formData.numeroPaginas)
      };

      if (isEditMode) {
        await updateBook(id, bookData);
      } else {
        await createBook(bookData);
      }

      navigate('/books');
    } catch (error) {
      console.error('Error al guardar el libro:', error);
      
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error al guardar el libro');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="form-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando libro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container fade-in">
      {/* Header */}
      <div className="form-header">
        <div className="header-content">
          <h1>{isEditMode ? '✏️ Editar Libro' : '➕ Agregar Nuevo Libro'}</h1>
          <p className="form-subtitle">
            {isEditMode 
              ? 'Actualiza la información del libro' 
              : 'Completa la información del nuevo libro'
            }
          </p>
        </div>
        <button 
          type="button" 
          onClick={() => navigate('/books')} 
          className="btn btn-secondary"
        >
          ← Volver al catálogo
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-section">
          <h2 className="section-title">📚 Información Principal</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="titulo" className="required">Título del Libro</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className={errors.titulo ? 'error' : ''}
                placeholder="Ej: Cien años de soledad"
              />
              {errors.titulo && <span className="error-message">{errors.titulo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="autor" className="required">Autor</label>
              <input
                type="text"
                id="autor"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                className={errors.autor ? 'error' : ''}
                placeholder="Ej: Gabriel García Márquez"
              />
              {errors.autor && <span className="error-message">{errors.autor}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="isbn" className="required">ISBN</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className={errors.isbn ? 'error' : ''}
                placeholder="Ej: 978-84-376-0494-7"
              />
              {errors.isbn && <span className="error-message">{errors.isbn}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="genero" className="required">Género</label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className={errors.genero ? 'error' : ''}
              >
                <option value="Ficción">Ficción</option>
                <option value="No Ficción">No Ficción</option>
                <option value="Ciencia">Ciencia</option>
                <option value="Historia">Historia</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Arte">Arte</option>
                <option value="Biografía">Biografía</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.genero && <span className="error-message">{errors.genero}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">📖 Detalles de Publicación</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="anioPublicacion" className="required">Año de Publicación</label>
              <input
                type="number"
                id="anioPublicacion"
                name="anioPublicacion"
                value={formData.anioPublicacion}
                onChange={handleChange}
                className={errors.anioPublicacion ? 'error' : ''}
                min="1000"
                max={new Date().getFullYear() + 1}
                placeholder="Ej: 2024"
              />
              {errors.anioPublicacion && <span className="error-message">{errors.anioPublicacion}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="editorial" className="required">Editorial</label>
              <input
                type="text"
                id="editorial"
                name="editorial"
                value={formData.editorial}
                onChange={handleChange}
                className={errors.editorial ? 'error' : ''}
                placeholder="Ej: Editorial Planeta"
              />
              {errors.editorial && <span className="error-message">{errors.editorial}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="numeroPaginas" className="required">Número de Páginas</label>
              <input
                type="number"
                id="numeroPaginas"
                name="numeroPaginas"
                value={formData.numeroPaginas}
                onChange={handleChange}
                className={errors.numeroPaginas ? 'error' : ''}
                min="1"
                placeholder="Ej: 350"
              />
              {errors.numeroPaginas && <span className="error-message">{errors.numeroPaginas}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">📝 Descripción</h2>
          
          <div className="form-group full-width">
            <label htmlFor="descripcion">Descripción o Sinopsis</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="5"
              placeholder="Escribe una breve descripción del libro..."
            ></textarea>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                {isEditMode ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                {isEditMode ? '💾 Actualizar Libro' : '✅ Crear Libro'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookForm;