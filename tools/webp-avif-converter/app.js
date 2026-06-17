/* ================================
   Elements
================================ */
const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const errorBox = document.getElementById("error");
const fileInfo = document.getElementById("file-info");
const progressBar = document.getElementById("progress");

const convertBtn = document.getElementById("convert-btn");
const convertJpegBtn = document.getElementById("convert-jpeg-btn");

const resultBlock = document.getElementById("result");
const previewImg = document.getElementById("preview-img");
const sizeInfo = document.getElementById("size-info");
const downloadBtn = document.getElementById("download-btn");
const resetBtn = document.getElementById("reset-btn");

let loadedFile = null;
let convertedBlob = null;
let sourceUrl = null;
let previewUrl = null;
let currentOutputExt = "png";
let currentLang = "ja";
let isConverting = false;

const I18N = {
  ja: {
    title: "WebP / AVIF → PNG・JPEG 変換ツール",
    subtitle: "WebP・AVIF画像をPNGまたはJPEGへブラウザ内で変換します。画像はサーバーに送信されません。",
    lead: "WebP / AVIF画像を選び、PNGまたはJPEGに変換して保存できます。現在は1枚ずつの変換です。",
    note: "AVIFの読み込みはブラウザ対応に依存します。大きすぎる画像は端末メモリ不足で失敗する場合があります。",
    formatTitle: "出力形式の違い",
    formatPng: "PNG：透過を維持しやすく、画質劣化を避けたい場合に向いています。",
    formatJpeg: "JPEG：ファイルサイズを小さくしやすいですが、透過は白背景になります。",
    dropText: "ここに画像をドロップ\nまたはタップして選択",
    dropHint: "対応形式：WebP / AVIF（1枚ずつ）",
    convertPng: "PNGに変換",
    convertJpeg: "JPEGに変換",
    resultTitle: "変換結果",
    download: "ダウンロード",
    reset: "リセット",
    faqTitle: "FAQ",
    faqLocalQ: "Q. 画像はサーバーに送信されますか？",
    faqLocalA: "A. いいえ。ブラウザ内で処理されます。",
    faqAvifQ: "Q. AVIFが読み込めません。",
    faqAvifA: "A. AVIFの読み込みはブラウザ対応に依存します。別ブラウザや最新版で試してください。",
    faqJpegQ: "Q. JPEGにすると透明部分はどうなりますか？",
    faqJpegA: "A. 透明部分は失われ、白背景として保存されます。",
    faqBatchQ: "Q. 複数画像を一括変換できますか？",
    faqBatchA: "A. 現時点では1枚ずつの変換です。",
    faqMetaQ: "Q. EXIF情報は保持されますか？",
    faqMetaA: "A. Canvasで再生成するため多くのメタデータは引き継がれませんが、完全な削除保証ではありません。",
    donateText: "このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。",
    footerNote: "本ツールはブラウザ上のみで処理され、画像は一切送信されません。",
    unsupported: "対応形式ではありません。WebPまたはAVIF画像を選択してください。",
    tooManyFiles: "現在は1枚ずつの変換です。1枚だけ選択してください。",
    loadFailed: "画像の読み込みに失敗しました。AVIF非対応ブラウザ、破損ファイル、拡張子偽装の可能性があります。",
    convertFailed: "変換中にエラーが発生しました。画像が大きすぎる、またはブラウザが形式に対応していない可能性があります。",
    snifferHelp: "FileType Snifferで形式を確認する",
    selected: "選択中",
    original: "変換元",
    converted: "変換後",
    dimensions: "画像サイズ"
  },
  en: {
    title: "WebP / AVIF to PNG/JPEG Converter",
    subtitle: "Convert WebP or AVIF images to PNG or JPEG in your browser. Images are not uploaded to a server.",
    lead: "Choose one WebP or AVIF image, convert it to PNG or JPEG, and download the result. Batch conversion is not supported yet.",
    note: "AVIF loading depends on browser support. Very large images may fail because of device memory limits.",
    formatTitle: "Output format notes",
    formatPng: "PNG: useful when you want to keep transparency and avoid lossy compression.",
    formatJpeg: "JPEG: often smaller, but transparency is replaced with a white background.",
    dropText: "Drop an image here\nor tap to choose",
    dropHint: "Supported formats: WebP / AVIF (one image at a time)",
    convertPng: "Convert to PNG",
    convertJpeg: "Convert to JPEG",
    resultTitle: "Result",
    download: "Download",
    reset: "Reset",
    faqTitle: "FAQ",
    faqLocalQ: "Q. Are images uploaded to a server?",
    faqLocalA: "A. No. Processing happens in your browser.",
    faqAvifQ: "Q. AVIF does not load.",
    faqAvifA: "A. AVIF loading depends on browser support. Try an updated browser.",
    faqJpegQ: "Q. What happens to transparent areas in JPEG?",
    faqJpegA: "A. Transparency is lost and saved as a white background.",
    faqBatchQ: "Q. Can I convert multiple images at once?",
    faqBatchA: "A. Not yet. This tool currently converts one image at a time.",
    faqMetaQ: "Q. Is EXIF metadata preserved?",
    faqMetaA: "A. The image is regenerated through Canvas, so much metadata is not carried over. This is not a guaranteed metadata cleaner.",
    donateText: "If this tool helped, support helps keep NicheWorks running.",
    footerNote: "This tool runs in your browser and does not upload images.",
    unsupported: "Unsupported file type. Please choose a WebP or AVIF image.",
    tooManyFiles: "This tool currently converts one image at a time. Choose one file only.",
    loadFailed: "The image could not be loaded. The browser may not support AVIF, the file may be broken, or the extension may be wrong.",
    convertFailed: "Conversion failed. The image may be too large, or your browser may not support this format.",
    snifferHelp: "Check the file with FileType Sniffer",
    selected: "Selected",
    original: "Original",
    converted: "Converted",
    dimensions: "Dimensions"
  }
};

