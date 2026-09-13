(() => {
  "use strict";

  const TRACKING_ID = "nicheworks09-22";
  const AMAZON_SEARCH_BASE = "https://www.amazon.co.jp/s";

  const template = Object.freeze({
    templateId: "phone_accessory_search",
    provider: "amazon",
    kind: "amazon_search",
    status: "verified",
    verifiedAt: "2026-09-14",
    verificationMethod: "shared_link_checker_validated_tagged_search_format",
    trackingId: TRACKING_ID,
    baseUrl: AMAZON_SEARCH_BASE,
    proofUrl: "https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22",
    note: "Uses the same Link-Checker-validated Amazon Japan tagged-search format already maintained by ManualFinder. Phone QuickCheck only substitutes fixed, tool-owned accessory queries; user search text never enters the affiliate URL."
  });

  const offer = (key, target, query, labelJa, labelEn) => Object.freeze({
    key,
    target,
    query,
    labelJa,
    labelEn
  });

  const offers = Object.freeze([
    offer("cable-usbc-usbc", "cable", "USB-C USB-C ケーブル 100W", "AmazonでUSB-Cケーブルを探す", "Find a USB-C cable on Amazon"),
    offer("charger-pd-20w", "wired_charger", "USB PD 20W USB-C 充電器", "Amazonで20W USB-PD充電器を探す", "Find a 20W USB-PD charger on Amazon"),
    offer("charger-pd-40w", "wired_charger", "USB PD 40W USB-C 充電器", "Amazonで40W USB-PD充電器を探す", "Find a 40W USB-PD charger on Amazon"),
    offer("charger-avs-60w", "wired_charger", "USB PD 3.1 AVS 60W 充電器", "Amazonで60W AVS充電器を探す", "Find a 60W AVS charger on Amazon"),
    offer("charger-pps-30w", "wired_charger", "USB PD PPS 30W 充電器", "Amazonで30W PPS充電器を探す", "Find a 30W PPS charger on Amazon"),
    offer("charger-pps-45w", "wired_charger", "USB PD PPS 45W 充電器", "Amazonで45W PPS充電器を探す", "Find a 45W PPS charger on Amazon"),
    offer("charger-samsung-25w", "wired_charger", "Samsung Super Fast Charging 25W 充電器", "AmazonでGalaxy 25W充電器を探す", "Find a Galaxy 25W charger on Amazon"),
    offer("charger-samsung-45w", "wired_charger", "Samsung Super Fast Charging 2.0 45W 充電器", "AmazonでGalaxy 45W充電器を探す", "Find a Galaxy 45W charger on Amazon"),
    offer("charger-samsung-60w", "wired_charger", "Samsung Super Fast Charging 3.0 60W 充電器", "AmazonでGalaxy 60W充電器を探す", "Find a Galaxy 60W charger on Amazon"),
    offer("charger-pd-30w", "wired_charger", "USB PD 30W USB-C 充電器", "Amazonで30W USB-PD充電器を探す", "Find a 30W USB-PD charger on Amazon"),
    offer("charger-pd-45w", "wired_charger", "USB PD 45W USB-C 充電器", "Amazonで45W USB-PD充電器を探す", "Find a 45W USB-PD charger on Amazon"),
    offer("charger-qi", "wireless_charger", "Qi ワイヤレス充電器", "AmazonでQi充電器を探す", "Find a Qi charger on Amazon"),
    offer("charger-qi2", "wireless_charger", "Qi2 ワイヤレス充電器", "AmazonでQi2充電器を探す", "Find a Qi2 charger on Amazon"),
    offer("charger-qi2-case-required", "wireless_charger", "Qi2 ワイヤレス充電器", "AmazonでQi2充電器を探す", "Find a Qi2 charger on Amazon"),
    offer("powerbank-10000-usbc", "power_bank", "10000mAh USB-C モバイルバッテリー PD", "Amazonで10,000mAhモバイルバッテリーを探す", "Find a 10,000mAh power bank on Amazon")
  ]);

  const offerMap = Object.freeze(Object.fromEntries(offers.map((item) => [item.key, item])));

  function buildTaggedSearchUrl(query) {
    const url = new URL(AMAZON_SEARCH_BASE);
    url.searchParams.set("k", query);
    url.searchParams.set("tag", TRACKING_ID);
    return url.toString();
  }

  function getOffer(key) {
    const item = offerMap[String(key || "")];
    if (!item) return null;
    return Object.freeze({
      ...item,
      url: buildTaggedSearchUrl(item.query)
    });
  }

  const targets = Object.freeze({
    cable: template.proofUrl,
    wired_charger: template.proofUrl,
    wireless_charger: template.proofUrl,
    power_bank: template.proofUrl
  });

  window.NWPhoneQuickCheckAffiliate = Object.freeze({
    enabled: template.status === "verified",
    tool: "phone-quickcheck",
    provider: "amazon",
    trackingId: TRACKING_ID,
    template,
    targets,
    offers,
    getOffer
  });
})();
