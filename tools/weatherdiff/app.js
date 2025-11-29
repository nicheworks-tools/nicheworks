/* ============================================================
   WeatherDiff MVP - app.js
   - 住所検索 → 緯度経度（Nominatim）
   - 現在地取得 → 逆ジオコーディング
   - Open-Meteo / MET Norway
   - 今日 & 明日の比較
   - 予報のズレ算出
   - 外部リンク：Google / Weather.com / AccuWeather
   - 国別：日本（気象庁）＋ アメリカ（NWS）
   - JP / EN 切替
============================================================ */

/* =============================
   DOM
============================= */
const inputEl = document.getElementById("wd-input");
const searchBtn = document.getElementById("wd-search-btn");
const geoBtn = document.getElementById("wd-geo-btn");

const statusBox = document.getElementById("wd-status");
const locationBox = document.getElementById("wd-location");
const resultsBox = document.getElementById("wd-results");
const diffBox = document.getElementById("wd-diff");
const linksGrid = document.getElementById("wd-links-grid");

const omContent = document.getElementById("wd-om-content");
const metContent = document.getElementById("wd-met-content");

/* =============================
   言語管理
============================= */
let LANG = "ja";

const text = {
  ja: {
    searching: "地点を検索中…",
    fetching: "天気を取得中…",
    done: "比較完了",
    noResult: "地点が見つかりませんでした。",
    today: "今日",
    tomorrow: "明日",
    diffTitle: "予報のズレ（比較結果）",
    temp: "気温",
    rain: "降水",
    wind: "風",
    almostSame: "ほぼ一致",
    slightDiff: "やや差あり",
    largeDiff: "大きな差あり",
    jpSites: "日本向け天気サイト",
    usSites: "アメリカの公式気象サービス（NWS）",
  },
  en: {
    searching: "Searching location…",
    fetching: "Fetching weather data…",
    done: "Done!",
    noResult: "Location not found.",
    today: "Today",
    tomorrow: "Tomorrow",
    diffTitle: "Forecast Differences",
    temp: "Temperature",
    rain: "Precipitation",
    wind: "Wind",
    almostSame: "Almost same",
    slightDiff: "Slight difference",
    largeDiff: "Large difference",
    jpSites: "Japan Local Sites",
    usSites: "US Official Weather (NWS)",
  },
};

document.querySelectorAll(".wd-lang button").forEach((b) => {
  b.addEventListener("click", () => {
    LANG = b.dataset.lang;
    runSearch(); // 言語切替後も結果を更新
  });
});

/* =============================
   ユーティリティ
============================= */

// シンプルな天気アイコン（Open-Meteo の "weathercode" 使用）
function iconFromCode(code) {
  if ([0].includes(code)) return "☀";
  if ([1, 2].includes(code)) return "🌤";
  if ([3].includes(code)) return "☁";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄";
  if ([95, 96, 99].includes(code)) return "⛈";
  return "☁";
}

// Nominatimで住所→緯度経度
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}`;
  const r = await fetch(url);
  const data = await r.json();
  if (data.length === 0) return null;

  const d = data[0];
  return {
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
    display: d.display_name,
    country: d.address?.country_code?.toUpperCase() || "",
  };
}

// 緯度経度→逆ジオコーディング
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const r = await fetch(url);
  const d = await r.json();
  return {
    display: d.display_name,
    country: d.address?.country_code?.toUpperCase() || "",
  };
}

/* =============================
   天気API - Open-Meteo
============================= */
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&windspeed_unit=ms&timezone=auto`;

  const r = await fetch(url);
  return await r.json();
}

/* =============================
   天気API - MET Norway
============================= */
async function fetchMET(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const r = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff (nicheworks)" },
  });
  return await r.json();
}

/* =============================
   MET → 今日/明日の簡易抽出
============================= */
function extractMET(data) {
  const timeseries = data.properties.timeseries;
  if (!timeseries) return null;

  const today = timeseries[0];
  const tomorrow = timeseries.find((t) =>
    t.time.includes("T12") // ざっくり 12:00 想定
  );

  return {
    today: {
      temp: today.data.instant.details.air_temperature,
      rain: today.data.next_6_hours?.details?.precipitation_amount || 0,
      wind: today.data.instant.details.wind_speed,
      code: today.data.next_1_hours?.summary?.symbol_code || "",
    },
    tomorrow: {
      temp: tomorrow?.data.instant.details.air_temperature || null,
      rain: tomorrow?.data.next_6_hours?.details?.precipitation_amount || 0,
      wind: tomorrow?.data.instant.details.wind_speed || null,
      code: tomorrow?.data.next_1_hours?.summary?.symbol_code || "",
    },
  };
}

/* =============================
   差分判定
============================= */
function diffValue(a, b) {
  const d = Math.abs(a - b);
  if (d <= 1) return text[LANG].almostSame;
  if (d <= 3) return text[LANG].slightDiff;
  return text[LANG].largeDiff;
}

