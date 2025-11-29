// =============================================
// WeatherDiff app.js
// Open-Meteo + MET Norway / 2日・4項目比較
// 解析系共通仕様（進捗・リセット・処理時間）対応
// =============================================

// 要素取得
const locationInput = document.getElementById("locationInput");
const btnCompare = document.getElementById("btnCompare");
const btnGeo = document.getElementById("btnGeo");
const btnReset = document.getElementById("btnReset");

const langJP = document.getElementById("langJP");
const langEN = document.getElementById("langEN");

const errorText = document.getElementById("errorText");
const progressArea = document.getElementById("progressArea");
const progressText = document.getElementById("progressText");

const resultSection = document.getElementById("resultSection");
const warnText = document.getElementById("warnText");

const subtitle = document.getElementById("subtitle");
const labelLocation = document.getElementById("labelLocation");
const processTimeEl = document.getElementById("processTime");

const locNameEl = document.getElementById("locName");
const locMetaEl = document.getElementById("locMeta");

// Open-Meteo 表示
const omIconToday = document.getElementById("omIconToday");
const omTodayTemp = document.getElementById("omTodayTemp");
const omTodayRain = document.getElementById("omTodayRain");
const omTodayWind = document.getElementById("omTodayWind");

const omIconTomorrow = document.getElementById("omIconTomorrow");
const omTomorrowTemp = document.getElementById("omTomorrowTemp");
const omTomorrowRain = document.getElementById("omTomorrowRain");
const omTomorrowWind = document.getElementById("omTomorrowWind");

// MET Norway 表示
const mnIconToday = document.getElementById("mnIconToday");
const mnTodayTemp = document.getElementById("mnTodayTemp");
const mnTodayRain = document.getElementById("mnTodayRain");
const mnTodayWind = document.getElementById("mnTodayWind");

const mnIconTomorrow = document.getElementById("mnIconTomorrow");
const mnTomorrowTemp = document.getElementById("mnTomorrowTemp");
const mnTomorrowRain = document.getElementById("mnTomorrowRain");
const mnTomorrowWind = document.getElementById("mnTomorrowWind");

// Diff 表示
const diffTitle = document.getElementById("diffTitle");
const diffTodayHeading = document.getElementById("diffTodayHeading");
const diffTomorrowHeading = document.getElementById("diffTomorrowHeading");

const diffTodayMax = document.getElementById("diffTodayMax");
const diffTodayMin = document.getElementById("diffTodayMin");
const diffTodayRain = document.getElementById("diffTodayRain");
const diffTodayWind = document.getElementById("diffTodayWind");

const diffTomorrowMax = document.getElementById("diffTomorrowMax");
const diffTomorrowMin = document.getElementById("diffTomorrowMin");
const diffTomorrowRain = document.getElementById("diffTomorrowRain");
const diffTomorrowWind = document.getElementById("diffTomorrowWind");

// 外部リンク
const linkGoogle = document.getElementById("linkGoogle");
const linkWeatherCom = document.getElementById("linkWeatherCom");
const linkAccu = document.getElementById("linkAccu");
const linkJMA = document.getElementById("linkJMA");
const linkTenki = document.getElementById("linkTenki");
const linkYahooWeather = document.getElementById("linkYahooWeather");
const linkWN = document.getElementById("linkWN");

const otherServicesTitle = document.getElementById("otherServicesTitle");

// 言語リソース
const TEXT = {
  jp: {
    subtitle: "天気予報のズレ比較ツール",
    labelLocation: "地点を入力",
    placeholder: "千葉市 / 渋谷 / New York",
    compare: "比較する",
    compareFromGPS: "現在地から比較",
    reset: "リセット",
    warning:
      "この結果は複数の天気APIを比較した参考情報です。必ず各サービスの公式予報も確認してください。",
    progressLoc: "地点を検索中…",
    progressWx: "天気を取得中…",
    errorEmpty: "地点を入力してください。",
    errorNotFound: "地点が見つかりませんでした。",
    errorGeo: "現在地を取得できません。",
    today: "今日",
    tomorrow: "明日",
    tempMax: "最高気温",
    tempMin: "最低気温",
    rain: "降水",
    wind: "風",
    diffTitle: "予報のズレ（比較結果）",
    otherServices: "他のサービスで詳しく見る",
    processTime: (sec) => `処理時間：約${sec.toFixed(1)}秒`,
    diffLine: (label, a, b, diff, unit) =>
      `・${label}: Open-Meteo ${a}${unit} / MET ${b}${unit}（差 ${diff > 0 ? "+" : ""}${diff}${unit}）`,
  },
  en: {
    subtitle: "Weather forecast difference checker",
    labelLocation: "Location",
    placeholder: "Shibuya / New York / Paris",
    compare: "Compare",
    compareFromGPS: "Compare from GPS",
    reset: "Reset",
    warning:
      "These results compare multiple weather APIs and are for reference only. Always check official forecasts as well.",
    progressLoc: "Searching location…",
    progressWx: "Fetching weather…",
    errorEmpty: "Please enter a location.",
    errorNotFound: "Location not found.",
    errorGeo: "Failed to get your location.",
    today: "Today",
    tomorrow: "Tomorrow",
    tempMax: "Max temp",
    tempMin: "Min temp",
    rain: "Precipitation",
    wind: "Wind",
    diffTitle: "Forecast differences",
    otherServices: "More details on other services",
    processTime: (sec) => `Processing time: ~${sec.toFixed(1)}s`,
    diffLine: (label, a, b, diff, unit) =>
      `・${label}: Open-Meteo ${a}${unit} / MET ${b}${unit} (Δ ${diff > 0 ? "+" : ""}${diff}${unit})`,
  },
};

