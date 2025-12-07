/* ==========================================================
   UnitMaster - 世界標準ユニットコンバータ（A構成）
   JA/EN 完全対応版（subtitle対応）
========================================================== */

/* ----------------------------
  i18n（全UI文言）
---------------------------- */
const i18n = {
  ja: {
    title: "UnitMaster",
    subtitle: "長さ・重さ・温度・体積・面積・速度・圧力などの世界標準単位を変換・計算するツールです。",

    category_label: "カテゴリ",
    dd_category_label: "カテゴリ",

    howto_title: "【使い方】",
    howto_1: "カテゴリを選択（スマホではドロップダウン）",
    howto_2: "数値を入力",
    howto_3: "変換元（from）と変換先（to）の単位を選択",
    howto_4: "「自動計算」ON／OFFを切り替え",
    howto_5: "OFF時は「計算する」ボタンで実行",

    label_value: "数値",
    label_from: "変換元",
    label_to: "変換先",

    auto: "自動計算",
    btn_calc: "計算する",

    bulk_title: "一括変換",
    history_title: "履歴（5件）",
    history_empty: "履歴がまだありません",

    result: (v, f, r, t) => `${v} ${f} = ${r} ${t}`,

    donate_line1: "💗 このツールが役に立ったら支援お願いします",

    // categories
    cat_length: "長さ",
    cat_weight: "重さ",
    cat_temp: "温度",
    cat_volume: "体積",
    cat_area: "面積",
    cat_speed: "速度",
    cat_pressure: "圧力",

    // mobile dropdown labels
    dd_length: "長さ",
    dd_weight: "重さ",
    dd_temp: "温度",
    dd_volume: "体積",
    dd_area: "面積",
    dd_speed: "速度",
    dd_pressure: "圧力",

    footer_home: "NicheWorks Tools 一覧へ戻る",

    // 単位ラベル（表示用）
    units: {
      length: {
        mm: "ミリメートル(mm)",
        cm: "センチメートル(cm)",
        m: "メートル(m)",
        km: "キロメートル(km)",
        inch: "インチ(inch)",
        ft: "フィート(ft)",
        yard: "ヤード(yard)",
        mile: "マイル(mile)",

        shaku: "尺",
        sun: "寸",
        bu: "分（長さ）",
        ken: "間",
        tsubo: "坪（長さ換算）",
        ri: "里",

        furlong: "ハロン(furlong)",
        chain: "チェーン(chain)",
        league: "リーグ(league)",

        angstrom: "オングストローム(angstrom)",
        micrometer: "マイクロメートル(μm)",
        parsec: "パーセク(parsec)",
        lightyear: "光年(light-year)"
      },
      weight: {
        g: "グラム(g)",
        kg: "キログラム(kg)",
        lb: "ポンド(lb)",
        oz: "オンス(oz)",

        monme: "匁",
        kin: "斤",
        kan: "貫",
        dram: "ドラム(dram)",
        grain: "グレーン(grain)"
      },
      volume: {
        ml: "ミリリットル(ml)",
        l: "リットル(L)",
        cup: "カップ(cup)",

        gou: "合",
        shou: "升",
        to: "斗"
      },
      area: {
        mm2: "平方ミリメートル(mm²)",
        cm2: "平方センチメートル(cm²)",
        m2: "平方メートル(m²)",
        km2: "平方キロメートル(km²)",

        tsubo: "坪",
        tan: "反",
        se: "畝",
        cho: "町"
      },
      speed: {
        "m/s": "メートル毎秒(m/s)",
        "km/h": "キロメートル毎時(km/h)",
        mph: "マイル毎時(mph)",
        knot: "ノット(knot)",
        league_per_hour: "リーグ毎時(league/h)"
      },
      pressure: {
        pa: "パスカル(Pa)",
        hpa: "ヘクトパスカル(hPa)",
        bar: "バール(bar)",
        atm: "標準大気圧(atm)",
        torr: "トル(torr)",
        mmHg: "ミリメートル水銀柱(mmHg)",
        psi: "psi"
      }
    }
  },

  en: {
    title: "UnitMaster",
    subtitle: "Convert and calculate global standard units — length, weight, temperature, volume, area, speed, pressure, and more.",

    category_label: "Category",
    dd_category_label: "Category",

    howto_title: "【How to Use】",
    howto_1: "Choose a category (dropdown on mobile)",
    howto_2: "Enter a value",
    howto_3: "Select units for From / To",
    howto_4: "Toggle Auto Calculation ON/OFF",
    howto_5: "If OFF, press the Calculate button",

    label_value: "Value",
    label_from: "From",
    label_to: "To",

    auto: "Auto Calc",
    btn_calc: "Calculate",

    bulk_title: "Bulk Convert",
    history_title: "History (5)",
    history_empty: "No history yet",

    result: (v, f, r, t) => `${v} ${f} = ${r} ${t}`,

    donate_line1: "💗 If this tool helps you, please support us!",

    cat_length: "Length",
    cat_weight: "Weight",
    cat_temp: "Temperature",
    cat_volume: "Volume",
    cat_area: "Area",
    cat_speed: "Speed",
    cat_pressure: "Pressure",

    dd_length: "Length",
    dd_weight: "Weight",
    dd_temp: "Temperature",
    dd_volume: "Volume",
    dd_area: "Area",
    dd_speed: "Speed",
    dd_pressure: "Pressure",

    footer_home: "Back to NicheWorks Tools",

    units: {
      length: {
        mm: "mm",
        cm: "cm",
        m: "m",
        km: "km",
        inch: "inch",
        ft: "ft",
        yard: "yard",
        mile: "mile",

        shaku: "尺(Shaku)",
        sun: "寸(Sun)",
        bu: "分(Bu)",
        ken: "間(Ken)",
        tsubo: "坪(Tsubo)",
        ri: "里(Ri)",

        furlong: "furlong",
        chain: "chain",
        league: "league",

        angstrom: "angstrom",
        micrometer: "micrometer",
        parsec: "parsec",
        lightyear: "light-year"
      },
      weight: {
        g: "g",
        kg: "kg",
        lb: "lb",
        oz: "oz",

        monme: "匁(Momme)",
        kin: "斤(Kin)",
        kan: "貫(Kan)",
        dram: "dram",
        grain: "grain"
      },
      volume: {
        ml: "ml",
        l: "L",
        cup: "cup",

        gou: "合(Gou)",
        shou: "升(Sho)",
        to: "斗(To)"
      },
      area: {
        mm2: "mm²",
        cm2: "cm²",
        m2: "m²",
        km2: "km²",

        tsubo: "坪(Tsubo)",
        tan: "反(Tan)",
        se: "畝(Se)",
        cho: "町(Cho)"
      },
      speed: {
        "m/s": "m/s",
        "km/h": "km/h",
        mph: "mph",
        knot: "knot",
        league_per_hour: "league/hour"
      },
      pressure: {
        pa: "Pa",
        hpa: "hPa",
        bar: "bar",
        atm: "atm",
        torr: "torr",
        mmHg: "mmHg",
        psi: "psi"
      }
    }
  }
};

