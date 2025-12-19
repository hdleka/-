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
  }
};

// ====== Нормализация полей из таблицы ======
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
    .map(x => normStr(x))
    .filter(Boolean);
}
function timeBucket(mins) {
  const m = toInt(mins);
  if (!m && m !== 0) return '';
  if (m <= 20) return 'Быстро (до 20 минут)';
  if (m <= 45) return 'Средне (20–45 минут)';
  return 'Долго (45+ минут)';
}
function metaLine(r) {
  const parts = [];
  if (r.Category) parts.push(`Категория: ${r.Category}`);
  if (r.TimeMin != null) parts.push(`⏱ ${r.TimeMin} мин`);
  if (r.Servings != null) parts.push(`🍽 ${r.Servings} порции`);
  return parts.join(' · ');
}

// ====== UI helpers ======
function setStatus(text, isError = false) {
  const box = el('status');
  box.hidden = false;
  box.textContent = text;
  box.style.borderColor = isError ? 'rgba(255,120,120,.35)' : 'rgba(255,255,255,.10)';
  box.style.background = isError ? 'rgba(255,80,80,.08)' : 'rgba(255,255,255,.05)';
}
function clearStatus() {
  const box = el('status');
  box.hidden = true;
  box.textContent = '';
}

function optionize(values) {
  const uniq = Array.from(new Set(values.map(v => normStr(v)).filter(Boolean)));
  uniq.sort((a,b)=>a.localeCompare(b,'ru'));
  return ['Все', ...uniq];
}
function fillSelect(selectId, options, selected) {
  const s = el(selectId);
  s.innerHTML = '';
  for (const opt of options) {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    if (opt === selected) o.selected = true;
    s.appendChild(o);
  }
}

// ====== Загрузка CSV ======
function saveCsvUrl(url) {
  localStorage.setItem(LS_KEY, url);
}
function loadCsvUrl() {
  return localStorage.getItem(LS_KEY) || '';
}

function parseCsv(text) {
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) {
    throw new Error(parsed.errors[0].message || 'Ошибка парсинга CSV');
  }
  return parsed.data || [];
}

function normalizeRows(rows) {
  // Ожидаемые колонки (можно иметь больше):
  // Title, Category, Type, Time (min), Servings, Rating, Photo Main, Ingredients, Steps, TagsScenario, TagsMethod, TagsDiet, TagsAll
  return rows.map((row, idx) => {
    const Title = normStr(row.Title || row.Name || row['Название'] || row['Название рецепта']);
    const Category = normStr(row.Category || row['Категория']);
    const Type = normStr(row.Type || row['Тип']);
    const TimeMin = toInt(row['Time (min)'] ?? row.Time ?? row['Время'] ?? row['Время (мин)']);
    const Servings = toInt(row.Servings ?? row['Порции']);
    const Rating = toInt(row.Rating ?? row['Оценка']);
    const Photo = normStr(row['Photo Main'] ?? row.Photo ?? row['Фото'] ?? row['Фото готового блюда']);
    const Ingredients = normStr(row.Ingredients ?? row['Ингредиенты']);
    const Steps = normStr(row.Steps ?? row['Приготовление'] ?? row['Шаги']);
    const TagsScenario = splitTags(row.TagsScenario ?? row['ТегиСценарий'] ?? row['Сценарий']);
    const TagsMethod = splitTags(row.TagsMethod ?? row['ТегиСпособ'] ?? row['Способ']);
    const TagsDiet = splitTags(row.TagsDiet ?? row['ТегиОграничения'] ?? row['Ограничения']);
    const TagsAll = splitTags(row.TagsAll ?? row.Tags ?? row['Теги']);

    const allTags = Array.from(new Set([...TagsScenario, ...TagsMethod, ...TagsDiet, ...TagsAll]));

    return {
      id: row.id || row.ID || String(idx + 1),
      Title,
      Category,
      Type,
      TimeMin,
      TimeBucket: timeBucket(TimeMin),
      Servings,
      Rating,
      Photo,
      Ingredients,
      Steps,
      TagsScenario,
      TagsMethod,
      TagsDiet,
      TagsAll: allTags,
      _search: [
        Title, Category, Type,
        Ingredients, Steps,
        allTags.join(' ')
      ].join(' ').toLowerCase()
    };
  }).filter(r => r.Title); // выкидываем пустые строки без названия
}

