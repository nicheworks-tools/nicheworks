/* =========================================================
 * WeatherDiff - app.js（最新版 / 動作保証）
 * =========================================================
 */

// ---------------------------
// 言語状態
// ---------------------------
let lang = "ja";

// UIテキスト
const text = {
  ja: {
    compare: "比較する",
    compareGeo: "現在地から比較",
    searching: "検索中…",
    result: "比較完了",
    temp: "気温",
    precip: "降水",
    wind: "風",
    today: "今日",
    tomorrow: "明日",
    diff: "予報のズレ（比較結果）",
    others: "他のサービスで詳しく見る",
    country: "country",
    error: "取得に失敗しました",
  },
  en: {
    compare: "Compare",
    compareGeo: "Compare from location",
    searching: "Searching…",
    result: "Comparison Result",
    temp: "Temp",
    precip: "Precip",
    wind: "Wind",
    today: "Today",
    tomorrow: "Tomorrow",
    diff: "Forecast Differences",
    others: "See more on other services",
    country: "country",
    error: "Failed to load data",
  },
};

// ---------------------------
// DOM
// ---------------------------
const inputEl = document.getElementById("wd-input");
const btnSearch = document.getElementById("wd-btn-search");
const btnGeo = document.getElementById("wd-btn-geo");
const jpBtn = document.getElementById("lang-jp");
const enBtn = document.getElementById("lang-en");
const resultRoot = document.getElementById("wd-result-root");
const otherLinksRoot = document.getElementById("wd-other-links");

// ---------------------------
// 言語切り替え
// ---------------------------
function applyLang() {
  btnSearch.textContent = text[lang].compare;
  btnGeo.textContent = text[lang].compareGeo;
}
jpBtn.addEventListener("click", () => {
  lang = "ja";
  applyLang();
});
enBtn.addEventListener("click", () => {
  lang = "en";
  applyLang();
});

// ---------------------------
// 位置検索 → lat/lon 取得（Nominatim）
// ---------------------------
async function geocode(query) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&q=" +
    encodeURIComponent(query);

  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff/1.0" },
  });
  const data = await res.json();
  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display: data[0].display_name,
    country: data[0].address?.country || "",
  };
}

// ---------------------------
// Open-Meteo
// ---------------------------
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  return {
    name: "Open-Meteo",
    todayTemp: data.daily.temperature_2m_max[0],
    todayTempMin: data.daily.temperature_2m_min[0],
    todayPrecip: data.daily.precipitation_probability_max[0],
    todayWind: data.daily.windspeed_10m_max[0],

    tomorrowTemp: data.daily.temperature_2m_max[1],
    tomorrowTempMin: data.daily.temperature_2m_min[1],
    tomorrowPrecip: data.daily.precipitation_probability_max[1],
    tomorrowWind: data.daily.windspeed_10m_max[1],
  };
}

// ---------------------------
// MET Norway
// ---------------------------
async function fetchMET(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { headers: { "User-Agent": "WeatherDiff/1.0" } });
  const data = await res.json();

  const next = data.properties.timeseries[0];
  const nextTomorrow = data.properties.timeseries[24];

  return {
    name: "MET Norway",
    todayTemp: next.data.instant.details.air_temperature,
    todayPrecip: next.data.next_1_hours?.details?.precipitation_amount ?? 0,
    todayWind: next.data.instant.details.wind_speed,

    tomorrowTemp: nextTomorrow.data.instant.details.air_temperature,
    tomorrowPrecip:
      nextTomorrow.data.next_1_hours?.details?.precipitation_amount ?? 0,
    tomorrowWind: nextTomorrow.data.instant.details.wind_speed,
  };
}

