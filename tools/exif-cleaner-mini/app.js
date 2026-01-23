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
const outputFormatEl = document.getElementById("output-format");
const formatControls = document.getElementById("format-controls");
const formatSelect = document.getElementById("format-select");
const qualitySlider = document.getElementById("quality-slider");
const qualityValue = document.getElementById("quality-value");
const cleanBtnJa = document.getElementById("clean-btn-ja");
const cleanBtnEn = document.getElementById("clean-btn-en");
const doneMsgJa = document.getElementById("done-msg-ja");
const doneMsgEn = document.getElementById("done-msg-en");

let inputFormat = null;
let outputFormat = null;

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
  setButtonsDisabled(true);

  try {
    const [dataUrl, arrayBuffer] = await Promise.all([
      readFileAsDataURL(file),
      readFileAsArrayBuffer(file),
    ]);

    preview.src = dataUrl;
    preview.classList.remove("hidden");

    inputFormat = detectInputFormat(file, arrayBuffer);
    if (!inputFormat) {
      setStatus(
        "Unsupported image format.",
        "対応していない画像形式です。"
      );
      return;
    }

    setupFormatControls();
    detectExif(dataUrl);
  } catch (error) {
    console.error(error);
    setStatus("Failed to load the image.", "画像の読み込みに失敗しました。");
  }
}

function detectExif(dataUrl) {
  const binary = atob(dataUrl.split("base64,")[1]);
  const hasExif = binary.includes("Exif") || binary.includes("EXIF");

  setStatus(
    hasExif ? "EXIF metadata detected" : "No EXIF metadata found",
    hasExif ? "EXIFメタデータが検出されました" : "EXIFメタデータは見つかりませんでした"
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

    doneMsgJa.classList.remove("hidden");
    doneMsgEn.classList.remove("hidden");
    setStatus(
      `Saved as ${downloadName}`,
      `${downloadName} として保存しました`
    );
  } catch (error) {
    console.error(error);
    setStatus(
      "Failed to clean the image. Please try another file.",
      "画像の処理に失敗しました。別の画像でお試しください。"
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
    webp: "WEBP (.webp)",
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
  const base = originalName.replace(/\.[^/.]+$/, "");
  const extension = format === "jpeg" ? ".jpg" : `.${format}`;
  return `${base}-cleaned${extension}`;
}

function setButtonsDisabled(disabled) {
  cleanBtnJa.disabled = disabled;
  cleanBtnEn.disabled = disabled;
}

function resetMessages() {
  doneMsgJa.classList.add("hidden");
  doneMsgEn.classList.add("hidden");
}

function setStatus(enText, jaText) {
  const lang = document.documentElement.lang === "en" ? "en" : "ja";
  statusEl.textContent = lang === "en" ? enText : jaText;
}
