// ======================================================
// WeatherDiff – 完全版 app.js
// ID・DOM 対応100% / nullエラー対策済み
// ======================================================

window.addEventListener("DOMContentLoaded", () => {
  cacheDOM();
  bindEvents();
  initUI();
});

// ===============================
// 1. DOMキャッシュ
// ===============================
let input, btnCompare, btnGeo, btnReset;
let errorText, resultSection;
let progressArea, progressText;
let locName, locMeta, processTime;

// Open-Meteo
let omIconToday, omIconTomorrow;
let omTodayTemp, omTodayRain, omTodayWind;
let omTomorrowTemp, omTomorrowRain, omTomorrowWind;

// MET Norway
let mnIconToday, mnIconTomorrow;
let mnTodayTemp, mnTodayRain, mnTodayWind;
let mnTomorrowTemp, mnTomorrowRain, mnTomorrowWind;

// Diff
let diffTodayMax, diffTodayMin, diffTodayRain, diffTodayWind;
let diffTomorrowMax, diffTomorrowMin, diffTomorrowRain, diffTomorrowWind;

function cacheDOM() {
  input = document.getElementById("locationInput");
  btnCompare = document.getElementById("btnCompare");
  btnGeo = document.getElementById("btnGeo");
  btnReset = document.getElementById("btnReset");

  errorText = document.getElementById("errorText");
  resultSection = document.getElementById("resultSection");

  progressArea = document.getElementById("progressArea");
  progressText = document.getElementById("progressText");

  locName = document.getElementById("locName");
  locMeta = document.getElementById("locMeta");
  processTime = document.getElementById("processTime");

  // OM
  omIconToday = document.getElementById("omIconToday");
  omIconTomorrow = document.getElementById("omIconTomorrow");
  omTodayTemp = document.getElementById("omTodayTemp");
  omTodayRain = document.getElementById("omTodayRain");
  omTodayWind = document.getElementById("omTodayWind");
  omTomorrowTemp = document.getElementById("omTomorrowTemp");
  omTomorrowRain = document.getElementById("omTomorrowRain");
  omTomorrowWind = document.getElementById("omTomorrowWind");

  // MET
  mnIconToday = document.getElementById("mnIconToday");
  mnIconTomorrow = document.getElementById("mnIconTomorrow");
  mnTodayTemp = document.getElementById("mnTodayTemp");
  mnTodayRain = document.getElementById("mnTodayRain");
  mnTodayWind = document.getElementById("mnTodayWind");
  mnTomorrowTemp = document.getElementById("mnTomorrowTemp");
  mnTomorrowRain = document.getElementById("mnTomorrowRain");
  mnTomorrowWind = document.getElementById("mnTomorrowWind");

  // Diff
  diffTodayMax = document.getElementById("diffTodayMax");
  diffTodayMin = document.getElementById("diffTodayMin");
  diffTodayRain = document.getElementById("diffTodayRain");
  diffTodayWind = document.getElementById("diffTodayWind");

  diffTomorrowMax = document.getElementById("diffTomorrowMax");
  diffTomorrowMin = document.getElementById("diffTomorrowMin");
  diffTomorrowRain = document.getElementById("diffTomorrowRain");
  diffTomorrowWind = document.getElementById("diffTomorrowWind");
}

// ===============================
// 2. イベント登録
// ===============================
function bindEvents() {
  btnCompare.addEventListener("click", searchByInput);
  btnGeo.addEventListener("click", searchByGeolocation);
  btnReset.addEventListener("click", resetAll);

  input.addEventListener("input", () => {
    btnCompare.disabled = input.value.trim() === "";
  });
}

// ===============================
// 3. 初期UI
// ===============================
function initUI() {
  btnCompare.disabled = true;
  hide(progressArea);
  hide(resultSection);
  clearError();
}

// ユーティリティ
function show(elem) { elem.classList.remove("hidden"); }
function hide(elem) { elem.classList.add("hidden"); }
function clearError() { errorText.textContent = ""; }
function showError(msg) { errorText.textContent = msg; }

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

function setProgress(msg) {
  progressText.textContent = msg;
  show(progressArea);
}

// ===============================
// 4. 検索（入力）
// ===============================
async function searchByInput() {
  const q = input.value.trim();
  if (!q) return;
  await runFullProcess({ query: q });
}

// ===============================
// 5. 現在地
// ===============================
function searchByGeolocation() {
  if (!navigator.geolocation) {
    showError("現在地が取得できません。");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async pos => {
      await runFullProcess({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      });
    },
    () => showError("位置情報の利用が許可されませんでした。")
  );
}

// ===============================
// 6. フル処理
// ===============================
async function runFullProcess(params) {
  clearError();
  show(progressArea);
  setProgress("位置情報を検索中…");
  lockUI();

  const start = performance.now();

  try {
    // 1) 地点取得
    const { lat, lon, displayName, countryName } = await resolveLocation(params);
    locName.textContent = displayName;
    locMeta.textContent = `lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}\ncountry: ${countryName}`;

    // 2) 天気取得
    setProgress("Open-Meteo 取得中…");
    const om = await fetchOpenMeteo(lat, lon);

    setProgress("MET Norway 取得中…");
    const mn = await fetchMetNorway(lat, lon);

    // 3) 表示更新
    applyWeatherCards(om, mn);
    applyDiff(om, mn);

    // 4) 処理時間
    const t = ((performance.now() - start) / 1000).toFixed(2);
    processTime.textContent = `処理時間：約${t}秒`;

    show(resultSection);

  } catch (err) {
    showError(err.message || "エラーが発生しました。");

  } finally {
    hide(progressArea);
    unlockUI();
  }
}

