/**
 * income.js v3 — Tambah Pemasukan dengan Integrasi Jual Produk (POS)
 */
const IncomePage = {
  _mode: 'manual', // 'manual' or 'product'
  _cart: [],       // Array of { id, name, price, purchase_price, stock, qty }
  _products: null,
  _scanner: null,

  setMode(mode) {
    this._mode = mode;
    if (this._scanner) {
      this._scanner.stop().then(() => {
        this._scanner = null;
      }).catch(() => {
        this._scanner = null;
      });
    }
    const container = document.getElementById('page-container');
    if (container) {
      const manualTab = container.querySelector('.pill-tab[onclick*="manual"]');
      const productTab = container.querySelector('.pill-tab[onclick*="product"]');
      if (manualTab && productTab) {
        manualTab.classList.toggle('active', mode === 'manual');
        productTab.classList.toggle('active', mode === 'product');
      }

      const formContainer = container.querySelector('#income-form-container');
      if (formContainer) {
        formContainer.innerHTML = mode === 'manual' ? this._manualFormHtml() : this._productFormHtml();
        this._bind(container);
      } else {
        this.render(container);
      }
    }
  },

  async render(container) {
    container.innerHTML = this._skeleton();
    try {
      this._products = await Api.getProducts();
      container.innerHTML = this._html();
      this._bind(container);
      App.updateBellBadge();
    } catch (e) {
      container.innerHTML = this._errorHtml(e.message);
    }
  },

  _skeleton() {
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div style="display:flex;align-items:center;gap:12px">
            <button onclick="App.navigate('dashboard')" class="back-btn" style="border-radius:10px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <div class="skeleton" style="height:20px;width:110px;margin-bottom:6px;border-radius:6px"></div>
              <div class="skeleton" style="height:12px;width:80px;border-radius:4px"></div>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <div class="skeleton" style="height:44px;border-radius:16px"></div>
        <div class="skeleton" style="height:160px;border-radius:20px"></div>
      </div>
    `;
  },

  _errorHtml(msg) {
    return `
      <div style="padding:64px 24px;text-align:center">
        <h3 style="font-size:16px;font-weight:700;color:var(--on-surface);margin-bottom:8px">Gagal memuat data</h3>
        <p style="font-size:13px;color:var(--on-surface-variant);margin-bottom:24px;">${Utils.escHtml(msg)}</p>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('income')">Coba Lagi</button>
      </div>
    `;
  },

  _manualFormHtml() {
    return `
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

  _productFormHtml() {
    return `
      <form id="sell-product-form" class="form-section">
        <!-- Search & Scan Product -->
        <div class="form-group" style="position:relative;">
          <label class="form-label">Cari Produk untuk Dijual</label>
          <div style="display:flex;gap:8px;">
            <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl);flex:1">
              <span style="padding:0 12px;display:flex;align-items:center;color:var(--outline);flex-shrink:0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
              <input type="text" id="sell-prod-search" class="form-input" style="border:none;background:transparent;height:44px;outline:none;padding:0;margin:0;" placeholder="Ketik nama atau scan barcode..." autocomplete="off"/>
            </div>
            <button type="button" onclick="IncomePage._startScanSale()" class="btn btn-outline" style="padding:0 12px; border-radius:14px; height:48px; border:1.5px solid var(--outline-variant); background:var(--surface-container-low); display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
          <!-- Search results dropdown -->
          <div id="sell-prod-results" style="display:none; flex-direction:column; gap:4px; margin-top:8px; background:var(--white); border:1.5px solid var(--outline-variant); border-radius:16px; max-height:220px; overflow-y:auto; padding:6px; box-shadow:var(--shadow-md); position:absolute; width:100%; z-index:50;">
          </div>
        </div>

        <!-- Cart items list -->
        <div class="form-group" style="margin-top:20px;">
          <label class="form-label" style="margin-bottom:8px;">Keranjang Penjualan</label>
          <div id="sell-cart-items" style="display:flex; flex-direction:column; gap:8px;">
            <!-- Populated dynamically -->
          </div>
          <div id="sell-cart-empty" style="text-align:center; padding:32px 0; color:var(--on-surface-variant); opacity:0.6; font-size:13px; border:1.5px dashed var(--outline-variant); border-radius:16px;">
            Belum ada produk yang dipilih. Silakan cari produk di atas.
          </div>
        </div>

        <!-- Total summary and checkout -->
        <div style="border-top:1.5px dashed var(--outline-variant); padding-top:16px; margin-top:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <span style="font-size:14px; font-weight:700; color:var(--on-surface);">Total Penjualan</span>
            <span id="sell-cart-total" style="font-family:'Plus Jakarta Sans',sans-serif; font-size:22px; font-weight:800; color:var(--green-600);">Rp 0</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="sell-date">Tanggal</label>
            <input type="date" id="sell-date" class="form-input" value="${Utils.todayForInput()}"/>
          </div>

          <button type="submit" id="btn-save-sale" class="btn-cta" style="margin-top:12px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
            Simpan Penjualan
          </button>
          <button type="button" onclick="App.navigate('dashboard')" class="btn btn-ghost btn-full" style="margin-top:4px">Batal</button>
        </div>
      </form>
    `;
  },

  _html() {
    const isManual = this._mode === 'manual';

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div style="display:flex;align-items:center;gap:12px">
            <button onclick="App.navigate('dashboard')" class="back-btn" style="border-radius:10px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1>Tambah Pemasukan</h1>
              <div class="subtitle">Catat uang masuk ke kas warung</div>
            </div>
          </div>
          <button onclick="App.navigate('history')" class="back-btn" title="Histori Transaksi" style="border-radius:12px; position:relative;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="bell-badge" style="display:none;"></span>
          </button>
        </div>
      </div>

      <!-- Mode switcher tabs -->
      <div class="pill-tab-container" style="margin: 20px 20px 0; padding-bottom: 0;">
        <button class="pill-tab ${isManual ? 'active' : ''}" onclick="IncomePage.setMode('manual')" style="flex:1;">Input Manual</button>
        <button class="pill-tab ${!isManual ? 'active' : ''}" onclick="IncomePage.setMode('product')" style="flex:1;">Pilih Produk</button>
      </div>

      <div id="income-form-container" style="padding: 0 0 24px;">
        ${isManual ? this._manualFormHtml() : this._productFormHtml()}
      </div>
    `;
  },

  _bind(container) {
    if (this._mode === 'manual') {
      this._bindManual(container);
    } else {
      this._bindProduct(container);
    }
  },

  _bindManual(container) {
    const amtInput = container.querySelector('#income-amount');
    const wordsEl  = container.querySelector('#income-words');
    const catInput = container.querySelector('#income-cat');

    if (!amtInput) return;

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

  _bindProduct(container) {
    const searchInput = container.querySelector('#sell-prod-search');
    const resultsEl = container.querySelector('#sell-prod-results');

    this.renderCart();

    if (searchInput) {
      // Direct local instant filtering (No API requests on keystroke)
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          resultsEl.style.display = 'none';
          resultsEl.innerHTML = '';
          return;
        }

        const matches = (this._products || []).filter(p => 
          p.name.toLowerCase().includes(query) || 
          (p.barcode && p.barcode.includes(query))
        );

        if (matches.length === 0) {
          resultsEl.style.display = 'flex';
          resultsEl.innerHTML = `<div style="padding: 12px; font-size:13px; color:var(--on-surface-variant); text-align:center;">Produk tidak ditemukan</div>`;
          return;
        }

        resultsEl.style.display = 'flex';
        resultsEl.innerHTML = matches.map(p => `
          <div class="search-result-item" data-id="${p.id}" style="padding: 10px 12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(196,197,217,0.12); cursor:pointer; border-radius: 8px;">
            <div>
              <div style="font-size:13.5px; font-weight:700; color:var(--on-surface);">${Utils.escHtml(p.name)}</div>
              <div style="font-size:11px; color:var(--outline);">${Utils.escHtml(p.category || 'Sembako')} &bull; Stok: ${p.stock}</div>
            </div>
            <div style="font-size:13.5px; font-weight:800; color:var(--primary-600);">${Utils.formatRupiah(p.selling_price)}</div>
          </div>
        `).join('');

        resultsEl.querySelectorAll('.search-result-item').forEach(el => {
          el.addEventListener('mouseover', () => { el.style.background = 'var(--surface-container)'; });
          el.addEventListener('mouseout', () => { el.style.background = 'transparent'; });
          el.addEventListener('click', () => {
            const pid = el.dataset.id;
            IncomePage.addToCart(pid, this._products);
            searchInput.value = '';
            resultsEl.style.display = 'none';
            resultsEl.innerHTML = '';
          });
        });
      });

      // Click outside to hide results
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsEl.contains(e.target)) {
          resultsEl.style.display = 'none';
        }
      });
    }

    const saleForm = container.querySelector('#sell-product-form');
    if (saleForm) {
      saleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (this._cart.length === 0) {
          Toast.warning('Keranjang belanja masih kosong');
          return;
        }

        const date = container.querySelector('#sell-date').value;
        let totalAmount = 0;
        let descParts = [];

        // Pre-validate stocks
        for (const item of this._cart) {
          const remaining = item.stock - item.qty;
          if (remaining < 0) {
            Toast.warning(`Stok ${item.name} tidak cukup. Tersedia: ${item.stock}`);
            return;
          }
          totalAmount += item.price * item.qty;
          descParts.push(`${item.name} (x${item.qty} | Beli:${item.purchase_price} Jual:${item.price})`);
        }

        const description = "Jual: " + descParts.join(', ');

        try {
          // 1. Add Pemasukan
          await Api.addTransaction({
            type: 'income',
            amount: totalAmount,
            description: description,
            category: 'Penjualan',
            transaction_date: date
          });

          // 2. Decrement stock in DB
          for (const item of this._cart) {
            const originalProd = this._products.find(p => p.id === item.id);
            if (originalProd) {
              const newStock = originalProd.stock - item.qty;
              await Api.updateProduct(item.id, {
                ...originalProd,
                stock: newStock
              });
            }
          }

          Toast.success('✓ Penjualan berhasil disimpan dan stok ter-update');
          this._cart = [];
          App.navigate('dashboard');
        } catch (err) {
          Toast.error('Gagal menyimpan penjualan: ' + err.message);
        }
      });
    }
  },

  addToCart(productId, productsList) {
    const p = productsList.find(x => x.id === productId);
    if (!p) return;

    if (p.stock <= 0) {
      Toast.warning(`Stok ${p.name} kosong, tidak dapat dijual`);
      return;
    }

    const existing = this._cart.find(item => item.id === productId);
    if (existing) {
      if (existing.qty >= p.stock) {
        Toast.warning(`Stok ${p.name} tidak mencukupi untuk menambah kuantitas (Maksimal: ${p.stock})`);
        return;
      }
      existing.qty += 1;
    } else {
      this._cart.push({
        id: p.id,
        name: p.name,
        price: p.selling_price,
        purchase_price: p.purchase_price || 0,
        stock: p.stock,
        qty: 1
      });
    }

    this.renderCart();
  },

  updateQty(id, delta) {
    const item = this._cart.find(x => x.id === id);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
      this.removeFromCart(id);
    } else {
      if (newQty > item.stock) {
        Toast.warning(`Stok ${item.name} tidak mencukupi (Maksimal: ${item.stock})`);
        return;
      }
      item.qty = newQty;
      this.renderCart();
    }
  },

  removeFromCart(id) {
    this._cart = this._cart.filter(x => x.id !== id);
    this.renderCart();
  },

  renderCart() {
    const listEl = document.getElementById('sell-cart-items');
    const emptyEl = document.getElementById('sell-cart-empty');
    const totalEl = document.getElementById('sell-cart-total');

    if (!listEl) return;

    if (this._cart.length === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      totalEl.textContent = 'Rp 0';
      return;
    }

    emptyEl.style.display = 'none';
    let total = 0;

    listEl.innerHTML = this._cart.map(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      return `
        <div style="background:var(--white); border:1.5px solid rgba(196,197,217,0.18); border-radius:18px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:12px; box-shadow:var(--shadow-xs);">
          <div style="min-width:0; flex:1;">
            <div style="font-size:13.5px; font-weight:700; color:var(--on-surface); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${Utils.escHtml(item.name)}</div>
            <div style="font-size:11px; color:var(--outline); margin-top:2px;">
              ${Utils.formatRupiah(item.price)} &bull; Stok: ${item.stock}
            </div>
          </div>
          
          <!-- Qty Adjuster -->
          <div style="display:flex; align-items:center; gap:8px; background:var(--surface-container-low); border:1.5px solid var(--outline-variant); border-radius:12px; padding:2px 8px;">
            <button type="button" onclick="IncomePage.updateQty('${item.id}', -1)" style="border:none; background:none; color:var(--on-surface); font-weight:bold; cursor:pointer; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:16px; outline:none;">-</button>
            <span style="font-size:13px; font-weight:700; min-width:16px; text-align:center;">${item.qty}</span>
            <button type="button" onclick="IncomePage.updateQty('${item.id}', 1)" style="border:none; background:none; color:var(--on-surface); font-weight:bold; cursor:pointer; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:16px; outline:none;">+</button>
          </div>

          <div style="text-align:right; min-width:70px; flex-shrink:0;">
            <div style="font-size:13.5px; font-weight:800; color:var(--on-surface);">${Utils.formatRupiah(subtotal)}</div>
          </div>
          
          <button type="button" onclick="IncomePage.removeFromCart('${item.id}')" style="border:none; background:none; color:var(--red-600); cursor:pointer; padding:6px; display:flex; align-items:center; justify-content:center;" title="Hapus">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      `;
    }).join('');

    totalEl.textContent = Utils.formatRupiah(total);
  },

  _startScanSale() {
    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <h2>Scan Barcode Produk</h2>
        <button class="modal-close" onclick="IncomePage._closeModalAndStopScanner()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div id="sale-scanner-view" style="width: 100%; height: 260px; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 16px;"></div>
      <button type="button" onclick="IncomePage._closeModalAndStopScanner()" class="btn btn-ghost btn-full">Batal</button>
    `;

    App.openModal(html);

    this._scanner = new Html5Qrcode("sale-scanner-view");
    const config = { fps: 10, qrbox: { width: 250, height: 180 } };

    this._scanner.start(
      { facingMode: "environment" },
      config,
      async (decodedText) => {
        this.playBeep();

        if (this._scanner) {
          try {
            await this._scanner.stop();
          } catch(e) {}
          this._scanner = null;
        }
        App.closeModal();

        try {
          const products = await Api.getProducts();
          const p = products.find(x => x.barcode === decodedText);
          if (p) {
            IncomePage.addToCart(p.id, products);
            Toast.success(`Keranjang ditambahkan: ${p.name}`);
          } else {
            Toast.warning(`Barcode tidak terdaftar: ${decodedText}`);
          }
        } catch (err) {
          Toast.error("Gagal memproses barcode: " + err.message);
        }
      },
      (err) => {
        // Quiet mode errors
      }
    ).catch(err => {
      console.error(err);
      Toast.error("Gagal membuka kamera: " + err);
      App.closeModal();
      this._scanner = null;
    });
  },

  _closeModalAndStopScanner() {
    if (this._scanner) {
      this._scanner.stop().then(() => {
        this._scanner = null;
        App.closeModal();
      }).catch(() => {
        this._scanner = null;
        App.closeModal();
      });
    } else {
      App.closeModal();
    }
  },

  playBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 150);
    } catch (e) {
      console.error("Audio beep error:", e);
    }
  }
};

window.IncomePage = IncomePage;
