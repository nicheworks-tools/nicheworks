(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  let currentLang = "ja";
  let checklistLength = 7;
  let hasGenerated = false;

  const dayLabels = {
    ja: ["月", "火", "水", "木", "金", "土", "日"],
    en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  };

  const messages = {
    ja: {
      goalRequired: "目標を入力してください。",
      generated: "プランを生成しました。",
      notGenerated: "先にプランを生成してください。",
      copyOk: "コピーしました。",
      copyNg: "コピーできませんでした。手動で選択してコピーしてください。",
      saved: "TXTを保存しました。",
      restNote: "休み/予備日は、できなかった日の穴埋めではなく、無理なく続けるための余白です。",
      dailyNote: "毎日になっています。負担が大きい場合は、休み/予備日を入れて調整してください。"
    },
    en: {
      goalRequired: "Enter a goal first.",
      generated: "Plan generated.",
      notGenerated: "Generate a plan first.",
      copyOk: "Copied.",
      copyNg: "Copy failed. Please select and copy manually.",
      saved: "TXT saved.",
      restNote: "Rest/buffer days are not make-up days; they are space for sustainable restart.",
      dailyNote: "This is set to every day. Add rest/buffer days if that feels too heavy."
    }
  };

  const motivationTips = {
    progress: {
      ja: "進捗を1行で記録して見える化する。",
      en: "Log a one-line progress note to make it visible."
    },
    reward: {
      ja: "完了後に小さなご褒美を用意する。",
      en: "Set a small reward right after completion."
    },
    social: {
      ja: "無理のない範囲で誰かに完了報告する。",
      en: "Report completion to someone when it feels reasonable."
    },
    identity: {
      ja: "『◯◯な人』としての小さな行動を意識する。",
      en: "Focus on a small action that matches the kind of person you want to be."
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
      goal: { ja: "就寝前の画面時間を減らす", en: "Reduce screen time before bed" },
      availableTime: { ja: "就寝30分前", en: "30 minutes before bed" },
      preferredDays: [0, 1, 2, 3, 4],
      obstacles: { ja: "夜にスマホを見続けてしまう", en: "Keep using the phone at night" },
      motivation: "reward"
    }
  };

  const $ = (id) => document.getElementById(id);
  const getValue = (id) => ($(id) ? $(id).value.trim() : "");

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const showToast = (message) => {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.hidden = true;
      toast.textContent = "";
    }, 2400);
  };

  const applyLang = (lang) => {
    currentLang = lang === "en" ? "en" : "ja";
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === currentLang));
    document.documentElement.lang = currentLang;
    try { localStorage.setItem("nw_lang", currentLang); } catch (_) {}
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

  const copyToClipboard = async (text) => {
    if (!text) return false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }

    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    } finally {
      document.body.removeChild(ta);
    }
    return ok;
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

  const todayStamp = () => {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  const setActionsEnabled = (enabled) => {
    ["copyPlanBtn", "copyChecklistBtn", "downloadBtn"].forEach((id) => {
      const button = $(id);
      if (button) button.disabled = !enabled;
    });
  };

  const getSelectedDays = () => {
    const checked = Array.from(document.querySelectorAll("input[name='preferredDays']:checked"))
      .map((input) => Number.parseInt(input.value, 10))
      .filter((value) => Number.isInteger(value));
    return checked.length > 0 ? checked : [0, 1, 2, 3, 4, 5, 6];
  };

  const formatDays = (lang, days) => {
    if (days.length === 7) return lang === "ja" ? "毎日" : "every day";
    const labels = days.map((idx) => dayLabels[lang][idx]);
    return lang === "ja" ? labels.join("・") : labels.join("/");
  };

  const updateDayPills = () => {
    document.querySelectorAll(".day-pill").forEach((label) => {
      const input = label.querySelector("input");
      label.classList.toggle("active", Boolean(input && input.checked));
    });
  };

  const updateChecklistToggle = () => {
    document.querySelectorAll(".checklist-toggle button").forEach((btn) => {
      btn.classList.toggle("active", Number.parseInt(btn.dataset.length, 10) === checklistLength);
    });
  };

  const clearGoalError = () => {
    const error = $("goalError");
    if (error) error.textContent = "";
    const goal = $("goal");
    if (goal) goal.removeAttribute("aria-invalid");
  };

  const validateGoal = () => {
    const goal = getValue("goal");
    const error = $("goalError");
    const goalInput = $("goal");
    if (goal) {
      clearGoalError();
      return true;
    }
    if (error) error.textContent = messages[currentLang].goalRequired;
    if (goalInput) {
      goalInput.setAttribute("aria-invalid", "true");
      goalInput.focus();
    }
    showToast(messages[currentLang].goalRequired);
    return false;
  };

  const buildPlanData = (lang) => {
    const goal = getValue("goal");
    const availableTime = getValue("availableTime");
    const obstacles = getValue("obstacles") || (lang === "ja" ? "特に書かれていません" : "not specified");
    const motivation = getValue("motivation") || "progress";
    const days = getSelectedDays();
    const daysLabel = formatDays(lang, days);
    const timeText = availableTime || (lang === "ja" ? "自分で決めた短い時間" : "a short time you choose");
    const motivationTip = motivationTips[motivation] ? motivationTips[motivation][lang] : "";

    const goalSentence = lang === "ja" ? `${goal}を続ける。` : `Keep doing: ${goal}.`;
    const minimumAction = lang === "ja"
      ? `2分版：${goal}に少しだけ取りかかる。準備だけでもよく、無理に量を増やさない。`
      : `2-minute version: start ${goal} briefly. Prep-only is fine, and you do not need to force more volume.`;
    const trigger = lang === "ja"
      ? `${daysLabel}の${timeText}に、始めやすい場所で開始する。毎日が重い場合は休み/予備日を入れて調整する。`
      : `On ${daysLabel}, start at ${timeText} in an easy-to-start place. Add rest/buffer days if every day feels too heavy.`;
    const recovery = lang === "ja"
      ? `できなかった日は失敗扱いせず、次の予定日に2分版から再開する。障害になりそうなこと：${obstacles}。${motivationTip}`
      : `Do not treat a missed day as failure; restart with the 2-minute version on the next planned day. Likely obstacle: ${obstacles}. ${motivationTip}`;
    const schedule = dayLabels[lang].map((label, idx) => ({
      label,
      planned: days.includes(idx)
    }));
    const scheduleNote = days.length === 7 ? messages[lang].dailyNote : messages[lang].restNote;

    return { goalSentence, minimumAction, trigger, recovery, schedule, scheduleNote };
  };

  const renderScheduleTable = (targetId, lang, schedule) => {
    const target = $(targetId);
    if (!target) return;
    target.textContent = "";

    const table = document.createElement("table");
    table.className = "schedule-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    [lang === "ja" ? "曜日" : "Day", lang === "ja" ? "内容" : "Plan"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    schedule.forEach((item) => {
      const row = document.createElement("tr");
      const dayCell = document.createElement("th");
      dayCell.textContent = item.label;
      const planCell = document.createElement("td");
      planCell.textContent = item.planned
        ? (lang === "ja" ? "実行" : "Do")
        : (lang === "ja" ? "休み/予備" : "Rest / buffer");
      row.appendChild(dayCell);
      row.appendChild(planCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    target.appendChild(table);
  };

  const renderChecklist = (targetId, lang, length) => {
    const target = $(targetId);
    if (!target) return;
    target.textContent = "";

    const grid = document.createElement("div");
    grid.className = "checklist-grid";
    Array.from({ length }, (_, idx) => idx + 1).forEach((day) => {
      const item = document.createElement("div");
      item.className = "check-item";
      const box = document.createElement("span");
      box.className = "check-box";
      box.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.className = "check-label";
      label.textContent = lang === "ja" ? `${day}日目` : `Day ${day}`;
      item.appendChild(box);
      item.appendChild(label);
      grid.appendChild(item);
    });
    target.appendChild(grid);
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
    const disclaimer = lang === "ja"
      ? "注意: これは一般的な習慣化プランのたたき台であり、医療・運動・睡眠の専門助言ではありません。"
      : "Note: This is a general habit-planning draft, not medical, exercise, or sleep advice.";

    return [
      header,
      `${lang === "ja" ? "目標" : "Goal"}: ${data.goalSentence}`,
      `${lang === "ja" ? "最小行動(2分)" : "Minimum action (2-minute)"}: ${data.minimumAction}`,
      `${lang === "ja" ? "トリガー" : "Trigger"}: ${data.trigger}`,
      `${lang === "ja" ? "リカバリープラン" : "Recovery plan"}: ${data.recovery}`,
      `${lang === "ja" ? "補足" : "Note"}: ${data.scheduleNote}`,
      "",
      `${weeklyLabel}:`,
      scheduleLines,
      "",
      `${checklistLabel} (${length} ${lang === "ja" ? "日" : "days"}):`,
      buildChecklistText(lang, length),
      "",
      disclaimer
    ].join("\n");
  };

  const renderOutputForLang = (lang) => {
    const data = buildPlanData(lang);
    $(`goal-${lang}`).textContent = data.goalSentence;
    $(`minimum-${lang}`).textContent = data.minimumAction;
    $(`trigger-${lang}`).textContent = data.trigger;
    $(`recovery-${lang}`).textContent = data.recovery;
    $(`schedule-note-${lang}`).textContent = data.scheduleNote;
    renderScheduleTable(`schedule-${lang}`, lang, data.schedule);
    renderChecklist(`checklist-${lang}`, lang, checklistLength);
  };

  const renderOutput = () => {
    updateDayPills();
    updateChecklistToggle();
    if (!hasGenerated) return;
    renderOutputForLang("ja");
    renderOutputForLang("en");
  };

  const generatePlan = () => {
    if (!validateGoal()) return;
    hasGenerated = true;
    $("outputEmpty").hidden = true;
    $("outputGenerated").hidden = false;
    setActionsEnabled(true);
    renderOutput();
    showToast(messages[currentLang].generated);
  };

  const ensureGenerated = () => {
    if (hasGenerated) return true;
    showToast(messages[currentLang].notGenerated);
    return false;
  };

  const setPreset = (key) => {
    const preset = presets[key];
    if (!preset) return;
    $("goal").value = preset.goal[currentLang];
    $("availableTime").value = preset.availableTime[currentLang];
    $("obstacles").value = preset.obstacles[currentLang];
    $("motivation").value = preset.motivation;

    const dayInputs = Array.from(document.querySelectorAll("input[name='preferredDays']"));
    dayInputs.forEach((input) => {
      const dayValue = Number.parseInt(input.value, 10);
      input.checked = preset.preferredDays.includes(dayValue);
    });

    clearGoalError();
    updateDayPills();
    if (hasGenerated) renderOutput();
  };

  const bindEvents = () => {
    $("habitForm").addEventListener("submit", (event) => {
      event.preventDefault();
      generatePlan();
    });

    $("goal").addEventListener("input", () => {
      clearGoalError();
      if (hasGenerated) renderOutput();
    });

    ["availableTime", "obstacles", "motivation"].forEach((id) => {
      $(id).addEventListener("input", () => {
        if (hasGenerated) renderOutput();
      });
      $(id).addEventListener("change", () => {
        if (hasGenerated) renderOutput();
      });
    });

    document.querySelectorAll("input[name='preferredDays']").forEach((input) => {
      input.addEventListener("change", () => {
        updateDayPills();
        if (hasGenerated) renderOutput();
      });
    });

    document.querySelectorAll(".chip").forEach((button) => {
      button.addEventListener("click", () => setPreset(button.dataset.preset));
    });

    $("copyPlanBtn").addEventListener("click", async () => {
      if (!ensureGenerated()) return;
      const ok = await copyToClipboard(buildPlanText(currentLang, checklistLength));
      showToast(ok ? messages[currentLang].copyOk : messages[currentLang].copyNg);
    });

    $("copyChecklistBtn").addEventListener("click", async () => {
      if (!ensureGenerated()) return;
      const label = currentLang === "ja" ? "トラッキングチェックリスト" : "Tracking checklist";
      const text = `${label} (${checklistLength} ${currentLang === "ja" ? "日" : "days"})\n${buildChecklistText(currentLang, checklistLength)}`;
      const ok = await copyToClipboard(text);
      showToast(ok ? messages[currentLang].copyOk : messages[currentLang].copyNg);
    });

    $("downloadBtn").addEventListener("click", () => {
      if (!ensureGenerated()) return;
      downloadText(`habit-plan-${currentLang}-${todayStamp()}.txt`, buildPlanText(currentLang, checklistLength));
      showToast(messages[currentLang].saved);
    });

    document.querySelectorAll(".checklist-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => {
        checklistLength = Number.parseInt(btn.dataset.length, 10);
        renderOutput();
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    bindEvents();
    updateDayPills();
    updateChecklistToggle();
    setActionsEnabled(false);
  });
})();
