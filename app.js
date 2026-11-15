import { t, setLang, getLang, applyI18n } from './i18n.js';
import * as store from './store.js';
import * as S from './stats.js';

const $ = (s) => document.querySelector(s);
const SKEY = 'pellet.settings';
const defaults = { lang: navigator.language?.startsWith('hu') ? 'hu' : 'en', horizon: 14, capacity: 4, levelAfter: '', kgPerBag: 15, defaultBags: 2, skipRestarts: true };
let settings = { ...defaults, ...JSON.parse(localStorage.getItem(SKEY) || '{}') };
let entries = [];
let editingId = null;
let unsub = null;
let unsubSettings = null;

const saveSettings = () => localStorage.setItem(SKEY, JSON.stringify(settings));
const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const toDateInput = (ts) => toLocalInput(ts).slice(0, 10);
const locale = () => (getLang() === 'hu' ? 'hu-HU' : 'en-GB');
const fmtDate = (ts) => new Date(ts).toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' });
const fmtNum = (n, d = 2) => n.toLocaleString(locale(), { maximumFractionDigits: d });

function getRange() {
  const f = $('#from').value, to = $('#to').value;
  return {
    from: f ? new Date(f + 'T00:00:00').getTime() : -Infinity,
    to: to ? new Date(to + 'T23:59:59.999').getTime() : Infinity,
  };
}

function resetForm() {
  editingId = null;
  $('#ts').value = toLocalInput(Date.now());
  $('#bags').value = settings.defaultBags;
  $('#cleaned').checked = false;
  $('#restarted').checked = false;
  $('#note').value = '';
  $('#formErr').textContent = '';
  $('#btnCancel').hidden = true;
  $('#formTitle').textContent = t('add');
  $('#btnSave').textContent = t('save');
}

