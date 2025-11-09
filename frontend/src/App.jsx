import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Importar páginas
import Home from './pages/Home';
import BookList from './pages/BookList';
import BookForm from './pages/BookForm';
import Reports from './pages/Reports';
import { healthCheck } from './services/api';

/**
 * Componente principal de la aplicación
 * Maneja el enrutamiento y la navegación global
 */
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Verificar conexión con el backend al cargar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await healthCheck();
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
        console.error('Error de conexión:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="app-container">
      {/* Header con navegación */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <h1>Catálogo de Libros</h1>
          </div>
          
          <nav className="nav-menu">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Inicio
            </Link>
            <Link 
              to="/books" 
              className={location.pathname === '/books' ? 'nav-link active' : 'nav-link'}
            >
              Libros
            </Link>
            <Link 
              to="/reports" 
              className={location.pathname === '/reports' ? 'nav-link active' : 'nav-link'}
            >
              Reportes XML
            </Link>
          </nav>

          <div className="connection-status">
            {loading ? (
              <span className="status loading">Conectando...</span>
            ) : isConnected ? (
              <span className="status connected">✓ Conectado</span>
            ) : (
              <span className="status disconnected">✗ Sin conexión</span>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="app-main">
        {!loading && !isConnected ? (
          <div className="connection-error">
            <h2>⚠️ Error de Conexión</h2>
            <p>No se pudo conectar con el servidor backend.</p>
            <p>Asegúrate de que el servidor esté corriendo en {import.meta.env.VITE_API_URL || 'http://localhost:5000'}</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/new" element={<BookForm />} />
            <Route path="/books/edit/:id" element={<BookForm />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Sistema de Gestión de Catálogo de Libros - 2025</p>
        <p>Desarrollado para Programación Distribuida y Paralela</p>
      </footer>
    </div>
  );
}

export default App;
