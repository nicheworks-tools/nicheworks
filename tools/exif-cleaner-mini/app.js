// ---------- 多言語切替 ----------
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let current = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    document.documentElement.lang = lang;
    nodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });

    buttons.forEach((b) =>
      b.classList.toggle("active", b.dataset.lang === lang)
    );

    current = lang;
    renderDynamicMessages();
  };

  buttons.forEach((btn) =>
    btn.addEventListener("click", () => applyLang(btn.dataset.lang))
  );

  applyLang(current);
});

// ---------- EXIF削除処理 ----------
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const statusEl = document.getElementById("exif-status");
const statusNoteEl = document.getElementById("status-note");
const outputFormatEl = document.getElementById("output-format");
const formatControls = document.getElementById("format-controls");
const formatSelect = document.getElementById("format-select");
const qualitySlider = document.getElementById("quality-slider");
const qualityValue = document.getElementById("quality-value");
const cleanBtnJa = document.getElementById("clean-btn-ja");
const cleanBtnEn = document.getElementById("clean-btn-en");
const resultPanel = document.getElementById("result-panel");
const doneMsgJa = document.getElementById("done-msg-ja");
const doneMsgEn = document.getElementById("done-msg-en");
const resetBtn = document.getElementById("reset-btn");
const resetBtnEn = document.getElementById("reset-btn-en");

const inspectionSummary = document.getElementById("inspection-summary");
const verificationSummary = document.getElementById("verification-summary");

let inputFormat = null;
let outputFormat = null;
let latestStatus = { en: "", ja: "" };
let latestStatusNote = { en: "", ja: "" };
let inputScanResult = null;
let outputScanResult = null;
let imageDimensions = { width: 0, height: 0 };

const MAX_FILE_BYTES = 25 * 1024 * 1024;

dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFile);
formatSelect.addEventListener("change", () => {
  updateOutputFormat();
  renderDynamicMessages();
  updateQualityControl();
});
qualitySlider.addEventListener("input", () => {
  qualityValue.textContent = Number(qualitySlider.value).toFixed(2);
});

if (resetBtn) resetBtn.addEventListener("click", resetTool);
if (resetBtnEn) resetBtnEn.addEventListener("click", resetTool);

/**
 * Scan for metadata containers in a format-aware way.
 */
function scanMetadata(arrayBuffer, format) {
  const result = {
    format: format,
    size: arrayBuffer.byteLength,
    containers: [] // { type: 'EXIF'|'XMP'|'TEXT'|'COM', count: number }
  };

  const view = new DataView(arrayBuffer);

  if (format === 'jpeg') {
    let offset = 2; // Skip SOI (FF D8)
    while (offset + 1 < view.byteLength) {
      if (view.getUint8(offset) !== 0xFF) {
        offset++;
        continue;
      }
      const marker = view.getUint8(offset + 1);
      if (marker === 0x00 || marker === 0xFF) {
        offset++;
        continue;
      }
      if (marker === 0xD9 || marker === 0xDA) break; // EOI or SOS

      // Markers without length (RSTn, TEM)
      if ((marker >= 0xD0 && marker <= 0xD7) || marker === 0x01) {
        offset += 2;
        continue;
      }

      if (offset + 4 > view.byteLength) break;
      const length = view.getUint16(offset + 2);
      if (offset + 2 + length > view.byteLength) break;

      if (marker === 0xE1) { // APP1
        const sigExif = getString(view, offset + 4, 6);
        if (sigExif === "Exif\0\0") {
          addContainer(result, 'EXIF');
        } else {
          const sigXmp = getString(view, offset + 4, 29);
          if (sigXmp === "http://ns.adobe.com/xap/1.0/\0") {
            addContainer(result, 'XMP');
          }
        }
      } else if (marker === 0xFE) { // COM
        addContainer(result, 'COM');
      }
      offset += 2 + length;
    }
  } else if (format === 'png') {
    let offset = 8; // Skip signature
    while (offset + 8 <= view.byteLength) {
      const length = view.getUint32(offset);
      const type = getString(view, offset + 4, 4);
      if (type === 'eXIf') {
        addContainer(result, 'EXIF');
      } else if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') {
        addContainer(result, 'TEXT');
      }
      offset += 8 + length + 4;
    }
  } else if (format === 'webp') {
    if (getString(view, 0, 4) === 'RIFF' && getString(view, 8, 4) === 'WEBP') {
      let offset = 12;
      while (offset + 8 <= view.byteLength) {
        const type = getString(view, offset, 4);
        const length = view.getUint32(offset + 4, true);
        if (type === 'EXIF') {
          addContainer(result, 'EXIF');
        } else if (type === 'XMP ') {
          addContainer(result, 'XMP');
        }
        offset += 8 + length + (length % 2);
      }
    }
  }
  return result;
}

