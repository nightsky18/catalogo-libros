import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../services/api';
import './Home.css';

function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getStats();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h2>{error}</h2>
          <button onClick={loadStats} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Sistema de Gestión Bibliográfica</h1>
          <p className="hero-subtitle">
            Administra tu biblioteca digital de manera eficiente y profesional
          </p>
          <div className="hero-actions">
            <Link to="/books/new" className="btn btn-primary btn-large">
              + Agregar Libro
            </Link>
            <Link to="/books" className="btn btn-secondary btn-large">
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>

      {stats && (
        <>
          {/* Estadísticas Principales */}
          <section className="stats-section">
            <h2 className="section-title">📊 Estadísticas Generales</h2>
            
            <div className="stats-grid">
              <div className="stat-card stat-primary">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.resumen.totalLibros}</div>
                  <div className="stat-label">Total de Libros</div>
                </div>
              </div>

              <div className="stat-card stat-success">
                <div className="stat-icon">📄</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.resumen.totalPaginas.toLocaleString()}</div>
                  <div className="stat-label">Total de Páginas</div>
                </div>
              </div>

              <div className="stat-card stat-warning">
                <div className="stat-icon">📖</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.resumen.promedioPaginasPorLibro}</div>
                  <div className="stat-label">Páginas Promedio</div>
                </div>
              </div>

              <div className="stat-card stat-info">
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.resumen.editorialesUnicas}</div>
                  <div className="stat-label">Editoriales</div>
                </div>
              </div>
            </div>
          </section>

          {/* Distribución por Género */}
          {stats.porGenero && stats.porGenero.length > 0 && (
            <section className="genre-section">
              <div className="section-header">
                <h2 className="section-title">🎭 Distribución por Género</h2>
                <Link to="/reports" className="view-more-link">Ver reporte completo →</Link>
              </div>

              <div className="genre-grid">
                {stats.porGenero.map((item, index) => (
                  <div key={index} className="genre-card" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="genre-header">
                      <h3 className="genre-name">{item.genero || 'Sin género'}</h3>
                      <span className="genre-percentage">{item.porcentaje.toFixed(1)}%</span>
                    </div>
                    
                    <div className="genre-stats">
                      <div className="genre-stat">
                        <span className="label">Libros:</span>
                        <span className="value">{item.cantidad}</span>
                      </div>
                      <div className="genre-stat">
                        <span className="label">Pág. prom:</span>
                        <span className="value">{Math.round(item.promedioPaginas)}</span>
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${item.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top Autores */}
          {stats.topAutores && stats.topAutores.length > 0 && (
            <section className="authors-section">
              <div className="section-header">
                <h2 className="section-title">✍️ Top Autores</h2>
                <Link to="/reports" className="view-more-link">Ver todos →</Link>
              </div>

              <div className="authors-list">
                {stats.topAutores.slice(0, 10).map((autor, index) => (
                  <div key={index} className="author-item" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="author-rank">#{index + 1}</div>
                    <div className="author-info">
                      <h4 className="author-name">{autor.autor}</h4>
                      <p className="author-details">
                        {autor.cantidad} {autor.cantidad === 1 ? 'libro' : 'libros'} • 
                        {' '}{autor.totalPaginas.toLocaleString()} páginas
                      </p>
                    </div>
                    <div className="author-percentage">{autor.porcentaje.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rankings */}
          {stats.rankings && (
            <section className="rankings-section">
              <h2 className="section-title">🏆 Rankings y Récords</h2>
              
              <div className="rankings-grid">
                {stats.rankings.libroMasAntiguo && (
                  <div className="ranking-card">
                    <div className="ranking-icon">🕰️</div>
                    <h3>Libro Más Antiguo</h3>
                    <p className="ranking-title">{stats.rankings.libroMasAntiguo.titulo}</p>
                    <p className="ranking-detail">
                      {stats.rankings.libroMasAntiguo.autor} • {stats.rankings.libroMasAntiguo.anioPublicacion}
                    </p>
                  </div>
                )}

                {stats.rankings.libroMasReciente && (
                  <div className="ranking-card">
                    <div className="ranking-icon">🆕</div>
                    <h3>Libro Más Reciente</h3>
                    <p className="ranking-title">{stats.rankings.libroMasReciente.titulo}</p>
                    <p className="ranking-detail">
                      {stats.rankings.libroMasReciente.autor} • {stats.rankings.libroMasReciente.anioPublicacion}
                    </p>
                  </div>
                )}

                {stats.rankings.libroMasLargo && (
                  <div className="ranking-card">
                    <div className="ranking-icon">📚</div>
                    <h3>Libro Más Largo</h3>
                    <p className="ranking-title">{stats.rankings.libroMasLargo.titulo}</p>
                    <p className="ranking-detail">
                      {stats.rankings.libroMasLargo.numeroPaginas} páginas • {stats.rankings.libroMasLargo.autor}
                    </p>
                  </div>
                )}

                {stats.rankings.libroMasCorto && (
                  <div className="ranking-card">
                    <div className="ranking-icon">📖</div>
                    <h3>Libro Más Corto</h3>
                    <p className="ranking-title">{stats.rankings.libroMasCorto.titulo}</p>
                    <p className="ranking-detail">
                      {stats.rankings.libroMasCorto.numeroPaginas} páginas • {stats.rankings.libroMasCorto.autor}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Análisis Temporal */}
          {stats.analisisTemporal && (
            <section className="temporal-section">
              <h2 className="section-title">📅 Análisis Temporal</h2>
              
              <div className="temporal-grid">
                <div className="temporal-card">
                  <div className="temporal-icon">📆</div>
                  <h3>Últimos 5 años</h3>
                  <p className="temporal-value">{stats.analisisTemporal.librosUltimos5Anios}</p>
                  <p className="temporal-label">libros publicados</p>
                </div>

                <div className="temporal-card">
                  <div className="temporal-icon">🗓️</div>
                  <h3>Últimos 10 años</h3>
                  <p className="temporal-value">{stats.analisisTemporal.librosUltimos10Anios}</p>
                  <p className="temporal-label">libros publicados</p>
                </div>

                <div className="temporal-card">
                  <div className="temporal-icon">📜</div>
                  <h3>Más de 50 años</h3>
                  <p className="temporal-value">{stats.analisisTemporal.librosMas50Anios}</p>
                  <p className="temporal-label">libros clásicos</p>
                </div>

                <div className="temporal-card temporal-highlight">
                  <div className="temporal-icon">⭐</div>
                  <h3>Década Más Productiva</h3>
                  <p className="temporal-value">{stats.analisisTemporal.decadaMasProductiva}</p>
                  <p className="temporal-label">más publicaciones</p>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Listo para explorar tu biblioteca?</h2>
          <p>Descubre todos los libros, genera reportes y gestiona tu colección</p>
          <div className="cta-buttons">
            <Link to="/books" className="btn btn-primary btn-large">
              Explorar Catálogo
            </Link>
            <Link to="/reports" className="btn btn-secondary btn-large">
              Ver Reportes XML
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
