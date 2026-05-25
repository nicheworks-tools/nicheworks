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

  const dayLabels = {
    ja: ["月", "火", "水", "木", "金", "土", "日"],
    en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  };

  const motivationTips = {
    progress: {
      ja: "進捗を1行で記録して見える化する",
      en: "Log a one-line progress note to make it visible"
    },
    reward: {
      ja: "完了後に小さなご褒美を用意する",
      en: "Set a small reward right after completion"
    },
    social: {
      ja: "誰かに完了報告する",
      en: "Report completion to someone"
    },
    identity: {
      ja: "『◯◯な人』としての行動を意識する",
      en: "Act as the kind of person who does this"
    }
  };

  const presets = {
    exercise: {
      goal: { ja: "ストレッチを続ける", en: "Do stretching" },
      availableTime: { ja: "朝の10分", en: "10 minutes in the morning" },
      preferredDays: [0, 2, 4, 6],
      obstacles: { ja: "忙しくて時間が取れない", en: "Too busy to find time" },
      motivation: "progress"
    },
    study: {
      goal: { ja: "英単語を覚える", en: "Study vocabulary" },
      availableTime: { ja: "通勤中の15分", en: "15 minutes on commute" },
      preferredDays: [1, 3, 5],
      obstacles: { ja: "疲れて集中できない", en: "Too tired to focus" },
      motivation: "identity"
    },
    sleep: {
      goal: { ja: "23時までに就寝する", en: "Go to bed by 11 PM" },
      availableTime: { ja: "就寝30分前", en: "30 minutes before bed" },
      preferredDays: [0, 1, 2, 3, 4, 5, 6],
      obstacles: { ja: "夜更かししてしまう", en: "Stay up late" },
      motivation: "reward"
    }
  };

  let checklistLength = 7;

  const getSelectedDays = () => {
    const checked = Array.from(document.querySelectorAll("input[name='preferredDays']:checked"))
      .map((input) => Number.parseInt(input.value, 10))
      .filter((value) => Number.isInteger(value));
    if (checked.length === 0) {
      return [0, 1, 2, 3, 4, 5, 6];
    }
    return checked;
  };

  const formatDays = (lang, days) => {
    if (days.length === 7) {
      return lang === "ja" ? "毎日" : "every day";
    }
    const labels = days.map((idx) => dayLabels[lang][idx]);
    return lang === "ja" ? labels.join("・") : labels.join("/");
  };

  const buildPlanData = (lang) => {
    const goal = getValue("goal") || (lang === "ja" ? "小さな習慣" : "a small habit");
    const availableTime = getValue("availableTime");
    const obstacles = getValue("obstacles") || (lang === "ja" ? "特になし" : "none noted");
    const motivation = getValue("motivation") || "progress";
    const days = getSelectedDays();

    const daysLabel = formatDays(lang, days);
    const timeText = availableTime || (lang === "ja" ? "決めた時間" : "a set time");
    const motivationTip = motivationTips[motivation] ? motivationTips[motivation][lang] : "";

    const goalSentence = lang === "ja" ? `${goal}を続ける。` : `Maintain ${goal}.`;
    const minimumAction = lang === "ja"
      ? `2分だけ：${goal}に取りかかる（準備だけでもOK）。`
      : `2-minute version: start ${goal} (prep-only is fine).`;
    const trigger = lang === "ja"
      ? `${daysLabel}の${timeText}に、いつもの場所で開始する。`
      : `On ${daysLabel}, start at ${timeText} in your usual place.`;
    const recovery = lang === "ja"
      ? `もし逃したら次の機会に2分だけ実行。障害: ${obstacles}。${motivationTip}。`
      : `If missed, do the 2-minute version at the next chance. Obstacle: ${obstacles}. ${motivationTip}.`;

    const schedule = dayLabels[lang].map((label, idx) => ({
      label,
      planned: days.includes(idx)
    }));

    return {
      goalSentence,
      minimumAction,
      trigger,
      recovery,
      schedule
    };
  };

  const renderScheduleTable = (lang, schedule) => {
    const planLabel = lang === "ja" ? "実行" : "Do";
    const restLabel = lang === "ja" ? "休み/予備" : "Rest / buffer";
    const rows = schedule.map((item) => `
      <tr>
        <th>${item.label}</th>
        <td>${item.planned ? planLabel : restLabel}</td>
      </tr>
    `).join("");
    return `
      <table class="schedule-table">
        <thead>
          <tr>
            <th>${lang === "ja" ? "曜日" : "Day"}</th>
            <th>${lang === "ja" ? "内容" : "Plan"}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  };

  const renderChecklist = (lang, length) => {
    const items = Array.from({ length }, (_, idx) => {
      const label = lang === "ja" ? `${idx + 1}日目` : `Day ${idx + 1}`;
      return `
        <div class="check-item">
          <span class="check-box" aria-hidden="true"></span>
          <span class="check-label">${label}</span>
        </div>
      `;
    }).join("");

    return `<div class="checklist-grid">${items}</div>`;
  };

  const buildChecklistText = (lang, length) => {
    const lines = [];
    for (let i = 1; i <= length; i += 1) {
      lines.push(lang === "ja" ? `- [ ] ${i}日目` : `- [ ] Day ${i}`);
    }
    return lines.join("\n");
  };

  const buildPlanText = (lang, length) => {
    const data = buildPlanData(lang);
    const scheduleLines = data.schedule.map((item) => {
      const label = item.planned ? (lang === "ja" ? "実行" : "Do") : (lang === "ja" ? "休み/予備" : "Rest / buffer");
      return `${item.label}: ${label}`;
    }).join("\n");

    const header = lang === "ja" ? "【習慣プラン】" : "[Habit Plan]";
    const weeklyLabel = lang === "ja" ? "週間スケジュール" : "Weekly schedule";
    const checklistLabel = lang === "ja" ? "トラッキングチェックリスト" : "Tracking checklist";

    return [
      header,
      `${lang === "ja" ? "目標" : "Goal"}: ${data.goalSentence}`,
      `${lang === "ja" ? "最小行動(2分)" : "Minimum action (2-minute)"}: ${data.minimumAction}`,
      `${lang === "ja" ? "トリガー" : "Trigger"}: ${data.trigger}`,
      `${lang === "ja" ? "リカバリープラン" : "Recovery plan"}: ${data.recovery}`,
      "",
      `${weeklyLabel}:`,
      scheduleLines,
      "",
      `${checklistLabel} (${length} ${lang === "ja" ? "日" : "days"}):`,
      buildChecklistText(lang, length)
    ].join("\n");
  };

  const updateChecklistToggle = () => {
    document.querySelectorAll(".checklist-toggle button").forEach((btn) => {
      btn.classList.toggle("active", Number.parseInt(btn.dataset.length, 10) === checklistLength);
    });
  };

  const updateOutput = () => {
    document.querySelectorAll(".day-pill").forEach((label) => {
      const input = label.querySelector("input");
      label.classList.toggle("active", Boolean(input && input.checked));
    });

    const dataJa = buildPlanData("ja");
    const dataEn = buildPlanData("en");

    const setContent = (lang, data) => {
      document.getElementById(`goal-${lang}`).textContent = data.goalSentence;
      document.getElementById(`minimum-${lang}`).textContent = data.minimumAction;
      document.getElementById(`trigger-${lang}`).textContent = data.trigger;
      document.getElementById(`recovery-${lang}`).textContent = data.recovery;
      document.getElementById(`schedule-${lang}`).innerHTML = renderScheduleTable(lang, data.schedule);
      document.getElementById(`checklist-${lang}`).innerHTML = renderChecklist(lang, checklistLength);
    };

    setContent("ja", dataJa);
    setContent("en", dataEn);
    updateChecklistToggle();
  };

  const setPreset = (key) => {
    const preset = presets[key];
    if (!preset) return;
    const currentLang = document.documentElement.lang === "ja" ? "ja" : "en";
    document.getElementById("goal").value = preset.goal[currentLang];
    document.getElementById("availableTime").value = preset.availableTime[currentLang];
    document.getElementById("obstacles").value = preset.obstacles[currentLang];
    document.getElementById("motivation").value = preset.motivation;

    const dayInputs = Array.from(document.querySelectorAll("input[name='preferredDays']"));
    dayInputs.forEach((input) => {
      const dayValue = Number.parseInt(input.value, 10);
      input.checked = preset.preferredDays.includes(dayValue);
    });

    updateOutput();
  };

  const initTool = () => {
    const root = document.getElementById("toolRoot");
    root.innerHTML = `
      <div class="field">
        <label class="label">
          <span data-i18n="ja">プリセット</span>
          <span data-i18n="en" style="display:none;">Presets</span>
        </label>
        <div class="preset-group">
          <button class="chip" data-preset="exercise" type="button">
            <span data-i18n="ja">運動</span>
            <span data-i18n="en" style="display:none;">Exercise</span>
          </button>
          <button class="chip" data-preset="study" type="button">
            <span data-i18n="ja">学習</span>
            <span data-i18n="en" style="display:none;">Study</span>
          </button>
          <button class="chip" data-preset="sleep" type="button">
            <span data-i18n="ja">睡眠</span>
            <span data-i18n="en" style="display:none;">Sleep</span>
          </button>
        </div>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">目標（1文）</span>
          <span data-i18n="en" style="display:none;">Goal (one sentence)</span>
        </label>
        <input id="goal" class="input" type="text" placeholder="例: 毎日ストレッチを続ける" />
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">確保できる時間</span>
          <span data-i18n="en" style="display:none;">Available time</span>
        </label>
        <input id="availableTime" class="input" type="text" placeholder="例: 朝の10分 / 通勤中の15分" />
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">やりやすい曜日</span>
          <span data-i18n="en" style="display:none;">Preferred days</span>
        </label>
        <div class="day-grid">
          <label class="day-pill">
            <input type="checkbox" name="preferredDays" value="0" />
            <span data-i18n="ja">月</span>
            <span data-i18n="en" style="display:none;">Mon</span>
          </label>
          <label class="day-pill">
            <input type="checkbox" name="preferredDays" value="1" />
            <span data-i18n="ja">火</span>
            <span data-i18n="en" style="display:none;">Tue</span>
          </label>
          <label class="day-pill">
            <input type="checkbox" name="preferredDays" value="2" />
            <span data-i18n="ja">水</span>
            <span data-i18n="en" style="display:none;">Wed</span>
          </label>
          <label class="day-pill">
            <input type="checkbox" name="preferredDays" value="3" />
            <span data-i18n="ja">木</span>
            <span data-i18n="en" style="display:none;">Thu</span>
          </label>
          <label class="day-pill">
            <input type="checkbox" name="preferredDays" value="4" />
            <span data-i18n="ja">金</span>
            <span data-i18n="en" style="display:none;">Fri</span>
          </label>
          <label class="day-pill">
            <input type="checkbox" name="preferredDays" value="5" />
            <span data-i18n="ja">土</span>
            <span data-i18n="en" style="display:none;">Sat</span>
          </label>
          <label class="day-pill">
            <input type="checkbox" name="preferredDays" value="6" />
            <span data-i18n="ja">日</span>
            <span data-i18n="en" style="display:none;">Sun</span>
          </label>
        </div>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">障害になりそうなこと</span>
          <span data-i18n="en" style="display:none;">Likely obstacles</span>
        </label>
        <textarea id="obstacles" class="textarea" placeholder="例: 忙しくて時間が取れない"></textarea>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">モチベーションのタイプ</span>
          <span data-i18n="en" style="display:none;">Motivation type</span>
        </label>
        <select id="motivation" class="select">
          <option value="progress">進捗 / Progress</option>
          <option value="reward">ご褒美 / Reward</option>
          <option value="social">共有 / Social</option>
          <option value="identity">アイデンティティ / Identity</option>
        </select>
      </div>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" id="generateBtn" type="button">
          <span data-i18n="ja">プランを生成</span>
          <span data-i18n="en" style="display:none;">Generate plan</span>
        </button>
      </div>

      <div class="hr"></div>

      <div class="output">
        <div class="output-actions row">
          <button class="btn" id="copyPlanBtn" type="button">
            <span data-i18n="ja">プランをコピー</span>
            <span data-i18n="en" style="display:none;">Copy plan</span>
          </button>
          <button class="btn" id="copyChecklistBtn" type="button">
            <span data-i18n="ja">チェックリストのみ</span>
            <span data-i18n="en" style="display:none;">Copy checklist</span>
          </button>
          <button class="btn" id="downloadBtn" type="button">
            <span data-i18n="ja">.txt保存</span>
            <span data-i18n="en" style="display:none;">Download .txt</span>
          </button>
        </div>

        <div class="checklist-toggle">
          <span class="toggle-label" data-i18n="ja">トラッキング期間</span>
          <span class="toggle-label" data-i18n="en" style="display:none;">Tracking period</span>
          <div class="toggle-buttons">
            <button type="button" data-length="7">7</button>
            <button type="button" data-length="14">14</button>
            <button type="button" data-length="30">30</button>
          </div>
        </div>

        <div class="plan-content" id="plan-ja" data-i18n="ja">
          <div class="plan-section">
            <h3>目標</h3>
            <p id="goal-ja"></p>
          </div>
          <div class="plan-section">
            <h3>最小行動（2分）</h3>
            <p id="minimum-ja"></p>
          </div>
          <div class="plan-section">
            <h3>トリガー（いつ/どこで）</h3>
            <p id="trigger-ja"></p>
          </div>
          <div class="plan-section">
            <h3>リカバリープラン</h3>
            <p id="recovery-ja"></p>
          </div>
          <div class="plan-section">
            <h3>週間スケジュール（7日）</h3>
            <div id="schedule-ja"></div>
          </div>
          <div class="plan-section">
            <h3>トラッキングチェックリスト</h3>
            <div id="checklist-ja"></div>
          </div>
        </div>

        <div class="plan-content" id="plan-en" data-i18n="en" style="display:none;">
          <div class="plan-section">
            <h3>Goal</h3>
            <p id="goal-en"></p>
          </div>
          <div class="plan-section">
            <h3>Minimum action (2-minute)</h3>
            <p id="minimum-en"></p>
          </div>
          <div class="plan-section">
            <h3>Trigger (when/where)</h3>
            <p id="trigger-en"></p>
          </div>
          <div class="plan-section">
            <h3>Recovery plan</h3>
            <p id="recovery-en"></p>
          </div>
          <div class="plan-section">
            <h3>Weekly schedule (7-day)</h3>
            <div id="schedule-en"></div>
          </div>
          <div class="plan-section">
            <h3>Tracking checklist</h3>
            <div id="checklist-en"></div>
          </div>
        </div>
      </div>
    `;

    const debouncedUpdate = window.NW.debounce(updateOutput, 150);

    root.querySelectorAll("input, textarea, select").forEach((input) => {
      input.addEventListener("input", debouncedUpdate);
      input.addEventListener("change", debouncedUpdate);
    });

    root.querySelectorAll(".chip").forEach((button) => {
      button.addEventListener("click", () => setPreset(button.dataset.preset));
    });

    document.getElementById("generateBtn").addEventListener("click", updateOutput);

    document.getElementById("copyPlanBtn").addEventListener("click", async () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      await window.NW.copyToClipboard(buildPlanText(lang, checklistLength));
    });

    document.getElementById("copyChecklistBtn").addEventListener("click", async () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const label = lang === "ja" ? "トラッキングチェックリスト" : "Tracking checklist";
      const text = `${label} (${checklistLength} ${lang === "ja" ? "日" : "days"})\n${buildChecklistText(lang, checklistLength)}`;
      await window.NW.copyToClipboard(text);
    });

    document.getElementById("downloadBtn").addEventListener("click", () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = buildPlanText(lang, checklistLength);
      window.NW.downloadText(`habit-plan-${lang}.txt`, text);
    });

    document.querySelectorAll(".checklist-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => {
        checklistLength = Number.parseInt(btn.dataset.length, 10);
        updateOutput();
      });
    });

    updateOutput();
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
