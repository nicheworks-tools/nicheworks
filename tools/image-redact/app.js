// tools/image-redact/app.js
(function () {
  "use strict";

  // --- helpers ---
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
  function dpr() { return Math.max(1, window.devicePixelRatio || 1); }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function uid() { return "m_" + Date.now().toString(16) + "_" + Math.random().toString(16).slice(2); }
  function pad2(n){ return (n<10?"0":"")+n; }
  function timestampName(){
    var dt=new Date();
    return dt.getFullYear()+pad2(dt.getMonth()+1)+pad2(dt.getDate())+"-"+pad2(dt.getHours())+pad2(dt.getMinutes())+pad2(dt.getSeconds());
  }
  function deepClone(obj){
    try { return JSON.parse(JSON.stringify(obj)); } catch(e){ return null; }
  }
  function isLikelyTouch(){
    return (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || ("ontouchstart" in window);
  }
  function fmtInt(n){
    try { return new Intl.NumberFormat().format(n); } catch(_) { return String(n); }
  }

  // --- Safety defaults (blur/pixelate can be weak) ---
  var SAFETY = {
    recommendStrength: 16,
    minBlur: 6,
    minPixel: 8,
    maxStrength: 32
  };

  // --- R08: performance/limits ---
  // Strategy:
  // - If image exceeds MAX_EDIT_MP or MAX_DIM, offer auto-downscale for editing/export to avoid crashes
  // - Always keep browser-local (no upload)
  // - Export stays full-res when safe; otherwise export is downscaled with explicit notice
  // R10: touch-safety
  // R11: mask constraints / snap
  var MASK_RULES = {
    MIN_SIZE: 12,      // px in image-space
    SNAP_PX: 8         // px in image-space
  };

  var TOUCH_SAFETY = {
    LONGPRESS_MS: 280,     // long-press to start creating a mask (touch)
    MOVE_TOL_PX: 10        // cancel long-press if finger moves
  };

  var LIMITS = {
    MAX_DIM: 9000,           // hard guard (either side)
    MAX_EDIT_MP: 24,         // editing target (downscale suggestion)
    HARD_MAX_MP: 60,         // hard guard (refuse if beyond; can be tuned)
    PREVIEW_MAX_W: 900,      // preview render width cap
    BLUR_PAD_PX: 24          // extra pad around blur region to reduce edge artifacts
  };

  // --- i18n ---
  var langButtons = $all(".nw-lang-switch button");
  var i18nNodes = $all("[data-i18n]");
  var browserLang = (navigator.language || "").toLowerCase();
  var currentLang = browserLang.startsWith("ja") ? "ja" : "en";
  function t(ja, en){ return currentLang === "ja" ? ja : en; }

  // --- elements ---
  var els = {
    fileInput: $("#fileInput"),
    dropZone: $("#dropZone"),

    canvas: $("#canvas"),
    canvasWrap: $(".canvas-wrap"),

    emptyHintJa: $("#emptyHint"),
    emptyHintEn: $("#emptyHintEn"),

    btnFit: $("#btnFit"),
    btn100: $("#btn100"),
    btnZoomOut: $("#btnZoomOut"),
    btnZoomIn: $("#btnZoomIn"),
    zoomRange: $("#zoomRange"),
    zoomLabel: $("#zoomLabel"),

    modeAdd: $("#modeAdd"),
    modeEdit: $("#modeEdit"),
    modePan: $("#modePan"),

    maskTypeRadios: $all('input[name="maskType"]'),
    strengthRange: $("#strengthRange"),
    strengthLabel: $("#strengthLabel"),

    btnDeleteMask: $("#btnDeleteMask"),
    btnDuplicateMask: $("#btnDuplicateMask"),
    btnClearMasks: $("#btnClearMasks"),
    btnClearAll: $("#btnClearAll"),

    maskChips: $("#maskChips"),
    maskCount: $("#maskCount"),

    modal: $("#previewModal"),
    btnPreview: $("#btnPreview"),
    closePreview: $("#btnClosePreview"),
    btnExport: $("#btnExport"),
    btnDownload: $("#btnDownload"),
    downloadLink: $("#downloadLink"),
    previewCanvas: $("#previewCanvas")
  };

  // --- state ---
  var state = {
    hasImage: false,
    imgBitmap: null,
    imgW: 0,
    imgH: 0,

    // R08: original dimensions (before downscale)
    origW: 0,
    origH: 0,
    downscaleApplied: false,
    editScale: 1, // imgW/imgOrigW (if downscaled)
    exportScale: 1, // export final scale relative to current img (usually 1)

    viewScale: 1,
    viewTx: 0,
    viewTy: 0,

    masks: [],
    activeId: null,

    mode: "add",
    currentType: "solid", // default safest
    currentStrength: SAFETY.recommendStrength,

    drag: null,

    lastExportBlobUrl: null,

    history: [],
    historyMax: 20,

    // R09: keyboard nudge session
    lastNudgeTs: 0,

    // R10: long-press create (touch)
    lpTimer: null,
    lpStartCss: null,
    lpPointerId: null,
    lpTriggered: false,

    // R11: preview zoom state
    previewZoom: 1,
    previewSource: null,

    spacePan: { active:false, prevMode:null },

    pointers: new Map(),
    gesture: null,
    touch: isLikelyTouch()
  };

  // --- UI helpers ---
  function setHintsVisible(visible) {
    if (els.emptyHintJa) els.emptyHintJa.style.display = visible && currentLang === "ja" ? "" : "none";
    if (els.emptyHintEn) els.emptyHintEn.style.display = visible && currentLang === "en" ? "" : "none";
  }

  function setZoomUIFromScale(scale) {
    var pct = Math.round(scale * 100);
    pct = clamp(pct, 25, 400);
    if (els.zoomRange) els.zoomRange.value = String(pct);
    if (els.zoomLabel) els.zoomLabel.textContent = String(pct) + "%";
  }

  function normalizeStrengthForType(type, v) {
    var n = clamp(parseInt(v, 10) || SAFETY.recommendStrength, 1, SAFETY.maxStrength);
    if (type === "blur") n = Math.max(SAFETY.minBlur, n);
    if (type === "pixelate") n = Math.max(SAFETY.minPixel, n);
    n = clamp(n, 1, SAFETY.maxStrength);
    return n;
  }

  // --- warning UI (inline near strength) ---
  function ensureInlineWarning() {
    if (!els.strengthRange) return;
    var wrap = els.strengthRange.parentElement;
    if (!wrap) return;
    var w = wrap.querySelector("[data-weak-warning]");
    if (!w) {
      w = document.createElement("div");
      w.setAttribute("data-weak-warning","1");
      w.style.marginTop = "6px";
      w.style.padding = "8px 10px";
      w.style.borderRadius = "10px";
      w.style.border = "1px solid rgba(245,158,11,0.35)";
      w.style.background = "rgba(245,158,11,0.10)";
      w.style.color = "rgba(255,255,255,0.92)";
      w.style.fontSize = "12px";
      w.style.lineHeight = "1.35";
      w.style.display = "none";
      wrap.appendChild(w);
    }
    return w;
  }

  function getWeakMasks() {
    var weak = [];
    for (var i = 0; i < state.masks.length; i++) {
      var m = state.masks[i];
      if (m.type === "blur" || m.type === "pixelate") {
        var s = clamp(parseInt(m.strength || state.currentStrength || SAFETY.recommendStrength, 10) || SAFETY.recommendStrength, 0, SAFETY.maxStrength);
        if (s < SAFETY.recommendStrength) weak.push(m);
      }
    }
    return weak;
  }

  function updateWeakWarningInline() {
    var box = ensureInlineWarning();
    if (!box) return;

    var m = getActiveMask();
    var ttype = m ? m.type : state.currentType;
    var ss = m ? (m.strength || state.currentStrength) : state.currentStrength;

    var show = (ttype === "blur" || ttype === "pixelate") && (ss < SAFETY.recommendStrength);
    if (!show) { box.style.display = "none"; return; }

    box.textContent = t(
      "注意：強度が弱いと“ぼかしたつもり事故”が起きやすいです。推奨は " + SAFETY.recommendStrength + " 以上。",
      "Warning: Low strength can cause accidental exposure. Recommended: " + SAFETY.recommendStrength + "+."
    );
    box.style.display = "";
  }

  function updateStrengthLabel() {
    if (!els.strengthRange) return;
    var v = normalizeStrengthForType(state.currentType, els.strengthRange.value);
    state.currentStrength = v;
    if (els.strengthLabel) els.strengthLabel.textContent = String(v);

    var m = getActiveMask();
    if (m && (m.type === "blur" || m.type === "pixelate")) {
      m.strength = normalizeStrengthForType(m.type, v);
      render();
      renderMaskChips();
    }
    updateWeakWarningInline();
  }

  function setMode(mode) {
    state.mode = mode;
    if (els.modeAdd) els.modeAdd.classList.toggle("active", mode === "add");
    if (els.modeEdit) els.modeEdit.classList.toggle("active", mode === "edit");
    if (els.modePan) els.modePan.classList.toggle("active", mode === "pan");
    updateHelpHUD();
  }

  function setMaskCount() {
    if (els.maskCount) els.maskCount.textContent = String(state.masks.length);
  }

  function getActiveMask() {
    if (!state.activeId) return null;
    for (var i = 0; i < state.masks.length; i++) {
      if (state.masks[i].id === state.activeId) return state.masks[i];
    }
    return null;
  }

  // R09: bring active mask to front (top-most) to avoid accidental edits on hidden layers
  function bringToFront(id){
    if (!id) return;
    var idx = -1;
    for (var i=0;i<state.masks.length;i++) { if (state.masks[i].id === id) { idx=i; break; } }
    if (idx < 0) return;
    // already top-most
    if (idx === state.masks.length - 1) return;
    var m = state.masks.splice(idx, 1)[0];
    state.masks.push(m);
  }

  function setActive(id) {
    bringToFront(id);
    state.activeId = id;
    syncControlsFromActive();
    updateMaskInfoUI();
    renderMaskChips();
    render();
  }

  function syncControlsFromActive() {
    var m = getActiveMask();
    var ttype = m ? m.type : state.currentType;
    var ss = m ? (m.strength || state.currentStrength) : state.currentStrength;

    for (var i = 0; i < els.maskTypeRadios.length; i++) {
      els.maskTypeRadios[i].checked = (els.maskTypeRadios[i].value === ttype);
    }

    if (els.strengthRange) {
      var vv = normalizeStrengthForType(ttype, ss);
      els.strengthRange.value = String(vv);
      if (els.strengthLabel) els.strengthLabel.textContent = String(vv);
      state.currentStrength = vv;
    }
    state.currentType = ttype;
    updateWeakWarningInline();
  }

  // --- Undo ---
  function pushHistory(reason) {
    var snap = {
      reason: reason || "",
      masks: deepClone(state.masks) || [],
      activeId: state.activeId,
      currentType: state.currentType,
      currentStrength: state.currentStrength
    };
    state.history.push(snap);
    if (state.history.length > state.historyMax) state.history.shift();
    updateUndoButton();
  }
  function canUndo(){ return state.history && state.history.length > 0; }
  function undoOnce(){
    if (!canUndo()) return;
    var snap = state.history.pop();

    state.masks = deepClone(snap.masks) || [];
    state.activeId = snap.activeId || (state.masks.length ? state.masks[state.masks.length-1].id : null);
    state.currentType = snap.currentType || "solid";
    state.currentStrength = snap.currentStrength || SAFETY.recommendStrength;

    syncControlsFromActive();
    renderMaskChips();
    render();
    updateUndoButton();
  }

  // --- transforms ---
  function canvasRect() { return els.canvas.getBoundingClientRect(); }

  function screenToCanvasCss(e) {
    var r = canvasRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function canvasCssToImage(pt) {
    return {
      x: (pt.x - state.viewTx) / state.viewScale,
      y: (pt.y - state.viewTy) / state.viewScale
    };
  }

  function normRect(x1, y1, x2, y2) {
    var x = Math.min(x1, x2);
    var y = Math.min(y1, y2);
    var w = Math.abs(x2 - x1);
    var h = Math.abs(y2 - y1);
    return { x: x, y: y, w: w, h: h };
  }

  // R10: long-press helpers
  function clearLongPress(){
    if (state.lpTimer) { try { clearTimeout(state.lpTimer); } catch(_){} }
    state.lpTimer = null;
    state.lpStartCss = null;
    state.lpPointerId = null;
    state.lpTriggered = false;
  }

  // R11: snapping helpers
  function snapValue(v, target, tol){
    return (Math.abs(v - target) <= tol) ? target : v;
  }
  function snapMaskRect(m, excludeId){
    var tol = MASK_RULES.SNAP_PX;
    var x = m.x, y = m.y, w = m.w, h = m.h;
    var l = x, r = x + w, t0 = y, b = y + h;

    // snap to image bounds
    l = snapValue(l, 0, tol);
    t0 = snapValue(t0, 0, tol);
    r = snapValue(r, state.imgW, tol);
    b = snapValue(b, state.imgH, tol);

    // snap to other masks edges
    for (var i=0;i<state.masks.length;i++){
      var o = state.masks[i];
      if (!o || o.id === excludeId) continue;
      var ol=o.x, orr=o.x+o.w, ot=o.y, ob=o.y+o.h;
      l = snapValue(l, ol, tol);
      l = snapValue(l, orr, tol);
      r = snapValue(r, ol, tol);
      r = snapValue(r, orr, tol);
      t0 = snapValue(t0, ot, tol);
      t0 = snapValue(t0, ob, tol);
      b = snapValue(b, ot, tol);
      b = snapValue(b, ob, tol);
    }

    // rebuild
    x = Math.min(l, r);
    y = Math.min(t0, b);
    w = Math.abs(r - l);
    h = Math.abs(b - t0);
    // min size
    if (w < MASK_RULES.MIN_SIZE) w = MASK_RULES.MIN_SIZE;
    if (h < MASK_RULES.MIN_SIZE) h = MASK_RULES.MIN_SIZE;

    var rr = clampRectToImage({x:x,y:y,w:w,h:h});
    return rr;
  }

  function clampRectToImage(r) {
    var x = clamp(r.x, 0, state.imgW);
    var y = clamp(r.y, 0, state.imgH);
    var w = clamp(r.w, 0, state.imgW - x);
    var h = clamp(r.h, 0, state.imgH - y);
    return { x: x, y: y, w: w, h: h };
  }

  // --- canvas sizing ---
  function getCanvasCssWidth() {
    if (els.canvasWrap && els.canvasWrap.clientWidth) return els.canvasWrap.clientWidth;
    if (els.canvas && els.canvas.clientWidth) return els.canvas.clientWidth;
    return 800;
  }

  function resizeCanvasToImageAspect() {
    if (!els.canvas) return;
    var cw = getCanvasCssWidth();

    var chCss;
    if (!state.hasImage || !state.imgW || !state.imgH) {
      chCss = Math.round(cw * 9 / 16);
    } else {
      chCss = Math.round(cw * (state.imgH / state.imgW));
      chCss = clamp(chCss, 220, Math.round(window.innerHeight * 0.65));
    }

    var ratio = dpr();
    els.canvas.style.width = cw + "px";
    els.canvas.style.height = chCss + "px";
    els.canvas.width = Math.round(cw * ratio);
    els.canvas.height = Math.round(chCss * ratio);
  }

  function computeFitTransform() {
    if (!state.hasImage) return;
    var cwCss = parseFloat(els.canvas.style.width || els.canvas.clientWidth || 800);
    var chCss = parseFloat(els.canvas.style.height || els.canvas.clientHeight || 450);

    var s = Math.min(cwCss / state.imgW, chCss / state.imgH);
    s = clamp(s, 0.25, 4);

    state.viewScale = s;
    state.viewTx = (cwCss - state.imgW * s) / 2;
    state.viewTy = (chCss - state.imgH * s) / 2;

    setZoomUIFromScale(state.viewScale);
  }

  function compute100Transform() {
    if (!state.hasImage) return;
    var cwCss = parseFloat(els.canvas.style.width || els.canvas.clientWidth || 800);
    var chCss = parseFloat(els.canvas.style.height || els.canvas.clientHeight || 450);

    state.viewScale = 1;
    state.viewTx = (cwCss - state.imgW) / 2;
    state.viewTy = (chCss - state.imgH) / 2;

    setZoomUIFromScale(state.viewScale);
  }

  function applyZoomPercent(pct) {
    if (!state.hasImage) return;
    var s = clamp(pct / 100, 0.25, 4);

    var cwCss = parseFloat(els.canvas.style.width || els.canvas.clientWidth || 800);
    var chCss = parseFloat(els.canvas.style.height || els.canvas.clientHeight || 450);
    var cx = cwCss / 2;
    var cy = chCss / 2;

    var imgCx = (cx - state.viewTx) / state.viewScale;
    var imgCy = (cy - state.viewTy) / state.viewScale;

    state.viewScale = s;
    state.viewTx = cx - imgCx * s;
    state.viewTy = cy - imgCy * s;

    setZoomUIFromScale(state.viewScale);
  }

  // --- render (editor) ---
  function render() {
    if (!els.canvas) return;
    var ctx = els.canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);

    if (!state.hasImage || !state.imgBitmap) return;

    var ratio = dpr();
    ctx.setTransform(state.viewScale * ratio, 0, 0, state.viewScale * ratio, state.viewTx * ratio, state.viewTy * ratio);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(state.imgBitmap, 0, 0);

    for (var i = 0; i < state.masks.length; i++) {
      var m = state.masks[i];
      var isActive = (m.id === state.activeId);

      if (m.type === "solid") ctx.fillStyle = "rgba(0,0,0,0.55)";
      else if (m.type === "blur") ctx.fillStyle = "rgba(59,130,246,0.18)";
      else ctx.fillStyle = "rgba(245,158,11,0.18)";

      ctx.fillRect(m.x, m.y, m.w, m.h);

      ctx.strokeStyle = isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)";
      ctx.lineWidth = (isActive ? 2 : 1) / state.viewScale;
      ctx.strokeRect(m.x, m.y, m.w, m.h);

      if (isActive) drawHandles(ctx, m);
    }

    if (state.drag && state.drag.kind === "create") {
      var r = normRect(state.drag.startImg.x, state.drag.startImg.y, state.drag.nowImg.x, state.drag.nowImg.y);
      r = snapMaskRect(r, m.id);
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 2 / state.viewScale;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.restore();
      updateMaskInfoUI();
  }
    updateMaskInfoUI();
  }

  function drawHandles(ctx, m) {
    var handleCss = state.touch ? 18 : 10;
    var sizeImg = handleCss / state.viewScale;

    var x = m.x, y = m.y, w = m.w, h = m.h;
    var cx = x + w / 2;
    var cy = y + h / 2;

    var pts = [
      { x: x,  y: y },
      { x: cx, y: y },
      { x: x+w,y: y },
      { x: x+w,y: cy },
      { x: x+w,y: y+h },
      { x: cx, y: y+h },
      { x: x,  y: y+h },
      { x: x,  y: cy }
    ];

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 1 / state.viewScale;

    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      ctx.beginPath();
      ctx.rect(p.x - sizeImg/2, p.y - sizeImg/2, sizeImg, sizeImg);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- mask list UI ---
  // R11: active mask info panel
  function ensureMaskInfoUI(){
    if (!els.maskChips) return null;
    var parent = els.maskChips.parentElement;
    if (!parent) return null;
    var box = parent.querySelector('[data-mask-info]');
    if (!box) {
      box = document.createElement('div');
      box.setAttribute('data-mask-info','1');
      box.style.marginTop = '10px';
      box.style.padding = '10px 12px';
      box.style.borderRadius = '14px';
      box.style.border = '1px solid rgba(255,255,255,0.14)';
      box.style.background = 'rgba(255,255,255,0.06)';
      box.style.color = 'rgba(255,255,255,0.92)';
      box.style.fontSize = '12px';
      box.style.lineHeight = '1.45';
      parent.appendChild(box);
    }
    return box;
  }
  function updateMaskInfoUI(){
    var box = ensureMaskInfoUI();
    if (!box) return;
    var m = getActiveMask();
    if (!state.hasImage) {
      box.textContent = '';
      box.style.display = 'none';
      return;
    }
    box.style.display = '';
    if (!m) {
      box.textContent = t('選択中の領域：なし（チップをタップして選択）', 'Active mask: none (tap a chip to select)');
      return;
    }
    var idx = 0;
    for (var i=0;i<state.masks.length;i++){ if(state.masks[i].id===m.id){ idx=i+1; break; } }
    var s1 = (m.type==='blur'||m.type==='pixelate') ? (' / ' + t('強度','Strength') + ': ' + String(m.strength||state.currentStrength)) : '';
    box.textContent = (
      t('選択中','#') + idx + '  ' + m.type + s1 + '  |  ' +
      t('x','x') + ':' + Math.round(m.x) + ', ' + t('y','y') + ':' + Math.round(m.y) + '  |  ' +
      t('w','w') + ':' + Math.round(m.w) + ', ' + t('h','h') + ':' + Math.round(m.h)
    );
  }

  function renderMaskChips() {
    if (!els.maskChips) return;
    els.maskChips.innerHTML = "";

    for (var i = 0; i < state.masks.length; i++) {
      (function (m, idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m.id === state.activeId ? " active" : "");
        var label = "#" + (idx + 1) + " " + m.type;
        if (m.type === "blur" || m.type === "pixelate") label += " " + String(m.strength || SAFETY.recommendStrength);
        b.textContent = label;
        b.addEventListener("click", function () { setActive(m.id); });
        els.maskChips.appendChild(b);
      })(state.masks[i], i);
    }
    setMaskCount();
    updateUndoButton();
    updateMaskInfoUI();
  }

  // --- hit testing ---
  function pointInRect(px, py, r) {
    return px >= r.x && px <= (r.x + r.w) && py >= r.y && py <= (r.y + r.h);
  }

  function handleHit(m, imgPt) {
    var tolCss = state.touch ? 24 : 14;
    var tol = tolCss / state.viewScale;

    var x = m.x, y = m.y, w = m.w, h = m.h;
    var cx = x + w/2, cy = y + h/2;

    var hs = [
      { k: "nw", x: x,   y: y },
      { k: "n",  x: cx,  y: y },
      { k: "ne", x: x+w, y: y },
      { k: "e",  x: x+w, y: cy },
      { k: "se", x: x+w, y: y+h },
      { k: "s",  x: cx,  y: y+h },
      { k: "sw", x: x,   y: y+h },
      { k: "w",  x: x,   y: cy }
    ];

    for (var i = 0; i < hs.length; i++) {
      if (Math.abs(imgPt.x - hs[i].x) <= tol/2 && Math.abs(imgPt.y - hs[i].y) <= tol/2) return hs[i].k;
    }
    return null;
  }

  function hitTopmost(imgPt) {
    var a = getActiveMask();
    if (a) {
      var hk = handleHit(a, imgPt);
      if (hk) return { kind: "handle", id: a.id, handle: hk };
      if (pointInRect(imgPt.x, imgPt.y, a)) return { kind: "body", id: a.id };
    }

    for (var i = state.masks.length - 1; i >= 0; i--) {
      var m = state.masks[i];
      if (pointInRect(imgPt.x, imgPt.y, m)) {
        var hk2 = handleHit(m, imgPt);
        if (hk2) return { kind: "handle", id: m.id, handle: hk2 };
        return { kind: "body", id: m.id };
      }
    }
    return null;
  }

  // --- operations ---
  function newMaskFromDrag(a, b) {
    var r = normRect(a.x, a.y, b.x, b.y);
    r = clampRectToImage(r);
    if (r.w < MASK_RULES.MIN_SIZE || r.h < MASK_RULES.MIN_SIZE) return null;

    var ttype = state.currentType || "solid";
    var ss = normalizeStrengthForType(ttype, state.currentStrength || SAFETY.recommendStrength);

    var mask = { id: uid(), x: r.x, y: r.y, w: r.w, h: r.h, type: ttype };
    mask.strength = ss;
    if (ttype === "blur" || ttype === "pixelate") mask.strength = ss;
    return mask;
  }

  function applyTypeToActive(ttype) {
    state.currentType = ttype;

    var m = getActiveMask();
    if (m) {
      pushHistory("type");
      m.type = ttype;
      if (ttype === "blur" || ttype === "pixelate") {
        m.strength = normalizeStrengthForType(ttype, m.strength || state.currentStrength || SAFETY.recommendStrength);
      } else {
        m.strength = normalizeStrengthForType("blur", m.strength || state.currentStrength || SAFETY.recommendStrength);
      }
    }

    if (els.strengthRange) {
      var vv = normalizeStrengthForType(ttype, state.currentStrength || SAFETY.recommendStrength);
      els.strengthRange.value = String(vv);
      state.currentStrength = vv;
      if (els.strengthLabel) els.strengthLabel.textContent = String(vv);
    }

    syncControlsFromActive();
    renderMaskChips();
    render();
  }

  function deleteActive() {
    if (!state.activeId) return;
    if (!confirm(t("この領域を削除しますか？", "Delete this mask?"))) return;
    pushHistory("delete");
    var next = [];
    for (var i = 0; i < state.masks.length; i++) {
      if (state.masks[i].id !== state.activeId) next.push(state.masks[i]);
    }
    state.masks = next;
    state.activeId = state.masks.length ? state.masks[state.masks.length - 1].id : null;
    syncControlsFromActive();
    renderMaskChips();
    render();
  }

  function duplicateActive() {
    var m = getActiveMask();
    if (!m) return;
    pushHistory("duplicate");
    var copy = {
      id: uid(),
      x: clamp(m.x + 10, 0, state.imgW),
      y: clamp(m.y + 10, 0, state.imgH),
      w: m.w,
      h: m.h,
      type: m.type,
      strength: m.strength
    };
    copy = Object.assign(copy, clampRectToImage(copy));
    if (copy.type === "blur" || copy.type === "pixelate") {
      copy.strength = normalizeStrengthForType(copy.type, copy.strength || state.currentStrength || SAFETY.recommendStrength);
    }
    state.masks.push(copy);
    setActive(copy.id);
  }

  function resetMasksOnly() {
    if (!state.masks.length) return;
    if (!confirm(t("マスク領域をすべて削除しますか？", "Remove all masks?"))) return;
    pushHistory("clear_masks");
    state.masks = [];
    state.activeId = null;
    renderMaskChips();
    syncControlsFromActive();
    render();
  }

  function revokeLastBlobUrl(){
    if (state.lastExportBlobUrl) {
      try { URL.revokeObjectURL(state.lastExportBlobUrl); } catch (_) {}
      state.lastExportBlobUrl = null;
    }
  }

  function resetAll() {
    try {
      if (state.imgBitmap && typeof state.imgBitmap.close === "function") state.imgBitmap.close();
    } catch (_) {}

    revokeLastBlobUrl();

    state.hasImage = false;
    state.imgBitmap = null;
    state.imgW = 0;
    state.imgH = 0;

    state.origW = 0;
    state.origH = 0;
    state.downscaleApplied = false;
    state.editScale = 1;
    state.exportScale = 1;

    state.viewScale = 1;
    state.viewTx = 0;
    state.viewTy = 0;

    state.masks = [];
    state.activeId = null;
    state.drag = null;

    state.currentType = "solid";
    state.currentStrength = SAFETY.recommendStrength;

    state.history = [];
    updateUndoButton();

    state.pointers.clear();
    state.gesture = null;

    if (els.fileInput) els.fileInput.value = "";
    setHintsVisible(true);

    resizeCanvasToImageAspect();
    setZoomUIFromScale(1);
    renderMaskChips();
    syncControlsFromActive();
    render();
    updateHelpHUD();
  }

  // --- R08: downscale utilities ---
  function calcMP(w,h){ return (w*h)/1000000; }

  function suggestEditScale(w,h){
    var mp = calcMP(w,h);
    var s = 1;
    if (w > LIMITS.MAX_DIM || h > LIMITS.MAX_DIM) {
      var sDim = Math.min(LIMITS.MAX_DIM / w, LIMITS.MAX_DIM / h);
      s = Math.min(s, sDim);
    }
    if (mp > LIMITS.MAX_EDIT_MP) {
      var sMp = Math.sqrt(LIMITS.MAX_EDIT_MP / mp);
      s = Math.min(s, sMp);
    }
    s = clamp(s, 0.15, 1);
    return s;
  }

  function hardRejectReason(w,h){
    var mp = calcMP(w,h);
    if (w > LIMITS.MAX_DIM*1.6 || h > LIMITS.MAX_DIM*1.6) {
      return t("画像が大きすぎます（片辺が上限を超えています）。", "Image is too large (dimension exceeds hard limit).");
    }
    if (mp > LIMITS.HARD_MAX_MP) {
      return t("画像が大きすぎます（" + LIMITS.HARD_MAX_MP + "MP を超えています）。", "Image is too large (exceeds " + LIMITS.HARD_MAX_MP + "MP).");
    }
    return "";
  }

  function downscaleBitmapToTarget(srcBitmapOrImg, srcW, srcH, targetScale){
    return new Promise(function(resolve, reject){
      try {
        var s = clamp(targetScale, 0.15, 1);
        if (s >= 0.999) { resolve({ bmp: srcBitmapOrImg, w: srcW, h: srcH, scale: 1, applied:false }); return; }

        var tw = Math.max(1, Math.round(srcW * s));
        var th = Math.max(1, Math.round(srcH * s));

        var c = document.createElement("canvas");
        c.width = tw;
        c.height = th;
        var ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.clearRect(0,0,tw,th);
        ctx.drawImage(srcBitmapOrImg, 0, 0, srcW, srcH, 0, 0, tw, th);

        if (window.createImageBitmap) {
          window.createImageBitmap(c).then(function(bmp){
            resolve({ bmp: bmp, w: tw, h: th, scale: s, applied:true });
          }).catch(function(){
            // fallback to canvas-as-image-like
            resolve({ bmp: c, w: tw, h: th, scale: s, applied:true });
          });
        } else {
          resolve({ bmp: c, w: tw, h: th, scale: s, applied:true });
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  // --- image loading ---
  function readFirstImageFileFromDrop(ev) {
    var dt = ev.dataTransfer;
    if (!dt) return null;

    if (dt.items && dt.items.length) {
      for (var i = 0; i < dt.items.length; i++) {
        var it = dt.items[i];
        if (it.kind === "file") {
          var f = it.getAsFile();
          if (f && f.type && f.type.indexOf("image/") === 0) return f;
        }
      }
    }
    if (dt.files && dt.files.length) {
      for (var j = 0; j < dt.files.length; j++) {
        var f2 = dt.files[j];
        if (f2 && f2.type && f2.type.indexOf("image/") === 0) return f2;
      }
    }
    return null;
  }

  function loadImageViaHTMLImage(file) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      finalizeLoadedImage(img, img.naturalWidth || img.width, img.naturalHeight || img.height, file.name || "");
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      alert(t("画像の読み込みに失敗しました。", "Failed to load image."));
    };
    img.src = url;
  }

  function finalizeLoadedImage(bmpOrImg, w, h, nameHint) {
    // R08: size guards + optional downscale for stability
    var hard = hardRejectReason(w,h);
    if (hard) {
      alert(hard + "\n" + t("別の画像を選ぶか、先に縮小してください。", "Pick another image or downscale it first."));
      return;
    }

    var mp = calcMP(w,h);
    var suggested = suggestEditScale(w,h);

    var willAsk = (suggested < 0.999);
    var shouldDownscale = false;

    if (willAsk) {
      var toW = Math.max(1, Math.round(w * suggested));
      var toH = Math.max(1, Math.round(h * suggested));
      shouldDownscale = confirm(
        t(
          "この画像は大きめです（" + fmtInt(w) + "×" + fmtInt(h) + " / 約" + mp.toFixed(1) + "MP）。\n" +
          "落ちにくくするため、編集用に縮小しますか？\n" +
          "→ " + fmtInt(toW) + "×" + fmtInt(toH) + "（約" + (calcMP(toW,toH)).toFixed(1) + "MP）\n\n" +
          "※端末内処理のみ。元画像は変更しません。",
          "Large image detected (" + fmtInt(w) + "×" + fmtInt(h) + " / ~" + mp.toFixed(1) + "MP).\n" +
          "Downscale for safer editing?\n" +
          "→ " + fmtInt(toW) + "×" + fmtInt(toH) + " (~" + (calcMP(toW,toH)).toFixed(1) + "MP)\n\n" +
          "Local-only. Original file is not modified."
        )
      );
    }

    var apply = function(finalBmp, fw, fh, scaleApplied, editScale){
      try {
        if (state.imgBitmap && typeof state.imgBitmap.close === "function" && state.imgBitmap !== finalBmp) state.imgBitmap.close();
      } catch (_) {}

      state.imgBitmap = finalBmp;
      state.imgW = fw;
      state.imgH = fh;
      state.hasImage = true;

      state.origW = w;
      state.origH = h;
      state.downscaleApplied = !!scaleApplied;
      state.editScale = editScale || 1;
      state.exportScale = 1;

      revokeLastBlobUrl();
      state.masks = [];
      state.activeId = null;
      state.drag = null;

      state.currentType = "solid";
      state.currentStrength = SAFETY.recommendStrength;

      state.history = [];
      updateUndoButton();

      state.pointers.clear();
      state.gesture = null;

      renderMaskChips();
      syncControlsFromActive();

      resizeCanvasToImageAspect();
      computeFitTransform();
      setHintsVisible(false);
      render();
      updateHelpHUD();
    };

    if (shouldDownscale && suggested < 0.999) {
      // If bmp is ImageBitmap, good; if HTMLImage, also OK.
      downscaleBitmapToTarget(bmpOrImg, w, h, suggested).then(function(res){
        apply(res.bmp, res.w, res.h, res.applied, res.scale);
      }).catch(function(){
        // fallback without downscale
        apply(bmpOrImg, w, h, false, 1);
      });
      return;
    }

    // no downscale
    apply(bmpOrImg, w, h, false, 1);
  }

  function loadImageFile(file) {
    if (!file) return;
    var ok = (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp");
    if (!ok) {
      alert(t("PNG / JPG / WebP のみ対応です。", "Only PNG/JPG/WebP are supported."));
      return;
    }

    try {
      if (state.imgBitmap && typeof state.imgBitmap.close === "function") state.imgBitmap.close();
    } catch (_) {}

    // R08: prefer createImageBitmap but fallback safely
    if (window.createImageBitmap) {
      window.createImageBitmap(file).then(function (bmp) {
        finalizeLoadedImage(bmp, bmp.width, bmp.height, file.name || "");
      }).catch(function () {
        loadImageViaHTMLImage(file);
      });
    } else {
      loadImageViaHTMLImage(file);
    }
  }

  // --- Multitouch: pinch zoom + two-finger pan ---
  function getTwoPointers(){
    var arr = Array.from(state.pointers.values());
    if (arr.length < 2) return null;
    return [arr[0], arr[1]];
  }
  function dist(a,b){
    var dx=a.x-b.x, dy=a.y-b.y;
    return Math.sqrt(dx*dx+dy*dy);
  }
  function mid(a,b){
    return { x:(a.x+b.x)/2, y:(a.y+b.y)/2 };
  }
  function startGestureIfNeeded(){
    if (!state.hasImage) return;
    if (state.gesture) return;
    if (state.pointers.size < 2) return;

    state.drag = null;

    var tp = getTwoPointers();
    if (!tp) return;

    var p1 = tp[0], p2 = tp[1];
    var mpt = mid(p1,p2);
    var dd = dist(p1,p2);

    state.gesture = {
      kind: "pinch",
      startDist: Math.max(10, dd),
      startMid: mpt,
      startScale: state.viewScale,
      startTx: state.viewTx,
      startTy: state.viewTy
    };
  }

  function updateGesture(){
    if (!state.gesture || state.gesture.kind !== "pinch") return;
    if (state.pointers.size < 2) return;

    var tp = getTwoPointers();
    if (!tp) return;

    var p1 = tp[0], p2 = tp[1];
    var mpt = mid(p1,p2);
    var dd = dist(p1,p2);

    var g = state.gesture;

    var ratio = dd / g.startDist;
    var nextScale = clamp(g.startScale * ratio, 0.25, 4);

    var imgAtStartMidX = (g.startMid.x - g.startTx) / g.startScale;
    var imgAtStartMidY = (g.startMid.y - g.startTy) / g.startScale;

    var dx = mpt.x - g.startMid.x;
    var dy = mpt.y - g.startMid.y;

    state.viewScale = nextScale;
    state.viewTx = (g.startMid.x + dx) - imgAtStartMidX * nextScale;
    state.viewTy = (g.startMid.y + dy) - imgAtStartMidY * nextScale;

    setZoomUIFromScale(state.viewScale);
    render();
  }

  function endGestureIfNeeded(){
    if (state.pointers.size < 2) {
      state.gesture = null;
    }
  }

  // --- pointer interactions ---
  function onPointerDown(e) {
    if (!state.hasImage) return;

    var ptCss0 = screenToCanvasCss(e);
    state.pointers.set(e.pointerId, { x: ptCss0.x, y: ptCss0.y });

    if (state.pointers.size >= 2) {
      e.preventDefault();
      els.canvas.setPointerCapture(e.pointerId);
      // R10: stop any pending long-press when multi-touch begins
      clearLongPress();
      startGestureIfNeeded();
      updateHelpHUD();
      return;
    }

    e.preventDefault();
    if (e.button !== undefined && e.button !== 0) return;

    var ptCss = ptCss0;
    var ptImg = canvasCssToImage(ptCss);

    if (state.mode === "pan") {
      state.drag = { kind: "pan", startCss: ptCss, startTx: state.viewTx, startTy: state.viewTy };
      els.canvas.setPointerCapture(e.pointerId);
      return;
    }

    if (state.mode === "add") {
      // R10: touch safety
      // - Tap: select existing mask if hit
      // - Long-press + drag: create new mask
      // - Two-finger gestures already handled above
      if (state.touch) {
        var hitAdd = hitTopmost(ptImg);
        if (hitAdd) {
          setActive(hitAdd.id);
          return;
        }
        clearLongPress();
        state.lpPointerId = e.pointerId;
        state.lpStartCss = { x: ptCss.x, y: ptCss.y };
        state.lpTriggered = false;
        els.canvas.setPointerCapture(e.pointerId);
        state.lpTimer = setTimeout(function(){
          // start create only if pointer still active and not converted to gesture
          if (!state.hasImage) return;
          if (state.pointers.size >= 2) return;
          if (state.lpPointerId !== e.pointerId) return;
          state.lpTriggered = true;
          var cur = state.pointers.get(e.pointerId);
          if (!cur) return;
          var curImg = canvasCssToImage(cur);
          state.drag = { kind: "create", startImg: curImg, nowImg: curImg };
          render();
        }, TOUCH_SAFETY.LONGPRESS_MS);
        // do not start create immediately
        return;
      }
      // desktop: drag-to-create immediately
      state.drag = { kind: "create", startImg: ptImg, nowImg: ptImg };
      els.canvas.setPointerCapture(e.pointerId);
      render();
      return;
    }

    var hit = hitTopmost(ptImg);
    if (hit) {
      setActive(hit.id);
      var m = getActiveMask();
      if (hit.kind === "handle") {
        pushHistory("resize_begin");
        state.drag = {
          kind: "resize",
          handle: hit.handle,
          startImg: ptImg,
          orig: { x: m.x, y: m.y, w: m.w, h: m.h }
        };
      } else {
        pushHistory("move_begin");
        state.drag = {
          kind: "move",
          startImg: ptImg,
          orig: { x: m.x, y: m.y }
        };
      }
      els.canvas.setPointerCapture(e.pointerId);
      return;
    }

    state.activeId = null;
    syncControlsFromActive();
    renderMaskChips();
    render();
  }

  function applyMove(ptImg) {
    var m = getActiveMask();
    if (!m) return;
    var dx = ptImg.x - state.drag.startImg.x;
    var dy = ptImg.y - state.drag.startImg.y;

    m.x = state.drag.orig.x + dx;
    m.y = state.drag.orig.y + dy;

    var r = snapMaskRect(m, m.id);
    m.x = r.x; m.y = r.y; m.w = r.w; m.h = r.h;
  }

  function applyResize(ptImg) {
    var m = getActiveMask();
    if (!m) return;

    var o = state.drag.orig;
    var x1 = o.x, y1 = o.y, x2 = o.x + o.w, y2 = o.y + o.h;
    var h = state.drag.handle;

    if (h.indexOf("n") !== -1) y1 = ptImg.y;
    if (h.indexOf("s") !== -1) y2 = ptImg.y;
    if (h.indexOf("w") !== -1) x1 = ptImg.x;
    if (h.indexOf("e") !== -1) x2 = ptImg.x;

    var r = normRect(x1, y1, x2, y2);
    if (r.w < MASK_RULES.MIN_SIZE) r.w = MASK_RULES.MIN_SIZE;
    if (r.h < MASK_RULES.MIN_SIZE) r.h = MASK_RULES.MIN_SIZE;
    r = clampRectToImage(r);

    m.x = r.x; m.y = r.y; m.w = r.w; m.h = r.h;
  }

  function onPointerMove(e) {
    if (!state.hasImage) return;

    if (state.pointers.has(e.pointerId)) {
      var ptCssG = screenToCanvasCss(e);
      state.pointers.set(e.pointerId, { x: ptCssG.x, y: ptCssG.y });
    // R10: cancel long-press if finger moved (touch)
    if (state.touch && state.lpTimer && state.lpPointerId === e.pointerId && state.lpStartCss) {
      var dxlp = ptCssG.x - state.lpStartCss.x;
      var dylp = ptCssG.y - state.lpStartCss.y;
      if ((dxlp*dxlp + dylp*dylp) > (TOUCH_SAFETY.MOVE_TOL_PX*TOUCH_SAFETY.MOVE_TOL_PX)) {
        clearLongPress();
      }
    }

      if (state.pointers.size >= 2) {
        e.preventDefault();
        if (!state.gesture) startGestureIfNeeded();
        updateGesture();
        return;
      }
    }

    if (!state.drag) return;
    e.preventDefault();

    var ptCss = screenToCanvasCss(e);
    var ptImg = canvasCssToImage(ptCss);

    if (state.drag.kind === "pan") {
      var dx = ptCss.x - state.drag.startCss.x;
      var dy = ptCss.y - state.drag.startCss.y;
      state.viewTx = state.drag.startTx + dx;
      state.viewTy = state.drag.startTy + dy;
      render();
      return;
    }

    if (state.drag.kind === "create") {
      state.drag.nowImg = ptImg;
      render();
      return;
    }

    if (state.drag.kind === "move") {
      applyMove(ptImg);
      render();
      return;
    }

    if (state.drag.kind === "resize") {
      applyResize(ptImg);
      render();
      return;
    }
  }

  function onPointerUp(e) {
    if (state.pointers.has(e.pointerId)) state.pointers.delete(e.pointerId);

    // R10: clear long-press state for this pointer
    if (state.lpPointerId === e.pointerId) { clearLongPress(); }

    if (state.gesture) {
      e.preventDefault();
      try { els.canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      endGestureIfNeeded();
      if (state.pointers.size === 0) state.gesture = null;
      updateHelpHUD();
      return;
    }

    if (!state.drag) {
      try { els.canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      return;
    }
    e.preventDefault();

    if (state.drag.kind === "create") {
      pushHistory("create");
      var m = newMaskFromDrag(state.drag.startImg, state.drag.nowImg);
      if (m) {
        state.masks.push(m);
        state.activeId = m.id;
        syncControlsFromActive();
        renderMaskChips();
      }
      render();
    }

    state.drag = null;
    try { els.canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    updateUndoButton();
  }

  // --- R08: export drawing (memory optimized) ---
  // Key change: blur is applied with a SMALL region canvas (not full-image blur canvas).
  function drawSolid(ctx, r) {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.restore();
  }

  function drawBlurRegionOptim(outCtx, sourceCanvas, r, strength) {
    var blurPx = clamp(strength, SAFETY.minBlur, SAFETY.maxStrength);

    // pad to reduce edge artifacts
    var pad = LIMITS.BLUR_PAD_PX + Math.round(blurPx);
    var sx = Math.max(0, Math.floor(r.x - pad));
    var sy = Math.max(0, Math.floor(r.y - pad));
    var ex = Math.min(sourceCanvas.width, Math.ceil(r.x + r.w + pad));
    var ey = Math.min(sourceCanvas.height, Math.ceil(r.y + r.h + pad));
    var sw = Math.max(1, ex - sx);
    var sh = Math.max(1, ey - sy);

    // small canvas for just this region
    var tmp = document.createElement("canvas");
    tmp.width = sw;
    tmp.height = sh;
    var tctx = tmp.getContext("2d");
    tctx.imageSmoothingEnabled = true;

    // copy region
    tctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

    // blur filter on region canvas
    tctx.save();
    tctx.filter = "blur(" + blurPx + "px)";
    // re-draw itself to apply blur; drawImage tmp->tmp is allowed
    // use an intermediate to avoid Safari quirks
    var tmp2 = document.createElement("canvas");
    tmp2.width = sw;
    tmp2.height = sh;
    var t2 = tmp2.getContext("2d");
    t2.imageSmoothingEnabled = true;
    t2.drawImage(tmp, 0, 0);
    tctx.clearRect(0,0,sw,sh);
    tctx.drawImage(tmp2, 0, 0);
    tctx.restore();

    // paint back only the mask rect area
    outCtx.save();
    outCtx.drawImage(tmp, r.x - sx, r.y - sy, r.w, r.h, r.x, r.y, r.w, r.h);
    outCtx.restore();
  }

  function drawPixelateRegion(outCtx, sourceCanvas, r, strength) {
    var s = clamp(strength, SAFETY.minPixel, SAFETY.maxStrength);
    var block = Math.round((s / SAFETY.maxStrength) * 28 + 4); // 4..32
    block = clamp(block, 4, 40);

    var dw = Math.max(1, Math.floor(r.w / block));
    var dh = Math.max(1, Math.floor(r.h / block));

    var small = document.createElement("canvas");
    small.width = dw;
    small.height = dh;
    var sctx = small.getContext("2d");

    sctx.imageSmoothingEnabled = true;
    sctx.clearRect(0,0,dw,dh);
    sctx.drawImage(sourceCanvas, r.x, r.y, r.w, r.h, 0, 0, dw, dh);

    outCtx.save();
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(small, 0, 0, dw, dh, r.x, r.y, r.w, r.h);
    outCtx.restore();
  }

  function createExportCanvas(scale){
    var s = clamp(scale || 1, 0.15, 1);
    var w = Math.max(1, Math.round(state.imgW * s));
    var h = Math.max(1, Math.round(state.imgH * s));
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  function applyMasksToCanvas(outCanvas) {
    var outCtx = outCanvas.getContext("2d");
    outCtx.imageSmoothingEnabled = true;

    // draw base image
    outCtx.clearRect(0, 0, outCanvas.width, outCanvas.height);
    outCtx.drawImage(state.imgBitmap, 0, 0, state.imgW, state.imgH, 0, 0, outCanvas.width, outCanvas.height);

    if (!state.masks.length) return outCanvas;

    // source snapshot for region sampling at export scale
    var srcCanvas = document.createElement("canvas");
    srcCanvas.width = outCanvas.width;
    srcCanvas.height = outCanvas.height;
    var sctx = srcCanvas.getContext("2d");
    sctx.imageSmoothingEnabled = true;
    sctx.drawImage(outCanvas, 0, 0);

    // convert masks from image-space to export-space
    var sx = outCanvas.width / state.imgW;
    var sy = outCanvas.height / state.imgH;

    for (var i = 0; i < state.masks.length; i++) {
      var m = state.masks[i];
      var rr = clampRectToImage({ x: m.x, y: m.y, w: m.w, h: m.h });
      if (rr.w <= 0 || rr.h <= 0) continue;

      var r = {
        x: Math.round(rr.x * sx),
        y: Math.round(rr.y * sy),
        w: Math.round(rr.w * sx),
        h: Math.round(rr.h * sy)
      };
      r.x = clamp(r.x, 0, outCanvas.width);
      r.y = clamp(r.y, 0, outCanvas.height);
      r.w = clamp(r.w, 0, outCanvas.width - r.x);
      r.h = clamp(r.h, 0, outCanvas.height - r.y);
      if (r.w <= 0 || r.h <= 0) continue;

      if (m.type === "solid") {
        drawSolid(outCtx, r);
      } else if (m.type === "blur") {
        var bs = normalizeStrengthForType("blur", m.strength || state.currentStrength || SAFETY.recommendStrength);
        // scale blur strength relative to export scale (roughly)
        var scaledBlur = Math.max(SAFETY.minBlur, Math.round(bs * Math.max(sx, sy)));
        drawBlurRegionOptim(outCtx, srcCanvas, r, scaledBlur);
        // refresh source snapshot after modifications
        sctx.clearRect(0,0,srcCanvas.width,srcCanvas.height);
        sctx.drawImage(outCanvas, 0, 0);
      } else if (m.type === "pixelate") {
        var ps = normalizeStrengthForType("pixelate", m.strength || state.currentStrength || SAFETY.recommendStrength);
        var scaledPix = Math.max(SAFETY.minPixel, Math.round(ps * Math.max(sx, sy)));
        drawPixelateRegion(outCtx, srcCanvas, r, scaledPix);
        sctx.clearRect(0,0,srcCanvas.width,srcCanvas.height);
        sctx.drawImage(outCanvas, 0, 0);
      } else {
        drawSolid(outCtx, r);
      }
    }

    return outCanvas;
  }

  function canvasToBlob(canvas, cb) {
    try {
      if (canvas.toBlob) { canvas.toBlob(function (blob) { cb(blob); }, "image/png"); return; }
      var dataUrl = canvas.toDataURL("image/png");
      var parts = dataUrl.split(",");
      var mime = (parts[0].match(/:(.*?);/) || [])[1] || "image/png";
      var bin = atob(parts[1]);
      var len = bin.length;
      var arr = new Uint8Array(len);
      for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
      cb(new Blob([arr], { type: mime }));
    } catch (e) {
      cb(null);
    }
  }

  // --- Preview / Export gate UI ---
  function ensurePreviewUI() {
    if (!els.modal) return;

    var body = els.modal.querySelector(".modal-body") || els.modal.querySelector(".body") || els.modal;
    var pane = els.modal.querySelector("[data-preview-pane]");
    if (!pane) {
      pane = document.createElement("div");
      pane.setAttribute("data-preview-pane", "1");
      pane.style.padding = "12px";
      pane.style.display = "grid";
      pane.style.gap = "10px";
      body.appendChild(pane);
    }

    var title = els.modal.querySelector("[data-preview-title]");
    if (!title) {
      title = document.createElement("div");
      title.setAttribute("data-preview-title", "1");
      title.style.fontWeight = "700";
      title.style.fontSize = "14px";
      title.style.opacity = "0.95";
      pane.appendChild(title);
    }

    var warn = els.modal.querySelector("[data-preview-warn]");
    if (!warn) {
      warn = document.createElement("div");
      warn.setAttribute("data-preview-warn","1");
      warn.style.padding = "10px 12px";
      warn.style.borderRadius = "12px";
      warn.style.border = "1px solid rgba(245,158,11,0.35)";
      warn.style.background = "rgba(245,158,11,0.10)";
      warn.style.color = "rgba(255,255,255,0.92)";
      warn.style.fontSize = "12px";
      warn.style.lineHeight = "1.35";
      warn.style.display = "none";
      pane.appendChild(warn);
    }

    var perf = els.modal.querySelector("[data-preview-perf]");
    if (!perf) {
      perf = document.createElement("div");
      perf.setAttribute("data-preview-perf","1");
      perf.style.padding = "10px 12px";
      perf.style.borderRadius = "12px";
      perf.style.border = "1px solid rgba(255,255,255,0.14)";
      perf.style.background = "rgba(255,255,255,0.06)";
      perf.style.color = "rgba(255,255,255,0.92)";
      perf.style.fontSize = "12px";
      perf.style.lineHeight = "1.35";
      perf.style.display = "none";
      pane.appendChild(perf);
    }

    if (!els.previewCanvas) els.previewCanvas = els.modal.querySelector("#previewCanvas");
    if (!els.previewCanvas) {
      var c = document.createElement("canvas");
      c.id = "previewCanvas";
      c.style.width = "100%";
      c.style.height = "auto";
      c.style.borderRadius = "10px";
      c.style.background = "#0b1020";
      c.style.boxShadow = "0 1px 8px rgba(0,0,0,0.25)";
      pane.appendChild(c);
      els.previewCanvas = c;
    }

    var chkWrap = els.modal.querySelector("[data-preview-confirm]");
    if (!chkWrap) {
      chkWrap = document.createElement("label");
      chkWrap.setAttribute("data-preview-confirm","1");
      chkWrap.style.display = "flex";
      chkWrap.style.gap = "10px";
      chkWrap.style.alignItems = "flex-start";
      chkWrap.style.padding = "10px 12px";
      chkWrap.style.borderRadius = "12px";
      chkWrap.style.border = "1px solid rgba(255,255,255,0.14)";
      chkWrap.style.background = "rgba(255,255,255,0.06)";
      chkWrap.style.color = "rgba(255,255,255,0.92)";
      chkWrap.style.fontSize = "12px";
      chkWrap.style.lineHeight = "1.35";

      var chk = document.createElement("input");
      chk.type = "checkbox";
      chk.id = "confirmChecked";
      chk.style.marginTop = "2px";

      var txt = document.createElement("div");
      txt.setAttribute("data-preview-confirm-text","1");

      chkWrap.appendChild(chk);
      chkWrap.appendChild(txt);
      pane.appendChild(chkWrap);

      chk.addEventListener("change", function(){ updateDownloadGate(); });
    }

    // R11: preview zoom controls
    var zrow = els.modal.querySelector('[data-preview-zoom]');
    if (!zrow) {
      zrow = document.createElement('div');
      zrow.setAttribute('data-preview-zoom','1');
      zrow.style.display = 'flex';
      zrow.style.gap = '10px';
      zrow.style.alignItems = 'center';
      zrow.style.flexWrap = 'wrap';

      var zb0 = document.createElement('button');
      zb0.type = 'button';
      zb0.setAttribute('data-pz-out','1');
      zb0.textContent = '−';
      zb0.style.width = '36px';
      zb0.style.height = '36px';
      zb0.style.borderRadius = '10px';
      zb0.style.background = 'rgba(255,255,255,0.10)';
      zb0.style.border = '1px solid rgba(255,255,255,0.20)';
      zb0.style.color = 'rgba(255,255,255,0.92)';
      zb0.style.fontWeight = '900';

      var zb1 = document.createElement('button');
      zb1.type = 'button';
      zb1.setAttribute('data-pz-in','1');
      zb1.textContent = '+';
      zb1.style.width = '36px';
      zb1.style.height = '36px';
      zb1.style.borderRadius = '10px';
      zb1.style.background = 'rgba(255,255,255,0.10)';
      zb1.style.border = '1px solid rgba(255,255,255,0.20)';
      zb1.style.color = 'rgba(255,255,255,0.92)';
      zb1.style.fontWeight = '900';

      var zr = document.createElement('input');
      zr.type = 'range';
      zr.min = '100';
      zr.max = '400';
      zr.value = '100';
      zr.step = '10';
      zr.setAttribute('data-pz-range','1');
      zr.style.flex = '1';
      zr.style.minWidth = '180px';

      var zl = document.createElement('div');
      zl.setAttribute('data-pz-label','1');
      zl.style.fontWeight = '800';
      zl.style.opacity = '0.95';
      zl.textContent = '100%';

      zrow.appendChild(document.createTextNode('Zoom'));
      zrow.appendChild(zb0);
      zrow.appendChild(zr);
      zrow.appendChild(zb1);
      zrow.appendChild(zl);
      pane.appendChild(zrow);

      zb0.addEventListener('click', function(){
        var v = parseInt(zr.value||'100',10)||100;
        v = clamp(v-20, 100, 400);
        zr.value = String(v);
        state.previewZoom = v/100;
        renderPreviewFromSource();
      });
      zb1.addEventListener('click', function(){
        var v = parseInt(zr.value||'100',10)||100;
        v = clamp(v+20, 100, 400);
        zr.value = String(v);
        state.previewZoom = v/100;
        renderPreviewFromSource();
      });
      zr.addEventListener('input', function(){
        var v = parseInt(zr.value||'100',10)||100;
        state.previewZoom = clamp(v/100, 1, 4);
        renderPreviewFromSource();
      });
    }

    var row = els.modal.querySelector("[data-preview-actions]");
    if (!row) {
      row = document.createElement("div");
      row.setAttribute("data-preview-actions", "1");
      row.style.display = "flex";
      row.style.gap = "10px";
      row.style.flexWrap = "wrap";
      pane.appendChild(row);
    }

    var boost = els.modal.querySelector("[data-boost-btn]");
    if (!boost) {
      boost = document.createElement("button");
      boost.type = "button";
      boost.setAttribute("data-boost-btn","1");
      boost.style.padding = "10px 12px";
      boost.style.borderRadius = "10px";
      boost.style.background = "rgba(245,158,11,0.14)";
      boost.style.border = "1px solid rgba(245,158,11,0.35)";
      boost.style.color = "rgba(255,255,255,0.92)";
      boost.style.fontWeight = "700";
      boost.style.display = "none";
      boost.addEventListener("click", function(){
        boostWeakMasks();
        openPreviewAndRender();
      });
      row.appendChild(boost);
    }

    if (!els.downloadLink) els.downloadLink = els.modal.querySelector("#downloadLink");
    if (!els.downloadLink) {
      var a = document.createElement("a");
      a.id = "downloadLink";
      a.href = "#";
      a.download = "redacted.png";
      a.textContent = "Download PNG";
      a.style.display = "inline-flex";
      a.style.alignItems = "center";
      a.style.justifyContent = "center";
      a.style.padding = "10px 12px";
      a.style.borderRadius = "10px";
      a.style.background = "#ffffff";
      a.style.color = "#111827";
      a.style.fontWeight = "800";
      a.style.textDecoration = "none";
      row.appendChild(a);
      els.downloadLink = a;
    }

    if (!els.closePreview) els.closePreview = els.modal.querySelector("#btnClosePreview");
    if (!els.closePreview) {
      var b = document.createElement("button");
      b.type = "button";
      b.id = "btnClosePreview";
      b.textContent = "Close";
      b.style.padding = "10px 12px";
      b.style.borderRadius = "10px";
      b.style.background = "rgba(255,255,255,0.10)";
      b.style.color = "rgba(255,255,255,0.92)";
      b.style.border = "1px solid rgba(255,255,255,0.20)";
      b.addEventListener("click", closePreview);
      row.appendChild(b);
      els.closePreview = b;
    }

    syncPreviewLang();
    updateDownloadGate();
  }

  function syncPreviewLang(){
    if (!els.modal) return;

    var title = els.modal.querySelector("[data-preview-title]");
    if (title) title.textContent = t("書き出し前プレビュー（出力結果）", "Preview (final output)");

    var txt = els.modal.querySelector("[data-preview-confirm-text]");
    if (txt) {
      txt.textContent = t(
        "保存前に、隠したい情報が“確実に見えない”ことをズームして確認しました。",
        "Before saving, I zoomed in and confirmed the sensitive info is truly unreadable."
      );
    }

    var boost = els.modal.querySelector("[data-boost-btn]");
    if (boost) boost.textContent = t("弱い強度を自動で引き上げる", "Auto-boost weak strengths");

    if (els.downloadLink) els.downloadLink.textContent = t("PNGを保存", "Download PNG");
    if (els.closePreview) els.closePreview.textContent = t("閉じる", "Close");
    updateDownloadGate();
  }

  function updateDownloadGate(){
    if (!els.modal || !els.downloadLink) return;
    var chk = els.modal.querySelector("#confirmChecked");
    var ok = !!(chk && chk.checked);

    if (!ok) {
      els.downloadLink.style.opacity = "0.45";
      els.downloadLink.style.pointerEvents = "none";
      els.downloadLink.setAttribute("aria-disabled","true");
      els.downloadLink.title = t("チェックを入れてから保存できます", "Check the box before saving");
    } else {
      els.downloadLink.style.opacity = "1";
      els.downloadLink.style.pointerEvents = "auto";
      els.downloadLink.removeAttribute("aria-disabled");
      els.downloadLink.title = "";
    }
  }

  function boostWeakMasks(){
    pushHistory("boost");
    for (var i = 0; i < state.masks.length; i++) {
      var m = state.masks[i];
      if (m.type === "blur" || m.type === "pixelate") {
        var s = normalizeStrengthForType(m.type, m.strength || state.currentStrength || SAFETY.recommendStrength);
        if (s < SAFETY.recommendStrength) m.strength = SAFETY.recommendStrength;
      }
    }
    if (state.currentType === "blur" || state.currentType === "pixelate") {
      state.currentStrength = Math.max(state.currentStrength, SAFETY.recommendStrength);
    }
    syncControlsFromActive();
    renderMaskChips();
    render();
  }

  // R11: redraw preview canvas from cached export source with zoom
  function renderPreviewFromSource(){
    if (!els.previewCanvas || !state.previewSource) return;
    var out = state.previewSource;
    var pv = els.previewCanvas;
    var z = clamp(state.previewZoom || 1, 1, 4);

    // label
    if (els.modal) {
      var zr = els.modal.querySelector('[data-pz-range]');
      var zl = els.modal.querySelector('[data-pz-label]');
      if (zr && String(Math.round(z*100)) !== zr.value) zr.value = String(Math.round(z*100));
      if (zl) zl.textContent = String(Math.round(z*100)) + '%';
    }

    var maxW = Math.min(LIMITS.PREVIEW_MAX_W, (els.modal && els.modal.clientWidth ? els.modal.clientWidth - 32 : LIMITS.PREVIEW_MAX_W));
    maxW = Math.max(260, maxW);

    // base fit scale
    var fit = Math.min(1, maxW / out.width);
    var w = Math.round(out.width * fit);
    var h = Math.round(out.height * fit);

    pv.width = Math.round(w * dpr());
    pv.height = Math.round(h * dpr());
    pv.style.width = w + 'px';
    pv.style.height = h + 'px';

    var pctx = pv.getContext('2d');
    pctx.setTransform(1,0,0,1,0,0);
    pctx.clearRect(0,0,pv.width,pv.height);
    pctx.fillStyle = '#0b1020';
    pctx.fillRect(0,0,pv.width,pv.height);

    // draw centered with zoom (crop around center)
    pctx.setTransform(dpr(),0,0,dpr(),0,0);
    pctx.imageSmoothingEnabled = true;

    var srcW = out.width / z;
    var srcH = out.height / z;
    var sx = Math.max(0, (out.width - srcW) / 2);
    var sy = Math.max(0, (out.height - srcH) / 2);
    pctx.drawImage(out, sx, sy, srcW, srcH, 0, 0, w, h);
  }

  function openPreviewAndRender() {
    if (!state.hasImage) return;

    ensurePreviewUI();
    if (!els.modal) return;

    var chk = els.modal.querySelector("#confirmChecked");
    if (chk) chk.checked = false;

    // weak-strength warning
    var weak = getWeakMasks();
    var warn = els.modal.querySelector("[data-preview-warn]");
    var boostBtn = els.modal.querySelector("[data-boost-btn]");
    if (warn) {
      if (weak.length) {
        warn.textContent = t(
          "注意：ぼかし/モザイクの強度が弱い領域があります（推奨 " + SAFETY.recommendStrength + "+）。事故防止のため、ズームで確認するか、自動で引き上げてください。",
          "Warning: Some blur/pixelate masks are weak (recommended " + SAFETY.recommendStrength + "+). Zoom to verify, or auto-boost to reduce risk."
        );
        warn.style.display = "";
      } else {
        warn.style.display = "none";
      }
    }
    if (boostBtn) boostBtn.style.display = weak.length ? "" : "none";

    // R08: if editing was downscaled OR original was huge, we may export scaled safely
    // Default export: current image size (state.exportScale=1).
    var perf = els.modal.querySelector("[data-preview-perf]");
    if (perf) {
      perf.style.display = "none";
      perf.textContent = "";
    }

    state.exportScale = 1;

    // If original is huge and user did NOT downscale for editing, avoid crash by exporting scaled
    var origMP = state.origW && state.origH ? calcMP(state.origW, state.origH) : calcMP(state.imgW, state.imgH);
    var currentMP = calcMP(state.imgW, state.imgH);

    if (!state.downscaleApplied && (origMP > LIMITS.MAX_EDIT_MP || state.origW > LIMITS.MAX_DIM || state.origH > LIMITS.MAX_DIM)) {
      // Safety export scale relative to current bitmap
      var s = suggestEditScale(state.imgW, state.imgH); // reuse; may be < 1
      if (s < 0.999) {
        state.exportScale = s;
        if (perf) {
          perf.style.display = "";
          var toW = Math.round(state.imgW * s);
          var toH = Math.round(state.imgH * s);
          perf.textContent = t(
            "安定動作のため、今回の書き出しは縮小PNGになります： " + fmtInt(toW) + "×" + fmtInt(toH) + "（約" + calcMP(toW,toH).toFixed(1) + "MP）\n" +
            "※元の解像度のまま保存したい場合は、読み込み時に縮小を選ばず、より小さい画像で試してください。",
            "For stability, this export will be a downscaled PNG: " + fmtInt(toW) + "×" + fmtInt(toH) + " (~" + calcMP(toW,toH).toFixed(1) + "MP)\n" +
            "If you need full-res export, use a smaller image or choose downscale at load."
          );
        }
      }
    }

    var out = createExportCanvas(state.exportScale);
    applyMasksToCanvas(out);

    state.previewSource = out;
    state.previewZoom = 1;

    // preview canvas sizing + draw (R11: zoomable)
    renderPreviewFromSource();

    canvasToBlob(out, function (blob) {
      revokeLastBlobUrl();
      if (!blob) {
        alert(t(
          "PNG生成に失敗しました。画像が大きすぎる可能性があります。\n別の画像（小さめ）で試すか、読み込み時に縮小を選んでください。",
          "Failed to generate PNG. The image may be too large.\nTry a smaller image or choose downscale at load."
        ));
        return;
      }
      state.lastExportBlobUrl = URL.createObjectURL(blob);
      if (els.downloadLink) {
        els.downloadLink.href = state.lastExportBlobUrl;

        // include scale info if downscaled export
        var scaleTag = (state.exportScale < 0.999) ? ("-scaled") : "";
        els.downloadLink.download = "redacted-" + timestampName() + scaleTag + ".png";
      }
      updateDownloadGate();
    });

    els.modal.classList.remove("hidden");
    updateDownloadGate();
  }

  function downloadDirectlyBlocked() {
    alert(t("事故防止のため、保存はプレビュー（確認チェック）経由にしています。", "For safety, saving is only available via Preview (with confirmation checkbox)."));
    openPreviewAndRender();
  }

  function closePreview() { if (els.modal) els.modal.classList.add("hidden"); }

  // --- Help HUD ---
  function ensureHelpHUD(){
    var root = $("#helpHud");
    if (root) return root;

    var anchor = els.canvasWrap || (els.canvas ? els.canvas.parentElement : null) || document.body;

    root = document.createElement("div");
    root.id = "helpHud";
    root.style.marginTop = "10px";
    root.style.padding = "10px 12px";
    root.style.borderRadius = "14px";
    root.style.border = "1px solid rgba(255,255,255,0.14)";
    root.style.background = "rgba(255,255,255,0.06)";
    root.style.color = "rgba(255,255,255,0.92)";
    root.style.fontSize = "12px";
    root.style.lineHeight = "1.45";
    root.style.display = "grid";
    root.style.gap = "8px";

    var row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "10px";
    row.style.flexWrap = "wrap";
    row.style.alignItems = "center";

    var title = document.createElement("div");
    title.setAttribute("data-help-title","1");
    title.style.fontWeight = "800";
    title.style.opacity = "0.95";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "helpToggle";
    toggle.style.marginLeft = "auto";
    toggle.style.padding = "6px 10px";
    toggle.style.borderRadius = "10px";
    toggle.style.background = "rgba(255,255,255,0.10)";
    toggle.style.border = "1px solid rgba(255,255,255,0.20)";
    toggle.style.color = "rgba(255,255,255,0.92)";
    toggle.style.fontWeight = "700";

    row.appendChild(title);
    row.appendChild(toggle);

    var body = document.createElement("div");
    body.id = "helpBody";
    body.style.display = "grid";
    body.style.gap = "6px";

    var p1 = document.createElement("div"); p1.setAttribute("data-help-line1","1");
    var p2 = document.createElement("div"); p2.setAttribute("data-help-line2","1");
    var p3 = document.createElement("div"); p3.setAttribute("data-help-line3","1");
    var p4 = document.createElement("div"); p4.setAttribute("data-help-line4","1");
    var p5 = document.createElement("div"); p5.setAttribute("data-help-line5","1"); p5.style.opacity="0.92";

    body.appendChild(p1);
    body.appendChild(p2);
    body.appendChild(p3);
    body.appendChild(p4);
    body.appendChild(p5);

    var urow = document.createElement("div");
    urow.style.display = "flex";
    urow.style.gap = "10px";
    urow.style.flexWrap = "wrap";
    urow.style.alignItems = "center";

    var ub = document.createElement("button");
    ub.type = "button";
    ub.id = "btnUndoInline";
    ub.style.padding = "8px 10px";
    ub.style.borderRadius = "10px";
    ub.style.background = "rgba(255,255,255,0.10)";
    ub.style.border = "1px solid rgba(255,255,255,0.20)";
    ub.style.color = "rgba(255,255,255,0.92)";
    ub.style.fontWeight = "800";
    ub.addEventListener("click", function(){ undoOnce(); });

    var ut = document.createElement("div");
    ut.setAttribute("data-help-undo","1");
    ut.style.opacity = "0.92";

    urow.appendChild(ub);
    urow.appendChild(ut);

    root.appendChild(row);
    root.appendChild(body);
    root.appendChild(urow);

    var collapsed = (sessionStorage.getItem("redact_help_collapsed") === "1");
    body.style.display = collapsed ? "none" : "grid";

    toggle.addEventListener("click", function(){
      var now = (body.style.display === "none");
      body.style.display = now ? "grid" : "none";
      sessionStorage.setItem("redact_help_collapsed", now ? "0" : "1");
      updateHelpHUD();
    });

    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(root, anchor.nextSibling);
    else document.body.appendChild(root);

    return root;
  }

  function updateUndoButton(){
    var btn = $("#btnUndoInline");
    if (!btn) return;
    var ok = canUndo();
    btn.style.opacity = ok ? "1" : "0.45";
    btn.style.pointerEvents = ok ? "auto" : "none";
    btn.title = ok ? "" : t("戻せる操作がありません", "Nothing to undo");
  }

  function updateHelpHUD(){
    var root = ensureHelpHUD();
    if (!root) return;

    var title = root.querySelector("[data-help-title]");
    var toggle = $("#helpToggle");
    var b1 = root.querySelector("[data-help-line1]");
    var b2 = root.querySelector("[data-help-line2]");
    var b3 = root.querySelector("[data-help-line3]");
    var b4 = root.querySelector("[data-help-line4]");
    var b5 = root.querySelector("[data-help-line5]");
    var ub = $("#btnUndoInline");
    var ut = root.querySelector("[data-help-undo]");

    var collapsed = ($("#helpBody") && $("#helpBody").style.display === "none");

    if (title) title.textContent = t("操作ヒント（事故防止）", "Quick help (safety)");
    if (toggle) toggle.textContent = collapsed ? t("開く", "Show") : t("畳む", "Hide");

    var modeLabel = (state.mode === "add") ? t("追加", "Add")
                   : (state.mode === "edit") ? t("編集", "Edit")
                   : t("パン", "Pan");

    if (!state.hasImage) {
      if (b1) b1.textContent = t("1) 画像を読み込み（ドラッグ&ドロップ / 選択）", "1) Load an image (drag & drop / select).");
      if (b2) b2.textContent = t("2) 黒塗りが最も確実（初期設定）", "2) Blackout is the safest (default).");
      if (b3) b3.textContent = t("3) ぼかし/モザイクは強度を上げてズーム確認", "3) Blur/Pixelate: increase strength and zoom-check.");
      if (b4) b4.textContent = t("4) 保存はプレビューで“確認チェック”が必須", "4) Saving requires Preview + confirmation checkbox.");
      if (b5) b5.textContent = t("R08：巨大画像は自動で縮小提案して安定化", "R08: Large images trigger a downscale suggestion for stability.");
    } else {
      if (b1) b1.textContent = t("現在モード：" + modeLabel + "（Space長押しで一時パン）", "Mode: " + modeLabel + " (hold Space for temporary pan).");
      if (b2) b2.textContent = t("PC：ホイール=ズーム / ドラッグ=領域追加（追加モード）", "Desktop: wheel=zoom / drag=create mask (Add mode).");
      if (b3) b3.textContent = t("モバイル：ピンチ=ズーム / 2本指ドラッグ=パン（推奨）／追加は“長押し→ドラッグ”", "Mobile: pinch=zoom / two-finger drag=pan (recommended) / Add: long-press then drag.");
      if (b4) b4.textContent = t("誤操作防止：2本指が触れたら領域作成は中断", "Safety: when two fingers touch, mask creation is canceled.");
      if (b5) {
        if (state.downscaleApplied) {
          b5.textContent = t(
            "安定化：編集用に縮小中（元: " + fmtInt(state.origW) + "×" + fmtInt(state.origH) + " → 編集: " + fmtInt(state.imgW) + "×" + fmtInt(state.imgH) + "）",
            "Stability: editing on downscaled image (orig " + fmtInt(state.origW) + "×" + fmtInt(state.origH) + " → edit " + fmtInt(state.imgW) + "×" + fmtInt(state.imgH) + ")"
          );
        } else {
          b5.textContent = t("安定化：書き出し時に縮小になる場合があります（プレビューに表示）", "Stability: export may be downscaled when needed (shown in Preview).");
        }
      }
    }

    if (ub) ub.textContent = t("1手戻す", "Undo");
    if (ut) ut.textContent = t("ショートカット：Ctrl/Cmd + Z", "Shortcut: Ctrl/Cmd + Z");

    updateUndoButton();
  }

  // --- Space temporary pan ---
  function beginSpacePan(){
    if (!state.hasImage) return;
    if (state.spacePan.active) return;
    state.spacePan.active = true;
    state.spacePan.prevMode = state.mode;
    setMode("pan");
  }
  function endSpacePan(){
    if (!state.spacePan.active) return;
    state.spacePan.active = false;
    var prev = state.spacePan.prevMode || "add";
    state.spacePan.prevMode = null;
    setMode(prev);
  }

  // --- language wiring ---
  function applyLang(lang) {
    i18nNodes.forEach(function (el) { el.style.display = (el.dataset.i18n === lang) ? "" : "none"; });
    langButtons.forEach(function (b) { b.classList.toggle("active", b.dataset.lang === lang); });
    currentLang = lang;
    setHintsVisible(!state.hasImage);
    syncPreviewLang();
    updateWeakWarningInline();
    updateHelpHUD();
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { applyLang(btn.dataset.lang); });
  });

  // --- drop & input wiring ---
  if (els.canvas) {
    els.canvas.addEventListener("pointerdown", onPointerDown);
    els.canvas.addEventListener("pointermove", onPointerMove);
    els.canvas.addEventListener("pointerup", onPointerUp);
    els.canvas.addEventListener("pointercancel", onPointerUp);
    els.canvas.style.touchAction = "none";
  }

  if (els.dropZone && els.fileInput) {
    els.dropZone.addEventListener("click", function () { els.fileInput.click(); });
    els.dropZone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); els.fileInput.click(); }
    });
  }

  if (els.fileInput) {
    els.fileInput.addEventListener("change", function () {
      var f = els.fileInput.files && els.fileInput.files[0];
      if (f) loadImageFile(f);
    });
  }

  if (els.dropZone) {
    els.dropZone.addEventListener("dragover", function (e) { e.preventDefault(); });
    els.dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      var f = readFirstImageFileFromDrop(e);
      if (f) loadImageFile(f);
    });
  }

  // --- buttons wiring ---
  if (els.btnFit) els.btnFit.addEventListener("click", function () { if (state.hasImage) { computeFitTransform(); render(); } });
  if (els.btn100) els.btn100.addEventListener("click", function () { if (state.hasImage) { compute100Transform(); render(); } });

  if (els.zoomRange) {
    els.zoomRange.addEventListener("input", function () {
      var pct = parseInt(els.zoomRange.value, 10) || 100;
      if (!state.hasImage) { setZoomUIFromScale(pct / 100); return; }
      applyZoomPercent(pct);
      render();
    });
  }

  if (els.btnZoomOut) {
    els.btnZoomOut.addEventListener("click", function () {
      var pct = parseInt((els.zoomRange && els.zoomRange.value) || "100", 10) || 100;
      pct = clamp(pct - 10, 25, 400);
      if (els.zoomRange) els.zoomRange.value = String(pct);
      if (state.hasImage) applyZoomPercent(pct);
      setZoomUIFromScale(pct / 100);
      render();
    });
  }

  if (els.btnZoomIn) {
    els.btnZoomIn.addEventListener("click", function () {
      var pct = parseInt((els.zoomRange && els.zoomRange.value) || "100", 10) || 100;
      pct = clamp(pct + 10, 25, 400);
      if (els.zoomRange) els.zoomRange.value = String(pct);
      if (state.hasImage) applyZoomPercent(pct);
      setZoomUIFromScale(pct / 100);
      render();
    });
  }

  if (els.modeAdd) els.modeAdd.addEventListener("click", function () { setMode("add"); });
  if (els.modeEdit) els.modeEdit.addEventListener("click", function () { setMode("edit"); });
  if (els.modePan) els.modePan.addEventListener("click", function () { setMode("pan"); });

  if (els.btnDeleteMask) els.btnDeleteMask.addEventListener("click", deleteActive);
  if (els.btnDuplicateMask) els.btnDuplicateMask.addEventListener("click", duplicateActive);

  if (els.btnClearMasks) els.btnClearMasks.addEventListener("click", function () { if (state.hasImage) resetMasksOnly(); });
  if (els.btnClearAll) {
    els.btnClearAll.addEventListener("click", function () {
      if (!state.hasImage) { resetAll(); return; }
      if (!confirm(t("画像も含めて全リセットしますか？", "Reset everything including the image?"))) return;
      resetAll();
    });
  }

  for (var i = 0; i < els.maskTypeRadios.length; i++) {
    els.maskTypeRadios[i].addEventListener("change", function () {
      if (!this.checked) return;
      applyTypeToActive(this.value);
    });
  }

  if (els.strengthRange) els.strengthRange.addEventListener("input", updateStrengthLabel);

  if (els.btnPreview) els.btnPreview.addEventListener("click", openPreviewAndRender);
  if (els.closePreview) els.closePreview.addEventListener("click", closePreview);
  if (els.modal) {
    els.modal.addEventListener("click", function (e) { if (e.target === els.modal) closePreview(); });
  }

  if (els.btnExport) els.btnExport.addEventListener("click", downloadDirectlyBlocked);
  if (els.btnDownload) els.btnDownload.addEventListener("click", downloadDirectlyBlocked);

  // --- keyboard shortcuts ---
  window.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    var typing = (tag === "input" || tag === "textarea" || e.target.isContentEditable);

    if (e.key === " " && !typing) { e.preventDefault(); beginSpacePan(); return; }

    var isUndo = ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "z" || e.key === "Z"));
    if (isUndo && !typing) { e.preventDefault(); undoOnce(); return; }

    if (!state.hasImage) return;

    if ((e.key === "Delete" || e.key === "Backspace") && state.activeId && !typing) {
      e.preventDefault(); deleteActive();
    }

    // R09: nudge active mask with arrow keys (Edit mode)
    if (!typing && state.hasImage && state.mode === "edit" && state.activeId) {
      var k = e.key;
      if (k === "ArrowLeft" || k === "ArrowRight" || k === "ArrowUp" || k === "ArrowDown") {
        e.preventDefault();
        var step = e.shiftKey ? 10 : 1;
        var m = getActiveMask();
        if (!m) return;
        var now = Date.now();
        if (!state.lastNudgeTs || (now - state.lastNudgeTs) > 700) pushHistory("nudge");
        state.lastNudgeTs = now;
        if (k === "ArrowLeft") m.x -= step;
        if (k === "ArrowRight") m.x += step;
        if (k === "ArrowUp") m.y -= step;
        if (k === "ArrowDown") m.y += step;
        var r = clampRectToImage(m);
        m.x = r.x; m.y = r.y; m.w = r.w; m.h = r.h;
        render();
        renderMaskChips();
        return;
      }
    }

    // R09: bring active mask to front quickly (F)
    if (!typing && state.hasImage && state.activeId && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      pushHistory("front");
      bringToFront(state.activeId);
      renderMaskChips();
      render();
      return;
    }

    if (e.key === "Escape") {
      if (els.modal && !els.modal.classList.contains("hidden")) closePreview();
    }
  });

  window.addEventListener("keyup", function(e){
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    var typing = (tag === "input" || tag === "textarea" || e.target.isContentEditable);
    if (e.key === " " && !typing) { e.preventDefault(); endSpacePan(); }
  });

  window.addEventListener("resize", function () {
    resizeCanvasToImageAspect();
    if (state.hasImage) {
      var cwCss = parseFloat(els.canvas.style.width || els.canvas.clientWidth || 800);
      var chCss = parseFloat(els.canvas.style.height || els.canvas.clientHeight || 450);
      state.viewTx = (cwCss - state.imgW * state.viewScale) / 2;
      state.viewTy = (chCss - state.imgH * state.viewScale) / 2;
    }
    render();
    if (els.modal && !els.modal.classList.contains("hidden")) openPreviewAndRender();
    updateHelpHUD();
  });

  // --- init ---
  applyLang(currentLang);
  resizeCanvasToImageAspect();
  setHintsVisible(true);
  setZoomUIFromScale(1);
  setMode("add");

  state.currentType = "solid";
  state.currentStrength = SAFETY.recommendStrength;

  syncControlsFromActive();
  updateStrengthLabel();
  renderMaskChips();
  render();
  ensureHelpHUD();
  updateHelpHUD();

})();


