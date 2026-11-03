/* =====================================================
 * sukima-baito-income | NicheWorks
 * app.js (Phase 3.5 Step1 - OCR 안정化)
 *
 * Phase 1:
 * - Theme toggle (localStorage)
 * - Font size toggle (localStorage)
 * - Date shortcuts: Today / Yesterday / Clear (injected UI)
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
 * Phase 3 (OCR beta) + Phase 3.5 Step1 (stabilize):
 * - OCR button + file input (index.html)
 * - OCR progress modal + cancel
 * - Guards: max files, max size, offline warning
 * - Minimal OCR parse -> candidates -> confirm modal (no auto-commit)
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

  const ocrBtn = $("ocrBtn");
  const ocrInput = $("ocrInput");

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
   * @property {number} rowNo
   * @property {"ok"|"skip"} status
   * @property {string} reason
   * @property {boolean} selected
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
  /** @type {null | {rows: OCRRow[], summary: OCRSummary}} */
  let ocrPreviewState = null;

  /**
   * @typedef {Object} OCRRow
   * @property {string} id
   * @property {"ok"|"skip"} status
   * @property {string} reason
   * @property {boolean} selected
   * @property {{date:string, workplace:string, category:string, amount:number, memo:string}} data
   * @property {string} raw
   */

  /**
   * @typedef {Object} OCRSummary
   * @property {number} okCount
   * @property {number} skipCount
   * @property {number} dupCount
   * @property {number} total
   */

  /**
   * @typedef {Object} OcrCandidate
   * @property {"ok"|"skip"} status
   * @property {string} reason
   * @property {{date:string, workplace:string, category:string, amount:number, memo:string}} data
   * @property {string} [raw]
   */

  // OCR runtime
  const OCR_CFG = {
    maxFiles: 10,
    maxFileMB: 10,
    // downscale: OCRを軽くする（スクショが巨大な場合に効く）
    maxImageEdge: 1600,
  };

  const OCR_RT = {
    running: false,
    cancelRequested: false,
    worker: null,
  };

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

    $("importPreviewCloseBtn").addEventListener("click", closeImportPreview);

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

  // ----------------------------
  // OCR Modals (Progress + Preview)
  // ----------------------------
  function injectOCRProgressModal() {
    if (document.getElementById("ocrProgressModal")) return;

    const overlay = document.createElement("div");
    overlay.id = "ocrProgressModal";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.45)";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "14px";
    overlay.style.zIndex = "10000";

    const panel = document.createElement("div");
    panel.style.width = "min(720px, 100%)";
    panel.style.background = "var(--bg,#fff)";
    panel.style.border = "1px solid var(--border,#e5e5e5)";
    panel.style.borderRadius = "16px";
    panel.style.boxShadow = "0 10px 28px rgba(0,0,0,0.18)";
    panel.style.padding = "14px";

    panel.innerHTML = `
      <div style="font-weight:900;font-size:1.05em;">OCR処理中（β）</div>
      <div id="ocrStatusText" style="margin-top:8px;opacity:0.9;font-size:0.95em;"></div>

      <div style="margin-top:10px;">
        <div style="height:10px;border-radius:999px;background:var(--border-soft,#f3f4f6);overflow:hidden;">
          <div id="ocrProgressBar" style="height:10px;width:0%;background:#111;border-radius:999px;"></div>
        </div>
        <div id="ocrProgressHint" style="margin-top:8px;opacity:0.75;font-size:0.9em;line-height:1.4;">
          ※OCRは端末負荷が高い場合があります。重いときは「スクショを切り抜く」「枚数を減らす」が効果的です。
        </div>
      </div>

      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap;">
        <button id="ocrCancelBtn" type="button"
          style="padding:12px 14px;border:1px solid var(--border,#e5e5e5);background:transparent;border-radius:12px;cursor:pointer;">
          キャンセル
        </button>
      </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    $("ocrCancelBtn").addEventListener("click", () => {
      requestCancelOCR("ユーザーがキャンセルしました。");
    });

    overlay.addEventListener("click", (ev) => {
      // 背景タップで閉じない（誤タップ防止）
      ev.preventDefault();
    });
  }

  function openOCRProgressModal() {
    const o = $("ocrProgressModal");
    if (o) o.style.display = "flex";
  }
  function closeOCRProgressModal() {
    const o = $("ocrProgressModal");
    if (o) o.style.display = "none";
  }

  function setOCRProgress(text, percent) {
    const t = $("ocrStatusText");
    const b = $("ocrProgressBar");
    if (t) t.textContent = text || "";
    if (b) b.style.width = `${Math.max(0, Math.min(100, percent || 0))}%`;
  }

  function injectOCRPreviewModal() {
    if (document.getElementById("ocrPreviewModal")) return;

    const overlay = document.createElement("div");
    overlay.id = "ocrPreviewModal";
    overlay.className = "ocr-preview-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.45)";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "14px";
    overlay.style.zIndex = "10001";

    const panel = document.createElement("div");
    panel.style.width = "min(920px, 100%)";
    panel.style.maxHeight = "90vh";
    panel.style.background = "var(--bg, #fff)";
    panel.style.border = "1px solid var(--border, #e5e5e5)";
    panel.style.borderRadius = "16px";
    panel.style.boxShadow = "0 10px 28px rgba(0,0,0,0.18)";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.overflow = "hidden";

    panel.className = "ocr-preview-panel";
    panel.innerHTML = `
      <div class="ocr-preview-header">
        <div class="ocr-preview-header-inner">
          <div>
            <div class="ocr-preview-title">OCR取り込みの確認（β）</div>
            <div id="ocrPreviewSummary" class="ocr-preview-summary"></div>
          </div>
          <button id="ocrPreviewCloseBtn" type="button" class="ocr-preview-btn ocr-preview-close">
            閉じる
          </button>
        </div>
      </div>

      <div class="ocr-preview-body">
        <div class="ocr-preview-actions">
          <div class="ocr-preview-actions-left">
            <button id="ocrSelectAllBtn" type="button" class="ocr-preview-btn">
              全選択
            </button>
            <button id="ocrSelectNoneBtn" type="button" class="ocr-preview-btn">
              全解除
            </button>
            <label class="ocr-preview-toggle">
              <input id="ocrShowSkipped" type="checkbox" />
              <span>スキップ行も表示</span>
            </label>
          </div>

          <button id="ocrCommitBtn" type="button" class="ocr-preview-btn ocr-preview-primary">
            選択した行を追加
          </button>
        </div>

        <div class="ocr-preview-note">
          ※OCRは誤読があります。<strong>日付・金額・就業先</strong>は必ず確認してください（ここで編集できます）。
        </div>
        <div id="ocrPreviewList" class="ocr-preview-list"></div>
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
      ocrPreviewState.rows.forEach((r) => {
        if (r.status === "ok") r.selected = true;
      });
      renderOCRPreview();
    });

    $("ocrSelectNoneBtn").addEventListener("click", () => {
      if (!ocrPreviewState) return;
      ocrPreviewState.rows.forEach((r) => {
        if (r.status === "ok") r.selected = false;
      });
      renderOCRPreview();
    });

    $("ocrShowSkipped").addEventListener("change", renderOCRPreview);
    $("ocrCommitBtn").addEventListener("click", commitOcrPreview);
  }

  function openOCRPreview(state) {
    ocrPreviewState = state;
    $("ocrShowSkipped").checked = false;
    renderOCRPreview();
    const o = $("ocrPreviewModal");
    if (o) o.style.display = "flex";
  }

  function closeOCRPreview() {
    const o = $("ocrPreviewModal");
    if (o) o.style.display = "none";
    ocrPreviewState = null;
  }

  function renderOCRPreview() {
    if (!ocrPreviewState) return;

    const showSkipped = $("ocrShowSkipped")?.checked;

    const okTotal = ocrPreviewState.rows.filter((r) => r.status === "ok").length;
    const selectedCount = ocrPreviewState.rows.filter((r) => r.status === "ok" && r.selected).length;
    const skippedCount = ocrPreviewState.rows.filter((r) => r.status === "skip").length;
    $("ocrPreviewSummary").textContent =
      `候補：${okTotal}件 / 選択：${selectedCount}件 / スキップ：${skippedCount}件`;

    $("ocrCommitBtn").textContent = `選択した行を追加（${selectedCount}件）`;
    $("ocrCommitBtn").disabled = selectedCount === 0;
    $("ocrCommitBtn").style.opacity = selectedCount === 0 ? "0.5" : "1";

    const list = $("ocrPreviewList");
    list.innerHTML = "";

    const rowsToRender = ocrPreviewState.rows.filter((r) => r.status === "ok" || showSkipped);

    rowsToRender.forEach((r) => {
      const card = document.createElement("div");
      card.className = "ocr-preview-card";

      const top = document.createElement("div");
      top.className = "ocr-preview-card-top";

      const left = document.createElement("div");
      left.className = "ocr-preview-card-left";

      if (r.status === "ok") {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "ocr-preview-checkbox";
        cb.checked = !!r.selected;
        cb.addEventListener("change", () => {
          r.selected = cb.checked;
          renderOCRPreview();
        });
        left.appendChild(cb);
      } else {
        const badge = document.createElement("span");
        badge.textContent = "SKIP";
        badge.className = "ocr-preview-badge";
        left.appendChild(badge);
      }

      const title = document.createElement("div");
      title.className = "ocr-preview-card-title";
      title.textContent =
        r.status === "ok"
          ? `${r.data.date} / ${r.data.workplace || "（就業先未設定）"}`
          : `スキップ：${r.reason}`;
      left.appendChild(title);

      const right = document.createElement("div");
      right.className = "ocr-preview-card-amount";
      right.textContent = r.status === "ok" ? formatYen(r.data.amount) : "";
      top.appendChild(left);
      top.appendChild(right);

      const meta = document.createElement("div");
      meta.className = "ocr-preview-card-meta";
      meta.textContent = r.status === "ok"
        ? `[${r.data.category}] ${r.data.memo ? ` / メモ：${r.data.memo}` : ""}`
        : `理由：${r.reason}`;

      card.appendChild(top);
      card.appendChild(meta);

      // Editable for ok rows
      if (r.status === "ok") {
        const form = document.createElement("div");
        form.className = "ocr-preview-form";

        const d = makeInlineInput("日付", r.data.date, "date", (v) => {
          r.data.date = v;
        });

        const w = makeInlineInput("就業先", r.data.workplace || "", "text", (v) => {
          r.data.workplace = normalizeWorkplaceName(v);
        });

        const c = makeInlineSelect("区分", r.data.category, ["報酬","交通費","手当","その他"], (v) => {
          r.data.category = v;
        });

        const a = makeInlineInput("金額", String(r.data.amount || ""), "text", (v) => {
          const n = cleanAmount(v);
          if (Number.isFinite(n) && n > 0) r.data.amount = n;
        });

        const m = makeInlineInput("メモ", r.data.memo || "", "text", (v) => {
          r.data.memo = v;
        }, true);

        // raw text toggle
        const rawWrap = document.createElement("div");
        rawWrap.className = "ocr-preview-raw";
        const rawBtn = document.createElement("button");
        rawBtn.type = "button";
        rawBtn.textContent = "OCRの元テキストを見る";
        rawBtn.className = "ocr-preview-btn ocr-preview-raw-btn";

        const rawBox = document.createElement("div");
        rawBox.className = "ocr-preview-raw-box";
        rawBox.textContent = r.raw || "";

        rawBtn.addEventListener("click", () => {
          rawBox.style.display = rawBox.style.display === "none" ? "block" : "none";
        });

        rawWrap.appendChild(rawBtn);
        rawWrap.appendChild(rawBox);

        form.appendChild(d);
        form.appendChild(w);
        form.appendChild(c);
        form.appendChild(a);
        form.appendChild(m);
        form.appendChild(rawWrap);

        card.appendChild(form);
      }

      list.appendChild(card);
    });
  }

  function collectOcrSelectedRows() {
    if (!ocrPreviewState) return { rows: [], invalidCount: 0, selectedCount: 0 };

    const rows = [];
    let invalidCount = 0;
    let selectedCount = 0;

    ocrPreviewState.rows.forEach((r) => {
      if (r.status !== "ok") return;
      if (!r.selected) return;
      selectedCount++;

      const d = String(r.data.date || "").trim();
      const w = normalizeWorkplaceName(r.data.workplace || "");
      const c = String(r.data.category || "").trim();
      const a = cleanAmount(r.data.amount || 0);
      const memo = String(r.data.memo || "");

      if (!isRealISODate(d) || !w || !["報酬","交通費","手当","その他"].includes(c) || !Number.isSafeInteger(a) || a <= 0) {
        invalidCount++;
        return;
      }

      rows.push({ date: d, workplace: w, category: c, amount: a, memo });
    });

    return { rows, invalidCount, selectedCount };
  }

  function commitOcrPreview() {
    if (!ocrPreviewState) return;

    const { rows, invalidCount, selectedCount } = collectOcrSelectedRows();
    if (selectedCount === 0) {
      showError("追加する候補が選択されていません。");
      return;
    }
    const existingKeys = new Set(entries.map(makeDedupeKey));
    const batchKeys = new Set();
    let committed = 0;
    let skippedDup = 0;

    rows.forEach((row) => {
      const key = makeDedupeKey(row);
      if (existingKeys.has(key) || batchKeys.has(key)) {
        skippedDup++;
        return;
      }
      entries.push(row);
      existingKeys.add(key);
      batchKeys.add(key);
      bumpWorkplace(row.workplace);
      committed++;
    });

    renderAll();
    closeOCRPreview();

    if (committed === 0) {
      showError(`追加できる候補がありませんでした。\n重複スキップ：${skippedDup} / 不正：${invalidCount}`);
      return;
    }
    toast(`OCR取り込み：${committed}件追加（重複スキップ：${skippedDup}件 / 不正：${invalidCount}件）`);
  }

  // ----------------------------
  // UI small parts
  // ----------------------------
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
    // Never turn a negative, fractional or scientific-notation value into a
    // different positive amount. NFKC supports Japanese full-width digits.
    const normalized = String(val ?? "").normalize("NFKC").trim().replace(/[\s\u3000]/g, "");
    const raw = normalized.replace(/^¥/, "").replace(/円$/, "");
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(raw)) return NaN;
    const n = Number(raw.replace(/,/g, ""));
    return Number.isSafeInteger(n) ? n : NaN;
  }

  function isRealISODate(val) {
    const text = String(val || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
    const [year, month, day] = text.split("-").map(Number);
    if (year < 1) return false;
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day;
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
    if (idx < 0 || idx >= entries.length) {
      showError("編集対象が見つかりませんでした。");
      return;
    }
    editingIndex = idx;

    const e = entries[idx];
    if (!e) {
      showError("編集対象が見つかりませんでした。");
      editingIndex = null;
      return;
    }
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
        showError("日付・就業先・金額を入力してください。");
        return;
      }
      if (!isRealISODate(date)) {
        showError("実在する日付をYYYY-MM-DD形式で入力してください。");
        return;
      }

      const amount = cleanAmount(amountRaw);
      if (!Number.isFinite(amount) || amount <= 0) {
        showError("金額が不正です。数字のみで入力してください。");
        return;
      }

      const record = { date, workplace, category, amount, memo };

      if (editingIndex !== null) {
        if (!entries[editingIndex]) {
          showError("編集対象が見つかりませんでした。再度選択してください。");
          exitEditingMode();
          return;
        }
        entries[editingIndex] = record;
        bumpWorkplace(workplace);
        exitEditingMode();
      } else {
        entries.push(record);
        bumpWorkplace(workplace);
        clearForm();
      }

      renderAll();
      workplaceInput.focus();
    });

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
          if (editingIndex === i) {
            exitEditingMode();
          } else if (editingIndex !== null && editingIndex > i) {
            editingIndex -= 1;
          }
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
  // Summary rendering
  // ----------------------------
  function renderSummary() {
    if (!totalSummary || !monthlySummary) return;

    if (entries.length === 0) {
      totalSummary.innerHTML = "";
      monthlySummary.innerHTML = "";
      return;
    }

    let total = 0;
    const monthly = {};

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
        showError("CSVが空です。ファイルを確認してください。");
        return;
      }

      const header = rows[0].map((h) => String(h || "").trim());
      const expected = ["date", "workplace", "category", "amount", "memo"];
      const headerLower = header.map((h) => h.toLowerCase());
      // UTF-8 BOM is common in CSV files saved by spreadsheets.
      if (headerLower.length) headerLower[0] = headerLower[0].replace(/^\uFEFF/, "");

      const okHeader = headerLower.length === expected.length && expected.every((x, idx) => headerLower[idx] === x);
      if (!okHeader) {
        showError("CSVヘッダが不正です。\n形式：date,workplace,category,amount,memo");
        return;
      }

      const validCats = new Set(["報酬", "交通費", "手当", "その他"]);
      const existingKeys = new Set(entries.map(makeDedupeKey));

      const parsedRows = [];
      let okCount = 0;
      let skipCount = 0;
      let dupCount = 0;

      for (let r = 1; r < rows.length; r++) {
        const cols = rows[r];
        const rowNo = r + 1;

        if (!cols || cols.length === 0) continue;

        if (cols.length !== 5) {
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

        if (!isRealISODate(date)) {
          parsedRows.push({ rowNo, status: "skip", reason: "日付不正（YYYY-MM-DDの実在日付のみ）", selected: false, data: { date, workplace, category, amount: 0, memo } });
          skipCount++;
          continue;
        }

        if (!workplace) {
          parsedRows.push({ rowNo, status: "skip", reason: "就業先が空", selected: false, data: { date, workplace, category, amount: 0, memo } });
          skipCount++;
          continue;
        }

        if (!validCats.has(category)) {
          parsedRows.push({ rowNo, status: "skip", reason: "区分不正（報酬/交通費/手当/その他）", selected: false, data: { date, workplace, category, amount: 0, memo } });
          skipCount++;
          continue;
        }

        const amount = cleanAmount(amountRaw);
        if (!Number.isFinite(amount) || amount <= 0) {
          parsedRows.push({ rowNo, status: "skip", reason: "金額不正", selected: false, data: { date, workplace, category, amount: 0, memo } });
          skipCount++;
          continue;
        }

        const data = { date, workplace, category, amount, memo };
        const key = makeDedupeKey(data);

        if (existingKeys.has(key)) {
          parsedRows.push({ rowNo, status: "skip", reason: "重複（既存データと一致）", selected: false, data });
          skipCount++;
          dupCount++;
          continue;
        }

        parsedRows.push({ rowNo, status: "ok", reason: "OK", selected: true, data });
        okCount++;
      }

      const summary = { okCount, skipCount, dupCount, totalRows: parsedRows.length };

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
      renderOCRPreview();
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
      renderOCRPreview();
    });

    wrap.appendChild(l);
    wrap.appendChild(sel);
    return wrap;
  }

  function commitImportPreview() {
    if (!importPreviewState) return;

    const existingKeys = new Set(entries.map(makeDedupeKey));
    const previewKeys = new Set();
    const selectedCount = importPreviewState.parsedRows.filter((r) => r.status === "ok" && r.selected).length;
    if (selectedCount === 0) {
      showError("追加する行が選択されていません。");
      return;
    }

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

      if (!isRealISODate(d) || !w || !["報酬","交通費","手当","その他"].includes(c) || !Number.isSafeInteger(a) || a <= 0) {
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
  // OCR (Phase 3.5 Step1)
  // ----------------------------
  async function ensureTesseractLoaded() {
    // Load from CDN only when needed
    if (window.Tesseract && window.Tesseract.createWorker) return true;

    // Offline check (language data is fetched)
    if (!navigator.onLine) {
      showError("OCRはオンライン接続が必要です。通信状態を確認してください。");
      return false;
    }

    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      s.async = true;
      s.onload = () => resolve(!!(window.Tesseract && window.Tesseract.createWorker));
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  function requestCancelOCR(reason) {
    if (!OCR_RT.running) return;

    OCR_RT.cancelRequested = true;
    setOCRProgress(reason || "キャンセルしています…", 0);

    try {
      if (OCR_RT.worker && OCR_RT.worker.terminate) {
        OCR_RT.worker.terminate();
      }
    } catch {}
  }

  function guardOCRFiles(files) {
    if (!files || files.length === 0) return { ok: false, msg: "画像が選択されていません。" };
    if (files.length > OCR_CFG.maxFiles) {
      return { ok: false, msg: `画像が多すぎます（最大${OCR_CFG.maxFiles}枚）。枚数を減らしてください。` };
    }
    const tooBig = [...files].find((f) => (f.size / (1024 * 1024)) > OCR_CFG.maxFileMB);
    if (tooBig) {
      return { ok: false, msg: `画像サイズが大きすぎます（最大${OCR_CFG.maxFileMB}MB）。縮小して再試行してください。\n対象：${tooBig.name}` };
    }
    return { ok: true, msg: "" };
  }

  async function downscaleImageToBlob(file) {
    // Make OCR lighter on mobile by downscaling big screenshots
    try {
      const bmp = await createImageBitmap(file);
      const w = bmp.width;
      const h = bmp.height;
      const maxEdge = Math.max(w, h);

      let scale = 1;
      if (maxEdge > OCR_CFG.maxImageEdge) {
        scale = OCR_CFG.maxImageEdge / maxEdge;
      }

      const tw = Math.max(1, Math.round(w * scale));
      const th = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement("canvas");
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bmp, 0, 0, tw, th);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      return blob || file;
    } catch {
      return file;
    }
  }

  function parseOcrTexts(ocrTexts) {
    const candidates = [];
    ocrTexts.forEach((item, idx) => {
      const perImage = parseOcrText(item.text, item.fileName || `OCR-${idx + 1}`);
      perImage.forEach((candidate) => {
        candidate.raw = String(item.text || "");
        candidates.push(candidate);
      });
    });
    return candidates;
  }

  function parseOcrText(text, sourceLabel) {
    const raw = String(text || "").replace(/\r/g, "\n");
    const lines = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    const dates = extractDatesFromLines(lines);
    const amounts = extractAmountsFromLines(lines);
    const isListMode = dates.length > 1 || amounts.length > 1;
    const modeLabel = isListMode ? "OCR:一覧" : "OCR:詳細";
    const candidates = isListMode
      ? parseListMode(lines, modeLabel)
      : parseDetailMode(lines, modeLabel);

    if (candidates.length === 0) {
      return [makeSkipCandidate(`${modeLabel} 候補が取得できませんでした`, sourceLabel)];
    }
    return candidates;
  }

  function parseListMode(lines, modeLabel) {
    const blocks = splitBlocksByDate(lines);
    if (blocks.length === 0) {
      return [makeSkipCandidate(`${modeLabel} 日付行が見つかりませんでした`)];
    }

    const candidates = [];
    blocks.forEach((block) => {
      const amount = pickMaxAmount(block.lines);
      const workplace = guessWorkplace(block.lines);
      const memo = buildMemo(modeLabel, block.date?.hasYear ? "" : "年要確認");

      if (!block.date?.normalized) {
        candidates.push(makeSkipCandidate(`${modeLabel} 日付が取得できませんでした`));
        return;
      }
      if (!amount) {
        candidates.push(makeSkipCandidate(`${modeLabel} 金額が取得できませんでした`));
        return;
      }
      if (!workplace) {
        candidates.push(makeSkipCandidate(`${modeLabel} 就業先が取得できませんでした`));
        return;
      }

      candidates.push(makeOkCandidate({
        date: block.date.normalized,
        workplace,
        category: "報酬",
        amount,
        memo
      }));
    });

    return candidates;
  }

  function parseDetailMode(lines, modeLabel) {
    const dates = extractDatesFromLines(lines);
    const amounts = extractAmountsFromLines(lines);
    const workplace = guessWorkplace(lines);
    const date = dates[0];
    const amount = amounts.length ? Math.max(...amounts) : 0;
    const memo = buildMemo(modeLabel, date?.hasYear ? "" : "年要確認");

    if (!date?.normalized) {
      return [makeSkipCandidate(`${modeLabel} 日付が取得できませんでした`)];
    }
    if (!amount) {
      return [makeSkipCandidate(`${modeLabel} 金額が取得できませんでした`)];
    }
    if (!workplace) {
      return [makeSkipCandidate(`${modeLabel} 就業先が取得できませんでした`)];
    }

    return [makeOkCandidate({
      date: date.normalized,
      workplace,
      category: "報酬",
      amount,
      memo
    })];
  }

  function splitBlocksByDate(lines) {
    /** @type {Array<{date:{normalized:string, hasYear:boolean} | null, lines:string[]}>} */
    const blocks = [];
    let current = null;

    lines.forEach((ln) => {
      const date = extractFirstDateFromLine(ln);
      if (date) {
        if (current) blocks.push(current);
        current = { date, lines: [ln] };
      } else if (current) {
        current.lines.push(ln);
      }
    });

    if (current) blocks.push(current);
    return blocks;
  }

  function extractDatesFromLines(lines) {
    /** @type {Array<{normalized:string, hasYear:boolean}>} */
    const dates = [];
    const seen = new Set();
    lines.forEach((ln) => {
      const fullMatches = ln.matchAll(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/g);
      for (const m of fullMatches) {
        const normalized = normalizeDate(m[1], m[2], m[3]);
        const key = `${normalized}|y`;
        if (!seen.has(key)) {
          seen.add(key);
          dates.push({ normalized, hasYear: true });
        }
      }

      const shortMatches = ln.matchAll(/(^|[^\d])(\d{1,2})[\/\-.](\d{1,2})(?=[^\d]|$)/g);
      for (const m of shortMatches) {
        const normalized = normalizeDate(new Date().getFullYear(), m[2], m[3]);
        const key = `${normalized}|n`;
        if (!seen.has(key)) {
          seen.add(key);
          dates.push({ normalized, hasYear: false });
        }
      }
    });
    return dates;
  }

  function extractFirstDateFromLine(line) {
    const full = line.match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
    if (full) {
      return { normalized: normalizeDate(full[1], full[2], full[3]), hasYear: true };
    }
    const short = line.match(/(^|[^\d])(\d{1,2})[\/\-.](\d{1,2})(?=[^\d]|$)/);
    if (short) {
      return {
        normalized: normalizeDate(new Date().getFullYear(), short[2], short[3]),
        hasYear: false
      };
    }
    return null;
  }

  function extractAmountsFromLines(lines) {
    const amounts = [];
    const moneyRegex = /[¥￥]?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{2,})\s*(?:円)?/g;
    lines.forEach((ln) => {
      let m;
      while ((m = moneyRegex.exec(ln)) !== null) {
        const n = cleanAmount(m[1]);
        if (Number.isFinite(n) && n > 0) amounts.push(n);
      }
      moneyRegex.lastIndex = 0;
    });
    return amounts;
  }

  function pickMaxAmount(lines) {
    const amounts = extractAmountsFromLines(lines);
    if (!amounts.length) return 0;
    return Math.max(...amounts);
  }

  function guessWorkplace(lines) {
    const stopWords = [
      "支給", "報酬", "交通費", "勤務", "就労", "合計", "合算",
      "控除", "振込", "支払", "受取", "時間", "日付", "円", "¥", "￥", "税込", "税"
    ];
    const filtered = lines.filter((ln) => {
      if (ln.length < 2) return false;
      if (stopWords.some((w) => ln.includes(w))) return false;
      const digitRatio = (ln.match(/\d/g) || []).length / ln.length;
      return digitRatio < 0.4;
    });

    if (!filtered.length) return "";
    const scored = filtered
      .map((ln) => {
        const digitCount = (ln.match(/\d/g) || []).length;
        const score = ln.length - digitCount * 2;
        return { ln, score };
      })
      .sort((a, b) => b.score - a.score);
    return scored[0]?.ln || "";
  }

  function normalizeDate(yyyy, mm, dd) {
    return `${String(yyyy).padStart(4, "0")}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  }

  function buildMemo(modeLabel, extra) {
    return [modeLabel, extra].filter(Boolean).join(" / ");
  }

  function makeOkCandidate(data) {
    return { status: "ok", reason: "", data };
  }

  function makeSkipCandidate(reason, sourceLabel = "") {
    const memo = sourceLabel ? `OCR:${sourceLabel}` : "";
    return {
      status: "skip",
      reason: reason || "不明",
      data: { date: "", workplace: "", category: "報酬", amount: 0, memo }
    };
  }

  function openOcrPreview(candidates) {
    if (!candidates || candidates.length === 0) {
      showError("OCR候補が見つかりませんでした。画像を切り抜く/明るくする/枚数を減らして再試行してください。");
      return;
    }

    const rows = candidates.map((c, idx) => ({
      id: `ocr-${Date.now()}-${idx}`,
      status: c.status,
      reason: c.reason || "",
      selected: c.status === "ok",
      data: {
        date: String(c.data?.date || ""),
        workplace: String(c.data?.workplace || ""),
        category: String(c.data?.category || "報酬"),
        amount: Number(c.data?.amount || 0),
        memo: String(c.data?.memo || "")
      },
      raw: String(c.raw || "")
    }));

    const summary = {
      okCount: rows.filter((r) => r.status === "ok").length,
      skipCount: rows.filter((r) => r.status === "skip").length,
      dupCount: 0,
      total: rows.length
    };

    openOCRPreview({ rows, summary });
  }

  async function runOCR(files) {
    if (OCR_RT.running) return;
    const guard = guardOCRFiles(files);
    if (!guard.ok) {
      showError(guard.msg);
      return;
    }

    // Reset runtime
    OCR_RT.running = true;
    OCR_RT.cancelRequested = false;
    OCR_RT.worker = null;

    setOCRControlsEnabled(false);
    openOCRProgressModal();
    setOCRProgress(`準備中…`, 2);

    try {
      const loaded = await ensureTesseractLoaded();
      if (!loaded) {
        throw new Error("LOAD_FAILED");
      }
      if (OCR_RT.cancelRequested) {
        throw new Error("CANCELLED");
      }

      const worker = await window.Tesseract.createWorker("jpn");
      OCR_RT.worker = worker;

      await worker.setParameters({
        tessedit_pageseg_mode: "6",
      });

      /** @type {Array<{fileName:string, text:string}>} */
      const ocrTexts = [];

      for (let i = 0; i < files.length; i++) {
        if (OCR_RT.cancelRequested) throw new Error("CANCELLED");

        const f = files[i];
        const pctBase = Math.round((i / files.length) * 100);

        setOCRProgress(`画像 ${i + 1}/${files.length} を準備中…`, Math.max(5, pctBase));

        const blob = await downscaleImageToBlob(f);

        // per-image progress callback
        const { data } = await worker.recognize(blob, undefined, {
          logger: (m) => {
            if (OCR_RT.cancelRequested) return;
            if (m && m.status === "recognizing text") {
              const p = Math.round((i / files.length) * 100 + (m.progress || 0) * (100 / files.length));
              setOCRProgress(`画像 ${i + 1}/${files.length} を解析中…`, Math.min(99, Math.max(5, p)));
            }
          }
        });

        if (OCR_RT.cancelRequested) throw new Error("CANCELLED");
        const recognizedText = String(data?.text || "");
        ocrTexts.push({ fileName: f.name, text: recognizedText });
      }

      setOCRProgress("完了しました。", 100);

      closeOCRProgressModal();

      if (!ocrTexts.length || ocrTexts.every((t) => !t.text.trim())) {
        showError("OCRで文字を取得できませんでした。画像を切り抜く/明るくする/枚数を減らして再試行してください。");
        return;
      }

      const candidates = parseOcrTexts(ocrTexts);
      openOcrPreview(candidates);

    } catch (err) {
      closeOCRProgressModal();

      if (String(err?.message || "").includes("CANCELLED")) {
        toast("OCRをキャンセルしました");
      } else if (String(err?.message || "").includes("LOAD_FAILED")) {
        showError("OCRエンジンの読み込みに失敗しました。通信状態を確認して再試行してください。");
      } else {
        showError("OCR中にエラーが発生しました。画像を縮小/切り抜く/枚数を減らして再試行してください。");
        console.error(err);
      }
    } finally {
      try {
        if (OCR_RT.worker && OCR_RT.worker.terminate) {
          await OCR_RT.worker.terminate();
        }
      } catch {}
      OCR_RT.worker = null;
      OCR_RT.running = false;
      OCR_RT.cancelRequested = false;
      setOCRControlsEnabled(true);
    }
  }

  function bindOCR() {
    if (!ocrBtn || !ocrInput) return;

    ocrBtn.addEventListener("click", () => {
      if (OCR_RT.running) {
        toast("OCR処理中です。完了までお待ちください。");
        return;
      }
      ocrInput.value = "";
      ocrInput.click();
    });

    ocrInput.addEventListener("change", (ev) => {
      const input = ev.target;
      const files = input.files ? Array.from(input.files) : [];

      if (!files.length) {
        input.value = "";
        return;
      }

      runOCR(files).finally(() => {
        input.value = "";
      });
    });
  }

  function setOCRControlsEnabled(enabled) {
    if (ocrBtn) ocrBtn.disabled = !enabled;
    if (ocrInput) ocrInput.disabled = !enabled;
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

    // OCR UI
    injectOCRProgressModal();
    injectOCRPreviewModal();

    updateWorkplaceDatalist();

    bindAddButton();
    bindCSV();
    bindOCR();

    if (dateInput && !dateInput.value) {
      dateInput.value = toISODate(new Date());
    }

    renderAll();
  }

  init();
})();
