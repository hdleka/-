{\rtf1\ansi\ansicpg1251\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 (() => \{\
  const LS = \{\
    csvUrl: "recipes_csv_url",\
    addUrl: "recipes_add_url",\
    appName: "recipes_app_name",\
    cacheCsv: "recipes_cache_csv",\
    cachedData: "recipes_cached_data_v1",\
    cachedAt: "recipes_cached_at_v1",\
  \};\
\
  // ---- DOM ----\
  const grid = document.getElementById("grid");\
  const empty = document.getElementById("empty");\
  const subtitle = document.getElementById("subtitle");\
\
  const q = document.getElementById("q");\
  const filtersWrap = document.getElementById("filters");\
  const btnFilters = document.getElementById("btnFilters");\
  const btnReset = document.getElementById("btnReset");\
  const btnReload = document.getElementById("btnReload");\
  const btnSettings = document.getElementById("btnSettings");\
  const btnOpenSettings = document.getElementById("btnOpenSettings");\
\
  const fCategory = document.getElementById("fCategory");\
  const fType = document.getElementById("fType");\
  const fTag = document.getElementById("fTag");\
  const fFav = document.getElementById("fFav");\
  const activeChips = document.getElementById("activeChips");\
\
  const btnMenu = document.getElementById("btnMenu");\
  const drawer = document.getElementById("drawer");\
  const backdrop = document.getElementById("backdrop");\
  const btnCloseDrawer = document.getElementById("btnCloseDrawer");\
  const menuSettings = document.getElementById("menuSettings");\
  const menuReload = document.getElementById("menuReload");\
  const menuAbout = document.getElementById("menuAbout");\
\
  const modal = document.getElementById("modal");\
  const btnCloseModal = document.getElementById("btnCloseModal");\
  const modalMedia = document.getElementById("modalMedia");\
  const mTitle = document.getElementById("mTitle");\
  const mMeta = document.getElementById("mMeta");\
  const mIngredients = document.getElementById("mIngredients");\
  const mSteps = document.getElementById("mSteps");\
  const mNotesWrap = document.getElementById("mNotesWrap");\
  const mNotes = document.getElementById("mNotes");\
  const mTags = document.getElementById("mTags");\
  const btnFav = document.getElementById("btnFav");\
  const starIcon = document.getElementById("starIcon");\
  const btnEditHint = document.getElementById("btnEditHint");\
\
  const settingsModal = document.getElementById("settingsModal");\
  const btnCloseSettings = document.getElementById("btnCloseSettings");\
  const csvUrl = document.getElementById("csvUrl");\
  const addUrl = document.getElementById("addUrl");\
  const appName = document.getElementById("appName");\
  const cacheCsv = document.getElementById("cacheCsv");\
  const btnSaveSettings = document.getElementById("btnSaveSettings");\
  const btnClearCache = document.getElementById("btnClearCache");\
\
  const aboutModal = document.getElementById("aboutModal");\
  const btnCloseAbout = document.getElementById("btnCloseAbout");\
\
  const btnAdd = document.getElementById("btnAdd");\
\
  // ---- State ----\
  let recipes = [];\
  let current = null;\
\
  const state = \{\
    q: "",\
    category: "\uc0\u1042 \u1089 \u1077 ",\
    type: "\uc0\u1042 \u1089 \u1077 ",\
    tag: "\uc0\u1042 \u1089 \u1077 ",\
    favOnly: false,\
  \};\
\
  // ---- Helpers ----\
  const norm = (v) => (v ?? "").toString().trim();\
  const toInt = (v) => \{\
    const n = parseInt(norm(v), 10);\
    return Number.isFinite(n) ? n : null;\
  \};\
  const splitTags = (v) => \{\
    const s = norm(v);\
    if (!s) return [];\
    // \uc0\u1055 \u1086 \u1076 \u1076 \u1077 \u1088 \u1078 \u1082 \u1072  \u1074 \u1072 \u1088 \u1080 \u1072 \u1085 \u1090 \u1086 \u1074 : "\u1090 \u1077 \u1075 1, \u1090 \u1077 \u1075 2" / "\u1090 \u1077 \u1075 1;\u1090 \u1077 \u1075 2" / "#\u1090 \u1077 \u1075 1 #\u1090 \u1077 \u1075 2"\
    const cleaned = s.replace(/#/g, " ").replace(/\\s+/g, " ").trim();\
    const parts = cleaned.split(/[;,]/).map(x => x.trim()).filter(Boolean);\
    // \uc0\u1045 \u1089 \u1083 \u1080  \u1085 \u1077  \u1085 \u1072 \u1096 \u1083 \u1080  \u1087 \u1086  ,; \'97 \u1087 \u1086 \u1087 \u1088 \u1086 \u1073 \u1091 \u1077 \u1084  \u1087 \u1086  \u1076 \u1074 \u1086 \u1081 \u1085 \u1099 \u1084  \u1087 \u1088 \u1086 \u1073 \u1077 \u1083 \u1072 \u1084 /\u1086 \u1076 \u1080 \u1085 \u1072 \u1088 \u1085 \u1099 \u1084 : \u1082 \u1072 \u1082  "\u1090 \u1077 \u1075 1 \u1090 \u1077 \u1075 2"\
    if (parts.length <= 1 && cleaned.includes(" ")) \{\
      const sp = cleaned.split(" ").map(x => x.trim()).filter(Boolean);\
      // \uc0\u1077 \u1089 \u1083 \u1080  \u1087 \u1086 \u1093 \u1086 \u1078 \u1077  \u1085 \u1072  \u1085 \u1072 \u1073 \u1086 \u1088  \u1089 \u1083 \u1086 \u1074  (\u1072  \u1085 \u1077  \u1092 \u1088 \u1072 \u1079 \u1072 ) \'97 \u1087 \u1088 \u1080 \u1084 \u1077 \u1084 \
      if (sp.length <= 8) return sp;\
    \}\
    return parts;\
  \};\
\
  // \uc0\u1050 \u1083 \u1102 \u1095 \u1080  \u1082 \u1086 \u1083 \u1086 \u1085 \u1086 \u1082  (\u1082 \u1072 \u1082  \u1091  \u1090 \u1077 \u1073 \u1103  \u1074  Glide/Sheets). \u1052 \u1099  \u1076 \u1077 \u1083 \u1072 \u1077 \u1084  \u1084 \u1101 \u1087 \u1087 \u1080 \u1085 \u1075  \u1087 \u1086  \u1079 \u1072 \u1075 \u1086 \u1083 \u1086 \u1074 \u1082 \u1072 \u1084 .\
  const COL = \{\
    title: ["Title", "Name", "\uc0\u1053 \u1072 \u1079 \u1074 \u1072 \u1085 \u1080 \u1077 ", "\u1053 \u1072 \u1079 \u1074 \u1072 \u1085 \u1080 \u1077  \u1088 \u1077 \u1094 \u1077 \u1087 \u1090 \u1072 "],\
    category: ["Category", "\uc0\u1050 \u1072 \u1090 \u1077 \u1075 \u1086 \u1088 \u1080 \u1103 "],\
    type: ["Type", "\uc0\u1058 \u1080 \u1087 "],\
    tags: ["Tags", "\uc0\u1058 \u1077 \u1075 \u1080 "],\
    ingredients: ["Ingredients", "\uc0\u1048 \u1085 \u1075 \u1088 \u1077 \u1076 \u1080 \u1077 \u1085 \u1090 \u1099 "],\
    steps: ["Steps", "\uc0\u1064 \u1072 \u1075 \u1080 ", "\u1055 \u1088 \u1080 \u1075 \u1086 \u1090 \u1086 \u1074 \u1083 \u1077 \u1085 \u1080 \u1077 "],\
    time: ["Time (min)", "Time", "\uc0\u1042 \u1088 \u1077 \u1084 \u1103 ", "\u1042 \u1088 \u1077 \u1084 \u1103  (\u1084 \u1080 \u1085 )"],\
    servings: ["Servings", "\uc0\u1055 \u1086 \u1088 \u1094 \u1080 \u1080 "],\
    photo: ["Photo Main", "Photo", "\uc0\u1060 \u1086 \u1090 \u1086 ", "\u1060 \u1086 \u1090 \u1086  \u1075 \u1086 \u1090 \u1086 \u1074 \u1086 \u1075 \u1086  \u1073 \u1083 \u1102 \u1076 \u1072 "],\
    favorite: ["Favorite", "\uc0\u1048 \u1079 \u1073 \u1088 \u1072 \u1085 \u1085 \u1086 \u1077 "],\
    notes: ["Notes", "\uc0\u1047 \u1072 \u1084 \u1077 \u1090 \u1082 \u1080 "],\
    rating: ["Rating", "\uc0\u1054 \u1094 \u1077 \u1085 \u1082 \u1072 "],\
  \};\
\
  function pick(row, keys) \{\
    for (const k of keys) \{\
      if (row.hasOwnProperty(k)) return row[k];\
    \}\
    return "";\
  \}\
\
  function rowToRecipe(row) \{\
    const title = norm(pick(row, COL.title));\
    const category = norm(pick(row, COL.category));\
    const type = norm(pick(row, COL.type));\
    const tags = splitTags(pick(row, COL.tags));\
    const ingredients = norm(pick(row, COL.ingredients));\
    const steps = norm(pick(row, COL.steps));\
    const time = toInt(pick(row, COL.time));\
    const servings = toInt(pick(row, COL.servings));\
    const photo = norm(pick(row, COL.photo));\
    const notes = norm(pick(row, COL.notes));\
    const rating = toInt(pick(row, COL.rating));\
\
    const favRaw = norm(pick(row, COL.favorite)).toLowerCase();\
    const favorite = favRaw === "true" || favRaw === "1" || favRaw === "yes" || favRaw === "\uc0\u1076 \u1072 " || favRaw === "\u1080 \u1089 \u1090 \u1080 \u1085 \u1072 ";\
\
    // id \uc0\u1091 \u1089 \u1090 \u1086 \u1081 \u1095 \u1080 \u1074 \u1099 \u1081 : \u1085 \u1072 \u1079 \u1074 \u1072 \u1085 \u1080 \u1077  + \u1082 \u1072 \u1090 \u1077 \u1075 \u1086 \u1088 \u1080 \u1103  + \u1074 \u1088 \u1077 \u1084 \u1103 \
    const id = btoa(unescape(encodeURIComponent([title, category, type, time ?? "", servings ?? ""].join("|")))).replace(/=+$/,"");\
\
    return \{ id, title, category, type, tags, ingredients, steps, time, servings, photo, favorite, notes, rating \};\
  \}\
\
  function metaLine(r) \{\
    const parts = [];\
    if (r.category) parts.push(`\uc0\u1050 \u1072 \u1090 \u1077 \u1075 \u1086 \u1088 \u1080 \u1103 : $\{r.category\}`);\
    if (Number.isFinite(r.time) && r.time !== null) parts.push(`\uc0\u9201  $\{r.time\} \u1084 \u1080 \u1085 `);\
    if (Number.isFinite(r.servings) && r.servings !== null) parts.push(`\uc0\u55356 \u57213  $\{r.servings\} \u1087 \u1086 \u1088 \u1094 \u1080 \u1080 `);\
    if (r.rating) parts.push(`\uc0\u9733  $\{r.rating\}/5`);\
    return parts.join(" \'b7 ");\
  \}\
\
  function setSelectOptions(select, values) \{\
    const prev = select.value;\
    select.innerHTML = "";\
    for (const v of values) \{\
      const opt = document.createElement("option");\
      opt.value = v;\
      opt.textContent = v;\
      select.appendChild(opt);\
    \}\
    if (values.includes(prev)) select.value = prev;\
  \}\
\
  function openDrawer() \{\
    drawer.classList.add("open");\
    backdrop.hidden = false;\
    drawer.setAttribute("aria-hidden", "false");\
  \}\
  function closeDrawer() \{\
    drawer.classList.remove("open");\
    backdrop.hidden = true;\
    drawer.setAttribute("aria-hidden", "true");\
  \}\
\
  function openModal() \{\
    modal.hidden = false;\
    backdrop.hidden = false;\
  \}\
  function closeModal() \{\
    modal.hidden = true;\
    backdrop.hidden = true;\
    current = null;\
  \}\
\
  function openSettings() \{\
    settingsModal.hidden = false;\
    backdrop.hidden = false;\
\
    csvUrl.value = localStorage.getItem(LS.csvUrl) || "";\
    addUrl.value = localStorage.getItem(LS.addUrl) || "";\
    appName.value = localStorage.getItem(LS.appName) || "\uc0\u1056 \u1077 \u1094 \u1077 \u1087 \u1090 \u1099 ";\
    cacheCsv.checked = (localStorage.getItem(LS.cacheCsv) ?? "true") === "true";\
  \}\
  function closeSettings() \{\
    settingsModal.hidden = true;\
    backdrop.hidden = true;\
  \}\
\
  function openAbout() \{\
    aboutModal.hidden = false;\
    backdrop.hidden = false;\
  \}\
  function closeAbout() \{\
    aboutModal.hidden = true;\
    backdrop.hidden = true;\
  \}\
\
  function showEmpty(show) \{\
    empty.hidden = !show;\
  \}\
\
  function renderChips() \{\
    activeChips.innerHTML = "";\
    const chips = [];\
    if (state.category !== "\uc0\u1042 \u1089 \u1077 ") chips.push(\{k:"category", label:`\u1050 \u1072 \u1090 \u1077 \u1075 \u1086 \u1088 \u1080 \u1103 : $\{state.category\}`\});\
    if (state.type !== "\uc0\u1042 \u1089 \u1077 ") chips.push(\{k:"type", label:`\u1058 \u1080 \u1087 : $\{state.type\}`\});\
    if (state.tag !== "\uc0\u1042 \u1089 \u1077 ") chips.push(\{k:"tag", label:`\u1058 \u1077 \u1075 : $\{state.tag\}`\});\
    if (state.favOnly) chips.push(\{k:"fav", label:`\uc0\u1048 \u1079 \u1073 \u1088 \u1072 \u1085 \u1085 \u1086 \u1077 `\});\
    if (state.q.trim()) chips.push(\{k:"q", label:`\uc0\u1055 \u1086 \u1080 \u1089 \u1082 : $\{state.q.trim()\}`\});\
\
    for (const c of chips) \{\
      const el = document.createElement("span");\
      el.className = "chip";\
      el.innerHTML = `<span>$\{escapeHtml(c.label)\}</span><button aria-label="\uc0\u1057 \u1085 \u1103 \u1090 \u1100  \u1092 \u1080 \u1083 \u1100 \u1090 \u1088 ">\'d7</button>`;\
      el.querySelector("button").addEventListener("click", () => \{\
        if (c.k === "category") \{ state.category = "\uc0\u1042 \u1089 \u1077 "; fCategory.value = "\u1042 \u1089 \u1077 "; \}\
        if (c.k === "type") \{ state.type = "\uc0\u1042 \u1089 \u1077 "; fType.value = "\u1042 \u1089 \u1077 "; \}\
        if (c.k === "tag") \{ state.tag = "\uc0\u1042 \u1089 \u1077 "; fTag.value = "\u1042 \u1089 \u1077 "; \}\
        if (c.k === "fav") \{ state.favOnly = false; fFav.checked = false; \}\
        if (c.k === "q") \{ state.q = ""; q.value = ""; \}\
        render();\
      \});\
      activeChips.appendChild(el);\
    \}\
  \}\
\
  function filterRecipes(list) \{\
    const qq = state.q.trim().toLowerCase();\
    return list.filter(r => \{\
      if (state.favOnly && !isFav(r)) return false;\
      if (state.category !== "\uc0\u1042 \u1089 \u1077 " && norm(r.category) !== state.category) return false;\
      if (state.type !== "\uc0\u1042 \u1089 \u1077 " && norm(r.type) !== state.type) return false;\
      if (state.tag !== "\uc0\u1042 \u1089 \u1077 " && !(r.tags || []).includes(state.tag)) return false;\
\
      if (!qq) return true;\
\
      const hay = [\
        r.title,\
        r.category,\
        r.type,\
        (r.tags || []).join(" "),\
        r.ingredients,\
        r.steps\
      ].join(" ").toLowerCase();\
\
      return hay.includes(qq);\
    \});\
  \}\
\
  function isFav(r) \{\
    // \uc0\u1048 \u1079 \u1073 \u1088 \u1072 \u1085 \u1085 \u1086 \u1077  \u1093 \u1088 \u1072 \u1085 \u1080 \u1084  \u1083 \u1086 \u1082 \u1072 \u1083 \u1100 \u1085 \u1086  (\u1095 \u1090 \u1086 \u1073 \u1099  \u1085 \u1077  \u1090 \u1088 \u1086 \u1075 \u1072 \u1090 \u1100  \u1090 \u1072 \u1073 \u1083 \u1080 \u1094 \u1091 )\
    const key = `fav_$\{r.id\}`;\
    const v = localStorage.getItem(key);\
    if (v === "true") return true;\
    if (v === "false") return false;\
    return !!r.favorite;\
  \}\
\
  function toggleFav(r) \{\
    const key = `fav_$\{r.id\}`;\
    const next = !isFav(r);\
    localStorage.setItem(key, String(next));\
    return next;\
  \}\
\
  function escapeHtml(s) \{\
    return norm(s)\
      .replaceAll("&", "&amp;")\
      .replaceAll("<", "&lt;")\
      .replaceAll(">", "&gt;")\
      .replaceAll('"', "&quot;")\
      .replaceAll("'", "&#039;");\
  \}\
\
  function render() \{\
    renderChips();\
\
    const filtered = filterRecipes(recipes);\
\
    grid.innerHTML = "";\
    for (const r of filtered) \{\
      const card = document.createElement("article");\
      card.className = "card";\
\
      const badges = [];\
      if (isFav(r)) badges.push(`<span class="badge">\uc0\u9733 </span>`);\
      if (r.category) badges.push(`<span class="badge">$\{escapeHtml(r.category)\}</span>`);\
      if (Number.isFinite(r.time) && r.time !== null) badges.push(`<span class="badge">\uc0\u9201  $\{r.time\} \u1084 \u1080 \u1085 </span>`);\
\
      const img = r.photo\
        ? `<img alt="$\{escapeHtml(r.title)\}" src="$\{escapeHtml(r.photo)\}" loading="lazy" />`\
        : "";\
\
      card.innerHTML = `\
        <div class="media">\
          $\{img\}\
          <div class="badges">$\{badges.join("")\}</div>\
        </div>\
        <div class="cardbody">\
          <div class="cardmeta">$\{escapeHtml(metaLine(r))\}</div>\
          <div class="cardtitle">$\{escapeHtml(r.title || "\uc0\u1041 \u1077 \u1079  \u1085 \u1072 \u1079 \u1074 \u1072 \u1085 \u1080 \u1103 ")\}</div>\
        </div>\
      `;\
\
      card.addEventListener("click", () => openRecipe(r.id));\
      grid.appendChild(card);\
    \}\
\
    showEmpty(recipes.length === 0);\
\
    const name = localStorage.getItem(LS.appName) || "\uc0\u1056 \u1077 \u1094 \u1077 \u1087 \u1090 \u1099 ";\
    document.title = name;\
  \}\
\
  function openRecipe(id) \{\
    const r = recipes.find(x => x.id === id);\
    if (!r) return;\
\
    current = r;\
\
    modalMedia.innerHTML = r.photo\
      ? `<img alt="$\{escapeHtml(r.title)\}" src="$\{escapeHtml(r.photo)\}" />`\
      : "";\
\
    mTitle.textContent = r.title || "\uc0\u1041 \u1077 \u1079  \u1085 \u1072 \u1079 \u1074 \u1072 \u1085 \u1080 \u1103 ";\
    mMeta.textContent = metaLine(r);\
\
    // \uc0\u1048 \u1085 \u1075 \u1088 \u1077 \u1076 \u1080 \u1077 \u1085 \u1090 \u1099 /\u1096 \u1072 \u1075 \u1080 : \u1087 \u1088 \u1086 \u1089 \u1090 \u1086  \u1087 \u1086 \u1082 \u1072 \u1079 \u1099 \u1074 \u1072 \u1077 \u1084  \u1082 \u1072 \u1082  \u1077 \u1089 \u1090 \u1100 , \u1089 \u1086 \u1093 \u1088 \u1072 \u1085 \u1103 \u1103  \u1087 \u1077 \u1088 \u1077 \u1085 \u1086 \u1089 \u1099 \
    mIngredients.textContent = r.ingredients || "\'97";\
    mSteps.textContent = r.steps || "\'97";\
\
    if (norm(r.notes)) \{\
      mNotesWrap.hidden = false;\
      mNotes.textContent = r.notes;\
    \} else \{\
      mNotesWrap.hidden = true;\
      mNotes.textContent = "";\
    \}\
\
    mTags.innerHTML = "";\
    const tags = (r.tags || []);\
    if (tags.length === 0) \{\
      const t = document.createElement("span");\
      t.className = "tag";\
      t.textContent = "\'97";\
      mTags.appendChild(t);\
    \} else \{\
      for (const tag of tags) \{\
        const t = document.createElement("button");\
        t.className = "tag";\
        t.type = "button";\
        t.textContent = tag;\
        t.addEventListener("click", () => \{\
          state.tag = tag;\
          fTag.value = tag;\
          closeModal();\
          render();\
          filtersWrap.classList.add("open");\
        \});\
        mTags.appendChild(t);\
      \}\
    \}\
\
    const fav = isFav(r);\
    starIcon.style.color = fav ? "#ffd66b" : "rgba(255,255,255,.88)";\
\
    openModal();\
  \}\
\
  async function loadFromCsv(url) \{\
    return new Promise((resolve, reject) => \{\
      Papa.parse(url, \{\
        download: true,\
        header: true,\
        skipEmptyLines: "greedy",\
        complete: (res) => \{\
          if (res.errors && res.errors.length) \{\
            // \uc0\u1080 \u1085 \u1086 \u1075 \u1076 \u1072  Papa \u1089 \u1095 \u1080 \u1090 \u1072 \u1077 \u1090  \u1087 \u1088 \u1077 \u1076 \u1091 \u1087 \u1088 \u1077 \u1078 \u1076 \u1077 \u1085 \u1080 \u1103  \u1082 \u1072 \u1082  errors, \u1085 \u1086  \u1076 \u1072 \u1085 \u1085 \u1099 \u1077  \u1077 \u1089 \u1090 \u1100  \'97 \u1087 \u1088 \u1086 \u1087 \u1091 \u1089 \u1090 \u1080 \u1084 , \u1077 \u1089 \u1083 \u1080  rows \u1077 \u1089 \u1090 \u1100 \
            if (!res.data || res.data.length === 0) \{\
              reject(new Error(res.errors[0].message || "\uc0\u1054 \u1096 \u1080 \u1073 \u1082 \u1072  CSV"));\
              return;\
            \}\
          \}\
          resolve(res.data);\
        \},\
        error: (err) => reject(err),\
      \});\
    \});\
  \}\
\
  function buildFilters() \{\
    const categories = new Set(["\uc0\u1042 \u1089 \u1077 "]);\
    const types = new Set(["\uc0\u1042 \u1089 \u1077 "]);\
    const tags = new Set(["\uc0\u1042 \u1089 \u1077 "]);\
\
    for (const r of recipes) \{\
      if (norm(r.category)) categories.add(r.category);\
      if (norm(r.type)) types.add(r.type);\
      for (const t of (r.tags || [])) tags.add(t);\
    \}\
\
    setSelectOptions(fCategory, Array.from(categories));\
    setSelectOptions(fType, Array.from(types));\
    setSelectOptions(fTag, Array.from(tags));\
  \}\
\
  async function reload() \{\
    const url = norm(localStorage.getItem(LS.csvUrl));\
    if (!url) \{\
      recipes = [];\
      buildFilters();\
      render();\
      showEmpty(true);\
      return;\
    \}\
\
    subtitle.textContent = "\uc0\u1047 \u1072 \u1075 \u1088 \u1091 \u1078 \u1072 \u1102 \'85";\
\
    try \{\
      const rows = await loadFromCsv(url);\
      const list = rows\
        .map(rowToRecipe)\
        .filter(r => norm(r.title) || norm(r.ingredients) || norm(r.steps));\
\
      // \uc0\u1089 \u1086 \u1088 \u1090 \u1080 \u1088 \u1086 \u1074 \u1082 \u1072 : \u1080 \u1079 \u1073 \u1088 \u1072 \u1085 \u1085 \u1086 \u1077  \u1074 \u1099 \u1096 \u1077 , \u1087 \u1086 \u1090 \u1086 \u1084  \u1087 \u1086  \u1085 \u1072 \u1079 \u1074 \u1072 \u1085 \u1080 \u1102 \
      list.sort((a,b) => \{\
        const af = isFav(a) ? 1 : 0;\
        const bf = isFav(b) ? 1 : 0;\
        if (af !== bf) return bf - af;\
        return (a.title || "").localeCompare((b.title || ""), "ru");\
      \});\
\
      recipes = list;\
      buildFilters();\
\
      const doCache = (localStorage.getItem(LS.cacheCsv) ?? "true") === "true";\
      if (doCache) \{\
        localStorage.setItem(LS.cachedData, JSON.stringify(recipes));\
        localStorage.setItem(LS.cachedAt, String(Date.now()));\
      \}\
\
      subtitle.textContent = `\uc0\u1056 \u1077 \u1094 \u1077 \u1087 \u1090 \u1086 \u1074 : $\{recipes.length\}`;\
      render();\
      showEmpty(recipes.length === 0);\
    \} catch (e) \{\
      // \uc0\u1055 \u1086 \u1087 \u1088 \u1086 \u1073 \u1091 \u1077 \u1084  \u1086 \u1092 \u1083 \u1072 \u1081 \u1085 -\u1082 \u1101 \u1096 \
      const cached = localStorage.getItem(LS.cachedData);\
      if (cached) \{\
        try \{\
          recipes = JSON.parse(cached);\
          buildFilters();\
          subtitle.textContent = "\uc0\u1054 \u1092 \u1083 \u1072 \u1081 \u1085 -\u1088 \u1077 \u1078 \u1080 \u1084  (\u1082 \u1101 \u1096 )";\
          render();\
          showEmpty(recipes.length === 0);\
          return;\
        \} catch \{\}\
      \}\
\
      subtitle.textContent = "\uc0\u1054 \u1096 \u1080 \u1073 \u1082 \u1072  \u1079 \u1072 \u1075 \u1088 \u1091 \u1079 \u1082 \u1080 ";\
      recipes = [];\
      buildFilters();\
      render();\
      showEmpty(true);\
      alert("\uc0\u1053 \u1077  \u1091 \u1076 \u1072 \u1083 \u1086 \u1089 \u1100  \u1079 \u1072 \u1075 \u1088 \u1091 \u1079 \u1080 \u1090 \u1100  CSV. \u1055 \u1088 \u1086 \u1074 \u1077 \u1088 \u1100 , \u1095 \u1090 \u1086  \u1089 \u1089 \u1099 \u1083 \u1082 \u1072  \u1087 \u1091 \u1073 \u1083 \u1080 \u1095 \u1085 \u1072 \u1103  \u1080  \u1089 \u1086 \u1076 \u1077 \u1088 \u1078 \u1080 \u1090  output=csv.");\
    \}\
  \}\
\
  // ---- Events ----\
  btnFilters.addEventListener("click", () => \{\
    filtersWrap.classList.toggle("open");\
  \});\
\
  btnReset.addEventListener("click", () => \{\
    state.q = ""; q.value = "";\
    state.category = "\uc0\u1042 \u1089 \u1077 "; fCategory.value = "\u1042 \u1089 \u1077 ";\
    state.type = "\uc0\u1042 \u1089 \u1077 "; fType.value = "\u1042 \u1089 \u1077 ";\
    state.tag = "\uc0\u1042 \u1089 \u1077 "; fTag.value = "\u1042 \u1089 \u1077 ";\
    state.favOnly = false; fFav.checked = false;\
    render();\
  \});\
\
  btnReload.addEventListener("click", reload);\
  btnSettings.addEventListener("click", openSettings);\
  btnOpenSettings.addEventListener("click", openSettings);\
\
  q.addEventListener("input", () => \{\
    state.q = q.value;\
    render();\
  \});\
\
  fCategory.addEventListener("change", () => \{ state.category = fCategory.value; render(); \});\
  fType.addEventListener("change", () => \{ state.type = fType.value; render(); \});\
  fTag.addEventListener("change", () => \{ state.tag = fTag.value; render(); \});\
  fFav.addEventListener("change", () => \{ state.favOnly = fFav.checked; render(); \});\
\
  btnMenu.addEventListener("click", openDrawer);\
  btnCloseDrawer.addEventListener("click", closeDrawer);\
  backdrop.addEventListener("click", () => \{\
    closeDrawer();\
    if (!modal.hidden) closeModal();\
    if (!settingsModal.hidden) closeSettings();\
    if (!aboutModal.hidden) closeAbout();\
  \});\
\
  menuSettings.addEventListener("click", () => \{ closeDrawer(); openSettings(); \});\
  menuReload.addEventListener("click", () => \{ closeDrawer(); reload(); \});\
  menuAbout.addEventListener("click", () => \{ closeDrawer(); openAbout(); \});\
\
  btnCloseModal.addEventListener("click", closeModal);\
\
  btnFav.addEventListener("click", () => \{\
    if (!current) return;\
    const next = toggleFav(current);\
    starIcon.style.color = next ? "#ffd66b" : "rgba(255,255,255,.88)";\
    // \uc0\u1086 \u1073 \u1085 \u1086 \u1074 \u1080 \u1084  \u1082 \u1072 \u1088 \u1090 \u1086 \u1095 \u1082 \u1080 \
    render();\
  \});\
\
  btnEditHint.addEventListener("click", () => \{\
    alert(\
      "\uc0\u1056 \u1077 \u1076 \u1072 \u1082 \u1090 \u1080 \u1088 \u1086 \u1074 \u1072 \u1085 \u1080 \u1077  \u1076 \u1077 \u1083 \u1072 \u1077 \u1090 \u1089 \u1103  \u1074  Google \u1058 \u1072 \u1073 \u1083 \u1080 \u1094 \u1077 .\\n\\n" +\
      "1) \uc0\u1054 \u1090 \u1082 \u1088 \u1086 \u1081  \u1090 \u1072 \u1073 \u1083 \u1080 \u1094 \u1091  \u8594  \u1080 \u1079 \u1084 \u1077 \u1085 \u1080  \u1088 \u1077 \u1094 \u1077 \u1087 \u1090  \u8594  \u1089 \u1086 \u1093 \u1088 \u1072 \u1085 \u1080 .\\n" +\
      "2) \uc0\u1042  \u1087 \u1088 \u1080 \u1083 \u1086 \u1078 \u1077 \u1085 \u1080 \u1080  \u1085 \u1072 \u1078 \u1084 \u1080  \'ab\u1054 \u1073 \u1085 \u1086 \u1074 \u1080 \u1090 \u1100  \u1076 \u1072 \u1085 \u1085 \u1099 \u1077 \'bb.\\n\\n" +\
      "\uc0\u1045 \u1089 \u1083 \u1080  \u1093 \u1086 \u1095 \u1077 \u1096 \u1100  \u1076 \u1086 \u1073 \u1072 \u1074 \u1083 \u1103 \u1090 \u1100  \u1089  \u1090 \u1077 \u1083 \u1077 \u1092 \u1086 \u1085 \u1072  \u1082 \u1088 \u1072 \u1089 \u1080 \u1074 \u1086  \'97 \u1085 \u1072 \u1089 \u1090 \u1088 \u1086 \u1080 \u1084  Google Form."\
    );\
  \});\
\
  btnCloseSettings.addEventListener("click", closeSettings);\
  btnSaveSettings.addEventListener("click", () => \{\
    const u = norm(csvUrl.value);\
    const a = norm(addUrl.value);\
    const n = norm(appName.value) || "\uc0\u1056 \u1077 \u1094 \u1077 \u1087 \u1090 \u1099 ";\
\
    localStorage.setItem(LS.csvUrl, u);\
    localStorage.setItem(LS.addUrl, a);\
    localStorage.setItem(LS.appName, n);\
    localStorage.setItem(LS.cacheCsv, String(!!cacheCsv.checked));\
\
    closeSettings();\
    subtitle.textContent = "\uc0\u1053 \u1072 \u1089 \u1090 \u1088 \u1086 \u1081 \u1082 \u1080  \u1089 \u1086 \u1093 \u1088 \u1072 \u1085 \u1077 \u1085 \u1099 ";\
    setTimeout(() => reload(), 50);\
  \});\
\
  btnClearCache.addEventListener("click", () => \{\
    localStorage.removeItem(LS.cachedData);\
    localStorage.removeItem(LS.cachedAt);\
    alert("\uc0\u1050 \u1101 \u1096  \u1086 \u1095 \u1080 \u1097 \u1077 \u1085 .");\
  \});\
\
  btnCloseAbout.addEventListener("click", closeAbout);\
\
  btnAdd.addEventListener("click", () => \{\
    const url = norm(localStorage.getItem(LS.addUrl));\
    if (!url) \{\
      openSettings();\
      alert("\uc0\u1044 \u1086 \u1073 \u1072 \u1074 \u1100  \u1089 \u1089 \u1099 \u1083 \u1082 \u1091  \u1076 \u1083 \u1103  \u1076 \u1086 \u1073 \u1072 \u1074 \u1083 \u1077 \u1085 \u1080 \u1103  \u1088 \u1077 \u1094 \u1077 \u1087 \u1090 \u1072  \u1074  \u1085 \u1072 \u1089 \u1090 \u1088 \u1086 \u1081 \u1082 \u1072 \u1093  (\u1085 \u1072 \u1087 \u1088 \u1080 \u1084 \u1077 \u1088 , Google Form \u1080 \u1083 \u1080  \u1089 \u1089 \u1099 \u1083 \u1082 \u1072  \u1085 \u1072  \u1090 \u1072 \u1073 \u1083 \u1080 \u1094 \u1091 ).");\
      return;\
    \}\
    window.open(url, "_blank");\
  \});\
\
  // ---- Init ----\
  function bootFromCacheIfAny() \{\
    const cached = localStorage.getItem(LS.cachedData);\
    if (!cached) return;\
    try \{\
      recipes = JSON.parse(cached);\
      buildFilters();\
      subtitle.textContent = "\uc0\u1054 \u1092 \u1083 \u1072 \u1081 \u1085 -\u1088 \u1077 \u1078 \u1080 \u1084  (\u1082 \u1101 \u1096 )";\
      render();\
      showEmpty(recipes.length === 0);\
    \} catch \{\}\
  \}\
\
  // \uc0\u1055 \u1077 \u1088 \u1074 \u1080 \u1095 \u1085 \u1099 \u1081  \u1079 \u1072 \u1087 \u1091 \u1089 \u1082 \
  bootFromCacheIfAny();\
  reload();\
\})();\
}
