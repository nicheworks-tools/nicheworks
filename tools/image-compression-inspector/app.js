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
  if (file.size > 20 * 1024 * 1024) {
    alert("File too large (max 20MB)");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => processImage(file, img);
    img.onerror = () => alert("Failed to load image");
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// --------------------
// 画像解析（MVP）
// --------------------
function processImage(file, img) {
  // 元フォーマット
  document.getElementById("format").textContent = file.type || "unknown";

  // ファイルサイズ
  document.getElementById("size").textContent =
    (file.size / 1024).toFixed(1) + " KB";

  // 解像度
  document.getElementById("resolution").textContent =
    img.naturalWidth + " x " + img.naturalHeight;

  // canvasでjpeg圧縮 → 圧縮率推定（簡易）
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const jpegData = canvas.toDataURL("image/jpeg", 0.8);
  const jpegSize = Math.round((jpegData.length * 3) / 4); // Base64補正

  const ratio = ((jpegSize / file.size) * 100).toFixed(1) + "%";
  document.getElementById("ratio").textContent = ratio;

  // 推奨フォーマット（超簡易）
  let recommend = "JPEG";
  if (file.type.includes("png") && file.size < 200 * 1024) recommend = "PNG";
  if (file.type.includes("webp")) recommend = "WebP";
  document.getElementById("recommend").textContent = recommend;

  // 結果表示
  document.getElementById("result-content").classList.remove("hidden");
  document.querySelectorAll(".no-result").forEach((n) => (n.style.display = "none"));
}