/* ----------------------------
  単位辞書（換算用）
---------------------------- */
const units = {
  length: {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    inch: 0.0254,
    ft: 0.3048,
    yard: 0.9144,
    mile: 1609.344,
    shaku: 0.303,
    sun: 0.0303,
    bu: 0.00303,
    ken: 1.818,
    tsubo: 3.306,
    ri: 3927,
    furlong: 201.168,
    chain: 20.1168,
    league: 4828.032,
    angstrom: 1e-10,
    micrometer: 1e-6,
    parsec: 3.0857e16,
    lightyear: 9.4607e15
  },
  weight: {
    g: 1,
    kg: 1000,
    lb: 453.59237,
    oz: 28.3495231,
    monme: 3.75,
    kin: 600,
    kan: 3750,
    dram: 1.771845,
    grain: 0.06479891
  },
  temp: ["c", "f", "k"],
  volume: {
    ml: 0.001,
    l: 1,
    cup: 0.24,
    gou: 0.18039,
    shou: 1.8039,
    to: 18.039
  },
  area: {
    mm2: 0.000001,
    cm2: 0.0001,
    m2: 1,
    km2: 1000000,
    tsubo: 3.305785,
    tan: 991.736,
    se: 99.1736,
    cho: 9917.36
  },
  speed: {
    "m/s": 1,
    "km/h": 0.277778,
    mph: 0.44704,
    knot: 0.514444,
    league_per_hour: 1.34112
  },
  pressure: {
    pa: 1,
    hpa: 100,
    bar: 100000,
    atm: 101325,
    torr: 133.322,
    mmHg: 133.322,
    psi: 6894.76
  }
};

