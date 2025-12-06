/* ==========================================================
   WeatherDiff - app.js（完全修正版）
   - 差は絶対値のみ
   - 色は差の大きさだけで決定（方向性を排除）
   - 信頼性の低い項目は opacity を下げる
   - ズレアイコン・矢印は一切禁止
   - 小数点1桁で統一
========================================================== */

window.addEventListener("DOMContentLoaded", () => {
  initLanguage();
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
const langBtnJP = document.getElementById("langJP");
const langBtnEN = document.getElementById("langEN");

const subtitle = document.getElementById("subtitle");
const introLead = document.getElementById("introLead");
const usageLink = document.getElementById("usageLink");
const labelLocation = document.getElementById("labelLocation");
const progressText = document.getElementById("progressText");

const errorText = document.getElementById("errorText");
const resultSection = document.getElementById("resultSection");

const progressArea = document.getElementById("progressArea");
const progressBar = progressArea.querySelector(".wd-progress-bar");

const locName = document.getElementById("locName");
const locMeta = document.getElementById("locMeta");
const processTime = document.getElementById("processTime");
const warnText = document.getElementById("warnText");

const omIconToday = document.getElementById("omIconToday");
const omTodayTemp = document.getElementById("omTodayTemp");
const omTodayRain = document.getElementById("omTodayRain");
const omTodayWind = document.getElementById("omTodayWind");
const omDayToday = document.getElementById("omDayToday");

const omIconTomorrow = document.getElementById("omIconTomorrow");
const omTomorrowTemp = document.getElementById("omTomorrowTemp");
const omTomorrowRain = document.getElementById("omTomorrowRain");
const omTomorrowWind = document.getElementById("omTomorrowWind");
const omDayTomorrow = document.getElementById("omDayTomorrow");

const mnIconToday = document.getElementById("mnIconToday");
const mnTodayTemp = document.getElementById("mnTodayTemp");
const mnTodayRain = document.getElementById("mnTodayRain");
const mnTodayWind = document.getElementById("mnTodayWind");
const mnDayToday = document.getElementById("mnDayToday");

const mnIconTomorrow = document.getElementById("mnIconTomorrow");
const mnTomorrowTemp = document.getElementById("mnTomorrowTemp");
const mnTomorrowRain = document.getElementById("mnTomorrowRain");
const mnTomorrowWind = document.getElementById("mnTomorrowWind");
const mnDayTomorrow = document.getElementById("mnDayTomorrow");
const tempNote = document.getElementById("tempNote");

const diffTodayMax = document.getElementById("diffTodayMax");
const diffTodayMin = document.getElementById("diffTodayMin");
const diffTodayRain = document.getElementById("diffTodayRain");
const diffTodayWind = document.getElementById("diffTodayWind");

const diffTomorrowMax = document.getElementById("diffTomorrowMax");
const diffTomorrowMin = document.getElementById("diffTomorrowMin");
const diffTomorrowRain = document.getElementById("diffTomorrowRain");
const diffTomorrowWind = document.getElementById("diffTomorrowWind");

const diffNote = document.getElementById("diffNote");
const diffTitle = document.getElementById("diffTitle");
const diffTodayHeading = document.getElementById("diffTodayHeading");
const diffTomorrowHeading = document.getElementById("diffTomorrowHeading");
const otherServicesTitle = document.getElementById("otherServicesTitle");
const linkGoogleWeather = document.getElementById("linkGoogleWeather");
const linkWeatherCom = document.getElementById("linkWeatherCom");
const linkAccuWeather = document.getElementById("linkAccuWeather");
const linkJma = document.getElementById("linkJma");
const linkTenki = document.getElementById("linkTenki");
const linkYahoo = document.getElementById("linkYahoo");
const donateMsg = document.getElementById("donateMsg");

/* ------------------------------
   i18n
------------------------------ */
const LANG_STORAGE_KEY = "weatherdiffLang";
let currentLang = "ja";

const I18N = {
  ja: {
    subtitle: "天気予報の比較ツール",
    introLead: "このツールは複数の天気APIの予報を比較してズレを確認できるツールです。",
    usageLinkText: "くわしい使い方はこちら →",
    labelLocation: "地点を入力",
    placeholder: "千葉市 / Shibuya / New York",
    btnCompare: "比較",
    btnGeo: "現在地検索",
    btnReset: "リセット",
    progressDefault: "処理中...",
    progressSearch: "位置情報検索中…",
    progressOpenMeteo: "Open-Meteo 取得中…",
    progressMet: "MET Norway 取得中…",
    errorNoGeo: "現在地が取得できません。",
    errorDenied: "位置情報が許可されませんでした。",
    errorNotFound: "地点が見つかりません。",
    errorGeneric: "エラーが発生しました",
    warnText: "この結果は複数の天気API比較に基づく参考情報です。公式情報も確認してください。",
    tempNote: "※最低気温は信頼性が低い推定値です",
    diffTitle: "予報のズレ（比較結果）",
    dayToday: "今日",
    dayTomorrow: "明日",
    tempLabel: "気温",
    rainLabel: "降水",
    windLabel: "風",
    diffLabelMax: "最高気温",
    diffLabelMin: "最低気温",
    diffLabelRain: "降水",
    diffLabelWind: "風",
    diffNoteText: "※ 気温（最高）以外のズレはデータ仕様上の制約があり信頼性が低い値です。",
    diffNoteLink: "詳しくは使い方ページをご覧ください。",
    otherServicesTitle: "他のサービスで詳しく見る",
    links: {
      google: "Google Weather",
      weatherCom: "Weather.com",
      accuweather: "AccuWeather",
      jma: "気象庁",
      tenki: "tenki.jp",
      yahoo: "Yahoo天気",
    },
    donateMsg: "このツールが役に立ったら、寄付で応援していただけると嬉しいです。",
    currentLocation: "現在地",
    processTime: "処理時間：約{sec}秒",
  },
  en: {
    subtitle: "Weather forecast comparison tool",
    introLead: "A tool to compare forecasts from multiple weather APIs.",
    usageLinkText: "See full guide →",
    labelLocation: "Enter a location",
    placeholder: "Chiba / Shibuya / New York",
    btnCompare: "Compare",
    btnGeo: "Use my location",
    btnReset: "Reset",
    progressDefault: "Processing...",
    progressSearch: "Searching location...",
    progressOpenMeteo: "Fetching Open-Meteo...",
    progressMet: "Fetching MET Norway...",
    errorNoGeo: "Geolocation is unavailable.",
    errorDenied: "Location permission was denied.",
    errorNotFound: "No locations found.",
    errorGeneric: "An error occurred",
    warnText: "These results compare multiple weather APIs for reference. Please also check official information.",
    tempNote: "* Minimum temperature is a low-reliability estimate",
    diffTitle: "Forecast difference (comparison)",
    dayToday: "Today",
    dayTomorrow: "Tomorrow",
    tempLabel: "Temp",
    rainLabel: "Precipitation",
    windLabel: "Wind",
    diffLabelMax: "High temp",
    diffLabelMin: "Low temp",
    diffLabelRain: "Precipitation",
    diffLabelWind: "Wind",
    diffNoteText: "* Differences other than high temperature have lower reliability due to data limitations.",
    diffNoteLink: "Read the usage guide.",
    otherServicesTitle: "Check details on other services",
    links: {
      google: "Google Weather",
      weatherCom: "Weather.com",
      accuweather: "AccuWeather",
      jma: "Japan Meteorological Agency",
      tenki: "tenki.jp",
      yahoo: "Yahoo! Weather (JP)",
    },
    donateMsg: "If this tool helps you, please consider supporting with a small donation.",
    currentLocation: "Current location",
    processTime: "Processing time: about {sec} sec",
  },
};

let lastOpenMeteo = null;
let lastMetNorway = null;

function t(key) {
  return I18N[currentLang][key] || "";
}

function getUsageHref() {
  return currentLang === "en"
    ? "/tools/weatherdiff/en/usage.html"
    : "/tools/weatherdiff/usage.html";
}

function applyLanguage(lang) {
  currentLang = lang === "en" ? "en" : "ja";
  localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  document.documentElement.lang = currentLang;

  if (langBtnJP && langBtnEN) {
    langBtnJP.classList.toggle("is-active", currentLang === "ja");
    langBtnEN.classList.toggle("is-active", currentLang === "en");
  }

  subtitle.textContent = t("subtitle");
  introLead.textContent = t("introLead");
  usageLink.textContent = t("usageLinkText");
  usageLink.href = getUsageHref();
  labelLocation.textContent = t("labelLocation");
  input.placeholder = t("placeholder");
  btnCompare.textContent = t("btnCompare");
  btnGeo.textContent = t("btnGeo");
  btnReset.textContent = t("btnReset");
  progressText.textContent = t("progressDefault");
  warnText.textContent = t("warnText");

  omDayToday.textContent = t("dayToday");
  omDayTomorrow.textContent = t("dayTomorrow");
  mnDayToday.textContent = t("dayToday");
  mnDayTomorrow.textContent = t("dayTomorrow");
  tempNote.textContent = t("tempNote");

  diffTitle.textContent = t("diffTitle");
  diffTodayHeading.textContent = t("dayToday");
  diffTomorrowHeading.textContent = t("dayTomorrow");
  diffNote.innerHTML = `${t("diffNoteText")} <a href="${getUsageHref()}" target="_blank">${t(
    "diffNoteLink"
  )}</a>`;

  otherServicesTitle.textContent = t("otherServicesTitle");
  linkGoogleWeather.textContent = t("links").google;
  linkWeatherCom.textContent = t("links").weatherCom;
  linkAccuWeather.textContent = t("links").accuweather;
  linkJma.textContent = t("links").jma;
  linkTenki.textContent = t("links").tenki;
  linkYahoo.textContent = t("links").yahoo;

  donateMsg.textContent = t("donateMsg");

  if (lastOpenMeteo && lastMetNorway) {
    applyWeatherCards(lastOpenMeteo, lastMetNorway);
    applyDiff(lastOpenMeteo, lastMetNorway);
  }
}

function initLanguage() {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  const initial = saved || document.documentElement.lang || "ja";
  applyLanguage(initial);
}

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
  langBtnJP.addEventListener("click", () => applyLanguage("ja"));
  langBtnEN.addEventListener("click", () => applyLanguage("en"));

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

function showLoading() {
  show(progressArea);
}
function hideLoading() {
  hide(progressArea);
}

function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function setProgress(msg) {
  progressText.textContent = msg;
  progressArea.classList.remove("hidden");
  if (progressBar) {
    progressBar.classList.remove("is-animating");
    void progressBar.offsetWidth;
    progressBar.classList.add("is-animating");
  }
}

function clearError() { errorText.textContent = ""; }
function showError(msg) { errorText.textContent = msg; }

/* ------------------------------
   Input Search
------------------------------ */
async function searchByInput() {
  const q = input.value.trim();
  if (!q) return;
  showLoading();
  try {
    await runFullProcess({ query: q });
  } finally {
    hideLoading();
  }
}

/* ------------------------------
   Geo Search
------------------------------ */
function searchByGeolocation() {
  showLoading();
  if (location.protocol !== "https:") {
    showError("現在地取得にはHTTPSが必要です。");
    hideLoading();
    return;
  }
  if (!navigator.geolocation) {
    showError(t("errorNoGeo"));
    hideLoading();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async pos => {
      try {
        try {
          await runFullProcess({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        } catch (e) {
          showError("処理中にエラーが発生しました。");
        }
      } finally {
        hideLoading();
      }
    },
    async () => {
      showError(t("errorDenied"));
      try {
        try {
          await runFullProcess({
            lat: 35.681236,
            lon: 139.767125,
          });
        } catch (e) {
          showError("処理中にエラーが発生しました。");
        }
      } finally {
        hideLoading();
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 3000,
      maximumAge: 0,
    }
  );
}

/* ------------------------------
   Main Pipeline
------------------------------ */
async function runFullProcess(params) {
  clearError();
  lockUI();
  show(progressArea);
  setProgress(t("progressSearch"));

  const start = performance.now();

  try {
    const { lat, lon, displayName, countryName } = await resolveLocation(params);
    locName.textContent = displayName;
    locMeta.textContent =
      `lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}\n${countryName}`;

    setProgress(t("progressOpenMeteo"));
    const om = await fetchOpenMeteo(lat, lon);

    setProgress(t("progressMet"));
    const mn = await fetchMetNorway(lat, lon, om.utcOffset);

    lastOpenMeteo = om;
    lastMetNorway = mn;

    applyWeatherCards(om, mn);
    applyDiff(om, mn);

    const elapsed = (performance.now() - start) / 1000;
    processTime.textContent = t("processTime").replace("{sec}", elapsed.toFixed(2));

    show(resultSection);
  } catch (e) {
    showError(e.message || t("errorGeneric"));
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
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        params.query
      )}` +
      `&addressdetails=1&accept-language=ja,en&limit=3&countrycodes=jp`;

    let data;
    try {
      const res = await fetch(url);
      data = await res.json();
    } catch (e) {
      showError("地点が見つかりませんでした。");
      throw new Error("地点が見つかりませんでした。");
    }

    if (!data || !data.length) {
      showError("地点が見つかりませんでした。");
      throw new Error("地点が見つかりませんでした。");
    }

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
    displayName: t("currentLocation"),
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

  function findClosestTimeseriesTo24h(series) {
    if (!Array.isArray(series) || !series.length) return null;

    const start = new Date(series[0].time).getTime();
    const target = start + 24 * 3600 * 1000;
    const threshold = 3 * 3600 * 1000;

    let closest = null;
    let minDiff = Infinity;

    for (const item of series) {
      const diff = Math.abs(new Date(item.time).getTime() - target);
      if (diff <= threshold && diff < minDiff) {
        closest = item;
        minDiff = diff;
      }
    }

    return closest;
  }

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

  const todayData = ts?.[0]?.data;

  let symbol = null;

  if (todayData?.next_6_hours?.summary?.symbol_code) {
    symbol = todayData.next_6_hours.summary.symbol_code;
  } else if (todayData?.next_1_hours?.summary?.symbol_code) {
    symbol = todayData.next_1_hours.summary.symbol_code;
  }

  if (!symbol) {
    const cloud = todayData?.instant?.details?.cloud_area_fraction ?? 50;
    const precip = todayData?.instant?.details?.precipitation_amount ?? 0;

    if (precip > 0) symbol = "rain";
    else if (cloud <= 20) symbol = "clearsky";
    else if (cloud <= 50) symbol = "fair";
    else if (cloud <= 80) symbol = "cloudy";
    else symbol = "overcast";
  }

  const target = findClosestTimeseriesTo24h(ts) || ts?.[0] || null;
  const targetData = target?.data;

  let symbolTomorrow = null;

  if (targetData?.next_12_hours?.summary?.symbol_code) {
    symbolTomorrow = targetData.next_12_hours.summary.symbol_code;
  } else if (targetData?.next_6_hours?.summary?.symbol_code) {
    symbolTomorrow = targetData.next_6_hours.summary.symbol_code;
  } else {
    const cloud = targetData?.instant?.details?.cloud_area_fraction ?? 50;
    const precip = targetData?.instant?.details?.precipitation_amount ?? 0;

    if (precip > 0) symbolTomorrow = "rain";
    else if (cloud <= 20) symbolTomorrow = "clearsky";
    else if (cloud <= 50) symbolTomorrow = "fair";
    else if (cloud <= 80) symbolTomorrow = "cloudy";
    else symbolTomorrow = "overcast";
  }

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

  const today = calcDaily(todayBlock);
  const tomorrow = calcDaily(tomorrowBlock);

  const todayIcon = mapMetSymbolToIcon(symbol);
  const tomorrowIcon = mapMetSymbolToIcon(symbolTomorrow);

  return {
    today: { ...today, icon: todayIcon },
    tomorrow: { ...tomorrow, icon: tomorrowIcon },
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

function mapMetSymbolToIcon(symbol) {
  if (!symbol) return "☁";

  if (symbol.includes("clearsky")) return "☀️";
  if (symbol.includes("fair") || symbol.includes("partlycloudy")) return "🌤️";

  if (symbol.includes("cloudy") || symbol.includes("overcast")) return "☁️";

  if (symbol.includes("rain")) return "🌧️";
  if (symbol.includes("snow")) return "❄️";

  return "☁️";
}

/* ------------------------------
   Apply Cards
------------------------------ */
function applyWeatherCards(om, mn) {
  omIconToday.textContent = om.today.icon;
  omTodayTemp.textContent = `${t("tempLabel")}: ${om.today.max} / ${om.today.min}°C`;
  omTodayRain.textContent = `${t("rainLabel")}: ${om.today.rain}mm`;
  omTodayWind.textContent = `${t("windLabel")}: ${om.today.wind} m/s`;

  omIconTomorrow.textContent = om.tomorrow.icon;
  omTomorrowTemp.textContent = `${t("tempLabel")}: ${om.tomorrow.max} / ${om.tomorrow.min}°C`;
  omTomorrowRain.textContent = `${t("rainLabel")}: ${om.tomorrow.rain}mm`;
  omTomorrowWind.textContent = `${t("windLabel")}: ${om.tomorrow.wind} m/s`;

  mnIconToday.textContent = mn.today.icon;
  mnTodayTemp.innerHTML = `${t("tempLabel")}: ${mn.today.max} / <span class="wd-temp-min">${mn.today.min}</span>°C`;
  mnTodayRain.textContent = `${t("rainLabel")}: ${mn.today.rain}mm`;
  mnTodayWind.textContent = `${t("windLabel")}: ${mn.today.wind} m/s`;

  mnIconTomorrow.textContent = mn.tomorrow.icon;
  mnTomorrowTemp.innerHTML = `${t("tempLabel")}: ${mn.tomorrow.max} / <span class="wd-temp-min">${mn.tomorrow.min}</span>°C`;
  mnTomorrowRain.textContent = `${t("rainLabel")}: ${mn.tomorrow.rain}mm`;
  mnTomorrowWind.textContent = `${t("windLabel")}: ${mn.tomorrow.wind} m/s`;
}

/* ------------------------------
   Diff（信頼性付き）
------------------------------ */
function applyDiff(om, mn) {
  // 最高気温のみ信頼できる
  applyOneDiff(diffTodayMax, t("diffLabelMax"), om.today.max, mn.today.max, "°C", true);
  applyOneDiff(diffTomorrowMax, t("diffLabelMax"), om.tomorrow.max, mn.tomorrow.max, "°C", true);

  // 低信頼（薄色）
  applyOneDiff(diffTodayMin, t("diffLabelMin"), om.today.min, mn.today.min, "°C", false);
  applyOneDiff(diffTodayRain, t("diffLabelRain"), om.today.rain, mn.today.rain, "mm", false);
  applyOneDiff(diffTodayWind, t("diffLabelWind"), om.today.wind, mn.today.wind, "m/s", false);

  applyOneDiff(diffTomorrowMin, t("diffLabelMin"), om.tomorrow.min, mn.tomorrow.min, "°C", false);
  applyOneDiff(diffTomorrowRain, t("diffLabelRain"), om.tomorrow.rain, mn.tomorrow.rain, "mm", false);
  applyOneDiff(diffTomorrowWind, t("diffLabelWind"), om.tomorrow.wind, mn.tomorrow.wind, "m/s", false);
}

/* ------------------------------
   applyOneDiff（絶対値のみ / 方向なし）
------------------------------ */
function applyOneDiff(el, label, v1, v2, unit, isReliable = true) {
  const diff = Math.abs(v1 - v2);
  const diffText = diff.toFixed(1) + unit;

  let colorClass = "diff-gray";
  if (diff > 5) colorClass = "diff-red";
  else if (diff > 3) colorClass = "diff-blue-dark";
  else if (diff > 1.5) colorClass = "diff-blue";
  else if (diff > 0.5) colorClass = "diff-blue-light";

  el.className = colorClass;
  el.style.opacity = isReliable ? "1.0" : "0.55";

  el.innerHTML = `
    ${label}: <strong>${diffText}</strong><br>
    <span class="wd-sub">OM ${v1}${unit} / MET ${v2}${unit}</span>
  `;
}

/* ------------------------------
   Reset
------------------------------ */
function resetAll() {
  hide(resultSection);
  clearError();
  processTime.textContent = "";
}
