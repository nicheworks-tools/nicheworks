/* ============================================================
   DOM 取得（null防止のため必ず存在する ID のみ）
============================================================ */
const input = document.getElementById("locationInput");
const btnCompare = document.getElementById("btnCompare");
const btnGeo = document.getElementById("btnGeo");
const btnReset = document.getElementById("btnReset"); // resultSection 内
const resultSection = document.getElementById("resultSection");
const progressArea = document.getElementById("progressArea");
const progressText = document.getElementById("progressText");
const errorText = document.getElementById("errorText");
const processTime = document.getElementById("processTime");

/* APIカード用 */
const omIconToday = document.getElementById("omIconToday");
const omIconTomorrow = document.getElementById("omIconTomorrow");
const mnIconToday = document.getElementById("mnIconToday");
const mnIconTomorrow = document.getElementById("mnIconTomorrow");

const omTodayTemp = document.getElementById("omTodayTemp");
const omTodayRain = document.getElementById("omTodayRain");
const omTodayWind = document.getElementById("omTodayWind");

const omTomorrowTemp = document.getElementById("omTomorrowTemp");
const omTomorrowRain = document.getElementById("omTomorrowRain");
const omTomorrowWind = document.getElementById("omTomorrowWind");

const mnTodayTemp = document.getElementById("mnTodayTemp");
const mnTodayRain = document.getElementById("mnTodayRain");
const mnTodayWind = document.getElementById("mnTodayWind");

const mnTomorrowTemp = document.getElementById("mnTomorrowTemp");
const mnTomorrowRain = document.getElementById("mnTomorrowRain");
const mnTomorrowWind = document.getElementById("mnTomorrowWind");

/* diff */
const diffTodayMax = document.getElementById("diffTodayMax");
const diffTodayMin = document.getElementById("diffTodayMin");
const diffTodayRain = document.getElementById("diffTodayRain");
const diffTodayWind = document.getElementById("diffTodayWind");

const diffTomorrowMax = document.getElementById("diffTomorrowMax");
const diffTomorrowMin = document.getElementById("diffTomorrowMin");
const diffTomorrowRain = document.getElementById("diffTomorrowRain");
const diffTomorrowWind = document.getElementById("diffTomorrowWind");

/* ロケーション表示 */
const locName = document.getElementById("locName");
const locMeta = document.getElementById("locMeta");

/* =============================================
   共通ユーティリティ
============================================= */
function showProgress(text) {
  progressArea.classList.remove("hidden");
  progressText.textContent = text;
}

function hideProgress() {
  progressArea.classList.add("hidden");
}

function disableAll() {
  btnCompare.disabled = true;
  btnGeo.disabled = true;
  input.readOnly = true;
}

function enableAll() {
  btnCompare.disabled = false;
  btnGeo.disabled = false;
  input.readOnly = false;
}

function showError(msg) {
  errorText.textContent = msg;
}

function clearErrors() {
  errorText.textContent = "";
}

/* =============================================
   天気アイコン（簡易マップ）
============================================= */
function weatherIcon(code) {
  if (code >= 0 && code <= 3) return "☀️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95 && code <= 99) return "⛈️";
  return "🌡️";
}

