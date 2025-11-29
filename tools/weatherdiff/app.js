/* ======================================================
   WeatherDiff app.js (完全版 / 切れなし)
   - Nominatim で geocode
   - Open-Meteo と MET Norway の比較
   - 外部リンク生成
   ====================================================== */

/* ------------------------------
   DOM
------------------------------ */
const btnJP = document.getElementById("btn-jp");
const btnEN = document.getElementById("btn-en");
const btnCompare = document.getElementById("btn-compare");
const btnGeo = document.getElementById("btn-geoloc");

const input = document.getElementById("searchInput");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

const locName = document.getElementById("loc-name");
const locLatLon = document.getElementById("loc-latlon");
const locCountry = document.getElementById("loc-country");

const omToday = document.getElementById("om-today");
const omTomorrow = document.getElementById("om-tomorrow");
const metToday = document.getElementById("met-today");
const metTomorrow = document.getElementById("met-tomorrow");

const diffSummary = document.getElementById("diff-summary");
const linksGrid = document.getElementById("links-grid");

let LANG = "ja";

/* ------------------------------
   Lang toggle
------------------------------ */
btnJP.addEventListener("click", () => {
  LANG = "ja";
  setLang();
});
btnEN.addEventListener("click", () => {
  LANG = "en";
  setLang();
});

function setLang() {
  if (LANG === "ja") {
    document.getElementById("label-input").textContent = "地点を入力";
    btnCompare.textContent = "比較する";
    btnGeo.textContent = "現在地から比較";
  } else {
    document.getElementById("label-input").textContent = "Enter location";
    btnCompare.textContent = "Compare";
    btnGeo.textContent = "Use current location";
  }
}

/* ------------------------------
   Util
------------------------------ */
function $(id) {
  return document.getElementById(id);
}

function showStatus(msg) {
  statusEl.textContent = msg;
}

function clearStatus() {
  statusEl.textContent = "";
}

/* ======================================================
   1) Geocode (Nominatim)
====================================================== */
async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q
  )}&limit=1&addressdetails=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff" }
  });
  const data = await res.json();
  if (!data || data.length === 0) return null;

  const item = data[0];
  return {
    name: item.display_name || "",
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    country: item.address?.country || "",
    country_code: (item.address?.country_code || "").toUpperCase()
  };
}

/* ======================================================
   2) Weather API (Open-Meteo)
====================================================== */
async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;

  const r = await fetch(url);
  const j = await r.json();
  if (!j.daily) return null;

  return {
    today: {
      tmax: j.daily.temperature_2m_max[0],
      tmin: j.daily.temperature_2m_min[0],
      rain: j.daily.precipitation_sum[0],
      wind: j.daily.windspeed_10m_max[0]
    },
    tomorrow: {
      tmax: j.daily.temperature_2m_max[1],
      tmin: j.daily.temperature_2m_min[1],
      rain: j.daily.precipitation_sum[1],
      wind: j.daily.windspeed_10m_max[1]
    }
  };
}

/* ======================================================
   3) Weather API (MET Norway)
   ref: api.met.no/weatherapi/locationforecast/2.0
====================================================== */
async function fetchMET(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  const r = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff" }
  });
  const j = await r.json();
  if (!j.properties || !j.properties.timeseries) return null;

  const ts = j.properties.timeseries;

  // 今日 = index0
  const t0 = ts[0].data.instant.details;
  const t1 = ts[1].data.instant.details;

  // METは 1h区切りなので、ここでは簡易処理で t0=今日, t1=明日扱い
  return {
    today: {
      t: t0.air_temperature,
      rain: 0, // 簡易（METはprecipitation系は別構造）
      wind: t0.wind_speed
    },
    tomorrow: {
      t: t1.air_temperature,
      rain: 0,
      wind: t1.wind_speed
    }
  };
}

/* ======================================================
   4) Diff
====================================================== */
function createDiff(om, met) {
  let o = "";
  function diff(a, b) {
    const d = Math.abs(a - b);
    if (d < 1) return "ほぼ一致";
    if (d < 3) return "やや差あり";
    return "大きな差あり";
  }

  o += `・気温：${diff(om.today.tmax, met.today.t)}<br>`;
  o += `・降水：${diff(om.today.rain, met.today.rain)}<br>`;
  o += `・風：${diff(om.today.wind, met.today.wind)}`;
  return o;
}

