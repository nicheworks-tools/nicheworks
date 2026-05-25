/* Codex Usage Forecaster (NicheWorks)
   TASK 05: logs + burn-rate ETA
   TASK 06: usage/howto pages
   TASK 07: filters + status + reset estimation + KPI split
   TASK 08: manual reset pin + profile save/apply + sparklines
   TASK 09: harden validation + datetime-local + profile dedupe + import integrity
*/
(() => {
  const THEME_KEY = "nw_theme";
  const root = document.documentElement;
  const isEN = location.pathname.includes("/en/");

  function track(name, params){
    try{
      if (typeof gtag === "function"){
        gtag("event", name, Object.assign({ tool: "codex-usage-forecaster" }, params || {}));
      }
    }catch(_){}
  }


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

  // Storage keys
  const KEY = "nw_cuf_v2";
  const LEGACY_KEY = "nw_cuf_v1";
  const SETTINGS_KEY = "nw_cuf_settings_v1";
  const PROFILES_KEY = "nw_cuf_profiles_v1";

  const T = {
    saved: isEN ? "Saved." : "保存した。",
    invalid: isEN ? "Invalid input (0-100)." : "入力が不正（0-100）",
    needOne: isEN ? "Enter 5h% or week%." : "5h%か週%のどちらかは必須。",
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
    resetAt: isEN ? "Next reset" : "次のリセット",
    mightResetFirst: isEN ? "Reset likely before depletion" : "枠更新が先に来そう",
    profileSaved: isEN ? "Profile saved." : "プロファイルを保存した。",
    profileApplied: isEN ? "Profile applied." : "プロファイルを適用した。",
    profileDeleted: isEN ? "Profile deleted." : "プロファイルを削除した。",
    profileNameNeeded: isEN ? "Name required." : "名前が必要。",
    resetSaved: isEN ? "Reset pins saved." : "手動リセットを保存した。",
    resetCleared: isEN ? "Reset pins cleared." : "手動リセットをクリアした。",
    badDatetime: isEN ? "Invalid datetime." : "日時の形式が不正。",
  };

  /** @typedef {{id:string, ts:number, u5h:number|null, uw:number|null, mode:string, status:string, model:string, note:string}} Log */
  /** @typedef {{manualNextReset5h:number|null, manualNextResetW:number|null}} Settings */
  /** @typedef {{id:string, name:string, filters:{mode:string,status:string,model:string,note:string,affectsForecast:boolean}}} Profile */

  function loadRawFrom(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) { return null; }
  }

  function newId() {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  function normalizeLogs(data) {
    if (!Array.isArray(data)) return [];
    return data
      .filter(x => x && typeof x === "object" && typeof x.ts === "number")
      .map(x => ({
        id: String(x.id ?? newId()),
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

  function normalizeProfiles(data) {
    if (!Array.isArray(data)) return [];
    const out = data
      .filter(p => p && typeof p === "object")
      .map(p => ({
        id: String(p.id ?? newId()),
        name: String((p.name ?? "")).trim(),
        filters: {
          mode: String(p.filters?.mode ?? ""),
          status: String(p.filters?.status ?? ""),
          model: String(p.filters?.model ?? ""),
          note: String(p.filters?.note ?? ""),
          affectsForecast: (p.filters?.affectsForecast !== false),
        }
      }))
      .filter(p => p.name.length > 0);

    // Deduplicate by name (last one wins)
    const byName = new Map();
    out.forEach(p => byName.set(p.name.toLowerCase(), p));
    return Array.from(byName.values()).sort((a,b) => a.name.localeCompare(b.name));
  }

  function loadLogs() {
    const v2 = loadRawFrom(KEY);
    if (v2) return normalizeLogs(v2);

    const v1 = loadRawFrom(LEGACY_KEY);
    if (v1) {
      const logs = normalizeLogs(v1);
      saveLogs(logs);
      try { localStorage.removeItem(LEGACY_KEY); } catch (_) {}
      return logs;
    }
    return [];
  }

  function saveLogs(logs) {
    try { localStorage.setItem(KEY, JSON.stringify(logs)); } catch (_) {}
  }

  function loadSettings() {
    const raw = loadRawFrom(SETTINGS_KEY);
    const s = (raw && typeof raw === "object") ? raw : {};
    return {
      manualNextReset5h: (typeof s.manualNextReset5h === "number" ? s.manualNextReset5h : null),
      manualNextResetW: (typeof s.manualNextResetW === "number" ? s.manualNextResetW : null),
    };
  }

  function saveSettings(settings) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {}
  }

  function loadProfiles() {
    const raw = loadRawFrom(PROFILES_KEY);
    return normalizeProfiles(raw);
  }

  function saveProfiles(profiles) {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(normalizeProfiles(profiles))); } catch (_) {}
  }

  function fmtDT(ts) {
    try {
      const d = new Date(ts);
      return d.toLocaleString(isEN ? "en-US" : "ja-JP", { hour12: false });
    } catch (_) { return String(ts); }
  }

  function clampPctRaw(v) {
    if (v === "" || v == null) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    if (n < 0 || n > 100) return null;
    return Math.round(n * 10) / 10;
  }

  function escapeHTML(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Forecast helpers
  function median(nums) {
    const a = nums.slice().sort((x,y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid-1] + a[mid]) / 2;
  }

  function computeRates(logs, key) {
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
      if (dPct <= 0) continue;

      if (key === "u5h") {
        const hours = dtMs / (1000*60*60);
        if (hours <= 0) continue;
        deltas.push(dPct / hours);
      } else {
        const days = dtMs / (1000*60*60*24);
        if (days <= 0) continue;
        deltas.push(dPct / days);
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
    const t = remaining / rate;
    return { t, unit };
  }

  function fmtETA(eta) {
    if (eta == null) return T.etaUnknown;
    if (eta === 0) return isEN ? "Now" : "いま";
    const val = eta.t;

    if (eta.unit === "hour") {
      if (val < 1) return isEN ? "<1h" : "1時間未満";
      if (val < 48) return Math.round(val) + (isEN ? "h" : "時間");
      return Math.round(val/24) + (isEN ? "d" : "日");
    }
    if (val < 1) return isEN ? "<1d" : "1日未満";
    if (val < 14) return Math.round(val) + (isEN ? "d" : "日");
    return (Math.round((val/7)*10)/10) + (isEN ? "w" : "週");
  }

  function fmtBurn(currentPct, rate, kind) {
    if (typeof currentPct !== "number") return T.needMore;
    if (!rate) return T.needMore;
    if (kind === "u5h") {
      return (isEN ? "Burn: " : "燃費: ") + (Math.round(rate*10)/10) + (isEN ? "%/h" : "%/時");
    }
    return (isEN ? "Burn: " : "燃費: ") + (Math.round(rate*10)/10) + (isEN ? "%/day" : "%/日");
  }

  // Reset estimation (auto)
  function estimateNextResetTsAuto(logs, key, periodMs, dropThresholdPct) {
    if (!logs.length) return null;
    const asc = logs.slice().sort((a,b) => a.ts - b.ts);

    let anchorTs = asc[0].ts;
    for (let i = 1; i < asc.length; i++) {
      const prev = asc[i-1];
      const cur = asc[i];
      const pv = key === "u5h" ? prev.u5h : prev.uw;
      const cv = key === "u5h" ? cur.u5h : cur.uw;
      if (typeof pv !== "number" || typeof cv !== "number") continue;
      const d = cv - pv;
      if (d <= -dropThresholdPct) anchorTs = cur.ts;
    }

    const now = Date.now();
    let next = anchorTs + periodMs;
    while (next <= now) next += periodMs;
    return next;
  }

  function nextResetFromManual(manualTs, periodMs) {
    if (typeof manualTs !== "number" || !Number.isFinite(manualTs)) return null;
    const now = Date.now();
    let next = manualTs;
    while (next <= now) next += periodMs;
    return next;
  }

  function fmtUntil(ts) {
    if (!ts) return T.etaUnknown;
    const ms = ts - Date.now();
    if (ms <= 0) return isEN ? "Now" : "いま";
    const mins = ms / (1000*60);
    if (mins < 60) return Math.round(mins) + (isEN ? "m" : "分");
    const hrs = mins / 60;
    if (hrs < 48) return Math.round(hrs) + (isEN ? "h" : "時間");
    const days = hrs / 24;
    if (days < 14) return Math.round(days) + (isEN ? "d" : "日");
    return (Math.round((days/7)*10)/10) + (isEN ? "w" : "週");
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

  // Filters
  function getFilters() {
    const mode = (document.getElementById("filterMode")?.value || "").trim();
    const status = (document.getElementById("filterStatus")?.value || "").trim();
    const model = (document.getElementById("filterModel")?.value || "").trim().toLowerCase();
    const note = (document.getElementById("filterNote")?.value || "").trim().toLowerCase();
    const affectsForecast = (document.getElementById("filterAffectsForecast")?.value || "yes") === "yes";
    return { mode, status, model, note, affectsForecast };
  }

  function setFilters(f) {
    const modeEl = document.getElementById("filterMode");
    const stEl = document.getElementById("filterStatus");
    const mEl = document.getElementById("filterModel");
    const nEl = document.getElementById("filterNote");
    const aEl = document.getElementById("filterAffectsForecast");
    if (modeEl) modeEl.value = f.mode || "";
    if (stEl) stEl.value = f.status || "";
    if (mEl) mEl.value = f.model || "";
    if (nEl) nEl.value = f.note || "";
    if (aEl) aEl.value = (f.affectsForecast === false) ? "no" : "yes";
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
    sel.innerHTML = `<option value="">all</option>` + modes.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join("");
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

  // Sparklines
  function renderSparkline(svgId, metaId, logs, key) {
    const svg = document.getElementById(svgId);
    const meta = document.getElementById(metaId);
    if (!svg) return;

    const pts = logs
      .slice()
      .sort((a,b) => a.ts - b.ts)
      .map(l => ({ ts: l.ts, v: (key === "u5h" ? l.u5h : l.uw) }))
      .filter(p => typeof p.v === "number");

    if (!pts.length) {
      svg.innerHTML = "";
      if (meta) meta.textContent = "—";
      return;
    }

    const w = 300, h = 60;
    const padX = 4, padY = 6;
    const minV = Math.min(...pts.map(p => p.v));
    const maxV = Math.max(...pts.map(p => p.v));
    const span = Math.max(1e-6, maxV - minV);

    const minT = pts[0].ts;
    const maxT = pts[pts.length - 1].ts;
    const tSpan = Math.max(1, maxT - minT);

    function x(ts){ return padX + (w - padX*2) * ((ts - minT) / tSpan); }
    function y(v){ return padY + (h - padY*2) * (1 - ((v - minV) / span)); }

    const d = pts.map((p,i) => `${i===0 ? "M" : "L"} ${x(p.ts).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
    const last = pts[pts.length - 1];

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = `
      <line class="axis" x1="0" y1="${h-0.5}" x2="${w}" y2="${h-0.5}"></line>
      <path class="line" d="${d}"></path>
      <circle class="dot" cx="${x(last.ts).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="2.8"></circle>
    `;

    if (meta) {
      const lastStr = (Math.round(last.v*10)/10).toFixed(1) + "%";
      const rangeStr = (Math.round(minV*10)/10).toFixed(1) + "–" + (Math.round(maxV*10)/10).toFixed(1) + "%";
      meta.textContent = (isEN ? `last ${lastStr} · range ${rangeStr}` : `最新 ${lastStr} · 範囲 ${rangeStr}`);
    }
  }

  // Profiles
  function populateProfilesSelect() {
    const sel = document.getElementById("profileSelect");
    if (!sel) return;
    const profiles = loadProfiles();
    const cur = sel.value;
    sel.innerHTML = `<option value="">—</option>` + profiles.map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)}</option>`).join("");
    if (cur && profiles.some(p => p.id === cur)) sel.value = cur;
  }

  function hookProfiles() {
    const sel = document.getElementById("profileSelect");
    const name = document.getElementById("profileName");
    const btnApply = document.getElementById("btnApplyProfile");
    const btnSave = document.getElementById("btnSaveProfile");
    const btnDel = document.getElementById("btnDeleteProfile");
    const hint = document.getElementById("saveHint");

    if (!sel || !btnApply || !btnSave || !btnDel || !name) return;

    btnApply.addEventListener("click", () => {
      const pid = sel.value;
      if (!pid) return;
      const profiles = loadProfiles();
      const p = profiles.find(x => x.id === pid);
      if (!p) return;

      setFilters(p.filters);
      track("cuf_profile_apply");
      if (hint) hint.textContent = T.profileApplied;
      render();
      setTimeout(() => { if (hint) hint.textContent = ""; }, 1500);
    });

    btnSave.addEventListener("click", () => {
      const nm = (name.value || "").trim();
      if (!nm) {
        if (hint) hint.textContent = T.profileNameNeeded;
        return;
      }
      const f = getFilters();
      const profiles = loadProfiles();

      // Rule (TASK09): duplicate name overwrites (case-insensitive)
      const existingByName = profiles.find(p => p.name.toLowerCase() === nm.toLowerCase());
      const pid = sel.value;

      if (pid) {
        // update selected id (even if name changed)
        const idx = profiles.findIndex(x => x.id === pid);
        if (idx >= 0) {
          profiles[idx] = { ...profiles[idx], name: nm, filters: f };
        } else if (existingByName) {
          // selected missing; overwrite by name
          const idx2 = profiles.findIndex(x => x.id === existingByName.id);
          profiles[idx2] = { ...existingByName, name: nm, filters: f };
        } else {
          profiles.push({ id: newId(), name: nm, filters: f });
        }
      } else {
        if (existingByName) {
          const idx = profiles.findIndex(x => x.id === existingByName.id);
          profiles[idx] = { ...existingByName, name: nm, filters: f };
          sel.value = existingByName.id;
        } else {
          const p = { id: newId(), name: nm, filters: f };
          profiles.push(p);
          sel.value = p.id;
        }
      }

      saveProfiles(profiles);
      track("cuf_profile_save", { name_len: nm.length });
      populateProfilesSelect();
      if (hint) hint.textContent = T.profileSaved;
      setTimeout(() => { if (hint) hint.textContent = ""; }, 1500);
    });

    btnDel.addEventListener("click", () => {
      const pid = sel.value;
      if (!pid) return;
      const profiles = loadProfiles().filter(p => p.id !== pid);
      saveProfiles(profiles);
      track("cuf_profile_save", { name_len: nm.length });
      populateProfilesSelect();
      sel.value = "";
      if (hint) hint.textContent = T.profileDeleted;
      setTimeout(() => { if (hint) hint.textContent = ""; }, 1500);
    });
  }

  // Manual reset settings (datetime-local)
  function parseLocalDatetimeInput(s) {
    const t = (s || "").trim();
    if (!t) return null;

    // datetime-local: YYYY-MM-DDTHH:mm
    const m1 = t.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (m1) {
      const y = Number(m1[1]), mo = Number(m1[2]) - 1, d = Number(m1[3]), hh = Number(m1[4]), mm = Number(m1[5]);
      const dt = new Date(y, mo, d, hh, mm, 0, 0);
      const ts = dt.getTime();
      return Number.isFinite(ts) ? ts : NaN;
    }

    // legacy: YYYY-MM-DD HH:mm (for back-compat if any)
    const m2 = t.match(/^(\d{4})-(\d{2})-(\d{2})[ ](\d{2}):(\d{2})$/);
    if (m2) {
      const y = Number(m2[1]), mo = Number(m2[2]) - 1, d = Number(m2[3]), hh = Number(m2[4]), mm = Number(m2[5]);
      const dt = new Date(y, mo, d, hh, mm, 0, 0);
      const ts = dt.getTime();
      return Number.isFinite(ts) ? ts : NaN;
    }

    return NaN;
  }

  function fmtDatetimeLocal(ts) {
    if (typeof ts !== "number") return "";
    const d = new Date(ts);
    const y = d.getFullYear();
    const mo = String(d.getMonth()+1).padStart(2,"0");
    const da = String(d.getDate()).padStart(2,"0");
    const hh = String(d.getHours()).padStart(2,"0");
    const mm = String(d.getMinutes()).padStart(2,"0");
    return `${y}-${mo}-${da}T${hh}:${mm}`;
  }

  function loadResetInputsFromSettings() {
    const s = loadSettings();
    const i5 = document.getElementById("manualNextReset5h");
    const iw = document.getElementById("manualNextResetW");
    if (i5) i5.value = (s.manualNextReset5h ? fmtDatetimeLocal(s.manualNextReset5h) : "");
    if (iw) iw.value = (s.manualNextResetW ? fmtDatetimeLocal(s.manualNextResetW) : "");
  }

  function hookResetSettings() {
    const i5 = document.getElementById("manualNextReset5h");
    const iw = document.getElementById("manualNextResetW");
    const btnSave = document.getElementById("btnSaveResetSettings");
    const btnClear = document.getElementById("btnClearResetSettings");
    const hint = document.getElementById("resetHint");
    if (!btnSave || !btnClear || !i5 || !iw) return;

    btnSave.addEventListener("click", () => {
      const t5 = parseLocalDatetimeInput(i5.value);
      const tw = parseLocalDatetimeInput(iw.value);

      if (Number.isNaN(t5) || Number.isNaN(tw)) {
        if (hint) hint.textContent = T.badDatetime;
        return;
      }

      const s = loadSettings();
      s.manualNextReset5h = (typeof t5 === "number" ? t5 : null);
      s.manualNextResetW  = (typeof tw === "number" ? tw : null);
      saveSettings(s);
      track("cuf_reset_save", { has5h: bool(s.manualNextReset5h), hasW: bool(s.manualNextResetW) });

      if (hint) hint.textContent = T.resetSaved;
      render();
      setTimeout(() => { if (hint) hint.textContent = ""; }, 1500);
    });

    btnClear.addEventListener("click", () => {
      const s = loadSettings();
      s.manualNextReset5h = null;
      s.manualNextResetW = null;
      saveSettings(s);
      track("cuf_reset_clear");
      i5.value = "";
      iw.value = "";
      if (hint) hint.textContent = T.resetCleared;
      render();
      setTimeout(() => { if (hint) hint.textContent = ""; }, 1500);
    });
  }

  // Render
  function render() {
    const all = loadLogs();
    populateModeFilter(all);

    const f = getFilters();
    const shown = applyFilters(all, f);

    const countEl = document.getElementById("logCount");
    if (countEl) countEl.textContent = `${T.showing} ${shown.length} ${T.of} ${all.length} ${T.logs}`;

    const forForecast = f.affectsForecast ? shown : all;
    const latest = forForecast[0] || null;
    const cur5 = latest && typeof latest.u5h === "number" ? latest.u5h : null;
    const curW = latest && typeof latest.uw === "number" ? latest.uw : null;

    const rate5 = computeRates(forForecast, "u5h");
    const rateW = computeRates(forForecast, "uw");

    const settings = loadSettings();
    const nextReset5 = nextResetFromManual(settings.manualNextReset5h, 5*60*60*1000) ??
      estimateNextResetTsAuto(forForecast, "u5h", 5*60*60*1000, 5);
    const nextResetW = nextResetFromManual(settings.manualNextResetW, 7*24*60*60*1000) ??
      estimateNextResetTsAuto(forForecast, "uw", 7*24*60*60*1000, 5);

    const eta5 = etaFromRate(cur5, rate5, "hour");
    const etaW = etaFromRate(curW, rateW, "day");

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
      const hint = (eta5 && nextReset5 && typeof eta5 === "object")
        ? ((eta5.t * 60*60*1000) > (nextReset5 - Date.now()) ? ` · ${T.mightResetFirst}` : "")
        : "";
      el5DS.textContent = burn + hint;
    }
    if (el5R) el5R.textContent = fmtUntil(nextReset5);
    if (el5RS) {
      const pinned = settings.manualNextReset5h ? (isEN ? "manual" : "手動") : (isEN ? "auto" : "自動");
      el5RS.textContent = (nextReset5 ? `${T.resetAt}: ${fmtAt(nextReset5)} · ${pinned}` : T.needMore);
    }

    if (elWD) elWD.textContent = fmtETA(etaW);
    if (elWDS) {
      const burn = fmtBurn(curW, rateW, "uw");
      const hint = (etaW && nextResetW && typeof etaW === "object")
        ? ((etaW.t * 24*60*60*1000) > (nextResetW - Date.now()) ? ` · ${T.mightResetFirst}` : "")
        : "";
      elWDS.textContent = burn + hint;
    }
    if (elWR) elWR.textContent = fmtUntil(nextResetW);
    if (elWRS) {
      const pinned = settings.manualNextResetW ? (isEN ? "manual" : "手動") : (isEN ? "auto" : "自動");
      elWRS.textContent = (nextResetW ? `${T.resetAt}: ${fmtAt(nextResetW)} · ${pinned}` : T.needMore);
    }

    renderSparkline("spark5h", "spark5hMeta", shown, "u5h");
    renderSparkline("sparkW", "sparkWMeta", shown, "uw");

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
        const next = loadLogs().filter(x => x.id !== did);
        saveLogs(next);
        render();
      });
    });
  }

  // Logs + Export/Import
  function hookLogs() {
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
        const raw5 = in5h ? in5h.value.trim() : "";
        const rawW = inWeek ? inWeek.value.trim() : "";
        const u5h = clampPctRaw(raw5);
        const uw = clampPctRaw(rawW);

        if (raw5 === "" && rawW === "") {
          if (hint) hint.textContent = T.needOne;
          return;
        }
        if ((raw5 !== "" && u5h == null) || (rawW !== "" && uw == null)) {
          if (hint) hint.textContent = T.invalid;
          return;
        }

        const logs = loadLogs();
        logs.unshift({
          id: newId(),
          ts: Date.now(),
          u5h,
          uw,
          mode: inMode ? String(inMode.value || "") : "",
          status: inStatus ? String(inStatus.value || "unknown") : "unknown",
          model: inModel ? String(inModel.value || "") : "",
          note: inNote ? String(inNote.value || "") : "",
        });

        saveLogs(logs);
        track("cuf_log_save", { has5h: u5h!==null, hasWeek: uw!==null, mode: (inMode?String(inMode.value||""):"") });

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
        track("cuf_export", { logs: loadLogs().length, profiles: loadProfiles().length });
        const payload = {
          version: 2,
          exportedAt: Date.now(),
          logs: loadLogs(),
          settings: loadSettings(),
          profiles: loadProfiles(),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "codex-usage-forecaster-data.json";
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

          // logs
          const incomingLogs = Array.isArray(data) ? data : (Array.isArray(data.logs) ? data.logs : []);
          saveLogs(normalizeLogs(incomingLogs));

          // settings
          if (data && typeof data === "object" && data.settings && typeof data.settings === "object") {
            saveSettings({
              manualNextReset5h: typeof data.settings.manualNextReset5h === "number" ? data.settings.manualNextReset5h : null,
              manualNextResetW: typeof data.settings.manualNextResetW === "number" ? data.settings.manualNextResetW : null,
            });
          }

          // profiles (overwrite, normalized)
          if (data && typeof data === "object" && Array.isArray(data.profiles)) {
            saveProfiles(normalizeProfiles(data.profiles));
          }

          track("cuf_import_ok", { logs: loadLogs().length, profiles: loadProfiles().length });
          if (hint) hint.textContent = T.imported;
          populateProfilesSelect();
          loadResetInputsFromSettings();
          render();
          setTimeout(() => { if (hint) hint.textContent = ""; }, 1500);
        } catch (e) {
          track("cuf_import_fail");
          if (hint) hint.textContent = T.importFail;
        } finally {
          fileImport.value = "";
        }
      });
    }
  }

  // Boot
  hookLogs();
  hookProfiles();
  hookFilterRerender();
  hookResetSettings();
  populateProfilesSelect();
  loadResetInputsFromSettings();
  render();
})();


