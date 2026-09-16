(() => {
  "use strict";

  const runtimeScriptUrl = document.currentScript?.src || "";
  let initialized = false;

  function loadScript(relativeUrl, isLoaded, done) {
    if (isLoaded() || !runtimeScriptUrl) {
      done();
      return;
    }

    const script = document.createElement("script");
    script.src = new URL(relativeUrl, runtimeScriptUrl).toString();
    script.async = false;
    script.onload = done;
    script.onerror = done;
    document.head.appendChild(script);
  }

  function loadCameraAccessoryLayers(done) {
    loadScript(
      "affiliate-camera-accessories.js?v=mf-camera-accessory-20260916a",
      () => Boolean(window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER),
      () => {
        loadScript(
          "affiliate-nikon-camera-accessories-wave2.js?v=mf-nikon-camera-accessory-wave2-20260916a",
          () => Boolean(window.MANUALFINDER_NIKON_CAMERA_ACCESSORY_WAVE2_LEDGER),
          done
        );
      }
    );
  }

  function init() {
    if (initialized) return;
    initialized = true;

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
        ? "Consumable compatibility was checked against an official manufacturer source. Confirm the exact item and supported model on Amazon before purchase."
        : "対応消耗品はメーカー公式情報で対象機種との対応を確認済みです。Amazon上では購入前に商品型番と対応機種をご確認ください。";
      wrapper.appendChild(note);
    }

    function addVerifiedAccessoryNote(wrapper) {
      const note = document.createElement("p");
      note.className = "mf-commerce-note";
      note.textContent = currentLang() === "en"
        ? "Accessory compatibility was checked against an official manufacturer source. Confirm the exact item and supported model on Amazon before purchase."
        : "対応アクセサリーはメーカー公式情報で対象機種との対応を確認済みです。Amazon上では購入前に商品型番と対応機種をご確認ください。";
      wrapper.appendChild(note);
    }

    function addOffer(card) {
      if (!(card instanceof Element) || card.dataset.mfAffiliateChecked === "1") return;
      card.dataset.mfAffiliateChecked = "1";

      const title = card.querySelector(".card-title")?.textContent?.trim() || "";
      const staticOffer = offersByTitle.get(title);
      const staticActive = Boolean(staticOffer && affiliate.isActive(staticOffer.target));

      const maker = String(card.dataset.maker || "").trim();
      const model = String(card.dataset.model || "").trim();
      const category = String(card.dataset.category || "").trim();

      const template = config.modelSearchTemplate;
      const modelUrl = !staticActive && template && affiliate.isActive(template.activationTarget) && typeof config.buildModelSearchUrl === "function"
        ? config.buildModelSearchUrl({ maker, model, category })
        : "";

      const consumableTemplate = config.consumableSearchTemplate;
      const consumables = consumableTemplate && affiliate.isActive(consumableTemplate.activationTarget) && typeof config.getConsumableOffers === "function"
        ? config.getConsumableOffers({ maker, model, category })
        : [];

      const accessoryTemplate = config.cameraAccessorySearchTemplate;
      const accessories = accessoryTemplate && affiliate.isActive(accessoryTemplate.activationTarget) && typeof config.getAccessoryOffers === "function"
        ? config.getAccessoryOffers({ maker, model, category })
        : [];

      if (!staticActive && !modelUrl && !consumables.length && !accessories.length) return;

      const { wrapper, links } = makeCommerceBlock(card);
      let mountedCount = 0;
      let consumableMountedCount = 0;
      let accessoryMountedCount = 0;

      if (staticActive) {
        const mounted = affiliate.mount({
          container: makeSlot(links),
          target: staticOffer.target,
          label: currentLang() === "en" ? staticOffer.labelEn : staticOffer.labelJa,
          placement: "manual_result_commerce",
          className: "mf-amazon-link"
        });
        if (mounted) mountedCount += 1;
      } else if (modelUrl) {
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
        if (mounted) {
          mountedCount += 1;
          consumableMountedCount += 1;
        }
      });

      accessories.forEach((offer) => {
        const mounted = affiliate.mountUrl({
          container: makeSlot(links),
          target: offer.target,
          url: offer.url,
          label: currentLang() === "en" ? offer.labelEn : offer.labelJa,
          placement: "manual_result_accessory",
          className: "mf-amazon-link"
        });
        if (mounted) {
          mountedCount += 1;
          accessoryMountedCount += 1;
        }
      });

      if (consumableMountedCount > 0) addVerifiedConsumableNote(wrapper);
      if (accessoryMountedCount > 0) addVerifiedAccessoryNote(wrapper);
      if (!mountedCount) wrapper.remove();
    }

    function refreshCards() {
      results.querySelectorAll(".card").forEach(addOffer);
    }

    function refreshDisclosure() {
      const hasStatic = (config.offers || []).some((offer) => affiliate.isActive(offer.target));
      const hasModel = Boolean(config.modelSearchTemplate && affiliate.isActive(config.modelSearchTemplate.activationTarget));
      const hasConsumables = Boolean(config.consumableSearchTemplate && affiliate.isActive(config.consumableSearchTemplate.activationTarget));
      const hasAccessories = Boolean(config.cameraAccessorySearchTemplate && affiliate.isActive(config.cameraAccessorySearchTemplate.activationTarget));
      if (!hasStatic && !hasModel && !hasConsumables && !hasAccessories) return;

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
  }

  loadCameraAccessoryLayers(init);
})();