/* =============================
   外部リンク生成
============================= */
function buildLinks(lat, lon, country) {
  const links = [];

  // 1) 共通3種
  links.push({
    name: "Google Weather",
    url: `https://www.google.com/search?q=weather+${lat},${lon}`,
  });

  links.push({
    name: "Weather.com",
    url: `https://weather.com/weather/today/l/${lat},${lon}`,
  });

  links.push({
    name: "AccuWeather",
    url: `https://www.accuweather.com/en/search-locations?query=${lat},${lon}`,
  });

  // 2) 日本
  if (country === "JP") {
    links.push({
      name: "気象庁",
      url: `https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=130000`,
    });
    links.push({
      name: "tenki.jp（検索）",
      url: `https://tenki.jp/search/?keyword=${lat},${lon}`,
    });
    links.push({
      name: "Yahoo天気（検索）",
      url: `https://weather.yahoo.co.jp/weather/search/?p=${lat},${lon}`,
    });
    links.push({
      name: "Weathernews（検索）",
      url: `https://weathernews.jp/search/?keyword=${lat},${lon}`,
    });
  }

  // 3) アメリカ（NWS）
  if (country === "US") {
    links.push({
      name: "NWS / NOAA（ポイント）",
      url: `https://api.weather.gov/points/${lat},${lon}`,
    });
  }

  linksGrid.innerHTML = links
    .map(
      (l) =>
        `<a class="wd-link" href="${l.url}" target="_blank" rel="noopener noreferrer">${l.name}</a>`
    )
    .join("");
}

/* =============================
   メイン処理
============================= */
async function runSearch(coord) {
  const query = inputEl.value.trim();

  // 引数に lat/lon があれば直接使う（現在地対応）
  let lat, lon, display, country;

  statusBox.textContent = text[LANG].searching;

  if (coord) {
    lat = coord.lat;
    lon = coord.lon;
    const rev = await reverseGeocode(lat, lon);
    display = rev.display;
    country = rev.country;
  } else {
    if (!query) return;

    const g = await geocode(query);
    if (!g) {
      statusBox.textContent = text[LANG].noResult;
      return;
    }
    lat = g.lat;
    lon = g.lon;
    display = g.display;
    country = g.country;
  }

  // 地点情報表示
  locationBox.style.display = "block";
  locationBox.innerHTML = `
    <strong>${display}</strong><br>
    lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}<br>
    country: ${country}
  `;

  statusBox.textContent = text[LANG].fetching;

  // API fetch
  const om = await fetchOpenMeteo(lat, lon);
  const met = await fetchMET(lat, lon);
  const metExt = extractMET(met);

  // Open-Meteo（今日/明日）
  const omToday = {
    max: om.daily.temperature_2m_max[0],
    min: om.daily.temperature_2m_min[0],
    rain: om.daily.precipitation_probability_max[0],
    code: om.daily.weathercode[0],
  };
  const omTomorrow = {
    max: om.daily.temperature_2m_max[1],
    min: om.daily.temperature_2m_min[1],
    rain: om.daily.precipitation_probability_max[1],
    code: om.daily.weathercode[1],
  };

  omContent.innerHTML = `
    ${iconFromCode(omToday.code)} ${text[LANG].today}：${omToday.max}℃ / ${omToday.min}℃<br>
    降水：${omToday.rain}%<br>
    風：-<br><br>
    ${iconFromCode(omTomorrow.code)} ${text[LANG].tomorrow}：${omTomorrow.max}℃ / ${omTomorrow.min}℃<br>
    降水：${omTomorrow.rain}%<br>
  `;

  // MET Norway
  metContent.innerHTML = `
    ${text[LANG].today}：${metExt.today.temp}℃<br>
    降水：${metExt.today.rain}mm<br>
    風：${metExt.today.wind} m/s<br><br>
    ${text[LANG].tomorrow}：${metExt.tomorrow.temp}℃<br>
    降水：${metExt.tomorrow.rain}mm<br>
    風：${metExt.tomorrow.wind} m/s<br>
  `;

  resultsBox.style.display = "flex";

  // 差分
  const diffTemp = diffValue(omToday.max, metExt.today.temp);
  const diffRain = diffValue(omToday.rain, metExt.today.rain);
  const diffWind = diffValue(0, metExt.today.wind); // Open-Meteoに風速ないので簡易

  diffBox.style.display = "block";
  diffBox.innerHTML = `
    <strong>${text[LANG].diffTitle}</strong><br><br>
    ・${text[LANG].temp}：${diffTemp}<br>
    ・${text[LANG].rain}：${diffRain}<br>
    ・${text[LANG].wind}：${diffWind}<br>
  `;

  // 外部リンク生成
  buildLinks(lat, lon, country);

  statusBox.textContent = text[LANG].done;
}

/* =============================
   ボタン処理
============================= */
searchBtn.addEventListener("click", () => runSearch());

geoBtn.addEventListener("click", () => {
  statusBox.textContent = "位置情報取得中…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      runSearch({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    },
    () => {
      statusBox.textContent = "位置情報が取得できませんでした。";
    }
  );
});
