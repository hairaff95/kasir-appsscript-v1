/**
 * report.js v2 — Laporan dengan dark hero card + bar chart
 */
const ReportPage = {
  _period: 'daily',

  async render(container) {
    container.innerHTML = this._skeleton();
    try {
      const data = await Api.getReport(this._period);
      container.innerHTML = this._html(data);
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><p>Gagal memuat laporan</p></div>`;
    }
  },

  _skeleton() {
    return `
      <div class="page-header"><div class="skeleton" style="height:16px;width:80px"></div></div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <div class="skeleton" style="height:44px;border-radius:12px"></div>
        <div class="skeleton" style="height:200px;border-radius:16px"></div>
        <div class="skeleton" style="height:120px;border-radius:16px"></div>
        <div class="skeleton" style="height:100px;border-radius:16px"></div>
      </div>
    `;
  },

  _html(data) {
    const p     = this._period;
    const net   = data.net_balance;
    const isPos = net >= 0;
    const label = { daily:'Hari Ini', weekly:'Minggu Ini', monthly:'Bulan Ini' }[p];

    const maxBar  = Math.max(data.total_income, data.total_expense, 1);
    const incW    = Math.round((data.total_income  / maxBar) * 100);
    const expW    = Math.round((data.total_expense / maxBar) * 100);

    const catHtml = (data.expense_categories || []).length === 0
      ? `<p style="font-size:13px;color:var(--gray-400);text-align:center;padding:8px 0">Belum ada pengeluaran</p>`
      : (data.expense_categories || []).slice(0, 5).map(cat => {
          const pct = data.total_expense > 0 ? Math.round((cat.amount / data.total_expense) * 100) : 0;
          return `
            <div class="bar-chart-row">
              <div class="bar-chart-label">
                <span>${Utils.escHtml(cat.category)}</span>
                <span style="font-weight:700;color:var(--gray-700)">${Utils.formatRupiah(cat.amount)}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${pct}%;background:var(--red)"></div>
              </div>
            </div>
          `;
        }).join('');

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h1>Laporan</h1>
            <div class="subtitle">${label}</div>
          </div>
          <span class="badge ${isPos?'badge-green':'badge-red'}">${isPos?'↑ Untung':'↓ Rugi'}</span>
        </div>
      </div>

      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">

        <!-- Period toggle -->
        <div class="period-toggle">
          ${['daily','weekly','monthly'].map(v=>`
            <button class="period-btn ${p===v?'active':''}" onclick="ReportPage._setPeriod('${v}')">
              ${{daily:'Harian',weekly:'Mingguan',monthly:'Bulanan'}[v]}
            </button>
          `).join('')}
        </div>

        <!-- Dark P&L Card -->
        <div class="report-hero">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:14px">
            Laba / Rugi — ${label}
          </div>

          <div class="report-row">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:8px;height:8px;border-radius:50%;background:#4ade80;flex-shrink:0"></div>
              <span class="label">Total Pemasukan</span>
            </div>
            <span class="value" style="color:#4ade80">+ ${Utils.formatRupiah(data.total_income)}</span>
          </div>
          <div class="report-row">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:8px;height:8px;border-radius:50%;background:#f87171;flex-shrink:0"></div>
              <span class="label">Total Pengeluaran</span>
            </div>
            <span class="value" style="color:#f87171">- ${Utils.formatRupiah(data.total_expense)}</span>
          </div>
          <div style="height:1px;background:rgba(255,255,255,0.1);margin:10px 0"></div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:14px;font-weight:600;color:#fff">Saldo Bersih</span>
            <span style="font-size:22px;font-weight:800;color:${isPos?'#4ade80':'#f87171'}">
              ${isPos ? '+' : '-'} ${Utils.formatRupiah(Math.abs(net))}
            </span>
          </div>
        </div>

        <!-- Bar Chart -->
        <div class="card" style="padding:16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);margin-bottom:12px">Perbandingan</div>
          <div class="bar-chart-row">
            <div class="bar-chart-label">
              <span style="color:var(--green-600)">Pemasukan</span>
              <span style="font-weight:700;color:var(--green-600)">${Utils.formatRupiah(data.total_income)}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${incW}%;background:var(--green)"></div>
            </div>
          </div>
          <div class="bar-chart-row">
            <div class="bar-chart-label">
              <span style="color:var(--red-600)">Pengeluaran</span>
              <span style="font-weight:700;color:var(--red-600)">${Utils.formatRupiah(data.total_expense)}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${expW}%;background:var(--red)"></div>
            </div>
          </div>
        </div>

        <!-- Kasbon summary -->
        <div class="card" style="padding:16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);margin-bottom:12px">Kasbon Pelanggan</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:var(--radius-sm);padding:12px;text-align:center">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--blue);margin-bottom:3px">Total Aktif</div>
              <div style="font-size:15px;font-weight:800;color:var(--blue)">${Utils.formatRupiah(data.active_debt_total)}</div>
              <div style="font-size:11px;color:var(--blue);opacity:0.7">${data.active_debt_count} pelanggan</div>
            </div>
            <div style="background:var(--green-50);border:1px solid var(--green-100);border-radius:var(--radius-sm);padding:12px;text-align:center">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--green);margin-bottom:3px">Bayar ${label}</div>
              <div style="font-size:15px;font-weight:800;color:var(--green)">${Utils.formatRupiah(data.debt_paid_period)}</div>
              <div style="font-size:11px;color:var(--green);opacity:0.7">diterima</div>
            </div>
          </div>
        </div>

        <!-- Expense category breakdown -->
        <div class="card" style="padding:16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);margin-bottom:12px">Pengeluaran per Kategori</div>
          ${catHtml}
        </div>

        <!-- Stats -->
        <div class="card" style="padding:16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-400);margin-bottom:12px">Statistik</div>
          ${[
            ['Total Transaksi', data.transaction_count + ' transaksi'],
            ['Rata-rata Nominal', data.transaction_count ? Utils.formatRupiah(data.total_income / data.transaction_count) : '-'],
            ['Status Kas', isPos ? '✓ Positif' : '⚠ Negatif'],
          ].map(([l,v]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100)">
              <span style="font-size:13px;color:var(--gray-500)">${l}</span>
              <span style="font-size:13px;font-weight:700;color:var(--gray-800)">${v}</span>
            </div>
          `).join('')}
        </div>

        <div style="height:8px"></div>
      </div>
    `;
  },

  _setPeriod(p) {
    this._period = p;
    App.navigate('report');
  },
};

window.ReportPage = ReportPage;