/* ----------------------------
  DOM参照
---------------------------- */
const categorySelect = document.getElementById("categorySelect");
const categoryLabel = document.querySelector('label[for="categorySelect"]');

const tabs = document.querySelectorAll(".tab");
const fromSel = document.getElementById("fromUnit");
const toSel = document.getElementById("toUnit");
const inputValue = document.getElementById("inputValue");
const autoCalc = document.getElementById("autoCalc");
const calcBtn = document.getElementById("calcBtn");
const resultBox = document.getElementById("resultBox");
const bulkBox = document.getElementById("bulkBox");
const historyBox = document.getElementById("historyBox");

const langBtns = document.querySelectorAll(".lang-btn");
const donateP = document.querySelector(".donate-box p");
const footerHome = document.querySelector(".home-link a");
const subtitleEl = document.getElementById("subtitle");
const bulkLabel = document.getElementById("bulkLabel");
const historyLabel = document.getElementById("historyLabel");
const accordionToggles = document.querySelectorAll(".accordion-toggle");
const themeToggle = document.getElementById("themeToggle");
const htmlEl = document.documentElement;
const HISTORY_KEY = "unitmaster_history";
const THEME_KEY = "unitmaster_theme";
let historyReady = false;

function getCategoryTextMap(t) {
  return {
    length: t.dd_length,
    weight: t.dd_weight,
    temp: t.dd_temp,
    volume: t.dd_volume,
    area: t.dd_area,
    speed: t.dd_speed,
    pressure: t.dd_pressure
  };
}

function syncCategoryDropdownText(t) {
  const ddMap = getCategoryTextMap(t);
  if (categorySelect) {
    Array.from(categorySelect.options).forEach(o => {
      if (ddMap[o.value]) o.textContent = ddMap[o.value];
    });
  }
}

function getUnitLabel(cat, unit, t) {
  const unitsMap = t.units || {};
  const catMap = unitsMap[cat] || {};
  return catMap[unit] || unit;
}

/* ----------------------------
  テーマ切替
---------------------------- */
function applyTheme(theme) {
  const isDark = theme === "dark";
  if (isDark) htmlEl.classList.add("dark");
  else htmlEl.classList.remove("dark");

  if (themeToggle) {
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
  }
}

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme === "dark" ? "dark" : "light");

/* ----------------------------
  言語適用
---------------------------- */
let currentLang = "ja";

function applyLanguage(lang) {
  currentLang = lang;
  const t = i18n[lang];

  // タイトル
  const titleEl = document.querySelector(".title");
  if (titleEl) titleEl.textContent = t.title;

  // サブタイトル
  if (subtitleEl) subtitleEl.textContent = t.subtitle;

  // カテゴリラベル
  if (categoryLabel) categoryLabel.textContent = t.dd_category_label || t.category_label;

  // 使い方
  const howtoTitle = document.querySelector(".howto h2");
  if (howtoTitle) howtoTitle.textContent = t.howto_title;

  const steps = document.querySelectorAll(".howto li");
  if (steps.length >= 5) {
    steps[0].textContent = t.howto_1;
    steps[1].textContent = t.howto_2;
    steps[2].textContent = t.howto_3;
    steps[3].textContent = t.howto_4;
    steps[4].textContent = t.howto_5;
  }

  // 入力ラベル
  const inputLabels = document.querySelectorAll(".convert-box .input-block label");
  if (inputLabels.length >= 3) {
    inputLabels[0].textContent = t.label_value;
    inputLabels[1].textContent = t.label_from;
    inputLabels[2].textContent = t.label_to;
  }

  // 自動計算ラベル
  const autoLabel = document.querySelector(".autocalc-row label");
  if (autoLabel) {
    const nodes = Array.from(autoLabel.childNodes);
    let textNode = nodes.find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.nodeValue = " " + t.auto;
    else autoLabel.append(" " + t.auto);
  }

  // 計算ボタン
  if (calcBtn) calcBtn.textContent = t.btn_calc;

  // PCタブ
  const tabList = [
    t.cat_length, t.cat_weight, t.cat_temp,
    t.cat_volume, t.cat_area, t.cat_speed, t.cat_pressure
  ];
  tabs.forEach((el, idx) => {
    if (tabList[idx]) el.textContent = tabList[idx];
  });

  // モバイルドロップダウン
  syncCategoryDropdownText(t);

  // 寄付文
  if (donateP) donateP.textContent = t.donate_line1;

  // フッター
  if (footerHome) footerHome.textContent = t.footer_home;

  // アコーディオンラベル
  if (bulkLabel) bulkLabel.textContent = t.bulk_title;
  if (historyLabel) historyLabel.textContent = t.history_title;

  // 再計算 & 履歴
  calculate();
  loadHistory();
}