function getString(view, offset, length) {
  let str = "";
  for (let i = 0; i < length; i++) {
    if (offset + i >= view.byteLength) break;
    str += String.fromCharCode(view.getUint8(offset + i));
  }
  return str;
}

function addContainer(result, type) {
  const existing = result.containers.find(c => c.type === type);
  if (existing) {
    existing.count++;
  } else {
    result.containers.push({ type: type, count: 1 });
  }
}

dropArea.addEventListener("dragover", (e) => e.preventDefault());
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    handleFile();
  }
});

async function handleFile() {
  const file = fileInput.files[0];
  if (!file) return;

  resetMessages();
  setStatus("Loading image...", "画像を読み込んでいます...");
  setStatusNote("", "");
  setButtonsDisabled(true);

  if (file.size === 0) {
    setStatus("This file is empty.", "ファイルが空です。");
    setStatusNote(
      "Please choose a JPEG, PNG, or WebP image.",
      "JPEG / PNG / WebP 形式の画像を選択してください。"
    );
    return;
  }

  if (file.size > MAX_FILE_BYTES) {
    setStatus("This image is very large.", "画像ファイルが大きすぎます。");
    setStatusNote(
      "Try a smaller image. Very large files may fail in the browser.",
      "ブラウザ内処理のため、より小さい画像でお試しください。"
    );
    return;
  }

  try {
    const [dataUrl, arrayBuffer] = await Promise.all([
      readFileAsDataURL(file),
      readFileAsArrayBuffer(file),
    ]);

    inputFormat = detectInputFormat(file, arrayBuffer);
    if (!inputFormat) {
      preview.classList.add("hidden");
      inspectionSummary.classList.add("hidden");
      setStatus(
        "Unsupported image format.",
        "対応していない画像形式です。"
      );
      setStatusNote(
        "Supported formats: JPEG / PNG / WebP. Convert HEIC to JPEG or PNG first.",
        "対応形式：JPEG / PNG / WebP。HEICなどは先にJPEGまたはPNGへ変換してください。"
      );
      return;
    }

    inputScanResult = scanMetadata(arrayBuffer, inputFormat);

    const img = await loadImage(dataUrl);
    imageDimensions = { width: img.width, height: img.height };

    preview.src = dataUrl;
    preview.classList.remove("hidden");

    renderSummary(inspectionSummary, inputScanResult, imageDimensions);
    inspectionSummary.classList.remove("hidden");

    setupFormatControls();
  } catch (error) {
    console.error(error);
    setStatus("Failed to load the image.", "画像の読み込みに失敗しました。");
    setStatusNote(
      "Please try another JPEG, PNG, or WebP file.",
      "別のJPEG / PNG / WebP画像でお試しください。"
    );
  }
}


cleanBtnJa.addEventListener("click", cleanExif);
cleanBtnEn.addEventListener("click", cleanExif);

