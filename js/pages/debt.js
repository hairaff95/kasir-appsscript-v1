/**
 * debt.js v3 — Material You / Bento Blue Design
 * Functions UNCHANGED — only HTML templates updated
 */
const DebtPage = {
  _filter: 'active',

  async render(container) {
    container.innerHTML = this._skeleton();
    try {
      const debts = await Api.getDebts();
      container.innerHTML = this._html(debts);
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><p>Gagal memuat: ${Utils.escHtml(e.message)}</p></div>`;
    }
  },

  _skeleton() {
    return `
      <div class="page-header">
        <div class="skeleton" style="height:20px;width:110px;margin-bottom:6px;border-radius:6px"></div>
        <div class="skeleton" style="height:12px;width:80px;border-radius:4px"></div>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <div class="skeleton" style="height:140px;border-radius:24px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="skeleton" style="height:90px;border-radius:20px"></div>
          <div class="skeleton" style="height:90px;border-radius:20px"></div>
        </div>
        <div class="skeleton" style="height:48px;border-radius:20px"></div>
        <div class="skeleton" style="height:44px;border-radius:16px"></div>
        ${[1,2,3].map(()=>`<div class="skeleton" style="height:120px;border-radius:20px"></div>`).join('')}
      </div>
    `;
  },

  _html(debts) {
    const f  = this._filter;
    const active  = debts.filter(d => d.status !== 'paid');
    const paid    = debts.filter(d => d.status === 'paid');
    const shown   = f === 'active' ? active : f === 'paid' ? paid : debts;
    const totalRem = active.reduce((s,d) => s + Number(d.amount_remaining || d.remaining || 0), 0);

    const listHtml = shown.length === 0
      ? `<div class="empty-state">
          <div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z"/></svg></div>
          <h3>${f === 'paid' ? 'Belum ada kasbon lunas' : 'Tidak ada kasbon aktif'}</h3>
          <p>Tap tombol "+ Kasbon" untuk menambah</p>
        </div>`
      : shown.map(d => this._debtCard(d)).join('');

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h1>Kasbon Pelanggan</h1>
            <div class="subtitle">${active.length} aktif &bull; Total ${Utils.formatRupiah(totalRem)}</div>
          </div>
          <button onclick="DebtPage._showAddModal()" class="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg>
            Kasbon
          </button>
        </div>
      </div>

      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">

        <!-- Hero Kasbon Card -->
        <div style="background:linear-gradient(135deg,#104af0 0%,#4648d4 100%);border-radius:24px;padding:22px;color:white;position:relative;overflow:hidden;box-shadow:0 8px 28px rgba(16,74,240,0.25)">
          <div style="position:absolute;top:-30%;right:-10%;width:160px;height:160px;background:rgba(255,255,255,0.07);border-radius:50%;filter:blur(30px)"></div>
          <div style="position:absolute;bottom:-25%;left:-5%;width:120px;height:120px;background:rgba(255,255,255,0.05);border-radius:50%;filter:blur(20px)"></div>
          <div style="position:relative;z-index:1">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.7);margin-bottom:6px">Total Kasbon Aktif</div>
                <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.02em">${Utils.formatRupiah(totalRem)}</div>
              </div>
              <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);border-radius:999px;padding:6px 12px;display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                ${active.length} aktif
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Action Bento Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <button class="bento-card" onclick="DebtPage._showAddModal()" style="border:1.5px solid rgba(16,74,240,0.12);text-align:left">
            <div class="bento-icon" style="background:rgba(16,74,240,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div style="font-size:14px;font-weight:700;color:var(--on-surface)">Tambah</div>
            <div style="font-size:11px;color:var(--on-surface-variant);opacity:0.7;margin-top:2px">Catat kasbon baru</div>
          </button>
          <div class="bento-card" style="background:rgba(186,26,26,0.04);border:1.5px solid rgba(186,26,26,0.10);text-align:left">
            <div class="bento-icon" style="background:rgba(186,26,26,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style="font-size:14px;font-weight:700;color:var(--red-600)">${active.filter(d=>d.status==='unpaid').length} Belum Bayar</div>
            <div style="font-size:11px;color:var(--red-600);opacity:0.7;margin-top:2px">Perlu perhatian</div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-bar-container">
          <svg class="search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" class="search-bar-input" placeholder="Cari nama pelanggan..." oninput="DebtPage._handleSearch(this.value)" autocomplete="off"/>
        </div>

        <!-- Pill Tab Filter -->
        <div class="pill-tab-container">
          <button class="pill-tab ${f==='active'?'active':''}" onclick="DebtPage._setFilter('active')">Belum Lunas</button>
          <button class="pill-tab ${f==='all'?'active':''}"    onclick="DebtPage._setFilter('all')">Semua</button>
          <button class="pill-tab ${f==='paid'?'active':''}"   onclick="DebtPage._setFilter('paid')">Lunas</button>
        </div>

        <!-- Debt List -->
        <div style="display:flex;flex-direction:column;gap:10px" id="debt-list">
          ${listHtml}
        </div>

        <div style="height:16px"></div>
      </div>
    `;
  },

  _debtCard(debt) {
    const total   = Number(debt.amount_total   || debt.initial_amount || 0);
    const paid    = Number(debt.amount_paid    || 0);
    const rem     = Number(debt.amount_remaining || debt.remaining || 0);
    const status  = debt.status || 'unpaid';
    const pct     = total > 0 ? Math.round((paid / total) * 100) : 0;

    // Avatar initials from name
    const nameParts = (debt.customer_name || '?').trim().split(' ');
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length-1][0]).toUpperCase()
      : nameParts[0].slice(0,2).toUpperCase();

    const badge = {
      unpaid:  `<span class="badge badge-red">Belum Lunas</span>`,
      partial: `<span class="badge badge-yellow" style="background:var(--amber-100);color:var(--amber-700)">Sebagian</span>`,
      paid:    `<span class="badge badge-green">Lunas</span>`,
    }[status] || `<span class="badge badge-gray">${status}</span>`;

    const debtId = debt.id;

    return `
      <div class="debt-card" onclick="DebtPage._showDetail('${debtId}')">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="debt-avatar">${initials}</div>
            <div>
              <div class="debt-name">${Utils.escHtml(debt.customer_name)}</div>
              <div class="debt-meta">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${Utils.formatDate(debt.debt_date || debt.date)}
              </div>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--on-surface-variant);opacity:0.6;margin-bottom:4px">Sisa Tagihan</div>
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;color:${status!=='paid'?'var(--red-600)':'var(--green-600)'}">
              ${Utils.formatRupiah(rem)}
            </div>
          </div>
        </div>

        <div style="margin-top:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:6px">
              ${badge}
              <span style="font-size:11px;color:var(--on-surface-variant);opacity:0.6">Progres Pelunasan</span>
            </div>
            <span style="font-size:12px;font-weight:700;color:var(--primary-600)">${pct}%</span>
          </div>
          <div class="debt-progress-bar">
            <div class="debt-progress-fill ${status==='paid'?'paid':''}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  },

  _handleSearch(query) {
    const cards = document.querySelectorAll('#debt-list .debt-card');
    const q = query.toLowerCase().trim();
    cards.forEach(card => {
      const nameEl = card.querySelector('.debt-name');
      const name = nameEl ? nameEl.textContent.toLowerCase() : '';
      card.style.display = (q === '' || name.includes(q)) ? '' : 'none';
    });
  },

  _setFilter(f) {
    this._filter = f;
    App.navigate('debt');
  },

  // ---- Add Debt Modal ----
  _showAddModal() {
    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <h2>Tambah Kasbon Baru</h2>
        <button class="modal-close" onclick="App.closeModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <form id="add-debt-form" style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">Nama Pelanggan <span class="required">*</span></label>
          <input type="text" id="debt-name" class="form-input" placeholder="Nama pelanggan" autocomplete="off" maxlength="60"/>
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex;align-items:center;justify-content:space-between">
            <span>Nomor HP Aktif</span>
            <span style="font-size:10px;font-weight:600;color:var(--on-surface-variant);opacity:0.6;background:var(--surface-container);padding:2px 7px;border-radius:6px">Opsional</span>
          </label>
          <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl)">
            <div style="padding:0 12px;display:flex;align-items:center;flex-shrink:0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--outline)" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.9 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.81 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l.98-.98a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </div>
            <input type="tel" id="debt-phone" inputmode="tel" style="flex:1;border:none;background:transparent;height:44px;font-size:14px;font-weight:500;outline:none;font-family:inherit;color:var(--on-surface)" placeholder="08xxxxxxxxxx" autocomplete="tel" maxlength="16"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Jumlah Kasbon <span class="required">*</span></label>
          <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl)">
            <span style="padding:0 12px;font-weight:600;color:var(--outline);font-size:15px;flex-shrink:0">Rp</span>
            <input type="text" id="debt-amount" inputmode="numeric" style="flex:1;border:none;background:transparent;height:44px;font-size:15px;font-weight:700;outline:none;font-family:inherit;color:var(--on-surface)" placeholder="0" autocomplete="off"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="debt-date">Tanggal</label>
          <input type="date" id="debt-date" class="form-input" value="${Utils.todayForInput()}"/>
        </div>
        <div class="form-group">
          <label class="form-label" for="debt-notes">Catatan</label>
          <textarea id="debt-notes" class="form-input" placeholder="Barang yang diambil, kapan bayar, dll" maxlength="150"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">
          <button type="button" onclick="App.closeModal()" class="btn btn-ghost">Batal</button>
          <button type="submit" class="btn-cta">Simpan</button>
        </div>
      </form>
    `;

    App.openModal(html);
    const modal     = document.getElementById('app-modal');
    const amtInput  = modal.querySelector('#debt-amount');

    amtInput.addEventListener('input', () => Utils.formatInputRupiah(amtInput));
    setTimeout(() => modal.querySelector('#debt-name').focus(), 100);

    modal.querySelector('#add-debt-form').addEventListener('submit', async e => {
      e.preventDefault();
      const name   = modal.querySelector('#debt-name').value.trim();
      const phone  = modal.querySelector('#debt-phone').value.trim();
      const amount = parseInt(amtInput.dataset.rawValue || 0);
      const date   = modal.querySelector('#debt-date').value;
      const notes  = modal.querySelector('#debt-notes').value.trim();

      if (!name)            { Toast.warning('Nama pelanggan wajib diisi'); return; }
      if (!amount || amount <= 0) { Toast.warning('Jumlah kasbon wajib diisi'); return; }

      try {
        await Api.addDebt({ customer_name: name, phone_number: phone || null, initial_amount: amount, amount_total: amount, debt_date: date, description: notes });
        App.closeModal();
        Toast.success(`✓ Kasbon ${name} berhasil ditambahkan`);
        DebtPage._filter = 'active';
        App.navigate('debt');
      } catch (err) {
        Toast.error('Gagal: ' + err.message);
      }
    });
  },

  // ---- Detail Modal ----
  async _showDetail(debtId) {
    const allDebts = await Api.getDebts();
    const debt     = allDebts.find(d => d.id === debtId);
    if (!debt) return;

    const payments = await Api.getDebtPayments(debtId);
    const total  = Number(debt.amount_total || debt.initial_amount || 0);
    const paid   = Number(debt.amount_paid || 0);
    const rem    = Number(debt.amount_remaining || debt.remaining || 0);
    const pct    = total > 0 ? Math.round((paid / total) * 100) : 0;
    const isActive = debt.status !== 'paid';

    const payListHtml = payments.length === 0
      ? `<p style="font-size:13px;color:var(--on-surface-variant);text-align:center;padding:12px 0">Belum ada pembayaran</p>`
      : payments.map(p => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(196,197,217,0.15)">
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--green-600)">+ ${Utils.formatRupiah(p.amount)}</div>
              <div style="font-size:11px;color:var(--on-surface-variant);opacity:0.6">${Utils.formatDate(p.payment_date || p.date)}</div>
            </div>
            <span class="badge badge-green">Dibayar</span>
          </div>
        `).join('');

    const badge = {
      unpaid:  `<span class="badge badge-red">Belum Lunas</span>`,
      partial: `<span class="badge badge-yellow" style="background:var(--amber-100);color:var(--amber-700)">Lunas Sebagian</span>`,
      paid:    `<span class="badge badge-green">Lunas</span>`,
    }[debt.status] || '';

    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <div>
          <h2>${Utils.escHtml(debt.customer_name)}</h2>
          <div style="font-size:12px;color:var(--on-surface-variant);opacity:0.6;font-weight:400;margin-top:2px;display:flex;align-items:center;gap:8px">
            <span>${Utils.formatDate(debt.debt_date || debt.date)}</span>
            ${debt.phone_number ? `
              <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(16,74,240,0.08);color:var(--primary-600);padding:2px 8px;border-radius:8px;font-weight:600;font-size:11px">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.9 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.81 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l.98-.98a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <a href="tel:${Utils.escHtml(debt.phone_number)}" style="color:inherit;text-decoration:none">${Utils.escHtml(debt.phone_number)}</a>
              </span>
            ` : ''}
          </div>
        </div>
        <button class="modal-close" onclick="App.closeModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Summary -->
      <div style="background:var(--surface-container-low);border:1px solid var(--outline-variant);border-radius:20px;padding:16px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          ${badge}
          ${debt.description ? `<span style="font-size:12px;color:var(--on-surface-variant);opacity:0.6;font-style:italic">${Utils.escHtml(debt.description)}</span>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">
          <div>
            <div style="font-size:10px;color:var(--on-surface-variant);opacity:0.6;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Total</div>
            <div style="font-size:13px;font-weight:700;color:var(--on-surface)">${Utils.formatRupiah(total)}</div>
          </div>
          <div>
            <div style="font-size:10px;color:var(--on-surface-variant);opacity:0.6;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Bayar</div>
            <div style="font-size:13px;font-weight:700;color:var(--green-600)">${Utils.formatRupiah(paid)}</div>
          </div>
          <div>
            <div style="font-size:10px;color:var(--on-surface-variant);opacity:0.6;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Sisa</div>
            <div style="font-size:13px;font-weight:700;color:${isActive?'var(--red-600)':'var(--green-600)'}">${Utils.formatRupiah(rem)}</div>
          </div>
        </div>
        <div class="debt-progress-bar" style="margin-top:12px">
          <div class="debt-progress-fill ${!isActive?'paid':''}" style="width:${pct}%"></div>
        </div>
        <div style="text-align:right;font-size:11px;color:var(--on-surface-variant);opacity:0.5;margin-top:3px">${pct}% terbayar</div>
      </div>

      <!-- Payment History -->
      <div style="margin-bottom:16px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--on-surface-variant);opacity:0.6;margin-bottom:8px">Riwayat Pembayaran</div>
        ${payListHtml}
      </div>

      <!-- Actions -->
      <div style="display:flex;flex-direction:column;gap:8px">
        ${isActive ? `
          <button onclick="DebtPage._showPayModal('${debtId}', ${rem})" class="btn-cta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Catat Pembayaran
          </button>
        ` : ''}
        <button onclick="DebtPage._confirmDelete('${debtId}', '${Utils.escHtml(debt.customer_name)}')" class="btn btn-ghost btn-full" style="color:var(--red-600)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Hapus Kasbon
        </button>
      </div>
    `;

    App.openModal(html);
  },

  // ---- Payment Modal ----
  _showPayModal(debtId, remaining) {
    const quickAmts = [10000, 20000, 50000, 100000].filter(v => v <= remaining);
    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <h2>Catat Pembayaran</h2>
        <button class="modal-close" onclick="App.closeModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <p style="font-size:13px;color:var(--on-surface-variant);margin-bottom:16px">
        Sisa tagihan: <strong style="color:var(--red-600)">${Utils.formatRupiah(remaining)}</strong>
      </p>
      <form id="pay-form" style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">Nominal Cepat</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${quickAmts.map(v=>`<button type="button" class="chip quick-chip" data-val="${v}">${Utils.formatRupiah(v)}</button>`).join('')}
            <button type="button" class="chip quick-chip" data-val="${remaining}" style="border-color:var(--green);color:var(--green)">Lunas Semua</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Jumlah Bayar <span class="required">*</span></label>
          <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl)">
            <span style="padding:0 12px;font-weight:600;color:var(--outline);font-size:15px;flex-shrink:0">Rp</span>
            <input type="text" id="pay-amount" inputmode="numeric" style="flex:1;border:none;background:transparent;height:44px;font-size:15px;font-weight:700;outline:none;font-family:inherit;color:var(--on-surface)" placeholder="0" autocomplete="off"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="pay-date">Tanggal</label>
          <input type="date" id="pay-date" class="form-input" value="${Utils.todayForInput()}"/>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">
          <button type="button" onclick="App.closeModal()" class="btn btn-ghost">Batal</button>
          <button type="submit" class="btn-cta" style="background:linear-gradient(135deg,var(--green),var(--green-600))">Simpan</button>
        </div>
      </form>
    `;

    App.openModal(html);
    const modal    = document.getElementById('app-modal');
    const payInput = modal.querySelector('#pay-amount');

    payInput.addEventListener('input', () => Utils.formatInputRupiah(payInput));
    setTimeout(() => payInput.focus(), 100);

    modal.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val);
        payInput.value = val.toLocaleString('id-ID');
        payInput.dataset.rawValue = val;
        modal.querySelectorAll('.quick-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    modal.querySelector('#pay-form').addEventListener('submit', async e => {
      e.preventDefault();
      const amount = parseInt(payInput.dataset.rawValue || 0);
      const date   = modal.querySelector('#pay-date').value;

      if (!amount || amount <= 0)   { Toast.warning('Masukkan jumlah pembayaran'); return; }
      if (amount > remaining)        { Toast.warning(`Melebihi sisa (${Utils.formatRupiah(remaining)})`); return; }

      try {
        await Api.addDebtPayment({ debt_id: debtId, amount, payment_date: date });
        App.closeModal();
        Toast.success('✓ Pembayaran berhasil dicatat!');
        App.navigate('debt');
      } catch (err) {
        Toast.error('Gagal: ' + err.message);
      }
    });
  },

  _confirmDelete(id, name) {
    App.confirm(`Hapus kasbon milik "${name}"? Semua riwayat pembayarannya juga akan dihapus.`, async () => {
      try {
        await Api.deleteDebt(id);
        App.closeModal();
        Toast.success(`Kasbon dihapus`);
        App.navigate('debt');
      } catch (err) {
        Toast.error('Gagal: ' + err.message);
      }
    });
  },
};

window.DebtPage = DebtPage;
