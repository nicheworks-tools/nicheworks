// ==========================================================
// UnitMaster - app.js 完全版（仕様書 v1準拠）
// ==========================================================

// ---------------------------
// i18n（JA/EN）
// ---------------------------
const i18n = {
  ja: {
    from_value: "変換元の値",
    from_unit: "変換元の単位",
    to_unit: "変換先の単位",
    auto_calc: "自動計算",
    result_empty: "",
  },
  en: {
    from_value: "Value",
    from_unit: "From",
    to_unit: "To",
    auto_calc: "Auto Calc",
    result_empty: "",
  }
};

let currentLang = "ja";

// ---------------------------
// 単位リスト（A構成 40単位）
// 各カテゴリは “基準単位” に正規化する
// ---------------------------
const units = {
  length: {
    base: "m",
    list: {
      m: 1,
      cm: 0.01,
      mm: 0.001,
      km: 1000,
      inch: 0.0254,
      feet: 0.3048,
      yard: 0.9144,
      mile: 1609.344
    },
    names: {
      ja: { m:"メートル", cm:"センチ", mm:"ミリ", km:"キロ", inch:"インチ", feet:"フィート", yard:"ヤード", mile:"マイル" },
      en: { m:"meter", cm:"centimeter", mm:"millimeter", km:"kilometer", inch:"inch", feet:"feet", yard:"yard", mile:"mile" }
    }
  },

  weight: {
    base: "kg",
    list: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.45359237,
      oz: 0.0283495231
    },
    names: {
      ja:{ kg:"キログラム", g:"グラム", mg:"ミリグラム", lb:"ポンド", oz:"オンス" },
      en:{ kg:"kg", g:"g", mg:"mg", lb:"pound", oz:"ounce" }
    }
  },

  temperature: {
    list: ["C", "F", "K"],
    names: {
      ja:{ C:"摂氏(℃)", F:"華氏(°F)", K:"ケルビン(K)" },
      en:{ C:"Celsius", F:"Fahrenheit", K:"Kelvin" }
    }
  },

  volume: {
    base: "l",
    list: {
      l: 1,
      ml: 0.001,
      m3: 1000,
      gallon: 3.78541,
      pint: 0.473176,
      cup: 0.24    // 日本式カップ
    },
    names:{
      ja:{ l:"リットル", ml:"ミリリットル", m3:"立方メートル", gallon:"ガロン", pint:"パイント", cup:"カップ" },
      en:{ l:"liter", ml:"milliliter", m3:"m³", gallon:"gallon", pint:"pint", cup:"cup" }
    }
  },

  area: {
    base: "m2",
    list: {
      m2: 1,
      cm2: 0.0001,
      mm2: 0.000001,
      ha: 10000,
      acre: 4046.8564224
    },
    names:{
      ja:{ m2:"平方メートル", cm2:"平方センチ", mm2:"平方ミリ", ha:"ヘクタール", acre:"エーカー" },
      en:{ m2:"m²", cm2:"cm²", mm2:"mm²", ha:"hectare", acre:"acre" }
    }
  },

  speed: {
    base: "mps",
    list: {
      mps: 1,
      kmh: 1000/3600,
      mph: 0.44704,
      knot: 0.514444
    },
    names:{
      ja:{ mps:"m/s", kmh:"km/h", mph:"mph", knot:"ノット" },
      en:{ mps:"m/s", kmh:"km/h", mph:"mph", knot:"knot" }
    }
  },

  pressure: {
    base: "Pa",
    list: {
      Pa: 1,
      kPa: 1000,
      MPa: 1e6,
      bar: 100000,
      atm: 101325,
      psi: 6894.76
    },
    names:{
      ja:{ Pa:"Pa", kPa:"kPa", MPa:"MPa", bar:"bar", atm:"気圧", psi:"psi" },
      en:{ Pa:"Pa", kPa:"kPa", MPa:"MPa", bar:"bar", atm:"atm", psi:"psi" }
    }
  }
};

