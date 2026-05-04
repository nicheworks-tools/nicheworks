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
    if (state.file && state.outputBlob) {
      updateCompressionAdvice(state.outputBlob.size, state.file.size);
      updateTransparencyText();
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
const resetBtn = document.getElementById("reset-btn");
const previewImage = document.getElementById("preview-image");
const warningJa = document.getElementById("format-warning");
const warningEn = document.getElementById("format-warning-en");
const errorMessage = document.getElementById("error-message");
const fileNameEl = document.getElementById("file-name");
const pixelCountEl = document.getElementById("pixel-count");
const transparencyEl = document.getElementById("transparency");
const compressionAdviceEl = document.getElementById("compression-advice");

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
  unsupportedType: {
    ja: "この形式は対応外です。PNG / JPEG / WebP の静止画像を選択してください。",
    en: "This format is not supported. Choose a static PNG, JPEG, or WebP image.",
  },
  loadFail: {
    ja: "画像の読み込みに失敗しました。HEIC / RAW / SVG / 破損画像 / ブラウザ非対応形式の可能性があります。",
    en: "Failed to load the image. It may be HEIC, RAW, SVG, corrupted, or unsupported by this browser.",
  },
  hugeImage: {
    ja: "画像サイズが大きすぎるため処理できません（最大40MP）。",
    en: "Image dimensions are too large to process (max 40MP).",
  },
  outputFail: {
    ja: "圧縮データの生成に失敗しました。別の形式や品質設定で試してください。",
    en: "Failed to generate the compressed output. Try another format or quality setting.",
  },
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const SUPPORTED_INPUT_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
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

function handleFile(file) {
  if (!file) return;

  clearError();
  resetOutputState();

  if (file.size > MAX_FILE_SIZE) {
    showError("fileTooLarge");
    return;
  }

  if (file.type && !SUPPORTED_INPUT_TYPES.has(file.type)) {
    showError("unsupportedType");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => processImage(file, img);
    img.onerror = () => showError("loadFail");
    img.src = e.target.result;
  };
  reader.onerror = () => showError("loadFail");
  reader.readAsDataURL(file);
}

function processImage(file, img) {
  clearError();
  state.file = file;
  state.img = img;
  state.hasTransparency = detectTransparency(img);

  const totalPixels = img.naturalWidth * img.naturalHeight;
  if (totalPixels > MAX_PIXELS) {
    showError("hugeImage");
    return;
  }

  resetOutputState();

  fileNameEl.textContent = file.name || "-";
  document.getElementById("format").textContent = file.type || "unknown";
  document.getElementById("size").textContent = formatBytes(file.size);
  document.getElementById("resolution").textContent =
    img.naturalWidth + " x " + img.naturalHeight;
  pixelCountEl.textContent = totalPixels.toLocaleString();
  updateTransparencyText();

  resultContent.classList.remove("hidden");
  setNoResultVisible(false);
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

function updateTransparencyText() {
  const lang = currentLang();
  transparencyEl.textContent = state.hasTransparency
    ? lang === "ja" ? "あり" : "Yes"
    : lang === "ja" ? "なし" : "No";
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
      updateCompressionAdvice(blob.size, state.file.size);
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

function updateCompressionAdvice(outputBytes, originalBytes) {
  const ratio = (1 - outputBytes / originalBytes) * 100;
  const lang = currentLang();

  if (ratio >= 30) {
    compressionAdviceEl.textContent = lang === "ja"
      ? "おすすめ：圧縮効果があります。表示品質を確認して問題なければ使えます。"
      : "Recommendation: compression is effective. Check the visual quality before using it.";
    return;
  }

  if (ratio >= 0) {
    compressionAdviceEl.textContent = lang === "ja"
      ? "おすすめ：軽い圧縮です。品質を下げるか、元画像のまま使うか比較してください。"
      : "Recommendation: light reduction. Compare this with the original or lower the quality if needed.";
    return;
  }

  compressionAdviceEl.textContent = lang === "ja"
    ? "注意：元画像より大きくなっています。元画像のまま使う方が軽い可能性があります。"
    : "Note: the generated file is larger than the original. The original may be the lighter option.";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatReduction(outputBytes, originalBytes) {
  const ratio = (1 - outputBytes / originalBytes) * 100;
  return `${ratio.toFixed(1)}%`;
}

function formatLabel(format) {
  if (format === "image/webp") return "WebP";
  if (format === "image/jpeg") return "JPEG";
  return format;
}

function currentLang() {
  return document.documentElement.dataset.lang || "ja";
}

function setNoResultVisible(visible) {
  document.querySelectorAll(".no-result").forEach((node) => {
    node.classList.toggle("hidden", !visible);
  });
}

function showError(key) {
  state.lastErrorKey = key;
  resetOutputState();
  const lang = currentLang();
  errorMessage.textContent = messages[key][lang] || messages[key].en;
  errorMessage.classList.remove("hidden");
  resultContent.classList.remove("hidden");
  setNoResultVisible(false);
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
  compressionAdviceEl.textContent = "";
  state.outputBlob = null;
  downloadBtn.disabled = true;
  if (state.outputUrl) {
    URL.revokeObjectURL(state.outputUrl);
    state.outputUrl = "";
  }
  previewImage.removeAttribute("src");
}

function resetTool() {
  if (compressTimer) {
    window.clearTimeout(compressTimer);
    compressTimer = null;
  }
  resetOutputState();
  state.file = null;
  state.img = null;
  state.hasTransparency = false;
  state.lastErrorKey = "";
  fileInput.value = "";
  fileNameEl.textContent = "";
  document.getElementById("format").textContent = "";
  document.getElementById("size").textContent = "";
  document.getElementById("resolution").textContent = "";
  pixelCountEl.textContent = "";
  transparencyEl.textContent = "";
  warningJa.classList.add("hidden");
  warningEn.classList.add("hidden");
  clearError();
  resultContent.classList.add("hidden");
  setNoResultVisible(true);
}

qualityRange.addEventListener("input", updateCompression);
formatSelect.addEventListener("change", updateCompression);
resetBtn.addEventListener("click", resetTool);

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

window.addEventListener("beforeunload", () => {
  if (state.outputUrl) {
    URL.revokeObjectURL(state.outputUrl);
  }
});
