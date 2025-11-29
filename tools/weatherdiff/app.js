/* =========================================================
   WeatherDiff app.js  - 最終修正版
========================================================= */

const input = document.getElementById("wd-input");
const btnCompare = document.getElementById("wd-compare");
const btnGeo = document.getElementById("wd-geo");
const statusBox = document.getElementById("wd-status");
const resultBox = document.getElementById("wd-results");
const linkBox = document.getElementById("wd-links");

// 言語切り替え（JP/EN）
let lang = "jp";
document.getElementById("lang-jp").onclick = () => { lang = "jp"; updateLabels(); };
document.getElementById("lang-en").onclick = () => { lang = "en"; updateLabels(); };

function updateLabels() {
  document.getElementById("wd-title").innerText =
    lang === "jp" ? "天気予報のズレ比較ツール" : "Weather Forecast Difference Tool";
  btnCompare.innerText = lang === "jp" ? "比較する" : "Compare";
  btnGeo.innerText = lang === "jp" ? "現在地から比較" : "Compare from location";
}

/* ---------------------------------------------------------
   1. 位置名 → 緯度経度
--------------------------------------------------------- */

async function geocode(keyword) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(keyword)}`;

  const r = await fetch(url, {
    headers: {
      "User-Agent": "WeatherDiff (NicheWorks)"
    }
  });

  const json = await r.json();
  if (!json || json.length === 0) return null;

  return {
    lat: parseFloat(json[0].lat),
    lon: parseFloat(json[0].lon),
    display: json[0].display_name
  };
}

/* ---------------------------------------------------------
   2. Open-Meteo 取得
--------------------------------------------------------- */

async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

  const r = await fetch(url);
  return await r.json();
}

/* ---------------------------------------------------------
   3. MET Norway（compact endpoint）
--------------------------------------------------------- */

async function fetchMet(lat, lon) {
  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const r = await fetch(url); // UA不要（compactは弾かれにくい）
  return await r.json();
}

/* ---------------------------------------------------------
   4. UI描画
--------------------------------------------------------- */

function renderCard(name, data) {
  if (!data) {
    return `
      <div class="wd-api-card">
        <div class="wd-api-title">${name}</div>
        <div>データ取得に失敗しました。</div>
      </div>
    `;
  }

  return `
    <div class="wd-api-card">
      <div class="wd-api-title">${name}</div>
      <div>最高気温：${data.max}℃</div>
      <div>最低気温：${data.min}℃</div>
      <div>降水確率：${data.precip}%</div>
    </div>
  `;
}

/* ---------------------------------------------------------
   5. 主要３サービスリンク生成
--------------------------------------------------------- */

function buildLinks(lat, lon, display) {
  return `
    <a class="wd-link-btn" href="https://www.google.com/search?q=${encodeURIComponent(display)}+weather" target="_blank">Google Weather</a>
    <a class="wd-link-btn" href="https://weather.com/weather/today/l/${lat},${lon}" target="_blank">Weather.com</a>
    <a class="wd-link-btn" href="https://www.accuweather.com/en/search-locations?query=${encodeURIComponent(display)}" target="_blank">AccuWeather</a>
  `;
}

/* ---------------------------------------------------------
   メイン処理
--------------------------------------------------------- */

async function compareByKeyword(keyword) {
  statusBox.innerText = lang === "jp" ? "検索中…" : "Searching...";
  resultBox.innerHTML = "";
  linkBox.innerHTML = "";

  try {
    const g = await geocode(keyword);
    if (!g) {
      statusBox.innerText = lang === "jp" ? "地点が見つかりません" : "Location not found";
      return;
    }

    const { lat, lon, display } = g;

    const om = await fetchOpenMeteo(lat, lon);
    const met = await fetchMet(lat, lon);

    const omTemp = {
      max: om.daily.temperature_2m_max[0],
      min: om.daily.temperature_2m_min[0],
      precip: om.daily.precipitation_probability_max[0]
    };

    const metTemp = {
      max: met.properties.timeseries[0].data.instant.details.air_temperature,
      min: met.properties.timeseries[1].data.instant.details.air_temperature,
      precip: met.properties.timeseries[0].data.instant.details.relative_humidity || "-"
    };

    resultBox.innerHTML =
      renderCard("Open-Meteo", omTemp) +
      renderCard("MET Norway", metTemp);

    linkBox.innerHTML = buildLinks(lat, lon, display);

    statusBox.innerText =
      lang === "jp"
        ? `${display} の結果`
        : `Result for ${display}`;

  } catch (e) {
    console.error(e);
    statusBox.innerText = "Error";
  }
}

/* ---------------------------------------------------------
   現在地処理
--------------------------------------------------------- */

function compareByGeo() {
  if (!navigator.geolocation) {
    statusBox.innerText = "Geolocation Error";
    return;
  }

  statusBox.innerText =
    lang === "jp" ? "現在地を取得中…" : "Getting location...";

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const keyword = `${latitude},${longitude}`;
    compareByKeyword(keyword);
  });
}

/* ---------------------------------------------------------
   イベント
--------------------------------------------------------- */

btnCompare.onclick = () => compareByKeyword(input.value.trim());
btnGeo.onclick = () => compareByGeo();