// ==========================================================
// DOM
// ==========================================================
const inputValue = document.getElementById("inputValue");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const calcBtn = document.getElementById("calcBtn");
const autoCalc = document.getElementById("autoCalc");
const categoryTabs = document.getElementById("categoryTabs");
const resultText = document.getElementById("resultText");

// ==========================================================
// カテゴリ切替
// ==========================================================
let currentCategory = "length";

function updateUnitSelects() {
  fromUnit.innerHTML = "";
  toUnit.innerHTML = "";

  if (currentCategory === "temperature") {
    units.temperature.list.forEach(u => {
      const opt1 = document.createElement("option");
      const opt2 = document.createElement("option");
      opt1.value = opt2.value = u;
      opt1.textContent = units.temperature.names[currentLang][u];
      opt2.textContent = units.temperature.names[currentLang][u];
      fromUnit.appendChild(opt1);
      toUnit.appendChild(opt2);
    });
  } else {
    const u = units[currentCategory];
    Object.keys(u.list).forEach(key => {
      const opt1 = document.createElement("option");
      const opt2 = document.createElement("option");
      opt1.value = opt2.value = key;
      opt1.textContent = u.names[currentLang][key];
      opt2.textContent = u.names[currentLang][key];
      fromUnit.appendChild(opt1);
      toUnit.appendChild(opt2);
    });
  }
}

categoryTabs.addEventListener("click", e => {
  if (e.target.tagName !== "BUTTON") return;

  [...categoryTabs.children].forEach(b => b.classList.remove("active"));
  e.target.classList.add("active");

  currentCategory = e.target.dataset.cat;
  updateUnitSelects();
  clearResult();
});

// ==========================================================
// 計算ロジック
// ==========================================================
function convertTemperature(value, from, to) {
  if (from === to) return value;
  let c;

  if (from === "C") c = value;
  if (from === "F") c = (value - 32) * 5/9;
  if (from === "K") c = value - 273.15;

  if (to === "C") return c;
  if (to === "F") return c * 9/5 + 32;
  if (to === "K") return c + 273.15;
}

function calculate() {
  const val = parseFloat(inputValue.value);
  if (isNaN(val)) return clearResult();

  let from = fromUnit.value;
  let to = toUnit.value;

  // 温度だけ例外処理
  if (currentCategory === "temperature") {
    const r = convertTemperature(val, from, to);
    return showResult(val, from, r, to);
  }

  // 通常（正規化 → 変換）
  const cat = units[currentCategory];
  const baseValue = val * cat.list[from];
  const result = baseValue / cat.list[to];

  showResult(val, from, result, to);
}

// ==========================================================
// 表示
// ==========================================================
function showResult(fromVal, fromU, result, toU) {
  const r = Number(result).toFixed(4);
  resultText.textContent = `${fromVal} ${fromU} = ${r} ${toU}`;
}

function clearResult() {
  resultText.textContent = "";
}

// ==========================================================
// 自動計算 / 手動計算 切替
// ==========================================================
autoCalc.addEventListener("change", () => {
  calcBtn.style.display = autoCalc.checked ? "none" : "block";
  clearResult();
});

[inputValue, fromUnit, toUnit].forEach(el => {
  el.addEventListener("input", () => {
    if (autoCalc.checked) calculate();
  });
  el.addEventListener("change", () => {
    if (autoCalc.checked) calculate();
  });
});

// 手動計算ボタン
calcBtn.addEventListener("click", calculate);

// ==========================================================
// 言語切替 (JA / EN)
// ==========================================================
document.querySelectorAll(".mw-lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".mw-lang-switch button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    currentLang = btn.dataset.lang;
    updateI18n();
    updateUnitSelects();
    clearResult();
  });
});

function updateI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = i18n[currentLang][key];
  });
}

// ==========================================================
// 初期化
// ==========================================================
updateUnitSelects();
updateI18n();
