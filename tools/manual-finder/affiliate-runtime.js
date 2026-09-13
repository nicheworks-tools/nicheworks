(() => {
  "use strict";

  const config = window.MANUALFINDER_AFFILIATE_CONFIG;
  const affiliate = window.NWAmazonAffiliate;
  const results = document.getElementById("results");

  if (!config || !affiliate || !results || config.enabled !== true) return;

  affiliate.configure({
    enabled: true,
    tool: config.tool || "manual-finder",
    targets: config.targets || {}
  });

  const offersByTitle = new Map(
    (config.offers || []).map((offer) => [`${offer.maker} ${offer.model}`, offer])
  );

  function currentLang() {
    const active = document.querySelector(".nw-lang-switch button.active");
    return active && active.getAttribute("data-lang") === "en" ? "en" : "ja";
  }

  function makeCommerceBlock(card) {
    const wrapper = document.createElement("div");
    wrapper.className = "mf-commerce";

    const caption = document.createElement("div");
    caption.className = "mf-commerce-caption";
    caption.textContent = currentLang() === "en"
      ? "Purchase search · Amazon affiliate"
      : "購入先を探す · Amazonアフィリエイト";

    const slot = document.createElement("div");
    slot.className = "mf-commerce-slot";
    wrapper.append(caption, slot);
    card.appendChild(wrapper);
    return { wrapper, slot };
  }

  function addOffer(card) {
    if (!(card instanceof Element) || card.dataset.mfAffiliateChecked === "1") return;
    card.dataset.mfAffiliateChecked = "1";

    const title = card.querySelector(".card-title")?.textContent?.trim() || "";
    const staticOffer = offersByTitle.get(title);

    if (staticOffer && affiliate.isActive(staticOffer.target)) {
      const { wrapper, slot } = makeCommerceBlock(card);
      const mounted = affiliate.mount({
        container: slot,
        target: staticOffer.target,
        label: currentLang() === "en" ? staticOffer.labelEn : staticOffer.labelJa,
        placement: "manual_result_commerce",
        className: "mf-amazon-link"
      });
      if (!mounted) wrapper.remove();
      return;
    }

    const template = config.modelSearchTemplate;
    if (!template || !affiliate.isActive(template.activationTarget) || typeof config.buildModelSearchUrl !== "function") return;

    const maker = String(card.dataset.maker || "").trim();
    const model = String(card.dataset.model || "").trim();
    const category = String(card.dataset.category || "").trim();
    const url = config.buildModelSearchUrl({ maker, model, category });
    if (!url) return;

    const { wrapper, slot } = makeCommerceBlock(card);
    const mounted = affiliate.mountUrl({
      container: slot,
      target: template.activationTarget,
      url,
      label: currentLang() === "en" ? `Find ${maker} ${model} on Amazon` : `Amazonで ${maker} ${model} を探す`,
      placement: "manual_result_commerce",
      className: "mf-amazon-link"
    });
    if (!mounted) wrapper.remove();
  }

  function refreshCards() {
    results.querySelectorAll(".card").forEach(addOffer);
  }

  function refreshDisclosure() {
    const hasStatic = (config.offers || []).some((offer) => affiliate.isActive(offer.target));
    const hasDynamic = Boolean(config.modelSearchTemplate && affiliate.isActive(config.modelSearchTemplate.activationTarget));
    if (!hasStatic && !hasDynamic) return;

    let box = document.getElementById("manualFinderAmazonDisclosure");
    if (!box) {
      box = document.createElement("div");
      box.id = "manualFinderAmazonDisclosure";
      box.className = "mf-affiliate-disclosure";
      results.closest(".panel")?.appendChild(box);
    }
    if (!box.isConnected) return;

    affiliate.renderDisclosure(box, { includeEnglish: currentLang() === "en" });
  }

  function refresh() {
    refreshCards();
    refreshDisclosure();
  }

  const observer = new MutationObserver(refresh);
  observer.observe(results, { childList: true });

  refresh();
})();
