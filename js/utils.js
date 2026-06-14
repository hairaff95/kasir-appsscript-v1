/**
 * utils.js v2 — Helper functions
 */

const Utils = {
  formatRupiah(n) {
    if (n === null || n === undefined || isNaN(n)) return 'Rp 0';
    return 'Rp ' + Math.abs(Number(n)).toLocaleString('id-ID');
  },

  parseRupiah(str) {
    if (!str) return 0;
    return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
  },

  formatInputRupiah(input) {
    const raw = input.value.replace(/[^0-9]/g, '');
    if (!raw) { input.value = ''; input.dataset.rawValue = '0'; return; }
    const num = parseInt(raw);
    input.dataset.rawValue = num;
    input.value = num.toLocaleString('id-ID');
  },

  formatRupiahInWords(n) {
    n = Number(n);
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.0', '') + ' Miliar';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace('.0', '') + ' Juta';
    if (n >= 1_000)         return (n / 1_000).toFixed(1).replace('.0', '') + ' Ribu';
    return '';
  },

  todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  todayForInput() { return this.todayISO(); },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(String(dateStr).length === 10 ? dateStr + 'T00:00:00' : dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  formatDateRelative(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(String(dateStr).length === 10 ? dateStr + 'T00:00:00' : dateStr);
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const target = new Date(d); target.setHours(0,0,0,0);
    if (target.getTime() === today.getTime())     return 'Hari Ini';
    if (target.getTime() === yesterday.getTime()) return 'Kemarin';
    return this.formatDate(dateStr);
  },

  formatDateLong(dateStr) {
    const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  debtPercent(debt) {
    const total = Number(debt.amount_total || debt.initial_amount || 0);
    const paid  = Number(debt.amount_paid  || 0);
    if (!total) return 0;
    return Math.min(100, Math.round((paid / total) * 100));
  },

  genId(prefix = 'ID') {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  },

  truncate(str, max = 40) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '…' : str;
  },

  debounce(fn, ms = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
  },
};

window.Utils = Utils;
