/* =========================================================
   UnitMaster - app.js（MVP 完全版）
   ========================================================= */

/* ---------------------------------------------------------
   1) 単位辞書（全カテゴリ）
   基準単位：長さ=m、重さ=kg、体積=m3、面積=m2、速度=m/s、圧力=Pa
   --------------------------------------------------------- */

/* ■ 長さ（m基準） */
const unitsLength = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  inch: 0.0254,
  feet: 0.3048,
  yard: 0.9144,
  mile: 1609.344
};

/* ■ 重さ（kg基準） */
const unitsWeight = {
  mg: 0.000001,
  g: 0.001,
  kg: 1,
  ton: 1000,
  oz: 0.0283495,
  lb: 0.453592
};

/* ■ 温度（例外処理のため辞書は名称のみ） */
const unitsTemp = ["C", "F", "K"];

/* ■ 体積（m3基準） */
const unitsVolume = {
  ml: 0.000001,
  L: 0.001,
  "m3": 1,
  "gallon_us": 0.00378541,
  "quart": 0.000946353,
  "pint": 0.000473176,
  "cup_us": 0.000236588
};

/* ■ 面積（m2基準） */
const unitsArea = {
  "cm2": 0.0001,
  "m2": 1,
  "km2": 1_000_000,
  "inch2": 0.00064516,
  "feet2": 0.092903,
  "acre": 4046.8564224
};

/* ■ 速度（m/s基準） */
const unitsSpeed = {
  "m_s": 1,
  "km_h": 0.2777778,
  "mph": 0.44704
};

/* ■ 圧力（Pa基準） */
const unitsPressure = {
  Pa: 1,
  kPa: 1000,
  bar: 100000,
  atm: 101325,
  psi: 6894.757
};

/* ---------------------------------------------------------
   2) カテゴリ紐付け
   --------------------------------------------------------- */
const categoryMap = {
  length: unitsLength,
  weight: unitsWeight,
  temp: unitsTemp,  // 温度は例外
  volume: unitsVolume,
  area: unitsArea,
  speed: unitsSpeed,
  pressure: unitsPressure
};

/* 現在のカテゴリ */
let currentCategory = "length";

/* ---------------------------------------------------------
   3) DOM取得
   --------------------------------------------------------- */
const categoryTabs = document.getElementById("categoryTabs");
const inputValue = document.getElementById("inputValue");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const resultText = document.getElementById("resultText");
const autoCalc = document.getElementById("autoCalc");
const calcBtn = document.getElementById("calcBtn");

/* ---------------------------------------------------------
   4) 単位セレクトの更新
   --------------------------------------------------------- */
function updateUnitSelects() {
  const units = categoryMap[currentCategory];
  let options = "";

  if (currentCategory === "temp") {
    // 温度だけ特殊
    units.forEach(u => {
      options += `<option value="${u}">${u}</option>`;
    });
  } else {
    for (let key in units) {
      options += `<option value="${key}">${key}</option>`;
    }
  }

  fromUnit.innerHTML = options;
  toUnit.innerHTML = options;
}

/* ---------------------------------------------------------
   5) 温度変換ロジック
   --------------------------------------------------------- */
function convertTemperature(value, from, to) {
  let celsius;

  /* まず°Cに正規化 */
  if (from === "C") celsius = value;
  else if (from === "F") celsius = (value - 32) * 5 / 9;
  else if (from === "K") celsius = value - 273.15;

  /* そこから目的単位へ */
  if (to === "C") return celsius;
  if (to === "F") return (celsius * 9 / 5) + 32;
  if (to === "K") return celsius + 273.15;
}

/* ---------------------------------------------------------
   6) 汎用変換ロジック
   --------------------------------------------------------- */
function convertGeneral(value, from, to, dict) {
  const base = dict[from];
  const baseTo = dict[to];
  return (value * base) / baseTo;
}

/* ---------------------------------------------------------
   7) メイン変換関数
   --------------------------------------------------------- */
function calculate() {
  const val = parseFloat(inputValue.value);
  if (isNaN(val)) {
    resultText.textContent = "";
    return;
  }

  const f = fromUnit.value;
  const t = toUnit.value;

  let result;

  if (currentCategory === "temp") {
    result = convertTemperature(val, f, t);
  } else {
    const dict = categoryMap[currentCategory];
    result = convertGeneral(val, f, t, dict);
  }

  resultText.textContent = `${val} ${f} = ${Number(result.toFixed(4))} ${t}`;
}

/* ---------------------------------------------------------
   8) 自動計算ON/OFF
   --------------------------------------------------------- */
autoCalc.addEventListener("change", () => {
  if (autoCalc.checked) {
    calcBtn.style.display = "none";
    calculate();
  } else {
    calcBtn.style.display = "block";
  }
});

inputValue.addEventListener("input", () => {
  if (autoCalc.checked) calculate();
});
fromUnit.addEventListener("change", () => {
  if (autoCalc.checked) calculate();
});
toUnit.addEventListener("change", () => {
  if (autoCalc.checked) calculate();
});

calcBtn.addEventListener("click", calculate);

/* ---------------------------------------------------------
   9) カテゴリタブ切替
   --------------------------------------------------------- */
categoryTabs.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  const cat = e.target.dataset.cat;

  currentCategory = cat;

  // active付け替え
  [...categoryTabs.children].forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");

  updateUnitSelects();
  calculate();
});

/* ---------------------------------------------------------
   10) i18n（最小MVP版）
   --------------------------------------------------------- */
const i18nDict = {
  ja: {
    desc: "世界標準40単位に対応した超軽量ユニットコンバータ",
    from_value: "変換元の値",
    from_unit: "変換元の単位",
    to_unit: "変換先の単位",
    auto_calc: "自動計算",
    calc_btn: "計算する"
  },
  en: {
    desc: "Ultra-light unit converter for 40 world-standard units",
    from_value: "From value",
    from_unit: "From unit",
    to_unit: "To unit",
    auto_calc: "Auto calculate",
    calc_btn: "Convert"
  }
};

document.querySelectorAll(".lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    applyLang(lang);
  });
});

function applyLang(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = i18nDict[lang][key];
  });
}

/* ---------------------------------------------------------
   11) 初期化
   --------------------------------------------------------- */
updateUnitSelects();
calculate();
