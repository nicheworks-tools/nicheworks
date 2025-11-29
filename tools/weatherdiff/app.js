/* =========================================================
 * WeatherDiff – 完全版 app.js
 * 全仕様（第12章・ブレイクポイント・diff色分け）完全反映
 * ========================================================= */

window.addEventListener("DOMContentLoaded", () => {
  initUI();
  bindEvents();
});

/* ----------------------------------------
   DOM 取得
---------------------------------------- */
const input = document.getElementById("locationInput");
const btnCompare = document.getElementById("btnCompare");
const btnGeo = document.getElementById("btnGeo");
const btnReset = document.getElementById("btnReset");

const errorText = document.getElementById("errorText");
const resultSection = document.getElementById("resultSection");

/* プログレス */
const progressArea = document.getElementById("progressArea");
const progressText = document.getElementById("progressText");

/* 結果系 */
const locName = document.getElementById("locName");
const locMeta = document.getElementById("locMeta");
const processTime = document.getElementById("processTime");

/* Open-Meteo */
const omIconToday = document.getElementById("omIconToday");
const omIconTomorrow = document.getElementById("omIconTomorrow");
const omTodayTemp = document.getElementById("omTodayTemp");
const omTodayRain = document.getElementById("omTodayRain");
const omTodayWind = document.getElementById("omTodayWind");
const omTomorrowTemp = document.getElementById("omTomorrowTemp");
const omTomorrowRain = document.getElementById("omTomorrowRain");
const omTomorrowWind = document.getElementById("omTomorrowWind");

/* MET Norway */
const mnIconToday = document.getElementById("mnIconToday");
const mnIconTomorrow = document.getElementById("mnIconTomorrow");
const mnTodayTemp = document.getElementById("mnTodayTemp");
const mnTodayRain = document.getElementById("mnTodayRain");
const mnTodayWind = document.getElementById("mnTodayWind");
const mnTomorrowTemp = document.getElementById("mnTomorrowTemp");
const mnTomorrowRain = document.getElementById("mnTomorrowRain");
const mnTomorrowWind = document.getElementById("mnTomorrowWind");

/* Diff */
const diffTodayMax = document.getElementById("diffTodayMax");
const diffTodayMin = document.getElementById("diffTodayMin");
const diffTodayRain = document.getElementById("diffTodayRain");
const diffTodayWind = document.getElementById("diffTodayWind");

const diffTomorrowMax = document.getElementById("diffTomorrowMax");
const diffTomorrowMin = document.getElementById("diffTomorrowMin");
const diffTomorrowRain = document.getElementById("diffTomorrowRain");
const diffTomorrowWind = document.getElementById("diffTomorrowWind");


/* ----------------------------------------
   初期 UI
---------------------------------------- */
function initUI() {
  btnCompare.disabled = true;
  hide(progressArea);
  hide(resultSection);
}

/* ----------------------------------------
   共通 UI 操作
---------------------------------------- */
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

function show(elem) {
  elem.classList.remove("hidden");
}

function hide(elem) {
  elem.classList.add("hidden");
}

function setProgress(text) {
  progressText.textContent = text;
  show(progressArea);
}

function clearError() {
  errorText.textContent = "";
}

function showError(msg) {
  errorText.textContent = msg;
}

/* ----------------------------------------
   イベント
---------------------------------------- */
function bindEvents() {
  btnCompare.addEventListener("click", () => searchByInput());
  btnGeo.addEventListener("click", () => searchByGeolocation());
  btnReset.addEventListener("click", resetAll);

  input.addEventListener("input", () => {
    btnCompare.disabled = input.value.trim() === "";
  });
}

/* ----------------------------------------
   検索（地名）
---------------------------------------- */
async function searchByInput() {
  const q = input.value.trim();
  if (!q) return;
  await runFullProcess({ query: q });
}

/* ----------------------------------------
   検索（現在地）
---------------------------------------- */
function searchByGeolocation() {
  if (!navigator.geolocation) {
    showError("現在地が取得できません。");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      await runFullProcess({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      });
    },
    () => showError("位置情報の利用が許可されませんでした。")
  );
}

/* ----------------------------------------
   メイン処理（解析系 第12章フル反映）
---------------------------------------- */
async function runFullProcess(params) {
  clearError();
  lockUI();
  show(progressArea);
  setProgress("位置情報を検索中…");

  const start = performance.now();

  try {
    /* 1) 位置情報取得 */
    const { lat, lon, displayName, countryName } = await resolveLocation(params);

    locName.textContent = displayName;
    locMeta.textContent = `lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}\ncountry: ${countryName}`;

    /* 2) Open-Meteo */
    setProgress("Open-Meteo を取得中…");
    const om = await fetchOpenMeteo(lat, lon);

    /* 3) MET Norway */
    setProgress("MET Norway を取得中…");
    const mn = await fetchMetNorway(lat, lon);

    /* 4) UI適用 */
    applyWeatherCards(om, mn);
    applyDiff(om, mn);

    /* 5) 処理時間 */
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    processTime.textContent = `処理時間：約${elapsed}秒`;

    show(resultSection);
  } catch (err) {
    showError(err.message || "エラーが発生しました。");
  } finally {
    hide(progressArea);
    unlockUI();
  }
}

/* ----------------------------------------
   位置情報取得
---------------------------------------- */
async function resolveLocation(params) {
  /* ◆ 地名検索 */
  if (params.query) {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(params.query)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.length === 0) {
      throw new Error("地点が見つかりません。");
    }

    return {
      lat: Number(data[0].lat),
      lon: Number(data[0].lon),
      displayName: data[0].display_name,
      countryName: data[0].address?.country || "-"
    };
  }

  /* ◆ 座標（現在地） */
  return {
    lat: params.lat,
    lon: params.lon,
    displayName: "現在地",
    countryName: "-"
  };
}

