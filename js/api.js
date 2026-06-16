/**
 * api.js v2 — API bridge + LocalStorage mock (updated field names)
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzBTWZ8gm032_u3QKykn1yOS9kBNJoiu1RDXdjz_GMoI-XPxGiV5ao2dFI71EeAS0j-/exec';
const DEMO_MODE = localStorage.getItem('demo_mode') !== 'false';

const _DB = {
  TRX: 'km_trx',
  DEBTS: 'km_debts',
  PAYMENTS: 'km_pays',
  PRODUCTS: 'km_products',
  SEEDED: 'km_seeded',
};

const MockDB = {
  _g(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } },
  _s(k, v) { localStorage.setItem(k, JSON.stringify(v)); },

  seed() {
    if (localStorage.getItem(_DB.SEEDED)) return;
    const t = Utils.todayISO();
    const y1 = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); })();
    const y3 = (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().slice(0, 10); })();

    this._s(_DB.TRX, [
      { id: 'TRX-1', store_id: 'default', type: 'income', amount: 250000, description: 'Jual beras 5kg + gula', category: 'Penjualan', transaction_date: t, created_at: new Date().toISOString() },
      { id: 'TRX-2', store_id: 'default', type: 'income', amount: 75000, description: 'Jual minyak goreng', category: 'Penjualan', transaction_date: t, created_at: new Date().toISOString() },
      { id: 'TRX-3', store_id: 'default', type: 'expense', amount: 50000, description: 'Beli plastik kresek', category: 'Belanja Stok', transaction_date: t, created_at: new Date().toISOString() },
      { id: 'TRX-4', store_id: 'default', type: 'income', amount: 180000, description: 'Jual sembako campur', category: 'Penjualan', transaction_date: y1, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'TRX-5', store_id: 'default', type: 'expense', amount: 30000, description: 'Bayar listrik token', category: 'Listrik & Air', transaction_date: y1, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'TRX-6', store_id: 'default', type: 'income', amount: 320000, description: 'Jual beras + telur', category: 'Penjualan', transaction_date: y3, created_at: new Date(Date.now() - 259200000).toISOString() },
      { id: 'TRX-7', store_id: 'default', type: 'expense', amount: 150000, description: 'Gaji pegawai harian', category: 'Gaji/Upah', transaction_date: y3, created_at: new Date(Date.now() - 259200000).toISOString() },
    ]);

    this._s(_DB.DEBTS, [
      { id: 'DEBT-1', store_id: 'default', customer_name: 'Ibu Sari', amount_total: 150000, amount_paid: 50000, amount_remaining: 100000, status: 'partial', description: 'Beras 10kg', debt_date: y1, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'DEBT-2', store_id: 'default', customer_name: 'Pak Budi', amount_total: 75000, amount_paid: 0, amount_remaining: 75000, status: 'unpaid', description: 'Minyak + gula', debt_date: y3, created_at: new Date(Date.now() - 259200000).toISOString() },
      { id: 'DEBT-3', store_id: 'default', customer_name: 'Bu Dewi', amount_total: 200000, amount_paid: 200000, amount_remaining: 0, status: 'paid', description: 'Lunas', debt_date: y3, created_at: new Date(Date.now() - 259200000).toISOString() },
    ]);

    this._s(_DB.PAYMENTS, [
      { id: 'PAY-1', debt_id: 'DEBT-1', amount: 50000, payment_date: Utils.todayISO(), note: '', created_at: new Date().toISOString() },
      { id: 'PAY-2', debt_id: 'DEBT-3', amount: 200000, payment_date: y3, note: 'Lunas sekaligus', created_at: new Date(Date.now() - 259200000).toISOString() },
    ]);

    this._s(_DB.PRODUCTS, [
      { id: 'PROD-1', store_id: 'default', barcode: '8999999002231', name: 'Beras Pandan Wangi 5kg', stock: 15, purchase_price: 68000, selling_price: 75000, category: 'Sembako', created_at: new Date().toISOString() },
      { id: 'PROD-2', store_id: 'default', barcode: '8998888110022', name: 'Minyak Goreng Sunco 2L', stock: 24, purchase_price: 32000, selling_price: 36000, category: 'Minyak & Gula', created_at: new Date().toISOString() },
      { id: 'PROD-3', store_id: 'default', barcode: '8997777220033', name: 'Gula Pasir Gulaku 1kg', stock: 30, purchase_price: 14000, selling_price: 16000, category: 'Minyak & Gula', created_at: new Date().toISOString() },
    ]);

    localStorage.setItem(_DB.SEEDED, '1');
  },

  resetDemo() {
    [_DB.TRX, _DB.DEBTS, _DB.PAYMENTS, _DB.PRODUCTS, _DB.SEEDED].forEach(k => localStorage.removeItem(k));
    this.seed();
  },

  // ---- Transactions ----
  getTransactions(filter = 'all', type = 'all') {
    let rows = this._g(_DB.TRX);
    const t = Utils.todayISO();

    if (filter === 'today') rows = rows.filter(r => r.transaction_date === t);
    else if (filter === 'week') {
      const w = new Date(); w.setDate(w.getDate() - 7);
      const ws = w.toISOString().slice(0, 10);
      rows = rows.filter(r => r.transaction_date >= ws && r.transaction_date <= t);
    } else if (filter === 'month') {
      rows = rows.filter(r => String(r.transaction_date).startsWith(t.slice(0, 7)));
    }

    if (type !== 'all') rows = rows.filter(r => r.type === type);
    return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getSummary() {
    const t = Utils.todayISO();
    const rows = this._g(_DB.TRX);
    const debts = this._g(_DB.DEBTS);
    const todayR = rows.filter(r => r.transaction_date === t);
    const inc = todayR.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
    const exp = todayR.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);
    const active = debts.filter(d => d.status !== 'paid');
    return {
      date: t,
      today_income: inc,
      today_expense: exp,
      today_balance: inc - exp,
      active_debt_total: active.reduce((s, d) => s + Number(d.amount_remaining), 0),
      active_debt_count: active.length,
    };
  },

  addTransaction(data) {
    const rows = this._g(_DB.TRX);
    const row = { id: Utils.genId('TRX'), store_id: data.store_id || 'default', type: data.type, amount: Number(data.amount), description: data.description || '', category: data.category || '', transaction_date: data.transaction_date || Utils.todayISO(), created_at: new Date().toISOString() };
    rows.unshift(row);
    this._s(_DB.TRX, rows);
    return row;
  },

  deleteTransaction(id) {
    this._s(_DB.TRX, this._g(_DB.TRX).filter(r => r.id !== id));
    return { deleted: id };
  },

  getReport(period = 'daily') {
    const t = Utils.todayISO();
    const rows = this._g(_DB.TRX);
    const debts = this._g(_DB.DEBTS);
    const pays = this._g(_DB.PAYMENTS);

    const inPeriod = r => {
      const d = r.transaction_date || r.payment_date;
      if (period === 'daily') return d === t;
      if (period === 'weekly') { const w = new Date(); w.setDate(w.getDate() - 7); return d >= w.toISOString().slice(0, 10) && d <= t; }
      if (period === 'monthly') return String(d).startsWith(t.slice(0, 7));
      return true;
    };

    const filtered = rows.filter(inPeriod);
    const inc = filtered.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
    const exp = filtered.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);

    const catMap = {};
    filtered.filter(r => r.type === 'expense').forEach(r => {
      const c = r.category || 'Lainnya';
      catMap[c] = (catMap[c] || 0) + Number(r.amount);
    });
    const cats = Object.entries(catMap).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);

    const active = debts.filter(d => d.status !== 'paid');
    const paidPeriod = pays.filter(inPeriod).reduce((s, r) => s + Number(r.amount), 0);

    return {
      period,
      total_income: inc,
      total_expense: exp,
      net_balance: inc - exp,
      transaction_count: filtered.length,
      active_debt_total: active.reduce((s, d) => s + Number(d.amount_remaining), 0),
      active_debt_count: active.length,
      debt_paid_period: paidPeriod,
      expense_categories: cats,
    };
  },

  // ---- Debts ----
  getDebts(status = 'all') {
    let rows = this._g(_DB.DEBTS);
    if (status !== 'all') rows = rows.filter(d => d.status === status);
    return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  addDebt(data) {
    const rows = this._g(_DB.DEBTS);
    const amt = Number(data.initial_amount || data.amount_total);
    const row = { id: Utils.genId('DEBT'), store_id: data.store_id || 'default', customer_name: data.customer_name, amount_total: amt, amount_paid: 0, amount_remaining: amt, status: 'unpaid', description: data.description || '', debt_date: data.debt_date || Utils.todayISO(), created_at: new Date().toISOString() };
    rows.unshift(row);
    this._s(_DB.DEBTS, rows);
    return row;
  },

  deleteDebt(id) {
    this._s(_DB.DEBTS, this._g(_DB.DEBTS).filter(d => d.id !== id));
    this._s(_DB.PAYMENTS, this._g(_DB.PAYMENTS).filter(p => p.debt_id !== id));
    return { deleted: id };
  },

  addDebtPayment(data) {
    const debts = this._g(_DB.DEBTS);
    const idx = debts.findIndex(d => d.id === data.debt_id);
    if (idx === -1) throw new Error('Kasbon tidak ditemukan');

    const debt = debts[idx];
    const pay = Number(data.amount);
    const newPaid = Number(debt.amount_paid) + pay;
    const newRem = Math.max(0, Number(debt.amount_total) - newPaid);
    const newSt = newRem === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

    debts[idx] = { ...debt, amount_paid: newPaid, amount_remaining: newRem, status: newSt };
    this._s(_DB.DEBTS, debts);

    const pays = this._g(_DB.PAYMENTS);
    const payRow = { id: Utils.genId('PAY'), debt_id: data.debt_id, amount: pay, payment_date: data.payment_date || Utils.todayISO(), note: data.note || '', created_at: new Date().toISOString() };
    pays.unshift(payRow);
    this._s(_DB.PAYMENTS, pays);
    return payRow;
  },

  getDebtPayments(debtId) {
    return this._g(_DB.PAYMENTS).filter(p => p.debt_id === debtId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  login(email, password) {
    return { id: 'USR-MOCK', name: 'Pemilik Toko (Demo)', email: email, store_id: 'default' };
  },

  register(name, email, password) {
    return { id: 'USR-MOCK', name: name, email: email, store_id: 'default' };
  },

  getProducts() {
    return this._g(_DB.PRODUCTS).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  addProduct(data) {
    const rows = this._g(_DB.PRODUCTS);
    const row = {
      id: Utils.genId('PROD'),
      store_id: data.store_id || 'default',
      barcode: data.barcode || '',
      name: data.name || '',
      stock: Number(data.stock || 0),
      purchase_price: Number(data.purchase_price || 0),
      selling_price: Number(data.selling_price || 0),
      category: data.category || '',
      created_at: new Date().toISOString()
    };
    rows.unshift(row);
    this._s(_DB.PRODUCTS, rows);
    return row;
  },

  updateProduct(id, data) {
    const rows = this._g(_DB.PRODUCTS);
    const idx = rows.findIndex(r => r.id === id);
    if (idx !== -1) {
      rows[idx] = {
        ...rows[idx],
        barcode: data.barcode || '',
        name: data.name || '',
        stock: Number(data.stock || 0),
        purchase_price: Number(data.purchase_price || 0),
        selling_price: Number(data.selling_price || 0),
        category: data.category || ''
      };
      this._s(_DB.PRODUCTS, rows);
      return rows[idx];
    }
    throw new Error('Produk tidak ditemukan');
  },

  deleteProduct(id) {
    this._s(_DB.PRODUCTS, this._g(_DB.PRODUCTS).filter(r => r.id !== id));
    return { deleted: id };
  },
};
const ApiCache = {
  _cache: {},
  get(key) { return this._cache[key]; },
  set(key, val) { this._cache[key] = val; },
  clear() { this._cache = {}; }
};

// ---- API Facade ----
const Api = {
  _baseUrl: APPS_SCRIPT_URL,
  _loadingListeners: [],
  _isLoading: false,

  onLoadingChange(fn) { this._loadingListeners.push(fn); },
  _setLoading(val) { this._isLoading = val; this._loadingListeners.forEach(fn => fn(val)); },

  async _fetch(action, params = {}) {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${this._baseUrl}?${qs}`, { method: 'GET', redirect: 'follow' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Request failed');
    return json.data;
  },

  async _post(action, body = {}) {
    const res = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action, ...body }), redirect: 'follow' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Server error');
    return json.data;
  },

  async _call(fn) {
    this._setLoading(true);
    try {
      return await fn();
    } finally {
      this._setLoading(false);
    }
  },

  // ---- Endpoints ----
  async getSummary() {
    const key = 'getSummary';
    const cached = ApiCache.get(key);
    if (cached) return cached;
    const res = await this._call(() => DEMO_MODE ? MockDB.getSummary() : this._fetch('getSummary', { store_id: App.storeId() }));
    ApiCache.set(key, res);
    return res;
  },

  async getTransactions(f = 'all', t = 'all') {
    const key = `getTransactions_${f}_${t}`;
    const cached = ApiCache.get(key);
    if (cached) return cached;
    const res = await this._call(() => DEMO_MODE ? MockDB.getTransactions(f, t) : this._fetch('getTransactions', { store_id: App.storeId(), filter: f, type: t }));
    if (res && res.length > 0) {
      const lastViewed = localStorage.getItem('lm_last_viewed_history');
      const latestTime = res[0].created_at || res[0].date;
      if (!lastViewed || new Date(latestTime) > new Date(lastViewed)) {
        localStorage.setItem('lm_has_unread_trx', '1');
      }
    }
    ApiCache.set(key, res);
    return res;
  },

  async addTransaction(data) {
    ApiCache.clear();
    localStorage.setItem('lm_has_unread_trx', '1');
    return this._call(() => DEMO_MODE ? MockDB.addTransaction(data) : this._post('addTransaction', { ...data, store_id: App.storeId() }));
  },

  async deleteTransaction(id) {
    ApiCache.clear();
    return this._call(() => DEMO_MODE ? MockDB.deleteTransaction(id) : this._post('deleteTransaction', { id }));
  },

  async getDebts(s = 'all') {
    const key = `getDebts_${s}`;
    const cached = ApiCache.get(key);
    if (cached) return cached;
    const res = await this._call(() => DEMO_MODE ? MockDB.getDebts(s) : this._fetch('getDebts', { store_id: App.storeId(), status: s }));
    ApiCache.set(key, res);
    return res;
  },

  async addDebt(data) {
    ApiCache.clear();
    return this._call(() => DEMO_MODE ? MockDB.addDebt(data) : this._post('addDebt', { ...data, store_id: App.storeId() }));
  },

  async deleteDebt(id) {
    ApiCache.clear();
    return this._call(() => DEMO_MODE ? MockDB.deleteDebt(id) : this._post('deleteDebt', { id }));
  },

  async addDebtPayment(data) {
    ApiCache.clear();
    localStorage.setItem('lm_has_unread_trx', '1');
    return this._call(() => DEMO_MODE ? MockDB.addDebtPayment(data) : this._post('addDebtPayment', data));
  },

  async getDebtPayments(debtId) {
    const key = `getDebtPayments_${debtId}`;
    const cached = ApiCache.get(key);
    if (cached) return cached;
    const res = await this._call(() => DEMO_MODE ? MockDB.getDebtPayments(debtId) : this._fetch('getDebtDetail', { debt_id: debtId }).then(d => d.payments));
    ApiCache.set(key, res);
    return res;
  },

  async markDebtPaid(id) {
    ApiCache.clear();
    localStorage.setItem('lm_has_unread_trx', '1');
    return this._call(() => DEMO_MODE ? MockDB.markDebtPaid(id) : this._post('markDebtPaid', { debt_id: id }));
  },

  async getReport(p = 'daily') {
    const key = `getReport_${p}`;
    const cached = ApiCache.get(key);
    if (cached) return cached;
    const res = await this._call(() => DEMO_MODE ? MockDB.getReport(p) : this._fetch('getReport', { store_id: App.storeId(), period: p }));
    ApiCache.set(key, res);
    return res;
  },

  async login(email, password) {
    ApiCache.clear();
    return this._call(() => this._post('login', { email, password }));
  },

  async register(name, email, password) {
    ApiCache.clear();
    return this._call(() => this._post('register', { name, email, password }));
  },

  async getProducts() {
    const key = 'getProducts';
    const cached = ApiCache.get(key);
    if (cached) return cached;
    const res = await this._call(() => DEMO_MODE ? MockDB.getProducts() : this._fetch('getProducts', { store_id: App.storeId() }));
    ApiCache.set(key, res);
    return res;
  },

  async addProduct(data) {
    ApiCache.clear();
    return this._call(() => DEMO_MODE ? MockDB.addProduct(data) : this._post('addProduct', { ...data, store_id: App.storeId() }));
  },

  async updateProduct(id, data) {
    ApiCache.clear();
    return this._call(() => DEMO_MODE ? MockDB.updateProduct(id, data) : this._post('updateProduct', { id, ...data, store_id: App.storeId() }));
  },

  async deleteProduct(id) {
    ApiCache.clear();
    return this._call(() => DEMO_MODE ? MockDB.deleteProduct(id) : this._post('deleteProduct', { id }));
  },
};

window.Api = Api;
window.MockDB = MockDB;
window.DEMO_MODE = DEMO_MODE;
