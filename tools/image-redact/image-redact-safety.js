// Image Redact safety/compat layer.
// Keeps the existing large app.js intact while fixing visible Save PNG and QA UX.
(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

  var browserLang = (navigator.language || "").toLowerCase();
  var currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  function readLang() {
    var active = $(".nw-lang-switch button.active");
    if (active && active.dataset && active.dataset.lang) return active.dataset.lang;
    return currentLang;
  }

  function t(ja, en) {
    return readLang() === "ja" ? ja : en;
  }

  function setStatus(message, kind) {
    var box = $("#saveStatus");
    if (!box) return;
    box.textContent = message;
    box.classList.add("is-visible");
    box.classList.toggle("is-error", kind === "error");
    box.classList.toggle("is-ok", kind === "ok");
  }

  function hasImageLoaded() {
    var canvas = $("#canvas");
    if (!canvas || !canvas.width || !canvas.height) return false;
    try {
      var ctx = canvas.getContext("2d");
      if (!ctx) return false;
      var sample = ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
      return sample[3] !== 0;
    } catch (_) {
      return true;
    }
  }

  function maskCount() {
    var el = $("#maskCount");
    var n = el ? parseInt(el.textContent || "0", 10) : 0;
    return Number.isFinite(n) ? n : 0;
  }

  function selectedMaskType() {
    var checked = document.querySelector('input[name="maskType"]:checked');
    return checked ? checked.value : "solid";
  }

  function selectedStrength() {
    var el = $("#strengthRange");
    var n = el ? parseInt(el.value || "0", 10) : 0;
    return Number.isFinite(n) ? n : 0;
  }

  function openSafetyChecklist() {
    var section = $("#safetyChecklist");
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () {
      try { section.focus({ preventScroll: true }); } catch (_) { section.focus(); }
    }, 280);
  }

  function runPreSaveCheck() {
    var warnings = [];
    if (!hasImageLoaded()) {
      warnings.push(t("画像が読み込まれていません。", "No image appears to be loaded."));
    }
    if (maskCount() <= 0) {
      warnings.push(t("マスクが0件です。隠したい範囲をAddで囲んでください。", "There are no masks. Use Add and drag over sensitive areas."));
    }
    var type = selectedMaskType();
    var strength = selectedStrength();
    if ((type === "blur" || type === "pixelate") && strength < 16) {
      warnings.push(t("Blur / Pixelate の強度が弱い可能性があります。推奨は16以上です。", "Blur / Pixelate strength may be too weak. 16+ is recommended."));
    }
    return warnings;
  }

  function clickIfExists(selector) {
    var el = $(selector);
    if (!el) return false;
    el.click();
    return true;
  }

  function fallbackDownloadFromCanvas() {
    var preview = $("#previewCanvas");
    var editor = $("#canvas");
    var canvas = preview || editor;
    if (!canvas || !canvas.toBlob) return false;

    try {
      canvas.toBlob(function (blob) {
        if (!blob) {
          setStatus(t("PNG保存に失敗しました。プレビューを開いてから再度保存してください。", "PNG export failed. Open Preview and try saving again."), "error");
          return;
        }
        var a = document.createElement("a");
        var url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "image-redacted-" + Date.now() + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        setStatus(t("PNGを保存しました。画像はブラウザ内で処理されました。EXIFなども消したい場合はEXIF Cleaner Miniを確認してください。", "PNG saved. The image was processed in your browser. Use EXIF Cleaner Mini too if you need metadata cleanup."), "ok");
      }, "image/png");
      return true;
    } catch (_) {
      return false;
    }
  }

  function saveViaExistingApp() {
    // Prefer existing app.js export handlers when present.
    if (clickIfExists("#btnExport")) return true;
    if (clickIfExists("#btnDownload")) return true;
    return fallbackDownloadFromCanvas();
  }

  function handleSaveClick(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var warnings = runPreSaveCheck();
    if (warnings.length) {
      setStatus(warnings.join(" "), "error");
      openSafetyChecklist();
      return;
    }

    if (!saveViaExistingApp()) {
      setStatus(t("保存処理を開始できませんでした。Previewを開いてから再度Save PNGを押してください。", "Could not start saving. Open Preview and press Save PNG again."), "error");
      return;
    }

    setStatus(t("PNG保存を開始しました。保存後は、拡大して隠し漏れがないか確認してください。", "PNG export started. After saving, zoom in and check for missed sensitive areas."), "ok");
  }

  function wireSaveButtons() {
    ["#btnSavePng", "#btnSavePng2"].forEach(function (selector) {
      var btn = $(selector);
      if (!btn || btn.dataset.safetyWired === "1") return;
      btn.dataset.safetyWired = "1";
      btn.addEventListener("click", handleSaveClick, true);
    });
  }

  function wireQaButton() {
    var qa = $("#qaBtn");
    if (!qa || qa.dataset.safetyWired === "1") return;
    qa.dataset.safetyWired = "1";
    qa.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var warnings = runPreSaveCheck();
      if (warnings.length) {
        setStatus(warnings.join(" "), "error");
      } else {
        setStatus(t("保存前チェック項目を表示しました。プレビューで拡大確認してください。", "Safety checklist opened. Zoom into the preview before sharing."), "ok");
      }
      openSafetyChecklist();
    }, true);
  }

  function annotateModeButtons() {
    var labels = {
      modeAdd: ["範囲追加", "Add area"],
      modeEdit: ["選択・移動", "Edit/move"],
      modePan: ["表示移動", "Pan view"]
    };
    Object.keys(labels).forEach(function (id) {
      var el = $("#" + id);
      if (!el) return;
      el.setAttribute("title", labels[id][0] + " / " + labels[id][1]);
    });
  }

  function keepCurrentLanguageInSync() {
    $all(".nw-lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.dataset && btn.dataset.lang) currentLang = btn.dataset.lang;
      });
    });
  }

  function init() {
    wireSaveButtons();
    wireQaButton();
    annotateModeButtons();
    keepCurrentLanguageInSync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
