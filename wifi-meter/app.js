/* ==========================================================
   WiFi Congestion Meter - app.js
   Network Information API ベースの安全な混雑推定
   NicheWorks仕様：JP/EN切替 / Start / Stop / Reset / ミニグラフ
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
    if (el.getAttribute("data-lang") === lang) el.style.display = "";
    else el.style.display = "none";
  });
  localStorage.setItem("wifi-meter-lang", lang);
}

// 初期言語
const savedLang = localStorage.getItem("wifi-meter-lang") || "ja";
setLanguage(savedLang);

/* ----------------------------
  Network Information API
---------------------------- */
let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

/* ----------------------------
  計測状態管理
---------------------------- */
let measuring = false;
let intervalId = null;

// 表示用変数
const rttEl = document.getElementById("rttValue");
const fluctEl = document.getElementById("fluctValue");
const bwEl = document.getElementById("bwValue");

const levelCard = document.getElementById("levelCard");
const indicator = document.getElementById("indicator");

// ボタン
const startBtns = document.querySelectorAll("#startBtn");
const stopBtns = document.querySelectorAll("#stopBtn");
const resetBtns = document.querySelectorAll("#resetBtn");

/* ----------------------------
  ミニグラフ描画用
---------------------------- */
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let graphData = []; // RTT履歴
const MAX_POINTS = 50;

/* ----------------------------
  計測開始
---------------------------- */
startBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (measuring) return;
    measuring = true;

    indicator.classList.remove("hidden");
    stopBtns.forEach(b => b.classList.remove("hidden"));
    resetBtns.forEach(b => b.classList.add("hidden"));

    intervalId = setInterval(updateValues, 1000);
  });
});

/* ----------------------------
  計測停止
---------------------------- */
stopBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    measuring = false;
    indicator.classList.add("hidden");
    stopBtns.forEach(b => b.classList.add("hidden"));
    resetBtns.forEach(b => b.classList.remove("hidden"));

    clearInterval(intervalId);
  });
});

/* ----------------------------
  リセット
---------------------------- */
resetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    rttEl.textContent = "---";
    fluctEl.textContent = "---";
    bwEl.textContent = "---";

    graphData = [];
    drawGraph();

    levelCard.className = "nw-card"; // 色消す
    levelCard.querySelectorAll(".level-text").forEach(txt => {
      txt.textContent = txt.getAttribute("data-lang") === "ja"
        ? "混雑レベル： ---"
        : "Congestion Level: ---";
    });

    resetBtns.forEach(b => b.classList.add("hidden"));
  });
});

/* ----------------------------
  メイン更新ロジック
---------------------------- */
let prevRTT = null;

function updateValues() {
  if (!connection) return;

  const estRTT = connection.rtt || null;
  const estBW = connection.downlink || null;

  // 揺らぎの計算
  let fluct = "---";
  if (prevRTT !== null && estRTT !== null) {
    fluct = Math.abs(estRTT - prevRTT);
  }
  prevRTT = estRTT;

  // 表示
  rttEl.textContent = estRTT;
  fluctEl.textContent = fluct;
  bwEl.textContent = estBW;

  // グラフ更新
  if (estRTT !== null) {
    graphData.push(estRTT);
    if (graphData.length > MAX_POINTS) graphData.shift();
    drawGraph();
  }

  // 混雑レベル判定
  updateLevel(estRTT, fluct);
}

/* ----------------------------
  混雑レベル判定
---------------------------- */
function updateLevel(rtt, fluct) {
  let level = "unknown";

  if (rtt === null) {
    level = "unknown";
  } else if (rtt < 80 && fluct < 30) {
    level = "low";
  } else if (rtt < 180 && fluct < 80) {
    level = "mid";
  } else {
    level = "high";
  }

  // クラス適用
  levelCard.className = "nw-card";
  if (level === "low") levelCard.classList.add("level-low");
  if (level === "mid") levelCard.classList.add("level-mid");
  if (level === "high") levelCard.classList.add("level-high");

  // テキスト更新
  levelCard.querySelectorAll(".level-text").forEach(txt => {
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
}

/* ----------------------------
  グラフ描画
---------------------------- */
function drawGraph() {
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

  if (graphData.length < 2) return;

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.beginPath();

  const max = Math.max(...graphData);
  const min = Math.min(...graphData);

  graphData.forEach((v, i) => {
    const x = (i / (graphData.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}
