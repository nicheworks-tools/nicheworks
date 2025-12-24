/* =====================================================
 * sukima-baito-income | NicheWorks
 * app.js (Phase 3 OCR beta + CSV trust + Import Preview)
 *
 * Phase 1 UI improvements:
 * - Theme toggle (localStorage)
 * - Font size toggle (localStorage)
 * - Date shortcuts: Today / Yesterday (injected UI)
 * - Workplace reuse: datalist + recent quick-picks (localStorage)
 * - Edit entries
 * - Month-grouped list with collapse + month totals
 *
 * Phase 2 additions:
 * - CSV spec help block (injected UI)
 * - CSV import PREVIEW (no immediate commit)
 * - Strict CSV validation (header + field rules)
 * - Duplicate rejection (default): date+workplace+category+amount
 * - Import preview shows counts + skip reasons + per-row toggle
 *
 * Phase 3 additions:
 * - OCR（β）: Screenshot OCR -> candidates -> preview -> commit
 *   - Uses Tesseract.js via CDN (loaded on demand)
 *   - No auto-add: always confirm/preview
 *   - Dedupe at commit-time (existing + within OCR selection)
 * ===================================================== */

(() => {
  // ----------------------------
  // DOM helpers
  // ----------------------------
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;

  const themeBtn = $("themeBtn");
  const fontBtn = $("fontBtn");

  const csvInput = $("csvInput");
  const csvExportBtn = $("csvExportBtn");

  // OCR (Phase 3)
  const ocrInput = $("ocrInput");
  const ocrBtn = $("ocrBtn");

  const errorBox = $("errorBox");

  const dateInput = $("dateInput");
  const workplaceInput = $("workplaceInput");
  const workplaceList = $("workplaceList");
  const categoryInput = $("categoryInput");
  const amountInput = $("amountInput");
  const memoInput = $("memoInput");
  const addBtn = $("addBtn");

  const entriesList = $("entriesList");
  const totalSummary = $("totalSummary");
  const monthlySummary = $("monthlySummary");

  // ----------------------------
  // State
  // ----------------------------
  /** @type {Array<{date:string, workplace:string, category:string, amount:number, memo:string}>} */
  let entries = []; // (spec: no persistent storage for entries)

  // Editing state
  let editingIndex = null;

  // Month collapse state (keep in sessionStorage only)
  const COLLAPSE_KEY = "nw-sukima-collapse-months";
  const collapsedMonths = new Set(
    JSON.parse(sessionStorage.getItem(COLLAPSE_KEY) || "[]")
  );

  // Workplace dictionary (persist OK)
  // stored as array: [{name, lastUsed}]
  const WP_KEY = "nw-sukima-workplaces-v1";
  /** @type {Array<{name:string, lastUsed:number}>} */
  let workplaceDict = safeJsonParse(localStorage.getItem(WP_KEY), []);

  // Import preview state (CSV)
  /** @type {null | {parsedRows: ImportRow[], summary: ImportSummary}} */
  let importPreviewState = null;

  /**
   * @typedef {Object} ImportRow
   * @property {number} rowNo  1-based line number in CSV file (including header line)
   * @property {"ok"|"skip"} status
   * @property {string} reason
   * @property {boolean} selected  whether to import (only meaningful when ok)
   * @property {{date:string, workplace:string, category:string, amount:number, memo:string}} data
   */

  /**
   * @typedef {Object} ImportSummary
   * @property {number} okCount
   * @property {number} skipCount
   * @property {number} dupCount
   * @property {number} totalRows
   */

  // OCR preview state
  /** @type {null | {items: OCRItem[], meta: {fileCount:number}} } */
  let ocrPreviewState = null;

  /**
   * @typedef {Object} OCRItem
   * @property {string} sourceName
   * @property {number} index
   * @property {"ok"|"skip"} status
   * @property {string} reason
   * @property {boolean} selected
   * @property {{date:string, workplace:string, category:string, amount:number, memo:string}} data
   * @property {string} rawText
   */

  // ----------------------------
  // Settings (theme / font)
  // ----------------------------
  const FONT_STEPS = ["small", "medium", "large", "xl"];

  function applySettings() {
    const theme = localStorage.getItem("nw-theme") || "light";
    const font = localStorage.getItem("nw-font") || "medium";
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-font", font);

    if (themeBtn) themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
    if (fontBtn) fontBtn.textContent = "AA";
  }

  function bindSettingsUI() {
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme") || "light";
        const next = current === "light" ? "dark" : "light";
        root.setAttribute("data-theme", next);
        localStorage.setItem("nw-theme", next);
        themeBtn.textContent = next === "light" ? "☀️" : "🌙";
      });
    }

    if (fontBtn) {
      fontBtn.addEventListener("click", () => {
        const current = localStorage.getItem("nw-font") || "medium";
        const idx = FONT_STEPS.indexOf(current);
        const next = FONT_STEPS[(idx + 1) % FONT_STEPS.length];
        root.setAttribute("data-font", next);
        localStorage.setItem("nw-font", next);
        toast(`フォント：${fontLabel(next)}`);
      });
    }
  }

  function fontLabel(v) {
    switch (v) {
      case "small": return "小";
      case "medium": return "中";
      case "large": return "大";
      case "xl": return "特大";
      default: return v;
    }
  }

  // ----------------------------
  // UI injections (no HTML change required)
  // ----------------------------
  function injectDateShortcuts() {
    if (!dateInput) return;

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.gap = "8px";
    wrap.style.flexWrap = "wrap";

    const btnToday = makeMiniBtn("今日", () => {
      dateInput.value = toISODate(new Date());
      dateInput.focus();
    });

    const btnYesterday = makeMiniBtn("昨日", () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      dateInput.value = toISODate(d);
      dateInput.focus();
    });

    const btnClear = makeMiniBtn("クリア", () => {
      dateInput.value = "";
      dateInput.focus();
    });

    wrap.appendChild(btnToday);
    wrap.appendChild(btnYesterday);
    wrap.appendChild(btnClear);

    dateInput.insertAdjacentElement("afterend", wrap);
  }

  function injectWorkplaceQuickPicks() {
    if (!workplaceInput) return;

    const host = document.createElement("div");
    host.id = "wpQuickPicks";
    host.style.display = "flex";
    host.style.flexWrap = "wrap";
    host.style.gap = "8px";

    workplaceInput.insertAdjacentElement("afterend", host);
    renderWorkplaceQuickPicks();
  }

  function injectCategoryChips() {
    if (!categoryInput) return;

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "8px";

    const cats = ["報酬", "交通費", "手当", "その他"];
    cats.forEach((c) => {
      const b = makeMiniBtn(c, () => {
        categoryInput.value = c;
        categoryInput.dispatchEvent(new Event("change"));
      });
      wrap.appendChild(b);
    });

    categoryInput.insertAdjacentElement("afterend", wrap);
  }

  function injectCSVSpecHelp() {
    const csvActions = document.querySelector(".csv-actions");
    if (!csvActions) return;

    if (document.getElementById("csvSpecHelp")) return;

    const box = document.createElement("div");
    box.id = "csvSpecHelp";
    box.style.marginTop = "10px";
    box.style.border = "1px solid var(--border, #e5e5e5)";
    box.style.borderRadius = "14px";
    box.style.padding = "12px";
    box.style.background = "var(--card-bg, #f9f9f9)";
    box.style.fontSize = "0.95em";
    box.style.lineHeight = "1.45";

    box.innerHTML = `
      <div style="font-weight:700;margin-bottom:6px;">CSVの形式（インポート/エクスポート）</div>
      <div style="opacity:0.9;">
        <div>ヘッダ：<code>date,workplace,category,amount,memo</code></div>
        <div>日付：<code>YYYY-MM-DD</code>（例：2025-12-24）</div>
        <div>区分：<code>報酬 / 交通費 / 手当 / その他</code></div>
        <div>金額：<code>6000</code> でも <code>6,000</code> でもOK</div>
        <div style="margin-top:6px;opacity:0.8;">※形式が合わない行はスキップします（安全優先）。</div>
      </div>
    `;

    csvActions.insertAdjacentElement("afterend", box);
  }

  function injectImportPreviewModal() {
    if (document.getElementById("importPreviewModal")) return;

    const overlay = document.createElement("div");
    overlay.id = "importPreviewModal";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.45)";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "14px";
    overlay.style.zIndex = "9999";

    const panel = document.createElement("div");
    panel.style.width = "min(920px, 100%)";
    panel.style.maxHeight = "85vh";
    panel.style.overflow = "auto";
    panel.style.background = "var(--bg, #fff)";
    panel.style.border = "1px solid var(--border, #e5e5e5)";
    panel.style.borderRadius = "16px";
    panel.style.boxShadow = "0 10px 28px rgba(0,0,0,0.18)";

    panel.innerHTML = `
      <div style="padding:14px 14px 10px 14px; border-bottom:1px solid var(--border, #e5e5e5);">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div>
            <div style="font-weight:800; font-size:1.05em;">CSV取り込みの確認</div>
            <div id="importPreviewSummary" style="margin-top:6px; opacity:0.85; font-size:0.95em;"></div>
          </div>
          <button id="importPreviewCloseBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:transparent;border-radius:12px;cursor:pointer;">
            閉じる
          </button>
        </div>
      </div>

      <div style="padding:12px 14px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button id="importSelectAllBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:var(--card-bg,#f9f9f9);border-radius:12px;cursor:pointer;">
            全選択
          </button>
          <button id="importSelectNoneBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:var(--card-bg,#f9f9f9);border-radius:12px;cursor:pointer;">
            全解除
          </button>
          <div style="font-size:0.9em; opacity:0.85; display:flex; align-items:center; gap:6px;">
            <input id="importShowSkipped" type="checkbox" />
            <label for="importShowSkipped">スキップ行も表示</label>
          </div>
        </div>

        <button id="importCommitBtn" type="button"
          style="padding:12px 14px;border:1px solid var(--border,#e5e5e5);background:#111;color:#fff;border-radius:12px;cursor:pointer;">
          選択した行を追加
        </button>
      </div>

      <div style="padding:0 14px 14px 14px;">
        <div id="importPreviewList" style="display:flex; flex-direction:column; gap:10px;"></div>
      </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const closeBtn = $("importPreviewCloseBtn");
    closeBtn.addEventListener("click", closeImportPreview);

    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) closeImportPreview();
    });

    $("importSelectAllBtn").addEventListener("click", () => {
      if (!importPreviewState) return;
      importPreviewState.parsedRows.forEach((r) => {
        if (r.status === "ok") r.selected = true;
      });
      renderImportPreview();
    });

    $("importSelectNoneBtn").addEventListener("click", () => {
      if (!importPreviewState) return;
      importPreviewState.parsedRows.forEach((r) => {
        if (r.status === "ok") r.selected = false;
      });
      renderImportPreview();
    });

    $("importShowSkipped").addEventListener("change", () => renderImportPreview());
    $("importCommitBtn").addEventListener("click", commitImportPreview);
  }

  function openImportPreview(state) {
    importPreviewState = state;
    renderImportPreview();
    const overlay = $("importPreviewModal");
    overlay.style.display = "flex";
    $("importShowSkipped").checked = false;
  }

  function closeImportPreview() {
    const overlay = $("importPreviewModal");
    overlay.style.display = "none";
    importPreviewState = null;
  }

  // OCR Preview modal
  function injectOCRPreviewModal() {
    if (document.getElementById("ocrPreviewModal")) return;

    const overlay = document.createElement("div");
    overlay.id = "ocrPreviewModal";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.45)";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "14px";
    overlay.style.zIndex = "9999";

    const panel = document.createElement("div");
    panel.style.width = "min(920px, 100%)";
    panel.style.maxHeight = "85vh";
    panel.style.overflow = "auto";
    panel.style.background = "var(--bg, #fff)";
    panel.style.border = "1px solid var(--border, #e5e5e5)";
    panel.style.borderRadius = "16px";
    panel.style.boxShadow = "0 10px 28px rgba(0,0,0,0.18)";

    panel.innerHTML = `
      <div style="padding:14px 14px 10px 14px; border-bottom:1px solid var(--border, #e5e5e5);">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div>
            <div style="font-weight:800; font-size:1.05em;">スクショOCR（β）取り込みの確認</div>
            <div id="ocrPreviewSummary" style="margin-top:6px; opacity:0.85; font-size:0.95em;"></div>
          </div>
          <button id="ocrPreviewCloseBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:transparent;border-radius:12px;cursor:pointer;">
            閉じる
          </button>
        </div>
      </div>

      <div style="padding:12px 14px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button id="ocrSelectAllBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:var(--card-bg,#f9f9f9);border-radius:12px;cursor:pointer;">
            全選択
          </button>
          <button id="ocrSelectNoneBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:var(--card-bg,#f9f9f9);border-radius:12px;cursor:pointer;">
            全解除
          </button>
          <div style="font-size:0.9em; opacity:0.85; display:flex; align-items:center; gap:6px;">
            <input id="ocrShowSkipped" type="checkbox" />
            <label for="ocrShowSkipped">スキップ候補も表示</label>
          </div>
        </div>

        <button id="ocrCommitBtn" type="button"
          style="padding:12px 14px;border:1px solid var(--border,#e5e5e5);background:#111;color:#fff;border-radius:12px;cursor:pointer;">
          選択した行を追加
        </button>
      </div>

      <div style="padding:0 14px 14px 14px;">
        <div id="ocrPreviewList" style="display:flex; flex-direction:column; gap:10px;"></div>
      </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    $("ocrPreviewCloseBtn").addEventListener("click", closeOCRPreview);
    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) closeOCRPreview();
    });

    $("ocrSelectAllBtn").addEventListener("click", () => {
      if (!ocrPreviewState) return;
      ocrPreviewState.items.forEach((it) => {
        if (it.status === "ok") it.selected = true;
      });
      renderOCRPreview();
    });

    $("ocrSelectNoneBtn").addEventListener("click", () => {
      if (!ocrPreviewState) return;
      ocrPreviewState.items.forEach((it) => {
        if (it.status === "ok") it.selected = false;
      });
      renderOCRPreview();
    });

    $("ocrShowSkipped").addEventListener("change", renderOCRPreview);
    $("ocrCommitBtn").addEventListener("click", commitOCRPreview);
  }

  function openOCRPreview(state) {
    ocrPreviewState = state;
    $("ocrShowSkipped").checked = false;
    renderOCRPreview();
    $("ocrPreviewModal").style.display = "flex";
  }

  function closeOCRPreview() {
    $("ocrPreviewModal").style.display = "none";
    ocrPreviewState = null;
  }

  function makeMiniBtn(label, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.padding = "8px 10px";
    b.style.border = "1px solid var(--border, #e5e5e5)";
    b.style.background = "var(--card-bg, #f9f9f9)";
    b.style.color = "var(--fg, #111)";
    b.style.borderRadius = "10px";
    b.style.cursor = "pointer";
    b.addEventListener("click", onClick);
    return b;
  }

  // ----------------------------
  // Small toast (non-blocking)
  // ----------------------------
  let toastTimer = null;
  function toast(msg) {
    const old = document.getElementById("nwToast");
    if (old) old.remove();

    const t = document.createElement("div");
    t.id = "nwToast";
    t.textContent = msg;
    t.style.position = "fixed";
    t.style.left = "50%";
    t.style.bottom = "18px";
    t.style.transform = "translateX(-50%)";
    t.style.padding = "10px 12px";
    t.style.border = "1px solid var(--border, #e5e5e5)";
    t.style.background = "var(--card-bg, #f9f9f9)";
    t.style.color = "var(--fg, #111)";
    t.style.borderRadius = "12px";
    t.style.zIndex = "9999";
    t.style.maxWidth = "90vw";
    t.style.whiteSpace = "nowrap";
    t.style.overflow = "hidden";
    t.style.textOverflow = "ellipsis";
    document.body.appendChild(t);

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 1400);
  }

  // ----------------------------
  // Workplace dictionary
  // ----------------------------
  function normalizeWorkplaceName(s) {
    return String(s || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function bumpWorkplace(name) {
    const n = normalizeWorkplaceName(name);
    if (!n) return;

    const now = Date.now();
    const idx = workplaceDict.findIndex((x) => normalizeWorkplaceName(x.name) === n);
    if (idx >= 0) {
      workplaceDict[idx].lastUsed = now;
    } else {
      workplaceDict.push({ name: n, lastUsed: now });
    }
    workplaceDict.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    workplaceDict = workplaceDict.slice(0, 200);

    localStorage.setItem(WP_KEY, JSON.stringify(workplaceDict));
    updateWorkplaceDatalist();
    renderWorkplaceQuickPicks();
  }

  function updateWorkplaceDatalist() {
    if (!workplaceList) return;
    workplaceList.innerHTML = "";

    const sorted = [...workplaceDict].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    sorted.forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.name;
      workplaceList.appendChild(opt);
    });
  }

  function renderWorkplaceQuickPicks() {
    const host = document.getElementById("wpQuickPicks");
    if (!host) return;

    host.innerHTML = "";
    const sorted = [...workplaceDict].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    const top = sorted.slice(0, 6);

    if (top.length === 0) return;

    top.forEach((w) => {
      const label = w.name.length > 18 ? w.name.slice(0, 18) + "…" : w.name;
      const b = makeMiniBtn(label, () => {
        workplaceInput.value = w.name;
        workplaceInput.focus();
      });
      host.appendChild(b);
    });

    const clear = makeMiniBtn("候補クリア", () => {
      if (!confirm("就業先候補をクリアします（入力データは消えません）。よろしいですか？")) return;
      workplaceDict = [];
      localStorage.setItem(WP_KEY, JSON.stringify(workplaceDict));
      updateWorkplaceDatalist();
      renderWorkplaceQuickPicks();
    });
    host.appendChild(clear);
  }

  // ----------------------------
  // Entry form actions (add / edit)
  // ----------------------------
  function cleanAmount(val) {
    // allow comma separators etc.
    const n = Number(String(val).replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }

  function showError(msg) {
    if (!errorBox) return;
    errorBox.style.display = "block";
    errorBox.style.whiteSpace = "pre-line";
    errorBox.textContent = msg;
    setTimeout(() => {
      errorBox.style.display = "none";
    }, 6500);
  }

  function clearForm() {
    if (dateInput) dateInput.value = toISODate(new Date()); // keep today as default
    if (workplaceInput) workplaceInput.value = "";
    if (amountInput) amountInput.value = "";
    if (memoInput) memoInput.value = "";
    if (categoryInput) categoryInput.value = "報酬";
  }

  function setEditingMode(idx) {
    editingIndex = idx;

    const e = entries[idx];
    dateInput.value = e.date;
    workplaceInput.value = e.workplace;
    categoryInput.value = e.category;
    amountInput.value = String(e.amount);
    memoInput.value = e.memo || "";

    addBtn.textContent = "更新する";
    ensureCancelEditBtn();
    toast("編集モード");
    if (amountInput) amountInput.focus();
  }

  function exitEditingMode() {
    editingIndex = null;
    addBtn.textContent = "追加する";
    const c = document.getElementById("cancelEditBtn");
    if (c) c.remove();
    clearForm();
  }

  function ensureCancelEditBtn() {
    if (document.getElementById("cancelEditBtn")) return;
    const btn = document.createElement("button");
    btn.id = "cancelEditBtn";
    btn.type = "button";
    btn.textContent = "編集キャンセル";
    btn.style.marginTop = "8px";
    btn.style.padding = "10px 12px";
    btn.style.border = "1px solid var(--border, #e5e5e5)";
    btn.style.background = "transparent";
    btn.style.borderRadius = "12px";
    btn.style.cursor = "pointer";
    btn.style.color = "var(--fg, #111)";
    btn.addEventListener("click", exitEditingMode);

    addBtn.insertAdjacentElement("afterend", btn);
  }

  function bindAddButton() {
    if (!addBtn) return;

    addBtn.addEventListener("click", () => {
      const date = String(dateInput?.value || "").trim();
      const workplace = normalizeWorkplaceName(workplaceInput?.value);
      const category = String(categoryInput?.value || "報酬");
      const amountRaw = String(amountInput?.value || "").trim();
      const memo = String(memoInput?.value || "").trim();

      if (!date || !workplace || !amountRaw) {
        showError("日付・就業先・金額は必須です。");
        return;
      }

      const amount = cleanAmount(amountRaw);
      if (!Number.isFinite(amount) || amount <= 0) {
        showError("金額が不正です。数字で入力してください。");
        return;
      }

      const record = { date, workplace, category, amount, memo };

      if (editingIndex !== null) {
        entries[editingIndex] = record;
        bumpWorkplace(workplace);
        exitEditingMode();
      } else {
        entries.push(record);
        bumpWorkplace(workplace);
        clearForm();
      }

      renderAll();
      if (workplaceInput) workplaceInput.focus();
    });

    if (amountInput) {
      amountInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          addBtn.click();
        }
      });
    }
  }

  // ----------------------------
  // Rendering (entries grouped by month + collapsible)
  // ----------------------------
  function monthKeyFromDate(dateStr) {
    return String(dateStr).slice(0, 7);
  }

  function formatYen(n) {
    try {
      return `¥${Number(n).toLocaleString()}`;
    } catch {
      return `¥${n}`;
    }
  }

  function renderEntriesGrouped() {
    if (!entriesList) return;
    entriesList.innerHTML = "";

    if (entries.length === 0) {
      const empty = document.createElement("div");
      empty.className = "entry-card";
      empty.textContent = "まだ入力がありません。";
      entriesList.appendChild(empty);
      return;
    }

    const indexed = entries.map((e, i) => ({ e, i }));
    indexed.sort((a, b) => {
      if (a.e.date === b.e.date) return b.i - a.i;
      return a.e.date < b.e.date ? 1 : -1;
    });

    /** @type {Record<string, Array<{e:any,i:number}>>} */
    const groups = {};
    indexed.forEach((x) => {
      const mk = monthKeyFromDate(x.e.date);
      if (!groups[mk]) groups[mk] = [];
      groups[mk].push(x);
    });

    const months = Object.keys(groups).sort().reverse();

    months.forEach((mk) => {
      const section = document.createElement("div");
      section.style.marginBottom = "12px";

      const monthTotals = calcMonthTotals(groups[mk].map((x) => x.e));
      const header = document.createElement("button");
      header.type = "button";
      header.className = "entry-card";
      header.style.width = "100%";
      header.style.textAlign = "left";
      header.style.cursor = "pointer";
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.style.gap = "12px";

      const left = document.createElement("div");
      left.innerHTML = `<strong>${mk}</strong><div style="font-size:0.9em;opacity:0.85;">件数：${groups[mk].length}</div>`;

      const right = document.createElement("div");
      right.style.textAlign = "right";
      right.innerHTML =
        `<div><strong>${formatYen(monthTotals.total)}</strong></div>
         <div style="font-size:0.9em;opacity:0.85;">報酬 ${formatYen(monthTotals.byCat["報酬"] || 0)} / 交 ${formatYen(monthTotals.byCat["交通費"] || 0)}</div>`;

      header.appendChild(left);
      header.appendChild(right);

      const listWrap = document.createElement("div");
      listWrap.style.display = "flex";
      listWrap.style.flexDirection = "column";
      listWrap.style.gap = "12px";
      listWrap.style.marginTop = "12px";

      const isCollapsed = collapsedMonths.has(mk);
      if (isCollapsed) listWrap.style.display = "none";

      header.addEventListener("click", () => {
        const nowCollapsed = collapsedMonths.has(mk);
        if (nowCollapsed) collapsedMonths.delete(mk);
        else collapsedMonths.add(mk);

        sessionStorage.setItem(COLLAPSE_KEY, JSON.stringify([...collapsedMonths]));
        listWrap.style.display = collapsedMonths.has(mk) ? "none" : "flex";
      });

      groups[mk].forEach(({ e, i }) => {
        const card = document.createElement("div");
        card.className = "entry-card";

        const top = document.createElement("div");
        top.className = "entry-top";
        top.textContent = `${e.date}　${e.workplace}`;

        const detail1 = document.createElement("div");
        detail1.className = "entry-details";
        detail1.textContent = `[${e.category}]　${formatYen(e.amount)}`;

        card.appendChild(top);
        card.appendChild(detail1);

        if (e.memo) {
          const detail2 = document.createElement("div");
          detail2.className = "entry-details";
          detail2.textContent = `メモ：${e.memo}`;
          card.appendChild(detail2);
        }

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";
        actions.style.flexWrap = "wrap";
        actions.style.marginTop = "10px";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "delete-btn";
        editBtn.textContent = "編集";
        editBtn.addEventListener("click", () => setEditingMode(i));

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "delete-btn";
        delBtn.textContent = "削除";
        delBtn.addEventListener("click", () => {
          if (!confirm("この入力を削除しますか？")) return;
          entries.splice(i, 1);
          if (editingIndex === i) exitEditingMode();
          renderAll();
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        card.appendChild(actions);

        listWrap.appendChild(card);
      });

      section.appendChild(header);
      section.appendChild(listWrap);
      entriesList.appendChild(section);
    });
  }

  function calcMonthTotals(list) {
    const byCat = { "報酬": 0, "交通費": 0, "手当": 0, "その他": 0 };
    let total = 0;
    list.forEach((e) => {
      byCat[e.category] = (byCat[e.category] || 0) + e.amount;
      total += e.amount;
    });
    return { byCat, total };
  }

  // ----------------------------
  // Summary rendering (annual + monthly blocks)
  // ----------------------------
  function renderSummary() {
    if (!totalSummary || !monthlySummary) return;

    if (entries.length === 0) {
      totalSummary.innerHTML = "";
      monthlySummary.innerHTML = "";
      return;
    }

    let total = 0;
    const monthly = {}; // ym -> byCat + total

    entries.forEach((e) => {
      total += e.amount;
      const ym = monthKeyFromDate(e.date);
      if (!monthly[ym]) {
        monthly[ym] = { "報酬": 0, "交通費": 0, "手当": 0, "その他": 0, "合計": 0 };
      }
      monthly[ym][e.category] += e.amount;
      monthly[ym]["合計"] += e.amount;
    });

    const nowYm = toISODate(new Date()).slice(0, 7);
    const thisMonthTotal = monthly[nowYm]?.["合計"] || 0;

    totalSummary.innerHTML =
      `<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
         <div><strong>年間合計：</strong>${formatYen(total)}</div>
         <div><strong>今月：</strong>${formatYen(thisMonthTotal)}</div>
       </div>
       <div style="margin-top:6px;font-size:0.9em;opacity:0.85;">
         ヒント：CSVでバックアップできます（端末内で保存されます）
       </div>`;

    const months = Object.keys(monthly).sort().reverse();
    monthlySummary.innerHTML = "";
    months.forEach((m) => {
      const block = document.createElement("div");
      block.className = "month-block";

      block.innerHTML =
        `<div class="month-title">${m}</div>
         <div>報酬：${formatYen(monthly[m]["報酬"])}</div>
         <div>交通費：${formatYen(monthly[m]["交通費"])}</div>
         <div>手当：${formatYen(monthly[m]["手当"])}</div>
         <div>その他：${formatYen(monthly[m]["その他"])}</div>
         <div><strong>合計：${formatYen(monthly[m]["合計"])}</strong></div>`;

      monthlySummary.appendChild(block);
    });
  }

  function renderAll() {
    renderEntriesGrouped();
    renderSummary();
  }

  // ----------------------------
  // CSV Export / Import (Phase 2 Preview)
  // ----------------------------
  function csvEscape(v) {
    const s = String(v ?? "");
    if (/[",\r\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  function exportCSV() {
    if (entries.length === 0) {
      showError("出力できるデータがありません。");
      return;
    }

    const header = ["date", "workplace", "category", "amount", "memo"];
    const lines = [header.join(",")];

    entries.forEach((e) => {
      lines.push([
        csvEscape(e.date),
        csvEscape(e.workplace),
        csvEscape(e.category),
        csvEscape(String(e.amount)),
        csvEscape(e.memo || "")
      ].join(","));
    });

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sukima-baito-income.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    toast("CSVを書き出しました");
  }

  function parseCSV(text) {
    const rows = [];
    let i = 0, field = "", row = [];
    let inQuotes = false;

    while (i < text.length) {
      const c = text[i];

      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        } else {
          field += c;
          i++;
          continue;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
          i++;
          continue;
        }
        if (c === ",") {
          row.push(field);
          field = "";
          i++;
          continue;
        }
        if (c === "\r") {
          i++;
          continue;
        }
        if (c === "\n") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
          i++;
          continue;
        }
        field += c;
        i++;
      }
    }

    row.push(field);
    rows.push(row);

    if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
      rows.pop();
    }
    return rows;
  }

  function importCSVFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target.result || "");
      const rows = parseCSV(text);

      if (rows.length === 0) {
        showError("CSVが空です。");
        return;
      }

      const header = rows[0].map((h) => String(h || "").trim());
      const expected = ["date", "workplace", "category", "amount", "memo"];
      const headerLower = header.map((h) => h.toLowerCase());

      const okHeader = expected.every((x, idx) => headerLower[idx] === x);
      if (!okHeader) {
        showError("CSVヘッダが不正です。\n期待形式：date,workplace,category,amount,memo");
        return;
      }

      const validCats = new Set(["報酬", "交通費", "手当", "その他"]);
      const existingKeys = new Set(entries.map(makeDedupeKey));

      /** @type {ImportRow[]} */
      const parsedRows = [];
      let okCount = 0;
      let skipCount = 0;
      let dupCount = 0;

      for (let r = 1; r < rows.length; r++) {
        const cols = rows[r];
        const rowNo = r + 1;

        if (!cols || cols.length === 0) continue;

        if (cols.length < 5) {
          parsedRows.push({
            rowNo,
            status: "skip",
            reason: `列数不正（${cols.length}）`,
            selected: false,
            data: emptyRowData()
          });
          skipCount++;
          continue;
        }

        let [date, workplace, category, amountRaw, memo] = cols;

        date = String(date || "").trim();
        workplace = normalizeWorkplaceName(workplace);
        category = String(category || "").trim();
        amountRaw = String(amountRaw || "").trim();
        memo = String(memo || "").trim();

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          parsedRows.push({
            rowNo,
            status: "skip",
            reason: "日付形式不正（YYYY-MM-DDのみ）",
            selected: false,
            data: { date, workplace, category, amount: 0, memo }
          });
          skipCount++;
          continue;
        }

        if (!workplace) {
          parsedRows.push({
            rowNo,
            status: "skip",
            reason: "就業先が空",
            selected: false,
            data: { date, workplace, category, amount: 0, memo }
          });
          skipCount++;
          continue;
        }

        if (!validCats.has(category)) {
          parsedRows.push({
            rowNo,
            status: "skip",
            reason: "区分不正（報酬/交通費/手当/その他）",
            selected: false,
            data: { date, workplace, category, amount: 0, memo }
          });
          skipCount++;
          continue;
        }

        const amount = cleanAmount(amountRaw);
        if (!Number.isFinite(amount) || amount <= 0) {
          parsedRows.push({
            rowNo,
            status: "skip",
            reason: "金額不正",
            selected: false,
            data: { date, workplace, category, amount: 0, memo }
          });
          skipCount++;
          continue;
        }

        const data = { date, workplace, category, amount, memo };
        const key = makeDedupeKey(data);

        if (existingKeys.has(key)) {
          parsedRows.push({
            rowNo,
            status: "skip",
            reason: "重複（既存データと一致）",
            selected: false,
            data
          });
          skipCount++;
          dupCount++;
          continue;
        }

        parsedRows.push({
          rowNo,
          status: "ok",
          reason: "OK",
          selected: true,
          data
        });
        okCount++;
      }

      const summary = {
        okCount,
        skipCount,
        dupCount,
        totalRows: parsedRows.length
      };

      if (okCount === 0) {
        showError(`追加できる行がありません。\nスキップ：${skipCount}（重複：${dupCount}）`);
        return;
      }

      openImportPreview({ parsedRows, summary });
    };

    reader.readAsText(file, "utf-8");
  }

  function emptyRowData() {
    return { date: "", workplace: "", category: "", amount: 0, memo: "" };
  }

  function makeDedupeKey(e) {
    const d = String(e.date || "").trim();
    const w = normalizeWorkplaceName(e.workplace || "");
    const c = String(e.category || "").trim();
    const a = Number(e.amount || 0);
    return `${d}|${w}|${c}|${a}`;
  }

  function renderImportPreview() {
    if (!importPreviewState) return;

    const { parsedRows } = importPreviewState;
    const showSkipped = $("importShowSkipped")?.checked;

    const okTotal = parsedRows.filter((r) => r.status === "ok").length;
    const selectedCount = parsedRows.filter((r) => r.status === "ok" && r.selected).length;
    const skippedCount = parsedRows.filter((r) => r.status === "skip").length;
    const dupCount = parsedRows.filter((r) => r.status === "skip" && r.reason.startsWith("重複")).length;

    $("importPreviewSummary").textContent =
      `追加候補：${okTotal}件（選択：${selectedCount}件） / スキップ：${skippedCount}件（重複：${dupCount}件）`;

    $("importCommitBtn").textContent = `選択した行を追加（${selectedCount}件）`;
    $("importCommitBtn").disabled = selectedCount === 0;
    $("importCommitBtn").style.opacity = selectedCount === 0 ? "0.5" : "1";
    $("importCommitBtn").style.cursor = selectedCount === 0 ? "not-allowed" : "pointer";

    const list = $("importPreviewList");
    list.innerHTML = "";

    const rowsToRender = parsedRows.filter((r) => r.status === "ok" || showSkipped);

    rowsToRender.forEach((r) => {
      const card = document.createElement("div");
      card.style.border = "1px solid var(--border,#e5e5e5)";
      card.style.borderRadius = "14px";
      card.style.padding = "12px";
      card.style.background = "var(--card-bg,#f9f9f9)";

      const top = document.createElement("div");
      top.style.display = "flex";
      top.style.alignItems = "center";
      top.style.justifyContent = "space-between";
      top.style.gap = "10px";
      top.style.flexWrap = "wrap";

      const left = document.createElement("div");
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "10px";
      left.style.flexWrap = "wrap";

      if (r.status === "ok") {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!r.selected;
        cb.addEventListener("change", () => {
          r.selected = cb.checked;
          renderImportPreview();
        });
        left.appendChild(cb);
      } else {
        const badge = document.createElement("span");
        badge.textContent = "SKIP";
        badge.style.fontWeight = "800";
        badge.style.fontSize = "0.85em";
        badge.style.padding = "4px 8px";
        badge.style.borderRadius = "999px";
        badge.style.border = "1px solid var(--border,#e5e5e5)";
        badge.style.opacity = "0.8";
        left.appendChild(badge);
      }

      const title = document.createElement("div");
      title.style.fontWeight = "800";
      title.textContent =
        r.status === "ok"
          ? `行 ${r.rowNo}：${r.data.date} / ${r.data.workplace}`
          : `行 ${r.rowNo}：${r.reason}`;
      left.appendChild(title);

      const right = document.createElement("div");
      right.style.fontWeight = "800";
      right.textContent = r.status === "ok" ? formatYen(r.data.amount) : "";
      top.appendChild(left);
      top.appendChild(right);

      const meta = document.createElement("div");
      meta.style.marginTop = "8px";
      meta.style.opacity = "0.9";
      meta.style.fontSize = "0.95em";

      if (r.status === "ok") {
        meta.textContent = `[${r.data.category}] ${r.data.memo ? ` / メモ：${r.data.memo}` : ""}`;
      } else {
        meta.textContent = `理由：${r.reason}`;
      }

      card.appendChild(top);
      card.appendChild(meta);

      if (r.status === "ok") {
        const form = document.createElement("div");
        form.style.display = "grid";
        form.style.gridTemplateColumns = "1fr 1fr";
        form.style.gap = "8px";
        form.style.marginTop = "10px";

        const d = makeInlineInput("日付", r.data.date, "date", (v) => { r.data.date = v; });
        const w = makeInlineInput("就業先", r.data.workplace, "text", (v) => { r.data.workplace = normalizeWorkplaceName(v); });
        const c = makeInlineSelect("区分", r.data.category, ["報酬","交通費","手当","その他"], (v) => { r.data.category = v; });
        const a = makeInlineInput("金額", String(r.data.amount), "text", (v) => {
          const n = cleanAmount(v);
          if (Number.isFinite(n) && n > 0) r.data.amount = n;
        });
        const m = makeInlineInput("メモ", r.data.memo || "", "text", (v) => { r.data.memo = v; }, true);

        form.appendChild(d);
        form.appendChild(w);
        form.appendChild(c);
        form.appendChild(a);
        form.appendChild(m);

        card.appendChild(form);
      }

      list.appendChild(card);
    });
  }

  function makeInlineInput(label, value, type, onChange, fullWidth = false) {
    const wrap = document.createElement("div");
    if (fullWidth) wrap.style.gridColumn = "1 / -1";

    const l = document.createElement("div");
    l.textContent = label;
    l.style.fontSize = "0.85em";
    l.style.opacity = "0.85";
    l.style.marginBottom = "4px";

    const input = document.createElement("input");
    input.type = type;
    input.value = value;
    input.style.width = "100%";
    input.style.padding = "10px 12px";
    input.style.borderRadius = "12px";
    input.style.border = "1px solid var(--border,#e5e5e5)";
    input.style.background = "var(--bg,#fff)";
    input.addEventListener("blur", () => {
      onChange(input.value);
      renderImportPreview();
    });

    wrap.appendChild(l);
    wrap.appendChild(input);
    return wrap;
  }

  function makeInlineSelect(label, value, options, onChange) {
    const wrap = document.createElement("div");
    const l = document.createElement("div");
    l.textContent = label;
    l.style.fontSize = "0.85em";
    l.style.opacity = "0.85";
    l.style.marginBottom = "4px";

    const sel = document.createElement("select");
    sel.style.width = "100%";
    sel.style.padding = "10px 12px";
    sel.style.borderRadius = "12px";
    sel.style.border = "1px solid var(--border,#e5e5e5)";
    sel.style.background = "var(--bg,#fff)";
    options.forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o;
      opt.textContent = o;
      sel.appendChild(opt);
    });
    sel.value = value;
    sel.addEventListener("change", () => {
      onChange(sel.value);
      renderImportPreview();
    });

    wrap.appendChild(l);
    wrap.appendChild(sel);
    return wrap;
  }

  function commitImportPreview() {
    if (!importPreviewState) return;

    const existingKeys = new Set(entries.map(makeDedupeKey));
    const previewKeys = new Set();

    let committed = 0;
    let skippedDup = 0;
    let skippedInvalid = 0;

    importPreviewState.parsedRows.forEach((r) => {
      if (r.status !== "ok") return;
      if (!r.selected) return;

      const d = String(r.data.date || "").trim();
      const w = normalizeWorkplaceName(r.data.workplace || "");
      const c = String(r.data.category || "").trim();
      const a = Number(r.data.amount || 0);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !w || !["報酬","交通費","手当","その他"].includes(c) || !Number.isFinite(a) || a <= 0) {
        skippedInvalid++;
        return;
      }

      const normalized = { date: d, workplace: w, category: c, amount: a, memo: String(r.data.memo || "") };
      const key = makeDedupeKey(normalized);

      if (existingKeys.has(key) || previewKeys.has(key)) {
        skippedDup++;
        return;
      }

      entries.push(normalized);
      existingKeys.add(key);
      previewKeys.add(key);
      bumpWorkplace(w);
      committed++;
    });

    renderAll();
    closeImportPreview();

    if (committed === 0) {
      showError(`追加できる行がありませんでした。\n重複スキップ：${skippedDup} / 不正：${skippedInvalid}`);
      return;
    }
    toast(`CSV取り込み：${committed}件追加（重複スキップ：${skippedDup}）`);
  }

  function bindCSV() {
    if (csvExportBtn) csvExportBtn.addEventListener("click", exportCSV);

    if (csvInput) {
      csvInput.addEventListener("change", (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        importCSVFile(file);
        ev.target.value = "";
      });
    }
  }

  // ----------------------------
  // OCR（β） Phase 3
  // ----------------------------
  let tesseractLoading = null;

  function bindOCR() {
    if (!ocrBtn || !ocrInput) return;

    ocrBtn.addEventListener("click", async () => {
      // load lazily (only when user tries)
      try {
        await ensureTesseractLoaded();
      } catch (e) {
        showError(
          "OCRの準備に失敗しました。\n通信環境をご確認のうえ、再度お試しください。"
        );
        return;
      }
      ocrInput.click();
    });

    ocrInput.addEventListener("change", async (ev) => {
      const files = Array.from(ev.target.files || []);
      ev.target.value = "";
      if (files.length === 0) return;

      // OCR can be heavy; warn if too many
      if (files.length >= 6) {
        toast("枚数が多いです（β）。まずは数枚ずつ推奨");
      }

      try {
        await ensureTesseractLoaded();
        await runOCRFiles(files);
      } catch (e) {
        console.error(e);
        showError("OCRに失敗しました。\n（β機能）画像を減らす / 文字が大きいスクショで再試行してください。");
      }
    });
  }

  function ensureTesseractLoaded() {
    if (window.Tesseract) return Promise.resolve();
    if (tesseractLoading) return tesseractLoading;

    tesseractLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      // Tesseract.js v5 CDN
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      s.async = true;
      s.onload = () => {
        if (window.Tesseract) resolve();
        else reject(new Error("Tesseract not available"));
      };
      s.onerror = () => reject(new Error("Failed to load tesseract.js"));
      document.head.appendChild(s);
    });

    return tesseractLoading;
  }

  async function runOCRFiles(files) {
    injectOCRPreviewModal();

    toast(`OCR開始（${files.length}枚）`);
    const items = [];

    // Process sequentially to reduce memory spikes on mobile
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      toast(`OCR中… ${i + 1}/${files.length}`);

      const { text } = await recognizeImage(f);

      // Build candidates from recognized text
      const candidates = extractCandidatesFromOCRText(text);

      if (candidates.length === 0) {
        items.push({
          sourceName: f.name || `image-${i + 1}`,
          index: i,
          status: "skip",
          reason: "候補を抽出できませんでした",
          selected: false,
          data: emptyRowData(),
          rawText: text
        });
        continue;
      }

      // If multiple candidates: create one per candidate
      candidates.forEach((c, k) => {
        const isOk = !!c.date && !!c.amount && !!c.workplace;
        items.push({
          sourceName: f.name || `image-${i + 1}`,
          index: i * 1000 + k,
          status: isOk ? "ok" : "skip",
          reason: isOk ? "OK" : "不足（要修正）",
          selected: isOk,
          data: {
            date: c.date || "",
            workplace: c.workplace || "",
            category: c.category || "報酬",
            amount: c.amount || 0,
            memo: c.memo || ""
          },
          rawText: text
        });
      });
    }

    const okCount = items.filter((x) => x.status === "ok").length;
    if (okCount === 0) {
      showError("OCRから追加できる候補がありませんでした。\n（文字が小さい/暗い/ブレている可能性）");
      return;
    }

    openOCRPreview({ items, meta: { fileCount: files.length } });
    toast("OCR完了（確認してください）");
  }

  async function recognizeImage(file) {
    // downscale via canvas to speed up (optional, safe)
    const bitmap = await createImageBitmap(file);
    const maxW = 1400;
    const scale = bitmap.width > maxW ? maxW / bitmap.width : 1;
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/png");

    // Use Japanese+English model (more robust on mixed UI)
    const res = await window.Tesseract.recognize(dataUrl, "jpn+eng", {
      logger: () => {} // keep silent
    });

    const text = (res?.data?.text || "").trim();
    return { text };
  }

  function extractCandidatesFromOCRText(text) {
    const raw = String(text || "");
    const lines = raw
      .split(/\r?\n/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    // Heuristic:
    // - find date-like tokens
    // - find amount-like tokens
    // - try to pair nearest date + nearest amount and pick workplace from nearby lines
    const dates = [];
    const amounts = [];

    const dateRegex = /(\d{4})\s*(?:[\/\-.年])\s*(\d{1,2})\s*(?:[\/\-.月])\s*(\d{1,2})\s*(?:日)?/;
    const amountRegex = /(?:¥|￥)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,})\s*(?:円)?/;

    lines.forEach((ln, idx) => {
      const m = ln.match(dateRegex);
      if (m) {
        const yyyy = m[1];
        const mm = String(m[2]).padStart(2, "0");
        const dd = String(m[3]).padStart(2, "0");
        dates.push({ idx, date: `${yyyy}-${mm}-${dd}` });
      }

      // amounts: avoid picking tiny numbers (e.g., times). Require >= 3 digits.
      const a = ln.match(amountRegex);
      if (a) {
        const v = cleanAmount(a[1]);
        if (Number.isFinite(v) && v >= 100) {
          amounts.push({ idx, amount: v, line: ln });
        }
      }
    });

    // If no explicit lists, fallback: attempt overall
    if (dates.length === 0 && amounts.length === 0) return [];

    // Pairing strategy:
    // For each date, choose the nearest amount below it (within 0..8 lines),
    // workplace = first "name-like" line between date and amount.
    const results = [];

    dates.forEach((d) => {
      const near = amounts
        .map((a) => ({ a, dist: a.idx - d.idx }))
        .filter((x) => x.dist >= 0 && x.dist <= 8)
        .sort((x, y) => x.dist - y.dist)[0];

      const amount = near?.a?.amount;

      // workplace search window: d.idx..(near.idx) or d.idx..(d.idx+4)
      const end = near ? near.a.idx : Math.min(lines.length - 1, d.idx + 4);
      const windowLines = lines.slice(d.idx, end + 1);

      // pick a workplace-like line:
      // - not containing date
      // - not containing yen/amount keywords
      // - not too short (>=2 chars)
      // - not obvious UI words
      const workplace = pickWorkplaceFromLines(windowLines);

      // category guess: if window contains 交通費, set it. else 報酬.
      const cat = /交通費/.test(windowLines.join(" ")) ? "交通費" : "報酬";

      results.push({
        date: d.date,
        workplace: workplace || "",
        category: cat,
        amount: amount || 0,
        memo: "（OCRβ）"
      });
    });

    // If no dates but amount exists: single candidate with empty date/workplace
    if (results.length === 0 && amounts.length > 0) {
      results.push({
        date: "",
        workplace: "",
        category: "報酬",
        amount: amounts[0].amount,
        memo: "（OCRβ）"
      });
    }

    // Remove exact duplicates inside OCR results
    const seen = new Set();
    const uniq = [];
    results.forEach((r) => {
      const key = `${r.date}|${normalizeWorkplaceName(r.workplace)}|${r.category}|${r.amount}`;
      if (seen.has(key)) return;
      seen.add(key);
      uniq.push(r);
    });

    return uniq;
  }

  function pickWorkplaceFromLines(windowLines) {
    const blacklist = [
      "合計", "合算", "明細", "詳細", "支払い", "受取", "報酬", "交通費",
      "円", "¥", "￥", "勤務", "就労", "履歴", "完了", "確定", "依頼"
    ];

    for (const ln of windowLines) {
      if (ln.length < 2) continue;
      if (/\d{4}[-\/.年]/.test(ln)) continue; // date-ish
      if (/[¥￥]\s*\d/.test(ln) || /\d{1,3}(?:,\d{3})+/.test(ln)) continue; // amount-ish
      if (blacklist.some((b) => ln.includes(b))) continue;

      // avoid pure numbers
      if (/^\d+$/.test(ln)) continue;

      // reasonable workplace name
      return normalizeWorkplaceName(ln);
    }
    return "";
  }

  function renderOCRPreview() {
    if (!ocrPreviewState) return;

    const { items, meta } = ocrPreviewState;
    const showSkipped = $("ocrShowSkipped")?.checked;

    const okTotal = items.filter((x) => x.status === "ok").length;
    const selectedCount = items.filter((x) => x.status === "ok" && x.selected).length;
    const skippedCount = items.filter((x) => x.status === "skip").length;

    $("ocrPreviewSummary").textContent =
      `画像：${meta.fileCount}枚 / 追加候補：${okTotal}件（選択：${selectedCount}件） / スキップ：${skippedCount}件`;

    $("ocrCommitBtn").textContent = `選択した行を追加（${selectedCount}件）`;
    $("ocrCommitBtn").disabled = selectedCount === 0;
    $("ocrCommitBtn").style.opacity = selectedCount === 0 ? "0.5" : "1";
    $("ocrCommitBtn").style.cursor = selectedCount === 0 ? "not-allowed" : "pointer";

    const list = $("ocrPreviewList");
    list.innerHTML = "";

    const toRender = items.filter((x) => x.status === "ok" || showSkipped);

    toRender.forEach((it) => {
      const card = document.createElement("div");
      card.style.border = "1px solid var(--border,#e5e5e5)";
      card.style.borderRadius = "14px";
      card.style.padding = "12px";
      card.style.background = "var(--card-bg,#f9f9f9)";

      const top = document.createElement("div");
      top.style.display = "flex";
      top.style.alignItems = "center";
      top.style.justifyContent = "space-between";
      top.style.gap = "10px";
      top.style.flexWrap = "wrap";

      const left = document.createElement("div");
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "10px";
      left.style.flexWrap = "wrap";

      if (it.status === "ok") {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!it.selected;
        cb.addEventListener("change", () => {
          it.selected = cb.checked;
          renderOCRPreview();
        });
        left.appendChild(cb);
      } else {
        const badge = document.createElement("span");
        badge.textContent = "SKIP";
        badge.style.fontWeight = "800";
        badge.style.fontSize = "0.85em";
        badge.style.padding = "4px 8px";
        badge.style.borderRadius = "999px";
        badge.style.border = "1px solid var(--border,#e5e5e5)";
        badge.style.opacity = "0.8";
        left.appendChild(badge);
      }

      const title = document.createElement("div");
      title.style.fontWeight = "800";
      title.textContent =
        it.status === "ok"
          ? `${it.data.date || "日付?"} / ${it.data.workplace || "就業先?"}（${it.sourceName}）`
          : `スキップ：${it.reason}（${it.sourceName}）`;
      left.appendChild(title);

      const right = document.createElement("div");
      right.style.fontWeight = "800";
      right.textContent = it.status === "ok" ? formatYen(it.data.amount) : "";
      top.appendChild(left);
      top.appendChild(right);

      const meta = document.createElement("div");
      meta.style.marginTop = "8px";
      meta.style.opacity = "0.9";
      meta.style.fontSize = "0.95em";
      meta.textContent =
        it.status === "ok"
          ? `[${it.data.category}] ${it.data.memo ? ` / メモ：${it.data.memo}` : ""}`
          : `理由：${it.reason}`;

      card.appendChild(top);
      card.appendChild(meta);

      if (it.status === "ok") {
        const form = document.createElement("div");
        form.style.display = "grid";
        form.style.gridTemplateColumns = "1fr 1fr";
        form.style.gap = "8px";
        form.style.marginTop = "10px";

        const d = makeInlineInput2("日付", it.data.date, "date", (v) => { it.data.date = v; });
        const w = makeInlineInput2("就業先", it.data.workplace, "text", (v) => { it.data.workplace = normalizeWorkplaceName(v); });
        const c = makeInlineSelect2("区分", it.data.category, ["報酬","交通費","手当","その他"], (v) => { it.data.category = v; });
        const a = makeInlineInput2("金額", String(it.data.amount || ""), "text", (v) => {
          const n = cleanAmount(v);
          if (Number.isFinite(n) && n > 0) it.data.amount = n;
        });
        const m = makeInlineInput2("メモ", it.data.memo || "", "text", (v) => { it.data.memo = v; }, true);

        form.appendChild(d);
        form.appendChild(w);
        form.appendChild(c);
        form.appendChild(a);
        form.appendChild(m);

        // raw text toggle
        const rawWrap = document.createElement("div");
        rawWrap.style.gridColumn = "1 / -1";
        rawWrap.style.marginTop = "8px";

        const rawBtn = document.createElement("button");
        rawBtn.type = "button";
        rawBtn.textContent = "OCRテキストを見る";
        rawBtn.style.padding = "10px 12px";
        rawBtn.style.border = "1px solid var(--border,#e5e5e5)";
        rawBtn.style.background = "transparent";
        rawBtn.style.borderRadius = "12px";
        rawBtn.style.cursor = "pointer";

        const rawBox = document.createElement("div");
        rawBox.style.display = "none";
        rawBox.style.marginTop = "8px";
        rawBox.style.whiteSpace = "pre-wrap";
        rawBox.style.fontSize = "0.9em";
        rawBox.style.opacity = "0.9";
        rawBox.style.border = "1px dashed var(--border,#e5e5e5)";
        rawBox.style.borderRadius = "12px";
        rawBox.style.padding = "10px";
        rawBox.textContent = it.rawText || "";

        rawBtn.addEventListener("click", () => {
          rawBox.style.display = rawBox.style.display === "none" ? "block" : "none";
        });

        rawWrap.appendChild(rawBtn);
        rawWrap.appendChild(rawBox);

        card.appendChild(form);
        card.appendChild(rawWrap);
      }

      list.appendChild(card);
    });
  }

  function makeInlineInput2(label, value, type, onChange, fullWidth = false) {
    const wrap = document.createElement("div");
    if (fullWidth) wrap.style.gridColumn = "1 / -1";

    const l = document.createElement("div");
    l.textContent = label;
    l.style.fontSize = "0.85em";
    l.style.opacity = "0.85";
    l.style.marginBottom = "4px";

    const input = document.createElement("input");
    input.type = type;
    input.value = value || "";
    input.style.width = "100%";
    input.style.padding = "10px 12px";
    input.style.borderRadius = "12px";
    input.style.border = "1px solid var(--border,#e5e5e5)";
    input.style.background = "var(--bg,#fff)";
    input.addEventListener("blur", () => {
      onChange(input.value);
      renderOCRPreview();
    });

    wrap.appendChild(l);
    wrap.appendChild(input);
    return wrap;
  }

  function makeInlineSelect2(label, value, options, onChange) {
    const wrap = document.createElement("div");
    const l = document.createElement("div");
    l.textContent = label;
    l.style.fontSize = "0.85em";
    l.style.opacity = "0.85";
    l.style.marginBottom = "4px";

    const sel = document.createElement("select");
    sel.style.width = "100%";
    sel.style.padding = "10px 12px";
    sel.style.borderRadius = "12px";
    sel.style.border = "1px solid var(--border,#e5e5e5)";
    sel.style.background = "var(--bg,#fff)";
    options.forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o;
      opt.textContent = o;
      sel.appendChild(opt);
    });
    sel.value = value || "報酬";
    sel.addEventListener("change", () => {
      onChange(sel.value);
      renderOCRPreview();
    });

    wrap.appendChild(l);
    wrap.appendChild(sel);
    return wrap;
  }

  function commitOCRPreview() {
    if (!ocrPreviewState) return;

    const existingKeys = new Set(entries.map(makeDedupeKey));
    const previewKeys = new Set();

    let committed = 0;
    let skippedDup = 0;
    let skippedInvalid = 0;

    ocrPreviewState.items.forEach((it) => {
      if (it.status !== "ok") return;
      if (!it.selected) return;

      const d = String(it.data.date || "").trim();
      const w = normalizeWorkplaceName(it.data.workplace || "");
      const c = String(it.data.category || "").trim();
      const a = Number(it.data.amount || 0);
      const m = String(it.data.memo || "");

      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !w || !["報酬","交通費","手当","その他"].includes(c) || !Number.isFinite(a) || a <= 0) {
        skippedInvalid++;
        return;
      }

      const normalized = { date: d, workplace: w, category: c, amount: a, memo: m };
      const key = makeDedupeKey(normalized);

      if (existingKeys.has(key) || previewKeys.has(key)) {
        skippedDup++;
        return;
      }

      entries.push(normalized);
      existingKeys.add(key);
      previewKeys.add(key);
      bumpWorkplace(w);
      committed++;
    });

    renderAll();
    closeOCRPreview();

    if (committed === 0) {
      showError(`追加できる行がありませんでした。\n重複スキップ：${skippedDup} / 不正：${skippedInvalid}`);
      return;
    }
    toast(`OCR取り込み：${committed}件追加（重複スキップ：${skippedDup}）`);
  }

  // ----------------------------
  // Utils
  // ----------------------------
  function safeJsonParse(s, fallback) {
    try {
      const v = JSON.parse(s);
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  function toISODate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // ----------------------------
  // Init
  // ----------------------------
  function init() {
    applySettings();
    bindSettingsUI();

    // Inject helpers without touching HTML
    injectDateShortcuts();
    injectWorkplaceQuickPicks();
    injectCategoryChips();

    // CSV UI
    injectCSVSpecHelp();
    injectImportPreviewModal();

    // OCR UI (modal injected; button exists in HTML)
    injectOCRPreviewModal();

    updateWorkplaceDatalist();

    bindAddButton();
    bindCSV();
    bindOCR();

    // default date = today
    if (dateInput && !dateInput.value) {
      dateInput.value = toISODate(new Date());
    }

    renderAll();
  }

  init();
})();
