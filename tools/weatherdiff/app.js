/* =========================================================
   WeatherDiff – app.js (Full Spec Version)
   API: Open-Meteo + MET Norway (Location Forecast)
========================================================= */

/* ---------------------------
   DOM 取得
--------------------------- */
const input = document.getElementById("wd-input");
const btnSearch = document.getElementById("btn-search");
const btnGeo = document.getElementById("btn-geo");
const results = document.getElementById("wd-results");

const progressArea = document.getElementById("wd-progress");
const progressBar = document.getElementById("wd-progress-bar");
const progressText = document.getElementById("wd-progress-text");

const jpBtn = document.getElementById("lang-jp");
const enBtn = document.getElementById("lang-en");

/* ---------------------------
   言語テキスト
--------------------------- */
const TEXT = {
  jp: {
    comparing: "比較中…",
    geoFail: "現在地を取得できません",
    notFound: "地点が見つかりません",
    resultDone: "比較完了",
    today: "今日",
    tomorrow: "明日",
    temp: "気温",
    rain: "降水",
    wind: "風",
    diff: "予報のズレ（比較結果）",
    other: "他のサービスで詳しく見る",
  },
  en: {
    comparing: "Comparing…",
    geoFail: "Cannot get your location",
    notFound: "Location not found",
    resultDone: "Done",
    today: "Today",
    tomorrow: "Tomorrow",
    temp: "Temp",
    rain: "Rain",
    wind: "Wind",
    diff: "Forecast differences",
    other: "More details on other services",
  },
};

let LANG = "jp";

/* ---------------------------
   丸め
--------------------------- */
const r1 = (n) => Math.round(n * 10) / 10;

