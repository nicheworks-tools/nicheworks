/* ===================================
 * WebP / AVIF Converter - app.js
 * NicheWorks 共通仕様 第12章対応版
 * =================================== */

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const convertBtn = document.getElementById("convert-btn");
const errorBox = document.getElementById("error-box");
const progressBox = document.getElementById("progress");
const progressBar = progressBox.querySelector(".progress-bar");
const resultArea = document.getElementById("result-area");
const previewImg = document.getElementById("preview");
const sizeInfo = document.getElementById("size-info");
const downloadBtn = document.getElementById("download");
const resetBtn = document.getElementById("reset-btn");

let loadedFile = null;

/* ---------------------------
 * 共通：エラー表示（12-5）
 * ------------------------- */
function showError(message) {
  errorBox.style.display = "block";
  errorBox.textContent = message;

  // プログレスバーも即消す（12-5）
  progressBox.style.display = "none";
  progressBar.style.width = "0%";
}

/* ---------------------------
 * 共通：エラー消去
 * ------------------------- */
function clearError() {
  errorBox.style.display = "none";
  errorBox.textContent = "";
}

/* ---------------------------
 * 即時バリデーション（12-7）
 * ------------------------- */
function validateFile(file) {
  const validExt = ["image/webp", "image/avif"];
  const nameValid = file.name.endsWith(".webp") || file.name.endsWith(".avif");

  if (!validExt.includes(file.type) && !nameValid) {
    showError("対応していない形式です（WebP / AVIF のみ）。");
    convertBtn.disabled = true;
    return false;
  }

  if (file.size > 15 * 1024 * 1024) {
    showError("ファイルサイズが大きすぎます（最大15MBまで）。");
    convertBtn.disabled = true;
    return false;
  }

  clearError();
  convertBtn.disabled = false;
  return true;
}

/* ---------------------------
 * Drop Zone UI
 * ------------------------- */
dropZone.addEventListener("click", () => fileInput.click());

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

  const file = e.dataTransfer.files[0];
  if (!file) return;

  if (validateFile(file)) {
    loadedFile = file;
  }
});

/* ---------------------------
 * File input
 * ------------------------- */
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (validateFile(file)) {
    loadedFile = file;
  }
});

/* ---------------------------
 * Progress bar（12-1）
 * ------------------------- */
function startProgress() {
  progressBox.style.display = "block";
  progressBar.style.width = "0%";

  // indeterminate風：徐々に伸ばす
  let w = 0;
  const timer = setInterval(() => {
    w += Math.random() * 20;
    if (w > 95) w = 95;
    progressBar.style.width = w + "%";
  }, 200);

  return timer;
}

function endProgress(timer) {
  clearInterval(timer);
  progressBar.style.width = "100%";

  setTimeout(() => {
    progressBox.style.display = "none";
    progressBar.style.width = "0%";
  }, 300);
}

/* ---------------------------
 * WebP / AVIF → PNG/JPEG 変換
 * ------------------------- */
convertBtn.addEventListener("click", async () => {
  if (!loadedFile) return;

  clearError();
  resultArea.style.display = "none";

  const timer = startProgress();

  try {
    const fmt = document.querySelector("input[name='fmt']:checked").value;

    const img = new Image();
    img.src = URL.createObjectURL(loadedFile);

    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    let mime = fmt === "jpeg" ? "image/jpeg" : "image/png";
    let out = canvas.toDataURL(mime);

    // プレビュー表示
    previewImg.src = out;

    // サイズ情報
    const beforeKB = (loadedFile.size / 1024).toFixed(1);
    const afterKB = (out.length * 0.75 / 1024).toFixed(1); // Base64 → byte計算

    sizeInfo.textContent = `変換前: ${beforeKB} KB → 変換後: ${afterKB} KB`;

    // ダウンロード設定
    downloadBtn.href = out;
    downloadBtn.download = `converted.${fmt}`;

    // 結果表示
    resultArea.style.display = "block";

    // 自動スクロール（12-4）
    resultArea.scrollIntoView({ behavior: "smooth" });

    endProgress(timer);

  } catch (err) {
    console.error(err);
    showError("変換に失敗しました。画像が破損している可能性があります。");
    endProgress(timer);
  }
});

/* ---------------------------
 * リセット（12-2）
 * ------------------------- */
resetBtn.addEventListener("click", () => {
  loadedFile = null;
  fileInput.value = "";
  resultArea.style.display = "none";
  clearError();

  convertBtn.disabled = true;
  progressBox.style.display = "none";

  previewImg.src = "";
  sizeInfo.textContent = "";
});

/* ---------------------------
 * 言語切替（共通 nw-lang.js との連動）
 * data-ja / data-en が適切に反映されるように
 * ------------------------- */
// ※ここでは何もしない。nw-lang.js が全て処理する。
