// Light Check — LC-02
// - Camera start/stop/flip
// - Relative metrics: brightness (mean luma), cast (RGB bias), contrast (luma stddev proxy), stability (variance proxy)
// - One-screen UI + bottom sheets
// Notes: not a lux meter; flicker/stability detection is limited by FPS.

(function () {
  /* LC-08: hard stop camera */
  /* LC-09: button state sync (Start/Stop/Flip/Lite) */

  /* LC-10: status line (Starting / Running / Stopping) */
  const lcStatus = {
    phase: "idle",   // idle | starting | running | stopping | error
    lastAction: "",
  };

  function lcFindStatusEl(){
    // Preferred: separate JA/EN nodes
    const ja = document.getElementById("lcStatusJa");
    const en = document.getElementById("lcStatusEn");
    if (ja || en) return { ja, en, box: null };

    // Next: a single box with [data-i18n] spans inside
    const box = document.getElementById("lcStatus") || document.querySelector(".lc-status");
    if (box) {
      const ja2 = box.querySelector('[data-i18n="ja"]');
      const en2 = box.querySelector('[data-i18n="en"]');
      return { ja: ja2, en: en2, box };
    }
    return { ja: null, en: null, box: null };
  }

  function lcStatusText(phase){
    // Polite, non-imperative; keep short for one-screen UI
    switch(String(phase || "")){
      case "starting":
        return { ja:"起動中…", en:"Starting…" };
      case "stopping":
        return { ja:"停止中…", en:"Stopping…" };
      case "running":
        return { ja:"計測中", en:"Running" };
      case "error":
        return { ja:"エラー", en:"Error" };
      case "idle":
      default:
        return { ja:"待機中", en:"Idle" };
    }
  }

  function lcSetStatus(phase, actionKey){
    lcStatus.phase = phase || "idle";
    lcStatus.lastAction = actionKey || lcStatus.lastAction || "";

    const t = lcStatusText(lcStatus.phase);
    const els = lcFindStatusEl();

    if (els.ja) els.ja.textContent = t.ja;
    if (els.en) els.en.textContent = t.en;

    // If no dedicated nodes, fallback to updating textContent of the box itself
    if (!els.ja && !els.en && els.box){
      const lang = (typeof lcGetLang === "function") ? lcGetLang() : "en";
      els.box.textContent = (lang === "ja") ? t.ja : t.en;
    }

    // Accessibility: announce changes if a live region exists
    const live = document.getElementById("lcStatusLive");
    if (live){
      const lang = (typeof lcGetLang === "function") ? lcGetLang() : "en";
      live.textContent = (lang === "ja") ? t.ja : t.en;
    }
  }

  function lcDeriveAndSyncStatus(){
    // If "busy" exists, prefer it
    const busy = (typeof lcUi !== "undefined" && lcUi) ? !!lcUi.busy : false;
    if (busy){
      // keep current phase as-is while busy to avoid flicker
      return;
    }

    // If running detector exists, use it
    let running = false;
    try{
      if (typeof lcIsRunning === "function") running = !!lcIsRunning();
    }catch(_e){ running = false; }

    if (running){
      if (lcStatus.phase !== "running") lcSetStatus("running");
    }else{
      // Only auto-drop to idle when not in explicit error
      if (lcStatus.phase !== "error") lcSetStatus("idle");
    }
  }

  // Wrap lcRunUiAction (LC-07) to set status before/after actions
  (function(){
    try{
      if (typeof lcRunUiAction !== "function") return;
      if (lcRunUiAction.__lc10Wrapped) return;

      const _orig = lcRunUiAction;
      const wrapped = async function(actionKey, fn){
        // Set phase based on action type
        if (actionKey === "start") lcSetStatus("starting", actionKey);
        else if (actionKey === "stop") lcSetStatus("stopping", actionKey);
        else {
          // flip/lite are short actions; show starting-style feedback only if already running
          // keep current if it is running; otherwise show idle-friendly transient
          if (lcStatus.phase === "running") lcSetStatus("starting", actionKey);
        }

        try{
          return await _orig(actionKey, fn);
        }finally{
          // After action: derive running/idle
          try{
            // If stop action, force idle after hard stop completes
            if (actionKey === "stop"){
              lcSetStatus("idle", actionKey);
            } else {
              lcDeriveAndSyncStatus();
            }
          }catch(_e){}
        }
      };

      wrapped.__lc10Wrapped = true;
      // Preserve any flags used by previous logic
      try{ wrapped.__lcWrappedFn = _orig.__lcWrappedFn; }catch(_e){}
      lcRunUiAction = wrapped;
    }catch(_e){}
  })();

  // Wrap lcShowAlert (LC-06) to mark error status when alert is shown
  (function(){
    try{
      if (typeof lcShowAlert !== "function") return;
      if (lcShowAlert.__lc10Wrapped) return;

      const _origAlert = lcShowAlert;
      const wrappedAlert = function(msgJa, msgEn){
        try{ lcSetStatus("error"); }catch(_e){}
        return _origAlert.apply(this, arguments);
      };
      wrappedAlert.__lc10Wrapped = true;
      lcShowAlert = wrappedAlert;
    }catch(_e){}
  })();

  // If LC-08 hard stop exists, sync to idle after it runs
  (function(){
    try{
      if (typeof lcHardStopCamera !== "function") return;
      if (lcHardStopCamera.__lc10Wrapped) return;

      const _origStop = lcHardStopCamera;
      const wrappedStop = function(reason){
        const r = _origStop.apply(this, arguments);
        try{ lcSetStatus("idle"); }catch(_e){}
        return r;
      };
      wrappedStop.__lc10Wrapped = true;
      lcHardStopCamera = wrappedStop;
    }catch(_e){}
  })();

  // Boot: initial status + periodic sync (slow, lightweight)
  (function(){
    function init(){
      try{ lcDeriveAndSyncStatus(); }catch(_e){}
      setInterval(function(){
        try{ lcDeriveAndSyncStatus(); }catch(_e){}
      }, 700);
    }
    if (document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", init, { once:true });
    }else{
      init();
    }
  })();

  const lcBtn = {
    cached: false,
    start: null,
    stop: null,
    flip: null,
    lite: null,
  };

  function lcFindFirstId(ids){
    for (const id of ids){
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  function lcCacheButtons(){
    if (lcBtn.cached) return;

    lcBtn.start = lcFindFirstId(["lcStart","startBtn","btnStart","start","lc-start"]);
    lcBtn.stop  = lcFindFirstId(["lcStop","stopBtn","btnStop","stop","lc-stop"]);
    lcBtn.flip  = lcFindFirstId(["lcFlip","flipBtn","btnFlip","flip","lc-flip"]);
    lcBtn.lite  = lcFindFirstId(["lcLite","liteBtn","btnLite","lite","lc-lite"]);

    // fallback: bottom bar buttons by order (best-effort)
    if (!lcBtn.start || !lcBtn.stop || !lcBtn.flip || !lcBtn.lite){
      const bar = document.querySelector(".lc-bottombar");
      if (bar){
        const btns = Array.from(bar.querySelectorAll("button"));
        if (!lcBtn.start && btns[0]) lcBtn.start = btns[0];
        if (!lcBtn.stop  && btns[1]) lcBtn.stop  = btns[1];
        if (!lcBtn.flip  && btns[2]) lcBtn.flip  = btns[2];
        if (!lcBtn.lite  && btns[3]) lcBtn.lite  = btns[3];
      }
    }

    lcBtn.cached = true;
  }

  function lcGetLang(){
    const saved = (localStorage.getItem("lang") || "").toLowerCase();
    if (saved === "ja" || saved === "en") return saved;
    const browser = (navigator.language || "").toLowerCase();
    return browser.startsWith("ja") ? "ja" : "en";
  }

  function lcSetDisabled(el, disabled){
    if (!el) return;
    el.disabled = !!disabled;
    el.setAttribute("aria-disabled", disabled ? "true" : "false");
  }

  function lcIsRunning(){
    // Prefer LC-08 state if available
    try{
      if (typeof lcState !== "undefined" && lcState && lcState.currentStream){
        const st = lcState.currentStream;
        if (st && typeof st.getTracks === "function"){
          const tracks = st.getTracks();
          if (tracks && tracks.some(t => t && t.readyState === "live")) return true;
        }
      }
    }catch(_e){}

    // Fallback: any video srcObject has live tracks
    try{
      const vids = Array.from(document.querySelectorAll("video"));
      for (const v of vids){
        const so = v && v.srcObject;
        if (so && typeof so.getTracks === "function"){
          const tracks = so.getTracks();
          if (tracks && tracks.some(t => t && t.readyState === "live")) return true;
        }
      }
    }catch(_e){}
    return false;
  }

  function lcSetButtonLabel(el, isRunning){
    // If the same button is used for Start/Stop, toggle its label.
    if (!el) return;
    // If the button has child spans for i18n, update those (preferred).
    const jaSpan = el.querySelector('[data-i18n="ja"]');
    const enSpan = el.querySelector('[data-i18n="en"]');
    const ja = isRunning ? "停止" : "開始";
    const en = isRunning ? "Stop" : "Start";

    if (jaSpan || enSpan){
      if (jaSpan) jaSpan.textContent = ja;
      if (enSpan) enSpan.textContent = en;
      return;
    }

    // Otherwise replace plain text (keep it minimal)
    const lang = lcGetLang();
    el.textContent = (lang === "ja") ? ja : en;
  }

  function lcUpdateButtons(){
    lcCacheButtons();

    const running = lcIsRunning();
    const busy = (typeof lcUi !== "undefined" && lcUi) ? !!lcUi.busy : false;

    // If separate Start/Stop buttons exist, show/hide to match state
    if (lcBtn.start && lcBtn.stop && lcBtn.start !== lcBtn.stop){
      // show Start only when not running
      lcBtn.start.hidden = !!running;
      lcBtn.stop.hidden  = !running;
      lcSetDisabled(lcBtn.start, busy || running);
      lcSetDisabled(lcBtn.stop,  busy ? false : !running);
    }else{
      // Single button: toggle label and disable rules
      if (lcBtn.start) lcSetButtonLabel(lcBtn.start, running);
      lcSetDisabled(lcBtn.start, busy ? true : false);
    }

    // Flip: only when running & not busy (prevents state break on double tap)
    lcSetDisabled(lcBtn.flip, busy || !running);

    // Lite: allowed when not busy. If you want "running-only", change rule later.
    lcSetDisabled(lcBtn.lite, busy);
  }

  function lcStartButtonSyncLoop(){
    // Keep it lightweight: update at a slow cadence
    lcUpdateButtons();
    setTimeout(lcStartButtonSyncLoop, 300);
  }

  // Bind: start loop after DOM ready
  (function(){
    function init(){
      try{ lcStartButtonSyncLoop(); }catch(_e){}
    }
    if (document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", init, { once: true });
    }else{
      init();
    }
  })();

  const lcState = (typeof window !== "undefined")
    ? (window.__lcLightCheckState = window.__lcLightCheckState || { currentStream: null })
    : { currentStream: null };

  function lcStopStream(stream){
    if (!stream) return;
    try{
      if (typeof stream.getTracks === "function"){
        stream.getTracks().forEach(t=>{
          try{ t.stop(); }catch(_e){}
        });
      }
    }catch(_e){}
  }

  function lcDetachAllVideoSrcObject(){
    try{
      const vids = Array.from(document.querySelectorAll("video"));
      vids.forEach(v=>{
        try{
          if (v && v.srcObject){
            lcStopStream(v.srcObject);
            v.srcObject = null;
          }
          // keep it minimal; src removal helps on some browsers
          try{ v.removeAttribute("src"); }catch(_e){}
          try{ v.load && v.load(); }catch(_e){}
        }catch(_e){}
      });
    }catch(_e){}
  }

  function lcHardStopCamera(reason){
    // reason is only for debug; no UI text here
    try{ lcStopStream(lcState.currentStream); }catch(_e){}
    lcState.currentStream = null;

    // also stop anything still attached to video elements (belt & suspenders)
    lcDetachAllVideoSrcObject();

    // if app has its own state vars, try to null them defensively
    try{
      if (typeof currentStream !== "undefined") currentStream = null;  // eslint-disable-line no-undef
    }catch(_e){}
    try{
      if (typeof stream !== "undefined") stream = null;               // eslint-disable-line no-undef
    }catch(_e){}
  }

  /* LC-07: action lock */
  const lcUi = { busy:false };

  function lcExplainUiActionError(actionKey){
    const map = {
      start: { ja:"開始処理に失敗しました。権限やブラウザ設定の影響が考えられます。", en:"Failed to start. This may be affected by permissions or browser settings." },
      stop:  { ja:"停止処理で問題が発生しました。", en:"A problem occurred while stopping." },
      flip:  { ja:"カメラ切替に失敗しました。端末やブラウザが切替に対応していない可能性があります。", en:"Failed to switch cameras. Your device/browser may not support switching." },
      lite:  { ja:"Lite切替に失敗しました。端末やブラウザの制約が原因の可能性があります。", en:"Failed to toggle Lite mode. This may be caused by device/browser limitations." },
    };
    return map[actionKey] || { ja:"処理に失敗しました。", en:"The action failed." };
  }

  function lcSetBusy(on){
    lcUi.busy = !!on;
    document.body.setAttribute("aria-busy", lcUi.busy ? "true" : "false");
    // If you have explicit button-state updater in the app, call it.
    try{
      if (typeof updateButtons === "function") updateButtons();
      if (typeof renderButtons === "function") renderButtons();
      if (typeof setButtonStates === "function") setButtonStates();
    }catch(_e){}
  }

  async function lcRunUiAction(actionKey, fn){
    if (lcUi.busy) return;
    lcSetBusy(true);
    try{
      const ret = fn();
      if (ret && typeof ret.then === "function") await ret;
    }catch(err){
      const t = lcExplainUiActionError(actionKey);
      if (typeof lcShowAlert === "function") lcShowAlert(t.ja, t.en);
      else console.error("[light-check]", actionKey, err);
    }finally{
      lcSetBusy(false);
    }
  }

  /* LC-06: camera error UI */
  function lcId(id){ return document.getElementById(id); }

  function lcGetLang(){
    const saved = (localStorage.getItem("lang") || "").toLowerCase();
    if (saved === "ja" || saved === "en") return saved;
    const browser = (navigator.language || "").toLowerCase();
    return browser.startsWith("ja") ? "ja" : "en";
  }

  function lcShowAlert(msgJa, msgEn){
    const box = lcId("lcAlert");
    const ja = lcId("lcAlertMsgJa");
    const en = lcId("lcAlertMsgEn");
    if (ja) ja.textContent = msgJa || "—";
    if (en) en.textContent = msgEn || "—";
    if (box) box.hidden = false;

    // Only toggle inside the alert box to avoid breaking the page-wide i18n logic
    const lang = lcGetLang();
    if (box){
      box.querySelectorAll("[data-i18n]").forEach(el=>{
        el.style.display = (el.getAttribute("data-i18n") === lang) ? "" : "none";
      });
    }
  }

  function lcHideAlert(){
    const box = lcId("lcAlert");
    if (box) box.hidden = true;
  }

  function lcBindAlertDismiss(){
    const b = lcId("lcAlertDismiss");
    if (!b || b.__lcBound) return;
    b.__lcBound = true;
    b.addEventListener("click", lcHideAlert);
  }

  async function lcGetUserMedia(constraints){
    
    // LC-08: stop any previous stream before re-start
    lcHardStopCamera("pre-start");
lcBindAlertDismiss();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      lcShowAlert(
        "このブラウザではカメラAPIが利用できません。iOSはSafari、AndroidはChromeでのご利用を推奨します。",
        "Camera API is not available in this browser. Safari on iOS and Chrome on Android are recommended."
      );
      throw new Error("getUserMedia_not_supported");
    }

    try{
      // Bracket notation prevents accidental regex replacements
      const __lcStream = await navigator.mediaDevices["getUserMedia"](constraints);
      lcState.currentStream = __lcStream;
      return __lcStream;
    }catch(err){
      const name = (err && err.name) ? String(err.name) : "";
      const message = (err && err.message) ? String(err.message) : "";

      let ja = "カメラの起動に失敗しました。権限、ブラウザ設定、他アプリのカメラ使用状況をご確認ください。";
      let en = "Failed to start the camera. Please check permissions, browser settings, and whether another app is using the camera.";

      if (name === "NotAllowedError" || name === "PermissionDeniedError"){
        ja = "カメラの使用が許可されていません。ブラウザの権限設定でカメラを許可してから、もう一度お試しください。";
        en = "Camera permission was denied. Allow camera access in your browser settings and try again.";
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError"){
        ja = "利用可能なカメラが見つかりませんでした。端末にカメラがあるか、別アプリで使用中でないかをご確認ください。";
        en = "No available camera was found. Check your device has a camera and it isn't in use by another app.";
      } else if (name === "NotReadableError" || name === "TrackStartError"){
        ja = "カメラを読み取れませんでした。別アプリがカメラを使用中の可能性があります。";
        en = "The camera could not be accessed. Another app may be using it.";
      } else if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError"){
        ja = "カメラ設定が端末に合いませんでした。前後カメラの切替やLiteモードの利用をご検討ください。";
        en = "Requested camera constraints are not supported. Try switching cameras or using Lite mode.";
      } else if (name === "SecurityError"){
        ja = "セキュリティ制限でカメラがブロックされました。HTTPSまたは安全なコンテキストでの実行が必要です。";
        en = "Camera was blocked by security restrictions. Run on HTTPS or a secure context.";
      } else if (name === "AbortError"){
        ja = "カメラの起動が中断されました。ページを再読み込みしてからお試しください。";
        en = "Camera start was aborted. Reload the page and try again.";
      }

      // Small detail hint without being noisy
      if (message && len(message) < 140){
        ja += "（詳細: " + message + "）";
        en += " (Detail: " + message + ")";
      }

      lcShowAlert(ja, en);
      throw err;
    }
  }

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

      stream = await lcGetUserMedia(constraints);
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

  /* LC-07: wrap existing action functions if present */
  (function(){
    function wrap(name, key){
      try{
        const fn = (typeof window !== "undefined" && window[name]) ? window[name] : (typeof eval(name) === "function" ? eval(name) : null);
        if (typeof fn !== "function") return;
        // Only wrap once
        if (fn.__lcWrappedFn) return;
        const wrapped = function(){ return lcRunUiAction(key, () => fn.apply(this, arguments)); };
        wrapped.__lcWrappedFn = true;
        try{ eval(name + " = wrapped"); }catch(_e){}
      }catch(_e){}
    }

    // Common names used in this tool family
    wrap("startCamera", "start");
    wrap("startStream", "start");
    wrap("stopCamera",  "stop");
    wrap("stopStream",  "stop");
    wrap("flipCamera",  "flip");
    wrap("switchCamera","flip");
    wrap("toggleLiteMode","lite");
    wrap("toggleLite",  "lite");
  })();

  /* LC-08: ensure stop always releases camera */
  (function(){
    function findStopButton(){
      const ids = ["lcStop","stopBtn","btnStop","stop","lc-stop"];
      for (const id of ids){
        const el = document.getElementById(id);
        if (el) return el;
      }
      // fallback: try bottom bar second button
      const bar = document.querySelector(".lc-bottombar");
      if (bar){
        const btns = Array.from(bar.querySelectorAll("button"));
        if (btns[1]) return btns[1];
      }
      return null;
    }

    function bind(){
      const stopBtn = findStopButton();
      if (stopBtn && !stopBtn.__lcHardStopBound){
        stopBtn.__lcHardStopBound = true;
        stopBtn.addEventListener("click", ()=>{
          // run after the app's own stop logic
          setTimeout(()=> lcHardStopCamera("stop-click"), 0);
        });
      }

      // safety: leaving the page should release camera
      window.addEventListener("pagehide", ()=> lcHardStopCamera("pagehide"));
      document.addEventListener("visibilitychange", ()=>{
        if (document.visibilityState === "hidden"){
          lcHardStopCamera("hidden");
        }
      });
    }

    if (document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", bind, { once:true });
    }else{
      bind();
    }
  })();


})();
