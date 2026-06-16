/**
 * account.js v3 — Profile + Settings + Android Install
 * Layout: Profile card, App status card, Settings menu groups
 */
const AccountPage = {
  _view: 'main', // 'main' | 'edit-profile' | 'store-info' | 'about' | 'install-guide'

  render(container) {
    if (this._view === 'edit-profile') {
      container.innerHTML = this._editProfileHtml();
      this._bindEdit(container);
    } else if (this._view === 'store-info') {
      container.innerHTML = this._storeInfoHtml();
      this._bindStoreInfo(container);
    } else if (this._view === 'about') {
      container.innerHTML = this._aboutHtml();
    } else if (this._view === 'install-guide') {
      container.innerHTML = this._installGuideHtml();
      this._bindInstall(container);
    } else if (this._view === 'invoice') {
      container.innerHTML = this._invoiceHtml();
      this._bindInvoice(container);
    } else {
      container.innerHTML = this._html();
      this._bind(container);
    }
    App.updateBellBadge();
  },

  /* ============================================================
     MAIN VIEW
     ============================================================ */
  _html() {
    const profile = this._getProfile();
    const initials = this._initials(profile.name);
    const isDemoMode = typeof DEMO_MODE !== 'undefined' && DEMO_MODE;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-row">
          <h1>Akun & Pengaturan</h1>
          <button onclick="App.navigate('history')" class="back-btn" title="Histori Transaksi" style="border-radius:12px; position:relative;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="bell-badge" style="display:none;"></span>
          </button>
        </div>
      </div>

      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">

        <!-- Profile Card -->
        <div style="background:var(--white);border:1px solid rgba(196,197,217,0.25);border-radius:24px;padding:16px 18px;display:flex;align-items:center;gap:14px;box-shadow:var(--shadow-sm)">
          <div style="width:56px;height:56px;background:linear-gradient(135deg,var(--primary-100),var(--primary-200));border-radius:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(16,74,240,0.15);overflow:hidden">
            ${profile.photo
        ? `<img src="${profile.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:18px" alt="Foto Profil">`
        : `<span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:800;color:var(--primary-700)">${initials}</span>`
      }
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:700;color:var(--on-surface);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${Utils.escHtml(profile.name)}</div>
            <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.65;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${Utils.escHtml(profile.email || (isDemoMode ? 'Mode Demo Aktif' : 'Terhubung ke Google Sheets'))}</div>
          </div>
          <button onclick="AccountPage._go('edit-profile')" style="background:var(--primary-50);border:1.5px solid var(--primary-100);border-radius:14px;padding:7px 16px;font-size:13px;font-weight:700;color:var(--primary-600);cursor:pointer;flex-shrink:0;transition:all 0.18s;font-family:inherit" onmouseover="this.style.background='var(--primary-100)'" onmouseout="this.style.background='var(--primary-50)'">
            Edit
          </button>
        </div>

        <!-- App Status Banner (like "Premium Account") -->
        <div style="background:linear-gradient(135deg,#104af0 0%,#4648d4 100%);border-radius:20px;padding:16px 20px;display:flex;align-items:center;gap:14px;position:relative;overflow:hidden;box-shadow:0 6px 20px rgba(16,74,240,0.22);cursor:pointer" onclick="AccountPage._go('store-info')">
          <div style="position:absolute;top:-20%;right:-5%;width:100px;height:100px;background:rgba(255,255,255,0.06);border-radius:50%;filter:blur(20px)"></div>
          <div style="width:42px;height:42px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;backdrop-filter:blur(8px)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div style="flex:1;position:relative;z-index:1">
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:700;color:white">${Utils.escHtml(profile.storeName)}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.70);margin-top:1px">${isDemoMode ? 'Mode Demo — data tersimpan lokal' : 'Terhubung ke Google Sheets'}</div>
          </div>
          <div style="width:28px;height:28px;background:rgba(255,255,255,0.12);border-radius:50%;display:flex;align-items:center;justify-content:center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>

        <!-- ====== Account Settings Section ====== -->
        <div style="margin-top:2px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:var(--on-surface-variant);opacity:0.55;margin-bottom:8px;padding-left:2px">Pengaturan Akun</div>
          <div style="background:var(--white);border:1px solid rgba(196,197,217,0.22);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-xs)">
            ${this._menuRow('person', 'Informasi Toko', 'Nama, email, dan detail toko', "AccountPage._go('store-info')", false)}
            ${this._menuRow('invoice', 'Buat Invoice', 'Buat dan cetak invoice profesional', "AccountPage._go('invoice')", false, 'primary')}
            ${this._menuRow('lock_reset', 'Reset Data Demo', 'Kembalikan data ke kondisi awal', "AccountPage._resetData()", false, 'warning')}
            ${this._menuRow('sync', 'Hubungkan Google Sheets', 'Setup backend data produksi', "AccountPage._go('store-info')", false)}
            ${this._menuRow('log_out', 'Keluar (Logout)', 'Keluar dari sesi akun Anda', "AccountPage._logout()", true, 'warning')}
          </div>
        </div>

        <!-- ====== Install & Connectivity Section ====== -->
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:var(--on-surface-variant);opacity:0.55;margin-bottom:8px;padding-left:2px">Instalasi</div>
          <div style="background:var(--white);border:1px solid rgba(196,197,217,0.22);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-xs)">
            ${this._menuRow('android', 'Install di Android', 'Pasang aplikasi ke perangkat Android', "AccountPage._go('install-guide')", true, 'primary')}
            ${this._menuRow('download', 'Panduan PWA', 'Install tanpa Google Play Store', "AccountPage._go('install-guide')", false)}
          </div>
        </div>

        <!-- ====== General Settings Section ====== -->
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:var(--on-surface-variant);opacity:0.55;margin-bottom:8px;padding-left:2px">Lainnya</div>
          <div style="background:var(--white);border:1px solid rgba(196,197,217,0.22);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-xs)">
            ${this._menuRow('help', 'Bantuan & Dukungan', 'Panduan penggunaan aplikasi', "AccountPage._showHelp()", false)}
            ${this._menuRow('info', 'Tentang Aplikasi', 'Versi dan informasi aplikasi', "AccountPage._go('about')", false)}
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding:8px 0 4px">
          <p style="font-size:11px;color:var(--on-surface-variant);opacity:0.35;font-family:'Plus Jakarta Sans',sans-serif">LanggengMakmur Cashier v2.0 &bull; PWA</p>
        </div>

        <div style="height:8px"></div>
      </div>
    `;
  },

  /* -------- Menu Row Helper -------- */
  _menuRow(iconName, title, sub, onclick, isLast = false, accent = '') {
    const accentColor = accent === 'primary' ? 'var(--primary-600)'
      : accent === 'warning' ? 'var(--red-600)' : 'var(--on-surface)';
    const iconBg = accent === 'primary' ? 'rgba(16,74,240,0.08)'
      : accent === 'warning' ? 'rgba(186,26,26,0.07)' : 'var(--surface-container-low)';
    const iconColor = accent === 'primary' ? 'var(--primary-600)'
      : accent === 'warning' ? 'var(--red-600)' : 'var(--on-surface-variant)';

    const iconMap = {
      person: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
      invoice: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>`,
      lock_reset: `<path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`,
      sync: `<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>`,
      android: `<path d="M5 16a7 7 0 1114 0v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1z"/><line x1="12" y1="2" x2="12" y2="5"/><circle cx="8.5" cy="12" r="1"/><circle cx="15.5" cy="12" r="1"/><path d="M7 5.5L5 3"/><path d="M17 5.5l2-2.5"/>`,
      download: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
      help: `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
      info: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
      log_out: `<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />`,
    };

    return `
      <button onclick="${onclick}" style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:none;border:none;width:100%;cursor:pointer;text-align:left;${isLast ? '' : 'border-bottom:1px solid rgba(196,197,217,0.12);'}transition:background 0.15s" onmouseover="this.style.background='var(--surface-container-low)'" onmouseout="this.style.background='none'">
        <div style="width:36px;height:36px;background:${iconBg};border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">${iconMap[iconName] || ''}</svg>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:${accentColor}">${title}</div>
          <div style="font-size:11.5px;color:var(--on-surface-variant);opacity:0.6;margin-top:1px">${sub}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--outline-variant)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    `;
  },

  /* ============================================================
     EDIT PROFILE VIEW
     ============================================================ */
  _editProfileHtml() {
    const profile = this._getProfile();
    const parts = profile.name.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    return `
      <!-- Header with back -->
      <div style="background:linear-gradient(160deg,var(--primary-50) 0%,var(--white) 60%);padding:24px 20px 32px;position:relative">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
          <button onclick="AccountPage._go('main')" style="width:36px;height:36px;background:white;border:1.5px solid var(--outline-variant);border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-sm)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:700;color:var(--on-surface)">Edit Profil</h2>
        </div>

        <!-- Avatar (clickable for photo upload) -->
        <div style="display:flex;justify-content:center">
          <div style="position:relative;cursor:pointer" onclick="document.getElementById('ep-photo-input').click()" title="Ganti foto profil">
            <div id="ep-avatar" style="width:80px;height:80px;background:linear-gradient(135deg,var(--primary-100),var(--primary-200));border-radius:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(16,74,240,0.18);border:3px solid white;overflow:hidden">
              ${profile.photo
        ? `<img id="ep-avatar-img" src="${profile.photo}" style="width:100%;height:100%;object-fit:cover" alt="Foto Profil">`
        : `<span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:28px;font-weight:800;color:var(--primary-700)">${this._initials(profile.name)}</span>`
      }
            </div>
            <div style="position:absolute;bottom:-6px;right:-6px;width:28px;height:28px;background:var(--primary-600);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(16,74,240,0.3)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
          </div>
        </div>
        <div style="text-align:center;margin-top:6px;font-size:12px;color:var(--on-surface-variant);opacity:0.6">Ketuk untuk ganti foto</div>
        <!-- Hidden file input for photo upload -->
        <input type="file" id="ep-photo-input" accept="image/*" style="display:none">
      </div>

      <!-- Form -->
      <div style="padding:24px 20px;background:var(--white);margin-top:-12px;border-radius:24px 24px 0 0;min-height:calc(100dvh - 280px)">
        <form id="edit-profile-form" style="display:flex;flex-direction:column;gap:16px">

          <!-- Name row -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group">
              <label class="form-label" style="font-size:12px;color:var(--on-surface-variant);opacity:0.7">Nama Depan</label>
              <input type="text" id="ep-firstname" class="form-input" value="${Utils.escHtml(firstName)}" placeholder="Nama depan" autocomplete="given-name"/>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size:12px;color:var(--on-surface-variant);opacity:0.7">Nama Belakang</label>
              <input type="text" id="ep-lastname" class="form-input" value="${Utils.escHtml(lastName)}" placeholder="Nama belakang" autocomplete="family-name"/>
            </div>
          </div>

          <!-- Store name -->
          <div class="form-group">
            <label class="form-label" style="font-size:12px;color:var(--on-surface-variant);opacity:0.7">Nama Toko</label>
            <input type="text" id="ep-storename" class="form-input" value="${Utils.escHtml(profile.storeName)}" placeholder="Nama toko / warung" maxlength="50"/>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label" style="font-size:12px;color:var(--on-surface-variant);opacity:0.7">Email</label>
            <input type="email" id="ep-email" class="form-input" value="${Utils.escHtml(profile.email)}" placeholder="email@contoh.com" autocomplete="email"/>
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label class="form-label" style="font-size:12px;color:var(--on-surface-variant);opacity:0.7">No. HP (opsional)</label>
            <input type="tel" id="ep-phone" class="form-input" value="${Utils.escHtml(profile.phone || '')}" placeholder="08xxxxxxxxxx" autocomplete="tel"/>
          </div>

          <div style="margin-top:8px">
            <button type="submit" class="btn-cta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px"><path d="M5 13l4 4L19 7"/></svg>
              Update Profil
            </button>
          </div>

        </form>
      </div>
    `;
  },

  /* ============================================================
     STORE INFO / GOOGLE SHEETS CONNECTION VIEW
     ============================================================ */
  _storeInfoHtml() {
    const profile = this._getProfile();
    const isDemoMode = typeof DEMO_MODE !== 'undefined' && DEMO_MODE;

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div style="display:flex;align-items:center;gap:12px">
            <button onclick="AccountPage._go('main')" class="back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1>Informasi Toko</h1>
              <div class="subtitle">Konfigurasi & koneksi data</div>
            </div>
          </div>
        </div>
      </div>

      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">

        <!-- Status card -->
        <div style="background:${isDemoMode ? 'rgba(186,26,26,0.05)' : 'rgba(22,163,74,0.05)'};border:1.5px solid ${isDemoMode ? 'rgba(186,26,26,0.12)' : 'rgba(22,163,74,0.15)'};border-radius:20px;padding:16px;display:flex;gap:12px;align-items:flex-start">
          <div style="width:36px;height:36px;background:${isDemoMode ? 'rgba(186,26,26,0.08)' : 'rgba(22,163,74,0.10)'};border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${isDemoMode ? 'var(--red-600)' : 'var(--green-600)'}" stroke-width="2"><circle cx="12" cy="12" r="10"/>${isDemoMode ? '<line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : '<path d="M5 13l4 4L19 7"/>'}</svg>
          </div>
          <div>
            <div style="font-size:13px;font-weight:700;color:${isDemoMode ? 'var(--red-600)' : 'var(--green-600)'}">${isDemoMode ? 'Mode Demo Aktif' : 'Terhubung ke Google Sheets'}</div>
            <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.7;margin-top:2px;line-height:1.5">${isDemoMode ? 'Data tersimpan di perangkat (localStorage). Ubah DEMO_MODE = false di js/api.js untuk produksi.' : 'Semua data disimpan di Google Sheets melalui Apps Script.'}</div>
          </div>
        </div>

        <!-- Toko info -->
        <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--on-surface-variant);opacity:0.6;margin-bottom:2px">Detail Toko</div>
          ${[
        ['Nama Toko', profile.storeName],
        ['Pemilik', profile.name],
        ['Email', profile.email || '-'],
        ['No. HP', profile.phone || '-'],
      ].map(([l, v]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(196,197,217,0.12)">
              <span style="font-size:13px;color:var(--on-surface-variant);opacity:0.7">${l}</span>
              <span style="font-size:13px;font-weight:600;color:var(--on-surface)">${Utils.escHtml(v)}</span>
            </div>
          `).join('')}
        </div>

        <button onclick="AccountPage._go('edit-profile')" class="btn-cta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit Profil
        </button>

        ${isDemoMode ? `
          <!-- Google Sheets setup guide -->
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--on-surface-variant);opacity:0.6;margin-top:4px">Cara Connect ke Google Sheets</div>
          <div class="card" style="padding:16px">
            <ol style="font-size:13px;color:var(--on-surface-variant);line-height:2;padding-left:18px">
              <li>Buat spreadsheet baru di <strong>Google Sheets</strong></li>
              <li>Klik <strong>Extensions → Apps Script</strong></li>
              <li>Copy-paste isi file <code style="background:var(--surface-container);padding:1px 6px;border-radius:5px;font-size:11px">apps-script/Code.gs</code></li>
              <li>Klik <strong>Deploy → New Deployment → Web App</strong></li>
              <li>Execute as: <strong>Me</strong> | Access: <strong>Anyone</strong></li>
              <li>Copy URL → paste ke <code style="background:var(--surface-container);padding:1px 6px;border-radius:5px;font-size:11px">js/api.js</code> baris <code style="background:var(--surface-container);padding:1px 6px;border-radius:5px;font-size:11px">APPS_SCRIPT_URL</code></li>
              <li>Ubah <code style="background:var(--surface-container);padding:1px 6px;border-radius:5px;font-size:11px">DEMO_MODE = false</code></li>
            </ol>
          </div>
        ` : ''}

        <div style="height:8px"></div>
      </div>
    `;
  },

  /* ============================================================
     INSTALL GUIDE VIEW (Android / PWA)
     ============================================================ */
  _installGuideHtml() {
    const hasPWAPrompt = !!(window._pwaInstallPrompt);

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div style="display:flex;align-items:center;gap:12px">
            <button onclick="AccountPage._go('main')" class="back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1>Install di Android</h1>
              <div class="subtitle">Pasang seperti aplikasi native</div>
            </div>
          </div>
        </div>
      </div>

      <div style="padding:20px;display:flex;flex-direction:column;gap:16px">

        <!-- Hero install card -->
        <div style="background:linear-gradient(135deg,#104af0 0%,#4648d4 100%);border-radius:24px;padding:24px;color:white;text-align:center;position:relative;overflow:hidden;box-shadow:0 8px 28px rgba(16,74,240,0.25)">
          <div style="position:absolute;top:-20%;right:-10%;width:120px;height:120px;background:rgba(255,255,255,0.06);border-radius:50%;filter:blur(25px)"></div>
          <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M5 16a7 7 0 1114 0v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1z"/><line x1="12" y1="2" x2="12" y2="5"/><circle cx="8.5" cy="12" r="1" fill="white"/><circle cx="15.5" cy="12" r="1" fill="white"/><path d="M7 5.5L5 3"/><path d="M17 5.5l2-2.5"/></svg>
          </div>
          <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:800;margin-bottom:6px">LanggengMakmur Cashier</h3>
          <p style="font-size:13px;color:rgba(255,255,255,0.75);margin-bottom:20px;line-height:1.5">Install gratis sebagai PWA (Progressive Web App) — tidak perlu Google Play Store</p>
          <button id="btn-install-now" onclick="AccountPage._triggerInstall()" class="btn-cta" style="background:rgba(255,255,255,0.20);border:1.5px solid rgba(255,255,255,0.35);color:white;box-shadow:none;${hasPWAPrompt ? '' : 'opacity:0.7'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="width:18px;height:18px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${hasPWAPrompt ? 'Pasang Aplikasi Sekarang' : 'Buka di Chrome untuk Install'}
          </button>
        </div>

        <!-- Benefits -->
        <div class="card" style="padding:16px">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--on-surface-variant);opacity:0.6;margin-bottom:12px">Keuntungan Install PWA</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${[
        ['bolt', 'Lebih Cepat', 'Akses langsung dari layar utama tanpa buka browser'],
        ['wifi_off', 'Bisa Offline', 'Tetap bisa digunakan walau tanpa internet'],
        ['notifications', 'Pengalaman Native', 'Tampil full-screen seperti aplikasi asli'],
        ['storage', 'Hemat Ruang', 'Ukuran jauh lebih kecil dari aplikasi biasa'],
      ].map(([ic, t, d]) => `
              <div style="display:flex;gap:12px;align-items:flex-start">
                <div style="width:32px;height:32px;background:rgba(16,74,240,0.08);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2">${this._iconPath(ic)}</svg>
                </div>
                <div>
                  <div style="font-size:13px;font-weight:700;color:var(--on-surface)">${t}</div>
                  <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.65;margin-top:1px">${d}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Manual Install Steps -->
        <div class="card" style="padding:16px">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--on-surface-variant);opacity:0.6;margin-bottom:12px">Cara Install Manual (Chrome Android)</div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${[
        ['1', 'Buka di Chrome', 'Pastikan aplikasi dibuka menggunakan browser Google Chrome'],
        ['2', 'Ketuk ⋮ (Menu)', 'Klik titik tiga di pojok kanan atas browser Chrome'],
        ['3', 'Pilih "Add to Home Screen"', 'Atau "Install App" / "Tambahkan ke Layar Utama"'],
        ['4', 'Konfirmasi Install', 'Ketuk "Add" atau "Pasang" pada dialog yang muncul'],
        ['5', 'Selesai!', 'Ikon aplikasi muncul di layar utama Android Anda'],
      ].map(([num, t, d]) => `
              <div style="display:flex;gap:12px;align-items:flex-start">
                <div style="width:28px;height:28px;background:var(--primary-600);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">
                  <span style="font-size:12px;font-weight:800;color:white">${num}</span>
                </div>
                <div>
                  <div style="font-size:13px;font-weight:700;color:var(--on-surface)">${t}</div>
                  <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.65;margin-top:1px">${d}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div id="install-status" style="display:none;background:rgba(22,163,74,0.07);border:1.5px solid rgba(22,163,74,0.15);border-radius:16px;padding:14px;text-align:center">
          <div style="font-size:13px;font-weight:700;color:var(--green-600)">Aplikasi berhasil diinstall!</div>
          <div style="font-size:12px;color:var(--on-surface-variant);margin-top:3px">Cek layar utama perangkat Anda</div>
        </div>

        <div style="height:8px"></div>
      </div>
    `;
  },

  /* ============================================================
     ABOUT VIEW
     ============================================================ */
  _aboutHtml() {
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div style="display:flex;align-items:center;gap:12px">
            <button onclick="AccountPage._go('main')" class="back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h1>Tentang Aplikasi</h1>
          </div>
        </div>
      </div>

      <div style="padding:24px 20px;display:flex;flex-direction:column;align-items:center;gap:20px">

        <!-- App Logo: tampilkan foto profil jika ada, fallback ke ikon SVG -->
        ${(() => {
        const p = this._getProfile(); return p.photo
          ? `<div style="width:90px;height:90px;border-radius:28px;overflow:hidden;box-shadow:0 8px 24px rgba(16,74,240,0.25);border:3px solid white"><img src="${p.photo}" style="width:100%;height:100%;object-fit:cover" alt="Foto Profil"></div>`
          : `<div style="width:80px;height:80px;background:linear-gradient(135deg,var(--primary),var(--primary-700));border-radius:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(16,74,240,0.25)"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`;
      })()}
        <div style="text-align:center">
          <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:22px;font-weight:800;color:var(--on-surface)">LanggengMakmur Cashier</h2>
          <p style="font-size:13px;color:var(--on-surface-variant);opacity:0.65;margin-top:4px">Versi 2.0.0 &bull; PWA</p>
        </div>

        <div class="card" style="padding:0;width:100%">
          ${[
        ['Versi Aplikasi', '2.0.0'],
        ['Tipe', 'Progressive Web App (PWA)'],
        ['Backend', 'Google Apps Script + Sheets'],
        ['Bahasa', 'Vanilla JavaScript'],
        ['Dibuat Oleh', 'Haidar Rafi Suka Coding'],
      ].map(([l, v], i, a) => `
            <div style="display:flex;justify-content:space-between;padding:13px 16px;${i < a.length - 1 ? 'border-bottom:1px solid rgba(196,197,217,0.12)' : ''}">
              <span style="font-size:13px;color:var(--on-surface-variant);opacity:0.7">${l}</span>
              <span style="font-size:13px;font-weight:600;color:var(--on-surface)">${v}</span>
            </div>
          `).join('')}
        </div>

        <p style="font-size:12px;color:var(--on-surface-variant);opacity:0.45;text-align:center;line-height:1.7">
          Aplikasi kasir sederhana untuk pencatatan<br>keuangan harian warung dan UMKM.
        </p>

        <div style="height:16px"></div>
      </div>
    `;
  },

  /* ============================================================
     BINDINGS
     ============================================================ */
  _bind(container) {
    // nothing extra needed — all via onclick
  },

  _bindEdit(container) {
    // Live avatar update (initials only when no photo)
    const fnInput = container.querySelector('#ep-firstname');
    const lnInput = container.querySelector('#ep-lastname');
    const avatarEl = container.querySelector('#ep-avatar');

    const updateAvatar = () => {
      const avatarImg = avatarEl.querySelector('img');
      if (avatarImg) return; // foto sudah ada, jangan update inisial
      const fn = fnInput.value.trim();
      const ln = lnInput.value.trim();
      const full = (fn + ' ' + ln).trim() || 'U';
      const span = avatarEl.querySelector('span');
      if (span) span.textContent = this._initials(full);
    };

    fnInput?.addEventListener('input', updateAvatar);
    lnInput?.addEventListener('input', updateAvatar);
    setTimeout(() => fnInput?.focus(), 100);

    // Photo upload handler
    const photoInput = container.querySelector('#ep-photo-input');
    photoInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        Toast.warning('Foto terlalu besar. Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        // Update preview avatar
        avatarEl.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover" alt="Foto Profil">`;
        // Store temporarily on the input element
        photoInput.dataset.photo = base64;
        Toast.success('Foto dipilih. Klik "Update Profil" untuk menyimpan.');
      };
      reader.readAsDataURL(file);
    });

    container.querySelector('#edit-profile-form').addEventListener('submit', e => {
      e.preventDefault();
      const fn = container.querySelector('#ep-firstname').value.trim();
      const ln = container.querySelector('#ep-lastname').value.trim();
      const name = (fn + ' ' + ln).trim();
      const store = container.querySelector('#ep-storename').value.trim();
      const email = container.querySelector('#ep-email').value.trim();
      const phone = container.querySelector('#ep-phone').value.trim();

      if (!name) { Toast.warning('Nama wajib diisi'); return; }

      const photoData = photoInput?.dataset.photo || null;
      const saveData = { name, storeName: store || name + ' Store', email, phone };
      if (photoData) saveData.photo = photoData;

      this._saveProfile(saveData);
      Toast.success('Profil berhasil diperbarui');
      this._go('main');
    });
  },

  _bindStoreInfo(container) {
    // no extra bindings
  },

  _bindInstall(container) {
    // listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      const statusEl = container.querySelector('#install-status');
      if (statusEl) statusEl.style.display = 'block';
      Toast.success('Aplikasi berhasil diinstall di perangkat!');
    }, { once: true });
  },

  /* ============================================================
     HELPERS
     ============================================================ */
  _go(view) {
    this._view = view;
    const container = document.getElementById('page-container');
    if (container) this.render(container);
  },

  _initials(name) {
    const parts = (name || 'U').trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  },

  _getProfile() {
    const saved = JSON.parse(localStorage.getItem('lm_profile') || '{}');
    return {
      name: saved.name || 'Pemilik Toko',
      storeName: saved.storeName || 'LanggengMakmur',
      email: saved.email || '',
      phone: saved.phone || '',
      photo: saved.photo || null,
    };
  },

  _saveProfile(data) {
    const existing = JSON.parse(localStorage.getItem('lm_profile') || '{}');
    localStorage.setItem('lm_profile', JSON.stringify({ ...existing, ...data }));
  },

  _resetData() {
    App.confirm('Reset semua data demo ke kondisi awal? Semua transaksi dan kasbon akan dihapus.', () => {
      if (typeof MockDB !== 'undefined') MockDB.resetDemo();
      Toast.success('Data demo berhasil direset');
      App.navigate('dashboard');
    });
  },

  _logout() {
    App.confirm('Apakah Anda yakin ingin keluar dari aplikasi?', () => {
      localStorage.removeItem('lm_user');
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('lm_profile');
      location.reload();
    }, null, 'Keluar');
  },

  _showHelp() {
    const items = [
      {
        color: 'rgba(16,74,240,0.08)', stroke: 'var(--primary-600)',
        icon: '<path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="10"/>',
        title: 'Cara Tambah Transaksi',
        desc: 'Ketuk tombol "+" biru di tengah navbar, pilih "Uang Masuk" atau "Uang Keluar", isi nominalnya, lalu simpan.'
      },
      {
        color: 'rgba(16,74,240,0.08)', stroke: 'var(--primary-600)',
        icon: '<path d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z"/>',
        title: 'Cara Tambah Kasbon',
        desc: 'Ketuk "+" biru → pilih "Kasbon", atau buka tab Kasbon → ketuk tombol "+ Kasbon" → isi nama pelanggan dan jumlah.'
      },
      {
        color: 'rgba(22,163,74,0.08)', stroke: 'var(--green-600)',
        icon: '<path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        title: 'Cara Catat Pembayaran Kasbon',
        desc: 'Buka Kasbon → ketuk kartu pelanggan → "Catat Pembayaran" → isi jumlah yang dibayar.'
      },
      {
        color: 'rgba(70,72,212,0.08)', stroke: '#4648d4',
        icon: '<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
        title: 'Cara Lihat Laporan',
        desc: 'Buka tab "Stats" untuk melihat ringkasan harian/mingguan/bulanan dan unduh laporan Excel.'
      },
      {
        color: 'rgba(186,26,26,0.07)', stroke: 'var(--red-600)',
        icon: '<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>',
        title: 'Hapus Transaksi',
        desc: 'Buka Riwayat → ketuk ikon hapus di sebelah kanan transaksi yang ingin dihapus.'
      },
    ];

    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <h2>Bantuan &amp; Dukungan</h2>
        <button class="modal-close" onclick="App.closeModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${items.map(item => `
          <div style="background:var(--surface-container-low);border-radius:16px;padding:14px;display:flex;gap:14px;align-items:flex-start">
            <div style="width:38px;height:38px;background:${item.color};border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${item.stroke}" stroke-width="2">${item.icon}</svg>
            </div>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--on-surface);margin-bottom:3px">${item.title}</div>
              <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.75;line-height:1.5">${item.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    App.openModal(html);
  },

  _triggerInstall() {
    const prompt = window._pwaInstallPrompt;
    if (prompt) {
      prompt.prompt();
      prompt.userChoice.then(result => {
        if (result.outcome === 'accepted') {
          Toast.success('Aplikasi sedang dipasang!');
          window._pwaInstallPrompt = null;
        } else {
          Toast.info('Install dibatalkan. Kamu bisa install kapan saja.');
        }
      });
    } else {
      Toast.info('Buka halaman ini di Chrome Android, lalu ketuk ⋮ → "Add to Home Screen"');
    }
  },

  _iconPath(name) {
    return {
      bolt: `<circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 16 12"/>`,
      wifi_off: `<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>`,
      notifications: `<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>`,
      storage: `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>`,
    }[name] || '';
  },

  _invoiceHtml() {
    const profile = this._getProfile();
    const today = new Date().toISOString().slice(0, 10);
    const fourteenDaysLater = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().slice(0, 10);
    })();
    const randNum = String(Math.floor(Math.random() * 90000) + 10000);
    const invoiceNumDefault = `#INV/2026/${randNum}`;

    return `
      <!-- Header with back -->
      <div style="background:linear-gradient(160deg,var(--primary-50) 0%,var(--white) 60%);padding:24px 20px 24px;position:relative">
        <div style="display:flex;align-items:center;gap:12px">
          <button onclick="AccountPage._go('main')" style="width:36px;height:36px;background:white;border:1.5px solid var(--outline-variant);border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-sm)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:700;color:var(--on-surface)">Buat Invoice</h2>
        </div>
      </div>

      <div style="padding: 0 20px 40px; display:flex; flex-direction:column; gap:20px;">
        <form id="invoice-generator-form" style="display:flex; flex-direction:column; gap:20px;">
          
          <!-- Pengirim (Profil Anda) -->
          <div class="card" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--primary-600); margin-bottom:4px;">Profil Anda (Pengirim)</div>
            <div class="form-group">
              <label class="form-label">Nama Pengirim / Toko <span class="required">*</span></label>
              <input type="text" id="inv-sender-name" class="form-input" value="${Utils.escHtml(profile.name)} - @${Utils.escHtml(profile.storeName.toLowerCase())}" required placeholder="Contoh: Andre The Guy - @andreqve" />
            </div>
            <div class="form-group">
              <label class="form-label">Deskripsi / Jabatan <span class="required">*</span></label>
              <input type="text" id="inv-sender-sub" class="form-input" value="Digital Creator" required placeholder="Contoh: Digital Creator" />
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Phone <span class="required">*</span></label>
                <input type="text" id="inv-sender-phone" class="form-input" value="${Utils.escHtml(profile.phone || '081234567890')}" required placeholder="Contoh: 081234567890" />
              </div>
              <div class="form-group">
                <label class="form-label">Email <span class="required">*</span></label>
                <input type="email" id="inv-sender-email" class="form-input" value="${Utils.escHtml(profile.email || 'hi@yourdomain.com')}" required placeholder="Contoh: hi@yourdomain.com" />
              </div>
            </div>
          </div>

          <!-- Penerima & Meta -->
          <div class="card" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--primary-600); margin-bottom:4px;">Detail Invoice & Penerima</div>
            
            <div class="form-group">
              <label class="form-label">Nomor Invoice <span class="required">*</span></label>
              <input type="text" id="inv-number" class="form-input" value="${invoiceNumDefault}" required placeholder="Contoh: #INV/XXX/XXX" />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Tanggal Invoice <span class="required">*</span></label>
                <input type="date" id="inv-date" class="form-input" value="${today}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Jatuh Tempo <span class="required">*</span></label>
                <input type="date" id="inv-due-date" class="form-input" value="${fourteenDaysLater}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nama Perusahaan / Klien <span class="required">*</span></label>
              <input type="text" id="inv-client-name" class="form-input" value="Company Name" required placeholder="Nama Klien" />
            </div>

            <div class="form-group">
              <label class="form-label">Alamat Lengkap Klien <span class="required">*</span></label>
              <textarea id="inv-client-address" class="form-input" style="height:80px; padding:10px; font-family:inherit; resize:none;" required placeholder="Alamat lengkap...">Company detail address, Jl. Sini Senang Sana Senang,&#10;Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11470</textarea>
            </div>
          </div>

          <!-- Items Table -->
          <div class="card" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--primary-600);">Daftar Barang (Items)</div>
              <button type="button" id="add-invoice-item" class="btn btn-outline btn-sm" style="margin:0; border-radius:10px; font-size:12px; padding:6px 12px;">+ Tambah Barang</button>
            </div>
            
            <div id="invoice-items-list" style="display:flex; flex-direction:column; gap:10px;">
              <!-- Dynamic Rows populated in bind -->
            </div>

            <!-- Totals breakdown -->
            <div style="border-top:1.5px dashed var(--outline-variant); padding-top:12px; margin-top:8px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; color:var(--on-surface-variant);">
                <span>Sub Total:</span>
                <span id="invoice-subtotal-text" style="font-weight:700; color:var(--on-surface);">Rp 0</span>
              </div>
              <div class="form-group" style="margin: 0; max-width: 200px; align-self: flex-end; width:100%;">
                <label class="form-label" style="font-size:11px;">Deduction (Potongan)</label>
                <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl); overflow:hidden;">
                  <span style="padding:0 8px;font-weight:600;color:var(--outline);font-size:12px;">Rp</span>
                  <input type="text" id="invoice-deduction" style="flex:1;border:none;background:transparent;height:38px;font-size:12px;font-weight:700;outline:none;font-family:inherit;color:var(--on-surface); text-align:right;" placeholder="0" value="0" />
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:15px; font-weight:800; border-top:1px solid rgba(196,197,217,0.2); padding-top:8px;">
                <span>Grand Total:</span>
                <span id="invoice-grandtotal-text" style="color:var(--green-600);">Rp 0</span>
              </div>
            </div>
          </div>

          <!-- Payment details & Notes -->
          <div class="card" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--primary-600); margin-bottom:4px;">Metode Pembayaran & Catatan</div>
            <div class="form-group">
              <label class="form-label">Bank Penerima <span class="required">*</span></label>
              <input type="text" id="inv-bank-name" class="form-input" value="Bank Central Asia" required />
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Nomor Rekening <span class="required">*</span></label>
                <input type="text" id="inv-acc-number" class="form-input" value="0123121121" required />
              </div>
              <div class="form-group">
                <label class="form-label">Atas Nama Rekening <span class="required">*</span></label>
                <input type="text" id="inv-acc-name" class="form-input" value="${Utils.escHtml(profile.name.split(' - ')[0])}" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Catatan Tambahan (Notes)</label>
              <textarea id="inv-notes" class="form-input" style="height:60px; padding:10px; font-family:inherit; resize:none;">Harap lakukan pembayaran sebelum tanggal jatuh tempo.</textarea>
            </div>
          </div>

          <!-- Tanda Tangan Canvas -->
          <div class="card" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--primary-600);">Prepared by (Tanda Tangan)</div>
              <button type="button" id="clear-signature" class="btn btn-ghost btn-sm" style="margin:0; color:var(--red-600); font-size:12px; padding:4px 10px;">Hapus</button>
            </div>
            <div style="display:flex; justify-content:center; margin-top:4px;">
              <canvas id="signature-canvas" width="320" height="160" style="border: 1.5px dashed var(--outline-variant); border-radius: 16px; cursor: crosshair; background: var(--surface-container-lowest); max-width: 100%; box-shadow: var(--shadow-xs);"></canvas>
            </div>
            <p style="font-size:11px; color:var(--on-surface-variant); opacity:0.6; text-align:center; margin:2px 0 0 0;">Coret atau gambar tanda tangan Anda di atas area ini</p>
          </div>

          <!-- Submit Aksi -->
          <div style="margin-top:8px;">
            <button type="submit" class="btn-cta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Cetak &amp; Unduh Invoice
            </button>
            <button type="button" onclick="AccountPage._go('main')" class="btn btn-ghost btn-full" style="margin-top:4px;">Batal</button>
          </div>

        </form>
      </div>
    `;
  },

  _bindInvoice(container) {
    const canvas = container.querySelector('#signature-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDraw = (e) => {
      drawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
      if (e.cancelable) e.preventDefault();
    };

    const draw = (e) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
      if (e.cancelable) e.preventDefault();
    };

    const stopDraw = () => {
      drawing = false;
    };

    // Mouse events
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    // Touch events
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    // Clear signature button
    const clearBtn = container.querySelector('#clear-signature');
    clearBtn?.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Dynamic item list logic
    const itemsContainer = container.querySelector('#invoice-items-list');
    const addItemBtn = container.querySelector('#add-invoice-item');

    const recalculateTotals = () => {
      let subtotal = 0;
      container.querySelectorAll('.invoice-item-row').forEach(row => {
        const qty = parseInt(row.querySelector('.item-qty').value || 0, 10);
        const rate = parseInt(row.querySelector('.item-rate').dataset.rawValue || row.querySelector('.item-rate').value.replace(/[^0-9]/g, '') || 0, 10);
        const rowTotal = qty * rate;
        row.querySelector('.item-total-text').textContent = Utils.formatRupiah(rowTotal);
        subtotal += rowTotal;
      });

      const deduction = parseInt(container.querySelector('#invoice-deduction').dataset.rawValue || container.querySelector('#invoice-deduction').value.replace(/[^0-9]/g, '') || 0, 10);
      const grandtotal = Math.max(0, subtotal - deduction);

      container.querySelector('#invoice-subtotal-text').textContent = Utils.formatRupiah(subtotal);
      container.querySelector('#invoice-grandtotal-text').textContent = Utils.formatRupiah(grandtotal);
    };

    const createItemRow = (name = '', qty = 1, rate = 0) => {
      const row = document.createElement('div');
      row.className = 'invoice-item-row';
      row.style = 'display:grid; grid-template-columns: 2fr 1fr 1.5fr 1fr 40px; gap:8px; align-items:center; border-bottom:1px solid rgba(196,197,217,0.12); padding-bottom:8px;';
      row.innerHTML = `
        <input type="text" class="form-input item-name" placeholder="Barang" value="${Utils.escHtml(name)}" required />
        <input type="number" class="form-input item-qty" placeholder="Qty" value="${qty}" min="1" required style="padding:8px 6px; text-align:center;" />
        <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl); overflow:hidden;">
          <span style="padding:0 6px;font-weight:600;color:var(--outline);font-size:12px;">Rp</span>
          <input type="text" class="item-rate" style="flex:1;border:none;background:transparent;height:38px;font-size:12px;font-weight:700;outline:none;font-family:inherit;color:var(--on-surface);width:100%;" placeholder="0" value="${rate.toLocaleString('id-ID')}" data-raw-value="${rate}" required />
        </div>
        <div class="item-total-text" style="font-size:12.5px; font-weight:700; color:var(--on-surface); text-align:right;">Rp 0</div>
        <button type="button" class="btn-delete-row" style="background:none; border:none; color:var(--red-600); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
        </button>
      `;

      const qtyInput = row.querySelector('.item-qty');
      const rateInput = row.querySelector('.item-rate');

      qtyInput.addEventListener('input', recalculateTotals);
      rateInput.addEventListener('input', () => {
        Utils.formatInputRupiah(rateInput);
        recalculateTotals();
      });

      row.querySelector('.btn-delete-row').addEventListener('click', () => {
        row.remove();
        recalculateTotals();
      });

      itemsContainer.appendChild(row);
      recalculateTotals();
    };

    // Prefill 3 sample items matching the screenshot
    createItemRow('Items 1', 1, 150000);
    createItemRow('Items 2', 2, 250000);
    createItemRow('Items 3', 3, 350000);

    addItemBtn.addEventListener('click', () => {
      createItemRow('', 1, 0);
    });

    const deductionInput = container.querySelector('#invoice-deduction');
    deductionInput?.addEventListener('input', () => {
      Utils.formatInputRupiah(deductionInput);
      recalculateTotals();
    });

    container.querySelector('#invoice-generator-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const profileInfo = {
        name: container.querySelector('#inv-sender-name').value.trim(),
        subtitle: container.querySelector('#inv-sender-sub').value.trim(),
        phone: container.querySelector('#inv-sender-phone').value.trim(),
        email: container.querySelector('#inv-sender-email').value.trim()
      };

      const meta = {
        number: container.querySelector('#inv-number').value.trim(),
        date: container.querySelector('#inv-date').value,
        dueDate: container.querySelector('#inv-due-date').value
      };

      const client = {
        name: container.querySelector('#inv-client-name').value.trim(),
        address: container.querySelector('#inv-client-address').value.trim()
      };

      const payment = {
        bankName: container.querySelector('#inv-bank-name').value.trim(),
        accNumber: container.querySelector('#inv-acc-number').value.trim(),
        accName: container.querySelector('#inv-acc-name').value.trim(),
        notes: container.querySelector('#inv-notes').value.trim()
      };

      const items = [];
      container.querySelectorAll('.invoice-item-row').forEach(row => {
        const name = row.querySelector('.item-name').value.trim();
        const qty = parseInt(row.querySelector('.item-qty').value || 0, 10);
        const rate = parseInt(row.querySelector('.item-rate').dataset.rawValue || row.querySelector('.item-rate').value.replace(/[^0-9]/g, '') || 0, 10);
        if (name && qty > 0) {
          items.push({ name, qty, rate, total: qty * rate });
        }
      });

      if (items.length === 0) {
        Toast.warning('Tambahkan minimal 1 barang');
        return;
      }

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const deduction = parseInt(deductionInput.dataset.rawValue || deductionInput.value.replace(/[^0-9]/g, '') || 0, 10);
      const grandtotal = Math.max(0, subtotal - deduction);

      const data = {
        profile: profileInfo,
        meta,
        client,
        payment,
        items,
        subtotal,
        deduction,
        grandtotal
      };

      // Get signature data URL
      let signatureDataUrl = '';
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() !== blank.toDataURL()) {
        signatureDataUrl = canvas.toDataURL();
      }

      this._printInvoice(data, signatureDataUrl);
    });
  },

  _printInvoice(data, signatureDataUrl) {
    const style = document.createElement('style');
    style.id = 'invoice-print-styles';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #invoice-print-container, #invoice-print-container * {
          visibility: visible;
        }
        #invoice-print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
          color: black;
          padding: 0;
          margin: 0;
        }
        @page {
          size: A4;
          margin: 20mm;
        }
      }
    `;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.id = 'invoice-print-container';
    div.innerHTML = this._generateInvoicePrintHtml(data, signatureDataUrl);
    document.body.appendChild(div);

    window.print();

    setTimeout(() => {
      style.remove();
      div.remove();
    }, 500);
  },

  _generateInvoicePrintHtml(data, signatureDataUrl) {
    const formattedDate = (dStr) => {
      if (!dStr) return '';
      const date = new Date(dStr);
      if (isNaN(date.getTime())) return dStr;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13.5px;">${Utils.escHtml(item.name)}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 13.5px;">${item.qty}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13.5px;">${Utils.formatRupiah(item.rate)}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13.5px; font-weight: 600;">${Utils.formatRupiah(item.total)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; background: white; box-sizing: border-box;">
        
        <!-- Header Row -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #111827; font-family: 'Plus Jakarta Sans', sans-serif;">${Utils.escHtml(data.profile.name)}</h1>
            <p style="font-size: 13px; color: #4b5563; margin: 4px 0 16px 0;">${Utils.escHtml(data.profile.subtitle)}</p>
            <table style="font-size: 13px; color: #1f2937; border-collapse: collapse;">
              <tr>
                <td style="padding: 2px 8px 2px 0; color: #4b5563; width: 60px;">Phone</td>
                <td style="padding: 2px 4px;">:</td>
                <td style="padding: 2px 0;">${Utils.escHtml(data.profile.phone)}</td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0; color: #4b5563;">Email</td>
                <td style="padding: 2px 4px;">:</td>
                <td style="padding: 2px 0;">${Utils.escHtml(data.profile.email)}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 40px; font-weight: 900; margin: 0; color: #111827; letter-spacing: -0.03em;">INVOICE</h2>
            <p style="font-size: 15px; font-weight: 600; color: #4b5563; margin: 12px 0 0 0;">${Utils.escHtml(data.meta.number)}</p>
          </div>
        </div>

        <hr style="border: 0; border-top: 1.5px solid #e5e7eb; margin: 24px 0;" />

        <!-- Bill To & Meta Row -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="max-width: 50%;">
            <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #4b5563; margin: 0 0 8px 0; letter-spacing: 0.05em;">Bill to:</p>
            <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 6px 0; color: #111827;">${Utils.escHtml(data.client.name)}</h3>
            <p style="font-size: 13px; color: #4b5563; margin: 0; line-height: 1.5; white-space: pre-wrap;">${Utils.escHtml(data.client.address)}</p>
          </div>
          <div style="text-align: right; min-width: 250px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
              <tr>
                <td style="padding: 4px 0; text-align: left; color: #4b5563;">Date:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 500;">${formattedDate(data.meta.date)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; text-align: left; color: #4b5563;">Due date:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 500;">${formattedDate(data.meta.dueDate)}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 12px 0 4px 0; text-align: left; font-weight: 700; font-size: 14px;">Balance Due:</td>
                <td style="padding: 12px 0 4px 0; text-align: right; font-weight: 800; font-size: 16px; color: #111827;">${Utils.formatRupiah(data.grandtotal)}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #e5e7eb;">
              <th style="padding: 10px; text-align: left; font-size: 13px; font-weight: 700; color: #374151; width: 45%; border-top-left-radius: 4px; border-bottom-left-radius: 4px;">Items</th>
              <th style="padding: 10px; text-align: center; font-size: 13px; font-weight: 700; color: #374151; width: 15%;">Quantity</th>
              <th style="padding: 10px; text-align: right; font-size: 13px; font-weight: 700; color: #374151; width: 20%;">Rate</th>
              <th style="padding: 10px; text-align: right; font-size: 13px; font-weight: 700; color: #374151; width: 20%; border-top-right-radius: 4px; border-bottom-right-radius: 4px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Summary Totals Section -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <table style="width: 300px; border-collapse: collapse; font-size: 13.5px;">
            <tr>
              <td style="padding: 6px 0; text-align: left; color: #4b5563;">Sub Total</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600;">${Utils.formatRupiah(data.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; text-align: left; color: #4b5563;">Deduction</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #dc2626;">-${Utils.formatRupiah(data.deduction)}</td>
            </tr>
            <tr style="border-top: 1.5px solid #111827;">
              <td style="padding: 8px 0; text-align: left; font-weight: 700; font-size: 14px;">Grand Total</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 800; font-size: 16px; color: #111827;">${Utils.formatRupiah(data.grandtotal)}</td>
            </tr>
          </table>
        </div>

        <!-- Footer terms & Signature -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; page-break-inside: avoid;">
          <div>
            <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 8px 0; color: #111827;">Payment Terms</h4>
            <table style="font-size: 12.5px; color: #4b5563; border-collapse: collapse;">
              <tr>
                <td style="padding: 2px 8px 2px 0;">Paid to</td>
                <td style="padding: 2px 4px;">:</td>
                <td style="padding: 2px 0; font-weight: 500; color: #1f2937;">${Utils.escHtml(data.payment.accName)}</td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0;">Bank Name</td>
                <td style="padding: 2px 4px;">:</td>
                <td style="padding: 2px 0; font-weight: 500; color: #1f2937;">${Utils.escHtml(data.payment.bankName)}</td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0;">Acc. Number</td>
                <td style="padding: 2px 4px;">:</td>
                <td style="padding: 2px 0; font-weight: 500; color: #1f2937;">${Utils.escHtml(data.payment.accNumber)}</td>
              </tr>
            </table>
            ${data.payment.notes ? `
              <h4 style="font-size: 13px; font-weight: 700; margin: 16px 0 6px 0; color: #111827;">Notes</h4>
              <p style="font-size: 12px; color: #4b5563; margin: 0; white-space: pre-wrap; line-height: 1.5; max-width: 400px;">${Utils.escHtml(data.payment.notes)}</p>
            ` : ''}
          </div>
          
          <div style="text-align: center; min-width: 150px;">
            <p style="font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 10px 0;">Prepared by</p>
            <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
              ${signatureDataUrl ? `
                <img src="${signatureDataUrl}" style="max-height: 80px; max-width: 150px; object-fit: contain;" alt="Signature" />
              ` : `
                <div style="width: 100px; border-bottom: 1.5px dashed #d1d5db; height: 40px;"></div>
              `}
            </div>
            <p style="font-size: 13px; font-weight: 600; color: #1f2937; margin: 0; border-top: 1px solid #e5e7eb; padding-top: 6px;">${Utils.escHtml(data.profile.name.split(' - ')[0])}</p>
          </div>
        </div>

      </div>
    `;
  },
};

window.AccountPage = AccountPage;
