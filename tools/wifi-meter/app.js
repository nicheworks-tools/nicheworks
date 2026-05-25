/* ==========================================================
   WiFi Meter - app.js
   Network Information API based connection estimate
========================================================== */

const LANG_KEY = "nw_lang";
const LEGACY_LANG_KEY = "wifi-meter-lang";
const SUPPORTED_LANGS = new Set(["ja", "en"]);

function getInitialLanguage() {
  const saved = localStorage.getItem(LANG_KEY);
  if (SUPPORTED_LANGS.has(saved)) return saved;

  const legacy = localStorage.getItem(LEGACY_LANG_KEY);
  if (SUPPORTED_LANGS.has(legacy)) {
    localStorage.setItem(LANG_KEY, legacy);
    localStorage.removeItem(LEGACY_LANG_KEY);
    return legacy;
  }

  const browserLang = (navigator.language || "").toLowerCase();
  return browserLang.startsWith("ja") ? "ja" : "en";
}

let currentLang = getInitialLanguage();

function setLanguage(lang) {
  const nextLang = SUPPORTED_LANGS.has(lang) ? lang : "ja";
  currentLang = nextLang;
  document.documentElement.lang = nextLang;

  document.querySelectorAll("[data-lang]").forEach((el) => {
    el.style.display = el.getAttribute("data-lang") === nextLang ? "" : "none";
  });

  document.querySelectorAll("[data-setlang]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-setlang") === nextLang);
    btn.setAttribute("aria-pressed", btn.getAttribute("data-setlang") === nextLang ? "true" : "false");
  });

  localStorage.setItem(LANG_KEY, nextLang);
}

document.querySelectorAll("[data-setlang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    setLanguage(btn.getAttribute("data-setlang"));
  });
});

setLanguage(currentLang);

/* ----------------------------
  Network Information API
---------------------------- */
const connection =
  navigator.connection || navigator.mozConnection || navigator.webkitConnection;

/* ----------------------------
  Elements
---------------------------- */
const rttEl = document.getElementById("rttValue");
const fluctEl = document.getElementById("fluctValue");
const bwEl = document.getElementById("bwValue");
const levelCard = document.getElementById("levelCard");
const indicator = document.getElementById("indicator");
const statusMessage = document.getElementById("statusMessage");

const startBtns = document.querySelectorAll(".start-btn");
const stopBtns = document.querySelectorAll(".stop-btn");
const resetBtns = document.querySelectorAll(".reset-btn");

const canvas = document.getElementById("graphCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

/* ----------------------------
  State
---------------------------- */
let measuring = false;
let intervalId = null;
let prevRTT = null;
let graphData = [];
const MAX_POINTS = 50;
let graphColor = "#999999";
let resetConfirmPending = false;
let resetConfirmTimer = null;

function t(ja, en) {
  return currentLang === "ja" ? ja : en;
}

function setStatus(ja, en) {
  if (!statusMessage) return;
  statusMessage.textContent = ja || en ? t(ja, en) : "";
}

function setButtonsForMeasuring(isMeasuring) {
  startBtns.forEach((btn) => {
    btn.disabled = isMeasuring;
    btn.setAttribute("aria-disabled", isMeasuring ? "true" : "false");
  });
  stopBtns.forEach((btn) => btn.classList.toggle("hidden", !isMeasuring));
  if (indicator) indicator.classList.toggle("hidden", !isMeasuring);
}

function setUnsupportedValues() {
  if (rttEl) rttEl.textContent = t("非対応", "Not supported");
  if (fluctEl) fluctEl.textContent = t("非対応", "Not supported");
  if (bwEl) bwEl.textContent = t("非対応", "Not supported");
  updateLevel(null, null, true);
  drawGraph();
}

function clearValues() {
  if (rttEl) rttEl.textContent = "---";
  if (fluctEl) fluctEl.textContent = "---";
  if (bwEl) bwEl.textContent = "---";

  prevRTT = null;
  graphData = [];
  graphColor = "#999999";
  drawGraph();
  updateLevel(null, null, false);
}

/* ----------------------------
  Start / Stop / Reset
---------------------------- */
startBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (measuring) return;
    measuring = true;
    resetConfirmPending = false;
    clearTimeout(resetConfirmTimer);

    setButtonsForMeasuring(true);
    resetBtns.forEach((b) => b.classList.add("hidden"));
    setStatus("計測を開始しました。", "Measurement started.");

    updateValues();
    intervalId = setInterval(updateValues, 1000);
  });
});

stopBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    measuring = false;
    clearInterval(intervalId);
    intervalId = null;
    setButtonsForMeasuring(false);
    resetBtns.forEach((b) => b.classList.remove("hidden"));
    setStatus("停止しました。結果を消す場合はResetを押してください。", "Stopped. Press Reset to clear the result.");
  });
});

resetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!resetConfirmPending) {
      resetConfirmPending = true;
      setStatus("もう一度Resetを押すと結果とグラフをクリアします。", "Press Reset again to clear the result and graph.");
      clearTimeout(resetConfirmTimer);
      resetConfirmTimer = setTimeout(() => {
        resetConfirmPending = false;
        setStatus("", "");
      }, 4000);
      return;
    }

    resetConfirmPending = false;
    clearTimeout(resetConfirmTimer);
    clearValues();
    resetBtns.forEach((b) => b.classList.add("hidden"));
    setStatus("結果をクリアしました。", "Result cleared.");
  });
});

/* ----------------------------
  Main update logic
---------------------------- */
function updateValues() {
  if (!connection) {
    setUnsupportedValues();
    setStatus(
      "このブラウザではNetwork Information APIが利用できません。",
      "The Network Information API is not supported in this browser."
    );
    return;
  }

  const estRTT = typeof connection.rtt === "number" ? connection.rtt : null;
  const estBW = typeof connection.downlink === "number" ? connection.downlink : null;

  if (estRTT === null && estBW === null) {
    setUnsupportedValues();
    setStatus(
      "このブラウザでは推定RTT・推定帯域を取得できません。",
      "This browser does not provide estimated RTT or downlink values."
    );
    return;
  }

  let fluct = null;
  if (prevRTT !== null && estRTT !== null) {
    fluct = Math.abs(estRTT - prevRTT);
  }
  prevRTT = estRTT;

  if (rttEl) rttEl.textContent = estRTT !== null ? String(estRTT) : "---";
  if (fluctEl) fluctEl.textContent = fluct !== null ? String(fluct) : (estRTT !== null ? "0" : "---");
  if (bwEl) bwEl.textContent = estBW !== null ? String(estBW) : "---";

  if (estRTT !== null) {
    graphData.push(estRTT);
    if (graphData.length > MAX_POINTS) graphData.shift();
  }

  updateLevel(estRTT, fluct, false);
  drawGraph();
}

/* ----------------------------
  Connection estimate level
---------------------------- */
function updateLevel(rtt, fluct, unsupported = false) {
  if (!levelCard) return;

  let level = "unknown";
  const r = typeof rtt === "number" ? rtt : null;
  const f = typeof fluct === "number" ? fluct : 0;

  if (unsupported) {
    level = "unsupported";
  } else if (r === null) {
    level = "unknown";
  } else if (r < 80 && f < 30) {
    level = "low";
  } else if (r < 180 && f < 80) {
    level = "mid";
  } else {
    level = "high";
  }

  levelCard.className = "nw-card level-card";
  if (level === "low") levelCard.classList.add("level-low");
  if (level === "mid") levelCard.classList.add("level-mid");
  if (level === "high") levelCard.classList.add("level-high");

  if (level === "low") graphColor = "#4caf50";
  else if (level === "mid") graphColor = "#ffb300";
  else if (level === "high") graphColor = "#e53935";
  else graphColor = "#999999";

  levelCard.querySelectorAll(".level-text").forEach((txt) => {
    if (txt.getAttribute("data-lang") === "ja") {
      if (level === "low") txt.textContent = "通信状態の目安：低負荷（Low）";
      else if (level === "mid") txt.textContent = "通信状態の目安：中程度（Medium）";
      else if (level === "high") txt.textContent = "通信状態の目安：高負荷（High）";
      else if (level === "unsupported") txt.textContent = "通信状態の目安：非対応";
      else txt.textContent = "通信状態の目安： ---";
    } else {
      if (level === "low") txt.textContent = "Connection Estimate: Low load";
      else if (level === "mid") txt.textContent = "Connection Estimate: Medium load";
      else if (level === "high") txt.textContent = "Connection Estimate: High load";
      else if (level === "unsupported") txt.textContent = "Connection Estimate: Not supported";
      else txt.textContent = "Connection Estimate: ---";
    }
  });
}

/* ----------------------------
  Graph
---------------------------- */
function drawGraph() {
  if (!canvas || !ctx) return;

  const w = (canvas.width = canvas.clientWidth || 1);
  const h = (canvas.height = canvas.clientHeight || 140);

  ctx.clearRect(0, 0, w, h);

  if (graphData.length < 2) return;

  const max = Math.max(...graphData);
  const min = Math.min(...graphData);

  ctx.lineWidth = 2;
  ctx.strokeStyle = graphColor;

  if (max === min) {
    ctx.beginPath();
    const y = h / 2;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    return;
  }

  const range = max - min;

  ctx.beginPath();
  graphData.forEach((v, i) => {
    const x = (i / (graphData.length - 1)) * w;
    const y = h - ((v - min) / range) * h;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}
