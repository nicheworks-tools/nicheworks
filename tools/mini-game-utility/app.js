(() => {
  "use strict";

  const STORAGE_KEY = "nw_mini_game_scores";
  const MAX_HISTORY = 50;

  let currentLang = "ja";

  const $ = (id) => document.getElementById(id);
  const pad = (value) => String(value).padStart(2, "0");
  const t = (ja, en) => (currentLang === "ja" ? ja : en);

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    currentLang = lang === "en" ? "en" : "ja";
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });
    langButtons().forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === currentLang);
    });
    document.documentElement.lang = currentLang;
    try {
      localStorage.setItem("nw_lang", currentLang);
    } catch (_) {}
    document.dispatchEvent(new CustomEvent("nw:lang", { detail: { lang: currentLang } }));
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((button) => {
      button.addEventListener("click", () => applyLang(button.dataset.lang));
    });
    applyLang(lang);
  };

  const formatTime = (totalSeconds) => {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${pad(mins)}:${pad(secs)}`;
  };

  const formatDateForDisplay = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || "-");
    return date.toLocaleString(currentLang === "ja" ? "ja-JP" : "en-US");
  };

  const normalizeScore = (entry, index) => {
    if (!entry || typeof entry !== "object") return null;
    const score = Number(entry.score);
    if (!Number.isFinite(score) || score < 0) return null;

    const name = String(entry.name || "").trim() || `Player ${index + 1}`;
    const createdAt = typeof entry.createdAt === "string"
      ? entry.createdAt
      : (typeof entry.time === "string" ? entry.time : new Date().toISOString());
    const elapsed = Number(entry.elapsedSeconds);

    return {
      name: name.slice(0, 80),
      score,
      createdAt,
      elapsedSeconds: Number.isFinite(elapsed) && elapsed >= 0 ? Math.floor(elapsed) : null
    };
  };

  const loadScores = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeScore).filter(Boolean).slice(0, MAX_HISTORY);
    } catch (_) {
      return [];
    }
  };

  const saveScores = (scores) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_HISTORY)));
    } catch (_) {}
  };

  const csvCell = (value) => {
    const text = String(value ?? "");
    const escaped = text.replace(/"/g, '""');
    return /[",\r\n]/.test(text) ? `"${escaped}"` : escaped;
  };

  const buildCsv = (scores) => {
    const header = ["name", "score", "createdAt", "elapsedSeconds", "elapsedTime"];
    const rows = scores.map((entry) => [
      entry.name,
      entry.score,
      entry.createdAt,
      entry.elapsedSeconds ?? "",
      entry.elapsedSeconds == null ? "" : formatTime(entry.elapsedSeconds)
    ]);
    return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  };

  const buildHistoryText = (scores) => {
    if (scores.length === 0) return "";
    return scores.map((entry, index) => {
      const elapsed = entry.elapsedSeconds == null ? "-" : formatTime(entry.elapsedSeconds);
      return `${index + 1}. ${entry.name} | ${entry.score} | ${formatDateForDisplay(entry.createdAt)} | ${elapsed}`;
    }).join("\n");
  };

  const downloadText = (filename, text, type = "text/plain;charset=utf-8") => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_) {
      copied = false;
    } finally {
      textarea.remove();
    }
    return copied;
  };

  const makeFileDate = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const initTool = () => {
    const timerDisplay = $("timerDisplay");
    const btnStart = $("btnStart");
    const btnPause = $("btnPause");
    const btnReset = $("btnReset");
    const btnAdd = $("btnAdd");
    const btnExport = $("btnExport");
    const btnCopyCsv = $("btnCopyCsv");
    const btnCopyHistory = $("btnCopyHistory");
    const btnClear = $("btnClear");
    const playerName = $("playerName");
    const scoreValue = $("scoreValue");
    const statusMessage = $("statusMessage");
    const historyEmpty = $("historyEmpty");
    const historyTableWrap = $("historyTableWrap");
    const historyBody = $("historyBody");

    if (!timerDisplay || !btnStart || !btnPause || !btnReset || !btnAdd || !btnExport || !btnClear || !playerName || !scoreValue || !statusMessage || !historyEmpty || !historyTableWrap || !historyBody) {
      return;
    }

    let seconds = 0;
    let timerId = null;
    let scores = loadScores();
    let clearArmed = false;
    let clearTimerId = null;
    let statusTimerId = null;

    const showMessage = (ja, en, kind = "info") => {
      clearTimeout(statusTimerId);
      statusMessage.textContent = t(ja, en);
      statusMessage.className = `status ${kind}`;
      statusTimerId = setTimeout(() => {
        statusMessage.textContent = "";
        statusMessage.className = "status";
      }, 3600);
    };

    const resetClearConfirm = () => {
      clearArmed = false;
      btnClear.classList.remove("is-armed");
      clearTimeout(clearTimerId);
    };

    const nextPlayerName = () => {
      const maxNumber = scores.reduce((max, entry) => {
        const match = /^Player\s+(\d+)$/i.exec(entry.name);
        return match ? Math.max(max, Number(match[1])) : max;
      }, 0);
      return `Player ${maxNumber + 1}`;
    };

    const renderHistory = () => {
      historyBody.textContent = "";

      if (scores.length === 0) {
        historyEmpty.hidden = false;
        historyTableWrap.hidden = true;
        return;
      }

      historyEmpty.hidden = true;
      historyTableWrap.hidden = false;

      scores.forEach((entry, index) => {
        const row = document.createElement("tr");
        const values = [
          String(index + 1),
          entry.name,
          String(entry.score),
          formatDateForDisplay(entry.createdAt),
          entry.elapsedSeconds == null ? "-" : formatTime(entry.elapsedSeconds)
        ];

        values.forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn small danger";
        deleteButton.textContent = t("削除", "Delete");
        deleteButton.dataset.index = String(index);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        historyBody.appendChild(row);
      });
    };

    const pauseTimer = () => {
      if (!timerId) return;
      clearInterval(timerId);
      timerId = null;
    };

    const updateTimerDisplay = () => {
      timerDisplay.textContent = formatTime(seconds);
    };

    const startTimer = () => {
      if (timerId) return;
      timerId = setInterval(() => {
        seconds += 1;
        updateTimerDisplay();
      }, 1000);
    };

    const resetTimer = () => {
      const wasRunning = Boolean(timerId);
      pauseTimer();
      seconds = 0;
      updateTimerDisplay();
      showMessage(
        wasRunning ? "タイマーを停止してリセットしました。" : "タイマーをリセットしました。",
        wasRunning ? "Timer was paused and reset." : "Timer reset."
      );
    };

    const addScore = () => {
      resetClearConfirm();
      const rawScore = scoreValue.value.trim();
      if (rawScore === "") {
        showMessage("スコアを入力してください。0点を記録する場合は 0 と入力してください。", "Enter a score. To save a zero score, type 0.", "error");
        scoreValue.focus();
        return;
      }

      const score = Number(rawScore);
      if (!Number.isFinite(score)) {
        showMessage("スコアは数値で入力してください。", "Score must be a number.", "error");
        scoreValue.focus();
        return;
      }

      if (score < 0) {
        showMessage("初期版では負のスコアは記録できません。", "Negative scores are not supported in this version.", "error");
        scoreValue.focus();
        return;
      }

      const name = playerName.value.trim() || nextPlayerName();
      const entry = {
        name: name.slice(0, 80),
        score,
        createdAt: new Date().toISOString(),
        elapsedSeconds: seconds
      };

      scores = [entry, ...scores].slice(0, MAX_HISTORY);
      saveScores(scores);
      renderHistory();
      scoreValue.value = "";
      showMessage("スコアを記録しました。", "Score added.", "success");
    };

    const ensureScores = () => {
      if (scores.length > 0) return true;
      showMessage("履歴がありません。先にスコアを記録してください。", "No history yet. Add a score first.", "error");
      return false;
    };

    const exportCsv = () => {
      resetClearConfirm();
      if (!ensureScores()) return;
      const filename = `mini-game-scores-${makeFileDate()}.csv`;
      downloadText(filename, buildCsv(scores), "text/csv;charset=utf-8");
      showMessage("CSVを保存しました。", "CSV saved.", "success");
    };

    const copyCsv = async () => {
      resetClearConfirm();
      if (!ensureScores()) return;
      const copied = await copyToClipboard(buildCsv(scores));
      showMessage(copied ? "CSVをコピーしました。" : "コピーに失敗しました。", copied ? "CSV copied." : "Copy failed.", copied ? "success" : "error");
    };

    const copyHistory = async () => {
      resetClearConfirm();
      if (!ensureScores()) return;
      const copied = await copyToClipboard(buildHistoryText(scores));
      showMessage(copied ? "履歴をコピーしました。" : "コピーに失敗しました。", copied ? "History copied." : "Copy failed.", copied ? "success" : "error");
    };

    const clearHistory = () => {
      if (!ensureScores()) return;

      if (!clearArmed) {
        clearArmed = true;
        btnClear.classList.add("is-armed");
        showMessage("履歴を削除するには、数秒以内にもう一度押してください。", "Press Clear history again within a few seconds to delete all history.", "warning");
        clearTimerId = setTimeout(resetClearConfirm, 4000);
        return;
      }

      scores = [];
      saveScores(scores);
      renderHistory();
      resetClearConfirm();
      showMessage("履歴を削除しました。", "History cleared.", "success");
    };

    btnStart.addEventListener("click", () => {
      resetClearConfirm();
      startTimer();
    });
    btnPause.addEventListener("click", () => {
      resetClearConfirm();
      pauseTimer();
      showMessage("タイマーを一時停止しました。", "Timer paused.");
    });
    btnReset.addEventListener("click", resetTimer);
    btnAdd.addEventListener("click", addScore);
    btnExport.addEventListener("click", exportCsv);
    btnCopyCsv.addEventListener("click", copyCsv);
    btnCopyHistory.addEventListener("click", copyHistory);
    btnClear.addEventListener("click", clearHistory);
    historyBody.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const index = Number(target.dataset.index);
      if (!Number.isInteger(index) || index < 0 || index >= scores.length) return;
      scores.splice(index, 1);
      saveScores(scores);
      renderHistory();
      resetClearConfirm();
      showMessage("1件削除しました。", "Entry deleted.", "success");
    });

    document.addEventListener("nw:lang", renderHistory);

    updateTimerDisplay();
    renderHistory();
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTool();
  });
})();
