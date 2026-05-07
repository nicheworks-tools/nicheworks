(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    moveDate: $("moveDate"),
    household: $("household"),
    homeType: $("homeType"),
    printNote: $("printNote"),
    btnGenerate: $("btnGenerate"),
    btnPrint: $("btnPrint"),
    btnClear: $("btnClear"),
    btnReset: $("btnReset"),
    btnDeleteSaved: $("btnDeleteSaved"),
    btnDeleteAllSaved: $("btnDeleteAllSaved"),
    btnConfirmReset: $("btnConfirmReset"),
    btnCancelReset: $("btnCancelReset"),
    confirmPanel: $("confirmPanel"),
    toast: $("toast"),
    checklist: $("checklist"),
    emptyState: $("emptyState"),
    resultMeta: $("resultMeta"),
    progressSummary: $("progressSummary"),
    printMeta: $("printMeta"),
    usageLink: $("usageLink"),
  };

  const STORAGE_PREFIX = "moveChecklist:v2:";

  const I18N = {
    ja: {
      title: "引っ越しやることチェックリスト",
      subtitle: "引っ越し日と条件を入れるだけで、30日前〜引越し後のやることを時系列で整理します。",
      introText: "引っ越し日、家族構成、住居タイプから、住所変更・役所手続き・ライフライン・荷造り・当日確認・引越し後の確認をまとめます。",
      usageLink: "使い方はこちら",
      movingDate: "引っ越し日",
      household: "家族構成",
      solo: "単身",
      family: "家族",
      homeType: "住居タイプ",
      rental: "賃貸",
      owned: "持ち家",
      printNote: "（任意）印刷用メモ",
      printNotePlaceholder: "例：○○家 / 部屋番号など",
      btnGenerate: "チェックリストを生成",
      btnPrint: "印刷 / PDF保存",
      btnClear: "チェック全解除",
      btnReset: "入力をリセット",
      btnDeleteSaved: "この条件の保存データを削除",
      btnDeleteAllSaved: "全保存データを削除",
      confirmResetInline: "入力欄だけをリセットします。チェック状態は条件ごとに保存されたままです。",
      btnConfirmReset: "リセットする",
      btnCancelReset: "キャンセル",
      hint: "チェック状態と、条件識別用の引っ越し日・家族構成・住居タイプがこのブラウザのlocalStorageに保存されます。印刷用メモは保存しません。別端末・別ブラウザには引き継がれず、ブラウザデータを削除すると消えます。",
      printHint: "PDF保存はブラウザの印刷ダイアログから「PDFとして保存」を選んでください。",
      resultTitle: "チェックリスト",
      emptyState: "引っ越し日を入れて「チェックリストを生成」を押してください。",
      disclaimer: "本ツールは一般的な引っ越し作業を元にした参考リストです。自治体・管理会社・契約先の公式情報を必ず確認してください。",
      donateText: "このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。",
      printTitle: "引っ越しチェックリスト",
      faqTitle: "よくある質問",
      faqQ1: "チェック状態はどこに保存されますか？",
      faqA1: "チェック状態と、条件識別用の引っ越し日・家族構成・住居タイプがこのブラウザのlocalStorageに保存されます。別端末や別ブラウザには引き継がれません。",
      faqQ2: "PDFとして保存できますか？",
      faqA2: "ブラウザの印刷画面から「PDFとして保存」を選んでください。",
      faqQ3: "すべての手続きを網羅していますか？",
      faqA3: "いいえ。一般的な参考リストです。自治体・管理会社・契約内容を必ず確認してください。",
      faqQ4: "住所や個人情報を入力する必要はありますか？",
      faqA4: "ありません。印刷用メモも任意で保存しません。印刷やPDFに出る場合があるため、個人情報は入力しないことを推奨します。",
      metaLine: ({dateStr, household, homeType}) => `${dateStr} / ${household} / ${homeType}`,
      rel: (d) => d === 0 ? "当日" : d > 0 ? `引越し後 ${d}日` : `${Math.abs(d)}日前`,
      dayTitle: (d) => d === 0 ? "当日（Moving Day）" : d > 0 ? `引越し後 ${d}日` : `${Math.abs(d)}日前`,
      dateFmt: (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
      progress: ({total, checked, remaining, percent}) => `全${total}項目 / 完了 ${checked} / 未完了 ${remaining} / 完了率 ${percent}%`,
      noSavedForCondition: "この条件の保存データはありません。",
      savedDeleted: "この条件の保存データを削除しました。",
      allSavedDeleted: "Moving Checklist の保存データをすべて削除しました。",
      cleared: "チェックを全解除しました。",
      needDate: "引っ越し日を入力してください。",
      resetShown: "リセット確認を表示しました。",
    },
    en: {
      title: "Moving Checklist Generator",
      subtitle: "Enter your moving date and situation to get a timeline checklist from 30 days before to after moving.",
      introText: "Create a timeline checklist for address changes, government procedures, utilities, packing, moving-day checks, and post-move follow-up.",
      usageLink: "How to use",
      movingDate: "Moving date",
      household: "Household",
      solo: "Solo",
      family: "Family",
      homeType: "Home type",
      rental: "Rental",
      owned: "Owned",
      printNote: "(Optional) Note for print",
      printNotePlaceholder: "Example: Family name / room number",
      btnGenerate: "Generate checklist",
      btnPrint: "Print / Save as PDF",
      btnClear: "Clear all checks",
      btnReset: "Reset form",
      btnDeleteSaved: "Delete saved data for this setup",
      btnDeleteAllSaved: "Delete all saved data",
      confirmResetInline: "Only the input fields will be reset. Saved check states remain stored per setup.",
      btnConfirmReset: "Reset",
      btnCancelReset: "Cancel",
      hint: "Check states plus the moving date, household, and home type used to identify this setup are saved in this browser's localStorage. The print note is not saved. They do not sync across devices or browsers, and may be cleared if you delete browser data.",
      printHint: "To save as PDF, use your browser print dialog and choose “Save as PDF”.",
      resultTitle: "Checklist",
      emptyState: "Select a moving date and click “Generate checklist”.",
      disclaimer: "This is a general reference checklist. Always confirm critical procedures with your municipality, property manager, and service providers.",
      donateText: "If this tool helped you, consider supporting continued development.",
      printTitle: "Moving Checklist",
      faqTitle: "FAQ",
      faqQ1: "Where are checks saved?",
      faqA1: "Check states plus the moving date, household, and home type used to identify this setup are saved in this browser's localStorage. They do not sync to another device or browser.",
      faqQ2: "Can I save it as PDF?",
      faqA2: "Use your browser print dialog and choose “Save as PDF”.",
      faqQ3: "Does it cover every moving procedure?",
      faqA3: "No. This is a general reference list. Confirm details with your municipality, property manager, and contracts.",
      faqQ4: "Do I need to enter an address or personal information?",
      faqA4: "No. The print note is optional and is not saved, but it may appear in print/PDF output, so avoid personal information.",
      metaLine: ({dateStr, household, homeType}) => `${dateStr} / ${household} / ${homeType}`,
      rel: (d) => d === 0 ? "Moving day" : d > 0 ? `${d} day(s) after` : `${Math.abs(d)} day(s) before`,
      dayTitle: (d) => d === 0 ? "Moving Day" : d > 0 ? `${d} day(s) after moving` : `${Math.abs(d)} day(s) before`,
      dateFmt: (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
      progress: ({total, checked, remaining, percent}) => `${total} items / Done ${checked} / Remaining ${remaining} / ${percent}% complete`,
      noSavedForCondition: "No saved data for this setup.",
      savedDeleted: "Saved data for this setup has been deleted.",
      allSavedDeleted: "All Moving Checklist saved data has been deleted.",
      cleared: "All checks cleared.",
      needDate: "Please select a moving date.",
      resetShown: "Reset confirmation is shown.",
    }
  };

  const TASKS = [
    { id:"m30_01", day:-30, ja:"引越し業者の見積もり・候補日の確認", en:"Get mover estimates and confirm candidate dates", when:"planning" },
    { id:"m30_02", day:-30, ja:"賃貸：管理会社・大家へ退去予定を連絡", en:"Rental: notify property manager/landlord of move-out plan", when:"housing", only:{ homeType:["rental"] } },
    { id:"m30_03", day:-30, ja:"持ち家：旧居の売却・賃貸化・管理方針を確認", en:"Owned: decide sell/rent/manage plan for the old home", when:"housing", only:{ homeType:["owned"] } },
    { id:"m30_04", day:-30, ja:"ネット回線の移転・解約・開通予定を確認", en:"Check internet transfer/cancellation/installation schedule", when:"utilities" },
    { id:"m30_05", day:-30, ja:"不要品・粗大ごみ・リサイクル品の整理を開始", en:"Start sorting unwanted, bulky, and recyclable items", when:"packing" },

    { id:"m14_01", day:-14, ja:"住所変更が必要なサービス一覧を作る（銀行・クレカ・保険・携帯・通販など）", en:"List services needing address changes: bank, cards, insurance, mobile, shopping, etc.", when:"address" },
    { id:"m14_02", day:-14, ja:"郵便物の転送届を準備・提出", en:"Prepare and submit mail forwarding", when:"address" },
    { id:"m14_03", day:-14, ja:"役所手続きの必要書類を確認（転出届・転入届・マイナンバー等）", en:"Check required documents for municipal procedures", when:"admin" },
    { id:"m14_04", day:-14, ja:"粗大ごみ回収や不用品回収の予約", en:"Book bulky waste or disposal pickup", when:"packing" },
    { id:"m14_05", day:-14, ja:"家族：学校・保育園・勤務先などへの住所変更連絡を確認", en:"Family: confirm address-change notices for school, daycare, workplace, etc.", when:"family", only:{ household:["family"] } },

    { id:"m07_01", day:-7, ja:"引越し業者の最終確認（時間・料金・段ボール数）", en:"Confirm movers: time, cost, and boxes", when:"planning" },
    { id:"m07_02", day:-7, ja:"電気・ガス・水道の停止/開始手続きを確認", en:"Confirm stop/start procedures for electricity, gas, and water", when:"utilities" },
    { id:"m07_03", day:-7, ja:"冷蔵庫の中身を計画的に減らし始める", en:"Start reducing fridge contents", when:"prep" },
    { id:"m07_04", day:-7, ja:"箱ラベルのルールを決める（部屋名・優先度・割れ物など）", en:"Set box-label rules: room, priority, fragile, etc.", when:"packing" },

    { id:"m05_01", day:-5, ja:"使わない物から箱詰めを進める", en:"Pack non-essentials first", when:"packing" },
    { id:"m05_02", day:-5, ja:"ガス開栓・閉栓の立会い有無を確認", en:"Check whether gas opening/closing requires attendance", when:"utilities" },
    { id:"m05_03", day:-5, ja:"NHK・宅配・定期購入など住所変更漏れがないか確認", en:"Check address changes for subscriptions, deliveries, and recurring services", when:"address" },
    { id:"m05_04", day:-5, ja:"賃貸：火災保険の解約・変更手続きを確認", en:"Rental: check fire insurance cancellation/change procedure", when:"housing", only:{ homeType:["rental"] } },

    { id:"m03_01", day:-3, ja:"当日持ち出し袋を準備（充電器・薬・貴重品・書類）", en:"Prepare essentials bag: chargers, meds, valuables, documents", when:"packing" },
    { id:"m03_02", day:-3, ja:"掃除道具・ゴミ袋・工具を最後まで出しておく", en:"Keep cleaning tools, trash bags, and basic tools accessible", when:"cleaning" },
    { id:"m03_03", day:-3, ja:"搬出・搬入経路、エレベーター、駐車場所を確認", en:"Confirm routes, elevator use, and parking for move-out/move-in", when:"final" },
    { id:"m03_04", day:-3, ja:"近隣への挨拶や管理人への連絡を済ませる", en:"Notify neighbors/building manager if needed", when:"social" },

    { id:"m01_01", day:-1, ja:"冷蔵庫の電源を切る（霜取りが必要なら）", en:"Turn off fridge if defrosting is needed", when:"prep" },
    { id:"m01_02", day:-1, ja:"鍵・契約書・重要書類を一箇所にまとめる", en:"Gather keys, contracts, and important documents", when:"admin" },
    { id:"m01_03", day:-1, ja:"家族：子ども・ペットの当日動線を決める", en:"Family: plan moving-day flow for kids/pets", when:"family", only:{ household:["family"] } },
    { id:"m01_04", day:-1, ja:"旧居・新居の傷や設備状態を写真で記録", en:"Photograph condition of old/new home and fixtures", when:"record" },

    { id:"d00_01", day:0, ja:"旧居の最終チェック（忘れ物・水道・ガス・ブレーカー）", en:"Final old-home check: belongings, water, gas, breaker", when:"final" },
    { id:"d00_02", day:0, ja:"メーター撮影（電気・ガス・水道）※必要なら", en:"Photograph utility meters if needed", when:"record" },
    { id:"d00_03", day:0, ja:"新居のライフライン動作確認（照明・水・ガス・ネット）", en:"Verify utilities at new home: lights, water, gas, internet", when:"arrival" },
    { id:"d00_04", day:0, ja:"賃貸：鍵返却・退去立会い・原状回復の確認", en:"Rental: return keys, attend inspection, confirm restoration items", when:"housing", only:{ homeType:["rental"] } },
    { id:"d00_05", day:0, ja:"搬入後、床・壁・大型家具の傷を確認", en:"After move-in, check floors, walls, and large furniture for damage", when:"record" },

    { id:"p01_01", day:1, ja:"転入届・マイナンバー住所変更など役所手続き", en:"Complete municipal procedures such as move-in notice and ID/address updates", when:"admin" },
    { id:"p01_02", day:1, ja:"免許証・銀行・カード・保険・携帯の住所変更", en:"Update address for license, bank, cards, insurance, and mobile", when:"address" },
    { id:"p01_03", day:1, ja:"荷解き優先箱を確認し、生活必需品から配置", en:"Unpack priority boxes and set up essentials first", when:"arrival" },
    { id:"p01_04", day:1, ja:"近隣挨拶・管理会社への入居連絡（必要なら）", en:"Greet neighbors or notify property manager if needed", when:"social" },
    { id:"p01_05", day:1, ja:"持ち家：登記・固定資産税・旧居管理に関する確認", en:"Owned: check registration, property tax, and old-home management items", when:"housing", only:{ homeType:["owned"] } },
  ];

  function getLangDefault() {
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function readLang() {
    return localStorage.getItem("nw_lang") || getLangDefault();
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.hidden = true;
      els.toast.textContent = "";
    }, 2600);
  }

  function setLang(lang) {
    const dict = I18N[lang] || I18N.ja;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (typeof dict[key] === "string") el.textContent = dict[key];
    });

    document.querySelectorAll(".nw-lang-switch button").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });

    els.printNote.placeholder = dict.printNotePlaceholder;
    els.usageLink.href = lang === "ja" ? "./usage.html" : "./usage-en.html";
    localStorage.setItem("nw_lang", lang);
  }

  function parseDateInput(value) {
    if (!value) return null;
    const d = new Date(value + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }

  function addDays(base, delta) {
    const d = new Date(base);
    d.setDate(d.getDate() + delta);
    return d;
  }

  function cfgKey({dateStr, household, homeType}) {
    return `${STORAGE_PREFIX}${dateStr}:${household}:${homeType}`;
  }

  function currentConfigKey(dict, moveDate) {
    return cfgKey({
      dateStr: dict.dateFmt(moveDate),
      household: els.household.value,
      homeType: els.homeType.value,
    });
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
    localStorage.setItem(key, JSON.stringify(checks));
  }

  function filterTasks({household, homeType}) {
    return TASKS.filter((t) => {
      const only = t.only || {};
      if (only.household && !only.household.includes(household)) return false;
      if (only.homeType && !only.homeType.includes(homeType)) return false;
      return true;
    });
  }

  function groupByDay(tasks) {
    const days = [-30, -14, -7, -5, -3, -1, 0, 1];
    const map = new Map(days.map((d) => [d, []]));
    tasks.forEach((t) => {
      if (map.has(t.day)) map.get(t.day).push(t);
    });
    return days.map((d) => ({ day: d, tasks: map.get(d) || [] })).filter((g) => g.tasks.length);
  }

  function clearChecklistDom() {
    while (els.checklist.firstChild) els.checklist.removeChild(els.checklist.firstChild);
  }

  function updateProgress({lang, tasks, checks}) {
    const dict = I18N[lang] || I18N.ja;
    const total = tasks.length;
    const checked = tasks.filter((t) => checks[t.id]).length;
    const remaining = Math.max(0, total - checked);
    const percent = total ? Math.round((checked / total) * 100) : 0;
    els.progressSummary.textContent = dict.progress({ total, checked, remaining, percent });
    els.progressSummary.hidden = total === 0;
  }

  function labels(lang, household, homeType) {
    return {
      householdLabel: lang === "ja" ? (household === "solo" ? "単身" : "家族") : (household === "solo" ? "Solo" : "Family"),
      homeTypeLabel: lang === "ja" ? (homeType === "rental" ? "賃貸" : "持ち家") : (homeType === "rental" ? "Rental" : "Owned"),
    };
  }

  function render({lang, moveDate, household, homeType, note}) {
    const dict = I18N[lang] || I18N.ja;
    const dateStr = dict.dateFmt(moveDate);
    const { householdLabel, homeTypeLabel } = labels(lang, household, homeType);
    const key = cfgKey({ dateStr, household, homeType });
    const checks = loadChecks(key);
    const tasks = filterTasks({ household, homeType });
    const blocks = groupByDay(tasks);

    els.resultMeta.textContent = dict.metaLine({ dateStr, household: householdLabel, homeType: homeTypeLabel });
    els.printMeta.textContent = `${dict.metaLine({ dateStr, household: householdLabel, homeType: homeTypeLabel })}${note ? " / " + note : ""}`;

    clearChecklistDom();
    els.emptyState.hidden = true;
    updateProgress({ lang, tasks, checks });

    blocks.forEach(({day, tasks: dayTasks}) => {
      const block = document.createElement("div");
      block.className = "day-block";

      const head = document.createElement("div");
      head.className = "day-head";

      const title = document.createElement("h3");
      title.className = "day-title";
      title.textContent = dict.dayTitle(day);

      const sub = document.createElement("div");
      sub.className = "day-sub";
      sub.textContent = `${dict.dateFmt(addDays(moveDate, day))} · ${dict.rel(day)}`;

      head.appendChild(title);
      head.appendChild(sub);
      block.appendChild(head);

      dayTasks.forEach((t) => {
        const row = document.createElement("label");
        row.className = "task";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!checks[t.id];
        cb.addEventListener("change", () => {
          checks[t.id] = cb.checked;
          saveChecks(key, checks);
          updateProgress({ lang, tasks, checks });
        });

        const right = document.createElement("div");
        const text = document.createElement("div");
        text.className = "ttext";
        text.textContent = lang === "ja" ? t.ja : t.en;

        const meta = document.createElement("div");
        meta.className = "tmeta";
        meta.textContent = lang === "ja" ? `カテゴリ: ${t.when}` : `Category: ${t.when}`;

        right.appendChild(text);
        right.appendChild(meta);
        row.appendChild(cb);
        row.appendChild(right);
        block.appendChild(row);
      });

      els.checklist.appendChild(block);
    });
  }

  function generate() {
    const lang = readLang();
    const dict = I18N[lang] || I18N.ja;
    const moveDate = parseDateInput(els.moveDate.value);
    if (!moveDate) {
      showToast(dict.needDate);
      return false;
    }
    render({
      lang,
      moveDate,
      household: els.household.value,
      homeType: els.homeType.value,
      note: (els.printNote.value || "").trim(),
    });
    return true;
  }

  function clearChecks() {
    const lang = readLang();
    const dict = I18N[lang] || I18N.ja;
    const moveDate = parseDateInput(els.moveDate.value);
    if (!moveDate) {
      showToast(dict.needDate);
      return;
    }
    localStorage.removeItem(currentConfigKey(dict, moveDate));
    generate();
    showToast(dict.cleared);
  }

  function resetFormNow() {
    const lang = readLang();
    const dict = I18N[lang] || I18N.ja;
    els.moveDate.value = "";
    els.household.value = "solo";
    els.homeType.value = "rental";
    els.printNote.value = "";
    els.resultMeta.textContent = "";
    els.printMeta.textContent = "—";
    els.progressSummary.hidden = true;
    els.progressSummary.textContent = "";
    clearChecklistDom();
    els.emptyState.textContent = dict.emptyState;
    els.emptyState.hidden = false;
    els.confirmPanel.hidden = true;
  }

  function deleteSavedForCurrentSetup() {
    const lang = readLang();
    const dict = I18N[lang] || I18N.ja;
    const moveDate = parseDateInput(els.moveDate.value);
    if (!moveDate) {
      showToast(dict.needDate);
      return;
    }
    const key = currentConfigKey(dict, moveDate);
    if (!localStorage.getItem(key)) {
      showToast(dict.noSavedForCondition);
      return;
    }
    localStorage.removeItem(key);
    generate();
    showToast(dict.savedDeleted);
  }

  function deleteAllSaved() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
    generate();
    showToast((I18N[readLang()] || I18N.ja).allSavedDeleted);
  }

  els.btnGenerate.addEventListener("click", generate);
  els.btnPrint.addEventListener("click", () => window.print());
  els.btnClear.addEventListener("click", clearChecks);
  els.btnReset.addEventListener("click", () => {
    els.confirmPanel.hidden = false;
    showToast((I18N[readLang()] || I18N.ja).resetShown);
  });
  els.btnConfirmReset.addEventListener("click", resetFormNow);
  els.btnCancelReset.addEventListener("click", () => { els.confirmPanel.hidden = true; });
  els.btnDeleteSaved.addEventListener("click", deleteSavedForCurrentSetup);
  els.btnDeleteAllSaved.addEventListener("click", deleteAllSaved);

  document.querySelectorAll(".nw-lang-switch button").forEach((b) => {
    b.addEventListener("click", () => {
      const lang = b.getAttribute("data-lang");
      setLang(lang);
      const moveDate = parseDateInput(els.moveDate.value);
      if (moveDate) generate();
    });
  });

  setLang(readLang());
})();
