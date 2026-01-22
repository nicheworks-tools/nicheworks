/* ================================
 * NicheWorks tool template app.js
 * - JP/EN toggle (data-i18n)
 * - Utilities: copy, downloadText, debounce
 * ================================ */

(() => {
  "use strict";

  // ----------------------------
  // i18n (required)
  // ----------------------------
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

  // ----------------------------
  // Utilities
  // ----------------------------
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback
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

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const debounce = (fn, ms = 150) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Expose minimal helpers for tool scripts (Codex can reuse)
  window.NW = {
    applyLang,
    copyToClipboard,
    downloadText,
    debounce,
    hasPro: () => {
      try { return !!localStorage.getItem("nw_pro_key"); } catch (_) { return false; }
    }
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    // Tool-specific init should be appended below by Codex per tool.
    // Example:
    // initTool();
  });
})();

(() => {
  "use strict";

  const TEXT = {
    ja: {
      titles: {
        full: "デザイン依頼文（送付用）",
        key: "要点まとめ"
      },
      sections: {
        summary: "Summary（概要）",
        deliverables: "Deliverables（納品物）",
        specs: "Specs（仕様）",
        timeline: "Timeline（スケジュール）",
        budget: "Budget（予算）",
        references: "References（参考）",
        constraints: "Constraints/NG（制約/NG）",
        format: "Deliverables format（納品形式）",
        revisions: "Revisions（修正）",
        contact: "Contact（連絡先）",
        assumptions: "Assumptions（未提供項目）",
        keyPoints: "Key points（要点）"
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
        readyTitle: "送信準備OK ✅",
        notReadyDetail: "必須項目を入力してください。",
        readyDetail: "必須項目はすべて入力済みです。"
      },
      placeholders: {
        missing: "(未記入)",
        dash: "—",
        notProvided: "未提供"
      },
      tierLabels: {
        short: "短い",
        standard: "標準",
        detailed: "詳細"
      }
    },
    en: {
      titles: {
        full: "Design Request Brief (Send-ready)",
        key: "Key Points"
      },
      sections: {
        summary: "Summary",
        deliverables: "Deliverables",
        specs: "Specs",
        timeline: "Timeline",
        budget: "Budget",
        references: "References",
        constraints: "Constraints/NG",
        format: "Deliverables format",
        revisions: "Revisions",
        contact: "Contact",
        assumptions: "Assumptions",
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
        notReadyTitle: "Not ready to send",
        readyTitle: "Ready to send ✅",
        notReadyDetail: "Please complete the required fields.",
        readyDetail: "All required fields are filled."
      },
      placeholders: {
        missing: "(missing)",
        dash: "—",
        notProvided: "Not provided"
      },
      tierLabels: {
        short: "Short",
        standard: "Standard",
        detailed: "Detailed"
      }
    }
  };

  const REQUIRED_FIELDS = [
    { key: "projectType", warnId: "warnProjectType" },
    { key: "deliverables", warnId: "warnDeliverables" },
    { key: "deadline", warnId: "warnDeadline" },
    { key: "budget", warnId: "warnBudget" },
    { key: "references", warnId: "warnReferences" }
  ];

  const OPTIONAL_FIELDS = [
    "purpose",
    "size",
    "mustHave",
    "audience",
    "tone",
    "avoid",
    "constraints",
    "deliverablesFormat",
    "revisions",
    "contact"
  ];

  const formatValue = (value, fallback) => (value ? value : fallback);

  const getFieldValue = (key, data, t) => {
    const isRequired = REQUIRED_FIELDS.some((field) => field.key === key);
    const fallback = isRequired ? t.placeholders.missing : t.placeholders.dash;
    return formatValue(data[key], fallback);
  };

  const splitToLines = (value) => {
    const parts = value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [value];
  };

  const buildFullOutput = (lang, data, tier, optionalMissing) => {
    const t = TEXT[lang];
    const lines = [];

    lines.push(`${t.titles.full} [${t.tierLabels[tier]}]`);
    lines.push("");

    const renderSection = (fields) => {
      if (tier === "short") {
        const compact = fields
          .map((key) => `${t.labels[key]}: ${getFieldValue(key, data, t)}`)
          .join(" / ");
        lines.push(compact);
        return;
      }

      if (tier === "standard") {
        fields.forEach((key) => {
          lines.push(`${t.labels[key]}: ${getFieldValue(key, data, t)}`);
        });
        return;
      }

      fields.forEach((key) => {
        lines.push(`${t.labels[key]}:`);
        splitToLines(getFieldValue(key, data, t)).forEach((item) => {
          lines.push(`- ${item}`);
        });
      });
    };

    lines.push(`■ ${t.sections.summary}`);
    renderSection(["projectType", "purpose", "audience", "tone"]);

    lines.push("");
    lines.push(`■ ${t.sections.deliverables}`);
    renderSection(["deliverables"]);

    lines.push("");
    lines.push(`■ ${t.sections.specs}`);
    renderSection(["size", "mustHave"]);

    lines.push("");
    lines.push(`■ ${t.sections.timeline}`);
    renderSection(["deadline"]);

    lines.push("");
    lines.push(`■ ${t.sections.budget}`);
    renderSection(["budget"]);

    lines.push("");
    lines.push(`■ ${t.sections.references}`);
    renderSection(["references"]);

    lines.push("");
    lines.push(`■ ${t.sections.constraints}`);
    renderSection(["avoid", "constraints"]);

    lines.push("");
    lines.push(`■ ${t.sections.format}`);
    renderSection(["deliverablesFormat"]);

    lines.push("");
    lines.push(`■ ${t.sections.revisions}`);
    renderSection(["revisions"]);

    lines.push("");
    lines.push(`■ ${t.sections.contact}`);
    renderSection(["contact"]);

    if (optionalMissing.length > 0) {
      lines.push("");
      lines.push(`■ ${t.sections.assumptions}`);
      optionalMissing.forEach((fieldKey) => {
        lines.push(`- ${t.labels[fieldKey]}: ${t.placeholders.notProvided}`);
      });
    }

    return lines.join("\n");
  };

  const buildKeyPoints = (lang, data) => {
    const t = TEXT[lang];
    return [
      `${t.titles.key}`,
      "",
      `■ ${t.sections.keyPoints}`,
      `- ${t.labels.projectType}: ${getFieldValue("projectType", data, t)}`,
      `- ${t.labels.deliverables}: ${getFieldValue("deliverables", data, t)}`,
      `- ${t.labels.deadline}: ${getFieldValue("deadline", data, t)}`,
      `- ${t.labels.budget}: ${getFieldValue("budget", data, t)}`,
      `- ${t.labels.references}: ${getFieldValue("references", data, t)}`,
      `- ${t.labels.contact}: ${getFieldValue("contact", data, t)}`
    ].join("\n");
  };

  const initTool = () => {
    const outputTier = document.getElementById("outputTier");
    const projectType = document.getElementById("projectType");
    const purpose = document.getElementById("purpose");
    const deliverables = document.getElementById("deliverables");
    const size = document.getElementById("size");
    const deadline = document.getElementById("deadline");
    const budget = document.getElementById("budget");
    const references = document.getElementById("references");
    const mustHave = document.getElementById("mustHave");
    const audience = document.getElementById("audience");
    const tone = document.getElementById("tone");
    const avoid = document.getElementById("avoid");
    const constraints = document.getElementById("constraints");
    const deliverablesFormat = document.getElementById("deliverablesFormat");
    const revisions = document.getElementById("revisions");
    const contact = document.getElementById("contact");
    const outputJa = document.getElementById("outputJa");
    const outputJaKey = document.getElementById("outputJaKey");
    const outputEn = document.getElementById("outputEn");
    const outputEnKey = document.getElementById("outputEnKey");
    const readyBanner = document.getElementById("readyBanner");
    const readyDetailJa = document.getElementById("readyDetailJa");
    const readyDetailEn = document.getElementById("readyDetailEn");
    const missingList = document.getElementById("missingList");
    const btnBuild = document.getElementById("btnBuild");
    const btnCopyJaFull = document.getElementById("btnCopyJaFull");
    const btnCopyJaKey = document.getElementById("btnCopyJaKey");
    const btnCopyEnFull = document.getElementById("btnCopyEnFull");
    const btnCopyEnKey = document.getElementById("btnCopyEnKey");
    const btnDownloadJa = document.getElementById("btnDownloadJa");
    const btnDownloadEn = document.getElementById("btnDownloadEn");

    const inputs = [
      outputTier,
      projectType,
      purpose,
      deliverables,
      size,
      deadline,
      budget,
      references,
      mustHave,
      audience,
      tone,
      avoid,
      constraints,
      deliverablesFormat,
      revisions,
      contact
    ];

    const updateTierLabels = () => {
      const lang = document.documentElement.lang || "ja";
      outputTier.querySelectorAll("option").forEach((option) => {
        const label = option.dataset[`label${lang === "ja" ? "Ja" : "En"}`];
        if (label) option.textContent = label;
      });
    };

    const getMissingRequired = (data) => {
      return REQUIRED_FIELDS.filter((field) => !data[field.key]);
    };

    const getOptionalMissing = (data) => {
      return OPTIONAL_FIELDS.filter((key) => !data[key]);
    };

    const updateWarnings = (missingRequired) => {
      const missingKeys = new Set(missingRequired.map((field) => field.key));
      REQUIRED_FIELDS.forEach((field) => {
        const warning = document.getElementById(field.warnId);
        if (!warning) return;
        warning.classList.toggle("is-hidden", !missingKeys.has(field.key));
      });
    };

    const updateBanner = (missingRequired) => {
      const titleJa = readyBanner.querySelector(".status-title [data-i18n='ja']");
      const titleEn = readyBanner.querySelector(".status-title [data-i18n='en']");
      const isReady = missingRequired.length === 0;

      readyBanner.classList.toggle("ready", isReady);
      readyBanner.classList.toggle("not-ready", !isReady);

      titleJa.textContent = isReady ? TEXT.ja.messages.readyTitle : TEXT.ja.messages.notReadyTitle;
      titleEn.textContent = isReady ? TEXT.en.messages.readyTitle : TEXT.en.messages.notReadyTitle;
      readyDetailJa.textContent = isReady ? TEXT.ja.messages.readyDetail : TEXT.ja.messages.notReadyDetail;
      readyDetailEn.textContent = isReady ? TEXT.en.messages.readyDetail : TEXT.en.messages.notReadyDetail;

      missingList.innerHTML = "";
      if (!isReady) {
        const lang = document.documentElement.lang || "ja";
        missingRequired.forEach((field) => {
          const item = document.createElement("li");
          item.textContent = TEXT[lang].labels[field.key];
          missingList.appendChild(item);
        });
        missingList.classList.remove("is-hidden");
      } else {
        missingList.classList.add("is-hidden");
      }
    };

    const render = () => {
      const data = {
        projectType: projectType.value.trim(),
        purpose: purpose.value.trim(),
        deliverables: deliverables.value.trim(),
        size: size.value.trim(),
        deadline: deadline.value.trim(),
        budget: budget.value.trim(),
        references: references.value.trim(),
        mustHave: mustHave.value.trim(),
        audience: audience.value.trim(),
        tone: tone.value.trim(),
        avoid: avoid.value.trim(),
        constraints: constraints.value.trim(),
        deliverablesFormat: deliverablesFormat.value.trim(),
        revisions: revisions.value.trim(),
        contact: contact.value.trim()
      };
      const tier = outputTier.value;
      const missingRequired = getMissingRequired(data);
      const optionalMissing = getOptionalMissing(data);

      updateTierLabels();
      updateWarnings(missingRequired);
      updateBanner(missingRequired);

      outputJa.textContent = buildFullOutput("ja", data, tier, optionalMissing);
      outputJaKey.textContent = buildKeyPoints("ja", data);
      outputEn.textContent = buildFullOutput("en", data, tier, optionalMissing);
      outputEnKey.textContent = buildKeyPoints("en", data);
    };

    const flashButton = (button, ok) => {
      if (!ok) return;
      button.classList.add("primary");
      setTimeout(() => button.classList.remove("primary"), 600);
    };

    btnBuild.addEventListener("click", render);
    inputs.forEach((input) => {
      input.addEventListener("input", window.NW.debounce(render, 150));
      if (input.tagName === "SELECT") {
        input.addEventListener("change", render);
      }
    });

    btnCopyJaFull.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(outputJa.textContent.trim());
      flashButton(btnCopyJaFull, ok);
    });
    btnCopyJaKey.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(outputJaKey.textContent.trim());
      flashButton(btnCopyJaKey, ok);
    });
    btnCopyEnFull.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(outputEn.textContent.trim());
      flashButton(btnCopyEnFull, ok);
    });
    btnCopyEnKey.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(outputEnKey.textContent.trim());
      flashButton(btnCopyEnKey, ok);
    });

    btnDownloadJa.addEventListener("click", () => {
      const tier = outputTier.value;
      window.NW.downloadText(`design-request-ja-${tier}.txt`, outputJa.textContent.trim());
    });
    btnDownloadEn.addEventListener("click", () => {
      const tier = outputTier.value;
      window.NW.downloadText(`design-request-en-${tier}.txt`, outputEn.textContent.trim());
    });

    const langObserver = new MutationObserver(() => render());
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    render();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
