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

  // ---- Nav config (4 items + center FAB) ----
  _nav: [
    { id: 'dashboard', label: 'Dasbor',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
    { id: 'history',   label: 'Histori', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3"/></svg>` },
    { id: 'report',    label: 'Laporan',   icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>` },
    { id: 'account',   label: 'Pengaturan',  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>` },
  ],

  init() {
    // Check session
    const storedUser = localStorage.getItem('lm_user');
    if (storedUser) {
      this._user = JSON.parse(storedUser);
      const appShell = document.getElementById('app-shell');
      if (appShell) appShell.style.display = 'flex';
      const authContainer = document.getElementById('auth-container');
      if (authContainer) authContainer.style.display = 'none';
    } else {
      this._user = null;
      const appShell = document.getElementById('app-shell');
      if (appShell) appShell.style.display = 'none';
      const authContainer = document.getElementById('auth-container');
      if (authContainer) {
        authContainer.style.display = 'block';
        AuthPage.render(authContainer);
      }
      
      const loader = document.getElementById('loading-overlay');
      if (loader) loader.style.display = 'none';
      return;
    }

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

    // Reset sub-view on AccountPage when navigating away/back
    if (page === 'account' && window.AccountPage) AccountPage._view = 'main';

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
      const left  = this._nav.slice(0, 2);  // Home, History
      const right = this._nav.slice(2);     // Stats, Config

      bottomNav.innerHTML = `
        ${left.map(item => `
          <button class="bottom-nav-item" data-nav-id="${item.id}" onclick="App.navigate('${item.id}')">
            <div class="nav-icon-wrap">${item.icon}</div>
            <span>${item.label}</span>
          </button>
        `).join('')}

        <div class="nav-fab-slot">
          <button class="nav-fab" id="nav-fab-btn" onclick="App.showFab()" aria-label="Tambah">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        ${right.map(item => `
          <button class="bottom-nav-item" data-nav-id="${item.id}" onclick="App.navigate('${item.id}')">
            <div class="nav-icon-wrap">${item.icon}</div>
            <span>${item.label}</span>
          </button>
        `).join('')}
      `;
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

  // ---- FAB Action Sheet ----
  showFab() {
    const html = `
      <div class="modal-drag-bar"></div>
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.10em;color:var(--on-surface-variant);opacity:0.6">Tambah Baru</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button onclick="App.closeModal();App.navigate('income')" style="display:flex;align-items:center;gap:16px;padding:16px 18px;background:rgba(22,163,74,0.06);border:1.5px solid rgba(22,163,74,0.14);border-radius:20px;cursor:pointer;text-align:left;width:100%;transition:all 0.15s" onmouseover="this.style.background='rgba(22,163,74,0.10)'" onmouseout="this.style.background='rgba(22,163,74,0.06)'">
          <div style="width:46px;height:46px;background:rgba(22,163,74,0.12);border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--green-600)">Uang Masuk</div>
            <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.65;margin-top:1px">Catat pemasukan ke kas</div>
          </div>
        </button>
        <button onclick="App.closeModal();App.navigate('expense')" style="display:flex;align-items:center;gap:16px;padding:16px 18px;background:rgba(186,26,26,0.05);border:1.5px solid rgba(186,26,26,0.12);border-radius:20px;cursor:pointer;text-align:left;width:100%;transition:all 0.15s" onmouseover="this.style.background='rgba(186,26,26,0.08)'" onmouseout="this.style.background='rgba(186,26,26,0.05)'">
          <div style="width:46px;height:46px;background:rgba(186,26,26,0.08);border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--red-600)">Uang Keluar</div>
            <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.65;margin-top:1px">Catat pengeluaran dari kas</div>
          </div>
        </button>
        <button onclick="App.closeModal();App.navigate('debt')" style="display:flex;align-items:center;gap:16px;padding:16px 18px;background:rgba(16,74,240,0.05);border:1.5px solid rgba(16,74,240,0.12);border-radius:20px;cursor:pointer;text-align:left;width:100%;transition:all 0.15s" onmouseover="this.style.background='rgba(16,74,240,0.08)'" onmouseout="this.style.background='rgba(16,74,240,0.05)'">
          <div style="width:46px;height:46px;background:rgba(16,74,240,0.08);border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z"/></svg>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--primary-600)">Kasbon</div>
            <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.65;margin-top:1px">Catat atau lihat kasbon pelanggan</div>
          </div>
        </button>
      </div>
      <div style="height:8px"></div>
    `;
    this.openModal(html);
  },

  // ---- PWA Install ----
  _deferredPrompt: null,
  _setupInstall() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this._deferredPrompt = e;
      window._pwaInstallPrompt = e; // expose for AccountPage
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
      window._pwaInstallPrompt = null;
      document.getElementById('install-banner')?.classList.add('hidden');
      if (outcome === 'accepted') Toast.success('LanggengMakmur Cashier berhasil diinstall!');
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
  confirm(msg, onOk, onCancel, okLabel = 'Hapus') {
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
          <button id="conf-ok"     class="btn btn-red"   style="flex:1;height:40px">${okLabel}</button>
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
