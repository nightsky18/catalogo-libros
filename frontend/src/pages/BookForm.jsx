import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBook, getBook, updateBook } from '../services/api';
import { loading, close, toast, alertError, formError, confirmAction } from '../utils/alerts';
import './BookForm.css';

function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loadingState, setLoadingState] = useState(false); // evita sombra con loading() de alerts
  const [errors, setErrors] = useState({});
  const [initialData, setInitialData] = useState(null);
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

  const isDirty = useMemo(() => {
    if (!initialData) return false;
    const a = {
      ...initialData,
      anioPublicacion: Number(initialData.anioPublicacion),
      numeroPaginas: Number(initialData.numeroPaginas || 0),
    };
    const b = {
      ...formData,
      anioPublicacion: Number(formData.anioPublicacion),
      numeroPaginas: Number(formData.numeroPaginas || 0),
    };
    return JSON.stringify(a) !== JSON.stringify(b);
  }, [initialData, formData]);

  useEffect(() => {
    if (isEditMode) {
      loadBook();
    } else {
      // sembrar initialData para detección de cambios
      setInitialData({
        ...formData,
        anioPublicacion: Number(formData.anioPublicacion),
        numeroPaginas: Number(formData.numeroPaginas || 0),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadBook = async () => {
    try {
      loading('Cargando libro...');
      const response = await getBook(id);
      const data = response.data?.data || {};
      const filled = {
        titulo: data.titulo || '',
        autor: data.autor || '',
        isbn: data.isbnFormateado || data.isbn || '',
        genero: data.genero || 'Ficción',
        anioPublicacion: data.anioPublicacion || new Date().getFullYear(),
        editorial: data.editorial || '',
        numeroPaginas: data.numeroPaginas || '',
        descripcion: data.descripcion || ''
      };
      setFormData(filled);
      setInitialData(filled);
      close();
    } catch (error) {
      close();
      alertError('Error al cargar el libro', error?.response?.data?.message || 'Inténtalo más tarde');
      navigate('/books');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'isbn') {
      const v = value.replace(/[^\dXx-]/g, '');
      setFormData((prev) => ({ ...prev, [name]: v }));
    } else if (name === 'anioPublicacion' || name === 'numeroPaginas') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^\d]/g, '') }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const yNow = new Date().getFullYear();

    if (!formData.titulo.trim()) newErrors.titulo = 'El título es obligatorio';
    if (!formData.autor.trim()) newErrors.autor = 'El autor es obligatorio';

    const rawIsbn = (formData.isbn || '').trim();
    if (!rawIsbn) {
      newErrors.isbn = 'El ISBN es obligatorio';
    } else {
      const cleaned = rawIsbn.replace(/[-\s]/g, '').toUpperCase();
      const len = cleaned.length;
      const match10 = /^\d{9}[\dX]$/.test(cleaned);
      const match13 = /^\d{13}$/.test(cleaned);
      if (len < 10 || len > 13) {
        newErrors.isbn = 'El ISBN debe tener entre 10 y 13 caracteres (sin guiones).';
      } else if (!(match10 || match13)) {
        newErrors.isbn = 'ISBN inválido. Use ISBN-10 (X permitida) o ISBN-13 (13 dígitos).';
      }
    }

    if (!formData.genero) newErrors.genero = 'Selecciona un género';

    const year = parseInt(formData.anioPublicacion, 10);
    if (!year || year < 1000 || year > yNow + 1) newErrors.anioPublicacion = `Ingresa un año válido (1000 a ${yNow + 1})`;

    if (!formData.editorial.trim()) newErrors.editorial = 'La editorial es obligatoria';

    const pages = parseInt(formData.numeroPaginas, 10);
    if (!pages || pages < 1) newErrors.numeroPaginas = 'El número de páginas debe ser mayor a 0';

    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      formError('Revisa los campos', newErrors);
      return false;
    }
    return true;
  };

  const normalizeIsbnForSend = (v = '') => v.replace(/[-\s]/g, '').toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      loading(isEditMode ? 'Actualizando libro...' : 'Guardando libro...');
      setLoadingState(true);

      const bookData = {
        ...formData,
        isbn: normalizeIsbnForSend(formData.isbn),
        anioPublicacion: parseInt(formData.anioPublicacion, 10),
        numeroPaginas: parseInt(formData.numeroPaginas, 10)
      };

      if (isEditMode) {
        await updateBook(id, bookData);
        close();
        toast('Libro actualizado');
      } else {
        await createBook(bookData);
        close();
        toast('Libro creado');
      }

      navigate('/books');
    } catch (error) {
      close();
      const data = error?.response?.data;
      if (data?.errors?.length) {
        const obj = Object.fromEntries(data.errors.map((msg, i) => [`Error ${i + 1}`, msg]));
        formError(data.message || 'Error de validación', obj);
      } else {
        alertError('Error al guardar', data?.message || 'Inténtalo más tarde');
      }
    } finally {
      setLoadingState(false);
    }
  };

  const handleBack = async () => {
    if (isDirty) {
      const ok = await confirmAction('¿Descartar cambios?', 'Los cambios no guardados se perderán', 'Sí, salir');
      if (!ok) return;
    }
    navigate('/books');
  };

  return (
    <div className="form-container fade-in">
      <div className="form-header">
        <div className="header-content">
          <h1>{isEditMode ? '✏️ Editar Libro' : '➕ Agregar Nuevo Libro'}</h1>
          <p className="form-subtitle">
            {isEditMode ? 'Actualiza la información del libro' : 'Completa la información del nuevo libro'}
          </p>
        </div>
        <button type="button" onClick={handleBack} className="btn btn-secondary">
          ← Volver al catálogo
        </button>
      </div>

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
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleBack} className="btn btn-secondary" disabled={loadingState}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loadingState}>
            {loadingState ? (
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