// ---- CUF TASK11 PATCH (safe append) ----
(function(){
  function updateEmptyState(){
    try{
      var empty = document.getElementById('empty_state');
      var table = document.getElementById('logs_table');
      var tbody = document.getElementById('logs_tbody');
      if(!empty || !table || !tbody) return;

      // count rows OR fallback to localStorage logs length
      var rowCount = tbody.children ? tbody.children.length : 0;

      var lsCount = 0;
      try{
        // Try common keys (do not assume exact)
        var keys = ['cuf_logs','nw_cuf_logs','logs','cuf:logs'];
        for(var i=0;i<keys.length;i++){
          var raw = localStorage.getItem(keys[i]);
          if(raw){
            var v = JSON.parse(raw);
            if(Array.isArray(v)) { lsCount = v.length; break; }
            if(v && Array.isArray(v.logs)) { lsCount = v.logs.length; break; }
          }
        }
      }catch(e){}

      var has = (rowCount > 0) || (lsCount > 0);
      empty.style.display = has ? 'none' : 'block';
      table.style.display = has ? 'table' : 'none';
    }catch(e){}
  }

  // Run now and on interactions that likely change logs
  function bind(){
    updateEmptyState();
    var ids = ['btn_save','btn_export','btn_clear_all','btn_apply_profile','btn_delete_profile','btn_save_profile','btn_save_reset','btn_clear_reset'];
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.addEventListener('click', function(){ setTimeout(updateEmptyState, 50); });
    });
    var imp = document.getElementById('in_import');
    if(imp) imp.addEventListener('change', function(){ setTimeout(updateEmptyState, 150); });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind);
  }else{
    bind();
  }
})();