/* ================================
   Helpers
================================ */
function t(key) {
  return I18N[currentLang][key] || I18N.ja[key] || key;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function showError(msg, includeSnifferLink = false) {
  errorBox.textContent = msg;

  if (includeSnifferLink) {
    const space = document.createTextNode(" ");
    const link = document.createElement("a");
    link.href = "/tools/filetype-sniffer/";
    link.textContent = t("snifferHelp");
    errorBox.appendChild(space);
    errorBox.appendChild(link);
  }

  errorBox.style.display = "block";
  hideProgress();
}

function clearError() {
  errorBox.innerHTML = "";
  errorBox.style.display = "none";
}

function showProgress() {
  progressBar.style.display = "block";
}

function hideProgress() {
  progressBar.style.display = "none";
}

function revokeUrls() {
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  sourceUrl = null;
  previewUrl = null;
}

function resetResultOnly() {
  resultBlock.style.display = "none";
  previewImg.removeAttribute("src");
  sizeInfo.innerText = "";
  convertedBlob = null;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
}

function isSupportedImage(file) {
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return type === "image/webp" ||
    type === "image/avif" ||
    name.endsWith(".webp") ||
    name.endsWith(".avif");
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob failed"));
    }, mime, quality);
  });
}

function updateFileInfo(extra = "") {
  if (!loadedFile) {
    fileInfo.style.display = "none";
    fileInfo.innerText = "";
    return;
  }

  const pieces = [
    `${t("selected")}：${loadedFile.name || "image"}`,
    `${t("original")}：${formatBytes(loadedFile.size)}`
  ];

  if (extra) pieces.push(extra);
  fileInfo.innerText = pieces.join(" / ");
  fileInfo.style.display = "block";
}

function setButtonsEnabled(enabled) {
  const usable = Boolean(enabled && loadedFile && !isConverting);
  convertBtn.disabled = !usable;
  convertJpegBtn.disabled = !usable;
}

function setStoredLang(lang) {
  try {
    localStorage.setItem("webpAvifConverterLang", lang);
  } catch (e) {
    // Storage can be unavailable in some privacy modes. The UI still works.
  }
}

function getStoredLang() {
  try {
    return localStorage.getItem("webpAvifConverterLang");
  } catch (e) {
    return null;
  }
}

