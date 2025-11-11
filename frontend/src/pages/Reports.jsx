import { useState, useEffect } from 'react';
import { getXMLReport, downloadXMLReport } from '../services/api';
import { downloadPDFReport } from '../services/api';
import './Reports.css';

/**
 * Página de Reportes XML Avanzada
 * Con filtros, árbol visual y descarga personalizada
 */
function Reports() {
  const [xmlContent, setXmlContent] = useState('');
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
        const xmlResponse = await getXMLReport();
        
        setXmlContent(xmlResponse.data);
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

  /**
   * Maneja la descarga del PDF
   * Patrón: Separation of Concerns - lógica de descarga separada
   */
  const handleDownloadPDF = async () => {
    try {
      // Mostrar indicador de carga
      setLoading(true);

      const response = await downloadPDFReport();
      
      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `catalogo-libros-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      alert('Error al descargar el PDF: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleDownload} 
            className="btn btn-primary"
          >
            📄 Descargar XML Filtrado
          </button>
          <button 
            onClick={handleDownloadPDF} 
            className="btn btn-accent"
            disabled={loading}
          >
            📕 Descargar PDF Completo
          </button>
        </div>
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
        </div>

      {/* Contenido según tab activa */}
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
 * Árbol Visual Vertical con scroll horizontal
 * Layout de arriba hacia abajo con ramas al mismo nivel
 */
function VisualXMLTree({ xmlContent, filters }) {
  const [fullscreen, setFullscreen] = useState(false);

  const treeStructure = {
    name: 'catalogoLibros',
    type: 'root',
    children: [
      {
        name: 'resumen',
        filtered: filters.resumen,
        children: [
          { name: 'totalLibros', filtered: filters.resumen },
          { name: 'totalPaginas', filtered: filters.resumen },
          { name: 'promedioPaginasPorLibro', filtered: filters.resumen },
          { name: 'fechaGeneracion', filtered: filters.resumen },
          { name: 'promedioAnioPublicacion', filtered: filters.resumen },
          { name: 'rangoAnios', filtered: filters.resumen },
          { name: 'editorialesUnicas', filtered: filters.resumen }
        ]
      },
      {
        name: 'estadisticasPorGenero',
        filtered: filters.estadisticasPorGenero,
        children: [
          { name: 'total', filtered: filters.estadisticasPorGenero },
          { name: 'genero', filtered: filters.estadisticasPorGenero, note: '(múltiples)' }
        ]
      },
      {
        name: 'estadisticasPorDecada',
        filtered: filters.estadisticasPorDecada,
        children: [
          { name: 'total', filtered: filters.estadisticasPorDecada },
          { name: 'decada', filtered: filters.estadisticasPorDecada, note: '(múltiples)' }
        ]
      },
      {
        name: 'estadisticasPorEditorial',
        filtered: filters.estadisticasPorEditorial,
        children: [
          { name: 'total', filtered: filters.estadisticasPorEditorial },
          { name: 'editorial', filtered: filters.estadisticasPorEditorial, note: '(top 10)' }
        ]
      },
      {
        name: 'topAutores',
        filtered: filters.topAutores,
        children: [
          { name: 'autor', filtered: filters.topAutores, note: '(múltiples)' }
        ]
      },
      {
        name: 'rankings',
        filtered: filters.rankings,
        children: [
          { name: 'libroMasAntiguo', filtered: filters.rankings },
          { name: 'libroMasReciente', filtered: filters.rankings },
          { name: 'libroMasLargo', filtered: filters.rankings },
          { name: 'libroMasCorto', filtered: filters.rankings }
        ]
      },
      {
        name: 'analisisTemporal',
        filtered: filters.analisisTemporal,
        children: [
          { name: 'librosUltimos5Anios', filtered: filters.analisisTemporal },
          { name: 'librosUltimos10Anios', filtered: filters.analisisTemporal },
          { name: 'librosMas50Anios', filtered: filters.analisisTemporal },
          { name: 'decadaMasProductiva', filtered: filters.analisisTemporal }
        ]
      },
      {
        name: 'libros',
        filtered: filters.libros,
        children: [
          {
            name: 'libro',
            filtered: filters.libros,
            note: '(repetible)',
            children: [
              { name: 'titulo', filtered: filters.libros },
              { name: 'autor', filtered: filters.libros },
              { name: 'isbn', filtered: filters.libros },
              { name: 'genero', filtered: filters.libros },
              { name: 'anioPublicacion', filtered: filters.libros },
              { name: 'editorial', filtered: filters.libros },
              { name: 'numeroPaginas', filtered: filters.libros },
              { name: 'descripcion', filtered: filters.libros }
            ]
          }
        ]
      }
    ]
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    setFullscreen(!fullscreen);
  };

  return (
    <>
      {fullscreen && <div className="fullscreen-backdrop"></div>}
      
      <div className={`visual-tree ${fullscreen ? 'fullscreen' : ''}`}>
        <div className="tree-header">
          <div>
            <h3>🌳 Árbol Visual del XML</h3>
            <p>Estructura completa de arriba hacia abajo con scroll horizontal</p>
          </div>
          <button onClick={toggleFullscreen} className="btn-fullscreen">
            {fullscreen ? '🗗 Salir' : '⛶ Pantalla Completa'}
          </button>
        </div>

        <div className="vertical-tree-scroll">
          <div className="vertical-tree-container">
            <VerticalTreeNode node={treeStructure} isRoot={true} />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Nodo del árbol vertical (de arriba hacia abajo)
 */
function VerticalTreeNode({ node, isRoot = false }) {
  const hasChildren = node.children && node.children.length > 0;
  const isFiltered = node.filtered !== false;

  return (
    <div className="v-tree-node">
      {/* Nodo actual */}
      <div className={`v-node-box ${isRoot ? 'root' : ''} ${!isFiltered ? 'dimmed' : ''}`}>
        <div className="v-node-text">
          {node.name}
          {node.note && <span className="v-node-note">{node.note}</span>}
        </div>
      </div>

      {/* Hijos en horizontal */}
      {hasChildren && (
        <div className="v-children-wrapper">
          <div className="v-connector-vertical"></div>
          <div className="v-children-horizontal">
            {node.children.map((child, index) => (
              <div key={index} className="v-child-branch">
                <div className="v-connector-horizontal"></div>
                <VerticalTreeNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
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

export default Reports;
