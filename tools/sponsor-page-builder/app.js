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
    langButtons().forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("nw_lang", lang);
    } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}

    langButtons().forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });
    applyLang(lang);
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
        return document.execCommand("copy");
      } catch (e) {
        return false;
      } finally {
        ta.remove();
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

  window.NW = {
    applyLang,
    copyToClipboard,
    downloadText
  };

  let hasGenerated = false;

  const $ = (id) => document.getElementById(id);
  const getValue = (id) => ($(id)?.value || "").trim();

  const toBullets = (value) => value
    .split(/\n|,|、/)
    .map((item) => item.trim())
    .filter(Boolean);

  const fallback = (value, ja, en, lang) => value || (lang === "ja" ? ja : en);

  const showToast = (ja, en, isError = false) => {
    const toast = $("toast");
    if (!toast) return;
    const lang = document.documentElement.lang === "ja" ? "ja" : "en";
    toast.textContent = lang === "ja" ? ja : en;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  };

  const getCorporateText = (lang) => {
    const value = $("corpSupport")?.value || "no";
    if (lang === "ja") {
      if (value === "yes") return "法人スポンサー対応は可能です。ただし請求書、税務、契約条件、ロゴ利用条件は公開前に確認してください。";
      if (value === "consult") return "法人スポンサー対応は要相談です。請求書、税務、契約条件、ロゴ利用条件は個別確認が必要です。";
      return "法人スポンサー対応は現時点では明記しない想定です。対応する場合は請求書、税務、契約条件を別途確認してください。";
    }
    if (value === "yes") return "Corporate sponsorship is available. Invoices, tax handling, contract terms, and logo usage conditions should be checked before publishing.";
    if (value === "consult") return "Corporate sponsorship is available on request. Invoices, tax handling, contract terms, and logo usage conditions need separate confirmation.";
    return "Corporate sponsorship is not presented by default. If you add it later, check invoices, tax handling, and contract terms separately.";
  };

  const getLogoText = (lang) => {
    const value = $("logoPolicy")?.value || "no";
    if (lang === "ja") {
      if (value === "yes") return "ロゴ掲載は対応可能です。掲載場所、サイズ、期間、商標利用条件を事前に確認してください。";
      if (value === "consult") return "ロゴ掲載は要相談です。掲載条件と商標利用条件を個別確認してください。";
      return "ロゴ掲載は自動特典に含めません。必要な場合のみ、条件を確認して追記してください。";
    }
    if (value === "yes") return "Logo placement is available. Confirm placement, size, duration, and trademark usage conditions in advance.";
    if (value === "consult") return "Logo placement is available on request. Confirm placement and trademark usage conditions separately.";
    return "Logo placement is not included automatically. Add it only if you have confirmed the terms.";
  };

  const buildTiers = (lang, count) => {
    const names = ["Supporter", "Sponsor", "Partner", "Gold", "Platinum"];
    const prices = toBullets(getValue("priceInput"));
    const benefits = toBullets(getValue("offeredBenefits"));
    const defaultDesc = lang === "ja" ? "活動継続の支援" : "Support continued development";
    const priceMissing = lang === "ja" ? "価格は要調整" : "Price needs adjustment";
    const benefitMissing = lang === "ja"
      ? "特典は提供可能な範囲で要調整"
      : "Rewards need adjustment based on what you can provide";

    return names.slice(0, count).map((name, index) => {
      const price = prices[index] || priceMissing;
      const desc = benefits[index] || (index === 0 ? defaultDesc : benefitMissing);
      return `${index + 1}. ${name} - ${price} / ${desc}`;
    }).join("\n");
  };

  const buildChecklist = (lang) => {
    if (lang === "ja") {
      return [
        "- 価格と特典が実際に提供可能か確認",
        "- READMEロゴ掲載・優先サポート・共同施策を自動で約束していないか確認",
        "- 返金/キャンセル方針を確認",
        "- 法人支援の請求書・税務・契約条件を確認",
        "- GitHub Sponsors等のプラットフォーム規約を確認",
        "- 未公開ロードマップ、売上、支援者情報、限定URLを伏せる"
      ].join("\n");
    }

    return [
      "- Confirm that each price and reward is actually deliverable",
      "- Make sure logo placement, priority support, or collaborations are not promised automatically",
      "- Check refund and cancellation policy",
      "- Check invoices, taxes, and contract terms for corporate sponsors",
      "- Check GitHub Sponsors or other platform terms",
      "- Mask unpublished roadmaps, revenue, supporter details, and private URLs"
    ].join("\n");
  };

  const buildCopy = (lang) => {
    const projectName = fallback(getValue("projectName"), "プロジェクト名は要入力", "Project name needed", lang);
    const summary = fallback(getValue("summary"), "概要は要入力", "Summary needed", lang);
    const supporters = toBullets(getValue("supporters"));
    const whySupport = fallback(getValue("whySupport"), "支援が必要な理由は要入力", "Reason for support needed", lang);
    const fundUse = toBullets(getValue("fundUse"));
    const benefits = toBullets(getValue("offeredBenefits"));
    const cannotProvide = toBullets(getValue("cannotProvide"));
    const tierCount = Number($("tierCount")?.value || 3);
    const contact = fallback(getValue("contact"), "問い合わせ方法は要確認", "Contact method needs confirmation", lang);
    const refundPolicy = fallback(getValue("refundPolicy"), "返金/キャンセル方針は要確認", "Refund/cancellation policy needs confirmation", lang);

    if (lang === "ja") {
      return [
        "【プロジェクト概要】",
        `${projectName}`,
        summary,
        "",
        "【対象支援者】",
        supporters.length ? supporters.map((item) => `- ${item}`).join("\n") : "- 対象支援者は要入力",
        "",
        "【なぜ支援が必要か】",
        whySupport,
        "",
        "【支援金の用途】",
        fundUse.length ? fundUse.map((item) => `- ${item}`).join("\n") : "- 支援金の用途は要入力",
        "",
        "【支援ティア案】",
        "※価格と特典は草案です。公開前に必ず確認してください。",
        buildTiers("ja", tierCount),
        "",
        "【提供できる特典】",
        benefits.length ? benefits.map((item) => `- ${item}`).join("\n") : "- 提供できる特典は要入力",
        "",
        "【提供できないこと】",
        cannotProvide.length ? cannotProvide.map((item) => `- ${item}`).join("\n") : "- 個別開発の確約、即時サポート、成果保証などを約束しない場合は明記してください",
        "",
        "【法人支援について】",
        getCorporateText("ja"),
        getLogoText("ja"),
        "",
        "【返金・キャンセル方針】",
        refundPolicy,
        "",
        "【問い合わせ】",
        contact,
        "",
        "【FAQ】",
        "Q. 支援金は何に使われますか？",
        `A. ${fundUse.length ? fundUse.join("、") : "開発継続に必要な用途"} に使う予定です。`,
        "Q. 特典は必ず提供されますか？",
        "A. 記載した範囲で対応します。対応範囲外の個別依頼や成果保証は含めません。",
        "Q. 法人スポンサーは可能ですか？",
        `A. ${getCorporateText("ja")}`,
        "Q. キャンセルや返金はできますか？",
        `A. ${refundPolicy}`,
        "",
        "【公開前チェック】",
        buildChecklist("ja")
      ].join("\n");
    }

    return [
      "[Project Summary]",
      `${projectName}`,
      summary,
      "",
      "[Target Supporters]",
      supporters.length ? supporters.map((item) => `- ${item}`).join("\n") : "- Target supporters needed",
      "",
      "[Why support is needed]",
      whySupport,
      "",
      "[Use of Funds]",
      fundUse.length ? fundUse.map((item) => `- ${item}`).join("\n") : "- Use of funds needed",
      "",
      "[Sponsorship Tier Ideas]",
      "Note: Prices and rewards are drafts. Confirm them before publishing.",
      buildTiers("en", tierCount),
      "",
      "[Rewards you can provide]",
      benefits.length ? benefits.map((item) => `- ${item}`).join("\n") : "- Rewards need input",
      "",
      "[What is not included]",
      cannotProvide.length ? cannotProvide.map((item) => `- ${item}`).join("\n") : "- Add exclusions such as custom work, immediate support, or guaranteed outcomes if applicable",
      "",
      "[Corporate Sponsorship]",
      getCorporateText("en"),
      getLogoText("en"),
      "",
      "[Refund / Cancellation Policy]",
      refundPolicy,
      "",
      "[Contact]",
      contact,
      "",
      "[FAQ]",
      "Q. How will the funds be used?",
      `A. Funds are planned for: ${fundUse.length ? fundUse.join(", ") : "project maintenance and related work"}.`,
      "Q. Are rewards guaranteed?",
      "A. Rewards are provided only within the stated scope. Custom work or guaranteed outcomes are not included unless explicitly agreed.",
      "Q. Do you support corporate sponsors?",
      `A. ${getCorporateText("en")}`,
      "Q. Can sponsors cancel or request refunds?",
      `A. ${refundPolicy}`,
      "",
      "[Pre-publish Checklist]",
      buildChecklist("en")
    ].join("\n");
  };

  const initTool = () => {
    const outputJa = $("outputJa");
    const outputEn = $("outputEn");

    $("generateBtn")?.addEventListener("click", () => {
      outputJa.textContent = buildCopy("ja");
      outputEn.textContent = buildCopy("en");
      hasGenerated = true;
      showToast("生成しました。価格・特典は公開前に確認してください。", "Generated. Confirm prices and rewards before publishing.");
    });

    $("copyBtn")?.addEventListener("click", async () => {
      if (!hasGenerated) {
        showToast("先に生成してください。", "Generate copy first.", true);
        return;
      }
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      const ok = await window.NW.copyToClipboard(text);
      showToast(
        ok ? "コピーしました。" : "コピーに失敗しました。",
        ok ? "Copied." : "Copy failed.",
        !ok
      );
    });

    $("downloadBtn")?.addEventListener("click", () => {
      if (!hasGenerated) {
        showToast("先に生成してください。", "Generate copy first.", true);
        return;
      }
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      window.NW.downloadText(`sponsor-page-${lang}.txt`, text);
      showToast("テキストを保存しました。", "Text file downloaded.");
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTool();
  });
})();
