(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  let generated = false;

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function applyLang(lang) {
    const safeLang = lang === "en" ? "en" : "ja";
    $$('[data-i18n]').forEach((element) => {
      element.style.display = element.dataset.i18n === safeLang ? "" : "none";
    });
    $$(".nw-lang-switch button").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === safeLang);
    });
    document.documentElement.lang = safeLang;
    try { localStorage.setItem("nw_lang", safeLang); } catch (_) {}
  }

  function value(id, fallback) {
    const text = ($(id)?.value || "").trim();
    return text || fallback;
  }

  function toast(message) {
    const element = $("toast");
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { element.hidden = true; }, 2200);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    textarea.remove();
    return ok;
  }

  function readInputs() {
    return {
      topic: value("topicInput", "未入力 / Not provided"),
      audience: value("audienceInput", "未入力 / Not provided"),
      deliverables: value("deliverablesInput", "未入力 / Not provided"),
      frequency: value("frequencyInput", "未入力 / Not provided"),
      availableTime: value("timeInput", "未入力 / Not provided"),
      price: value("priceInput", "要検討 / To be decided"),
      planCount: value("planCountInput", "要検討 / To be decided"),
      notIncluded: value("notIncludedInput", "未入力 / Not provided"),
      cancelRefund: value("cancelRefundInput", "未入力 / Not provided"),
      firstMonth: value("firstMonthInput", "未入力 / Not provided"),
      retention: value("retentionInput", "未入力 / Not provided"),
      community: value("communityInput", "未入力 / Not provided"),
      workloadLimit: value("workloadLimitInput", "未入力 / Not provided"),
    };
  }

  function buildOffer() {
    const data = readInputs();

    const ja = [
      "# メンバーシップ提案案",
      "",
      "## 提案概要",
      `${data.topic}をテーマに、${data.audience}向けのメンバーシップとして検討します。`,
      "",
      "## 対象メンバー",
      data.audience,
      "",
      "## 提供内容",
      data.deliverables,
      "",
      "## 提供頻度",
      data.frequency,
      "",
      "## 確保できる運営時間",
      data.availableTime,
      "",
      "## 価格案",
      data.price,
      "",
      "## プラン構成",
      data.planCount,
      "",
      "## 提供しないこと",
      data.notIncluded,
      "",
      "## 解約・返金条件",
      data.cancelRefund,
      "",
      "## 初月オンボーディング / 特典",
      data.firstMonth,
      "",
      "## 継続施策",
      data.retention,
      "",
      "## コミュニティ",
      data.community,
      "",
      "## 運営負荷の上限",
      data.workloadLimit,
      "",
      "## 公開前チェック",
      "- 価格案は市場・工数・手数料・税金を踏まえて再確認する",
      "- 継続課金、解約、返金条件を販売ページと利用規約で明示する",
      "- 特商法表示など必要な販売者情報を確認する",
      "- 決済サービスとプラットフォームの規約を確認する",
      "- コミュニティを運営する場合は参加ルール、禁止事項、モデレーション、退会対応を決める",
      "- 運営時間と提供頻度が継続可能か確認する",
      "",
      "※この出力は企画のたたき台です。価格適合性、需要、継続率、法令・税務・規約適合を保証しません。",
    ].join("\n");

    const en = [
      "# Membership Offer Draft",
      "",
      "## Offer overview",
      `Draft a membership around ${data.topic} for ${data.audience}.`,
      "",
      "## Target members",
      data.audience,
      "",
      "## Deliverables",
      data.deliverables,
      "",
      "## Delivery frequency",
      data.frequency,
      "",
      "## Available operating time",
      data.availableTime,
      "",
      "## Pricing candidate",
      data.price,
      "",
      "## Plan structure",
      data.planCount,
      "",
      "## Not included",
      data.notIncluded,
      "",
      "## Cancellation / refund terms",
      data.cancelRefund,
      "",
      "## First-month onboarding / bonus",
      data.firstMonth,
      "",
      "## Retention ideas",
      data.retention,
      "",
      "## Community",
      data.community,
      "",
      "## Workload limit",
      data.workloadLimit,
      "",
      "## Pre-launch review",
      "- Recheck pricing against workload, fees, taxes, and market assumptions.",
      "- State recurring billing, cancellation, and refund terms on the sales page and in the terms.",
      "- Confirm required seller/legal disclosures.",
      "- Review payment-provider and platform rules.",
      "- If a community is included, define participation rules, prohibited behavior, moderation, and exit handling.",
      "- Confirm that the promised frequency is sustainable within the available operating time.",
      "",
      "This is a planning draft, not validation of demand, pricing fit, retention, legal/tax compliance, or platform compliance.",
    ].join("\n");

    return `${ja}\n\n---\n\n${en}`;
  }

  function init() {
    let lang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}

    $$(".nw-lang-switch button").forEach((button) => {
      button.addEventListener("click", () => applyLang(button.dataset.lang));
    });
    applyLang(lang);

    const output = $("offerOutput");
    output.value = currentLang() === "ja"
      ? "入力後に「提案を作成」を押してください。"
      : "Fill in the fields, then click Build offer.";

    $("buildOfferBtn")?.addEventListener("click", () => {
      output.value = buildOffer();
      generated = true;
    });

    $("copyOfferBtn")?.addEventListener("click", async () => {
      if (!generated) {
        toast(currentLang() === "ja" ? "先に提案を生成してください。" : "Build an offer first.");
        return;
      }
      const ok = await copyText(output.value);
      toast(ok
        ? (currentLang() === "ja" ? "コピーしました。" : "Copied.")
        : (currentLang() === "ja" ? "コピーに失敗しました。" : "Copy failed."));
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
