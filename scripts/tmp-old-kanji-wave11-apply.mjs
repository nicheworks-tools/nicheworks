import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const modernizerApp = path.join(root, 'tools', 'kanji-modernizer', 'app.js');
const referenceApp = path.join(root, 'tools', 'old-kanji-reference', 'app-meaning-v4.js');
const referenceHtml = path.join(root, 'tools', 'old-kanji-reference', 'index.html');

function replaceOnce(file, before, after, label) {
  const current = fs.readFileSync(file, 'utf8');
  if (!current.includes(before)) throw new Error(`Missing replacement anchor: ${label}`);
  const next = current.replace(before, after);
  if (next === current) throw new Error(`Replacement made no change: ${label}`);
  fs.writeFileSync(file, next);
}

replaceOnce(
  modernizerApp,
  `  function setProgress(active) {\n    const bar = document.getElementById("progress");\n    if (!bar) return;\n    bar.style.display = active ? "block" : "none";\n  }\n`,
  `  function setProgress(active) {\n    const bar = document.getElementById("progress");\n    if (!bar) return;\n    bar.style.display = active ? "block" : "none";\n  }\n\n  function prepareInputText(value) {\n    const text = typeof value === "string" ? value : "";\n    return { text, hasContent: text.trim().length > 0 };\n  }\n`,
  'Modernizer exact input preservation helper',
);

const oldConvertBlock = `    const initDict = async () => {\n      setConvertEnabled(false);\n      try {\n        const dict = await loadDict();\n        updateCounts(dict);\n        clearMessage();\n        setConvertEnabled(true);\n      } catch (err) {\n        console.error(err);\n        showMessage("loadError", { showRetry: true, showNote: true, type: "error" });\n        setConvertEnabled(false);\n      }\n    };\n\n    initDict();\n\n    if (retryBtn) {\n      retryBtn.addEventListener("click", () => {\n        dictCache = null;\n        initDict();\n      });\n    }\n\n    if (convertBtn) {\n      convertBtn.addEventListener("click", async () => {\n        clearMessage();\n        const text = (input && input.value ? input.value : "").trim();\n        if (!text) {\n          showMessage("empty", { type: "error" });\n          return;\n        }\n\n        setProgress(true);\n        try {\n          const dict = await loadDict();\n          const selected = document.querySelector('input[name="direction"]:checked');\n          const direction = selected ? selected.value : "old-to-new";\n          const exclude = excludeToggle ? excludeToggle.checked : false;\n          const policyRadio = document.querySelector('input[name="conversionPolicy"]:checked');\n          const policy = policyRadio ? policyRadio.value : "conservative";\n          const result = convertText(text, direction, dict, { exclude, policy });\n\n          lastResultText = result.plain;\n          lastReplacementList = result.replacements;\n          lastAmbiguityList = result.ambiguities;\n          if (inputHighlight) inputHighlight.innerHTML = result.inputHtml;\n          if (output) output.innerHTML = result.outputHtml;\n          renderReplacementTable(result.replacements);\n          renderAmbiguityReview(result.ambiguities);\n          if (resultBlock) resultBlock.hidden = false;\n        } catch (e) {\n          console.error(e);\n          showMessage("loadError", { showRetry: true, showNote: true, type: "error" });\n        } finally {\n          setProgress(false);\n        }\n      });\n    }\n    if (qParam && convertBtn) convertBtn.click();\n`;

