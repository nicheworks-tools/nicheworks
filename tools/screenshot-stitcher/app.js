(() => {
  const $ = (id) => document.getElementById(id);
  const state = {
    lang: "ja",
    items: [],
    renderedCanvas: null,
    renderedBlob: null,
    renderedExt: "png"
  };

  const t = {
    ja: {
      title: "スクショ縦結合",
      lead: "画像を追加して縦に1枚化。ブラウザ内だけで処理し、外部送信しません。",
      donateText: "継続的な改善のため、任意でご支援いただけると助かります。",
      donateText2: "このツールが役立った場合は、次の改善のためのご支援をご検討ください。",
      inputTitle: "1. 画像を追加",
      inputLead: "ドラッグ&ドロップ / クリック選択 / ペースト（Ctrl/Cmd+V）に対応。",
      dropLabel: "ここに画像をドロップ",
      dropSub: "またはクリックして選択（PNG/JPEG/WebP）",
      clear: "全削除",
      settingTitle: "2. 結合設定",
      fitMode: "幅揃えモード",
      fitMax: "最大幅に合わせる",
      fitCustom: "指定幅に合わせる",
      fitMin: "最小幅に合わせる",
      customWidth: "指定幅 (px)",
      trimEnable: "上下の単色余白を自動トリム",
      trimThreshold: "トリム閾値 (0-40)",
      gap: "画像間余白 (px)",
      bg: "背景",
      bgWhite: "白",
      bgTransparent: "透明",
      format: "出力形式",
      quality: "画質(0.1-1)",
      split: "分割高さ (px / 0で分割なし)",
      preview: "プレビュー生成",
      download: "ダウンロード",
      splitExport: "分割ZIP出力",
      localOnly: "処理はブラウザ内のみ。画像データは外部送信しません。",
      previewTitle: "3. プレビュー",
      disclaimer: "本ツールの出力結果は必ず最終確認してください。",
      noItems: "画像を追加してください。",
      building: "プレビューを生成しています…",
      done: "プレビュー生成完了。",
      readyDownload: "先にプレビューを生成してください。",
      zipDone: "分割ZIPを作成しました。",
      notNeeded: "分割指定が不要です。分割高さを設定してください。",
      warnHeight: "警告: 高さが20000pxを超えています。分割出力を推奨します。",
      fail: "処理に失敗しました。設定や枚数を減らして再試行してください。",
      pasted: "クリップボード画像を追加しました。"
    },
    en: {
      title: "Screenshot Stitcher",
      lead: "Combine images vertically in your browser only. No external upload.",
      donateText: "If this tool helps, optional support keeps improvements going.",
      donateText2: "If useful, please consider supporting future improvements.",
      inputTitle: "1. Add images",
      inputLead: "Supports drag/drop, file chooser, and paste (Ctrl/Cmd+V).",
      dropLabel: "Drop images here",
      dropSub: "or click to choose files (PNG/JPEG/WebP)",
      clear: "Clear all",
      settingTitle: "2. Stitch settings",
      fitMode: "Fit width mode",
      fitMax: "Fit to max width",
      fitCustom: "Use custom width",
      fitMin: "Fit to min width",
      customWidth: "Custom width (px)",
      trimEnable: "Auto trim solid top/bottom margins",
      trimThreshold: "Trim threshold (0-40)",
      gap: "Gap between images (px)",
      bg: "Background",
      bgWhite: "White",
      bgTransparent: "Transparent",
      format: "Output format",
      quality: "Quality(0.1-1)",
      split: "Split height (px / 0 = off)",
      preview: "Build preview",
      download: "Download",
      splitExport: "Split ZIP export",
      localOnly: "All processing stays in your browser. No image upload.",
      previewTitle: "3. Preview",
      disclaimer: "Please verify output before sharing.",
      noItems: "Please add images first.",
      building: "Building preview...",
      done: "Preview is ready.",
      readyDownload: "Build preview first.",
      zipDone: "Split ZIP generated.",
      notNeeded: "Split is not set. Enter split height first.",
      warnHeight: "Warning: output height exceeds 20000px. Split export is recommended.",
      fail: "Rendering failed. Try fewer images or lower width.",
      pasted: "Added image(s) from clipboard."
    }
  };

  function text(key) {
    return t[state.lang][key] || key;
  }

  function setLang(lang) {
    state.lang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (t[state.lang][k]) {
        el.textContent = t[state.lang][k];
      }
    });
    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === state.lang);
    });
    renderList();
  }

  function setStatus(msg) {
    $("status").textContent = msg;
  }

  async function decodeFile(file) {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.src = src;
    await img.decode();
    URL.revokeObjectURL(src);
    return img;
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    for (const file of files) {
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) continue;
      const img = await decodeFile(file);
      state.items.push({
        id: crypto.randomUUID(),
        name: file.name,
        w: img.width,
        h: img.height,
        img
      });
    }
    renderList();
    setStatus("-");
    state.renderedBlob = null;
    updateDownloadState();
  }

  function renderList() {
    const ul = $("itemList");
    ul.innerHTML = "";
    state.items.forEach((item, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${item.img.src}" alt="" />
        <div>
          <div>${escapeHtml(item.name)}</div>
          <small class="muted">${item.w} × ${item.h}</small>
        </div>
        <div class="actions">
          <button type="button" data-act="up" ${idx === 0 ? "disabled" : ""}>↑</button>
          <button type="button" data-act="down" ${idx === state.items.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" data-act="del">✕</button>
        </div>
      `;
      li.querySelector("[data-act='up']").addEventListener("click", () => moveItem(idx, idx - 1));
      li.querySelector("[data-act='down']").addEventListener("click", () => moveItem(idx, idx + 1));
      li.querySelector("[data-act='del']").addEventListener("click", () => deleteItem(idx));
      ul.appendChild(li);
    });
    $("countLabel").textContent = `${state.items.length} items`;
  }

  function moveItem(from, to) {
    if (to < 0 || to >= state.items.length) return;
    const target = state.items.splice(from, 1)[0];
    state.items.splice(to, 0, target);
    state.renderedBlob = null;
    updateDownloadState();
    renderList();
  }

  function deleteItem(i) {
    state.items.splice(i, 1);
    state.renderedBlob = null;
    updateDownloadState();
    renderList();
  }

  function clearAll() {
    state.items = [];
    state.renderedBlob = null;
    state.renderedCanvas = null;
    updateDownloadState();
    renderList();
    const canvas = $("previewCanvas");
    canvas.width = 10;
    canvas.height = 10;
    canvas.getContext("2d").clearRect(0, 0, 10, 10);
    $("previewMeta").textContent = "-";
    setStatus("-");
  }

  function pickTargetWidth(mode, custom, widths) {
    if (mode === "custom") return custom;
    if (mode === "min") return Math.min(...widths);
    return Math.max(...widths);
  }

  function findTrimBounds(canvas, threshold) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const { width, height } = canvas;
    const { data } = ctx.getImageData(0, 0, width, height);

    const rowScore = (y) => {
      let diff = 0;
      const base = (y * width) * 4;
      const r0 = data[base], g0 = data[base + 1], b0 = data[base + 2], a0 = data[base + 3];
      for (let x = 1; x < width; x += 1) {
        const i = (y * width + x) * 4;
        diff += Math.abs(data[i] - r0) + Math.abs(data[i + 1] - g0) + Math.abs(data[i + 2] - b0) + Math.abs(data[i + 3] - a0);
      }
      return diff / Math.max(1, (width - 1) * 4);
    };

    let top = 0;
    while (top < height - 1 && rowScore(top) <= threshold) top += 1;

    let bottom = height - 1;
    while (bottom > top && rowScore(bottom) <= threshold) bottom -= 1;

    return { top, bottom: Math.max(top, bottom) };
  }

  async function buildRenderResult() {
    if (!state.items.length) {
      setStatus(text("noItems"));
      return null;
    }

    const fitMode = $("fitMode").value;
    const customWidth = Math.max(64, Number($("customWidth").value || 1080));
    const trimEnabled = $("trimEnabled").checked;
    const threshold = Math.max(0, Math.min(40, Number($("trimThreshold").value || 12)));
    const gap = Math.max(0, Math.min(200, Number($("gap").value || 0)));
    const background = $("background").value;

    setStatus(text("building"));

    const widths = state.items.map((it) => it.w);
    const targetW = pickTargetWidth(fitMode, customWidth, widths);

    const prepared = [];
    for (const item of state.items) {
      const scale = targetW / item.w;
      const scaledH = Math.max(1, Math.round(item.h * scale));
      const off = document.createElement("canvas");
      off.width = targetW;
      off.height = scaledH;
      const octx = off.getContext("2d");
      if (background === "white") {
        octx.fillStyle = "#ffffff";
        octx.fillRect(0, 0, off.width, off.height);
      }
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";
      octx.drawImage(item.img, 0, 0, off.width, off.height);

      let top = 0;
      let bottom = off.height - 1;
      if (trimEnabled) {
        const b = findTrimBounds(off, threshold);
        top = b.top;
        bottom = b.bottom;
      }
      prepared.push({ canvas: off, top, bottom, height: Math.max(1, bottom - top + 1) });
    }

    const totalH = prepared.reduce((acc, cur) => acc + cur.height, 0) + gap * Math.max(0, prepared.length - 1);
    const canvas = $("previewCanvas");
    canvas.width = targetW;
    canvas.height = totalH;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (background === "white") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let y = 0;
    for (const unit of prepared) {
      const sourceHeight = unit.bottom - unit.top + 1;
      ctx.drawImage(unit.canvas, 0, unit.top, unit.canvas.width, sourceHeight, 0, y, unit.canvas.width, sourceHeight);
      y += sourceHeight + gap;
    }

    $("previewMeta").textContent = `${canvas.width} × ${canvas.height}px`;
    if (canvas.height > 20000) {
      setStatus(`${text("done")} ${text("warnHeight")}`);
    } else {
      setStatus(text("done"));
    }

    return canvas;
  }

  async function canvasToBlob(canvas, format, quality) {
    const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Blob creation failed"));
        else resolve(blob);
      }, mime, quality);
    });
  }

  async function handlePreview() {
    try {
      const canvas = await buildRenderResult();
      if (!canvas) return;
      const format = $("format").value;
      const quality = Number($("quality").value || 0.92);
      state.renderedBlob = await canvasToBlob(canvas, format, quality);
      state.renderedCanvas = canvas;
      state.renderedExt = format === "jpeg" ? "jpg" : format;
      updateDownloadState();
    } catch (err) {
      console.error(err);
      setStatus(text("fail"));
    }
  }

  function updateDownloadState() {
    const has = Boolean(state.renderedBlob);
    $("downloadBtn").disabled = !has;
    $("splitBtn").disabled = !has;
  }

  function triggerDownload(blob, fileName) {
    const a = document.createElement("a");
    const href = URL.createObjectURL(blob);
    a.href = href;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 2000);
  }

  function crc32(bytes) {
    let c = 0 ^ -1;
    for (let i = 0; i < bytes.length; i += 1) {
      c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xff];
    }
    return (c ^ -1) >>> 0;
  }

  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let k = 0; k < 8; k += 1) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  function u16(v) {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, v, true);
    return b;
  }

  function u32(v) {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, v, true);
    return b;
  }

  async function buildZip(files) {
    let offset = 0;
    const localParts = [];
    const centralParts = [];

    for (const file of files) {
      const nameBytes = new TextEncoder().encode(file.name);
      const bytes = new Uint8Array(await file.blob.arrayBuffer());
      const crc = crc32(bytes);

      const localHeader = concat(
        [0x50, 0x4b, 0x03, 0x04],
        u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(crc), u32(bytes.length), u32(bytes.length),
        u16(nameBytes.length), u16(0),
        nameBytes, bytes
      );
      localParts.push(localHeader);

      const central = concat(
        [0x50, 0x4b, 0x01, 0x02],
        u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(crc), u32(bytes.length), u32(bytes.length),
        u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset),
        nameBytes
      );
      centralParts.push(central);
      offset += localHeader.length;
    }

    const centralLength = centralParts.reduce((a, b) => a + b.length, 0);
    const centralOffset = localParts.reduce((a, b) => a + b.length, 0);

    const end = concat(
      [0x50, 0x4b, 0x05, 0x06],
      u16(0), u16(0),
      u16(files.length), u16(files.length),
      u32(centralLength), u32(centralOffset),
      u16(0)
    );

    return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
  }

  function concat(...parts) {
    const arrays = parts.map((part) => (part instanceof Uint8Array ? part : Uint8Array.from(part)));
    const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    arrays.forEach((arr) => {
      out.set(arr, offset);
      offset += arr.length;
    });
    return out;
  }

  async function handleDownload() {
    if (!state.renderedBlob) {
      setStatus(text("readyDownload"));
      return;
    }
    triggerDownload(state.renderedBlob, `screenshot-stitcher.${state.renderedExt}`);
  }

  async function handleSplitZip() {
    try {
      if (!state.renderedCanvas) {
        setStatus(text("readyDownload"));
        return;
      }
      const splitHeight = Math.max(0, Number($("splitHeight").value || 0));
      if (splitHeight <= 0) {
        setStatus(text("notNeeded"));
        return;
      }

      const canvas = state.renderedCanvas;
      const segments = [];
      for (let y = 0, idx = 1; y < canvas.height; y += splitHeight, idx += 1) {
        const h = Math.min(splitHeight, canvas.height - y);
        const part = document.createElement("canvas");
        part.width = canvas.width;
        part.height = h;
        const pctx = part.getContext("2d");
        pctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
        const blob = await canvasToBlob(part, $("format").value, Number($("quality").value || 0.92));
        segments.push({
          name: `screenshot-stitcher-${String(idx).padStart(3, "0")}.${state.renderedExt}`,
          blob
        });
      }

      const zipBlob = await buildZip(segments);
      triggerDownload(zipBlob, "screenshot-stitcher-split.zip");
      setStatus(text("zipDone"));
    } catch (err) {
      console.error(err);
      setStatus(text("fail"));
    }
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  function initEvents() {
    $("fileInput").addEventListener("change", () => addFiles($("fileInput").files));
    $("dropzone").addEventListener("dragover", (e) => {
      e.preventDefault();
      $("dropzone").classList.add("is-drag");
    });
    $("dropzone").addEventListener("dragleave", () => $("dropzone").classList.remove("is-drag"));
    $("dropzone").addEventListener("drop", (e) => {
      e.preventDefault();
      $("dropzone").classList.remove("is-drag");
      addFiles(e.dataTransfer.files);
    });

    document.addEventListener("paste", (e) => {
      const files = Array.from(e.clipboardData?.files || []);
      if (files.length) {
        addFiles(files);
        setStatus(text("pasted"));
      }
    });

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
    });

    $("clearBtn").addEventListener("click", clearAll);
    $("previewBtn").addEventListener("click", handlePreview);
    $("downloadBtn").addEventListener("click", handleDownload);
    $("splitBtn").addEventListener("click", handleSplitZip);
  }

  function init() {
    initEvents();
    setLang((navigator.language || "ja").startsWith("ja") ? "ja" : "en");
    setStatus("-");
    updateDownloadState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
