(() => {
  "use strict";

  const state = {
    enabled: false,
    tool: "",
    affiliate: "amazon",
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
    state.affiliate = "amazon";
    state.targets = normalizeTargets(config.targets);
    return api;
  }

  function isActive(target) {
    return Boolean(state.enabled && target && state.targets[target]);
  }

  function hasAnyActiveTarget() {
    return state.enabled && Object.keys(state.targets).length > 0;
  }

  function trackClick(target, placement) {
    if (typeof window.gtag !== "function") return;
    const params = {
      tool: state.tool || "unknown",
      affiliate: state.affiliate,
      target: String(target || "unknown"),
      placement: String(placement || "unspecified")
    };
    window.gtag("event", "affiliate_click", params);
  }

  function mount(options = {}) {
    const container = options.container;
    const target = options.target;
    if (!(container instanceof Element)) return false;

    container.replaceChildren();
    container.hidden = true;

    if (!isActive(target)) return false;

    const link = document.createElement("a");
    link.className = options.className || "nw-affiliate-link";
    link.href = state.targets[target];
    link.target = "_blank";
    link.rel = "sponsored noopener";
    link.textContent = options.label || "Amazonで探す";
    link.addEventListener("click", () => trackClick(target, options.placement));

    container.appendChild(link);
    container.hidden = false;
    return true;
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
    renderDisclosure
  });

  window.NWAmazonAffiliate = api;
})();
