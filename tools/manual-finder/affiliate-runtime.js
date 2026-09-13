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

  function addOffer(card) {
    if (!(card instanceof Element) || card.dataset.mfAffiliateChecked === "1") return;
    card.dataset.mfAffiliateChecked = "1";

    const title = card.querySelector(".card-title")?.textContent?.trim() || "";
    const offer = offersByTitle.get(title);
    if (!offer || !affiliate.isActive(offer.target)) return;

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

    const mounted = affiliate.mount({
      container: slot,
      target: offer.target,
      label: currentLang() === "en" ? offer.labelEn : offer.labelJa,
      placement: "manual_result_commerce",
      className: "mf-amazon-link"
    });

    if (!mounted) wrapper.remove();
  }

  function refreshCards() {
    results.querySelectorAll(".card").forEach(addOffer);
  }

  function refreshDisclosure() {
    const hasActiveOffer = (config.offers || []).some((offer) => affiliate.isActive(offer.target));
    if (!hasActiveOffer) return;

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