// =============================
// R10: QA checklist (built-in)
// =============================
function qaKey(){ return 'nw_redact_qa_v1'; }
function loadQA(){ try{ var raw=localStorage.getItem(qaKey()); return raw?JSON.parse(raw):{}; }catch(e){ return {}; } }
function saveQA(obj){ try{ localStorage.setItem(qaKey(), JSON.stringify(obj||{})); }catch(e){} }
function ensureQAModal(){
  if (document.querySelector('[data-qa-overlay="1"]')) return;
  var ov=document.createElement('div'); ov.setAttribute('data-qa-overlay','1');
  ov.style.position='fixed'; ov.style.inset='0'; ov.style.background='rgba(0,0,0,0.72)';
  ov.style.display='none'; ov.style.zIndex='9999'; ov.style.padding='18px'; ov.style.boxSizing='border-box';
  var card=document.createElement('div'); card.setAttribute('data-qa-card','1');
  card.style.maxWidth='720px'; card.style.margin='0 auto'; card.style.background='rgba(18,24,40,0.98)';
  card.style.border='1px solid rgba(255,255,255,0.14)'; card.style.borderRadius='18px';
  card.style.boxShadow='0 20px 60px rgba(0,0,0,0.45)'; card.style.color='rgba(255,255,255,0.92)';
  card.style.overflow='hidden';
  var head=document.createElement('div'); head.style.padding='14px 16px'; head.style.display='flex';
  head.style.alignItems='center'; head.style.justifyContent='space-between';
  head.style.borderBottom='1px solid rgba(255,255,255,0.10)';
  var ttl=document.createElement('div'); ttl.style.fontWeight='900'; ttl.style.letterSpacing='0.2px';
  ttl.textContent=t('最終QAチェック（事故防止）','Final QA Checklist (Accident Prevention)');
  var close=document.createElement('button'); close.type='button'; close.textContent='✕';
  close.style.width='40px'; close.style.height='36px'; close.style.borderRadius='12px';
  close.style.background='rgba(255,255,255,0.08)'; close.style.border='1px solid rgba(255,255,255,0.16)';
  close.style.color='rgba(255,255,255,0.92)'; close.style.fontWeight='900';
  close.addEventListener('click', function(){ hideQAModal(); });
  head.appendChild(ttl); head.appendChild(close);
  var body=document.createElement('div'); body.style.padding='14px 16px 16px'; body.style.maxHeight='70vh';
  body.style.overflow='auto';
  var note=document.createElement('div'); note.style.fontSize='12px'; note.style.lineHeight='1.55';
  note.style.opacity='0.92'; note.style.marginBottom='12px';
  note.textContent=t('推奨：黒塗り(solid)が最も安全。ぼかし/モザイクは強度不足だと事故ります。保存前に必ずプレビューでズーム確認。',
                 'Recommended: solid blackout is safest. Blur/Pixelate can fail if too weak. Before saving, always zoom-check in preview.');
  var list=document.createElement('div'); list.setAttribute('data-qa-list','1');
  var items=[
    {id:'img_loaded',ja:'画像が正しい（別画像を誤って読み込んでいない）',en:'Correct image loaded (not the wrong file)'},
    {id:'solid_ok',ja:'隠す必要がある箇所は solid（黒塗り）で足りている',en:'Sensitive parts are safely covered with solid blackout'},
    {id:'blur_strength',ja:'ぼかし/モザイクは十分強い（弱いと事故）',en:'Blur/Pixelate strength is sufficiently strong'},
    {id:'multi_masks',ja:'複数箇所を全部覆った（漏れがない）',en:'All sensitive areas are covered (no misses)'},
    {id:'zoom_check',ja:'プレビューでズーム確認した（文字/QR/顔の端を確認）',en:'Zoom-checked in preview (text/QR/face edges)'},
    {id:'save_ok',ja:'保存後に保存ファイルを開いて再確認する',en:'After saving, open the output file and verify again'}
  ];
  var st=loadQA();
  function updateSummary(sum){ var done=0; for(var i=0;i<items.length;i++) if(st[items[i].id]) done++; sum.textContent=t('完了：','Done: ')+done+' / '+items.length; }
  function row(item,sum){
    var r=document.createElement('label'); r.style.display='flex'; r.style.gap='10px'; r.style.alignItems='flex-start';
    r.style.padding='10px 10px'; r.style.borderRadius='14px'; r.style.border='1px solid rgba(255,255,255,0.12)';
    r.style.background='rgba(255,255,255,0.06)'; r.style.marginBottom='10px';
    var cb=document.createElement('input'); cb.type='checkbox'; cb.checked=!!st[item.id]; cb.style.marginTop='3px';
    cb.addEventListener('change', function(){ st[item.id]=cb.checked; saveQA(st); updateSummary(sum); });
    var tx=document.createElement('div'); tx.style.fontSize='13px'; tx.style.lineHeight='1.45'; tx.textContent=t(item.ja,item.en);
    r.appendChild(cb); r.appendChild(tx); return r;
  }
  var summary=document.createElement('div'); summary.setAttribute('data-qa-summary','1'); summary.style.fontSize='12px';
  summary.style.opacity='0.92'; summary.style.marginTop='8px';
  for(var i=0;i<items.length;i++) list.appendChild(row(items[i],summary)); updateSummary(summary);
  var actions=document.createElement('div'); actions.style.display='flex'; actions.style.gap='10px'; actions.style.flexWrap='wrap'; actions.style.marginTop='12px';
  var reset=document.createElement('button'); reset.type='button'; reset.textContent=t('チェックを全て解除','Clear checks');
  reset.style.padding='10px 12px'; reset.style.borderRadius='12px'; reset.style.background='rgba(255,255,255,0.08)';
  reset.style.border='1px solid rgba(255,255,255,0.16)'; reset.style.color='rgba(255,255,255,0.92)'; reset.style.fontWeight='900';
  reset.addEventListener('click', function(){ st={}; saveQA(st); while(list.firstChild) list.removeChild(list.firstChild); for(var i=0;i<items.length;i++) list.appendChild(row(items[i],summary)); updateSummary(summary); });
  actions.appendChild(reset);
  body.appendChild(note); body.appendChild(list); body.appendChild(summary); body.appendChild(actions);
  card.appendChild(head); card.appendChild(body); ov.appendChild(card);
  ov.addEventListener('click', function(e){ if(e.target===ov) hideQAModal(); });
  document.body.appendChild(ov);
}
function showQAModal(){ ensureQAModal(); var ov=document.querySelector('[data-qa-overlay="1"]'); if(ov) ov.style.display='block'; }
function hideQAModal(){ var ov=document.querySelector('[data-qa-overlay="1"]'); if(ov) ov.style.display='none'; }
function wireQABtn(){ var b=document.getElementById('qaBtn'); if(!b || b.__wired) return; b.__wired=true; b.addEventListener('click', function(){ showQAModal(); }); }
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', wireQABtn); } else { wireQABtn(); }