/* =============================================
   GEOCODING
============================================= */
async function geocode(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=1&language=ja&format=json`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const r = data.results[0];
  return {
    lat: r.latitude,
    lon: r.longitude,
    name: r.name,
    admin: r.admin1 || "",
    country: r.country || "",
  };
}

/* =============================================
   Open-Meteo API
============================================= */
async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  return {
    today: {
      icon: weatherIcon(data.daily.weathercode[0]),
      tmax: data.daily.temperature_2m_max[0],
      tmin: data.daily.temperature_2m_min[0],
      rain: data.daily.precipitation_sum[0],
      wind: data.daily.windspeed_10m_max[0],
    },
    tomorrow: {
      icon: weatherIcon(data.daily.weathercode[1]),
      tmax: data.daily.temperature_2m_max[1],
      tmin: data.daily.temperature_2m_min[1],
      rain: data.daily.precipitation_sum[1],
      wind: data.daily.windspeed_10m_max[1],
    },
  };
}

/* =============================================
   MET Norway API
============================================= */
async function fetchMET(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "NicheWorks-WeatherDiff" },
  });
  const data = await res.json();

  const t0 = data.properties.timeseries[0].data;
  const t1 = data.properties.timeseries[24].data;

  function extract(d) {
    return {
      icon: "☀️", // MET の天気コードが複雑なので暫定
      tmax: d.instant.details.air_temperature,
      tmin: d.instant.details.air_temperature,
      rain: d.next_1_hours?.details?.precipitation_amount ?? 0,
      wind: d.instant.details.wind_speed,
    };
  }

  return {
    today: extract(t0),
    tomorrow: extract(t1),
  };
}

/* =============================================
   Diff ロジック
============================================= */
function diffValue(a, b, unit = "") {
  const d = (a - b).toFixed(1);
  const sign = d > 0 ? "+" : "";
  return `${sign}${d}${unit}`;
}

/* =============================================
   メイン解析処理
============================================= */
async function runCompare(lat, lon, label) {
  clearErrors();
  showProgress("天気を取得中…");
  disableAll();

  const t0 = performance.now();

  try {
    const [om, mn] = await Promise.all([fetchOpenMeteo(lat, lon), fetchMET(lat, lon)]);

    // 表示
    omIconToday.textContent = om.today.icon;
    omIconTomorrow.textContent = om.tomorrow.icon;
    mnIconToday.textContent = mn.today.icon;
    mnIconTomorrow.textContent = mn.tomorrow.icon;

    omTodayTemp.textContent = `今日: ${om.today.tmax}°C / ${om.today.tmin}°C`;
    omTodayRain.textContent = `降水: ${om.today.rain}mm`;
    omTodayWind.textContent = `風: ${om.today.wind} m/s`;

    omTomorrowTemp.textContent = `明日: ${om.tomorrow.tmax}°C / ${om.tomorrow.tmin}°C`;
    omTomorrowRain.textContent = `降水: ${om.tomorrow.rain}mm`;
    omTomorrowWind.textContent = `風: ${om.tomorrow.wind} m/s`;

    mnTodayTemp.textContent = `今日: ${mn.today.tmax}°C / ${mn.today.tmin}°C`;
    mnTodayRain.textContent = `降水: ${mn.today.rain}mm`;
    mnTodayWind.textContent = `風: ${mn.today.wind} m/s`;

    mnTomorrowTemp.textContent = `明日: ${mn.tomorrow.tmax}°C / ${mn.tomorrow.tmin}°C`;
    mnTomorrowRain.textContent = `降水: ${mn.tomorrow.rain}mm`;
    mnTomorrowWind.textContent = `風: ${mn.tomorrow.wind} m/s`;

    /* Diff（プロ版スタイル） */
    diffTodayMax.textContent = `最大気温: ${diffValue(om.today.tmax, mn.today.tmax, "°C")}`;
    diffTodayMin.textContent = `最小気温: ${diffValue(om.today.tmin, mn.today.tmin, "°C")}`;
    diffTodayRain.textContent = `降水: ${diffValue(om.today.rain, mn.today.rain, "mm")}`;
    diffTodayWind.textContent = `風: ${diffValue(om.today.wind, mn.today.wind, "m/s")}`;

    diffTomorrowMax.textContent = `最大気温: ${diffValue(om.tomorrow.tmax, mn.tomorrow.tmax, "°C")}`;
    diffTomorrowMin.textContent = `最小気温: ${diffValue(om.tomorrow.tmin, mn.tomorrow.tmin, "°C")}`;
    diffTomorrowRain.textContent = `降水: ${diffValue(om.tomorrow.rain, mn.tomorrow.rain, "mm")}`;
    diffTomorrowWind.textContent = `風: ${diffValue(om.tomorrow.wind, mn.tomorrow.wind, "m/s")}`;

    locName.textContent = label;
    locMeta.textContent = `lat ${lat}, lon ${lon}`;

    const elapsed = (performance.now() - t0) / 1000;
    processTime.textContent = `処理時間: 約${elapsed.toFixed(2)}秒`;

    resultSection.classList.remove("hidden");
  } catch (e) {
    showError("天気情報の取得に失敗しました。");
  }

  hideProgress();
  enableAll();
}

/* =============================================
   イベント
============================================= */
btnCompare.addEventListener("click", async () => {
  const q = input.value.trim();
  if (!q) {
    showError("地点を入力してください");
    return;
  }

  clearErrors();
  showProgress("地点を検索中…");
  disableAll();

  const geo = await geocode(q);
  if (!geo) {
    showError("地点が見つかりません");
    hideProgress();
    enableAll();
    return;
  }

  hideProgress();
  await runCompare(geo.lat, geo.lon, `${geo.name}, ${geo.admin} ${geo.country}`);
});

btnGeo.addEventListener("click", () => {
  clearErrors();
  showProgress("現在地を取得中…");
  disableAll();

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      hideProgress();
      await runCompare(latitude, longitude, "現在地");
    },
    () => {
      hideProgress();
      enableAll();
      showError("現在地の取得に失敗しました");
    }
  );
});

btnReset.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  processTime.textContent = "";
});
