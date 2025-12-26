/* ================================
 * NicheWorks tool template app.js
 * - JP/EN toggle (data-i18n)
 * - Utilities: copy, downloadText, debounce
 * ================================ */

(() => {
  "use strict";

  // ----------------------------
  // i18n (required)
  // ----------------------------
  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(lang);
  };

  // ----------------------------
  // Utilities
  // ----------------------------
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const debounce = (fn, ms = 150) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Expose minimal helpers for tool scripts (Codex can reuse)
  window.NW = {
    applyLang,
    copyToClipboard,
    downloadText,
    debounce,
    hasPro: () => {
      try { return !!localStorage.getItem("nw_pro_key"); } catch (_) { return false; }
    }
  };

  const getValue = (id) => document.getElementById(id).value.trim();

  const buildPlan = (lang) => {
    const goal = getValue("goal") || (lang === "ja" ? "未入力" : "Not specified");
    const frequencyKey = getValue("frequency") || "daily";
    const frequencyMap = {
      daily: { ja: "毎日", en: "Daily" },
      three: { ja: "週3回", en: "3x per week" },
      weekly: { ja: "週1回", en: "Once a week" },
      weekday: { ja: "平日", en: "Weekdays" },
      weekend: { ja: "週末", en: "Weekends" },
    };
    const frequency = frequencyMap[frequencyKey] ? frequencyMap[frequencyKey][lang] : frequencyKey;
    const obstacles = getValue("obstacles") || (lang === "ja" ? "未入力" : "Not specified");

    if (lang === "ja") {
      return [
        "【習慣プラン】",
        `目標: ${goal}`,
        `頻度: ${frequency}`,
        "",
        "具体的行動:",
        `- ${goal}のために小さく始める（5分でOK）`,
        "トリガー:",
        `- ${frequency}のタイミングで実行する`,
        "報酬:",
        "- 完了後に小さなご褒美や達成チェックを入れる",
        "",
        "つまずき対策:",
        `- 障害: ${obstacles}`,
        "- 先に障害を小さくする行動を用意しておく",
        "",
        "【リマインド文】",
        `${goal}を${frequency}続けよう。まずは5分だけ始めよう！`,
      ].join("\n");
    }

    return [
      "[Habit Plan]",
      `Goal: ${goal}`,
      `Frequency: ${frequency}`,
      "",
      "Action:",
      `- Start small toward ${goal} (5 minutes is enough)`,
      "Trigger:",
      `- Execute at the timing of ${frequency}`,
      "Reward:",
      "- Add a small reward or checkmark after completion",
      "",
      "Obstacle handling:",
      `- Obstacles: ${obstacles}`,
      "- Prepare a small step to reduce the barrier",
      "",
      "[Reminder Copy]",
      `Keep ${goal} ${frequency}. Start with just 5 minutes today!`,
    ].join("\n");
  };

  const initTool = () => {
    const root = document.getElementById("toolRoot");
    root.innerHTML = `
      <div class="field">
        <label class="label">
          <span data-i18n="ja">目標</span>
          <span data-i18n="en" style="display:none;">Goal</span>
        </label>
        <input id="goal" class="input" type="text" placeholder="例: 毎日ストレッチする" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">頻度</span>
          <span data-i18n="en" style="display:none;">Frequency</span>
        </label>
        <select id="frequency" class="select">
          <option value="daily">毎日 / Daily</option>
          <option value="three">週3回 / 3x per week</option>
          <option value="weekly">週1回 / Once a week</option>
          <option value="weekday">平日 / Weekdays</option>
          <option value="weekend">週末 / Weekends</option>
        </select>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">障害になりそうなこと</span>
          <span data-i18n="en" style="display:none;">Likely obstacles</span>
        </label>
        <textarea id="obstacles" class="textarea" placeholder="例: 忙しくて時間が取れない"></textarea>
      </div>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" id="generateBtn" type="button">
          <span data-i18n="ja">プランを生成</span>
          <span data-i18n="en" style="display:none;">Generate plan</span>
        </button>
        <button class="btn" id="copyBtn" type="button">
          <span data-i18n="ja">コピー</span>
          <span data-i18n="en" style="display:none;">Copy</span>
        </button>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">出力</span>
          <span data-i18n="en" style="display:none;">Output</span>
        </label>
        <pre id="outputJa" class="out" data-i18n="ja"></pre>
        <pre id="outputEn" class="out" data-i18n="en" style="display:none;"></pre>
      </div>

      <div class="row">
        <button class="btn" id="downloadBtn" type="button">
          <span data-i18n="ja">テキスト保存</span>
          <span data-i18n="en" style="display:none;">Download text</span>
        </button>
      </div>
    `;

    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");

    const refresh = () => {
      outputJa.textContent = buildPlan("ja");
      outputEn.textContent = buildPlan("en");
    };

    document.getElementById("generateBtn").addEventListener("click", refresh);
    document.getElementById("copyBtn").addEventListener("click", async () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      await window.NW.copyToClipboard(text);
    });

    document.getElementById("downloadBtn").addEventListener("click", () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      window.NW.downloadText(`habit-plan-${lang}.txt`, text);
    });

    refresh();
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    // Tool-specific init should be appended below by Codex per tool.
    initTool();
  });
})();