async function fetchCsv(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Не удалось загрузить CSV (HTTP ${res.status})`);
  const text = await res.text();
  return text;
}

async function loadDataFromUrl(url) {
  clearStatus();
  setStatus('Загружаю таблицу…');
  const csvText = await fetchCsv(url);
  const rows = parseCsv(csvText);
  const items = normalizeRows(rows);
  state.raw = items;

  // Заполняем фильтры
  fillSelect('fCategory', optionize(items.map(x => x.Category)), state.filters.Category);
  fillSelect('fType', optionize(items.map(x => x.Type)), state.filters.Type);
  fillSelect('fTimeBucket', optionize(items.map(x => x.TimeBucket)), state.filters.TimeBucket);

  // “Сценарий/Способ/Ограничения” берём из тегов
  fillSelect('fScenario', optionize(items.flatMap(x => x.TagsScenario)), state.filters.Scenario);
  fillSelect('fMethod', optionize(items.flatMap(x => x.TagsMethod)), state.filters.Method);
  fillSelect('fDiet', optionize(items.flatMap(x => x.TagsDiet)), state.filters.Diet);

  setStatus(`Готово. Рецептов: ${items.length}`);
  applyFilters();
}

// ====== Фильтрация и рендер ======
function matchSelect(filterValue, itemValue) {
  if (!filterValue || filterValue === 'Все') return true;
  return normStr(itemValue) === filterValue;
}
function matchTag(filterValue, tags) {
  if (!filterValue || filterValue === 'Все') return true;
  return (tags || []).includes(filterValue);
}
function applyFilters() {
  const q = state.filters.q.trim().toLowerCase();

  const filtered = state.raw.filter(r => {
    if (q && !r._search.includes(q)) return false;
    if (!matchSelect(state.filters.Category, r.Category)) return false;
    if (!matchSelect(state.filters.Type, r.Type)) return false;
    if (!matchSelect(state.filters.TimeBucket, r.TimeBucket)) return false;

    if (!matchTag(state.filters.Scenario, r.TagsScenario)) return false;
    if (!matchTag(state.filters.Method, r.TagsMethod)) return false;
    if (!matchTag(state.filters.Diet, r.TagsDiet)) return false;

    return true;
  });

  state.list = filtered;
  renderGrid();
}

function renderGrid() {
  const grid = el('grid');
  grid.innerHTML = '';

  el('empty').hidden = state.list.length !== 0;

  for (const r of state.list) {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.addEventListener('click', () => openRecipe(r));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openRecipe(r);
    });

    const img = document.createElement('img');
    img.className = 'cardimg';
    img.alt = r.Title;
    img.loading = 'lazy';
    img.src = r.Photo || '';
    img.onerror = () => { img.removeAttribute('src'); img.style.background = 'rgba(255,255,255,.06)'; };

    const body = document.createElement('div');
    body.className = 'cardbody';

    const meta = document.createElement('div');
    meta.className = 'cardmeta';
    meta.textContent = metaLine(r).toUpperCase();

    const title = document.createElement('div');
    title.className = 'cardtitle';
    title.textContent = r.Title;

    body.appendChild(meta);
    body.appendChild(title);

    card.appendChild(img);
    card.appendChild(body);

    grid.appendChild(card);
  }
}

function renderStars(container, rating) {
  container.innerHTML = '';
  const r = Number.isFinite(rating) ? rating : 0;
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('div');
    s.className = 'star' + (i <= r ? ' on' : '');
    container.appendChild(s);
  }
}

function openRecipe(r) {
  state.selected = r;

  el('dTitle').textContent = r.Title;
  el('dMeta').textContent = metaLine(r).toUpperCase();

  const img = el('dPhoto');
  img.src = r.Photo || '';
  img.alt = r.Title;
  img.onerror = () => { img.removeAttribute('src'); };

  // Рейтинг
  const row = el('dRatingRow');
  if (r.Rating != null && r.Rating > 0) {
    row.hidden = false;
    renderStars(el('dStars'), r.Rating);
  } else {
    row.hidden = true;
  }

  // Тексты (как ты делаешь в Glide — переносы/маркеры сохраняем)
  el('dIngredients').textContent = r.Ingredients || '';
  el('dSteps').textContent = r.Steps || '';

  // Теги снизу (твоя “умная строка”)
  const tagsBox = el('dTagsBox');
  const tagsEl = el('dTags');
  const tags = r.TagsAll || [];
  if (tags.length) {
    tagsBox.hidden = false;
    tagsEl.innerHTML = '';
    for (const t of tags) {
      const chip = document.createElement('span');
      chip.className = 'tag';
      chip.textContent = t;
      tagsEl.appendChild(chip);
    }
  } else {
    tagsBox.hidden = true;
  }

  const drawer = el('drawer');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeRecipe() {
  el('drawer').classList.remove('open');
  el('drawer').setAttribute('aria-hidden', 'true');
  state.selected = null;
}

// ====== Модалка источника ======
function openModal() {
  el('csvUrl').value = loadCsvUrl();
  clearStatus();
  el('modal').hidden = false;
}
function closeModal() {
  el('modal').hidden = true;
}

// ====== Share ======
async function shareRecipe() {
  const r = state.selected;
  if (!r) return;
  const text = `${r.Title}\n${metaLine(r)}\n\nИнгредиенты:\n${r.Ingredients}\n\nПриготовление:\n${r.Steps}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: r.Title, text });
    } else {
      await navigator.clipboard.writeText(text);
      setStatus('Скопировано в буфер обмена.');
      openModal();
    }
  } catch (_) {}
}

