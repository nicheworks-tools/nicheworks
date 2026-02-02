// Light Check — LC-02
// - Camera start/stop/flip
// - Relative metrics: brightness (mean luma), cast (RGB bias), contrast (luma stddev proxy), stability (variance proxy)
// - One-screen UI + bottom sheets
// Notes: not a lux meter; flicker/stability detection is limited by FPS.

(function () {
  // ---------- i18n ----------
  function getPreferredLang() {
    const saved = (localStorage.getItem("lang") || "").toLowerCase();
    if (saved === "ja" || saved === "en") return saved;
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  }

  function applyLang(lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    document.querySelectorAll(".nw-lang-switch button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
  }

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);

  const elVideo = $("video");
  const elCanvas = $("canvas");
  const elHint = $("hint");

  const btnStart = $("btnStart");
  const btnStop = $("btnStop");
  const btnFlip = $("btnFlip");
  const btnLite = $("btnLite");

  const btnSheetHowto = $("btnSheetHowto");
  const btnSheetResults = $("btnSheetResults");

  const sheetBackdrop = $("sheetBackdrop");
  const sheetHowto = $("sheetHowto");
  const sheetResults = $("sheetResults");

  const mBrightness = $("mBrightness");
  const mCast = $("mCast");
  const mContrast = $("mContrast");
  const mFlicker = $("mFlicker");

  const exBrightness = $("exBrightness");
  const exCast = $("exCast");
  const exContrast = $("exContrast");
  const exFlicker = $("exFlicker");
  const adviceText = $("adviceText");

  const statFps = $("statFps");
  const statSample = $("statSample");
  const statMode = $("statMode");

  // ---------- State ----------
  let stream = null;
  let running = false;
  let facing = "environment";
  let liteMode = false;

  let rafId = 0;
  let lastFrameT = 0;
  let fpsEMA = 0;

  const meanHistory = [];
  const HISTORY_MAX = 30;

  // ---------- Helpers ----------
  function setBtnState() {
    btnStart.disabled = running;
    btnStop.disabled = !running;
    btnFlip.disabled = !running;
    btnLite.disabled = false;
    btnLite.setAttribute("aria-pressed", liteMode ? "true" : "false");
    statMode.textContent = liteMode ? "Lite" : "Normal";
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function fmtPct01(x) {
    const v = Math.round(clamp(x, 0, 1) * 100);
    return String(v);
  }

  function openSheet(which) {
    sheetBackdrop.hidden = false;
    if (which === "howto") {
      sheetHowto.hidden = false;
      sheetResults.hidden = true;
    } else {
      sheetHowto.hidden = true;
      sheetResults.hidden = false;
    }
    document.body.style.overflow = "hidden";
  }

  function closeSheets() {
    sheetBackdrop.hidden = true;
    sheetHowto.hidden = true;
    sheetResults.hidden = true;
    document.body.style.overflow = "";
  }

  function setMetricsStub() {
    mBrightness.textContent = "-";
    mCast.textContent = "-";
    mContrast.textContent = "-";
    mFlicker.textContent = "-";
    exBrightness.textContent = "-";
    exCast.textContent = "-";
    exContrast.textContent = "-";
    exFlicker.textContent = "-";
    adviceText.textContent = "-";
    statFps.textContent = "-";
    statSample.textContent = "-";
  }

  function buildAdvice({ b, castLabel, contrastLabel, stabilityLabel }) {
    const linesJa = [];
    const linesEn = [];

    // brightness
    if (b < 0.25) {
      linesJa.push("明るさが低めです。照明を近づける／強くするなどをご検討ください（ISOを上げるとノイズが増える場合があります）。");
      linesEn.push("Brightness is low. Consider moving the light closer or increasing intensity (raising ISO may add noise).");
    } else if (b > 0.85) {
      linesJa.push("明るさが高めです。白飛びを避けるため、出力を下げる／拡散するなどをご検討ください。");
      linesEn.push("Brightness is high. To avoid clipped highlights, consider reducing intensity or diffusing the light.");
    } else {
      linesJa.push("明るさは概ね良好です。次は色かぶりと影（コントラスト）を調整すると改善しやすいです。");
      linesEn.push("Brightness looks acceptable. Next, tuning color cast and contrast may improve the look.");
    }

    // cast
    if (castLabel === "warm") {
      linesJa.push("暖色寄りの傾向があります。ホワイトバランス調整、または照明の色温度を揃えると自然になりやすいです。");
      linesEn.push("A warm cast is detected. Adjust white balance or match the light color temperature for a more natural look.");
    } else if (castLabel === "cool") {
      linesJa.push("寒色寄りの傾向があります。ホワイトバランス調整、または照明の色温度を下げると改善する場合があります。");
      linesEn.push("A cool cast is detected. Adjust white balance or use a warmer light to reduce the cast.");
    } else if (castLabel === "green") {
      linesJa.push("緑かぶりの可能性があります。LEDと環境光の混在が原因の場合があります（必要に応じてマゼンタ寄り補正をご検討ください）。");
      linesEn.push("A green tint is possible. Mixed LED/ambient lighting may cause this (you may consider a slight magenta correction).");
    } else if (castLabel === "magenta") {
      linesJa.push("マゼンタ寄りの可能性があります。ホワイトバランスやフィルタ設定をご確認ください。");
      linesEn.push("A magenta tint is possible. Please check white balance and filter settings.");
    } else {
      linesJa.push("色かぶりは大きくないようです。");
      linesEn.push("Color cast appears mild.");
    }

    // contrast (shadow hardness proxy)
    if (contrastLabel === "hard") {
      linesJa.push("影が強い傾向があります。ディフューザー、レフ板、ライト位置の調整で柔らかくできます。");
      linesEn.push("Shadows look hard. Diffusion, a reflector, or repositioning the light can soften them.");
    } else if (contrastLabel === "flat") {
      linesJa.push("全体がフラットに見える可能性があります。立体感が必要な場合は、キーライトの角度をつけると改善しやすいです。");
      linesEn.push("The image may look flat. If you want more depth, try angling your key light.");
    } else {
      linesJa.push("コントラストは標準的に見えます。");
      linesEn.push("Contrast looks within a typical range.");
    }

    // stability
    if (stabilityLabel === "unstable") {
      linesJa.push("安定度が低い可能性があります。照明のPWM調光やシャッター速度の影響が考えられるため、設定変更のうえ再確認をおすすめします。");
      linesEn.push("Stability may be low. PWM dimming or shutter interaction could be involved; consider adjusting settings and re-checking.");
    } else if (stabilityLabel === "ok") {
      linesJa.push("安定度は良好に見えます。");
      linesEn.push("Stability looks good.");
    } else {
      linesJa.push("安定度は判定が難しい状況です（FPSが低い／変動している可能性があります）。");
      linesEn.push("Stability is hard to determine (FPS may be low or variable).");
    }

    const lang = document.documentElement.lang || "en";
    return (lang === "ja" ? linesJa : linesEn).join("\n");
  }

  function castLabelToText(castLabel, lang) {
    const map = {
      neutral: { ja: "ほぼ中立", en: "near neutral" },
      warm: { ja: "暖色寄り", en: "warm" },
      cool: { ja: "寒色寄り", en: "cool" },
      green: { ja: "緑かぶりの可能性", en: "possible green tint" },
      magenta: { ja: "マゼンタ寄りの可能性", en: "possible magenta tint" }
    };
    return (map[castLabel] || map.neutral)[lang];
  }

  function contrastLabelToText(label, lang) {
    const map = {
      normal: { ja: "標準", en: "normal" },
      hard: { ja: "影が強い傾向", en: "hard shadows" },
      flat: { ja: "フラット傾向", en: "flat" }
    };
    return (map[label] || map.normal)[lang];
  }

  function stabilityLabelToText(label, lang) {
    const map = {
      unknown: { ja: "不明", en: "unknown" },
      maybe: { ja: "やや不安定の可能性", en: "possibly unstable" },
      ok: { ja: "安定", en: "stable" },
      unstable: { ja: "不安定の可能性", en: "likely unstable" }
    };
    return (map[label] || map.unknown)[lang];
  }

  // ---------- Camera ----------
  async function startCamera() {
    if (running) return;
    setMetricsStub();

    try {
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: liteMode ? 640 : 1280 },
          height: { ideal: liteMode ? 480 : 720 },
          frameRate: { ideal: liteMode ? 24 : 30, max: liteMode ? 30 : 60 }
        }
      };

      stream = await navigator.mediaDevices.getUserMedia(constraints);
      elVideo.srcObject = stream;
      await elVideo.play();

      running = true;
      if (elHint) elHint.style.display = "none";

      meanHistory.length = 0;
      lastFrameT = 0;
      fpsEMA = 0;

      setBtnState();
      loop();
    } catch (e) {
      running = false;
      setBtnState();
      if (elHint) elHint.style.display = "";

      const lang = document.documentElement.lang || "en";
      const msg = (lang === "ja")
        ? "カメラの起動に失敗しました。権限設定、HTTPS、ブラウザ設定をご確認ください。"
        : "Camera failed to start. Please check permissions, HTTPS, and browser settings.";
      if (elHint) elHint.textContent = msg;
      console.error(e);
    }
  }

  function stopCamera() {
    running = false;
    cancelAnimationFrame(rafId);
    rafId = 0;

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    elVideo.srcObject = null;

    if (elHint) elHint.style.display = "";
    setBtnState();
  }

  async function flipCamera() {
    if (!running) return;
    facing = (facing === "environment") ? "user" : "environment";
    stopCamera();
    await startCamera();
  }

  // ---------- Analysis ----------
  function loop(t) {
    if (!running) return;
    rafId = requestAnimationFrame(loop);

    if (!t) t = performance.now();
    if (lastFrameT) {
      const dt = (t - lastFrameT) / 1000;
      const instFps = dt > 0 ? (1 / dt) : 0;
      fpsEMA = fpsEMA ? (fpsEMA * 0.9 + instFps * 0.1) : instFps;
      statFps.textContent = fpsEMA ? fpsEMA.toFixed(1) : "-";
    }
    lastFrameT = t;

    const sampleEveryMs = liteMode ? 220 : 120;
    if (!loop._nextSampleAt) loop._nextSampleAt = 0;
    if (t < loop._nextSampleAt) return;
    loop._nextSampleAt = t + sampleEveryMs;

    const ctx = elCanvas.getContext("2d", { willReadFrequently: true });
    const w = elCanvas.width;
    const h = elCanvas.height;

    ctx.drawImage(elVideo, 0, 0, w, h);

    const img = ctx.getImageData(0, 0, w, h).data;
    let sumY = 0, sumY2 = 0;
    let sumR = 0, sumG = 0, sumB = 0;

    const step = liteMode ? 8 : 4;
    const pxCount = (w * h) / (step * step);

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        const r = img[i] / 255;
        const g = img[i + 1] / 255;
        const b = img[i + 2] / 255;

        const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        sumY += Y;
        sumY2 += Y * Y;
        sumR += r; sumG += g; sumB += b;
      }
    }

    const meanY = sumY / pxCount;
    const varY = (sumY2 / pxCount) - (meanY * meanY);
    const stdY = Math.sqrt(Math.max(0, varY));

    const meanR = sumR / pxCount;
    const meanG = sumG / pxCount;
    const meanB = sumB / pxCount;

    const rg = meanR - meanG;
    const bg = meanB - meanG;

    meanHistory.push(meanY);
    if (meanHistory.length > HISTORY_MAX) meanHistory.shift();

    let stability = "unknown";
    if (meanHistory.length >= 10) {
      let dsum = 0;
      for (let i = 1; i < meanHistory.length; i++) dsum += Math.abs(meanHistory[i] - meanHistory[i - 1]);
      const avgDelta = dsum / (meanHistory.length - 1);

      if (avgDelta < 0.005) stability = "ok";
      else if (avgDelta > 0.02) stability = "unstable";
      else stability = "maybe";
    }

    const bPct = fmtPct01(meanY);

    let castLabel = "neutral";
    if (rg > 0.05 && bg < -0.02) castLabel = "warm";
    else if (bg > 0.05 && rg < -0.02) castLabel = "cool";
    else if (meanG > meanR + 0.03 && meanG > meanB + 0.03) castLabel = "green";
    else if (meanR > meanG + 0.03 && meanB > meanG + 0.03) castLabel = "magenta";

    let contrastLabel = "normal";
    if (stdY > 0.22) contrastLabel = "hard";
    else if (stdY < 0.11) contrastLabel = "flat";

    // UI chips (short)
    mBrightness.textContent = bPct;
    mCast.textContent = (castLabel === "neutral") ? "OK" : "△";
    mContrast.textContent = (contrastLabel === "normal") ? "OK" : "△";
    mFlicker.textContent = (stability === "ok") ? "OK" : (stability === "unstable" ? "△" : "?");

    statSample.textContent = `${meanHistory.length}/${HISTORY_MAX}`;

    // Explained text
    const lang = document.documentElement.lang || "en";
    const castText = castLabelToText(castLabel, lang);
    const contrastText = contrastLabelToText(contrastLabel, lang);
    const stabilityText = stabilityLabelToText(stability, lang);

    if (lang === "ja") {
      exBrightness.textContent = `明るさ：${bPct}/100（相対）`;
      exCast.textContent = `色かぶり：${castText}`;
      exContrast.textContent = `影・コントラスト：${contrastText}`;
      exFlicker.textContent = `安定度：${stabilityText}`;
    } else {
      exBrightness.textContent = `Brightness: ${bPct}/100 (relative)`;
      exCast.textContent = `Cast: ${castText}`;
      exContrast.textContent = `Contrast/Shadows: ${contrastText}`;
      exFlicker.textContent = `Stability: ${stabilityText}`;
    }

    adviceText.textContent = buildAdvice({
      b: meanY,
      castLabel,
      contrastLabel,
      stabilityLabel: stability
    });
  }

  // ---------- Events ----------
  document.addEventListener("DOMContentLoaded", () => {
    // lang init
    const initial = getPreferredLang();
    applyLang(initial);
    document.querySelectorAll(".nw-lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (lang !== "ja" && lang !== "en") return;
        localStorage.setItem("lang", lang);
        applyLang(lang);
      });
    });

    // sheets
    btnSheetHowto.addEventListener("click", () => openSheet("howto"));
    btnSheetResults.addEventListener("click", () => openSheet("results"));
    sheetBackdrop.addEventListener("click", closeSheets);
    document.querySelectorAll("[data-sheet-close]").forEach((b) => b.addEventListener("click", closeSheets));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheets(); });

    // controls
    btnStart.addEventListener("click", startCamera);
    btnStop.addEventListener("click", stopCamera);
    btnFlip.addEventListener("click", flipCamera);
    btnLite.addEventListener("click", async () => {
      liteMode = !liteMode;
      setBtnState();
      if (running) {
        stopCamera();
        await startCamera();
      }
    });

    // initial UI
    setBtnState();
    setMetricsStub();
  });
})();