function startEdit(e) {
  editingId = e.id;
  $('#ts').value = toLocalInput(e.ts);
  $('#bags').value = e.bags;
  $('#cleaned').checked = !!e.cleaned;
  $('#restarted').checked = !!e.restarted;
  $('#note').value = e.note || '';
  $('#btnCancel').hidden = false;
  $('#formTitle').textContent = t('edit');
  $('#btnSave').textContent = t('update');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function onSubmit(ev) {
  ev.preventDefault();
  const bags = Number($('#bags').value);
  if (!Number.isInteger(bags) || bags < 0) { $('#formErr').textContent = t('badBags'); return; }
  const entry = {
    ts: new Date($('#ts').value).getTime(),
    bags,
    cleaned: $('#cleaned').checked,
    restarted: $('#restarted').checked,
    note: $('#note').value.trim(),
  };
  if (!Number.isFinite(entry.ts)) return;
  try {
    if (editingId) await store.update(editingId, entry); else await store.add(entry);
    resetForm();
  } catch (err) { $('#formErr').textContent = String(err.message || err); }
}

function statRow(dl, label, value, sub) {
  const dt = document.createElement('dt'); dt.textContent = label;
  const dd = document.createElement('dd'); dd.textContent = value;
  if (sub) { const s = document.createElement('small'); s.textContent = sub; dd.append(s); }
  dl.append(dt, dd);
}

function rateText(r) {
  if (r == null) return ['—', t('noData')];
  return [`${fmtNum(r)} ${t('perDay')}`, `≈ ${fmtNum(r * settings.kgPerBag, 1)} ${t('kgDay')}`];
}

function renderStats(ranged, range) {
  const dl = $('#statsOut'); dl.replaceChildren();
  const end = Number.isFinite(range.to) ? Math.min(range.to, Date.now()) : Date.now();
  const plain = S.plainRate(ranged, settings.skipRestarts);
  const weighted = S.weightedRate(ranged, settings.horizon, end, settings.skipRestarts);
  let [v, s] = rateText(plain); statRow(dl, t('avgPlain'), v, s);
  [v, s] = rateText(weighted); statRow(dl, t('avgWeighted'), v, s);
  statRow(dl, t('totalBags'), String(ranged.reduce((a, e) => a + e.bags, 0)));
  statRow(dl, t('refills'), String(ranged.filter((e) => e.bags > 0).length));
  statRow(dl, t('cleanings'), String(ranged.filter((e) => e.cleaned).length));
  statRow(dl, t('restarts'), String(ranged.filter((e) => e.restarted).length));
  const sc = S.sinceClean(entries);
  if (sc) statRow(dl, t('sinceClean'), `${fmtNum(sc.days, 1)} ${t('daysUnit')}`, `${sc.bags} ${t('bagsUnit')} · ${fmtDate(sc.ts)}`);
  else statRow(dl, t('sinceClean'), '—', t('neverCleaned'));
  const rateAll = S.weightedRate(entries, settings.horizon, Date.now(), settings.skipRestarts);
  const p = S.predict(entries, rateAll, settings);
  if (p) statRow(dl, t('nextRefill'), (p.ts < Date.now() ? '⚠ ' : '') + fmtDate(p.ts), `${t('suggest', { n: p.bags })} · ${t(p.basis === 'level' ? 'basisLevel' : 'basisRoutine')}`);
  else statRow(dl, t('nextRefill'), '—', t('noData'));
}

function renderList(ranged) {
  const ul = $('#list'); ul.replaceChildren();
  if (!ranged.length) { const li = document.createElement('li'); li.textContent = t('empty'); ul.append(li); return; }
  for (const e of [...ranged].sort((a, b) => b.ts - a.ts)) {
    const li = document.createElement('li');
    const left = document.createElement('div');
    const top = document.createElement('div');
    const bags = document.createElement('strong'); bags.textContent = `${e.bags} ${t('bagsUnit')} `;
    top.append(bags);
    if (e.cleaned) { const c = document.createElement('span'); c.className = 'chip'; c.textContent = t('cleaned'); top.append(c); }
    if (e.restarted) { const c = document.createElement('span'); c.className = 'chip alt'; c.textContent = t('restarted'); top.append(c); }
    const meta = document.createElement('div'); meta.className = 'meta';
    meta.textContent = fmtDate(e.ts) + (e.note ? ` · ${e.note}` : '');
    left.append(top, meta);
    const acts = document.createElement('div'); acts.className = 'acts';
    const be = document.createElement('button'); be.className = 'ghost'; be.textContent = '✎'; be.onclick = () => startEdit(e);
    const bd = document.createElement('button'); bd.className = 'ghost'; bd.textContent = '🗑'; bd.title = t('del');
    bd.onclick = async () => { if (confirm(t('confirmDel'))) await store.remove(e.id); };
    acts.append(be, bd);
    li.append(left, acts);
    ul.append(li);
  }
}

function renderChart(ranged) {
  const svg = $('#chart'); svg.replaceChildren();
  const ns = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, text) => { const el = document.createElementNS(ns, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); if (text != null) el.textContent = text; svg.append(el); return el; };
  const iv = S.intervalsOf(ranged).map((x) => ({ ...x, rate: x.bags / x.dt }));
  $('#chartTitle').hidden = svg.style.display = iv.length ? '' : 'none';
  if (!iv.length) return;
  const W = 600, H = 150, L = 34, B = 22, T = 8;
  const max = Math.max(...iv.map((x) => x.rate)) * 1.1 || 1;
  mk('line', { x1: L, y1: H - B, x2: W, y2: H - B });
  mk('text', { x: 2, y: T + 8 }, fmtNum(max, 1));
  mk('text', { x: 2, y: H - B }, '0');
  const slot = (W - L) / iv.length, bw = Math.min(40, slot * 0.7);
  iv.forEach((x, i) => {
    const h = (x.rate / max) * (H - B - T);
    const cx = L + slot * i + slot / 2;
    const r = mk('rect', { class: x.restarted ? 'bar alt' : 'bar', x: cx - bw / 2, y: H - B - h, width: bw, height: h, rx: 3 });
    const title = document.createElementNS(ns, 'title');
    title.textContent = `${fmtDate(x.start)} → ${fmtDate(x.end)}: ${fmtNum(x.rate)} ${t('perDay')}`;
    r.append(title);
    if (iv.length <= 12 || i % Math.ceil(iv.length / 8) === 0)
      mk('text', { x: cx, y: H - 6, 'text-anchor': 'middle' }, new Date(x.end).toLocaleDateString(locale(), { day: 'numeric', month: 'short' }));
  });
}

