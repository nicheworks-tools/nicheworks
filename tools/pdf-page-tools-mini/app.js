/* =========================================================
   PDF Page Tools Mini
   PPTM-14: エラー設計（コード別に文言統一）
   - unsupported_file / too_large_or_memory / extract_syntax_error / empty_result
   - すべて「短文＋復旧策」で統一
   - PPTM-13まで統合（Download/Extract/Undo/DnD/Thumb/Rotate preview）
   ========================================================= */

(function(){
  function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
  function $(sel){ return document.querySelector(sel); }

  const els = {
    langBtns: $all(".nw-lang-switch button"),
    i18nNodes: $all("[data-i18n]"),

    fileInput: $("#fileInput"),
    btnPick: $("#btnPick"),
    dropzone: $("#dropzone"),
    loading: $("#loading"),

    panelAfterLoad: $("#panelAfterLoad"),
    btnAddMore: $("#btnAddMore"),
    btnReset: $("#btnReset"),
    btnUndo: $("#btnUndo"),
    btnSave: $("#btnSave"),
    extractRange: $("#extractRange"),
    btnExtract: $("#btnExtract"),

    fileList: $("#fileList"),
    pageList: $("#pageList"),

    statusBox: $("#statusBox"),
    statusText: $("#statusText"),
    btnStatusClose: $("#btnStatusClose"),
  };

  // ---------------- i18n ----------------
  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  function applyLang(lang){
    els.i18nNodes.forEach(el => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    els.langBtns.forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
    currentLang = lang;
  }
  els.langBtns.forEach(btn => btn.addEventListener("click", () => {
    applyLang(btn.dataset.lang);
    renderFileList();
    renderPageList();
    scheduleThumbScan();
    syncUndoUI();
    syncExtractUI();
  }));

  function msg(ja, en){ return (currentLang === "ja") ? ja : en; }

  // ---------------- status ----------------
  function showStatus(text){
    if(!els.statusBox || !els.statusText) return;
    els.statusText.textContent = text;
    els.statusBox.hidden = false;
  }
  function hideStatus(){
    if(!els.statusBox) return;
    els.statusBox.hidden = true;
  }
  if(els.btnStatusClose) els.btnStatusClose.addEventListener("click", hideStatus);

  // ---------------- error messages (PPTM-14) ----------------
  const ERR = {
    unsupported_file: {
      ja: "このファイルはPDFとして読み込めませんでした。別のPDFを試してください。",
      en: "This file could not be read as a PDF. Please try another PDF."
    },
    too_large_or_memory: {
      ja: "処理に失敗しました（端末のメモリ不足の可能性）。ページ数を減らすか、分割してお試しください。",
      en: "Failed to process (possible memory issue). Try fewer pages, split the PDF, or use another browser."
    },
    extract_syntax_error: {
      ja: "範囲の書き方が正しくありません（例: 1-3,5,8-10）。",
      en: "Range format is invalid (e.g., 1-3,5,8-10)."
    },
    empty_result: {
      ja: "出力するページがありません。削除を戻すか、PDFを追加してください。",
      en: "No pages to export. Undo deletion or add PDFs."
    },
    missing_pdfjs: {
      ja: "PDF表示ライブラリ（pdf.js）の読み込みに失敗しました。ページを再読み込みしてください。",
      en: "Failed to load PDF library (pdf.js). Please reload this page."
    },
    missing_pdflib: {
      ja: "PDF書き出しライブラリ（pdf-lib）が読み込めませんでした。/assets/vendor/pdf-lib.min.js を確認してください。",
      en: "PDF export library (pdf-lib) is missing. Check /assets/vendor/pdf-lib.min.js."
    }
  };

  function showError(code){
    const e = ERR[code] || ERR.too_large_or_memory;
    showStatus(currentLang === "ja" ? e.ja : e.en);
  }

  // ---------------- state ----------------
  const state = {
    files: [], // {id, name, size, buffer, pageCount, pdfDocPromise}
    pages: [], // {id, fileId, fileName, srcPage, rotation, thumbUrl}
    _id: 0,
  };
  function uid(prefix){
    state._id += 1;
    return prefix + "-" + String(state._id);
  }

  // ---------------- editor enable/disable ----------------
  let isBusy = false;

  function setBusy(on){
    isBusy = on;
    if(els.loading) els.loading.hidden = !on;

    if(els.btnPick) els.btnPick.disabled = on;
    if(els.btnAddMore) els.btnAddMore.disabled = on;

    if(els.btnReset) els.btnReset.disabled = on || state.pages.length === 0;
    if(els.btnSave)  els.btnSave.disabled  = on || state.pages.length === 0;

    if(els.extractRange) els.extractRange.disabled = on || state.pages.length === 0;

    syncExtractUI();

    if(els.btnUndo) els.btnUndo.disabled = on || !undo.lastDelete;

    if(els.panelAfterLoad){
      els.panelAfterLoad.classList.toggle("is-busy", on);
      els.panelAfterLoad.setAttribute("aria-busy", on ? "true" : "false");
    }
  }

  function setEditorEnabled(on){
    const disabled = !on;
    if(els.btnAddMore) els.btnAddMore.disabled = disabled;
    if(els.btnReset) els.btnReset.disabled = disabled;
    if(els.btnSave) els.btnSave.disabled = disabled;
    if(els.extractRange) els.extractRange.disabled = disabled;
    if(els.btnExtract) els.btnExtract.disabled = disabled;

    if(els.panelAfterLoad){
      els.panelAfterLoad.classList.toggle("is-disabled", disabled);
      els.panelAfterLoad.setAttribute("aria-disabled", disabled ? "true" : "false");
    }
  }

  setEditorEnabled(false);
  setBusy(false);

  // ---------------- undo ----------------
  const undo = { lastDelete: null };
  function clearUndo(){
    undo.lastDelete = null;
    syncUndoUI();
  }
  function syncUndoUI(){
    if(!els.btnUndo) return;
    els.btnUndo.disabled = isBusy || !undo.lastDelete;
  }

  function isPdfLike(f){
    const n = (f.name || "").toLowerCase();
    const t = (f.type || "").toLowerCase();
    return t === "application/pdf" || n.endsWith(".pdf");
  }

  function syncEditorEnabled(){
    if(state.pages.length > 0){
      setEditorEnabled(true);
      if(!isBusy) setBusy(false);
    }else{
      setEditorEnabled(false);
      setBusy(false);
    }
    syncUndoUI();
    syncExtractUI();
  }

  // ---------------- render: file list ----------------
  function renderFileList(){
    if(!els.fileList) return;
    els.fileList.innerHTML = "";

    if(state.files.length === 0){
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = msg("（まだ読み込まれていません）", "(No PDFs loaded yet)");
      els.fileList.appendChild(li);
      return;
    }

    state.files.forEach(f => {
      const li = document.createElement("li");
      li.className = "file-item";

      const left = document.createElement("div");
      left.className = "file-left";
      left.textContent = `${f.name} (${String(f.pageCount)}p)`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "file-remove";
      btn.textContent = msg("×このPDFを外す", "Remove");
      btn.addEventListener("click", () => removeFile(f.id));

      li.appendChild(left);
      li.appendChild(btn);
      els.fileList.appendChild(li);
    });
  }

  // ---------------- thumbs (on-demand) ----------------
  let io = null;
  let thumbScanScheduled = false;

  function ensureObserver(){
    if(io) return;
    io = new IntersectionObserver(async (entries) => {
      for(const e of entries){
        if(!e.isIntersecting) continue;
        const el = e.target;
        io.unobserve(el);

        const pid = el.getAttribute("data-page-id");
        if(!pid) continue;
        const p = state.pages.find(x => x.id === pid);
        if(!p) continue;

        if(p.thumbUrl){
          const img = el.querySelector("img");
          if(img && img.getAttribute("src") !== p.thumbUrl) img.src = p.thumbUrl;
          el.classList.remove("thumb-loading");
          continue;
        }

        try{
          el.classList.add("thumb-loading");
          const url = await buildThumbForPage(p);
          if(url){
            p.thumbUrl = url;
            const img = el.querySelector("img");
            if(img) img.src = url;
          }
        }catch(err){
          console.warn("thumb failed", err);
        }finally{
          el.classList.remove("thumb-loading");
        }
      }
    }, { root: null, rootMargin: "200px 0px", threshold: 0.01 });
  }

  function scheduleThumbScan(){
    if(thumbScanScheduled) return;
    thumbScanScheduled = true;
    requestAnimationFrame(() => {
      thumbScanScheduled = false;
      if(!els.pageList) return;
      ensureObserver();
      const cards = Array.from(els.pageList.querySelectorAll(".page-card[data-page-id]"));
      for(const c of cards){
        const pid = c.getAttribute("data-page-id");
        const p = state.pages.find(x => x.id === pid);
        if(!p) continue;
        if(p.thumbUrl){
          const img = c.querySelector("img");
          if(img && img.getAttribute("src") !== p.thumbUrl) img.src = p.thumbUrl;
          continue;
        }
        io.observe(c);
      }
    });
  }

  async function buildThumbForPage(page){
    const f = state.files.find(x => x.id === page.fileId);
    if(!f) return null;
    if(!window.pdfjsLib) return null;

    if(!f.pdfDocPromise){
      f.pdfDocPromise = window.pdfjsLib.getDocument({ data: f.buffer }).promise;
    }
    const pdf = await f.pdfDocPromise;

    const pg = await pdf.getPage(page.srcPage);
    const viewport0 = pg.getViewport({ scale: 1.0 });
    const targetW = 180;
    const scale = Math.min(1.0, targetW / Math.max(1, viewport0.width));
    const viewport = pg.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await pg.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.72);
  }

  // ---------------- DnD reorder ----------------
  function dndEnabled(){
    try{
      return window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }catch(_){
      return false;
    }
  }

  function attachDndHandlers(card, idx){
    if(!dndEnabled()) return;

    card.setAttribute("draggable", "true");
    card.classList.add("dnd");

    let fromIndex = null;

    card.addEventListener("dragstart", (e) => {
      if(isBusy) return;
      fromIndex = idx;
      card.classList.add("dragging");
      try{
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(idx));
      }catch(_){}
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      cleanupDndVisuals();
      fromIndex = null;
    });

    card.addEventListener("dragover", (e) => {
      if(isBusy) return;
      e.preventDefault();
      card.classList.add("dragover");
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("dragover");
    });

    card.addEventListener("drop", (e) => {
      if(isBusy) return;
      e.preventDefault();
      cleanupDndVisuals();
      const from = fromIndex;
      const to = idx;
      if(from == null) return;
      if(from === to) return;
      movePage(from, to);
      showStatus(msg("並べ替えました。", "Reordered."));
    });
  }

  function cleanupDndVisuals(){
    if(!els.pageList) return;
    els.pageList.querySelectorAll(".page-card.dragover").forEach(x => x.classList.remove("dragover"));
    els.pageList.querySelectorAll(".page-card.dragging").forEach(x => x.classList.remove("dragging"));
  }

  // ---------------- render: page list (rotate preview) ----------------
  function renderPageList(){
    if(!els.pageList) return;
    els.pageList.innerHTML = "";

    if(state.pages.length === 0){
      const div = document.createElement("div");
      div.className = "muted";
      div.textContent = msg("（ページがありません）", "(No pages)");
      els.pageList.appendChild(div);
      scheduleThumbScan();
      return;
    }

    state.pages.forEach((p, idx) => {
      const card = document.createElement("div");
      card.className = "page-card";
      card.setAttribute("data-page-id", p.id);

      const top = document.createElement("div");
      top.className = "page-top";
      top.textContent = `#${idx+1}  ${p.fileName}  p${p.srcPage}`;

      const thumb = document.createElement("div");
      thumb.className = "thumb-box";
      const img = document.createElement("img");
      img.alt = "thumbnail";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = p.thumbUrl ? p.thumbUrl : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.style.transform = `rotate(${p.rotation}deg)`;
      img.style.transformOrigin = "center center";
      thumb.appendChild(img);

      const meta = document.createElement("div");
      meta.className = "page-meta";
      meta.textContent = msg(`回転: ${p.rotation}°`, `Rotation: ${p.rotation}°`);

      const ops = document.createElement("div");
      ops.className = "page-ops";

      const rotL = document.createElement("button");
      rotL.type = "button";
      rotL.className = "op";
      rotL.textContent = "⟲";
      rotL.title = "Rotate -90";
      rotL.addEventListener("click", () => {
        p.rotation = (p.rotation + 270) % 360;
        renderPageList();
        scheduleThumbScan();
        syncExtractUI();
      });

      const rotR = document.createElement("button");
      rotR.type = "button";
      rotR.className = "op";
      rotR.textContent = "⟳";
      rotR.title = "Rotate +90";
      rotR.addEventListener("click", () => {
        p.rotation = (p.rotation + 90) % 360;
        renderPageList();
        scheduleThumbScan();
        syncExtractUI();
      });

      const del = document.createElement("button");
      del.type = "button";
      del.className = "op danger";
      del.textContent = "🗑";
      del.title = msg("削除", "Delete");
      del.addEventListener("click", () => deletePageAt(idx));

      const up = document.createElement("button");
      up.type = "button";
      up.className = "op";
      up.textContent = msg("↑ 上へ", "↑ Up");
      up.addEventListener("click", () => movePage(idx, idx-1));

      const down = document.createElement("button");
      down.type = "button";
      down.className = "op";
      down.textContent = msg("↓ 下へ", "↓ Down");
      down.addEventListener("click", () => movePage(idx, idx+1));

      ops.appendChild(rotL);
      ops.appendChild(rotR);
      ops.appendChild(del);
      ops.appendChild(up);
      ops.appendChild(down);

      card.appendChild(top);
      card.appendChild(thumb);
      card.appendChild(meta);
      card.appendChild(ops);

      attachDndHandlers(card, idx);

      els.pageList.appendChild(card);
    });

    scheduleThumbScan();
  }

  // ---------------- delete + undo ----------------
  function deletePageAt(index){
    if(isBusy) return;
    if(index < 0 || index >= state.pages.length) return;

    const page = state.pages[index];
    undo.lastDelete = { page: { ...page }, index };
    syncUndoUI();

    state.pages.splice(index, 1);
    syncEditorEnabled();
    renderPageList();
    scheduleThumbScan();
    syncExtractUI();

    showStatus(msg("ページを削除しました。Undo（1回）で戻せます。", "Page deleted. You can undo once."));
  }

  function undoDelete(){
    if(isBusy) return;
    if(!undo.lastDelete) return;

    const { page, index } = undo.lastDelete;
    const insertAt = Math.max(0, Math.min(index, state.pages.length));
    state.pages.splice(insertAt, 0, page);

    undo.lastDelete = null;
    syncUndoUI();

    syncEditorEnabled();
    renderPageList();
    scheduleThumbScan();
    syncExtractUI();

    showStatus(msg("Undoしました（直前の削除を戻しました）。", "Undo complete (restored last deleted page)."));
  }
  if(els.btnUndo) els.btnUndo.addEventListener("click", undoDelete);

  // ---------------- naming + download helpers ----------------
  function ymd_hm(){
    const d = new Date();
    const pad = (n)=> String(n).padStart(2,"0");
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
  function safeName(name){
    return (name || "pdf").replace(/[\\\/:*?"<>|]+/g, "_");
  }
  function buildOutputName(prefix){
    if(state.files.length === 1){
      const base = state.files[0].name.replace(/\.pdf$/i, "");
      return `${safeName(base)}_${prefix}.pdf`;
    }
    return `pdf-page-tools-mini_${prefix}_${ymd_hm()}.pdf`;
  }
  function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=> URL.revokeObjectURL(url), 2000);
  }

  // ---------------- Extract parsing ----------------
  function parseRangeText(text, max){
    const raw = String(text || "").trim();
    if(raw.length === 0) return { ok:false };

    const s = raw.replace(/\s+/g, "");
    if(!/^[0-9,\-]+$/.test(s)) return { ok:false };

    const parts = s.split(",").filter(Boolean);
    if(parts.length === 0) return { ok:false };

    const out = [];
    const seen = new Set();

    for(const part of parts){
      if(part.includes("-")){
        const seg = part.split("-");
        if(seg.length !== 2) return { ok:false };
        const a = seg[0], b = seg[1];
        if(a === "" || b === "") return { ok:false };

        const start = Number(a), end = Number(b);
        if(!Number.isInteger(start) || !Number.isInteger(end)) return { ok:false };
        if(start < 1 || end < 1) return { ok:false };
        if(start > end) return { ok:false };
        if(start > max || end > max) return { ok:false };

        for(let i=start;i<=end;i++){
          if(!seen.has(i)){ seen.add(i); out.push(i); }
        }
      }else{
        const n = Number(part);
        if(!Number.isInteger(n)) return { ok:false };
        if(n < 1 || n > max) return { ok:false };
        if(!seen.has(n)){ seen.add(n); out.push(n); }
      }
    }

    if(out.length === 0) return { ok:false };
    return { ok:true, list: out };
  }

  function syncExtractUI(){
    if(!els.btnExtract || !els.extractRange) return;
    if(isBusy || state.pages.length === 0){ els.btnExtract.disabled = true; return; }
    const r = parseRangeText(els.extractRange.value, state.pages.length);
    els.btnExtract.disabled = !r.ok;
  }
  if(els.extractRange){
    els.extractRange.addEventListener("input", syncExtractUI);
    els.extractRange.addEventListener("change", syncExtractUI);
  }

  // ---------------- export core ----------------
  async function exportPagesToPdf(pagesToExport, filename){
    if(!window.PDFLib || !window.PDFLib.PDFDocument){
      showError("missing_pdflib");
      return { ok:false, code:"missing_pdflib" };
    }
    const { PDFDocument, degrees } = window.PDFLib;

    const out = await PDFDocument.create();
    const loaded = new Map(); // fileId -> PDFDocument

    for(const p of pagesToExport){
      let srcDoc = loaded.get(p.fileId);
      if(!srcDoc){
        const f = state.files.find(x => x.id === p.fileId);
        if(!f) continue;
        srcDoc = await PDFDocument.load(f.buffer);
        loaded.set(p.fileId, srcDoc);
      }

      const idx0 = Math.max(0, (p.srcPage|0) - 1);
      const copied = await out.copyPages(srcDoc, [idx0]);
      const page = copied[0];

      const rot = ((p.rotation % 360) + 360) % 360;
      if(rot !== 0) page.setRotation(degrees(rot));
      out.addPage(page);
    }

    if(out.getPageCount() === 0){
      showError("empty_result");
      return { ok:false, code:"empty_result" };
    }

    const bytes = await out.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    downloadBlob(blob, filename);
    return { ok:true };
  }

  async function exportCurrentPdf(){
    if(isBusy) return;
    if(state.pages.length === 0){ showError("empty_result"); return; }

    setBusy(true);
    hideStatus();
    showStatus(msg("処理中…（PDFを書き出しています）", "Processing… (exporting PDF)"));

    try{
      const r = await exportPagesToPdf(state.pages, buildOutputName("edited"));
      if(r.ok){
        showStatus(msg("保存しました。ダウンロードを確認してください。", "Saved. Check your downloads."));
      }
    }catch(err){
      console.error(err);
      showError("too_large_or_memory");
    }finally{
      setBusy(false);
    }
  }
  if(els.btnSave) els.btnSave.addEventListener("click", exportCurrentPdf);

  async function exportExtractedPdf(){
    if(isBusy) return;
    if(state.pages.length === 0){ showError("empty_result"); return; }

    const r0 = parseRangeText(els.extractRange ? els.extractRange.value : "", state.pages.length);
    if(!r0.ok){ showError("extract_syntax_error"); return; }

    const pagesToExport = r0.list.map(i => state.pages[i-1]).filter(Boolean);
    if(pagesToExport.length === 0){ showError("empty_result"); return; }

    setBusy(true);
    hideStatus();
    showStatus(msg("処理中…（抽出してPDFを書き出しています）", "Processing… (extracting PDF)"));

    try{
      const r = await exportPagesToPdf(pagesToExport, buildOutputName("extracted"));
      if(r.ok){
        showStatus(msg("抽出して保存しました。ダウンロードを確認してください。", "Extracted and saved. Check your downloads."));
      }
    }catch(err){
      console.error(err);
      showError("too_large_or_memory");
    }finally{
      setBusy(false);
    }
  }
  if(els.btnExtract) els.btnExtract.addEventListener("click", exportExtractedPdf);

  // ---------------- actions: load PDFs ----------------
  function openPicker(){
    if(!els.fileInput || isBusy) return;
    els.fileInput.value = "";
    els.fileInput.click();
  }
  if(els.btnPick) els.btnPick.addEventListener("click", openPicker);
  if(els.btnAddMore) els.btnAddMore.addEventListener("click", openPicker);

  function onDragOver(e){
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if(els.dropzone) els.dropzone.classList.add("is-dragover");
  }
  function onDragLeave(){
    if(els.dropzone) els.dropzone.classList.remove("is-dragover");
  }
  async function onDrop(e){
    e.preventDefault();
    onDragLeave();
    if(isBusy) return;
    const dt = e.dataTransfer;
    if(!dt) return;
    const files = Array.from(dt.files || []);
    await handleFiles(files);
  }

  if(els.dropzone){
    els.dropzone.addEventListener("dragover", onDragOver);
    els.dropzone.addEventListener("dragleave", onDragLeave);
    els.dropzone.addEventListener("drop", onDrop);
    els.dropzone.addEventListener("click", openPicker);
    els.dropzone.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); }
    });
  }

  if(els.fileInput){
    els.fileInput.addEventListener("change", async () => {
      const files = els.fileInput.files ? Array.from(els.fileInput.files) : [];
      await handleFiles(files);
    });
  }

  async function handleFiles(files){
    if(!files || files.length === 0) return;

    const pdfs = files.filter(isPdfLike);
    if(pdfs.length === 0){ showError("unsupported_file"); return; }
    if(!window.pdfjsLib){ showError("missing_pdfjs"); return; }

    setBusy(true);
    hideStatus();

    try{
      for(const f of pdfs){
        await addOnePdfFile(f);
      }
      clearUndo();
      renderFileList();
      renderPageList();
      syncEditorEnabled();
      showStatus(msg("読み込み完了。ページを編集して保存できます。", "Loaded. You can edit pages and download."));
    }catch(err){
      console.error(err);
      showError("too_large_or_memory");
    }finally{
      setBusy(false);
    }
  }

  async function addOnePdfFile(file){
    const buf = await file.arrayBuffer();

    const loadingTask = window.pdfjsLib.getDocument({ data: buf });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    const fileId = uid("f");
    state.files.push({
      id: fileId,
      name: file.name,
      size: file.size,
      buffer: buf,
      pageCount,
      pdfDocPromise: Promise.resolve(pdf)
    });

    for(let i=1;i<=pageCount;i++){
      state.pages.push({
        id: uid("p"),
        fileId,
        fileName: file.name,
        srcPage: i,
        rotation: 0,
        thumbUrl: null
      });
    }
  }

  function removeFile(fileId){
    if(isBusy) return;
    clearUndo();

    state.pages = state.pages.filter(p => p.fileId !== fileId);
    state.files = state.files.filter(f => f.id !== fileId);

    renderFileList();
    renderPageList();
    syncEditorEnabled();

    showStatus(state.files.length === 0 ? msg("すべてクリアしました。", "Cleared.") : msg("このPDFを外しました。", "Removed the PDF."));
  }

  function movePage(from, to){
    if(isBusy) return;
    if(to < 0 || to >= state.pages.length) return;

    const [x] = state.pages.splice(from, 1);
    state.pages.splice(to, 0, x);

    renderPageList();
    scheduleThumbScan();
    syncExtractUI();
  }

  if(els.btnReset){
    els.btnReset.addEventListener("click", () => {
      if(isBusy) return;
      clearUndo();

      state.files = [];
      state.pages = [];
      renderFileList();
      renderPageList();
      setEditorEnabled(false);

      if(els.extractRange) els.extractRange.value = "";
      syncExtractUI();

      showStatus(msg("リセットしました。PDFを追加してください。", "Reset. Please add PDFs."));
    });
  }

  // init
  applyLang(currentLang);
  renderFileList();
  renderPageList();
  syncUndoUI();
  syncExtractUI();
})();
