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

function metaLine(r) {
  const cat = normStr(r.Category);
  const mins = toInt(r.TimeMin);
  const servings = toInt(r.Servings);

  const parts = [];
  if (cat) parts.push(`КАТЕГОРИЯ: ${cat.toUpperCase()}`);
  if (mins !== null) parts.push(`⏱ ${mins} МИН`);
  if (servings !== null) parts.push(`🍽 ${servings} ПОРЦИИ`);

  return parts.join(' · ');
}

function starsHtml(n) {
  const val = Math.max(0, Math.min(5, toInt(n) ?? 0));
  let out = '';
  for (let i = 1; i <= 5; i++) {
    out += `<span class="star ${i <= val ? 'on' : ''}">★</span>`;
  }
  return out;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function textToRichHtml(s) {
  // поддерживаем твой формат:
  // - переносы строк
  // - строки с ✔️ / • / - / — превращаем в маркированный список
  const raw = normStr(s);
  if (!raw) return '<div class="muted">—</div>';

  const lines = raw.split('\n').map((x) => x.replace(/\r/g, ''));

  // если есть явные маркеры — делаем <ul>
  const bulletRe = /^\s*(✔️|•|-|—)\s+/;
  const hasBullets = lines.some((ln) => bulletRe.test(ln));

  if (hasBullets) {
    let html = '<ul class="ul">';
    for (const ln of lines) {
      const m = ln.match(bulletRe);
      if (m) {
        const clean = ln.replace(bulletRe, '');
        html += `<li>${escapeHtml(clean)}</li>`;
      } else if (normStr(ln)) {
        // заголовки секций (например "Кешью соус:")
        html += `</ul><div class="sectionhead">${escapeHtml(ln)}</div><ul class="ul">`;
      }
    }
    html += '</ul>';
    return html.replaceAll('<ul class="ul"></ul>', '');
  }

  // иначе просто параграфы
  return lines
    .map((ln) => (normStr(ln) ? `<p>${escapeHtml(ln)}</p>` : '<br/>'))
    .join('');
}

function uniq(arr) {
  return Array.from(new Set(arr)).filter(Boolean);
}

function buildSelectOptions(selectEl, values) {
  selectEl.innerHTML = '';
  const all = ['Все', ...uniq(values).sort((a, b) => a.localeCompare(b, 'ru'))];
  for (const v of all) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  }
}