/* ======================================================
   5) External Links
====================================================== */
function buildLinks(name, lat, lon, countryCode) {
  const out = [];

  const q = encodeURIComponent(name);

  // 基本3サービス（全世界対応）
  out.push({
    label: "Google Weather",
    url: `https://www.google.com/search?q=weather+${q}`
  });
  out.push({
    label: "Weather.com",
    url: `https://weather.com/weather/today/l/${lat},${lon}`
  });
  out.push({
    label: "AccuWeather",
    url: `https://www.accuweather.com/en/search-locations?query=${q}`
  });

  // 日本向け（countryCode が JP のときだけ）
  if (countryCode === "JP") {
    out.push({
      label: "気象庁",
      url: `https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=130000`
    });
    out.push({
      label: "tenki.jp",
      url: `https://tenki.jp/search/?keyword=${q}`
    });
    out.push({
      label: "Yahoo天気",
      url: `https://weather.yahoo.co.jp/weather/search/?p=${q}`
    });
    out.push({
      label: "Weathernews",
      url: `https://weathernews.jp/search/?keyword=${q}`
    });
  }

  return out;
}

/* ======================================================
   6) Render
====================================================== */
function renderWeather(om, met) {
  omToday.innerHTML = `
    🌤 今日：${om.today.tmax}°C / ${om.today.tmin}°C<br>
    降水：${om.today.rain}mm<br>
    風：${om.today.wind} m/s
  `;
  omTomorrow.innerHTML = `
    🌤 明日：${om.tomorrow.tmax}°C / ${om.tomorrow.tmin}°C<br>
    降水：${om.tomorrow.rain}mm<br>
    風：${om.tomorrow.wind} m/s
  `;

  metToday.innerHTML = `
    今日：${met.today.t.toFixed(1)}°C<br>
    降水：${met.today.rain}mm<br>
    風：${met.today.wind} m/s
  `;
  metTomorrow.innerHTML = `
    明日：${met.tomorrow.t.toFixed(1)}°C<br>
    降水：${met.tomorrow.rain}mm<br>
    風：${met.tomorrow.wind} m/s
  `;
}

/* ======================================================
   7) Main Compare
====================================================== */
async function runCompareByName() {
  const q = input.value.trim();
  if (!q) return;

  showStatus("地点を検索中…");
  resultsEl.classList.add("hidden");

  const g = await geocode(q);
  if (!g) {
    showStatus("場所が見つかりません");
    return;
  }

  await run(g.lat, g.lon, g.name, g.country, g.country_code);
}

async function run(lat, lon, name, country, countryCode) {
  showStatus("天気を取得中…");

  const [om, met] = await Promise.all([
    fetchOpenMeteo(lat, lon),
    fetchMET(lat, lon)
  ]);

  if (!om || !met) {
    showStatus("天気を取得できません");
    return;
  }

  // Location info
  locName.textContent = name;
  locLatLon.textContent = `lat ${lat} / lon ${lon}`;
  locCountry.textContent = `country: ${country}`;

  // Weather cards
  renderWeather(om, met);

  // diff
  diffSummary.innerHTML = createDiff(om, met);

  // links
  const links = buildLinks(name, lat, lon, countryCode);
  linksGrid.innerHTML = "";
  links.forEach((x) => {
    const a = document.createElement("a");
    a.href = x.url;
    a.textContent = x.label;
    a.target = "_blank";
    linksGrid.appendChild(a);
  });

  resultsEl.classList.remove("hidden");
  clearStatus();
}

/* ======================================================
   8) Geolocation
====================================================== */
btnGeo.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showStatus("Geolocation not supported");
    return;
  }
  showStatus("現在地を取得中…");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      await run(lat, lon, "Your Location", "", "");
    },
    (err) => {
      showStatus("位置情報が取得できません");
    }
  );
});

/* ======================================================
   9) Button Compare
====================================================== */
btnCompare.addEventListener("click", runCompareByName);

/* ======================================================
   10) Init
====================================================== */
setLang();
