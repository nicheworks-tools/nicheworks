/* =========================================================
   DOM 取得
========================================================= */
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

/* DIFF DOM */
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

/* リンク */
const linkGoogle = document.getElementById("linkGoogle");
const linkWeatherCom = document.getElementById("linkWeatherCom");
const linkAccu = document.getElementById("linkAccu");
const linkJMA = document.getElementById("linkJMA");
const linkTenki = document.getElementById("linkTenki");
const linkYahoo = document.getElementById("linkYahooWeather");
const linkWN = document.getElementById("linkWN");

/* 言語切替 */
const btnLangJP = document.getElementById("langJP");
const btnLangEN = document.getElementById("langEN");

/* =========================================================
   入力バリデーション
========================================================= */
input.addEventListener("input", () => {
  if (input.value.trim().length > 0) {
    btnCompare.disabled = false;
  } else {
    btnCompare.disabled = true;
  }
});

/* =========================================================
   プログレス制御
========================================================= */
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

/* =========================================================
   エラーメッセージ
========================================================= */
function showError(msg) {
  errorText.textContent = msg;
  resultSection.classList.add("hidden");
}

function clearError() {
  errorText.textContent = "";
}

/* =========================================================
   位置検索 → Nominatim
========================================================= */
async function geocode(query) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&q=" +
    encodeURIComponent(query);

  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff (nicheworks-tool)" },
  });

  const data = await res.json();

  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display: data[0].display_name,
  };
}

/* =========================================================
   現在地 → 逆ジオコーディング
========================================================= */
async function reverseGeocode(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  const r = await fetch(url);
  const j = await r.json();

  return j.display_name || `${lat}, ${lon}`;
}

/* =========================================================
   Open-Meteo API
========================================================= */
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max,winddirection_10m_dominant,weathercode" +
    "&timezone=auto";

  const r = await fetch(url);
  const j = await r.json();

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

/* Open-Meteo weather code → 絵文字 */
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