let LANG = "jp";

// 直近の状態を保持（言語切替時に再描画できるように）
let lastState = null;

// ユーティリティ
const r1 = (n) => Math.round(n * 10) / 10;

// アイコンマッピング
function iconFromOpenMeteo(code) {
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
    82: "⛈️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
  };
  return map[code] ?? "☁️";
}

function iconFromMetSymbol(symbol) {
  if (!symbol) return "☁️";
  const base = symbol.replace(/_.*$/, "");
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
  return map[base] ?? "☁️";
}

// 進捗・ボタン状態
function setBusy(isBusy, phaseText) {
  if (isBusy) {
    progressArea.classList.remove("hidden");
    progressText.textContent = phaseText;
    btnCompare.disabled = true;
    btnGeo.disabled = true;
    locationInput.readOnly = true;
  } else {
    progressArea.classList.add("hidden");
    btnCompare.disabled = locationInput.value.trim().length === 0;
    btnGeo.disabled = false;
    locationInput.readOnly = false;
  }
}

// 入力バリデーション
function validateInput() {
  const v = locationInput.value.trim();
  if (!v) {
    btnCompare.disabled = true;
  } else {
    btnCompare.disabled = false;
  }
}

// ジオコーディング（Open-Meteo）
async function geocode(query) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?" +
    new URLSearchParams({
      name: query,
      language: LANG === "jp" ? "ja" : "en",
      count: "1",
    }).toString();

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) return null;

  const p = data.results[0];
  return {
    name: `${p.name}${p.admin1 ? ", " + p.admin1 : ""}, ${p.country}`,
    lat: p.latitude,
    lon: p.longitude,
    country: p.country_code,
    timezone: p.timezone ?? "",
  };
}

// 天気 API：Open-Meteo
async function fetchOpenMeteo(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast?" +
    new URLSearchParams({
      latitude: lat,
      longitude: lon,
      daily:
        "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max",
      timezone: "auto",
    }).toString();

  const res = await fetch(url);
  const data = await res.json();

  const d = data.daily;
  return {
    today: {
      icon: iconFromOpenMeteo(d.weathercode[0]),
      tmax: r1(d.temperature_2m_max[0]),
      tmin: r1(d.temperature_2m_min[0]),
      rain: r1(d.precipitation_sum[0]),
      wind: r1(d.windspeed_10m_max[0]),
    },
    tomorrow: {
      icon: iconFromOpenMeteo(d.weathercode[1]),
      tmax: r1(d.temperature_2m_max[1]),
      tmin: r1(d.temperature_2m_min[1]),
      rain: r1(d.precipitation_sum[1]),
      wind: r1(d.windspeed_10m_max[1]),
    },
  };
}

// 天気 API：MET Norway
async function fetchMet(lat, lon) {
  const url =
    "https://api.met.no/weatherapi/locationforecast/2.0/compact?" +
    new URLSearchParams({ lat, lon }).toString();

  const res = await fetch(url);
  const data = await res.json();

  const ts = data.properties.timeseries;

  const todayTS = ts[0];
  const tomorrowTS = ts[24] ?? ts[ts.length - 1];

  function parse(t) {
    const details = t.data.instant.details || {};
    const next6 = t.data.next_6_hours || t.data.next_12_hours || null;
    const symbol = next6?.summary?.symbol_code || "cloudy";

    const temp = typeof details.air_temperature === "number" ? details.air_temperature : 0;
    const wind = typeof details.wind_speed === "number" ? details.wind_speed : 0;
    const rain =
      typeof next6?.details?.precipitation_amount === "number"
        ? next6.details.precipitation_amount
        : 0;

    return {
      icon: iconFromMetSymbol(symbol),
      tmax: r1(temp),
      tmin: r1(temp - 1.5),
      rain: r1(rain),
      wind: r1(wind),
    };
  }

  return {
    today: parse(todayTS),
    tomorrow: parse(tomorrowTS),
  };
}

