(() => {
  "use strict";

  const helper = window.NWAmazonAffiliate;
  const config = window.NWAmazonStaticOffers;
  const mount = document.getElementById("nwAmazonAffiliate");
  if (!helper || !config || !(mount instanceof Element)) return;

  const verified = config.enabled === true && config.template?.status === "verified" && /^[A-Za-z0-9_-]+-\d{2}$/.test(config.trackingId || "");
  const offers = Array.isArray(config.offers) ? config.offers : [];
  const proofUrl = config.template?.proofUrl || "";
  const targets = Object.create(null);
  for (const offer of offers) {
    if (offer?.target) targets[offer.target] = proofUrl;
  }

  helper.configure({ enabled: verified, tool: config.tool, targets });

  function lang() { return document.documentElement.lang === "en" ? "en" : "ja"; }

  function amazonUrl(query) {
    const url = new URL("https://www.amazon.co.jp/s");
    url.searchParams.set("k", query);
    url.searchParams.set("tag", config.trackingId);
    return url.toString();
  }

  function render() {
    mount.replaceChildren();
    mount.hidden = true;
    if (!verified || !offers.length) return;

    const language = lang();
    const section = document.createElement("section");
    section.className = "nw-amazon-card";
    section.setAttribute("aria-label", language === "en" ? "Amazon affiliate links" : "Amazonアフィリエイトリンク");

    const title = document.createElement("h2");
    title.className = "nw-amazon-title";
    title.textContent = language === "en" ? (config.titleEn || config.titleJa) : config.titleJa;
    section.appendChild(title);

    const note = document.createElement("p");
    note.className = "nw-amazon-note";
    note.textContent = language === "en" ? (config.noteEn || config.noteJa) : config.noteJa;
    section.appendChild(note);

    const grid = document.createElement("div");
    grid.className = "nw-amazon-grid";
    section.appendChild(grid);

    for (const offer of offers) {
      if (!offer?.key || !offer?.target || !offer?.query) continue;
      const slot = document.createElement("div");
      slot.className = "nw-amazon-slot";
      grid.appendChild(slot);
      helper.mountUrl({
        container: slot,
        target: offer.target,
        url: amazonUrl(offer.query),
        label: language === "en" ? (offer.labelEn || offer.labelJa) : offer.labelJa,
        placement: config.placement || "related_products",
        affiliateId: offer.key,
        destinationKey: offer.target,
        language,
        className: "nw-amazon-link"
      });
    }

    const disclosure = document.createElement("div");
    disclosure.className = "nw-amazon-disclosure";
    section.appendChild(disclosure);
    helper.renderDisclosure(disclosure, { includeEnglish: true });

    mount.appendChild(section);
    mount.hidden = false;
  }

  render();
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((item) => item.type === "attributes" && item.attributeName === "lang")) render();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
