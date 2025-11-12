import { useEffect } from 'react';
import './ConfirmDialog.css';

/**
 * Modal de confirmación profesional
 * @param {boolean} isOpen - Estado del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función a ejecutar al confirmar
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje del modal
 * @param {string} confirmText - Texto del botón de confirmar
 * @param {string} cancelText - Texto del botón de cancelar
 * @param {string} type - Tipo de acción (danger, warning, success)
 */
function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Prevenir scroll del body cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch(type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'success':
        return '✅';
      default:
        return '❓';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="modal-container">
        <div className="modal-content">
          <div className={`modal-icon ${type}`}>
            {getIcon()}
          </div>
          
          <h2 className="modal-title">{title}</h2>
          <p className="modal-message">{message}</p>
          
          <div className="modal-actions">
            <button 
              onClick={onClose} 
              className="modal-btn btn-cancel"
            >
              {cancelText}
            </button>
            <button 
              onClick={handleConfirm} 
              className={`modal-btn btn-confirm btn-${type}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmDialog;