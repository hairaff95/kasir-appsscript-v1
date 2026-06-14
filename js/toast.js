/**
 * toast.js v2
 */
const Toast = {
  _icons: {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>`,
    error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4m0 4h.01"/></svg>`,
    info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>`,
  },

  _show(msg, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container') || (() => {
      const el = document.createElement('div'); el.id = 'toast-container';
      document.body.appendChild(el); return el;
    })();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${this._icons[type] || ''}<span>${Utils.escHtml(msg)}</span>`;
    container.appendChild(toast);

    const remove = () => {
      toast.classList.add('exit');
      setTimeout(() => toast.remove(), 300);
    };

    const timer = setTimeout(remove, duration);
    toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
  },

  success(msg, d = 3000) { this._show(msg, 'success', d); },
  error(msg, d = 4000)   { this._show(msg, 'error', d); },
  warning(msg, d = 3500) { this._show(msg, 'warning', d); },
  info(msg, d = 3000)    { this._show(msg, 'info', d); },
};

window.Toast = Toast;
