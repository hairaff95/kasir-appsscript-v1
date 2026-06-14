/**
 * account.js — Halaman Akun & Pengaturan (Tab ke-5)
 */
const AccountPage = {
  render(container) {
    container.innerHTML = this._html();
    this._bind(container);
  },

  _html() {
    const user = App.getUser();
    const initials = user ? user.name.slice(0, 2).toUpperCase() : 'KM';

    return `
      <div class="page-header">
        <h1>Akun & Pengaturan</h1>
      </div>

      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">

        <!-- Profile card -->
        <div class="card" style="padding:20px;display:flex;align-items:center;gap:14px">
          <div style="width:52px;height:52px;background:var(--orange-50);border:2px solid var(--orange-100);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span style="font-size:18px;font-weight:800;color:var(--orange)">${initials}</span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:700;color:var(--gray-900)">${Utils.escHtml(user ? user.name : 'Pemilik Toko')}</div>
            <div style="font-size:12px;color:var(--gray-400)">${Utils.escHtml(user ? user.email : 'Mode Demo Aktif')}</div>
          </div>
          ${DEMO_MODE ? `<span class="badge badge-orange">DEMO</span>` : ''}
        </div>

        <!-- App info -->
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);padding:4px 0 0">Aplikasi</div>
        <div class="card" style="padding:0">
          ${this._menuItem('📱', 'Kasir Mini', 'Versi 2.0', false, false)}
          ${this._menuItem('🔔', 'Status Data', DEMO_MODE ? 'Mode Demo (LocalStorage)' : 'Terhubung ke Google Sheets', false, false)}
          ${this._menuItem('🌐', 'PWA Installable', 'Bisa diinstall di Android', false, false)}
        </div>

        <!-- Demo section -->
        ${DEMO_MODE ? `
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);padding:4px 0 0">Mode Demo</div>
          <div class="card" style="padding:14px">
            <p style="font-size:13px;color:var(--gray-500);margin-bottom:12px;line-height:1.6">
              Saat ini aplikasi berjalan dalam <strong>mode demo</strong>. Data tersimpan di perangkat ini (localStorage) dan tidak terhubung ke Google Sheets.
            </p>
            <p style="font-size:12px;color:var(--gray-400);margin-bottom:12px">
              Untuk production: buka <code style="background:var(--gray-100);padding:2px 6px;border-radius:4px;font-size:11px">js/api.js</code>, masukkan URL Apps Script Anda, dan ubah <code style="background:var(--gray-100);padding:2px 6px;border-radius:4px;font-size:11px">DEMO_MODE = false</code>.
            </p>
            <button id="reset-demo-btn" class="btn btn-ghost btn-sm" style="color:var(--red)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Reset Data Demo
            </button>
          </div>
        ` : ''}

        <!-- Google Sheets Guide -->
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);padding:4px 0 0">Panduan Connect Google Sheets</div>
        <div class="card" style="padding:14px">
          <ol style="font-size:13px;color:var(--gray-600);line-height:1.8;padding-left:20px">
            <li>Buka <strong>Google Sheets</strong> → buat spreadsheet baru</li>
            <li>Klik <strong>Extensions → Apps Script</strong></li>
            <li>Copy paste isi file <code style="background:var(--gray-100);padding:2px 6px;border-radius:4px;font-size:11px">apps-script/Code.gs</code></li>
            <li>Klik <strong>Deploy → New Deployment → Web App</strong></li>
            <li>Execute as: <strong>Me</strong> | Access: <strong>Anyone</strong></li>
            <li>Copy URL → paste ke <code style="background:var(--gray-100);padding:2px 6px;border-radius:4px;font-size:11px">js/api.js</code> baris <code style="background:var(--gray-100);padding:2px 6px;border-radius:4px;font-size:11px">APPS_SCRIPT_URL</code></li>
            <li>Ubah <code style="background:var(--gray-100);padding:2px 6px;border-radius:4px;font-size:11px">DEMO_MODE = false</code></li>
          </ol>
        </div>

        <!-- Deploy guide -->
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);padding:4px 0 0">Cara Deploy (Rekomendasi)</div>
        <div class="card" style="padding:0">
          ${this._menuItem('▲', 'Vercel', 'Gratis, HTTPS otomatis, PWA support', false, false)}
          ${this._menuItem('◈', 'Netlify', 'Alternatif, drag & drop deploy', false, false)}
          ${this._menuItem('📁', 'GitHub Pages', 'Gratis, cocok untuk static site', false, false)}
        </div>

        <div style="text-align:center;padding:8px 0">
          <p style="font-size:11px;color:var(--gray-300)">Kasir Mini v2.0 &bull; Data aman di perangkat Anda</p>
        </div>

        <div style="height:8px"></div>
      </div>
    `;
  },

  _menuItem(icon, title, sub, hasArrow = true, clickable = true) {
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid var(--gray-100);${clickable?'cursor:pointer;':''}">
        <div style="width:32px;height:32px;background:var(--gray-100);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">${icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13.5px;font-weight:600;color:var(--gray-800)">${title}</div>
          ${sub ? `<div style="font-size:11.5px;color:var(--gray-400);margin-top:1px">${sub}</div>` : ''}
        </div>
        ${hasArrow ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>` : ''}
      </div>
    `;
  },

  _bind(container) {
    const resetBtn = container.querySelector('#reset-demo-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        App.confirm('Reset semua data demo ke kondisi awal?', () => {
          MockDB.resetDemo();
          Toast.success('Data demo direset');
          App.navigate('dashboard');
        });
      });
    }
  },
};

window.AccountPage = AccountPage;
