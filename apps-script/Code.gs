/**
 * KASIR MINI — Google Apps Script Backend v2
 * ==========================================
 * Deploy: Extensions > Apps Script > Deploy > New Deployment
 * Type: Web App | Execute as: Me | Access: Anyone
 */

// ========== CONFIGURATION ==========
const SHEET_TRANSACTIONS   = 'Transactions';
const SHEET_DEBTS          = 'CustomerDebts';
const SHEET_PAYMENTS       = 'DebtPayments';
const SHEET_USERS          = 'Users';
const SHEET_CONFIG         = 'Config';
const SHEET_PRODUCTS       = 'Products';

const HEADERS = {
  Transactions:  ['id','store_id','type','amount','description','category','transaction_date','created_at'],
  CustomerDebts: ['id','store_id','customer_name','amount_total','amount_paid','amount_remaining','status','description','debt_date','created_at'],
  DebtPayments:  ['id','debt_id','amount','payment_date','note','created_at'],
  Users:         ['id','name','email','password_hash','store_id','created_at'],
  Config:        ['key','value'],
  Products:      ['id','store_id','barcode','name','stock','purchase_price','selling_price','category','created_at'],
};

// ========== CORS & RESPONSE ==========

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function respond(data, code) {
  var output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  // Note: GAS Web Apps don't support setting arbitrary response headers via createTextOutput
  // CORS is handled at the Apps Script infrastructure level for simple requests
  return output;
}

function ok(data) {
  return respond({ success: true, data: data });
}

function fail(msg, code) {
  return respond({ success: false, error: msg || 'Unknown error' });
}

// ========== SHEET HELPERS ==========

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(name) {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = HEADERS[name];
    if (headers) {
      sheet.appendRow(headers);
      var hRange = sheet.getRange(1, 1, 1, headers.length);
      hRange.setBackground('#F97316').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function initAllSheets() {
  Object.keys(HEADERS).forEach(function(name) { getOrCreateSheet(name); });
}

function getSheetData(sheetName) {
  var sheet = getOrCreateSheet(sheetName);
  var data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      var val = row[i];
      if (val instanceof Date) {
        if (h === 'created_at') {
          val = val.toISOString();
        } else {
          val = Utilities.formatDate(val, 'Asia/Jakarta', 'yyyy-MM-dd');
        }
      }
      obj[h] = val;
    });
    return obj;
  });
}

/**
 * Append a row to a sheet (values in header order)
 */
function appendRow(sheetName, rowData) {
  var sheet   = getOrCreateSheet(sheetName);
  var headers = HEADERS[sheetName];
  var row     = headers.map(function(h) { return rowData[h] !== undefined ? rowData[h] : ''; });
  sheet.appendRow(row);
}

/**
 * Update a row by id field
 * Returns true if found and updated
 */
function updateRow(sheetName, id, updatedData) {
  var sheet   = getOrCreateSheet(sheetName);
  var data    = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx   = headers.indexOf('id');
  if (idIdx === -1) return false;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(id)) {
      Object.keys(updatedData).forEach(function(key) {
        var colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updatedData[key]);
        }
      });
      return true;
    }
  }
  return false;
}

/**
 * Delete a row by id field
 */
function deleteRow(sheetName, id) {
  var sheet  = getOrCreateSheet(sheetName);
  var data   = sheet.getDataRange().getValues();
  var idIdx  = data[0].indexOf('id');
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idIdx]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// ========== UTILITIES ==========

function generateId(prefix) {
  var ts   = new Date().getTime();
  var rand = Math.floor(Math.random() * 100000);
  return (prefix || 'ID') + '-' + ts + '-' + rand;
}