function render() {
  const range = getRange();
  const ranged = entries.filter((e) => e.ts >= range.from && e.ts <= range.to);
  renderStats(ranged, range);
  renderChart(ranged);
  renderList(ranged);
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
function exportCsv() {
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const rows = [...entries].sort((a, b) => a.ts - b.ts).map((e) => [new Date(e.ts).toISOString(), e.bags, e.cleaned ? 1 : 0, e.restarted ? 1 : 0, q(e.note)].join(','));
  download('pellet-log.csv', ['iso_time,bags,cleaned,restarted,note', ...rows].join('\n'), 'text/csv');
}

function setPreset(days) {
  if (!days) { $('#from').value = ''; $('#to').value = ''; }
  else { $('#to').value = toDateInput(Date.now()); $('#from').value = toDateInput(Date.now() - (days - 1) * S.DAY); }
  render();
}

function applyLang() {
  setLang(settings.lang);
  $('#lang').value = settings.lang;
  applyI18n();
  if (!editingId) { $('#formTitle').textContent = t('add'); $('#btnSave').textContent = t('save'); }
  render();
}

function openSettings() {
  $('#sHorizon').value = settings.horizon;
  $('#sCapacity').value = settings.capacity;
  $('#sLevel').value = settings.levelAfter;
  $('#sKg').value = settings.kgPerBag;
  $('#sDefault').value = settings.defaultBags;
  $('#sSkip').checked = !!settings.skipRestarts;
  $('#settingsDlg').showModal();
}
function closeSettings() {
  const n = (id, d) => { const v = Number($(id).value); return Number.isFinite(v) && v > 0 ? v : d; };
  settings.horizon = n('#sHorizon', 14);
  settings.capacity = n('#sCapacity', 4);
  settings.levelAfter = $('#sLevel').value === '' ? '' : n('#sLevel', '');
  settings.kgPerBag = n('#sKg', 15);
  settings.defaultBags = Math.max(0, Math.round(Number($('#sDefault').value) || 0));
  settings.skipRestarts = $('#sSkip').checked;
  saveSettings();
  const { lang, ...shared } = settings;
  store.saveSettings(shared).catch((err) => console.error(err));
  if (!editingId) $('#bags').value = settings.defaultBags;
  render();
}

function showApp() {
  $('#login').hidden = true;
  $('#app').hidden = false;
  $('#banner').hidden = store.isCloud;
  $('#btnLogout').hidden = !store.isCloud;
  resetForm();
  unsub?.();
  unsub = store.subscribe((list) => { entries = list; render(); });
  unsubSettings?.();
  unsubSettings = store.subscribeSettings((remote) => {
    const { lang, ...shared } = remote || {};
    settings = { ...settings, ...shared };
    saveSettings();
    if (!editingId) $('#bags').value = settings.defaultBags;
    render();
  });
}

async function boot() {
  applyLang();
  $('#lang').onchange = (e) => { settings.lang = e.target.value; saveSettings(); applyLang(); };
  $('#btnSettings').onclick = openSettings;
  $('#settingsDlg').addEventListener('close', closeSettings);
  $('#entryForm').onsubmit = onSubmit;
  $('#btnCancel').onclick = resetForm;
  $('#btnNow').onclick = () => ($('#ts').value = toLocalInput(Date.now()));
  $('#bMinus').onclick = () => ($('#bags').value = Math.max(0, (Number($('#bags').value) || 0) - 1));
  $('#bPlus').onclick = () => ($('#bags').value = (Number($('#bags').value) || 0) + 1);
  $('#from').onchange = $('#to').onchange = render;
  document.querySelectorAll('[data-days]').forEach((b) => (b.onclick = () => setPreset(Number(b.dataset.days))));
  $('#btnCsv').onclick = exportCsv;
  $('#btnJson').onclick = () => download('pellet-log.json', JSON.stringify(entries, null, 2), 'application/json');
  $('#btnLogout').onclick = async () => { unsub?.(); unsubSettings?.(); await store.logout(); $('#app').hidden = true; $('#login').hidden = false; };
  $('#loginForm').onsubmit = async (ev) => {
    ev.preventDefault();
    try { await store.login($('#pw').value); $('#pw').value = ''; $('#loginErr').textContent = ''; showApp(); }
    catch { $('#loginErr').textContent = t('wrongPw'); }
  };
  await store.init();
  if (store.needsLogin()) $('#login').hidden = false; else showApp();
}
boot();
