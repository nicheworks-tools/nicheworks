/* =========================================================
   UnitMaster MVP
   - A構成（世界標準7カテゴリ）
   - from/to ドロップダウン方式
   - 自動計算 ON/OFF
   - 単位辞書（系統ごと）
   - 温度のみ専用式
========================================================= */

/* ---------------------------------------------------------
   単位辞書（倍率 = 基準単位への変換倍率）
   例：長さは "m" を基準にする
--------------------------------------------------------- */
const UNIT_DATA = {
  length: {
    base: "m",
    units: {
      m:     1,
      cm:    0.01,
      mm:    0.001,
      km:    1000,
      inch:  0.0254,
      ft:    0.3048,
      yard:  0.9144,
      mile:  1609.344
    }
  },

  weight: {
    base: "kg",
    units: {
      kg:   1,
      g:    0.001,
      mg:   0.000001,
      lb:   0.45359237,
      oz:   0.028349523125
    }
  },

  area: {
    base: "m2",
    units: {
      m2:    1,
      cm2:   0.0001,
      mm2:   0.000001,
      km2:   1_000_000,
      ft2:   0.09290304,
      yard2: 0.83612736
    }
  },

  volume: {
    base: "L",
    units: {
      L:    1,
      mL:   0.001,
      gal:  3.78541,
      qt:   0.946353,
      pint: 0.473176,
      cup:  0.24    // 日本家庭用に最適化
    }
  },

  speed: {
    base: "mps",
    units: {
      "m/s":   1,
      "km/h":  0.277777778,
      "mph":   0.44704,
      "ft/s":  0.3048
    }
  },

  pressure: {
    base: "Pa",
    units: {
      Pa:   1,
      kPa:  1000,
      MPa:  1_000_000,
      bar:  100000,
      atm:  101325,
      psi:  6894.757
    }
  }
};

/* ---------------------------------------------------------
   温度変換（専用式）
--------------------------------------------------------- */
function convertTemperature(value, from, to) {
  let c;

  // まずCelsiusへ
  if (from === "C") c = value;
  if (from === "F") c = (value - 32) * 5/9;
  if (from === "K") c = value - 273.15;

  // Celsius → ターゲット
  if (to === "C") return c;
  if (to === "F") return c * 9/5 + 32;
  if (to === "K") return c + 273.15;
}

/* =========================================================
   UI初期設定
========================================================= */
const tabs = document.querySelectorAll(".um-tabs button");
const fromSel = document.getElementById("fromUnit");
const toSel   = document.getElementById("toUnit");
const inputEl = document.getElementById("inputValue");
const resultEl = document.getElementById("result");
const calcBtn = document.getElementById("calcBtn");
const autoChk = document.getElementById("autoCalc");

/* 現在のカテゴリ */
let currentCategory = "length";

/* ---------------------------------------------------------
   カテゴリ切替
--------------------------------------------------------- */
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;

    loadUnits(currentCategory);

    if (autoChk.checked) calculate();
  });
});

/* ---------------------------------------------------------
   単位ドロップダウン読み込み
--------------------------------------------------------- */
function loadUnits(cat) {
  const data = UNIT_DATA[cat];

  // 温度だけ特別処理
  if (cat === "temperature") {
    fromSel.innerHTML = "";
    toSel.innerHTML = "";

    ["C","F","K"].forEach(u => {
      const o1 = document.createElement("option");
      o1.value = u;
      o1.textContent = u;

      const o2 = document.createElement("option");
      o2.value = u;
      o2.textContent = u;

      fromSel.appendChild(o1);
      toSel.appendChild(o2);
    });

    return;
  }

  // 世界標準（A構成）
  fromSel.innerHTML = "";
  toSel.innerHTML = "";

  Object.keys(data.units).forEach(u => {
    const o1 = document.createElement("option");
    o1.value = u;
    o1.textContent = u;

    const o2 = document.createElement("option");
    o2.value = u;
    o2.textContent = u;

    fromSel.appendChild(o1);
    toSel.appendChild(o2);
  });
}

/* 初期ロード */
loadUnits(currentCategory);

/* ---------------------------------------------------------
   計算
--------------------------------------------------------- */
function calculate() {
  const val = parseFloat(inputEl.value);

  if (isNaN(val)) {
    resultEl.textContent = "—";
    return;
  }

  const from = fromSel.value;
  const to   = toSel.value;

  // 温度だけ別ルート
  if (currentCategory === "temperature") {
    const out = convertTemperature(val, from, to);
    resultEl.textContent = `${out.toFixed(4)}`;
    return;
  }

  // 通常変換
  const info = UNIT_DATA[currentCategory];
  const ratio = info.units;

  // step1: from → base
  const inBase = val * ratio[from];

  // step2: base → to
  const out = inBase / ratio[to];

  resultEl.textContent = `${out.toFixed(6)}`;
}

/* ---------------------------------------------------------
   自動計算ON
--------------------------------------------------------- */
inputEl.addEventListener("input", () => {
  if (autoChk.checked) calculate();
});
fromSel.addEventListener("change", () => {
  if (autoChk.checked) calculate();
});
toSel.addEventListener("change", () => {
  if (autoChk.checked) calculate();
});

/* ---------------------------------------------------------
   計算ボタン
--------------------------------------------------------- */
calcBtn.addEventListener("click", calculate);