function toast(msg) {
  const t = el('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => (t.hidden = true), 2400);
}

function showModal() {
  const m = el('modal');
  m.hidden = false;
  // фокус в поле ввода
  setTimeout(() => el('csvUrl').focus(), 50);
}

function hideModal() {
  const m = el('modal');
  m.hidden = true;
}

function showDetails(r) {
  state.selected = r;
  el('grid').hidden = true;
  el('details').hidden = false;

  el('dName').textContent = normStr(r.Name) || 'Без названия';

  const photo = normStr(r.Photo);
  const img = el('dPhoto');
  if (photo) {
    img.src = photo;
    img.classList.remove('ph');
  } else {
    img.removeAttribute('src');
    img.classList.add('ph');
  }

  el('dStars').innerHTML = starsHtml(r.Rating);

  el('dMeta').textContent = metaLine(r);

  el('dIngredients').innerHTML = textToRichHtml(r.Ingredients);
  el('dSteps').innerHTML = textToRichHtml(r.Steps);

  const tags = splitTags(r.Tags);
  const tagsCard = el('tagsCard');
  const tagsWrap = el('dTags');
  tagsWrap.innerHTML = '';
  if (tags.length) {
    tagsCard.hidden = false;
    for (const t of tags) {
      const chip = document.createElement('span');
      chip.className = 'tag';
      chip.textContent = t.toUpperCase();
      tagsWrap.appendChild(chip);
    }
  } else {
    tagsCard.hidden = true;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToList() {
  state.selected = null;
  el('details').hidden = true;
  el('grid').hidden = false;
}

function applyFilters() {
  const q = normStr(state.filters.q).toLowerCase();

  const filtered = state.raw.filter((r) => {
    const cat = normStr(r.Category) || '';
    const type = normStr(r.Type) || '';
    const scen = normStr(r.Scenario) || '';
    const method = normStr(r.Method) || '';
    const diet = normStr(r.Diet) || '';
    const tb = timeBucket(r.TimeMin);

    const okCat = state.filters.Category === 'Все' || cat === state.filters.Category;
    const okType = state.filters.Type === 'Все' || type === state.filters.Type;
    const okScen = state.filters.Scenario === 'Все' || scen === state.filters.Scenario;
    const okMethod = state.filters.Method === 'Все' || method === state.filters.Method;
    const okDiet = state.filters.Diet === 'Все' || diet === state.filters.Diet;
    const okTB = state.filters.TimeBucket === 'Все' || tb === state.filters.TimeBucket;

    if (!(okCat && okType && okScen && okMethod && okDiet && okTB)) return false;

    if (!q) return true;

    const hay = [
      r.Name,
      r.Category,
      r.Type,
      r.Scenario,
      r.Method,
      r.Diet,
      r.Ingredients,
      r.Steps,
      r.Tags,
    ]
      .map((x) => normStr(x).toLowerCase())
      .join(' | ');

    return hay.includes(q);
  });

  state.list = filtered;
  renderGrid();
}

function cardHtml(r) {
  const name = normStr(r.Name) || 'Без названия';
  const meta = metaLine(r);
  const photo = normStr(r.Photo);

  const photoHtml = photo
    ? `<img class="cardimg" src="${escapeHtml(photo)}" alt="">`
    : `<div class="cardimg ph"></div>`;

  return `
    <article class="rcard" data-id="${escapeHtml(r.Id)}">
      <div class="imgwrap">${photoHtml}</div>
      <div class="cardbody">
        <div class="metasmall">${escapeHtml(meta)}</div>
        <div class="title">${escapeHtml(name)}</div>
      </div>
    </article>
  `;
}

function renderGrid() {
  const grid = el('grid');
  grid.innerHTML = '';

  if (!state.list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Пока пусто. Проверь ссылку на CSV в «Источник».';
    grid.appendChild(empty);
    return;
  }

  const html = state.list.map(cardHtml).join('');
  grid.insertAdjacentHTML('beforeend', html);
}

function normalizeRow(row) {
  // ожидаемые поля CSV:
  // Id, Name, Photo, Category, Type, TimeMin, Servings, Rating, Ingredients, Steps, Tags, Scenario, Method, Diet
  const r = { ...row };

  r.Id = normStr(r.Id) || crypto.randomUUID();
  r.Name = normStr(r.Name);
  r.Photo = normStr(r.Photo);
  r.Category = normStr(r.Category);
  r.Type = normStr(r.Type);
  r.TimeMin = normStr(r.TimeMin);
  r.Servings = normStr(r.Servings);
  r.Rating = normStr(r.Rating);
  r.Ingredients = String(r.Ingredients ?? '');
  r.Steps = String(r.Steps ?? '');
  r.Tags = String(r.Tags ?? '');
  r.Scenario = normStr(r.Scenario);
  r.Method = normStr(r.Method);
  r.Diet = normStr(r.Diet);

  return r;
}

async function loadCsv(url) {
  const u = normStr(url);
  if (!u) {
    state.raw = [];
    state.list = [];
    renderGrid();
    toast('Сначала укажи ссылку на CSV.');
    return;
  }

  toast('Загружаю таблицу…');

  const res = await fetch(u, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`CSV не загрузился: ${res.status}`);
  }
  const text = await res.text();

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    console.warn(parsed.errors);
  }

  const rows = (parsed.data || []).map(normalizeRow);

  state.raw = rows;

  // построим варианты фильтров
  buildSelectOptions(el('fCategory'), rows.map((r) => r.Category).filter(Boolean));
  buildSelectOptions(el('fType'), rows.map((r) => r.Type).filter(Boolean));
  buildSelectOptions(el('fScenario'), rows.map((r) => r.Scenario).filter(Boolean));
  buildSelectOptions(el('fMethod'), rows.map((r) => r.Method).filter(Boolean));
  buildSelectOptions(el('fDiet'), rows.map((r) => r.Diet).filter(Boolean));
  buildSelectOptions(el('fTimeBucket'), rows.map((r) => timeBucket(r.TimeMin)).filter(Boolean));

  // выставим текущие значения фильтров обратно (чтобы не сбрасывались)
  el('fCategory').value = state.filters.Category;
  el('fType').value = state.filters.Type;
  el('fScenario').value = state.filters.Scenario;
  el('fMethod').value = state.filters.Method;
  el('fDiet').value = state.filters.Diet;
  el('fTimeBucket').value = state.filters.TimeBucket;

  applyFilters();
  toast(`Готово: ${rows.length} рецептов`);
}

function wireUi() {
  // меню пока не используем — но кнопка должна быть живой
  el('btnMenu').addEventListener('click', () => toast('Меню пока не настроено'));

  el('btnSource').addEventListener('click', () => {
    el('csvUrl').value = localStorage.getItem(LS_KEY) || '';
    showModal();
  });

  // закрытие модалки — три независимых способа, чтобы точно работало
  el('modalClose').addEventListener('click', hideModal);
  el('btnCancel').addEventListener('click', hideModal);
  el('modal').addEventListener('click', (e) => {
    if (e.target === el('modal')) hideModal(); // клик по затемнению
  });

  el('btnSave').addEventListener('click', async () => {
    const url = normStr(el('csvUrl').value);
    localStorage.setItem(LS_KEY, url);
    hideModal();
    try {
      await loadCsv(url);
    } catch (err) {
      console.error(err);
      toast('Ошибка: проверь, что это именно CSV-публикация.');
    }
  });

  el('btnRefresh').addEventListener('click', async () => {
    const url = normStr(el('csvUrl').value);
    localStorage.setItem(LS_KEY, url);
    try {
      await loadCsv(url);
    } catch (err) {
      console.error(err);
      toast('Ошибка: проверь ссылку CSV.');
    }
  });

  el('btnFilters').addEventListener('click', () => {
    el('filters').hidden = !el('filters').hidden;
  });
  el('btnCloseFilters').addEventListener('click', () => (el('filters').hidden = true));

  el('btnReset').addEventListener('click', () => {
    state.filters = {
      q: '',
      Category: 'Все',
      Type: 'Все',
      TimeBucket: 'Все',
      Scenario: 'Все',
      Method: 'Все',
      Diet: 'Все',
    };
    el('q').value = '';
    el('filters').hidden = true;

    el('fCategory').value = 'Все';
    el('fType').value = 'Все';
    el('fTimeBucket').value = 'Все';
    el('fScenario').value = 'Все';
    el('fMethod').value = 'Все';
    el('fDiet').value = 'Все';

    applyFilters();
  });

  el('q').addEventListener('input', (e) => {
    state.filters.q = e.target.value;
    applyFilters();
  });

  el('fCategory').addEventListener('change', (e) => {
    state.filters.Category = e.target.value;
    applyFilters();
  });
  el('fType').addEventListener('change', (e) => {
    state.filters.Type = e.target.value;
    applyFilters();
  });
  el('fTimeBucket').addEventListener('change', (e) => {
    state.filters.TimeBucket = e.target.value;
    applyFilters();
  });
  el('fScenario').addEventListener('change', (e) => {
    state.filters.Scenario = e.target.value;
    applyFilters();
  });
  el('fMethod').addEventListener('change', (e) => {
    state.filters.Method = e.target.value;
    applyFilters();
  });
  el('fDiet').addEventListener('change', (e) => {
    state.filters.Diet = e.target.value;
    applyFilters();
  });

  el('btnBack').addEventListener('click', backToList);

  // клик по карточке
  el('grid').addEventListener('click', (e) => {
    const card = e.target.closest('.rcard');
    if (!card) return;
    const id = card.getAttribute('data-id');
    const r = state.raw.find((x) => normStr(x.Id) === normStr(id));
    if (r) showDetails(r);
  });
}

async function boot() {
  wireUi();

  // service worker (для ПВА)
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('sw.js');
    } catch (e) {
      console.warn('SW не зарегистрирован', e);
    }
  }

  const saved = localStorage.getItem(LS_KEY) || '';
  if (saved) {
    try {
      await loadCsv(saved);
    } catch (err) {
      console.error(err);
      toast('Не удалось загрузить CSV. Открой «Источник» и вставь корректную ссылку.');
    }
  } else {
    renderGrid();
    toast('Открой «Источник» и вставь ссылку на CSV.');
  }
}

document.addEventListener('DOMContentLoaded', boot);
