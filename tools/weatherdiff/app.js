/* =========================================================
 * WeatherDiff (MVP) – app.js
 * ---------------------------------------------------------
 * - Address → Lat/Lng (Nominatim)
 * - Weather APIs: Open-Meteo + MET Norway
 * - Today / Tomorrow summary
 * - Diff summary (temp / rain / wind)
 * - JP/EN automatic text output
 * - External links (Google / AccuWeather / Weather.com / 日本向け)
 * - Geolocation support
 * ========================================================= */

const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

// -------------------------------
// i18n helper
// -------------------------------
const getCurrentLang = () => {
  const active = qs(".nw-lang-switch button.active");
  return active ? active.dataset.lang : "ja";
};

// -------------------------------
// 小ユーティリティ
// -------------------------------
const formatTemp = (t) => (t === null || t === undefined ? "-" : `${Math.round(t)}℃`);
const formatWind = (w) => (w === null || w === undefined ? "-" : `${w} m/s`);

const windDir = (deg) => {
  if (deg === null || deg === undefined) return "-";
  const dirs = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];
  const dirsEN = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const lang = getCurrentLang();
  const idx = Math.round(deg / 22.5) % 16;
  return lang === "ja" ? dirs[idx] : dirsEN[idx];
};

// -------------------------------
// API: 住所 → 緯度経度（Nominatim）
// -------------------------------
async function fetchGeocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en" // Nominatimは英語返しのほうが扱いやすい
    }
  });
  const data = await res.json();
  if (!data || !data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display: data[0].display_name
  };
}

// -------------------------------
// API: Open-Meteo（今日・明日）
// -------------------------------
async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.daily) return null;

  return {
    today: {
      tMax: data.daily.temperature_2m_max[0],
      tMin: data.daily.temperature_2m_min[0],
      rain: data.daily.precipitation_probability_max[0],
      wind: data.daily.windspeed_10m_max[0]
    },
    tomorrow: {
      tMax: data.daily.temperature_2m_max[1],
      tMin: data.daily.temperature_2m_min[1],
      rain: data.daily.precipitation_probability_max[1],
      wind: data.daily.windspeed_10m_max[1]
    }
  };
}

// -------------------------------
// API: MET Norway (今日・明日)
// -------------------------------
async function fetchMetNorway(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff/1.0" }
  });
  const data = await res.json();
  if (!data.properties || !data.properties.timeseries) return null;

  // MET Norwayはhourly → 今日と明日の平均/最大でざっくり要約
  const ts = data.properties.timeseries;
  const now = new Date();
  const today = now.getDate();
  const tomorrow = (new Date(now.getTime() + 24*3600*1000)).getDate();

  const todayVals = [];
  const tomorrowVals = [];

  for (const row of ts) {
    const t = new Date(row.time);
    const date = t.getDate();
    const d = row.data;
    if (!d || !d.instant) continue;

    const temp = d.instant.details.air_temperature;
    const wind = d.instant.details.wind_speed;
    const rain = d.next_1_hours?.details?.probability_of_precipitation
      ?? d.next_6_hours?.details?.probability_of_precipitation
      ?? null;

    const pack = { temp, wind, rain };

    if (date === today) todayVals.push(pack);
    if (date === tomorrow) tomorrowVals.push(pack);
  }

  const avg = (arr, key) => {
    const vals = arr.map(e => e[key]).filter(v => v !== null && v !== undefined);
    if (!vals.length) return null;
    return vals.reduce((a,b) => a+b, 0) / vals.length;
  };

  return {
    today: {
      tMax: avg(todayVals, "temp"), 
      tMin: avg(todayVals, "temp"), // METはざっくりで同じ扱い
      rain: avg(todayVals, "rain"),
      wind: avg(todayVals, "wind")
    },
    tomorrow: {
      tMax: avg(tomorrowVals, "temp"),
      tMin: avg(tomorrowVals, "temp"),
      rain: avg(tomorrowVals, "rain"),
      wind: avg(tomorrowVals, "wind")
    }
  };
}

// -------------------------------
// 差分テキスト生成
// -------------------------------
function buildDiffText(api1, api2) {
  const lang = getCurrentLang();

  const diffVal = (v1, v2) => {
    if (v1 == null || v2 == null) return "-";
    return Math.abs(Math.round(v1) - Math.round(v2));
  };

  const dT = diffVal(api1.today.tMax, api2.today.tMax);
  const dR = diffVal(api1.today.rain, api2.today.rain);
  const dW = diffVal(api1.today.wind, api2.today.wind);

  const level = (d, type) => {
    if (d === "-") return lang === "ja" ? "データ不足" : "no data";
    if (d <= 1) return lang === "ja" ? "ほぼ一致" : "almost identical";
    if (d <= 3) return lang === "ja" ? "少し差あり" : "slightly different";
    return lang === "ja" ? "大きな差" : "large difference";
  };

  if (lang === "ja") {
    return `
      <h3>予報のばらつき</h3>
      <ul>
        <li>最高気温：差 ${dT} → ${level(dT)}</li>
        <li>降水：差 ${dR} → ${level(dR)}</li>
        <li>風速：差 ${dW} → ${level(dW)}</li>
      </ul>
    `;
  } else {
    return `
      <h3>Forecast Differences</h3>
      <ul>
        <li>High Temp: diff ${dT} → ${level(dT)}</li>
        <li>Precipitation: diff ${dR} → ${level(dR)}</li>
        <li>Wind Speed: diff ${dW} → ${level(dW)}</li>
      </ul>
    `;
  }
}

