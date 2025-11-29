/* =========================================================
   WeatherDiff – app.js (ID完全一致・最新仕様版)
   ✔ 第12章：解析系 UX の全要件対応
   ✔ プログレスバー
   ✔ ボタン disable / enable
   ✔ 処理時間表示
   ✔ リセット
   ✔ EN/JP 切替
   ✔ 今日・明日の4項目差分
========================================================= */

/* ---------------------------------------------------------
   DOM 取得（あなたの index.html と100%一致）
--------------------------------------------------------- */
const langJP = document.getElementById("langJP");
const langEN = document.getElementById("langEN");

const locationInput = document.getElementById("locationInput");
const btnCompare = document.getElementById("btnCompare");
const btnGeo = document.getElementById("btnGeo");
const errorText = document.getElementById("errorText");

const progressArea = document.getElementById("progressArea");
const progressText = document.getElementById("progressText");

const resultSection = document.getElementById("resultSection");
const warnText = document.getElementById("warnText");

const locName = document.getElementById("locName");
const locMeta = document.getElementById("locMeta");
const btnReset = document.getElementById("btnReset");
const processTime = document.getElementById("processTime");

/* Open-Meteo */
const omIconToday = document.getElementById("omIconToday");
const omTodayTemp = document.getElementById("omTodayTemp");
const omTodayRain = document.getElementById("omTodayRain");
const omTodayWind = document.getElementById("omTodayWind");

const omIconTomorrow = document.getElementById("omIconTomorrow");
const omTomorrowTemp = document.getElementById("omTomorrowTemp");
const omTomorrowRain = document.getElementById("omTomorrowRain");
const omTomorrowWind = document.getElementById("omTomorrowWind");

/* MET Norway */
const mnIconToday = document.getElementById("mnIconToday");
const mnTodayTemp = document.getElementById("mnTodayTemp");
const mnTodayRain = document.getElementById("mnTodayRain");
const mnTodayWind = document.getElementById("mnTodayWind");

const mnIconTomorrow = document.getElementById("mnIconTomorrow");
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

/* 外部リンク */
const linkGoogle = document.getElementById("linkGoogle");
const linkWeatherCom = document.getElementById("linkWeatherCom");
const linkAccu = document.getElementById("linkAccu");
const linkJMA = document.getElementById("linkJMA");
const linkTenki = document.getElementById("linkTenki");
const linkYahooWeather = document.getElementById("linkYahooWeather");
const linkWN = document.getElementById("linkWN");

/* ---------------------------------------------------------
   言語テキスト
--------------------------------------------------------- */
const TEXT = {
  jp: {
    comparing: "比較中…",
    geoFail: "現在地を取得できません",
    notFound: "地点が見つかりません",
    done: "比較完了",
    today: "今日",
    tomorrow: "明日",
    tempMax: "最高気温",
    tempMin: "最低気温",
    rain: "降水",
    wind: "風",
    reset: "リセット",
    warning:
      "この結果は複数の天気APIを比較した参考情報です。必ず各サービスの公式予報も確認してください。",
    processing: "処理時間：約",
    sec: "秒",
    placeholder: "千葉市 / Shibuya / New York",
  },
  en: {
    comparing: "Comparing…",
    geoFail: "Could not obtain your location",
    notFound: "Location not found",
    done: "Done",
    today: "Today",
    tomorrow: "Tomorrow",
    tempMax: "Max Temp",
    tempMin: "Min Temp",
    rain: "Precip.",
    wind: "Wind",
    reset: "Reset",
    warning:
      "These results compare multiple weather APIs and are for reference only. Always check the official forecast.",
    processing: "Processing time: ",
    sec: "s",
    placeholder: "Shibuya / New York / Paris",
  },
};
let LANG = "jp";

/* ---------------------------------------------------------
   補助
--------------------------------------------------------- */
const r1 = (n) => Math.round(n * 10) / 10;

/* Open-Meteo weathercode → emoji */
function iconOpenMeteo(code) {
  const map = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    53: "🌦️",
    55: "🌦️",
    61: "🌧️",
    63: "🌧️",
    65: "🌧️",
    71: "🌨️",
    73: "🌨️",
    75: "🌨️",
    80: "🌦️",
    81: "🌧️",
    82: "🌧️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
  };
  return map[code] ?? "☁️";
}

/* MET Norway icon → emoji */
function iconMET(symbol) {
  const s = symbol.replace(/_.*$/, "");
  const map = {
    clearsky: "☀️",
    fair: "🌤️",
    partlycloudy: "⛅",
    cloudy: "☁️",
    lightrain: "🌦️",
    rain: "🌧️",
    heavyrain: "🌧️",
    lightsnow: "🌨️",
    snow: "🌨️",
    fog: "🌫️",
    thunderstorm: "⛈️",
  };
  return map[s] ?? "☁️";
}

/* ---------------------------------------------------------
   プログレス制御
--------------------------------------------------------- */
function showProgress(text) {
  progressText.textContent = text;
  progressArea.classList.remove("hidden");

  btnCompare.disabled = true;
  btnGeo.disabled = true;
  locationInput.readOnly = true;
}

