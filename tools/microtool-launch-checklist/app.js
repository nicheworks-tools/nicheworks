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

  const showToast = (message) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
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
      } catch (_) {
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
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const getCurrentLang = () => document.documentElement.lang === "en" ? "en" : "ja";

  const messages = {
    needGenerate: {
      ja: "先にチェックリストを生成してください。",
      en: "Generate a checklist first."
    },
    copied: {
      ja: "コピーしました。",
      en: "Copied."
    },
    copyFailed: {
      ja: "コピーに失敗しました。手動で選択してコピーしてください。",
      en: "Copy failed. Select and copy the text manually."
    },
    saved: {
      ja: "保存しました。",
      en: "Saved."
    }
  };

  const typeLabels = {
    converter: { ja: "変換系", en: "Converter" },
    checker: { ja: "判定系", en: "Checker" },
    generator: { ja: "生成系", en: "Generator" },
    directory: { ja: "一覧系", en: "Directory" }
  };

  const commonItems = {
    ja: [
      "title / description がツール内容と検索意図に合っている",
      "canonical が /tools/{slug}/ に統一されている",
      "OGP / Twitter Card / favicon / apple-touch-icon を確認した",
      "WebApplication JSON-LD がページ内容と一致している",
      "FAQがある場合、本文FAQとFAQPage JSON-LDが一致している",
      "robots.txt と sitemap.xml に公開URLが反映されている",
      "noindex / nofollow / テスト用metaが残っていない",
      "404 / Not Found / 存在しない関連リンクを確認した",
      "内部リンク切れがない",
      "外部リンクに target=\"_blank\" を使う場合 rel=\"noopener\" が付いている",
      "AdSense script、ad-top / ad-bottom、広告ID、slot ID、表示崩れを確認した",
      "GA4タグが正しいIDでhead内にある",
      "寄付リンク（OFUSE / Ko-fi）が正しいURLになっている",
      "プライバシー説明と免責文がツール内容に合っている",
      "チェックリスト生成などの処理範囲を正確に説明している",
      "360px幅で入力、ボタン、出力、FAQが崩れない",
      "可能なら Chrome / Safari / Firefox / Android Chrome / iOS Safari で確認した",
      "未入力、空状態、エラー状態、大容量/異常入力時の表示を確認した",
      "コピー、保存、Clipboard fallback、toast通知を確認した"
    ],
    en: [
      "Title and description match the tool content and search intent",
      "Canonical URL is normalized to /tools/{slug}/",
      "OGP, Twitter Card, favicon, and apple-touch-icon are verified",
      "WebApplication JSON-LD matches the page content",
      "If FAQ exists, visible FAQ and FAQPage JSON-LD are consistent",
      "robots.txt and sitemap.xml include the public URL",
      "No noindex, nofollow, or test-only meta tags remain",
      "404, Not Found, and missing related links are checked",
      "Internal links are not broken",
      "External links with target=\"_blank\" include rel=\"noopener\"",
      "AdSense script, ad-top/ad-bottom, ad IDs, slot IDs, and layout are checked",
      "GA4 tag is in head with the correct ID",
      "Donation links for OFUSE and Ko-fi use the correct URLs",
      "Privacy and disclaimer text fit the tool",
      "The processing scope is described accurately",
      "Input, buttons, output, and FAQ do not break at 360px width",
      "If possible, tested on Chrome, Safari, Firefox, Android Chrome, and iOS Safari",
      "Empty states, error states, and large/abnormal input states are verified",
      "Copy, save, Clipboard fallback, and toast messages are verified"
    ]
  };

  const typeItems = {
    converter: {
      ja: [
        "入力形式と出力形式を明記している",
        "元データを自動変更しないことを説明している",
        "変換失敗時の理由と次の確認方法を表示する",
        "メタデータ削除、品質劣化、非対応形式などの注意を必要に応じて書いている"
      ],
      en: [
        "Input and output formats are clearly described",
        "It explains that the original data is not modified automatically",
        "Conversion failure reasons and next checks are shown",
        "Metadata removal, quality loss, and unsupported formats are noted when relevant"
      ]
    },
    checker: {
      ja: [
        "判定限界と誤判定の可能性を明記している",
        "専門判断、法務判断、医療判断などの代替ではないと書いている",
        "結果の根拠、検出条件、該当箇所を表示している",
        "危険度やスコアを断定的に見せすぎていない"
      ],
      en: [
        "Limits and false positives/negatives are clearly stated",
        "It says the tool does not replace expert, legal, or medical judgment where relevant",
        "Reasons, detection conditions, and matched sections are shown",
        "Risk levels and scores are not presented as absolute judgments"
      ]
    },
    generator: {
      ja: [
        "未入力のまま生成・コピーできない",
        "誇張表現、広告表現、法務表現、個人情報の注意を入れている",
        "生成文をそのまま使わず確認・編集する案内がある",
        "コピー、保存、toast通知が自然に動く"
      ],
      en: [
        "Generation and copy are blocked when required input is missing",
        "Claims, ad wording, legal wording, and personal-data cautions are included",
        "Users are told to review and edit generated text before use",
        "Copy, save, and toast notifications work naturally"
      ]
    },
    directory: {
      ja: [
        "掲載範囲、未掲載条件、データ更新日を表示している",
        "公式情報の確認を促している",
        "リンク切れ時の案内がある",
        "検索結果0件、データ取得失敗、外部リンク遷移の説明がある"
      ],
      en: [
        "Coverage, missing-data conditions, and data update date are shown",
        "Users are encouraged to verify official sources",
        "Broken-link guidance is included",
        "Zero results, data-load failure, and external-link behavior are explained"
      ]
    }
  };

  const createList = (items) => items.map((item) => `- [ ] ${item}`).join("\n");

  const buildChecklist = (type) => {
    const label = typeLabels[type] || typeLabels.converter;
    const today = new Date().toISOString().slice(0, 10);

    return [
      `# Microtool Launch Checklist / マイクロツール公開前チェックリスト`,
      ``,
      `- Date: ${today}`,
      `- Tool type: ${label.en} / ${label.ja}`,
      ``,
      `## JP｜共通チェック`,
      createList(commonItems.ja),
      ``,
      `## JP｜${label.ja}の追加チェック`,
      createList(typeItems[type].ja),
      ``,
      `## EN｜Common checks`,
      createList(commonItems.en),
      ``,
      `## EN｜Additional checks for ${label.en}`,
      createList(typeItems[type].en),
      ``,
      `## Notes`,
      `- This checklist is only a pre-launch aid. It does not guarantee legal compliance, ad approval, SEO ranking, or correct tool behavior.`,
      `- このチェックリストは公開前確認の補助です。法務適合、広告審査、SEO順位、ツール動作の正確性を保証するものではありません。`
    ].join("\n");
  };

  const safeFilenamePart = (value) => String(value || "tool").replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();

  const initMicrotoolChecklist = () => {
    const toolType = document.getElementById("toolType");
    const output = document.getElementById("checklistOutput");
    const generateButton = document.getElementById("generateChecklist");
    const copyButton = document.getElementById("copyChecklist");
    const saveMdButton = document.getElementById("saveChecklistMd");
    const saveTxtButton = document.getElementById("saveChecklistTxt");

    if (!toolType || !output || !generateButton || !copyButton || !saveMdButton || !saveTxtButton) return;

    let hasGenerated = false;
    let currentText = "";

    const setGeneratedState = (generated) => {
      hasGenerated = generated;
      [copyButton, saveMdButton, saveTxtButton].forEach((button) => {
        button.disabled = !generated;
      });
      output.classList.toggle("empty", !generated);
    };

    const requireGenerated = () => {
      if (hasGenerated && currentText.trim()) return true;
      showToast(messages.needGenerate[getCurrentLang()]);
      return false;
    };

    const render = () => {
      currentText = buildChecklist(toolType.value);
      output.textContent = currentText;
      setGeneratedState(true);
    };

    const buildFilename = (extension) => {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const type = safeFilenamePart(toolType.value);
      return `microtool-launch-checklist-${type}-${date}.${extension}`;
    };

    generateButton.addEventListener("click", render);

    copyButton.addEventListener("click", async () => {
      if (!requireGenerated()) return;
      const ok = await copyToClipboard(currentText);
      showToast(ok ? messages.copied[getCurrentLang()] : messages.copyFailed[getCurrentLang()]);
    });

    saveMdButton.addEventListener("click", () => {
      if (!requireGenerated()) return;
      downloadText(buildFilename("md"), currentText);
      showToast(messages.saved[getCurrentLang()]);
    });

    saveTxtButton.addEventListener("click", () => {
      if (!requireGenerated()) return;
      downloadText(buildFilename("txt"), currentText);
      showToast(messages.saved[getCurrentLang()]);
    });

    setGeneratedState(false);
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initMicrotoolChecklist();
  });
})();
