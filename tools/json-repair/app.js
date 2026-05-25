(function(){
  "use strict";

  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const TOOL_ID = "json-repair";
  const ENTITLEMENT = "nicheworks_pro";
  const HISTORY_KEY = "json-repair:pro-history";

  const $ = (id) => document.getElementById(id);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));

  const I18N = {
    ja: {
      title:"JSON Repair（壊れたJSON修復）", subtitle:"壊れたJSONをブラウザ内で修復・検証・整形（外部送信なし）", privacyNote:"入力内容は外部送信されません。修復・検証・履歴保存はこのブラウザ内だけで処理します。",
      modeLabel:"Mode", sampleLabel:"Sample", levelLabel:"Repair", indentLabel:"Indent", loadBtn:"ファイル読込", inputTitle:"入力", outputTitle:"出力", validateBtn:"検証", repairBtn:"修復", prettyBtn:"整形", minifyBtn:"ミニファイ", resetBtn:"リセット", shortcutsHint:"Cmd/Ctrl+Enter: 修復 / Cmd/Ctrl+Shift+Enter: 検証 / Cmd/Ctrl+S: 保存", tabRepaired:"修復結果", tabFormatted:"整形結果", tabValidate:"検証結果", copyBtn:"コピー", downloadBtn:"保存(.json)", logTitle:"修復ログ", showDiff:"簡易Diffを見る", donateText:"このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。", linksTitle:"関連ツール",
      proTitle:"NicheWorks Pro", freeCanTitle:"無料でできること", freeCan1:"JSON貼り付け・ファイル読み込み・Validate", freeCan2:"エラー内容、行・列、周辺テキスト、よくある原因の表示", freeCan3:"Safe / Standard repair、Pretty、Minify", freeCan4:"Copy、.json保存、Repair log、簡易Diff、無料サンプル",
      proCanTitle:"Proで解放されること", proCan1:"Aggressive repair（single quotes / unquoted keys / Python-like True, False, None）", proCan2:"複数JSON candidatesの一覧、Use / Repair", proCan3:"required / type のSchema check、Local history", proCan4:"Repair report copy、Markdown/JSON Advanced export、Pro samples",
      previewTitle:"Pro出力サンプル", previewDesc:"Previewモードでは結果例を確認できます。Pro専用の実行・コピー・エクスポート・保存ボタンはロックされます。", activeTitle:"Activeモード", activeDesc:"Pro解放済みです。Aggressive repair、候補操作、Schema check、履歴、レポート、Advanced exportを実行できます。", purchaseFlowTitle:"購入後の流れ", purchaseFlow:"購入後、このブラウザではNicheWorks Proが有効になります。タブやブラウザを閉じても通常は維持されます。ただし、別端末・別ブラウザ・シークレットモード・サイトデータ削除後は再度有効化が必要です。", limitsTitle:"制限事項", limitsDesc:"JSON修復は推定です。Aggressive repairは意味が変わる可能性があるため、重要データでは必ず原文と差分を確認してください。Pro権限の正はサーバー側のD1 pro_entitlementsです。", buyPro:"NicheWorks Proを購入 — $2.99",
      statusPreview:"Previewモードです。このブラウザでは共通Proがまだ有効ではありません。", statusActive:"Pro解放済み。このブラウザでは共通Proが有効です。", statusFail:"Pro状態を確認できませんでした。無料機能は引き続き利用できます。",
      candidatesTitle:"JSON candidates", schemaTitle:"Schema check", schemaHelp:"Schema JSON例: { \"required\": [\"name\"], \"types\": { \"name\": \"string\" } }", schemaRunBtn:"Schema check実行", historyTitle:"Local history", historyClear:"履歴を消去", reportTitle:"Repair report / Advanced export", reportCopy:"Reportをコピー", exportMd:"Markdown出力", exportJson:"JSON出力",
      faq1q:"入力したJSONはサーバーに送信されますか？", faq1a:"いいえ。JSON修復処理は外部送信せず、ブラウザ内で完結します。", faq2q:"無料版でログ混在JSONを扱えますか？", faq2a:"はい。Standard repairでログ混在テキストから最有力JSON候補を1つ抽出して修復できます。", faq3q:"Pro購入後はどうなりますか？", faq3a:"購入後、このブラウザではNicheWorks Proが有効になります。通常はタブやブラウザを閉じても維持されます。別端末・別ブラウザ・シークレットモード・サイトデータ削除後は再度有効化が必要です。", faq4q:"Pro権限はこのツール専用ですか？", faq4a:"いいえ。共通entitlement（nicheworks_pro）を使います。このツール用の個別Stripe、個別Webhook、個別D1、独自Proキーは使いません。",
      valid:"有効なJSONです。", invalid:"無効なJSONです。", line:"行", col:"列", around:"周辺", cause:"よくある原因", noOutput:"出力がありません。", copied:"コピーしました。", saved:"保存を開始しました。", locked:"Pro Previewです。購入後に実行できます。", repaired:"修復しました。", failed:"修復できませんでした。", loaded:"読み込みました。", noCandidates:"候補がありません。", historyEmpty:"履歴はまだありません。", schemaOk:"Schema check: OK", schemaNg:"Schema check: 問題あり", proSampleLocked:"Pro samplesはPreview表示のみです。購入後に入力へ読み込めます。"
    },
    en: {
      title:"JSON Repair (Fix Broken JSON)", subtitle:"Repair, validate, and format broken JSON locally (no external upload).", privacyNote:"Your input is not uploaded. Repair, validation, and optional history stay inside this browser.",
      modeLabel:"Mode", sampleLabel:"Sample", levelLabel:"Repair", indentLabel:"Indent", loadBtn:"Load file", inputTitle:"Input", outputTitle:"Output", validateBtn:"Validate", repairBtn:"Repair", prettyBtn:"Pretty", minifyBtn:"Minify", resetBtn:"Reset", shortcutsHint:"Cmd/Ctrl+Enter: Repair / Cmd/Ctrl+Shift+Enter: Validate / Cmd/Ctrl+S: Download", tabRepaired:"Repaired", tabFormatted:"Formatted", tabValidate:"Validate", copyBtn:"Copy", downloadBtn:"Download .json", logTitle:"Repair log", showDiff:"Show simple diff", donateText:"If this tool helped, consider supporting continued development.", linksTitle:"Related tools",
      proTitle:"NicheWorks Pro", freeCanTitle:"Free features", freeCan1:"Paste JSON, load files, and validate", freeCan2:"Show error message, line/column, nearby text, and likely causes", freeCan3:"Safe / Standard repair, Pretty, and Minify", freeCan4:"Copy, .json save, repair log, simple diff, and free samples",
      proCanTitle:"Unlocked with Pro", proCan1:"Aggressive repair (single quotes / unquoted keys / Python-like True, False, None)", proCan2:"List multiple JSON candidates with Use / Repair actions", proCan3:"required / type Schema check and Local history", proCan4:"Repair report copy, Markdown/JSON Advanced export, and Pro samples",
      previewTitle:"Pro output sample", previewDesc:"Preview mode shows examples. Pro-only execute, copy, export, and save actions stay locked.", activeTitle:"Active mode", activeDesc:"Pro is unlocked. You can run aggressive repair, candidate actions, schema checks, history, reports, and advanced exports.", purchaseFlowTitle:"After purchase", purchaseFlow:"After purchase, NicheWorks Pro is enabled in this browser. It usually remains active after closing the tab or browser. You may need to unlock again on another device, another browser, private mode, or after clearing site data.", limitsTitle:"Limits", limitsDesc:"JSON repair is best effort. Aggressive repair may change meaning, so compare the original and diff for important data. Server-side D1 pro_entitlements remains the source of truth for Pro rights.", buyPro:"Unlock NicheWorks Pro — $2.99",
      statusPreview:"Preview mode. Common Pro is not active in this browser yet.", statusActive:"Pro unlocked. Common Pro is active in this browser.", statusFail:"Could not check Pro status. Free features remain available.",
      candidatesTitle:"JSON candidates", schemaTitle:"Schema check", schemaHelp:"Schema JSON example: { \"required\": [\"name\"], \"types\": { \"name\": \"string\" } }", schemaRunBtn:"Run schema check", historyTitle:"Local history", historyClear:"Clear history", reportTitle:"Repair report / Advanced export", reportCopy:"Copy report", exportMd:"Export Markdown", exportJson:"Export JSON",
      faq1q:"Is my JSON uploaded to a server?", faq1a:"No. JSON repair runs locally in your browser without external upload.", faq2q:"Can the free version handle log-mixed JSON?", faq2a:"Yes. Standard repair extracts one most likely JSON candidate from mixed log text and repairs it.", faq3q:"What happens after purchase?", faq3a:"After purchase, NicheWorks Pro is enabled in this browser. It usually remains active after closing the tab or browser. You may need to unlock again on another device, another browser, private mode, or after clearing site data.", faq4q:"Is Pro specific to this tool?", faq4a:"No. It uses the shared entitlement (nicheworks_pro). This tool does not use a separate Stripe product, webhook, D1 database, or custom Pro key.",
      valid:"Valid JSON.", invalid:"Invalid JSON.", line:"line", col:"column", around:"around", cause:"Likely causes", noOutput:"No output yet.", copied:"Copied.", saved:"Download started.", locked:"Pro Preview. This action unlocks after purchase.", repaired:"Repaired.", failed:"Could not repair.", loaded:"Loaded.", noCandidates:"No candidates.", historyEmpty:"No history yet.", schemaOk:"Schema check: OK", schemaNg:"Schema check: issues found", proSampleLocked:"Pro samples are preview-only until purchase."
    }
  };

  const SAMPLES = {
    trailingComma:'{\n  "name": "demo",\n  "enabled": true,\n}\n', comments:'{\n  // comment\n  "name": "demo", /* block */\n  "enabled": true\n}\n', logMixed:'INFO start request=42\n{"name":"demo","enabled":true,}\nDEBUG done\n', array:'[\n  { "id": 1, "name": "alpha" },\n  { "id": 2, "name": "beta", }\n]\n', config:'{\n  "service": "api",\n  "retries": 3,\n  "features": ["safe", "standard",],\n}\n', singleQuotes:"{\n  'name': 'demo',\n  'enabled': True\n}\n", unquotedKeys:'{\n  name: "demo",\n  enabled: true,\n  nested_value: { count: 2 }\n}\n', pythonLiterals:'{\n  "enabled": True,\n  "disabled": False,\n  "value": None\n}\n'
  };

  const state = { lang:"ja", proActive:false, proStatusFailed:false, level:"safe", indent:2, repaired:"", formatted:"", validate:null, log:[], candidates:[], schemaResult:null };

  function t(key){ return (I18N[state.lang] && I18N[state.lang][key]) || key; }
  function toast(message){ const el = $("jrToast"); if (!el) return; el.textContent = message; el.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.hidden = true; }, 2400); }
  function setTab(name){ ["repaired","formatted","validate"].forEach((tab) => { const btn = document.querySelector(`.jr-tab[data-tab="${tab}"]`); const panel = $("panel" + tab.charAt(0).toUpperCase() + tab.slice(1)); const on = tab === name; if (btn) btn.setAttribute("aria-selected", on ? "true" : "false"); if (panel) panel.hidden = !on; }); }
  function copyText(text){ return navigator.clipboard?.writeText(String(text || "")).then(() => true).catch(() => { const ta = document.createElement("textarea"); ta.value = String(text || ""); ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.focus(); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; }); }
  function downloadText(filename, text, type = "application/json;charset=utf-8"){ const blob = new Blob([String(text || "")], { type }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1200); }

  function detectLang(){ const saved = localStorage.getItem("nw_lang"); if (saved === "ja" || saved === "en") return saved; return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en"; }
  function setLang(lang){ state.lang = lang === "en" ? "en" : "ja"; localStorage.setItem("nw_lang", state.lang); document.documentElement.lang = state.lang; qsa("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); }); qsa(".nw-lang-btn").forEach((btn) => btn.setAttribute("aria-pressed", btn.dataset.lang === state.lang ? "true" : "false")); updateProUi(); renderValidate(); renderLog(); renderCandidates(); renderHistory(); renderReport(); }

  function readCommonProStatus(){
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") throw new Error("NWPro unavailable");
      const status = window.NWPro.getLocalStatus();
      state.proActive = !!(status && status.active && (!status.entitlement || status.entitlement === ENTITLEMENT));
      state.proStatusFailed = false;
    } catch (_error) {
      state.proActive = false;
      state.proStatusFailed = true;
    }
    document.documentElement.dataset.proActive = state.proActive ? "true" : "false";
    updateProUi();
  }

  function updateProUi(){
    const statusEl = document.querySelector("[data-pro-status]");
    if (statusEl) statusEl.textContent = state.proStatusFailed ? t("statusFail") : (state.proActive ? t("statusActive") : t("statusPreview"));
    qsa("[data-pro-buy]").forEach((el) => { el.setAttribute("href", PAYMENT_LINK); });
    qsa("[data-pro-preview]").forEach((el) => { el.hidden = state.proActive; });
    qsa("[data-pro-only]").forEach((el) => { el.hidden = !state.proActive; });
    qsa(".jr-pro-action").forEach((el) => { el.disabled = !state.proActive; el.setAttribute("aria-disabled", state.proActive ? "false" : "true"); });
    const aggressive = $("selRepairLevel")?.querySelector('option[value="aggressive"]');
    if (aggressive) aggressive.disabled = !state.proActive;
    if (!state.proActive && $("selRepairLevel")?.value === "aggressive") { $("selRepairLevel").value = "standard"; state.level = "standard"; }
    const activeSample = $("jrActiveSample");
    if (activeSample) activeSample.textContent = JSON.stringify({ tool_id: TOOL_ID, entitlement: ENTITLEMENT, proActive: state.proActive, unlocked:["aggressive repair","candidates","schema check","history","repair report","advanced export"] }, null, 2);
    renderLevelHelp();
  }

  function guardPro(){ if (state.proActive) return true; toast(t("locked")); return false; }
  function updateStats(){ const raw = $("jrInput")?.value || ""; $("jrStats").textContent = `${raw.length.toLocaleString()} chars / ${(new Blob([raw]).size/1024).toFixed(1)} KB`; }
  function renderLevelHelp(){ const help = $("jrLevelHelp"); if (!help) return; const value = $("selRepairLevel")?.value || "safe"; const text = value === "safe" ? "Safe: BOM/newline normalization, comments, trailing commas." : value === "standard" ? "Standard: Safe repair + extract the most likely JSON candidate from mixed logs." : "Aggressive Pro: single quotes, unquoted keys, Python-like literals."; help.textContent = text; }

  function parseErrorPosition(message){ const m = /position (\d+)/i.exec(message || ""); return m ? Number(m[1]) : -1; }
  function lineCol(raw, pos){ if (pos < 0) return { line:0, col:0, snippet:"" }; const before = raw.slice(0, pos); const lines = before.split(/\r\n|\r|\n/); const start = Math.max(0, pos - 44); const end = Math.min(raw.length, pos + 44); return { line: lines.length, col: lines[lines.length - 1].length + 1, snippet: raw.slice(start, end) }; }
  function validateRaw(raw){ try { JSON.parse(raw); return { ok:true, msg:t("valid"), pos:-1, ...lineCol(raw, -1) }; } catch (error) { const pos = parseErrorPosition(error.message); return { ok:false, msg:error.message, pos, ...lineCol(raw, pos) }; } }

  function likelyCauses(raw, validation){
    const causes = [];
    if (/\/\/|\/\*/.test(raw)) causes.push("comments");
    if (/,\s*[}\]]/.test(raw)) causes.push("trailing comma");
    if (/(^|[,{]\s*)[A-Za-z_$][\w$-]*\s*:/.test(raw)) causes.push("unquoted keys");
    if (/'[^']*'/.test(raw)) causes.push("single quotes");
    if (/\b(True|False|None)\b/.test(raw)) causes.push("Python literals");
    if (!validation.ok && /\S[\s\S]*[\[{]/.test(raw) && !/^[\s\[{]/.test(raw)) causes.push("logs mixed in");
    return causes.length ? causes.join(", ") : "syntax mismatch / missing bracket / broken string";
  }

  function renderValidate(){ const out = $("jrValidateOut"); if (!out) return; const v = state.validate; if (!v) { out.textContent = "—"; return; } const raw = $("jrInput").value || ""; out.innerHTML = v.ok ? `<strong class="jr-ok">${escapeHtml(t("valid"))}</strong>` : `<strong class="jr-ng">${escapeHtml(t("invalid"))}</strong><br>${escapeHtml(v.msg)}<br>${escapeHtml(t("line"))}: ${v.line || "—"} / ${escapeHtml(t("col"))}: ${v.col || "—"}<br>${escapeHtml(t("around"))}: <code>${escapeHtml(v.snippet || "")}</code><br>${escapeHtml(t("cause"))}: ${escapeHtml(likelyCauses(raw, v))}`; }

  function stripComments(text){ let out = "", inString = false, quote = "", esc = false; for (let i = 0; i < text.length; i += 1) { const ch = text[i], next = text[i+1]; if (inString) { out += ch; if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === quote) inString = false; continue; } if (ch === '"' || ch === "'") { inString = true; quote = ch; out += ch; continue; } if (ch === "/" && next === "/") { while (i < text.length && text[i] !== "\n") i += 1; out += "\n"; continue; } if (ch === "/" && next === "*") { i += 2; while (i < text.length && !(text[i] === "*" && text[i+1] === "/")) i += 1; i += 1; continue; } out += ch; } return out; }
  function removeTrailingCommas(text){ let out = "", inString = false, esc = false; for (let i = 0; i < text.length; i += 1) { const ch = text[i]; if (inString) { out += ch; if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inString = false; continue; } if (ch === '"') { inString = true; out += ch; continue; } if (ch === ",") { let j = i + 1; while (/\s/.test(text[j] || "")) j += 1; if (text[j] === "}" || text[j] === "]") continue; } out += ch; } return out; }

  function safeRepair(raw){ state.log = []; let text = raw; if (text.charCodeAt(0) === 0xFEFF) { text = text.slice(1); state.log.push("Removed BOM"); } const normalized = text.replace(/\r\n?/g, "\n"); if (normalized !== text) { text = normalized; state.log.push("Normalized newlines"); } const noComments = stripComments(text); if (noComments !== text) { text = noComments; state.log.push("Removed comments"); } const noTrailing = removeTrailingCommas(text); if (noTrailing !== text) { text = noTrailing; state.log.push("Removed trailing commas"); } return text.trim() + (text.trim() ? "\n" : ""); }

  function findCandidates(raw){
    const candidates = []; const stack = []; let start = -1, inString = false, esc = false;
    for (let i = 0; i < raw.length; i += 1) { const ch = raw[i]; if (inString) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inString = false; continue; } if (ch === '"') { inString = true; continue; } if (ch === "{" || ch === "[") { if (!stack.length) start = i; stack.push(ch); } if ((ch === "}" || ch === "]") && stack.length) { const open = stack.pop(); if ((open === "{" && ch !== "}") || (open === "[" && ch !== "]")) stack.length = 0; if (!stack.length && start >= 0) { const text = raw.slice(start, i + 1); candidates.push({ index:candidates.length + 1, start, end:i + 1, kind:text.trim().startsWith("[") ? "array" : "object", text }); start = -1; } } }
    return candidates.sort((a,b) => b.text.length - a.text.length).slice(0, 10);
  }

  function aggressiveRepair(raw){
    const applied = [];
    let text = raw.replace(/\bTrue\b|\bFalse\b|\bNone\b/g, (match) => { applied.push("Normalized Python-like literal: " + match); return match === "True" ? "true" : match === "False" ? "false" : "null"; });
    text = text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_m, body) => { applied.push("Converted single-quoted string"); return `"${body.replace(/"/g, '\\"')}"`; });
    text = text.replace(/([,{]\s*)([A-Za-z_$][\w$-]*)(\s*:)/g, (_m, prefix, key, suffix) => { applied.push("Quoted unquoted key: " + key); return `${prefix}"${key}"${suffix}`; });
    const repaired = safeRepair(text);
    state.log = [...Array.from(new Set(applied)), ...state.log];
    return repaired;
  }

  function repair(){
    const raw = $("jrInput").value || ""; const level = $("selRepairLevel").value || "safe"; if (level === "aggressive" && !guardPro()) return;
    let text = level === "aggressive" ? aggressiveRepair(raw) : safeRepair(raw); let parsed = validateRaw(text);
    if (!parsed.ok && (level === "standard" || level === "aggressive")) { const candidates = findCandidates(raw); state.candidates = candidates; renderCandidates(); for (const candidate of candidates) { const attempt = level === "aggressive" ? aggressiveRepair(candidate.text) : safeRepair(candidate.text); if (validateRaw(attempt).ok) { text = attempt; parsed = validateRaw(text); state.log.push(`Extracted JSON candidate (${candidate.kind} ${candidate.start}..${candidate.end})`); break; } } }
    state.validate = parsed; if (parsed.ok) { state.repaired = text; state.formatted = ""; $("jrOutput").value = text; $("jrFormattedOut").value = ""; $("jrInput").classList.remove("jr-input-error"); $("jrDiff").textContent = makeDiff(raw, text); renderLog(); renderValidate(); renderReport(); saveHistory(raw, text); toast(t("repaired")); setTab("repaired"); } else { $("jrInput").classList.add("jr-input-error"); renderValidate(); renderLog(); toast(t("failed")); setTab("validate"); }
  }

  function makeDiff(before, after){ const b = before.split(/\r?\n/), a = after.split(/\r?\n/); const lines = []; const max = Math.max(b.length, a.length); for (let i = 0; i < Math.min(max, 80); i += 1) { if (b[i] !== a[i]) { if (b[i] !== undefined) lines.push(`- ${b[i]}`); if (a[i] !== undefined) lines.push(`+ ${a[i]}`); } } return lines.length ? lines.join("\n") : "No visible line diff."; }
  function renderLog(){ const el = $("jrLog"); if (!el) return; el.innerHTML = state.log.length ? `<ul>${state.log.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : "—"; }

  function renderCandidates(){ const wrap = $("jrCandidates"); if (!wrap) return; const candidates = state.candidates.length ? state.candidates : findCandidates($("jrInput")?.value || ""); if (!candidates.length) { wrap.textContent = t("noCandidates"); return; } wrap.innerHTML = candidates.map((c) => `<div class="jr-cand"><div><strong>#${c.index}</strong> ${escapeHtml(c.kind)} ${c.start}..${c.end}<pre>${escapeHtml(c.text.slice(0, 280))}</pre></div><div class="jr-toolbar"><button type="button" class="jr-btn jr-pro-action" data-cand-use="${c.index - 1}">Use</button><button type="button" class="jr-btn jr-pro-action" data-cand-repair="${c.index - 1}">Repair</button></div></div>`).join(""); updateProUi(); }

  function runSchema(){ if (!guardPro()) return; const src = state.repaired || state.formatted || $("jrInput").value || ""; let data, schema; try { data = JSON.parse(src); schema = JSON.parse($("jrSchemaRules").value || "{}"); } catch (error) { $("jrSchemaOut").textContent = error.message; return; } const issues = []; (schema.required || []).forEach((key) => { if (!(key in Object(data))) issues.push(`required missing: ${key}`); }); Object.entries(schema.types || {}).forEach(([key, type]) => { const value = Object(data)[key]; const actual = Array.isArray(value) ? "array" : value === null ? "null" : typeof value; if (value !== undefined && actual !== type) issues.push(`type mismatch: ${key} expected ${type}, got ${actual}`); }); state.schemaResult = { ok: issues.length === 0, issues }; $("jrSchemaOut").innerHTML = issues.length ? `<strong class="jr-ng">${escapeHtml(t("schemaNg"))}</strong><ul>${issues.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : `<strong class="jr-ok">${escapeHtml(t("schemaOk"))}</strong>`; renderReport(); }

  function historyItems(){ try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch (_) { return []; } }
  function saveHistory(input, repaired){ if (!state.proActive) return; const item = { at:new Date().toISOString(), inputChars:input.length, outputChars:repaired.length, summary:(state.log || []).join(", ") || "No repair rules" }; const items = [item, ...historyItems()].slice(0, 10); localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); renderHistory(); }
  function renderHistory(){ const el = $("jrHistList"); if (!el) return; const items = historyItems(); el.innerHTML = items.length ? `<ol>${items.map((item) => `<li><strong>${escapeHtml(item.at)}</strong><br>${escapeHtml(item.summary)}<br>${item.inputChars} → ${item.outputChars} chars</li>`).join("")}</ol>` : `<p>${escapeHtml(t("historyEmpty"))}</p><div data-pro-preview><pre class="jr-sample-out">2026-05-17T00:00:00.000Z\nRemoved comments, Removed trailing commas\n128 → 104 chars</pre></div>`; }

  function buildReport(){ return { tool_id:TOOL_ID, entitlement:ENTITLEMENT, proActive:state.proActive, summary:{ inputChars:($("jrInput")?.value || "").length, repairedChars:(state.repaired || "").length, valid:!!(state.validate && state.validate.ok) }, repairs:state.log, warnings: state.level === "aggressive" ? ["Aggressive repair may change meaning."] : [], schema:state.schemaResult, generatedAt:new Date().toISOString() }; }
  function reportMarkdown(){ const report = buildReport(); return `# JSON Repair report\n\n- tool_id: ${report.tool_id}\n- Pro active: ${report.proActive}\n- Input chars: ${report.summary.inputChars}\n- Repaired chars: ${report.summary.repairedChars}\n- Valid JSON: ${report.summary.valid}\n\n## Repairs\n${report.repairs.map((x) => `- ${x}`).join("\n") || "- None"}\n\n## Warnings\n${report.warnings.map((x) => `- ${x}`).join("\n") || "- None"}\n\n## Schema result\n\`\`\`json\n${JSON.stringify(report.schema, null, 2)}\n\`\`\`\n`; }
  function renderReport(){ const el = $("jrReport"); if (!el) return; el.textContent = state.proActive ? reportMarkdown() : "Preview report\n- Repairs: Removed comments, Removed trailing commas\n- Warnings: Aggressive repair may change meaning\n- Schema: required/type checks become available after unlock"; }

  function format(pretty){ const src = state.repaired || $("jrInput").value || ""; try { const obj = JSON.parse(src); const out = pretty ? JSON.stringify(obj, null, state.indent) + "\n" : JSON.stringify(obj); state.formatted = out; $("jrFormattedOut").value = out; setTab("formatted"); } catch (_error) { state.validate = validateRaw($("jrInput").value || ""); renderValidate(); setTab("validate"); toast(t("invalid")); } }

  function initEvents(){
    qsa(".nw-lang-btn").forEach((btn) => btn.addEventListener("click", () => setLang(btn.dataset.lang)));
    qsa(".jr-tab").forEach((btn) => btn.addEventListener("click", () => setTab(btn.dataset.tab)));
    $("selRepairLevel").addEventListener("change", (e) => { state.level = e.target.value; if (state.level === "aggressive" && !state.proActive) { e.target.value = "standard"; state.level = "standard"; toast(t("locked")); } renderLevelHelp(); });
    $("selIndent").addEventListener("change", (e) => { state.indent = Number(e.target.value) || 2; });
    $("selSample").addEventListener("change", (e) => { const key = e.target.value; if (!key) return; if (e.target.selectedOptions[0]?.dataset.pro === "true" && !state.proActive) { toast(t("proSampleLocked")); return; } $("jrInput").value = SAMPLES[key] || ""; state.repaired = ""; state.formatted = ""; updateStats(); state.candidates = findCandidates($("jrInput").value); renderCandidates(); });
    $("jrInput").addEventListener("input", () => { state.repaired = ""; state.formatted = ""; updateStats(); state.candidates = findCandidates($("jrInput").value); renderCandidates(); });
    $("btnLoad").addEventListener("click", () => $("fileInput").click());
    $("fileInput").addEventListener("change", async (event) => { const file = event.target.files?.[0]; if (!file) return; $("jrInput").value = await file.text(); updateStats(); state.candidates = findCandidates($("jrInput").value); renderCandidates(); toast(t("loaded")); });
    $("btnValidate").addEventListener("click", () => { state.validate = validateRaw($("jrInput").value || ""); $("jrInput").classList.toggle("jr-input-error", !state.validate.ok); renderValidate(); toast(state.validate.ok ? t("valid") : t("invalid")); setTab("validate"); });
    $("btnRepair").addEventListener("click", repair);
    $("btnFormatPretty").addEventListener("click", () => format(true));
    $("btnFormatMinify").addEventListener("click", () => format(false));
    $("btnCopy").addEventListener("click", async () => toast(await copyText(state.repaired || state.formatted || $("jrInput").value || "") ? t("copied") : t("noOutput")));
    $("btnDownload").addEventListener("click", () => { const text = state.repaired || state.formatted || ""; if (!text) { toast(t("noOutput")); return; } downloadText($("jrFilename").value || "repaired.json", text); toast(t("saved")); });
    $("btnReset").addEventListener("click", () => { ["jrInput","jrOutput","jrFormattedOut"].forEach((id) => { $(id).value = ""; }); state.repaired = ""; state.formatted = ""; state.validate = null; state.log = []; state.candidates = []; $("jrDiff").textContent = ""; updateStats(); renderValidate(); renderLog(); renderCandidates(); renderReport(); setTab("repaired"); });
    document.addEventListener("click", (event) => { const use = event.target.closest("[data-cand-use]"); const rep = event.target.closest("[data-cand-repair]"); if (!use && !rep) return; if (!guardPro()) return; const idx = Number((use || rep).dataset.candUse ?? (use || rep).dataset.candRepair); const candidate = (state.candidates.length ? state.candidates : findCandidates($("jrInput").value))[idx]; if (!candidate) return; $("jrInput").value = candidate.text; updateStats(); if (rep) repair(); });
    $("btnSchemaRun").addEventListener("click", runSchema);
    $("btnHistoryClear").addEventListener("click", () => { if (!guardPro()) return; localStorage.removeItem(HISTORY_KEY); renderHistory(); });
    $("btnReportCopy").addEventListener("click", async () => { if (!guardPro()) return; toast(await copyText(reportMarkdown()) ? t("copied") : t("noOutput")); });
    $("btnExportMd").addEventListener("click", () => { if (!guardPro()) return; downloadText("json-repair-report.md", reportMarkdown(), "text/markdown;charset=utf-8"); });
    $("btnExportJson").addEventListener("click", () => { if (!guardPro()) return; downloadText("json-repair-report.json", JSON.stringify({ ...buildReport(), repaired:state.repaired, repairLog:state.log, schemaResult:state.schemaResult }, null, 2), "application/json;charset=utf-8"); });
    window.addEventListener("keydown", (event) => { const mod = /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? event.metaKey : event.ctrlKey; if (!mod) return; if (event.key === "Enter") { event.preventDefault(); event.shiftKey ? $("btnValidate").click() : $("btnRepair").click(); } if ((event.key === "s" || event.key === "S") && !event.shiftKey) { event.preventDefault(); $("btnDownload").click(); } }, { passive:false });
  }

  function init(){ state.lang = detectLang(); initEvents(); setLang(state.lang); readCommonProStatus(); updateStats(); renderCandidates(); renderHistory(); renderReport(); setTab("repaired"); }
  window.addEventListener("DOMContentLoaded", init);
})();
