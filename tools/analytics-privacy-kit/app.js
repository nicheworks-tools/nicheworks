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

  const providerCatalog = [
    {
      id: "useGA4",
      name: { ja: "Google Analytics 4 (GA4)", en: "Google Analytics 4 (GA4)" },
      data: {
        ja: "アクセス日時、IPアドレス、利用端末情報、参照元、閲覧ページ等の情報を収集する場合があります。",
        en: "May collect visit timestamps, IP address, device information, referrer, and viewed pages."
      },
      purpose: {
        ja: "サイトの利用状況把握と改善のために利用します。",
        en: "Used to understand site usage and improve the site."
      },
      sharing: {
        ja: "解析処理のためGoogleに送信されます。",
        en: "Sent to Google for analytics processing."
      },
      optOut: {
        ja: "オプトアウトや設定変更はGoogleの公式設定をご確認ください。",
        en: "For opt-out or settings, refer to Google's official controls."
      }
    },
    {
      id: "useCFWebAnalytics",
      name: { ja: "Cloudflare Web Analytics", en: "Cloudflare Web Analytics" },
      data: {
        ja: "アクセス日時、参照元、閲覧ページ、利用端末情報等の情報を収集する場合があります。",
        en: "May collect visit timestamps, referrer, viewed pages, and device information."
      },
      purpose: {
        ja: "サイトの利用状況把握と改善のために利用します。",
        en: "Used to understand site usage and improve the site."
      },
      sharing: {
        ja: "解析処理のためCloudflareに送信されます。",
        en: "Sent to Cloudflare for analytics processing."
      },
      optOut: {
        ja: "オプトアウトや設定変更はCloudflareの公式設定をご確認ください。",
        en: "For opt-out or settings, refer to Cloudflare's official controls."
      }
    },
    {
      id: "usePlausible",
      name: { ja: "Plausible", en: "Plausible" },
      data: {
        ja: "アクセス日時、参照元、閲覧ページ等の情報を収集する場合があります。",
        en: "May collect visit timestamps, referrer, and viewed pages."
      },
      purpose: {
        ja: "サイトの利用状況把握と改善のために利用します。",
        en: "Used to understand site usage and improve the site."
      },
      sharing: {
        ja: "解析処理のためPlausibleに送信されます。",
        en: "Sent to Plausible for analytics processing."
      },
      optOut: {
        ja: "オプトアウトや設定変更はPlausibleの公式設定をご確認ください。",
        en: "For opt-out or settings, refer to Plausible's official controls."
      }
    },
    {
      id: "useAdSense",
      name: { ja: "Google AdSense", en: "Google AdSense" },
      data: {
        ja: "広告配信のため、Cookieや広告識別子、閲覧ページ等の情報を利用する場合があります。",
        en: "For ad delivery, cookies or advertising identifiers and viewed pages may be used."
      },
      purpose: {
        ja: "広告配信および効果測定のために利用します。",
        en: "Used for ad delivery and measurement."
      },
      sharing: {
        ja: "広告配信のためGoogleに情報が送信される場合があります。",
        en: "Information may be sent to Google for ad delivery."
      },
      optOut: {
        ja: "広告設定の変更はGoogleの公式設定をご確認ください。",
        en: "For ad settings, refer to Google's official controls."
      }
    }
  ];

  const buildProviderBlock = (provider, lang, tone) => {
    const label = lang === "ja" ? "取得する情報" : "Data collected";
    const purposeLabel = lang === "ja" ? "利用目的" : "Purpose";
    const sharingLabel = lang === "ja" ? "第三者提供" : "Sharing";
    const optOutLabel = lang === "ja" ? "オプトアウト/設定" : "Opt-out / settings";
    const title = lang === "ja" ? `【${provider.name.ja}】` : `【${provider.name.en}】`;

    const lines = [
      title,
      `${label}: ${provider.data[lang]}`,
      `${purposeLabel}: ${provider.purpose[lang]}`,
      `${sharingLabel}: ${provider.sharing[lang]}`,
      `${optOutLabel}: ${provider.optOut[lang]}`
    ];

    if (tone === "short") {
      return lines.join("\n");
    }

    if (tone === "standard") {
      return lines.concat("", lang === "ja"
        ? "必要に応じて同意の取得や設定変更を行ってください。"
        : "Please obtain consent or adjust settings as required.").join("\n");
    }

    return lines.concat(
      "",
      lang === "ja"
        ? "提供事業者のプライバシー方針に基づき処理されます。"
        : "Processing follows the provider's privacy policy."
    ).join("\n");
  };

  const buildCopy = (inputs, tone) => {
    const { lang, siteName, siteUrl, contactEmail, providers } = inputs;
    const siteLabel = siteName ? `${siteName}${siteUrl ? `（${siteUrl}）` : ""}` : (lang === "ja" ? "当サイト" : "this site");
    const providerNames = providers.length
      ? providers.map((p) => (lang === "ja" ? p.name.ja : p.name.en)).join(lang === "ja" ? "、" : ", ")
      : (lang === "ja" ? "なし" : "none");

    const header = lang === "ja"
      ? `${siteLabel}では、以下のアクセス解析・広告サービスを利用する場合があります。`
      : `${siteLabel} may use the following analytics or advertising services.`;

    const providerListLine = lang === "ja"
      ? `対象サービス: ${providerNames}`
      : `Services: ${providerNames}`;

    const generalLine = lang === "ja"
      ? "アクセス情報は、アクセス状況の把握およびサービス改善のために利用されます。"
      : "Analytics data is used to understand usage and improve the site.";

    const cookieLine = lang === "ja"
      ? "Cookie等の識別子や類似技術を利用する場合があります。"
      : "Cookies or similar identifiers may be used.";

    const contactLine = contactEmail
      ? (lang === "ja" ? `お問い合わせ: ${contactEmail}` : `Contact: ${contactEmail}`)
      : (lang === "ja" ? "お問い合わせはサイト内の連絡先をご確認ください。" : "Please refer to our contact page for inquiries.");

    const updateLine = lang === "ja"
      ? "本方針は必要に応じて更新する場合があります。"
      : "This notice may be updated as needed.";

    const templateLine = lang === "ja"
      ? "※テンプレートであり、法的助言ではありません。必ず運用内容に合わせて見直してください。"
      : "This is a template and not legal advice. Please review and adjust to your practices.";

    const providerBlocks = providers.length
      ? providers.map((provider) => buildProviderBlock(provider, lang, tone)).join("\n\n")
      : (lang === "ja"
        ? "現在、特定の解析サービスは利用していません。"
        : "Currently, no specific analytics services are used.");

    if (tone === "short") {
      return [header, providerListLine, providerBlocks, contactLine, updateLine, templateLine].join("\n\n");
    }

    if (tone === "standard") {
      return [header, providerListLine, generalLine, cookieLine, providerBlocks, contactLine, updateLine, templateLine].join("\n\n");
    }

    const detailExtra = lang === "ja"
      ? "収集される情報は、提供事業者のサーバーで処理される場合があり、国外で処理される可能性もあります。"
      : "Collected data may be processed on the provider's servers and could be handled outside your region.";

    return [header, providerListLine, generalLine, cookieLine, detailExtra, providerBlocks, contactLine, updateLine, templateLine].join("\n\n");
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

    const buildInputs = () => ({
      lang: langMode.value,
      siteName: siteName.value.trim(),
      siteUrl: siteUrl.value.trim(),
      contactEmail: contactEmail.value.trim(),
      providers: getProviders()
    });

    const render = () => {
      const inputs = buildInputs();
      outShort.value = buildCopy(inputs, "short");
      outStandard.value = buildCopy(inputs, "standard");
      outDetailed.value = buildCopy(inputs, "detailed");
    };

    const clearAll = () => {
      siteName.value = "";
      siteUrl.value = "";
      contactEmail.value = "";
      langMode.value = "ja";
      providerCatalog.forEach((provider) => {
        const el = document.getElementById(provider.id);
        if (el) {
          el.checked = provider.id === "useGA4";
        }
      });
      outShort.value = "";
      outStandard.value = "";
      outDetailed.value = "";
    };

    document.getElementById("generateBtn").addEventListener("click", render);
    document.getElementById("clearBtn").addEventListener("click", clearAll);
    document.getElementById("downloadBtn").addEventListener("click", () => {
      const payload = [
        "[Short]",
        outShort.value,
        "",
        "[Standard]",
        outStandard.value,
        "",
        "[Detailed]",
        outDetailed.value
      ].join("\n");
      const suffix = langMode.value === "ja" ? "ja" : "en";
      downloadText(`analytics-privacy-${suffix}.txt`, payload);
    });

    document.getElementById("copyShortBtn").addEventListener("click", () => copyToClipboard(outShort.value));
    document.getElementById("copyStandardBtn").addEventListener("click", () => copyToClipboard(outStandard.value));
    document.getElementById("copyDetailedBtn").addEventListener("click", () => copyToClipboard(outDetailed.value));

    const autoRender = debounce(render, 200);
    [siteName, siteUrl, contactEmail, langMode].forEach((el) => el.addEventListener("input", autoRender));
    providerCatalog.forEach((provider) => {
      const el = document.getElementById(provider.id);
      if (el) {
        el.addEventListener("change", autoRender);
      }
    });
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTool();
  });
})();
