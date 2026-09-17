(() => {
  "use strict";

  const state = {
    enabled: false,
    tool: "",
    merchant: "amazon",
    targets: Object.create(null)
  };

  function isAmazonHttpsUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try {
      const url = new URL(value, window.location.href);
      if (url.protocol !== "https:") return false;
      const host = url.hostname.toLowerCase();
      return host === "amazon.co.jp" || host.endsWith(".amazon.co.jp") || host === "amzn.to";
    } catch (_) {
      return false;
    }
  }

  function normalizeTargets(targets) {
    const next = Object.create(null);
    if (!targets || typeof targets !== "object") return next;
    Object.entries(targets).forEach(([key, value]) => {
      if (isAmazonHttpsUrl(value)) next[key] = value;
    });
    return next;
  }

  function configure(config = {}) {
    state.enabled = config.enabled === true;
    state.tool = typeof config.tool === "string" ? config.tool : "";
    state.merchant = "amazon";
    state.targets = normalizeTargets(config.targets);
    return api;
  }

  function isActive(target) {
    return Boolean(state.enabled && target && state.targets[target]);
  }

  function hasAnyActiveTarget() {
    return state.enabled && Object.keys(state.targets).length > 0;
  }

  function normalizeLanguage(value) {
    const language = String(value || "").toLowerCase();
    if (language === "ja" || language.startsWith("ja-")) return "ja";
    if (language === "en" || language.startsWith("en-")) return "en";
    return "";
  }

  function resolveLanguage(container, explicitLanguage) {
    const explicit = normalizeLanguage(explicitLanguage);
    if (explicit) return explicit;

    if (container instanceof Element) {
      const i18nNode = container.closest("[data-i18n]");
      const i18nLanguage = normalizeLanguage(i18nNode?.getAttribute("data-i18n"));
      if (i18nLanguage) return i18nLanguage;

      const langNode = container.closest("[lang]");
      const localLanguage = normalizeLanguage(langNode?.getAttribute("lang"));
      if (localLanguage) return localLanguage;
    }

    return normalizeLanguage(document.documentElement.lang) || "en";
  }

  function stableToken(value, fallback) {
    const token = String(value || "").trim();
    return token || fallback;
  }

  function trackClick(target, options = {}) {
    if (typeof window.gtag !== "function") return;

    const placement = stableToken(options.placement, "unspecified");
    const destinationKey = stableToken(options.destinationKey, String(target || "unknown"));
    const affiliateId = stableToken(
      options.affiliateId,
      `${destinationKey}_${placement}`
    );

    window.gtag("event", "affiliate_outbound", {
      tool_slug: stableToken(state.tool, "unknown"),
      affiliate_id: affiliateId,
      placement,
      merchant: state.merchant,
      destination_key: destinationKey,
      language: resolveLanguage(options.container, options.language)
    });
  }

  function mountLink(container, target, url, options = {}) {
    if (!(container instanceof Element)) return false;

    container.replaceChildren();
    container.hidden = true;

    if (!isActive(target) || !isAmazonHttpsUrl(url)) return false;

    const link = document.createElement("a");
    link.className = options.className || "nw-affiliate-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "sponsored noopener";
    link.textContent = options.label || "Amazonで探す";
    link.addEventListener("click", () => trackClick(target, { ...options, container }));

    container.appendChild(link);
    container.hidden = false;
    return true;
  }

  function mount(options = {}) {
    const target = options.target;
    return mountLink(options.container, target, state.targets[target], options);
  }

  function mountUrl(options = {}) {
    return mountLink(options.container, options.target, options.url, options);
  }

  function renderDisclosure(container, options = {}) {
    if (!(container instanceof Element)) return false;
    container.replaceChildren();
    container.hidden = true;
    if (!hasAnyActiveTarget()) return false;

    const ja = document.createElement("p");
    ja.lang = "ja";
    ja.textContent = "Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。";
    container.appendChild(ja);

    if (options.includeEnglish === true) {
      const en = document.createElement("p");
      en.lang = "en";
      en.textContent = "As an Amazon Associate, NicheWorks earns from qualifying purchases.";
      container.appendChild(en);
    }

    container.hidden = false;
    return true;
  }

  const api = Object.freeze({
    configure,
    isActive,
    mount,
    mountUrl,
    renderDisclosure
  });

  window.NWAmazonAffiliate = api;
})();