/* NW_R10_QA_MODAL_V1 */
(function(){
  function t(ja,en){
    try{
      // 既存のi18nがあるならそれを優先
      if (typeof window.t === "function") return window.t(ja,en);
      // data-lang="en" を押した場合など、簡易判定（なければ日本語）
      var html = document.documentElement;
      var lang = (html && html.getAttribute("lang")) ? html.getAttribute("lang") : "";
      if (lang && lang.toLowerCase().indexOf("en") >= 0) return en;
      return ja;
    }catch(e){ return ja; }
  }

  function qaKey(){ return "nw_redact_qa_v1"; }
  function loadQA(){
    try{ return JSON.parse(localStorage.getItem(qaKey())||"{}")||{}; }
    catch(e){ return {}; }
  }
  function saveQA(st){
    try{ localStorage.setItem(qaKey(), JSON.stringify(st||{})); }catch(e){}
  }

  function ensureModal(){
    if (document.querySelector('[data-qa-overlay="1"]')) return;

    var ov = document.createElement("div");
    ov.setAttribute("data-qa-overlay","1");
    ov.style.position = "fixed";
    ov.style.inset = "0";
    ov.style.zIndex = "99999";
    ov.style.display = "none";
    ov.style.background = "rgba(2,6,23,0.55)";
    ov.style.padding = "16px";
    ov.style.boxSizing = "border-box";

    var card = document.createElement("div");
    card.setAttribute("data-qa-card","1");
    card.style.maxWidth = "760px";
    card.style.margin = "0 auto";
    card.style.background = "#ffffff";
    card.style.border = "1px solid rgba(15,23,42,0.16)";
    card.style.borderRadius = "18px";
    card.style.boxShadow = "0 18px 55px rgba(2,6,23,0.18)";
    card.style.overflow = "hidden";
    card.style.color = "rgba(15,23,42,0.92)";

    var head = document.createElement("div");
    head.style.display = "flex";
    head.style.alignItems = "center";
    head.style.justifyContent = "space-between";
    head.style.padding = "12px 14px";
    head.style.borderBottom = "1px solid rgba(15,23,42,0.10)";

    var ttl = document.createElement("div");
    ttl.style.fontWeight = "900";
    ttl.textContent = t("最終QAチェック（事故防止）","Final QA Checklist (Accident Prevention)");

    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.style.width = "42px";
    close.style.height = "36px";
    close.style.borderRadius = "12px";
    close.style.border = "1px solid rgba(15,23,42,0.16)";
    close.style.background = "rgba(2,6,23,0.03)";
    close.style.cursor = "pointer";
    close.style.fontWeight = "900";
    close.addEventListener("click", function(){ hide(); });

    head.appendChild(ttl);
    head.appendChild(close);

    var body = document.createElement("div");
    body.style.padding = "12px 14px 14px";
    body.style.maxHeight = "72vh";
    body.style.overflow = "auto";

    var note = document.createElement("div");
    note.style.fontSize = "12px";
    note.style.lineHeight = "1.55";
    note.style.color = "rgba(15,23,42,0.72)";
    note.style.marginBottom = "10px";
    note.textContent = t(
      "推奨：黒塗り(solid)が最も安全。ぼかし/モザイクは弱いと事故ります。保存前にプレビューでズーム確認。",
      "Recommended: solid blackout is safest. Weak blur/pixelate can fail. Zoom-check in preview before saving."
    );

    var items = [
      {id:"img_loaded", ja:"画像が正しい（別画像を誤って読み込んでいない）", en:"Correct image loaded (not the wrong file)"},
      {id:"solid_ok", ja:"隠す必要がある箇所は solid（黒塗り）で足りている", en:"Sensitive parts are covered with solid blackout"},
      {id:"blur_strength", ja:"ぼかし/モザイクは十分強い（弱いと事故）", en:"Blur/Pixelate strength is sufficiently strong"},
      {id:"multi_masks", ja:"複数箇所を全部覆った（漏れがない）", en:"All sensitive areas are covered (no misses)"},
      {id:"zoom_check", ja:"プレビューでズーム確認した（文字/QR/顔の端）", en:"Zoom-checked in preview (text/QR/face edges)"},
      {id:"save_ok", ja:"保存後に保存ファイルを開いて再確認する", en:"After saving, open the output file and verify again"}
    ];

    var st = loadQA();

    var list = document.createElement("div");
    var summary = document.createElement("div");
    summary.style.marginTop = "8px";
    summary.style.fontSize = "12px";
    summary.style.color = "rgba(15,23,42,0.72)";
    summary.style.fontWeight = "900";

    function updateSummary(){
      var done = 0;
      for (var i=0;i<items.length;i++) if (st[items[i].id]) done++;
      summary.textContent = t("完了：","Done: ") + done + " / " + items.length;
    }

    function row(it){
      var lab = document.createElement("label");
      lab.style.display = "flex";
      lab.style.gap = "10px";
      lab.style.alignItems = "flex-start";
      lab.style.padding = "10px 10px";
      lab.style.borderRadius = "14px";
      lab.style.border = "1px solid rgba(15,23,42,0.12)";
      lab.style.background = "rgba(2,6,23,0.02)";
      lab.style.marginBottom = "10px";
      lab.style.cursor = "pointer";

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!st[it.id];
      cb.style.marginTop = "3px";
      cb.addEventListener("change", function(){
        st[it.id] = cb.checked;
        saveQA(st);
        updateSummary();
      });

      var tx = document.createElement("div");
      tx.style.fontSize = "13px";
      tx.style.lineHeight = "1.45";
      tx.textContent = t(it.ja, it.en);

      lab.appendChild(cb);
      lab.appendChild(tx);
      return lab;
    }

    for (var i=0;i<items.length;i++) list.appendChild(row(items[i]));
    updateSummary();

    var actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "10px";
    actions.style.flexWrap = "wrap";
    actions.style.marginTop = "12px";

    function mkBtn(label){
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.style.padding = "10px 12px";
      b.style.borderRadius = "12px";
      b.style.border = "1px solid rgba(15,23,42,0.16)";
      b.style.background = "rgba(2,6,23,0.03)";
      b.style.cursor = "pointer";
      b.style.fontWeight = "900";
      return b;
    }

    var clear = mkBtn(t("チェックを全て解除","Clear checks"));
    clear.addEventListener("click", function(){
      st = {};
      saveQA(st);
      // 再描画（簡易）
      while(list.firstChild) list.removeChild(list.firstChild);
      for (var i=0;i<items.length;i++) list.appendChild(row(items[i]));
      updateSummary();
    });

    var goPreview = mkBtn(t("プレビューへ（ズーム確認）","Go to Preview (zoom-check)"));
    goPreview.addEventListener("click", function(){
      hide();
      // 既存があるなら呼ぶ
      try{
        var btn = document.getElementById("btnPreview");
        if (btn) btn.click();
      }catch(e){}
    });

    actions.appendChild(clear);
    actions.appendChild(goPreview);

    body.appendChild(note);
    body.appendChild(list);
    body.appendChild(summary);
    body.appendChild(actions);

    card.appendChild(head);
    card.appendChild(body);

    ov.appendChild(card);

    ov.addEventListener("click", function(e){
      if (e.target === ov) hide();
    });

    document.body.appendChild(ov);
  }

  function show(){
    ensureModal();
    var ov = document.querySelector('[data-qa-overlay="1"]');
    if (ov) ov.style.display = "block";
  }
  function hide(){
    var ov = document.querySelector('[data-qa-overlay="1"]');
    if (ov) ov.style.display = "none";
  }

  function wire(){
    var b = document.getElementById("qaBtn");
    if (!b) return;
    if (b.__nwQaWired) return;
    b.__nwQaWired = true;
    b.addEventListener("click", function(e){
      e.preventDefault();
      show();
    });
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }

  // デバッグ用にグローバルも生やす（必要なら console から叩ける）
  window.__nwQAShow = show;
  window.__nwQAHide = hide;
})();

