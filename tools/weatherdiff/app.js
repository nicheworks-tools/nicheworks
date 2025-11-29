/* ===========================
   DOM 取得
=========================== */
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

/* Open-Meteo DOM */
const om = {
  iconToday: document.getElementById("omIconToday"),
  todayTemp: document.getElementById("omTodayTemp"),
  todayRain: document.getElementById("omTodayRain"),
  todayWind: document.getElementById("omTodayWind"),
  iconTomorrow: document.getElementById("omIconTomorrow"),
  tomorrowTemp: document.getElementById("omTomorrowTemp"),
  tomorrowRain: document.getElementById("omTomorrowRain"),
  tomorrowWind: document.getElementById("omTomorrowWind"),
};

/* MET Norway DOM */
const mn = {
  iconToday: document.getElementById("mnIconToday"),
  todayTemp: document.getElementById("mnTodayTemp"),
  todayRain: document.getElementById("mnTodayRain"),
  todayWind: document.getElementById("mnTodayWind"),
  iconTomorrow: document.getElementById("mnIconTomorrow"),
  tomorrowTemp: document.getElementById("mnTomorrowTemp"),
  tomorrowRain: document.getElementById("mnTomorrowRain"),
  tomorrowWind: document.getElementById("mnTomorrowWind"),
};

/* Diff DOM */
const diff = {
  todayMax: document.getElementById("diffTodayMax"),
  todayMin: document.getElementById("diffTodayMin"),
  todayRain: document.getElementById("diffTodayRain"),
  todayWind: document.getElementById("diffTodayWind"),
  tomorrowMax: document.getElementById("diffTomorrowMax"),
  tomorrowMin: document.getElementById("diffTomorrowMin"),
  tomorrowRain: document.getElementById("diffTomorrowRain"),
  tomorrowWind: document.getElementById("diffTomorrowWind"),
};

/* Links */
const linkGoogle = document.getElementById("linkGoogle");
const linkWeatherCom = document.getElementById("linkWeatherCom");
const linkAccu = document.getElementById("linkAccu");
const linkJMA = document.getElementById("linkJMA");
const linkTenki = document.getElementById("linkTenki");
const linkYahoo = document.getElementById("linkYahooWeather");
const linkWN = document.getElementById("linkWN");

/* Lang */
const btnLangJP = document.getElementById("langJP");
const btnLangEN = document.getElementById("langEN");
const donateText = document.getElementById("donateText");

/* ===========================
   入力バリデーション
=========================== */
input.addEventListener("input", () => {
  btnCompare.disabled = input.value.trim().length === 0;
});

/* ===========================
   Progress
=========================== */
function startLoading(msg) {
  progressText.textContent = msg;
  progressArea.classList.remove("hidden");
  btnCompare.disabled = true;
  btnGeo.disabled = true;
  input.readOnly = true;
}

function stopLoading() {
  progressArea.classList.add("hidden");
  btnCompare.disabled = false;
  btnGeo.disabled = false;
  input.readOnly = false;
}

/* ===========================
   Error
=========================== */
function showError(msg) {
  errorText.textContent = msg;
  resultSection.classList.add("hidden");
}

function clearError() {
  errorText.textContent = "";
}

/* ===========================
   Geocode / Reverse
=========================== */
async function geocode(query) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=" +
    encodeURIComponent(query);

  const res = await fetch(url);
  const data = await res.json();

  if (!data || data.length === 0) return null;

  const item = data[0];
  const addr = item.address || {};
  const cc = addr.country_code ? addr.country_code.toUpperCase() : null;

  return {
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display: item.display_name,
    countryCode: cc,
  };
}

