/* =====================================================
 * sukima-baito-income | NicheWorks
 * app.js (Phase 2 CSV trust + Import Preview + Phase 3 OCR β)
 *
 * Phase 1:
 * - Theme toggle (localStorage)
 * - Font size toggle (localStorage)
 * - Date shortcuts: Today / Yesterday (injected UI)
 * - Workplace reuse: datalist + recent quick-picks (localStorage)
 * - Edit entries
 * - Month-grouped list with collapse + month totals
 *
 * Phase 2:
 * - CSV spec help block (injected UI)
 * - CSV import PREVIEW (no immediate commit)
 * - Strict CSV validation (header + field rules)
 * - Duplicate rejection (default): date+workplace+category+amount
 * - Import preview shows counts + skip reasons + per-row toggle
 *
 * Phase 3 (OCR β):
 * - "スクショOCR（β）" button (injected near CSV actions)
 * - Tesseract.js lazy-load (CDN)
 * - OCR -> best-effort parse for Timee screenshots
 * - Preview & confirm modal (no immediate commit)
 * - Duplicate rejection at preview + commit
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

  // Import preview state
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

  // Small toast (non-blocking)
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
      const b = makeMiniBtn(w.name.length > 18 ? w.name.slice(0, 18) + "…" : w.name, () => {
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
    if (dateInput) dateInput.value = toISODate(new Date());
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
      const date = String(dateInput.value || "").trim();
      const workplace = normalizeWorkplaceName(workplaceInput.value);
      const category = String(categoryInput.value || "報酬");
      const amountRaw = String(amountInput.value || "").trim();
      const memo = String(memoInput.value || "").trim();

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

  // Simple CSV parser (handles quotes)
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

        const d = makeInlineInput("日付", r.data.date, "date", (v) => {
          r.data.date = v;
        });

        const w = makeInlineInput("就業先", r.data.workplace, "text", (v) => {
          r.data.workplace = normalizeWorkplaceName(v);
        });

        const c = makeInlineSelect("区分", r.data.category, ["報酬","交通費","手当","その他"], (v) => {
          r.data.category = v;
        });

        const a = makeInlineInput("金額", String(r.data.amount), "text", (v) => {
          const n = cleanAmount(v);
          if (Number.isFinite(n) && n > 0) r.data.amount = n;
        });

        const m = makeInlineInput("メモ", r.data.memo || "", "text", (v) => {
          r.data.memo = v;
        }, true);

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
    if (csvExportBtn) {
      csvExportBtn.addEventListener("click", exportCSV);
    }
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
  // OCR β (Phase 3)
  // ----------------------------

  let _tesseractReady = false;
  let _ocrState = null;

  function initOCRBeta() {
    injectOCRBetaUI();
    injectOCRPreviewModal();
    bindOCRBeta();
  }

  function injectOCRBetaUI() {
    if (!$("ocrInput")) {
      const input = document.createElement("input");
      input.id = "ocrInput";
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;
      input.hidden = true;
      document.body.appendChild(input);
    }

    if ($("ocrBtn")) return;

    const csvActions = document.querySelector(".csv-actions");
    if (!csvActions) return;

    const btn = document.createElement("button");
    btn.id = "ocrBtn";
    btn.type = "button";
    btn.className = "delete-btn";
    btn.textContent = "スクショOCR（β）";
    btn.style.minWidth = "140px";

    csvActions.appendChild(btn);

    if (!document.getElementById("ocrHelpNote")) {
      const note = document.createElement("div");
      note.id = "ocrHelpNote";
      note.style.marginTop = "8px";
      note.style.fontSize = "0.9em";
      note.style.opacity = "0.85";
      note.textContent =
        "※Timeeの詳細スクショ推奨。取り込み前に確認画面が出ます（即追加しません）。";
      csvActions.insertAdjacentElement("afterend", note);
    }
  }

  function bindOCRBeta() {
    const btn = $("ocrBtn");
    const input = $("ocrInput");
    if (!btn || !input) return;

    btn.addEventListener("click", () => input.click());

    input.addEventListener("change", async (ev) => {
      const files = Array.from(ev.target.files || []);
      ev.target.value = "";
      if (!files.length) return;

      try {
        await runOCRFlow(files);
      } catch (e) {
        console.error(e);
        showError("OCRでエラーが発生しました。別のスクショでお試しください。");
      }
    });
  }

  async function runOCRFlow(files) {
    toast(`OCR準備中…（${files.length}枚）`);
    await ensureTesseract();

    const results = [];
    for (let i = 0; i < files.length; i++) {
      toast(`OCR中… ${i + 1}/${files.length}`);
      const file = files[i];
      const text = await ocrImageFile(file);

      const candidates = parseTimeeOCR(text);
      results.push({ fileName: file.name, rawText: text, candidates });
    }

    openOCRPreview(results);
  }

  async function ensureTesseract() {
    if (_tesseractReady && window.Tesseract) return;

    await loadScriptOnce(
      "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",
      "tesseractjs"
    );

    if (!window.Tesseract) throw new Error("Tesseract.js failed to load");
    _tesseractReady = true;
  }

  function loadScriptOnce(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) return resolve();

      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load script: " + src));
      document.head.appendChild(s);
    });
  }

  async function ocrImageFile(file) {
    const { data } = await window.Tesseract.recognize(file, "jpn", { logger: () => {} });
    return String(data?.text || "").trim();
  }

  // ---- OCR parsing (detail + list best-effort) ----
  function parseTimeeOCR(ocrText) {
    const t = normalizeOCRText(ocrText);

    // Heuristic: detail screen tends to contain these labels
    const isDetail =
      t.includes("給与明細") ||
      t.includes("差引支給額") ||
      t.includes("働いた店舗") ||
      t.includes("業務開始") ||
      t.includes("業務終了");

    if (isDetail) return parseTimeeDetail(t);

    // Otherwise try list-style parse (multiple dates + ¥ amounts)
    const list = parseTimeeList(t);
    if (list.length) return list;

    // Fallback: single uncertain row
    return [{
      status: "ok",
      selected: true,
      reason: "要確認（自動抽出が弱い）— 編集してください",
      data: { date: "", workplace: "", category: "報酬", amount: 0, memo: "OCR（要確認）" }
    }];
  }

  function parseTimeeDetail(t) {
    const candidates = [];

    // date
    const dateISO = extractJapaneseDateISO(t) || "";

    // workplace
    let workplace =
      pickLineAfterLabel(t, "働いた店舗") ||
      pickLineAfterLabel(t, "店舗情報") ||
      pickFirstLikelyWorkplaceLine(t) ||
      "";
    workplace = normalizeWorkplaceName(workplace);

    // pay (prefer 差引支給額)
    const pay = pickYenAfterLabel(t, ["差引支給額", "差引支給", "支給額", "基本給"]);
    const transport = pickYenAfterLabel(t, ["交通費（非課税）", "交通費", "通勤費"]);

    if (dateISO && workplace && pay > 0) {
      candidates.push({
        status: "ok",
        selected: true,
        reason: "OK（差引支給額）",
        data: { date: dateISO, workplace, category: "報酬", amount: pay, memo: "OCR（差引支給額）" }
      });
    }

    if (dateISO && workplace && transport > 0) {
      candidates.push({
        status: "ok",
        selected: false, // OFF by default to reduce double counting
        reason: "任意（交通費）",
        data: { date: dateISO, workplace, category: "交通費", amount: transport, memo: "OCR（交通費）" }
      });
    }

    if (candidates.length === 0) {
      candidates.push({
        status: "ok",
        selected: true,
        reason: "要確認（抽出失敗）— 編集してください",
        data: { date: dateISO || "", workplace: workplace || "", category: "報酬", amount: 0, memo: "OCR（要確認）" }
      });
    }

    return candidates;
  }

  function parseTimeeList(t) {
    // Try to find repeated blocks: date + workplace + amount
    const lines = t.split("\n").map((x) => x.trim()).filter(Boolean);

    /** @type {Array<any>} */
    const out = [];

    for (let i = 0; i < lines.length; i++) {
      const d = extractJapaneseDateISO(lines[i]);
      if (!d) continue;

      // find amount within next few lines
      let amount = 0;
      let amountLineIdx = -1;
      for (let j = i; j < Math.min(i + 8, lines.length); j++) {
        const a = extractYen(lines[j]);
        if (a > 0) {
          amount = a;
          amountLineIdx = j;
          break;
        }
      }
      if (amount <= 0) continue;

      // workplace guess: first decent line between date line and amount line
      let workplace = "";
      for (let j = i + 1; j < Math.min(amountLineIdx + 1, lines.length); j++) {
        const ln = lines[j];
        if (isLikelyUIWord(ln)) continue;
        if (extractYen(ln) > 0) continue;
        if (ln.length < 3) continue;
        workplace = ln;
        break;
      }
      workplace = normalizeWorkplaceName(workplace);

      out.push({
        status: "ok",
        selected: true,
        reason: "OK（一覧推定）",
        data: {
          date: d,
          workplace: workplace || "",
          category: "報酬",
          amount,
          memo: "OCR（一覧推定）"
        }
      });
    }

    // If we found a lot but workplaces are empty, keep but user will edit in preview
    return out;
  }

  function normalizeOCRText(s) {
    return String(s || "")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim();
  }

  function extractJapaneseDateISO(s) {
    const m = String(s).match(/(20\d{2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (!m) return "";
    return `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`;
  }

  function pickLineAfterLabel(text, label) {
    const lines = text.split("\n").map((x) => x.trim());
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(label)) {
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          const v = lines[j].trim();
          if (!v) continue;
          if (isLikelyUIWord(v)) continue;
          return v;
        }
      }
    }
    return "";
  }

  function isLikelyUIWord(line) {
    const bad = [
      "この店舗の募集状況",
      "給与明細",
      "業務開始",
      "業務終了",
      "休憩時間",
      "今回の業務に関する情報",
      "契約形態",
      "支払者",
      "業務に関する書類",
      "お問い合わせ",
      "この業務の募集内容",
      "はたらく",
      "これまでの仕事",
      "今後の予定"
    ];
    return bad.some((b) => line.includes(b));
  }

  function pickFirstLikelyWorkplaceLine(text) {
    const lines = text.split("\n").map((x) => x.trim()).filter(Boolean);
    const markers = ["株式会社", "有限会社", "店", "営業所", "センター", "倉庫"];
    for (const ln of lines) {
      if (ln.length >= 6 && ln.length <= 42 && markers.some((m) => ln.includes(m))) {
        if (!isLikelyUIWord(ln)) return ln;
      }
    }
    for (const ln of lines) {
      if (ln.length >= 8 && ln.length <= 42 && !isLikelyUIWord(ln)) {
        if (ln.includes("／") || ln.includes("/")) continue;
        if (/^¥?\d[\d,]*$/.test(ln)) continue;
        return ln;
      }
    }
    return "";
  }

  function pickYenAfterLabel(text, labels) {
    for (const label of labels) {
      const v = yenNearLabel(text, label);
      if (v > 0) return v;
    }
    return 0;
  }

  function yenNearLabel(text, label) {
    const lines = text.split("\n").map((x) => x.trim());
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (!ln.includes(label)) continue;

      const same = extractYen(ln);
      if (same > 0) return same;

      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const v = extractYen(lines[j]);
        if (v > 0) return v;
      }
    }
    return 0;
  }

  function extractYen(s) {
    const m = String(s).match(/[¥￥]?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{1,9})/);
    if (!m) return 0;
    const n = cleanAmount(m[1]);
    return Number.isFinite(n) ? n : 0;
  }

  // ---- OCR preview modal ----
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
    overlay.style.zIndex = "10000";

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
            <div style="font-weight:800; font-size:1.05em;">スクショOCR（β）取り込み確認</div>
            <div id="ocrPreviewSummary" style="margin-top:6px; opacity:0.85; font-size:0.95em;"></div>
          </div>
          <button id="ocrPreviewCloseBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:transparent;border-radius:12px;cursor:pointer;">
            閉じる
          </button>
        </div>
      </div>

      <div style="padding:12px 14px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <button id="ocrSelectAllBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:var(--card-bg,#f9f9f9);border-radius:12px;cursor:pointer;">
            全選択
          </button>
          <button id="ocrSelectNoneBtn" type="button"
            style="padding:10px 12px;border:1px solid var(--border,#e5e5e5);background:var(--card-bg,#f9f9f9);border-radius:12px;cursor:pointer;">
            全解除
          </button>
          <div style="font-size:0.9em; opacity:0.85; display:flex; align-items:center; gap:6px;">
            <input id="ocrShowRawText" type="checkbox" />
            <label for="ocrShowRawText">OCR生テキストも表示</label>
          </div>
        </div>

        <button id="ocrCommitBtn" type="button"
          style="padding:12px 14px;border:1px solid var(--border,#e5e5e5);background:#111;color:#fff;border-radius:12px;cursor:pointer;">
          選択した行を追加
        </button>
      </div>

      <div style="padding:0 14px 14px 14px;">
        <div style="margin-bottom:10px; font-size:0.92em; opacity:0.85;">
          ※「交通費」は二重計上を防ぐため、初期状態はOFFです。必要なときだけONにしてください。
        </div>
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
      if (!_ocrState) return;
      _ocrState.rows.forEach((r) => {
        if (r.status !== "skip") r.selected = true;
      });
      renderOCRPreview();
    });

    $("ocrSelectNoneBtn").addEventListener("click", () => {
      if (!_ocrState) return;
      _ocrState.rows.forEach((r) => {
        if (r.status !== "skip") r.selected = false;
      });
      renderOCRPreview();
    });

    $("ocrShowRawText").addEventListener("change", () => renderOCRPreview());
    $("ocrCommitBtn").addEventListener("click", commitOCRPreview);
  }

  function openOCRPreview(results) {
    const existingKeys = new Set(entries.map(makeDedupeKey));

    const flat = [];
    let rowNo = 1;

    results.forEach((res) => {
      (res.candidates || []).forEach((cand) => {
        const normalized = normalizeOCRCandidate(cand);

        const key = makeDedupeKey(normalized.data);
        if (existingKeys.has(key) && normalized.data.amount > 0) {
          normalized.selected = false;
          normalized.status = "skip";
          normalized.reason = "重複（既存データと一致）";
        }

        normalized._fromFile = res.fileName;
        normalized._rawText = res.rawText;
        normalized.rowNo = rowNo++;
        flat.push(normalized);
      });
    });

    _ocrState = { results, rows: flat };
    renderOCRPreview();

    $("ocrPreviewModal").style.display = "flex";
    $("ocrShowRawText").checked = false;
  }

  function closeOCRPreview() {
    $("ocrPreviewModal").style.display = "none";
    _ocrState = null;
  }

  function normalizeOCRCandidate(cand) {
    const data = cand.data || {};
    return {
      rowNo: cand.rowNo || 0,
      status: cand.status || "ok",
      selected: cand.selected !== false,
      reason: cand.reason || "OK",
      data: {
        date: String(data.date || "").trim(),
        workplace: normalizeWorkplaceName(data.workplace || ""),
        category: String(data.category || "報酬").trim(),
        amount: Number(data.amount || 0),
        memo: String(data.memo || ""),
      },
    };
  }

  function renderOCRPreview() {
    if (!_ocrState) return;

    const showRaw = $("ocrShowRawText")?.checked;
    const list = $("ocrPreviewList");
    list.innerHTML = "";

    const rows = _ocrState.rows;

    const okRows = rows.filter((r) => r.status !== "skip");
    const selectedCount = rows.filter((r) => r.status !== "skip" && r.selected).length;
    const skipCount = rows.filter((r) => r.status === "skip").length;

    $("ocrPreviewSummary").textContent =
      `候補：${okRows.length}件（選択：${selectedCount}件） / スキップ：${skipCount}件`;

    $("ocrCommitBtn").textContent = `選択した行を追加（${selectedCount}件）`;
    $("ocrCommitBtn").disabled = selectedCount === 0;
    $("ocrCommitBtn").style.opacity = selectedCount === 0 ? "0.5" : "1";
    $("ocrCommitBtn").style.cursor = selectedCount === 0 ? "not-allowed" : "pointer";

    rows.forEach((r) => {
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

      if (r.status === "skip") {
        const badge = document.createElement("span");
        badge.textContent = "SKIP";
        badge.style.fontWeight = "800";
        badge.style.fontSize = "0.85em";
        badge.style.padding = "4px 8px";
        badge.style.borderRadius = "999px";
        badge.style.border = "1px solid var(--border,#e5e5e5)";
        badge.style.opacity = "0.8";
        left.appendChild(badge);
      } else {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!r.selected;
        cb.addEventListener("change", () => {
          r.selected = cb.checked;
          renderOCRPreview();
        });
        left.appendChild(cb);
      }

      const title = document.createElement("div");
      title.style.fontWeight = "800";
      title.textContent =
        r.status === "skip"
          ? `#${r.rowNo}（${r.reason}）`
          : `#${r.rowNo} ${r.data.date || "日付?"} / ${r.data.workplace || "就業先?"}`;
      left.appendChild(title);

      const right = document.createElement("div");
      right.style.fontWeight = "800";
      right.textContent = r.data.amount > 0 ? formatYen(r.data.amount) : "";
      top.appendChild(left);
      top.appendChild(right);

      const meta = document.createElement("div");
      meta.style.marginTop = "8px";
      meta.style.opacity = "0.9";
      meta.style.fontSize = "0.95em";
      meta.textContent = `[${r.data.category}] ${r.data.memo ? ` / ${r.data.memo}` : ""}`;

      const src = document.createElement("div");
      src.style.marginTop = "6px";
      src.style.fontSize = "0.85em";
      src.style.opacity = "0.75";
      src.textContent = `画像：${r._fromFile || "-"}`;

      card.appendChild(top);
      card.appendChild(meta);
      card.appendChild(src);

      if (r.status !== "skip") {
        const form = document.createElement("div");
        form.style.display = "grid";
        form.style.gridTemplateColumns = "1fr 1fr";
        form.style.gap = "8px";
        form.style.marginTop = "10px";

        const d = makeInlineInput("日付", r.data.date, "date", (v) => { r.data.date = v; });
        const w = makeInlineInput("就業先", r.data.workplace, "text", (v) => { r.data.workplace = normalizeWorkplaceName(v); });
        const c = makeInlineSelect("区分", r.data.category, ["報酬","交通費","手当","その他"], (v) => { r.data.category = v; });

        const a = makeInlineInput("金額", r.data.amount ? String(r.data.amount) : "", "text", (v) => {
          const n = cleanAmount(v);
          r.data.amount = Number.isFinite(n) ? n : 0;
        });

        const m = makeInlineInput("メモ", r.data.memo || "", "text", (v) => { r.data.memo = v; }, true);

        form.appendChild(d);
        form.appendChild(w);
        form.appendChild(c);
        form.appendChild(a);
        form.appendChild(m);

        card.appendChild(form);
      }

      if (showRaw) {
        const raw = document.createElement("details");
        raw.style.marginTop = "10px";
        raw.innerHTML = `
          <summary style="cursor:pointer; opacity:0.85;">OCR生テキスト</summary>
          <pre style="white-space:pre-wrap; word-break:break-word; font-size:0.85em; margin-top:8px; padding:10px; border:1px solid var(--border,#e5e5e5); border-radius:12px; background:var(--bg,#fff);">${escapeHtml(r._rawText || "")}</pre>
        `;
        card.appendChild(raw);
      }

      list.appendChild(card);
    });
  }

  function commitOCRPreview() {
    if (!_ocrState) return;

    const existingKeys = new Set(entries.map(makeDedupeKey));
    const previewKeys = new Set();

    let committed = 0;
    let skippedDup = 0;
    let skippedInvalid = 0;

    _ocrState.rows.forEach((r) => {
      if (r.status === "skip") return;
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
    closeOCRPreview();

    if (committed === 0) {
      showError(`追加できる行がありませんでした。\n重複スキップ：${skippedDup} / 不正：${skippedInvalid}`);
      return;
    }
    toast(`OCR取り込み：${committed}件追加（重複スキップ：${skippedDup}）`);
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

    injectDateShortcuts();
    injectWorkplaceQuickPicks();
    injectCategoryChips();

    injectCSVSpecHelp();
    injectImportPreviewModal();

    // Phase 3 OCR β
    initOCRBeta();

    updateWorkplaceDatalist();

    bindAddButton();
    bindCSV();

    if (dateInput && !dateInput.value) {
      dateInput.value = toISODate(new Date());
    }

    renderAll();
  }

  init();
})();
