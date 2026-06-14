/**
 * debt.js v2 — Kasbon dengan badge merah/kuning/hijau
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
        <div class="skeleton" style="height:16px;width:100px;margin-bottom:4px"></div>
        <div class="skeleton" style="height:12px;width:70px"></div>
      </div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:10px">
        <div class="skeleton" style="height:36px;border-radius:9999px"></div>
        ${[1,2,3].map(()=>`<div class="skeleton" style="height:100px;border-radius:12px"></div>`).join('')}
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
            <div class="subtitle">${active.length} aktif &bull; Total Rp${Utils.formatRupiah(totalRem).replace('Rp ','')}</div>
          </div>
          <button onclick="DebtPage._showAddModal()" class="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg>
            Kasbon
          </button>
        </div>
      </div>

      <!-- Filter chips -->
      <div style="padding:12px 16px">
        <div style="display:flex;gap:6px">
          <button class="chip ${f==='active'?'active':''}" onclick="DebtPage._setFilter('active')">Belum Lunas</button>
          <button class="chip ${f==='all'?'active':''}"    onclick="DebtPage._setFilter('all')">Semua</button>
          <button class="chip ${f==='paid'?'active':''}"   onclick="DebtPage._setFilter('paid')">Lunas</button>
        </div>
      </div>

      <!-- Debt list -->
      <div style="padding:0 16px;display:flex;flex-direction:column;gap:8px">
        ${listHtml}
      </div>
      <div style="height:16px"></div>
    `;
  },

  _debtCard(debt) {
    const total   = Number(debt.amount_total   || debt.initial_amount || 0);
    const paid    = Number(debt.amount_paid    || 0);
    const rem     = Number(debt.amount_remaining || debt.remaining || 0);
    const status  = debt.status || 'unpaid';
    const pct     = total > 0 ? Math.round((paid / total) * 100) : 0;

    const badge = {
      unpaid:  `<span class="badge badge-red">Belum Lunas</span>`,
      partial: `<span class="badge badge-yellow">Lunas Sebagian</span>`,
      paid:    `<span class="badge badge-green">Lunas</span>`,
    }[status] || `<span class="badge badge-gray">${status}</span>`;

    const debtId = debt.id;

    return `
      <div class="debt-card" onclick="DebtPage._showDetail('${debtId}')">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
          <div>
            <div class="debt-name">${Utils.escHtml(debt.customer_name)}</div>
            <div class="debt-meta">${Utils.formatDate(debt.debt_date || debt.date)}</div>
          </div>
          ${badge}
        </div>

        <div class="debt-amounts">
          <div class="debt-amount-item">
            <div class="debt-amount-label">Total Kasbon</div>
            <div class="debt-amount-value" style="color:var(--gray-700)">${Utils.formatRupiah(total)}</div>
          </div>
          <div class="debt-amount-item">
            <div class="debt-amount-label">Sudah Bayar</div>
            <div class="debt-amount-value" style="color:var(--green)">${Utils.formatRupiah(paid)}</div>
          </div>
          <div class="debt-amount-item">
            <div class="debt-amount-label">Sisa Tagihan</div>
            <div class="debt-amount-value" style="color:${status!=='paid'?'var(--red)':'var(--green)'}">${Utils.formatRupiah(rem)}</div>
          </div>
        </div>

        <div class="debt-progress-bar" style="margin-top:10px">
          <div class="debt-progress-fill ${status==='paid'?'paid':''}" style="width:${pct}%"></div>
        </div>
        <div style="text-align:right;font-size:11px;color:var(--gray-400);margin-top:3px">${pct}% terbayar</div>
      </div>
    `;
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
          <label class="form-label">Jumlah Kasbon <span class="required">*</span></label>
          <div style="display:flex;align-items:center;background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius-md)">
            <span style="padding:0 12px;font-weight:600;color:var(--gray-400);font-size:15px;flex-shrink:0">Rp</span>
            <input type="text" id="debt-amount" inputmode="numeric" style="flex:1;border:none;background:transparent;height:44px;font-size:15px;font-weight:700;outline:none;font-family:inherit;color:var(--gray-900)" placeholder="0" autocomplete="off"/>
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
      const amount = parseInt(amtInput.dataset.rawValue || 0);
      const date   = modal.querySelector('#debt-date').value;
      const notes  = modal.querySelector('#debt-notes').value.trim();

      if (!name)            { Toast.warning('Nama pelanggan wajib diisi'); return; }
      if (!amount || amount <= 0) { Toast.warning('Jumlah kasbon wajib diisi'); return; }

      try {
        await Api.addDebt({ customer_name: name, initial_amount: amount, amount_total: amount, debt_date: date, description: notes });
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
      ? `<p style="font-size:13px;color:var(--gray-400);text-align:center;padding:12px 0">Belum ada pembayaran</p>`
      : payments.map(p => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100)">
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--green)">+ ${Utils.formatRupiah(p.amount)}</div>
              <div style="font-size:11px;color:var(--gray-400)">${Utils.formatDate(p.payment_date || p.date)}</div>
            </div>
            <span class="badge badge-green">Dibayar</span>
          </div>
        `).join('');

    const badge = {
      unpaid:  `<span class="badge badge-red">Belum Lunas</span>`,
      partial: `<span class="badge badge-yellow">Lunas Sebagian</span>`,
      paid:    `<span class="badge badge-green">Lunas</span>`,
    }[debt.status] || '';

    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <div>
          <h2>${Utils.escHtml(debt.customer_name)}</h2>
          <div style="font-size:12px;color:var(--gray-400);font-weight:400;margin-top:1px">${Utils.formatDate(debt.debt_date || debt.date)}</div>
        </div>
        <button class="modal-close" onclick="App.closeModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Summary -->
      <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:14px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          ${badge}
          ${debt.description ? `<span style="font-size:12px;color:var(--gray-400);font-style:italic">${Utils.escHtml(debt.description)}</span>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">
          <div>
            <div style="font-size:10px;color:var(--gray-400);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Total</div>
            <div style="font-size:13px;font-weight:700;color:var(--gray-700)">${Utils.formatRupiah(total)}</div>
          </div>
          <div>
            <div style="font-size:10px;color:var(--gray-400);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Bayar</div>
            <div style="font-size:13px;font-weight:700;color:var(--green)">${Utils.formatRupiah(paid)}</div>
          </div>
          <div>
            <div style="font-size:10px;color:var(--gray-400);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Sisa</div>
            <div style="font-size:13px;font-weight:700;color:${isActive?'var(--red)':'var(--green)'}">${Utils.formatRupiah(rem)}</div>
          </div>
        </div>
        <div class="debt-progress-bar" style="margin-top:10px">
          <div class="debt-progress-fill ${!isActive?'paid':''}" style="width:${pct}%"></div>
        </div>
        <div style="text-align:right;font-size:11px;color:var(--gray-400);margin-top:3px">${pct}% terbayar</div>
      </div>

      <!-- Payment History -->
      <div style="margin-bottom:16px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);margin-bottom:8px">Riwayat Pembayaran</div>
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
        <button onclick="DebtPage._confirmDelete('${debtId}', '${Utils.escHtml(debt.customer_name)}')" class="btn btn-ghost btn-full" style="color:var(--red)">
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
      <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px">
        Sisa tagihan: <strong style="color:var(--red)">${Utils.formatRupiah(remaining)}</strong>
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
          <div style="display:flex;align-items:center;background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius-md)">
            <span style="padding:0 12px;font-weight:600;color:var(--gray-400);font-size:15px;flex-shrink:0">Rp</span>
            <input type="text" id="pay-amount" inputmode="numeric" style="flex:1;border:none;background:transparent;height:44px;font-size:15px;font-weight:700;outline:none;font-family:inherit;color:var(--gray-900)" placeholder="0" autocomplete="off"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="pay-date">Tanggal</label>
          <input type="date" id="pay-date" class="form-input" value="${Utils.todayForInput()}"/>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">
          <button type="button" onclick="App.closeModal()" class="btn btn-ghost">Batal</button>
          <button type="submit" class="btn-cta" style="background:var(--green)">Simpan</button>
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
