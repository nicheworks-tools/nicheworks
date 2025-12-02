/* ==========================================================
   Kanji Modernizer - app.js
   - 旧字⇄新字 変換ロジック
   - JP/EN 表示切り替え（data-i18n）
   - 完全ローカル（dict.json を読み込み）
========================================================== */

(() => {
  let dictCache = null;
  let currentLang = "ja";

  const messages = {
    ja: {
      empty: "変換するテキストを入力してください。",
      copied: "結果をコピーしました。",
      loadError: "辞書データの読み込みに失敗しました。時間を置いて再度お試しください。"
    },
    en: {
      empty: "Please enter some text to convert.",
      copied: "Result copied to clipboard.",
      loadError: "Failed to load dictionary data. Please try again later."
    }
  };

  function getMessage(key) {
    const table = messages[currentLang] || messages.ja;
    return table[key] || "";
  }

  // -----------------------------
  // 言語切り替え（表示のみ）
  // -----------------------------
  function switchLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";

    // <html> の lang を更新
    if (document.documentElement) {
      document.documentElement.lang = currentLang;
    }

    // data-i18n="ja"/"en" の表示・非表示
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const elLang = el.dataset.i18n;
      if (!elLang) return;
      el.style.display = elLang === currentLang ? "" : "none";
    });

    // 言語ボタンの active 切り替え
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  // -----------------------------
  // 辞書読み込み（dict.json）
  // -----------------------------
  async function loadDict() {
    if (dictCache) return dictCache;

    const res = await fetch("./dict.json", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to load dict.json");
    }
    const data = await res.json();
    dictCache = data;
    return data;
  }

  // -----------------------------
  // UI 補助
  // -----------------------------
  function showError(messageKey) {
    const box = document.getElementById("errorBox");
    if (!box) return;
    const msg = getMessage(messageKey);
    box.textContent = msg || "";
    box.hidden = !msg;
  }

  function clearError() {
    const box = document.getElementById("errorBox");
    if (!box) return;
    box.textContent = "";
    box.hidden = true;
  }

  function setProgress(active) {
    const bar = document.getElementById("progress");
    if (!bar) return;
    bar.style.display = active ? "block" : "none";
  }

  // -----------------------------
  // 変換ロジック
  // -----------------------------
  function convertText(rawText, direction, dict) {
    if (!rawText) return "";

    const src = Array.from(rawText);

    if (direction === "new-to-old") {
      const map = dict.new_to_old || {};
      return src
        .map(ch => {
          const val = map[ch];
          if (Array.isArray(val) && val.length > 0) {
            // 候補が複数ある場合はいったん先頭を採用
            return val[0];
          }
          return ch;
        })
        .join("");
    } else {
      // default: old-to-new
      const map = dict.old_to_new || {};
      return src.map(ch => map[ch] || ch).join("");
    }
  }

  // -----------------------------
  // DOM 準備完了後にイベントを張る
  // -----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("inputText");
    const output = document.getElementById("outputText");
    const convertBtn = document.getElementById("convertBtn");
    const copyBtn = document.getElementById("copyBtn");
    const resetBtn = document.getElementById("resetBtn");
    const resultBlock = document.getElementById("resultBlock");

    // 言語ボタン
    document
      .querySelectorAll(".nw-lang-switch button[data-lang]")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          const lang = btn.dataset.lang || "ja";
          switchLang(lang);
        });
      });

    // 初期状態：日本語だけ表示
    switchLang(currentLang);

    // 変換ボタン
    if (convertBtn && input && output) {
      convertBtn.addEventListener("click", async () => {
        clearError();

        const text = input.value.trim();
        if (!text) {
          showError("empty");
          return;
        }

        setProgress(true);
        try {
          const dict = await loadDict();
          const selected = document.querySelector(
            'input[name="direction"]:checked'
          );
          const direction = selected ? selected.value : "old-to-new";

          const result = convertText(text, direction, dict);
          output.value = result;
          if (resultBlock) {
            resultBlock.hidden = false;
          }
        } catch (err) {
          console.error(err);
          showError("loadError");
        } finally {
          setProgress(false);
        }
      });
    }

    // コピー
    if (copyBtn && output) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(output.value || "");
          clearError();
          const box = document.getElementById("errorBox");
          if (box) {
            box.textContent = getMessage("copied");
            box.hidden = false;
          }
        } catch (err) {
          console.error(err);
        }
      });
    }

    // リセット
    if (resetBtn && input && output && resultBlock) {
      resetBtn.addEventListener("click", () => {
        input.value = "";
        output.value = "";
        resultBlock.hidden = true;
        clearError();
      });
    }
  });
})();
