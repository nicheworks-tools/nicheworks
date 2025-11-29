// =========================
// i18n
// =========================
const i18n = {
  ja: {
    inputLabel: "地点を入力",
    compare: "比較",
    geo: "現在地から比較",
    searching: "地点を検索中…",
    loadingWeather: "天気を取得中…",
    today: "今日",
    tomorrow: "明日",
  },
  en: {
    inputLabel: "Enter location",
    compare: "Compare",
    geo: "Use current location",
    searching: "Searching location…",
    loadingWeather: "Fetching weather…",
    today: "Today",
    tomorrow: "Tomorrow",
  }
};

let lang = "ja";

function setLang(l) {
  lang = l;
  document.getElementById("label-input").textContent = i18n[l].inputLabel;
  document.getElementById("searchBtn").textContent = i18n[l].compare;
  document.getElementById("geoBtn").textContent = i18n[l].geo;
}


// =========================
// DOMContentLoaded
// =========================
document.addEventListener("DOMContentLoaded", () => {

  // 言語切替
  document.getElementById("btn-ja").addEventListener("click", () => setLang("ja"));
  document.getElementById("btn-en").addEventListener("click", () => setLang("en"));
  setLang("ja");


  // =========================
  // 検索ボタンクリック
  // =========================
  document.getElementById("searchBtn").addEventListener("click", async () => {
    const q = document.getElementById("searchInput").value.trim();
    if (!q) return;

    try {
      document.getElementById("status").textContent = i18n[lang].searching;

      const g = await geocode(q);
      await run(g.lat, g.lon, g.display);

    } catch (e) {
      document.getElementById("status").textContent = "地点が見つかりません。";
    }
  });


  // =========================
  // 現在地ボタンクリック
  // =========================
  document.getElementById("geoBtn").addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      document.getElementById("status").textContent = i18n[lang].loadingWeather;

      // reverse geocode
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const r = await fetch(url);
      const d = await r.json();

      const name = d.display_name || `${lat.toFixed(2)},${lon.toFixed(2)}`;
      await run(lat, lon, name);

    }, () => {
      document.getElementById("status").textContent = "位置情報が取得できません。";
    });

  });

});


// =========================
// 住所 → 緯度経度
// =========================
async function geocode(q) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data || data.length === 0) throw new Error("not found");

  const item = data[0];

  return {
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display: item.display_name
  };
}


// =========================
// Open-Meteo
// =========================
async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const res = await fetch(url);
  const d = await res.json();

  return {
    today: {
      tmax: d.daily.temperature_2m_max[0],
      tmin: d.daily.temperature_2m_min[0],
      pop: d.daily.precipitation_probability_max[0],
      wind: d.daily.wind_speed_10m_max[0]
    },
    tomorrow: {
      tmax: d.daily.temperature_2m_max[1],
      tmin: d.daily.temperature_2m_min[1],
      pop: d.daily.precipitation_probability_max[1],
      wind: d.daily.wind_speed_10m_max[1]
    }
  };
}


// =========================
// MET Norway
// =========================
async function fetchMET(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherDiff/1.0" }
  });
  const d = await res.json();

  const t0 = d.properties.timeseries[0];
  const t1 = d.properties.timeseries[24];

  function ext(item) {
    return {
      tmax: item.data.instant.details.air_temperature,
      tmin: item.data.instant.details.air_temperature,
      pop: item.data.instant.details.probability_of_precipitation || 0,
      wind: item.data.instant.details.wind_speed
    };
  }

  return {
    today: ext(t0),
    tomorrow: ext(t1)
  };
}


// =========================
// 差分
// =========================
function calcDiff(a, b) {
  const diff = {
    tmax: Math.abs(a.tmax - b.tmax),
    tmin: Math.abs(a.tmin - b.tmin),
    pop: Math.abs(a.pop - b.pop),
    wind: Math.abs(a.wind - b.wind)
  };

  let c = "";
  c += `最高気温：${Math.min(a.tmax, b.tmax)}〜${Math.max(a.tmax, b.tmax)}℃（差${diff.tmax}℃）<br>`;
  c += `降水：${Math.min(a.pop, b.pop)}〜${Math.max(a.pop, b.pop)}%（差${diff.pop}%）<br>`;
  c += `風速：${Math.min(a.wind, b.wind)}〜${Math.max(a.wind, b.wind)} m/s（差${diff.wind})`;

  return c;
}


// =========================
// 外部リンク生成
// =========================
function buildLinks(countryCode, name, lat, lon) {
  const list = [];

  // 全世界共通3種
  list.push({
    label: "Google Weather",
    url: `https://www.google.com/search?q=weather+${encodeURIComponent(name)}`
  });
  list.push({
    label: "Weather.com",
    url: `https://weather.com/weather/today/l/${lat},${lon}`
  });
  list.push({
    label: "AccuWeather",
    url: `https://www.accuweather.com/en/search-locations?query=${encodeURIComponent(name)}`
  });

  // 日本
  if (countryCode === "jp" || countryCode === "JP") {
    list.push({ label: "気象庁", url: "https://www.jma.go.jp/bosai/forecast/" });
    list.push({ label: "tenki.jp", url: "https://tenki.jp/" });
    list.push({ label: "Yahoo天気", url: "https://weather.yahoo.co.jp/weather/" });
    list.push({ label: "Weathernews", url: "https://weathernews.jp/" });
  }

  const grid = document.getElementById("linksGrid");
  grid.innerHTML = "";

  list.forEach(it => {
    const a = document.createElement("a");
    a.href = it.url;
    a.target = "_blank";
    a.textContent = it.label;
    grid.appendChild(a);
  });
}


// =========================
// メイン処理
// =========================
async function run(lat, lon, name) {
  document.getElementById("status").textContent = i18n[lang].loadingWeather;

  const [om, no] = await Promise.all([
    fetchOpenMeteo(lat, lon),
    fetchMET(lat, lon)
  ]);

  document.getElementById("status").textContent = "";

  document.getElementById("locName").textContent = name;
  document.getElementById("locCoord").textContent =
    `lat ${lat.toFixed(2)} / lon ${lon.toFixed(2)}`;

  document.getElementById("locTz").textContent = "";

  // OM
  document.getElementById("omToday").innerHTML =
    `${i18n[lang].today}：${om.today.tmax}℃ / ${om.today.tmin}℃<br>降水：${om.today.pop}%<br>風：${om.today.wind} m/s`;

  document.getElementById("omTomorrow").innerHTML =
    `${i18n[lang].tomorrow}：${om.tomorrow.tmax}℃ / ${om.tomorrow.tmin}℃<br>降水：${om.tomorrow.pop}%<br>風：${om.tomorrow.wind} m/s`;

  // MET
  document.getElementById("noToday").innerHTML =
    `${i18n[lang].today}：${no.today.tmax}℃ / ${no.today.tmin}℃<br>降水：${no.today.pop}%<br>風：${no.today.wind} m/s`;

  document.getElementById("noTomorrow").innerHTML =
    `${i18n[lang].tomorrow}：${no.tomorrow.tmax}℃ / ${no.tomorrow.tmin}℃<br>降水：${no.tomorrow.pop}%<br>風：${no.tomorrow.wind} m/s`;

  // 差分
  const diff = calcDiff(om.today, no.today);
  document.getElementById("diffSummary").innerHTML = diff;

  // 国推定（超簡易）
  const cc =
    name.toLowerCase().includes("japan") ||
    name.includes("日本") ||
    name.includes("Japan")
      ? "jp"
      : "xx";

  buildLinks(cc, name, lat, lon);

  document.getElementById("resultSection").classList.remove("hidden");
}
