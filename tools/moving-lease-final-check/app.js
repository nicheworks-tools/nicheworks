(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    moveDate: $("moveDate"),
    homeType: $("homeType"),
    btnGenerate: $("btnGenerate"),
    btnClear: $("btnClear"),
    btnReset: $("btnReset"),

    result: $("result"),
    resultMeta: $("resultMeta"),
    taskList: $("taskList"),

    progressFill: $("progressFill"),
    progressText: $("progressText"),

    proArea: $("proArea"),
    btnProPdf: $("btnProPdf"),
    btnProMemo: $("btnProMemo"),
    btnProAddr: $("btnProAddr"),
  };

  // ============================
  // Stripe Payment Links（ここを差し替え）
  // ============================
  // 例: https://buy.stripe.com/xxxxxx
  const PRO_URL_PDF  = ""; // 提出用チェックリストPDF（¥200）
  const PRO_URL_MEMO = ""; // 退去立会いメモ（¥200）
  const PRO_URL_ADDR = ""; // 住所変更まとめ（¥200）

  // ============================
  // タスク（最大10件に絞る）
  // ============================
  const TASKS = {
    common: [
      { id: "c1", text: "郵便転送届（または転送停止）を処理した", meta: "郵便・住所" },
      { id: "c2", text: "住所変更（銀行・クレカ・保険・主要通販）を把握した", meta: "住所・支払い" },
      { id: "c3", text: "重要書類（契約書/身分証/鍵）を一箇所にまとめた", meta: "紛失防止" },
    ],
    rental: [
      { id: "r1", text: "退去立会いの日時を確定し、当日の持ち物を準備した", meta: "立会いトラブル" },
      { id: "r2", text: "電気・ガス・水道の停止手続きを完了した（最終日/立会い後）", meta: "課金継続防止" },
      { id: "r3", text: "ネット回線の解約/移転手続きを完了した（返却物も確認）", meta: "課金継続防止" },
      { id: "r4", text: "室内の写真を撮った（傷/汚れ/水回り/床/壁）", meta: "追加請求対策" },
      { id: "r5", text: "鍵の返却手順を確認した（本数/返却先/返却方法）", meta: "返却漏れ" },
    ],
    owned: [
      { id: "o1", text: "ブレーカー・止水栓など停止ポイントを確認した", meta: "事故防止" },
      { id: "o2", text: "転出/転入など自治体手続きを把握した（必要なら予約/期限）", meta: "期限ミス防止" },
      { id: "o3", text: "電気・ガス・水道の停止/開始（必要分）を完了した", meta: "生活停止防止" },
      { id: "o4", text: "固定回線/管理費など継続課金の棚卸しをした", meta: "課金継続防止" },
      { id: "o5", text: "最終確認の写真を撮った（メーター/状態/引渡しに備える）", meta: "証拠" },
    ]
  };

  const LAST_KEY = "nw_moving_final_last_v1";

  function fmtDate(value) {
    if (!value) return "";
    const d = new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function storageKey(dateStr, homeType) {
    return `nw_moving_final_v1:${dateStr}:${homeType}`;
  }

  function loadChecks(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return {};
      const obj = JSON.parse(raw);
      return (obj && typeof obj === "object") ? obj : {};
    } catch {
      return {};
    }
  }

  function saveChecks(key, checks) {
    localStorage.setItem(key, JSON.stringify(checks));
  }

  function getTasks(homeType) {
    const base = [...TASKS.common];
    const extra = homeType === "rental" ? TASKS.rental : TASKS.owned;
    // 合計10件以内に抑える
    return [...base, ...extra].slice(0, 10);
  }

  function updateProgress(tasks, checks) {
    const total = tasks.length;
    const done = tasks.filter(t => !!checks[t.id]).length;

    const pct = total ? Math.round((done / total) * 100) : 0;
    els.progressFill.style.width = `${pct}%`;
    els.progressText.textContent = `${done} / ${total} 完了`;

    // 全完了でProを出す（＝金が出る瞬間だけ出す）
    els.proArea.hidden = !(total > 0 && done === total);

    // Clearボタンは結果が出てる時だけ押せる
    els.btnClear.disabled = (total === 0);
  }

  function render() {
    const dateStr = fmtDate(els.moveDate.value);
    if (!dateStr) {
      alert("退去日 / 引っ越し日を入力してください。");
      return;
    }

    const homeType = els.homeType.value;
    const key = storageKey(dateStr, homeType);
    const tasks = getTasks(homeType);

    const checks = loadChecks(key);

    // meta
    els.resultMeta.textContent = `${dateStr} / ${homeType === "rental" ? "賃貸" : "持ち家"}（この条件で保存）`;

    // list
    els.taskList.innerHTML = "";
    tasks.forEach((t) => {
      const row = document.createElement("label");
      row.className = "task";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!checks[t.id];

      cb.addEventListener("change", () => {
        checks[t.id] = cb.checked;
        saveChecks(key, checks);
        updateProgress(tasks, checks);
      });

      const right = document.createElement("div");

      const text = document.createElement("div");
      text.className = "ttext";
      text.textContent = t.text;

      const meta = document.createElement("div");
      meta.className = "tmeta";
      meta.textContent = `カテゴリ: ${t.meta}`;

      right.appendChild(text);
      right.appendChild(meta);

      row.appendChild(cb);
      row.appendChild(right);
      els.taskList.appendChild(row);
    });

    // show
    els.result.hidden = false;

    // last inputs
    localStorage.setItem(LAST_KEY, JSON.stringify({ dateStr, homeType }));

    // progress & pro
    updateProgress(tasks, checks);
  }

  function clearChecks() {
    const dateStr = fmtDate(els.moveDate.value);
    if (!dateStr) return;

    const homeType = els.homeType.value;
    const key = storageKey(dateStr, homeType);

    localStorage.removeItem(key);
    render();
    alert("チェックを全解除しました。");
  }

  function resetForm() {
    els.moveDate.value = "";
    els.homeType.value = "rental";

    els.result.hidden = true;
    els.taskList.innerHTML = "";
    els.resultMeta.textContent = "";
    els.progressFill.style.width = "0%";
    els.progressText.textContent = "0 / 0 完了";
    els.proArea.hidden = true;

    els.btnClear.disabled = true;
  }

  // Pro buttons → Payment Link
  function goPro(url) {
    if (!url) {
      alert("決済リンクが未設定です。Stripe Payment Link を app.js に設定してください。");
      return;
    }
    window.location.href = url;
  }

  els.btnGenerate.addEventListener("click", render);
  els.btnClear.addEventListener("click", clearChecks);
  els.btnReset.addEventListener("click", resetForm);

  els.btnProPdf.addEventListener("click", () => goPro(PRO_URL_PDF));
  els.btnProMemo.addEventListener("click", () => goPro(PRO_URL_MEMO));
  els.btnProAddr.addEventListener("click", () => goPro(PRO_URL_ADDR));

  // init (restore last)
  try {
    const last = JSON.parse(localStorage.getItem(LAST_KEY) || "null");
    if (last && typeof last === "object") {
      if (typeof last.dateStr === "string" && last.dateStr) els.moveDate.value = last.dateStr;
      if (last.homeType === "rental" || last.homeType === "owned") els.homeType.value = last.homeType;
    }
  } catch { /* ignore */ }
})();
