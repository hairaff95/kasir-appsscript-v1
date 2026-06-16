/**
 * expense.js v2
 */
const ExpensePage = {
  render(container) {
    container.innerHTML = this._html();
    this._bind(container);
  },

  _html() {
    const cats = ['Belanja Stok', 'Gaji/Upah', 'Listrik & Air', 'Sewa Toko', 'Transportasi', 'Peralatan', 'Lainnya'];
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div style="display:flex;align-items:center;gap:10px">
            <button onclick="App.navigate('dashboard')" class="back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1>Tambah Pengeluaran</h1>
              <div class="subtitle">Catat uang keluar dari kas</div>
            </div>
          </div>
        </div>
      </div>

      <form id="expense-form" class="form-section">

        <!-- Nominal -->
        <div class="form-group">
          <label class="form-label">Nominal <span class="required">*</span></label>
          <div class="amount-display">
            <div style="display:flex;align-items:baseline;justify-content:center;gap:6px">
              <span class="amount-prefix" style="color:var(--red)">Rp</span>
              <input
                id="expense-amount"
                type="text"
                inputmode="numeric"
                class="amount-input-raw"
                placeholder="0"
                autocomplete="off"
                style="color:var(--red)"
              />
            </div>
          </div>
          <div id="expense-words" class="amount-words"></div>
        </div>

        <!-- Kategori -->
        <div class="form-group">
          <label class="form-label">Kategori <span class="required">*</span></label>
          <div class="chip-scroll">
            ${cats.map(c=>`<button type="button" class="chip" data-cat="${c}">${c}</button>`).join('')}
          </div>
          <input type="hidden" id="expense-cat" value=""/>
        </div>

        <!-- Keterangan -->
        <div class="form-group">
          <label class="form-label" for="expense-desc">Keterangan <span class="required">*</span></label>
          <input type="text" id="expense-desc" class="form-input" placeholder="Detail pengeluaran..." maxlength="100" autocomplete="off"/>
        </div>

        <!-- Tanggal -->
        <div class="form-group">
          <label class="form-label" for="expense-date">Tanggal</label>
          <input type="date" id="expense-date" class="form-input" value="${Utils.todayForInput()}"/>
        </div>

        <div style="margin-top:4px">
          <button type="submit" class="btn-cta" style="background:var(--red)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
            Simpan Pengeluaran
          </button>
        </div>

        <button type="button" onclick="App.navigate('dashboard')" class="btn btn-ghost btn-full">Batal</button>
      </form>
    `;
  },

  _bind(container) {
    const amtInput = container.querySelector('#expense-amount');
    const wordsEl  = container.querySelector('#expense-words');
    const descEl   = container.querySelector('#expense-desc');
    const catInput = container.querySelector('#expense-cat');

    amtInput.addEventListener('input', () => {
      Utils.formatInputRupiah(amtInput);
      const raw = parseInt(amtInput.dataset.rawValue || 0);
      wordsEl.textContent = raw > 0 ? Utils.formatRupiahInWords(raw) : '';
    });

    container.querySelectorAll('.chip[data-cat]').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.chip[data-cat]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        catInput.value = chip.dataset.cat;
        if (!descEl.value.trim()) descEl.value = chip.dataset.cat;
      });
    });

    setTimeout(() => amtInput.focus(), 150);

    container.querySelector('#expense-form').addEventListener('submit', async e => {
      e.preventDefault();
      const amount = parseInt(amtInput.dataset.rawValue || 0);
      const desc   = descEl.value.trim();
      const date   = container.querySelector('#expense-date').value;
      const cat    = catInput.value || 'Lainnya';

      if (!amount || amount <= 0) { Toast.warning('Masukkan jumlah pengeluaran'); amtInput.focus(); return; }
      if (!desc)                  { Toast.warning('Keterangan wajib diisi'); descEl.focus(); return; }

      try {
        await Api.addTransaction({ type: 'expense', amount, description: desc, category: cat, transaction_date: date });
        Toast.success('Pengeluaran berhasil disimpan');
        App.navigate('dashboard');
      } catch (err) {
        Toast.error('Gagal menyimpan: ' + err.message);
      }
    });
  },
};

window.ExpensePage = ExpensePage;
