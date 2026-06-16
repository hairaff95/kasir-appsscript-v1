/**
 * history.js v3 — Material You / Bento Blue Design
 * Functions UNCHANGED — only HTML templates updated
 */
const HistoryPage = {
  _period: 'today',
  _type:   'all',

  async render(container) {
    container.innerHTML = this._skeleton();
    try {
      const data = await Api.getTransactions(this._period, this._type);
      container.innerHTML = this._html(data);
      
      // Mark as read when entering the History page
      localStorage.removeItem('lm_has_unread_trx');
      localStorage.setItem('lm_last_viewed_history', new Date().toISOString());
      App.updateBellBadge();
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><p>Gagal memuat: ${Utils.escHtml(e.message)}</p></div>`;
    }
  },

  _skeleton() {
    return `
      <div class="page-header"><div class="skeleton" style="height:20px;width:130px;margin-bottom:6px;border-radius:6px"></div></div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <div class="skeleton" style="height:38px;border-radius:12px"></div>
        <div class="skeleton" style="height:160px;border-radius:24px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="skeleton" style="height:80px;border-radius:20px"></div>
          <div class="skeleton" style="height:80px;border-radius:20px"></div>
        </div>
        <div class="skeleton" style="height:36px;border-radius:8px"></div>
        ${[1,2,3,4,5].map(()=>`<div class="skeleton" style="height:64px;border-radius:24px"></div>`).join('')}
      </div>
    `;
  },

  _html(data) {
    const p = this._period;
    const t = this._type;

    const totalIncome  = data.filter(r=>r.type==='income').reduce((s,r)=>s+Number(r.amount),0);
    const totalExpense = data.filter(r=>r.type==='expense').reduce((s,r)=>s+Number(r.amount),0);
    const netBalance   = totalIncome - totalExpense;

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
            <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 2px;margin-bottom:8px">
              <div class="date-separator" style="padding:0">${Utils.formatDateRelative(date)}</div>
              <span style="font-size:10px;font-weight:700;color:var(--primary-600);background:rgba(16,74,240,0.08);padding:3px 10px;border-radius:999px">${grouped[date].length} transaksi</span>
            </div>
            <div class="trx-group-card">
              ${grouped[date].map((trx, idx) => this._row(trx, idx === grouped[date].length - 1)).join('')}
            </div>
          </div>
        `).join('');

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div style="display:flex;align-items:center;gap:12px">
            <button onclick="App.navigate('dashboard')" class="back-btn" style="border-radius:10px" title="Kembali ke Beranda">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1>Riwayat Transaksi</h1>
              <div class="subtitle">${data.length} transaksi ditemukan</div>
            </div>
          </div>
        </div>
      </div>

      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">

        <!-- Period Filter Chips (horizontal scroll) -->
        <div class="chip-scroll">
          <button class="chip ${p==='today'?'active':''}" onclick="HistoryPage._set('today',null)">Hari Ini</button>
          <button class="chip ${p==='week'?'active':''}"  onclick="HistoryPage._set('week',null)">Minggu Ini</button>
          <button class="chip ${p==='month'?'active':''}" onclick="HistoryPage._set('month',null)">Bulan Ini</button>
          <button class="chip ${p==='all'?'active':''}"   onclick="HistoryPage._set('all',null)">Semua</button>
        </div>

        <!-- Hero Summary Card -->
        ${data.length > 0 ? `
        <div style="background:linear-gradient(135deg,#104af0 0%,#4648d4 100%);border-radius:24px;padding:22px;color:white;position:relative;overflow:hidden;box-shadow:0 6px 24px rgba(16,74,240,0.22)">
          <div style="position:absolute;top:-30%;right:-10%;width:140px;height:140px;background:rgba(255,255,255,0.07);border-radius:50%;filter:blur(30px)"></div>
          <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <p style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.10em;margin-bottom:6px">Total Pendapatan Bersih</p>
              <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:26px;font-weight:800;letter-spacing:-0.02em">${(netBalance>=0?'':'-') + Utils.formatRupiah(Math.abs(netBalance))}</div>
              <div style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border-radius:8px;padding:3px 10px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="${netBalance>=0?'M23 6l-9.5 9.5-5-5L1 18':'M23 18l-9.5-9.5-5 5L1 6'}"/></svg>
                <span style="font-size:10px;font-weight:700;color:white">${netBalance>=0?'+':''}${data.length} transaksi</span>
              </div>
            </div>
            <div style="width:48px;height:48px;border-radius:16px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/><path d="M15 9.354a4 4 0 100 5.292"/></svg>
            </div>
          </div>
        </div>

        <!-- Mini Summary Cards -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="background:var(--white);border:1px solid rgba(196,197,217,0.20);border-radius:20px;padding:14px;box-shadow:var(--shadow-xs)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <div style="width:36px;height:36px;border-radius:12px;background:rgba(22,163,74,0.08);display:flex;align-items:center;justify-content:center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              </div>
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--on-surface-variant);opacity:0.7">Pemasukan</span>
            </div>
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;color:var(--on-surface)">${Utils.formatRupiah(totalIncome)}</div>
            <div style="font-size:10px;font-weight:700;color:var(--green-600);margin-top:2px">${data.filter(r=>r.type==='income').length} transaksi</div>
          </div>
          <div style="background:var(--white);border:1px solid rgba(196,197,217,0.20);border-radius:20px;padding:14px;box-shadow:var(--shadow-xs)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <div style="width:36px;height:36px;border-radius:12px;background:rgba(186,26,26,0.07);display:flex;align-items:center;justify-content:center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--on-surface-variant);opacity:0.7">Pengeluaran</span>
            </div>
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;color:var(--red-600)">${Utils.formatRupiah(totalExpense)}</div>
            <div style="font-size:10px;font-weight:700;color:var(--red-600);margin-top:2px">${data.filter(r=>r.type==='expense').length} transaksi</div>
          </div>
        </div>
        ` : ''}

        <!-- Type Filter — Underline Tab Style -->
        <div class="underline-tabs" style="padding:0">
          <button class="underline-tab ${t==='all'?'active':''}"     onclick="HistoryPage._set(null,'all')">Semua</button>
          <button class="underline-tab ${t==='income'?'active':''}"  onclick="HistoryPage._set(null,'income')">Masuk</button>
          <button class="underline-tab ${t==='expense'?'active':''}" onclick="HistoryPage._set(null,'expense')">Keluar</button>
        </div>

        <!-- Grouped Transaction List -->
        <div style="display:flex;flex-direction:column;gap:16px">
          ${listHtml}
        </div>

        <div style="height:16px"></div>
      </div>
    `;
  },

  _row(trx, isLast) {
    const isIncome = trx.type === 'income';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;gap:12px;${isLast ? '' : 'border-bottom:1px solid rgba(196,197,217,0.12)'};transition:background 0.15s;cursor:default">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">
          <div class="trx-icon ${isIncome ? 'income-icon' : 'expense-icon'}" style="border-radius:16px;flex-shrink:0">
            ${isIncome
              ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`
              : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`}
          </div>
          <div style="min-width:0;flex:1">
            <div class="trx-desc">${Utils.escHtml(trx.description || (isIncome?'Pemasukan':'Pengeluaran'))}</div>
            <div class="trx-meta">${trx.category ? Utils.escHtml(trx.category) + ' &bull; ' : ''}${Utils.formatDate(trx.transaction_date || trx.date)}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0">
          <div class="trx-amount ${isIncome?'pos':'neg'}">${isIncome?'+':'-'} ${Utils.formatRupiah(trx.amount)}</div>
          <button onclick="HistoryPage._del('${trx.id}')" style="border:none;background:none;cursor:pointer;color:var(--outline-variant);padding:0;line-height:1;transition:color 0.15s;display:flex;align-items:center" onmouseover="this.style.color='var(--red-600)'" onmouseout="this.style.color='var(--outline-variant)'" title="Hapus">
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
