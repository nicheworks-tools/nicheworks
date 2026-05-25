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

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    // Tool-specific init should be appended below by Codex per tool.
    // Example:
    // initTool();
  });
})();

(() => {
  "use strict";

  const STORAGE_KEY = "nw_mini_game_scores";

  const pad = (value) => String(value).padStart(2, "0");
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${pad(mins)}:${pad(secs)}`;
  };

  const loadScores = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  };

  const saveScores = (scores) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (_) {}
  };

  const renderHistory = (scores, out) => {
    if (scores.length === 0) {
      out.textContent = "-";
      return;
    }
    const lines = scores.map((item, idx) => {
      return `${idx + 1}. ${item.name} | ${item.score} | ${item.time}`;
    });
    out.textContent = lines.join("\n");
  };

  const initTool = () => {
    const timerDisplay = document.getElementById("timerDisplay");
    const btnStart = document.getElementById("btnStart");
    const btnPause = document.getElementById("btnPause");
    const btnReset = document.getElementById("btnReset");
    const btnAdd = document.getElementById("btnAdd");
    const btnExport = document.getElementById("btnExport");
    const btnClear = document.getElementById("btnClear");
    const playerName = document.getElementById("playerName");
    const scoreValue = document.getElementById("scoreValue");
    const history = document.getElementById("history");

    let seconds = 0;
    let timerId = null;
    let scores = loadScores();

    const tick = () => {
      seconds += 1;
      timerDisplay.textContent = formatTime(seconds);
    };

    const startTimer = () => {
      if (timerId) return;
      timerId = setInterval(tick, 1000);
    };

    const pauseTimer = () => {
      if (!timerId) return;
      clearInterval(timerId);
      timerId = null;
    };

    const resetTimer = () => {
      pauseTimer();
      seconds = 0;
      timerDisplay.textContent = formatTime(seconds);
    };

    const addScore = () => {
      const name = playerName.value.trim() || "Player";
      const score = Number(scoreValue.value);
      const safeScore = Number.isFinite(score) ? score : 0;
      const entry = {
        name,
        score: safeScore,
        time: new Date().toLocaleString()
      };
      scores = [entry, ...scores].slice(0, 50);
      saveScores(scores);
      renderHistory(scores, history);
      scoreValue.value = "";
    };

    btnStart.addEventListener("click", startTimer);
    btnPause.addEventListener("click", pauseTimer);
    btnReset.addEventListener("click", resetTimer);
    btnAdd.addEventListener("click", addScore);

    btnExport.addEventListener("click", () => {
      if (scores.length === 0) return;
      const header = "name,score,time";
      const rows = scores.map((item) => `${item.name},${item.score},${item.time}`);
      window.NW.downloadText("mini-game-scores.csv", [header, ...rows].join("\n"));
    });

    btnClear.addEventListener("click", () => {
      scores = [];
      saveScores(scores);
      renderHistory(scores, history);
    });

    timerDisplay.textContent = formatTime(seconds);
    renderHistory(scores, history);
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
