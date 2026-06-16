/**
 * product.js v1 — Halaman Manajemen Produk, CRUD, dan Scan Barcode
 */

const ProductPage = {
  _searchQuery: '',
  _selectedCategory: 'all',
  _scanner: null,
  _homeScanner: null,

  async render(container) {
    container.innerHTML = this._skeleton();
    try {
      const products = await Api.getProducts();
      container.innerHTML = this._html(products);
      this._bind(container, products);
      App.updateBellBadge();
    } catch (e) {
      container.innerHTML = this._errorHtml(e.message);
    }
  },

  _skeleton() {
    return `
      <div class="page-header">
        <div class="skeleton" style="height:20px;width:110px;margin-bottom:6px;border-radius:6px"></div>
        <div class="skeleton" style="height:12px;width:80px;border-radius:4px"></div>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <div class="skeleton" style="height:48px;border-radius:20px"></div>
        <div class="skeleton" style="height:44px;border-radius:16px"></div>
        ${[1,2,3].map(()=>`<div class="skeleton" style="height:80px;border-radius:20px"></div>`).join('')}
      </div>
    `;
  },

  _html(products) {
    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    const filtered = products.filter(p => {
      const matchesSearch = !this._searchQuery || 
        p.name.toLowerCase().includes(this._searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(this._searchQuery));
      const matchesCat = this._selectedCategory === 'all' || p.category === this._selectedCategory;
      return matchesSearch && matchesCat;
    });

    const listHtml = filtered.length === 0
      ? `<div class="empty-state" style="padding:40px 20px">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <h3>Produk tidak ditemukan</h3>
          <p>Coba kata kunci lain atau tambah produk baru</p>
        </div>`
      : filtered.map(p => this._productRow(p)).join('');

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h1>Daftar Produk</h1>
            <div class="subtitle">${products.length} produk terdaftar</div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="App.navigate('history')" class="btn btn-outline btn-icon" style="padding: 10px; border-radius: 12px; border: 1.5px solid var(--outline-variant); background: var(--surface-container-low); display: flex; align-items: center; justify-content: center; position: relative;" title="Histori Transaksi">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="bell-badge" style="display:none;"></span>
            </button>
            <button onclick="ProductPage._startScanHome()" class="btn btn-outline btn-icon" style="padding: 10px; border-radius: 12px; border: 1.5px solid var(--outline-variant); background: var(--surface-container-low); display: flex; align-items: center; justify-content: center;" title="Scan Barcode">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10M12 7v10"/></svg>
            </button>
            <button onclick="ProductPage._showAddModal()" class="btn btn-primary btn-sm" style="border-radius:12px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;margin-right:4px"><path d="M12 5v14M5 12h14"/></svg>
              Tambah
            </button>
          </div>
        </div>
      </div>

      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <!-- Search Bar -->
        <div class="search-bar-container" style="margin-bottom: 0px">
          <svg class="search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" class="search-bar-input" id="prod-search" placeholder="Cari nama atau barcode..." value="${Utils.escHtml(this._searchQuery)}" autocomplete="off"/>
        </div>

        <!-- Pill Tab Filter -->
        <div class="pill-tab-container" style="margin-bottom: 4px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
          ${categories.map(c => {
            const isActive = this._selectedCategory === c;
            const label = c === 'all' ? 'Semua' : c;
            return `<button class="pill-tab ${isActive ? 'active' : ''}" onclick="ProductPage._setCategory('${c}')" style="white-space: nowrap;">${Utils.escHtml(label)}</button>`;
          }).join('')}
        </div>

        <!-- Product List -->
        <div style="display:flex;flex-direction:column;gap:10px" id="product-list">
          ${listHtml}
        </div>

        <div style="height:24px"></div>
      </div>
    `;
  },

  _productRow(p) {
    const stock = Number(p.stock || 0);
    let stockBadgeColor = 'var(--green-600)';
    let stockBgColor = 'rgba(22,163,74,0.08)';
    if (stock === 0) {
      stockBadgeColor = 'var(--red-600)';
      stockBgColor = 'rgba(186,26,26,0.07)';
    } else if (stock <= 5) {
      stockBadgeColor = '#d97706'; // Amber-600
      stockBgColor = 'rgba(217,119,6,0.08)';
    }

    const buyPrice = Number(p.purchase_price || 0);
    const sellPrice = Number(p.selling_price || 0);
    const margin = sellPrice - buyPrice;
    const marginPct = buyPrice > 0 ? Math.round((margin / buyPrice) * 100) : 0;

    return `
      <div class="trx-card" onclick="ProductPage._showEditModal('${p.id}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; gap:12px; align-items:center; min-width:0; flex:1">
          <div class="trx-icon" style="background:var(--surface-container); color:var(--primary-600); border-radius:14px; width:40px; height:40px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          </div>
          <div style="min-width:0; flex:1">
            <div class="trx-desc" style="font-size:14px; font-weight:700; color:var(--on-surface); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${Utils.escHtml(p.name)}</div>
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:2px;">
              ${p.category ? `<span class="badge" style="background:var(--surface-container-high); color:var(--on-surface-variant); font-size:10px; padding:1px 6px; border-radius:4px;">${Utils.escHtml(p.category)}</span>` : ''}
              ${p.barcode ? `<span style="font-size:11px; color:var(--on-surface-variant); opacity:0.6; display:flex; align-items:center; gap:2px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 20h2M10 20h4M18 20h2M4 4h2M10 4h4M18 4h2M4 8v8M8 8v8M12 8v8M16 8v8M20 8v8"/></svg>
                ${Utils.escHtml(p.barcode)}
              </span>` : ''}
            </div>
          </div>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div style="display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:8px; background:${stockBgColor}; color:${stockBadgeColor}; margin-bottom:4px;">
            Stok: ${stock}
          </div>
          <div style="font-size:12px; font-weight:600; color:var(--on-surface-variant); opacity:0.8;">
            Jual: <span style="font-weight:700; color:var(--on-surface);">${Utils.formatRupiah(sellPrice)}</span>
          </div>
          <div style="font-size:10px; color:var(--green-600); font-weight:600; margin-top:1px;">
            Profit: ${Utils.formatRupiah(margin)} (${marginPct}%)
          </div>
        </div>
      </div>
    `;
  },

  _bind(container, products) {
    const searchInput = container.querySelector('#prod-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this._searchQuery = e.target.value;
        this._updateList(container, products);
      }, 250));
    }
  },

  _updateList(container, products) {
    const listContainer = container.querySelector('#product-list');
    if (!listContainer) return;
    
    const filtered = products.filter(p => {
      const matchesSearch = !this._searchQuery || 
        p.name.toLowerCase().includes(this._searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(this._searchQuery));
      const matchesCat = this._selectedCategory === 'all' || p.category === this._selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="padding:40px 20px">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <h3>Produk tidak ditemukan</h3>
          <p>Coba kata kunci lain atau tambah produk baru</p>
        </div>`;
    } else {
      listContainer.innerHTML = filtered.map(p => this._productRow(p)).join('');
    }
  },

  _setCategory(cat) {
    this._selectedCategory = cat;
    App.navigate('product');
  },

  _errorHtml(msg) {
    return `
      <div style="padding:64px 24px;text-align:center">
        <div style="width:60px;height:60px;background:var(--red-100);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700;color:var(--on-surface);margin-bottom:8px">Gagal memuat data</h3>
        <p style="font-size:13px;color:var(--on-surface-variant);margin-bottom:24px;line-height:1.6">${Utils.escHtml(msg)}</p>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('product')">Coba Lagi</button>
      </div>
    `;
  },

  async _showAddModal(prefilledBarcode = '') {
    const products = await Api.getProducts();
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    if (categories.indexOf('Sembako') === -1) categories.push('Sembako');
    if (categories.indexOf('Makanan') === -1) categories.push('Makanan');
    if (categories.indexOf('Minuman') === -1) categories.push('Minuman');

    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <h2>Tambah Produk Baru</h2>
        <button class="modal-close" onclick="ProductPage._closeModalAndStopScanner()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <form id="add-product-form" style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">Barcode / Kode Barang</label>
          <div style="display:flex;gap:8px;">
            <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl);flex:1">
              <span style="padding:0 12px;display:flex;align-items:center;color:var(--outline);flex-shrink:0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h2M10 20h4M18 20h2M4 4h2M10 4h4M18 4h2M4 8v8M8 8v8M12 8v8M16 8v8M20 8v8"/></svg>
              </span>
              <input type="text" id="prod-barcode" class="form-input" style="border:none;background:transparent;height:44px;outline:none;padding:0;margin:0;" placeholder="Scan atau ketik manual..." value="${Utils.escHtml(prefilledBarcode)}" autocomplete="off"/>
            </div>
            <button type="button" onclick="ProductPage._startScanField('prod-barcode')" class="btn btn-outline" style="padding:0 12px; border-radius:14px; height:48px; border:1.5px solid var(--outline-variant); background:var(--surface-container-low); display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
        </div>

        <!-- Inline Scanner Container -->
        <div id="scanner-view-container" style="display:none; flex-direction:column; gap:8px; margin-top:4px; border:1.5px dashed var(--outline-variant); border-radius:12px; padding:10px; background:var(--surface-container-low);">
          <div id="scanner-view" style="width:100%; height:200px; background:#000; border-radius:8px; overflow:hidden;"></div>
          <button type="button" class="btn btn-sm btn-ghost" onclick="ProductPage._stopFieldScanner()" style="margin:0; width:100%; color:var(--red-600);">Hentikan Kamera</button>
        </div>

        <div class="form-group">
          <label class="form-label">Nama Barang <span class="required">*</span></label>
          <input type="text" id="prod-name" class="form-input" placeholder="Nama barang" autocomplete="off" required maxlength="80"/>
        </div>

        <div class="form-group">
          <label class="form-label">Jumlah / Stok <span class="required">*</span></label>
          <input type="number" id="prod-stock" class="form-input" placeholder="0" value="0" min="0" autocomplete="off" required/>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Harga Beli Satuan <span class="required">*</span></label>
            <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl)">
              <span style="padding:0 12px;font-weight:600;color:var(--outline);font-size:14px;flex-shrink:0">Rp</span>
              <input type="text" id="prod-buy" inputmode="numeric" style="flex:1;border:none;background:transparent;height:44px;font-size:14px;font-weight:700;outline:none;font-family:inherit;color:var(--on-surface)" placeholder="0" autocomplete="off" required/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Jual Satuan <span class="required">*</span></label>
            <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl)">
              <span style="padding:0 12px;font-weight:600;color:var(--outline);font-size:14px;flex-shrink:0">Rp</span>
              <input type="text" id="prod-sell" inputmode="numeric" style="flex:1;border:none;background:transparent;height:44px;font-size:14px;font-weight:700;outline:none;font-family:inherit;color:var(--on-surface)" placeholder="0" autocomplete="off" required/>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Kategori <span class="required">*</span></label>
          <input type="text" id="prod-category" class="form-input" placeholder="Ketik kategori atau pilih di bawah..." autocomplete="off" required maxlength="50"/>
          <div class="chip-scroll" style="margin-top:8px; display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;">
            ${categories.map(c => `<button type="button" class="chip" onclick="document.getElementById('prod-category').value='${Utils.escHtml(c)}'; document.querySelectorAll('#add-product-form .chip').forEach(x=>x.classList.remove('active')); this.classList.add('active');">${Utils.escHtml(c)}</button>`).join('')}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">
          <button type="button" onclick="ProductPage._closeModalAndStopScanner()" class="btn btn-ghost">Batal</button>
          <button type="submit" class="btn-cta">Simpan</button>
        </div>
      </form>
    `;

    App.openModal(html);
    const modal = document.getElementById('app-modal');
    const buyInput = modal.querySelector('#prod-buy');
    const sellInput = modal.querySelector('#prod-sell');

    buyInput.addEventListener('input', () => Utils.formatInputRupiah(buyInput));
    sellInput.addEventListener('input', () => Utils.formatInputRupiah(sellInput));

    // Focus initial input
    setTimeout(() => {
      if (prefilledBarcode) {
        modal.querySelector('#prod-name').focus();
      } else {
        modal.querySelector('#prod-barcode').focus();
      }
    }, 150);

    modal.querySelector('#add-product-form').addEventListener('submit', async e => {
      e.preventDefault();
      const barcode = modal.querySelector('#prod-barcode').value.trim();
      const name = modal.querySelector('#prod-name').value.trim();
      const stock = parseInt(modal.querySelector('#prod-stock').value || 0);
      const purchase_price = parseInt(buyInput.dataset.rawValue || 0);
      const selling_price = parseInt(sellInput.dataset.rawValue || 0);
      const category = modal.querySelector('#prod-category').value.trim();

      if (!name) { Toast.warning('Nama barang wajib diisi'); return; }
      if (purchase_price <= 0) { Toast.warning('Harga beli harus lebih dari 0'); return; }
      if (selling_price <= 0) { Toast.warning('Harga jual harus lebih dari 0'); return; }
      if (selling_price < purchase_price) { Toast.warning('Harga jual tidak boleh kurang dari harga beli'); return; }
      if (!category) { Toast.warning('Kategori wajib diisi'); return; }

      try {
        await Api.addProduct({ barcode, name, stock, purchase_price, selling_price, category });
        App.closeModal();
        Toast.success(`Produk ${name} berhasil ditambahkan`);
        App.navigate('product');
      } catch (err) {
        Toast.error('Gagal menyimpan produk: ' + err.message);
      }
    });
  },

  async _showEditModal(id) {
    const products = await Api.getProducts();
    const p = products.find(x => x.id === id);
    if (!p) { Toast.error('Produk tidak ditemukan'); return; }

    const categories = [...new Set(products.map(x => x.category).filter(Boolean))];
    if (categories.indexOf('Sembako') === -1) categories.push('Sembako');
    if (categories.indexOf('Makanan') === -1) categories.push('Makanan');
    if (categories.indexOf('Minuman') === -1) categories.push('Minuman');

    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <h2>Ubah Produk</h2>
        <button class="modal-close" onclick="ProductPage._closeModalAndStopScanner()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <form id="edit-product-form" style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">Barcode / Kode Barang</label>
          <div style="display:flex;gap:8px;">
            <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl);flex:1">
              <span style="padding:0 12px;display:flex;align-items:center;color:var(--outline);flex-shrink:0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h2M10 20h4M18 20h2M4 4h2M10 4h4M18 4h2M4 8v8M8 8v8M12 8v8M16 8v8M20 8v8"/></svg>
              </span>
              <input type="text" id="prod-barcode" class="form-input" style="border:none;background:transparent;height:44px;outline:none;padding:0;margin:0;" placeholder="Scan atau ketik manual..." value="${Utils.escHtml(p.barcode || '')}" autocomplete="off"/>
            </div>
            <button type="button" onclick="ProductPage._startScanField('prod-barcode')" class="btn btn-outline" style="padding:0 12px; border-radius:14px; height:48px; border:1.5px solid var(--outline-variant); background:var(--surface-container-low); display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
        </div>

        <!-- Inline Scanner Container -->
        <div id="scanner-view-container" style="display:none; flex-direction:column; gap:8px; margin-top:4px; border:1.5px dashed var(--outline-variant); border-radius:12px; padding:10px; background:var(--surface-container-low);">
          <div id="scanner-view" style="width:100%; height:200px; background:#000; border-radius:8px; overflow:hidden;"></div>
          <button type="button" class="btn btn-sm btn-ghost" onclick="ProductPage._stopFieldScanner()" style="margin:0; width:100%; color:var(--red-600);">Hentikan Kamera</button>
        </div>

        <div class="form-group">
          <label class="form-label">Nama Barang <span class="required">*</span></label>
          <input type="text" id="prod-name" class="form-input" placeholder="Nama barang" autocomplete="off" required value="${Utils.escHtml(p.name)}" maxlength="80"/>
        </div>

        <div class="form-group">
          <label class="form-label">Jumlah / Stok <span class="required">*</span></label>
          <input type="number" id="prod-stock" class="form-input" placeholder="0" value="${p.stock}" min="0" autocomplete="off" required/>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Harga Beli Satuan <span class="required">*</span></label>
            <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl)">
              <span style="padding:0 12px;font-weight:600;color:var(--outline);font-size:14px;flex-shrink:0">Rp</span>
              <input type="text" id="prod-buy" inputmode="numeric" style="flex:1;border:none;background:transparent;height:44px;font-size:14px;font-weight:700;outline:none;font-family:inherit;color:var(--on-surface)" placeholder="0" autocomplete="off" required data-raw-value="${p.purchase_price}" value="${Number(p.purchase_price).toLocaleString('id-ID')}"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Jual Satuan <span class="required">*</span></label>
            <div style="display:flex;align-items:center;background:var(--surface-container-low);border:1.5px solid var(--outline-variant);border-radius:var(--radius-xl)">
              <span style="padding:0 12px;font-weight:600;color:var(--outline);font-size:14px;flex-shrink:0">Rp</span>
              <input type="text" id="prod-sell" inputmode="numeric" style="flex:1;border:none;background:transparent;height:44px;font-size:14px;font-weight:700;outline:none;font-family:inherit;color:var(--on-surface)" placeholder="0" autocomplete="off" required data-raw-value="${p.selling_price}" value="${Number(p.selling_price).toLocaleString('id-ID')}"/>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Kategori <span class="required">*</span></label>
          <input type="text" id="prod-category" class="form-input" placeholder="Ketik kategori atau pilih di bawah..." autocomplete="off" required value="${Utils.escHtml(p.category || '')}" maxlength="50"/>
          <div class="chip-scroll" style="margin-top:8px; display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;">
            ${categories.map(c => {
              const isActive = p.category === c;
              return `<button type="button" class="chip ${isActive ? 'active' : ''}" onclick="document.getElementById('prod-category').value='${Utils.escHtml(c)}'; document.querySelectorAll('#edit-product-form .chip').forEach(x=>x.classList.remove('active')); this.classList.add('active');">${Utils.escHtml(c)}</button>`;
            }).join('')}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button type="button" onclick="ProductPage._closeModalAndStopScanner()" class="btn btn-ghost">Batal</button>
            <button type="submit" class="btn-cta">Simpan Perubahan</button>
          </div>
          <button type="button" onclick="ProductPage._deleteProduct('${p.id}', '${Utils.escHtml(p.name)}')" class="btn btn-ghost" style="color:var(--red-600); border:1.5px solid rgba(186,26,26,0.15); margin-top:4px; margin-bottom: 0px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            Hapus Produk
          </button>
        </div>
      </form>
    `;

    App.openModal(html);
    const modal = document.getElementById('app-modal');
    const buyInput = modal.querySelector('#prod-buy');
    const sellInput = modal.querySelector('#prod-sell');

    buyInput.addEventListener('input', () => Utils.formatInputRupiah(buyInput));
    sellInput.addEventListener('input', () => Utils.formatInputRupiah(sellInput));

    modal.querySelector('#edit-product-form').addEventListener('submit', async e => {
      e.preventDefault();
      const barcode = modal.querySelector('#prod-barcode').value.trim();
      const name = modal.querySelector('#prod-name').value.trim();
      const stock = parseInt(modal.querySelector('#prod-stock').value || 0);
      const purchase_price = parseInt(buyInput.dataset.rawValue || buyInput.value.replace(/[^0-9]/g, '') || 0);
      const selling_price = parseInt(sellInput.dataset.rawValue || sellInput.value.replace(/[^0-9]/g, '') || 0);
      const category = modal.querySelector('#prod-category').value.trim();

      if (!name) { Toast.warning('Nama barang wajib diisi'); return; }
      if (purchase_price <= 0) { Toast.warning('Harga beli harus lebih dari 0'); return; }
      if (selling_price <= 0) { Toast.warning('Harga jual harus lebih dari 0'); return; }
      if (selling_price < purchase_price) { Toast.warning('Harga jual tidak boleh kurang dari harga beli'); return; }
      if (!category) { Toast.warning('Kategori wajib diisi'); return; }

      try {
        await Api.updateProduct(id, { barcode, name, stock, purchase_price, selling_price, category });
        App.closeModal();
        Toast.success(`Produk ${name} berhasil diperbarui`);
        App.navigate('product');
      } catch (err) {
        Toast.error('Gagal memperbarui produk: ' + err.message);
      }
    });
  },

  async _deleteProduct(id, name) {
    App.confirm(`Hapus produk "${name}"? Tindakan ini tidak dapat dibatalkan.`, async () => {
      try {
        await Api.deleteProduct(id);
        App.closeModal();
        Toast.success(`Produk ${name} telah dihapus`);
        App.navigate('product');
      } catch (err) {
        Toast.error('Gagal menghapus produk: ' + err.message);
      }
    }, null, 'Hapus');
  },

  _startScanField(targetId) {
    const container = document.getElementById('scanner-view-container');
    if (!container) return;
    
    if (this._scanner) {
      this._stopFieldScanner();
      return;
    }

    container.style.display = 'flex';
    
    this._scanner = new Html5Qrcode("scanner-view");
    const config = { fps: 10, qrbox: { width: 250, height: 180 } };
    
    this._scanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        this.playBeep();
        document.getElementById(targetId).value = decodedText;
        this._stopFieldScanner();
        document.getElementById('prod-name')?.focus();
      },
      (err) => {
        // Quiet mode errors
      }
    ).catch(err => {
      console.error(err);
      Toast.error("Gagal membuka kamera: " + err);
      container.style.display = 'none';
      this._scanner = null;
    });
  },

  _stopFieldScanner() {
    const container = document.getElementById('scanner-view-container');
    if (container) container.style.display = 'none';
    
    if (this._scanner) {
      this._scanner.stop().then(() => {
        this._scanner = null;
      }).catch(err => {
        console.warn(err);
        this._scanner = null;
      });
    }
  },

  _startScanHome() {
    const html = `
      <div class="modal-drag-bar"></div>
      <div class="modal-title">
        <h2>Scan Barcode Produk</h2>
        <button class="modal-close" onclick="ProductPage._closeModalAndStopScanner()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div id="home-scanner-view" style="width: 100%; height: 260px; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 16px;"></div>
      <button type="button" onclick="ProductPage._closeModalAndStopScanner()" class="btn btn-ghost btn-full">Batal</button>
    `;

    App.openModal(html);
    
    this._homeScanner = new Html5Qrcode("home-scanner-view");
    const config = { fps: 10, qrbox: { width: 250, height: 180 } };
    
    this._homeScanner.start(
      { facingMode: "environment" },
      config,
      async (decodedText) => {
        this.playBeep();
        
        if (this._homeScanner) {
          try {
            await this._homeScanner.stop();
          } catch(e) {}
          this._homeScanner = null;
        }
        App.closeModal();

        try {
          const products = await Api.getProducts();
          const p = products.find(x => x.barcode === decodedText);
          if (p) {
            Toast.success("Produk ditemukan!");
            this._showEditModal(p.id);
          } else {
            Toast.info("Produk belum terdaftar. Membuka form tambah...");
            this._showAddModal(decodedText);
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
      this._homeScanner = null;
    });
  },

  _closeModalAndStopScanner() {
    this._stopFieldScanner();
    if (this._homeScanner) {
      this._homeScanner.stop().then(() => {
        this._homeScanner = null;
        App.closeModal();
      }).catch(() => {
        this._homeScanner = null;
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

window.ProductPage = ProductPage;
