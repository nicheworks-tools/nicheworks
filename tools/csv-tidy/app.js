(function(){
  // [CSVTDY-14 constants]
  const PREVIEW_MAX_ROWS = 50;
  const PREVIEW_DEBOUNCE_MS = 160;

  "use strict";

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const els = {
    fileInput: $("#fileInput"),
    inEncoding: $("#inEncoding"),
    delimiter: $("#delimiter"),
    cleanScope: $("#cleanScope"),
    outDelimiter: $("#outDelimiter"),
    quotePolicy: $("#quotePolicy"),
    sampleBtn: $("#sampleBtn"),
    emptyGuide: $("#emptyGuide"),
    helpDetails: $("#helpDetails"),
    hasHeaderOn: $("#hasHeaderOn"),
    hasHeaderOff: $("#hasHeaderOff"),
    previewRows: $("#previewRows"),
    loadHint: $("#loadHint"),

    optTrim: $("#optTrim"),
    optNormSpaces: $("#optNormSpaces"),
    optZenHan: $("#optZenHan"),
    zenHanDir: $("#zenHanDir"),
    zenHanHeader: $("#zenHanHeader"),
    zenHanData: $("#zenHanData"),
    bomOn: $("#bomOn"),
    bomOff: $("#bomOff"),
    outNewline: $("#outNewline"),

    colSearch: $("#colSearch"),
    colsList: $("#colsList"),
    tmplSelect: $("#tmplSelect"),
    tmplApply: $("#tmplApply"),
    tmplInfo: $("#tmplInfo"),
    mapWarnBox: $("#mapWarnBox"),
    mapWarnCount: $("#mapWarnCount"),
    mapWarnBody: $("#mapWarnBody"),
    bulkResetOrder: $("#bulkResetOrder"),
    bulkIncludeAll: $("#bulkIncludeAll"),
    bulkExcludeAll: $("#bulkExcludeAll"),
    bulkIncludeMatched: $("#bulkIncludeMatched"),
    bulkExcludeMatched: $("#bulkExcludeMatched"),
    bulkClearSearch: $("#bulkClearSearch"),
    bulkHint: $("#bulkHint"),

    prevIn: $("#prevIn"),
    prevOut: $("#prevOut"),
    summary: $("#summary"),
    previewTable: $("#previewTable"),
    errBox: $("#errBox"),

    outName: $("#outName"),
    downloadBtn: $("#downloadBtn"),

    langButtons: $$(".nw-lang-switch button"),
    i18nNodes: $$("[data-i18n]")
  };

  const state = {
    ui: {
      lang: "ja",
      previewMode: "out",
      previewN: 20
    },
    input: {
      filename: "",
      encoding: "auto",
      delimiter: "auto",          // auto | , | tab | ;
      delimiterResolved: null,    // resolved delimiter for stable output (",", "\t", ";")
      hasHeader: true
    },
    options: {
      trim: true,
      normSpaces: false,
      zenHan: {
        enabled: true,
        dir: "zen2han",
        targetHeader: true,
        targetData: true
      },
      output: {
        bom: true,
        newline: "crlf"
      }
    },
    data: {
      rawText: "",
      rows: [],
      cols: []
    }
  };

  function setSegActive(a, b, onA){
    a.classList.toggle("active", !!onA);
    b.classList.toggle("active", !onA);
  }
  function setError(msg, code, action){
    const c = code ? `[${code}] ` : "";
    const a = action ? ` ${action}` : "";
    els.errBox.textContent = (msg ? (c + msg + a) : "");
    state.ui.lastErrorCode = code || "";
  }

  // [CSVTDY-12 filename helpers] download UX hardening
  function csvtdySanitizeFileName(name){
    let n = String(name ?? "").trim();
    // remove path-ish and forbidden chars
    n = n.replace(/[\/\\:*?"<>|]+/g, "_");
    n = n.replace(/\s+/g, " ").trim();
    if (!n) n = "export.tidy.csv";
    if (!/\.csv$/i.test(n)) n += ".csv";
    return n;
  }
  function setHint(msg){ els.loadHint.textContent = msg || ""; }
  

  // [CSVTDY-14 busy helpers]
  function setBusy(on, detail){
    const ov = document.getElementById("busyOverlay");
    const d  = document.getElementById("busyDetail");
    if (d) d.textContent = detail || "";
    if (!ov) return;
    ov.hidden = !on;
    // extra safety: some UA/CSS combos can fail to honor [hidden]
    ov.style.display = on ? "flex" : "none";
    ov.setAttribute("aria-hidden", on ? "false" : "true");
  }

  function setUIEnabled(enabled){
    const ids = [
      "csvFile","fileInput","downloadBtn","btnDownload","btnDownloadOut",
      "optTrim","optNormSpaces","optZenHan","zenHanDir","zenTargetHeader","zenTargetData",
      "hasHeader","optHasHeader","inBom","outBom","delimiter","encoding",
      "colSearch","bulkResetOrder","bulkIncludeAll","bulkExcludeAll","bulkIncludeMatched","bulkExcludeMatched","bulkClearSearch"
    ];
    ids.forEach(id=>{
      const el = document.getElementById(id);
      if (el && "disabled" in el) el.disabled = !enabled;
    });
  }
function setBulkHint(msg){ if(els.bulkHint) els.bulkHint.textContent = msg || ""; }

  
  function setTmplInfo(msg){ if(els.tmplInfo) els.tmplInfo.textContent = msg || ""; }

  function setMapWarn(items){
    const box = els.mapWarnBox;
    const body = els.mapWarnBody;
    const cnt = els.mapWarnCount;
    if (!box || !body || !cnt) return;

    const list = Array.isArray(items) ? items.filter(x=>x && x.kind) : [];
    if (!list.length){
      box.hidden = true;
      body.innerHTML = "";
      cnt.textContent = "";
      return;
    }

    box.hidden = false;
    cnt.textContent = `(${list.length})`;

    const parts = [];
    list.forEach(it=>{
      if (it.kind === "no_header"){
        parts.push(`<div>• ${it.msg}</div>`);
      } else if (it.kind === "missing"){
        const tags = (it.items||[]).map(x=>`<span class="tag">${escapeHtml(x)}</span>`).join("");
        parts.push(`<div>• ${it.msg}: ${tags}</div>`);
      } else if (it.kind === "unknown"){
        const tags = (it.items||[]).slice(0,24).map(x=>`<span class="tag">${escapeHtml(x)}</span>`).join("");
        const more = (it.items||[]).length > 24 ? ` …(+${(it.items||[]).length-24})` : "";
        parts.push(`<div>• ${it.msg}: ${tags}${more}</div>`);
      } else {
        parts.push(`<div>• ${it.msg}</div>`);
      }
    });
    body.innerHTML = parts.join("");
  }

function applyLang(lang){
    state.ui.lang = lang;
    els.i18nNodes.forEach(el => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    els.langButtons.forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
    els.colSearch.placeholder = (lang === "ja") ? "列を検索..." : "Search columns...";
  
    // Re-render dynamic UI (column list / preview) to match language
    // [CSVTDY-03] keep UI text consistent after lang switch
    if (state.data.cols && state.data.cols.length) renderColsList();
    
    updateMappingWarnings();
if (state.data.rows && state.data.rows.length) schedulePreviewRequest();
}

  async function readFileAsArrayBuffer(file){
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("file_read_failed"));
      fr.onload = () => resolve(fr.result);
      fr.readAsArrayBuffer(file);
    });
  }

  function decodeArrayBuffer(buf, enc){
    try {
      const td = new TextDecoder(enc, { fatal: false });
      return td.decode(buf);
    } catch (e) {
      // [CSVTDY-07] Some browsers don't support Shift_JIS in TextDecoder
      if (String(enc).toLowerCase() === "shift_jis") {
        const err = new Error("unsupported_shift_jis");
        err.code = "unsupported_shift_jis";
        throw err;
      }
      throw e;
    }
  }

  function guessEncoding(buf){
    let t1 = "";
    try { t1 = decodeArrayBuffer(buf, "utf-8"); } catch(_e){ t1 = ""; }
    const rep = (t1.match(/\uFFFD/g) || []).length;
    const len = Math.max(1, t1.length);
    const ratio = rep / len;
    if (ratio > 0.002) return "shift_jis";
    return "utf-8";
  }

  function guessDelimiter(text){
    const lines = text.split(/\r\n|\n|\r/).slice(0, 10);
    const cands = [",", "\t", ";"];
    const scores = cands.map(d => {
      let s = 0;
      for (const ln of lines) s += (ln.split(d).length - 1);
      return s;
    });
    let best = 0;
    for (let i=1;i<scores.length;i++) if (scores[i] > scores[best]) best = i;
    return scores[best] === 0 ? "," : cands[best];
  }

  function parseCSV(text, delim){
    const rows = [];
    let row = [];
    let cell = "";
    let i = 0;
    let inQuotes = false;

    while (i < text.length){
      const ch = text[i];

      if (inQuotes){
        if (ch === '"'){
          const next = text[i+1];
          if (next === '"'){ cell += '"'; i += 2; continue; }
          inQuotes = false; i++; continue;
        }
        cell += ch; i++; continue;
      } else {
        if (ch === '"'){ inQuotes = true; i++; continue; }

        if (ch === delim){
          row.push(cell); cell = ""; i++; continue;
        }
        if (ch === "\n" || ch === "\r"){
          if (ch === "\r" && text[i+1] === "\n") i++;
          row.push(cell);
          rows.push(row);
          row = []; cell = ""; i++; continue;
        }
        cell += ch; i++; continue;
      }
    }
    row.push(cell);
    rows.push(row);

    if (rows.length){
      const last = rows[rows.length-1];
      const allEmpty = last.every(v => (v || "") === "");
      if (allEmpty) rows.pop();
    }
    // [CSVTDY-06] Detect unclosed quote (malformed CSV)
    if (inQuotes) {
      const err = new Error("unclosed_quote");
      err.code = "unclosed_quote";
      throw err;
    }

    return rows;
  }

  function mustQuote(val, delim){
    const s = String(val ?? "");
    return s.includes('"') || s.includes(delim) || s.includes("\n") || s.includes("\r");
  }

  function stringifyCSV(rows, delim, newline){
    const nl = newline === "crlf" ? "\r\n" : "\n";
    const out = rows.map(r => r.map(v => {
      const s = String(v ?? "");
      if (!mustQuote(s, delim)) return s;
      return '"' + s.replace(/"/g, '""') + '"';
    }).join(delim)).join(nl);
    return out + nl;
  }

  const ZEN = {
    "　":" ",
    "０":"0","１":"1","２":"2","３":"3","４":"4","５":"5","６":"6","７":"7","８":"8","９":"9",
    "Ａ":"A","Ｂ":"B","Ｃ":"C","Ｄ":"D","Ｅ":"E","Ｆ":"F","Ｇ":"G","Ｈ":"H","Ｉ":"I","Ｊ":"J","Ｋ":"K","Ｌ":"L","Ｍ":"M","Ｎ":"N","Ｏ":"O","Ｐ":"P","Ｑ":"Q","Ｒ":"R","Ｓ":"S","Ｔ":"T","Ｕ":"U","Ｖ":"V","Ｗ":"W","Ｘ":"X","Ｙ":"Y","Ｚ":"Z",
    "ａ":"a","ｂ":"b","ｃ":"c","ｄ":"d","ｅ":"e","ｆ":"f","ｇ":"g","ｈ":"h","ｉ":"i","ｊ":"j","ｋ":"k","ｌ":"l","ｍ":"m","ｎ":"n","ｏ":"o","ｐ":"p","ｑ":"q","ｒ":"r","ｓ":"s","ｔ":"t","ｕ":"u","ｖ":"v","ｗ":"w","ｘ":"x","ｙ":"y","ｚ":"z",
    "－":"-","＿":"_","／":"/","＼":"\\","．":".","，":",","：":":","；":";","！":"!","？":"?","＠":"@","＃":"#","＄":"$","％":"%","＆":"&",
    "（":"(","）":")","［":"[","］":"]","｛":"{","｝":"}","＋":"+","＝":"=","＊":"*","＂":'"',"＇":"'",
    "＜":"<","＞":">"
  };
  const HAN = Object.fromEntries(Object.entries(ZEN).map(([k,v]) => [v,k]));
  function convertZenHan(s, dir){
    const map = (dir === "zen2han") ? ZEN : HAN;
    let out = "";
    for (const ch of String(s ?? "")) out += (map[ch] != null ? map[ch] : ch);
    return out;
  }

  function applyCellOptions(s){
    let v = String(s ?? "");
    if (state.options.trim) v = v.trim();
    if (state.options.normSpaces) v = v.replace(/[ \t]{2,}/g, " ");
    if (state.options.zenHan.enabled && state.options.zenHan.targetData){
      v = convertZenHan(v, state.options.zenHan.dir);
    }
    return v;
  }

  
  function shouldApplyCleanForCol(col){
    const scope = state.options.cleanScope || "all";
    if (scope === "all") return true;
    return (col && col.cleanApply !== false);
  }

  function applyHeaderOptions(s){
    let v = String(s ?? "");
    if (state.options.trim) v = v.trim();
    if (state.options.normSpaces) v = v.replace(/[ \t]{2,}/g, " ");
    if (state.options.zenHan.enabled && state.options.zenHan.targetHeader){
      v = convertZenHan(v, state.options.zenHan.dir);
    }
    return v;
  }

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;")
      .replaceAll(">","&gt;").replaceAll('"',"&quot;")
      .replaceAll("'","&#39;");
  }

  function pickSample(rows, idx){
    const start = state.input.hasHeader ? 1 : 0;
    for (let i=start; i<rows.length; i++){
      const v = rows[i][idx];
      if (v != null && String(v).trim() !== "") return String(v).slice(0, 80);
    }
    return "";
  }

  function normalizeOrders(){
    const cols = state.data.cols.slice().sort((a,b)=>a.order-b.order);
    cols.forEach((c,i)=> c.order = i);
  }

  function moveCol(id, delta){
    const cols = state.data.cols.slice().sort((a,b)=>a.order-b.order);
    const idx = cols.findIndex(c => c.id === id);
    const j = idx + delta;
    if (idx < 0 || j < 0 || j >= cols.length) return;
    const a = cols[idx], b = cols[j];
    const t = a.order; a.order = b.order; b.order = t;
    normalizeOrders();
    schedulePreviewRequest();
    renderColsList();
  }

  function reorderByDrag(fromId, toId){
    if (!fromId || !toId || fromId === toId) return;
    const cols = state.data.cols.slice().sort((a,b)=>a.order-b.order);
    const fromIdx = cols.findIndex(c => c.id === fromId);
    const toIdx = cols.findIndex(c => c.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = cols.splice(fromIdx, 1);
    cols.splice(toIdx, 0, moved);
    cols.forEach((c,i)=> c.order = i);
    schedulePreviewRequest();
    renderColsList();
  }

  function buildInputPreview(){
    const src = state.data.rows;
    const headers = state.input.hasHeader ? src[0] : src[0].map((_,i)=>`col_${i+1}`);
    const start = state.input.hasHeader ? 1 : 0;
    const rows = src.slice(start, start + state.ui.previewN);
    return { headers, rows };
  }

  function buildOutputPreview(limitRows){
    const cols = state.data.cols
      .filter(c => !c.excluded)
      .slice()
      .sort((a,b) => a.order - b.order);

    const headers = cols.map(c => applyHeaderOptions(c.name));
    const srcRows = state.data.rows;
    const start = state.input.hasHeader ? 1 : 0;
    const dataRows = srcRows.slice(start);

    const n = limitRows ? state.ui.previewN : dataRows.length;
    const outRows = [];
    for (let r=0; r<Math.min(n, dataRows.length); r++){
      const src = dataRows[r];
      const dst = cols.map(c => applyCellOptions(src[c.srcIndex] ?? ""));
      outRows.push(dst);
    }
    return { headers, rows: outRows, colsUsed: cols.length, dropped: state.data.cols.length - cols.length };
  }

  // [CSVTDY-10] Bulk actions helpers
  function getMatchedCols(){
    const q = (els.colSearch && els.colSearch.value ? String(els.colSearch.value) : "").trim().toLowerCase();
    const cols = state.data.cols || [];
    if (!q) return cols;
    return cols.filter(c => String(c.name || "").toLowerCase().includes(q));
  }

  function bulkMsg(ja, en){ return (state.ui.lang === "ja") ? ja : en; }

  function bulkApplyExclude(targetCols, excluded){
    let n = 0;
    for (const c of targetCols){
      if (!!c.excluded !== !!excluded){ c.excluded = !!excluded; n++; }
    }
    renderColsList();
    schedulePreviewRequest();
    setBulkHint(bulkMsg(`適用: ${n}列`, `Applied: ${n} columns`));
  }

  function bulkResetOrder(){
    const cols = (state.data.cols || []).slice().sort((a,b)=> (a.srcIndex ?? 0) - (b.srcIndex ?? 0));
    cols.forEach((c,i)=>{ c.order = i; });
    renderColsList();
    schedulePreviewRequest();
    setBulkHint(bulkMsg("順序をリセットしました", "Order reset"));
  }

  
  // [CSVTDY-15 templates] column templates (no persistence)
  const CSVTDY_TEMPLATES = {
    generic: {
      label: { ja: "汎用", en: "Generic" },
      order: [],   // empty = do not force order
      rename: {    // common header tidy
        "商品名": "title",
        "品名": "title",
        "数量": "quantity",
        "単価": "price",
        "金額": "amount",
        "備考": "memo"
      },
      exclude: []
    },
    accounting: {
      label: { ja: "会計（例）", en: "Accounting (example)" },
      order: ["date","account","amount","tax","memo"],
      rename: {
        "日付": "date",
        "勘定科目": "account",
        "金額": "amount",
        "税額": "tax",
        "摘要": "memo",
        "備考": "memo"
      },
      exclude: []
    },
    ec: {
      label: { ja: "EC（例）", en: "EC (example)" },
      order: ["sku","title","quantity","price","total"],
      rename: {
        "SKU": "sku",
        "商品コード": "sku",
        "商品名": "title",
        "数量": "quantity",
        "単価": "price",
        "小計": "total"
      },
      exclude: []
    }
  };

  function normKey(x){
    return String(x ?? "").trim().toLowerCase();
  }

  
  // [CSVTDY-16] mapping warnings (missing/unknown/header-off)
  function updateMappingWarnings(){
    if (!(state && state.data && state.data.cols && state.data.cols.length)){
      setMapWarn([]);
      return;
    }
    const lang = (state.ui && state.ui.lang==="ja") ? "ja" : "en";
    const cols = state.data.cols;

    const hasHeader = !!(state && state.input && state.input.hasHeader);
    const tid = (els.tmplSelect && els.tmplSelect.value) ? els.tmplSelect.value : "";
    const t = (typeof CSVTDY_TEMPLATES !== "undefined" && tid) ? CSVTDY_TEMPLATES[tid] : null;

    const items = [];

    if (!hasHeader){
      items.push({
        kind: "no_header",
        msg: (lang==="ja")
          ? "ヘッダーOFFのため列名が無く、テンプレ適用や不足検出が不正確になる可能性があります。必要ならヘッダーONにしてください。"
          : "Header is OFF. Column names are unavailable; template matching and missing checks may be inaccurate. Turn Header ON if needed."
      });
    }

    if (t && Array.isArray(t.order) && t.order.length){
      const expected = t.order.map(x => String(x||"").trim()).filter(Boolean);

      const present = new Set();
      const visibleNames = [];

      cols.filter(c=>!c.excluded).forEach(c=>{
        const out = (c.outName ?? c.newName ?? c.renameTo);
        const nm = String((out!=null && String(out).length) ? out : (c.name ?? "")).trim();
        if (!nm) return;
        present.add(nm.toLowerCase());
        visibleNames.push(nm);
      });

      const missing = expected.filter(x => !present.has(String(x).toLowerCase()));
      if (missing.length){
        items.push({
          kind: "missing",
          msg: (lang==="ja") ? "不足列" : "Missing columns",
          items: missing
        });
      }

      // unknown = columns not in expected (template selected only)
      const expectedSet = new Set(expected.map(x=>String(x).toLowerCase()));
      const unknown = visibleNames.filter(nm => !expectedSet.has(String(nm).toLowerCase()));
      if (unknown.length){
        items.push({
          kind: "unknown",
          msg: (lang==="ja") ? "不明列（テンプレ外）" : "Unknown (outside template)",
          items: unknown
        });
      }
    }

    setMapWarn(items);
  }

function applyTemplate(tid){
    if (!state || !state.data || !state.data.cols || !state.data.cols.length){
      setError(state.ui.lang==="ja" ? "先にCSVを読み込んでください。" : "Load a CSV first.");
      return;
    }
    const t = CSVTDY_TEMPLATES[tid];
    if (!t){
      setTmplInfo("");
      return;
    }

    const cols = state.data.cols;
    const hasHeader = !!(state && state.input && state.input.hasHeader);

    // build name map (by current column display name)
    // - prefer header cell value if present (stored in c.name usually)
    const map = new Map();
    cols.forEach((c, idx)=>{
      const key = normKey(c.name ?? "");
      if (key) map.set(key, c);
    });

    // apply renames (outName)
    let renamed = 0;
    Object.keys(t.rename || {}).forEach(src=>{
      const key = normKey(src);
      const c = map.get(key);
      if (c){
        c.outName = t.rename[src];
        renamed++;
      }
    });

    // apply excludes: explicit list + optional "include by order" behavior
    const exclSet = new Set((t.exclude || []).map(normKey));
    let forcedOrder = Array.isArray(t.order) && t.order.length > 0;

    // If template has order list, we treat it as "include these if found, but do not exclude others by default".
    // (Safer for unknown CSVs; user can still bulk-exclude manually.)
    // You can change to "exclude non-listed" later in CSVTDY-16/17.
    cols.forEach(c=>{
      const key = normKey(c.name ?? "");
      if (exclSet.has(key)) c.excluded = true;
    });

    // apply order (only for found columns)
    let ordered = 0;
    let missing = [];
    if (forcedOrder){
      // reset order to existing first, then set for matched cols
      // Keep relative order for unmatched.
      const base = cols.slice().sort((a,b)=>{
        const ao = (a.order != null) ? a.order : (a.srcIndex ?? 0);
        const bo = (b.order != null) ? b.order : (b.srcIndex ?? 0);
        return ao - bo;
      });

      // assign new order: first template matches in listed order, then remaining
      const used = new Set();
      let cursor = 0;

      t.order.forEach(name=>{
        const c = map.get(normKey(name));
        if (c){
          c.order = cursor++;
          used.add(c);
          ordered++;
        } else {
          missing.push(name);
        }
      });

      base.forEach(c=>{
        if (used.has(c)) return;
        c.order = cursor++;
      });
    }

    renderColsList();
    if (typeof schedulePreviewRequest === "function") schedulePreviewRequest();
    else schedulePreview();

    const ja = `テンプレ適用: ${t.label.ja}（rename:${renamed}${forcedOrder?`, order:${ordered}`:""}${missing.length?`, 不足:${missing.join(",")}`:""}）`;
    const en = `Template applied: ${t.label.en} (rename:${renamed}${forcedOrder?`, order:${ordered}`:""}${missing.length?`, missing:${missing.join(",")}`:""})`;
    setTmplInfo(state.ui.lang==="ja" ? ja : en);
  }

  function renderColsList(){
    const q = (els.colSearch.value || "").trim().toLowerCase();
    const cols = state.data.cols
      .slice()
      .sort((a,b)=>a.order-b.order)
      .filter(c => !q || (c.name || "").toLowerCase().includes(q));

    els.colsList.innerHTML = "";
    for (const c of cols){
      const li = document.createElement("li");
      li.className = "col-item";
      li.draggable = true;
      li.dataset.id = c.id;

      li.innerHTML = `
        <div class="col-top">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="drag" aria-label="drag">≡</span>
            <div class="muted">#${c.order + 1}</div>
          </div>
          <div class="col-top-right">
          <label class="check inline" style="margin:0;">
            <input type="checkbox" class="col-exclude" ${c.excluded ? "checked":""}/>
            <span>${state.ui.lang==="ja" ? "除外" : "Exclude"}</span>
          </label>
          <label class="check inline mini-check" style="margin:0;">
            <input type="checkbox" class="col-apply" ${c.cleanApply===false ? "":"checked"}/>
            <span>${state.ui.lang==="ja" ? "変換対象" : "Apply"}</span>
          </label>
          <button type="button" class="btn-mini col-toggle" aria-label="toggle">▾</button>
        </div>
        </div>

        <label class="field" style="margin:10px 0 0;">
          <span class="label">${state.ui.lang==="ja" ? "列名" : "Column name"}</span>
          <input type="text" class="col-name" value="${escapeHtml(c.name)}" />
        </label>

        <div class="col-meta">${state.ui.lang==="ja" ? "例" : "Sample"}: ${escapeHtml(c.sample || "")}</div>

        <div class="col-actions">
          <button type="button" class="btn-mini col-up">↑</button>
          <button type="button" class="btn-mini col-down">↓</button>
        </div>
      `;

      li.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", c.id);
        e.dataTransfer.effectAllowed = "move";
      });
      li.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });
      li.addEventListener("drop", (e) => {
        e.preventDefault();
        const fromId = e.dataTransfer.getData("text/plain");
        reorderByDrag(fromId, c.id);
      });

      $(".col-name", li).addEventListener("input", (e) => {
        c.name = e.target.value;
        schedulePreviewRequest();
      });
      $(".col-exclude", li).addEventListener("change", (e) => {
        c.excluded = !!e.target.checked;
        schedulePreviewRequest();
      });
      $(".col-apply", li).addEventListener("change", (e) => {
        c.cleanApply = !!e.target.checked;
        schedulePreviewRequest();
      });
      $(".col-toggle", li).addEventListener("click", () => {
        li.classList.toggle("collapsed");
      });
      $(".col-up", li).addEventListener("click", () => moveCol(c.id, -1));
      $(".col-down", li).addEventListener("click", () => moveCol(c.id, +1));

      if (window.matchMedia && window.matchMedia("(max-width: 480px)").matches){ li.classList.add("collapsed"); }
      els.colsList.appendChild(li);
    }
  }

  function renderPreview(){
    if (!state.data.rows.length){
      if (els.emptyGuide) els.emptyGuide.hidden = false;
      els.previewTable.innerHTML = "";
      els.summary.textContent = "";
      els.downloadBtn.disabled = true;
      return;
    }
    if (els.emptyGuide) els.emptyGuide.hidden = true;

    const inMode = (state.ui.previewMode === "in");
    const model = inMode ? buildInputPreview() : buildOutputPreview(true);

    els.summary.textContent = inMode
      ? (state.ui.lang==="ja" ? `入力プレビュー: ${state.ui.previewN}行` : `Input preview: ${state.ui.previewN} rows`)
      : (state.ui.lang==="ja"
          ? `出力列: ${model.colsUsed} / 除外: ${model.dropped} / プレビュー: ${state.ui.previewN}行`
          : `Output cols: ${model.colsUsed} / Dropped: ${model.dropped} / Preview: ${state.ui.previewN} rows`);

    const thead = `<thead><tr>${model.headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${model.rows.map(r => `<tr>${r.map(v => `<td>${escapeHtml(v)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    els.previewTable.innerHTML = thead + tbody;

    els.downloadBtn.disabled = false;
  }

  let previewTimer = null;

  // Debounced preview scheduler (avoid freezing on rapid operations)
  let __previewDebounce = null;
  function schedulePreviewRequest(){
    if (__previewDebounce) clearTimeout(__previewDebounce);
    __previewDebounce = setTimeout(() => {
      __previewDebounce = null;
      try { schedulePreview(); } catch(_e) {}
    }, PREVIEW_DEBOUNCE_MS);
  }

function schedulePreview(){
    // [CSVTDY-14 preview slice]
    const __rowsAll = (state && state.data && state.data.rows) ? state.data.rows : [];
    const __hasHeader = !!(state && state.input && state.input.hasHeader);
    // show at most PREVIEW_MAX_ROWS rows total (including header row if present)
    const __limit = PREVIEW_MAX_ROWS;
    const __rows = __rowsAll.length > __limit ? __rowsAll.slice(0, __limit) : __rowsAll;

    // [CSVTDY-13 empty preview hint] guide on empty state
    if (!(state && state.data && state.data.rows && state.data.rows.length)){
      setHint(state.ui.lang==="ja" ? "CSVを読み込んでください。" : "Please load a CSV.");
      
    setBusy(false, "");
    setUIEnabled(true);
return;
    }

    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(() => { setError(""); renderPreview(); }, 60);
  
    // [CSVTDY-16 preview hook]
    try { updateMappingWarnings(); } catch(_e) {}

}

  async function handleFile(file){
    // [CSVTDY-14 handleFile busy]
    setBusy(true, (state.ui && state.ui.lang==="ja") ? "読み込み中…" : "Loading…");
    setUIEnabled(false);

    // CSVTDY-BUSY-FINALLY: always recover UI even on early return/exception
    try {


    setError(""); setHint("");
    if (!file){ resetAll(); return; }

    state.input.filename = file.name || "export.csv";
    els.outName.value = (file.name ? file.name.replace(/\.csv$/i,"") : "export") + ".tidy.csv";

    let buf;
    try { buf = await readFileAsArrayBuffer(file); }
    catch(_e){
      const isUnclosed = (_e && (_e.code === "unclosed_quote" || _e.message === "unclosed_quote"));
      if (isUnclosed){
        setError(state.ui.lang==="ja" ? 'CSVの形式エラー：ダブルクォート(")が閉じていません。' : 'Malformed CSV: unclosed double-quote (").', "PARSE_UNCLOSED_QUOTE", state.ui.lang==="ja" ? "区切り文字やファイル形式を確認してください。" : "Check delimiter and CSV format.");
      } else {
        setError(state.ui.lang==="ja" ? "CSVの解析に失敗しました（形式を確認してください）。" : "Failed to parse CSV.", "PARSE_FAIL", state.ui.lang==="ja" ? "区切り文字やダブルクォートを確認してください。" : "Check delimiter and quotes.");
      }
      // ensure UI recovers from parse errors
      setBusy(false);
      setUIEnabled(true);

      return;
    }

    let enc = state.input.encoding;
    let guessedEnc = null;
    if (enc === "auto") { guessedEnc = guessEncoding(buf); enc = guessedEnc; }

    let text = "";
    try {
      text = decodeArrayBuffer(buf, enc === "shift_jis" ? "shift_jis" : "utf-8");
    } catch(_e){
      const isSJISUnsupported = (_e && (_e.code === "unsupported_shift_jis" || _e.message === "unsupported_shift_jis"));
      if (isSJISUnsupported){
        setError(state.ui.lang==="ja"
          ? "このブラウザはShift_JISの読み込みに未対応です。CSVをUTF-8に変換して再試行してください。"
          : "This browser does not support Shift_JIS decoding. Convert the CSV to UTF-8 and try again.");
      } else {
        setError(state.ui.lang==="ja" ? "文字コードの解釈に失敗しました。" : "Failed to decode text.");
      }
      return;
    }
    state.data.rawText = text;

    let delim = state.input.delimiter;
    if (delim === "auto") delim = guessDelimiter(text);
    if (delim === "tab") delim = "\t";
    state.input.delimiterResolved = delim;

    let rows;
    try { rows = parseCSV(text, delim); }
    catch(_e){
      setError(state.ui.lang==="ja" ? "CSVの解析に失敗しました（形式を確認してください）。" : "Failed to parse CSV.", "PARSE_FAIL", state.ui.lang==="ja" ? "区切り文字やダブルクォートを確認してください。" : "Check delimiter and quotes.");
      return;
    }
    if (!rows || !rows.length){
      setError(state.ui.lang==="ja" ? "CSVが空です。" : "CSV is empty.");
      return;
    }

    // [CSVTDY-05] Drop fully empty rows (keep header row if enabled)
    const keepHeaderRows = state.input.hasHeader ? 1 : 0;
    rows = rows.filter((r, idx) => {
      if (idx < keepHeaderRows) return true;
      return !r.every(v => String(v ?? "") === "");
    });

    const maxCols = rows.reduce((m,r)=>Math.max(m, r.length), 0);
    rows = rows.map(r => (r.length < maxCols ? r.concat(Array(maxCols-r.length).fill("")) : r));
    state.data.rows = rows;

    const headers = state.input.hasHeader ? rows[0] : Array.from({length:maxCols}, (_,i)=>`col_${i+1}`);
    state.data.cols = headers.map((h, idx) => ({
      id: "c" + idx + "_" + Math.random().toString(16).slice(2),
      srcIndex: idx,
      name: (h == null || h === "") ? `col_${idx+1}` : String(h),
      excluded: false,
      order: idx,
      sample: pickSample(rows, idx)
    }));

    const encLabel = enc === "shift_jis" ? "Shift_JIS" : "UTF-8";
    const encInfoJa = (guessedEnc ? `推定:${encLabel}` : `指定:${encLabel}`);
    const encInfoEn = (guessedEnc ? `guessed:${encLabel}` : `selected:${encLabel}`);
    setHint((state.ui.lang==="ja")
      ? `読み込み完了：${rows.length}行 / ${maxCols}列（${encInfoJa} / 区切り: ${delim === "\t" ? "TAB" : delim}）`
      : `Loaded: ${rows.length} rows / ${maxCols} cols (${encInfoEn} / delim: ${delim === "\t" ? "TAB" : delim})`
    );

    renderColsList();
    schedulePreviewRequest();
  
    } finally {
      try { setBusy(false); } catch(_e) {}
      try { setUIEnabled(true); } catch(_e) {}
    }
}

  function resetAll(){
    state.data.rawText = "";
    state.data.rows = [];
    state.data.cols = [];
    els.colsList.innerHTML = "";
    els.previewTable.innerHTML = "";
    els.summary.textContent = "";
    els.downloadBtn.disabled = true;
    setHint(""); setError("");
  }

  function downloadCSV(){
    if (!state.data.rows.length){
      setError(state.ui.lang==="ja" ? "CSVを読み込んでください。" : "Please load a CSV.", "NO_ROWS");
      return;
    }
    // Build OUT rows (all rows)
    const out = buildOutputPreview(false); // false => all rows

    // Determine output delimiter
    const mode = state.options.outDelimiter || "input";
    const delim = (mode==="input") ? state.input.delimiter
      : (mode==="comma") ? ","
      : (mode==="tab") ? "	"
      : (mode==="semi") ? ";"
      : state.input.delimiter;

    const newline = state.input.newline || "\n";
    const quoteMode = state.options.quotePolicy || "auto";

    let csv = stringifyCSV(out, delim, newline, quoteMode);

    // BOM
    const bom = state.options.bom ? "﻿" : "";
    const blob = new Blob([bom, csv], {type: "text/csv;charset=utf-8"});

    let name = (els.outName.value || "").trim();
    if (!name) name = "export.tidy.csv";
    if (!/\.csv$/i.test(name)) name += ".csv";

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  
  // [CSVTDY-11 cleaning helpers] apply options to OUT consistently (preview + download)
  function csvtdyReadOpt(){
    const $ = (id) => document.getElementById(id);
    const trimOn = !!($("optTrim") && $("optTrim").checked);
    const normOn = !!($("optNormSpaces") && $("optNormSpaces").checked);

    const zenOn = !!($("optZenHan") && $("optZenHan").checked);
    const zenDir = ($("zenHanDir") && $("zenHanDir").value) ? $("zenHanDir").value : "zen2han";
    const zenHeader = !!($("zenTargetHeader") && $("zenTargetHeader").checked);
    const zenData = !!($("zenTargetData") && $("zenTargetData").checked);

    return { trimOn, normOn, zenOn, zenDir, zenHeader, zenData };
  }

  // Minimal set: A-Z a-z 0-9 space + common symbols
  function csvtdyZen2Han(x){
    return String(x ?? "")
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/　/g, " ")
      .replace(/[！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～]/g,
               ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
  }
  function csvtdyHan2Zen(x){
    return String(x ?? "")
      .replace(/[A-Za-z0-9]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0xFEE0))
      .replace(/ /g, "　")
      .replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g,
               ch => String.fromCharCode(ch.charCodeAt(0) + 0xFEE0));
  }

  function csvtdyCleanCell(v, isHeader, opt){
    let s = String(v ?? "");
    if (opt.trimOn) s = s.trim();

    if (opt.zenOn){
      const ok = (isHeader && opt.zenHeader) || (!isHeader && opt.zenData);
      if (ok){
        s = (opt.zenDir === "han2zen") ? csvtdyHan2Zen(s) : csvtdyZen2Han(s);
      }
    }
    return s;
  }

  // Apply cleaning to already-built OUT rows.
  // Header row cleaning is applied only if hasHeader is true.
  function csvtdyCleanTable(outRows, hasHeader){
    const opt = csvtdyReadOpt();
    const rows = Array.isArray(outRows) ? outRows : [];
    if (!rows.length) return rows;

    const cleaned = rows.map((row, i) => {
      const isHeader = !!hasHeader && i === 0;
      return (Array.isArray(row) ? row : []).map(cell => csvtdyCleanCell(cell, isHeader, opt));
    });
    return cleaned;
  }

function bindUI(){
    setSegActive(els.hasHeaderOn, els.hasHeaderOff, state.input.hasHeader);
    setSegActive(els.bomOn, els.bomOff, state.options.output.bom);
    setSegActive(els.prevIn, els.prevOut, state.ui.previewMode === "in");

    els.langButtons.forEach(btn => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));

    els.fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      handleFile(file);
    });

    els.inEncoding.addEventListener("change", () => {
      state.input.encoding = els.inEncoding.value;
      const file = els.fileInput.files && els.fileInput.files[0];
      if (file) handleFile(file);
    });

    els.delimiter.addEventListener("change", () => {
      state.input.delimiter = els.delimiter.value;
      const file = els.fileInput.files && els.fileInput.files[0];
      if (file) handleFile(file);
    });

    els.previewRows.addEventListener("change", () => {
      state.ui.previewN = parseInt(els.previewRows.value, 10) || 20;
      schedulePreviewRequest();
    });

    els.hasHeaderOn.addEventListener("click", () => {
      state.input.hasHeader = true;
      
    // [CSVTDY-16 header hook]
    updateMappingWarnings();
setSegActive(els.hasHeaderOn, els.hasHeaderOff, true);
      const file = els.fileInput.files && els.fileInput.files[0];
      if (file) handleFile(file);
    });
    els.hasHeaderOff.addEventListener("click", () => {
      state.input.hasHeader = false;
      setSegActive(els.hasHeaderOn, els.hasHeaderOff, false);
      const file = els.fileInput.files && els.fileInput.files[0];
      if (file) handleFile(file);
    });

    els.optTrim.addEventListener("change", () => { state.options.trim = !!els.optTrim.checked; schedulePreviewRequest(); });
    els.optNormSpaces.addEventListener("change", () => { state.options.normSpaces = !!els.optNormSpaces.checked; schedulePreviewRequest(); });

    els.optZenHan.addEventListener("change", () => { state.options.zenHan.enabled = !!els.optZenHan.checked; schedulePreviewRequest(); });
    els.zenHanDir.addEventListener("change", () => { state.options.zenHan.dir = els.zenHanDir.value; schedulePreviewRequest(); });
    els.zenHanHeader.addEventListener("change", () => { state.options.zenHan.targetHeader = !!els.zenHanHeader.checked; schedulePreviewRequest(); });
    els.zenHanData.addEventListener("change", () => { state.options.zenHan.targetData = !!els.zenHanData.checked; schedulePreviewRequest(); });

    els.bomOn.addEventListener("click", () => {
      state.options.output.bom = true;
      setSegActive(els.bomOn, els.bomOff, true);
    });
    els.bomOff.addEventListener("click", () => {
      state.options.output.bom = false;
      setSegActive(els.bomOn, els.bomOff, false);
    });

    els.outNewline.addEventListener("change", () => { state.options.output.newline = els.outNewline.value; });

    els.prevIn.addEventListener("click", () => {
      state.ui.previewMode = "in";
      setSegActive(els.prevIn, els.prevOut, true);
      schedulePreviewRequest();
    });
    els.prevOut.addEventListener("click", () => {
      state.ui.previewMode = "out";
      setSegActive(els.prevIn, els.prevOut, false);
      schedulePreviewRequest();
    });

    els.colSearch.addEventListener("input", () => renderColsList());


    // [CSVTDY-15 bind template]
    if (els.tmplApply) {
      els.tmplApply.addEventListener("click", () => {
        const v = els.tmplSelect ? els.tmplSelect.value : "";
        applyTemplate(v);
      });
    }

    // [CSVTDY-11 opt listeners] ensure OUT updates immediately when options change
    (function(){
      const ids = ["optTrim","optNormSpaces","optZenHan","zenHanDir","zenTargetHeader","zenTargetData"];
      ids.forEach(id=>{
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("change", ()=>{ schedulePreviewRequest(); });
      });
    })();

    // [CSVTDY-10 bulk handlers]
    if (els.bulkResetOrder) els.bulkResetOrder.addEventListener("click", () => bulkResetOrder());
    if (els.bulkIncludeAll) els.bulkIncludeAll.addEventListener("click", () => bulkApplyExclude(state.data.cols || [], false));
    if (els.bulkExcludeAll) els.bulkExcludeAll.addEventListener("click", () => bulkApplyExclude(state.data.cols || [], true));
    if (els.bulkIncludeMatched) els.bulkIncludeMatched.addEventListener("click", () => bulkApplyExclude(getMatchedCols(), false));
    if (els.bulkExcludeMatched) els.bulkExcludeMatched.addEventListener("click", () => bulkApplyExclude(getMatchedCols(), true));
    if (els.bulkClearSearch) els.bulkClearSearch.addEventListener("click", () => { if (els.colSearch){ els.colSearch.value = ""; } renderColsList(); setBulkHint(""); });

    els.downloadBtn.addEventListener("click", downloadCSV);
  }

  function init(){
    const browserLang = (navigator.language || "").toLowerCase();
    applyLang(browserLang.startsWith("ja") ? "ja" : "en");
    state.ui.previewN = parseInt(els.previewRows.value, 10) || 20;
    bindUI();
    // Boot safety: never leave the overlay visible on initial load
    try { setBusy(false, ""); } catch(_e) {}
    try { setUIEnabled(true); } catch(_e) {}
    try { setHint(state.ui.lang==="ja" ? "CSVを読み込んでください。" : "Please load a CSV."); } catch(_e) {}
  }

  document.addEventListener("DOMContentLoaded", init);
})();
