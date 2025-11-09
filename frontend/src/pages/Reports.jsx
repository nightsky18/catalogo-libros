import { useState, useEffect } from 'react';
import { getXMLReport, getStats, downloadXMLReport } from '../services/api';
import './Reports.css';

/**
 * Página de Reportes XML Avanzada
 * Con filtros, árbol visual y descarga personalizada
 */
function Reports() {
  const [xmlContent, setXmlContent] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('visual-tree');
  
  // Estado de filtros
  const [filters, setFilters] = useState({
    resumen: true,
    estadisticasPorGenero: true,
    estadisticasPorDecada: true,
    estadisticasPorEditorial: true,
    topAutores: true,
    rankings: true,
    analisisTemporal: true,
    libros: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [xmlResponse, statsResponse] = await Promise.all([
        getXMLReport(),
        getStats()
      ]);
      
      setXmlContent(xmlResponse.data);
      setStats(statsResponse.data.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los reportes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const filteredXML = applyFiltersToXML(xmlContent, filters);
      const blob = new Blob([filteredXML], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `catalogo-libros-${new Date().toISOString().split('T')[0]}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error al descargar el XML');
    }
  };

  const applyFiltersToXML = (xml, filters) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const root = xmlDoc.documentElement;

    // Eliminar secciones no seleccionadas
    Object.keys(filters).forEach(section => {
      if (!filters[section]) {
        const elements = root.getElementsByTagName(section);
        while (elements.length > 0) {
          elements[0].parentNode.removeChild(elements[0]);
        }
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  };

  const toggleAllFilters = (value) => {
    const newFilters = {};
    Object.keys(filters).forEach(key => {
      newFilters[key] = value;
    });
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-spinner">⏳ Cargando reportes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="error-message">
          <h2>⚠️ {error}</h2>
          <p>Asegúrate de tener libros en el catálogo para generar reportes.</p>
          <button onClick={loadData} className="btn btn-primary">🔄 Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>📊 Reportes XML Avanzados</h1>
          <p>Sistema completo de visualización y análisis de datos XML</p>
        </div>
        <button onClick={handleDownload} className="btn btn-primary">
          ⬇️ Descargar XML Filtrado
        </button>
      </div>

      {/* Filtros */}
      <FilterPanel filters={filters} setFilters={setFilters} toggleAllFilters={toggleAllFilters} />

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'visual-tree' ? 'active' : ''}`}
          onClick={() => setActiveTab('visual-tree')}
        >
          🌳 Árbol Visual
        </button>
        <button
          className={`tab ${activeTab === 'text-tree' ? 'active' : ''}`}
          onClick={() => setActiveTab('text-tree')}
        >
          🌲 Árbol Interactivo
        </button>
        <button
          className={`tab ${activeTab === 'xml' ? 'active' : ''}`}
          onClick={() => setActiveTab('xml')}
        >
          📄 Contenido XML
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Estadísticas
        </button>
      </div>

      {/* Contenido */}
      <div className="reports-content">
        {activeTab === 'visual-tree' && (
          <VisualXMLTree xmlContent={xmlContent} filters={filters} />
        )}
        
        {activeTab === 'text-tree' && (
          <XMLTree xmlContent={xmlContent} filters={filters} />
        )}
        
        {activeTab === 'xml' && (
          <XMLViewer xmlContent={applyFiltersToXML(xmlContent, filters)} filters={filters} />
        )}
        
        {activeTab === 'stats' && stats && (
          <StatsViewer stats={stats} filters={filters} />
        )}
      </div>
    </div>
  );
}

/**
 * Panel de filtros con checkboxes
 */
function FilterPanel({ filters, setFilters, toggleAllFilters }) {
  const [showFilters, setShowFilters] = useState(true);

  const filterLabels = {
    resumen: '📋 Resumen General',
    estadisticasPorGenero: '🎭 Estadísticas por Género',
    estadisticasPorDecada: '📅 Estadísticas por Década',
    estadisticasPorEditorial: '🏢 Estadísticas por Editorial',
    topAutores: '✍️ Top Autores',
    rankings: '🏆 Rankings',
    analisisTemporal: '⏱️ Análisis Temporal',
    libros: '📚 Catálogo de Libros'
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>
          🎛️ Filtros de Contenido XML
          <button className="toggle-filters" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? '▼' : '▶'}
          </button>
        </h3>
        {showFilters && (
          <div className="filter-actions">
            <button onClick={() => toggleAllFilters(true)} className="btn-small">
              ✓ Seleccionar Todo
            </button>
            <button onClick={() => toggleAllFilters(false)} className="btn-small">
              ✗ Deseleccionar Todo
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="filter-grid">
          {Object.keys(filters).map(key => (
            <label key={key} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
              />
              <span className={filters[key] ? 'active' : ''}>{filterLabels[key]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Árbol Visual Gráfico (estilo diagrama)
 */
function VisualXMLTree({ xmlContent, filters }) {
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    if (xmlContent) {
      const tree = parseXMLToVisualTree(xmlContent, filters);
      setTreeData(tree);
    }
  }, [xmlContent, filters]);

  const parseXMLToVisualTree = (xmlString, filters) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      return buildVisualTree(xmlDoc.documentElement, filters);
    } catch (error) {
      console.error('Error parsing XML:', error);
      return null;
    }
  };

  const buildVisualTree = (node, filters) => {
    const children = [];
    
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType === 1) { // Element node
        const nodeName = child.nodeName;
        const isFiltered = filters[nodeName] !== undefined ? filters[nodeName] : true;
        
        if (isFiltered) {
          children.push({
            name: nodeName,
            filtered: isFiltered,
            children: buildVisualTree(child, filters)
          });
        }
      }
    }

    return children;
  };

  if (!treeData) {
    return <div className="loading-spinner">🔨 Construyendo árbol visual...</div>;
  }

  return (
    <div className="visual-tree">
      <div className="tree-header">
        <h3>🌳 Árbol Visual del XML</h3>
        <p>Diagrama jerárquico con nodos resaltados según filtros aplicados</p>
      </div>
      <div className="visual-tree-container">
        <VisualTreeNode name="catalogoLibros" children={treeData} level={0} isRoot={true} />
      </div>
    </div>
  );
}

/**
 * Nodo del árbol visual con estilo gráfico
 */
function VisualTreeNode({ name, children, level, isRoot = false, filtered = true }) {
  const hasChildren = children && children.length > 0;

  return (
    <div className={`visual-node-container level-${level}`}>
      <div className={`visual-node ${isRoot ? 'root' : ''} ${filtered ? 'filtered' : 'dimmed'}`}>
        <div className="node-circle">
          {level === 0 ? '📦' : level === 1 ? '📂' : '📄'}
        </div>
        <div className="node-label">{name}</div>
      </div>

      {hasChildren && (
        <div className="visual-children">
          {children.map((child, index) => (
            <div key={index} className="child-wrapper">
              <div className="connector-line"></div>
              <VisualTreeNode
                name={child.name}
                children={child.children}
                level={level + 1}
                filtered={child.filtered}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function XMLTree({ xmlContent, filters }) {
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    if (xmlContent) {
      const filteredXML = applyFiltersToXMLString(xmlContent, filters);
      const tree = parseXMLToTree(filteredXML);
      setTreeData(tree);
    }
  }, [xmlContent, filters]);

  const applyFiltersToXMLString = (xml, filters) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const root = xmlDoc.documentElement;

    Object.keys(filters).forEach(section => {
      if (!filters[section]) {
        const elements = root.getElementsByTagName(section);
        while (elements.length > 0) {
          elements[0].parentNode.removeChild(elements[0]);
        }
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  };

  const parseXMLToTree = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      return buildTreeFromNode(xmlDoc.documentElement);
    } catch (error) {
      return null;
    }
  };

  const buildTreeFromNode = (node) => {
    const obj = {
      name: node.nodeName,
      attributes: {},
      children: [],
      value: null
    };

    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        obj.attributes[attr.name] = attr.value;
      }
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      
      if (child.nodeType === 1) {
        obj.children.push(buildTreeFromNode(child));
      } else if (child.nodeType === 3 && child.nodeValue.trim()) {
        obj.value = child.nodeValue.trim();
      }
    }

    return obj;
  };

  if (!treeData) {
    return <div className="loading-spinner">Construyendo árbol...</div>;
  }

  return (
    <div className="xml-tree">
      <div className="tree-header">
        <h3>🌲 Árbol Interactivo del XML</h3>
        <p>Navegación jerárquica con nodos expandibles/colapsables</p>
      </div>
      <div className="tree-container">
        <TreeNode node={treeData} level={0} />
      </div>
    </div>
  );
}

function TreeNode({ node, level }) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const hasAttributes = Object.keys(node.attributes).length > 0;
  const hasValue = node.value !== null;

  return (
    <div className="tree-node" style={{ marginLeft: `${level * 20}px` }}>
      <div className="node-header">
        {hasChildren && (
          <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? '▼' : '▶'}
          </button>
        )}
        <span className="node-name">&lt;{node.name}{hasAttributes && '*'}&gt;</span>
        
        {hasValue && <span className="node-value">: {node.value}</span>}
        
        {hasAttributes && expanded && (
          <div className="node-attributes">
            {Object.entries(node.attributes).map(([key, value]) => (
              <span key={key} className="attribute">@{key}="{value}"</span>
            ))}
          </div>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="node-children">
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function XMLViewer({ xmlContent, filters }) {
  return (
    <div className="xml-viewer">
      <div className="xml-header">
        <h3>📄 Contenido XML Generado</h3>
        <p>Formato XML filtrado según selección actual</p>
      </div>
      <pre className="xml-content">
        <code>{xmlContent}</code>
      </pre>
    </div>
  );
}

function StatsViewer({ stats, filters }) {
  return (
    <div className="stats-viewer">
      <div className="stats-header">
        <h3>📊 Estadísticas del Catálogo</h3>
        <p>Análisis según secciones seleccionadas</p>
      </div>

      {filters.resumen && (
        <section className="stats-section">
          <h4>📋 Resumen General</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total de Libros:</span>
              <span className="stat-value">{stats.resumen.totalLibros}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total de Páginas:</span>
              <span className="stat-value">{stats.resumen.totalPaginas.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Promedio Páginas/Libro:</span>
              <span className="stat-value">{stats.resumen.promedioPaginasPorLibro}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Editoriales Únicas:</span>
              <span className="stat-value">{stats.resumen.editorialesUnicas}</span>
            </div>
          </div>
        </section>
      )}

      {filters.estadisticasPorGenero && (
        <section className="stats-section">
          <h4>🎭 Distribución por Género</h4>
          <div className="genre-list">
            {stats.porGenero.map((genero, index) => (
              <div key={index} className="genre-item">
                <div className="genre-info">
                  <strong>{genero.genero}</strong>
                  <span>{genero.cantidad} libros ({genero.porcentaje.toFixed(1)}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${genero.porcentaje}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {filters.topAutores && stats.topAutores && (
        <section className="stats-section">
          <h4>✍️ Top Autores</h4>
          <div className="authors-list">
            {stats.topAutores.slice(0, 5).map((autor, index) => (
              <div key={index} className="author-row">
                <span className="rank">#{index + 1}</span>
                <span className="name">{autor.autor}</span>
                <span className="count">{autor.cantidad} libros</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Reports;
