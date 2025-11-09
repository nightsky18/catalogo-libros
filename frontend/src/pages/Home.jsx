import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../services/api';
import './Home.css';

/**
 * Página de inicio - Dashboard con estadísticas generales
 * Muestra resumen del catálogo y métricas clave
 */
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
        <div className="loading-spinner">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1>📚 Sistema de Gestión de Catálogo de Libros</h1>
        <p className="hero-subtitle">
          Administra tu colección de libros y genera reportes XML con estadísticas detalladas
        </p>
        <div className="hero-actions">
          <Link to="/books" className="btn btn-primary">
            Ver Catálogo
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            Ver Reportes
          </Link>
        </div>
      </section>

      {/* Resumen General */}
      {stats && (
        <>
          <section className="summary-section">
            <h2>📊 Resumen General</h2>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <h3>{stats.resumen.totalLibros}</h3>
                  <p>Libros en Catálogo</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">📄</div>
                <div className="stat-content">
                  <h3>{stats.resumen.totalPaginas.toLocaleString()}</h3>
                  <p>Total de Páginas</p>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">📖</div>
                <div className="stat-content">
                  <h3>{stats.resumen.promedioPaginasPorLibro}</h3>
                  <p>Promedio Páginas/Libro</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                  <h3>{stats.resumen.editorialesUnicas}</h3>
                  <p>Editoriales Únicas</p>
                </div>
              </div>
            </div>
          </section>

          {/* Top Géneros */}
          <section className="genres-section">
            <h2>🎭 Distribución por Género</h2>
            <div className="genres-grid">
              {stats.porGenero.slice(0, 4).map((genero, index) => (
                <div key={index} className="genre-card">
                  <div className="genre-header">
                    <h3>{genero.genero}</h3>
                    <span className="genre-percentage">{genero.porcentaje.toFixed(1)}%</span>
                  </div>
                  <div className="genre-stats">
                    <div className="genre-stat">
                      <span className="label">Cantidad:</span>
                      <span className="value">{genero.cantidad} libros</span>
                    </div>
                    <div className="genre-stat">
                      <span className="label">Promedio páginas:</span>
                      <span className="value">{Math.round(genero.promedioPaginas)}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${genero.porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rankings */}
          {stats.rankings && (
            <section className="rankings-section">
              <h2>🏆 Rankings</h2>
              <div className="rankings-grid">
                {stats.rankings.libroMasAntiguo && (
                  <div className="ranking-card">
                    <div className="ranking-icon">⏳</div>
                    <h3>Más Antiguo</h3>
                    <p className="ranking-title">{stats.rankings.libroMasAntiguo.titulo}</p>
                    <p className="ranking-detail">{stats.rankings.libroMasAntiguo.autor}</p>
                    <span className="ranking-badge">{stats.rankings.libroMasAntiguo.anioPublicacion}</span>
                  </div>
                )}

                {stats.rankings.libroMasReciente && (
                  <div className="ranking-card">
                    <div className="ranking-icon">🆕</div>
                    <h3>Más Reciente</h3>
                    <p className="ranking-title">{stats.rankings.libroMasReciente.titulo}</p>
                    <p className="ranking-detail">{stats.rankings.libroMasReciente.autor}</p>
                    <span className="ranking-badge">{stats.rankings.libroMasReciente.anioPublicacion}</span>
                  </div>
                )}

                {stats.rankings.libroMasLargo && (
                  <div className="ranking-card">
                    <div className="ranking-icon">📏</div>
                    <h3>Más Largo</h3>
                    <p className="ranking-title">{stats.rankings.libroMasLargo.titulo}</p>
                    <p className="ranking-detail">{stats.rankings.libroMasLargo.autor}</p>
                    <span className="ranking-badge">{stats.rankings.libroMasLargo.numeroPaginas} páginas</span>
                  </div>
                )}

                {stats.rankings.libroMasCorto && (
                  <div className="ranking-card">
                    <div className="ranking-icon">📖</div>
                    <h3>Más Corto</h3>
                    <p className="ranking-title">{stats.rankings.libroMasCorto.titulo}</p>
                    <p className="ranking-detail">{stats.rankings.libroMasCorto.autor}</p>
                    <span className="ranking-badge">{stats.rankings.libroMasCorto.numeroPaginas} páginas</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Top Autores */}
          {stats.topAutores && stats.topAutores.length > 0 && (
            <section className="authors-section">
              <h2>✍️ Top Autores</h2>
              <div className="authors-list">
                {stats.topAutores.slice(0, 5).map((autor, index) => (
                  <div key={index} className="author-item">
                    <div className="author-rank">#{index + 1}</div>
                    <div className="author-info">
                      <h4>{autor.autor}</h4>
                      <p>{autor.cantidad} {autor.cantidad === 1 ? 'libro' : 'libros'} • {autor.porcentaje.toFixed(1)}% del catálogo</p>
                    </div>
                    <div className="author-stats">
                      <span>{autor.totalPaginas.toLocaleString()} páginas</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Análisis Temporal */}
          {stats.analisisTemporal && (
            <section className="temporal-section">
              <h2>📅 Análisis Temporal</h2>
              <div className="temporal-grid">
                <div className="temporal-card">
                  <h3>Últimos 5 años</h3>
                  <p className="temporal-value">{stats.analisisTemporal.librosUltimos5Anios}</p>
                  <p className="temporal-label">libros publicados</p>
                </div>
                <div className="temporal-card">
                  <h3>Últimos 10 años</h3>
                  <p className="temporal-value">{stats.analisisTemporal.librosUltimos10Anios}</p>
                  <p className="temporal-label">libros publicados</p>
                </div>
                <div className="temporal-card">
                  <h3>Clásicos</h3>
                  <p className="temporal-value">{stats.analisisTemporal.librosMas50Anios}</p>
                  <p className="temporal-label">libros con +50 años</p>
                </div>
                <div className="temporal-card highlight">
                  <h3>Década más productiva</h3>
                  <p className="temporal-value">{stats.analisisTemporal.decadaMasProductiva}</p>
                  <p className="temporal-label">más publicaciones</p>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
