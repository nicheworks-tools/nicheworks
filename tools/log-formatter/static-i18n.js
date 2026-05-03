document.addEventListener("DOMContentLoaded", () => {
  const items = [
    {
      selector: ".faq-section details:nth-of-type(1) summary",
      ja: "ログはサーバーに送信されますか？",
      en: "Are logs sent to a server?",
    },
    {
      selector: ".faq-section details:nth-of-type(1) p",
      ja: "いいえ。貼り付けたログはブラウザ内で処理され、NicheWorksのサーバーには送信されません。",
      en: "No. The pasted logs are processed in your browser and are not sent to NicheWorks servers.",
    },
    {
      selector: ".faq-section details:nth-of-type(2) summary",
      ja: "どのログ形式に対応していますか？",
      en: "Which log format is supported?",
    },
    {
      selector: ".faq-section details:nth-of-type(2) p",
      ja: "主にNginx combined access log形式を想定しています。形式が違う行は未解析行として表示し、通常のコピーやTXT保存には含めます。",
      en: "It is mainly designed for Nginx combined access logs. Unsupported lines are shown as unparsed and still included in normal copy and TXT export.",
    },
    {
      selector: ".faq-section details:nth-of-type(3) summary",
      ja: "4xxや5xxだけ確認できますか？",
      en: "Can I check only 4xx or 5xx errors?",
    },
    {
      selector: ".faq-section details:nth-of-type(3) p",
      ja: "はい。ステータス抽出ボタンで2xx、3xx、4xx、5xx、4xx+5xxを切り替えられます。4xx/5xxだけをコピーすることもできます。",
      en: "Yes. Use the status shortcut buttons to filter 2xx, 3xx, 4xx, 5xx, or 4xx+5xx. You can also copy only 4xx/5xx lines.",
    },
    {
      selector: ".faq-section details:nth-of-type(4) summary",
      ja: "機密情報を含むログを貼っても大丈夫ですか？",
      en: "Is it safe to paste sensitive logs?",
    },
    {
      selector: ".faq-section details:nth-of-type(4) p",
      ja: "ログはブラウザ内で処理されますが、共有や保存の前にIP、Cookie、Authorizationヘッダー、メールアドレス、トークンなどが含まれていないか確認してください。",
      en: "Processing is local, but before sharing or saving logs, check for IP addresses, cookies, Authorization headers, emails, tokens, and other sensitive data.",
    },
    {
      selector: ".nw-donate-text",
      ja: "このツールが役に立ったら、開発継続のためご支援いただけると嬉しいです。",
      en: "If this tool helped, support helps keep NicheWorks running.",
    },
    {
      selector: ".nw-footer-line:nth-of-type(2)",
      ja: "当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。",
      en: "This site may contain ads. Accuracy is not guaranteed; always verify important information with official sources.",
    },
    {
      selector: ".ad-bottom",
      ja: "広告枠（準備中）",
      en: "Ad slot preparing",
    },
  ];

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function applyStaticI18n() {
    const lang = currentLang();
    items.forEach((item) => {
      document.querySelectorAll(item.selector).forEach((el) => {
        el.textContent = item[lang];
      });
    });
  }

  applyStaticI18n();

  document.getElementById("langJa")?.addEventListener("click", () => window.setTimeout(applyStaticI18n, 0));
  document.getElementById("langEn")?.addEventListener("click", () => window.setTimeout(applyStaticI18n, 0));
  document.getElementById("langSelect")?.addEventListener("change", () => window.setTimeout(applyStaticI18n, 0));

  const observer = new MutationObserver(applyStaticI18n);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
});
