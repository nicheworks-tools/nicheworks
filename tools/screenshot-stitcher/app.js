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
      title: "スクショ縦結合・長い画像作成",
      lead: "複数のスクリーンショットを縦に結合し、長い画像として保存できます。処理はブラウザ内だけで行い、画像は外部送信しません。",
      usageLink: "詳しい使い方はこちら",
      usageEnLink: "English guide",
      donateText: "このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。",
      donateText2: "このツールが役立った場合は、次の改善のためのご支援をご検討ください。",
      inputTitle: "1. 画像を追加",
      inputLead: "ドラッグ&ドロップ / クリック選択 / ペースト（Ctrl/Cmd+V）に対応。PNG / JPEG / WebP を追加できます。",
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
      trimNote: "単色に近い上下余白を削ります。白いヘッダーやナビまで削られる場合があるため、必ずプレビューで確認してください。",
      gap: "画像間余白 (px)",
      bg: "背景",
      bgWhite: "白",
      bgTransparent: "透明",
      format: "出力形式",
      quality: "画質(0.1-1)",
      split: "分割高さ (px / 0で分割なし)",
      splitNote: "長すぎる画像は一部SNS・ブラウザ・ビューアで開けない場合があります。分割ZIPは指定pxごとに画像を分けて保存します。おすすめ：12000〜18000px。",
      estimateEmpty: "画像を追加すると、推定出力サイズを表示します。",
      preview: "プレビュー生成",
      download: "ダウンロード",
      splitExport: "分割ZIP出力",
      localOnly: "処理はブラウザ内のみ。画像データは外部送信しません。",
      previewTitle: "3. プレビュー",
      faqTitle: "FAQ",
      faqPrivacyQ: "画像はサーバーに送信されますか？",
      faqPrivacyA: "いいえ。画像の結合、プレビュー生成、保存処理はブラウザ内で行われます。",
      faqHeicQ: "HEICに対応していますか？",
      faqHeicA: "現時点では PNG / JPEG / WebP を対象にしています。HEICは先に対応形式へ変換してください。",
      faqLongQ: "長すぎる画像は保存できますか？",
      faqLongA: "ブラウザや端末によって失敗する場合があります。高さが大きい場合は分割ZIP出力を使ってください。",
      faqRedactQ: "スクショ内の個人情報も自動で隠せますか？",
      faqRedactA: "いいえ。このツールは結合用です。個人情報を隠す場合は Image Redact などのマスク用ツールを併用してください。",
      disclaimer: "本ツールの出力結果は必ず最終確認してください。",
      noItems: "画像を追加してください。",
      building: "プレビューを生成しています…",
      done: "プレビュー生成完了。",
      readyDownload: "先にプレビューを生成してください。",
      zipDone: "保存しました：screenshot-stitcher-split.zip。共有前に個人情報が残っていないか確認してください。",
      notNeeded: "分割指定が不要です。分割高さを設定してください。",
      warnHeight: "警告: 高さが20000pxを超えています。分割出力を推奨します。",
      warnStrongHeight: "強い警告: 高さが30000pxを超えています。分割ZIP出力を強く推奨します。",
      warnPixels: "注意: 総ピクセル数が大きいため、スマホでは失敗する可能性があります。",
      fail: "処理に失敗しました。設定や枚数を減らして再試行してください。",
      pasted: "クリップボード画像を追加しました。",
      addedFiles: "{count}件の画像を追加しました。",
      skippedPrefix: "対応していない形式をスキップしました",
      supportedTypes: "対応形式：PNG / JPEG / WebP。HEICは先に変換してください。",
      settingsChanged: "設定が変わりました。再度プレビューを生成してください。",
      downloadDone: "保存しました：{name}。結合画像はブラウザ内で作成されました。共有前に個人情報が残っていないか確認してください。",
      estimateLabel: "推定出力サイズ",
      totalPixels: "総ピクセル数"
    },
    en: {
      title: "Screenshot Stitcher",
      lead: "Combine multiple screenshots vertically and save them as one long image. Everything runs locally in your browser with no image upload.",
      usageLink: "Detailed guide",
      usageEnLink: "English guide",
      donateText: "If this tool helps, optional support keeps improvements going.",
      donateText2: "If useful, please consider supporting future improvements.",
      inputTitle: "1. Add images",
      inputLead: "Supports drag/drop, file chooser, and paste (Ctrl/Cmd+V). You can add PNG, JPEG, and WebP images.",
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
      trimNote: "This removes near-solid top and bottom margins. White headers or navigation areas may also be removed, so always check the preview.",
      gap: "Gap between images (px)",
      bg: "Background",
      bgWhite: "White",
      bgTransparent: "Transparent",
      format: "Output format",
      quality: "Quality(0.1-1)",
      split: "Split height (px / 0 = off)",
      splitNote: "Very long images may fail in some social apps, browsers, or viewers. Split ZIP saves separate image parts at the specified height. Recommended: 12000–18000px.",
      estimateEmpty: "Add images to see the estimated output size.",
      preview: "Build preview",
      download: "Download",
      splitExport: "Split ZIP export",
      localOnly: "All processing stays in your browser. No image upload.",
      previewTitle: "3. Preview",
      faqTitle: "FAQ",
      faqPrivacyQ: "Are images uploaded to a server?",
      faqPrivacyA: "No. Stitching, preview generation, and saving run inside your browser.",
      faqHeicQ: "Does it support HEIC?",
      faqHeicA: "Currently it supports PNG, JPEG, and WebP. Convert HEIC files first.",
      faqLongQ: "Can I save very long images?",
      faqLongA: "It depends on the browser and device. For very tall output, use Split ZIP export.",
      faqRedactQ: "Can it automatically hide personal information?",
      faqRedactA: "No. This is a stitching tool. Use a redaction tool such as Image Redact before sharing sensitive screenshots.",
      disclaimer: "Please verify output before sharing.",
      noItems: "Please add images first.",
      building: "Building preview...",
      done: "Preview is ready.",
      readyDownload: "Build preview first.",
      zipDone: "Saved: screenshot-stitcher-split.zip. Check for personal information before sharing.",
      notNeeded: "Split is not set. Enter split height first.",
      warnHeight: "Warning: output height exceeds 20000px. Split export is recommended.",
      warnStrongHeight: "Strong warning: output height exceeds 30000px. Split ZIP export is strongly recommended.",
      warnPixels: "Note: total pixels are high, so mobile devices may fail.",
      fail: "Rendering failed. Try fewer images or lower width.",
      pasted: "Added image(s) from clipboard.",
      addedFiles: "Added {count} image(s).",
      skippedPrefix: "Skipped unsupported files",
      supportedTypes: "Supported formats: PNG / JPEG / WebP. Convert HEIC first.",
      settingsChanged: "Settings changed. Build the preview again before saving.",
      downloadDone: "Saved: {name}. The stitched image was created in your browser. Check for personal information before sharing.",
      estimateLabel: "Estimated output size",
      totalPixels: "Total pixels"
    }
  };

  function text(key) {
    return t[state.lang][key] || key;
  }

  function setLang(lang) {
    state.lang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-lang-mode", state.lang);
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
    updateEstimate();
  }

  function setStatus(msg) {
    const node = $("status");
    if (node) node.textContent = msg;
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `img_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function revokeItemUrl(item) {
    if (item?.url) {
      URL.revokeObjectURL(item.url);
      item.url = "";
    }
  }

  function isSupportedImage(file) {
    return /^image\/(png|jpeg|webp)$/.test(file.type || "");
  }

  async function decodeFile(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
      return { img, url };
    } catch (err) {
      URL.revokeObjectURL(url);
      throw err;
    }
  }

  function invalidateRender(message) {
    state.renderedBlob = null;
    state.renderedCanvas = null;
    updateDownloadState();
    updateEstimate();
    if (message) setStatus(message);
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    const skipped = [];
    let added = 0;

    for (const file of files) {
      if (!isSupportedImage(file)) {
        skipped.push(file.name || "unknown");
        continue;
      }
      try {
        const decoded = await decodeFile(file);
        state.items.push({
          id: makeId(),
          name: file.name || "image",
          w: decoded.img.width,
          h: decoded.img.height,
          img: decoded.img,
          url: decoded.url
        });
        added += 1;
      } catch (err) {
        console.error(err);
        skipped.push(file.name || "unknown");
      }
    }

    renderList();
    invalidateRender();

    const messages = [];
    if (added > 0) messages.push(text("addedFiles").replace("{count}", String(added)));
    if (skipped.length) {
      messages.push(`${text("skippedPrefix")}：${skipped.join(", ")}`);
      messages.push(text("supportedTypes"));
    }
    setStatus(messages.length ? messages.join(" ") : "-");

    const input = $("fileInput");
    if (input) input.value = "";
    return { added, skipped };
  }

  function renderList() {
    const ul = $("itemList");
    if (!ul) return;
    ul.innerHTML = "";
    state.items.forEach((item, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${escapeAttr(item.url)}" alt="" />
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
    invalidateRender();
    renderList();
  }

  function deleteItem(i) {
    const removed = state.items.splice(i, 1)[0];
    revokeItemUrl(removed);
    invalidateRender();
    renderList();
  }

  function clearAll() {
    state.items.forEach(revokeItemUrl);
    state.items = [];
    state.renderedBlob = null;
    state.renderedCanvas = null;
    updateDownloadState();
    renderList();
    updateEstimate();
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

  function getSettings() {
    return {
      fitMode: $("fitMode").value,
      customWidth: Math.max(64, Number($("customWidth").value || 1080)),
      trimEnabled: $("trimEnabled").checked,
      trimThreshold: Math.max(0, Math.min(40, Number($("trimThreshold").value || 12))),
      gap: Math.max(0, Math.min(200, Number($("gap").value || 0))),
      background: $("background").value,
      format: $("format").value,
      quality: Number($("quality").value || 0.92),
      splitHeight: Math.max(0, Number($("splitHeight").value || 0))
    };
  }

  function estimateOutputSize() {
    if (!state.items.length) return null;
    const settings = getSettings();
    const widths = state.items.map((it) => it.w);
    const targetW = pickTargetWidth(settings.fitMode, settings.customWidth, widths);
    const heights = state.items.map((item) => Math.max(1, Math.round(item.h * (targetW / item.w))));
    const totalH = heights.reduce((acc, h) => acc + h, 0) + settings.gap * Math.max(0, heights.length - 1);
    return {
      width: targetW,
      height: totalH,
      megapixels: (targetW * totalH) / 1000000
    };
  }

  function buildWarnings(size) {
    if (!size) return [];
    const warnings = [];
    if (size.height > 30000) {
      warnings.push(text("warnStrongHeight"));
    } else if (size.height > 20000) {
      warnings.push(text("warnHeight"));
    }
    if (size.megapixels > 40) {
      warnings.push(text("warnPixels"));
    }
    return warnings;
  }

  function updateEstimate() {
    const box = $("estimateBox");
    if (!box) return;
    const size = estimateOutputSize();
    if (!size) {
      box.className = "estimate";
      box.textContent = text("estimateEmpty");
      return;
    }
    const warnings = buildWarnings(size);
    box.className = `estimate${warnings.length ? " warn" : ""}`;
    box.innerHTML = `
      <strong>${text("estimateLabel")}：</strong>
      ${size.width} × ${size.height}px / ${text("totalPixels")} ${size.megapixels.toFixed(1)}MP
      ${warnings.length ? `<ul>${warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>` : ""}
    `;
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

    const settings = getSettings();
    const estimate = estimateOutputSize();
    const preWarnings = buildWarnings(estimate);

    setStatus(preWarnings.length ? `${text("building")} ${preWarnings.join(" ")}` : text("building"));

    const widths = state.items.map((it) => it.w);
    const targetW = pickTargetWidth(settings.fitMode, settings.customWidth, widths);

    const prepared = [];
    for (const item of state.items) {
      const scale = targetW / item.w;
      const scaledH = Math.max(1, Math.round(item.h * scale));
      const off = document.createElement("canvas");
      off.width = targetW;
      off.height = scaledH;
      const octx = off.getContext("2d");
      if (settings.background === "white") {
        octx.fillStyle = "#ffffff";
        octx.fillRect(0, 0, off.width, off.height);
      }
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";
      octx.drawImage(item.img, 0, 0, off.width, off.height);

      let top = 0;
      let bottom = off.height - 1;
      if (settings.trimEnabled) {
        const b = findTrimBounds(off, settings.trimThreshold);
        top = b.top;
        bottom = b.bottom;
      }
      prepared.push({ canvas: off, top, bottom, height: Math.max(1, bottom - top + 1) });
    }

    const totalH = prepared.reduce((acc, cur) => acc + cur.height, 0) + settings.gap * Math.max(0, prepared.length - 1);
    const canvas = $("previewCanvas");
    canvas.width = targetW;
    canvas.height = totalH;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (settings.background === "white") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let y = 0;
    for (const unit of prepared) {
      const sourceHeight = unit.bottom - unit.top + 1;
      ctx.drawImage(unit.canvas, 0, unit.top, unit.canvas.width, sourceHeight, 0, y, unit.canvas.width, sourceHeight);
      y += sourceHeight + settings.gap;
    }

    $("previewMeta").textContent = `${canvas.width} × ${canvas.height}px`;
    const postWarnings = buildWarnings({ width: canvas.width, height: canvas.height, megapixels: (canvas.width * canvas.height) / 1000000 });
    setStatus(postWarnings.length ? `${text("done")} ${postWarnings.join(" ")}` : text("done"));

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
      const settings = getSettings();
      state.renderedBlob = await canvasToBlob(canvas, settings.format, settings.quality);
      state.renderedCanvas = canvas;
      state.renderedExt = settings.format === "jpeg" ? "jpg" : settings.format;
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
    const fileName = `screenshot-stitcher.${state.renderedExt}`;
    triggerDownload(state.renderedBlob, fileName);
    setStatus(text("downloadDone").replace("{name}", fileName));
  }

  async function handleSplitZip() {
    try {
      if (!state.renderedCanvas) {
        setStatus(text("readyDownload"));
        return;
      }
      const settings = getSettings();
      if (settings.splitHeight <= 0) {
        setStatus(text("notNeeded"));
        return;
      }

      const canvas = state.renderedCanvas;
      const segments = [];
      for (let y = 0, idx = 1; y < canvas.height; y += settings.splitHeight, idx += 1) {
        const h = Math.min(settings.splitHeight, canvas.height - y);
        const part = document.createElement("canvas");
        part.width = canvas.width;
        part.height = h;
        const pctx = part.getContext("2d");
        pctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
        const blob = await canvasToBlob(part, settings.format, settings.quality);
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

  function escapeAttr(v) {
    return escapeHtml(v).replace(/`/g, "&#96;");
  }

  function bindSettingsInvalidation() {
    ["fitMode", "customWidth", "trimEnabled", "trimThreshold", "gap", "background", "format", "quality", "splitHeight"].forEach((id) => {
      const el = $(id);
      if (!el) return;
      const evt = el.tagName === "SELECT" || el.type === "checkbox" ? "change" : "input";
      el.addEventListener(evt, () => invalidateRender(text("settingsChanged")));
    });
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
        addFiles(files).then((result) => {
          if (result.added > 0 && result.skipped.length === 0) setStatus(text("pasted"));
        });
      }
    });

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
    });

    bindSettingsInvalidation();

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
    updateEstimate();
  }

  window.addEventListener("beforeunload", () => {
    state.items.forEach(revokeItemUrl);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