/* =========================================================
   MET Norway API
========================================================= */
async function fetchMET(lat, lon) {
  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const r = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff (nicheworks-tool)" },
  });
  const j = await r.json();

  const t = j.properties.timeseries;

  function pick(dayIndex) {
    const d = t[dayIndex];
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

/* MET Norway の擬似アイコン */
function iconMET(rain, temp) {
  if (rain > 5) return "🌧️";
  if (rain > 1) return "🌦️";
  if (temp < 2) return "❄️";
  return "☁️";
}

/* =========================================================
   外部リンク（国コード判定）
========================================================= */
function setExternalLinks(query, lat, lon, countryCode) {
  linkGoogle.href =
    "https://www.google.com/search?q=" +
    encodeURIComponent(`weather ${query}`);

  linkWeatherCom.href =
    `https://weather.com/weather/today/l/${lat},${lon}`;

  linkAccu.href =
    "https://www.accuweather.com/en/search-locations?query=" +
    encodeURIComponent(query);

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

/* =========================================================
   差分計算
========================================================= */
function calcDiff(label, omVal, mnVal) {
  const d = (omVal - mnVal).toFixed(1);
  const sign = d > 0 ? "+" : "";
  return `${label}: ${omVal} / ${mnVal}（差 ${sign}${d}）`;
}

/* =========================================================
   メイン処理
========================================================= */
async function runCompare(lat, lon, dispName, countryCode) {
  clearError();
  resultSection.classList.add("hidden");

  startLoading("天気を取得中…");
  const start = performance.now();

  const [omData, mnData] = await Promise.all([
    fetchOpenMeteo(lat, lon),
    fetchMET(lat, lon),
  ]);

  stopLoading();

  /* 表示 */
  locName.textContent = dispName;
  locMeta.textContent = `lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}`;

  /* OM */
  om.iconToday.textContent = iconFromWeatherCode(omData.today.code);
  om.iconTomorrow.textContent = iconFromWeatherCode(omData.tomorrow.code);

  om.todayTemp.textContent = `今日: ${omData.today.max} / ${omData.today.min}℃`;
  om.todayRain.textContent = `降水: ${omData.today.rain}%`;
  om.todayWind.textContent = `風: ${omData.today.wind} m/s`;

  om.tomorrowTemp.textContent = `明日: ${omData.tomorrow.max} / ${omData.tomorrow.min}℃`;
  om.tomorrowRain.textContent = `降水: ${omData.tomorrow.rain}%`;
  om.tomorrowWind.textContent = `風: ${omData.tomorrow.wind} m/s`;

  /* MET */
  mn.iconToday.textContent = iconMET(mnData.today.rain, mnData.today.temp);
  mn.iconTomorrow.textContent = iconMET(
    mnData.tomorrow.rain,
    mnData.tomorrow.temp
  );

  mn.todayTemp.textContent = `今日: ${mnData.today.temp.toFixed(1)}℃`;
  mn.todayRain.textContent = `降水: ${mnData.today.rain.toFixed(1)}mm`;
  mn.todayWind.textContent = `風: ${mnData.today.wind.toFixed(1)} m/s`;

  mn.tomorrowTemp.textContent = `明日: ${mnData.tomorrow.temp.toFixed(1)}℃`;
  mn.tomorrowRain.textContent = `降水: ${mnData.tomorrow.rain.toFixed(1)}mm`;
  mn.tomorrowWind.textContent = `風: ${mnData.tomorrow.wind.toFixed(1)} m/s`;

  /* 差分（今日） */
  diff.todayMax.textContent = calcDiff(
    "・最高気温",
    omData.today.max,
    mnData.today.temp
  );
  diff.todayMin.textContent = calcDiff(
    "・最低気温",
    omData.today.min,
    mnData.today.temp
  );
  diff.todayRain.textContent = calcDiff(
    "・降水",
    omData.today.rain,
    mnData.today.rain
  );
  diff.todayWind.textContent = calcDiff(
    "・風",
    omData.today.wind,
    mnData.today.wind
  );

  /* 差分（明日） */
  diff.tomorrowMax.textContent = calcDiff(
    "・最高気温",
    omData.tomorrow.max,
    mnData.tomorrow.temp
  );
  diff.tomorrowMin.textContent = calcDiff(
    "・最低気温",
    omData.tomorrow.min,
    mnData.tomorrow.temp
  );
  diff.tomorrowRain.textContent = calcDiff(
    "・降水",
    omData.tomorrow.rain,
    mnData.tomorrow.rain
  );
  diff.tomorrowWind.textContent = calcDiff(
    "・風",
    omData.tomorrow.wind,
    mnData.tomorrow.wind
  );

  /* 外部リンク */
  setExternalLinks(input.value, lat, lon, countryCode);

  /* 処理時間 */
  const end = performance.now();
  processTime.textContent =
    `処理時間: ${(end - start).toFixed(0)}ms`;

  /* 表示 */
  resultSection.classList.remove("hidden");

  window.scrollTo({ top: resultSection.offsetTop - 20, behavior: "smooth" });
}

/* =========================================================
   検索処理（入力から）
========================================================= */
btnCompare.addEventListener("click", async () => {
  const q = input.value.trim();
  if (!q) return;

  clearError();
  startLoading("地点を検索中…");

  const geo = await geocode(q);

  if (!geo) {
    stopLoading();
    showError("地点が見つかりません。");
    return;
  }

  stopLoading();

  runCompare(geo.lat, geo.lon, geo.display, "JP");
});

/* =========================================================
   現在地から比較
========================================================= */
btnGeo.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("位置情報が取得できません。");
    return;
  }

  startLoading("現在地を取得中…");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      const name = await reverseGeocode(latitude, longitude);
      stopLoading();

      runCompare(latitude, longitude, name, "JP");
    },
    () => {
      stopLoading();
      showError("位置情報が取得できませんでした。");
    }
  );
});

/* =========================================================
   リセット
========================================================= */
btnReset.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  processTime.textContent = "";
});


/* =========================================================
   言語切替（簡易版：UIラベルのみ）
========================================================= */
btnLangJP.addEventListener("click", () => {
  btnLangJP.classList.add("is-active");
  btnLangEN.classList.remove("is-active");

  document.getElementById("subtitle").textContent = "天気予報のズレ比較ツール";
  document.getElementById("labelLocation").textContent = "地点を入力";
  document.getElementById("diffTitle").textContent = "予報のズレ（比較結果）";

  document.getElementById("donateText").textContent =
    "このツールが役に立ったら、寄付で応援していただけると嬉しいです。";
});

btnLangEN.addEventListener("click", () => {
  btnLangEN.classList.add("is-active");
  btnLangJP.classList.remove("is-active");

  document.getElementById("subtitle").textContent = "Weather forecast comparison";
  document.getElementById("labelLocation").textContent = "Location";
  document.getElementById("diffTitle").textContent = "Forecast difference";

  document.getElementById("donateText").textContent =
    "If this tool helped you, your support would be appreciated.";
});
/* =========================================================
   DOM 取得
========================================================= */
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

