(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    moveDate: $("moveDate"),
    homeType: $("homeType"),
    btnGenerate: $("btnGenerate"),
    btnClear: $("btnClear"),
    btnReset: $("btnReset"),
    btnDeleteCurrentData: $("btnDeleteCurrentData"),
    btnDeleteLastData: $("btnDeleteLastData"),
    btnCopyTxt: $("btnCopyTxt"),
    btnSaveTxt: $("btnSaveTxt"),
    btnPrint: $("btnPrint"),

    result: $("result"),
    resultMeta: $("resultMeta"),
    taskList: $("taskList"),

    progressFill: $("progressFill"),
    progressText: $("progressText"),
    toast: $("toast"),
  };

  const TASKS = {
    common: [
      { id: "c1", text: "郵便転送届、宅配、定期配送の転送・停止を確認した", meta: "郵便・配送" },
      { id: "c2", text: "銀行、クレカ、保険、主要通販、勤務先などの住所変更先を把握した", meta: "住所変更" },
      { id: "c3", text: "契約書、本人確認書類、鍵、重要書類を一箇所にまとめた", meta: "紛失防止" },
      { id: "c4", text: "粗大ごみ、残置物、不用品回収の予定を確認した", meta: "残置物" },
      { id: "c5", text: "電気・ガス・水道・ネット回線の停止/移転日と返却物を確認した", meta: "継続課金" },
    ],
    rental: [
      { id: "r1", text: "退去通知の控え、管理会社からの案内、立会い日時を保存した", meta: "退去通知" },
      { id: "r2", text: "退去立会い当日の持ち物、鍵本数、返却方法を確認した", meta: "鍵返却" },
      { id: "r3", text: "鍵本数と鍵の状態を写真で記録した", meta: "返却記録" },
      { id: "r4", text: "室内全体、床、壁、水回り、設備、既存傷を写真で記録した", meta: "写真記録" },
      { id: "r5", text: "電気・ガス・水道メーターの写真を撮る準備をした", meta: "メーター" },
      { id: "r6", text: "火災保険の解約または住所変更の要否を確認した", meta: "保険" },
      { id: "r7", text: "敷金・保証金などの返金先口座、退去後の連絡先を整理した", meta: "精算連絡" },
      { id: "r8", text: "管理会社へ提出する書類・返却物・連絡事項を確認した", meta: "提出物" },
      { id: "r9", text: "エアコン、照明、備品、設備など残す物/外す物を契約内容と照合した", meta: "設備確認" },
      { id: "r10", text: "原状回復や修繕費の判断は契約書・管理会社案内で確認する前提にした", meta: "契約確認" },
    ],
    owned: [
      { id: "o1", text: "ブレーカー、止水栓、ガス元栓など停止ポイントを確認した", meta: "事故防止" },
      { id: "o2", text: "固定資産税や自治体書類の送付先を確認した", meta: "税・書類" },
      { id: "o3", text: "火災保険・地震保険の住所変更または契約見直しを確認した", meta: "保険" },
      { id: "o4", text: "自治会、管理組合、近隣、管理会社への連絡が必要か確認した", meta: "連絡" },
      { id: "o5", text: "空き家になる場合の換気、通水、郵便物、草木、見回り方法を決めた", meta: "空き家管理" },
      { id: "o6", text: "売却・賃貸化・引渡し予定がある場合の書類と鍵管理を確認した", meta: "引渡し" },
      { id: "o7", text: "電気・ガス・水道・固定回線・管理費など継続課金を棚卸しした", meta: "継続課金" },
      { id: "o8", text: "メーター、室内、外回り、設備状態の写真を残す準備をした", meta: "写真記録" },
      { id: "o9", text: "転出・転入など自治体手続きの期限と必要書類を確認した", meta: "自治体" },
    ],
  };

  const LAST_KEY = "nw_moving_final_last_v1";
  let clearArmed = false;
  let clearTimer = null;
  let toastTimer = null;

  function toast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.hidden = true;
    }, 2800);
  }

  function fmtDate(value) {
    if (!value) return "";
    const d = new Date(value + "T00:00:00");
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function homeTypeLabel(homeType) {
    return homeType === "rental" ? "賃貸" : "持ち家";
  }

  function storageKey(dateStr, homeType) {
    return `nw_moving_final_v1:${dateStr}:${homeType}`;
  }

  function currentContext() {
    const dateStr = fmtDate(els.moveDate.value);
    if (!dateStr) return null;
    const homeType = els.homeType.value === "owned" ? "owned" : "rental";
    return {
      dateStr,
      homeType,
      key: storageKey(dateStr, homeType),
      tasks: getTasks(homeType),
    };
  }

  function loadChecks(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return {};
      const obj = JSON.parse(raw);
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  }

  function saveChecks(key, checks) {
    try {
      localStorage.setItem(key, JSON.stringify(checks));
    } catch {
      toast("保存できませんでした。ブラウザ設定を確認してください。");
    }
  }

  function getTasks(homeType) {
    const extra = homeType === "rental" ? TASKS.rental : TASKS.owned;
    return [...TASKS.common, ...extra];
  }

  function resetClearArm() {
    clearArmed = false;
    if (els.btnClear) els.btnClear.textContent = "チェック全解除";
    clearTimeout(clearTimer);
    clearTimer = null;
  }

  function updateProgress(tasks, checks) {
    const total = tasks.length;
    const done = tasks.filter((t) => !!checks[t.id]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    els.progressFill.style.width = `${pct}%`;
    els.progressText.textContent = `${done} / ${total} 完了`;
    els.btnClear.disabled = total === 0;

    if (els.btnCopyTxt) els.btnCopyTxt.disabled = total === 0;
    if (els.btnSaveTxt) els.btnSaveTxt.disabled = total === 0;
    if (els.btnPrint) els.btnPrint.disabled = total === 0;
  }

  function render() {
    const ctx = currentContext();
    if (!ctx) {
      toast("退去日 / 引っ越し日を入力してください。");
      return;
    }

    const checks = loadChecks(ctx.key);
    els.resultMeta.textContent = `${ctx.dateStr} / ${homeTypeLabel(ctx.homeType)}（この条件で保存）`;
    els.taskList.textContent = "";

    ctx.tasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = "task-item";

      const row = document.createElement("label");
      row.className = "task";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!checks[task.id];

      cb.addEventListener("change", () => {
        checks[task.id] = cb.checked;
        saveChecks(ctx.key, checks);
        updateProgress(ctx.tasks, checks);
      });

      const body = document.createElement("div");
      const text = document.createElement("div");
      text.className = "ttext";
      text.textContent = task.text;

      const meta = document.createElement("div");
      meta.className = "tmeta";
      meta.textContent = `カテゴリ: ${task.meta}`;

      body.appendChild(text);
      body.appendChild(meta);
      row.appendChild(cb);
      row.appendChild(body);
      item.appendChild(row);
      els.taskList.appendChild(item);
    });

    els.result.hidden = false;
    resetClearArm();

    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ dateStr: ctx.dateStr, homeType: ctx.homeType }));
    } catch {
      toast("前回条件を保存できませんでした。");
    }

    updateProgress(ctx.tasks, checks);
  }

  function clearChecks() {
    const ctx = currentContext();
    if (!ctx) {
      toast("退去日 / 引っ越し日を入力してください。");
      return;
    }

    if (!clearArmed) {
      clearArmed = true;
      els.btnClear.textContent = "もう一度押すと全解除";
      toast("全解除する場合はもう一度押してください。");
      clearTimer = setTimeout(resetClearArm, 4500);
      return;
    }

    localStorage.removeItem(ctx.key);
    resetClearArm();
    render();
    toast("チェックを全解除しました。");
  }

  function deleteCurrentData() {
    const ctx = currentContext();
    if (!ctx) {
      toast("削除する条件を入力してください。");
      return;
    }
    localStorage.removeItem(ctx.key);
    render();
    toast("この条件の保存データを削除しました。");
  }

  function deleteLastData() {
    localStorage.removeItem(LAST_KEY);
    toast("前回条件の保存を削除しました。");
  }

  function resetForm() {
    els.moveDate.value = "";
    els.homeType.value = "rental";
    els.result.hidden = true;
    els.taskList.textContent = "";
    els.resultMeta.textContent = "";
    els.progressFill.style.width = "0%";
    els.progressText.textContent = "0 / 0 完了";
    els.btnClear.disabled = true;
    resetClearArm();
    toast("入力欄をリセットしました。保存済みチェックは削除していません。");
  }

  function checklistText() {
    const ctx = currentContext();
    if (!ctx) return "";
    const checks = loadChecks(ctx.key);
    const done = ctx.tasks.filter((t) => !!checks[t.id]).length;
    const lines = [
      "Moving / Lease Final Check",
      `日付: ${ctx.dateStr}`,
      `住居タイプ: ${homeTypeLabel(ctx.homeType)}`,
      `進捗: ${done} / ${ctx.tasks.length}`,
      "",
      "チェック項目:",
      ...ctx.tasks.map((task) => `${checks[task.id] ? "[x]" : "[ ]"} ${task.text}（${task.meta}）`),
      "",
      "注意: この出力は一般的な確認用です。契約内容、退去精算、原状回復、修繕費請求、法的判断を保証するものではありません。",
    ];
    return lines.join("\n");
  }

  async function copyChecklist() {
    const text = checklistText();
    if (!text) {
      toast("先にチェックリストを表示してください。");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast("TXTをコピーしました。");
    } catch {
      toast("コピーできませんでした。手動で選択してください。");
    }
  }

  function saveChecklist() {
    const text = checklistText();
    const ctx = currentContext();
    if (!text || !ctx) {
      toast("先にチェックリストを表示してください。");
      return;
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moving-lease-final-check-${ctx.dateStr}-${ctx.homeType}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("TXTを保存しました。");
  }

  function printChecklist() {
    if (els.result.hidden) {
      toast("先にチェックリストを表示してください。");
      return;
    }
    window.print();
  }

  els.btnGenerate.addEventListener("click", render);
  els.btnClear.addEventListener("click", clearChecks);
  els.btnReset.addEventListener("click", resetForm);
  els.btnDeleteCurrentData.addEventListener("click", deleteCurrentData);
  els.btnDeleteLastData.addEventListener("click", deleteLastData);
  els.btnCopyTxt.addEventListener("click", copyChecklist);
  els.btnSaveTxt.addEventListener("click", saveChecklist);
  els.btnPrint.addEventListener("click", printChecklist);

  try {
    const last = JSON.parse(localStorage.getItem(LAST_KEY) || "null");
    if (last && typeof last === "object") {
      if (typeof last.dateStr === "string" && last.dateStr) els.moveDate.value = last.dateStr;
      if (last.homeType === "rental" || last.homeType === "owned") els.homeType.value = last.homeType;
    }
  } catch {
    // ignore broken localStorage values
  }
})();
