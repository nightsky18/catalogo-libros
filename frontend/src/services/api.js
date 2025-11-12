import axios from 'axios';

/**
 * Servicio API - Abstracción de comunicación con el backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 segundos
});

// Interceptor para manejo de errores global
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// ==================== LIBROS ====================

/**
 * Obtiene todos los libros con paginación y filtros opcionales
 * @param {Object} params - Parámetros de consulta (page, limit, genero, autor, titulo)
 * @returns {Promise} - Respuesta con libros y paginación
 */
export const getBooks = (params = {}) => api.get('/api/books', { params });

/**
 * Obtiene un libro por ID
 * @param {String} id - ID del libro
 * @returns {Promise} - Datos del libro
 */
export const getBook = (id) => api.get(`/api/books/${id}`);

/**
 * Crea un nuevo libro
 * @param {Object} bookData - Datos del libro
 * @returns {Promise} - Libro creado
 */
export const createBook = (bookData) => api.post('/api/books', bookData);

/**
 * Actualiza un libro existente
 * @param {String} id - ID del libro
 * @param {Object} bookData - Datos actualizados
 * @returns {Promise} - Libro actualizado
 */
export const updateBook = (id, bookData) => api.put(`/api/books/${id}`, bookData);

/**
 * Elimina un libro
 * @param {String} id - ID del libro
 * @returns {Promise} - Confirmación de eliminación
 */
export const deleteBook = (id) => api.delete(`/api/books/${id}`);

// ==================== REPORTES ====================

/**
 * Obtiene el reporte XML completo como texto
 * @returns {Promise} - Contenido XML
 */
export const getXMLReport = () => 
  axios.get(`${API_URL}/api/reports/xml`, {
    headers: { 'Accept': 'application/xml' }
  });

/**
 * Obtiene estadísticas del catálogo en formato JSON
 * @returns {Promise} - Estadísticas completas
 */
export const getStats = () => api.get('/api/reports/stats');

/**
 * Descarga el reporte XML como archivo
 * @returns {Promise} - Blob del archivo
 */
export const downloadXMLReport = () => 
  axios.get(`${API_URL}/api/reports/download`, {
    responseType: 'blob',
    headers: { 'Accept': 'application/xml' }
  });

/**
 * Descarga el reporte PDF como archivo
 * @returns {Promise} - Blob del archivo PDF
 */
export const downloadPDFReport = () =>
  axios.get(`${API_URL}/api/reports/pdf`, {
    responseType: 'blob',
    headers: {
      'Accept': 'application/pdf'
    }
  });
  
// ==================== HEALTH CHECK ====================

/**
 * Verifica el estado del backend
 * @returns {Promise} - Estado del servidor
 */
export const healthCheck = () => api.get('/api/health');

export default api;
