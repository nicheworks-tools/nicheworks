/* WeatherDiff finalized app core */
(() => {
  const LANG_KEY = "nw_lang";
  const LEGACY_LANG_KEY = "weatherdiffLang";

  const $ = (id) => document.getElementById(id);
  const els = {};

  const I18N = {
    ja: {
      subtitle: "天気予報の比較ツール",
      introLead: "このツールは、日本国内の地点を対象に複数の天気APIの予報差分を参考比較するツールです。",
      usageLinkText: "くわしい使い方はこちら →",
      labelLocation: "地点を入力",
      placeholder: "東京都千代田区 / 渋谷 / 札幌",
      btnCompare: "比較",
      btnGeo: "現在地検索",
      btnReset: "リセット",
      progressDefault: "処理中...",
      progressSearch: "地点を確認中…",
      progressOpenMeteo: "Open-Meteo 取得中…",
      progressMet: "MET Norway 取得中…",
      errorHttpsRequired: "現在地取得にはHTTPSが必要です。地点名を入力してください。",
      errorNoGeo: "現在地を取得できません。地点名を入力してください。",
      errorDenied: "位置情報が許可されませんでした。地点名を入力してください。",
      errorNotFound: "地点が見つかりません。日本国内の地点名を入力してください。",
      errorOpenMeteo: "Open-Meteo の予報を取得できませんでした。時間をおいて再試行してください。",
      errorMetNorway: "MET Norway の予報を取得できませんでした。時間をおいて再試行してください。",
      errorGeneric: "処理中にエラーが発生しました。",
      warnText: "この結果は複数の天気API比較に基づく参考情報です。防災、避難判断、警報、交通判断、業務判断には使わず、公式情報を確認してください。",
      tempNote: "※最低気温など一部の値はAPI仕様上、比較精度が下がる場合があります。",
      diffTitle: "予報のズレ（比較結果）",
      dayToday: "今日",
      dayTomorrow: "明日",
      high: "最高",
      low: "最低",
      rainLabel: "降水",
      windLabel: "風",
      diffLabelMax: "最高気温",
      diffLabelMin: "最低気温",
      diffLabelRain: "降水",
      diffLabelWind: "風",
      diffNoteText: "※ 予報差分はAPIごとの更新タイミング、集計方法、単位変換により変わります。",
      diffNoteLink: "使い方ページで注意点を見る。",
      otherServicesTitle: "他のサービスで詳しく見る",
      accuWeatherNote: "※ AccuWeather は英語の都市名検索のため、日本の一部地域では正しく表示されない場合があります。",
      donateMsg: "このツールが役に立ったら、寄付で応援していただけると嬉しいです。",
      currentLocation: "現在地",
      processTime: "処理時間：約{sec}秒",
      resetDone: "入力と結果をリセットしました。",
      locationUnknown: "場所名を取得できませんでした。",
      nearby: "付近",
      links: {
        google: "Google Weather",
        weatherCom: "Weather.com",
        accuweather: "AccuWeather",
        jma: "気象庁",
        tenki: "tenki.jp",
        yahoo: "Yahoo天気",
      },
    },
    en: {
      subtitle: "Weather forecast comparison tool",
      introLead: "A reference tool for comparing weather API forecast differences for locations in Japan.",
      usageLinkText: "See full guide →",
      labelLocation: "Enter a location in Japan",
      placeholder: "Chiba / Shibuya / Sapporo",
      btnCompare: "Compare",
      btnGeo: "Use my location",
      btnReset: "Reset",
      progressDefault: "Processing...",
      progressSearch: "Checking location...",
      progressOpenMeteo: "Fetching Open-Meteo...",
      progressMet: "Fetching MET Norway...",
      errorHttpsRequired: "Using current location requires HTTPS. Please enter a location name instead.",
      errorNoGeo: "Geolocation is unavailable. Please enter a location name instead.",
      errorDenied: "Location permission was denied. Please enter a location name instead.",
      errorNotFound: "No location found. Please enter a location in Japan.",
      errorOpenMeteo: "Could not fetch the Open-Meteo forecast. Please try again later.",
      errorMetNorway: "Could not fetch the MET Norway forecast. Please try again later.",
      errorGeneric: "An error occurred while processing.",
      warnText: "These results are reference comparisons across weather APIs. Do not use them for disaster, evacuation, warning, transport, or business-critical decisions. Check official sources.",
      tempNote: "* Some values, including low temperature, may be less comparable due to API differences.",
      diffTitle: "Forecast difference",
      dayToday: "Today",
      dayTomorrow: "Tomorrow",
      high: "High",
      low: "Low",
      rainLabel: "Precipitation",
      windLabel: "Wind",
      diffLabelMax: "High temp",
      diffLabelMin: "Low temp",
      diffLabelRain: "Precipitation",
      diffLabelWind: "Wind",
      diffNoteText: "* Differences vary by API update timing, aggregation method, and unit conversion.",
      diffNoteLink: "Read the usage notes.",
      otherServicesTitle: "Check details on other services",
      accuWeatherNote: "* AccuWeather search uses English city names and may not detect some areas in Japan.",
      donateMsg: "If this tool helps you, please consider supporting it with a small donation.",
      currentLocation: "Current location",
      processTime: "Processing time: about {sec} sec",
      resetDone: "Input and results were reset.",
      locationUnknown: "Could not retrieve a place name.",
      nearby: "nearby",
      links: {
        google: "Google Weather",
        weatherCom: "Weather.com",
        accuweather: "AccuWeather",
        jma: "Japan Meteorological Agency",
        tenki: "tenki.jp",
        yahoo: "Yahoo! Weather Japan",
      },
    },
  };

  let currentLang = "ja";
  let lastOpenMeteo = null;
  let lastMetNorway = null;

  document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initLanguage();
    initUI();
    bindEvents();
    hardenExternalLinks();
  });

  function cacheElements() {
    [
      "locationInput", "btnCompare", "btnGeo", "btnReset", "langJP", "langEN",
      "subtitle", "introLead", "usageLink", "labelLocation", "progressText",
      "errorText", "resultSection", "progressArea", "locName", "locMeta",
      "processTime", "warnText", "omIconToday", "omTodayTemp", "omTodayRain",
      "omTodayWind", "omDayToday", "omIconTomorrow", "omTomorrowTemp",
      "omTomorrowRain", "omTomorrowWind", "omDayTomorrow", "mnIconToday",
      "mnTodayTemp", "mnTodayRain", "mnTodayWind", "mnDayToday", "mnIconTomorrow",
      "mnTomorrowTemp", "mnTomorrowRain", "mnTomorrowWind", "mnDayTomorrow", "tempNote",
      "diffTodayMax", "diffTodayMin", "diffTodayRain", "diffTodayWind",
      "diffTomorrowMax", "diffTomorrowMin", "diffTomorrowRain", "diffTomorrowWind",
      "diffNote", "diffTitle", "diffTodayHeading", "diffTomorrowHeading",
      "otherServicesTitle", "linkGoogleWeather", "linkWeatherCom", "linkAccuWeather",
      "linkJma", "linkTenki", "linkYahoo", "donateMsg"
    ].forEach((id) => { els[id] = $(id); });

    const linksGrid = els.linkGoogleWeather?.parentElement;
    if (linksGrid && linksGrid.parentElement && !$("accuWeatherNote")) {
      const note = document.createElement("small");
      note.id = "accuWeatherNote";
      linksGrid.insertAdjacentElement("afterend", note);
    }
    els.accuWeatherNote = $("accuWeatherNote");
  }

  function t(key) {
    return I18N[currentLang][key] || I18N.ja[key] || "";
  }

  function usageHref() {
    return currentLang === "en" ? "/tools/weatherdiff/en/usage.html" : "/tools/weatherdiff/usage.html";
  }

  function initLanguage() {
    const saved = localStorage.getItem(LANG_KEY) || localStorage.getItem(LEGACY_LANG_KEY) || document.documentElement.lang || "ja";
    applyLanguage(saved === "en" ? "en" : "ja");
  }

  function applyLanguage(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    localStorage.setItem(LANG_KEY, currentLang);
    localStorage.removeItem(LEGACY_LANG_KEY);
    document.documentElement.lang = currentLang;

    els.langJP?.classList.toggle("is-active", currentLang === "ja");
    els.langEN?.classList.toggle("is-active", currentLang === "en");

    setText(els.subtitle, t("subtitle"));
    setText(els.introLead, t("introLead"));
    setText(els.usageLink, t("usageLinkText"));
    if (els.usageLink) els.usageLink.href = usageHref();
    setText(els.labelLocation, t("labelLocation"));
    if (els.locationInput) els.locationInput.placeholder = t("placeholder");
    setText(els.btnCompare, t("btnCompare"));
    setText(els.btnGeo, t("btnGeo"));
    setText(els.btnReset, t("btnReset"));
    setText(els.progressText, t("progressDefault"));
    setText(els.warnText, t("warnText"));
    setText(els.omDayToday, t("dayToday"));
    setText(els.omDayTomorrow, t("dayTomorrow"));
    setText(els.mnDayToday, t("dayToday"));
    setText(els.mnDayTomorrow, t("dayTomorrow"));
    setText(els.tempNote, t("tempNote"));
    setText(els.diffTitle, t("diffTitle"));
    setText(els.diffTodayHeading, t("dayToday"));
    setText(els.diffTomorrowHeading, t("dayTomorrow"));
    renderDiffNote();
    setText(els.otherServicesTitle, t("otherServicesTitle"));
    setText(els.accuWeatherNote, t("accuWeatherNote"));
    setText(els.linkGoogleWeather, t("links").google);
    setText(els.linkWeatherCom, t("links").weatherCom);
    setText(els.linkAccuWeather, t("links").accuweather);
    setText(els.linkJma, t("links").jma);
    setText(els.linkTenki, t("links").tenki);
    setText(els.linkYahoo, t("links").yahoo);
    setText(els.donateMsg, t("donateMsg"));

    if (lastOpenMeteo && lastMetNorway) {
      applyWeatherCards(lastOpenMeteo, lastMetNorway);
      applyDiff(lastOpenMeteo, lastMetNorway);
    }
    hardenExternalLinks();
  }

  function initUI() {
    if (els.btnCompare) els.btnCompare.disabled = true;
    hide(els.progressArea);
    hide(els.resultSection);
  }

  function bindEvents() {
    els.btnCompare?.addEventListener("click", searchByInput);
    els.btnGeo?.addEventListener("click", searchByGeolocation);
    els.btnReset?.addEventListener("click", resetAll);
    els.langJP?.addEventListener("click", () => applyLanguage("ja"));
    els.langEN?.addEventListener("click", () => applyLanguage("en"));
    els.locationInput?.addEventListener("input", () => {
      if (els.btnCompare) els.btnCompare.disabled = els.locationInput.value.trim() === "";
    });
  }

  async function searchByInput() {
    const query = els.locationInput?.value.trim() || "";
    if (!query) return;
    await runFullProcess({ query });
  }

  async function searchByGeolocation() {
    clearError();
    hide(els.resultSection);

    if (location.protocol !== "https:") {
      showError(t("errorHttpsRequired"));
      return;
    }
    if (!navigator.geolocation) {
      showError(t("errorNoGeo"));
      return;
    }

    setProgress(t("progressSearch"));
    try {
      const pos = await getCurrentPosition();
      await runFullProcess({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    } catch (error) {
      hide(els.progressArea);
      showError(error?.code === 1 ? t("errorDenied") : t("errorNoGeo"));
    }
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  }

  async function runFullProcess(params) {
    clearError();
    lockUI();
    hide(els.resultSection);
    setProgress(t("progressSearch"));
    const start = performance.now();

    try {
      const resolved = await resolveLocation(params);
      const { lat, lon } = resolved;
      let displayName = resolved.displayName || "";
      let addressObj = resolved.address || {};

      if (!params.query) {
        const reverseAddress = await reverseGeocode(lat, lon).catch(() => null);
        if (reverseAddress?.displayName) {
          displayName = currentLang === "ja" ? `${reverseAddress.displayName}${t("nearby")}` : `${reverseAddress.displayName} ${t("nearby")}`;
          addressObj = reverseAddress.address || {};
        }
      }

      setText(els.locName, displayName || t("currentLocation"));
      renderLocationMeta(lat, lon, resolved.countryName || addressObj.country || "", params.query ? null : displayName);

      setProgress(t("progressOpenMeteo"));
      const om = await fetchOpenMeteo(lat, lon);
      setProgress(t("progressMet"));
      const mn = await fetchMetNorway(lat, lon, om.utcOffset);

      lastOpenMeteo = om;
      lastMetNorway = mn;
      applyWeatherCards(om, mn);
      applyDiff(om, mn);
      applyExternalLinks(lat, lon, displayName, addressObj);
      setText(els.processTime, t("processTime").replace("{sec}", ((performance.now() - start) / 1000).toFixed(2)));
      show(els.resultSection);
    } catch (error) {
      showError(error?.message || t("errorGeneric"));
    } finally {
      hide(els.progressArea);
      unlockUI();
    }
  }

  async function resolveLocation(params) {
    if (!params.query) {
      return { lat: Number(params.lat), lon: Number(params.lon), displayName: "", countryName: "", address: {} };
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(params.query)}&addressdetails=1&accept-language=ja,en&limit=3&countrycodes=jp`;
    let res;
    try {
      res = await fetch(url);
    } catch (error) {
      throw new Error(t("errorNotFound"));
    }
    if (!res.ok) throw new Error(t("errorNotFound"));
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error(t("errorNotFound"));
    const first = data[0];
    return {
      lat: Number(first.lat),
      lon: Number(first.lon),
      displayName: first.display_name || params.query,
      countryName: first.address?.country || "",
      address: first.address || {},
    };
  }

  async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&accept-language=ja&zoom=14&addressdetails=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;
    return { displayName: data.display_name || "", address: data.address || {} };
  }

  async function fetchOpenMeteo(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(t("errorOpenMeteo"));
    const d = await res.json();
    const daily = d.daily;
    if (!daily?.temperature_2m_max?.length) throw new Error(t("errorOpenMeteo"));
    return {
      utcOffset: Number(d.utc_offset_seconds || 0),
      today: makeOpenMeteoDay(daily, 0),
      tomorrow: makeOpenMeteoDay(daily, 1),
    };
  }

  function makeOpenMeteoDay(daily, index) {
    return {
      max: round1(daily.temperature_2m_max?.[index]),
      min: round1(daily.temperature_2m_min?.[index]),
      rain: round1(daily.precipitation_sum?.[index]),
      wind: round1(kmhToMs(daily.wind_speed_10m_max?.[index])),
      icon: codeToIcon(daily.weathercode?.[index]),
    };
  }

  async function fetchMetNorway(lat, lon, offsetSec) {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, { headers: { "User-Agent": "WeatherDiff NicheWorks" } });
    if (!res.ok) throw new Error(t("errorMetNorway"));
    const data = await res.json();
    const series = data?.properties?.timeseries;
    if (!Array.isArray(series) || !series.length) throw new Error(t("errorMetNorway"));

    const blocks = splitMetBlocks(series, offsetSec || 0);
    return {
      today: calcMetDay(blocks.today),
      tomorrow: calcMetDay(blocks.tomorrow),
    };
  }

  function splitMetBlocks(series, offsetSec) {
    const toLocal = (date) => new Date(date.getTime() + offsetSec * 1000);
    const nowLocal = toLocal(new Date());
    const dayStart = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate());
    const tomorrowStart = new Date(dayStart.getTime() + 24 * 3600 * 1000);
    const tomorrowEnd = new Date(dayStart.getTime() + 48 * 3600 * 1000);
    return {
      today: series.filter((item) => {
        const d = toLocal(new Date(item.time));
        return d >= dayStart && d < tomorrowStart;
      }),
      tomorrow: series.filter((item) => {
        const d = toLocal(new Date(item.time));
        return d >= tomorrowStart && d < tomorrowEnd;
      }),
    };
  }

  function calcMetDay(block) {
    if (!Array.isArray(block) || block.length === 0) return { max: null, min: null, rain: 0, wind: 0, icon: "☁️" };
    const temps = block.map((item) => item.data?.instant?.details?.air_temperature).filter(isFiniteNumber);
    const rains = block.map((item) => item.data?.next_1_hours?.details?.precipitation_amount ?? item.data?.next_6_hours?.details?.precipitation_amount ?? 0).filter(isFiniteNumber);
    const winds = block.map((item) => item.data?.instant?.details?.wind_speed ?? 0).filter(isFiniteNumber);
    const symbol = block[0]?.data?.next_6_hours?.summary?.symbol_code || block[0]?.data?.next_1_hours?.summary?.symbol_code || "";
    return {
      max: temps.length ? round1(Math.max(...temps)) : null,
      min: temps.length ? round1(Math.min(...temps)) : null,
      rain: round1(rains.reduce((a, b) => a + b, 0)),
      wind: winds.length ? round1(Math.max(...winds)) : 0,
      icon: mapMetSymbolToIcon(symbol),
    };
  }

  function applyWeatherCards(om, mn) {
    setText(els.omIconToday, om.today.icon);
    renderTempBlock(els.omTodayTemp, om.today.max, om.today.min);
    setText(els.omTodayRain, `${t("rainLabel")}: ${formatValue(om.today.rain)}mm`);
    setText(els.omTodayWind, `${t("windLabel")}: ${formatValue(om.today.wind)} m/s`);
    setText(els.omIconTomorrow, om.tomorrow.icon);
    renderTempBlock(els.omTomorrowTemp, om.tomorrow.max, om.tomorrow.min);
    setText(els.omTomorrowRain, `${t("rainLabel")}: ${formatValue(om.tomorrow.rain)}mm`);
    setText(els.omTomorrowWind, `${t("windLabel")}: ${formatValue(om.tomorrow.wind)} m/s`);

    setText(els.mnIconToday, mn.today.icon);
    renderTempBlock(els.mnTodayTemp, mn.today.max, mn.today.min);
    setText(els.mnTodayRain, `${t("rainLabel")}: ${formatValue(mn.today.rain)}mm`);
    setText(els.mnTodayWind, `${t("windLabel")}: ${formatValue(mn.today.wind)} m/s`);
    setText(els.mnIconTomorrow, mn.tomorrow.icon);
    renderTempBlock(els.mnTomorrowTemp, mn.tomorrow.max, mn.tomorrow.min);
    setText(els.mnTomorrowRain, `${t("rainLabel")}: ${formatValue(mn.tomorrow.rain)}mm`);
    setText(els.mnTomorrowWind, `${t("windLabel")}: ${formatValue(mn.tomorrow.wind)} m/s`);
  }

  function applyDiff(om, mn) {
    applyOneDiff(els.diffTodayMax, t("diffLabelMax"), om.today.max, mn.today.max, "°C");
    applyOneDiff(els.diffTodayMin, t("diffLabelMin"), om.today.min, mn.today.min, "°C");
    applyOneDiff(els.diffTodayRain, t("diffLabelRain"), om.today.rain, mn.today.rain, "mm");
    applyOneDiff(els.diffTodayWind, t("diffLabelWind"), om.today.wind, mn.today.wind, "m/s");
    applyOneDiff(els.diffTomorrowMax, t("diffLabelMax"), om.tomorrow.max, mn.tomorrow.max, "°C");
    applyOneDiff(els.diffTomorrowMin, t("diffLabelMin"), om.tomorrow.min, mn.tomorrow.min, "°C");
    applyOneDiff(els.diffTomorrowRain, t("diffLabelRain"), om.tomorrow.rain, mn.tomorrow.rain, "mm");
    applyOneDiff(els.diffTomorrowWind, t("diffLabelWind"), om.tomorrow.wind, mn.tomorrow.wind, "m/s");
  }

  function applyOneDiff(el, label, a, b, unit) {
    if (!el) return;
    const value = isFiniteNumber(a) && isFiniteNumber(b) ? `${Math.abs(a - b).toFixed(1)}${unit}` : "-";
    el.textContent = `${label}: ${value}`;
  }

  function applyExternalLinks(lat, lon, displayName, addressObj) {
    const safeName = String(displayName || "").trim();
    const latFixed = isFiniteNumber(lat) ? Number(lat).toFixed(2) : "";
    const lonFixed = isFiniteNumber(lon) ? Number(lon).toFixed(2) : "";
    if (els.linkGoogleWeather) els.linkGoogleWeather.href = safeName ? `https://www.google.com/search?q=${encodeURIComponent(`天気 ${safeName}`)}` : "https://www.google.com/search?q=weather";
    if (els.linkWeatherCom) els.linkWeatherCom.href = latFixed && lonFixed ? `https://weather.com/weather/today/l/${latFixed},${lonFixed}` : "https://weather.com";
    const city = addressObj?.city || addressObj?.town || addressObj?.village || addressObj?.county || "";
    if (els.linkAccuWeather) els.linkAccuWeather.href = city ? `https://www.accuweather.com/en/search-locations?query=${encodeURIComponent(`${city} Japan`)}` : "https://www.accuweather.com";
    hardenExternalLinks();
  }

  function resetAll() {
    if (els.locationInput) els.locationInput.value = "";
    if (els.btnCompare) els.btnCompare.disabled = true;
    lastOpenMeteo = null;
    lastMetNorway = null;
    clearError();
    hide(els.progressArea);
    hide(els.resultSection);
    setText(els.progressText, t("resetDone"));
  }

  function renderTempBlock(el, high, low) {
    if (!el) return;
    el.replaceChildren();
    el.append(document.createTextNode(`${t("high")}: ${formatValue(high)}°C`));
    el.append(document.createElement("br"));
    el.append(document.createTextNode(`${t("low")}: ${formatValue(low)}°C`));
  }

  function renderLocationMeta(lat, lon, countryName, displayName) {
    if (!els.locMeta) return;
    els.locMeta.replaceChildren();
    const lines = [];
    if (displayName) lines.push(displayName);
    lines.push(`lat ${Number(lat).toFixed(2)} / lon ${Number(lon).toFixed(2)}`);
    if (countryName) lines.push(countryName);
    lines.forEach((line, index) => {
      if (index > 0) els.locMeta.append(document.createElement("br"));
      els.locMeta.append(document.createTextNode(line));
    });
  }

  function renderDiffNote() {
    if (!els.diffNote) return;
    els.diffNote.replaceChildren();
    els.diffNote.append(document.createTextNode(`${t("diffNoteText")} `));
    const link = document.createElement("a");
    link.href = usageHref();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = t("diffNoteLink");
    els.diffNote.append(link);
  }

  function setProgress(text) {
    setText(els.progressText, text);
    show(els.progressArea);
    const bar = els.progressArea?.querySelector(".wd-progress-bar");
    if (bar) {
      bar.classList.remove("is-animating");
      void bar.offsetWidth;
      bar.classList.add("is-animating");
    }
  }

  function lockUI() {
    if (els.btnCompare) els.btnCompare.disabled = true;
    if (els.btnGeo) els.btnGeo.disabled = true;
    if (els.locationInput) els.locationInput.readOnly = true;
  }

  function unlockUI() {
    if (els.btnCompare) els.btnCompare.disabled = (els.locationInput?.value.trim() || "") === "";
    if (els.btnGeo) els.btnGeo.disabled = false;
    if (els.locationInput) els.locationInput.readOnly = false;
  }

  function showError(message) { setText(els.errorText, message); }
  function clearError() { setText(els.errorText, ""); }
  function setText(el, text) { if (el) el.textContent = text; }
  function show(el) { el?.classList.remove("hidden"); }
  function hide(el) { el?.classList.add("hidden"); }
  function hardenExternalLinks() { document.querySelectorAll('a[target="_blank"]').forEach((a) => a.setAttribute("rel", "noopener noreferrer")); }
  function isFiniteNumber(value) { return Number.isFinite(Number(value)); }
  function round1(value) { return isFiniteNumber(value) ? Number(Number(value).toFixed(1)) : null; }
  function kmhToMs(value) { return isFiniteNumber(value) ? Number(value) / 3.6 : null; }
  function formatValue(value) { return isFiniteNumber(value) ? Number(value).toFixed(1) : "-"; }

  function codeToIcon(code) {
    const n = Number(code);
    if (n === 0) return "☀️";
    if ([1, 2].includes(n)) return "🌤️";
    if (n === 3) return "⛅";
    if ([45, 48].includes(n)) return "🌫️";
    if ([51, 53, 55].includes(n)) return "🌦️";
    if ([61, 63, 65].includes(n)) return "🌧️";
    if ([71, 73, 75].includes(n)) return "❄️";
    return "☁️";
  }

  function mapMetSymbolToIcon(symbol) {
    const s = String(symbol || "");
    if (s.includes("clearsky")) return "☀️";
    if (s.includes("fair") || s.includes("partlycloudy")) return "🌤️";
    if (s.includes("rain")) return "🌧️";
    if (s.includes("snow")) return "❄️";
    return "☁️";
  }
})();
