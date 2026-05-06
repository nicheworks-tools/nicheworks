(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));
  const placeholderNodes = () => Array.from(document.querySelectorAll("[data-placeholder-ja][data-placeholder-en]"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const setTextDirection = (lang) => {
    document.documentElement.lang = lang;
  };

  const applyPlaceholders = (lang) => {
    placeholderNodes().forEach((el) => {
      const key = lang === "ja" ? "placeholderJa" : "placeholderEn";
      el.setAttribute("placeholder", el.dataset[key] || "");
    });
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons().forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });
    setTextDirection(lang);
    applyPlaceholders(lang);
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((button) => {
      button.addEventListener("click", () => applyLang(button.dataset.lang));
    });
    applyLang(lang);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand("copy");
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const debounce = (fn, ms = 150) => {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  const TEXT = {
    ja: {
      titles: { full: "デザイン依頼文（制作ブリーフ）", key: "要点まとめ" },
      sections: {
        summary: "概要",
        deliverables: "納品物",
        specs: "仕様・必須要素",
        timeline: "スケジュール",
        budget: "予算",
        references: "参考素材",
        constraints: "制約・NG事項",
        format: "納品形式",
        revisions: "修正回数",
        contact: "連絡先",
        assumptions: "未提供の推奨項目",
        beforeSending: "送付前の確認事項",
        keyPoints: "要点"
      },
      labels: {
        projectType: "プロジェクト種別",
        purpose: "目的",
        deliverables: "納品物",
        size: "サイズ/仕様",
        deadline: "納期",
        budget: "予算",
        references: "参考/素材",
        mustHave: "必須要素",
        audience: "ターゲット",
        tone: "トーン/雰囲気",
        avoid: "避けたい表現",
        constraints: "制約/NG",
        deliverablesFormat: "納品形式",
        revisions: "修正回数",
        contact: "連絡先"
      },
      messages: {
        notReadyTitle: "未入力があります",
        readyTitle: "必要項目は入力済み",
        notReadyDetail: "必須項目を入力してから生成してください。",
        readyDetail: "送信前に権利、納品形式、修正回数、素材利用可否を確認してください。",
        recommended: "強く推奨：サイズ・仕様 / 参考素材 / 納品形式 / 修正回数 / 連絡先",
        initialJa: "入力後に生成してください",
        initialEn: "Generate after entering the required fields.",
        generateFirst: "先に出力を生成してください",
        fillRequired: "必須項目を入力してください",
        copied: "コピーしました",
        copyFailed: "コピーに失敗しました",
        downloaded: "TXTを保存しました"
      },
      placeholders: { missing: "(未記入)", dash: "—", notProvided: "未提供" },
      tierLabels: { short: "短い", standard: "標準", detailed: "詳細" },
      checkItems: ["納品形式", "修正回数", "商用利用範囲", "素材・フォント・画像の権利", "追加費用が発生する条件", "実績公開の可否"]
    },
    en: {
      titles: { full: "Design Request Brief", key: "Key Points" },
      sections: {
        summary: "Summary",
        deliverables: "Deliverables",
        specs: "Specs / Must-have items",
        timeline: "Timeline",
        budget: "Budget",
        references: "References / Assets",
        constraints: "Constraints / NG",
        format: "Deliverables format",
        revisions: "Revisions",
        contact: "Contact",
        assumptions: "Recommended items not provided",
        beforeSending: "Before sending",
        keyPoints: "Key points"
      },
      labels: {
        projectType: "Project type",
        purpose: "Purpose",
        deliverables: "Deliverables",
        size: "Size/Specs",
        deadline: "Deadline",
        budget: "Budget",
        references: "References/Assets",
        mustHave: "Must-have items",
        audience: "Target audience",
        tone: "Tone/Style",
        avoid: "Avoid",
        constraints: "Constraints/NG",
        deliverablesFormat: "Deliverables format",
        revisions: "Revisions",
        contact: "Contact"
      },
      messages: {
        notReadyTitle: "Required fields missing",
        readyTitle: "Required fields filled",
        notReadyDetail: "Complete the required fields before generating.",
        readyDetail: "Before sending, confirm rights, deliverable formats, revisions and asset usage permissions.",
        recommended: "Strongly recommended: size/specs / references / deliverables format / revisions / contact",
        initialJa: "入力後に生成してください",
        initialEn: "Generate after entering the required fields.",
        generateFirst: "Generate the output first",
        fillRequired: "Complete the required fields first",
        copied: "Copied",
        copyFailed: "Copy failed",
        downloaded: "TXT saved"
      },
      placeholders: { missing: "(missing)", dash: "—", notProvided: "Not provided" },
      tierLabels: { short: "Short", standard: "Standard", detailed: "Detailed" },
      checkItems: ["Deliverable format", "Revision rounds", "Commercial usage scope", "Rights for assets, fonts and images", "Conditions that trigger extra fees", "Portfolio/publication permission"]
    }
  };

  const REQUIRED_FIELDS = [
    { key: "projectType", warnId: "warnProjectType" },
    { key: "purpose", warnId: "warnPurpose" },
    { key: "deliverables", warnId: "warnDeliverables" },
    { key: "deadline", warnId: "warnDeadline" },
    { key: "budget", warnId: "warnBudget" }
  ];

  const OPTIONAL_FIELDS = [
    "size",
    "references",
    "deliverablesFormat",
    "revisions",
    "contact",
    "mustHave",
    "audience",
    "tone",
    "avoid",
    "constraints"
  ];

  const FIELD_KEYS = [
    "projectType",
    "purpose",
    "deliverables",
    "size",
    "deadline",
    "budget",
    "references",
    "mustHave",
    "audience",
    "tone",
    "avoid",
    "constraints",
    "deliverablesFormat",
    "revisions",
    "contact"
  ];

  const getLang = () => document.documentElement.lang === "en" ? "en" : "ja";
  const formatValue = (value, fallback) => value || fallback;
  const isRequired = (key) => REQUIRED_FIELDS.some((field) => field.key === key);
  const getFieldValue = (key, data, t) => formatValue(data[key], isRequired(key) ? t.placeholders.missing : t.placeholders.dash);
  const splitToLines = (value) => value.split(/\n+/).map((item) => item.trim()).filter(Boolean);

  const appendCheckItems = (lines, t) => {
    lines.push("");
    lines.push(`■ ${t.sections.beforeSending}`);
    t.checkItems.forEach((item) => lines.push(`- ${item}`));
  };

  const buildFullOutput = (lang, data, tier, optionalMissing) => {
    const t = TEXT[lang];
    const lines = [`${t.titles.full} [${t.tierLabels[tier]}]`, ""];

    const renderSection = (fields) => {
      if (tier === "short") {
        lines.push(fields.map((key) => `${t.labels[key]}: ${getFieldValue(key, data, t)}`).join(" / "));
        return;
      }
      if (tier === "standard") {
        fields.forEach((key) => lines.push(`${t.labels[key]}: ${getFieldValue(key, data, t)}`));
        return;
      }
      fields.forEach((key) => {
        lines.push(`${t.labels[key]}:`);
        const values = splitToLines(getFieldValue(key, data, t));
        values.forEach((item) => lines.push(`- ${item}`));
      });
    };

    lines.push(`■ ${t.sections.summary}`);
    renderSection(["projectType", "purpose", "audience", "tone"]);
    lines.push("", `■ ${t.sections.deliverables}`);
    renderSection(["deliverables"]);
    lines.push("", `■ ${t.sections.specs}`);
    renderSection(["size", "mustHave"]);
    lines.push("", `■ ${t.sections.timeline}`);
    renderSection(["deadline"]);
    lines.push("", `■ ${t.sections.budget}`);
    renderSection(["budget"]);
    lines.push("", `■ ${t.sections.references}`);
    renderSection(["references"]);
    lines.push("", `■ ${t.sections.constraints}`);
    renderSection(["avoid", "constraints"]);
    lines.push("", `■ ${t.sections.format}`);
    renderSection(["deliverablesFormat"]);
    lines.push("", `■ ${t.sections.revisions}`);
    renderSection(["revisions"]);
    lines.push("", `■ ${t.sections.contact}`);
    renderSection(["contact"]);

    if (optionalMissing.length > 0) {
      lines.push("", `■ ${t.sections.assumptions}`);
      optionalMissing.forEach((fieldKey) => {
        lines.push(`- ${t.labels[fieldKey]}: ${t.placeholders.notProvided}`);
      });
    }

    appendCheckItems(lines, t);
    return lines.join("\n");
  };

  const buildKeyPoints = (lang, data) => {
    const t = TEXT[lang];
    const lines = [
      t.titles.key,
      "",
      `■ ${t.sections.keyPoints}`,
      `- ${t.labels.projectType}: ${getFieldValue("projectType", data, t)}`,
      `- ${t.labels.purpose}: ${getFieldValue("purpose", data, t)}`,
      `- ${t.labels.deliverables}: ${getFieldValue("deliverables", data, t)}`,
      `- ${t.labels.deadline}: ${getFieldValue("deadline", data, t)}`,
      `- ${t.labels.budget}: ${getFieldValue("budget", data, t)}`,
      `- ${t.labels.references}: ${getFieldValue("references", data, t)}`,
      `- ${t.labels.deliverablesFormat}: ${getFieldValue("deliverablesFormat", data, t)}`,
      `- ${t.labels.revisions}: ${getFieldValue("revisions", data, t)}`,
      `- ${t.labels.contact}: ${getFieldValue("contact", data, t)}`
    ];
    appendCheckItems(lines, t);
    return lines.join("\n");
  };

  const initTool = () => {
    initLang();

    const byId = (id) => document.getElementById(id);
    const outputTier = byId("outputTier");
    const outputs = {
      jaFull: byId("outputJa"),
      jaKey: byId("outputJaKey"),
      enFull: byId("outputEn"),
      enKey: byId("outputEnKey")
    };
    const fields = Object.fromEntries(FIELD_KEYS.map((key) => [key, byId(key)]));
    const readyBanner = byId("readyBanner");
    const readyDetailJa = byId("readyDetailJa");
    const readyDetailEn = byId("readyDetailEn");
    const missingList = byId("missingList");
    const recommendedFields = byId("recommendedFields");
    const toast = byId("toast");
    let hasGenerated = false;

    const clearNode = (node) => {
      while (node.firstChild) node.removeChild(node.firstChild);
    };

    const showToast = (message) => {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("is-visible");
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
    };

    const getData = () => Object.fromEntries(FIELD_KEYS.map((key) => [key, fields[key].value.trim()]));
    const getMissingRequired = (data) => REQUIRED_FIELDS.filter((field) => !data[field.key]);
    const getOptionalMissing = (data) => OPTIONAL_FIELDS.filter((key) => !data[key]);

    const updateTierLabels = () => {
      const lang = getLang();
      outputTier.querySelectorAll("option").forEach((option) => {
        option.textContent = option.dataset[lang === "ja" ? "labelJa" : "labelEn"] || option.textContent;
      });
    };

    const updateWarnings = (missingRequired) => {
      const missingKeys = new Set(missingRequired.map((field) => field.key));
      REQUIRED_FIELDS.forEach((field) => {
        const warning = byId(field.warnId);
        if (warning) warning.classList.toggle("is-hidden", !missingKeys.has(field.key));
      });
    };

    const updateBanner = (missingRequired) => {
      const lang = getLang();
      const isReady = missingRequired.length === 0;
      const titleJa = readyBanner.querySelector(".status-title [data-i18n='ja']");
      const titleEn = readyBanner.querySelector(".status-title [data-i18n='en']");

      readyBanner.classList.toggle("ready", isReady);
      readyBanner.classList.toggle("not-ready", !isReady);
      titleJa.textContent = isReady ? TEXT.ja.messages.readyTitle : TEXT.ja.messages.notReadyTitle;
      titleEn.textContent = isReady ? TEXT.en.messages.readyTitle : TEXT.en.messages.notReadyTitle;
      readyDetailJa.textContent = isReady ? TEXT.ja.messages.readyDetail : TEXT.ja.messages.notReadyDetail;
      readyDetailEn.textContent = isReady ? TEXT.en.messages.readyDetail : TEXT.en.messages.notReadyDetail;
      recommendedFields.textContent = TEXT[lang].messages.recommended;

      clearNode(missingList);
      missingList.classList.toggle("is-hidden", isReady);
      if (!isReady) {
        missingRequired.forEach((field) => {
          const item = document.createElement("li");
          item.textContent = TEXT[lang].labels[field.key];
          missingList.appendChild(item);
        });
      }
    };

    const setInitialOutputs = () => {
      outputs.jaFull.textContent = TEXT.ja.messages.initialJa;
      outputs.jaKey.textContent = TEXT.ja.messages.initialJa;
      outputs.enFull.textContent = TEXT.en.messages.initialEn;
      outputs.enKey.textContent = TEXT.en.messages.initialEn;
    };

    const validate = () => {
      const data = getData();
      const missingRequired = getMissingRequired(data);
      updateWarnings(missingRequired);
      updateBanner(missingRequired);
      return { data, missingRequired, optionalMissing: getOptionalMissing(data) };
    };

    const render = () => {
      const { data, missingRequired, optionalMissing } = validate();
      updateTierLabels();
      if (missingRequired.length > 0) return false;

      const tier = outputTier.value;
      outputs.jaFull.textContent = buildFullOutput("ja", data, tier, optionalMissing);
      outputs.jaKey.textContent = buildKeyPoints("ja", data);
      outputs.enFull.textContent = buildFullOutput("en", data, tier, optionalMissing);
      outputs.enKey.textContent = buildKeyPoints("en", data);
      hasGenerated = true;
      return true;
    };

    const ensureGenerated = () => {
      const { missingRequired } = validate();
      const lang = getLang();
      if (missingRequired.length > 0) {
        showToast(TEXT[lang].messages.fillRequired);
        return false;
      }
      if (!hasGenerated) {
        showToast(TEXT[lang].messages.generateFirst);
        return false;
      }
      return true;
    };

    const copyOutput = async (node) => {
      if (!ensureGenerated()) return;
      const lang = getLang();
      const ok = await copyToClipboard(node.textContent.trim());
      showToast(ok ? TEXT[lang].messages.copied : TEXT[lang].messages.copyFailed);
    };

    const downloadOutput = (langKey, node) => {
      if (!ensureGenerated()) return;
      const lang = getLang();
      downloadText(`design-request-${langKey}-${outputTier.value}.txt`, node.textContent.trim());
      showToast(TEXT[lang].messages.downloaded);
    };

    byId("btnBuild").addEventListener("click", () => {
      const lang = getLang();
      if (!render()) showToast(TEXT[lang].messages.fillRequired);
    });

    [outputTier, ...Object.values(fields)].forEach((input) => {
      const rerender = debounce(() => {
        validate();
        if (hasGenerated) render();
      }, 150);
      input.addEventListener("input", rerender);
      input.addEventListener("change", rerender);
    });

    byId("btnCopyJaFull").addEventListener("click", () => copyOutput(outputs.jaFull));
    byId("btnCopyJaKey").addEventListener("click", () => copyOutput(outputs.jaKey));
    byId("btnCopyEnFull").addEventListener("click", () => copyOutput(outputs.enFull));
    byId("btnCopyEnKey").addEventListener("click", () => copyOutput(outputs.enKey));
    byId("btnDownloadJa").addEventListener("click", () => downloadOutput("ja", outputs.jaFull));
    byId("btnDownloadEn").addEventListener("click", () => downloadOutput("en", outputs.enFull));

    const langObserver = new MutationObserver(() => {
      updateTierLabels();
      validate();
      if (hasGenerated) render();
    });
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    setInitialOutputs();
    updateTierLabels();
    validate();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