// 外部リンク更新
function updateExternalLinks(place) {
  const q = encodeURIComponent(place.name);
  const lat = place.lat;
  const lon = place.lon;

  // グローバル3種は常に出す
  linkGoogle.href = `https://www.google.com/search?q=weather%20${q}`;
  linkWeatherCom.href = `https://weather.com/weather/today/l/${lat},${lon}`;
  linkAccu.href = `https://www.accuweather.com/en/search-locations?query=${q}`;

  // 日本ローカルは country=JP のときだけ活かす（他は一応リンクはそのままでもOK）
  const isJP = place.country === "JP";

  linkJMA.style.display = isJP ? "block" : "none";
  linkTenki.style.display = isJP ? "block" : "none";
  linkYahooWeather.style.display = isJP ? "block" : "none";
  linkWN.style.display = isJP ? "block" : "none";
}

// 結果描画（状態からUIを更新）
function renderFromState() {
  if (!lastState) return;
  const { place, om, met, durationSec } = lastState;
  const T = TEXT[LANG];

  // ヘッダ
  locNameEl.textContent = place.name;
  const metaParts = [`lat ${r1(place.lat)}`, `lon ${r1(place.lon)}`];
  if (place.timezone) metaParts.push(`TZ: ${place.timezone}`);
  locMetaEl.textContent = metaParts.join(" / ");

  processTimeEl.textContent = durationSec ? T.processTime(durationSec) : "";

  // Open-Meteo
  omIconToday.textContent = om.today.icon;
  omTodayTemp.textContent = `${T.today}: ${om.today.tmax}°C / ${om.today.tmin}°C`;
  omTodayRain.textContent = `${T.rain}: ${om.today.rain}mm`;
  omTodayWind.textContent = `${T.wind}: ${om.today.wind} m/s`;

  omIconTomorrow.textContent = om.tomorrow.icon;
  omTomorrowTemp.textContent = `${T.tomorrow}: ${om.tomorrow.tmax}°C / ${om.tomorrow.tmin}°C`;
  omTomorrowRain.textContent = `${T.rain}: ${om.tomorrow.rain}mm`;
  omTomorrowWind.textContent = `${T.wind}: ${om.tomorrow.wind} m/s`;

  // MET Norway
  mnIconToday.textContent = met.today.icon;
  mnTodayTemp.textContent = `${T.today}: ${met.today.tmax}°C / ${met.today.tmin}°C`;
  mnTodayRain.textContent = `${T.rain}: ${met.today.rain}mm`;
  mnTodayWind.textContent = `${T.wind}: ${met.today.wind} m/s`;

  mnIconTomorrow.textContent = met.tomorrow.icon;
  mnTomorrowTemp.textContent = `${T.tomorrow}: ${met.tomorrow.tmax}°C / ${met.tomorrow.tmin}°C`;
  mnTomorrowRain.textContent = `${T.rain}: ${met.tomorrow.rain}mm`;
  mnTomorrowWind.textContent = `${T.wind}: ${met.tomorrow.wind} m/s`;

  // Diff
  diffTitle.textContent = T.diffTitle;
  diffTodayHeading.textContent = T.today;
  diffTomorrowHeading.textContent = T.tomorrow;

  const dTodayMax = r1(om.today.tmax - met.today.tmax);
  const dTodayMin = r1(om.today.tmin - met.today.tmin);
  const dTodayRainVal = r1(om.today.rain - met.today.rain);
  const dTodayWindVal = r1(om.today.wind - met.today.wind);

  const dTomorrowMax = r1(om.tomorrow.tmax - met.tomorrow.tmax);
  const dTomorrowMin = r1(om.tomorrow.tmin - met.tomorrow.tmin);
  const dTomorrowRainVal = r1(om.tomorrow.rain - met.tomorrow.rain);
  const dTomorrowWindVal = r1(om.tomorrow.wind - met.tomorrow.wind);

  diffTodayMax.textContent = T.diffLine(T.tempMax, om.today.tmax, met.today.tmax, dTodayMax, "°C");
  diffTodayMin.textContent = T.diffLine(T.tempMin, om.today.tmin, met.today.tmin, dTodayMin, "°C");
  diffTodayRain.textContent = T.diffLine(T.rain, om.today.rain, met.today.rain, dTodayRainVal, "mm");
  diffTodayWind.textContent = T.diffLine(
    T.wind,
    om.today.wind,
    met.today.wind,
    dTodayWindVal,
    " m/s"
  );

  diffTomorrowMax.textContent = T.diffLine(
    T.tempMax,
    om.tomorrow.tmax,
    met.tomorrow.tmax,
    dTomorrowMax,
    "°C"
  );
  diffTomorrowMin.textContent = T.diffLine(
    T.tempMin,
    om.tomorrow.tmin,
    met.tomorrow.tmin,
    dTomorrowMin,
    "°C"
  );
  diffTomorrowRain.textContent = T.diffLine(
    T.rain,
    om.tomorrow.rain,
    met.tomorrow.rain,
    dTomorrowRainVal,
    "mm"
  );
  diffTomorrowWind.textContent = T.diffLine(
    T.wind,
    om.tomorrow.wind,
    met.tomorrow.wind,
    dTomorrowWindVal,
    " m/s"
  );

  // 注意ボックス
  warnText.textContent = T.warning;
  otherServicesTitle.textContent = T.otherServices;

  // 外部リンク（日本向け表示/非表示）
  updateExternalLinks(place);

  resultSection.classList.remove("hidden");

  // スマホのとき結果エリアまでスクロール
  if (window.innerWidth < 600) {
    resultSection.scrollIntoView({ behavior: "smooth" });
  }
}