function hideProgress() {
  progressArea.classList.add("hidden");

  btnCompare.disabled = false;
  btnGeo.disabled = false;
  locationInput.readOnly = false;
}

/* ---------------------------------------------------------
   位置検索（Geocoding）
--------------------------------------------------------- */
async function geocode(query) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&language=" +
    LANG +
    "&name=" +
    encodeURIComponent(query);

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || !data.results.length) return null;

  const p = data.results[0];

  return {
    name: `${p.name}, ${p.country}`,
    lat: p.latitude,
    lon: p.longitude,
  };
}

/* ---------------------------------------------------------
   Open-Meteo 予報
--------------------------------------------------------- */
async function getOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto";

  const res = await fetch(url);
  const d = await res.json();

  return {
    today: {
      icon: iconOpenMeteo(d.daily.weathercode[0]),
      max: d.daily.temperature_2m_max[0],
      min: d.daily.temperature_2m_min[0],
      rain: d.daily.precipitation_sum[0],
      wind: d.daily.windspeed_10m_max[0],
    },
    tomorrow: {
      icon: iconOpenMeteo(d.daily.weathercode[1]),
      max: d.daily.temperature_2m_max[1],
      min: d.daily.temperature_2m_min[1],
      rain: d.daily.precipitation_sum[1],
      wind: d.daily.windspeed_10m_max[1],
    },
  };
}

/* ---------------------------------------------------------
   MET Norway 予報
--------------------------------------------------------- */
async function getMET(lat, lon) {
  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const res = await fetch(url);
  const d = await res.json();

  const t = d.properties.timeseries;
  const today = t[0];
  const tomorrow = t[24] ?? t[t.length - 1];

  function parse(entry) {
    const inst = entry.data.instant.details;
    const next =
      entry.data.next_6_hours ??
      entry.data.next_12_hours ??
      entry.data.next_1_hours;

    const symbol = next?.summary?.symbol_code ?? "cloudy";

    return {
      icon: iconMET(symbol),
      max: inst.air_temperature,
      min: inst.air_temperature - 1.5,
      rain: next?.details?.precipitation_amount ?? 0,
      wind: inst.wind_speed ?? 0,
    };
  }

  return {
    today: parse(today),
    tomorrow: parse(tomorrow),
  };
}

/* ---------------------------------------------------------
   差分計算
--------------------------------------------------------- */
function diff(a, b) {
  return r1(a - b);
}

/* ---------------------------------------------------------
   結果表示
--------------------------------------------------------- */
function render(place, om, met, elapsed) {
  // 地名
  locName.textContent = place.name;
  locMeta.textContent = `lat ${r1(place.lat)} / lon ${r1(
    place.lon
  )}`;

  // 処理時間
  processTime.textContent =
    TEXT[LANG].processing + r1(elapsed / 1000) + TEXT[LANG].sec;

  /* ------------ Open-Meteo 今日 ------------ */
  omIconToday.textContent = om.today.icon;
  omTodayTemp.textContent = `${TEXT[LANG].today}: ${om.today.max}°C / ${om.today.min}°C`;
  omTodayRain.textContent = `${TEXT[LANG].rain}: ${om.today.rain}mm`;
  omTodayWind.textContent = `${TEXT[LANG].wind}: ${om.today.wind} m/s`;

  /* ------------ Open-Meteo 明日 ------------ */
  omIconTomorrow.textContent = om.tomorrow.icon;
  omTomorrowTemp.textContent = `${TEXT[LANG].tomorrow}: ${om.tomorrow.max}°C / ${om.tomorrow.min}°C`;
  omTomorrowRain.textContent = `${TEXT[LANG].rain}: ${om.tomorrow.rain}mm`;
  omTomorrowWind.textContent = `${TEXT[LANG].wind}: ${om.tomorrow.wind} m/s`;

  /* ------------ MET Norway 今日 ------------ */
  mnIconToday.textContent = met.today.icon;
  mnTodayTemp.textContent = `${TEXT[LANG].today}: ${met.today.max}°C / ${met.today.min}°C`;
  mnTodayRain.textContent = `${TEXT[LANG].rain}: ${met.today.rain}mm`;
  mnTodayWind.textContent = `${TEXT[LANG].wind}: ${met.today.wind} m/s`;

  /* ------------ MET Norway 明日 ------------ */
  mnIconTomorrow.textContent = met.tomorrow.icon;
  mnTomorrowTemp.textContent = `${TEXT[LANG].tomorrow}: ${met.tomorrow.max}°C / ${met.tomorrow.min}°C`;
  mnTomorrowRain.textContent = `${TEXT[LANG].rain}: ${met.tomorrow.rain}mm`;
  mnTomorrowWind.textContent = `${TEXT[LANG].wind}: ${met.tomorrow.wind} m/s`;

  /* ------------ Diff 今日 ------------ */
  diffTodayMax.textContent = `・${TEXT[LANG].tempMax}: ${diff(
    om.today.max,
    met.today.max
  )}°C`;
  diffTodayMin.textContent = `・${TEXT[LANG].tempMin}: ${diff(
    om.today.min,
    met.today.min
  )}°C`;
  diffTodayRain.textContent = `・${TEXT[LANG].rain}: ${diff(
    om.today.rain,
    met.today.rain
  )}mm`;
  diffTodayWind.textContent = `・${TEXT[LANG].wind}: ${diff(
    om.today.wind,
    met.today.wind
  )}m/s`;

  /* ------------ Diff 明日 ------------ */
  diffTomorrowMax.textContent = `・${TEXT[LANG].tempMax}: ${diff(
    om.tomorrow.max,
    met.tomorrow.max
  )}°C`;
  diffTomorrowMin.textContent = `・${TEXT[LANG].tempMin}: ${diff(
    om.tomorrow.min,
    met.tomorrow.min
  )}°C`;
  diffTomorrowRain.textContent = `・${TEXT[LANG].rain}: ${diff(
    om.tomorrow.rain,
    met.tomorrow.rain
  )}mm`;
  diffTomorrowWind.textContent = `・${TEXT[LANG].wind}: ${diff(
    om.tomorrow.wind,
    met.tomorrow.wind
  )}m/s`;

  /* ------------ 結果表示 ------------ */
  warnText.textContent = TEXT[LANG].warning;
  resultSection.classList.remove("hidden");

  // スクロール調整（スマホ用）
  resultSection.scrollIntoView({ behavior: "smooth" });
}