async function reverseGeocode(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`;

  const res = await fetch(url);
  const data = await res.json();
  const addr = data.address || {};
  const cc = addr.country_code ? addr.country_code.toUpperCase() : null;

  return {
    display: data.display_name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    countryCode: cc,
  };
}

/* ===========================
   Open-Meteo
=========================== */
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max,weathercode" +
    "&timezone=auto";

  const res = await fetch(url);
  const j = await res.json();

  return {
    today: {
      max: j.daily.temperature_2m_max[0],
      min: j.daily.temperature_2m_min[0],
      rain: j.daily.precipitation_probability_mean[0],
      wind: j.daily.windspeed_10m_max[0],
      code: j.daily.weathercode[0],
    },
    tomorrow: {
      max: j.daily.temperature_2m_max[1],
      min: j.daily.temperature_2m_min[1],
      rain: j.daily.precipitation_probability_mean[1],
      wind: j.daily.windspeed_10m_max[1],
      code: j.daily.weathercode[1],
    },
  };
}

function iconFromWeatherCode(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55].includes(code)) return "🌧️";
  if ([61, 63, 65].includes(code)) return "🌧️";
  if ([80, 81, 82].includes(code)) return "🌦️";
  if ([71, 73, 75].includes(code)) return "❄️";
  return "🌡️";
}

/* ===========================
   MET Norway
=========================== */
async function fetchMET(lat, lon) {
  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const res = await fetch(url);
  const j = await res.json();
  const ts = j.properties.timeseries;

  function pick(hourIndex) {
    const d = ts[hourIndex];
    return {
      temp: d.data.instant.details.air_temperature,
      wind: d.data.instant.details.wind_speed,
      rain: d.data.next_6_hours?.details?.precipitation_amount || 0,
    };
  }

  return {
    today: pick(0),
    tomorrow: pick(24),
  };
}

function iconMET(rain, temp) {
  if (rain > 5) return "🌧️";
  if (rain > 1) return "🌦️";
  if (temp < 2) return "❄️";
  return "☁️";
}

/* ===========================
   External links
=========================== */
function setExternalLinks(query, lat, lon, countryCode) {
  const q = query && query.trim().length > 0 ? query : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

  linkGoogle.href =
    "https://www.google.com/search?q=" +
    encodeURIComponent(`weather ${q}`);

  linkWeatherCom.href =
    `https://weather.com/weather/today/l/${lat},${lon}`;

  linkAccu.href =
    "https://www.accuweather.com/en/search-locations?query=" +
    encodeURIComponent(q);

  if (countryCode !== "JP") {
    linkJMA.style.display = "none";
    linkTenki.style.display = "none";
    linkYahoo.style.display = "none";
    linkWN.style.display = "none";
  } else {
    linkJMA.style.display = "block";
    linkTenki.style.display = "block";
    linkYahoo.style.display = "block";
    linkWN.style.display = "block";
  }
}

/* ===========================
   Diff format（絶対値差 / 読みやすさ重視）
=========================== */
function diffLine(label, omVal, mnVal, unit) {
  const d = Math.abs(omVal - mnVal).toFixed(1);
  return `${label}: Open-Meteo ${omVal}${unit} / MET ${mnVal}${unit}（差 ${d}${unit}）`;
}