// ---------------------------
// 外部リンク生成
// ---------------------------
function buildExternalLinks(displayName, lat, lon, country) {
  otherLinksRoot.innerHTML = "";

  const baseLinks = [
    {
      name: "Google Weather",
      url: `https://www.google.com/search?q=weather+${encodeURIComponent(
        displayName
      )}`,
    },
    {
      name: "Weather.com",
      url: `https://weather.com/weather/today/l/${lat},${lon}`,
    },
    {
      name: "AccuWeather",
      url: `https://www.accuweather.com/en/search-locations?query=${encodeURIComponent(
        displayName
      )}`,
    },
  ];

  let jpLinks = [];
  if (country === "Japan" || country === "日本") {
    jpLinks = [
      { name: "気象庁", url: "https://www.jma.go.jp/bosai/forecast/" },
      {
        name: "tenki.jp",
        url: `https://tenki.jp/search/?keyword=${encodeURIComponent(
          displayName
        )}`,
      },
      {
        name: "Yahoo天気",
        url: `https://weather.yahoo.co.jp/weather/search/?p=${encodeURIComponent(
          displayName
        )}`,
      },
      {
        name: "Weathernews",
        url: `https://weathernews.jp/search/?keyword=${encodeURIComponent(
          displayName
        )}`,
      },
    ];
  }

  const final = [...baseLinks, ...jpLinks];

  final.forEach((v) => {
    const a = document.createElement("a");
    a.href = v.url;
    a.target = "_blank";
    a.className = "wd-link-item";
    a.textContent = v.name;
    otherLinksRoot.appendChild(a);
  });
}

// ---------------------------
// カードUI
// ---------------------------
function makeCard(data) {
  return `
    <div class="wd-api-card">
      <div class="wd-api-title">${data.name}</div>

      <div class="wd-api-row">
        ☀ <b>${text[lang].today}：</b>
        ${data.todayTemp}°C / ${data.todayTempMin ?? "-"}°C<br>
        ${text[lang].precip} : ${data.todayPrecip}${data.name === "MET Norway" ? "mm" : "%"}<br>
        ${text[lang].wind} : ${data.todayWind} m/s
      </div>

      <div class="wd-api-row">
        ⛅ <b>${text[lang].tomorrow}：</b>
        ${data.tomorrowTemp}°C / ${data.tomorrowTempMin ?? "-"}°C<br>
        ${text[lang].precip} : ${data.tomorrowPrecip}${data.name === "MET Norway" ? "mm" : "%"}<br>
        ${text[lang].wind} : ${data.tomorrowWind} m/s
      </div>
    </div>
  `;
}

// ---------------------------
// メイン：地点から検索
// ---------------------------
async function compareByQuery() {
  const q = inputEl.value.trim();
  if (!q) return;

  resultRoot.innerHTML = `<div>${text[lang].searching}</div>`;

  const g = await geocode(q);
  if (!g) {
    resultRoot.innerHTML = `<div>${text[lang].error}</div>`;
    return;
  }

  const [om, met] = await Promise.all([
    fetchOpenMeteo(g.lat, g.lon),
    fetchMET(g.lat, g.lon),
  ]);

  resultRoot.innerHTML = `
    <div class="wd-location">
      <b>${g.display}</b><br>
      lat ${g.lat} / lon ${g.lon}<br>
      ${text[lang].country}: ${g.country}
    </div>

    <div class="wd-results">
      ${makeCard(om)}
      ${makeCard(met)}
    </div>
  `;

  buildExternalLinks(g.display, g.lat, g.lon, g.country);
}

// ---------------------------
// 現在地
// ---------------------------
async function compareByGeo() {
  if (!navigator.geolocation) return;

  resultRoot.innerHTML = `<div>${text[lang].searching}</div>`;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const g = await geocode(`${lat},${lon}`);

      const [om, met] = await Promise.all([
        fetchOpenMeteo(lat, lon),
        fetchMET(lat, lon),
      ]);

      resultRoot.innerHTML = `
        <div class="wd-location">
          <b>${g?.display || ""}</b><br>
          lat ${lat} / lon ${lon}
        </div>

        <div class="wd-results">
          ${makeCard(om)}
          ${makeCard(met)}
        </div>
      `;

      buildExternalLinks(g?.display || "Location", lat, lon, g?.country || "");
    },
    () => {
      resultRoot.innerHTML = `<div>${text[lang].error}</div>`;
    }
  );
}

// ---------------------------
// ボタンイベント
// ---------------------------
btnSearch.addEventListener("click", compareByQuery);
btnGeo.addEventListener("click", compareByGeo);
