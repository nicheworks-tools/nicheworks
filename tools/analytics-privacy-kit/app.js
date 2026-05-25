(() => {
  "use strict";

  const MESSAGES = {
    placeholders: {
      siteName: { ja: "Example Site", en: "Example Site" },
      siteUrl: { ja: "https://example.com", en: "https://example.com" },
      contactEmail: { ja: "support@example.com", en: "support@example.com" }
    },
    toast: {
      copySuccess: { ja: "コピーしました。", en: "Copied." },
      copyFailed: { ja: "コピーに失敗しました。手動で選択してコピーしてください。", en: "Copy failed. Please select and copy manually." },
      generateFirst: { ja: "先に生成してください。", en: "Generate the text first." },
      downloadSuccess: { ja: "TXTをダウンロードしました。", en: "TXT downloaded." },
      downloadFailed: { ja: "ダウンロードに失敗しました。", en: "Download failed." },
      invalidUrl: { ja: "サイトURLは http:// または https:// から始まる正しいURLを入力してください。", en: "Enter a valid site URL that starts with http:// or https://." },
      invalidEmail: { ja: "連絡先メールの形式を確認してください。", en: "Check the contact email format." },
      cleared: { ja: "入力と出力をクリアしました。", en: "Input and output cleared." }
    }
  };

  let currentLang = "ja";
  let toastTimer = null;

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const placeholderNodes = () => Array.from(document.querySelectorAll("[data-i18n-placeholder]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const t = (key) => {
    const entry = MESSAGES.toast[key];
    return entry ? entry[currentLang] : key;
  };

  const showToast = (messageKey, type = "info") => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = t(messageKey);
    toast.className = `toast toast-${type}`;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  };

  const applyLang = (lang) => {
    currentLang = lang === "en" ? "en" : "ja";
    i18nNodes().forEach((el) => {
      el.style.display = (el.dataset.i18n === currentLang) ? "" : "none";
    });
    placeholderNodes().forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const item = MESSAGES.placeholders[key];
      if (item) el.placeholder = item[currentLang];
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === currentLang));
    document.documentElement.lang = currentLang;
    try { localStorage.setItem("nw_lang", currentLang); } catch (_) {}
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
      ta.focus();
      ta.select();
      try {
        return document.execCommand("copy");
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
    return true;
  };

  const debounce = (fn, ms = 150) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  const providerCatalog = [
    {
      id: "useGA4",
      name: { ja: "Google Analytics 4 (GA4)", en: "Google Analytics 4 (GA4)" },
      data: { ja: "アクセス日時、IPアドレス、利用端末情報、参照元、閲覧ページ等の情報を収集する場合があります。", en: "May collect visit timestamps, IP address, device information, referrer, viewed pages, and similar usage data." },
      purpose: { ja: "サイトの利用状況把握と改善のために利用します。", en: "Used to understand site usage and improve the site." },
      sharing: { ja: "解析処理のためGoogleに送信される場合があります。", en: "May be sent to Google for analytics processing." },
      optOut: { ja: "オプトアウトや設定変更はGoogleの公式設定をご確認ください。", en: "For opt-out or settings, refer to Google's official controls." }
    },
    {
      id: "useCFWebAnalytics",
      name: { ja: "Cloudflare Web Analytics", en: "Cloudflare Web Analytics" },
      data: { ja: "アクセス日時、参照元、閲覧ページ、利用端末情報等の情報を収集する場合があります。", en: "May collect visit timestamps, referrer, viewed pages, device information, and similar usage data." },
      purpose: { ja: "サイトの利用状況把握と改善のために利用します。", en: "Used to understand site usage and improve the site." },
      sharing: { ja: "解析処理のためCloudflareに送信される場合があります。", en: "May be sent to Cloudflare for analytics processing." },
      optOut: { ja: "オプトアウトや設定変更はCloudflareの公式設定をご確認ください。", en: "For opt-out or settings, refer to Cloudflare's official controls." }
    },
    {
      id: "usePlausible",
      name: { ja: "Plausible", en: "Plausible" },
      data: { ja: "アクセス日時、参照元、閲覧ページ等の情報を収集する場合があります。", en: "May collect visit timestamps, referrer, viewed pages, and similar usage data." },
      purpose: { ja: "サイトの利用状況把握と改善のために利用します。", en: "Used to understand site usage and improve the site." },
      sharing: { ja: "解析処理のためPlausibleに送信される場合があります。", en: "May be sent to Plausible for analytics processing." },
      optOut: { ja: "オプトアウトや設定変更はPlausibleの公式設定をご確認ください。", en: "For opt-out or settings, refer to Plausible's official controls." }
    },
    {
      id: "useAdSense",
      name: { ja: "Google AdSense", en: "Google AdSense" },
      data: { ja: "広告配信のため、Cookieや広告識別子、閲覧ページ等の情報を利用する場合があります。", en: "For ad delivery, cookies or advertising identifiers and viewed pages may be used." },
      purpose: { ja: "広告配信および効果測定のために利用します。", en: "Used for ad delivery and measurement." },
      sharing: { ja: "広告配信のためGoogleに情報が送信される場合があります。", en: "Information may be sent to Google for ad delivery." },
      optOut: { ja: "広告設定の変更はGoogleの公式設定をご確認ください。", en: "For ad settings, refer to Google's official controls." }
    },
    {
      id: "useGTM",
      name: { ja: "Google Tag Manager", en: "Google Tag Manager" },
      data: { ja: "タグ管理のため、ページ閲覧情報や利用端末情報等が処理され、設定された解析・広告タグが読み込まれる場合があります。", en: "For tag management, page view and device information may be processed, and configured analytics or advertising tags may load." },
      purpose: { ja: "解析・広告・計測タグを管理し、サイト改善や効果測定を行うために利用します。", en: "Used to manage analytics, advertising, and measurement tags for site improvement and measurement." },
      sharing: { ja: "タグ管理および関連サービスの処理のためGoogleまたは設定された各サービス提供者に送信される場合があります。", en: "May be sent to Google or configured service providers for tag management and related processing." },
      optOut: { ja: "関連する各タグやサービスの公式設定・オプトアウト方法をご確認ください。", en: "Refer to the official controls and opt-out options for each related tag or service." }
    },
    {
      id: "useClarity",
      name: { ja: "Microsoft Clarity", en: "Microsoft Clarity" },
      data: { ja: "ページ閲覧、クリック、スクロール、操作履歴、利用端末情報等を収集する場合があります。", en: "May collect page views, clicks, scrolls, interaction history, device information, and similar usage data." },
      purpose: { ja: "ユーザー行動の把握、画面改善、ユーザビリティ改善のために利用します。", en: "Used to understand user behavior and improve screens and usability." },
      sharing: { ja: "解析処理のためMicrosoftに送信される場合があります。", en: "May be sent to Microsoft for analytics processing." },
      optOut: { ja: "オプトアウトや設定変更はMicrosoftの公式設定をご確認ください。", en: "For opt-out or settings, refer to Microsoft's official controls." }
    },
    {
      id: "useMetaPixel",
      name: { ja: "Meta Pixel", en: "Meta Pixel" },
      data: { ja: "広告識別子、Cookie、閲覧ページ、コンバージョン情報、利用端末情報等を利用する場合があります。", en: "May use advertising identifiers, cookies, viewed pages, conversion information, device information, and similar data." },
      purpose: { ja: "広告配信、広告効果測定、コンバージョン測定、リマーケティングのために利用します。", en: "Used for ad delivery, ad measurement, conversion measurement, and remarketing." },
      sharing: { ja: "広告配信および測定のためMetaに情報が送信される場合があります。", en: "Information may be sent to Meta for ad delivery and measurement." },
      optOut: { ja: "広告設定の変更はMetaの公式設定をご確認ください。", en: "For ad settings, refer to Meta's official controls." }
    }
  ];

  const isValidUrl = (value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const isValidEmail = (value) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const buildProviderBlock = (provider, lang, tone) => {
    const label = lang === "ja" ? "取得する情報" : "Data collected";
    const purposeLabel = lang === "ja" ? "利用目的" : "Purpose";
    const sharingLabel = lang === "ja" ? "第三者提供・外部送信" : "Sharing / external transmission";
    const optOutLabel = lang === "ja" ? "オプトアウト/設定" : "Opt-out / settings";
    const title = lang === "ja" ? `【${provider.name.ja}】` : `【${provider.name.en}】`;

    const lines = [
      title,
      `${label}: ${provider.data[lang]}`,
      `${purposeLabel}: ${provider.purpose[lang]}`,
      `${sharingLabel}: ${provider.sharing[lang]}`,
      `${optOutLabel}: ${provider.optOut[lang]}`
    ];

    if (tone === "short") return lines.slice(0, 3).join("\n");
    if (tone === "standard") {
      return lines.concat("", lang === "ja" ? "必要に応じて同意の取得、Cookie設定、オプトアウト方法の案内を追加してください。" : "Add consent, cookie settings, or opt-out guidance as required.").join("\n");
    }
    return lines.concat("", lang === "ja" ? "提供事業者のプライバシー方針・利用規約に基づき処理されます。利用地域や取得データに応じて記載を調整してください。" : "Processing follows the provider's privacy policy and terms. Adjust the wording for your operating region and collected data.").join("\n");
  };

  const buildCopy = (inputs, tone) => {
    const { lang, siteName, siteUrl, contactEmail, providers } = inputs;
    const siteLabel = siteName ? `${siteName}${siteUrl ? `（${siteUrl}）` : ""}` : (lang === "ja" ? "当サイト" : "this site");
    const providerNames = providers.length ? providers.map((p) => (lang === "ja" ? p.name.ja : p.name.en)).join(lang === "ja" ? "、" : ", ") : (lang === "ja" ? "なし" : "none");

    const header = lang === "ja" ? `${siteLabel}では、以下のアクセス解析・広告・タグ管理サービスを利用する場合があります。` : `${siteLabel} may use the following analytics, advertising, or tag-management services.`;
    const providerListLine = lang === "ja" ? `対象サービス: ${providerNames}` : `Services: ${providerNames}`;
    const generalLine = lang === "ja" ? "アクセス情報は、アクセス状況の把握、サイト改善、広告配信、効果測定のために利用される場合があります。" : "Usage data may be used to understand access patterns, improve the site, deliver ads, and measure performance.";
    const cookieLine = lang === "ja" ? "Cookie、広告識別子、類似技術を利用する場合があります。" : "Cookies, advertising identifiers, or similar technologies may be used.";
    const consentLine = lang === "ja" ? "必要に応じて、Cookie同意バナー、オプトアウト方法、広告設定の案内を別途用意してください。" : "Where required, provide a separate cookie consent banner, opt-out guidance, or ad settings notice.";
    const contactLine = contactEmail ? (lang === "ja" ? `お問い合わせ: ${contactEmail}` : `Contact: ${contactEmail}`) : (lang === "ja" ? "お問い合わせはサイト内の連絡先をご確認ください。" : "Please refer to the site's contact information for inquiries.");
    const updateLine = lang === "ja" ? "本方針は必要に応じて更新する場合があります。" : "This notice may be updated as needed.";
    const templateLine = lang === "ja" ? "※これはたたき台であり、法的助言ではありません。法令適合性、Cookie同意要件、広告配信規約への適合を保証しません。必ず実際の運用内容に合わせて確認してください。" : "This is draft text and not legal advice. It does not guarantee compliance with laws, cookie consent requirements, or advertising platform policies. Always review it against your actual practices.";
    const providerBlocks = providers.length ? providers.map((provider) => buildProviderBlock(provider, lang, tone)).join("\n\n") : (lang === "ja" ? "現在、特定の解析・広告・タグ管理サービスは利用していません。" : "Currently, no specific analytics, advertising, or tag-management services are used.");

    if (tone === "short") return [header, providerListLine, providerBlocks, contactLine, templateLine].join("\n\n");
    if (tone === "standard") return [header, providerListLine, generalLine, cookieLine, providerBlocks, contactLine, updateLine, templateLine].join("\n\n");

    const detailExtra = lang === "ja" ? "収集される情報は、提供事業者のサーバーで処理される場合があり、国外で処理される可能性もあります。取得情報、保存期間、同意管理、オプトアウト方法は実際の設定に合わせて調整してください。" : "Collected data may be processed on the provider's servers and could be handled outside your region. Adjust collected data, retention, consent management, and opt-out wording to your actual settings.";
    return [header, providerListLine, generalLine, cookieLine, consentLine, detailExtra, providerBlocks, contactLine, updateLine, templateLine].join("\n\n");
  };

  const initTool = () => {
    const siteName = document.getElementById("siteName");
    const siteUrl = document.getElementById("siteUrl");
    const contactEmail = document.getElementById("contactEmail");
    const langMode = document.getElementById("langMode");
    const outShort = document.getElementById("outShort");
    const outStandard = document.getElementById("outStandard");
    const outDetailed = document.getElementById("outDetailed");

    const getProviders = () => providerCatalog.filter((provider) => {
      const el = document.getElementById(provider.id);
      return el && el.checked;
    });

    const buildInputs = ({ showErrors = false } = {}) => {
      const urlValue = siteUrl.value.trim();
      const emailValue = contactEmail.value.trim();
      if (!isValidUrl(urlValue)) {
        if (showErrors) showToast("invalidUrl", "error");
        siteUrl.focus();
        return null;
      }
      if (!isValidEmail(emailValue)) {
        if (showErrors) showToast("invalidEmail", "error");
        contactEmail.focus();
        return null;
      }
      return { lang: langMode.value, siteName: siteName.value.trim(), siteUrl: urlValue, contactEmail: emailValue, providers: getProviders() };
    };

    const render = ({ showErrors = true } = {}) => {
      const inputs = buildInputs({ showErrors });
      if (!inputs) return false;
      outShort.value = buildCopy(inputs, "short");
      outStandard.value = buildCopy(inputs, "standard");
      outDetailed.value = buildCopy(inputs, "detailed");
      return true;
    };

    const clearAll = () => {
      siteName.value = "";
      siteUrl.value = "";
      contactEmail.value = "";
      langMode.value = "ja";
      providerCatalog.forEach((provider) => {
        const el = document.getElementById(provider.id);
        if (el) el.checked = provider.id === "useGA4";
      });
      outShort.value = "";
      outStandard.value = "";
      outDetailed.value = "";
      showToast("cleared");
    };

    const copyOutput = async (el) => {
      const text = el.value.trim();
      if (!text) {
        showToast("generateFirst", "error");
        return;
      }
      const ok = await copyToClipboard(el.value);
      showToast(ok ? "copySuccess" : "copyFailed", ok ? "success" : "error");
    };

    document.getElementById("generateBtn").addEventListener("click", () => render({ showErrors: true }));
    document.getElementById("clearBtn").addEventListener("click", clearAll);
    document.getElementById("downloadBtn").addEventListener("click", () => {
      if (!outShort.value.trim() && !outStandard.value.trim() && !outDetailed.value.trim()) {
        showToast("generateFirst", "error");
        return;
      }
      const payload = ["[Short]", outShort.value, "", "[Standard]", outStandard.value, "", "[Detailed]", outDetailed.value].join("\n");
      try {
        const suffix = langMode.value === "ja" ? "ja" : "en";
        downloadText(`analytics-privacy-${suffix}.txt`, payload);
        showToast("downloadSuccess", "success");
      } catch (_) {
        showToast("downloadFailed", "error");
      }
    });

    document.getElementById("copyShortBtn").addEventListener("click", () => copyOutput(outShort));
    document.getElementById("copyStandardBtn").addEventListener("click", () => copyOutput(outStandard));
    document.getElementById("copyDetailedBtn").addEventListener("click", () => copyOutput(outDetailed));

    const autoRender = debounce(() => render({ showErrors: false }), 200);
    [siteName, siteUrl, contactEmail, langMode].forEach((el) => el.addEventListener("input", autoRender));
    providerCatalog.forEach((provider) => {
      const el = document.getElementById(provider.id);
      if (el) el.addEventListener("change", autoRender);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTool();
  });
})();
