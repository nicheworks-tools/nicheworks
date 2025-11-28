/* ==========================================================
   UnitMaster - 世界標準ユニットコンバータ（A構成）
   仕様書フル準拠 / スマホ＝カテゴリはドロップダウン
   PC＝横タブ / 自動計算ON/OFF / 温度は専用式
========================================================== */

// --------------------------
// 単位辞書（A構成・世界標準）
// --------------------------
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
    cup: 0.24 // 日本のカップ基準
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

// --------------------------
// DOM参照
// --------------------------
const categorySelect = document.getElementById("categorySelect");
const tabs = document.querySelectorAll(".tab");
const fromSel = document.getElementById("fromUnit");
const toSel = document.getElementById("toUnit");
const inputValue = document.getElementById("inputValue");
const autoCalc = document.getElementById("autoCalc");
const calcBtn = document.getElementById("calcBtn");
const resultBox = document.getElementById("resultBox");

// --------------------------
// カテゴリ適用処理（スマホ/PC共通）
// --------------------------
function applyCategory(cat) {
  // PCタブ表示を同期
  tabs.forEach(t => t.classList.remove("active"));
  document.querySelector(`.tab[data-cat="${cat}"]`)?.classList.add("active");

  // from/to 初期化
  fromSel.innerHTML = "";
  toSel.innerHTML = "";

  if (cat === "temp") {
    // 温度は特別処理
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

  calculate();
}

// --------------------------
// PCタブ切替
// --------------------------
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const cat = tab.dataset.cat;
    categorySelect.value = cat;
    applyCategory(cat);
  });
});

// --------------------------
// スマホカテゴリ切替
// --------------------------
categorySelect.addEventListener("change", () => {
  applyCategory(categorySelect.value);
});

// --------------------------
// 温度変換専用式
// --------------------------
function convertTemperature(value, from, to) {
  let c;

  // まず摂氏へ正規化
  if (from === "c") c = value;
  if (from === "f") c = (value - 32) * 5/9;
  if (from === "k") c = value - 273.15;

  // 摂氏から目的単位へ
  if (to === "c") return c;
  if (to === "f") return c * 9/5 + 32;
  if (to === "k") return c + 273.15;
}

// --------------------------
// 共通変換
// --------------------------
function calculate() {
  const val = parseFloat(inputValue.value || "0");
  const cat = categorySelect.value;

  if (cat === "temp") {
    const result = convertTemperature(val, fromSel.value, toSel.value);
    resultBox.textContent = `${val} ${fromSel.value.toUpperCase()} = ${result.toFixed(4)} ${toSel.value.toUpperCase()}`;
    return;
  }

  const dict = units[cat];
  const meterValue = val * dict[fromSel.value];     // 基準単位に揃える
  const result = meterValue / dict[toSel.value];    // 目的単位に変換

  resultBox.textContent = `${val} ${fromSel.value} = ${result.toFixed(4)} ${toSel.value}`;
}

// --------------------------
// 自動計算ON/OFF
// --------------------------
inputValue.addEventListener("input", () => {
  if (autoCalc.checked) calculate();
});

fromSel.addEventListener("change", () => {
  if (autoCalc.checked) calculate();
});

toSel.addEventListener("change", () => {
  if (autoCalc.checked) calculate();
});

// チェック ON/OFFでボタン表示切替
autoCalc.addEventListener("change", () => {
  if (autoCalc.checked) {
    calcBtn.classList.add("hidden");
    calculate();
  } else {
    calcBtn.classList.remove("hidden");
  }
});

// 手動計算
calcBtn.addEventListener("click", calculate);

// --------------------------
// 初期表示（長さカテゴリ）
applyCategory("length");
