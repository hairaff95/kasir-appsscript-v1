/**
 * history.js v2 — Riwayat transaksi dengan filter chip horizontal dan separator tanggal
 */
const HistoryPage = {
  _period: 'today',
  _type:   'all',

  async render(container) {
    container.innerHTML = this._skeleton();
    try {
      const data = await Api.getTransactions(this._period, this._type);
      container.innerHTML = this._html(data);
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><p>Gagal memuat: ${Utils.escHtml(e.message)}</p></div>`;
    }
  },

  _skeleton() {
    return `
      <div class="page-header"><div class="skeleton" style="height:16px;width:100px;margin-bottom:4px"></div></div>
      <div style="padding:12px 16px"><div class="skeleton" style="height:36px;border-radius:9999px"></div></div>
      <div style="padding:0 16px;display:flex;flex-direction:column;gap:0">
        ${[1,2,3,4,5].map(()=>`<div class="skeleton" style="height:52px;border-radius:0;margin-bottom:8px"></div>`).join('')}
      </div>
    `;
  },

  _html(data) {
    const p = this._period;
    const t = this._type;

    const totalIncome  = data.filter(r=>r.type==='income').reduce((s,r)=>s+Number(r.amount),0);
    const totalExpense = data.filter(r=>r.type==='expense').reduce((s,r)=>s+Number(r.amount),0);

    // Group by date
    const grouped = {};
    data.forEach(trx => {
      const key = String(trx.transaction_date || trx.date || '').slice(0,10);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(trx);
    });

    const listHtml = Object.keys(grouped).length === 0
      ? `<div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3"/></svg>
          </div>
          <h3>Tidak ada transaksi</h3>
          <p>Belum ada transaksi pada periode ini</p>
        </div>`
      : Object.keys(grouped).sort((a,b) => b.localeCompare(a)).map(date => `
          <div>
            <div class="date-separator">${Utils.formatDateRelative(date)}</div>
            <div style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:0 14px;margin-bottom:4px">
              ${grouped[date].map(trx => this._row(trx)).join('')}
            </div>
          </div>
        `).join('');

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h1>Riwayat Transaksi</h1>
            <div class="subtitle">${data.length} transaksi ditemukan</div>
          </div>
        </div>
      </div>

      <!-- Period filter chips -->
      <div style="padding:12px 16px 4px">
        <div class="chip-scroll">
          <button class="chip ${p==='today'?'active':''}" onclick="HistoryPage._set('today',null)">Hari Ini</button>
          <button class="chip ${p==='week'?'active':''}"  onclick="HistoryPage._set('week',null)">Minggu Ini</button>
          <button class="chip ${p==='month'?'active':''}" onclick="HistoryPage._set('month',null)">Bulan Ini</button>
          <button class="chip ${p==='all'?'active':''}"   onclick="HistoryPage._set('all',null)">Semua</button>
        </div>
      </div>

      <!-- Type filter chips -->
      <div style="padding:4px 16px 12px">
        <div style="display:flex;gap:6px">
          <button class="chip ${t==='all'?'active':''}"     onclick="HistoryPage._set(null,'all')">Semua</button>
          <button class="chip ${t==='income'?'active':''}"  onclick="HistoryPage._set(null,'income')" style="${t==='income'?'':''}">↑ Masuk</button>
          <button class="chip ${t==='expense'?'active':''}" onclick="HistoryPage._set(null,'expense')">↓ Keluar</button>
        </div>
      </div>

      <!-- Summary mini -->
      ${data.length > 0 ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px;margin-bottom:12px">
          <div style="background:var(--green-50);border:1px solid var(--green-100);border-radius:var(--radius-sm);padding:10px;text-align:center">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--green);margin-bottom:2px">Total Masuk</div>
            <div style="font-size:14px;font-weight:700;color:var(--green-600)">${Utils.formatRupiah(totalIncome)}</div>
          </div>
          <div style="background:var(--red-50);border:1px solid var(--red-100);border-radius:var(--radius-sm);padding:10px;text-align:center">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--red);margin-bottom:2px">Total Keluar</div>
            <div style="font-size:14px;font-weight:700;color:var(--red-600)">${Utils.formatRupiah(totalExpense)}</div>
          </div>
        </div>
      ` : ''}

      <!-- Grouped list -->
      <div class="trx-list">
        ${listHtml}
      </div>

      <div style="height:16px"></div>
    `;
  },

  _row(trx) {
    const isIncome = trx.type === 'income';
    return `
      <div class="trx-item">
        <div class="trx-icon ${isIncome ? 'income-icon' : 'expense-icon'}">
          ${isIncome
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`}
        </div>
        <div class="trx-body">
          <div class="trx-desc">${Utils.escHtml(trx.description || (isIncome?'Pemasukan':'Pengeluaran'))}</div>
          <div class="trx-meta">${trx.category ? Utils.escHtml(trx.category) + ' &bull; ' : ''}${Utils.formatDate(trx.transaction_date || trx.date)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div class="trx-amount ${isIncome?'pos':'neg'}">${isIncome?'+':'-'} ${Utils.formatRupiah(trx.amount)}</div>
          <button onclick="HistoryPage._del('${trx.id}')" style="border:none;background:none;cursor:pointer;color:var(--gray-300);padding:0;line-height:1;transition:color 0.15s" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray-300)'" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    `;
  },

  _set(period, type) {
    if (period !== null) this._period = period;
    if (type   !== null) this._type   = type;
    App.navigate('history');
  },

  _del(id) {
    App.confirm('Hapus transaksi ini?', async () => {
      try {
        await Api.deleteTransaction(id);
        Toast.success('Transaksi dihapus');
        App.navigate('history');
      } catch (err) {
        Toast.error('Gagal: ' + err.message);
      }
    });
  },
};

window.HistoryPage = HistoryPage;
