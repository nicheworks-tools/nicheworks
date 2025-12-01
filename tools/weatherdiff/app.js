/* ==========================================================
   WeatherDiff - app.js（完全修正版）
   - ズレアイコン削除
   - 矢印削除
   - 最高気温のみ色変化
   - 他3項目は常に薄灰
   - 小数点1桁統一
========================================================== */

window.addEventListener("DOMContentLoaded", () => {
  initUI();
  bindEvents();
});

/* ------------------------------
   DOM
------------------------------ */
const input = document.getElementById("locationInput");
const btnCompare = document.getElementById("btnCompare");
const btnGeo = document.getElementById("btnGeo");
const btnReset = document.getElementById("btnReset");

const errorText = document.getElementById("errorText");
const resultSection = document.getElementById("resultSection");

const progressArea = document.getElementById("progressArea");
const progressText = document.getElementById("progressText");

const locName = document.getElementById("locName");
const locMeta = document.getElementById("locMeta");
const processTime = document.getElementById("processTime");

const omIconToday = document.getElementById("omIconToday");
const omTodayTemp = document.getElementById("omTodayTemp");
const omTodayRain = document.getElementById("omTodayRain");
const omTodayWind = document.getElementById("omTodayWind");

const omIconTomorrow = document.getElementById("omIconTomorrow");
const omTomorrowTemp = document.getElementById("omTomorrowTemp");
const omTomorrowRain = document.getElementById("omTomorrowRain");
const omTomorrowWind = document.getElementById("omTomorrowWind");

const mnIconToday = document.getElementById("mnIconToday");
const mnTodayTemp = document.getElementById("mnTodayTemp");
const mnTodayRain = document.getElementById("mnTodayRain");
const mnTodayWind = document.getElementById("mnTodayWind");

const mnIconTomorrow = document.getElementById("mnIconTomorrow");
const mnTomorrowTemp = document.getElementById("mnTomorrowTemp");
const mnTomorrowRain = document.getElementById("mnTomorrowRain");
const mnTomorrowWind = document.getElementById("mnTomorrowWind");

const diffTodayMax = document.getElementById("diffTodayMax");
const diffTodayMin = document.getElementById("diffTodayMin");
const diffTodayRain = document.getElementById("diffTodayRain");
const diffTodayWind = document.getElementById("diffTodayWind");

const diffTomorrowMax = document.getElementById("diffTomorrowMax");
const diffTomorrowMin = document.getElementById("diffTomorrowMin");
const diffTomorrowRain = document.getElementById("diffTomorrowRain");
const diffTomorrowWind = document.getElementById("diffTomorrowWind");

const diffNote = document.getElementById("diffNote");

/* ------------------------------
   init
------------------------------ */
function initUI() {
  btnCompare.disabled = true;
  hide(progressArea);
  hide(resultSection);
}

/* ------------------------------
   Bind Events
------------------------------ */
function bindEvents() {
  btnCompare.addEventListener("click", () => searchByInput());
  btnGeo.addEventListener("click", searchByGeolocation);
  btnReset.addEventListener("click", resetAll);

  input.addEventListener("input", () => {
    btnCompare.disabled = input.value.trim() === "";
  });
}

/* ------------------------------
   Utility
------------------------------ */
function lockUI() {
  btnCompare.disabled = true;
  btnGeo.disabled = true;
  input.readOnly = true;
}
function unlockUI() {
  btnCompare.disabled = input.value.trim() === "";
  btnGeo.disabled = false;
  input.readOnly = false;
}

function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function setProgress(msg) {
  progressText.textContent = msg;
  show(progressArea);
}

function clearError() { errorText.textContent = ""; }
function showError(msg) { errorText.textContent = msg; }

/* ------------------------------
   Input Search
------------------------------ */
async function searchByInput() {
  const q = input.value.trim();
  if (!q) return;
  await runFullProcess({ query: q });
}

