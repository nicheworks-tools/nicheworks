/* ==========================================================
   Kanji Modernizer - app.js（誤ハイライト完全修正版）
   - 旧字⇄新字 変換ロジック
   - JP/EN 表示切り替え（data-i18n）
   - 完全ローカル（dict.json を読み込み）
   - ★誤ハイライト（館 → 館 など）バグ修正済み★
========================================================== */

(() => {
  let dictCache = null;
  let currentLang = "ja";
  let lastResultText = "";
  let lastReplacementList = [];
  let lastError = null;

  const messages = {
    ja: {
      empty: "変換するテキストを入力してください。",
      copiedText: "変換後テキストをコピーしました。",
      copiedTable: "置換一覧をコピーしました。",
      noReplacements: "置換がないためコピーできません。",
      loadError: "辞書データの読み込みに失敗しました。時間を置いて再度お試しください。"
    },
    en: {
      empty: "Please enter some text to convert.",
      copiedText: "Converted text copied to clipboard.",
      copiedTable: "Replacement list copied to clipboard.",
      noReplacements: "No replacements to copy yet.",
      loadError: "Failed to load dictionary data. Please try again later."
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

  /* ==========================================================
     言語切り替え
  ========================================================== */
  function switchLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";

    if (document.documentElement) {
      document.documentElement.lang = currentLang;
    }

    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });

    document.querySelectorAll(".lang-switch button[data-lang]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });

    if (lastError) {
      if (lastError.mode === "notice") {
        showNotice(lastError.key);
      } else if (lastError.showRetry) {
        showErrorWithRetry(lastError.key);
      } else {
        showError(lastError.key);
      }
    }
  }

  /* ==========================================================
     辞書読み込み
  ========================================================== */
  async function loadDict() {
    if (dictCache) return dictCache;

    const res = await fetch("./dict.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load dict.json");

    const data = await res.json();
    dictCache = data;
    return data;
  }

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

  /* ==========================================================
     UI 補助機能
  ========================================================== */
  function showError(messageKey) {
    const box = document.getElementById("errorBox");
    const message = document.getElementById("errorMessage");
    const note = document.getElementById("errorNote");
    const retry = document.getElementById("retryBtn");
    if (!box) return;
    const msg = getMessage(messageKey);
    if (!msg) {
      clearError();
      return;
    }

    lastError = {
      key: messageKey,
      showRetry: false,
      showNote: false,
      mode: "error"
    };

    if (message) message.textContent = msg;
    if (note) note.hidden = true;
    if (retry) retry.hidden = true;
    box.classList.remove("notice");
    box.hidden = false;
  }

  function showErrorWithRetry(messageKey) {
    const box = document.getElementById("errorBox");
    const message = document.getElementById("errorMessage");
    const note = document.getElementById("errorNote");
    const retry = document.getElementById("retryBtn");
    if (!box) return;
    const msg = getMessage(messageKey);
    if (!msg) {
      clearError();
      return;
    }

    lastError = {
      key: messageKey,
      showRetry: true,
      showNote: true,
      mode: "error"
    };

    if (message) message.textContent = msg;
    if (note) note.hidden = false;
    if (retry) retry.hidden = false;
    box.classList.remove("notice");
    box.hidden = false;
  }

  function showNotice(messageKey) {
    const box = document.getElementById("errorBox");
    const message = document.getElementById("errorMessage");
    const note = document.getElementById("errorNote");
    const retry = document.getElementById("retryBtn");
    if (!box) return;
    const msg = getMessage(messageKey);
    if (!msg) {
      clearError();
      return;
    }

    lastError = {
      key: messageKey,
      showRetry: false,
      showNote: false,
      mode: "notice"
    };

    if (message) message.textContent = msg;
    if (note) note.hidden = true;
    if (retry) retry.hidden = true;
    box.classList.add("notice");
    box.hidden = false;
  }

  function clearError() {
    const box = document.getElementById("errorBox");
    const message = document.getElementById("errorMessage");
    const note = document.getElementById("errorNote");
    const retry = document.getElementById("retryBtn");
    if (!box) return;
    if (message) message.textContent = "";
    if (note) note.hidden = true;
    if (retry) retry.hidden = true;
    box.hidden = true;
    box.classList.remove("notice");
    lastError = null;
  }

  function setProgress(active) {
    const bar = document.getElementById("progress");
    if (!bar) return;
    bar.style.display = active ? "block" : "none";
  }

  /* ==========================================================
     変換ロジック（誤ハイライト完全修正版）
  ========================================================== */
  function buildExclusionRanges(text) {
    const ranges = [];
    const codeRegex = /```[\s\S]*?```/g;
    const urlRegex = /https?:\/\/[^\s]+/g;

    let match;
    while ((match = codeRegex.exec(text)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }

    while ((match = urlRegex.exec(text)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }

    ranges.sort((a, b) => a.start - b.start);
    const merged = [];
    ranges.forEach(range => {
      const last = merged[merged.length - 1];
      if (!last || range.start > last.end) {
        merged.push({ ...range });
      } else {
        last.end = Math.max(last.end, range.end);
      }
    });
    return merged;
  }

  function isAscii(char) {
    return char.charCodeAt(0) <= 0x7f;
  }

  function buildSegments(text, exclude) {
    if (!exclude) {
      return [{ text, skip: false }];
    }

    const ranges = buildExclusionRanges(text);
    const segments = [];
    let index = 0;
    let rangeIndex = 0;

    while (index < text.length) {
      const range = ranges[rangeIndex];
      if (range && index >= range.start && index < range.end) {
        segments.push({
          text: text.slice(index, range.end),
          skip: true
        });
        index = range.end;
        rangeIndex += 1;
        continue;
      }

      const nextRangeStart = range ? range.start : text.length;
      if (isAscii(text[index])) {
        let end = index + 1;
        while (end < nextRangeStart && isAscii(text[end])) {
          end += 1;
        }
        segments.push({
          text: text.slice(index, end),
          skip: true
        });
        index = end;
        continue;
      }

      let end = index + 1;
      while (end < nextRangeStart && !isAscii(text[end])) {
        end += 1;
      }
      segments.push({
        text: text.slice(index, end),
        skip: false
      });
      index = end;
    }

    return segments;
  }

  function convertText(rawText, direction, dict, options = {}) {
    if (!rawText) {
      return {
        plain: "",
        inputHtml: "",
        outputHtml: "",
        replacements: []
      };
    }

    const segments = buildSegments(rawText, options.exclude);
    const inputHtml = [];
    const outputHtml = [];
    const outputPlain = [];
    const replacementMap = new Map();

    const map =
      direction === "new-to-old"
        ? dict.new_to_old || {}
        : dict.old_to_new || {};

    segments.forEach(segment => {
      const chars = Array.from(segment.text);
      if (segment.skip) {
        chars.forEach(ch => {
          inputHtml.push(escapeHtml(ch));
          outputHtml.push(escapeHtml(ch));
          outputPlain.push(ch);
        });
        return;
      }

      chars.forEach(ch => {
        const mapped = map[ch];
        const outputChar = (Array.isArray(mapped) ? mapped[0] : mapped) ?? ch;
        const isHit = mapped && outputChar !== ch;

        if (isHit) {
          inputHtml.push(`<span class="hl-hit">${escapeHtml(ch)}</span>`);
          outputHtml.push(`<span class="hl-hit">${escapeHtml(outputChar)}</span>`);
          const key = `${ch}→${outputChar}`;
          const current = replacementMap.get(key) || {
            from: ch,
            to: outputChar,
            count: 0
          };
          current.count += 1;
          replacementMap.set(key, current);
        } else {
          inputHtml.push(escapeHtml(ch));
          outputHtml.push(escapeHtml(outputChar));
        }

        outputPlain.push(outputChar);
      });
    });

    return {
      plain: outputPlain.join(""),
      inputHtml: inputHtml.join(""),
      outputHtml: outputHtml.join(""),
      replacements: Array.from(replacementMap.values()).sort(
        (a, b) => b.count - a.count
      )
    };
  }

  /* ==========================================================
     DOM ready
  ========================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("inputText");
    const output = document.getElementById("outputText");
    const convertBtn = document.getElementById("convertBtn");
    const copyTextBtn = document.getElementById("copyTextBtn");
    const copyTableBtn = document.getElementById("copyTableBtn");
    const resetBtn = document.getElementById("resetBtn");
    const resultBlock = document.getElementById("resultBlock");
    const inputHighlight = document.getElementById("inputHighlight");
    const excludeToggle = document.getElementById("excludeToggle");
    const replacementBlock = document.getElementById("replacementBlock");
    const replacementTableBody = document.getElementById("replacementTableBody");
    const replacementEmpty = document.getElementById("replacementEmpty");
    const retryBtn = document.getElementById("retryBtn");

    const setConvertEnabled = enabled => {
      if (convertBtn) {
        convertBtn.disabled = !enabled;
        convertBtn.setAttribute("aria-disabled", String(!enabled));
      }
    };

    const renderReplacementTable = replacements => {
      if (!replacementTableBody || !replacementEmpty || !replacementBlock) return;

      replacementTableBody.innerHTML = "";
      if (!replacements || replacements.length === 0) {
        replacementEmpty.hidden = false;
        replacementBlock.hidden = false;
        return;
      }

      replacementEmpty.hidden = true;
      replacements.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${escapeHtml(item.from)}</td>
          <td>${escapeHtml(item.to)}</td>
          <td>${item.count}</td>
        `;
        replacementTableBody.appendChild(row);
      });
      replacementBlock.hidden = false;
    };

    const formatReplacementList = replacements => {
      const header =
        currentLang === "en" ? "From\tTo\tCount" : "変換元\t変換先\t回数";
      const lines = replacements.map(
        item => `${item.from}\t${item.to}\t${item.count}`
      );
      return [header, ...lines].join("\n");
    };

    document
      .querySelectorAll(".lang-switch button[data-lang]")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          switchLang(btn.dataset.lang || "ja");
        });
      });

    switchLang(currentLang);

    const initDict = async () => {
      setConvertEnabled(false);
      try {
        const dict = await loadDict();
        updateCounts(dict);
        clearError();
        setConvertEnabled(true);
      } catch (err) {
        console.error(err);
        showErrorWithRetry("loadError");
        setConvertEnabled(false);
      }
    };

    initDict();

    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        dictCache = null;
        initDict();
      });
    }

    /* ---------------- convert ---------------- */
    if (convertBtn) {
      convertBtn.addEventListener("click", async () => {
        clearError();
        const text = input.value.trim();

        if (!text) {
          showError("empty");
          return;
        }

        setProgress(true);
        try {
          if (!dictCache) {
            showErrorWithRetry("loadError");
            setProgress(false);
            return;
          }

          const dict = await loadDict();
          const selected = document.querySelector(
            'input[name="direction"]:checked'
          );
          const direction = selected ? selected.value : "old-to-new";
          const exclude = excludeToggle ? excludeToggle.checked : false;

          const { plain, inputHtml, outputHtml, replacements } = convertText(
            text,
            direction,
            dict,
            { exclude }
          );

          lastResultText = plain;
          lastReplacementList = replacements;

          if (inputHighlight) inputHighlight.innerHTML = inputHtml;
          if (output) output.innerHTML = outputHtml;
          renderReplacementTable(replacements);

          if (resultBlock) resultBlock.hidden = false;
        } catch (e) {
          console.error(e);
          showErrorWithRetry("loadError");
        } finally {
          setProgress(false);
        }
      });
    }

    /* ---------------- copy ---------------- */
    if (copyTextBtn) {
      copyTextBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(lastResultText || "");
          showNotice("copiedText");
        } catch (e) {
          console.error(e);
        }
      });
    }

    if (copyTableBtn) {
      copyTableBtn.addEventListener("click", async () => {
        try {
          if (!lastReplacementList || lastReplacementList.length === 0) {
            showNotice("noReplacements");
            return;
          }
          await navigator.clipboard.writeText(
            formatReplacementList(lastReplacementList)
          );
          showNotice("copiedTable");
        } catch (e) {
          console.error(e);
        }
      });
    }

    /* ---------------- reset ---------------- */
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        input.value = "";
        if (output) output.innerHTML = "";
        if (inputHighlight) inputHighlight.innerHTML = "";
        if (resultBlock) resultBlock.hidden = true;
        if (replacementBlock) replacementBlock.hidden = true;
        if (replacementEmpty) replacementEmpty.hidden = true;
        if (replacementTableBody) replacementTableBody.innerHTML = "";
        lastResultText = "";
        lastReplacementList = [];
        clearError();
      });
    }
  });
})();
