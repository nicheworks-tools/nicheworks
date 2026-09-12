(function attachCosmeticsAffiliateSlot(root) {
  "use strict";

  const EVENT_IMPRESSION = "affiliate_impression";
  const EVENT_CLICK = "affiliate_click";

  function getToolKey() {
    const path = String(root.location?.pathname || "");
    if (path.includes("/tools/cosmetic-ingredient-checker-lite/")) return "cosmetic-ingredient-checker-lite";
    if (path.includes("/tools/inci-fastscan/")) return "inci-fastscan";
    return "";
  }

  function track(eventName, metadata) {
    if (typeof root.gtag !== "function") return;
    root.gtag("event", eventName, {
      tool: metadata.tool,
      provider: metadata.provider,
      placement: metadata.placement,
      link_key: metadata.linkKey || ""
    });
  }

  function safeLink(link) {
    if (!link || typeof link !== "object") return null;
    const href = String(link.href || "").trim();
    const key = String(link.key || "").trim();
    const labelJa = String(link.labelJa || "").trim();
    const labelEn = String(link.labelEn || labelJa).trim();
    if (!href || !key || !labelJa) return null;
    return { href, key, labelJa, labelEn };
  }

  function render() {
    const config = root.NWCosmeticsAffiliateConfig;
    const tool = getToolKey();
    if (!config || !tool) return;

    const slotConfig = config.slots?.[tool];
    if (!slotConfig) return;

    const slot = document.getElementById(slotConfig.slotId);
    if (!slot) return;

    slot.dataset.affiliateProvider = config.provider || "amazon";
    slot.dataset.affiliatePlacement = slotConfig.placement || slot.dataset.affiliatePlacement || "";

    const links = Array.isArray(slotConfig.links)
      ? slotConfig.links.map(safeLink).filter(Boolean)
      : [];

    if (!config.enabled || !config.associateTag || !links.length) {
      slot.hidden = true;
      slot.setAttribute("aria-hidden", "true");
      slot.dataset.affiliateState = "inactive";
      slot.replaceChildren();
      return;
    }

    const lang = document.documentElement.lang === "en" ? "en" : "ja";
    const wrapper = document.createElement("div");
    wrapper.className = "nw-affiliate-card";

    const heading = document.createElement("p");
    heading.className = "nw-affiliate-title";
    heading.textContent = lang === "en" ? "Related products [PR]" : "関連商品を探す [PR]";
    wrapper.appendChild(heading);

    const linkWrap = document.createElement("div");
    linkWrap.className = "nw-affiliate-links";

    links.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.target = "_blank";
      anchor.rel = "sponsored noopener noreferrer";
      anchor.dataset.affiliateLinkKey = link.key;
      anchor.textContent = lang === "en" ? link.labelEn : link.labelJa;
      anchor.addEventListener("click", () => {
        track(EVENT_CLICK, {
          tool,
          provider: config.provider,
          placement: slotConfig.placement,
          linkKey: link.key
        });
      });
      linkWrap.appendChild(anchor);
    });

    wrapper.appendChild(linkWrap);

    const disclosureText = lang === "en" ? config.disclosure?.en : config.disclosure?.ja;
    if (disclosureText) {
      const disclosure = document.createElement("p");
      disclosure.className = "nw-affiliate-disclosure";
      disclosure.textContent = disclosureText;
      wrapper.appendChild(disclosure);
    }

    slot.replaceChildren(wrapper);
    slot.hidden = false;
    slot.setAttribute("aria-hidden", "false");
    slot.dataset.affiliateState = "active";

    track(EVENT_IMPRESSION, {
      tool,
      provider: config.provider,
      placement: slotConfig.placement,
      linkKey: ""
    });
  }

  root.NWCosmeticsAffiliateSlots = Object.freeze({
    version: "1.0.0",
    events: Object.freeze({ impression: EVENT_IMPRESSION, click: EVENT_CLICK }),
    render
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  } else {
    render();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
