/* Codex Usage Forecaster (NicheWorks) - TASK 05
   - Theme toggle (persisted)
   - Log storage (localStorage)
   - Basic forecast from deltas
   - Export/Import JSON
*/
(() => {
  // -------------------------
  // Theme toggle (TASK 03)
  // -------------------------
  const THEME_KEY = "nw_theme";
  const root = document.documentElement;

  function getPreferredTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (_) {}
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀" : "☾";
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }
  function saveTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  }
  applyTheme(getPreferredTheme());
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const cur = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = cur === "dark" ? "light" : "dark";
      applyTheme(next);
      saveTheme(next);
    });
  }

  // -------------------------
  // App: logs + forecast
  // -------------------------
  const KEY = "nw_cuf_v1";
  const isEN = location.pathname.includes("/en/");
  const T = {
    saved: isEN ? "Saved." : "保存した。",
    invalid: isEN ? "Invalid input (0-100)." : "入力が不正（0-100）",
    imported: isEN ? "Imported." : "インポートした。",
    importFail: isEN ? "Import failed." : "インポート失敗",
    empty: isEN ? "No logs yet" : "まだログがない",
    del: isEN ? "Delete" : "削除",
    confirmDel: isEN ? "Delete this log?" : "このログを削除する？",
    etaUnknown: isEN ? "—" : "—",
    needMore: isEN ? "Need at least 2 logs" : "ログが2件以上必要",
  };

  /** @typedef {{id:string, ts:number, u5h:number|null, uw:number|null, mode:string, model:string, note:string}} Log */

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data
        .filter(x => x && typeof x === "object" && typeof x.id === "string" && typeof x.ts === "number")
        .map(x => ({
          id: x.id,
          ts: x.ts,
          u5h: (typeof x.u5h === "number" ? x.u5h : null),
          uw: (typeof x.uw === "number" ? x.uw : null),
          mode: String(x.mode ?? ""),
          model: String(x.model ?? ""),
          note: String(x.note ?? ""),
        }))
        .sort((a,b) => b.ts - a.ts);
    } catch (_) {
      return [];
    }
  }

  function save(logs) {
    try {
      localStorage.setItem(KEY, JSON.stringify(logs));
    } catch (_) {}
  }

  function fmtDT(ts) {
    try {
      const d = new Date(ts);
      return d.toLocaleString(isEN ? "en-US" : "ja-JP", { hour12: false });
    } catch (_) { return String(ts); }
  }

  function clampPct(v) {
    if (v === "" || v == null) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    if (n < 0 || n > 100) return null;
    return Math.round(n * 10) / 10; // 0.1% precision
  }

  function id() {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  // Forecast:
  // - For each window, compute burn rate from recent deltas:
  //   delta% / deltaHours (5h) or deltaDays (week)
  // - Use median of last up to 5 deltas for robustness
  function median(nums) {
    const a = nums.slice().sort((x,y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid-1] + a[mid]) / 2;
  }

  function computeRates(logs, key) {
    // logs are newest-first; we need chronological
    const asc = logs.slice().sort((a,b) => a.ts - b.ts);
    const deltas = [];
    for (let i = 1; i < asc.length; i++) {
      const prev = asc[i-1];
      const cur = asc[i];
      const pv = key === "u5h" ? prev.u5h : prev.uw;
      const cv = key === "u5h" ? cur.u5h : cur.uw;
      if (typeof pv !== "number" || typeof cv !== "number") continue;
      const dtMs = cur.ts - prev.ts;
      if (dtMs <= 0) continue;
      const dPct = cv - pv;
      // ignore negative resets (window renewed) and 0 deltas
      if (dPct <= 0) continue;

      if (key === "u5h") {
        const hours = dtMs / (1000*60*60);
        if (hours <= 0) continue;
        deltas.push(dPct / hours); // % per hour
      } else {
        const days = dtMs / (1000*60*60*24);
        if (days <= 0) continue;
        deltas.push(dPct / days); // % per day
      }
    }
    if (!deltas.length) return null;
    const recent = deltas.slice(-5);
    return median(recent);
  }

  function etaFromRate(currentPct, rate, unit) {
    // rate: % per hour or % per day
    if (typeof currentPct !== "number" || !Number.isFinite(currentPct)) return null;
    if (typeof rate !== "number" || rate <= 0) return null;
    const remaining = 100 - currentPct;
    if (remaining <= 0) return 0;
    const t = remaining / rate; // hours or days
    return { t, unit };
  }

  function fmtETA(eta) {
    if (!eta) return T.etaUnknown;
    if (eta.t === 0) return isEN ? "Now" : "いま";
    const val = eta.t;
    if (eta.unit === "hour") {
      if (val < 1) return isEN ? "<1h" : "1時間未満";
      if (val < 48) return (isEN ? "" : "") + Math.round(val) + (isEN ? "h" : "時間");
      const days = val / 24;
      return Math.round(days) + (isEN ? "d" : "日");
    }
    // day
    if (val < 1) return isEN ? "<1d" : "1日未満";
    if (val < 14) return Math.round(val) + (isEN ? "d" : "日");
    const weeks = val / 7;
    return (Math.round(weeks*10)/10) + (isEN ? "w" : "週");
  }

  function fmtSub(currentPct, rate, kind) {
    if (typeof currentPct !== "number") return T.needMore;
    if (!rate) return T.needMore;
    if (kind === "u5h") {
      return (isEN ? "Burn: " : "燃費: ") + (Math.round(rate*10)/10) + (isEN ? "%/h" : "%/時");
    }
    return (isEN ? "Burn: " : "燃費: ") + (Math.round(rate*10)/10) + (isEN ? "%/day" : "%/日");
  }

  function render() {
    const logs = load();

    // latest snapshot values
    const latest = logs[0] || null;
    const cur5 = latest && typeof latest.u5h === "number" ? latest.u5h : null;
    const curW = latest && typeof latest.uw === "number" ? latest.uw : null;

    const rate5 = computeRates(logs, "u5h"); // %/hour
    const rateW = computeRates(logs, "uw");  // %/day

    const kpi5 = document.getElementById("kpi5h");
    const kpi5s = document.getElementById("kpi5hSub");
    const kpiW = document.getElementById("kpiW");
    const kpiWs = document.getElementById("kpiWSub");

    if (kpi5) kpi5.textContent = fmtETA(etaFromRate(cur5, rate5, "hour"));
    if (kpi5s) kpi5s.textContent = fmtSub(cur5, rate5, "u5h");
    if (kpiW) kpiW.textContent = fmtETA(etaFromRate(curW, rateW, "day"));
    if (kpiWs) kpiWs.textContent = fmtSub(curW, rateW, "uw");

    const body = document.getElementById("logBody");
    if (!body) return;

    if (!logs.length) {
      body.innerHTML = `<tr><td colspan="7" class="muted">${T.empty}</td></tr>`;
      return;
    }

    body.innerHTML = logs.map(l => {
      const u5 = (typeof l.u5h === "number") ? l.u5h.toFixed(1) : "—";
      const uw = (typeof l.uw === "number") ? l.uw.toFixed(1) : "—";
      const mode = l.mode ? `<span class="badge">${escapeHTML(l.mode)}</span>` : "—";
      const model = l.model ? escapeHTML(l.model) : "—";
      const note = l.note ? escapeHTML(l.note) : "—";
      return `<tr>
        <td>${escapeHTML(fmtDT(l.ts))}</td>
        <td>${u5}</td>
        <td>${uw}</td>
        <td>${mode}</td>
        <td>${model}</td>
        <td>${note}</td>
        <td><button class="btn danger" data-del="${escapeHTML(l.id)}">${T.del}</button></td>
      </tr>`;
    }).join("");

    // bind delete
    body.querySelectorAll("button[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del");
        if (!id) return;
        if (!confirm(T.confirmDel)) return;
        const next = load().filter(x => x.id !== id);
        save(next);
        render();
      });
    });
  }

  function escapeHTML(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // -------------------------
  // Form handlers
  // -------------------------
  function hook() {
    const in5h = document.getElementById("in5h");
    const inWeek = document.getElementById("inWeek");
    const inMode = document.getElementById("inMode");
    const inModel = document.getElementById("inModel");
    const inNote = document.getElementById("inNote");
    const btnSave = document.getElementById("btnSave");
    const hint = document.getElementById("saveHint");

    const btnExport = document.getElementById("btnExport");
    const btnImport = document.getElementById("btnImport");
    const fileImport = document.getElementById("fileImport");

    if (btnSave) {
      btnSave.addEventListener("click", () => {
        const u5h = in5h ? clampPct(in5h.value.trim()) : null;
        const uw = inWeek ? clampPct(inWeek.value.trim()) : null;

        // allow one side empty, but not both
        if (u5h == null and uw == null) {
          if (hint) hint.textContent = T.invalid;
          return;
        }
        if ((in5h && in5h.value.trim() !== "" && u5h == null) || (inWeek && inWeek.value.trim() !== "" && uw == null)) {
          if (hint) hint.textContent = T.invalid;
          return;
        }

        const logs = load();
        logs.unshift({
          id: id(),
          ts: Date.now(),
          u5h,
          uw,
          mode: inMode ? String(inMode.value || "") : "",
          model: inModel ? String(inModel.value || "") : "",
          note: inNote ? String(inNote.value || "") : "",
        });

        save(logs);

        if (hint) hint.textContent = T.saved;
        if (in5h) in5h.value = "";
        if (inWeek) inWeek.value = "";
        if (inModel) inModel.value = "";
        if (inNote) inNote.value = "";
        render();
        setTimeout(() => { if (hint) hint.textContent = ""; }, 1500);
      });
    }

    if (btnExport) {
      btnExport.addEventListener("click", () => {
        const logs = load();
        const blob = new Blob([JSON.stringify({ version: 1, exportedAt: Date.now(), logs }, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "codex-usage-forecaster-logs.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 500);
      });
    }

    if (btnImport && fileImport) {
      btnImport.addEventListener("click", () => fileImport.click());
      fileImport.addEventListener("change", async () => {
        const f = fileImport.files && fileImport.files[0];
        if (!f) return;
        try {
          const text = await f.text();
          const data = JSON.parse(text);
          const incoming = Array.isArray(data) ? data : (data && Array.isArray(data.logs) ? data.logs : []);
          if (!Array.isArray(incoming)) throw new Error("invalid");

          const normalized = incoming.map(x => ({
            id: String(x.id ?? id()),
            ts: Number(x.ts ?? Date.now()),
            u5h: (typeof x.u5h === "number" ? x.u5h : null),
            uw: (typeof x.uw === "number" ? x.uw : null),
            mode: String(x.mode ?? ""),
            model: String(x.model ?? ""),
            note: String(x.note ?? ""),
          })).filter(x => Number.isFinite(x.ts));

          save(normalized.sort((a,b) => b.ts - a.ts));
          if (hint) hint.textContent = T.imported;
          render();
          setTimeout(() => { if (hint) hint.textContent = ""; }, 1500);
        } catch (e) {
          if (hint) hint.textContent = T.importFail;
        } finally {
          fileImport.value = "";
        }
      });
    }
  }

  // init
  hook();
  render();
})();