const newConvertBlock = `    let pendingAutoConvert = Boolean(qParam);\n\n    const runConversion = async () => {\n      clearMessage();\n      const prepared = prepareInputText(input ? input.value : "");\n      if (!prepared.hasContent) {\n        showMessage("empty", { type: "error" });\n        return;\n      }\n\n      setProgress(true);\n      try {\n        const dict = await loadDict();\n        const selected = document.querySelector('input[name="direction"]:checked');\n        const direction = selected ? selected.value : "old-to-new";\n        const exclude = excludeToggle ? excludeToggle.checked : false;\n        const policyRadio = document.querySelector('input[name="conversionPolicy"]:checked');\n        const policy = policyRadio ? policyRadio.value : "conservative";\n        const result = convertText(prepared.text, direction, dict, { exclude, policy });\n\n        lastResultText = result.plain;\n        lastReplacementList = result.replacements;\n        lastAmbiguityList = result.ambiguities;\n        if (inputHighlight) inputHighlight.innerHTML = result.inputHtml;\n        if (output) output.innerHTML = result.outputHtml;\n        renderReplacementTable(result.replacements);\n        renderAmbiguityReview(result.ambiguities);\n        if (resultBlock) resultBlock.hidden = false;\n      } catch (e) {\n        console.error(e);\n        showMessage("loadError", { showRetry: true, showNote: true, type: "error" });\n      } finally {\n        setProgress(false);\n      }\n    };\n\n    const initDict = async () => {\n      setConvertEnabled(false);\n      try {\n        const dict = await loadDict();\n        updateCounts(dict);\n        clearMessage();\n        setConvertEnabled(true);\n        if (pendingAutoConvert && convertBtn) {\n          pendingAutoConvert = false;\n          Promise.resolve().then(() => { if (!convertBtn.disabled) convertBtn.click(); });\n        }\n        return true;\n      } catch (err) {\n        console.error(err);\n        showMessage("loadError", { showRetry: true, showNote: true, type: "error" });\n        setConvertEnabled(false);\n        return false;\n      }\n    };\n\n    initDict();\n\n    if (retryBtn) {\n      retryBtn.addEventListener("click", () => {\n        dictCache = null;\n        initDict();\n      });\n    }\n\n    if (convertBtn) {\n      convertBtn.addEventListener("click", runConversion);\n    }\n`;
replaceOnce(modernizerApp, oldConvertBlock, newConvertBlock, 'Modernizer ready-state auto conversion');

replaceOnce(
  modernizerApp,
  `        lastAmbiguityList = [];\n        clearMessage();\n`,
  `        lastAmbiguityList = [];\n        updateReferenceLink("");\n        if (window.history && typeof window.history.replaceState === "function" && window.location?.href) {\n          const cleanUrl = new URL(window.location.href);\n          cleanUrl.searchParams.delete("q");\n          window.history.replaceState(null, "", cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);\n        }\n        clearMessage();\n`,
  'Modernizer reset handoff state',
);

replaceOnce(
  referenceApp,
  `  let entriesCache = [];\n`,
  `  let entriesCache = [];\n  let oldEntryLookup = new Map();\n`,
  'Reference lookup map declaration',
);

const oldBuildEntries = `  function buildEntries(dict){ const popularOrder = getPopularOrder(); entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => { const meta = getMeta(oldChar); const newText = Array.isArray(newChar) ? newChar.join("、") : String(newChar || ""); return { oldChar, newText, oldCode: getCodePoints(oldChar), newCode: getCodePoints(newText), category: getCategory(oldChar), verified: Boolean(meta.verified), readingJa: meta.readingJa || "", readingEn: meta.readingEn || "", meaningJa: meta.meaningJa || "", meaningEn: meta.meaningEn || "", usageJa: meta.usageJa || "", usageEn: meta.usageEn || "" }; }); entriesCache.sort((a,b) => { const ia = popularOrder.indexOf(a.oldChar); const ib = popularOrder.indexOf(b.oldChar); if (ia >= 0 && ib >= 0) return ia - ib; if (ia >= 0) return -1; if (ib >= 0) return 1; return a.oldChar.localeCompare(b.oldChar, "ja"); }); }\n`;
const newBuildEntries = `  function buildEntries(dict){ const popularOrder = getPopularOrder(); entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => { const meta = getMeta(oldChar); const newText = Array.isArray(newChar) ? newChar.join("、") : String(newChar || ""); return { oldChar, newText, oldCode: getCodePoints(oldChar), newCode: getCodePoints(newText), category: getCategory(oldChar), verified: Boolean(meta.verified), readingJa: meta.readingJa || "", readingEn: meta.readingEn || "", meaningJa: meta.meaningJa || "", meaningEn: meta.meaningEn || "", usageJa: meta.usageJa || "", usageEn: meta.usageEn || "" }; }); entriesCache.sort((a,b) => { const ia = popularOrder.indexOf(a.oldChar); const ib = popularOrder.indexOf(b.oldChar); if (ia >= 0 && ib >= 0) return ia - ib; if (ia >= 0) return -1; if (ib >= 0) return 1; return a.oldChar.localeCompare(b.oldChar, "ja"); }); oldEntryLookup = new Map(entriesCache.map(entry => [entry.oldChar, entry])); }\n`;
replaceOnce(referenceApp, oldBuildEntries, newBuildEntries, 'Reference lookup map build');

