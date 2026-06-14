/**
 * app.js v2 — SPA Router, 5-Tab Navigation, Modal/Confirm helpers
 */

const App = {
  currentPage: 'dashboard',
  _user: null,

  _pages: {
    dashboard: null,
    income:    null,
    expense:   null,
    debt:      null,
    history:   null,
    report:    null,
    account:   null,
  },

  // ---- Nav config ----
  _nav: [
    { id: 'dashboard', label: 'Beranda',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
    { id: 'history',   label: 'Transaksi',  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3"/></svg>` },
    { id: 'debt',      label: 'Kasbon',     icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z"/></svg>` },
    { id: 'report',    label: 'Laporan',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>` },
    { id: 'account',   label: 'Akun',       icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  ],

  init() {
    // Register pages
    this._pages = { dashboard: DashboardPage, income: IncomePage, expense: ExpensePage, debt: DebtPage, history: HistoryPage, report: ReportPage, account: AccountPage };

    // Seed demo data
    MockDB.seed();

    // Loading indicator
    Api.onLoadingChange(active => {
      const el = document.getElementById('loading-overlay');
      if (el) el.style.display = active ? 'flex' : 'none';
    });

    // PWA service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(r => console.log('[SW] Registered'))
          .catch(e => console.warn('[SW] Error:', e));
      });
    }

    // Install banner
    this._setupInstall();

    // Build nav
    this._buildNav();

    // Route
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(hash, false);
    window.addEventListener('hashchange', () => {
      const page = window.location.hash.replace('#', '') || 'dashboard';
      this.navigate(page, false);
    });
  },

  navigate(page, push = true) {
    if (!this._pages[page]) page = 'dashboard';
    this.currentPage = page;
    if (push) window.location.hash = page;

    // Update active state on all nav elements
    document.querySelectorAll('[data-nav-id]').forEach(el => {
      el.classList.toggle('active', el.dataset.navId === page);
    });

    // Render
    const container = document.getElementById('page-container');
    if (container) {
      container.innerHTML = '';
      this._pages[page].render(container);
    }
  },

  _buildNav() {
    const bottomNav  = document.getElementById('bottom-nav');
    const sidebarNav = document.getElementById('sidebar-nav');

    if (bottomNav) {
      bottomNav.innerHTML = this._nav.map(item => `
        <button class="bottom-nav-item" data-nav-id="${item.id}" onclick="App.navigate('${item.id}')">
          ${item.icon}
          <span>${item.label}</span>
        </button>
      `).join('');
    }

    if (sidebarNav) {
      sidebarNav.innerHTML = this._nav.map(item => `
        <button class="sidebar-nav-btn" data-nav-id="${item.id}" onclick="App.navigate('${item.id}')">
          ${item.icon}
          <span>${item.label}</span>
        </button>
      `).join('');
    }
  },

  // ---- PWA Install ----
  _deferredPrompt: null,
  _setupInstall() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this._deferredPrompt = e;
      const banner = document.getElementById('install-banner');
      if (banner && !localStorage.getItem('install_dismissed')) {
        banner.classList.remove('hidden');
      }
    });

    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('install-dismiss');

    installBtn?.addEventListener('click', async () => {
      if (!this._deferredPrompt) return;
      this._deferredPrompt.prompt();
      const { outcome } = await this._deferredPrompt.userChoice;
      this._deferredPrompt = null;
      document.getElementById('install-banner')?.classList.add('hidden');
      if (outcome === 'accepted') Toast.success('Kasir Mini berhasil diinstall! 🎉');
    });

    dismissBtn?.addEventListener('click', () => {
      document.getElementById('install-banner')?.classList.add('hidden');
      localStorage.setItem('install_dismissed', '1');
    });
  },

  // ---- User ----
  storeId() { return this._user?.store_id || 'default'; },
  getUser()  { return this._user; },

  // ---- Modal ----
  openModal(html) {
    document.getElementById('app-modal')?.remove();
    const div = document.createElement('div');
    div.id = 'app-modal';
    div.className = 'modal-overlay';
    div.innerHTML = `<div class="modal-sheet">${html}</div>`;
    document.body.appendChild(div);
    document.body.classList.add('no-scroll');

    div.addEventListener('click', e => { if (e.target === div) App.closeModal(); });
    return div;
  },

  closeModal() {
    document.getElementById('app-modal')?.remove();
    document.body.classList.remove('no-scroll');
  },

  // ---- Confirm ----
  confirm(msg, onOk, onCancel) {
    document.getElementById('app-confirm')?.remove();
    const div = document.createElement('div');
    div.id = 'app-confirm';
    div.className = 'confirm-overlay';
    div.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-icon">⚠️</div>
        <div class="confirm-title">Konfirmasi</div>
        <div class="confirm-msg">${Utils.escHtml(msg)}</div>
        <div class="confirm-actions">
          <button id="conf-cancel" class="btn btn-ghost" style="flex:1;height:40px">Batal</button>
          <button id="conf-ok"     class="btn btn-red"   style="flex:1;height:40px">Hapus</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    const close = () => div.remove();
    document.getElementById('conf-ok').onclick     = () => { close(); onOk(); };
    document.getElementById('conf-cancel').onclick = () => { close(); if (onCancel) onCancel(); };
    div.addEventListener('click', e => { if (e.target === div) { close(); if (onCancel) onCancel(); } });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
