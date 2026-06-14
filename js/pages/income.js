/**
 * income.js v2
 */
const IncomePage = {
  render(container) {
    container.innerHTML = this._html();
    this._bind(container);
  },

  _html() {
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div style="display:flex;align-items:center;gap:10px">
            <button onclick="App.navigate('dashboard')" class="back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1>Tambah Pemasukan</h1>
              <div class="subtitle">Catat uang masuk ke kas</div>
            </div>
          </div>
        </div>
      </div>

      <form id="income-form" class="form-section">

        <!-- Nominal -->
        <div class="form-group">
          <label class="form-label">Nominal <span class="required">*</span></label>
          <div class="amount-display">
            <div style="display:flex;align-items:baseline;justify-content:center;gap:6px">
              <span class="amount-prefix" style="color:var(--green)">Rp</span>
              <input
                id="income-amount"
                type="text"
                inputmode="numeric"
                class="amount-input-raw"
                placeholder="0"
                autocomplete="off"
                style="color:var(--green)"
              />
            </div>
          </div>
          <div id="income-words" class="amount-words"></div>
        </div>

        <!-- Keterangan -->
        <div class="form-group">
          <label class="form-label" for="income-desc">Keterangan <span class="required">*</span></label>
          <input type="text" id="income-desc" class="form-input" placeholder="Contoh: Jual beras 5kg" maxlength="100" autocomplete="off"/>
        </div>

        <!-- Kategori cepat -->
        <div class="form-group">
          <label class="form-label">Kategori Cepat</label>
          <div class="chip-scroll">
            ${['Penjualan','Piutang Cair','Bonus','Lainnya'].map(c=>`<button type="button" class="chip" data-cat="${c}">${c}</button>`).join('')}
          </div>
          <input type="hidden" id="income-cat" value="Penjualan"/>
        </div>

        <!-- Tanggal -->
        <div class="form-group">
          <label class="form-label" for="income-date">Tanggal</label>
          <input type="date" id="income-date" class="form-input" value="${Utils.todayForInput()}"/>
        </div>

        <div style="margin-top:4px">
          <button type="submit" class="btn-cta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
            Simpan Pemasukan
          </button>
        </div>

        <button type="button" onclick="App.navigate('dashboard')" class="btn btn-ghost btn-full" style="margin-top:0">Batal</button>
      </form>
    `;
  },

  _bind(container) {
    const amtInput = container.querySelector('#income-amount');
    const wordsEl  = container.querySelector('#income-words');
    const catInput = container.querySelector('#income-cat');

    amtInput.addEventListener('input', () => {
      Utils.formatInputRupiah(amtInput);
      const raw = parseInt(amtInput.dataset.rawValue || 0);
      wordsEl.textContent = raw > 0 ? Utils.formatRupiahInWords(raw) : '';
    });

    // Category chips
    container.querySelectorAll('.chip[data-cat]').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.chip[data-cat]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        catInput.value = chip.dataset.cat;
        const descEl = container.querySelector('#income-desc');
        if (!descEl.value.trim()) descEl.value = chip.dataset.cat;
      });
    });

    // Select first chip
    container.querySelector('.chip[data-cat]')?.classList.add('active');

    setTimeout(() => amtInput.focus(), 150);

    container.querySelector('#income-form').addEventListener('submit', async e => {
      e.preventDefault();
      const amount = parseInt(amtInput.dataset.rawValue || 0);
      const desc   = container.querySelector('#income-desc').value.trim();
      const date   = container.querySelector('#income-date').value;
      const cat    = catInput.value;

      if (!amount || amount <= 0) { Toast.warning('Masukkan jumlah pemasukan'); amtInput.focus(); return; }
      if (!desc)                  { Toast.warning('Keterangan wajib diisi'); container.querySelector('#income-desc').focus(); return; }

      try {
        await Api.addTransaction({ type: 'income', amount, description: desc, category: cat, transaction_date: date });
        Toast.success('✓ Pemasukan berhasil disimpan');
        App.navigate('dashboard');
      } catch (err) {
        Toast.error('Gagal menyimpan: ' + err.message);
      }
    });
  },
};

window.IncomePage = IncomePage;
