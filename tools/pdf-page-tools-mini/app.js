/* PDF Page Tools Mini - browser-only PDF page editor */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const els = {
    langBtns: $$(".nw-lang-switch button"),
    i18nNodes: $$("[data-i18n]"),
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
    rangeFeedback: $("#rangeFeedback"),
    btnExtract: $("#btnExtract"),
    fileList: $("#fileList"),
    pageList: $("#pageList"),
    summaryBox: $("#summaryBox"),
    statusBox: $("#statusBox"),
    statusText: $("#statusText"),
    btnStatusClose: $("#btnStatusClose"),
  };

  const state = { files: [], pages: [], nextId: 1 };
  const undo = { lastDelete: null };
  let isBusy = false;
  let currentLang = ((navigator.language || "").toLowerCase().startsWith("ja")) ? "ja" : "en";
  let thumbObserver = null;

  const ERR = {
    unsupported_file: { ja: "このファイルはPDFとして読み込めませんでした。別のPDFを試してください。", en: "This file could not be read as a PDF. Please try another PDF." },
    too_large_or_memory: { ja: "処理に失敗しました。ページ数を減らす、先に分割する、PCブラウザや別ブラウザで試してください。", en: "Processing failed. Reduce pages, split the PDF first, or try a desktop browser or another browser." },
    extract_syntax_error: { ja: "範囲の書き方が正しくありません。例: 1-3,5,8-10", en: "Range format is invalid. Example: 1-3,5,8-10" },
    empty_result: { ja: "出力するページがありません。削除を戻すか、PDFを追加してください。", en: "No pages to export. Undo deletion or add PDFs." },
    missing_pdfjs: { ja: "PDF表示ライブラリ（pdf.js）の読み込みに失敗しました。ページを再読み込みしてください。", en: "PDF display library (pdf.js) failed to load. Please reload this page." },
    missing_pdflib: { ja: "PDF書き出しライブラリ（pdf-lib）が読み込めませんでした。ページを再読み込みしてください。", en: "PDF export library (pdf-lib) failed to load. Please reload this page." },
    protected_or_special_pdf: { ja: "このPDFは読み込めませんでした。保護されたPDF、破損PDF、一部の特殊PDFは非対応です。", en: "This PDF could not be loaded. Protected, corrupted, or some special PDFs are not supported." }
  };

  function uid(prefix){ return `${prefix}-${state.nextId++}`; }
  function msg(ja, en){ return currentLang === "ja" ? ja : en; }
  function showStatus(text){
    if(!els.statusBox || !els.statusText) return;
    els.statusText.textContent = text;
    els.statusBox.hidden = false;
  }
  function hideStatus(){ if(els.statusBox) els.statusBox.hidden = true; }
  function showError(code){
    const e = ERR[code] || ERR.too_large_or_memory;
    showStatus(currentLang === "ja" ? e.ja : e.en);
  }
  function isProtectionError(err){
    const name = String(err && err.name || "").toLowerCase();
    const message = String(err && err.message || "").toLowerCase();
    return name.includes("password") || name.includes("encrypted") || message.includes("password") || message.includes("encrypted");
  }
  function sleep(ms){ return new Promise((resolve) => setTimeout(resolve, ms)); }
  async function waitForLib(check, ms){
    const start = Date.now();
    while(Date.now() - start < ms){
      if(check()) return true;
      await sleep(40);
    }
    return !!check();
  }
  function formatBytes(bytes){
    const n = Number(bytes || 0);
    if(n >= 1024 * 1024) return `${Math.round(n / 1024 / 1024)}MB`;
    if(n >= 1024) return `${Math.round(n / 1024)}KB`;
    return `${n}B`;
  }
  function shouldWarnFiles(files){
    const list = Array.from(files || []);
    const total = list.reduce((sum, f) => sum + (f.size || 0), 0);
    return list.some((f) => (f.size || 0) >= 30 * 1024 * 1024) || total >= 60 * 1024 * 1024 || list.length >= 6;
  }
  function confirmLargeFiles(files){
    const list = Array.from(files || []);
    const total = list.reduce((sum, f) => sum + (f.size || 0), 0);
    const text = msg(
      `大きいPDFまたは複数PDFです（合計 ${formatBytes(total)}）。端末によって読み込みや保存に失敗する場合があります。このまま続けますか？`,
      `Large or multiple PDFs selected (total ${formatBytes(total)}). Loading or saving may fail depending on your device. Continue?`
    );
    return window.confirm(text);
  }
  function confirmReset(){
    if(state.pages.length === 0) return true;
    return window.confirm(msg("読み込んだPDFと編集内容をクリアします。よろしいですか？", "Clear loaded PDFs and edits?"));
  }

  function applyLang(lang){
    currentLang = lang;
    document.documentElement.lang = lang;
    els.i18nNodes.forEach((el) => { el.style.display = el.dataset.i18n === lang ? "" : "none"; });
    els.langBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === lang));
    renderAll();
  }

  function safeName(name){ return String(name || "pdf").replace(/[\\/:*?"<>|]+/g, "_"); }
  function timestamp(){
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
  }
  function buildOutputName(kind){
    if(state.files.length === 1){
      const base = state.files[0].name.replace(/\.pdf$/i, "");
      return `${safeName(base)}_${kind}.pdf`;
    }
    return `pdf-page-tools-mini_${kind}_${timestamp()}.pdf`;
  }
  function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function updateSummary(){
    const box = els.summaryBox || $("#summaryBox");
    if(!box) return;
    const pdfCount = state.files.length;
    const pageCount = state.pages.length;
    const rotated = state.pages.filter((p) => ((p.rotation % 360) + 360) % 360 !== 0).length;
    const originalPages = state.files.reduce((sum, f) => sum + (f.pageCount || 0), 0);
    const deleted = Math.max(0, originalPages - pageCount);
    const totalSize = state.files.reduce((sum, f) => sum + (f.size || 0), 0);
    box.textContent = pageCount === 0
      ? msg("現在の出力予定：ページはありません。", "Current output: no pages.")
      : msg(
          `現在の出力予定：PDF数 ${pdfCount} / ページ数 ${pageCount} / 回転あり ${rotated} / 削除済み ${deleted} / 入力サイズ ${formatBytes(totalSize)}`,
          `Current output: ${pdfCount} PDF(s) / ${pageCount} page(s) / ${rotated} rotated / ${deleted} deleted / input ${formatBytes(totalSize)}`
        );
  }

  function updateRangeFeedback(){
    if(!els.rangeFeedback || !els.extractRange) return;
    const value = els.extractRange.value.trim();
    els.rangeFeedback.classList.remove("is-ok", "is-error");
    if(state.pages.length === 0){
      els.rangeFeedback.textContent = msg("PDFを追加すると範囲抽出を使えます。", "Add a PDF to use range extraction.");
      return;
    }
    if(!value){
      els.rangeFeedback.textContent = msg(`例: 1-3,5,8-10。現在のページ数は ${state.pages.length} です。`, `Example: 1-3,5,8-10. Current page count: ${state.pages.length}.`);
      return;
    }
    const parsed = parseRangeText(value, state.pages.length);
    if(parsed.ok){
      els.rangeFeedback.classList.add("is-ok");
      els.rangeFeedback.textContent = msg(`${parsed.list.length}ページを抽出します。`, `${parsed.list.length} page(s) will be extracted.`);
    }else{
      els.rangeFeedback.classList.add("is-error");
      els.rangeFeedback.textContent = msg(`範囲が正しくありません。1〜${state.pages.length} の範囲で指定してください。`, `Invalid range. Use page numbers from 1 to ${state.pages.length}.`);
    }
  }

  function setBusy(on){
    isBusy = on;
    if(els.loading) els.loading.hidden = !on;
    syncUi();
  }
  function syncUi(){
    const hasPages = state.pages.length > 0;
    if(els.btnPick) els.btnPick.disabled = isBusy;
    if(els.btnAddMore) els.btnAddMore.disabled = isBusy;
    if(els.btnReset) els.btnReset.disabled = isBusy || !hasPages;
    if(els.btnSave) els.btnSave.disabled = isBusy || !hasPages;
    if(els.extractRange) els.extractRange.disabled = isBusy || !hasPages;
    if(els.btnUndo) els.btnUndo.disabled = isBusy || !undo.lastDelete;
    syncExtractUi();
    if(els.panelAfterLoad){
      els.panelAfterLoad.hidden = !hasPages;
      els.panelAfterLoad.classList.toggle("is-disabled", !hasPages);
      els.panelAfterLoad.classList.toggle("is-busy", isBusy);
      els.panelAfterLoad.setAttribute("aria-disabled", hasPages ? "false" : "true");
      els.panelAfterLoad.setAttribute("aria-busy", isBusy ? "true" : "false");
    }
    updateSummary();
    updateRangeFeedback();
  }

  function isPdfLike(file){
    const name = (file.name || "").toLowerCase();
    const type = (file.type || "").toLowerCase();
    return type === "application/pdf" || name.endsWith(".pdf");
  }

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
    for(const f of state.files){
      const li = document.createElement("li");
      li.className = "file-item";
      const left = document.createElement("div");
      left.className = "file-left";
      left.textContent = `${f.name} (${f.pageCount}p / ${formatBytes(f.size)})`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "file-remove";
      btn.textContent = msg("×このPDFを外す", "Remove");
      btn.addEventListener("click", () => removeFile(f.id));
      li.append(left, btn);
      els.fileList.appendChild(li);
    }
  }

  function renderPageList(){
    if(!els.pageList) return;
    els.pageList.innerHTML = "";
    if(state.pages.length === 0){
      const div = document.createElement("div");
      div.className = "muted";
      div.textContent = msg("（ページがありません）", "(No pages)");
      els.pageList.appendChild(div);
      updateSummary();
      return;
    }
    state.pages.forEach((page, index) => {
      const card = document.createElement("div");
      card.className = "page-card";
      card.dataset.pageId = page.id;
      if(canDrag()) card.draggable = true;
      const top = document.createElement("div");
      top.className = "page-top";
      top.textContent = `#${index + 1}  ${page.fileName}  p${page.srcPage}`;
      const thumb = document.createElement("div");
      thumb.className = "thumb-box thumb-loading";
      const img = document.createElement("img");
      img.alt = msg("PDFページのサムネイル", "PDF page thumbnail");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = page.thumbUrl || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.style.transform = `rotate(${page.rotation}deg)`;
      img.style.transformOrigin = "center center";
      thumb.appendChild(img);
      const meta = document.createElement("div");
      meta.className = "page-meta";
      meta.textContent = msg(`回転: ${page.rotation}°`, `Rotation: ${page.rotation}°`);
      const ops = document.createElement("div");
      ops.className = "page-ops";
      ops.append(
        opButton("⟲", "Rotate -90", () => rotatePage(index, -90)),
        opButton("⟳", "Rotate +90", () => rotatePage(index, 90)),
        opButton("🗑", msg("削除", "Delete"), () => deletePageAt(index), "danger"),
        opButton(msg("↑ 上へ", "↑ Up"), msg("上へ", "Up"), () => movePage(index, index - 1)),
        opButton(msg("↓ 下へ", "↓ Down"), msg("下へ", "Down"), () => movePage(index, index + 1))
      );
      card.append(top, thumb, meta, ops);
      attachDnd(card, index);
      els.pageList.appendChild(card);
    });
    observeThumbs();
    updateSummary();
  }

  function opButton(text, title, handler, extraClass){
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = extraClass ? `op ${extraClass}` : "op";
    btn.textContent = text;
    btn.title = title;
    btn.addEventListener("click", handler);
    return btn;
  }
  function canDrag(){ try{ return window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch(_){ return false; } }
  function attachDnd(card, index){
    if(!canDrag()) return;
    card.classList.add("dnd");
    card.addEventListener("dragstart", (e) => { if(isBusy) return; card.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(index)); });
    card.addEventListener("dragend", () => { card.classList.remove("dragging"); $$(".page-card.dragover").forEach((el) => el.classList.remove("dragover")); });
    card.addEventListener("dragover", (e) => { if(isBusy) return; e.preventDefault(); card.classList.add("dragover"); });
    card.addEventListener("dragleave", () => card.classList.remove("dragover"));
    card.addEventListener("drop", (e) => { if(isBusy) return; e.preventDefault(); card.classList.remove("dragover"); const from = Number(e.dataTransfer.getData("text/plain")); if(Number.isInteger(from)) movePage(from, index); });
  }

  function observeThumbs(){
    if(!els.pageList || !window.IntersectionObserver) return;
    if(thumbObserver) thumbObserver.disconnect();
    thumbObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if(!entry.isIntersecting) return;
        thumbObserver.unobserve(entry.target);
        const page = state.pages.find((p) => p.id === entry.target.dataset.pageId);
        if(page) renderThumb(page, entry.target);
      });
    }, { rootMargin: "200px 0px", threshold: 0.01 });
    $$(".page-card[data-page-id]", els.pageList).forEach((card) => thumbObserver.observe(card));
  }

  async function renderThumb(page, card){
    if(page.thumbUrl){
      const img = $("img", card);
      if(img) img.src = page.thumbUrl;
      card.classList.remove("thumb-loading");
      return;
    }
    try{
      if(!window.pdfjsLib) return;
      const file = state.files.find((f) => f.id === page.fileId);
      if(!file) return;
      if(!file.pdfDocPromise){ file.pdfDocPromise = window.pdfjsLib.getDocument({ data: new Uint8Array(file.pdfBuffer.slice(0)) }).promise; }
      const pdf = await file.pdfDocPromise;
      const pdfPage = await pdf.getPage(page.srcPage);
      const viewportBase = pdfPage.getViewport({ scale: 1 });
      const scale = Math.min(1, 180 / Math.max(1, viewportBase.width));
      const viewport = pdfPage.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: false });
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await pdfPage.render({ canvasContext: ctx, viewport }).promise;
      page.thumbUrl = canvas.toDataURL("image/jpeg", 0.72);
      const img = $("img", card);
      if(img) img.src = page.thumbUrl;
    }catch(err){ console.warn("thumbnail failed", err); }
    finally{ card.classList.remove("thumb-loading"); }
  }

  function renderAll(){ renderFileList(); renderPageList(); syncUi(); }
  function rotatePage(index, delta){ if(isBusy) return; const page = state.pages[index]; if(!page) return; page.rotation = (page.rotation + delta + 360) % 360; renderPageList(); syncExtractUi(); }
  function movePage(from, to){ if(isBusy || from === to || to < 0 || to >= state.pages.length) return; const [page] = state.pages.splice(from, 1); state.pages.splice(to, 0, page); renderPageList(); showStatus(msg("並べ替えました。", "Reordered.")); }
  function deletePageAt(index){ if(isBusy || index < 0 || index >= state.pages.length) return; const [page] = state.pages.splice(index, 1); undo.lastDelete = { page: { ...page }, index }; renderPageList(); syncUi(); showStatus(msg("ページを削除しました。Undo（1回）で戻せます。", "Page deleted. You can undo once.")); }
  function undoDelete(){ if(isBusy || !undo.lastDelete) return; const insertAt = Math.max(0, Math.min(undo.lastDelete.index, state.pages.length)); state.pages.splice(insertAt, 0, undo.lastDelete.page); undo.lastDelete = null; renderPageList(); syncUi(); showStatus(msg("Undoしました（直前の削除を戻しました）。", "Undo complete (restored last deleted page).")); }
  function removeFile(fileId){
    if(isBusy) return;
    const removed = state.files.find((f) => f.id === fileId);
    if(removed && removed.pdfDocPromise){ removed.pdfDocPromise.then((pdf) => pdf && pdf.destroy && pdf.destroy()).catch(() => {}); }
    state.files = state.files.filter((f) => f.id !== fileId);
    state.pages = state.pages.filter((p) => p.fileId !== fileId);
    undo.lastDelete = null;
    renderAll();
    showStatus(state.files.length ? msg("このPDFを外しました。", "Removed the PDF.") : msg("すべてクリアしました。", "Cleared."));
  }
  function resetAll(){
    if(isBusy) return;
    if(!confirmReset()) return;
    state.files.forEach((f) => { if(f.pdfDocPromise) f.pdfDocPromise.then((pdf) => pdf && pdf.destroy && pdf.destroy()).catch(() => {}); });
    state.files = [];
    state.pages = [];
    undo.lastDelete = null;
    if(els.extractRange) els.extractRange.value = "";
    hideStatus();
    renderAll();
    showStatus(msg("リセットしました。PDFを追加してください。", "Reset. Please add PDFs."));
  }

  function parseRangeText(text, max){
    const s = String(text || "").replace(/\s+/g, "");
    if(!s || !/^[0-9,\-]+$/.test(s)) return { ok:false };
    const out = [];
    const seen = new Set();
    for(const part of s.split(",").filter(Boolean)){
      if(part.includes("-")){
        const bits = part.split("-");
        if(bits.length !== 2 || !bits[0] || !bits[1]) return { ok:false };
        const a = Number(bits[0]); const b = Number(bits[1]);
        if(!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1 || a > b || b > max) return { ok:false };
        for(let n = a; n <= b; n++){ if(!seen.has(n)){ seen.add(n); out.push(n); } }
      }else{
        const n = Number(part);
        if(!Number.isInteger(n) || n < 1 || n > max) return { ok:false };
        if(!seen.has(n)){ seen.add(n); out.push(n); }
      }
    }
    return out.length ? { ok:true, list:out } : { ok:false };
  }
  function syncExtractUi(){
    if(!els.btnExtract || !els.extractRange) return;
    if(isBusy || state.pages.length === 0){ els.btnExtract.disabled = true; updateRangeFeedback(); return; }
    const value = els.extractRange.value.trim();
    els.btnExtract.disabled = !value || !parseRangeText(value, state.pages.length).ok;
    updateRangeFeedback();
  }

  async function addFiles(files){
    const incoming = Array.from(files || []);
    if(incoming.length === 0) return;
    const pdfs = incoming.filter(isPdfLike);
    if(pdfs.length === 0){ showError("unsupported_file"); return; }
    if(shouldWarnFiles(pdfs) && !confirmLargeFiles(pdfs)) return;
    const ready = await waitForLib(() => window.pdfjsLib && window.pdfjsLib.getDocument, 1600);
    if(!ready){ showError("missing_pdfjs"); return; }
    setBusy(true);
    hideStatus();
    try{
      for(const file of pdfs){ await addOnePdf(file); }
      undo.lastDelete = null;
      renderAll();
      showStatus(msg("読み込み完了。ページを編集して保存できます。", "Loaded. You can edit pages and download."));
    }catch(err){ console.error(err); showError(isProtectionError(err) ? "protected_or_special_pdf" : "too_large_or_memory"); }
    finally{ setBusy(false); }
  }
  async function addOnePdf(file){
    const exportBuffer = await file.arrayBuffer();
    const pdfBuffer = exportBuffer.slice(0);
    let pdf;
    try{ pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise; }
    catch(err){ console.error(err); throw err; }
    const fileId = uid("f");
    state.files.push({ id:fileId, name:file.name, size:file.size, exportBuffer, pdfBuffer, pageCount:pdf.numPages, pdfDocPromise:Promise.resolve(pdf) });
    for(let p = 1; p <= pdf.numPages; p++){ state.pages.push({ id:uid("p"), fileId, fileName:file.name, srcPage:p, rotation:0, thumbUrl:null }); }
  }

  async function exportPagesToPdf(pages, filename){
    const ready = await waitForLib(() => window.PDFLib && window.PDFLib.PDFDocument, 1600);
    if(!ready){ showError("missing_pdflib"); return false; }
    if(!pages || pages.length === 0){ showError("empty_result"); return false; }
    const { PDFDocument, degrees } = window.PDFLib;
    const out = await PDFDocument.create();
    const loaded = new Map();
    for(const pageInfo of pages){
      let srcDoc = loaded.get(pageInfo.fileId);
      if(!srcDoc){
        const file = state.files.find((f) => f.id === pageInfo.fileId);
        if(!file) continue;
        srcDoc = await PDFDocument.load(file.exportBuffer.slice(0));
        loaded.set(pageInfo.fileId, srcDoc);
      }
      const [copiedPage] = await out.copyPages(srcDoc, [Math.max(0, pageInfo.srcPage - 1)]);
      const rot = ((pageInfo.rotation % 360) + 360) % 360;
      if(rot !== 0) copiedPage.setRotation(degrees(rot));
      out.addPage(copiedPage);
    }
    if(out.getPageCount() === 0){ showError("empty_result"); return false; }
    const bytes = await out.save();
    downloadBlob(new Blob([bytes], { type: "application/pdf" }), filename);
    return true;
  }
  async function saveCurrent(){
    if(isBusy) return;
    const filename = buildOutputName("edited");
    setBusy(true);
    hideStatus();
    showStatus(msg("処理中…（PDFを書き出しています）", "Processing… (exporting PDF)"));
    try{
      const ok = await exportPagesToPdf(state.pages, filename);
      if(ok) showStatus(msg(`保存しました：${filename}。元のPDFは変更されていません。ダウンロードフォルダを確認してください。`, `Saved: ${filename}. Original PDFs were not changed. Check your downloads folder.`));
    }catch(err){ console.error(err); showError("too_large_or_memory"); }
    finally{ setBusy(false); }
  }
  async function saveExtracted(){
    if(isBusy) return;
    const parsed = parseRangeText(els.extractRange ? els.extractRange.value : "", state.pages.length);
    if(!parsed.ok){ showError("extract_syntax_error"); updateRangeFeedback(); return; }
    const pages = parsed.list.map((n) => state.pages[n - 1]).filter(Boolean);
    const filename = buildOutputName("extracted");
    setBusy(true);
    hideStatus();
    showStatus(msg("処理中…（抽出してPDFを書き出しています）", "Processing… (extracting PDF)"));
    try{
      const ok = await exportPagesToPdf(pages, filename);
      if(ok) showStatus(msg(`抽出して保存しました：${filename}。元のPDFは変更されていません。`, `Extracted and saved: ${filename}. Original PDFs were not changed.`));
    }catch(err){ console.error(err); showError("too_large_or_memory"); }
    finally{ setBusy(false); }
  }

  function openPicker(){ if(isBusy || !els.fileInput) return; els.fileInput.value = ""; els.fileInput.click(); }

  els.langBtns.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
  if(els.btnStatusClose) els.btnStatusClose.addEventListener("click", hideStatus);
  if(els.btnPick) els.btnPick.addEventListener("click", openPicker);
  if(els.btnAddMore) els.btnAddMore.addEventListener("click", openPicker);
  if(els.btnReset) els.btnReset.addEventListener("click", resetAll);
  if(els.btnUndo) els.btnUndo.addEventListener("click", undoDelete);
  if(els.btnSave) els.btnSave.addEventListener("click", saveCurrent);
  if(els.btnExtract) els.btnExtract.addEventListener("click", saveExtracted);
  if(els.extractRange) els.extractRange.addEventListener("input", syncExtractUi);
  if(els.fileInput) els.fileInput.addEventListener("change", () => addFiles(els.fileInput.files));
  if(els.dropzone){
    els.dropzone.addEventListener("click", (e) => { if(!(e.target && e.target.closest("button"))) openPicker(); });
    els.dropzone.addEventListener("keydown", (e) => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openPicker(); } });
    els.dropzone.addEventListener("dragover", (e) => { e.preventDefault(); els.dropzone.classList.add("is-dragover"); e.dataTransfer.dropEffect = "copy"; });
    els.dropzone.addEventListener("dragleave", () => els.dropzone.classList.remove("is-dragover"));
    els.dropzone.addEventListener("drop", (e) => { e.preventDefault(); els.dropzone.classList.remove("is-dragover"); addFiles(e.dataTransfer ? e.dataTransfer.files : []); });
  }

  if(els.loading) els.loading.hidden = true;
  applyLang(currentLang);
  renderAll();
})();
