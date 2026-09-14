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
    dictionary: Object.freeze({
      query: "旧字体 異体字 辞典",
      labelJa: "旧字体・異体字の辞典をAmazonで探す",
      labelEn: "Find old/variant kanji dictionaries on Amazon"
    }),
    magnifier: Object.freeze({
      query: "古文書 ルーペ",
      labelJa: "古文書用のルーペをAmazonで探す",
      labelEn: "Find document magnifiers on Amazon"
    }),
    book_stand: Object.freeze({
      query: "書見台 ブックスタンド",
      labelJa: "書見台・ブックスタンドをAmazonで探す",
      labelEn: "Find book stands on Amazon"
    })
  });

  const targets = Object.fromEntries(
    Object.entries(searches).map(([key, item]) => [key, buildSearchUrl(item.query)])
  );

  window.NWOldKanjiReferenceAffiliate = Object.freeze({
    enabled: true,
    provider: "amazon",
    trackingId: TRACKING_ID,
    targets: Object.freeze(targets),
    searches,
    buildSearchUrl
  });
})();
