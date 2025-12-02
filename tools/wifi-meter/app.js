/* ==========================================================
   WiFi Congestion Meter - app.js
   Network Information API ベースの安全な混雑推定
========================================================== */

/* ----------------------------
  多言語切替（JP / EN）
---------------------------- */
document.querySelectorAll("[data-setlang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-setlang");
    setLanguage(lang);
  });
});

function setLanguage(lang) {
  document.querySelectorAll("[data-lang]").forEach((el) => {
    if (el.getAttribute("data-lang") === lang) {
      el.style.display = "";
    } else {
      el.style.display = "none";
    }
  });
  localStorage.setItem("wifi-meter-lang", lang);
}

// 初期言語
const savedLang = localStorage.getItem("wifi-meter-lang") || "ja";
setLanguage(savedLang);

/* ----------------------------
  Network Information API
---------------------------- */
const connection =
  navigator.connection || navigator.mozConnection || navigator.webkitConnection;

/* ----------------------------
  要素取得（存在チェック込み）
---------------------------- */
const rttEl = document.getElementById("rttValue");
const fluctEl = document.getElementById("fluctValue");
const bwEl = document.getElementById("bwValue");
const levelCard = document.getElementById("levelCard");
const indicator = document.getElementById("indicator");

const startBtns = document.querySelectorAll(".start-btn");
const stopBtns = document.querySelectorAll(".stop-btn");
const resetBtns = document.querySelectorAll(".reset-btn");

const canvas = document.getElementById("graphCanvas");
let ctx = null;
if (canvas) {
  ctx = canvas.getContext("2d");
}

/* ----------------------------
  計測状態
---------------------------- */
let measuring = false;
let intervalId = null;
let prevRTT = null;
let graphData = [];
const MAX_POINTS = 50;
let graphColor = "#999999"; // グラフ線の色（混雑レベルに応じて変化）

/* ----------------------------
  Start / Stop / Reset
---------------------------- */
if (startBtns.length) {
  startBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (measuring) return;
      measuring = true;

      if (indicator) indicator.classList.remove("hidden");
      stopBtns.forEach((b) => b.classList.remove("hidden"));
      resetBtns.forEach((b) => b.classList.add("hidden"));

      intervalId = setInterval(updateValues, 1000);
    });
  });
}

if (stopBtns.length) {
  stopBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      measuring = false;
      if (indicator) indicator.classList.add("hidden");
      stopBtns.forEach((b) => b.classList.add("hidden"));
      resetBtns.forEach((b) => b.classList.remove("hidden"));
      clearInterval(intervalId);
    });
  });
}

if (resetBtns.length) {
  resetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (rttEl) rttEl.textContent = "---";
      if (fluctEl) fluctEl.textContent = "---";
      if (bwEl) bwEl.textContent = "---";

      prevRTT = null;
      graphData = [];
      drawGraph();

      if (levelCard) {
        levelCard.className = "nw-card level-card";
        levelCard.querySelectorAll(".level-text").forEach((txt) => {
          if (txt.getAttribute("data-lang") === "ja") {
            txt.textContent = "混雑レベル： ---";
          } else {
            txt.textContent = "Congestion Level: ---";
          }
        });
      }

      graphColor = "#999999";
      resetBtns.forEach((b) => b.classList.add("hidden"));
    });
  });
}

/* ----------------------------
  メイン更新ロジック
---------------------------- */
function updateValues() {
  if (!connection) {
    if (rttEl) rttEl.textContent = "---";
    if (fluctEl) fluctEl.textContent = "---";
    if (bwEl) bwEl.textContent = "---";
    updateLevel(null, null);
    drawGraph();
    return;
  }

  const estRTT = typeof connection.rtt === "number" ? connection.rtt : null;
  const estBW =
    typeof connection.downlink === "number" ? connection.downlink : null;

  let fluct = null;
  if (prevRTT !== null && estRTT !== null) {
    fluct = Math.abs(estRTT - prevRTT);
  }
  prevRTT = estRTT;

  if (rttEl) rttEl.textContent = estRTT !== null ? estRTT : "---";
  if (fluctEl)
    fluctEl.textContent = fluct !== null ? fluct : (estRTT !== null ? 0 : "---");
  if (bwEl) bwEl.textContent = estBW !== null ? estBW : "---";

  if (estRTT !== null) {
    graphData.push(estRTT);
    if (graphData.length > MAX_POINTS) graphData.shift();
  }
  drawGraph();
  updateLevel(estRTT, fluct);
}

/* ----------------------------
  混雑レベル判定
---------------------------- */
function updateLevel(rtt, fluct) {
  if (!levelCard) return;

  let level = "unknown";

  const r = typeof rtt === "number" ? rtt : null;
  const f = typeof fluct === "number" ? fluct : 0;

  if (r === null) {
    level = "unknown";
  } else if (r < 80 && f < 30) {
    level = "low";
  } else if (r < 180 && f < 80) {
    level = "mid";
  } else {
    level = "high";
  }

  // カード色
  levelCard.className = "nw-card level-card";
  if (level === "low") levelCard.classList.add("level-low");
  if (level === "mid") levelCard.classList.add("level-mid");
  if (level === "high") levelCard.classList.add("level-high");

  // グラフ線の色を混雑レベルに合わせる
  if (level === "low") graphColor = "#4caf50";
  else if (level === "mid") graphColor = "#ffb300";
  else if (level === "high") graphColor = "#e53935";
  else graphColor = "#999999";

  levelCard.querySelectorAll(".level-text").forEach((txt) => {
    if (txt.getAttribute("data-lang") === "ja") {
      if (level === "low") txt.textContent = "混雑レベル：低（Low）";
      else if (level === "mid") txt.textContent = "混雑レベル：中（Medium）";
      else if (level === "high") txt.textContent = "混雑レベル：高（High）";
      else txt.textContent = "混雑レベル： ---";
    } else {
      if (level === "low") txt.textContent = "Congestion Level: Low";
      else if (level === "mid") txt.textContent = "Congestion Level: Medium";
      else if (level === "high") txt.textContent = "Congestion Level: High";
      else txt.textContent = "Congestion Level: ---";
    }
  });

  // 色が変わったときに即反映されるよう軽く再描画
  drawGraph();
}

/* ----------------------------
  グラフ描画
---------------------------- */
function drawGraph() {
  if (!canvas || !ctx) return;

  const w = (canvas.width = canvas.clientWidth);
  const h = (canvas.height = canvas.clientHeight);

  ctx.clearRect(0, 0, w, h);

  if (graphData.length < 2) return;

  let max = Math.max(...graphData);
  let min = Math.min(...graphData);

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
