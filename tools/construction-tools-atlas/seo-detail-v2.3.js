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
    const section = document.querySelector("[data-affiliate-entry]");
    const helper = window.NWAmazonAffiliate;
    if (!section || !helper) return;

    const id = section.dataset.affiliateEntry;
    const url = section.dataset.affiliateUrl;
    const mount = section.querySelector(".affiliateMount");
    const disclosure = section.querySelector(".affiliateDisclosure");
    if (!id || !url || !mount || !disclosure) return;

    helper.configure({
      enabled: true,
      tool: "construction-tools-atlas",
      targets: { [id]: url }
    });
    helper.mountUrl({
      container: mount,
      target: id,
      url,
      label: section.dataset.affiliateLabelJa || "Amazonで探す",
      placement: "static_detail"
    });
    helper.renderDisclosure(disclosure, { includeEnglish: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".copyLink").forEach((button) => {
      button.addEventListener("click", () => trackCopy(button));
    });
    mountAffiliate();
  });
})();
