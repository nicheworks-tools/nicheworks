/* CSV Tidy - browser-only
 * - No external requests
 * - Minimal JS
 */

(function(){
  "use strict";

  // ========= DOM helpers =========
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const els = {
    fileInput: $("#fileInput"),
    inEncoding: $("#inEncoding"),
    delimiter: $("#delimiter"),
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

  // ========= State =========
  const state = {
    ui: {
      lang: "ja",
      previewMode: "out", // "in" | "out"
      previewN: 20
    },
    input: {
      filename: "",
      encoding: "auto",   // auto | utf-8 | shift_jis
      delimiter: "auto",  // auto | , | \t | ;
      hasHeader: true
    },
    options: {
      trim: true,
      normSpaces: false,
      zenHan: {
        enabled: true,
        dir: "zen2han", // zen2han | han2zen
        targetHeader: true,
        targetData: true
      },
      output: {
        bom: true,
        newline: "crlf" // crlf | lf
      }
    },
    data: {
      // parsed
      rawText: "",
      rows: [],      // includes header row in rows[0] if hasHeader = true (after parse)
      headers: [],   // final header labels (current)
      // column model: stable id + source index
      cols: [],      // [{id, srcIndex, name, excluded, order, sample}]
      // preview cache
      previewIn: { headers: [], rows: [] },
      previewOut: { headers: [], rows: [] }
    }
  };

  // ========= i18n =========
  function initLang(){
    const browserLang = (navigator.language || "").toLowerCase();
    const initial = browserLang.startsWith("ja") ? "ja" : "en";
    applyLang(initial);
    els.langButtons.forEach(btn => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });
  }
  function applyLang(lang){
    state.ui.lang = lang;
    els.i18nNodes.forEach(el => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    els.langButtons.forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
    // placeholder text
    els.colSearch.placeholder = (lang === "ja") ? "列を検索..." : "Search columns...";
  }

  // ========= UI toggles (seg) =========
  function setSegActive(a, b, onA){
    a.classList.toggle("active", !!onA);
    b.classList.toggle("active", !onA);
  }

  function setError(msg){
    els.errBox.textContent = msg || "";
  }

  function setHint(msg){
    els.loadHint.textContent = msg || "";
  }

  // ========= Encoding / decoding =========
  async function readFileAsArrayBuffer(file){
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("file_read_failed"));
      fr.onload = () => resolve(fr.result);
      fr.readAsArrayBuffer(file);
    });
  }

  function decodeArrayBuffer(buf, enc){
    // enc: "utf-8" or "shift_jis"
    // NOTE: TextDecoder shift_jis availability depends on browser; modern Chromium OK.
    // If unsupported, it will throw.
    const td = new TextDecoder(enc, { fatal: false });
    return td.decode(buf);
  }

  function guessEncoding(buf){
    // Heuristic: try UTF-8 first, check replacement char ratio.
    // If too many "�" => prefer Shift_JIS.
    let t1 = "";
    try { t1 = decodeArrayBuffer(buf, "utf-8"); } catch(_e){ t1 = ""; }
    const rep = (t1.match(/\uFFFD/g) || []).length;
    const len = Math.max(1, t1.length);
    const ratio = rep / len;
    if (ratio > 0.002) return "shift_jis";
    return "utf-8";
  }

  // ========= Delimiter guess =========
  function guessDelimiter(text){
    // check first few lines
    const lines = text.split(/\r\n|\n|\r/).slice(0, 10);
    const cands = [",", "\t", ";"];
    const scores = cands.map(d => {
      let s = 0;
      for (const ln of lines){
        // naive count; good enough for MVP
        const cnt = ln.split(d).length - 1;
        s += cnt;
      }
      return s;
    });
    let best = 0;
    for (let i=1;i<scores.length;i++) if (scores[i] > scores[best]) best = i;
    return scores[best] === 0 ? "," : cands[best];
  }

  // ========= CSV parse / stringify =========
  function parseCSV(text, delim){
    // RFC4180-ish minimal parser with quotes.
    // Returns rows: string[][]
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
        } else {
          cell += ch; i++; continue;
        }
      } else {
        if (ch === '"'){ inQuotes = true; i++; continue; }

        // delimiter
        if (ch === delim){
          row.push(cell);
          cell = "";
          i++;
          continue;
        }

        // newline
        if (ch === "\n" || ch === "\r"){
          // handle CRLF
          if (ch === "\r" && text[i+1] === "\n") i++;
          row.push(cell);
          rows.push(row);
          row = [];
          cell = "";
          i++;
          continue;
        }

        cell += ch;
        i++;
      }
    }

    // last cell
    row.push(cell);
    rows.push(row);

    // drop trailing empty last row (common when file ends with newline)
    if (rows.length > 0){
      const last = rows[rows.length-1];
      const allEmpty = last.every(v => (v || "") === "");
      if (allEmpty) rows.pop();
    }

    return rows;
  }

  function mustQuote(val, delim, newline){
    if (val == null) return false;
    const s = String(val);
    return s.includes('"') || s.includes(delim) || s.includes("\n") || s.includes("\r");
  }

  function stringifyCSV(rows, delim, newline){
    const nl = newline === "crlf" ? "\r\n" : "\n";
    const out = rows.map(r => r.map(v => {
      const s = (v == null) ? "" : String(v);
      if (!mustQuote(s, delim, newline)) return s;
      return '"' + s.replace(/"/g, '""') + '"';
    }).join(delim)).join(nl);
    return out + nl;
  }

  // ========= Zen/Han conversion (limited mapping, safer than full NFKC) =========
  // Minimal sets: alnum, space, common symbols.
  const ZEN = {
    // space
    "　": " ",
    // numbers
    "０":"0","１":"1","２":"2","３":"3","４":"4","５":"5","６":"6","７":"7","８":"8","９":"9",
    // upper
    "Ａ":"A","Ｂ":"B","Ｃ":"C","Ｄ":"D","Ｅ":"E","Ｆ":"F","Ｇ":"G","Ｈ":"H","Ｉ":"I","Ｊ":"J","Ｋ":"K","Ｌ":"L","Ｍ":"M","Ｎ":"N","Ｏ":"O","Ｐ":"P","Ｑ":"Q","Ｒ":"R","Ｓ":"S","Ｔ":"T","Ｕ":"U","Ｖ":"V","Ｗ":"W","Ｘ":"X","Ｙ":"Y","Ｚ":"Z",
    // lower
    "ａ":"a","ｂ":"b","ｃ":"c","ｄ":"d","ｅ":"e","ｆ":"f","ｇ":"g","ｈ":"h","ｉ":"i","ｊ":"j","ｋ":"k","ｌ":"l","ｍ":"m","ｎ":"n","ｏ":"o","ｐ":"p","ｑ":"q","ｒ":"r","ｓ":"s","ｔ":"t","ｕ":"u","ｖ":"v","ｗ":"w","ｘ":"x","ｙ":"y","ｚ":"z",
    // symbols (representative)
    "－":"-","＿":"_","／":"/","＼":"\\","．":".","，":",","：":":","；":";","！":"!","？":"?","＠":"@","＃":"#","＄":"$","％":"%","＆":"&","（":"(","）":")","［":"[","］":"]","｛":"{","｝":"}","＋":"+","＝":"=","＊":"*","＂":'"',"＇":"'",
    "＜":"<","＞":">"
  };
  const HAN = Object.fromEntries(Object.entries(ZEN).map(([k,v]) => [v,k]));

  function convertZenHan(s, dir){
    if (!s) return s;
    const map = (dir === "zen2han") ? ZEN : HAN;
    // Replace by iterating chars (safe)
    let out = "";
    for (const ch of String(s)){
      out += (map[ch] != null) ? map[ch] : ch;
    }
    return out;
  }

  // ========= Transform =========
  function applyCellOptions(s){
    let v = (s == null) ? "" : String(s);

    if (state.options.trim) v = v.trim();
    if (state.options.normSpaces) v = v.replace(/[ \t]{2,}/g, " ");

    if (state.options.zenHan.enabled && state.options.zenHan.targetData){
      v = convertZenHan(v, state.options.zenHan.dir);
    }

    return v;
  }

  function applyHeaderOptions(s){
    let v = (s == null) ? "" : String(s);

    if (state.options.trim) v = v.trim();
    if (state.options.normSpaces) v = v.replace(/[ \t]{2,}/g, " ");

    if (state.options.zenHan.enabled && state.options.zenHan.targetHeader){
      v = convertZenHan(v, state.options.zenHan.dir);
    }

    return v;
  }

  function buildOutputMatrix(forPreview){
    // 1) pick included columns in current order
    const cols = state.data.cols
      .filter(c => !c.excluded)
      .slice()
      .sort((a,b) => a.order - b.order);

    const headers = cols.map(c => applyHeaderOptions(c.name));

    // 2) build rows (data only)
    const srcRows = state.data.rows;
    const start = state.input.hasHeader ? 1 : 0;
    const dataRows = srcRows.slice(start);

    const n = forPreview ? state.ui.previewN : dataRows.length;
    const outRows = [];

    for (let r=0; r<Math.min(n, dataRows.length); r++){
      const src = dataRows[r];
      const dst = cols.map(c => applyCellOptions(src[c.srcIndex] ?? ""));
      outRows.push(dst);
    }

    return { headers, rows: outRows, colsUsed: cols.length, dropped: state.data.cols.length - cols.length };
  }

  // ========= Render =========
  function renderColsList(){
    const q = (els.colSearch.value || "").trim().toLowerCase();
    const cols = state.data.cols
      .slice()
      .sort((a,b) => a.order - b.order)
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
            <div>
              <div class="muted">#${c.order + 1}</div>
            </div>
          </div>
          <label class="check inline" style="margin:0;">
            <input type="checkbox" class="col-exclude" ${c.excluded ? "checked":""}/>
            <span>${state.ui.lang==="ja" ? "除外" : "Exclude"}</span>
          </label>
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

      // DnD
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
        const toId = c.id;
        reorderByDrag(fromId, toId);
      });

      // events
      $(".col-name", li).addEventListener("input", (e) => {
        c.name = e.target.value;
        schedulePreview();
      });
      $(".col-exclude", li).addEventListener("change", (e) => {
        c.excluded = !!e.target.checked;
        schedulePreview();
      });
      $(".col-up", li).addEventListener("click", () => {
        moveCol(c.id, -1);
      });
      $(".col-down", li).addEventListener("click", () => {
        moveCol(c.id, +1);
      });

      els.colsList.appendChild(li);
    }
  }

  function renderPreview(){
    if (!state.data.rows.length){
      els.previewTable.innerHTML = "";
      els.summary.textContent = "";
      els.downloadBtn.disabled = true;
      return;
    }

    const inMode = (state.ui.previewMode === "in");
    const model = inMode ? buildInputPreview() : buildOutputMatrix(true);

    // summary
    if (!inMode){
      const totalCols = state.data.cols.length;
      els.summary.textContent =
        (state.ui.lang==="ja")
          ? `出力列: ${model.colsUsed} / 除外: ${model.dropped} / プレビュー: ${state.ui.previewN}行`
          : `Output cols: ${model.colsUsed} / Dropped: ${model.dropped} / Preview: ${state.ui.previewN} rows`;
    } else {
      els.summary.textContent =
        (state.ui.lang==="ja")
          ? `入力プレビュー: ${state.ui.previewN}行`
          : `Input preview: ${state.ui.previewN} rows`;
    }

    // table
    const thead = `<thead><tr>${model.headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${
      model.rows.map(r => `<tr>${r.map(v => `<td>${escapeHtml(v)}</td>`).join("")}</tr>`).join("")
    }</tbody>`;
    els.previewTable.innerHTML = thead + tbody;

    els.downloadBtn.disabled = false;
  }

  function buildInputPreview(){
    const src = state.data.rows;
    const hasHeader = state.input.hasHeader;
    const headers = hasHeader ? src[0] : src[0].map((_,i) => `col_${i+1}`);
    const start = hasHeader ? 1 : 0;
    const rows = src.slice(start, start + state.ui.previewN);
    return { headers, rows };
  }

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;")
      .replaceAll(">","&gt;").replaceAll('"',"&quot;")
      .replaceAll("'","&#39;");
  }

  // ========= Column reorder helpers =========
  function normalizeOrders(){
    const cols = state.data.cols.slice().sort((a,b)=>a.order-b.order);
    cols.forEach((c,i)=> c.order = i);
  }

  function moveCol(id, delta){
    const cols = state.data.cols.slice().sort((a,b)=>a.order-b.order);
    const idx = cols.findIndex(c => c.id === id);
    if (idx < 0) return;
    const j = idx + delta;
    if (j < 0 || j >= cols.length) return;

    const a = cols[idx], b = cols[j];
    const tmp = a.order; a.order = b.order; b.order = tmp;
    normalizeOrders();
    schedulePreview();
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
    schedulePreview();
    renderColsList();
  }

  // ========= Preview scheduling =========
  let previewTimer = null;
  function schedulePreview(){
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      setError("");
      renderPreview();
    }, 60);
  }

  // ========= Load & init columns =========
  async function handleFile(file){
    setError("");
    setHint("");

    if (!file){
      resetAll();
      return;
    }

    state.input.filename = file.name || "export.csv";
    els.outName.value = (file.name ? file.name.replace(/\.csv$/i,"") : "export") + ".tidy.csv";

    let buf;
    try {
      buf = await readFileAsArrayBuffer(file);
    } catch (e){
      setError(state.ui.lang==="ja" ? "ファイルの読み込みに失敗しました。" : "Failed to read file.");
      return;
    }

    // decode
    let enc = state.input.encoding;
    if (enc === "auto") enc = guessEncoding(buf);
    let text = "";
    try {
      text = decodeArrayBuffer(buf, enc === "shift_jis" ? "shift_jis" : "utf-8");
    } catch (e){
      // fallback
      try {
        text = decodeArrayBuffer(buf, "utf-8");
      } catch(_e){
        setError(state.ui.lang==="ja" ? "文字コードの解釈に失敗しました。" : "Failed to decode text.");
        return;
      }
    }

    state.data.rawText = text;

    // delimiter
    let delim = state.input.delimiter;
    if (delim === "auto") delim = guessDelimiter(text);
    if (delim === "tab") delim = "\t";

    // parse
    let rows;
    try {
      rows = parseCSV(text, delim);
    } catch (e){
      setError(state.ui.lang==="ja" ? "CSVの解析に失敗しました（形式を確認してください）。" : "Failed to parse CSV.");
      return;
    }

    if (!rows || rows.length === 0){
      setError(state.ui.lang==="ja" ? "CSVが空です。" : "CSV is empty.");
      return;
    }

    // normalize row length to max columns (pad)
    const maxCols = rows.reduce((m,r)=>Math.max(m, r.length), 0);
    rows = rows.map(r => (r.length < maxCols ? r.concat(Array(maxCols - r.length).fill("")) : r));

    state.data.rows = rows;

    // initialize column model
    const headers = state.input.hasHeader ? rows[0] : Array.from({length:maxCols}, (_,i)=>`col_${i+1}`);
    state.data.cols = headers.map((h, idx) => ({
      id: "c" + idx + "_" + Math.random().toString(16).slice(2),
      srcIndex: idx,
      name: (h == null || h === "") ? `col_${idx+1}` : String(h),
      excluded: false,
      order: idx,
      sample: pickSample(rows, idx)
    }));

    // hint
    setHint((state.ui.lang==="ja")
      ? `読み込み完了：${rows.length}行 / ${maxCols}列（入力: ${enc.toUpperCase()} / 区切り: ${prettyDelim(delim)}）`
      : `Loaded: ${rows.length} rows / ${maxCols} cols (enc: ${enc.toUpperCase()} / delim: ${prettyDelim(delim)})`
    );

    renderColsList();
    schedulePreview();
  }

  function prettyDelim(d){
    if (d === "\t") return "TAB";
    return d;
  }

  function pickSample(rows, idx){
    const start = state.input.hasHeader ? 1 : 0;
    for (let i=start; i<rows.length; i++){
      const v = rows[i][idx];
      if (v != null && String(v).trim() !== "") return String(v).slice(0, 80);
    }
    return "";
  }

  function resetAll(){
    state.data.rawText = "";
    state.data.rows = [];
    state.data.cols = [];
    els.colsList.innerHTML = "";
    els.previewTable.innerHTML = "";
    els.summary.textContent = "";
    els.downloadBtn.disabled = true;
    setHint("");
    setError("");
  }

  // ========= Download =========
  function downloadCSV(){
    setError("");
    if (!state.data.rows.length) return;

    // Determine delimiter used for output: keep input auto result? (simple: use comma)
    // For MVP: keep the parsed delimiter if possible. We'll infer again.
    let delim = state.input.delimiter;
    if (delim === "auto"){
      delim = guessDelimiter(state.data.rawText);
    }
    if (delim === "tab") delim = "\t";

    // build full output matrix (not preview)
    const model = buildOutputMatrix(false);
    const out = [model.headers].concat(model.rows);
    const csv = stringifyCSV(out, delim, state.options.output.newline);

    const bom = state.options.output.bom ? "\uFEFF" : "";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });

    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = (els.outName.value || "export.tidy.csv").trim() || "export.tidy.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  // ========= Bind UI =========
  function bindUI(){
    // initial seg states
    setSegActive(els.hasHeaderOn, els.hasHeaderOff, state.input.hasHeader);
    setSegActive(els.bomOn, els.bomOff, state.options.output.bom);
    setSegActive(els.prevIn, els.prevOut, state.ui.previewMode === "in");

    els.fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      handleFile(file);
    });

    els.inEncoding.addEventListener("change", () => {
      state.input.encoding = els.inEncoding.value;
      // re-parse same file if exists
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
      schedulePreview();
    });

    els.hasHeaderOn.addEventListener("click", () => {
      state.input.hasHeader = true;
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

    // options
    els.optTrim.addEventListener("change", () => { state.options.trim = !!els.optTrim.checked; schedulePreview(); });
    els.optNormSpaces.addEventListener("change", () => { state.options.normSpaces = !!els.optNormSpaces.checked; schedulePreview(); });

    els.optZenHan.addEventListener("change", () => { state.options.zenHan.enabled = !!els.optZenHan.checked; schedulePreview(); });
    els.zenHanDir.addEventListener("change", () => { state.options.zenHan.dir = els.zenHanDir.value; schedulePreview(); });
    els.zenHanHeader.addEventListener("change", () => { state.options.zenHan.targetHeader = !!els.zenHanHeader.checked; schedulePreview(); });
    els.zenHanData.addEventListener("change", () => { state.options.zenHan.targetData = !!els.zenHanData.checked; schedulePreview(); });

    els.bomOn.addEventListener("click", () => {
      state.options.output.bom = true;
      setSegActive(els.bomOn, els.bomOff, true);
    });
    els.bomOff.addEventListener("click", () => {
      state.options.output.bom = false;
      setSegActive(els.bomOn, els.bomOff, false);
    });

    els.outNewline.addEventListener("change", () => {
      state.options.output.newline = els.outNewline.value;
    });

    // preview mode
    els.prevIn.addEventListener("click", () => {
      state.ui.previewMode = "in";
      setSegActive(els.prevIn, els.prevOut, true);
      schedulePreview();
    });
    els.prevOut.addEventListener("click", () => {
      state.ui.previewMode = "out";
      setSegActive(els.prevIn, els.prevOut, false);
      schedulePreview();
    });

    els.colSearch.addEventListener("input", () => renderColsList());

    els.downloadBtn.addEventListener("click", downloadCSV);
  }

  // ========= Init =========
  function init(){
    initLang();

    // default language toggle active already set in applyLang
    // set default preview rows
    state.ui.previewN = parseInt(els.previewRows.value, 10) || 20;

    // default seg buttons
    setSegActive(els.hasHeaderOn, els.hasHeaderOff, state.input.hasHeader);
    setSegActive(els.bomOn, els.bomOff, state.options.output.bom);
    setSegActive(els.prevIn, els.prevOut, state.ui.previewMode === "in");

    bindUI();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