function formatDate(date) {
  var d      = date ? new Date(date) : new Date();
  var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function todayStr() {
  return Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
}

function hashPassword(password) {
  // Simple hash — in production use a proper bcrypt alternative
  var bytes  = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return bytes.map(function(b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');
}

// ========== doGet ==========

function doGet(e) {
  try {
    initAllSheets();
    var params = e.parameter || {};
    var action = params.action || '';

    if (action === 'getTransactions') return handleGetTransactions(params);
    if (action === 'getSummary')      return handleGetSummary(params);
    if (action === 'getDebts')        return handleGetDebts(params);
    if (action === 'getDebtDetail')   return handleGetDebtDetail(params);
    if (action === 'getReport')       return handleGetReport(params);
    if (action === 'getProducts')     return handleGetProducts(params);
    if (action === 'ping')            return ok({ message: 'Kasir Mini API OK', time: new Date().toISOString() });

    return fail('Unknown action: ' + action);
  } catch (ex) {
    Logger.log(ex);
    return fail('Server error: ' + ex.message);
  }
}

// ========== doPost ==========

function doPost(e) {
  try {
    initAllSheets();
    var body   = JSON.parse(e.postData.contents || '{}');
    var action = body.action || '';

    if (action === 'addTransaction')  return handleAddTransaction(body);
    if (action === 'deleteTransaction') return handleDeleteTransaction(body);
    if (action === 'addDebt')         return handleAddDebt(body);
    if (action === 'addDebtPayment')  return handleAddDebtPayment(body);
    if (action === 'markDebtPaid')    return handleMarkDebtPaid(body);
    if (action === 'deleteDebt')      return handleDeleteDebt(body);
    if (action === 'login')           return handleLogin(body);
    if (action === 'register')        return handleRegister(body);
    if (action === 'addProduct')      return handleAddProduct(body);
    if (action === 'updateProduct')   return handleUpdateProduct(body);
    if (action === 'deleteProduct')   return handleDeleteProduct(body);
    if (action === 'saveReportToDrive') return handleSaveReportToDrive(body);

    return fail('Unknown action: ' + action);
  } catch (ex) {
    Logger.log(ex);
    return fail('Server error: ' + ex.message);
  }
}

// ========== GET HANDLERS ==========

function handleGetTransactions(params) {
  var storeId = params.store_id || '';
  var filter  = params.filter   || 'all';
  var type    = params.type     || 'all';

  var rows  = getSheetData(SHEET_TRANSACTIONS);
  var today = todayStr();

  // Filter by store
  if (storeId) rows = rows.filter(function(r) { return String(r.store_id) === String(storeId); });

  // Filter by period
  rows = rows.filter(function(r) {
    var d = String(r.transaction_date).substring(0, 10);
    if (filter === 'today') return d === today;
    if (filter === 'week') {
      var w = new Date(); w.setDate(w.getDate() - 7);
      var ws = Utilities.formatDate(w, 'Asia/Jakarta', 'yyyy-MM-dd');
      return d >= ws && d <= today;
    }
    if (filter === 'month') return d.substring(0,7) === today.substring(0,7);
    return true;
  });

  // Filter by type
  if (type !== 'all') rows = rows.filter(function(r) { return r.type === type; });

  // Sort newest first
  rows.sort(function(a,b) {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return ok(rows);
}

function handleGetSummary(params) {
  var storeId    = params.store_id || '';
  var targetDate = params.date     || todayStr();

  var txRows  = getSheetData(SHEET_TRANSACTIONS);
  if (storeId) txRows = txRows.filter(function(r) { return String(r.store_id) === String(storeId); });

  var todayTx   = txRows.filter(function(r) { return String(r.transaction_date).substring(0,10) === targetDate; });
  var todayInc  = todayTx.filter(function(r) { return r.type === 'income';  }).reduce(function(s,r) { return s + Number(r.amount); }, 0);
  var todayExp  = todayTx.filter(function(r) { return r.type === 'expense'; }).reduce(function(s,r) { return s + Number(r.amount); }, 0);

  var debtRows   = getSheetData(SHEET_DEBTS);
  if (storeId) debtRows = debtRows.filter(function(r) { return String(r.store_id) === String(storeId); });

  var activeDebts = debtRows.filter(function(r) { return r.status !== 'paid'; });
  var debtTotal   = activeDebts.reduce(function(s,r) { return s + Number(r.amount_remaining); }, 0);

  return ok({
    date:              targetDate,
    today_income:      todayInc,
    today_expense:     todayExp,
    today_balance:     todayInc - todayExp,
    active_debt_total: debtTotal,
    active_debt_count: activeDebts.length,
  });
}

function handleGetDebts(params) {
  var storeId = params.store_id || '';
  var status  = params.status   || 'all';

  var rows = getSheetData(SHEET_DEBTS);
  if (storeId) rows = rows.filter(function(r) { return String(r.store_id) === String(storeId); });
  if (status !== 'all') rows = rows.filter(function(r) { return r.status === status; });

  rows.sort(function(a,b) { return new Date(b.created_at) - new Date(a.created_at); });
  return ok(rows);
}

function handleGetDebtDetail(params) {
  var debtId = params.debt_id || '';
  if (!debtId) return fail('debt_id diperlukan');

  var debts   = getSheetData(SHEET_DEBTS);
  var debt    = debts.find(function(d) { return String(d.id) === String(debtId); });
  if (!debt) return fail('Kasbon tidak ditemukan');

  var payments = getSheetData(SHEET_PAYMENTS).filter(function(p) { return String(p.debt_id) === String(debtId); });
  payments.sort(function(a,b) { return new Date(b.created_at) - new Date(a.created_at); });

  return ok({ debt: debt, payments: payments });
}

function handleGetReport(params) {
  var storeId = params.store_id || '';
  var period  = params.period   || 'daily';
  var date    = params.date     || todayStr();

  var txRows = getSheetData(SHEET_TRANSACTIONS);
  if (storeId) txRows = txRows.filter(function(r) { return String(r.store_id) === String(storeId); });

  var filtered = txRows.filter(function(r) {
    var d = String(r.transaction_date).substring(0,10);
    if (period === 'daily')   return d === date;
    if (period === 'weekly') {
      var w = new Date(date); w.setDate(w.getDate() - 7);
      var ws = Utilities.formatDate(w, 'Asia/Jakarta', 'yyyy-MM-dd');
      return d >= ws && d <= date;
    }
    if (period === 'monthly') return d.substring(0,7) === date.substring(0,7);
    return true;
  });

  var totalIncome  = filtered.filter(function(r) { return r.type === 'income'; }).reduce(function(s,r) { return s+Number(r.amount); }, 0);
  var totalExpense = filtered.filter(function(r) { return r.type === 'expense'; }).reduce(function(s,r) { return s+Number(r.amount); }, 0);

  // Category breakdown for expenses
  var catMap = {};
  filtered.filter(function(r) { return r.type === 'expense'; }).forEach(function(r) {
    var cat = r.category || 'Lainnya';
    catMap[cat] = (catMap[cat] || 0) + Number(r.amount);
  });
  var categories = Object.keys(catMap).map(function(k) { return { category: k, amount: catMap[k] }; })
    .sort(function(a,b) { return b.amount - a.amount; });

  var debtRows  = getSheetData(SHEET_DEBTS);
  if (storeId) debtRows = debtRows.filter(function(r) { return String(r.store_id) === String(storeId); });
  var activeDebt      = debtRows.filter(function(r) { return r.status !== 'paid'; });
  var activeDebtTotal = activeDebt.reduce(function(s,r) { return s+Number(r.amount_remaining); }, 0);

  var payRows = getSheetData(SHEET_PAYMENTS);
  var paidPeriod = payRows.filter(function(r) {
    var d = String(r.payment_date).substring(0,10);
    if (period === 'daily')   return d === date;
    if (period === 'weekly') {
      var w = new Date(date); w.setDate(w.getDate()-7);
      var ws = Utilities.formatDate(w, 'Asia/Jakarta', 'yyyy-MM-dd');
      return d >= ws && d <= date;
    }
    if (period === 'monthly') return d.substring(0,7) === date.substring(0,7);
    return true;
  }).reduce(function(s,r) { return s+Number(r.amount); }, 0);

  return ok({
    period:            period,
    total_income:      totalIncome,
    total_expense:     totalExpense,
    net_balance:       totalIncome - totalExpense,
    transaction_count: filtered.length,
    active_debt_total: activeDebtTotal,
    active_debt_count: activeDebt.length,
    debt_paid_period:  paidPeriod,
    expense_categories: categories,
  });
}

// ========== POST HANDLERS ==========

function handleAddTransaction(body) {
  if (!body.amount || !body.type) return fail('amount dan type diperlukan');
  if (body.type !== 'income' && body.type !== 'expense') return fail('type harus income atau expense');

  var id  = generateId('TRX');
  var now = new Date().toISOString();
  var row = {
    id:               id,
    store_id:         body.store_id || 'default',
    type:             body.type,
    amount:           Number(body.amount),
    description:      body.description || '',
    category:         body.category || '',
    transaction_date: body.transaction_date || todayStr(),
    created_at:       now,
  };
  appendRow(SHEET_TRANSACTIONS, row);
  return ok(row);
}

function handleDeleteTransaction(body) {
  if (!body.id) return fail('id diperlukan');
  var deleted = deleteRow(SHEET_TRANSACTIONS, body.id);
  if (!deleted) return fail('Transaksi tidak ditemukan');
  return ok({ deleted: body.id });
}

function handleAddDebt(body) {
  if (!body.customer_name || !body.amount_total) return fail('customer_name dan amount_total diperlukan');
  var amount = Number(body.amount_total);
  var id     = generateId('DEBT');
  var now    = new Date().toISOString();
  var row    = {
    id:               id,
    store_id:         body.store_id || 'default',
    customer_name:    body.customer_name,
    amount_total:     amount,
    amount_paid:      0,
    amount_remaining: amount,
    status:           'unpaid',
    description:      body.description || '',
    debt_date:        body.debt_date || todayStr(),
    created_at:       now,
  };
  appendRow(SHEET_DEBTS, row);
  return ok(row);
}

function handleAddDebtPayment(body) {
  if (!body.debt_id || !body.amount) return fail('debt_id dan amount diperlukan');

  var debts  = getSheetData(SHEET_DEBTS);
  var debt   = debts.find(function(d) { return String(d.id) === String(body.debt_id); });
  if (!debt) return fail('Kasbon tidak ditemukan');

  var payAmount  = Number(body.amount);
  var newPaid    = Number(debt.amount_paid)  + payAmount;
  var newRemain  = Math.max(0, Number(debt.amount_total) - newPaid);
  var newStatus  = newRemain === 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');

  // Update debt
  updateRow(SHEET_DEBTS, body.debt_id, {
    amount_paid:      newPaid,
    amount_remaining: newRemain,
    status:           newStatus,
  });

  // Record payment
  var payId = generateId('PAY');
  var now   = new Date().toISOString();
  var payRow = {
    id:           payId,
    debt_id:      body.debt_id,
    amount:       payAmount,
    payment_date: body.payment_date || todayStr(),
    note:         body.note || '',
    created_at:   now,
  };
  appendRow(SHEET_PAYMENTS, payRow);

  return ok({ payment: payRow, debt_remaining: newRemain, debt_status: newStatus });
}

function handleMarkDebtPaid(body) {
  if (!body.debt_id) return fail('debt_id diperlukan');

  var debts = getSheetData(SHEET_DEBTS);
  var debt  = debts.find(function(d) { return String(d.id) === String(body.debt_id); });
  if (!debt) return fail('Kasbon tidak ditemukan');

  updateRow(SHEET_DEBTS, body.debt_id, {
    amount_paid:      Number(debt.amount_total),
    amount_remaining: 0,
    status:           'paid',
  });

  return ok({ debt_id: body.debt_id, status: 'paid' });
}

function handleDeleteDebt(body) {
  if (!body.id) return fail('id diperlukan');
  deleteRow(SHEET_DEBTS, body.id);
  // Also remove related payments
  var pays = getSheetData(SHEET_PAYMENTS).filter(function(p) { return String(p.debt_id) === String(body.id); });
  pays.forEach(function(p) { deleteRow(SHEET_PAYMENTS, p.id); });
  return ok({ deleted: body.id });
}

function handleLogin(body) {
  if (!body.email || !body.password) return fail('email dan password diperlukan');

  var users = getSheetData(SHEET_USERS);
  var hash  = hashPassword(body.password);
  var user  = users.find(function(u) {
    return String(u.email).toLowerCase() === String(body.email).toLowerCase()
        && String(u.password_hash) === hash;
  });

  if (!user) return fail('Email atau password salah');

  return ok({
    id:       user.id,
    name:     user.name,
    email:    user.email,
    store_id: user.store_id,
  });
}

function handleRegister(body) {
  if (!body.name || !body.email || !body.password) return fail('name, email, dan password diperlukan');

  var users = getSheetData(SHEET_USERS);
  var exists = users.find(function(u) { return String(u.email).toLowerCase() === String(body.email).toLowerCase(); });
  if (exists) return fail('Email sudah terdaftar');

  var id       = generateId('USR');
  var storeId  = generateId('STR');
  var now      = new Date().toISOString();
  var row      = {
    id:            id,
    name:          body.name,
    email:         body.email,
    password_hash: hashPassword(body.password),
    store_id:      storeId,
    created_at:    now,
  };
  appendRow(SHEET_USERS, row);

  return ok({ id: id, name: body.name, email: body.email, store_id: storeId });
}

// ========== PRODUCT HANDLERS ==========

function handleGetProducts(params) {
  var storeId = params.store_id || '';
  var rows = getSheetData(SHEET_PRODUCTS);
  if (storeId) rows = rows.filter(function(r) { return String(r.store_id) === String(storeId); });
  rows.sort(function(a,b) { return new Date(b.created_at) - new Date(a.created_at); });
  return ok(rows);
}

function handleAddProduct(body) {
  if (!body.name) return fail('name diperlukan');
  var id = generateId('PROD');
  var now = new Date().toISOString();
  var row = {
    id: id,
    store_id: body.store_id || 'default',
    barcode: body.barcode || '',
    name: body.name,
    stock: Number(body.stock || 0),
    purchase_price: Number(body.purchase_price || 0),
    selling_price: Number(body.selling_price || 0),
    category: body.category || '',
    created_at: now
  };
  appendRow(SHEET_PRODUCTS, row);
  return ok(row);
}

function handleUpdateProduct(body) {
  if (!body.id) return fail('id diperlukan');
  var updateData = {
    barcode: body.barcode || '',
    name: body.name || '',
    stock: Number(body.stock || 0),
    purchase_price: Number(body.purchase_price || 0),
    selling_price: Number(body.selling_price || 0),
    category: body.category || ''
  };
  var updated = updateRow(SHEET_PRODUCTS, body.id, updateData);
  if (!updated) return fail('Produk tidak ditemukan');
  return ok({ id: body.id, updated: updateData });
}

function handleDeleteProduct(body) {
  if (!body.id) return fail('id diperlukan');
  var deleted = deleteRow(SHEET_PRODUCTS, body.id);
  if (!deleted) return fail('Produk tidak ditemukan');
  return ok({ deleted: body.id });
}

function handleSaveReportToDrive(body) {
  var email       = body.email;
  var transactions = body.transactions || [];
  var periodLabel  = body.period_label || 'Laporan';
  var storeName    = body.store_name   || 'LanggengMakmur';

  if (!email) return fail('Email penerima diperlukan');

  try {
    var fileName = storeName + ' — Laporan ' + periodLabel + ' (' +
      Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd') + ')';

    // 1. Create new Google Sheet in Drive
    var ss    = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Laporan');

    // --- Header block ---
    sheet.getRange('A1').setValue(fileName);
    sheet.getRange('A2').setValue(
      'Dibuat: ' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy HH:mm') + ' WIB'
    );
    sheet.getRange('A3').setValue('');

    // --- Summary ---
    var totalIncome  = 0;
    var totalExpense = 0;
    transactions.forEach(function(t) {
      if (t.type === 'income')  totalIncome  += Number(t.amount) || 0;
      if (t.type === 'expense') totalExpense += Number(t.amount) || 0;
    });
    var netBalance = totalIncome - totalExpense;
    var margin     = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

    var summaryData = [
      ['RINGKASAN KEUANGAN', ''],
      ['Total Pemasukan',    totalIncome],
      ['Total Pengeluaran',  totalExpense],
      ['Laba Bersih',        netBalance],
      ['Margin Keuntungan',  margin + '%'],
      ['', ''],
    ];
    sheet.getRange(4, 1, summaryData.length, 2).setValues(summaryData);

    // --- Transaction table header ---
    var startRow = 4 + summaryData.length;
    var tableHeader = [['No', 'Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Nominal (Rp)']];
    sheet.getRange(startRow, 1, 1, 6).setValues(tableHeader);

    // --- Transaction rows ---
    if (transactions.length > 0) {
      var rows = transactions.map(function(t, i) {
        return [
          i + 1,
          t.transaction_date || t.date || '',
          t.description      || '',
          t.category         || '',
          t.type === 'income' ? 'Masuk' : 'Keluar',
          t.type === 'income' ? Number(t.amount) : -Number(t.amount)
        ];
      });
      sheet.getRange(startRow + 1, 1, rows.length, 6).setValues(rows);
    }

    // --- Formatting ---
    sheet.getRange('A1').setFontSize(14).setFontWeight('bold');
    sheet.getRange('A4').setFontWeight('bold').setBackground('#f3f4f6');
    sheet.getRange(startRow, 1, 1, 6).setFontWeight('bold').setBackground('#1d4ed8').setFontColor('#ffffff');
    sheet.setColumnWidth(3, 250);
    sheet.autoResizeColumns(1, 6);

    SpreadsheetApp.flush();

    // 2. Share the file with the user's email as editor
    var file = DriveApp.getFileById(ss.getId());
    file.addEditor(email);

    return ok({
      fileUrl:  file.getUrl(),
      fileName: fileName,
      format:   'gsheet'
    });

  } catch (err) {
    Logger.log('handleSaveReportToDrive error: ' + err.message);
    return fail('Gagal menyimpan ke Google Drive: ' + err.message);
  }
}

/**
 * =====================================================
 * CARA MEMANGGIL DARI JAVASCRIPT FRONTEND
 * =====================================================
 *
 * const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
 *
 * // GET — Ambil data
 * async function getSummary(storeId) {
 *   const url = `${API_URL}?action=getSummary&store_id=${storeId}`;
 *   const res = await fetch(url, { redirect: 'follow' });
 *   return res.json();
 * }
 *
 * // POST — Simpan data
 * async function addTransaction(data) {
 *   const res = await fetch(API_URL, {
 *     method: 'POST',
 *     body: JSON.stringify({ action: 'addTransaction', ...data }),
 *     redirect: 'follow'
 *   });
 *   return res.json();
 * }
 *
 * // Contoh pemakaian:
 * const result = await getSummary('STR-123');
 * if (result.success) console.log(result.data);
 */