/* ----------------------------
  PCタブ切替
---------------------------- */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    historyReady = true;
    const cat = tab.dataset.cat;
    categorySelect.value = cat;
    applyCategory(cat);
  });
});

/* ----------------------------
  スマホカテゴリ切替
---------------------------- */
if (categorySelect) {
  categorySelect.addEventListener("change", () => {
    historyReady = true;
    applyCategory(categorySelect.value);
  });
}

/* ----------------------------
  カテゴリ適用
---------------------------- */
function applyCategory(cat) {
  tabs.forEach(t => t.classList.remove("active"));
  const activeTab = document.querySelector(`.tab[data-cat="${cat}"]`);
  if (activeTab) activeTab.classList.add("active");

  fromSel.innerHTML = "";
  toSel.innerHTML = "";

  const t = i18n[currentLang];

  // option（単位）
  if (cat === "temp") {
    ["c", "f", "k"].forEach(u => {
      fromSel.innerHTML += `<option value="${u}">${u.toUpperCase()}</option>`;
      toSel.innerHTML += `<option value="${u}">${u.toUpperCase()}</option>`;
    });
  } else {
    const dict = units[cat];
    for (const u in dict) {
      const label = getUnitLabel(cat, u, t);
      fromSel.innerHTML += `<option value="${u}">${label}</option>`;
      toSel.innerHTML += `<option value="${u}">${label}</option>`;
    }
  }

  // モバイルカテゴリドロップダウンのラベル更新
  syncCategoryDropdownText(t);

  calculate();
}

/* ----------------------------
  温度変換
---------------------------- */
function convertTemperature(value, from, to) {
  let c;
  if (from === "c") c = value;
  if (from === "f") c = (value - 32) * 5 / 9;
  if (from === "k") c = value - 273.15;

  if (to === "c") return c;
  if (to === "f") return c * 9 / 5 + 32;
  if (to === "k") return c + 273.15;

  return value;
}

function formatUnitLabel(cat, unit) {
  return cat === "temp" ? unit.toUpperCase() : unit;
}

function generateBulkList() {
  if (!bulkBox) return;
  const rawValue = inputValue.value || "0";
  const v = parseFloat(rawValue || "0");
  const cat = categorySelect.value;

  if (!Number.isFinite(v)) {
    bulkBox.innerHTML = "";
    return;
  }

  const t = i18n[currentLang];
  const dict = units[cat];

  const lines = [
    `${rawValue} ${
      cat === "temp"
        ? formatUnitLabel(cat, fromSel.value)
        : getUnitLabel(cat, fromSel.value, t)
    }`
  ];

  if (cat === "temp") {
    ["c", "f", "k"].forEach(u => {
      if (u === fromSel.value) return;
      const res = convertTemperature(v, fromSel.value, u);
      lines.push(`= ${res.toFixed(4)} ${u.toUpperCase()}`);
    });
  } else {
    const vBase = v * dict[fromSel.value];
    for (const u in dict) {
      if (u === fromSel.value) continue;
      const r = vBase / dict[u];
      const label = getUnitLabel(cat, u, t);
      lines.push(`= ${r.toFixed(4)} ${label}`);
    }
  }

  bulkBox.innerHTML = lines
    .map(l => `<div class="bulk-line">${l}</div>`)
    .join("");
}

