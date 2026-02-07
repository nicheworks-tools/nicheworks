import * as pdfjsLib from "./pdf.min.mjs";

// Worker をローカル参照に固定（CDN禁止）
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("./pdf.worker.min.mjs", import.meta.url).toString();

// 後続の非module app.js から参照できるように window へ
window.pdfjsLib = pdfjsLib;
window.__PPTM_PDFJS_READY__ = true;
