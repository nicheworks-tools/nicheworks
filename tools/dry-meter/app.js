// tools/dry-meter/app.js
(() => {
  "use strict";

  // ---------- helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const STORAGE_KEY = "nw_drymeter_v1";

  const round1 = (n) => Math.round(n * 10) / 10;

  // ---------- elements ----------
  const langButtons = $$(".nw-lang-switch button");

  const tempEl = $("#temp");
  const humidityEl = $("#humidity");
  const windEl = $("#wind");

  const tempOut = $("#tempOut");
  const humidityOut = $("#humidityOut");
  const windOut = $("#windOut");

  const resultCard = $("#resultCard");
  const scoreNum = $("#scoreNum");
  const riskEmoji = $("#riskEmoji");
  const riskLabel = $("#riskLabel");
  const riskTitle = $("#riskTitle");
  const reasonsList = $("#reasonsList");
  const suggestionText = $("#suggestionText");
  const breakdownList = $("#breakdownList");
  const whyText = $("#whyText");
  const validationMsg = $("#validationMsg");
  const copyBtn = $("#copyBtn");
  const copyStatus = $("#copyStatus");
  const wxMini = $("#wxMini");

  const targetBtns = $$(".segmented .seg[data-target]");
  const dryBtns = $$(".segmented .seg[data-dry]");
  const presetBtns = $$(".preset-btn");
  const manualApplyBtn = $("#manualApplyBtn");

  // ---------- state ----------
  const defaultState = {
    lang: null,            // auto
    target: "laundry",     // laundry | thick | bedding
    drying: "outdoor",     // outdoor | indoor
    temp: 22,
    humidity: 58,
    wind: 3.2
  };

  let state = { ...defaultState };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      // whitelist keys
      state = {
        ...state,
        lang: typeof parsed.lang === "string" ? parsed.lang : null,
        target: ["laundry", "thick", "bedding"].includes(parsed.target) ? parsed.target : "laundry",
        drying: parsed.drying === "indoor" ? "indoor" : "outdoor",
        temp: clamp(Number(parsed.temp ?? state.temp), 0, 40),
        humidity: clamp(Number(parsed.humidity ?? state.humidity), 30, 100),
        wind: clamp(Number(parsed.wind ?? state.wind), 0, 10)
      };
      // normalize wind to 0.1 step
      state.wind = round1(state.wind);
    } catch {
      // ignore
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  // ---------- i18n ----------
  function detectLang() {
    const browser = (navigator.language || "").toLowerCase();
    return browser.startsWith("ja") ? "ja" : "en";
  }

  function applyLang(lang) {
    $$("[data-i18n]").forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    langButtons.forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    state.lang = lang;
    saveState();
  }

  // ---------- segmented controls ----------
  function setActive(btns, matchFn) {
    btns.forEach((b) => {
      const on = matchFn(b);
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function applySegmentedUI() {
    setActive(targetBtns, (b) => b.dataset.target === state.target);
    setActive(dryBtns, (b) => b.dataset.dry === state.drying);
  }

  // ---------- inputs UI ----------
  function applyInputsUI() {
    tempEl.value = String(state.temp);
    humidityEl.value = String(state.humidity);
    windEl.value = String(state.wind);

    tempOut.textContent = String(state.temp);
    humidityOut.textContent = String(state.humidity);
    // keep one decimal for wind
    windOut.textContent = (Math.round(state.wind) === state.wind) ? String(state.wind) : state.wind.toFixed(1);
  }

  // ---------- scoring logic ----------
  function computeDryScore({ temp, humidity, wind, target, drying }) {
    // base scoring (0–100)
    const tempScore = clamp(((temp - 5) / 25) * 40, 0, 40);
    const humidityScore = clamp(((100 - humidity) / 70) * 40, 0, 40);
    const windScore = clamp((wind / 5) * 20, 0, 20);

    const tempNeutral = 20;
    const humidityNeutral = 20;
    const windNeutral = 10;

    let score = tempScore + humidityScore + windScore;

    // target adjustment
    let targetAdjust = 0;
    if (target === "bedding") targetAdjust = -15;
    if (target === "thick") targetAdjust = -8;
    score += targetAdjust;

    // drying method adjustment
    const dryingAdjust = drying === "indoor" ? -10 : 0;
    score += dryingAdjust;

    score = Math.round(clamp(score, 0, 100));

    let band = "bad";
    if (score >= 70) band = "good";
    else if (score >= 40) band = "ok";

    const breakdown = [
      {
        key: "temp",
        value: Math.round(tempScore - tempNeutral),
        label: { ja: "気温", en: "Temperature" }
      },
      {
        key: "humidity",
        value: Math.round(humidityScore - humidityNeutral),
        label: { ja: "湿度", en: "Humidity" }
      },
      {
        key: "wind",
        value: Math.round(windScore - windNeutral),
        label: { ja: "風", en: "Wind" }
      }
    ];

    if (targetAdjust !== 0) {
      const targetLabel = target === "bedding"
        ? { ja: "対象：布団", en: "Target: bedding" }
        : { ja: "対象：厚手", en: "Target: thick" };
      breakdown.push({ key: "target", value: targetAdjust, label: targetLabel });
    }

    if (dryingAdjust !== 0) {
      breakdown.push({
        key: "drying",
        value: dryingAdjust,
        label: { ja: "干し方：室内", en: "Method: indoor" }
      });
    }

    return { score, band, breakdown };
  }

  function labelsForBand(band, lang) {
    const ja = {
      good: { status: "よく乾く", outdoor: "今日は外干し向きです。", indoor: "部屋干しでも乾きやすいです。" },
      ok:   { status: "普通",     outdoor: "工夫すれば乾きます。",     indoor: "部屋干しは工夫が必要です。" },
      bad:  { status: "乾きにくい", outdoor: "乾燥には不向きです。",   indoor: "部屋干しは避けた方が無難です。" }
    };
    const en = {
      good: { status: "Dries well", outdoor: "Great day for outdoor drying.", indoor: "Drying indoors should be fine." },
      ok:   { status: "Average",    outdoor: "Drying is possible with care.",  indoor: "Indoor drying may need help." },
      bad:  { status: "Hard to dry",outdoor: "Not suitable for drying today.", indoor: "Indoor drying is not recommended." }
    };
    return (lang === "ja" ? ja : en)[band];
  }

  function formatSigned(value) {
    return `${value > 0 ? "+" : ""}${value}`;
  }

  function updateI18nText(el, jaText, enText) {
    if (!el) return;
    const jaSpan = $(`[data-i18n="ja"]`, el);
    const enSpan = $(`[data-i18n="en"]`, el);
    if (jaSpan) jaSpan.textContent = jaText;
    if (enSpan) enSpan.textContent = enText;
  }

  function normalizeState() {
    const messagesJa = [];
    const messagesEn = [];

    const tempValue = Number(state.temp);
    if (!Number.isFinite(tempValue)) {
      state.temp = defaultState.temp;
      messagesJa.push("気温が数値ではありません。");
      messagesEn.push("Temperature is not a valid number.");
    } else if (tempValue < 0 || tempValue > 40) {
      state.temp = clamp(tempValue, 0, 40);
      messagesJa.push("気温は0〜40℃の範囲で入力してください。");
      messagesEn.push("Temperature must be between 0–40°C.");
    }

    const humidityValue = Number(state.humidity);
    if (!Number.isFinite(humidityValue)) {
      state.humidity = defaultState.humidity;
      messagesJa.push("湿度が数値ではありません。");
      messagesEn.push("Humidity is not a valid number.");
    } else if (humidityValue < 30 || humidityValue > 100) {
      state.humidity = clamp(humidityValue, 30, 100);
      messagesJa.push("湿度は30〜100%の範囲で入力してください。");
      messagesEn.push("Humidity must be between 30–100%.");
    }

    const windValue = Number(state.wind);
    if (!Number.isFinite(windValue)) {
      state.wind = defaultState.wind;
      messagesJa.push("風速が数値ではありません。");
      messagesEn.push("Wind speed is not a valid number.");
    } else if (windValue < 0 || windValue > 10) {
      state.wind = clamp(windValue, 0, 10);
      messagesJa.push("風速は0〜10m/sの範囲で入力してください。");
      messagesEn.push("Wind speed must be between 0–10 m/s.");
    }

    updateI18nText(validationMsg, messagesJa.join(" "), messagesEn.join(" "));
  }

  function buildWhyText(breakdown, lang) {
    const positives = breakdown.filter((item) => item.value > 0);
    const negatives = breakdown.filter((item) => item.value < 0);

    const strongestPositive = positives.sort((a, b) => b.value - a.value)[0];
    const strongestNegative = negatives.sort((a, b) => a.value - b.value)[0];

    if (strongestPositive && strongestNegative) {
      if (lang === "ja") {
        return `${strongestNegative.label.ja}が${Math.abs(strongestNegative.value)}点のマイナスで下げ、${strongestPositive.label.ja}が${strongestPositive.value}点のプラスで補っています。`;
      }
      return `${strongestNegative.label.en} reduced the score by ${Math.abs(strongestNegative.value)} points, while ${strongestPositive.label.en} added ${strongestPositive.value} points.`;
    }

    if (strongestNegative) {
      if (lang === "ja") {
        return `${strongestNegative.label.ja}の影響が大きく、スコアが下がっています。`;
      }
      return `The score is mainly held back by ${strongestNegative.label.en.toLowerCase()}.`;
    }

    if (strongestPositive) {
      if (lang === "ja") {
        return `${strongestPositive.label.ja}が追い風になり、乾きやすさを押し上げています。`;
      }
      return `${strongestPositive.label.en} is the main factor boosting the score.`;
    }

    return lang === "ja"
      ? "大きなプラス・マイナス要因はなく、全体的に平均的です。"
      : "No strong positive or negative factors; conditions are fairly balanced.";
  }

  function getAdviceTexts(useCase, score, { temp, humidity, wind }) {
    const highHumidity = humidity >= 75;
    const veryHumid = humidity >= 85;
    const lowTemp = temp <= 10;
    const warm = temp >= 22;
    const strongWind = wind >= 5;
    const weakWind = wind <= 1.2;

    const good = score >= 70;
    const ok = score >= 40;

    if (useCase === "laundry") {
      if (veryHumid || !ok) {
        return {
          ja: {
            do: "外干しは避け、室内で除湿＋送風に切り替える。",
            avoid: "密集して干す／厚手を長時間外に置く。",
            help: "除湿機・サーキュレーター"
          },
          en: {
            do: "Skip outdoor drying and switch to indoor drying with dehumidification.",
            avoid: "Overlapping items or leaving thick items outside for long.",
            help: "Dehumidifier, air circulator"
          }
        };
      }
      if (highHumidity || lowTemp) {
        return {
          ja: {
            do: "外干しは短時間＋間隔を広く。取り込み後は送風で仕上げる。",
            avoid: "夕方まで放置する／日陰に密集させる。",
            help: "扇風機・浴室乾燥"
          },
          en: {
            do: "Dry outdoors briefly with wide spacing, then finish with airflow.",
            avoid: "Leaving items out until evening or crowding in shade.",
            help: "Fan, bathroom dryer"
          }
        };
      }
      if (good) {
        return {
          ja: {
            do: "朝〜昼の外干しでOK。裏返して風通しを確保。",
            avoid: "厚手を重ねる／軒下の風が弱い場所。",
            help: strongWind ? "特になし（風が十分）" : "物干し位置の調整"
          },
          en: {
            do: "Outdoor drying is great from morning to noon. Flip items for airflow.",
            avoid: "Stacking thick items or drying in windless corners.",
            help: strongWind ? "None (wind is sufficient)" : "Adjust rack position"
          }
        };
      }
      return {
        ja: {
          do: "外干しは可能だが、風通し確保＋取り込み後の送風がおすすめ。",
          avoid: "部屋の奥で乾かし切る／厚手を一緒に干す。",
          help: "扇風機・サーキュレーター"
        },
        en: {
          do: "Outdoor drying is possible; ensure airflow and finish with a fan.",
          avoid: "Letting items finish in a closed room or mixing thick items.",
          help: "Fan, air circulator"
        }
      };
    }

    if (useCase === "bedding") {
      if (veryHumid || score < 45) {
        return {
          ja: {
            do: "今日は見送り推奨。室内で除湿乾燥や布団乾燥機を使う。",
            avoid: "長時間の外干し／湿ったまま収納。",
            help: "布団乾燥機・除湿機"
          },
          en: {
            do: "Better to skip today. Use indoor dehumidifying or a bedding dryer.",
            avoid: "Long outdoor drying or storing while damp.",
            help: "Bedding dryer, dehumidifier"
          }
        };
      }
      if (highHumidity || lowTemp) {
        return {
          ja: {
            do: "短時間の日光＋こまめな裏返し。仕上げは室内送風。",
            avoid: "夕方まで放置／片面だけ干す。",
            help: "扇風機・布団乾燥機"
          },
          en: {
            do: "Short outdoor sun with frequent flipping, then finish indoors.",
            avoid: "Leaving out until evening or drying only one side.",
            help: "Fan, bedding dryer"
          }
        };
      }
      if (good) {
        return {
          ja: {
            do: "外干しでしっかり乾燥。途中で裏返してムラを防ぐ。",
            avoid: "日陰に長時間置く／取り込み直後に収納。",
            help: strongWind ? "特になし（風が十分）" : "送風で仕上げ"
          },
          en: {
            do: "Outdoor drying works well; flip mid-way to avoid uneven drying.",
            avoid: "Keeping it in shade or storing right after bringing in.",
            help: strongWind ? "None (wind is sufficient)" : "Finish with airflow"
          }
        };
      }
      return {
        ja: {
          do: "外干し＋室内仕上げの併用が安心。",
          avoid: "湿度の高い時間帯に長く干す。",
          help: "サーキュレーター・布団乾燥機"
        },
        en: {
          do: "Combine brief outdoor drying with indoor finishing.",
          avoid: "Long drying during the most humid hours.",
          help: "Air circulator, bedding dryer"
        }
      };
    }

    if (veryHumid) {
      return {
        ja: {
          do: "窓は閉め、除湿＋送風で乾燥。浴室乾燥が使えるなら活用。",
          avoid: "外気を入れる／狭い場所に密集。",
          help: "除湿機・サーキュレーター"
        },
        en: {
          do: "Keep windows closed and use dehumidifying airflow.",
          avoid: "Letting humid outside air in or drying in tight spaces.",
          help: "Dehumidifier, air circulator"
        }
      };
    }
    if (warm && humidity < 60) {
      return {
        ja: {
          do: "換気＋送風で十分。間隔を広めに干す。",
          avoid: "重ね干し／扉を閉め切る。",
          help: weakWind ? "扇風機" : "特になし"
        },
        en: {
          do: "Ventilation and airflow are enough; keep spacing wide.",
          avoid: "Overlapping items or keeping doors closed.",
          help: weakWind ? "Fan" : "None needed"
        }
      };
    }
    return {
      ja: {
        do: "暖房や送風を併用し、空気の通り道を作る。",
        avoid: "洗濯物を壁際に寄せる／換気ゼロ。",
        help: "暖房・サーキュレーター"
      },
      en: {
        do: "Use heating plus airflow and create a clear air path.",
        avoid: "Pushing items against walls or zero ventilation.",
        help: "Heater, air circulator"
      }
    };
  }

  function applyAdvice(useCase, score, inputs) {
    const advice = getAdviceTexts(useCase, score, inputs);
    const mapping = {
      laundry: ["actionLaundryDo", "actionLaundryAvoid", "actionLaundryHelp"],
      bedding: ["actionBeddingDo", "actionBeddingAvoid", "actionBeddingHelp"],
      room: ["actionRoomDo", "actionRoomAvoid", "actionRoomHelp"]
    };
    const [doId, avoidId, helpId] = mapping[useCase];
    updateI18nText($(`#${doId}`), advice.ja.do, advice.en.do);
    updateI18nText($(`#${avoidId}`), advice.ja.avoid, advice.en.avoid);
    updateI18nText($(`#${helpId}`), advice.ja.help, advice.en.help);
  }

  function renderResult() {
    normalizeState();
    applyInputsUI();
    if (copyStatus) copyStatus.textContent = "";
    const { score, band, breakdown } = computeDryScore(state);
    scoreNum.textContent = String(score);

    // update card class
    resultCard.classList.remove("status-good", "status-ok", "status-bad");
    resultCard.classList.add(band === "good" ? "status-good" : band === "ok" ? "status-ok" : "status-bad");

    const lang = state.lang || detectLang();

    const key = state.drying === "indoor" ? "indoor" : "outdoor";

    updateI18nText(riskTitle, labelsForBand(band, "ja").status, labelsForBand(band, "en").status);
    updateI18nText(riskLabel, labelsForBand(band, "ja").status, labelsForBand(band, "en").status);
    updateI18nText(suggestionText, labelsForBand(band, "ja")[key], labelsForBand(band, "en")[key]);

    if (riskEmoji) {
      riskEmoji.textContent = band === "good" ? "🟢" : band === "ok" ? "🟡" : "🔴";
    }

    if (reasonsList) {
      reasonsList.innerHTML = "";
      const reasons = [
        {
          ja: `湿度 ${state.humidity}%（${state.humidity >= 75 ? "乾きにくい" : "許容範囲"}）`,
          en: `Humidity ${state.humidity}% (${state.humidity >= 75 ? "slows drying" : "acceptable"})`
        },
        {
          ja: `気温 ${state.temp}℃（${state.temp <= 10 ? "低め" : state.temp >= 22 ? "高め" : "普通"}）`,
          en: `Temperature ${state.temp}°C (${state.temp <= 10 ? "low" : state.temp >= 22 ? "warm" : "moderate"})`
        },
        {
          ja: `風 ${state.wind}m/s（${state.wind >= 5 ? "風あり" : state.wind <= 1.2 ? "弱い" : "ほどほど"}）`,
          en: `Wind ${state.wind} m/s (${state.wind >= 5 ? "strong" : state.wind <= 1.2 ? "light" : "moderate"})`
        }
      ];
      reasons.forEach((reason) => {
        const li = document.createElement("li");
        const jaSpan = document.createElement("span");
        jaSpan.dataset.i18n = "ja";
        jaSpan.textContent = reason.ja;
        const enSpan = document.createElement("span");
        enSpan.dataset.i18n = "en";
        enSpan.textContent = reason.en;
        li.append(jaSpan, enSpan);
        reasonsList.appendChild(li);
      });
    }

    if (breakdownList) {
      breakdownList.innerHTML = "";
      breakdown.forEach((item) => {
        const li = document.createElement("li");
        li.className = `breakdown-item ${item.value > 0 ? "positive" : item.value < 0 ? "negative" : "neutral"}`;
        const label = document.createElement("span");
        const value = document.createElement("span");
        const jaSpan = document.createElement("span");
        const enSpan = document.createElement("span");
        jaSpan.dataset.i18n = "ja";
        enSpan.dataset.i18n = "en";
        jaSpan.textContent = item.label.ja;
        enSpan.textContent = item.label.en;
        label.append(jaSpan, enSpan);
        value.textContent = formatSigned(item.value);
        li.append(label, value);
        breakdownList.appendChild(li);
      });
    }

    updateI18nText(whyText, buildWhyText(breakdown, "ja"), buildWhyText(breakdown, "en"));

    applyAdvice("laundry", score, state);
    applyAdvice("bedding", score, state);
    applyAdvice("room", score, state);

    if (wxMini) {
      updateI18nText(
        wxMini,
        `気温 ${state.temp}℃ / 湿度 ${state.humidity}% / 風 ${state.wind}m/s`,
        `Temp ${state.temp}°C / Humidity ${state.humidity}% / Wind ${state.wind} m/s`
      );
    }

    applyLang(lang);

    // persist
    saveState();
  }

  // ---------- events ----------
  function bindEvents() {
    // language
    langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyLang(btn.dataset.lang);
        renderResult();
      });
    });

    // segmented: target
    targetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.target = ["laundry", "thick", "bedding"].includes(btn.dataset.target)
          ? btn.dataset.target
          : "laundry";
        applySegmentedUI();
        renderResult();
      });
    });

    // segmented: drying
    dryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.drying = btn.dataset.dry === "indoor" ? "indoor" : "outdoor";
        applySegmentedUI();
        renderResult();
      });
    });

    // sliders
    tempEl.addEventListener("input", () => {
      state.temp = clamp(parseInt(tempEl.value, 10), 0, 40);
      tempOut.textContent = String(state.temp);
      renderResult();
    });

    humidityEl.addEventListener("input", () => {
      state.humidity = clamp(parseInt(humidityEl.value, 10), 30, 100);
      humidityOut.textContent = String(state.humidity);
      renderResult();
    });

    windEl.addEventListener("input", () => {
      state.wind = round1(clamp(parseFloat(windEl.value), 0, 10));
      windOut.textContent = (Math.round(state.wind) === state.wind) ? String(state.wind) : state.wind.toFixed(1);
      renderResult();
    });

    if (manualApplyBtn) {
      manualApplyBtn.addEventListener("click", () => {
        renderResult();
      });
    }

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = btn.dataset.preset;
        if (preset === "winter-indoor") {
          state.temp = 8;
          state.humidity = 55;
          state.wind = 1.0;
          state.drying = "indoor";
        }
        if (preset === "rainy-day") {
          state.temp = 18;
          state.humidity = 88;
          state.wind = 2.0;
          state.drying = "indoor";
        }
        if (preset === "sunny-breezy") {
          state.temp = 26;
          state.humidity = 45;
          state.wind = 5.5;
          state.drying = "outdoor";
        }
        applySegmentedUI();
        applyInputsUI();
        renderResult();
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const lang = state.lang || detectLang();
        const { score, band } = computeDryScore(state);
        const headline = labelsForBand(band, lang).status;
        const keyCase = state.target === "bedding" ? "bedding" : state.target === "thick" ? "laundry" : "laundry";
        const advice = getAdviceTexts(keyCase, score, state);
        const line = lang === "ja"
          ? `Dry Score ${score}/100（${headline}）｜おすすめ: ${advice.ja.do}`
          : `Dry Score ${score}/100 (${headline}) | Recommendation: ${advice.en.do}`;

        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(line);
          } else {
            const textarea = document.createElement("textarea");
            textarea.value = line;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
          }
          copyStatus.textContent = lang === "ja" ? "コピーしました。" : "Copied.";
        } catch {
          copyStatus.textContent = lang === "ja" ? "コピーに失敗しました。" : "Copy failed.";
        }
      });
    }
  }

  // ---------- init ----------
  document.addEventListener("DOMContentLoaded", () => {
    loadState();

    // initial lang: stored or auto
    const initialLang = (state.lang === "ja" || state.lang === "en") ? state.lang : detectLang();
    applyLang(initialLang);

    applySegmentedUI();
    applyInputsUI();
    bindEvents();
    renderResult();
  });
})();
