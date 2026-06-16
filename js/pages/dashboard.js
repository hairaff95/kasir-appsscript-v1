/**
 * dashboard.js v4 — Material You / Bento Blue Design
 * Functions UNCHANGED — only HTML templates updated
 */

const DashboardPage = {
  async render(container) {
    container.innerHTML = this._skeleton();
    try {
      const [summary, recentTrx] = await Promise.all([
        Api.getSummary(),
        Api.getTransactions('today'),
      ]);
      container.innerHTML = this._html(summary, recentTrx);
      App.updateBellBadge();
    } catch (e) {
      container.innerHTML = this._errorHtml(e.message);
    }
  },

  _skeleton() {
    return `
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="skeleton" style="height:20px;width:130px;margin-bottom:6px;border-radius:6px"></div>
            <div class="skeleton" style="height:12px;width:90px;border-radius:4px"></div>
          </div>
          <div class="skeleton" style="width:36px;height:36px;border-radius:10px"></div>
        </div>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px">
        <div class="skeleton" style="height:180px;border-radius:28px"></div>
        <div class="skeleton" style="height:68px;border-radius:24px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="skeleton" style="height:60px;border-radius:20px"></div>
          <div class="skeleton" style="height:60px;border-radius:20px"></div>
        </div>
        <div class="skeleton" style="height:14px;width:120px;border-radius:4px"></div>
        ${[1,2,3].map(()=>`<div class="skeleton" style="height:64px;border-radius:24px"></div>`).join('')}
      </div>
    `;
  },

  _html(summary, trx) {
    const bal = summary.today_balance;
    const balStr = (bal >= 0 ? '' : '- ') + Utils.formatRupiah(Math.abs(bal));
    const balColor = bal >= 0 ? '#4ade80' : '#f87171';

    const recentHtml = trx.length === 0
      ? `<div class="empty-state" style="padding:28px 0">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <h3>Belum ada transaksi</h3>
          <p>Tap "Uang Masuk" atau "Uang Keluar" untuk mulai</p>
        </div>`
      : trx.slice(0, 5).map(t => this._trxRow(t)).join('');

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h1>Beranda</h1>
            <div class="subtitle">${Utils.formatDateLong()}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${DEMO_MODE ? `<span class="badge badge-orange">DEMO</span>` : ''}
            <button onclick="App.navigate('history')" class="back-btn" title="Histori Transaksi" style="border-radius:12px; position:relative;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="bell-badge" style="display:none;"></span>
            </button>
            <button onclick="App.navigate('report')" class="back-btn" title="Laporan" style="border-radius:12px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">

        <!-- Hero Gradient Card -->
        <div class="hero-card">
          <div style="position:relative;z-index:1">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
              <p class="hero-label">Net Profit (Selisih)</p>
              <button onclick="App.navigate('dashboard')" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.20);border-radius:12px;padding:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)" title="Refresh">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              </button>
            </div>
            <div class="hero-amount">${balStr}</div>
          </div>
          <div class="hero-sub-grid">
            <div class="hero-sub-card">
              <div class="hero-sub-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                Uang Masuk
              </div>
              <div class="hero-sub-value">${Utils.formatRupiah(summary.today_income)}</div>
            </div>
            <div class="hero-sub-card">
              <div class="hero-sub-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                Uang Keluar
              </div>
              <div class="hero-sub-value">${Utils.formatRupiah(summary.today_expense)}</div>
            </div>
          </div>
        </div>

        <!-- Kasbon Quick Card -->
        <div class="kasbon-card" onclick="App.navigate('debt')" style="cursor:pointer">
          <div style="display:flex;align-items:center;gap:14px">
            <div class="kasbon-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <div>
              <div style="font-size:11px;font-weight:600;color:var(--on-surface-variant);opacity:0.7;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px">Total Kasbon Aktif</div>
              <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:18px;font-weight:700;color:var(--on-surface);letter-spacing:-0.01em">${Utils.formatRupiah(summary.active_debt_total)}</div>
              <div style="font-size:11px;color:var(--on-surface-variant);opacity:0.6;margin-top:1px">${summary.active_debt_count} pelanggan aktif</div>
            </div>
          </div>
          <div class="kasbon-chevron">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface-variant)" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <button class="action-btn-income" onclick="App.navigate('income'); setTimeout(() => IncomePage.setMode('manual'), 50);" style="height:56px; border-radius:18px; font-size:14px; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
            <span style="font-size:13px;font-weight:700">Masuk</span>
          </button>
          <button class="action-btn-sale" onclick="App.navigate('income'); setTimeout(() => IncomePage.setMode('product'), 50);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span style="font-size:13px;font-weight:700">Jual</span>
          </button>
          <button class="action-btn-expense" onclick="App.navigate('expense')" style="height:56px; border-radius:18px; font-size:14px; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 19V5M19 12l-7 7-7-7"/></svg>
            <span style="font-size:13px;font-weight:700">Keluar</span>
          </button>
        </div>

        <!-- Recent Transactions Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:4px;height:20px;background:var(--primary-600);border-radius:9999px"></div>
            <span style="font-size:15px;font-weight:700;color:var(--on-surface)">Transaksi Hari Ini</span>
          </div>
          <button class="section-link" onclick="App.navigate('history')">Lihat Semua →</button>
        </div>

        <!-- Transaction Cards -->
        <div style="display:flex;flex-direction:column;gap:8px">
          ${recentHtml}
        </div>

        <div style="height:8px"></div>
      </div>
    `;
  },

  _trxRow(trx) {
    const isIncome = trx.type === 'income';
    const desc = Utils.escHtml(trx.description || (isIncome ? 'Pemasukan' : 'Pengeluaran'));
    const catLabel = trx.category ? trx.category : (isIncome ? 'Pemasukan' : 'Pengeluaran');
    const timeLabel = Utils.formatDateRelative(trx.transaction_date || trx.date);

    return `
      <div class="trx-card">
        <div class="trx-icon ${isIncome ? 'income-icon' : 'expense-icon'}">
          ${isIncome
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`}
        </div>
        <div class="trx-body">
          <div class="trx-desc">${desc}</div>
          <div class="trx-meta">${Utils.escHtml(catLabel)} • ${timeLabel}</div>
        </div>
        <div class="trx-amount ${isIncome ? 'pos' : 'neg'}">
          ${isIncome ? '+' : '-'} ${Utils.formatRupiah(trx.amount)}
        </div>
      </div>
    `;
  },

  _errorHtml(msg) {
    return `
      <div style="padding:64px 24px;text-align:center">
        <div style="width:60px;height:60px;background:var(--red-100);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700;color:var(--on-surface);margin-bottom:8px">Gagal memuat data</h3>
        <p style="font-size:13px;color:var(--on-surface-variant);margin-bottom:24px;line-height:1.6">${Utils.escHtml(msg)}</p>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('dashboard')">Coba Lagi</button>
      </div>
    `;
  },
};

window.DashboardPage = DashboardPage;
