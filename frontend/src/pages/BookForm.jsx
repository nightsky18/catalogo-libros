import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBook, updateBook, getBook } from '../services/api';
import './BookForm.css';

function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      const response = await getBook(id);
      setFormData(response.data.data);
    } catch (error) {
      alert('Error al cargar el libro');
      navigate('/books');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await updateBook(id, formData);
      } else {
        await createBook(formData);
      }
      navigate('/books');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar el libro');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="bookform-container">
      <div className="form-header">
        <h1>{id ? '✏️ Editar Libro' : '➕ Agregar Nuevo Libro'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-row">
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Autor *</label>
            <input
              type="text"
              name="autor"
              value={formData.autor}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>ISBN *</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
              placeholder="9780123456789"
            />
          </div>

          <div className="form-group">
            <label>Género *</label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              required
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
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Año de Publicación *</label>
            <input
              type="number"
              name="anioPublicacion"
              value={formData.anioPublicacion}
              onChange={handleChange}
              required
              min="1000"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="form-group">
            <label>Número de Páginas</label>
            <input
              type="number"
              name="numeroPaginas"
              value={formData.numeroPaginas}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Editorial</label>
          <input
            type="text"
            name="editorial"
            value={formData.editorial}
            onChange={handleChange}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            maxLength={1000}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear Libro'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookForm;