/* DIFF DOM */
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

/* リンク */
const linkGoogle = document.getElementById("linkGoogle");
const linkWeatherCom = document.getElementById("linkWeatherCom");
const linkAccu = document.getElementById("linkAccu");
const linkJMA = document.getElementById("linkJMA");
const linkTenki = document.getElementById("linkTenki");
const linkYahoo = document.getElementById("linkYahooWeather");
const linkWN = document.getElementById("linkWN");

/* 言語切替 */
const btnLangJP = document.getElementById("langJP");
const btnLangEN = document.getElementById("langEN");

/* =========================================================
   入力バリデーション
========================================================= */
input.addEventListener("input", () => {
  if (input.value.trim().length > 0) {
    btnCompare.disabled = false;
  } else {
    btnCompare.disabled = true;
  }
});

/* =========================================================
   プログレス制御
========================================================= */
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

/* =========================================================
   エラーメッセージ
========================================================= */
function showError(msg) {
  errorText.textContent = msg;
  resultSection.classList.add("hidden");
}

function clearError() {
  errorText.textContent = "";
}

/* =========================================================
   位置検索 → Nominatim
========================================================= */
async function geocode(query) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&q=" +
    encodeURIComponent(query);

  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff (nicheworks-tool)" },
  });

  const data = await res.json();

  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display: data[0].display_name,
  };
}

/* =========================================================
   現在地 → 逆ジオコーディング
========================================================= */
async function reverseGeocode(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  const r = await fetch(url);
  const j = await r.json();

  return j.display_name || `${lat}, ${lon}`;
}

/* =========================================================
   Open-Meteo API
========================================================= */
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max,winddirection_10m_dominant,weathercode" +
    "&timezone=auto";

  const r = await fetch(url);
  const j = await r.json();

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

/* Open-Meteo weather code → 絵文字 */
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

