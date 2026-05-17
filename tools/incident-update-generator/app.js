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
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons().forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
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
      } catch (error) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const downloadText = (filename, text, type = "text/plain;charset=utf-8") => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const STATUS_MAP = {
    Investigating: { ja: "調査中", en: "Investigating" },
    Identified: { ja: "原因特定", en: "Identified" },
    Monitoring: { ja: "監視中", en: "Monitoring" },
    Resolved: { ja: "解消済み", en: "Resolved" },
  };

  const TITLE_MAP = {
    customer: { ja: "顧客向け", en: "Customer" },
    internal: { ja: "社内向け", en: "Internal" },
    social: { ja: "SNS向け", en: "Social" },
  };

  const TONE_MAP = {
    short: { ja: "短文", en: "Short" },
    standard: { ja: "標準", en: "Standard" },
    polite: { ja: "丁寧", en: "Polite" },
  };

  const LABELS = {
    ja: {
      status: "現在ステータス",
      start: "発生時刻",
      impact: "影響範囲",
      components: "影響コンポーネント",
      actions: "実施対応",
      nextUpdate: "次回更新予定",
      recoveryTime: "復旧時刻",
      duration: "影響期間",
      cause: "原因概要",
      followUp: "再発防止/事後報告予定",
      unconfirmed: "未確認",
    },
    en: {
      status: "Current status",
      start: "Start time",
      impact: "Impact",
      components: "Affected components",
      actions: "Actions taken",
      nextUpdate: "Next update",
      recoveryTime: "Recovery time",
      duration: "Impact duration",
      cause: "Cause summary",
      followUp: "Prevention / follow-up plan",
      unconfirmed: "Unconfirmed",
    },
  };

  const MESSAGES = {
    ja: {
      initial: "入力後に生成してください。",
      dirty: "入力内容が変更されました。再度生成してください。",
      required: "必須項目を入力してください: ",
      generated: "更新文を生成しました。",
      copySuccess: "コピーしました。",
      copyFail: "コピーに失敗しました。手動で選択してコピーしてください。",
      blocked: "先に更新文を生成してください。",
      saved: "TXTを保存しました。",
      proBlocked: "Pro限定機能です。購入後にこのブラウザでNicheWorks Proを有効化してください。",
      markdownCopied: "Markdownパックをコピーしました。",
      markdownSaved: "Markdownパックを保存しました。",
      requiredNames: {
        service: "サービス名",
        status: "現在ステータス",
        impact: "影響範囲",
        nextUpdate: "次回更新予定",
      },
    },
    en: {
      initial: "Enter the required fields, then generate updates.",
      dirty: "The input has changed. Generate the updates again.",
      required: "Enter required fields: ",
      generated: "Incident updates generated.",
      copySuccess: "Copied.",
      copyFail: "Copy failed. Select the text and copy it manually.",
      blocked: "Generate the updates first.",
      saved: "TXT saved.",
      proBlocked: "This is a Pro feature. Purchase and activate NicheWorks Pro in this browser.",
      markdownCopied: "Markdown pack copied.",
      markdownSaved: "Markdown pack saved.",
      requiredNames: {
        service: "Service name",
        status: "Current status",
        impact: "Impact",
        nextUpdate: "Next update",
      },
    },
  };

  const byId = (id) => document.getElementById(id);
  const getLang = () => document.documentElement.lang === "en" ? "en" : "ja";
  const getValue = (id) => {
    const element = byId(id);
    return element ? element.value.trim() : "";
  };

  let hasGenerated = false;
  let currentOutputs = { customer: { ja: "", en: "" }, internal: { ja: "", en: "" }, social: { ja: "", en: "" } };
  let toastTimer = null;

  const outputNodes = () => ({
    customer: { ja: byId("outputCustomerJa"), en: byId("outputCustomerEn") },
    internal: { ja: byId("outputInternalJa"), en: byId("outputInternalEn") },
    social: { ja: byId("outputSocialJa"), en: byId("outputSocialEn") },
  });

  const showToast = (message) => {
    const toast = byId("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  };

  const setError = (message) => {
    const error = byId("formError");
    if (!error) return;
    error.textContent = message || "";
    error.classList.toggle("show", Boolean(message));
  };

  const getFormData = () => ({
    service: getValue("service"),
    statusKey: getValue("status") || "Investigating",
    tone: getValue("tone") || "standard",
    start: getValue("startTime"),
    impact: getValue("impact"),
    components: getValue("components"),
    mitigation: getValue("mitigation"),
    nextUpdate: getValue("nextUpdate"),
    recoveryTime: getValue("recoveryTime"),
    duration: getValue("duration"),
    causeSummary: getValue("causeSummary"),
    followUpPlan: getValue("followUpPlan"),
    includeUnknown: Boolean(byId("includeUnknown") && byId("includeUnknown").checked),
  });

  const validate = (data, lang) => {
    const missing = [];
    if (!data.service) missing.push(MESSAGES[lang].requiredNames.service);
    if (!data.statusKey) missing.push(MESSAGES[lang].requiredNames.status);
    if (!data.impact) missing.push(MESSAGES[lang].requiredNames.impact);
    if (!data.nextUpdate) missing.push(MESSAGES[lang].requiredNames.nextUpdate);
    return missing;
  };

  const addDetail = (lines, label, value, includeUnknown, unconfirmed) => {
    if (value) {
      lines.push(`${label}: ${value}`);
    } else if (includeUnknown) {
      lines.push(`${label}: ${unconfirmed}`);
    }
  };

  const buildSummary = ({ lang, audience, tone, statusKey, data, status }) => {
    const politeJa = tone === "polite";
    const isShort = tone === "short";

    if (lang === "ja") {
      if (audience === "internal") {
        const base = `${data.service}でインシデントが発生しています。現在ステータスは${status}です。`;
        return isShort ? `${data.service}でインシデント。現在${status}。` : base;
      }
      if (audience === "social") {
        const suffix = statusKey === "Resolved" ? "復旧しました。" : `現在${status}です。`;
        return politeJa
          ? `${data.service}で発生していた障害について、${suffix}`
          : `${data.service}の障害について、${suffix}`;
      }
      if (statusKey === "Resolved") {
        return politeJa
          ? `${data.service}で発生していた障害は解消しております。ご不便をおかけし申し訳ございません。`
          : `${data.service}で発生していた障害は解消しました。ご不便をおかけしました。`;
      }
      return politeJa
        ? `${data.service}で障害が発生しております。現在${status}です。`
        : `${data.service}で障害が発生しています。現在${status}です。`;
    }

    if (audience === "internal") {
      return isShort
        ? `${data.service} incident. Status: ${status}.`
        : `Incident affecting ${data.service}. Current status: ${status}.`;
    }
    if (audience === "social") {
      return statusKey === "Resolved"
        ? `The incident affecting ${data.service} has been resolved.`
        : `We are working on an incident affecting ${data.service}. Current status: ${status}.`;
    }
    return statusKey === "Resolved"
      ? `The incident affecting ${data.service} has been resolved. We apologize for the inconvenience.`
      : `We are experiencing an incident affecting ${data.service}. Current status: ${status}.`;
  };

  const buildStatusNote = (lang, statusKey, data) => {
    if (lang === "ja") {
      if (statusKey === "Investigating") return "現時点では原因を調査中です。確認できた情報から順次更新します。";
      if (statusKey === "Identified") return data.causeSummary ? "原因候補を確認しており、影響範囲と復旧手順を慎重に確認しています。" : "原因候補を確認中です。断定できる範囲の情報のみ共有してください。";
      if (statusKey === "Monitoring") return "復旧対応後、再発有無とサービス状態を監視しています。";
      if (statusKey === "Resolved") return "復旧済みです。必要に応じて原因、影響期間、再発防止策を追記してください。";
    }
    if (statusKey === "Investigating") return "We are investigating the cause and will share confirmed updates as they become available.";
    if (statusKey === "Identified") return data.causeSummary ? "A likely cause has been identified, and we are carefully validating the impact and recovery steps." : "A likely cause is being reviewed. Share only what has been confirmed.";
    if (statusKey === "Monitoring") return "Mitigation has been applied, and we are monitoring for recurrence and service stability.";
    if (statusKey === "Resolved") return "The incident is resolved. Add cause, duration, and prevention details if they are ready to publish.";
    return "";
  };

  const buildCheck = (lang, audience) => {
    if (lang === "ja") {
      if (audience === "internal") {
        return [
          "社外共有前チェック:",
          "- 顧客名・個人情報・内部URLを含めていないか",
          "- 原因や補償を断定しすぎていないか",
          "- SLA/返金/法的責任に触れていないか",
          "- 社外公開前に責任者・法務・広報・セキュリティ担当へ確認したか",
        ].join("\n");
      }
      const title = audience === "social" ? "SNS投稿前チェック:" : "公開前チェック:";
      return [
        title,
        "- 顧客名・個人情報・内部URLを含めていないか",
        "- 原因や補償を断定しすぎていないか",
        "- SLA/返金/法的責任に触れていないか",
        "- 次回更新時刻が現実的か",
      ].join("\n");
    }

    if (audience === "internal") {
      return [
        "Before external sharing:",
        "- No customer names, personal data, or internal URLs are included",
        "- Cause or compensation is not overstated",
        "- SLA, refund, or legal responsibility language is not included",
        "- The owner, legal, PR, and security teams have reviewed it before external publication",
      ].join("\n");
    }
    const title = audience === "social" ? "Pre-posting check:" : "Pre-publication check:";
    return [
      title,
      "- No customer names, personal data, or internal URLs are included",
      "- Cause or compensation is not overstated",
      "- SLA, refund, or legal responsibility language is not included",
      "- The next update time is realistic",
    ].join("\n");
  };

  const buildMessage = ({ lang, audience, data }) => {
    const status = STATUS_MAP[data.statusKey] ? STATUS_MAP[data.statusKey][lang] : data.statusKey;
    const labels = LABELS[lang];
    const header = lang === "ja"
      ? `【${TITLE_MAP[audience].ja} / ${TONE_MAP[data.tone].ja} / ${status}】`
      : `[${TITLE_MAP[audience].en} / ${TONE_MAP[data.tone].en} / ${status}]`;

    const lines = [
      header,
      buildSummary({ lang, audience, tone: data.tone, statusKey: data.statusKey, data, status }),
      "",
      `${labels.status}: ${status}`,
      `${labels.impact}: ${data.impact}`,
      `${labels.nextUpdate}: ${data.nextUpdate}`,
    ];

    addDetail(lines, labels.start, data.start, data.includeUnknown, labels.unconfirmed);
    addDetail(lines, labels.components, data.components, data.includeUnknown, labels.unconfirmed);
    addDetail(lines, labels.actions, data.mitigation, data.includeUnknown, labels.unconfirmed);

    if (data.statusKey === "Resolved" || data.recoveryTime || data.duration || data.causeSummary || data.followUpPlan || data.includeUnknown) {
      addDetail(lines, labels.recoveryTime, data.recoveryTime, data.includeUnknown, labels.unconfirmed);
      addDetail(lines, labels.duration, data.duration, data.includeUnknown, labels.unconfirmed);
      addDetail(lines, labels.cause, data.causeSummary, data.includeUnknown, labels.unconfirmed);
      addDetail(lines, labels.followUp, data.followUpPlan, data.includeUnknown, labels.unconfirmed);
    }

    lines.push("", buildStatusNote(lang, data.statusKey, data), "", buildCheck(lang, audience));
    return lines.join("\n");
  };

  const isProActive = () => document.documentElement.dataset.proActive === "true";

  const updateProButtonState = () => {
    document.querySelectorAll("[data-pro-only]").forEach((button) => {
      button.disabled = !hasGenerated || !isProActive();
    });
  };

  const setGeneratedState = (generated) => {
    hasGenerated = generated;
    byId("downloadBtn").disabled = !generated;
    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.disabled = !generated;
    });
    updateProButtonState();
  };

  const writeOutputs = (outputs) => {
    const nodes = outputNodes();
    ["customer", "internal", "social"].forEach((audience) => {
      nodes[audience].ja.textContent = outputs[audience].ja;
      nodes[audience].en.textContent = outputs[audience].en;
    });
  };

  const resetOutputs = (messageKey) => {
    const messages = MESSAGES;
    currentOutputs = {
      customer: { ja: messages.ja[messageKey], en: messages.en[messageKey] },
      internal: { ja: messages.ja[messageKey], en: messages.en[messageKey] },
      social: { ja: messages.ja[messageKey], en: messages.en[messageKey] },
    };
    writeOutputs(currentOutputs);
    setGeneratedState(false);
  };

  const updateAudienceFocus = () => {
    const selected = getValue("audience") || "customer";
    document.querySelectorAll(".output-card").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.audience === selected);
    });
  };

  const generateAll = () => {
    const lang = getLang();
    const data = getFormData();
    const missing = validate(data, lang);
    if (missing.length > 0) {
      const message = `${MESSAGES[lang].required}${missing.join(" / ")}`;
      setError(message);
      showToast(message);
      setGeneratedState(false);
      return;
    }

    setError("");
    currentOutputs = { customer: {}, internal: {}, social: {} };
    ["customer", "internal", "social"].forEach((audience) => {
      currentOutputs[audience].ja = buildMessage({ lang: "ja", audience, data });
      currentOutputs[audience].en = buildMessage({ lang: "en", audience, data });
    });
    writeOutputs(currentOutputs);
    setGeneratedState(true);
    updateAudienceFocus();
    showToast(MESSAGES[lang].generated);
  };

  const formatDate = () => {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  const buildMarkdownPack = () => {
    const data = getFormData();
    const title = data.service ? `Incident Update Pack - ${data.service}` : "Incident Update Pack";
    const sections = [
      `# ${title}`,
      "",
      `- Status: ${STATUS_MAP[data.statusKey]?.en || data.statusKey}`,
      `- Generated: ${new Date().toISOString()}`,
      "",
    ];

    ["customer", "internal", "social"].forEach((audience) => {
      sections.push(`## ${TITLE_MAP[audience].en} / ${TITLE_MAP[audience].ja}`, "", "### English", "", currentOutputs[audience].en || "", "", "### 日本語", "", currentOutputs[audience].ja || "", "");
    });

    return sections.join("\n");
  };

  const requireProAndGenerated = () => {
    const lang = getLang();
    if (!isProActive()) {
      showToast(MESSAGES[lang].proBlocked);
      return false;
    }
    if (!hasGenerated) {
      showToast(MESSAGES[lang].blocked);
      return false;
    }
    return true;
  };

  const initTool = () => {
    resetOutputs("initial");
    updateAudienceFocus();

    byId("generateBtn").addEventListener("click", generateAll);
    byId("audience").addEventListener("change", updateAudienceFocus);

    document.querySelectorAll(".js-input").forEach((element) => {
      element.addEventListener("input", () => {
        setError("");
        if (hasGenerated) resetOutputs("dirty");
      });
      element.addEventListener("change", () => {
        setError("");
        if (hasGenerated) resetOutputs("dirty");
      });
    });

    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", async () => {
        const lang = getLang();
        if (!hasGenerated) {
          showToast(MESSAGES[lang].blocked);
          return;
        }
        const audience = button.dataset.copy;
        const text = currentOutputs[audience][lang];
        const ok = await copyToClipboard(text);
        showToast(ok ? MESSAGES[lang].copySuccess : MESSAGES[lang].copyFail);
      });
    });

    byId("downloadBtn").addEventListener("click", () => {
      const lang = getLang();
      if (!hasGenerated) {
        showToast(MESSAGES[lang].blocked);
        return;
      }
      const audience = getValue("audience") || "customer";
      const text = currentOutputs[audience][lang];
      downloadText(`incident-update-${audience}-${lang}-${formatDate()}.txt`, text);
      showToast(MESSAGES[lang].saved);
    });

    const copyMarkdownBtn = byId("copyMarkdownBtn");
    if (copyMarkdownBtn) {
      copyMarkdownBtn.addEventListener("click", async () => {
        const lang = getLang();
        if (!requireProAndGenerated()) return;
        const ok = await copyToClipboard(buildMarkdownPack());
        showToast(ok ? MESSAGES[lang].markdownCopied : MESSAGES[lang].copyFail);
      });
    }

    const saveMarkdownBtn = byId("saveMarkdownBtn");
    if (saveMarkdownBtn) {
      saveMarkdownBtn.addEventListener("click", () => {
        const lang = getLang();
        if (!requireProAndGenerated()) return;
        downloadText(`incident-update-pack-${lang}-${formatDate()}.md`, buildMarkdownPack(), "text/markdown;charset=utf-8");
        showToast(MESSAGES[lang].markdownSaved);
      });
    }

    document.addEventListener("nw-pro-status-change", updateProButtonState);
    updateProButtonState();
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTool();
  });
})();