/* ---------------------------
   天気アイコン補完（MET Norway はアイコン無し → emoji マッピング）
--------------------------- */
function iconFromCondition(code, src = "openmeteo") {
  // Open-Meteo weathercode → emoji
  const mapOM = {
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

  // MET Norway → weather symbol に近い簡易 emoji
  const mapMET = {
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

  if (src === "openmeteo") return mapOM[code] ?? "☁️";
  if (src === "met") return mapMET[code] ?? "☁️";
  return "☁️";
}

/* ---------------------------
   進捗表示
--------------------------- */
function showProgress(text) {
  progressArea.classList.remove("hidden");
  progressText.textContent = text;
}

function hideProgress() {
  progressArea.classList.add("hidden");
}

/* ---------------------------
   ジオコーディング（Open-Meteo）
--------------------------- */
async function geocode(query) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&language=${LANG}&count=1`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) return null;

  const p = data.results[0];
  return {
    name: `${p.name}, ${p.admin1 ?? ""}, ${p.country}`,
    lat: p.latitude,
    lon: p.longitude,
  };
}

/* ---------------------------
   Open-Meteo forecast
--------------------------- */
async function getOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  return {
    today: {
      icon: iconFromCondition(data.daily.weathercode[0], "openmeteo"),
      tmax: data.daily.temperature_2m_max[0],
      tmin: data.daily.temperature_2m_min[0],
      rain: data.daily.precipitation_sum[0],
      wind: data.daily.windspeed_10m_max[0],
    },
    tomorrow: {
      icon: iconFromCondition(data.daily.weathercode[1], "openmeteo"),
      tmax: data.daily.temperature_2m_max[1],
      tmin: data.daily.temperature_2m_min[1],
      rain: data.daily.precipitation_sum[1],
      wind: data.daily.windspeed_10m_max[1],
    },
  };
}

/* ---------------------------
   MET Norway forecast
--------------------------- */
async function getMET(lat, lon) {
  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const res = await fetch(url);
  const data = await res.json();

  const times = data.properties.timeseries;

  // 24時間ごとの値を拾う（今日 / 明日）
  const today = times[0];
  const tomorrow = times[24] ?? times[times.length - 1];

  // symbol_code → emoji
  function parse(t) {
    const details = t.data.instant.details;
    const next6 = t.data.next_6_hours ?? t.data.next_12_hours;
    const symbol =
      next6?.summary?.symbol_code?.replace(/_.*$/, "") ?? "cloudy";

    return {
      icon: iconFromCondition(symbol, "met"),
      tmax: details.air_temperature, // METは最高/最低が無い → 現在温度代用
      tmin: details.air_temperature - 1.5,
      rain: next6?.details?.precipitation_amount ?? 0,
      wind: details.wind_speed ?? 0,
    };
  }

  return {
    today: parse(today),
    tomorrow: parse(tomorrow),
  };
}

/* ---------------------------
   差の比較（数値も返す）
--------------------------- */
function diffValue(a, b) {
  return r1(a - b);
}

function buildDiffBlock(title, todayDiff, tomorrowDiff, unit) {
  return `
    <div class="diff-block">
      <h4>${title}</h4>
      <div>${TEXT[LANG].today}： ${todayDiff > 0 ? "+" : ""}${todayDiff}${unit}</div>
      <div>${TEXT[LANG].tomorrow}： ${tomorrowDiff > 0 ? "+" : ""}${tomorrowDiff}${unit}</div>
    </div>
  `;
}

/* ---------------------------
   結果描画
--------------------------- */
function renderResult(place, om, met) {
  const html = `
    <div class="section-block">
      <h2>${place.name}</h2>
      <p>lat ${place.lat} / lon ${place.lon}</p>
    </div>

    <div class="weather-card">
      <h3>Open-Meteo</h3>
      <div class="weather-row">
        <div class="weather-icon"><span>${om.today.icon}</span></div>
        <div class="weather-info">
          <div>${TEXT[LANG].today}： ${om.today.tmax}°C / ${om.today.tmin}°C</div>
          <div>${TEXT[LANG].rain}： ${om.today.rain}mm</div>
          <div>${TEXT[LANG].wind}： ${om.today.wind} m/s</div>
        </div>
      </div>

      <div class="weather-row">
        <div class="weather-icon"><span>${om.tomorrow.icon}</span></div>
        <div class="weather-info">
          <div>${TEXT[LANG].tomorrow}： ${om.tomorrow.tmax}°C / ${om.tomorrow.tmin}°C</div>
          <div>${TEXT[LANG].rain}： ${om.tomorrow.rain}mm</div>
          <div>${TEXT[LANG].wind}： ${om.tomorrow.wind} m/s</div>
        </div>
      </div>
    </div>

    <div class="weather-card">
      <h3>MET Norway</h3>
      <div class="weather-row">
        <div class="weather-icon"><span>${met.today.icon}</span></div>
        <div class="weather-info">
          <div>${TEXT[LANG].today}： ${met.today.tmax}°C / ${met.today.tmin}°C</div>
          <div>${TEXT[LANG].rain}： ${met.today.rain}mm</div>
          <div>${TEXT[LANG].wind}： ${met.today.wind} m/s</div>
        </div>
      </div>

      <div class="weather-row">
        <div class="weather-icon"><span>${met.tomorrow.icon}</span></div>
        <div class="weather-info">
          <div>${TEXT[LANG].tomorrow}： ${met.tomorrow.tmax}°C / ${met.tomorrow.tmin}°C</div>
          <div>${TEXT[LANG].rain}： ${met.tomorrow.rain}mm</div>
          <div>${TEXT[LANG].wind}： ${met.tomorrow.wind} m/s</div>
        </div>
      </div>
    </div>

    <div class="diff-card">
      <h3>${TEXT[LANG].diff}</h3>

      <div class="diff-table">
        ${buildDiffBlock(
          TEXT[LANG].temp,
          diffValue(om.today.tmax, met.today.tmax),
          diffValue(om.tomorrow.tmax, met.tomorrow.tmax),
          "°C"
        )}

        ${buildDiffBlock(
          TEXT[LANG].rain,
          diffValue(om.today.rain, met.today.rain),
          diffValue(om.tomorrow.rain, met.tomorrow.rain),
          "mm"
        )}

        ${buildDiffBlock(
          TEXT[LANG].wind,
          diffValue(om.today.wind, met.today.wind),
          diffValue(om.tomorrow.wind, met.tomorrow.wind),
          " m/s"
        )}
      </div>
    </div>
  `;

  results.innerHTML = html;
}

/* ---------------------------
   メイン比較
--------------------------- */
async function runComparison(place) {
  try {
    showProgress(TEXT[LANG].comparing);

    const [om, met] = await Promise.all([
      getOpenMeteo(place.lat, place.lon),
      getMET(place.lat, place.lon),
    ]);

    hideProgress();
    renderResult(place, om, met);
  } catch (e) {
    console.error(e);
    alert("Error");
  }
}

/* ---------------------------
   手入力比較
--------------------------- */
async function handleSearch() {
  const q = input.value.trim();
  if (!q) return;

  showProgress(TEXT[LANG].comparing);

  const place = await geocode(q);
  if (!place) {
    hideProgress();
    alert(TEXT[LANG].notFound);
    return;
  }

  await runComparison(place);
}

/* ---------------------------
   現在地比較
--------------------------- */
function handleGeo() {
  if (!navigator.geolocation) {
    alert(TEXT[LANG].geoFail);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const name = `(${r1(lat)}, ${r1(lon)})`;
      await runComparison({ name, lat, lon });
    },
    () => alert(TEXT[LANG].geoFail)
  );
}

/* ---------------------------
   言語切替
--------------------------- */
function setLang(l) {
  LANG = l;
  // 文言だけ書き換える（結果は再生成しない）
  document.querySelector(".input-label").textContent =
    LANG === "jp" ? "地点を入力" : "Location";
  btnSearch.textContent = LANG === "jp" ? "比較する" : "Compare";
  btnGeo.textContent =
    LANG === "jp" ? "現在地から比較" : "Compare from GPS";
}

/* ---------------------------
   イベント登録
--------------------------- */
btnSearch.addEventListener("click", handleSearch);
btnGeo.addEventListener("click", handleGeo);

jpBtn.addEventListener("click", () => setLang("jp"));
enBtn.addEventListener("click", () => setLang("en"));