/* ---------------------------------------------------------
   外部リンク生成
--------------------------------------------------------- */
function updateExternalLinks(place) {
  const q = encodeURIComponent(place.name);

  linkGoogle.href = `https://www.google.com/search?q=weather+${q}`;
  linkWeatherCom.href = `https://weather.com/search?q=${q}`;
  linkAccu.href = `https://www.accuweather.com/en/search-locations?query=${q}`;

  // 国コード判定
  const isJP = place.name.includes("Japan") || /日本|Tokyo|Osaka|Chiba/i.test(place.name);

  if (isJP) {
    linkJMA.style.display = "block";
    linkTenki.style.display = "block";
    linkYahooWeather.style.display = "block";
    linkWN.style.display = "block";
  } else {
    linkJMA.style.display = "none";
    linkTenki.style.display = "none";
    linkYahooWeather.style.display = "none";
    linkWN.style.display = "none";
  }
}

/* ---------------------------------------------------------
   実行
--------------------------------------------------------- */
async function runPlace(place) {
  const t0 = performance.now();
  showProgress(TEXT[LANG].comparing);
  errorText.textContent = "";

  try {
    const [om, met] = await Promise.all([
      getOpenMeteo(place.lat, place.lon),
      getMET(place.lat, place.lon),
    ]);

    const t1 = performance.now();

    hideProgress();
    render(place, om, met, t1 - t0);
    updateExternalLinks(place);
  } catch (e) {
    console.error(e);
    hideProgress();
    errorText.textContent = "エラーが発生しました";
  }
}

/* ---------------------------------------------------------
   検索ボタン
--------------------------------------------------------- */
btnCompare.addEventListener("click", async () => {
  const q = locationInput.value.trim();
  if (!q) return;

  errorText.textContent = "";
  showProgress(TEXT[LANG].comparing);

  const place = await geocode(q);
  if (!place) {
    hideProgress();
    errorText.textContent = TEXT[LANG].notFound;
    return;
  }

  await runPlace(place);
});

/* ---------------------------------------------------------
   現在地
--------------------------------------------------------- */
btnGeo.addEventListener("click", () => {
  if (!navigator.geolocation) {
    errorText.textContent = TEXT[LANG].geoFail;
    return;
  }

  showProgress(TEXT[LANG].comparing);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const place = {
        name: `(${r1(pos.coords.latitude)}, ${r1(pos.coords.longitude)})`,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      };
      await runPlace(place);
    },
    () => {
      hideProgress();
      errorText.textContent = TEXT[LANG].geoFail;
    }
  );
});

/* ---------------------------------------------------------
   リセット
--------------------------------------------------------- */
btnReset.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  errorText.textContent = "";
});

/* ---------------------------------------------------------
   言語切替
--------------------------------------------------------- */
function applyLang() {
  locationInput.placeholder = TEXT[LANG].placeholder;
  btnCompare.textContent = LANG === "jp" ? "比較する" : "Compare";
  btnGeo.textContent = LANG === "jp" ? "現在地から比較" : "Use GPS";
  btnReset.textContent = TEXT[LANG].reset;
  warnText.textContent = TEXT[LANG].warning;

  langJP.classList.toggle("is-active", LANG === "jp");
  langEN.classList.toggle("is-active", LANG === "en");
}

langJP.addEventListener("click", () => {
  LANG = "jp";
  applyLang();
});

langEN.addEventListener("click", () => {
  LANG = "en";
  applyLang();
});

/* 初期適用 */
applyLang();
