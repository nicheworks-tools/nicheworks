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
    checklist: $("checklist"),
    emptyState: $("emptyState"),
    resultMeta: $("resultMeta"),
    printMeta: $("printMeta"),
    usageLink: $("usageLink"),
  };

  const I18N = {
    ja: {
      title: "引っ越し前チェックリストジェネレーター",
      subtitle: "引っ越し日と条件を入れるだけで、1週間前〜当日のやることを時系列で自動整理します。",
      usageLink: "使い方はこちら",
      movingDate: "引っ越し日",
      household: "家族構成",
      solo: "単身",
      family: "家族",
      homeType: "住居タイプ",
      rental: "賃貸",
      owned: "持ち家",
      printNote: "（任意）印刷用メモ",
      btnGenerate: "チェックリストを生成",
      btnPrint: "印刷 / PDF",
      btnClear: "チェック全解除",
      btnReset: "入力をリセット",
      hint: "チェック状態はこの端末内（ブラウザ）に保存されます。入力条件が違うと別リストとして保存されます。",
      resultTitle: "チェックリスト",
      emptyState: "引っ越し日を入れて「チェックリストを生成」を押してください。",
      disclaimer: "本ツールは一般的な引っ越し作業を元にした参考リストです。個別事情への完全対応は保証されません。",
      donateText: "このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。",
      printTitle: "引っ越しチェックリスト",
      metaLine: ({dateStr, household, homeType}) => `${dateStr} / ${household} / ${homeType}`,
      rel: (d) => (d === 0 ? "当日" : `${Math.abs(d)}日前`),
      dayTitle: (d) => (d === 0 ? "当日（Moving Day）" : `${Math.abs(d)}日前`),
      dateFmt: (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
      cleared: "チェックを全解除しました。",
      needDate: "引っ越し日を入力してください。",
      confirmReset: "入力をリセットします。チェック状態は残ります（入力条件ごとに保存）。続行しますか？",
    },
    en: {
      title: "Moving Checklist Generator",
      subtitle: "Enter your moving date and situation to get a timeline checklist (7 days → moving day).",
      usageLink: "How to use",
      movingDate: "Moving date",
      household: "Household",
      solo: "Solo",
      family: "Family",
      homeType: "Home type",
      rental: "Rental",
      owned: "Owned",
      printNote: "(Optional) Note for print",
      btnGenerate: "Generate checklist",
      btnPrint: "Print / Save as PDF",
      btnClear: "Clear all checks",
      btnReset: "Reset form",
      hint: "Your check status is saved in this browser (local). Different inputs create separate saved lists.",
      resultTitle: "Checklist",
      emptyState: "Select a moving date and click “Generate checklist”.",
      disclaimer: "This is a general reference checklist. It may not cover all individual situations.",
      donateText: "If this tool helped you, consider supporting continued development.",
      printTitle: "Moving Checklist",
      metaLine: ({dateStr, household, homeType}) => `${dateStr} / ${household} / ${homeType}`,
      rel: (d) => (d === 0 ? "Moving day" : `${Math.abs(d)} day(s) before`),
      dayTitle: (d) => (d === 0 ? "Moving Day" : `${Math.abs(d)} day(s) before`),
      dateFmt: (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
      cleared: "All checks cleared.",
      needDate: "Please select a moving date.",
      confirmReset: "Reset inputs? Your checklist checks remain saved per input set. Continue?",
    }
  };

  // Template tasks: dayOffset in [-7..0], conditions
  const TASKS = [
    // -7
    { id:"t01", day:-7, ja:"引っ越し業者の最終確認（時間・料金・段ボール数）", en:"Confirm movers (time, cost, boxes)", when:"admin" },
    { id:"t02", day:-7, ja:"冷蔵庫の中身を計画的に減らし始める", en:"Start reducing fridge contents", when:"prep" },
    { id:"t03", day:-7, ja:"大物粗大ごみの予約（自治体/回収）", en:"Schedule bulky waste pickup (if needed)", when:"admin" },

    // -5
    { id:"t04", day:-5, ja:"転出届/転入準備の確認（必要書類）", en:"Check moving-out/in procedures & documents", when:"admin" },
    { id:"t05", day:-5, ja:"電気・ガス・水道・ネットの手続き（停止/開始）", en:"Arrange utilities & internet (stop/start)", when:"utilities" },
    { id:"t06", day:-5, ja:"荷造り（使わない物から箱詰め）", en:"Start packing non-essentials", when:"packing" },

    // -3
    { id:"t07", day:-3, ja:"郵便物の転送届（郵便局）", en:"Set mail forwarding", when:"admin" },
    { id:"t08", day:-3, ja:"日用品の“当日持ち出し袋”を準備（充電器/薬/貴重品）", en:"Prepare an essentials bag (chargers/meds/valuables)", when:"packing" },
    { id:"t09", day:-3, ja:"近隣への簡単な挨拶（必要なら）", en:"Notify neighbors if needed", when:"social" },

    // -2
    { id:"t10", day:-2, ja:"賃貸：退去立会いの日時確認（管理会社）", en:"Rental: confirm move-out inspection time", when:"housing", only:{ homeType:["rental"] } },
    { id:"t11", day:-2, ja:"持ち家：ライフライン/設備の確認（ブレーカー・止水など）", en:"Owned: check utilities shutoff points (breaker/water valve)", when:"housing", only:{ homeType:["owned"] } },
    { id:"t12", day:-2, ja:"掃除道具・ゴミ袋を残しておく", en:"Keep cleaning tools & trash bags accessible", when:"cleaning" },

    // -1
    { id:"t13", day:-1, ja:"冷蔵庫の電源を切る（霜取りが必要なら）", en:"Turn off fridge (defrost if needed)", when:"prep" },
    { id:"t14", day:-1, ja:"家族：子ども/ペットの当日動線を整理", en:"Family: plan moving-day flow for kids/pets", when:"family", only:{ household:["family"] } },
    { id:"t15", day:-1, ja:"鍵・契約書・重要書類を一箇所にまとめる", en:"Gather keys, contracts, important documents", when:"admin" },

    // 0
    { id:"t16", day:0, ja:"旧居の最終チェック（忘れ物・水道/ガス・ブレーカー）", en:"Final check (left items, water/gas, breaker)", when:"final" },
    { id:"t17", day:0, ja:"メーター撮影（電気/ガス/水道）※必要なら", en:"Photo utility meters if needed", when:"final" },
    { id:"t18", day:0, ja:"新居：ライフライン動作確認（照明・水・ガス）", en:"New place: verify utilities (lights/water/gas)", when:"arrival" },
  ];

  function getLangDefault() {
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function setLang(lang) {
    const dict = I18N[lang] || I18N.ja;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      if (typeof dict[key] === "string") el.textContent = dict[key];
    });

    document.querySelectorAll(".nw-lang-switch button").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });

    // usage link switching
    els.usageLink.href = lang === "ja" ? "./usage.html" : "./usage-en.html";

    localStorage.setItem("nw_lang", lang);
  }

  function readLang() {
    return localStorage.getItem("nw_lang") || getLangDefault();
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
    return `moveChecklist:v1:${dateStr}:${household}:${homeType}`;
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

  function filterTasks({household, homeType}) {
    return TASKS.filter(t => {
      const only = t.only || {};
      if (only.household && !only.household.includes(household)) return false;
      if (only.homeType && !only.homeType.includes(homeType)) return false;
      return true;
    });
  }

  function groupByDay(tasks) {
    const days = [-7, -5, -3, -2, -1, 0];
    const map = new Map(days.map(d => [d, []]));
    tasks.forEach(t => {
      if (map.has(t.day)) map.get(t.day).push(t);
    });
    return days.map(d => ({ day: d, tasks: map.get(d) || [] }));
  }

  function render({lang, moveDate, household, homeType, note}) {
    const dict = I18N[lang] || I18N.ja;
    const dateStr = dict.dateFmt(moveDate);
    const householdLabel = (lang === "ja")
      ? (household === "solo" ? "単身" : "家族")
      : (household === "solo" ? "Solo" : "Family");
    const homeTypeLabel = (lang === "ja")
      ? (homeType === "rental" ? "賃貸" : "持ち家")
      : (homeType === "rental" ? "Rental" : "Owned");

    const key = cfgKey({ dateStr, household, homeType });
    const checks = loadChecks(key);

    // meta lines
    els.resultMeta.textContent = dict.metaLine({ dateStr, household: householdLabel, homeType: homeTypeLabel });
    els.printMeta.textContent = `${dict.metaLine({ dateStr, household: householdLabel, homeType: homeTypeLabel })}${note ? " / " + note : ""}`;

    // tasks
    const tasks = filterTasks({ household, homeType });
    const blocks = groupByDay(tasks);

    // clear
    els.checklist.innerHTML = "";
    els.emptyState.style.display = "none";

    blocks.forEach(({day, tasks}) => {
      const block = document.createElement("div");
      block.className = "day-block";

      const head = document.createElement("div");
      head.className = "day-head";

      const title = document.createElement("h3");
      title.className = "day-title";
      title.textContent = dict.dayTitle(day);

      const sub = document.createElement("div");
      sub.className = "day-sub";
      const d = addDays(moveDate, day);
      sub.textContent = `${dict.dateFmt(d)} · ${dict.rel(day)}`;

      head.appendChild(title);
      head.appendChild(sub);
      block.appendChild(head);

      tasks.forEach((t) => {
        const row = document.createElement("label");
        row.className = "task";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!checks[t.id];
        cb.addEventListener("change", () => {
          checks[t.id] = cb.checked;
          saveChecks(key, checks);
        });

        const right = document.createElement("div");

        const text = document.createElement("div");
        text.className = "ttext";
        text.textContent = (lang === "ja") ? t.ja : t.en;

        const meta = document.createElement("div");
        meta.className = "tmeta";
        meta.textContent = (lang === "ja") ? `カテゴリ: ${t.when}` : `Category: ${t.when}`;

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
    const moveDate = parseDateInput(els.moveDate.value);
    if (!moveDate) {
      alert((I18N[lang] || I18N.ja).needDate);
      return;
    }
    const household = els.household.value;
    const homeType = els.homeType.value;
    const note = (els.printNote.value || "").trim();

    render({ lang, moveDate, household, homeType, note });
  }

  function clearChecks() {
    const lang = readLang();
    const dict = I18N[lang] || I18N.ja;
    const moveDate = parseDateInput(els.moveDate.value);
    if (!moveDate) {
      alert(dict.needDate);
      return;
    }
    const dateStr = dict.dateFmt(moveDate);
    const key = cfgKey({ dateStr, household: els.household.value, homeType: els.homeType.value });
    localStorage.removeItem(key);
    generate();
    alert(dict.cleared);
  }

  function resetForm() {
    const lang = readLang();
    const dict = I18N[lang] || I18N.ja;
    if (!confirm(dict.confirmReset)) return;

    els.moveDate.value = "";
    els.household.value = "solo";
    els.homeType.value = "rental";
    els.printNote.value = "";

    els.resultMeta.textContent = "";
    els.printMeta.textContent = "—";
    els.checklist.innerHTML = `<div class="empty" id="emptyState">${dict.emptyState}</div>`;
  }

  // Bind events
  els.btnGenerate.addEventListener("click", generate);
  els.btnPrint.addEventListener("click", () => window.print());
  els.btnClear.addEventListener("click", clearChecks);
  els.btnReset.addEventListener("click", resetForm);

  document.querySelectorAll(".nw-lang-switch button").forEach((b) => {
    b.addEventListener("click", () => {
      const lang = b.getAttribute("data-lang");
      setLang(lang);

      // if checklist already generated, re-render in new language
      const moveDate = parseDateInput(els.moveDate.value);
      if (moveDate) generate();
    });
  });

  // Init language
  setLang(readLang());
})();
