/* ==========================================================
   Kanji Modernizer - app.js
   - 旧字⇄新字 変換ロジック
   - JP/EN 表示切り替え（data-i18n）
   - 辞書ベース変換（dict.json）
   - 同一文字候補を優先しない新→旧変換
========================================================== */

(() => {
  let dictCache = null;
  let currentLang = "ja";
  let lastResultText = "";
  let lastReplacementList = [];
  let lastMessage = null;

  const messages = {
    ja: {
      empty: "変換するテキストを入力してください。",
      copiedText: "変換後テキストをコピーしました。",
      copiedTable: "置換一覧をコピーしました。",
      copyFailed: "コピーに失敗しました。結果を選択して手動でコピーしてください。",
      noOutput: "まだコピーできる変換結果がありません。",
      noReplacements: "置換がないためコピーできません。",
      loadError: "辞書データの読み込みに失敗しました。時間を置いて再度お試しください。"
    },
    en: {
      empty: "Please enter some text to convert.",
      copiedText: "Converted text copied to clipboard.",
      copiedTable: "Replacement list copied to clipboard.",
      copyFailed: "Copy failed. Please select the result and copy it manually.",
      noOutput: "There is no converted result to copy yet.",
      noReplacements: "No replacements to copy yet.",
      loadError: "Failed to load dictionary data. Please try again later."
    }
  };

  function getMessage(key) {
    const table = messages[currentLang] || messages.ja;
    return table[key] || "";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeChar(val) {
    return typeof val === "string" ? val.normalize("NFC") : "";
  }

  function rebuildDict(raw) {
    const normalizedOldToNew = {};
    const normalizedNewToOld = {};
    const rawOldToNew = raw && typeof raw === "object" ? raw.old_to_new || {} : {};
    const rawNewToOld = raw && typeof raw === "object" ? raw.new_to_old || {} : {};

    Object.keys(rawOldToNew).forEach(key => {
      const nKey = normalizeChar(key);
      const nVal = normalizeChar(rawOldToNew[key]);
      if (!nKey || !nVal || Object.prototype.hasOwnProperty.call(normalizedOldToNew, nKey)) return;
      normalizedOldToNew[nKey] = nVal;
    });

    Object.keys(rawNewToOld).forEach(key => {
      const nKey = normalizeChar(key);
      if (!nKey) return;
      const values = Array.isArray(rawNewToOld[key]) ? rawNewToOld[key] : [rawNewToOld[key]];
      const normalizedValues = [];

      values.forEach(value => {
        const nVal = normalizeChar(value);
        if (!nVal || normalizedValues.includes(nVal)) return;
        normalizedValues.push(nVal);
      });

      if (normalizedValues.length > 0) {
        normalizedNewToOld[nKey] = normalizedValues;
      }
    });

    return { old_to_new: normalizedOldToNew, new_to_old: normalizedNewToOld };
  }

  async function copyToClipboard(text) {
    if (!text) return false;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand("copy");
    helper.remove();
    return ok;
  }

  function getMessageNodes() {
    return {
      box: document.getElementById("messageBox") || document.getElementById("errorBox"),
      text: document.getElementById("messageText") || document.getElementById("errorMessage"),
      note: document.getElementById("messageNote") || document.getElementById("errorNote"),
      retry: document.getElementById("retryBtn")
    };
  }

  function showMessage(messageKey, options = {}) {
    const { box, text, note, retry } = getMessageNodes();
    if (!box) return;
    const msg = getMessage(messageKey);
    if (!msg) {
      clearMessage();
      return;
    }

    const type = options.type || "error";
    lastMessage = {
      key: messageKey,
      type,
      showRetry: Boolean(options.showRetry),
      showNote: Boolean(options.showNote)
    };

    if (text) text.textContent = msg;
    if (note) note.hidden = !lastMessage.showNote;
    if (retry) retry.hidden = !lastMessage.showRetry;
    box.classList.toggle("notice", type === "notice");
    box.classList.toggle("error", type !== "notice");
    box.hidden = false;
  }

  function clearMessage() {
    const { box, text, note, retry } = getMessageNodes();
    if (!box) return;
    if (text) text.textContent = "";
    if (note) note.hidden = true;
    if (retry) retry.hidden = true;
    box.hidden = true;
    box.classList.remove("notice", "error");
    lastMessage = null;
  }

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

    const input = document.getElementById("inputText");
    if (input) {
      input.placeholder = currentLang === "en" ? "Example: 舊字體 and 東京府淺草區" : "例）舊字體の東京府淺草區";
    }

    if (lastMessage) {
      showMessage(lastMessage.key, lastMessage);
    }
  }

  async function loadDict() {
    if (dictCache) return dictCache;
    const res = await fetch("./dict.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load dict.json");
    const data = await res.json();
    dictCache = rebuildDict(data);
    return dictCache;
  }

  function updateCounts(dict) {
    if (!dict) return;
    const oldCount = Object.keys(dict.old_to_new || {}).length;
    const newCount = Object.keys(dict.new_to_old || {}).length;
    const uniqueCount = new Set([
      ...Object.keys(dict.old_to_new || {}),
      ...Object.keys(dict.new_to_old || {})
    ]).size;

    document.querySelectorAll('[data-count="old"]').forEach(el => { el.textContent = oldCount; });
    document.querySelectorAll('[data-count="new"]').forEach(el => { el.textContent = newCount; });
    document.querySelectorAll('[data-count="unique"]').forEach(el => { el.textContent = uniqueCount; });
  }

  function setProgress(active) {
    const bar = document.getElementById("progress");
    if (!bar) return;
    bar.style.display = active ? "block" : "none";
  }
  function updateReferenceLink(inputValue) {
    const value = String(inputValue || "").trim();
    const href = value ? `/tools/old-kanji-reference/?q=${encodeURIComponent(value)}` : "/tools/old-kanji-reference/";
    const linkJa = document.getElementById("backToOldKanjiReference");
    const linkEn = document.getElementById("backToOldKanjiReferenceEn");
    if (linkJa) linkJa.href = href;
    if (linkEn) linkEn.href = href;
  }

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
    return ranges.reduce((merged, range) => {
      const last = merged[merged.length - 1];
      if (!last || range.start > last.end) {
        merged.push({ ...range });
      } else {
        last.end = Math.max(last.end, range.end);
      }
      return merged;
    }, []);
  }

  function isAscii(char) {
    return char.charCodeAt(0) <= 0x7f;
  }

  function buildSegments(text, exclude) {
    if (!exclude) return [{ text, skip: false }];
    const ranges = buildExclusionRanges(text);
    const segments = [];
    let index = 0;
    let rangeIndex = 0;

    while (index < text.length) {
      const range = ranges[rangeIndex];
      if (range && index >= range.start && index < range.end) {
        segments.push({ text: text.slice(index, range.end), skip: true });
        index = range.end;
        rangeIndex += 1;
        continue;
      }

      const nextRangeStart = range ? range.start : text.length;
      const skip = isAscii(text[index]);
      let end = index + 1;
      while (end < nextRangeStart && isAscii(text[end]) === skip) {
        end += 1;
      }
      segments.push({ text: text.slice(index, end), skip });
      index = end;
    }

    return segments;
  }

  function pickMappedChar(mapped, sourceChar) {
    if (Array.isArray(mapped)) {
      return mapped.find(candidate => candidate && candidate !== sourceChar) || mapped[0] || sourceChar;
    }
    return mapped || sourceChar;
  }

  function convertText(rawText, direction, dict, options = {}) {
    if (!rawText) {
      return { plain: "", inputHtml: "", outputHtml: "", replacements: [] };
    }

    const segments = buildSegments(rawText, options.exclude);
    const inputHtml = [];
    const outputHtml = [];
    const outputPlain = [];
    const replacementMap = new Map();
    const map = direction === "new-to-old" ? dict.new_to_old || {} : dict.old_to_new || {};

    segments.forEach(segment => {
      Array.from(segment.text).forEach(ch => {
        if (segment.skip) {
          inputHtml.push(escapeHtml(ch));
          outputHtml.push(escapeHtml(ch));
          outputPlain.push(ch);
          return;
        }

        const mapped = map[ch];
        const outputChar = pickMappedChar(mapped, ch);
        const isHit = Boolean(mapped && outputChar !== ch);

        if (isHit) {
          inputHtml.push(`<span class="hl-hit">${escapeHtml(ch)}</span>`);
          outputHtml.push(`<span class="hl-hit">${escapeHtml(outputChar)}</span>`);
          const key = `${ch}→${outputChar}`;
          const current = replacementMap.get(key) || { from: ch, to: outputChar, count: 0 };
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
      replacements: Array.from(replacementMap.values()).sort((a, b) => b.count - a.count)
    };
  }

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
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    if (input && qParam) input.value = qParam;
    updateReferenceLink(input ? input.value : "");

    const setConvertEnabled = enabled => {
      if (!convertBtn) return;
      convertBtn.disabled = !enabled;
      convertBtn.setAttribute("aria-disabled", String(!enabled));
    };

    const renderReplacementTable = replacements => {
      if (!replacementTableBody || !replacementEmpty || !replacementBlock) return;
      replacementTableBody.replaceChildren();

      if (!replacements || replacements.length === 0) {
        replacementEmpty.hidden = false;
        replacementBlock.hidden = false;
        return;
      }

      replacementEmpty.hidden = true;
      replacements.forEach(item => {
        const row = document.createElement("tr");
        [item.from, item.to, String(item.count)].forEach(value => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.appendChild(cell);
        });
        replacementTableBody.appendChild(row);
      });
      replacementBlock.hidden = false;
    };

    const formatReplacementList = replacements => {
      const header = currentLang === "en" ? "From\tTo\tCount" : "変換元\t変換先\t回数";
      const lines = replacements.map(item => `${item.from}\t${item.to}\t${item.count}`);
      return [header, ...lines].join("\n");
    };

    document.querySelectorAll(".lang-switch button[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => switchLang(btn.dataset.lang || "ja"));
    });

    switchLang((navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en");
    if (input) input.addEventListener("input", () => updateReferenceLink(input.value));

    const initDict = async () => {
      setConvertEnabled(false);
      try {
        const dict = await loadDict();
        updateCounts(dict);
        clearMessage();
        setConvertEnabled(true);
      } catch (err) {
        console.error(err);
        showMessage("loadError", { showRetry: true, showNote: true, type: "error" });
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

    if (convertBtn) {
      convertBtn.addEventListener("click", async () => {
        clearMessage();
        const text = (input && input.value ? input.value : "").trim();
        if (!text) {
          showMessage("empty", { type: "error" });
          return;
        }

        setProgress(true);
        try {
          const dict = await loadDict();
          const selected = document.querySelector('input[name="direction"]:checked');
          const direction = selected ? selected.value : "old-to-new";
          const exclude = excludeToggle ? excludeToggle.checked : false;
          const result = convertText(text, direction, dict, { exclude });

          lastResultText = result.plain;
          lastReplacementList = result.replacements;
          if (inputHighlight) inputHighlight.innerHTML = result.inputHtml;
          if (output) output.innerHTML = result.outputHtml;
          renderReplacementTable(result.replacements);
          if (resultBlock) resultBlock.hidden = false;
        } catch (e) {
          console.error(e);
          showMessage("loadError", { showRetry: true, showNote: true, type: "error" });
        } finally {
          setProgress(false);
        }
      });
    }
    if (qParam && convertBtn) convertBtn.click();

    if (copyTextBtn) {
      copyTextBtn.addEventListener("click", async () => {
        if (!lastResultText) {
          showMessage("noOutput", { type: "notice" });
          return;
        }
        try {
          const ok = await copyToClipboard(lastResultText);
          showMessage(ok ? "copiedText" : "copyFailed", { type: ok ? "notice" : "error" });
        } catch (e) {
          console.error(e);
          showMessage("copyFailed", { type: "error" });
        }
      });
    }

    if (copyTableBtn) {
      copyTableBtn.addEventListener("click", async () => {
        if (!lastReplacementList || lastReplacementList.length === 0) {
          showMessage("noReplacements", { type: "notice" });
          return;
        }
        try {
          const ok = await copyToClipboard(formatReplacementList(lastReplacementList));
          showMessage(ok ? "copiedTable" : "copyFailed", { type: ok ? "notice" : "error" });
        } catch (e) {
          console.error(e);
          showMessage("copyFailed", { type: "error" });
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (input) input.value = "";
        if (output) output.textContent = "";
        if (inputHighlight) inputHighlight.textContent = "";
        if (resultBlock) resultBlock.hidden = true;
        if (replacementBlock) replacementBlock.hidden = true;
        if (replacementEmpty) replacementEmpty.hidden = true;
        if (replacementTableBody) replacementTableBody.replaceChildren();
        lastResultText = "";
        lastReplacementList = [];
        clearMessage();
      });
    }
  });
})();
