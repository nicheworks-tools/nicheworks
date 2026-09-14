(() => {
  "use strict";

  const state = {
    lang: "ja",
    hasGenerated: false,
    outputText: ""
  };

  const messages = {
    ja: {
      initial: "入力後に生成してください。未生成の内容はコピーできません。",
      copied: "コピーしました",
      copyFailed: "コピーに失敗しました",
      generateFirst: "先にキットを生成してください"
    },
    en: {
      initial: "Fill in the fields and generate a kit. Nothing can be copied before generation.",
      copied: "Copied",
      copyFailed: "Copy failed",
      generateFirst: "Generate the kit first"
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const all = (selector) => Array.from(document.querySelectorAll(selector));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    state.lang = lang === "en" ? "en" : "ja";
    all("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === state.lang ? "" : "none";
    });
    all(".nw-lang-switch button").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === state.lang);
    });
    document.documentElement.lang = state.lang;
    try { localStorage.setItem("nw_lang", state.lang); } catch (_) {}
    if (!state.hasGenerated) setInitialOutput();
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    all(".nw-lang-switch button").forEach((button) => {
      button.addEventListener("click", () => applyLang(button.dataset.lang));
    });
    applyLang(lang);
  };

  const getValue = (id, fallback) => {
    const el = document.getElementById(id);
    const value = el ? el.value.trim() : "";
    return value || fallback;
  };

  const getSelect = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
  };

  const toast = (text) => {
    let node = document.getElementById("toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "toast";
      node.className = "toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.appendChild(node);
    }
    node.textContent = text;
    node.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => node.classList.remove("show"), 1800);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        return document.execCommand("copy");
      } catch (_) {
        return false;
      } finally {
        textarea.remove();
      }
    }
  };

  const setInitialOutput = () => {
    const output = document.getElementById("kitOutput");
    if (output) output.textContent = messages[state.lang].initial;
  };

  const ctaTextJa = (type) => {
    const map = {
      reply: "返信で次回テーマや質問を送ってもらう",
      signup: "登録ページやウェイトリストへ案内する",
      share: "チーム内共有・SNS共有を促す",
      download: "資料・チェックリストのダウンロードへ案内する"
    };
    return map[type] || "返信で次回テーマや質問を送ってもらう";
  };

  const ctaTextEn = (type) => {
    const map = {
      reply: "Ask readers to reply with questions or next-topic requests",
      signup: "Send readers to a signup page or waitlist",
      share: "Encourage team or social sharing",
      download: "Send readers to a download such as a checklist or resource"
    };
    return map[type] || "Ask readers to reply with questions or next-topic requests";
  };

  const sponsorJa = (mode, theme, audience) => {
    if (mode === "none") return "";
    if (mode === "future") {
      return [
        "■ スポンサー/広告枠（将来検討）",
        `・${theme} に関心のある ${audience} 向けに、将来的な協賛枠を検討する。`,
        "・募集開始前に、掲載基準、広告/PR表記、料金、審査方法、問い合わせ窓口を整理する。"
      ].join("\n");
    }
    return [
      "■ スポンサー/広告枠（任意）",
      `・${theme} に関心のある ${audience} へ届けたいサービス/企業向けの協賛枠を検討中。`,
      "・掲載条件、料金、審査、広告/PR表記は未確定のため、配信前に必ず確認する。"
    ].join("\n");
  };

  const sponsorEn = (mode, theme, audience) => {
    if (mode === "none") return "";
    if (mode === "future") {
      return [
        "■ Sponsor / ad slot (future option)",
        `・Consider a future sponsorship slot for services that want to reach ${audience} interested in ${theme}.`,
        "・Before opening sponsorships, define placement criteria, ad/PR labeling, pricing, review rules, and contact flow."
      ].join("\n");
    }
    return [
      "■ Sponsor / ad slot (optional)",
      `・Considering a sponsorship slot for services or companies that want to reach ${audience} interested in ${theme}.`,
      "・Placement criteria, pricing, review, and ad/PR labeling are not finalized and must be checked before sending."
    ].join("\n");
  };

  const buildKit = () => {
    const theme = getValue("themeInput", "（テーマ未入力）");
    const audience = getValue("audienceInput", "（読者層未入力）");
    const frequency = getValue("frequencyInput", "（頻度未入力）");
    const purpose = getValue("purposeInput", "読者に役立つ情報を継続的に届ける");
    const issueTopic = getValue("issueTopicInput", theme);
    const readerProblem = getValue("readerProblemInput", "何から確認すればよいか分からない");
    const tone = getValue("toneInput", "落ち着いた実用寄り");
    const avoid = getValue("avoidInput", "過度な煽り、誤認誘導、断定的な広告表現");
    const ctaType = getSelect("ctaType");
    const sponsorMode = getSelect("sponsorMode");

    const jpSponsor = sponsorJa(sponsorMode, theme, audience);
    const enSponsor = sponsorEn(sponsorMode, theme, audience);

    const jp = [
      "【JP】",
      "■ 件名案",
      `1. ${issueTopic}：${audience}向けの要点整理`,
      `2. ${frequency}で読みたい ${theme} の実践メモ`,
      `3. ${readerProblem}人向け：今号のチェックリスト`,
      "",
      "■ 件名チェック",
      "・本文内容と一致しているか",
      "・誤認誘導や過度な煽りになっていないか",
      "・記号や大げさな表現を多用していないか",
      "・スポンサー/広告がある場合、件名や本文で誤解を生まないか",
      "",
      "■ 冒頭文",
      `${audience} が「${readerProblem}」と感じやすい場面に向けて、${tone} トーンで ${issueTopic} の要点を短く案内します。`,
      "",
      "■ 構成案",
      `1) 導入：${purpose}`,
      `2) 今号の主題：${issueTopic}`,
      `3) 読者の課題：${readerProblem}`,
      "4) 実践メモ：今日確認できる小さな手順",
      "5) 参考リンク・次号予告",
      "",
      "■ CTA",
      `・${ctaTextJa(ctaType)}`,
      "・CTAは1つに絞り、本文の内容と一致させる。",
      "",
      jpSponsor,
      jpSponsor ? "" : null,
      "■ フッター確認",
      "・配信停止リンク",
      "・送信者情報",
      "・プライバシーポリシー",
      "・問い合わせ先",
      "",
      "■ 配信前チェック",
      "・読者の配信同意を確認したか",
      "・件名と本文が一致しているか",
      "・広告/スポンサー表記が必要な場合に明記したか",
      "・避けたい表現を確認したか：" + avoid,
      "・テスト送信で表示崩れとリンクを確認したか"
    ].filter(Boolean).join("\n");

    const en = [
      "【EN】",
      "■ Subject ideas",
      `1. ${issueTopic}: key points for ${audience}`,
      `2. Practical ${theme} notes for a ${frequency} newsletter`,
      `3. A checklist for readers struggling with: ${readerProblem}`,
      "",
      "■ Subject line check",
      "・Does it match the actual content?",
      "・Does it avoid misleading or overly aggressive wording?",
      "・Does it avoid excessive symbols or exaggerated claims?",
      "・If sponsorship is included, does the subject/body avoid confusion?",
      "",
      "■ Opening note",
      `For ${audience} who often face “${readerProblem}”, introduce ${issueTopic} in a ${tone} tone.`,
      "",
      "■ Structure",
      `1) Opening: ${purpose}`,
      `2) Main topic: ${issueTopic}`,
      `3) Reader problem: ${readerProblem}`,
      "4) Practical note: one small action readers can take today",
      "5) Links and next issue preview",
      "",
      "■ CTA",
      `・${ctaTextEn(ctaType)}`,
      "・Keep the CTA focused and aligned with the issue content.",
      "",
      enSponsor,
      enSponsor ? "" : null,
      "■ Footer check",
      "・Unsubscribe link",
      "・Sender information",
      "・Privacy policy",
      "・Contact information",
      "",
      "■ Pre-send checklist",
      "・Confirm reader consent before sending",
      "・Check that the subject line matches the body",
      "・Add ad/sponsor labeling when needed",
      "・Review avoided expressions: " + avoid,
      "・Send a test email and check layout and links"
    ].filter(Boolean).join("\n");

    return `${jp}\n\n${en}`;
  };

  const generate = () => {
    const output = document.getElementById("kitOutput");
    if (!output) return;
    state.outputText = buildKit();
    state.hasGenerated = true;
    output.textContent = state.outputText;
  };

  const copyOutput = async () => {
    if (!state.hasGenerated || !state.outputText.trim()) {
      toast(messages[state.lang].generateFirst);
      return;
    }
    const ok = await copyToClipboard(state.outputText);
    toast(ok ? messages[state.lang].copied : messages[state.lang].copyFailed);
  };

  const initNewsletterKit = () => {
    const generateBtn = document.getElementById("generateBtn");
    const copyBtn = document.getElementById("copyBtn");
    if (generateBtn) generateBtn.addEventListener("click", generate);
    if (copyBtn) copyBtn.addEventListener("click", copyOutput);
    setInitialOutput();
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initNewsletterKit();
  });
})();
