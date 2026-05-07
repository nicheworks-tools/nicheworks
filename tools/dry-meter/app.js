// tools/dry-meter/app.js
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE_KEY = "nw_drymeter_v1";
  const LANG_KEY = "nw_lang";

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const round1 = (value) => Math.round(value * 10) / 10;

  const defaultState = {
    target: "laundry",
    drying: "outdoor",
    temp: 22,
    humidity: 58,
    wind: 3.2
  };

  const labels = {
    target: {
      laundry: { ja: "普通の洗濯物", en: "Laundry" },
      thick: { ja: "厚手", en: "Thick items" },
      bedding: { ja: "布団", en: "Bedding" }
    },
    drying: {
      outdoor: { ja: "外干し", en: "Outdoor" },
      indoor: { ja: "部屋干し", en: "Indoor" }
    },
    bands: {
      good: {
        emoji: "🟢",
        label: { ja: "乾きやすい", en: "Easier to dry" },
        suggestion: {
          outdoor: { ja: "外干しの目安としては良好です。干す間隔と取り込み時間には注意してください。", en: "Conditions look good for outdoor drying. Keep spacing wide and watch retrieval timing." },
          indoor: { ja: "部屋干しでも比較的乾きやすい目安です。送風を併用すると安定します。", en: "Indoor drying should be relatively easy. Airflow helps keep it stable." }
        }
      },
      ok: {
        emoji: "🟡",
        label: { ja: "普通", en: "Average" },
        suggestion: {
          outdoor: { ja: "乾く可能性はありますが、厚手や布団は仕上げの送風を前提にしてください。", en: "Drying may work, but thick items and bedding may need airflow finishing." },
          indoor: { ja: "部屋干しは換気・除湿・送風の併用がおすすめです。", en: "Indoor drying should use ventilation, dehumidification and airflow together." }
        }
      },
      bad: {
        emoji: "🔴",
        label: { ja: "乾きにくい", en: "Hard to dry" },
        suggestion: {
          outdoor: { ja: "外干しだけで乾かすには不向きな目安です。部屋干し・乾燥機・除湿を検討してください。", en: "Outdoor drying alone looks unsuitable. Consider indoor drying, a dryer, or dehumidification." },
          indoor: { ja: "部屋干しでも臭い・カビに注意が必要です。除湿と強めの送風を使ってください。", en: "Indoor drying still needs odor and mold caution. Use dehumidification and stronger airflow." }
        }
      }
    }
  };

  let state = { ...defaultState };
  let currentLang = "ja";
  let lastResult = null;

  function detectLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "ja" || stored === "en") return stored;

    try {
      const legacy = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (legacy.lang === "ja" || legacy.lang === "en") return legacy.lang;
    } catch {
      // ignore legacy parse errors
    }

    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      state = {
        target: ["laundry", "thick", "bedding"].includes(parsed.target) ? parsed.target : defaultState.target,
        drying: parsed.drying === "indoor" ? "indoor" : defaultState.drying,
        temp: clamp(Number(parsed.temp ?? defaultState.temp), -10, 45),
        humidity: clamp(Number(parsed.humidity ?? defaultState.humidity), 0, 100),
        wind: round1(clamp(Number(parsed.wind ?? defaultState.wind), 0, 15))
      };
    } catch {
      state = { ...defaultState };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        target: state.target,
        drying: state.drying,
        temp: state.temp,
        humidity: state.humidity,
        wind: state.wind
      }));
    } catch {
      // ignore storage errors
    }
  }

  function applyLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = currentLang;
    try {
      localStorage.setItem(LANG_KEY, currentLang);
    } catch {
      // ignore storage errors
    }

    $$('[data-i18n]').forEach((el) => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });
    $$('.nw-lang-switch button').forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === currentLang);
    });
  }

  function text(pair) {
    return pair[currentLang] || pair.ja || pair.en || "";
  }

  function setText(selector, value) {
    const el = typeof selector === "string" ? $(selector) : selector;
    if (el) el.textContent = value;
  }

  function createI18nSpan(pair) {
    const span = document.createElement("span");
    span.textContent = text(pair);
    return span;
  }

  function computeDryScore(input) {
    const { temp, humidity, wind, target, drying } = input;
    const tempAdjust = clamp((temp - 15) * 1.25, -25, 25);
    const humidityAdjust = clamp((55 - humidity) * 0.65, -35, 35);
    const windAdjust = clamp(wind * 3.2, 0, 28);

    const targetAdjust = target === "bedding" ? -16 : target === "thick" ? -9 : 0;
    const dryingAdjust = drying === "indoor" ? -8 : 0;

    const score = Math.round(clamp(50 + tempAdjust + humidityAdjust + windAdjust + targetAdjust + dryingAdjust, 0, 100));
    const band = score >= 70 ? "good" : score >= 40 ? "ok" : "bad";

    const breakdown = [
      { label: { ja: "気温", en: "Temperature" }, value: Math.round(tempAdjust) },
      { label: { ja: "湿度", en: "Humidity" }, value: Math.round(humidityAdjust) },
      { label: { ja: "風速", en: "Wind" }, value: Math.round(windAdjust) },
      { label: labels.target[target], value: targetAdjust },
      { label: labels.drying[drying], value: dryingAdjust }
    ].filter((item) => item.value !== 0);

    return { score, band, breakdown };
  }

  function buildReasons() {
    const reasons = [];

    reasons.push({
      ja: `湿度 ${state.humidity}%：${state.humidity >= 80 ? "かなり乾きにくい" : state.humidity >= 65 ? "やや乾きにくい" : state.humidity <= 40 ? "乾きやすい" : "標準的"}`,
      en: `Humidity ${state.humidity}%: ${state.humidity >= 80 ? "very hard to dry" : state.humidity >= 65 ? "somewhat hard to dry" : state.humidity <= 40 ? "easier to dry" : "moderate"}`
    });

    reasons.push({
      ja: `気温 ${state.temp}℃：${state.temp <= 5 ? "低温で乾きにくい" : state.temp >= 25 ? "乾きやすい" : "標準的"}`,
      en: `Temperature ${state.temp}°C: ${state.temp <= 5 ? "low and slower" : state.temp >= 25 ? "helps drying" : "moderate"}`
    });

    reasons.push({
      ja: `風速 ${state.wind}m/s：${state.wind >= 6 ? "風が乾燥を助ける" : state.wind <= 1 ? "風が弱い" : "ほどほど"}`,
      en: `Wind ${state.wind} m/s: ${state.wind >= 6 ? "helps drying" : state.wind <= 1 ? "weak" : "moderate"}`
    });

    if (state.target === "bedding") {
      reasons.push({ ja: "布団は厚みと素材で乾き残りが出やすいです。", en: "Bedding can retain moisture depending on thickness and material." });
    } else if (state.target === "thick") {
      reasons.push({ ja: "厚手は普通の洗濯物より乾燥に時間がかかります。", en: "Thick items take longer than regular laundry." });
    }

    if (state.drying === "indoor") {
      reasons.push({ ja: "部屋干しは部屋の広さ、換気、除湿、送風で結果が大きく変わります。", en: "Indoor drying depends heavily on room size, ventilation, dehumidification and airflow." });
    }

    return reasons;
  }

  function buildWhyText(breakdown) {
    if (!breakdown.length) {
      return currentLang === "ja" ? "大きな補正要因はなく、標準に近い条件です。" : "No major adjustment factors; conditions are close to average.";
    }
    const sorted = [...breakdown].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    const top = sorted[0];
    const direction = top.value > 0
      ? { ja: "プラス", en: "positive" }
      : { ja: "マイナス", en: "negative" };
    return currentLang === "ja"
      ? `${text(top.label)}が${Math.abs(top.value)}点の${direction.ja}要因です。`
      : `${text(top.label)} is the strongest ${direction.en} factor (${Math.abs(top.value)} points).`;
  }

  function adviceFor(score) {
    const humid = state.humidity >= 75;
    const veryHumid = state.humidity >= 85;
    const cold = state.temp <= 8;
    const weakWind = state.wind <= 1;
    const good = score >= 70;
    const bad = score < 40;

    return {
      laundry: {
        do: {
          ja: bad || veryHumid ? "外干しだけに頼らず、除湿＋送風に切り替える。" : good ? "朝〜昼に外干しし、間隔を広めに取る。" : "外干し後に室内送風で仕上げる。",
          en: bad || veryHumid ? "Do not rely on outdoor drying alone; use dehumidification and airflow." : good ? "Dry outdoors from morning to noon with wide spacing." : "Finish with indoor airflow after outdoor drying."
        },
        avoid: {
          ja: humid || cold ? "密集干し、夕方までの放置、厚手との混在。" : "重ね干し、風の弱い場所、取り込み忘れ。",
          en: humid || cold ? "Crowding, leaving until evening, and mixing with thick items." : "Overlapping, windless spots, and forgetting retrieval."
        }
      },
      bedding: {
        do: {
          ja: score < 45 ? "今日は見送り、布団乾燥機や除湿仕上げを優先する。" : "短時間で裏返しながら干し、取り込み後に湿りを確認する。",
          en: score < 45 ? "Skip outdoor drying today and use a bedding dryer or dehumidifying finish." : "Dry briefly, flip during drying, and check for dampness after retrieval."
        },
        avoid: {
          ja: "湿ったまま収納する、片面だけ干す、夕方まで外に置く。",
          en: "Storing while damp, drying only one side, or leaving outside until evening."
        }
      },
      room: {
        do: {
          ja: veryHumid ? "窓を閉めて除湿＋強めの送風を使う。" : weakWind ? "サーキュレーターで空気の通り道を作る。" : "換気と送風を併用し、洗濯物の間隔を広げる。",
          en: veryHumid ? "Close windows and use dehumidification with stronger airflow." : weakWind ? "Use an air circulator to create an airflow path." : "Combine ventilation and airflow, and keep spacing wide."
        },
        avoid: {
          ja: "部屋の奥で密集させる、換気ゼロ、湿ったまま長時間放置。",
          en: "Crowding in the back of a room, zero ventilation, or leaving damp items for long."
        }
      }
    };
  }

  function renderList(container, items, className) {
    container.textContent = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      if (className) li.className = className(item);
      const label = document.createElement("span");
      label.textContent = text(item.label || item);
      li.append(label);
      if (typeof item.value === "number") {
        const value = document.createElement("span");
        value.textContent = `${item.value > 0 ? "+" : ""}${item.value}`;
        li.append(value);
      }
      container.appendChild(li);
    });
  }

  function updateInputs() {
    const tempEl = $("#temp");
    const humidityEl = $("#humidity");
    const windEl = $("#wind");
    if (tempEl) tempEl.value = String(state.temp);
    if (humidityEl) humidityEl.value = String(state.humidity);
    if (windEl) windEl.value = String(state.wind);
    setText("#tempOut", String(state.temp));
    setText("#humidityOut", String(state.humidity));
    setText("#windOut", Number.isInteger(state.wind) ? String(state.wind) : state.wind.toFixed(1));
  }

  function updateSegments() {
    $$('[data-target]').forEach((button) => {
      const active = button.dataset.target === state.target;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    $$('[data-dry]').forEach((button) => {
      const active = button.dataset.dry === state.drying;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function updateWarnings() {
    const warnings = [];
    if (state.temp <= -5 || state.temp >= 40 || state.wind >= 12) {
      warnings.push({ ja: "極端な値では参考度が下がります。通常の生活環境向けの目安として見てください。", en: "Extreme values reduce reliability. Treat this as a guide for normal living conditions." });
    }
    if (state.humidity >= 85) {
      warnings.push({ ja: "高湿度時は、部屋干しでも臭い・カビに注意してください。", en: "High humidity can still increase odor and mold risk indoors." });
    }
    setText("#validationMsg", warnings.map(text).join(" "));
  }

  function renderResult() {
    updateInputs();
    updateSegments();
    updateWarnings();

    const result = computeDryScore(state);
    lastResult = result;
    const band = labels.bands[result.band];
    const suggestion = band.suggestion[state.drying];

    setText("#scoreNum", String(result.score));
    setText("#riskEmoji", band.emoji);
    setText("#riskLabel", text(band.label));
    setText("#riskTitle", text(band.label));
    setText("#suggestionText", text(suggestion));
    setText("#whyText", buildWhyText(result.breakdown));

    const card = $("#resultCard");
    if (card) {
      card.classList.remove("status-good", "status-ok", "status-bad");
      card.classList.add(`status-${result.band}`);
    }

    const reasonsList = $("#reasonsList");
    if (reasonsList) renderList(reasonsList, buildReasons());

    const breakdownList = $("#breakdownList");
    if (breakdownList) {
      renderList(breakdownList, result.breakdown, (item) => `breakdown-item ${item.value > 0 ? "positive" : item.value < 0 ? "negative" : "neutral"}`);
    }

    const advice = adviceFor(result.score);
    setText("#actionLaundryDo", text(advice.laundry.do));
    setText("#actionLaundryAvoid", text(advice.laundry.avoid));
    setText("#actionBeddingDo", text(advice.bedding.do));
    setText("#actionBeddingAvoid", text(advice.bedding.avoid));
    setText("#actionRoomDo", text(advice.room.do));
    setText("#actionRoomAvoid", text(advice.room.avoid));

    saveState();
    applyLang(currentLang);
  }

  function buildCopyText() {
    const result = lastResult || computeDryScore(state);
    const band = labels.bands[result.band];
    const advice = adviceFor(result.score);
    const mainAdvice = state.target === "bedding" ? advice.bedding.do : state.drying === "indoor" ? advice.room.do : advice.laundry.do;
    const reasons = buildReasons().slice(0, 3).map(text).join(" / ");

    if (currentLang === "ja") {
      return [
        `Dry Score（参考）: ${result.score}/100（${text(band.label)}）`,
        `対象: ${text(labels.target[state.target])}`,
        `干し方: ${text(labels.drying[state.drying])}`,
        `条件: 気温 ${state.temp}℃ / 湿度 ${state.humidity}% / 風速 ${state.wind}m/s`,
        `主な理由: ${reasons}`,
        `おすすめ行動: ${text(mainAdvice)}`,
        "注意: 気温・湿度・風速だけの簡易目安です。雨、降水確率、日照、素材、干し方、時間帯は結果に影響します。"
      ].join("\n");
    }

    return [
      `Dry Score (reference): ${result.score}/100 (${text(band.label)})`,
      `Target: ${text(labels.target[state.target])}`,
      `Method: ${text(labels.drying[state.drying])}`,
      `Conditions: ${state.temp}°C / humidity ${state.humidity}% / wind ${state.wind} m/s`,
      `Main reasons: ${reasons}`,
      `Recommended action: ${text(mainAdvice)}`,
      "Note: This is a simple guide based only on temperature, humidity and wind. Rain, precipitation probability, sunlight, material, drying method and time of day can affect results."
    ].join("\n");
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    if (!ok) throw new Error("copy_failed");
  }

  function bindEvents() {
    $$('.nw-lang-switch button').forEach((button) => {
      button.addEventListener("click", () => {
        applyLang(button.dataset.lang);
        renderResult();
      });
    });

    $$('[data-target]').forEach((button) => {
      button.addEventListener("click", () => {
        state.target = ["laundry", "thick", "bedding"].includes(button.dataset.target) ? button.dataset.target : "laundry";
        renderResult();
      });
    });

    $$('[data-dry]').forEach((button) => {
      button.addEventListener("click", () => {
        state.drying = button.dataset.dry === "indoor" ? "indoor" : "outdoor";
        renderResult();
      });
    });

    const tempEl = $("#temp");
    const humidityEl = $("#humidity");
    const windEl = $("#wind");

    tempEl?.addEventListener("input", () => {
      state.temp = clamp(parseInt(tempEl.value, 10), -10, 45);
      renderResult();
    });

    humidityEl?.addEventListener("input", () => {
      state.humidity = clamp(parseInt(humidityEl.value, 10), 0, 100);
      renderResult();
    });

    windEl?.addEventListener("input", () => {
      state.wind = round1(clamp(parseFloat(windEl.value), 0, 15));
      renderResult();
    });

    $$('.preset-btn').forEach((button) => {
      button.addEventListener("click", () => {
        const preset = button.dataset.preset;
        if (preset === "winter-indoor") {
          state.temp = 5;
          state.humidity = 55;
          state.wind = 1;
          state.drying = "indoor";
        } else if (preset === "rainy-day") {
          state.temp = 18;
          state.humidity = 88;
          state.wind = 2;
          state.drying = "indoor";
        } else if (preset === "sunny-breezy") {
          state.temp = 26;
          state.humidity = 45;
          state.wind = 5.5;
          state.drying = "outdoor";
        }
        renderResult();
      });
    });

    $("#copyBtn")?.addEventListener("click", async () => {
      const status = $("#copyStatus");
      try {
        await copyText(buildCopyText());
        setText(status, currentLang === "ja" ? "コピーしました。" : "Copied.");
      } catch {
        setText(status, currentLang === "ja" ? "コピーに失敗しました。" : "Copy failed.");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    currentLang = detectLang();
    applyLang(currentLang);
    bindEvents();
    renderResult();
  });
})();