/* ------------------------------
   Geo Search
------------------------------ */
function searchByGeolocation() {
  if (!navigator.geolocation) {
    showError("現在地が取得できません。");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async pos => {
      await runFullProcess({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    },
    () => showError("位置情報が許可されませんでした。")
  );
}

/* ------------------------------
   Main Pipeline
------------------------------ */
async function runFullProcess(params) {
  clearError();
  lockUI();
  show(progressArea);
  setProgress("位置情報検索中…");

  const start = performance.now();

  try {
    const { lat, lon, displayName, countryName } = await resolveLocation(params);
    locName.textContent = displayName;
    locMeta.textContent =
      `lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}\n${countryName}`;

    setProgress("Open-Meteo 取得中…");
    const om = await fetchOpenMeteo(lat, lon);

    setProgress("MET Norway 取得中…");
    const mn = await fetchMetNorway(lat, lon, om.utcOffset);

    applyWeatherCards(om, mn);
    applyDiff(om, mn);

    const t = (performance.now() - start) / 1000;
    processTime.textContent = `処理時間：約${t.toFixed(2)}秒`;

    show(resultSection);
  } catch (e) {
    showError(e.message || "エラーが発生しました");
  } finally {
    hide(progressArea);
    unlockUI();
  }
}

/* ------------------------------
   Location Resolve
------------------------------ */
async function resolveLocation(params) {
  if (params.query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(params.query)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data || !data.length) throw new Error("地点が見つかりません。");

    return {
      lat: +data[0].lat,
      lon: +data[0].lon,
      displayName: data[0].display_name,
      countryName: data[0].address?.country || "",
    };
  }

  return {
    lat: params.lat,
    lon: params.lon,
    displayName: "現在地",
    countryName: "",
  };
}

/* ------------------------------
   Open-Meteo（小数点統一）
------------------------------ */
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode` +
    `&timezone=auto`;

  const res = await fetch(url);
  const d = await res.json();

  return {
    utcOffset: d.utc_offset_seconds,

    today: {
      max: +d.daily.temperature_2m_max[0].toFixed(1),
      min: +d.daily.temperature_2m_min[0].toFixed(1),
      rain: +d.daily.precipitation_sum[0].toFixed(1),
      wind: +d.daily.wind_speed_10m_max[0].toFixed(1),
      icon: codeToIcon(d.daily.weathercode[0]),
    },
    tomorrow: {
      max: +d.daily.temperature_2m_max[1].toFixed(1),
      min: +d.daily.temperature_2m_min[1].toFixed(1),
      rain: +d.daily.precipitation_sum[1].toFixed(1),
      wind: +d.daily.wind_speed_10m_max[1].toFixed(1),
      icon: codeToIcon(d.daily.weathercode[1]),
    },
  };
}

/* ------------------------------
   MET Norway（小数点1桁統一）
------------------------------ */
async function fetchMetNorway(lat, lon, offsetSec) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const res = await fetch(url, { headers: { "User-Agent": "WeatherDiff" } });
  const data = await res.json();

  const ts = data.properties.timeseries;

  function toLocal(d) {
    return new Date(d.getTime() + offsetSec * 1000);
  }

  const nowLocal = toLocal(new Date());
  const dayStart = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate());
  const tomorrowStart = new Date(dayStart.getTime() + 24 * 3600 * 1000);
  const tomorrowEnd = new Date(dayStart.getTime() + 48 * 3600 * 1000);

  const todayBlock = ts.filter(t => {
    const d = toLocal(new Date(t.time));
    return d >= dayStart && d < tomorrowStart;
  });

  const tomorrowBlock = ts.filter(t => {
    const d = toLocal(new Date(t.time));
    return d >= tomorrowStart && d < tomorrowEnd;
  });

  function calcDaily(block) {
    if (!block.length) {
      return { max: null, min: null, rain: 0, wind: 0, icon: "☁️" };
    }

    const temps = block.map(t => t.data.instant.details.air_temperature);
    const rains = block.map(
      t =>
        t.data.next_1_hours?.details?.precipitation_amount ??
        t.data.next_6_hours?.details?.precipitation_amount ??
        0
    );
    const winds = block.map(t => t.data.instant.details.wind_speed || 0);

    return {
      max: +Math.max(...temps).toFixed(1),
      min: +Math.min(...temps).toFixed(1),
      rain: +rains.reduce((a, b) => a + b, 0).toFixed(1),
      wind: +Math.max(...winds).toFixed(1),
      icon: "☁️",
    };
  }

  return {
    today: calcDaily(todayBlock),
    tomorrow: calcDaily(tomorrowBlock),
  };
}

/* ------------------------------
   Icon
------------------------------ */
function codeToIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55].includes(code)) return "🌦️";
  if ([61, 63, 65].includes(code)) return "🌧️";
  if ([71, 73, 75].includes(code)) return "❄️";
  return "☁️";
}

/* ------------------------------
   Apply Cards
------------------------------ */
function applyWeatherCards(om, mn) {
  omIconToday.textContent = om.today.icon;
  omTodayTemp.textContent = `今日: ${om.today.max} / ${om.today.min}°C`;
  omTodayRain.textContent = `降水: ${om.today.rain}mm`;
  omTodayWind.textContent = `風: ${om.today.wind} m/s`;

  omIconTomorrow.textContent = om.tomorrow.icon;
  omTomorrowTemp.textContent = `明日: ${om.tomorrow.max} / ${om.tomorrow.min}°C`;
  omTomorrowRain.textContent = `降水: ${om.tomorrow.rain}mm`;
  omTomorrowWind.textContent = `風: ${om.tomorrow.wind} m/s`;

  mnIconToday.textContent = mn.today.icon;
  mnTodayTemp.textContent = `今日: ${mn.today.max}°C`;
  mnTodayRain.textContent = `降水: ${mn.today.rain}mm`;
  mnTodayWind.textContent = `風: ${mn.today.wind} m/s`;

  mnIconTomorrow.textContent = mn.tomorrow.icon;
  mnTomorrowTemp.textContent = `明日: ${mn.tomorrow.max}°C`;
  mnTomorrowRain.textContent = `降水: ${mn.tomorrow.rain}mm`;
  mnTomorrowWind.textContent = `風: ${mn.tomorrow.wind} m/s`;
}

/* ------------------------------
   Diff（信頼度仕様）
------------------------------ */
function applyDiff(om, mn) {

  // 信頼できる唯一の項目：最高気温（色変化あり）
  applyMaxDiff(diffTodayMax, "最高気温", om.today.max, mn.today.max, "°C");
  applyMaxDiff(diffTomorrowMax, "最高気温", om.tomorrow.max, mn.tomorrow.max, "°C");

  // 信頼度低い項目：薄灰固定
  applyLow(diffTodayMin, "最低気温", om.today.min, mn.today.min, "°C");
  applyLow(diffTodayRain, "降水", om.today.rain, mn.today.rain, "mm");
  applyLow(diffTodayWind, "風", om.today.wind, mn.today.wind, "m/s");

  applyLow(diffTomorrowMin, "最低気温", om.tomorrow.min, mn.tomorrow.min, "°C");
  applyLow(diffTomorrowRain, "降水", om.tomorrow.rain, mn.tomorrow.rain, "mm");
  applyLow(diffTomorrowWind, "風", om.tomorrow.wind, mn.tomorrow.wind, "m/s");

  diffNote.textContent =
    "※ 気温（最高）以外のズレはデータ仕様上の制約があり信頼性が低い値です。詳しくは使い方ページをご覧ください。";
}

/* ------------------------------
   最高気温のみに適用される色分け
------------------------------ */
function applyMaxDiff(el, label, v1, v2, unit) {
  const diff = +(v1 - v2).toFixed(1);
  const abs = Math.abs(diff);

  let cls = "diff-gray";

  if (abs <= 0.5) cls = "diff-gray";
  else if (abs <= 2) cls = diff > 0 ? "diff-red" : "diff-blue";
  else             cls = diff > 0 ? "diff-red-dark" : "diff-blue-dark";

  el.className = cls;
  el.textContent = `${label}: ${diff}${unit}（OM ${v1}${unit} / MET ${v2}${unit}）`;
}

/* ------------------------------
   信頼度低い項目：常に薄灰
------------------------------ */
function applyLow(el, label, v1, v2, unit) {
  const diff = +(v1 - v2).toFixed(1);
  el.className = "diff-low";  // 薄色
  el.textContent = `${label}: ${diff}${unit}（OM ${v1}${unit} / MET ${v2}${unit}）`;
}

/* ------------------------------
   Reset
------------------------------ */
function resetAll() {
  hide(resultSection);
  clearError();
  processTime.textContent = "";
}
