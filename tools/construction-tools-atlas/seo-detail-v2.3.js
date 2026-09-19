(() => {
  "use strict";

  function trackCopy(button) {
    const url = button?.dataset?.copyUrl;
    if (!url || !navigator.clipboard) return;
    navigator.clipboard.writeText(url).then(() => {
      const previous = button.textContent;
      button.textContent = "コピー済み";
      setTimeout(() => { button.textContent = previous; }, 1200);
    }).catch(() => {});
  }

  function mountAffiliate() {
    const sections = [...document.querySelectorAll("[data-affiliate-entry]")];
    const helper = window.NWAmazonAffiliate;
    if (!sections.length || !helper) return;

    const targets = {};
    for (const section of sections) {
      const id = section.dataset.affiliateEntry;
      const url = section.dataset.affiliateUrl;
      if (id && url) targets[id] = url;
    }
    helper.configure({
      enabled: true,
      tool: "construction-tools-atlas",
      targets
    });

    for (const section of sections) {
      const id = section.dataset.affiliateEntry;
      const url = section.dataset.affiliateUrl;
      const mount = section.querySelector(".affiliateMount");
      const disclosure = section.querySelector(".affiliateDisclosure");
      if (!id || !url || !mount || !disclosure) continue;

      helper.mountUrl({
        container: mount,
        target: id,
        url,
        label: section.dataset.affiliateLabelJa || "Amazonで探す",
        placement: section.dataset.affiliatePlacement || "static_detail"
      });
      helper.renderDisclosure(disclosure, { includeEnglish: true });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".copyLink").forEach((button) => {
      button.addEventListener("click", () => trackCopy(button));
    });
    mountAffiliate();
  });
})();
