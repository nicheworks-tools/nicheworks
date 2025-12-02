// ==========================================================
// Kanji Modernizer Lite - 完全版 app.js
// ・辞書ロード（old_to_new / new_to_old）
// ・旧→新 / 新→旧 変換
// ・複数候補（new_to_old）の配列対応（先頭採用）
// ・エラー処理
// ・進行バー最適化
// ・i18n（日英切替）
// ==========================================================

// ------------------------------
// 1. 辞書ロード
// ------------------------------
let dict = { old_to_new: {}, new_to_old: {} };
let currentLang = "ja";

async function loadDict() {
  try {
    const res = await fetch("./dict.json");
    dict = await res.json();
  } catch (e) {
    console.error("辞書ロードに失敗:", e);
  }
}
loadDict();


// ------------------------------
// 2. i18n テーブル（index.html と一致）
// ------------------------------
const i18n = {
  ja: {
    title: "旧字体 ⇄ 新字体 変換ツール",
    description: "旧字体 → 新字体 / 新字体 → 旧字体 の一括変換に対応。名前・地名・看板などの漢字を瞬時に変換できます。",
    input_label: "入力",
    result_label: "結果",
    convert_btn: "変換する",
    direction_old2new: "旧 → 新",
    direction_new2old: "新 → 旧",
    empty_error: "入力が空です。",
    copied: "コピーしました！"
  },
  en: {
    title: "Kanji Modernizer Lite",
    description: "Convert Old Kanji ⇄ Modern Kanji instantly. Works fully offline.",
    input_label: "Input",
    result_label: "Output",
    convert_btn: "Convert",
    direction_old2new: "Old → Modern",
    direction_new2old: "Modern → Old",
    empty_error: "Input is empty.",
    copied: "Copied!"
  }
};


// ------------------------------
// 3. 言語切替
// ------------------------------
function switchLang(lang) {
  currentLang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  // active クラスの付け替え
  document.querySelectorAll(".nw-lang-switch button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

document.querySelectorAll(".nw-lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => switchLang(btn.dataset.lang));
});


// ------------------------------
// 4. 変換処理（旧→新 / 新→旧）
// ------------------------------
function convertText(mode, input) {
  if (!input) return "";

  let output = "";

  for (const ch of input) {
    if (mode === "old2new") {
      // 旧字 → 新字
      output += dict.old_to_new[ch] ?? ch;

    } else {
      // 新字 → 旧字（複数候補の配列）
      if (dict.new_to_old[ch]) {
        const arr = dict.new_to_old[ch];
        output += Array.isArray(arr) ? arr[0] : arr; // 先頭候補を採用
      } else {
        output += ch;
      }
    }
  }

  return output;
}


// ------------------------------
// 5. 変換ボタン
// ------------------------------
document.getElementById("convertBtn").addEventListener("click", () => {
  const input = document.getElementById("inputText").value;
  const mode = document.querySelector('input[name="direction"]:checked').value;

  if (!input.trim()) {
    alert(i18n[currentLang].empty_error);
    return;
  }

  showProgressBar().then(() => {
    const result = convertText(mode, input);
    document.getElementById("resultText").value = result;
  });
});


// ------------------------------
// 6. 進行バー
// ------------------------------
function showProgressBar() {
  return new Promise(resolve => {
    const bar = document.getElementById("progress");
    bar.style.width = "0%";
    bar.style.opacity = "1";

    let progress = 0;
    const timer = setInterval(() => {
      progress += 20;
      bar.style.width = progress + "%";

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => { bar.style.opacity = "0"; }, 400);
        resolve();
      }
    }, 80);
  });
}


// ------------------------------
// 7. コピー
// ------------------------------
document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.getElementById("resultText").value;
  navigator.clipboard.writeText(text).then(() => {
    alert(i18n[currentLang].copied);
  });
});


// ------------------------------
// 8. 初期言語（日本語）
// ------------------------------
switchLang("ja");
