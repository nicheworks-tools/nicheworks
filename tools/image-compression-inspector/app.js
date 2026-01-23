// --------------------
// 言語切替
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let current = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    nodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    buttons.forEach((b) =>
      b.classList.toggle("active", b.dataset.lang === lang)
    );
    current = lang;
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    if (state.lastErrorKey) {
      showError(state.lastErrorKey);
    }
  };

  buttons.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));

  applyLang(current);
});

// --------------------
// アップロード処理
// --------------------
const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const resultContent = document.getElementById("result-content");
const outputSizeEl = document.getElementById("output-size");
const reductionEl = document.getElementById("reduction");
const outputFormatEl = document.getElementById("output-format");
const formatSelect = document.getElementById("format-select");
const qualityRange = document.getElementById("quality-range");
const qualityValue = document.getElementById("quality-value");
const downloadBtn = document.getElementById("download-btn");
const previewImage = document.getElementById("preview-image");
const warningJa = document.getElementById("format-warning");
const warningEn = document.getElementById("format-warning-en");
const errorMessage = document.getElementById("error-message");

const state = {
  file: null,
  img: null,
  hasTransparency: false,
  outputBlob: null,
  outputUrl: "",
  lastErrorKey: "",
};

const messages = {
  fileTooLarge: {
    ja: "ファイルが大きすぎます（最大20MB）。",
    en: "File too large (max 20MB).",
  },
  loadFail: {
    ja: "画像の読み込みに失敗しました。",
    en: "Failed to load image.",
  },
  hugeImage: {
    ja: "画像サイズが大きすぎるため処理できません。",
    en: "Image dimensions are too large to process.",
  },
  outputFail: {
    ja: "圧縮データの生成に失敗しました。",
    en: "Failed to generate the compressed output.",
  },
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
let compressTimer = null;

uploadArea.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.style.background = "#eef2ff";
});
uploadArea.addEventListener("dragleave", () => {
  uploadArea.style.background = "#fafafa";
});
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.style.background = "#fafafa";
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  handleFile(file);
});

// --------------------
// ファイル処理
// --------------------
function handleFile(file) {
  if (!file) return;

  // 20MB制限
  if (file.size > MAX_FILE_SIZE) {
    showError("fileTooLarge");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => processImage(file, img);
    img.onerror = () => showError("loadFail");
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// --------------------
// 画像解析（MVP）
// --------------------
function processImage(file, img) {
  clearError();
  state.file = file;
  state.img = img;
  state.hasTransparency = detectTransparency(img);

  if (img.naturalWidth * img.naturalHeight > MAX_PIXELS) {
    showError("hugeImage");
    return;
  }

  resetOutputState();

  // 元フォーマット
  document.getElementById("format").textContent = file.type || "unknown";

  // ファイルサイズ
  document.getElementById("size").textContent =
    (file.size / 1024).toFixed(1) + " KB";

  // 解像度
  document.getElementById("resolution").textContent =
    img.naturalWidth + " x " + img.naturalHeight;

  // 結果表示
  document.getElementById("result-content").classList.remove("hidden");
  document.querySelectorAll(".no-result").forEach((n) => (n.style.display = "none"));
  updateWarning();
  updateCompression();
}

function detectTransparency(img) {
  const canvas = document.createElement("canvas");
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
}

function updateWarning() {
  const isJpeg = formatSelect.value === "image/jpeg";
  const show = state.hasTransparency && isJpeg;
  warningJa.classList.toggle("hidden", !show);
  warningEn.classList.toggle("hidden", !show);
}

function updateCompression() {
  if (!state.img || !state.file) return;
  const quality = Number.parseFloat(qualityRange.value);
  qualityValue.textContent = quality.toFixed(2);
  outputFormatEl.textContent = formatLabel(formatSelect.value);
  updateWarning();

  if (compressTimer) {
    window.clearTimeout(compressTimer);
  }
  compressTimer = window.setTimeout(() => {
    generateCompressedOutput(quality);
  }, 120);
}

function generateCompressedOutput(quality) {
  const canvas = document.createElement("canvas");
  canvas.width = state.img.naturalWidth;
  canvas.height = state.img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (state.hasTransparency && formatSelect.value === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(state.img, 0, 0);

  const format = formatSelect.value;
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        showError("outputFail");
        return;
      }
      state.outputBlob = blob;
      outputSizeEl.textContent = formatBytes(blob.size);
      reductionEl.textContent = formatReduction(blob.size, state.file.size);
      outputFormatEl.textContent = formatLabel(format);
      updatePreview(blob);
      downloadBtn.disabled = false;
      clearError();
    },
    format,
    quality
  );
}

function updatePreview(blob) {
  if (state.outputUrl) {
    URL.revokeObjectURL(state.outputUrl);
  }
  state.outputUrl = URL.createObjectURL(blob);
  previewImage.src = state.outputUrl;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatReduction(outputBytes, originalBytes) {
  const ratio = (1 - outputBytes / originalBytes) * 100;
  const sign = ratio >= 0 ? "" : "-";
  return `${sign}${Math.abs(ratio).toFixed(1)}%`;
}

function formatLabel(format) {
  if (format === "image/webp") return "WebP";
  if (format === "image/jpeg") return "JPEG";
  return format;
}

function currentLang() {
  return document.documentElement.dataset.lang || "ja";
}

function showError(key) {
  state.lastErrorKey = key;
  resetOutputState();
  const lang = currentLang();
  errorMessage.textContent = messages[key][lang] || messages[key].en;
  errorMessage.classList.remove("hidden");
  resultContent.classList.remove("hidden");
  document.querySelectorAll(".no-result").forEach((n) => (n.style.display = "none"));
  downloadBtn.disabled = true;
}

function clearError() {
  state.lastErrorKey = "";
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

function resetOutputState() {
  outputSizeEl.textContent = "-";
  reductionEl.textContent = "-";
  outputFormatEl.textContent = formatLabel(formatSelect.value);
  downloadBtn.disabled = true;
  if (state.outputUrl) {
    URL.revokeObjectURL(state.outputUrl);
    state.outputUrl = "";
  }
  previewImage.removeAttribute("src");
}

qualityRange.addEventListener("input", updateCompression);
formatSelect.addEventListener("change", updateCompression);

downloadBtn.addEventListener("click", () => {
  if (!state.outputBlob || !state.file) return;
  const format = formatSelect.value;
  const ext = format === "image/webp" ? "webp" : "jpg";
  const baseName = state.file.name.replace(/\.[^.]+$/, "");
  const filename = `${baseName || "compressed"}-compressed.${ext}`;
  const link = document.createElement("a");
  link.href = state.outputUrl;
  link.download = filename;
  link.click();
});
