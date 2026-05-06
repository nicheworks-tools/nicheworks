(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(lang);
  };

  const toast = (message) => {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      el.classList.remove("show");
    }, 2200);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const downloadText = (filename, text, type = "text/plain;charset=utf-8") => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const toBullets = (value) => value
    .split(/\n|,|、/)
    .map((v) => v.trim())
    .filter(Boolean);

  const getValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const fallback = (value, ja, en, lang) => value || (lang === "ja" ? ja : en);

  const bulletBlock = (items, fallbackText) => {
    if (items.length) return items.map((item) => `- ${item}`).join("\n");
    return `- ${fallbackText}`;
  };

  const buildJobPost = (lang) => {
    const role = fallback(getValue("role"), "未入力", "Not specified", lang);
    const contractType = fallback(getValue("contractType"), "要確認", "To be confirmed", lang);
    const compensation = fallback(getValue("compensation"), "要確認", "To be confirmed", lang);
    const workload = fallback(getValue("workload"), "要確認", "To be confirmed", lang);
    const responsibilities = toBullets(getValue("responsibilities"));
    const requirements = toBullets(getValue("requirements"));
    const preferred = toBullets(getValue("preferred"));
    const conditions = toBullets(getValue("conditions"));
    const process = toBullets(getValue("process"));
    const location = fallback(getValue("location"), "要確認", "To be confirmed", lang);
    const applyMethod = fallback(getValue("applyMethod"), "ポートフォリオや実績、希望報酬を添えてご応募ください", "Apply with your portfolio, relevant work samples, and expected compensation", lang);

    if (lang === "ja") {
      return [
        "【募集職種】",
        role,
        "",
        "【契約形態 / 雇用形態】",
        contractType,
        "",
        "【報酬】",
        compensation,
        "",
        "【稼働時間】",
        workload,
        "",
        "【業務内容】",
        bulletBlock(responsibilities, "業務内容、成果物、確認方法を明確にして追記してください"),
        "",
        "【必須要件】",
        bulletBlock(requirements, "類似業務の経験、稼働条件、必要スキルを追記してください"),
        "",
        "【歓迎要件】",
        bulletBlock(preferred, "コミュニケーションの速さ、改善提案、自走力など"),
        "",
        "【勤務条件・補足】",
        bulletBlock(conditions, "定例頻度、連絡手段、納品形式などを追記してください"),
        "",
        "【勤務地 / 働き方】",
        location,
        "",
        "【選考プロセス】",
        bulletBlock(process, "書類選考 → 面談 → 必要に応じてトライアル"),
        "",
        "【応募方法】",
        `- ${applyMethod}`,
        "",
        "【公開前チェック】",
        "- 労働条件、契約形態、最低賃金、差別的表現、求人媒体ルールを確認してください。",
      ].join("\n");
    }

    return [
      "[Role]",
      role,
      "",
      "[Contract / Employment Type]",
      contractType,
      "",
      "[Compensation]",
      compensation,
      "",
      "[Expected Workload]",
      workload,
      "",
      "[Responsibilities]",
      bulletBlock(responsibilities, "Add concrete tasks, deliverables, and review methods"),
      "",
      "[Required Qualifications]",
      bulletBlock(requirements, "Add relevant experience, availability, and required skills"),
      "",
      "[Preferred Qualifications]",
      bulletBlock(preferred, "Fast communication, improvement suggestions, proactive ownership"),
      "",
      "[Working Conditions / Notes]",
      bulletBlock(conditions, "Add meeting cadence, communication channel, and delivery format"),
      "",
      "[Location / Remote]",
      location,
      "",
      "[Hiring Process]",
      bulletBlock(process, "Application review → Interview → Trial task if needed"),
      "",
      "[How to Apply]",
      `- ${applyMethod}`,
      "",
      "[Pre-publish Check]",
      "- Review labor conditions, contract type, minimum wage rules, discriminatory wording, and job board policies.",
    ].join("\n");
  };

  const buildQuestions = (lang) => {
    const role = getValue("role") || (lang === "ja" ? "この職種" : "this role");
    const contractType = getValue("contractType") || (lang === "ja" ? "想定する契約形態" : "the expected contract type");
    const compensation = getValue("compensation") || (lang === "ja" ? "想定報酬" : "the expected compensation");

    if (lang === "ja") {
      return [
        "【スクリーニング質問】",
        `1. ${role}に関する直近の類似実績を教えてください。`,
        "2. 参考になるポートフォリオ、成果物、URLを共有してください。",
        "3. 週あたりの稼働可能時間と連絡可能な時間帯を教えてください。",
        `4. ${compensation}について、希望報酬や最低条件があれば教えてください。`,
        `5. ${contractType}で進める場合の懸念点があれば教えてください。`,
        "6. 小さなトライアルやテストタスクに対応できますか？対応可能な範囲も教えてください。",
        "7. 主なコミュニケーション手段と、返信しやすい時間帯を教えてください。",
      ].join("\n");
    }

    return [
      "[Screening Questions]",
      `1. What recent work experience do you have related to ${role}?`,
      "2. Share relevant portfolio items, work samples, or URLs.",
      "3. How many hours per week are you available, and when are you reachable?",
      `4. For ${compensation}, what is your expected or minimum compensation?`,
      `5. Do you have any concerns about working under ${contractType}?`,
      "6. Are you open to a small trial task? If so, what scope is reasonable?",
      "7. What communication channels do you prefer, and when do you usually respond?",
    ].join("\n");
  };

  const buildKit = (lang) => `${buildJobPost(lang)}\n\n${buildQuestions(lang)}`;

  const buildSheetColumns = (lang) => {
    if (lang === "ja") {
      return [
        "応募日",
        "氏名",
        "メール",
        "ポートフォリオ",
        "類似実績",
        "希望報酬",
        "稼働可能時間",
        "契約形態確認",
        "トライアル可否",
        "コミュニケーション手段",
        "ステータス",
        "次アクション",
        "メモ",
      ].join(",");
    }
    return [
      "Application Date",
      "Name",
      "Email",
      "Portfolio",
      "Relevant Experience",
      "Expected Compensation",
      "Availability",
      "Contract Type Check",
      "Trial Task Availability",
      "Communication Channel",
      "Status",
      "Next Action",
      "Notes",
    ].join(",");
  };

  const buildCsvDownload = (lang) => `\uFEFF${buildSheetColumns(lang)}\r\n`;

  const buildVariants = (lang) => {
    const role = getValue("role") || (lang === "ja" ? "この職種" : "this role");
    if (lang === "ja") {
      return [
        "【文面バリエーション】",
        `- スピード重視: ${role}として、短いサイクルで確認・改善を進められる方を歓迎します。`,
        `- 品質重視: ${role}として、成果物の精度だけでなく改善提案まで行える方を歓迎します。`,
        `- 長期支援: ${role}として、初回トライアル後に継続的な伴走ができる方を歓迎します。`,
        "",
        "【注意表現チェック】",
        "- 年齢、性別、国籍、家庭状況など、職務と関係の薄い条件を書いていないか確認してください。",
        "- 業務委託なのに勤務時間や指揮命令が強すぎる表現になっていないか確認してください。",
      ].join("\n");
    }

    return [
      "[Wording Variants]",
      `- Speed-focused: We welcome someone who can work as ${role} with short review and improvement cycles.`,
      `- Quality-focused: We welcome someone who can improve both deliverable quality and the process for ${role}.`,
      `- Long-term: We welcome someone who can start with a trial and continue supporting ${role} over time.`,
      "",
      "[Wording Check]",
      "- Check that the post does not include conditions unrelated to the work, such as age, gender, nationality, or family status.",
      "- If this is contractor work, check that the wording does not imply excessive control over working hours or direct supervision.",
    ].join("\n");
  };

  const currentLang = () => document.documentElement.lang === "ja" ? "ja" : "en";

  const getCurrentOutput = () => {
    const lang = currentLang();
    const el = document.getElementById(lang === "ja" ? "outputJa" : "outputEn");
    return el ? el.textContent.trim() : "";
  };

  const refresh = () => {
    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");
    if (outputJa) outputJa.textContent = buildKit("ja");
    if (outputEn) outputEn.textContent = buildKit("en");
  };

  const initTool = () => {
    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");
    const extraOutputJa = document.getElementById("extraOutputJa");
    const extraOutputEn = document.getElementById("extraOutputEn");

    if (!outputJa || !outputEn || !extraOutputJa || !extraOutputEn) return;

    document.getElementById("generateBtn").addEventListener("click", () => {
      refresh();
      toast(currentLang() === "ja" ? "求人キットを生成しました。" : "Generated the job kit.");
    });

    document.getElementById("copyBtn").addEventListener("click", async () => {
      refresh();
      const text = getCurrentOutput();
      if (!text) {
        toast(currentLang() === "ja" ? "先に生成してください。" : "Generate the output first.");
        return;
      }
      const ok = await copyToClipboard(text);
      toast(ok
        ? (currentLang() === "ja" ? "コピーしました。" : "Copied.")
        : (currentLang() === "ja" ? "コピーに失敗しました。" : "Copy failed."));
    });

    document.getElementById("saveTxtBtn").addEventListener("click", () => {
      refresh();
      const text = getCurrentOutput();
      if (!text) {
        toast(currentLang() === "ja" ? "先に生成してください。" : "Generate the output first.");
        return;
      }
      downloadText("niche-job-starter-kit.txt", text);
      toast(currentLang() === "ja" ? "TXTを保存しました。" : "Saved TXT.");
    });

    document.getElementById("copyCsvBtn").addEventListener("click", async () => {
      const text = buildSheetColumns(currentLang());
      const ok = await copyToClipboard(text);
      extraOutputJa.textContent = buildSheetColumns("ja");
      extraOutputEn.textContent = buildSheetColumns("en");
      toast(ok
        ? (currentLang() === "ja" ? "CSV列をコピーしました。" : "Copied CSV columns.")
        : (currentLang() === "ja" ? "CSV列のコピーに失敗しました。" : "Failed to copy CSV columns."));
    });

    document.getElementById("saveCsvBtn").addEventListener("click", () => {
      const lang = currentLang();
      extraOutputJa.textContent = buildSheetColumns("ja");
      extraOutputEn.textContent = buildSheetColumns("en");
      downloadText("candidate-sheet-columns.csv", buildCsvDownload(lang), "text/csv;charset=utf-8");
      toast(lang === "ja" ? "CSVを保存しました。" : "Saved CSV.");
    });

    document.getElementById("variantBtn").addEventListener("click", () => {
      extraOutputJa.textContent = buildVariants("ja");
      extraOutputEn.textContent = buildVariants("en");
      toast(currentLang() === "ja" ? "バリエーションを生成しました。" : "Generated variants.");
    });

    refresh();
    extraOutputJa.textContent = buildSheetColumns("ja");
    extraOutputEn.textContent = buildSheetColumns("en");
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTool();
  });
})();
