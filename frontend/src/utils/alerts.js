// src/utils/alerts.js
import Swal from 'sweetalert2';

// Paleta institucional
const COLORS = {
  primary: '#08348C',
  cancel: '#6b7280',
  danger: '#E11D48'
};

// Preset base para coherencia visual
const base = {
  confirmButtonColor: COLORS.primary,
  cancelButtonColor: COLORS.cancel,
  buttonsStyling: true,
  showClass: { popup: 'swal2-show' },
  hideClass: { popup: 'swal2-hide' }
};

// Éxito, error, info
export const alertSuccess = (title, text = '') =>
  Swal.fire({ ...base, icon: 'success', title, text });

export const alertError = (title, text = '') =>
  Swal.fire({ ...base, icon: 'error', title, text });

export const alertInfo = (title, text = '') =>
  Swal.fire({ ...base, icon: 'info', title, text });

// Warning/destructivo (eliminar, resetear)
export const alertWarning = (title, text = '') =>
  Swal.fire({ ...base, icon: 'warning', title, text });

// Confirmación genérica
export const confirmAction = async (
  title,
  text = 'Esta acción no se puede deshacer',
  confirmText = 'Sí, continuar'
) => {
  const res = await Swal.fire({
    ...base,
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    focusCancel: true
  });
  return res.isConfirmed;
};

// Confirmación destructiva (botón rojo y foco en cancelar)
export const confirmDanger = async (
  title = '¿Deseas eliminar?',
  text = 'Se eliminará de forma permanente',
  confirmText = 'Sí, eliminar'
) => {
  const res = await Swal.fire({
    ...base,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: COLORS.danger,
    reverseButtons: true,
    focusCancel: true
  });
  return res.isConfirmed;
};

// Toast superior derecho
export const toast = (title, icon = 'success') =>
  Swal.fire({
    title,
    icon,
    toast: true,
    position: 'top-end',
    timer: 2200,
    showConfirmButton: false,
    timerProgressBar: true
  });

// Loader modal (usar loading(); ...; close())
export const loading = (title = 'Procesando...') =>
  Swal.fire({
    ...base,
    title,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

export const close = () => Swal.close();

// Prompt de texto con validación
export const promptText = async (
  title,
  placeholder = '',
  validate = v => (!v?.trim() ? 'Este campo es obligatorio' : undefined)
) => {
  const { value, isConfirmed } = await Swal.fire({
    ...base,
    title,
    input: 'text',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    inputValidator: validate
  });
  return isConfirmed ? value : null;
};

// Errores de formulario en lista
export const formError = (title, errorsObj) => {
  const html = `
    <ul style="text-align:left;margin:0;padding-left:1rem">
      ${Object.entries(errorsObj)
        .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
        .join('')}
    </ul>`;
  return Swal.fire({ ...base, icon: 'error', title, html, confirmButtonText: 'Corregir' });
};