/* =========================================================
   MET Norway API
========================================================= */
async function fetchMET(lat, lon) {
  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const r = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff (nicheworks-tool)" },
  });
  const j = await r.json();

  const t = j.properties.timeseries;

  function pick(dayIndex) {
    const d = t[dayIndex];
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

/* MET Norway の擬似アイコン */
function iconMET(rain, temp) {
  if (rain > 5) return "🌧️";
  if (rain > 1) return "🌦️";
  if (temp < 2) return "❄️";
  return "☁️";
}

/* =========================================================
   外部リンク（国コード判定）
========================================================= */
function setExternalLinks(query, lat, lon, countryCode) {
  linkGoogle.href =
    "https://www.google.com/search?q=" +
    encodeURIComponent(`weather ${query}`);

  linkWeatherCom.href =
    `https://weather.com/weather/today/l/${lat},${lon}`;

  linkAccu.href =
    "https://www.accuweather.com/en/search-locations?query=" +
    encodeURIComponent(query);

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

/* =========================================================
   差分計算
========================================================= */
function calcDiff(label, omVal, mnVal) {
  const d = (omVal - mnVal).toFixed(1);
  const sign = d > 0 ? "+" : "";
  return `${label}: ${omVal} / ${mnVal}（差 ${sign}${d}）`;
}

/* =========================================================
   メイン処理
========================================================= */
async function runCompare(lat, lon, dispName, countryCode) {
  clearError();
  resultSection.classList.add("hidden");

  startLoading("天気を取得中…");
  const start = performance.now();

  const [omData, mnData] = await Promise.all([
    fetchOpenMeteo(lat, lon),
    fetchMET(lat, lon),
  ]);

  stopLoading();

  /* 表示 */
  locName.textContent = dispName;
  locMeta.textContent = `lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}`;

  /* OM */
  om.iconToday.textContent = iconFromWeatherCode(omData.today.code);
  om.iconTomorrow.textContent = iconFromWeatherCode(omData.tomorrow.code);

  om.todayTemp.textContent = `今日: ${omData.today.max} / ${omData.today.min}℃`;
  om.todayRain.textContent = `降水: ${omData.today.rain}%`;
  om.todayWind.textContent = `風: ${omData.today.wind} m/s`;

  om.tomorrowTemp.textContent = `明日: ${omData.tomorrow.max} / ${omData.tomorrow.min}℃`;
  om.tomorrowRain.textContent = `降水: ${omData.tomorrow.rain}%`;
  om.tomorrowWind.textContent = `風: ${omData.tomorrow.wind} m/s`;

  /* MET */
  mn.iconToday.textContent = iconMET(mnData.today.rain, mnData.today.temp);
  mn.iconTomorrow.textContent = iconMET(
    mnData.tomorrow.rain,
    mnData.tomorrow.temp
  );

  mn.todayTemp.textContent = `今日: ${mnData.today.temp.toFixed(1)}℃`;
  mn.todayRain.textContent = `降水: ${mnData.today.rain.toFixed(1)}mm`;
  mn.todayWind.textContent = `風: ${mnData.today.wind.toFixed(1)} m/s`;

  mn.tomorrowTemp.textContent = `明日: ${mnData.tomorrow.temp.toFixed(1)}℃`;
  mn.tomorrowRain.textContent = `降水: ${mnData.tomorrow.rain.toFixed(1)}mm`;
  mn.tomorrowWind.textContent = `風: ${mnData.tomorrow.wind.toFixed(1)} m/s`;

  /* 差分（今日） */
  diff.todayMax.textContent = calcDiff(
    "・最高気温",
    omData.today.max,
    mnData.today.temp
  );
  diff.todayMin.textContent = calcDiff(
    "・最低気温",
    omData.today.min,
    mnData.today.temp
  );
  diff.todayRain.textContent = calcDiff(
    "・降水",
    omData.today.rain,
    mnData.today.rain
  );
  diff.todayWind.textContent = calcDiff(
    "・風",
    omData.today.wind,
    mnData.today.wind
  );

  /* 差分（明日） */
  diff.tomorrowMax.textContent = calcDiff(
    "・最高気温",
    omData.tomorrow.max,
    mnData.tomorrow.temp
  );
  diff.tomorrowMin.textContent = calcDiff(
    "・最低気温",
    omData.tomorrow.min,
    mnData.tomorrow.temp
  );
  diff.tomorrowRain.textContent = calcDiff(
    "・降水",
    omData.tomorrow.rain,
    mnData.tomorrow.rain
  );
  diff.tomorrowWind.textContent = calcDiff(
    "・風",
    omData.tomorrow.wind,
    mnData.tomorrow.wind
  );

  /* 外部リンク */
  setExternalLinks(input.value, lat, lon, countryCode);

  /* 処理時間 */
  const end = performance.now();
  processTime.textContent =
    `処理時間: ${(end - start).toFixed(0)}ms`;

  /* 表示 */
  resultSection.classList.remove("hidden");

  window.scrollTo({ top: resultSection.offsetTop - 20, behavior: "smooth" });
}

/* =========================================================
   検索処理（入力から）
========================================================= */
btnCompare.addEventListener("click", async () => {
  const q = input.value.trim();
  if (!q) return;

  clearError();
  startLoading("地点を検索中…");

  const geo = await geocode(q);

  if (!geo) {
    stopLoading();
    showError("地点が見つかりません。");
    return;
  }

  stopLoading();

  runCompare(geo.lat, geo.lon, geo.display, "JP");
});

/* =========================================================
   現在地から比較
========================================================= */
btnGeo.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("位置情報が取得できません。");
    return;
  }

  startLoading("現在地を取得中…");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      const name = await reverseGeocode(latitude, longitude);
      stopLoading();

      runCompare(latitude, longitude, name, "JP");
    },
    () => {
      stopLoading();
      showError("位置情報が取得できませんでした。");
    }
  );
});

/* =========================================================
   リセット
========================================================= */
btnReset.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  processTime.textContent = "";
});


/* =========================================================
   言語切替（簡易版：UIラベルのみ）
========================================================= */
btnLangJP.addEventListener("click", () => {
  btnLangJP.classList.add("is-active");
  btnLangEN.classList.remove("is-active");

  document.getElementById("subtitle").textContent = "天気予報のズレ比較ツール";
  document.getElementById("labelLocation").textContent = "地点を入力";
  document.getElementById("diffTitle").textContent = "予報のズレ（比較結果）";

  document.getElementById("donateText").textContent =
    "このツールが役に立ったら、寄付で応援していただけると嬉しいです。";
});

btnLangEN.addEventListener("click", () => {
  btnLangEN.classList.add("is-active");
  btnLangJP.classList.remove("is-active");

  document.getElementById("subtitle").textContent = "Weather forecast comparison";
  document.getElementById("labelLocation").textContent = "Location";
  document.getElementById("diffTitle").textContent = "Forecast difference";

  document.getElementById("donateText").textContent =
    "If this tool helped you, your support would be appreciated.";
});