/* ===========================
   メイン比較処理
=========================== */
async function runCompare(lat, lon, displayName, countryCode, queryForLinks) {
  clearError();
  resultSection.classList.add("hidden");
  startLoading("天気を取得中…");

  const start = performance.now();

  const [omData, mnData] = await Promise.all([
    fetchOpenMeteo(lat, lon),
    fetchMET(lat, lon),
  ]);

  stopLoading();

  /* Location */
  locName.textContent = displayName;
  locMeta.textContent = `lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}`;

  /* Open-Meteo card */
  om.iconToday.textContent = iconFromWeatherCode(omData.today.code);
  om.iconTomorrow.textContent = iconFromWeatherCode(omData.tomorrow.code);

  om.todayTemp.textContent = `今日: ${omData.today.max} / ${omData.today.min}℃`;
  om.todayRain.textContent = `降水: ${omData.today.rain}%`;
  om.todayWind.textContent = `風: ${omData.today.wind} m/s`;

  om.tomorrowTemp.textContent = `明日: ${omData.tomorrow.max} / ${omData.tomorrow.min}℃`;
  om.tomorrowRain.textContent = `降水: ${omData.tomorrow.rain}%`;
  om.tomorrowWind.textContent = `風: ${omData.tomorrow.wind} m/s`;

  /* MET card */
  mn.iconToday.textContent = iconMET(mnData.today.rain, mnData.today.temp);
  mn.iconTomorrow.textContent = iconMET(mnData.tomorrow.rain, mnData.tomorrow.temp);

  mn.todayTemp.textContent = `今日: ${mnData.today.temp.toFixed(1)}℃`;
  mn.todayRain.textContent = `降水: ${mnData.today.rain.toFixed(1)}mm`;
  mn.todayWind.textContent = `風: ${mnData.today.wind.toFixed(1)} m/s`;

  mn.tomorrowTemp.textContent = `明日: ${mnData.tomorrow.temp.toFixed(1)}℃`;
  mn.tomorrowRain.textContent = `降水: ${mnData.tomorrow.rain.toFixed(1)}mm`;
  mn.tomorrowWind.textContent = `風: ${mnData.tomorrow.wind.toFixed(1)} m/s`;

  /* Diff 今日 */
  diff.todayMax.textContent = diffLine(
    "・最高気温",
    omData.today.max,
    mnData.today.temp,
    "℃"
  );
  diff.todayMin.textContent = diffLine(
    "・最低気温",
    omData.today.min,
    mnData.today.temp,
    "℃"
  );
  diff.todayRain.textContent = diffLine(
    "・降水",
    omData.today.rain,
    mnData.today.rain,
    "%"
  );
  diff.todayWind.textContent = diffLine(
    "・風",
    omData.today.wind,
    mnData.today.wind,
    " m/s"
  );

  /* Diff 明日 */
  diff.tomorrowMax.textContent = diffLine(
    "・最高気温",
    omData.tomorrow.max,
    mnData.tomorrow.temp,
    "℃"
  );
  diff.tomorrowMin.textContent = diffLine(
    "・最低気温",
    omData.tomorrow.min,
    mnData.tomorrow.temp,
    "℃"
  );
  diff.tomorrowRain.textContent = diffLine(
    "・降水",
    omData.tomorrow.rain,
    mnData.tomorrow.rain,
    "%"
  );
  diff.tomorrowWind.textContent = diffLine(
    "・風",
    omData.tomorrow.wind,
    mnData.tomorrow.wind,
    " m/s"
  );

  /* Links */
  setExternalLinks(queryForLinks, lat, lon, countryCode);

  /* Time */
  const end = performance.now();
  processTime.textContent = `処理時間: ${(end - start).toFixed(0)}ms`;

  resultSection.classList.remove("hidden");
  window.scrollTo({ top: resultSection.offsetTop - 20, behavior: "smooth" });
}

/* ===========================
   Compare from input
=========================== */
btnCompare.addEventListener("click", async () => {
  const q = input.value.trim();
  if (!q) return;

  clearError();
  startLoading("地点を検索中…");

  const g = await geocode(q);
  if (!g) {
    stopLoading();
    showError("地点が見つかりません。");
    return;
  }

  stopLoading();

  const cc = g.countryCode || "XX";
  await runCompare(g.lat, g.lon, g.display, cc, q);
});

/* ===========================
   Compare from Geo
=========================== */
btnGeo.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("位置情報が取得できません。");
    return;
  }

  clearError();
  startLoading("現在地を取得中…");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      const rev = await reverseGeocode(latitude, longitude);
      stopLoading();

      const cc = rev.countryCode || "XX";
      await runCompare(latitude, longitude, rev.display, cc, rev.display);
    },
    () => {
      stopLoading();
      showError("位置情報が取得できませんでした。");
    }
  );
});

/* ===========================
   Reset
=========================== */
btnReset.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  processTime.textContent = "";
});

/* ===========================
   Lang toggle（文言のみ）
=========================== */
btnLangJP.addEventListener("click", () => {
  btnLangJP.classList.add("is-active");
  btnLangEN.classList.remove("is-active");

  document.getElementById("subtitle").textContent = "天気予報のズレ比較ツール";
  document.getElementById("labelLocation").textContent = "地点を入力";
  document.getElementById("diffTitle").textContent = "予報のズレ（比較結果）";
  donateText.textContent =
    "このツールが役に立ったら、寄付で応援していただけると嬉しいです。";
});

btnLangEN.addEventListener("click", () => {
  btnLangEN.classList.add("is-active");
  btnLangJP.classList.remove("is-active");

  document.getElementById("subtitle").textContent = "Weather forecast difference checker";
  document.getElementById("labelLocation").textContent = "Location";
  document.getElementById("diffTitle").textContent = "Forecast difference";
  donateText.textContent =
    "If this tool helped you, your support would be appreciated.";
});
