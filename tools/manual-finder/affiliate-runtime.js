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

    const links = document.createElement("div");
    links.className = "mf-commerce-links";
    wrapper.append(caption, links);
    card.appendChild(wrapper);
    return { wrapper, links };
  }

  function makeSlot(links) {
    const slot = document.createElement("div");
    slot.className = "mf-commerce-slot";
    links.appendChild(slot);
    return slot;
  }

  function addVerifiedConsumableNote(wrapper) {
    const note = document.createElement("p");
    note.className = "mf-commerce-note";
    note.textContent = currentLang() === "en"
      ? "Compatible consumable codes were checked against an official manufacturer source. Confirm the exact item on Amazon before purchase."
      : "対応消耗品の型番はメーカー公式情報で確認済みです。Amazon上では購入前に商品型番をご確認ください。";
    wrapper.appendChild(note);
  }

  function addOffer(card) {
    if (!(card instanceof Element) || card.dataset.mfAffiliateChecked === "1") return;
    card.dataset.mfAffiliateChecked = "1";

    const title = card.querySelector(".card-title")?.textContent?.trim() || "";
    const staticOffer = offersByTitle.get(title);

    if (staticOffer && affiliate.isActive(staticOffer.target)) {
      const { wrapper, links } = makeCommerceBlock(card);
      const mounted = affiliate.mount({
        container: makeSlot(links),
        target: staticOffer.target,
        label: currentLang() === "en" ? staticOffer.labelEn : staticOffer.labelJa,
        placement: "manual_result_commerce",
        className: "mf-amazon-link"
      });
      if (!mounted) wrapper.remove();
      return;
    }

    const maker = String(card.dataset.maker || "").trim();
    const model = String(card.dataset.model || "").trim();
    const category = String(card.dataset.category || "").trim();

    const template = config.modelSearchTemplate;
    const modelUrl = template && affiliate.isActive(template.activationTarget) && typeof config.buildModelSearchUrl === "function"
      ? config.buildModelSearchUrl({ maker, model, category })
      : "";

    const consumableTemplate = config.consumableSearchTemplate;
    const consumables = consumableTemplate && affiliate.isActive(consumableTemplate.activationTarget) && typeof config.getConsumableOffers === "function"
      ? config.getConsumableOffers({ maker, model, category })
      : [];

    if (!modelUrl && !consumables.length) return;

    const { wrapper, links } = makeCommerceBlock(card);
    let mountedCount = 0;

    if (modelUrl) {
      const mounted = affiliate.mountUrl({
        container: makeSlot(links),
        target: template.activationTarget,
        url: modelUrl,
        label: currentLang() === "en" ? `Find ${maker} ${model} on Amazon` : `Amazonで ${maker} ${model} を探す`,
        placement: "manual_result_commerce",
        className: "mf-amazon-link"
      });
      if (mounted) mountedCount += 1;
    }

    consumables.forEach((offer) => {
      const mounted = affiliate.mountUrl({
        container: makeSlot(links),
        target: offer.target,
        url: offer.url,
        label: currentLang() === "en" ? offer.labelEn : offer.labelJa,
        placement: "manual_result_consumable",
        className: "mf-amazon-link"
      });
      if (mounted) mountedCount += 1;
    });

    if (consumables.length && mountedCount > (modelUrl ? 1 : 0)) addVerifiedConsumableNote(wrapper);
    if (!mountedCount) wrapper.remove();
  }

  function refreshCards() {
    results.querySelectorAll(".card").forEach(addOffer);
  }

  function refreshDisclosure() {
    const hasStatic = (config.offers || []).some((offer) => affiliate.isActive(offer.target));
    const hasModel = Boolean(config.modelSearchTemplate && affiliate.isActive(config.modelSearchTemplate.activationTarget));
    const hasConsumables = Boolean(config.consumableSearchTemplate && affiliate.isActive(config.consumableSearchTemplate.activationTarget));
    if (!hasStatic && !hasModel && !hasConsumables) return;

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