/* ----------------------------------------
   Open-Meteo API
---------------------------------------- */
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode&timezone=auto`;

  const res = await fetch(url);
  const d = await res.json();

  return {
    today: {
      max: d.daily.temperature_2m_max[0],
      min: d.daily.temperature_2m_min[0],
      rain: d.daily.precipitation_sum[0],
      wind: d.daily.wind_speed_10m_max[0],
      icon: codeToIcon(d.daily.weathercode[0])
    },
    tomorrow: {
      max: d.daily.temperature_2m_max[1],
      min: d.daily.temperature_2m_min[1],
      rain: d.daily.precipitation_sum[1],
      wind: d.daily.wind_speed_10m_max[1],
      icon: codeToIcon(d.daily.weathercode[1])
    }
  };
}

/* ----------------------------------------
   MET Norway API
---------------------------------------- */
async function fetchMetNorway(lat, lon) {
  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff" }
  });
  const data = await res.json();

  const t0 = data.properties.timeseries[0].data.instant.details;
  const t24 = data.properties.timeseries[24].data.instant.details;

  return {
    today: {
      max: t0.air_temperature,
      min: t0.air_temperature,   // METにはmin/maxがないため即値
      rain: t0.precipitation_amount || 0,
      wind: t0.wind_speed || 0,
      icon: codeToIconMET(t0)    // MET用アイコン
    },
    tomorrow: {
      max: t24.air_temperature,
      min: t24.air_temperature,
      rain: t24.precipitation_amount || 0,
      wind: t24.wind_speed || 0,
      icon: codeToIconMET(t24)
    }
  };
}

/* ----------------------------------------
   アイコン変換（Open-Meteo weathercode）
---------------------------------------- */
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

/* MET Norway 用：降水量と雲量で推定 */
function codeToIconMET(d) {
  if (d.precipitation_amount > 0) return "🌧️";
  if (d.cloud_area_fraction > 70) return "☁️";
  if (d.cloud_area_fraction > 30) return "⛅";
  return "☀️";
}

/* ----------------------------------------
   API カードに適用
---------------------------------------- */
function applyWeatherCards(om, mn) {
  /* OM */
  omIconToday.textContent = om.today.icon;
  omTodayTemp.textContent = `今日: ${om.today.max} / ${om.today.min}°C`;
  omTodayRain.textContent = `降水: ${om.today.rain}mm`;
  omTodayWind.textContent = `風: ${om.today.wind}m/s`;

  omIconTomorrow.textContent = om.tomorrow.icon;
  omTomorrowTemp.textContent = `明日: ${om.tomorrow.max} / ${om.tomorrow.min}°C`;
  omTomorrowRain.textContent = `降水: ${om.tomorrow.rain}mm`;
  omTomorrowWind.textContent = `風: ${om.tomorrow.wind}m/s`;

  /* MET */
  mnIconToday.textContent = mn.today.icon;
  mnTodayTemp.textContent = `今日: ${mn.today.max}°C`;
  mnTodayRain.textContent = `降水: ${mn.today.rain}mm`;
  mnTodayWind.textContent = `風: ${mn.today.wind}m/s`;

  mnIconTomorrow.textContent = mn.tomorrow.icon;
  mnTomorrowTemp.textContent = `明日: ${mn.tomorrow.max}°C`;
  mnTomorrowRain.textContent = `降水: ${mn.tomorrow.rain}mm`;
  mnTomorrowWind.textContent = `風: ${mn.tomorrow.wind}m/s`;
}

/* ----------------------------------------
   Diff（プロ版 = 色つき / 中立）
---------------------------------------- */
function applyDiff(om, mn) {
  /* 今日 */
  setDiff(diffTodayMax, "最高気温", om.today.max, mn.today.max, "°C");
  setDiff(diffTodayMin, "最低気温", om.today.min, mn.today.min, "°C");
  setDiff(diffTodayRain, "降水", om.today.rain, mn.today.rain, "mm");
  setDiff(diffTodayWind, "風", om.today.wind, mn.today.wind, "m/s");

  /* 明日 */
  setDiff(diffTomorrowMax, "最高気温", om.tomorrow.max, mn.tomorrow.max, "°C");
  setDiff(diffTomorrowMin, "最低気温", om.tomorrow.min, mn.tomorrow.min, "°C");
  setDiff(diffTomorrowRain, "降水", om.tomorrow.rain, mn.tomorrow.rain, "mm");
  setDiff(diffTomorrowWind, "風", om.tomorrow.wind, mn.tomorrow.wind, "m/s");
}

/* 色つき差分 */
function setDiff(elem, label, v1, v2, unit) {
  const diff = Number((v1 - v2).toFixed(1));
  const abs = Math.abs(diff);

  /* 色判定 */
  let cls = "diff-gray";
  if (abs <= 0.5) cls = "diff-gray";
  else if (diff > 0 && abs <= 2) cls = "diff-red";
  else if (diff > 2) cls = "diff-darkred";
  else if (diff < 0 && abs <= 2) cls = "diff-blue";
  else if (diff < -2) cls = "diff-darkblue";

  elem.className = cls;

  /* 表記（中立・簡潔） */
  elem.textContent =
    `${label}: 差 ${abs}${unit}（OM ${v1}${unit} / MET ${v2}${unit}）`;
}

/* ----------------------------------------
   リセット
---------------------------------------- */
function resetAll() {
  hide(resultSection);
  clearError();
  processTime.textContent = "";
}
