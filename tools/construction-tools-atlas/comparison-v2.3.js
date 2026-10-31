(() => {
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const helper = window.NWAmazonAffiliate;
  if (!helper) return;
  const boxes = [...document.querySelectorAll("[data-affiliate-entry]")];
  const targets = Object.fromEntries(boxes.map(box => [box.dataset.affiliateEntry, box.dataset.affiliateUrl]));
  helper.configure({enabled:true,tool:"construction-tools-atlas",targets});
  for (const box of boxes) {
    helper.mountUrl({container:box.querySelector(".affiliateMount"),target:box.dataset.affiliateEntry,url:box.dataset.affiliateUrl,label:box.dataset.affiliateLabel||"Amazonで探す",placement:"static_comparison"});
  }
  helper.renderDisclosure(document.getElementById("compareDisclosure"), {includeEnglish:true});
});
})();