async function cleanExif() {
  const file = fileInput.files[0];
  if (!file) return;

  resetMessages();
  setStatus("Processing image...", "画像を処理中...");
  setStatusNote("", "");
  setButtonsDisabled(true);

  try {
    const img = await loadImage(preview.src);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas not supported");
    }
    ctx.drawImage(img, 0, 0);

    const mimeType = outputFormat === "jpeg" ? "image/jpeg" : `image/${outputFormat}`;
    const quality =
      outputFormat === "jpeg" ? Number(qualitySlider.value) : undefined;

    const blob = await canvasToBlob(canvas, mimeType, quality);
    if (!blob) {
      throw new Error("Failed to create image blob");
    }

    const outputBuffer = await blob.arrayBuffer();
    outputScanResult = scanMetadata(outputBuffer, outputFormat);

    const downloadName = buildDownloadName(file.name, outputFormat);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(blobUrl);

    if (doneMsgJa) doneMsgJa.textContent = `保存しました：${downloadName}`;
    if (doneMsgEn) doneMsgEn.textContent = `Saved: ${downloadName}`;

    renderSummary(verificationSummary, outputScanResult, imageDimensions, true);
    verificationSummary.classList.remove("hidden");

    if (resultPanel) resultPanel.classList.remove("hidden");
    setStatus(
      `Saved as ${downloadName}`,
      `${downloadName} として保存しました`
    );
    setStatusNote(
      "The saved file was regenerated in the browser.",
      "保存された画像はブラウザ内で再生成されました。"
    );
  } catch (error) {
    console.error(error);
    setStatus(
      "Failed to clean the image. Please try another file.",
      "画像の処理に失敗しました。別の画像でお試しください。"
    );
    setStatusNote(
      "Some files may not be decodable by the browser even if the extension looks supported.",
      "拡張子が対応形式でも、ブラウザで読み込めない画像は処理できない場合があります。"
    );
  } finally {
    setButtonsDisabled(false);
  }
}

function setupFormatControls() {
  if (inputFormat === "jpeg") {
    formatControls.classList.add("hidden");
    outputFormat = "jpeg";
  } else {
    formatControls.classList.remove("hidden");
    formatSelect.value = "keep";
    outputFormat = inputFormat;
  }
  renderDynamicMessages();
  updateQualityControl();
}

function updateOutputFormat() {
  if (inputFormat === "jpeg") {
    outputFormat = "jpeg";
    return;
  }

  outputFormat = formatSelect.value === "jpeg" ? "jpeg" : inputFormat;
}

function renderDynamicMessages() {
  renderStatus();
  renderStatusNote();
  updateOutputFormatText();
  if (inputScanResult) {
    renderSummary(inspectionSummary, inputScanResult, imageDimensions);
  }
  if (outputScanResult) {
    renderSummary(verificationSummary, outputScanResult, imageDimensions, true);
  }
}

