(() => {
  "use strict";

  const helper = window.NWAmazonAffiliate;
  const config = window.NWTrashNaviAffiliate;
  if (!helper || !config) return;

  helper.configure({
    enabled: config.enabled === true,
    tool: config.tool,
    targets: config.targets
  });

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function render() {
    const section = document.getElementById("trashnaviAmazonAffiliate");
    const grid = document.getElementById("trashnaviAmazonAffiliateLinks");
    const disclosure = document.getElementById("trashnaviAmazonDisclosure");
    if (!section || !grid || !disclosure) return;

    const lang = currentLang();
    grid.replaceChildren();
    let mounted = 0;

    for (const offer of config.offers) {
      const slot = document.createElement("div");
      slot.className = "trashnavi-affiliate-slot";
      grid.appendChild(slot);
      const ok = helper.mount({
        container: slot,
        target: offer.key,
        label: lang === "en" ? offer.labelEn : offer.labelJa,
        placement: "municipality_supporting_supplies",
        className: "trashnavi-affiliate-link"
      });
      if (ok) mounted += 1;
    }

    helper.renderDisclosure(disclosure, { includeEnglish: true });
    disclosure.querySelectorAll("[lang]").forEach((node) => {
      node.hidden = node.lang !== lang;
    });
    section.hidden = mounted === 0;
  }

  function init() {
    render();
    document.querySelectorAll(".nw-lang-switch button").forEach((button) => {
      button.addEventListener("click", () => setTimeout(render, 0));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
