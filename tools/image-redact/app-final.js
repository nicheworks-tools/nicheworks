// tools/image-redact/app-final.js
// Clean single-page implementation for Image Redact. Browser-only. No upload.
(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function nowName() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }

  var els = {
    file: $("#fileInput"),
    drop: $("#dropZone"),
    canvas: $("#canvas"),
    wrap: $(".canvas-wrap"),
    emptyJa: $("#emptyHint"),
    emptyEn: $("#emptyHintEn"),
    fit: $("#btnFit"),
    one: $("#btn100"),
    zoomOut: $("#btnZoomOut"),
    zoomIn: $("#btnZoomIn"),
    zoomRange: $("#zoomRange"),
    zoomLabel: $("#zoomLabel"),
    modeAdd: $("#modeAdd"),
    modeEdit: $("#modeEdit"),
    modePan: $("#modePan"),
    typeRadios: $all('input[name="maskType"]'),
    strength: $("#strengthRange"),
    strengthLabel: $("#strengthLabel"),
    deleteMask: $("#btnDeleteMask"),
    duplicateMask: $("#btnDuplicateMask"),
    clearMasks: $("#btnClearMasks"),
    clearAll: $("#btnClearAll"),
    chips: $("#maskChips"),
    maskCount: $("#maskCount"),
    preview: $("#btnPreview"),
    modal: $("#previewModal"),
    closePreview: $("#btnClosePreview"),
    previewCanvas: $("#previewCanvas"),
    previewFit: $("#btnPreviewFit"),
    preview100: $("#btnPreview100"),
    saveMain: $("#btnSavePng"),
    saveModal: $("#btnSavePng2"),
    qa: $("#qaBtn"),
    status: $("#saveStatus"),
    checklist: $("#safetyChecklist")
  };

  var lang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  var state = {
    image: null,
    imageUrl: "",
    w: 0,
    h: 0,
    originalW: 0,
    originalH: 0,
    downscaled: false,
    masks: [],
    activeId: null,
    mode: "add",
    type: "solid",
    strength: 16,
    scale: 1,
    tx: 0,
    ty: 0,
    drag: null,
    previewZoom: "fit"
  };

  var LIMITS = { maxSide: 6000, maxMp: 24, minMask: 8, weakStrength: 16 };

  function t(ja, en) { return lang === "ja" ? ja : en; }
  function uid() { return "m_" + Math.random().toString(16).slice(2) + Date.now().toString(16); }

  function injectActiveStyle() {
    if ($("#image-redact-final-style")) return;
    var style = document.createElement("style");
    style.id = "image-redact-final-style";
    style.textContent = [
      ".btn.active{background:rgba(37,99,235,.16);border-color:rgba(37,99,235,.48);box-shadow:inset 0 0 0 1px rgba(37,99,235,.22)}",
      ".chip.active{background:rgba(37,99,235,.16);border-color:rgba(37,99,235,.42)}",
      ".canvas-wrap.is-dragging{cursor:crosshair}",
      ".canvas-wrap.is-panning{cursor:grab}",
      ".canvas-wrap.is-editing{cursor:move}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function applyLang(next) {
    lang = next || lang;
    $all("[data-i18n]").forEach(function (node) {
      node.style.display = node.dataset.i18n === lang ? "" : "none";
    });
    $all(".nw-lang-switch button").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    updateHints();
  }

  function setStatus(msg, kind) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.classList.add("is-visible");
    els.status.classList.toggle("is-ok", kind === "ok");
    els.status.classList.toggle("is-error", kind === "error");
  }

  function clearStatus() {
    if (!els.status) return;
    els.status.textContent = "";
    els.status.classList.remove("is-visible", "is-ok", "is-error");
  }

  function activeMask() {
    return state.masks.find(function (m) { return m.id === state.activeId; }) || null;
  }

  function setMode(mode) {
    state.mode = mode;
    [els.modeAdd, els.modeEdit, els.modePan].forEach(function (btn) { if (btn) btn.classList.remove("active"); });
    if (mode === "add" && els.modeAdd) els.modeAdd.classList.add("active");
    if (mode === "edit" && els.modeEdit) els.modeEdit.classList.add("active");
    if (mode === "pan" && els.modePan) els.modePan.classList.add("active");
    if (els.wrap) {
      els.wrap.classList.toggle("is-dragging", mode === "add");
      els.wrap.classList.toggle("is-editing", mode === "edit");
      els.wrap.classList.toggle("is-panning", mode === "pan");
    }
  }

  function setCurrentType(type) {
    state.type = type;
    var m = activeMask();
    if (m) {
      m.type = type;
      if (type !== "solid" && !m.strength) m.strength = state.strength;
    }
    syncControls();
    render();
  }

  function setStrength(value) {
    state.strength = clamp(parseInt(value, 10) || 16, 1, 32);
    var m = activeMask();
    if (m && m.type !== "solid") m.strength = state.strength;
    syncControls();
    render();
  }

  function syncControls() {
    var m = activeMask();
    var type = m ? m.type : state.type;
    var strength = m && m.type !== "solid" ? (m.strength || state.strength) : state.strength;
    els.typeRadios.forEach(function (r) { r.checked = r.value === type; });
    if (els.strength) els.strength.value = String(strength);
    if (els.strengthLabel) els.strengthLabel.textContent = String(strength);
    if (els.maskCount) els.maskCount.textContent = String(state.masks.length);
    renderChips();
  }

  function updateHints() {
    var empty = !state.image;
    if (els.emptyJa) els.emptyJa.style.display = empty && lang === "ja" ? "" : "none";
    if (els.emptyEn) els.emptyEn.style.display = empty && lang === "en" ? "" : "none";
  }

  function fitCanvasSize() {
    if (!els.canvas) return;
    var cw = els.wrap && els.wrap.clientWidth ? els.wrap.clientWidth : 800;
    var ch = state.image ? Math.round(cw * state.h / state.w) : Math.round(cw * 9 / 16);
    ch = clamp(ch, 220, Math.round(window.innerHeight * 0.68));
    var ratio = Math.max(1, window.devicePixelRatio || 1);
    els.canvas.style.width = cw + "px";
    els.canvas.style.height = ch + "px";
    els.canvas.width = Math.round(cw * ratio);
    els.canvas.height = Math.round(ch * ratio);
  }

  function canvasCssSize() {
    return {
      w: parseFloat(els.canvas.style.width || els.canvas.clientWidth || 800),
      h: parseFloat(els.canvas.style.height || els.canvas.clientHeight || 450)
    };
  }

  function fitView() {
    if (!state.image) return;
    fitCanvasSize();
    var s = canvasCssSize();
    state.scale = Math.min(s.w / state.w, s.h / state.h);
    state.scale = clamp(state.scale, 0.05, 8);
    state.tx = (s.w - state.w * state.scale) / 2;
    state.ty = (s.h - state.h * state.scale) / 2;
    updateZoomUi();
    render();
  }

  function oneToOneView() {
    if (!state.image) return;
    fitCanvasSize();
    var s = canvasCssSize();
    state.scale = 1;
    state.tx = (s.w - state.w) / 2;
    state.ty = (s.h - state.h) / 2;
    updateZoomUi();
    render();
  }

  function zoomAtCenter(nextScale) {
    if (!state.image) return;
    var s = canvasCssSize();
    var cx = s.w / 2;
    var cy = s.h / 2;
    var ix = (cx - state.tx) / state.scale;
    var iy = (cy - state.ty) / state.scale;
    state.scale = clamp(nextScale, 0.05, 8);
    state.tx = cx - ix * state.scale;
    state.ty = cy - iy * state.scale;
    updateZoomUi();
    render();
  }

  function updateZoomUi() {
    var pct = Math.round(state.scale * 100);
    if (els.zoomRange) els.zoomRange.value = String(clamp(pct, 25, 400));
    if (els.zoomLabel) els.zoomLabel.textContent = pct + "%";
  }

  function canvasPoint(evt) {
    var r = els.canvas.getBoundingClientRect();
    return { x: evt.clientX - r.left, y: evt.clientY - r.top };
  }

  function imagePointFromCss(pt) {
    return { x: (pt.x - state.tx) / state.scale, y: (pt.y - state.ty) / state.scale };
  }

  function clampRect(rect) {
    var x = clamp(rect.x, 0, state.w);
    var y = clamp(rect.y, 0, state.h);
    var w = clamp(rect.w, 0, state.w - x);
    var h = clamp(rect.h, 0, state.h - y);
    return { x: x, y: y, w: w, h: h };
  }

  function normRect(a, b) {
    return clampRect({
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(a.x - b.x),
      h: Math.abs(a.y - b.y)
    });
  }

  function handleSize() { return (window.matchMedia && window.matchMedia("(pointer: coarse)").matches ? 22 : 14) / state.scale; }

  function hitHandle(m, p) {
    var hs = handleSize();
    var cx = m.x + m.w / 2;
    var cy = m.y + m.h / 2;
    var pts = [
      ["nw", m.x, m.y], ["n", cx, m.y], ["ne", m.x + m.w, m.y],
      ["e", m.x + m.w, cy], ["se", m.x + m.w, m.y + m.h], ["s", cx, m.y + m.h],
      ["sw", m.x, m.y + m.h], ["w", m.x, cy]
    ];
    for (var i = 0; i < pts.length; i++) {
      if (Math.abs(p.x - pts[i][1]) <= hs && Math.abs(p.y - pts[i][2]) <= hs) return pts[i][0];
    }
    return "";
  }

  function pointInMask(p, m) {
    return p.x >= m.x && p.x <= m.x + m.w && p.y >= m.y && p.y <= m.y + m.h;
  }

  function hitMask(p) {
    for (var i = state.masks.length - 1; i >= 0; i--) {
      var m = state.masks[i];
      var h = hitHandle(m, p);
      if (h) return { mask: m, kind: "resize", handle: h };
      if (pointInMask(p, m)) return { mask: m, kind: "move", handle: "" };
    }
    return null;
  }

  function resizeMask(original, handle, p) {
    var left = original.x;
    var top = original.y;
    var right = original.x + original.w;
    var bottom = original.y + original.h;
    if (handle.indexOf("w") !== -1) left = p.x;
    if (handle.indexOf("e") !== -1) right = p.x;
    if (handle.indexOf("n") !== -1) top = p.y;
    if (handle.indexOf("s") !== -1) bottom = p.y;
    var r = normRect({ x: left, y: top }, { x: right, y: bottom });
    if (r.w < LIMITS.minMask) r.w = LIMITS.minMask;
    if (r.h < LIMITS.minMask) r.h = LIMITS.minMask;
    return clampRect(r);
  }

  function render() {
    if (!els.canvas) return;
    fitCanvasSize();
    var ctx = els.canvas.getContext("2d");
    var ratio = Math.max(1, window.devicePixelRatio || 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);
    updateHints();
    if (!state.image) return;

    ctx.setTransform(state.scale * ratio, 0, 0, state.scale * ratio, state.tx * ratio, state.ty * ratio);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(state.image, 0, 0, state.w, state.h);

    state.masks.forEach(function (m) {
      var active = m.id === state.activeId;
      ctx.save();
      if (m.type === "solid") ctx.fillStyle = active ? "rgba(0,0,0,.62)" : "rgba(0,0,0,.48)";
      else if (m.type === "blur") ctx.fillStyle = "rgba(37,99,235,.22)";
      else ctx.fillStyle = "rgba(245,158,11,.24)";
      ctx.fillRect(m.x, m.y, m.w, m.h);
      ctx.lineWidth = (active ? 2.2 : 1.2) / state.scale;
      ctx.strokeStyle = active ? "rgba(255,255,255,.98)" : "rgba(255,255,255,.68)";
      ctx.strokeRect(m.x, m.y, m.w, m.h);
      if (active) drawHandles(ctx, m);
      ctx.restore();
    });

    if (state.drag && state.drag.kind === "create") {
      var r = normRect(state.drag.start, state.drag.current);
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,.12)";
      ctx.strokeStyle = "rgba(255,255,255,.98)";
      ctx.lineWidth = 2 / state.scale;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.restore();
    }
  }

  function drawHandles(ctx, m) {
    var size = handleSize();
    var cx = m.x + m.w / 2;
    var cy = m.y + m.h / 2;
    var pts = [[m.x, m.y], [cx, m.y], [m.x + m.w, m.y], [m.x + m.w, cy], [m.x + m.w, m.y + m.h], [cx, m.y + m.h], [m.x, m.y + m.h], [m.x, cy]];
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(0,0,0,.55)";
    ctx.lineWidth = 1 / state.scale;
    pts.forEach(function (p) {
      ctx.beginPath();
      ctx.rect(p[0] - size / 2, p[1] - size / 2, size, size);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  function renderChips() {
    if (!els.chips) return;
    els.chips.innerHTML = "";
    state.masks.forEach(function (m, index) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (m.id === state.activeId ? " active" : "");
      b.textContent = "#" + (index + 1) + " " + m.type + (m.type !== "solid" ? " " + (m.strength || state.strength) : "");
      b.addEventListener("click", function () {
        state.activeId = m.id;
        syncControls();
        setMode("edit");
        render();
      });
      els.chips.appendChild(b);
    });
    if (els.maskCount) els.maskCount.textContent = String(state.masks.length);
  }

  function loadFile(file) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setStatus(t("PNG / JPG / WebP の画像を選択してください。HEICは未対応です。", "Choose a PNG / JPG / WebP image. HEIC is not supported."), "error");
      return;
    }
    clearStatus();
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      prepareImage(img, url);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      setStatus(t("画像を読み込めませんでした。別の画像で試してください。", "Could not load the image. Try another file."), "error");
    };
    img.src = url;
  }

  function prepareImage(img, url) {
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
    state.imageUrl = url;
    state.originalW = img.naturalWidth || img.width;
    state.originalH = img.naturalHeight || img.height;
    var scale = 1;
    var mp = state.originalW * state.originalH / 1000000;
    if (state.originalW > LIMITS.maxSide || state.originalH > LIMITS.maxSide || mp > LIMITS.maxMp) {
      scale = Math.min(LIMITS.maxSide / state.originalW, LIMITS.maxSide / state.originalH, Math.sqrt(LIMITS.maxMp / mp));
      scale = clamp(scale, 0.05, 1);
    }
    state.downscaled = scale < 1;
    if (state.downscaled) {
      var c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(state.originalW * scale));
      c.height = Math.max(1, Math.round(state.originalH * scale));
      var cx = c.getContext("2d");
      cx.imageSmoothingEnabled = true;
      cx.imageSmoothingQuality = "high";
      cx.drawImage(img, 0, 0, c.width, c.height);
      state.image = c;
      state.w = c.width;
      state.h = c.height;
      setStatus(t("大きい画像のため、ブラウザ保護のため編集用に縮小しました。保存後のサイズを確認してください。", "Large image downscaled for browser safety. Check the saved size."), "error");
    } else {
      state.image = img;
      state.w = state.originalW;
      state.h = state.originalH;
    }
    state.masks = [];
    state.activeId = null;
    state.type = "solid";
    state.strength = 16;
    syncControls();
    fitView();
    setMode("add");
  }

  function addMask(a, b) {
    var r = normRect(a, b);
    if (r.w < LIMITS.minMask || r.h < LIMITS.minMask) return;
    var m = { id: uid(), x: r.x, y: r.y, w: r.w, h: r.h, type: state.type, strength: state.strength };
    state.masks.push(m);
    state.activeId = m.id;
    syncControls();
    render();
  }

  function onPointerDown(evt) {
    if (!state.image) return;
    els.canvas.setPointerCapture(evt.pointerId);
    var cp = canvasPoint(evt);
    var ip = imagePointFromCss(cp);
    if (state.mode === "pan" || evt.button === 1 || evt.altKey) {
      state.drag = { kind: "pan", startCss: cp, tx: state.tx, ty: state.ty };
      return;
    }
    if (state.mode === "edit") {
      var hit = hitMask(ip);
      if (hit) {
        state.activeId = hit.mask.id;
        state.drag = { kind: hit.kind, handle: hit.handle, start: ip, original: Object.assign({}, hit.mask) };
        syncControls();
        render();
      } else {
        state.activeId = null;
        syncControls();
        render();
      }
      return;
    }
    state.drag = { kind: "create", start: ip, current: ip };
  }

  function onPointerMove(evt) {
    if (!state.drag || !state.image) return;
    var cp = canvasPoint(evt);
    var ip = imagePointFromCss(cp);
    if (state.drag.kind === "pan") {
      state.tx = state.drag.tx + cp.x - state.drag.startCss.x;
      state.ty = state.drag.ty + cp.y - state.drag.startCss.y;
      render();
      return;
    }
    if (state.drag.kind === "create") {
      state.drag.current = ip;
      render();
      return;
    }
    var m = activeMask();
    if (!m) return;
    if (state.drag.kind === "move") {
      var dx = ip.x - state.drag.start.x;
      var dy = ip.y - state.drag.start.y;
      m.x = clamp(state.drag.original.x + dx, 0, state.w - m.w);
      m.y = clamp(state.drag.original.y + dy, 0, state.h - m.h);
      render();
      return;
    }
    if (state.drag.kind === "resize") {
      var r = resizeMask(state.drag.original, state.drag.handle, ip);
      Object.assign(m, r);
      render();
    }
  }

  function onPointerUp(evt) {
    if (!state.drag) return;
    if (state.drag.kind === "create") addMask(state.drag.start, state.drag.current);
    state.drag = null;
    try { els.canvas.releasePointerCapture(evt.pointerId); } catch (_) {}
    syncControls();
    render();
  }

  function deleteActive() {
    if (!state.activeId) return;
    state.masks = state.masks.filter(function (m) { return m.id !== state.activeId; });
    state.activeId = state.masks.length ? state.masks[state.masks.length - 1].id : null;
    syncControls();
    render();
  }

  function duplicateActive() {
    var m = activeMask();
    if (!m) return;
    var copy = Object.assign({}, m, { id: uid(), x: clamp(m.x + 16, 0, state.w - m.w), y: clamp(m.y + 16, 0, state.h - m.h) });
    state.masks.push(copy);
    state.activeId = copy.id;
    syncControls();
    render();
  }

  function clearMasks() {
    state.masks = [];
    state.activeId = null;
    syncControls();
    render();
  }

  function clearAll() {
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
    state.image = null;
    state.imageUrl = "";
    state.w = 0;
    state.h = 0;
    clearMasks();
    clearStatus();
    if (els.file) els.file.value = "";
    fitCanvasSize();
    render();
  }

  function applyRedactions(ctx) {
    state.masks.forEach(function (m) {
      var x = Math.round(m.x), y = Math.round(m.y), w = Math.round(m.w), h = Math.round(m.h);
      if (w <= 0 || h <= 0) return;
      if (m.type === "solid") {
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.fillRect(x, y, w, h);
        ctx.restore();
        return;
      }
      if (m.type === "blur") {
        var pad = clamp((m.strength || 16) * 2, 12, 80);
        var sx = clamp(x - pad, 0, state.w);
        var sy = clamp(y - pad, 0, state.h);
        var sw = clamp(w + pad * 2, 1, state.w - sx);
        var sh = clamp(h + pad * 2, 1, state.h - sy);
        var tmp = document.createElement("canvas");
        tmp.width = sw;
        tmp.height = sh;
        var tx = tmp.getContext("2d");
        tx.drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.filter = "blur(" + clamp(m.strength || 16, 1, 32) + "px)";
        ctx.drawImage(tmp, sx, sy);
        ctx.restore();
        return;
      }
      if (m.type === "pixelate") {
        var block = clamp(m.strength || 16, 4, 32);
        var smallW = Math.max(1, Math.ceil(w / block));
        var smallH = Math.max(1, Math.ceil(h / block));
        var pix = document.createElement("canvas");
        pix.width = smallW;
        pix.height = smallH;
        var px = pix.getContext("2d");
        px.imageSmoothingEnabled = true;
        px.drawImage(ctx.canvas, x, y, w, h, 0, 0, smallW, smallH);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(pix, 0, 0, smallW, smallH, x, y, w, h);
        ctx.restore();
      }
    });
  }

  function buildOutputCanvas() {
    if (!state.image) return null;
    var c = document.createElement("canvas");
    c.width = state.w;
    c.height = state.h;
    var ctx = c.getContext("2d");
    ctx.drawImage(state.image, 0, 0, state.w, state.h);
    applyRedactions(ctx);
    return c;
  }

  function weakMasks() {
    return state.masks.filter(function (m) { return m.type !== "solid" && (m.strength || state.strength) < LIMITS.weakStrength; });
  }

  function preflight(blockWeak) {
    if (!state.image) return t("画像が読み込まれていません。", "No image loaded.");
    if (state.masks.length === 0) return t("マスクが0件です。隠したい範囲をAddで囲んでください。", "There are no masks. Use Add and drag over sensitive areas.");
    if (blockWeak && weakMasks().length) return t("Blur / Pixelate の強度が弱い領域があります。16以上にするか、重要情報はSolidにしてください。", "Some Blur / Pixelate masks are weak. Use 16+ or Solid for sensitive info.");
    return "";
  }

  function openChecklist(message) {
    if (message) setStatus(message, "error");
    if (els.checklist) els.checklist.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function savePng() {
    var problem = preflight(true);
    if (problem) { openChecklist(problem); return; }
    var out = buildOutputCanvas();
    if (!out) { setStatus(t("保存できませんでした。", "Could not save."), "error"); return; }
    out.toBlob(function (blob) {
      if (!blob) { setStatus(t("PNG作成に失敗しました。", "PNG creation failed."), "error"); return; }
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "image-redacted-" + nowName() + ".png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      setStatus(t("PNGを保存しました。画像はブラウザ内で処理されました。EXIFなども消したい場合はEXIF Cleaner Miniを使ってください。", "PNG saved. The image was processed in your browser. Use EXIF Cleaner Mini too if you need metadata cleanup."), "ok");
    }, "image/png");
  }

  function showPreview() {
    var problem = preflight(false);
    if (problem && !state.image) { openChecklist(problem); return; }
    if (!state.image) return;
    var out = buildOutputCanvas();
    var pc = els.previewCanvas;
    if (!out || !pc) return;
    var maxW = state.previewZoom === "100" ? out.width : Math.min(1000, out.width);
    var scale = state.previewZoom === "100" ? 1 : maxW / out.width;
    pc.width = Math.max(1, Math.round(out.width * scale));
    pc.height = Math.max(1, Math.round(out.height * scale));
    var ctx = pc.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(out, 0, 0, pc.width, pc.height);
    if (els.modal) els.modal.classList.remove("hidden");
  }

  function closePreview() {
    if (els.modal) els.modal.classList.add("hidden");
  }

  function wireEvents() {
    $all(".nw-lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () { applyLang(btn.dataset.lang); });
    });
    if (els.file) els.file.addEventListener("change", function () { loadFile(els.file.files && els.file.files[0]); });
    if (els.drop) {
      els.drop.addEventListener("click", function () { if (els.file) els.file.click(); });
      els.drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (els.file) els.file.click(); } });
      ["dragenter", "dragover"].forEach(function (type) { els.drop.addEventListener(type, function (e) { e.preventDefault(); els.drop.classList.add("is-dragover"); }); });
      ["dragleave", "drop"].forEach(function (type) { els.drop.addEventListener(type, function (e) { e.preventDefault(); els.drop.classList.remove("is-dragover"); }); });
      els.drop.addEventListener("drop", function (e) { loadFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });
    }
    if (els.canvas) {
      els.canvas.addEventListener("pointerdown", onPointerDown);
      els.canvas.addEventListener("pointermove", onPointerMove);
      els.canvas.addEventListener("pointerup", onPointerUp);
      els.canvas.addEventListener("pointercancel", onPointerUp);
      els.canvas.addEventListener("wheel", function (e) { if (!state.image) return; e.preventDefault(); zoomAtCenter(state.scale * (e.deltaY < 0 ? 1.1 : 0.9)); }, { passive: false });
    }
    if (els.fit) els.fit.addEventListener("click", fitView);
    if (els.one) els.one.addEventListener("click", oneToOneView);
    if (els.zoomOut) els.zoomOut.addEventListener("click", function () { zoomAtCenter(state.scale * 0.9); });
    if (els.zoomIn) els.zoomIn.addEventListener("click", function () { zoomAtCenter(state.scale * 1.1); });
    if (els.zoomRange) els.zoomRange.addEventListener("input", function () { zoomAtCenter((parseInt(els.zoomRange.value, 10) || 100) / 100); });
    if (els.modeAdd) els.modeAdd.addEventListener("click", function () { setMode("add"); });
    if (els.modeEdit) els.modeEdit.addEventListener("click", function () { setMode("edit"); });
    if (els.modePan) els.modePan.addEventListener("click", function () { setMode("pan"); });
    els.typeRadios.forEach(function (r) { r.addEventListener("change", function () { if (r.checked) setCurrentType(r.value); }); });
    if (els.strength) els.strength.addEventListener("input", function () { setStrength(els.strength.value); });
    if (els.deleteMask) els.deleteMask.addEventListener("click", deleteActive);
    if (els.duplicateMask) els.duplicateMask.addEventListener("click", duplicateActive);
    if (els.clearMasks) els.clearMasks.addEventListener("click", clearMasks);
    if (els.clearAll) els.clearAll.addEventListener("click", clearAll);
    if (els.preview) els.preview.addEventListener("click", showPreview);
    if (els.closePreview) els.closePreview.addEventListener("click", closePreview);
    if (els.previewFit) els.previewFit.addEventListener("click", function () { state.previewZoom = "fit"; showPreview(); });
    if (els.preview100) els.preview100.addEventListener("click", function () { state.previewZoom = "100"; showPreview(); });
    if (els.saveMain) els.saveMain.addEventListener("click", savePng);
    if (els.saveModal) els.saveModal.addEventListener("click", savePng);
    if (els.qa) els.qa.addEventListener("click", function () {
      var problem = preflight(false);
      if (problem) setStatus(problem, "error");
      else setStatus(t("保存前チェックを表示しました。プレビューで拡大して読めないか確認してください。", "Safety checklist opened. Zoom into the preview and make sure nothing remains readable."), "ok");
      if (els.checklist) els.checklist.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    window.addEventListener("resize", function () { fitCanvasSize(); render(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePreview();
      if ((e.key === "Delete" || e.key === "Backspace") && document.activeElement === document.body) deleteActive();
    });
  }

  function init() {
    injectActiveStyle();
    applyLang(lang);
    setMode("add");
    setStrength(16);
    fitCanvasSize();
    render();
    wireEvents();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
