/**
 * dashboard.js v2 — Modern POS Dashboard
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
    } catch (e) {
      container.innerHTML = this._errorHtml(e.message);
    }
  },

  _skeleton() {
    return `
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="skeleton" style="height:18px;width:120px;margin-bottom:4px"></div>
            <div class="skeleton" style="height:12px;width:80px"></div>
          </div>
          <div class="skeleton" style="width:32px;height:32px;border-radius:8px"></div>
        </div>
      </div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${[1,2,3,4].map(()=>`<div class="skeleton" style="height:80px;border-radius:12px"></div>`).join('')}
        </div>
        <div class="skeleton" style="height:14px;width:100px;border-radius:4px"></div>
        ${[1,2,3].map(()=>`<div class="skeleton" style="height:50px;border-radius:12px"></div>`).join('')}
        <div class="skeleton" style="height:14px;width:120px;border-radius:4px;margin-top:8px"></div>
        ${[1,2,3].map(()=>`<div class="skeleton" style="height:54px;border-radius:0"></div>`).join('')}
      </div>
    `;
  },

  _html(summary, trx) {
    const bal = summary.today_balance;
    const balClass = bal >= 0 ? 'balance-pos' : 'balance-neg';
    const balStr = (bal >= 0 ? '' : '- ') + Utils.formatRupiah(Math.abs(bal));

    const recentHtml = trx.length === 0
      ? `<div class="empty-state" style="padding:24px 0">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <h3>Belum ada transaksi</h3>
          <p>Tap "+ Uang Masuk" untuk mulai mencatat</p>
        </div>`
      : trx.slice(0, 5).map(t => this._trxRow(t)).join('');

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h1>Kasir Mini</h1>
            <div class="subtitle">${Utils.formatDateLong()}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            ${DEMO_MODE ? `<span class="badge badge-orange">DEMO</span>` : ''}
            <button onclick="App.navigate('report')" class="back-btn" title="Laporan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="summary-card">
          <div class="card-label">Uang Masuk</div>
          <div class="card-value income">${Utils.formatRupiah(summary.today_income)}</div>
          <div class="card-sub">Hari ini</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Uang Keluar</div>
          <div class="card-value expense">${Utils.formatRupiah(summary.today_expense)}</div>
          <div class="card-sub">Hari ini</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Selisih Kas</div>
          <div class="card-value ${balClass}">${balStr}</div>
          <div class="card-sub">${bal >= 0 ? '✓ Positif' : '⚠ Perhatian'}</div>
        </div>
        <div class="summary-card" onclick="App.navigate('debt')" style="cursor:pointer">
          <div class="card-label">Kasbon Aktif</div>
          <div class="card-value debt">${Utils.formatRupiah(summary.active_debt_total)}</div>
          <div class="card-sub">${summary.active_debt_count} pelanggan →</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-header" style="padding-top:4px">
        <span class="section-title">Aksi Cepat</span>
      </div>
      <div style="padding:0 16px 4px;display:flex;flex-direction:column;gap:8px">
        <button class="quick-btn qb-income" onclick="App.navigate('income')">
          <div class="quick-btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </div>
          <div>
            <div style="font-size:14px;font-weight:600">+ Uang Masuk</div>
            <div style="font-size:11px;opacity:0.7;font-weight:400">Catat pemasukan kas</div>
          </div>
        </button>
        <button class="quick-btn qb-expense" onclick="App.navigate('expense')">
          <div class="quick-btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </div>
          <div>
            <div style="font-size:14px;font-weight:600">+ Uang Keluar</div>
            <div style="font-size:11px;opacity:0.7;font-weight:400">Catat pengeluaran kas</div>
          </div>
        </button>
        <button class="quick-btn qb-debt" onclick="App.navigate('debt')">
          <div class="quick-btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z"/></svg>
          </div>
          <div>
            <div style="font-size:14px;font-weight:600">+ Kasbon</div>
            <div style="font-size:11px;opacity:0.7;font-weight:400">Catat hutang pelanggan</div>
          </div>
        </button>
      </div>

      <!-- Recent Transactions -->
      <div class="divider" style="margin-top:12px"></div>
      <div class="section-header">
        <span class="section-title">Transaksi Hari Ini</span>
        <button class="section-link" onclick="App.navigate('history')">Lihat Semua</button>
      </div>

      <div style="background:var(--white);margin:0 16px;border:1px solid var(--gray-200);border-radius:var(--radius-md)">
        <div style="padding:0 14px">
          ${recentHtml}
        </div>
      </div>

      <div style="height:16px"></div>
    `;
  },

  _trxRow(trx) {
    const isIncome = trx.type === 'income';
    return `
      <div class="trx-item">
        <div class="trx-icon ${isIncome ? 'income-icon' : 'expense-icon'}">
          ${isIncome
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`}
        </div>
        <div class="trx-body">
          <div class="trx-desc">${Utils.escHtml(trx.description || (isIncome ? 'Pemasukan' : 'Pengeluaran'))}</div>
          <div class="trx-meta">${Utils.formatDateRelative(trx.transaction_date || trx.date)}</div>
        </div>
        <div class="trx-amount ${isIncome ? 'pos' : 'neg'}">
          ${isIncome ? '+' : '-'} ${Utils.formatRupiah(trx.amount)}
        </div>
      </div>
    `;
  },

  _errorHtml(msg) {
    return `
      <div style="padding:48px 24px;text-align:center">
        <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
        <h3 style="font-size:15px;font-weight:700;color:var(--gray-800);margin-bottom:6px">Gagal memuat data</h3>
        <p style="font-size:13px;color:var(--gray-400);margin-bottom:20px">${Utils.escHtml(msg)}</p>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('dashboard')">Coba Lagi</button>
      </div>
    `;
  },
};

window.DashboardPage = DashboardPage;