// ====== Events ======
function bindEvents() {
  el('btnMenu').addEventListener('click', () => openModal()); // меню пока ведёт в источник
  el('btnSource').addEventListener('click', () => openModal());

  el('mClose').addEventListener('click', closeModal);
  el('modal').addEventListener('click', (e) => {
    if (e.target === el('modal')) closeModal();
  });

  el('btnSaveSource').addEventListener('click', async () => {
    const url = normStr(el('csvUrl').value);
    if (!url) return setStatus('Вставь CSV-ссылку.', true);
    try {
      saveCsvUrl(url);
      await loadDataFromUrl(url);
    } catch (e) {
      setStatus(String(e.message || e), true);
    }
  });

  el('btnClearSource').addEventListener('click', () => {
    localStorage.removeItem(LS_KEY);
    el('csvUrl').value = '';
    setStatus('Очищено. Вставь новую ссылку.', false);
  });

  el('q').addEventListener('input', (e) => {
    state.filters.q = e.target.value || '';
    applyFilters();
  });

  el('btnFilters').addEventListener('click', () => {
    const box = el('filters');
    box.hidden = !box.hidden;
  });

  el('btnReset').addEventListener('click', () => {
    state.filters.Category = 'Все';
    state.filters.Type = 'Все';
    state.filters.TimeBucket = 'Все';
    state.filters.Scenario = 'Все';
    state.filters.Method = 'Все';
    state.filters.Diet = 'Все';

    fillSelect('fCategory', optionize(state.raw.map(x => x.Category)), 'Все');
    fillSelect('fType', optionize(state.raw.map(x => x.Type)), 'Все');
    fillSelect('fTimeBucket', optionize(state.raw.map(x => x.TimeBucket)), 'Все');
    fillSelect('fScenario', optionize(state.raw.flatMap(x => x.TagsScenario)), 'Все');
    fillSelect('fMethod', optionize(state.raw.flatMap(x => x.TagsMethod)), 'Все');
    fillSelect('fDiet', optionize(state.raw.flatMap(x => x.TagsDiet)), 'Все');

    applyFilters();
  });

  el('btnApply').addEventListener('click', () => {
    state.filters.Category = el('fCategory').value;
    state.filters.Type = el('fType').value;
    state.filters.TimeBucket = el('fTimeBucket').value;
    state.filters.Scenario = el('fScenario').value;
    state.filters.Method = el('fMethod').value;
    state.filters.Diet = el('fDiet').value;
    applyFilters();
    el('filters').hidden = true;
  });

  el('btnBack').addEventListener('click', closeRecipe);
  el('drawer').addEventListener('click', (e) => {
    if (e.target === el('drawer')) closeRecipe();
  });
  el('btnShare').addEventListener('click', shareRecipe);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!el('modal').hidden) closeModal();
      if (el('drawer').classList.contains('open')) closeRecipe();
    }
  });
}

// ====== PWA service worker ======
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ====== Init ======
(async function init() {
  bindEvents();
  registerSW();

  const url = loadCsvUrl();
  if (!url) {
    // Первый запуск — открываем окно источника
    openModal();
    setStatus('Вставь CSV-ссылку, чтобы загрузить рецепты.', false);
    return;
  }
  try {
    await loadDataFromUrl(url);
  } catch (e) {
    openModal();
    setStatus('Не удалось загрузить. Проверь CSV-ссылку и доступ.', true);
  }
})();
