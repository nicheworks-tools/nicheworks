// ---------- 多言語切替 ----------
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

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  applyLang(current);
});

// ---------- EXIF削除処理 ----------
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const statusEl = document.getElementById("exif-status");
const cleanBtn = document.querySelector("#clean-btn");
const doneMsg = document.querySelector("#done-msg");

// ファイル選択
dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFile);
dropArea.addEventListener("dragover", (e) => e.preventDefault());
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    handleFile();
  }
});

function handleFile() {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    preview.src = e.target.result;
    preview.classList.remove("hidden");

    statusEl.textContent = "Checking EXIF metadata...";
    cleanBtn.disabled = true;

    detectExif(e.target.result);
  };
  reader.readAsDataURL(file);
}

// EXIFの有無を判定（簡易：JPEGヘッダを確認）
function detectExif(dataUrl) {
  const binary = atob(dataUrl.split("base64,")[1]);

  const hasExif = binary.includes("Exif") || binary.includes("EXIF");

  if (hasExif) {
    statusEl.textContent = "EXIF metadata detected";
  } else {
    statusEl.textContent = "No EXIF metadata found";
  }

  cleanBtn.disabled = false;
}

// EXIF削除して保存
cleanBtn.addEventListener("click", async () => {
  doneMsg.classList.add("hidden");

  const file = fileInput.files[0];
  if (!file) return;

  const img = new Image();
  img.src = preview.src;

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "exif-cleaned-" + file.name;
      a.click();

      doneMsg.classList.remove("hidden");
    }, "image/jpeg", 0.95);
  };
});
