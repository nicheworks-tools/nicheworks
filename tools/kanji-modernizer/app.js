/* ==========================================================
   Kanji Modernizer - app.js
   - 旧字⇄新字 変換ロジック
   - JP/EN 表示切り替え（data-i18n）
   - 完全ローカル（dict.json を読み込み）
   - ★変換ヒット箇所を赤色表示（km-hit）
========================================================== */

(() => {
  let dictCache = null;
  let currentLang = "ja";
  let lastResultText = "";

  const messages = {
    ja: {
      empty: "変換するテキストを入力してください。",
      copied: "結果をコピーしました。",
      loadError:
        "辞書データの読み込みに失敗しました。時間を置いて再度お試しください。"
    },
    en: {
      empty: "Please enter some text to convert.",
      copied: "Result copied to clipboard.",
      loadError:
        "Failed to load dictionary data. Please try again later."
    }
  };

  function getMessage(key) {
    const table = messages[currentLang] || messages.ja;
    return table[key] || "";
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // -----------------------------
  // 言語切り替え（表示のみ）
  // -----------------------------
  function switchLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";

    // <html lang="...">
    document.documentElement.lang = currentLang;

    // data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });

    // lang ボタン active
    document
      .querySelectorAll(".nw-lang-switch button[data-lang]")
      .forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLang);
      });
  }

  // -----------------------------
  // 辞書読み込み
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
  // 収録文字数の更新
  // -----------------------------
  function updateCounts(dict) {
    if (!dict) return;

    const oldCount = Object.keys(dict.old_to_new || {}).length;
    const newCount = Object.keys(dict.new_to_old || {}).length;

    const uniqueCount = new Set([
      ...Object.keys(dict.old_to_new || {}),
      ...Object.keys(dict.new_to_old || {})
    ]).size;

    document.querySelectorAll('[data-count="old"]').forEach(el => {
      el.textContent = oldCount;
    });
    document.querySelectorAll('[data-count="new"]').forEach(el => {
      el.textContent = newCount;
    });
    document.querySelectorAll('[data-count="unique"]').forEach(el => {
      el.textContent = uniqueCount;
    });
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
  // 変換ロジック（★コンフリクト解決された最新版）
  // -----------------------------
  function convertText(rawText, direction, dict) {
    if (!rawText) {
      return { plain: "", inputHtml: "", outputHtml: "" };
    }

    const src = Array.from(rawText);
    const inputHtml = [];
    const outputHtml = [];
    const outputPlain = [];

    // 方向別マップ
    const map =
      direction === "new-to-old"
        ? dict.new_to_old || {}
        : dict.old_to_new || {};

    src.forEach(ch => {
      const mapped = map[ch];
      let outputChar;

      if (direction === "new-to-old") {
        if (Array.isArray(mapped)) {
          outputChar = mapped.length > 0 ? mapped[0] : ch;
        } else {
          outputChar = mapped ?? ch;
        }
      } else {
        outputChar = mapped ?? ch;
      }

      const isHit = ch !== outputChar;

      if (isHit) {
        inputHtml.push(`<span class="km-hit">${escapeHtml(ch)}</span>`);
        outputHtml.push(`<span class="km-hit">${escapeHtml(outputChar)}</span>`);
      } else {
        inputHtml.push(escapeHtml(ch));
        outputHtml.push(escapeHtml(outputChar));
      }

      outputPlain.push(outputChar);
    });

    return {
      plain: outputPlain.join(""),
      inputHtml: inputHtml.join(""),
      outputHtml: outputHtml.join("")
    };
  }

  // -----------------------------
  // DOM 準備
  // -----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("inputText");
    const output = document.getElementById("outputText");
    const convertBtn = document.getElementById("convertBtn");
    const copyBtn = document.getElementById("copyBtn");
    const resetBtn = document.getElementById("resetBtn");
    const resultBlock = document.getElementById("resultBlock");
    const inputHighlight = document.getElementById("inputHighlight");

    // 言語切り替え
    document
      .querySelectorAll(".nw-lang-switch button[data-lang]")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          switchLang(btn.dataset.lang || "ja");
        });
      });

    switchLang(currentLang);

    // 辞書読み
    loadDict()
      .then(dict => {
        updateCounts(dict);
      })
      .catch(err => {
        console.error(err);
      });

    // 変換
    convertBtn?.addEventListener("click", async () => {
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

        const { plain, inputHtml, outputHtml } = convertText(
          text,
          direction,
          dict
        );

        lastResultText = plain;

        if (inputHighlight) inputHighlight.innerHTML = inputHtml;
        if (output) output.innerHTML = outputHtml;

        resultBlock.hidden = false;
      } catch (err) {
        console.error(err);
        showError("loadError");
      } finally {
        setProgress(false);
      }
    });

    // コピー
    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(lastResultText || "");
        const box = document.getElementById("errorBox");
        if (box) {
          box.textContent = getMessage("copied");
          box.hidden = false;
        }
      } catch (err) {
        console.error(err);
      }
    });

    // リセット
    resetBtn?.addEventListener("click", () => {
      input.value = "";
      output.innerHTML = "";
      inputHighlight.innerHTML = "";
      lastResultText = "";
      resultBlock.hidden = true;
      clearError();
    });
  });
})();