function saveHistory(resultText) {
  let list = [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) list = JSON.parse(stored);
    if (!Array.isArray(list)) list = [];
  } catch (e) {
    list = [];
  }

  list.unshift({
    value: inputValue.value || "0",
    from: fromSel.value,
    to: toSel.value,
    result: resultText,
    category: categorySelect.value
  });

  list = list.slice(0, 5);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore storage errors
  }

  loadHistory();
}

function loadHistory() {
  if (!historyBox) return;

  let list = [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) list = JSON.parse(stored);
    if (!Array.isArray(list)) list = [];
  } catch (e) {
    list = [];
  }

  const t = i18n[currentLang];

  if (list.length === 0) {
    historyBox.innerHTML = `<p class="history-empty">${t.history_empty}</p>`;
    return;
  }

  const catMap = getCategoryTextMap(t);

  historyBox.innerHTML = list
    .map(item => {
      const catLabel = catMap[item.category] || item.category;

      let fromLabel = item.from;
      let toLabel = item.to;

      if (item.category === "temp") {
        fromLabel = item.from.toUpperCase();
        toLabel = item.to.toUpperCase();
      } else {
        fromLabel = getUnitLabel(item.category, item.from, t);
        toLabel = getUnitLabel(item.category, item.to, t);
      }

      const resultLine =
        item.result ||
        t.result(item.value, fromLabel, "-", toLabel);

      return `<div class="history-item">
        <div>${resultLine}</div>
        <div class="history-meta">${item.value} ${fromLabel} → ${toLabel} | ${catLabel}</div>
      </div>`;
    })
    .join("");
}

/* ----------------------------
  通常変換
---------------------------- */
function calculate() {
  const v = parseFloat(inputValue.value || "0");
  const cat = categorySelect.value;

  const t = i18n[currentLang];

  let resultText = "";

  if (cat === "temp") {
    const rTemp = convertTemperature(v, fromSel.value, toSel.value);
    resultText = t.result(
      v,
      fromSel.value.toUpperCase(),
      rTemp.toFixed(4),
      toSel.value.toUpperCase()
    );
  } else {
    const dict = units[cat];
    const vBase = v * dict[fromSel.value];
    const r = vBase / dict[toSel.value];

    const fromLabel = getUnitLabel(cat, fromSel.value, t);
    const toLabel = getUnitLabel(cat, toSel.value, t);

    resultText = t.result(
      v,
      fromLabel,
      r.toFixed(4),
      toLabel
    );
  }

  resultBox.textContent = resultText;
  generateBulkList();
  if (historyReady) saveHistory(resultText);
  else loadHistory();
}

/* ----------------------------
  自動計算
---------------------------- */
inputValue.addEventListener("input", () => {
  historyReady = true;
  if (autoCalc.checked) calculate();
});
fromSel.addEventListener("change", () => {
  historyReady = true;
  if (autoCalc.checked) calculate();
});
toSel.addEventListener("change", () => {
  historyReady = true;
  if (autoCalc.checked) calculate();
});

autoCalc.addEventListener("change", () => {
  if (autoCalc.checked) {
    calcBtn.classList.add("hidden");
    calculate();
  } else {
    calcBtn.classList.remove("hidden");
  }
});

calcBtn.addEventListener("click", () => {
  historyReady = true;
  calculate();
});

/* ----------------------------
  アコーディオン
---------------------------- */
accordionToggles.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    const expanded = btn.getAttribute("aria-expanded") === "true";
    const nextState = !expanded;
    btn.setAttribute("aria-expanded", nextState ? "true" : "false");

    const icon = btn.querySelector(".accordion-icon");
    if (icon) icon.textContent = nextState ? "−" : "+";

    if (target) target.classList.toggle("open", nextState);
  });
});

/* ----------------------------
  テーマ切替トグル
---------------------------- */
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = htmlEl.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

/* ----------------------------
  言語切替
---------------------------- */
langBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    langBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyLanguage(btn.dataset.lang);
  });
});

/* ----------------------------
  初期表示
---------------------------- */
applyCategory("length");
applyLanguage("ja");
