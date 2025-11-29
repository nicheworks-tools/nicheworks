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
    dd_length: "長さ / Length",
    dd_weight: "重さ / Weight",
    dd_temp: "温度 / Temperature",
    dd_volume: "体積 / Volume",
    dd_area: "面積 / Area",
    dd_speed: "速度 / Speed",
    dd_pressure: "圧力 / Pressure",

    footer_home: "NicheWorks Tools 一覧へ戻る",
  },

  en: {
    title: "UnitMaster",
    subtitle: "Convert and calculate global standard units — length, weight, temperature, volume, area, speed, pressure, and more.",

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
  }
};

/* ----------------------------
  単位辞書
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
    mile: 1609.344
  },
  weight: {
    g: 1,
    kg: 1000,
    lb: 453.59237,
    oz: 28.3495231
  },
  temp: ["c", "f", "k"],
  volume: {
    ml: 0.001,
    l: 1,
    cup: 0.24
  },
  area: {
    "mm2": 0.000001,
    "cm2": 0.0001,
    "m2": 1,
    "km2": 1000000
  },
  speed: {
    "m/s": 1,
    "km/h": 0.277778,
    mph: 0.44704
  },
  pressure: {
    pa: 1,
    hpa: 100,
    bar: 100000,
    atm: 101325
  }
};

/* ----------------------------
  DOM参照
---------------------------- */
const categorySelect = document.getElementById("categorySelect");
const tabs = document.querySelectorAll(".tab");
const fromSel = document.getElementById("fromUnit");
const toSel = document.getElementById("toUnit");
const inputValue = document.getElementById("inputValue");
const autoCalc = document.getElementById("autoCalc");
const calcBtn = document.getElementById("calcBtn");
const resultBox = document.getElementById("resultBox");

const langBtns = document.querySelectorAll(".lang-btn");
const donateP = document.querySelector(".donate-box p");
const footerHome = document.querySelector(".home-link a");
const subtitleEl = document.getElementById("subtitle");

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
  const ddMap = {
    length: t.dd_length,
    weight: t.dd_weight,
    temp: t.dd_temp,
    volume: t.dd_volume,
    area: t.dd_area,
    speed: t.dd_speed,
    pressure: t.dd_pressure
  };
  if (categorySelect) {
    for (let o of categorySelect.options) {
      if (ddMap[o.value]) o.textContent = ddMap[o.value];
    }
  }

  // 寄付文
  if (donateP) donateP.textContent = t.donate_line1;

  // フッター
  if (footerHome) footerHome.textContent = t.footer_home;

  // 再計算
  calculate();
}

/* ----------------------------
  PCタブ切替
---------------------------- */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
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

  // モバイル用ドロップダウンの表示名を取得
  const ddMap = {
    length: t.dd_length,
    weight: t.dd_weight,
    temp: t.dd_temp,
    volume: t.dd_volume,
    area: t.dd_area,
    speed: t.dd_speed,
    pressure: t.dd_pressure
  };

  // option ラベルは ddMap を使い、単位名の表示崩れを防ぐ
  if (cat === "temp") {
    ["c", "f", "k"].forEach(u => {
      fromSel.innerHTML += `<option value="${u}">${u.toUpperCase()}</option>`;
      toSel.innerHTML += `<option value="${u}">${u.toUpperCase()}</option>`;
    });
  } else {
    const dict = units[cat];
    for (const u in dict) {
      fromSel.innerHTML += `<option value="${u}">${u}</option>`;
      toSel.innerHTML += `<option value="${u}">${u}</option>`;
    }
  }

  // ★ スマホ用カテゴリドロップダウンの文言を applyCategory 側でも更新（バグ修正の核心）
  if (categorySelect && ddMap[cat]) {
    const opt = categorySelect.querySelector(`option[value="${cat}"]`);
    if (opt) opt.textContent = ddMap[cat];
  }

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

/* ----------------------------
  通常変換
---------------------------- */
function calculate() {
  const v = parseFloat(inputValue.value || "0");
  const cat = categorySelect.value;

  if (cat === "temp") {
    const rTemp = convertTemperature(v, fromSel.value, toSel.value);
    resultBox.textContent = i18n[currentLang].result(
      v, fromSel.value.toUpperCase(), rTemp.toFixed(4), toSel.value.toUpperCase()
    );
    return;
  }

  const dict = units[cat];
  const vBase = v * dict[fromSel.value];
  const r = vBase / dict[toSel.value];

  resultBox.textContent = i18n[currentLang].result(
    v, fromSel.value, r.toFixed(4), toSel.value
  );
}

/* ----------------------------
  自動計算
---------------------------- */
inputValue.addEventListener("input", () => {
  if (autoCalc.checked) calculate();
});
fromSel.addEventListener("change", () => {
  if (autoCalc.checked) calculate();
});
toSel.addEventListener("change", () => {
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

calcBtn.addEventListener("click", calculate);

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