// メイン比較処理
async function runCompareForPlace(place, isFromGeo = false) {
  let start = performance.now();

  try {
    setBusy(true, TEXT[LANG].progressWx);

    const [om, met] = await Promise.all([
      fetchOpenMeteo(place.lat, place.lon),
      fetchMet(place.lat, place.lon),
    ]);

    const end = performance.now();
    const durationSec = (end - start) / 1000;

    lastState = { place, om, met, durationSec };

    setBusy(false, "");
    errorText.textContent = "";
    renderFromState();
  } catch (e) {
    console.error(e);
    setBusy(false, "");
    errorText.textContent = "Error while fetching weather.";
  }
}

// 検索ボタン
async function handleCompareClick() {
  const q = locationInput.value.trim();
  if (!q) {
    errorText.textContent = TEXT[LANG].errorEmpty;
    return;
  }

  errorText.textContent = "";
  setBusy(true, TEXT[LANG].progressLoc);

  try {
    const place = await geocode(q);
    if (!place) {
      setBusy(false, "");
      errorText.textContent = TEXT[LANG].errorNotFound;
      return;
    }
    // 場所が取れたら天気取得へ
    await runCompareForPlace(place);
  } catch (e) {
    console.error(e);
    setBusy(false, "");
    errorText.textContent = TEXT[LANG].errorNotFound;
  }
}

// 現在地ボタン
function handleGeoClick() {
  if (!navigator.geolocation) {
    errorText.textContent = TEXT[LANG].errorGeo;
    return;
  }
  errorText.textContent = "";
  setBusy(true, TEXT[LANG].progressLoc);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const place = {
        name:
          LANG === "jp"
            ? `現在地 (${r1(lat)}, ${r1(lon)})`
            : `Current location (${r1(lat)}, ${r1(lon)})`,
        lat,
        lon,
        country: "", // 国コードは不明だが今は必須ではない
        timezone: "",
      };
      await runCompareForPlace(place, true);
    },
    () => {
      setBusy(false, "");
      errorText.textContent = TEXT[LANG].errorGeo;
    }
  );
}

// リセット
function handleReset() {
  resultSection.classList.add("hidden");
  processTimeEl.textContent = "";
  lastState = lastState ? { ...lastState, durationSec: null } : null;
}

// 言語切替
function applyLang() {
  const T = TEXT[LANG];

  subtitle.textContent = T.subtitle;
  labelLocation.textContent = T.labelLocation;
  locationInput.placeholder = T.placeholder;
  btnCompare.textContent = T.compare;
  btnGeo.textContent = T.compareFromGPS;
  btnReset.textContent = T.reset;
  warnText.textContent = T.warning;
  otherServicesTitle.textContent = T.otherServices;

  langJP.classList.toggle("is-active", LANG === "jp");
  langEN.classList.toggle("is-active", LANG === "en");

  // すでに結果がある場合は文言を再描画
  if (lastState) {
    renderFromState();
  }
}

function setLangJP() {
  LANG = "jp";
  applyLang();
}

function setLangEN() {
  LANG = "en";
  applyLang();
}

// イベント登録
btnCompare.addEventListener("click", handleCompareClick);
btnGeo.addEventListener("click", handleGeoClick);
btnReset.addEventListener("click", handleReset);

langJP.addEventListener("click", setLangJP);
langEN.addEventListener("click", setLangEN);

locationInput.addEventListener("input", () => {
  validateInput();
  errorText.textContent = "";
});

// 初期状態
validateInput();
applyLang();
