// Light Check
// Browser-only relative lighting check. Not a lux, color temperature, or flicker meter.

(function () {
  "use strict";

  const LANG_KEY = "nw_lang";
  const LEGACY_LANG_KEY = "lang";
  const HISTORY_MAX = 30;

  const state = {
    stream: null,
    running: false,
    busy: false,
    facing: "environment",
    liteMode: false,
    rafId: 0,
    lastFrameTime: 0,
    fpsEMA: 0,
    meanHistory: [],
    latest: null,
  };

  const $ = (id) => document.getElementById(id);

  const els = {
    video: $("video"),
    canvas: $("canvas"),
    hint: $("hint"),
    alert: $("lcAlert"),
    alertMsgJa: $("lcAlertMsgJa"),
    alertMsgEn: $("lcAlertMsgEn"),
    alertDismiss: $("lcAlertDismiss"),
    statusJa: $("lcStatusJa"),
    statusEn: $("lcStatusEn"),
    statusLive: $("lcStatusLive"),
    btnStart: $("btnStart"),
    btnStop: $("btnStop"),
    btnFlip: $("btnFlip"),
    btnLite: $("btnLite"),
    btnCopyResults: $("btnCopyResults"),
    btnSheetHowto: $("btnSheetHowto"),
    btnSheetResults: $("btnSheetResults"),
    sheetBackdrop: $("sheetBackdrop"),
    sheetHowto: $("sheetHowto"),
    sheetResults: $("sheetResults"),
    mBrightness: $("mBrightness"),
    mCast: $("mCast"),
    mContrast: $("mContrast"),
    mFlicker: $("mFlicker"),
    exBrightness: $("exBrightness"),
    exCast: $("exCast"),
    exContrast: $("exContrast"),
    exFlicker: $("exFlicker"),
    adviceText: $("adviceText"),
    statFps: $("statFps"),
    statSample: $("statSample"),
    statMode: $("statMode"),
  };

  function getPreferredLang() {
    const saved = (localStorage.getItem(LANG_KEY) || "").toLowerCase();
    if (saved === "ja" || saved === "en") return saved;

    const legacy = (localStorage.getItem(LEGACY_LANG_KEY) || "").toLowerCase();
    if (legacy === "ja" || legacy === "en") {
      localStorage.setItem(LANG_KEY, legacy);
      return legacy;
    }

    const browser = (navigator.language || "").toLowerCase();
    return browser.startsWith("ja") ? "ja" : "en";
  }

  function getLang() {
    return (document.documentElement.lang || getPreferredLang()).toLowerCase() === "ja" ? "ja" : "en";
  }

  function applyLang(lang) {
    const safeLang = lang === "ja" ? "ja" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === safeLang ? "" : "none";
    });
    document.querySelectorAll(".nw-lang-switch button").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === safeLang);
    });
    document.documentElement.lang = safeLang;
    localStorage.setItem(LANG_KEY, safeLang);
    updateMetricsText();
    updateStatus(state.running ? "running" : "idle");
  }

  function statusText(phase) {
    switch (phase) {
      case "starting": return { ja: "起動中…", en: "Starting…" };
      case "running": return { ja: "計測中", en: "Running" };
      case "stopping": return { ja: "停止中…", en: "Stopping…" };
      case "copied": return { ja: "結果をコピーしました", en: "Results copied" };
      case "copy_failed": return { ja: "コピーに失敗しました", en: "Copy failed" };
      case "error": return { ja: "エラー", en: "Error" };
      case "idle":
      default: return { ja: "待機中", en: "Idle" };
    }
  }

  function updateStatus(phase, custom) {
    const pair = custom || statusText(phase);
    if (els.statusJa) els.statusJa.textContent = pair.ja;
    if (els.statusEn) els.statusEn.textContent = pair.en;
    if (els.statusLive) els.statusLive.textContent = getLang() === "ja" ? pair.ja : pair.en;
  }

  function setBusy(on) {
    state.busy = Boolean(on);
    document.body.setAttribute("aria-busy", state.busy ? "true" : "false");
    updateButtons();
  }

  function updateButtons() {
    if (els.btnStart) {
      els.btnStart.hidden = state.running;
      els.btnStart.disabled = state.busy || state.running;
    }
    if (els.btnStop) {
      els.btnStop.hidden = !state.running;
      els.btnStop.disabled = !state.running;
    }
    if (els.btnFlip) els.btnFlip.disabled = state.busy || !state.running;
    if (els.btnLite) {
      els.btnLite.disabled = state.busy;
      els.btnLite.setAttribute("aria-pressed", state.liteMode ? "true" : "false");
    }
    if (els.statMode) els.statMode.textContent = state.liteMode ? "Lite" : "Normal";
  }

  function hideAlert() {
    if (els.alert) els.alert.hidden = true;
  }

  function showAlert(msgJa, msgEn) {
    if (els.alertMsgJa) els.alertMsgJa.textContent = msgJa || "—";
    if (els.alertMsgEn) els.alertMsgEn.textContent = msgEn || "—";
    if (els.alert) {
      els.alert.hidden = false;
      els.alert.querySelectorAll("[data-i18n]").forEach((el) => {
        el.style.display = el.dataset.i18n === getLang() ? "" : "none";
      });
    }
    updateStatus("error");
  }

  function explainCameraError(err) {
    const name = err && err.name ? String(err.name) : "";
    const message = err && err.message ? String(err.message) : "";

    let ja = "カメラの起動に失敗しました。権限、ブラウザ設定、他アプリのカメラ使用状況をご確認ください。";
    let en = "Failed to start the camera. Check permissions, browser settings, and whether another app is using the camera.";

    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      ja = "カメラの使用が許可されていません。ブラウザの権限設定でカメラを許可してから、もう一度お試しください。";
      en = "Camera permission was denied. Allow camera access in your browser settings and try again.";
    } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      ja = "利用可能なカメラが見つかりませんでした。端末にカメラがあるか、別アプリで使用中でないかをご確認ください。";
      en = "No available camera was found. Check that your device has a camera and that it is not in use by another app.";
    } else if (name === "NotReadableError" || name === "TrackStartError") {
      ja = "カメラを読み取れませんでした。別アプリがカメラを使用中の可能性があります。";
      en = "The camera could not be accessed. Another app may be using it.";
    } else if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
      ja = "カメラ設定が端末に合いませんでした。前後カメラの切替やLiteモードの利用をご検討ください。";
      en = "Requested camera constraints are not supported. Try switching cameras or using Lite mode.";
    } else if (name === "SecurityError") {
      ja = "セキュリティ制限でカメラがブロックされました。HTTPSまたは安全なコンテキストでの実行が必要です。";
      en = "Camera was blocked by security restrictions. HTTPS or another secure context is required.";
    } else if (name === "AbortError") {
      ja = "カメラの起動が中断されました。ページを再読み込みしてからお試しください。";
      en = "Camera start was aborted. Reload the page and try again.";
    }

    if (message.length > 0 && message.length < 140) {
      ja += "（詳細: " + message + "）";
      en += " (Detail: " + message + ")";
    }

    return { ja, en };
  }

  function stopStream(stream) {
    if (!stream || typeof stream.getTracks !== "function") return;
    stream.getTracks().forEach((track) => {
      try { track.stop(); } catch (_err) {}
    });
  }

  function hardStopCamera() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = 0;
    stopStream(state.stream);
    state.stream = null;

    if (els.video) {
      try {
        if (els.video.srcObject) stopStream(els.video.srcObject);
        els.video.srcObject = null;
        els.video.removeAttribute("src");
        if (typeof els.video.load === "function") els.video.load();
      } catch (_err) {}
    }

    state.running = false;
    state.lastFrameTime = 0;
    state.fpsEMA = 0;
    state.meanHistory = [];
    if (els.hint) els.hint.hidden = false;
    updateButtons();
  }

  async function startCamera() {
    if (state.busy || state.running) return;
    setBusy(true);
    updateStatus("starting");
    hideAlert();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia_not_supported");
      }

      hardStopCamera();
      const size = state.liteMode ? { width: 320, height: 240 } : { width: 1280, height: 720 };
      const constraints = {
        video: {
          facingMode: { ideal: state.facing },
          width: { ideal: size.width },
          height: { ideal: size.height },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      state.stream = stream;
      if (els.video) {
        els.video.srcObject = stream;
        await els.video.play();
      }
      state.running = true;
      state.lastFrameTime = 0;
      state.fpsEMA = 0;
      state.meanHistory = [];
      if (els.hint) els.hint.hidden = true;
      updateStatus("running");
      updateButtons();
      state.rafId = requestAnimationFrame(runFrameLoop);
    } catch (err) {
      hardStopCamera();
      const msg = explainCameraError(err);
      showAlert(msg.ja, msg.en);
    } finally {
      setBusy(false);
    }
  }

  function stopCamera() {
    if (state.busy && !state.running) return;
    setBusy(true);
    updateStatus("stopping");
    hardStopCamera();
    updateStatus("idle");
    setBusy(false);
  }

  async function flipCamera() {
    if (state.busy || !state.running) return;
    state.facing = state.facing === "environment" ? "user" : "environment";
    hardStopCamera();
    await startCamera();
  }

  function toggleLite() {
    if (state.busy) return;
    state.liteMode = !state.liteMode;
    updateButtons();
    if (state.running) {
      hardStopCamera();
      startCamera();
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function pct(value) {
    return String(Math.round(clamp(value, 0, 1) * 100));
  }

  function castLabel(rgb) {
    const { r, g, b } = rgb;
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (maxDiff < 10) return "neutral";
    if (r > b + 12 && r >= g - 4) return "warm";
    if (b > r + 12 && b >= g - 4) return "cool";
    if (g > r + 10 && g > b + 10) return "green";
    if (r > g + 10 && b > g + 10) return "magenta";
    return "neutral";
  }

  function castLabelToText(label, lang) {
    const map = {
      neutral: { ja: "ほぼ中立", en: "near neutral" },
      warm: { ja: "暖色寄り", en: "warm" },
      cool: { ja: "寒色寄り", en: "cool" },
      green: { ja: "緑かぶり傾向", en: "green cast" },
      magenta: { ja: "マゼンタ寄り", en: "magenta cast" },
    };
    return (map[label] || map.neutral)[lang];
  }

  function contrastLabel(std01) {
    if (std01 < 0.13) return "flat";
    if (std01 > 0.28) return "hard";
    return "normal";
  }

  function contrastLabelToText(label, lang) {
    const map = {
      flat: { ja: "低め / フラット", en: "low / flat" },
      normal: { ja: "標準的", en: "typical" },
      hard: { ja: "高め / 影が強い", en: "high / hard shadows" },
    };
    return (map[label] || map.normal)[lang];
  }

  function stabilityLabel(value) {
    if (state.meanHistory.length < 8 || state.fpsEMA < 8) return "unknown";
    if (value > 0.055) return "unstable";
    return "ok";
  }

  function stabilityLabelToText(label, lang) {
    const map = {
      ok: { ja: "安定傾向", en: "stable" },
      unstable: { ja: "変動あり", en: "variable" },
      unknown: { ja: "判定保留", en: "unknown" },
    };
    return (map[label] || map.unknown)[lang];
  }

  function analyzeFrame() {
    if (!els.video || !els.canvas || !state.running) return null;
    if (els.video.readyState < 2) return null;

    const ctx = els.canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    const width = state.liteMode ? 96 : 160;
    const height = state.liteMode ? 72 : 120;
    els.canvas.width = width;
    els.canvas.height = height;
    ctx.drawImage(els.video, 0, 0, width, height);

    const data = ctx.getImageData(0, 0, width, height).data;
    let sumY = 0;
    let sumY2 = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    const count = width * height;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sumY += y;
      sumY2 += y * y;
      sumR += r;
      sumG += g;
      sumB += b;
    }

    const mean = sumY / count;
    const variance = Math.max(0, sumY2 / count - mean * mean);
    const std = Math.sqrt(variance);
    const brightness = mean / 255;
    const std01 = std / 255;
    const rgb = { r: sumR / count, g: sumG / count, b: sumB / count };
    const cLabel = castLabel(rgb);
    const contrast = contrastLabel(std01);

    state.meanHistory.push(brightness);
    if (state.meanHistory.length > HISTORY_MAX) state.meanHistory.shift();

    const histMean = state.meanHistory.reduce((a, b) => a + b, 0) / state.meanHistory.length;
    const histVar = state.meanHistory.reduce((a, b) => a + Math.pow(b - histMean, 2), 0) / state.meanHistory.length;
    const stabilityValue = Math.sqrt(histVar);
    const sLabel = stabilityLabel(stabilityValue);

    return {
      brightness,
      castLabel: cLabel,
      contrastLabel: contrast,
      stabilityLabel: sLabel,
      stabilityValue,
      fps: state.fpsEMA,
      sample: width + "×" + height,
      mode: state.liteMode ? "Lite" : "Normal",
    };
  }

  function buildAdvice(metric, lang) {
    if (!metric) return "-";
    const ja = [];
    const en = [];

    if (metric.brightness < 0.25) {
      ja.push("明るさが低めです。ライトを近づける、照明を追加する、被写体の向きを変えるなどを検討してください。");
      en.push("Brightness is low. Consider moving the light closer, adding light, or changing the subject angle.");
    } else if (metric.brightness > 0.85) {
      ja.push("明るさが高めです。白飛びを避けるため、出力を下げる、拡散する、距離を取るなどを検討してください。");
      en.push("Brightness is high. To avoid clipped highlights, consider reducing intensity, diffusing, or moving the light farther away.");
    } else {
      ja.push("明るさは比較しやすい範囲に見えます。次は色かぶりと影の出方を確認してください。");
      en.push("Brightness looks usable for comparison. Next, check color cast and shadow contrast.");
    }

    if (metric.castLabel === "warm") {
      ja.push("暖色寄りです。照明の色温度やホワイトバランスを揃えると安定しやすくなります。");
      en.push("The image looks warm. Matching light color temperature or white balance may help.");
    } else if (metric.castLabel === "cool") {
      ja.push("寒色寄りです。必要に応じて暖色寄りの照明やホワイトバランス調整を確認してください。");
      en.push("The image looks cool. Consider warmer lighting or white-balance adjustment if needed.");
    } else if (metric.castLabel === "green") {
      ja.push("緑かぶり傾向があります。LED照明と環境光の混在が影響している可能性があります。");
      en.push("A green cast is likely. Mixed LED and ambient lighting may be affecting the result.");
    } else if (metric.castLabel === "magenta") {
      ja.push("マゼンタ寄りの傾向があります。フィルタやホワイトバランス設定を確認してください。");
      en.push("A magenta cast is likely. Check filters and white-balance settings.");
    } else {
      ja.push("色かぶりは大きくなさそうです。");
      en.push("Color cast appears mild.");
    }

    if (metric.contrastLabel === "hard") {
      ja.push("影が強めです。ディフューザー、レフ板、ライト位置の調整で柔らかくできます。");
      en.push("Shadows look hard. Diffusion, a reflector, or repositioning the light can soften them.");
    } else if (metric.contrastLabel === "flat") {
      ja.push("全体がフラット気味です。立体感が必要な場合はライトに角度をつけてください。");
      en.push("The image looks flat. If depth is needed, angle the light more.");
    } else {
      ja.push("コントラストは標準的に見えます。");
      en.push("Contrast looks typical.");
    }

    if (metric.stabilityLabel === "unstable") {
      ja.push("Fは明るさ変動ありです。これはフリッカーそのものの確定ではなく、端末FPS・自動露出・シャッター・照明PWMの影響を受ける簡易指標です。");
      en.push("F shows visible brightness variation. This is not confirmed flicker; it is a simple camera-based indicator affected by FPS, exposure, shutter, and PWM lighting.");
    } else if (metric.stabilityLabel === "ok") {
      ja.push("Fは安定傾向です。ただし正確なフリッカー測定ではありません。");
      en.push("F appears stable, but this is not an accurate flicker measurement.");
    } else {
      ja.push("Fは判定保留です。FPSが低い、または露出制御が変動している可能性があります。");
      en.push("F is unknown. FPS may be low or exposure may be changing.");
    }

    return (lang === "ja" ? ja : en).join("\n");
  }

  function updateMetricsText() {
    const metric = state.latest;
    const lang = getLang();
    if (!metric) {
      [els.mBrightness, els.mCast, els.mContrast, els.mFlicker, els.exBrightness, els.exCast, els.exContrast, els.exFlicker, els.adviceText, els.statFps, els.statSample].forEach((el) => {
        if (el) el.textContent = "-";
      });
      if (els.statMode) els.statMode.textContent = state.liteMode ? "Lite" : "Normal";
      return;
    }

    const b = pct(metric.brightness);
    const cast = castLabelToText(metric.castLabel, lang);
    const contrast = contrastLabelToText(metric.contrastLabel, lang);
    const stability = stabilityLabelToText(metric.stabilityLabel, lang);
    const fps = metric.fps ? metric.fps.toFixed(1) : "-";

    if (els.mBrightness) els.mBrightness.textContent = b;
    if (els.mCast) els.mCast.textContent = cast;
    if (els.mContrast) els.mContrast.textContent = contrast;
    if (els.mFlicker) els.mFlicker.textContent = stability;
    if (els.exBrightness) els.exBrightness.textContent = b + " / 100";
    if (els.exCast) els.exCast.textContent = cast;
    if (els.exContrast) els.exContrast.textContent = contrast;
    if (els.exFlicker) els.exFlicker.textContent = stability + " (" + metric.stabilityValue.toFixed(3) + ")";
    if (els.adviceText) els.adviceText.textContent = buildAdvice(metric, lang);
    if (els.statFps) els.statFps.textContent = fps;
    if (els.statSample) els.statSample.textContent = metric.sample;
    if (els.statMode) els.statMode.textContent = metric.mode;
  }

  function runFrameLoop(timestamp) {
    if (!state.running) return;

    if (timestamp && state.lastFrameTime) {
      const delta = timestamp - state.lastFrameTime;
      if (delta > 0) {
        const fps = 1000 / delta;
        state.fpsEMA = state.fpsEMA ? state.fpsEMA * 0.85 + fps * 0.15 : fps;
      }
    }
    if (timestamp) state.lastFrameTime = timestamp;

    const metric = analyzeFrame();
    if (metric) {
      state.latest = metric;
      updateMetricsText();
    }

    state.rafId = requestAnimationFrame(runFrameLoop);
  }

  function openSheet(which) {
    if (els.sheetBackdrop) els.sheetBackdrop.hidden = false;
    if (els.sheetHowto) els.sheetHowto.hidden = which !== "howto";
    if (els.sheetResults) els.sheetResults.hidden = which !== "results";
    document.body.style.overflow = "hidden";
  }

  function closeSheets() {
    if (els.sheetBackdrop) els.sheetBackdrop.hidden = true;
    if (els.sheetHowto) els.sheetHowto.hidden = true;
    if (els.sheetResults) els.sheetResults.hidden = true;
    document.body.style.overflow = "";
  }

  function buildCopyText() {
    const metric = state.latest;
    const lang = getLang();
    const note = lang === "ja"
      ? "注意: カメラ映像からの相対評価です。照度計・色温度計・フリッカーメーターの代替ではありません。"
      : "Note: Relative camera-based estimate. Not a lux, color temperature, or flicker meter.";

    if (!metric) {
      return lang === "ja"
        ? "Light Check\nまだ結果がありません。\n" + note
        : "Light Check\nNo result yet.\n" + note;
    }

    return [
      "Light Check",
      "Brightness: " + pct(metric.brightness) + " / 100",
      "Cast: " + castLabelToText(metric.castLabel, lang),
      "Contrast: " + contrastLabelToText(metric.contrastLabel, lang),
      "Stability / F: " + stabilityLabelToText(metric.stabilityLabel, lang),
      "FPS: " + (metric.fps ? metric.fps.toFixed(1) : "-"),
      "Mode: " + metric.mode,
      note,
    ].join("\n");
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_err) { ok = false; }
    textarea.remove();
    return ok;
  }

  async function copyResults() {
    const text = buildCopyText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        updateStatus("copied");
        return;
      }
      if (fallbackCopy(text)) {
        updateStatus("copied");
        return;
      }
      updateStatus("copy_failed");
    } catch (_err) {
      if (fallbackCopy(text)) updateStatus("copied");
      else updateStatus("copy_failed");
    }
  }

  function bindEvents() {
    document.querySelectorAll(".nw-lang-switch button").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.lang === "ja" || button.dataset.lang === "en") applyLang(button.dataset.lang);
      });
    });

    if (els.btnStart) els.btnStart.addEventListener("click", startCamera);
    if (els.btnStop) els.btnStop.addEventListener("click", stopCamera);
    if (els.btnFlip) els.btnFlip.addEventListener("click", flipCamera);
    if (els.btnLite) els.btnLite.addEventListener("click", toggleLite);
    if (els.btnCopyResults) els.btnCopyResults.addEventListener("click", copyResults);
    if (els.btnSheetHowto) els.btnSheetHowto.addEventListener("click", () => openSheet("howto"));
    if (els.btnSheetResults) els.btnSheetResults.addEventListener("click", () => openSheet("results"));
    if (els.sheetBackdrop) els.sheetBackdrop.addEventListener("click", closeSheets);
    if (els.alertDismiss) els.alertDismiss.addEventListener("click", hideAlert);

    document.querySelectorAll("[data-sheet-close]").forEach((button) => {
      button.addEventListener("click", closeSheets);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSheets();
    });

    window.addEventListener("pagehide", hardStopCamera);
    window.addEventListener("beforeunload", hardStopCamera);
  }

  function init() {
    bindEvents();
    applyLang(getPreferredLang());
    updateButtons();
    updateMetricsText();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
