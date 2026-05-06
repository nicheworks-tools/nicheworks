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
    try {
      localStorage.setItem("nw_lang", lang);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("nw:lang", { detail: { lang } }));
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
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
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

  window.NW = {
    applyLang,
    copyToClipboard,
    downloadText,
    hasPro: () => {
      try {
        return Boolean(localStorage.getItem("nw_pro_key"));
      } catch (_) {
        return false;
      }
    }
  };

  document.addEventListener("DOMContentLoaded", initLang);
})();

const initMembershipOffer = () => {
  const root = document.getElementById("toolRoot");
  const output = document.getElementById("offerOutput");
  const buildButton = document.getElementById("buildOfferBtn");
  const copyButton = document.getElementById("copyOfferBtn");
  const toast = document.getElementById("toast");

  if (!root || !output || !buildButton || !copyButton) return;

  let hasGenerated = false;
  let toastTimer = null;

  const currentLang = () => document.documentElement.lang === "en" ? "en" : "ja";

  const text = {
    initial: {
      ja: "入力後に「提案を作成」を押してください。",
      en: "Fill in the fields, then click “Build offer”."
    },
    copyFirst: {
      ja: "先に提案を生成してください。",
      en: "Build an offer before copying."
    },
    copied: {
      ja: "コピーしました。",
      en: "Copied."
    },
    copyFailed: {
      ja: "コピーに失敗しました。",
      en: "Copy failed."
    },
    notProvided: {
      ja: "未入力",
      en: "Not provided"
    },
    undecidedPrice: {
      ja: "価格は要検討",
      en: "Pricing to be decided"
    }
  };

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  };

  const valueOf = (id, fallback) => {
    const element = document.getElementById(id);
    const value = element ? element.value.trim() : "";
    return value || fallback;
  };

  const getInputs = () => {
    const lang = currentLang();
    const missing = text.notProvided[lang];
    return {
      topic: valueOf("topicInput", missing),
      audience: valueOf("audienceInput", missing),
      deliverables: valueOf("deliverablesInput", missing),
      frequency: valueOf("frequencyInput", missing),
      time: valueOf("timeInput", missing),
      price: valueOf("priceInput", text.undecidedPrice[lang]),
      planCount: valueOf("planCountInput", missing),
      notIncluded: valueOf("notIncludedInput", missing),
      cancelRefund: valueOf("cancelRefundInput", missing),
      firstMonth: valueOf("firstMonthInput", missing),
      retention: valueOf("retentionInput", missing),
      community: valueOf("communityInput", missing),
      workloadLimit: valueOf("workloadLimitInput", missing)
    };
  };

  const buildJapanese = (input) => [
    "# メンバーシップ提案案",
    "",
    "■ 提案概要",
    `${input.topic}をテーマに、${input.audience}向けのメンバーシップとして設計します。主な提供内容は ${input.deliverables} です。`,
    "",
    "■ 対象メンバー",
    input.audience,
    "",
    "■ 提供内容",
    input.deliverables,
    "",
    "■ 提供頻度",
    input.frequency,
    "",
    "■ 価格案（たたき台）",
    `- 入力価格: ${input.price}`,
    "- 調整観点: 提供工数、競合価格、決済手数料、継続率、返金対応",
    "",
    "■ プラン構成",
    input.planCount,
    "",
    "■ 初月オンボーディング",
    input.firstMonth,
    "",
    "■ 継続施策",
    input.retention,
    "",
    "■ コミュニティ設計",
    input.community,
    "",
    "■ 提供しないこと",
    input.notIncluded,
    "",
    "■ 解約/返金条件",
    input.cancelRefund,
    "",
    "■ 運営負荷メモ",
    `確保できる時間: ${input.time}`,
    `運営負荷上限: ${input.workloadLimit}`,
    "",
    "■ 公開前チェック",
    "- 提供頻度を継続できるか",
    "- 解約条件が明確か",
    "- 返金条件が明確か",
    "- 特商法表示が必要な場合に用意されているか",
    "- 決済サービスの手数料と規約を確認したか",
    "- プラットフォーム規約に違反していないか"
  ].join("\n");

  const buildEnglish = (input) => [
    "# Membership offer draft",
    "",
    "■ Offer summary",
    `Design a membership about ${input.topic} for ${input.audience}. The main member benefits are ${input.deliverables}.`,
    "",
    "■ Target members",
    input.audience,
    "",
    "■ What members receive",
    input.deliverables,
    "",
    "■ Delivery frequency",
    input.frequency,
    "",
    "■ Pricing draft",
    `- Input price: ${input.price}`,
    "- Adjustment points: workload, competitor pricing, payment fees, retention rate, refund handling",
    "",
    "■ Plan structure",
    input.planCount,
    "",
    "■ First-month onboarding",
    input.firstMonth,
    "",
    "■ Retention actions",
    input.retention,
    "",
    "■ Community setup",
    input.community,
    "",
    "■ Not included",
    input.notIncluded,
    "",
    "■ Cancellation / refund terms",
    input.cancelRefund,
    "",
    "■ Workload note",
    `Time available: ${input.time}`,
    `Workload limit: ${input.workloadLimit}`,
    "",
    "■ Pre-launch checklist",
    "- Can you keep the promised delivery frequency?",
    "- Are cancellation terms clear?",
    "- Are refund terms clear?",
    "- Have you prepared required seller/legal notices where applicable?",
    "- Have you checked payment fees and service terms?",
    "- Does the offer comply with the platform rules?"
  ].join("\n");

  const renderOffer = () => {
    const input = getInputs();
    output.value = `${buildJapanese(input)}\n\n---\n\n${buildEnglish(input)}`;
    hasGenerated = true;
  };

  const copyOffer = async () => {
    const lang = currentLang();
    if (!hasGenerated || !output.value.trim()) {
      showToast(text.copyFirst[lang]);
      return;
    }
    const ok = await window.NW.copyToClipboard(output.value);
    showToast(ok ? text.copied[lang] : text.copyFailed[lang]);
  };

  const setInitialMessage = () => {
    if (hasGenerated) return;
    output.value = text.initial[currentLang()];
  };

  buildButton.addEventListener("click", renderOffer);
  copyButton.addEventListener("click", copyOffer);
  window.addEventListener("nw:lang", setInitialMessage);

  setInitialMessage();
};

document.addEventListener("DOMContentLoaded", initMembershipOffer);
