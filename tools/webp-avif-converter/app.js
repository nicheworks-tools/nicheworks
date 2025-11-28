/* ================================
   要素取得
================================ */
const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const errorBox = document.getElementById("error");
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

/* ================================
   エラー表示
================================ */
function showError(msg) {
  errorBox.innerText = msg;
  errorBox.style.display = "block";
  hideProgress();
}

function clearError() {
  errorBox.style.display = "none";
}

/* ================================
   プログレス
================================ */
function showProgress() {
  progressBar.style.display = "block";
}

function hideProgress() {
  progressBar.style.display = "none";
}

/* ================================
   ファイルドロップゾーン
================================ */
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
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

/* ================================
   アップロード即時バリデーション（12-7）
================================ */
function handleFile(file) {
  clearError();

  if (!file) return;

  const ext = file.name.toLowerCase();

  if (!ext.endsWith(".webp") && !ext.endsWith(".avif")) {
    showError("対応形式ではありません（WebP / AVIF のみ）");
    convertBtn.disabled = true;
    convertJpegBtn.disabled = true;
    return;
  }

  loadedFile = file;
  convertBtn.disabled = false;
  convertJpegBtn.disabled = false;
}

/* ================================
   実際の変換処理
================================ */
async function convertImage(type = "png") {
  if (!loadedFile) return;

  clearError();
  showProgress();

  const blobURL = URL.createObjectURL(loadedFile);
  const img = new Image();

  img.onload = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const mime = type === "png" ? "image/png" : "image/jpeg";
      const dataURL = canvas.toDataURL(mime, type === "jpeg" ? 0.92 : undefined);

      // dataURL → Blob へ変換
      const binary = atob(dataURL.split(",")[1]);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

      convertedBlob = new Blob([array], { type: mime });

      // プレビュー反映
      previewImg.src = URL.createObjectURL(convertedBlob);
      sizeInfo.innerText = `推定サイズ：${(convertedBlob.size / 1024).toFixed(1)} KB`;

      // ダウンロードボタン
      downloadBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = previewImg.src;
        a.download = `converted.${type}`;
        a.click();
      };

      // 結果表示
      resultBlock.style.display = "block";

      // 自動スクロール（12-4）
      resultBlock.scrollIntoView({ behavior: "smooth", block: "start" });

      hideProgress();
    } catch (e) {
      showError("変換中にエラーが発生しました");
      hideProgress();
    }
  };

  img.onerror = () => {
    showError("画像の読み込みに失敗しました");
    hideProgress();
  };

  img.src = blobURL;
}

/* ================================
   ボタン
================================ */
convertBtn.addEventListener("click", () => convertImage("png"));
convertJpegBtn.addEventListener("click", () => convertImage("jpeg"));

/* ================================
   リセット（12-2）
================================ */
resetBtn.addEventListener("click", () => {
  loadedFile = null;
  convertedBlob = null;

  fileInput.value = "";
  convertBtn.disabled = true;
  convertJpegBtn.disabled = true;

  resultBlock.style.display = "none";
  previewImg.src = "";
  sizeInfo.innerText = "";

  clearError();
  hideProgress();

  // ページ上部へ戻る
  window.scrollTo({ top: 0, behavior: "smooth" });
});


/* ================================
   言語スイッチ（UIのみ）
================================ */
const langBtns = document.querySelectorAll(".nw-lang-btn");
langBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    langBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    // 必要ならここで文言切替を実装できる
  });
});
