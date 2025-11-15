import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import logo from './assets/Logo.png';
// Importar páginas

import Home from './pages/Home';
import BookList from './pages/BookList';
import BookForm from './pages/BookForm';
import Reports from './pages/Reports';

/**
 * Componente principal de la aplicación
 * Header limpio y profesional
 */
function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      {/* Header profesional sin indicador de conexión */}
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src={logo} alt="BookAnalytics Logo" className="logo-image" />
            <h1>BookAnalytics</h1>
          </Link>
          
          <nav className="nav-menu">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Inicio
            </Link>
            <Link 
              to="/books" 
              className={location.pathname.startsWith('/books') ? 'nav-link active' : 'nav-link'}
            >
              Libros
            </Link>
            <Link 
              to="/reports" 
              className={location.pathname === '/reports' ? 'nav-link active' : 'nav-link'}
            >
              Reportes
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/new" element={<BookForm />} />
          <Route path="/books/edit/:id" element={<BookForm />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>

      {/* Footer profesional */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 Catálogo de Libros</p>
          <p>Progrmacion Distribuida y Paralela - Sistema de Gestión Bibliográfica</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
