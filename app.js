'use strict';

const LS_KEY = 'recipes_csv_url_v1';
const el = (id) => document.getElementById(id);

const state = {
  raw: [],
  list: [],
  selected: null,
  filters: {
    q: '',
    Category: 'Все',
    Type: 'Все',
    TimeBucket: 'Все',
    Scenario: 'Все',
    Method: 'Все',
    Diet: 'Все',
  },
};

function normStr(v) {
  return String(v ?? '').trim();
}
function toInt(v) {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
function splitTags(v) {
  // поддержка: "тег1, тег2" / "тег1; тег2" / переносы строк
  const s = normStr(v);
  if (!s) return [];
  return s
    .split(/[\n,;]+/g)
    .map((x) => normStr(x))
    .filter(Boolean);
}
function timeBucket(mins) {
  const m = toInt(mins);
  if (m === null) return '';
  if (m <= 20) return 'Быстро (до 20 минут)';
  if (m <= 45) return 'Средне (20–45 минут)';
  return 'Долго (45+ минут)';
}

// Динамическая “Meta-строка” как в Glide
function metaLine(r) {
  const parts = [];
  const cat = normStr(r.Category);
  const t = toInt(r['Time (min)']);
  const s = toInt(r.Servings);

  if (cat) parts.push(`КАТЕГОРИЯ: ${cat.toUpperCase()}`);
  if (t !== null) parts.push(`⏱ ${t} МИН`);
  if (s !== null) parts.push(`🍽 ${s} ПОРЦИИ`);

  return parts.join(' · ');
}

function pickPhoto(r) {
  // Photo Main может быть ссылкой, base64 или пустым — оставим как есть
  return normStr(r['Photo Main'] || r.Photo || r.Image || '');
}

function buildDerived(row) {
  const r = { ...row };
  r.TimeBucket = timeBucket(row['Time (min)']);
  r.TagsArr = splitTags(row.Tags || row.Tag || '');
  r.Meta = metaLine(r);
  r._photo = pickPhoto(r);
  r._name = normStr(r.Name || row.Title || '');
  r._ingredients = normStr(r.Ingredients || '');
  r._steps = normStr(r.Steps || '');
  return r;
}

function setSelectOptions(sel, values) {
  const all = ['Все', ...values];
  sel.innerHTML = '';
  for (const v of all) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  }
}

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru'));
}

function applyFilters() {
  const q = normStr(state.filters.q).toLowerCase();
  const f = state.filters;

  state.list = state.raw.filter((r) => {
    if (f.Category !== 'Все' && normStr(r.Category) !== f.Category) return false;
    if (f.Type !== 'Все' && normStr(r.Type) !== f.Type) return false;
    if (f.TimeBucket !== 'Все' && normStr(r.TimeBucket) !== f.TimeBucket) return false;

    if (f.Scenario !== 'Все') {
      if (!r.TagsArr.includes(f.Scenario)) return false;
    }
    if (f.Method !== 'Все') {
      if (!r.TagsArr.includes(f.Method)) return false;
    }
    if (f.Diet !== 'Все') {
      if (!r.TagsArr.includes(f.Diet)) return false;
    }

    if (!q) return true;

    const hay = [
      r._name,
      r._ingredients,
      r._steps,
      normStr(r.TagsArr.join(' ')),
      normStr(r.Category),
      normStr(r.Type),
    ].join(' ').toLowerCase();

    return hay.includes(q);
  });

  renderGrid();
}

function recipeCard(r) {
  const div = document.createElement('button');
  div.className = 'cardbtn';
  div.type = 'button';

  const img = document.createElement('img');
  img.className = 'thumb';
  img.alt = '';
  img.loading = 'lazy';
  img.src = r._photo || './apple-touch-icon.png';

  const meta = document.createElement('div');
  meta.className = 'cardmeta';
  meta.textContent = r.Meta;

  const name = document.createElement('div');
  name.className = 'cardname';
  name.textContent = r._name || 'Без названия';

  div.appendChild(img);
  div.appendChild(meta);
  div.appendChild(name);

  div.addEventListener('click', () => openDetail(r));
  return div;
}