// -------------------------------
// 外部リンク生成
// -------------------------------
function buildExternalLinks(lat, lon, display) {
  const urlGoogle = `https://www.google.com/search?q=weather+${encodeURIComponent(display)}`;
  const urlAccu = `https://www.accuweather.com/en/search-locations?query=${encodeURIComponent(display)}`;
  const urlWcom = `https://weather.com/weather/today/l/${lat},${lon}`;

  const lang = getCurrentLang();
  const jaMode = lang === "ja";
  const text1 = jaMode ? "Google天気で見る" : "View on Google Weather";
  const text2 = jaMode ? "AccuWeatherで見る" : "View on AccuWeather";
  const text3 = jaMode ? "Weather.comで見る" : "View on Weather.com";

  let html = `
    <a class="wd-link" href="${urlGoogle}" target="_blank">${text1}</a>
    <a class="wd-link" href="${urlAccu}" target="_blank">${text2}</a>
    <a class="wd-link" href="${urlWcom}" target="_blank">${text3}</a>
  `;

  // 日本向けリンク（日本の座標範囲で出す）
  if (lat >= 20 && lat <= 46 && lon >= 122 && lon <= 154) {
    html += `
      <hr>
      <a class="wd-link" href="https://www.jma.go.jp/" target="_blank">気象庁</a>
      <a class="wd-link" href="https://tenki.jp/" target="_blank">tenki.jp</a>
      <a class="wd-link" href="https://weather.yahoo.co.jp/weather/" target="_blank">Yahoo天気</a>
      <a class="wd-link" href="https://weathernews.jp/" target="_blank">Weathernews</a>
    `;
  }

  return html;
}

// -------------------------------
// APIカード表示
// -------------------------------
function renderApiCard(id, label, data) {
  const el = qs(id);
  const lang = getCurrentLang();
  const tToday = lang === "ja" ? "今日" : "Today";
  const tTomorrow = lang === "ja" ? "明日" : "Tomorrow";

  el.innerHTML = `
    <h3>${label}</h3>

    <div class="wd-day-block">
      <strong>${tToday}</strong><br>
      ${formatTemp(data.today.tMax)} / ${formatTemp(data.today.tMin)}<br>
      ${lang === "ja" ? "降水" : "Rain"}: ${data.today.rain == null ? "-" : Math.round(data.today.rain) + "%"}<br>
      ${lang === "ja" ? "風" : "Wind"}: ${formatWind(data.today.wind)} ${windDir(data.today.windDir)}
    </div>

    <div class="wd-day-block">
      <strong>${tTomorrow}</strong><br>
      ${formatTemp(data.tomorrow.tMax)} / ${formatTemp(data.tomorrow.tMin)}<br>
      ${lang === "ja" ? "降水" : "Rain"}: ${data.tomorrow.rain == null ? "-" : Math.round(data.tomorrow.rain) + "%"}<br>
      ${lang === "ja" ? "風" : "Wind"}: ${formatWind(data.tomorrow.wind)} ${windDir(data.tomorrow.windDir)}
    </div>
  `;
}

// -------------------------------
// メイン処理
// -------------------------------
async function runSearch(lat, lon, label) {
  qs("#status").textContent = getCurrentLang() === "ja" ? "天気を取得中…" : "Fetching weather data…";
  qs("#results").style.display = "none";
  qs("#diffSummary").style.display = "none";

  const [om, met] = await Promise.all([
    fetchOpenMeteo(lat, lon),
    fetchMetNorway(lat, lon)
  ]);

  if (!om || !met) {
    qs("#status").textContent = getCurrentLang() === "ja" ? "データ取得に失敗しました" : "Failed to fetch data";
    return;
  }

  // カード表示
  renderApiCard("#api1", "Open-Meteo", om);
  renderApiCard("#api2", "MET Norway", met);

  // 差分
  qs("#diffSummary").innerHTML = buildDiffText(om, met);

  // 地点情報
  qs("#locationInfo").style.display = "";
  qs("#locationInfo").innerHTML = `
    <h2>${label}</h2>
    <div>${getCurrentLang() === "ja" ? "緯度" : "Lat"}: ${lat}, 
         ${getCurrentLang() === "ja" ? "経度" : "Lon"}: ${lon}</div>
  `;

  // 外部リンク
  qs("#externalLinks").innerHTML = buildExternalLinks(lat, lon, label);

  qs("#results").style.display = "";
  qs("#diffSummary").style.display = "";
  qs("#status").textContent = "";
}

// -------------------------------
// イベント：住所検索
// -------------------------------
qs("#searchBtn[data-i18n='ja']")?.addEventListener("click", startSearch);
qs("#searchBtn[data-i18n='en']")?.addEventListener("click", startSearch);

async function startSearch() {
  const q = qs("#locationInput").value.trim();
  if (!q) return;

  qs("#status").textContent = getCurrentLang() === "ja" ? "地点を検索中…" : "Searching location…";

  const geo = await fetchGeocode(q);
  if (!geo) {
    qs("#status").textContent = getCurrentLang() === "ja" ? "場所が見つかりません" : "Location not found";
    return;
  }

  runSearch(geo.lat, geo.lon, geo.display);
}

// -------------------------------
// イベント：現在地検索
// -------------------------------
qs("#geoBtn[data-i18n='ja']")?.addEventListener("click", useGeo);
qs("#geoBtn[data-i18n='en']")?.addEventListener("click", useGeo);

function useGeo() {
  const lang = getCurrentLang();
  qs("#status").textContent = lang === "ja" ? "現在地を取得中…" : "Getting location…";

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    // 逆ジオコーディング（大雑把）
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" }
    });
    const data = await res.json();

    const label = data.display_name || (lang === "ja" ? "現在地" : "Current Location");
    runSearch(lat, lon, label);

  }, () => {
    qs("#status").textContent = lang === "ja" ? "位置情報が取得できません" : "Could not get location";
  });
}

