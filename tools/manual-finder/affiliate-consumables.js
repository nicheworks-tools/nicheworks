(() => {
  "use strict";

  const row = (model, sourceUrl, offers) => Object.freeze({
    maker: "Brother",
    model,
    category: "プリンター・複合機",
    verifiedAt: "2026-09-13",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl,
    offers: Object.freeze(offers.map((offer) => Object.freeze(offer)))
  });

  const ink = (key, query, labelJa, labelEn) => ({
    key,
    kind: "ink_search",
    query,
    labelJa,
    labelEn
  });

  window.MANUALFINDER_PRINTER_CONSUMABLES = Object.freeze([
    row("MFC-J1500N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj1500/", [
      ink("lc3133", "Brother LC3133", "Amazonで LC3133 インクを探す", "Find Brother LC3133 ink on Amazon"),
      ink("lc3135", "Brother LC3135", "Amazonで LC3135 インクを探す", "Find Brother LC3135 ink on Amazon")
    ]),
    row("MFC-J1605DN", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj1605/", [
      ink("lc3133", "Brother LC3133", "Amazonで LC3133 インクを探す", "Find Brother LC3133 ink on Amazon"),
      ink("lc3135", "Brother LC3135", "Amazonで LC3135 インクを探す", "Find Brother LC3135 ink on Amazon")
    ]),
    row("MFC-J4440N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4440n/accessory/index.aspx", [
      ink("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      ink("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    row("MFC-J4443N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4443n/accessory/index.aspx", [
      ink("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      ink("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    row("MFC-J4450N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4450n/accessory/index.aspx", [
      ink("lc516", "Brother LC516", "Amazonで LC516 インクを探す", "Find Brother LC516 ink on Amazon"),
      ink("lc516xl", "Brother LC516XL", "Amazonで LC516XL インクを探す", "Find Brother LC516XL ink on Amazon")
    ]),
    row("MFC-J4510N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj4510/", [
      ink("lc113", "Brother LC113", "Amazonで LC113 インクを探す", "Find Brother LC113 ink on Amazon"),
      ink("lc117-115", "Brother LC117 LC115", "Amazonで LC117 / LC115 インクを探す", "Find Brother LC117 / LC115 ink on Amazon")
    ]),
    row("MFC-J4540N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4540n/accessory/index.aspx", [
      ink("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      ink("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    row("MFC-J4543N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4543n/accessory/index.aspx", [
      ink("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      ink("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    row("MFC-J4720N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj4720/", [
      ink("lc213", "Brother LC213", "Amazonで LC213 インクを探す", "Find Brother LC213 ink on Amazon"),
      ink("lc217-215", "Brother LC217 LC215", "Amazonで LC217 / LC215 インクを探す", "Find Brother LC217 / LC215 ink on Amazon")
    ]),
    row("MFC-J4725N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4725n/accessory/index.aspx", [
      ink("lc213", "Brother LC213", "Amazonで LC213 インクを探す", "Find Brother LC213 ink on Amazon"),
      ink("lc217-215", "Brother LC217 LC215", "Amazonで LC217 / LC215 インクを探す", "Find Brother LC217 / LC215 ink on Amazon")
    ]),
    row("MFC-J6995CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6995cdw/accessory/index.aspx", [
      ink("lc3129", "Brother LC3129", "Amazonで LC3129 インクを探す", "Find Brother LC3129 ink on Amazon")
    ]),
    row("MFC-J6997CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6997cdw/accessory/index.aspx", [
      ink("lc3139", "Brother LC3139", "Amazonで LC3139 インクを探す", "Find Brother LC3139 ink on Amazon")
    ]),
    row("MFC-J6999CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6999cdw/accessory/index.aspx", [
      ink("lc3139", "Brother LC3139", "Amazonで LC3139 インクを探す", "Find Brother LC3139 ink on Amazon")
    ])
  ]);
})();
