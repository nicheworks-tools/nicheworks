/* =====================================================
 * sukima-baito-income | NicheWorks
 * app.js (Phase 1 UI improvements)
 * - Theme toggle (localStorage)
 * - Font size toggle (localStorage)
 * - Date shortcuts: Today / Yesterday (injected UI)
 * - Workplace reuse: datalist + recent quick-picks (localStorage)
 * - Edit entries (no more delete+retype)
 * - Month-grouped list with collapse + month totals
 * - Annual + This-month sticky-ish summary (rendered in totalSummary)
 * - CSV export/import (strict validation + safer CSV parsing)
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
    // Put shortcuts right after date input
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

    // Insert after date input element
    dateInput.insertAdjacentElement("afterend", wrap);
  }

  function injectWorkplaceQuickPicks() {
    if (!workplaceInput) return;

    const host = document.createElement("div");
    host.id = "wpQuickPicks";
    host.style.display = "flex";
    host.style.flexWrap = "wrap";
    host.style.gap = "8px";

    // Insert after workplace input
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
    // Minimal normalization for comparison only (not “correction”):
    // trim, collapse spaces
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
    // keep a reasonable cap
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

    // Optional clear workplaces
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
    if (dateInput) dateInput.value = "";
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
    amountInput.focus();
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
        // Update
        entries[editingIndex] = record;
        bumpWorkplace(workplace);
        exitEditingMode();
      } else {
        // Add
        entries.push(record);
        bumpWorkplace(workplace);
        // Keep date as-is; many users enter multiple entries for the same day.
        clearForm();
      }

      renderAll();
      // After add, focus date if empty else workplace
      if (!dateInput.value) dateInput.focus();
      else workplaceInput.focus();
    });

    // convenience: Enter on amount triggers add/update (mobile keyboards vary)
    amountInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        addBtn.click();
      }
    });
  }

  // ----------------------------
  // Rendering (entries grouped by month + collapsible)
  // ----------------------------
  function monthKeyFromDate(dateStr) {
    // dateStr expected: YYYY-MM-DD
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

    // Sort by date desc, then keep stable by original index
    const indexed = entries.map((e, i) => ({ e, i }));
    indexed.sort((a, b) => {
      if (a.e.date === b.e.date) return b.i - a.i;
      return a.e.date < b.e.date ? 1 : -1;
    });

    // Group by month
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
      header.className = "entry-card"; // reuse existing card style
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

      // Render each entry card
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
          // If editing this one, exit edit mode
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

    // Monthly list (desc)
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
  // CSV Export / Import
  // ----------------------------
  function csvEscape(v) {
    // Ensure safe CSV even if contains comma/quotes/newlines
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
          // Escaped quote
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
          i++; // ignore
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
    // last field
    row.push(field);
    rows.push(row);

    // remove trailing empty row if file ends with newline
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

      // Strict header check (but allow case-insensitive)
      const headerLower = header.map((h) => h.toLowerCase());
      const okHeader = expected.every((x, idx) => headerLower[idx] === x);

      if (!okHeader) {
        showError(
          "CSVヘッダが不正です。\n期待形式：date,workplace,category,amount,memo"
        );
        return;
      }

      const validCats = new Set(["報酬", "交通費", "手当", "その他"]);
      const errors = [];
      let imported = 0;
      let skipped = 0;

      // Start from row 2
      for (let r = 1; r < rows.length; r++) {
        const cols = rows[r];
        if (!cols || cols.length === 0) continue;

        // Strict: must have at least 5 cols
        if (cols.length < 5) {
          skipped++;
          errors.push(`${r + 1}行目：列数不正（${cols.length}）`);
          continue;
        }

        let [date, workplace, category, amountRaw, memo] = cols;

        date = String(date || "").trim();
        workplace = normalizeWorkplaceName(workplace);
        category = String(category || "").trim();
        amountRaw = String(amountRaw || "").trim();
        memo = String(memo || "").trim();

        // date: allow YYYY-MM-DD only (strict)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          skipped++;
          errors.push(`${r + 1}行目：日付形式不正（YYYY-MM-DDのみ）`);
          continue;
        }

        if (!workplace) {
          skipped++;
          errors.push(`${r + 1}行目：就業先が空です`);
          continue;
        }

        if (!validCats.has(category)) {
          skipped++;
          errors.push(`${r + 1}行目：カテゴリ不正（報酬/交通費/手当/その他）`);
          continue;
        }

        // amount: allow comma separators or plain digits
        const amount = cleanAmount(amountRaw);
        if (!Number.isFinite(amount) || amount <= 0) {
          skipped++;
          errors.push(`${r + 1}行目：金額不正`);
          continue;
        }

        entries.push({ date, workplace, category, amount, memo });
        bumpWorkplace(workplace);
        imported++;
      }

      renderAll();

      const summary = `CSV取り込み：${imported}件追加 / ${skipped}件スキップ`;
      if (errors.length > 0) {
        showError(summary + "\n\nスキップ理由（先頭10件）:\n" + errors.slice(0, 10).join("\n"));
      } else {
        toast(summary);
      }
    };

    reader.readAsText(file, "utf-8");
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
        // allow re-import same file
        ev.target.value = "";
      });
    }
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

    // Inject Phase-1 UI helpers without touching HTML
    injectDateShortcuts();
    injectWorkplaceQuickPicks();
    injectCategoryChips();

    updateWorkplaceDatalist();

    bindAddButton();
    bindCSV();

    // default date = today (helps mobile users)
    if (dateInput && !dateInput.value) {
      dateInput.value = toISODate(new Date());
    }

    renderAll();
  }

  init();
})();