function renderGrid() {
  const grid = el('grid');
  grid.innerHTML = '';
  for (const r of state.list) grid.appendChild(recipeCard(r));
}

function openDetail(r) {
  state.selected = r;
  el('grid').hidden = true;
  el('detail').hidden = false;

  el('dPhoto').src = r._photo || './apple-touch-icon.png';
  el('dName').textContent = r._name || 'Без названия';
  el('dMeta').textContent = r.Meta || '';

  // сохраняем маркеры как есть (✔️ и переносы) — это твой стиль
  el('dIngredients').textContent = r._ingredients || '';
  el('dSteps').textContent = r._steps || '';

  const tagsWrap = el('dTags');
  tagsWrap.innerHTML = '';
  for (const t of r.TagsArr) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = t.toUpperCase();
    tagsWrap.appendChild(chip);
  }
}

function closeDetail() {
  el('detail').hidden = true;
  el('grid').hidden = false;
  state.selected = null;
}

function openModal() {
  el('modal').hidden = false;
  el('csvUrl').value = localStorage.getItem(LS_KEY) || '';
}
function closeModal() {
  el('modal').hidden = true;
}

function loadCsv(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data || []),
      error: (err) => reject(err),
    });
  });
}

async function reloadData() {
  const url = localStorage.getItem(LS_KEY);
  if (!url) {
    // Без источника покажем пусто, но интерфейс живой
    state.raw = [];
    state.list = [];
    renderGrid();
    return;
  }

  const rows = await loadCsv(url);
  state.raw = rows.map(buildDerived);

  // Фильтры
  setSelectOptions(el('fCategory'), uniqSorted(state.raw.map((r) => normStr(r.Category))));
  setSelectOptions(el('fType'), uniqSorted(state.raw.map((r) => normStr(r.Type))));
  setSelectOptions(el('fTimeBucket'), uniqSorted(state.raw.map((r) => normStr(r.TimeBucket))));

  // Теги: сценарии/способы/диеты — берём из общего Tags
  const allTags = uniqSorted(state.raw.flatMap((r) => r.TagsArr));

  // Ты говорила “единый словарь” — здесь просто показываем все теги в трёх селектах.
  // Если хочешь, разделим префиксами (SC:, M:, D:) — скажи, и сделаем.
  setSelectOptions(el('fScenario'), allTags);
  setSelectOptions(el('fMethod'), allTags);
  setSelectOptions(el('fDiet'), allTags);

  // Сброс значений фильтров в “Все”
  el('fCategory').value = 'Все';
  el('fType').value = 'Все';
  el('fTimeBucket').value = 'Все';
  el('fScenario').value = 'Все';
  el('fMethod').value = 'Все';
  el('fDiet').value = 'Все';

  applyFilters();
}

function bindUI() {
  el('btnBack').addEventListener('click', closeDetail);

  el('btnFilters').addEventListener('click', () => {
    el('filters').hidden = !el('filters').hidden;
  });

  el('q').addEventListener('input', (e) => {
    state.filters.q = e.target.value;
    applyFilters();
  });

  el('fCategory').addEventListener('change', (e) => { state.filters.Category = e.target.value; applyFilters(); });
  el('fType').addEventListener('change', (e) => { state.filters.Type = e.target.value; applyFilters(); });
  el('fTimeBucket').addEventListener('change', (e) => { state.filters.TimeBucket = e.target.value; applyFilters(); });

  el('fScenario').addEventListener('change', (e) => { state.filters.Scenario = e.target.value; applyFilters(); });
  el('fMethod').addEventListener('change', (e) => { state.filters.Method = e.target.value; applyFilters(); });
  el('fDiet').addEventListener('change', (e) => { state.filters.Diet = e.target.value; applyFilters(); });

  el('btnSource').addEventListener('click', openModal);
  el('btnClose').addEventListener('click', closeModal);

  el('btnSave').addEventListener('click', async () => {
    const url = normStr(el('csvUrl').value);
    if (url) localStorage.setItem(LS_KEY, url);
    closeModal();
    await reloadData();
  });

  el('btnReload').addEventListener('click', reloadData);
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

(async function init() {
  bindUI();
  registerSW();
  await reloadData();
})();