function setLang(lang) {
  currentLang = I18N[lang] ? lang : "ja";
  document.documentElement.lang = currentLang;
  setStoredLang(currentLang);

  document.querySelectorAll("[data-i18n-key]").forEach((el) => {
    const value = t(el.dataset.i18nKey);
    if (el.classList.contains("drop-main")) {
      el.innerText = value;
    } else {
      el.textContent = value;
    }
  });

  document.querySelectorAll(".nw-lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });

  updateFileInfo();
}

/* ================================
   File selection
================================ */
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFileList(e.dataTransfer.files);
});

fileInput.addEventListener("change", (e) => {
  handleFileList(e.target.files);
  e.target.value = "";
});

function handleFileList(files) {
  if (!files || files.length === 0) return;
  if (files.length > 1) {
    clearError();
    hideProgress();
    showError(t("tooManyFiles"));
    return;
  }
  handleFile(files[0]);
}

function handleFile(file) {
  if (isConverting) return;

  clearError();
  hideProgress();
  revokeUrls();
  resetResultOnly();
  loadedFile = null;
  setButtonsEnabled(false);

  if (!file) return;

  if (!isSupportedImage(file)) {
    showError(t("unsupported"), true);
    fileInput.value = "";
    return;
  }

  loadedFile = file;
  setButtonsEnabled(true);
  updateFileInfo();
}

/* ================================
   Conversion
================================ */
async function loadImageFromFile(file) {
  sourceUrl = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";

  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = sourceUrl;
  });
}

async function convertImage(type = "png") {
  if (!loadedFile || isConverting) return;

  clearError();
  showProgress();
  resetResultOnly();
  isConverting = true;
  setButtonsEnabled(false);

  try {
    const img = await loadImageFromFile(loadedFile);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext("2d", { alpha: type !== "jpeg" });
    if (!ctx) throw new Error("canvas context failed");

    if (type === "jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    const mime = type === "png" ? "image/png" : "image/jpeg";
    convertedBlob = await canvasToBlob(canvas, mime, type === "jpeg" ? 0.92 : undefined);
    currentOutputExt = type === "png" ? "png" : "jpg";

    previewUrl = URL.createObjectURL(convertedBlob);
    previewImg.src = previewUrl;
    sizeInfo.innerText = `${t("dimensions")}：${canvas.width}×${canvas.height} / ${t("original")}：${formatBytes(loadedFile.size)} / ${t("converted")}：${formatBytes(convertedBlob.size)}`;
    updateFileInfo(`${t("dimensions")}：${canvas.width}×${canvas.height}`);

    resultBlock.style.display = "block";
    resultBlock.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    const isLoadError = e && e.message === "image load failed";
    showError(isLoadError ? t("loadFailed") : t("convertFailed"), isLoadError);
  } finally {
    hideProgress();
    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
      sourceUrl = null;
    }
    isConverting = false;
    setButtonsEnabled(Boolean(loadedFile));
  }
}

/* ================================
   Buttons
================================ */
convertBtn.addEventListener("click", () => convertImage("png"));
convertJpegBtn.addEventListener("click", () => convertImage("jpeg"));

downloadBtn.addEventListener("click", () => {
  if (!convertedBlob || !previewUrl) return;
  const baseName = (loadedFile?.name || "converted")
    .replace(/\.(webp|avif)$/i, "")
    .replace(/[^a-z0-9._-]+/gi, "-") || "converted";
  const a = document.createElement("a");
  a.href = previewUrl;
  a.download = `${baseName}.${currentOutputExt}`;
  a.click();
});

resetBtn.addEventListener("click", () => {
  loadedFile = null;
  convertedBlob = null;
  isConverting = false;
  revokeUrls();

  fileInput.value = "";
  setButtonsEnabled(false);

  resultBlock.style.display = "none";
  previewImg.removeAttribute("src");
  sizeInfo.innerText = "";
  updateFileInfo();

  clearError();
  hideProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ================================
   Language switch
================================ */
document.querySelectorAll(".nw-lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

const savedLang = getStoredLang();
const browserLang = (navigator.language || "").toLowerCase();
setLang(savedLang || (browserLang.startsWith("ja") ? "ja" : "en"));