function renderSummary(targetEl, scanResult, dimensions, isVerification = false) {
  const lang = getCurrentLang();

  let html = "";
  if (isVerification) {
    html += `<p class="summary-title">${lang === 'ja' ? '【検証結果】' : '[Verification Result]'}</p>`;
  } else {
    html += `<p class="summary-title">${lang === 'ja' ? '【スキャン概要】' : '[Scan Summary]'}</p>`;
  }

  const formatLabelMap = {
    jpeg: "JPEG",
    png: "PNG",
    webp: "WebP",
  };
  const formatLabel = formatLabelMap[scanResult.format] || scanResult.format.toUpperCase();

  html += `<table class="summary-table">`;
  html += `<tr><th>${lang === 'ja' ? '形式' : 'Format'}</th><td>${formatLabel}</td></tr>`;
  html += `<tr><th>${lang === 'ja' ? 'サイズ' : 'Size'}</th><td>${formatFileSize(scanResult.size)}</td></tr>`;
  if (isVerification && inputScanResult) {
    const diff = scanResult.size - inputScanResult.size;
    const diffText = diff > 0 ? `(+${formatFileSize(diff)})` : `(${formatFileSize(diff)})`;
    html += `<tr><th>${lang === 'ja' ? 'サイズ変化' : 'Size Change'}</th><td>${diffText}</td></tr>`;
  }
  html += `<tr><th>${lang === 'ja' ? '解像度' : 'Dimensions'}</th><td>${dimensions.width} x ${dimensions.height}</td></tr>`;

  const containerLabels = {
    EXIF: { ja: 'EXIFコンテナ', en: 'EXIF container' },
    XMP: { ja: 'XMPメタデータ', en: 'XMP metadata' },
    TEXT: { ja: 'テキスト形式メタデータ', en: 'Text metadata chunk' },
    COM: { ja: 'コメント(COM)セグメント', en: 'Comment (COM) segment' }
  };

  if (scanResult.containers.length > 0) {
    scanResult.containers.forEach(c => {
      const label = containerLabels[c.type][lang];
      html += `<tr><th>${label}</th><td>${lang === 'ja' ? '検出' : 'Detected'} (${c.count})</td></tr>`;
    });
  } else {
    html += `<tr><th>${lang === 'ja' ? '検出メタデータ' : 'Detected Metadata'}</th><td>${lang === 'ja' ? '対応コンテナ未検出' : 'No supported containers detected'}</td></tr>`;
  }
  html += `</table>`;

  if (isVerification) {
    if (scanResult.containers.length === 0) {
      html += `<p class="verify-state success">${lang === 'ja' ? '✓ 生成されたファイルから対応するメタデータコンテナは見つかりませんでした。' : '✓ No supported metadata containers detected in generated output.'}</p>`;
      html += `<p class="verify-note">${lang === 'ja' ? '※これはすべてのメタデータ削除を保証するものではありません。' : '*This is not a universal metadata-removal guarantee.'}</p>`;
    } else {
      html += `<p class="verify-state warning">${lang === 'ja' ? '⚠ メタデータコンテナがまだ検出されます。' : '⚠ Metadata container still detected.'}</p>`;
      html += `<p class="verify-note">${lang === 'ja' ? '共有前に内容を再確認してください。' : 'Please review before sharing.'}</p>`;
    }
  }

  targetEl.innerHTML = html;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderStatus() {
  if (!statusEl) return;
  const lang = getCurrentLang();
  statusEl.textContent = lang === "en" ? latestStatus.en : latestStatus.ja;
}

function renderStatusNote() {
  if (!statusNoteEl) return;
  const lang = getCurrentLang();
  statusNoteEl.textContent = lang === "en" ? latestStatusNote.en : latestStatusNote.ja;
}

function updateOutputFormatText() {
  if (!outputFormatEl) return;
  if (!outputFormat) {
    outputFormatEl.textContent = "";
    return;
  }
  const lang = getCurrentLang();
  const formatLabelMap = {
    jpeg: "JPEG (.jpg)",
    png: "PNG (.png)",
    webp: "WebP (.webp)",
  };
  const formatLabel = formatLabelMap[outputFormat] || outputFormat.toUpperCase();
  outputFormatEl.textContent =
    lang === "en"
      ? `Output: ${formatLabel}`
      : `出力形式: ${formatLabel}`;
}

function updateQualityControl() {
  const isJpeg = outputFormat === "jpeg";
  qualitySlider.disabled = !isJpeg;
  qualitySlider.setAttribute("aria-disabled", String(!isJpeg));
}

function resetTool() {
  fileInput.value = "";
  preview.removeAttribute("src");
  preview.classList.add("hidden");
  inputFormat = null;
  outputFormat = null;
  inputScanResult = null;
  outputScanResult = null;
  imageDimensions = { width: 0, height: 0 };
  inspectionSummary.classList.add("hidden");
  inspectionSummary.innerHTML = "";
  verificationSummary.classList.add("hidden");
  verificationSummary.innerHTML = "";
  formatControls.classList.add("hidden");
  outputFormatEl.textContent = "";
  setStatus("", "");
  setStatusNote("", "");
  resetMessages();
  setButtonsDisabled(true);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function detectInputFormat(file, arrayBuffer) {
  const mimeFormat = normalizeMimeType(file.type);
  const sniffed = sniffHeader(arrayBuffer);
  return sniffed || mimeFormat || null;
}

function normalizeMimeType(mime) {
  if (!mime) return null;
  if (mime.includes("jpeg")) return "jpeg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return null;
}

function sniffHeader(arrayBuffer) {
  if (!arrayBuffer) return null;
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      type,
      quality
    );
  });
}

function buildDownloadName(originalName, format) {
  const base = originalName.replace(/\.[^/.]+$/, "") || "image";
  const extension = format === "jpeg" ? ".jpg" : `.${format}`;
  return `${base}-cleaned${extension}`;
}

function setButtonsDisabled(disabled) {
  cleanBtnJa.disabled = disabled;
  cleanBtnEn.disabled = disabled;
}

function resetMessages() {
  if (resultPanel) resultPanel.classList.add("hidden");
}

function setStatus(enText, jaText) {
  latestStatus = { en: enText, ja: jaText };
  renderStatus();
}

function setStatusNote(enText, jaText) {
  latestStatusNote = { en: enText, ja: jaText };
  renderStatusNote();
}

function getCurrentLang() {
  return document.documentElement.lang === "en" ? "en" : "ja";
}
