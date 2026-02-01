/* Codex Usage Forecaster (NicheWorks)
   TASK 05: logs + burn-rate ETA
   TASK 06: usage/howto pages
   TASK 07: filters (mode/model/status/note) + status field + reset estimation + KPI split
*/
(() => {
  // -------------------------
  // Theme toggle
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
  const KEY = "nw_cuf_v2"; // bump (v1 still importable)
  const LEGACY_KEY = "nw_cuf_v1";
  const isEN = location.pathname.includes("/en/");
  const T = {
    saved: isEN ? "Saved." : "保存した。",
    invalid: isEN ? "Invalid input (0-100)." : "入力が不正（0-100）",
    imported: isEN ? "Imported." : "インポートした。",
    importFail: isEN ? "Import failed." : "インポート失敗",
    empty: isEN ? "No logs yet" : "まだログがない",
    del: isEN ? "Delete" : "削除",
    confirmDel: isEN ? "Delete this log?" : "このログを削除する？",
    etaUnknown: "—",
    needMore: isEN ? "Need at least 2 logs" : "ログが2件以上必要",
    showing: isEN ? "Showing" : "表示",
    of: isEN ? "of" : "/",
    logs: isEN ? "logs" : "件",
    resetETA: isEN ? "Reset ETA" : "リセットまで",
    resetAt: isEN ? "Next reset" : "次のリセット",
    mightResetFirst: isEN ? "Reset likely before depletion" : "枠更新が先に来そう",
  };

  /** @typedef {{id:string, ts:number, u5h:number|null, uw:number|null, mode:string, status:string, model:string, note:string}} Log */

  function loadRawFrom(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data;
    } catch (_) { return null; }
  }

  function normalizeLogs(data) {
    if (!Array.isArray(data)) return [];
    return data
      .filter(x => x && typeof x === "object" && typeof x.ts === "number")
      .map(x => ({
        id: String(x.id ?? (Math.random().toString(16).slice(2) + "-" + Date.now().toString(16))),
        ts: Number(x.ts),
        u5h: (typeof x.u5h === "number" ? x.u5h : null),
        uw: (typeof x.uw === "number" ? x.uw : null),
        mode: String(x.mode ?? ""),
        status: String(x.status ?? "unknown"),
        model: String(x.model ?? ""),
        note: String(x.note ?? ""),
      }))
      .filter(x => Number.isFinite(x.ts))
      .sort((a,b) => b.ts - a.ts);
  }

  function load() {
    // prefer v2
    const v2 = loadRawFrom(KEY);
    if (v2) return normalizeLogs(v2);

    // migrate v1 once if exists
    const v1 = loadRawFrom(LEGACY_KEY);
    if (v1) {
      const logs = normalizeLogs(v1);
      save(logs);
      try { localStorage.removeItem(LEGACY_KEY); } catch (_) {}
      return logs;
    }
    return [];
  }

  function save(logs) {
    try { localStorage.setItem(KEY, JSON.stringify(logs)); } catch (_) {}
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
    return Math.round(n * 10) / 10; // 0.1%
  }

  function id() {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
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
  // Forecast helpers
  // -------------------------
  function median(nums) {
    const a = nums.slice().sort((x,y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid-1] + a[mid]) / 2;
  }

  function computeRates(logs, key) {
    // asc
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

      // Only positive deltas contribute to burn rate
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
    return median(deltas.slice(-5));
  }

  function etaFromRate(currentPct, rate, unit) {
    if (typeof currentPct !== "number" || !Number.isFinite(currentPct)) return null;
    if (typeof rate !== "number" || rate <= 0) return null;
    const remaining = 100 - currentPct;
    if (remaining <= 0) return 0;
    const t = remaining / rate; // hours or days
    return { t, unit };
  }

  function fmtETA(eta) {
    if (eta == null) return T.etaUnknown;
    if (eta === 0) return isEN ? "Now" : "いま";
    if (typeof eta === "number") return eta === 0 ? (isEN ? "Now" : "いま") : T.etaUnknown;
    const val = eta.t;

    if (eta.unit === "hour") {
      if (val < 1) return isEN ? "<1h" : "1時間未満";
      if (val < 48) return Math.round(val) + (isEN ? "h" : "時間");
      const days = val / 24;
      return Math.round(days) + (isEN ? "d" : "日");
    }
    // day
    if (val < 1) return isEN ? "<1d" : "1日未満";
    if (val < 14) return Math.round(val) + (isEN ? "d" : "日");
    const weeks = val / 7;
    return (Math.round(weeks*10)/10) + (isEN ? "w" : "週");
  }

  function fmtBurn(currentPct, rate, kind) {
    if (typeof currentPct !== "number") return T.needMore;
    if (!rate) return T.needMore;
    if (kind === "u5h") {
      return (isEN ? "Burn: " : "燃費: ") + (Math.round(rate*10)/10) + (isEN ? "%/h" : "%/時");
    }
    return (isEN ? "Burn: " : "燃費: ") + (Math.round(rate*10)/10) + (isEN ? "%/day" : "%/日");
  }

  // Reset estimation:
  // Heuristic: detect a "reset drop" where % decreases by >= threshold.
  // Anchor = timestamp of the log AFTER the drop (cur.ts). If no drop, anchor = earliest log timestamp.
  // Next reset = anchor + periodMs (+k*periodMs until > now)
  function estimateNextResetTs(logs, key, periodMs, dropThresholdPct) {
    if (!logs.length) return null;
    const asc = logs.slice().sort((a,b) => a.ts - b.ts);

    let anchorTs = asc[0].ts; // fallback: first observation
    for (let i = 1; i < asc.length; i++) {
      const prev = asc[i-1];
      const cur = asc[i];
      const pv = key === "u5h" ? prev.u5h : prev.uw;
      const cv = key === "u5h" ? cur.u5h : cur.uw;
      if (typeof pv !== "number" || typeof cv !== "number") continue;
      const d = cv - pv;
      if (d <= -dropThresholdPct) {
        // likely reset happened between prev and cur; anchor at cur
        anchorTs = cur.ts;
      }
    }

    const now = Date.now();
    let next = anchorTs + periodMs;
    // push forward in case anchor is old
    while (next <= now) next += periodMs;
    return next;
  }

  function fmtUntil(ts) {
    if (!ts) return T.etaUnknown;
    const now = Date.now();
    const ms = ts - now;
    if (ms <= 0) return isEN ? "Now" : "いま";
    const mins = ms / (1000*60);
    if (mins < 60) return Math.round(mins) + (isEN ? "m" : "分");
    const hrs = mins / 60;
    if (hrs < 48) return Math.round(hrs) + (isEN ? "h" : "時間");
    const days = hrs / 24;
    if (days < 14) return Math.round(days) + (isEN ? "d" : "日");
    const weeks = days / 7;
    return (Math.round(weeks*10)/10) + (isEN ? "w" : "週");
  }

  function fmtAt(ts) {
    if (!ts) return T.etaUnknown;
    return fmtDT(ts);
  }

  function statusBadge(status) {
    const s = (status || "unknown").toLowerCase();
    if (s === "ok") return { text: "ok", cls: "ok" };
    if (s === "warn") return { text: "warn", cls: "warn" };
    if (s === "limited") return { text: "limited", cls: "limit" };
    if (s === "cooldown") return { text: "cooldown", cls: "limit" };
    return { text: "unknown", cls: "" };
  }

  // -------------------------
  // Filters
  // -------------------------
  function getFilters() {
    const mode = (document.getElementById("filterMode")?.value || "").trim();
    const status = (document.getElementById("filterStatus")?.value || "").trim();
    const model = (document.getElementById("filterModel")?.value || "").trim().toLowerCase();
    const note = (document.getElementById("filterNote")?.value || "").trim().toLowerCase();
    const affectsForecast = (document.getElementById("filterAffectsForecast")?.value || "yes") === "yes";
    return { mode, status, model, note, affectsForecast };
  }

  function applyFilters(logs, f) {
    return logs.filter(l => {
      if (f.mode && (l.mode || "") !== f.mode) return false;
      if (f.status && (l.status || "unknown") !== f.status) return false;
      if (f.model && !(l.model || "").toLowerCase().includes(f.model)) return false;
      if (f.note && !(l.note || "").toLowerCase().includes(f.note)) return false;
      return true;
    });
  }

  function populateModeFilter(logs) {
    const sel = document.getElementById("filterMode");
    if (!sel) return;

    const current = sel.value;
    const modes = Array.from(new Set(logs.map(l => (l.mode || "").trim()).filter(Boolean))).sort();
    const base = `<option value="">all</option>`;
    sel.innerHTML = base + modes.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join("");
    // restore if possible
    if (current && modes.includes(current)) sel.value = current;
  }

  function hookFilterRerender() {
    const ids = ["filterMode","filterStatus","filterModel","filterNote","filterAffectsForecast"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });
  }

  // -------------------------
  // Render
  // -------------------------
  function render() {
    const all = load();
    populateModeFilter(all);

    const f = getFilters();
    const shown = applyFilters(all, f);

    // log count
    const countEl = document.getElementById("logCount");
    if (countEl) {
      countEl.textContent = `${T.showing} ${shown.length} ${T.of} ${all.length} ${T.logs}`;
    }

    // Forecast set
    const forForecast = f.affectsForecast ? shown : all;

    // Latest snapshot (from forecast set, not necessarily shown? use forForecast[0])
    const latest = forForecast[0] || null;
    const cur5 = latest && typeof latest.u5h === "number" ? latest.u5h : null;
    const curW = latest && typeof latest.uw === "number" ? latest.uw : null;

    const rate5 = computeRates(forForecast, "u5h"); // %/hour
    const rateW = computeRates(forForecast, "uw");  // %/day

    // Reset estimation (heuristics)
    const nextReset5 = estimateNextResetTs(forForecast, "u5h", 5*60*60*1000, 5);
    const nextResetW = estimateNextResetTs(forForecast, "uw", 7*24*60*60*1000, 5);

    // Depletion ETA
    const eta5 = etaFromRate(cur5, rate5, "hour");
    const etaW = etaFromRate(curW, rateW, "day");

    // Fill KPI
    const el5D = document.getElementById("kpi5hDeplete");
    const el5DS = document.getElementById("kpi5hDepleteSub");
    const el5R = document.getElementById("kpi5hReset");
    const el5RS = document.getElementById("kpi5hResetSub");

    const elWD = document.getElementById("kpiWDeplete");
    const elWDS = document.getElementById("kpiWDepleteSub");
    const elWR = document.getElementById("kpiWReset");
    const elWRS = document.getElementById("kpiWResetSub");

    if (el5D) el5D.textContent = fmtETA(eta5);
    if (el5DS) {
      const burn = fmtBurn(cur5, rate5, "u5h");
      // If reset seems sooner than depletion, hint
      const hint = (eta5 && nextReset5 && typeof eta5 === "object")
        ? ((eta5.unit === "hour" && (eta5.t * 60*60*1000) > (nextReset5 - Date.now())) ? ` · ${T.mightResetFirst}` : "")
        : "";
      el5DS.textContent = burn + hint;
    }
    if (el5R) el5R.textContent = fmtUntil(nextReset5);
    if (el5RS) el5RS.textContent = (nextReset5 ? `${T.resetAt}: ${fmtAt(nextReset5)}` : T.needMore);

    if (elWD) elWD.textContent = fmtETA(etaW);
    if (elWDS) {
      const burn = fmtBurn(curW, rateW, "uw");
      const hint = (etaW && nextResetW && typeof etaW === "object")
        ? ((etaW.unit === "day" && (etaW.t * 24*60*60*1000) > (nextResetW - Date.now())) ? ` · ${T.mightResetFirst}` : "")
        : "";
      elWDS.textContent = burn + hint;
    }
    if (elWR) elWR.textContent = fmtUntil(nextResetW);
    if (elWRS) elWRS.textContent = (nextResetW ? `${T.resetAt}: ${fmtAt(nextResetW)}` : T.needMore);

    // Log table body (show filtered)
    const body = document.getElementById("logBody");
    if (!body) return;

    if (!shown.length) {
      body.innerHTML = `<tr><td colspan="8" class="muted">${T.empty}</td></tr>`;
      return;
    }

    body.innerHTML = shown.map(l => {
      const u5 = (typeof l.u5h === "number") ? l.u5h.toFixed(1) : "—";
      const uw = (typeof l.uw === "number") ? l.uw.toFixed(1) : "—";
      const mode = l.mode ? `<span class="badge">${escapeHTML(l.mode)}</span>` : "—";
      const st = statusBadge(l.status);
      const status = `<span class="badge ${st.cls}">${escapeHTML(st.text)}</span>`;
      const model = l.model ? escapeHTML(l.model) : "—";
      const note = l.note ? escapeHTML(l.note) : "—";
      return `<tr>
        <td>${escapeHTML(fmtDT(l.ts))}</td>
        <td>${u5}</td>
        <td>${uw}</td>
        <td>${mode}</td>
        <td>${status}</td>
        <td>${model}</td>
        <td>${note}</td>
        <td><button class="btn danger" data-del="${escapeHTML(l.id)}">${T.del}</button></td>
      </tr>`;
    }).join("");

    body.querySelectorAll("button[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const did = btn.getAttribute("data-del");
        if (!did) return;
        if (!confirm(T.confirmDel)) return;
        const next = load().filter(x => x.id !== did);
        save(next);
        render();
      });
    });
  }

  // -------------------------
  // Form handlers
  // -------------------------
  function hook() {
    const in5h = document.getElementById("in5h");
    const inWeek = document.getElementById("inWeek");
    const inMode = document.getElementById("inMode");
    const inStatus = document.getElementById("inStatus");
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
        if (u5h == null && uw == null) {
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
          status: inStatus ? String(inStatus.value || "unknown") : "unknown",
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
        const payload = { version: 2, exportedAt: Date.now(), logs };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
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

          // accept either array or {logs:[...]}
          const incoming = Array.isArray(data) ? data : (data && Array.isArray(data.logs) ? data.logs : []);
          if (!Array.isArray(incoming)) throw new Error("invalid");

          const normalized = normalizeLogs(incoming);
          save(normalized);

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

    hookFilterRerender();
  }

  hook();
  render();
})();