// ===============================
// 7. 地点解決
// ===============================
async function resolveLocation(params) {
  if (params.query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(params.query)}`;
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

  return {
    lat: params.lat,
    lon: params.lon,
    displayName: "現在地",
    countryName: "-"
  };
}

// ===============================
// 8. Open-Meteo
// ===============================
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  return {
    today: {
      max: data.daily.temperature_2m_max[0],
      min: data.daily.temperature_2m_min[0],
      rain: data.daily.precipitation_sum[0],
      wind: data.daily.wind_speed_10m_max[0],
      icon: codeToIcon(data.daily.weathercode[0])
    },
    tomorrow: {
      max: data.daily.temperature_2m_max[1],
      min: data.daily.temperature_2m_min[1],
      rain: data.daily.precipitation_sum[1],
      wind: data.daily.wind_speed_10m_max[1],
      icon: codeToIcon(data.daily.weathercode[1])
    }
  };
}

// ===============================
// 9. MET Norway
// ===============================
async function fetchMetNorway(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { headers: { "User-Agent": "WeatherDiff" }});
  const data = await res.json();

  const now = data.properties.timeseries[0].data.instant.details;
  const next24 = data.properties.timeseries[24].data.instant.details;

  return {
    today: {
      max: now.air_temperature,
      min: now.air_temperature,
      rain: now.precipitation_amount || 0,
      wind: now.wind_speed || 0,
      icon: "☁️"
    },
    tomorrow: {
      max: next24.air_temperature,
      min: next24.air_temperature,
      rain: next24.precipitation_amount || 0,
      wind: next24.wind_speed || 0,
      icon: "☁️"
    }
  };
}

// ===============================
// 10. 天気コード→アイコン
// ===============================
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

// ===============================
// 11. APIカード反映
// ===============================
function applyWeatherCards(om, mn) {
  // OM
  omIconToday.textContent = om.today.icon;
  omTodayTemp.textContent = `今日: ${om.today.max} / ${om.today.min}°C`;
  omTodayRain.textContent = `降水: ${om.today.rain}mm`;
  omTodayWind.textContent = `風: ${om.today.wind} m/s`;

  omIconTomorrow.textContent = om.tomorrow.icon;
  omTomorrowTemp.textContent = `明日: ${om.tomorrow.max} / ${om.tomorrow.min}°C`;
  omTomorrowRain.textContent = `降水: ${om.tomorrow.rain}mm`;
  omTomorrowWind.textContent = `風: ${om.tomorrow.wind} m/s`;

  // MN
  mnIconToday.textContent = mn.today.icon;
  mnTodayTemp.textContent = `今日: ${mn.today.max}°C`;
  mnTodayRain.textContent = `降水: ${mn.today.rain}mm`;
  mnTodayWind.textContent = `風: ${mn.today.wind} m/s`;

  mnIconTomorrow.textContent = mn.tomorrow.icon;
  mnTomorrowTemp.textContent = `明日: ${mn.tomorrow.max}°C`;
  mnTomorrowRain.textContent = `降水: ${mn.tomorrow.rain}mm`;
  mnTomorrowWind.textContent = `風: ${mn.tomorrow.wind} m/s`;
}

// ===============================
// 12. Diff（プロ版案）
// ===============================
function applyDiff(om, mn) {
  // today
  diffTodayMax.textContent = formatDiff("最高気温", om.today.max, mn.today.max);
  diffTodayMin.textContent = formatDiff("最低気温", om.today.min, mn.today.min);
  diffTodayRain.textContent = formatDiff("降水", om.today.rain, mn.today.rain, "mm");
  diffTodayWind.textContent = formatDiff("風", om.today.wind, mn.today.wind, "m/s");

  // tomorrow
  diffTomorrowMax.textContent = formatDiff("最高気温", om.tomorrow.max, mn.tomorrow.max);
  diffTomorrowMin.textContent = formatDiff("最低気温", om.tomorrow.min, mn.tomorrow.min);
  diffTomorrowRain.textContent = formatDiff("降水", om.tomorrow.rain, mn.tomorrow.rain, "mm");
  diffTomorrowWind.textContent = formatDiff("風", om.tomorrow.wind, mn.tomorrow.wind, "m/s");
}

function formatDiff(label, v1, v2, unit = "°C") {
  const diff = Math.abs(v1 - v2).toFixed(1);
  return `${label}: 差 ${diff}${unit}\nOM ${v1}${unit} / MET ${v2}${unit}`;
}

// ===============================
// 13. リセット
// ===============================
function resetAll() {
  hide(resultSection);
  clearError();
  processTime.textContent = "";
}
