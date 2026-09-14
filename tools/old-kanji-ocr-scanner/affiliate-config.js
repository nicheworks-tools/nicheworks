(() => {
  "use strict";

  const TRACKING_ID = "nicheworks09-22";
  const AMAZON_SEARCH_BASE = "https://www.amazon.co.jp/s";

  function buildSearchUrl(query) {
    const url = new URL(AMAZON_SEARCH_BASE);
    url.searchParams.set("k", query);
    url.searchParams.set("tag", TRACKING_ID);
    return url.toString();
  }

  const searches = Object.freeze({
    book_scanner: Object.freeze({
      query: "ブックスキャナー 非破壊",
      labelJa: "非破壊ブックスキャナーをAmazonで探す",
      labelEn: "Find non-destructive book scanners on Amazon"
    }),
    magnifier: Object.freeze({
      query: "古文書 ルーペ",
      labelJa: "古文書用のルーペをAmazonで探す",
      labelEn: "Find document magnifiers on Amazon"
    })
  });

  const targets = Object.fromEntries(
    Object.entries(searches).map(([key, item]) => [key, buildSearchUrl(item.query)])
  );

  window.NWOldKanjiOcrAffiliate = Object.freeze({
    enabled: true,
    provider: "amazon",
    trackingId: TRACKING_ID,
    targets: Object.freeze(targets),
    searches,
    buildSearchUrl
  });
})();