replaceOnce(
  referenceApp,
  `  function detectOldForms(text){\n    const counts = new Map();\n    Array.from(String(text || "")).forEach((ch) => { if (entriesCache.some(entry => entry.oldChar === ch)) counts.set(ch, (counts.get(ch) || 0) + 1); });\n    return entriesCache.filter(entry => counts.has(entry.oldChar)).map(entry => ({ entry, count: counts.get(entry.oldChar) }));\n  }\n`,
  `  function detectOldForms(text){\n    const counts = new Map();\n    Array.from(String(text || "")).forEach((ch) => { if (oldEntryLookup.has(ch)) counts.set(ch, (counts.get(ch) || 0) + 1); });\n    return entriesCache.filter(entry => counts.has(entry.oldChar)).map(entry => ({ entry, count: counts.get(entry.oldChar) }));\n  }\n`,
  'Reference detector linear lookup',
);

replaceOnce(
  referenceApp,
  `  function sendDetectorTextToConverter(){\n    const input = document.getElementById("detectorInput");\n    const text = (input?.value || "").trim();\n    if (!text) {\n      showToast(messages[currentLang].noDetectorTextToSend);\n      return;\n    }\n    window.location.href = toConverterUrl(text);\n  }\n`,
  `  function sendDetectorTextToConverter(){\n    const input = document.getElementById("detectorInput");\n    const text = input?.value || "";\n    if (!text.trim()) {\n      showToast(messages[currentLang].noDetectorTextToSend);\n      return;\n    }\n    window.location.href = toConverterUrl(text);\n  }\n`,
  'Reference exact detector handoff',
);

replaceOnce(
  referenceApp,
  `  function getDataStatus(entry){ return hasMeaning(entry) ? "verified" : "pair-only"; }\n`,
  `  function getDataStatus(entry){ return entry.verified ? "verified" : "pair-only"; }\n`,
  'Reference truthful export status',
);

replaceOnce(
  referenceHtml,
  `      <div id="statusMessage" class="status-message" role="status"></div>\n`,
  `      <div id="statusMessage" class="status-message" role="status"></div>\n      <button id="referenceRetryBtn" class="copy-btn" type="button" hidden><span data-i18n="ja">辞書を再読み込み</span><span data-i18n="en">Retry dictionary load</span></button>\n`,
  'Reference retry button',
);

replaceOnce(
  referenceApp,
  `    syncOkjProRuntimeState();\n    switchLang(currentLang); setStatusText(messages[currentLang].loading); loadData().then(dict => { loadFailed = false; setCounts(dict); buildEntries(dict); makeQuizQuestion(); renderAll(); }).catch(() => { loadFailed = true; renderAll(); });\n`,
  `    const referenceRetryBtn = document.getElementById("referenceRetryBtn");\n    const loadReferenceData = () => {\n      if (referenceRetryBtn) referenceRetryBtn.hidden = true;\n      setStatusText(messages[currentLang].loading);\n      return loadData().then(dict => {\n        loadFailed = false;\n        setCounts(dict);\n        buildEntries(dict);\n        makeQuizQuestion();\n        renderAll();\n        return true;\n      }).catch(() => {\n        loadFailed = true;\n        renderAll();\n        if (referenceRetryBtn) referenceRetryBtn.hidden = false;\n        return false;\n      });\n    };\n    if (referenceRetryBtn) referenceRetryBtn.addEventListener("click", loadReferenceData);\n    syncOkjProRuntimeState();\n    switchLang(currentLang);\n    loadReferenceData();\n`,
  'Reference retryable dictionary load',
);

console.log('Old Kanji Wave 11 product patch applied.');
