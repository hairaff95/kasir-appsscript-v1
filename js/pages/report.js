/** 
 * report.js v4 — Laporan + Laba Calculation + Unduh Excel (Fixed)
 */
const ReportPage = {
  _period: 'daily',
  _exportDest: 'local',

  async render(container) {
    container.innerHTML = this._skeleton();
    try {
      const trxFilter = {
        daily: 'today',
        weekly: 'week',
        monthly: 'month'
      }[this._period] || 'all';

      const [data, transactions] = await Promise.all([
        Api.getReport(this._period),
        Api.getTransactions(trxFilter)
      ]);

      container.innerHTML = this._html(data, transactions);
      App.updateBellBadge();
    } catch (e) {
      console.error(e);
      container.innerHTML = `<div class="empty-state"><p>Gagal memuat laporan: ${Utils.escHtml(e.message)}</p></div>`;
    }
  },

  _skeleton() {
    return `
      <div class="page-header"><div class="skeleton" style="height:20px;width:80px;border-radius:6px"></div></div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <div class="skeleton" style="height:46px;border-radius:12px"></div>
        <div class="skeleton" style="height:200px;border-radius:18px"></div>
        <div class="skeleton" style="height:100px;border-radius:16px"></div>
        <div class="skeleton" style="height:120px;border-radius:16px"></div>
        <div class="skeleton" style="height:100px;border-radius:16px"></div>
      </div>
    `;
  },

  _html(data, transactions = []) {
    const p = this._period;
    const net = data.net_balance;
    const isPos = net >= 0;
    const label = { daily: 'Hari Ini', weekly: 'Minggu Ini', monthly: 'Bulan Ini' }[p];

    const grossMargin = data.total_income > 0
      ? Math.round((net / data.total_income) * 100)
      : 0;
    const isProfit = net > 0;
    const maxBar = Math.max(data.total_income, data.total_expense, 1);
    const incW = Math.round((data.total_income / maxBar) * 100);
    const expW = Math.round((data.total_expense / maxBar) * 100);

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
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge ${isPos ? 'badge-green' : 'badge-red'}">${isPos ? '&#8593; Untung' : '&#8595; Rugi'}</span>
            <button onclick="App.navigate('history')" class="back-btn" title="Histori Transaksi" style="border-radius:12px; position:relative;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="bell-badge" style="display:none;"></span>
            </button>
          </div>
        </div>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <!-- Period toggle -->
        <div class="period-toggle">
          ${['daily', 'weekly', 'monthly'].map(v => `
            <button class="period-btn ${p === v ? 'active' : ''}" onclick="ReportPage._setPeriod('${v}')">
              ${{ daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan' }[v]}
            </button>
          `).join('')}
        </div>

        <!-- Hero dark card -->
        <div class="report-hero">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#475569;margin-bottom:16px">
            Laba / Rugi &mdash; ${label}
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
          <div style="height:1px;background:rgba(255,255,255,0.1);margin:12px 0"></div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:14px;font-weight:600;color:#94A3B8">Saldo Bersih</span>
            <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:800;color:${isPos ? '#4ade80' : '#f87171'}">
              ${isPos ? '+' : '-'} ${Utils.formatRupiah(Math.abs(net))}
            </span>
          </div>
        </div>

        <!-- ====== KALKULASI LABA ====== -->
        <div style="background:var(--white);border:1px solid rgba(196,197,217,0.22);border-radius:24px;padding:18px;box-shadow:var(--shadow-xs)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <div style="width:36px;height:36px;background:${isProfit ? 'rgba(22,163,74,0.08)' : 'rgba(186,26,26,0.07)'};border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${isProfit ? 'var(--green-600)' : 'var(--red-600)'}" stroke-width="2">
                ${isProfit
        ? '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'
        : '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>'}
              </svg>
            </div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--on-surface)">Kalkulasi Laba Usaha</div>
              <div style="font-size:11px;color:var(--on-surface-variant);opacity:0.65">Analisis keuntungan ${label.toLowerCase()}</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:0">
            ${[
        ['Pendapatan Kotor', data.total_income, '#15803d'],
        ['Total Biaya/Pengeluaran', data.total_expense, '#ba1a1a'],
      ].map(([l, v, color]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(196,197,217,0.12)">
                <span style="font-size:13px;color:var(--on-surface-variant)">${l}</span>
                <span style="font-size:13px;font-weight:700;color:${color}">${Utils.formatRupiah(v)}</span>
              </div>
            `).join('')}
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:2px solid rgba(196,197,217,0.2);margin-top:2px">
              <div>
                <div style="font-size:14px;font-weight:800;color:var(--on-surface)">Laba Bersih</div>
                <div style="font-size:11px;color:var(--on-surface-variant);opacity:0.6;margin-top:2px">
                  Margin: <strong style="color:${isProfit ? 'var(--green-600)' : 'var(--red-600)'}">${grossMargin}%</strong>
                  ${data.total_income > 0 ? `dari total pendapatan` : ''}
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:800;color:${isProfit ? 'var(--green-600)' : 'var(--red-600)'}">
                  ${net >= 0 ? '+' : '-'} ${Utils.formatRupiah(Math.abs(net))}
                </div>
                <div style="display:inline-flex;align-items:center;gap:4px;background:${isProfit ? 'rgba(22,163,74,0.08)' : 'rgba(186,26,26,0.07)'};border-radius:8px;padding:2px 8px;margin-top:3px">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${isProfit ? 'var(--green-600)' : 'var(--red-600)'}" stroke-width="2.5">
                    ${isProfit ? '<path d="M18 15l-6-6-6 6"/>' : '<path d="M6 9l6 6 6-6"/>'}
                  </svg>
                  <span style="font-size:10px;font-weight:700;color:${isProfit ? 'var(--green-600)' : 'var(--red-600)'}">
                    ${isProfit ? 'Untung' : 'Rugi'} ${Math.abs(grossMargin)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ====== DETAIL KEUNTUNGAN PER PRODUK ====== -->
        ${(() => {
          const salesBreakdown = this._parseSalesProfit(transactions);
          const totalSalesProfit = salesBreakdown.reduce((sum, item) => sum + item.totalProfit, 0);

          const breakdownListHtml = salesBreakdown.length === 0
            ? `<p style="font-size:13px;color:var(--gray-400);text-align:center;padding:16px 0">Belum ada data penjualan produk</p>`
            : salesBreakdown.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(196,197,217,0.12)">
                  <div style="min-width:0; flex:1; padding-right:8px;">
                    <div style="font-size:13.5px; font-weight:700; color:var(--on-surface); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${Utils.escHtml(item.name)}</div>
                    <div style="font-size:11px; color:var(--on-surface-variant); opacity:0.75; margin-top:2px;">
                      x${item.qty} &bull; Beli: ${Utils.formatRupiah(item.buy)} &bull; Jual: ${Utils.formatRupiah(item.sell)}
                    </div>
                  </div>
                  <div style="text-align:right; flex-shrink:0;">
                    <div style="font-size:13.5px; font-weight:800; color:var(--green-600);">+${Utils.formatRupiah(item.totalProfit)}</div>
                    <div style="font-size:10px; color:var(--on-surface-variant); opacity:0.6; margin-top:1px;">Margin: ${item.buy > 0 ? Math.round((item.sell - item.buy) / item.buy * 100) : 0}%</div>
                  </div>
                </div>
              `).join('');

          return `
            <div style="background:var(--white);border:1px solid rgba(196,197,217,0.22);border-radius:24px;padding:18px;box-shadow:var(--shadow-xs)">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:36px;height:36px;background:rgba(22,163,74,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" stroke-width="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"/>
                    </svg>
                  </div>
                  <div>
                    <div style="font-size:14px;font-weight:700;color:var(--on-surface)">Detail Keuntungan per Produk</div>
                    <div style="font-size:11px;color:var(--on-surface-variant);opacity:0.65">Breakdown laba bersih per item</div>
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:10px;font-weight:600;color:var(--on-surface-variant);opacity:0.6">Total Profit</div>
                  <div style="font-size:14px;font-weight:800;color:var(--green-600)">${Utils.formatRupiah(totalSalesProfit)}</div>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:0;max-height:280px;overflow-y:auto;padding-right:4px;">
                ${breakdownListHtml}
              </div>
            </div>
          `;
        })()}

        <!-- ====== DOWNLOAD LAPORAN SECTION ====== -->
        <div style="background:var(--white);border:1px solid rgba(196,197,217,0.22);border-radius:24px;padding:18px;box-shadow:var(--shadow-xs)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <div style="width:36px;height:36px;background:rgba(16,74,240,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--on-surface)">Ekspor Laporan Excel</div>
              <div style="font-size:11px;color:var(--on-surface-variant);opacity:0.65">File .xlsx siap dibuka di Excel / Google Sheets</div>
            </div>
          </div>

          <!-- Destination Switcher -->
          <div style="display:flex; background:var(--surface-container-low); border:1.5px solid var(--outline-variant); border-radius:14px; padding:3px; margin-bottom:14px;">
            <button id="export-dest-local" onclick="ReportPage._setExportDest('local')" style="flex:1; border:none; background:${this._exportDest === 'local' ? 'var(--white)' : 'transparent'}; border-radius:11px; padding:6px; font-size:12px; font-weight:${this._exportDest === 'local' ? '700' : '600'}; color:${this._exportDest === 'local' ? 'var(--primary-600)' : 'var(--on-surface-variant)'}; cursor:pointer; box-shadow:${this._exportDest === 'local' ? 'var(--shadow-xs)' : 'none'}; transition:all 0.15s;">
              Unduh ke Device
            </button>
            <button id="export-dest-drive" onclick="ReportPage._setExportDest('drive')" style="flex:1; border:none; background:${this._exportDest === 'drive' ? 'var(--white)' : 'transparent'}; border-radius:11px; padding:6px; font-size:12px; font-weight:${this._exportDest === 'drive' ? '700' : '600'}; color:${this._exportDest === 'drive' ? 'var(--primary-600)' : 'var(--on-surface-variant)'}; cursor:pointer; box-shadow:${this._exportDest === 'drive' ? 'var(--shadow-xs)' : 'none'}; transition:all 0.15s;">
              Simpan ke Google Drive
            </button>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button onclick="ReportPage._downloadReport('today')" class="download-report-btn" style="background:rgba(22,163,74,0.07);border-color:rgba(22,163,74,0.15)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span style="color:var(--green-600)">Hari Ini</span>
            </button>
            <button onclick="ReportPage._downloadReport('week')" class="download-report-btn" style="background:rgba(16,74,240,0.06);border-color:rgba(16,74,240,0.14)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span style="color:var(--primary-600)">Minggu Ini</span>
            </button>
            <button onclick="ReportPage._downloadReport('month')" class="download-report-btn" style="background:rgba(70,72,212,0.06);border-color:rgba(70,72,212,0.14)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4648d4" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span style="color:#4648d4">Bulan Ini</span>
            </button>
            <button onclick="ReportPage._downloadReport('all')" class="download-report-btn" style="background:rgba(186,26,26,0.05);border-color:rgba(186,26,26,0.13)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span style="color:var(--red-600)">Semua Data</span>
            </button>
          </div>
        </div>

        <!-- Bar Chart -->
        <div class="card" style="padding:18px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--gray-400);margin-bottom:14px">Perbandingan Kas</div>
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
        <div class="card" style="padding:18px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--gray-400);margin-bottom:14px">Kasbon Pelanggan</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:var(--radius-md);padding:14px;text-align:center">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--blue-600);margin-bottom:4px">Total Aktif</div>
              <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;color:var(--blue-600)">${Utils.formatRupiah(data.active_debt_total)}</div>
              <div style="font-size:11px;color:var(--blue-600);opacity:0.7;margin-top:2px">${data.active_debt_count} pelanggan</div>
            </div>
            <div style="background:var(--green-50);border:1px solid var(--green-100);border-radius:var(--radius-md);padding:14px;text-align:center">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--green-600);margin-bottom:4px">Bayar ${label}</div>
              <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;color:var(--green-600)">${Utils.formatRupiah(data.debt_paid_period)}</div>
              <div style="font-size:11px;color:var(--green-600);opacity:0.7;margin-top:2px">diterima</div>
            </div>
          </div>
        </div>

        <!-- Expense category breakdown -->
        <div class="card" style="padding:18px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--gray-400);margin-bottom:14px">Pengeluaran per Kategori</div>
          ${catHtml}
        </div>

        <!-- Stats -->
        <div class="card" style="padding:18px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--gray-400);margin-bottom:14px">Statistik</div>
          ${[
        ['Total Transaksi', data.transaction_count + ' transaksi'],
        ['Rata-rata Nominal', data.transaction_count ? Utils.formatRupiah(data.total_income / data.transaction_count) : '-'],
        ['Margin Keuntungan', grossMargin + '%'],
        ['Status Kas', isPos ? '&#10003; Positif (Untung)' : '&#9888; Negatif (Rugi)'],
      ].map(([l, v]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100)">
              <span style="font-size:13px;color:var(--gray-500);font-weight:500">${l}</span>
              <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;color:var(--gray-800)">${v}</span>
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

  _setExportDest(dest) {
    this._exportDest = dest;
    const container = document.getElementById('page-container');
    if (container) {
      this.render(container);
    }
  },

  /* ============================================================
     DOWNLOAD LAPORAN — Excel (.xls) — FIXED
     ============================================================ */
  async _downloadReport(period) {
    const today = Utils.todayForInput ? Utils.todayForInput() : new Date().toISOString().slice(0, 10);
    const month = new Date().toISOString().slice(0, 7);
    const periodMap = {
      today: { api: 'today', label: 'Hari Ini', filename: `laporan-hari-ini-${today}.xls` },
      week: { api: 'week', label: 'Minggu Ini', filename: `laporan-minggu-ini-${today}.xls` },
      month: { api: 'month', label: 'Bulan Ini', filename: `laporan-bulan-${month}.xls` },
      all: { api: 'all', label: 'Semua Data', filename: `laporan-semua-${today}.xls` },
    };
    const cfg = periodMap[period];
    if (!cfg) return;

    if (this._exportDest === 'local') {
      Toast.info(`Menyiapkan laporan ${cfg.label}...`);
      try {
        const transactions = await Api.getTransactions(cfg.api);
        this._exportXLS(transactions, cfg.filename, cfg.label);
      } catch (err) {
        Toast.error('Gagal unduh laporan: ' + err.message);
      }
    } else {
      const user = App.getUser();
      const profile = JSON.parse(localStorage.getItem('lm_profile') || '{}');
      const email = user?.email || profile.email;

      if (!email) {
        Toast.warning('Email Anda tidak ditemukan. Silakan login ulang atau isi email di Pengaturan.');
        return;
      }

      Toast.info(`⏳ Membuat laporan ${cfg.label} di Google Drive... (${email})`);
      try {
        const transactions = await Api.getTransactions(cfg.api);
        const res = await Api.saveReportToDrive(cfg.api, transactions, email);
        // Show success with direct link to open the file
        const fileName = res.fileName || 'Laporan';
        const fileUrl  = res.fileUrl  || 'https://drive.google.com';
        Toast.success(
          `✅ Laporan berhasil disimpan ke Google Drive!\n` +
          `File "${fileName}" dibagikan ke ${email}.\n` +
          `Cek folder "Shared with me" di Google Drive Anda.`
        );
        // Also open the file immediately in a new tab
        setTimeout(() => { window.open(fileUrl, '_blank'); }, 800);
      } catch (err) {
        Toast.error('Gagal menyimpan ke Google Drive: ' + err.message);
      }
    }
  },
  _exportXLS(transactions, filename, label) {
    // ── 1. Kumpulkan data ──────────────────────────────────────
    const now = new Date().toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const profile = JSON.parse(localStorage.getItem('lm_profile') || '{}');
    const storeName = profile.storeName || 'LanggengMakmur';

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense;
    const margin = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

    // ── 2. Helper escape XML ───────────────────────────────────
    const esc = v => String(v || '-')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    // ── 3. Bangun SpreadsheetML XML ────────────────────────────
    const xlsHtml = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Laporan ${esc(label)}">
<Table>
  <Row><Cell ss:MergeAcross="5"><Data ss:Type="String">${esc(storeName)} — Laporan Keuangan ${esc(label)}</Data></Cell></Row>
  <Row><Cell ss:MergeAcross="5"><Data ss:Type="String">Diunduh: ${esc(now)}</Data></Cell></Row>
  <Row></Row>
  <Row>
    <Cell><Data ss:Type="String">Total Pemasukan</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="Number">${totalIncome}</Data></Cell>
  </Row>
  <Row>
    <Cell><Data ss:Type="String">Total Pengeluaran</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="Number">${totalExpense}</Data></Cell>
  </Row>
  <Row>
    <Cell><Data ss:Type="String">Laba Bersih</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="Number">${netBalance}</Data></Cell>
  </Row>
  <Row>
    <Cell><Data ss:Type="String">Margin Keuntungan</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">${margin}%</Data></Cell>
  </Row>
  <Row></Row>
  <Row>
    <Cell><Data ss:Type="String">No</Data></Cell>
    <Cell><Data ss:Type="String">Tanggal</Data></Cell>
    <Cell><Data ss:Type="String">Keterangan</Data></Cell>
    <Cell><Data ss:Type="String">Kategori</Data></Cell>
    <Cell><Data ss:Type="String">Tipe</Data></Cell>
    <Cell><Data ss:Type="String">Nominal (Rp)</Data></Cell>
  </Row>
  ${transactions.length === 0
        ? `<Row><Cell ss:MergeAcross="5"><Data ss:Type="String">Tidak ada transaksi pada periode ini</Data></Cell></Row>`
        : transactions.map((t, i) => `
  <Row>
    <Cell><Data ss:Type="Number">${i + 1}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(t.transaction_date || t.date)}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(t.description)}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(t.category)}</Data></Cell>
    <Cell><Data ss:Type="String">${t.type === 'income' ? 'Masuk' : 'Keluar'}</Data></Cell>
    <Cell><Data ss:Type="Number">${t.type === 'income' ? Number(t.amount) : -Number(t.amount)}</Data></Cell>
  </Row>`).join('')}
</Table>
</Worksheet>
</Workbook>`;

    // ── 4. Download via Blob + createObjectURL (nama file terjaga) ─
    const blob = new Blob(['\uFEFF' + xlsHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', filename); // ← nama file .xls terjaga
    document.body.appendChild(link);

    requestAnimationFrame(() => {
      link.click();
      Toast.success(`Laporan ${label} berhasil diunduh!`);
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 250);
    });
  },

  _parseSalesProfit(transactions) {
    const productsMap = {};

    (transactions || []).forEach(t => {
      if (t.type !== 'income' || !t.description || !t.description.startsWith('Jual: ')) return;

      const desc = t.description.substring(6); // remove 'Jual: '
      const regex = /(.*?)\s*\(x(\d+)\s*\|\s*Beli:(\d+)\s*Jual:(\d+)\)/g;
      let match;
      while ((match = regex.exec(desc)) !== null) {
        const name = match[1].replace(/^,\s*/, '').trim();
        const qty = parseInt(match[2], 10);
        const buy = parseInt(match[3], 10);
        const sell = parseInt(match[4], 10);
        
        if (name && !isNaN(qty) && !isNaN(buy) && !isNaN(sell)) {
          const key = `${name}_${buy}_${sell}`;
          if (!productsMap[key]) {
            productsMap[key] = {
              name,
              buy,
              sell,
              qty: 0,
              totalCost: 0,
              totalRevenue: 0,
              totalProfit: 0
            };
          }
          const item = productsMap[key];
          item.qty += qty;
          item.totalCost += (buy * qty);
          item.totalRevenue += (sell * qty);
          item.totalProfit += ((sell - buy) * qty);
        }
      }
    });

    return Object.values(productsMap).sort((a, b) => b.totalProfit - a.totalProfit);
  },
};

window.ReportPage = ReportPage;