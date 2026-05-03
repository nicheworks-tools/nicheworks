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
    updateOutputFormatText();
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

let inputFormat = null;
let outputFormat = null;

const MAX_FILE_BYTES = 25 * 1024 * 1024;

dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFile);
formatSelect.addEventListener("change", () => {
  updateOutputFormat();
  updateOutputFormatText();
  updateQualityControl();
});
qualitySlider.addEventListener("input", () => {
  qualityValue.textContent = Number(qualitySlider.value).toFixed(2);
});

if (resetBtn) resetBtn.addEventListener("click", resetTool);
if (resetBtnEn) resetBtnEn.addEventListener("click", resetTool);

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

    preview.src = dataUrl;
    preview.classList.remove("hidden");

    setupFormatControls();
    detectExif(dataUrl);
  } catch (error) {
    console.error(error);
    setStatus("Failed to load the image.", "画像の読み込みに失敗しました。");
    setStatusNote(
      "Please try another JPEG, PNG, or WebP file.",
      "別のJPEG / PNG / WebP画像でお試しください。"
    );
  }
}

function detectExif(dataUrl) {
  const binary = atob(dataUrl.split("base64,")[1]);
  const hasExif = binary.includes("Exif") || binary.includes("EXIF");

  setStatus(
    hasExif
      ? "Quick check: EXIF-like metadata was detected."
      : "Quick check: no EXIF-like string was found.",
    hasExif
      ? "簡易チェック：EXIFらしきメタデータを検出しました。"
      : "簡易チェック：EXIFらしき文字列は見つかりませんでした。"
  );
  setStatusNote(
    "This is a simple check, not a full GPS or metadata analysis. You can now clean and save the image.",
    "この判定は簡易チェックです。GPSの有無や全メタデータの詳細解析ではありません。削除して保存できます。"
  );

  setButtonsDisabled(false);
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

    const downloadName = buildDownloadName(file.name, outputFormat);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(blobUrl);

    if (doneMsgJa) doneMsgJa.textContent = `保存しました：${downloadName}`;
    if (doneMsgEn) doneMsgEn.textContent = `Saved: ${downloadName}`;
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
  updateOutputFormatText();
  updateQualityControl();
}

function updateOutputFormat() {
  if (inputFormat === "jpeg") {
    outputFormat = "jpeg";
    return;
  }

  outputFormat = formatSelect.value === "jpeg" ? "jpeg" : inputFormat;
}

function updateOutputFormatText() {
  if (!outputFormatEl) return;
  if (!outputFormat) {
    outputFormatEl.textContent = "";
    return;
  }
  const lang = document.documentElement.lang === "en" ? "en" : "ja";
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
  const lang = document.documentElement.lang === "en" ? "en" : "ja";
  statusEl.textContent = lang === "en" ? enText : jaText;
}

function setStatusNote(enText, jaText) {
  if (!statusNoteEl) return;
  const lang = document.documentElement.lang === "en" ? "en" : "ja";
  statusNoteEl.textContent = lang === "en" ? enText : jaText;
}
