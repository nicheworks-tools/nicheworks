import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const appSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const phonePayload = JSON.parse(fs.readFileSync(new URL('../data/phones.json', import.meta.url), 'utf8'));
const accessoryPayload = JSON.parse(fs.readFileSync(new URL('../data/accessories.json', import.meta.url), 'utf8'));

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  toggle(name, force) {
    if (force === true) { this.values.add(name); return true; }
    if (force === false) { this.values.delete(name); return false; }
    if (this.values.has(name)) { this.values.delete(name); return false; }
    this.values.add(name); return true;
  }
  contains(name) { return this.values.has(name); }
}

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.value = '';
    this.hidden = false;
    this.placeholder = '';
    this.dataset = {};
    this.style = {};
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this._innerHTML = '';
    this.onInnerHTML = null;
    this.focused = false;
  }
  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
    this.onInnerHTML?.(this._innerHTML);
  }
  get innerHTML() { return this._innerHTML; }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) || []) listener({ type, currentTarget: this, ...event });
  }
  click() { this.dispatch('click'); }
  focus() { this.focused = true; }
}

const allPhones = phonePayload.phones || [];
const syntheticFoldable = {
  id: 'synthetic-foldable', manufacturer: 'Samsung', model: 'Synthetic Foldable', aliases: ['Fold Fixture'], releaseYear: 2026, formFactor: 'foldable',
  dimensionsFolded: { heightMm: 155, widthMm: 68, depthMm: 13 }, dimensionsUnfolded: { heightMm: 155, widthMm: 132, depthMm: 6 },
  weightG: 240, displayInch: 7.6, waterRating: 'IPX8',
  charging: { connector: 'USB-C', battery: { capacityMah: 4400, valueClass: 'manufacturer', sourceRef: 'https://www.samsung.com/' }, wiredRecommendedW: 25, protocols: [], pps: 'unknown', wirelessStandard: 'Qi', wirelessMaxW: 15 },
  included: { cable: 'included', adapter: 'not_included' }, sources: { specificationsUrl: 'https://www.samsung.com/', manualUrl: 'https://www.samsung.com/', verifiedAt: '2026-09-14' }, affiliateKeys: []
};
const syntheticFoldableDepthRange = {
  id: 'synthetic-foldable-depth-range', manufacturer: 'Samsung', model: 'Synthetic Foldable Range', aliases: ['Range Fixture'], releaseYear: 2026, formFactor: 'foldable',
  dimensionsFolded: { heightMm: 165, widthMm: 72, depthMmMin: 15.9, depthMmMax: 17.1 }, dimensionsUnfolded: { heightMm: 165, widthMm: 72, depthMm: 6.9 },
  weightG: 187, displayInch: 6.7, waterRating: 'IPX8',
  charging: { connector: 'USB-C', battery: { capacityMah: 3700, valueClass: 'manufacturer', sourceRef: 'https://www.samsung.com/' }, wiredRecommendedW: 25, protocols: [], pps: 'unknown', wirelessStandard: 'Qi', wirelessMaxW: 15 },
  included: { cable: 'included', adapter: 'not_included' }, sources: { specificationsUrl: 'https://www.samsung.com/', manualUrl: 'https://www.samsung.com/', verifiedAt: '2026-09-14' }, affiliateKeys: []
};
const byId = new Map([...allPhones, syntheticFoldable, syntheticFoldableDepthRange].map((phone) => [phone.id, phone]));

function requirePhones(ids) {
  return ids.map((id) => {
    const phone = byId.get(id);
    assert.ok(phone, `fixture phone missing from canonical dataset: ${id}`);
    return phone;
  });
}

async function flush() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}

async function createHarness(ids, { mobile = false, savedLang = 'ja', failFetch = false } = {}) {
  const phones = requirePhones(ids);
  const elements = Object.create(null);
  for (const id of [
    'searchInput', 'manufacturerFilter', 'connectorFilter', 'yearFilter', 'sortSelect',
    'dataState', 'phoneList', 'desktopDetail', 'sheetDetail', 'sheetBackdrop',
    'mobileSheet', 'sheetClose'
  ]) elements[id] = new FakeElement(id);

  elements.searchInput.dataset.placeholderJa = '機種名を検索';
  elements.searchInput.dataset.placeholderEn = 'Search model';
  elements.sheetBackdrop.hidden = true;
  elements.mobileSheet.hidden = true;

  const langJa = new FakeElement('langJa');
  langJa.dataset.lang = 'ja';
  const langEn = new FakeElement('langEn');
  langEn.dataset.lang = 'en';
  const phoneRows = [];

  elements.phoneList.onInnerHTML = (html) => {
    phoneRows.length = 0;
    for (const match of html.matchAll(/data-phone-id="([^"]+)"/g)) {
      const row = new FakeElement(`row-${match[1]}`);
      row.dataset.phoneId = match[1];
      phoneRows.push(row);
    }
  };

  const documentListeners = new Map();
  const document = {
    documentElement: { lang: 'ja' },
    body: { style: {} },
    querySelector(selector) {
      if (selector.startsWith('#')) return elements[selector.slice(1)] || null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '.nw-lang-switch button') return [langJa, langEn];
      if (selector === '.phone-row') return phoneRows;
      if (selector === '[data-i18n]') return [];
      return [];
    },
    addEventListener(type, listener) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(listener);
    },
    dispatch(type, event = {}) {
      for (const listener of documentListeners.get(type) || []) listener({ type, ...event });
    }
  };

  const storage = new Map(savedLang ? [['nw_lang', savedLang]] : []);
  const localStorage = {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  };

  const window = {
    location: { href: 'https://nicheworks.app/tools/phone-quickcheck/' },
    matchMedia: () => ({ matches: mobile })
  };
  window.document = document;
  window.localStorage = localStorage;

  const fetch = async (url) => {
    if (failFetch) return { ok: false, json: async () => ({}) };
    const href = String(url);
    if (href.includes('phones.json')) return { ok: true, json: async () => ({ phones }) };
    if (href.includes('accessories.json')) return { ok: true, json: async () => accessoryPayload };
    return { ok: false, json: async () => ({}) };
  };

  const sandbox = {
    window,
    document,
    navigator: { language: 'ja-JP' },
    localStorage,
    fetch,
    URL,
    console,
    setTimeout,
    clearTimeout
  };
  vm.createContext(sandbox);
  vm.runInContext(appSource, sandbox, { filename: 'tools/phone-quickcheck/app.js' });

  for (const listener of documentListeners.get('DOMContentLoaded') || []) listener();
  await flush();

  return { elements, langJa, langEn, phoneRows, document, storage };
}

// Alias/model search and JP/EN switching run through the real app runtime.
{
  const h = await createHarness(['google-pixel-7', 'apple-iphone-12']);
  assert.equal(h.elements.dataState.textContent, '2機種');
  assert.match(h.elements.phoneList.innerHTML, /Pixel 7/);
  assert.match(h.elements.phoneList.innerHTML, /iPhone 12/);

  h.elements.searchInput.value = 'ピクセル7';
  h.elements.searchInput.dispatch('input');
  assert.match(h.elements.phoneList.innerHTML, /Pixel 7/);
  assert.doesNotMatch(h.elements.phoneList.innerHTML, /iPhone 12/);

  h.elements.searchInput.value = 'iPhone12';
  h.elements.searchInput.dispatch('input');
  assert.match(h.elements.phoneList.innerHTML, /iPhone 12/);
  assert.doesNotMatch(h.elements.phoneList.innerHTML, /Pixel 7/);

  h.langEn.click();
  assert.equal(h.document.documentElement.lang, 'en');
  assert.equal(h.elements.searchInput.placeholder, 'Search model');
  assert.equal(h.elements.dataState.textContent, '2 models');
}

// Verified battery capacity produces the maintained 67%-efficiency estimates.
{
  const h = await createHarness(['google-pixel-7']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /4355 mAh/);
  assert.match(html, /約 0\.8回/);
  assert.match(html, /約 1\.5回/);
  assert.match(html, /約 3\.1回/);
  assert.match(html, /20W/);
}

// Apple mAh remains unknown, so recharge counts are not fabricated; Lightning guidance is present.
{
  const h = await createHarness(['apple-iphone-12']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /バッテリー容量が未確認のため算出していません。/);
  assert.match(html, /USB-C ⇔ Lightning ケーブル/);
  assert.match(html, /USB-PD対応 20W以上の充電器/);
  assert.doesNotMatch(html, /charge-card/);
}

// Proprietary fast charging is shown as device-side max without inventing a generic USB-PD recommendation.
{
  const h = await createHarness(['xiaomi-redmi-note-13-pro-plus-5g']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /120W/);
  assert.match(html, /HyperCharge/);
  assert.match(html, /Xiaomi HyperCharge \/ TurboCharge対応充電器/);
  assert.doesNotMatch(html, /USB-PD対応 30W以上の充電器/);
  assert.doesNotMatch(html, /USB-PD対応 45W以上の充電器/);
}

// Proprietary charger families resolve to their own accessory classes.
{
  const oppo = await createHarness(['oppo-a77']);
  assert.match(oppo.elements.desktopDetail.innerHTML, /OPPO SUPERVOOC対応充電器/);
  assert.doesNotMatch(oppo.elements.desktopDetail.innerHTML, /USB-PD対応 30W以上の充電器/);

  const motorola = await createHarness(['motorola-edge-50-pro']);
  assert.match(motorola.elements.desktopDetail.innerHTML, /Motorola TurboPower対応充電器/);
}

// On mobile, selecting another row opens the bottom sheet with that phone's real detail content; close restores it.
{
  const h = await createHarness(['google-pixel-7', 'apple-iphone-12'], { mobile: true });
  const iphoneRow = h.phoneRows.find((row) => row.dataset.phoneId === 'apple-iphone-12');
  assert.ok(iphoneRow, 'iPhone row should exist in the rendered mobile list');
  iphoneRow.click();
  assert.equal(h.elements.mobileSheet.hidden, false);
  assert.equal(h.elements.sheetBackdrop.hidden, false);
  assert.equal(h.elements.mobileSheet.classList.contains('open'), true);
  assert.match(h.elements.sheetDetail.innerHTML, /iPhone 12/);
  assert.match(h.elements.sheetDetail.innerHTML, /USB-C ⇔ Lightning ケーブル/);
  assert.equal(h.document.body.style.overflow, 'hidden');

  h.elements.sheetClose.click();
  assert.equal(h.elements.mobileSheet.hidden, true);
  assert.equal(h.elements.sheetBackdrop.hidden, true);
  assert.equal(h.document.body.style.overflow, '');
}

// 18W USB-PD guidance resolves to the 20W accessory class, not an overstated 30W class.
{
  const h = await createHarness(['oppo-reno5-a', 'xiaomi-redmi-12-5g']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /USB-PD対応 20W以上の充電器/);
  assert.doesNotMatch(html, /USB-PD対応 30W以上の充電器/);
}

// Canonical foldable data proves the production schema with manufacturer-verified dimensions and charging facts.
{
  const h = await createHarness(['google-pixel-11-pro-fold']);
  assert.ok(h.elements.phoneList.innerHTML.includes('155.2 × 76 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /155\.2 × 76 × 10\.1 mm/);
  assert.match(html, /155\.2 × 150\.4 × 5 mm/);
  assert.match(html, /239 g/);
  assert.match(html, /4806 mAh/);
  assert.match(html, /30W/);
  assert.match(html, /PPS/);
  assert.match(html, /Qi2\.2 \/ 25W/);
}

// A production clamshell foldable keeps folded height distinct and resolves Samsung charging classes.
{
  const h = await createHarness(['samsung-galaxy-z-flip7']);
  assert.ok(h.elements.phoneList.innerHTML.includes('85.5 × 75.2 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /85\.5 × 75\.2 × 13\.7 mm/);
  assert.match(html, /166\.7 × 75\.2 × 6\.5 mm/);
  assert.match(html, /188 g/);
  assert.match(html, /4300 mAh/);
  assert.match(html, /25W/);
  assert.match(html, /Super Fast Charging/);
  assert.match(html, /Qi \/ 15W/);
  assert.match(html, /Galaxy Super Fast Charging対応 25W充電器/);
}

// Pixel Fold proves charger guidance and device-side maximum stay separate on real foldable data.
{
  const h = await createHarness(['google-pixel-fold']);
  assert.ok(h.elements.phoneList.innerHTML.includes('139.7 × 79.5 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /139\.7 × 79\.5 × 12\.1 mm/);
  assert.match(html, /139\.7 × 158\.7 × 5\.8 mm/);
  assert.match(html, /4821 mAh/);
  assert.match(html, /充電器目安<\/span><b>30W\+/);
  assert.match(html, /端末側の有線充電上限<\/span><b>18W/);
  assert.match(html, /PPS/);
  assert.match(html, /Qi \/ 7\.5W/);
  assert.match(html, /PPS対応 30W以上の充電器/);
}

// Motorola razr fold uses JP-market store charging facts and keeps TurboPower proprietary.
{
  const h = await createHarness(['motorola-razr-fold']);
  assert.ok(h.elements.phoneList.innerHTML.includes('160.05 × 73.6 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /160\.05 × 73\.6 × 9\.89 mm/);
  assert.match(html, /160\.05 × 144\.47 × 4\.55 mm/);
  assert.match(html, /243 g/);
  assert.match(html, /6000 mAh/);
  assert.match(html, /端末側の有線充電上限<\/span><b>80W/);
  assert.match(html, /TurboPower/);
  assert.match(html, /Qi \/ 15W/);
  assert.match(html, /Motorola TurboPower対応充電器/);
  assert.doesNotMatch(html, /充電器目安<\/span><b>80W\+/);
}

// Motorola razr 60 ultra preserves its 68W TurboPower and 30W Qi class.
{
  const h = await createHarness(['motorola-razr-60-ultra']);
  assert.ok(h.elements.phoneList.innerHTML.includes('88.12 × 73.99 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /88\.12 × 73\.99 × 15\.69 mm/);
  assert.match(html, /171\.48 × 73\.99 × 7\.19 mm/);
  assert.match(html, /199 g/);
  assert.match(html, /4700 mAh/);
  assert.match(html, /端末側の有線充電上限<\/span><b>68W/);
  assert.match(html, /TurboPower/);
  assert.match(html, /Qi \/ 30W/);
  assert.match(html, /Motorola TurboPower対応充電器/);
}

// First-generation Galaxy Fold SCV44 keeps JP-market hardware facts and Adaptive Fast Charging distinct from SFC.
{
  const h = await createHarness(['samsung-galaxy-fold-scv44']);
  assert.ok(h.elements.phoneList.innerHTML.includes('160.9 × 62.8 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /160\.9 × 62\.8 × 15\.7–17\.1 mm/);
  assert.match(html, /160\.9 × 117\.9 × 6\.9–7\.6 mm/);
  assert.match(html, /276 g/);
  assert.match(html, /4380 mAh/);
  assert.match(html, /充電器目安<\/span><b>15W\+/);
  assert.match(html, /端末側の有線充電上限<\/span><b>15W/);
  assert.ok(html.includes('Adaptive Fast Charging / QC2.0'));
  assert.match(html, /Galaxy Adaptive Fast Charging対応 15W充電器/);
  assert.doesNotMatch(html, /Galaxy Super Fast Charging対応 25W充電器/);
}

// Galaxy Z Fold2 5G proves production data can preserve depth ranges in both folded and unfolded states.
{
  const h = await createHarness(['samsung-galaxy-z-fold2-5g']);
  assert.ok(h.elements.phoneList.innerHTML.includes('159.2 × 68 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /159\.2 × 68 × 13\.8–16\.8 mm/);
  assert.match(html, /159\.2 × 128\.2 × 6–6\.9 mm/);
  assert.match(html, /282 g/);
  assert.match(html, /4500 mAh/);
  assert.match(html, /充電器目安<\/span><b>25W\+/);
  assert.match(html, /Super Fast Charging/);
  assert.match(html, /端末側の有線充電上限<\/span><b>25W/);
}

// Galaxy Z Fold3 5G preserves the older hinge-depth range and model-specific 10W wireless maximum.
{
  const h = await createHarness(['samsung-galaxy-z-fold3-5g']);
  assert.ok(h.elements.phoneList.innerHTML.includes('158.2 × 67.1 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /158\.2 × 67\.1 × 14\.4–16 mm/);
  assert.match(html, /158\.2 × 128\.1 × 6\.4 mm/);
  assert.match(html, /271 g/);
  assert.match(html, /4400 mAh/);
  assert.match(html, /充電器目安<\/span><b>25W\+/);
  assert.match(html, /端末側の有線充電上限<\/span><b>25W/);
  assert.match(html, /Super Fast Charging/);
  assert.match(html, /Qi \/ 10W/);
}

// Galaxy Z Fold4 proves production data preserves an official folded-thickness range.
{
  const h = await createHarness(['samsung-galaxy-z-fold4']);
  assert.ok(h.elements.phoneList.innerHTML.includes('155.1 × 67.1 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /155\.1 × 67\.1 × 14\.2–15\.8 mm/);
  assert.match(html, /155\.1 × 130\.1 × 6\.3 mm/);
  assert.match(html, /263 g/);
  assert.match(html, /4400 mAh/);
  assert.match(html, /充電器目安<\/span><b>25W\+/);
  assert.match(html, /端末側の有線充電上限<\/span><b>25W/);
  assert.match(html, /Super Fast Charging/);
  assert.match(html, /Qi \/ 15W/);
}

// Foldable depth ranges render without collapsing an official variable-thickness specification.
{
  const h = await createHarness(['synthetic-foldable-depth-range']);
  assert.ok(h.elements.phoneList.innerHTML.includes('165 × 72 mm (折りたたみ時)'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('165 × 72 × 15.9–17.1 mm'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('165 × 72 × 6.9 mm'));
  h.langEn.click();
  assert.ok(h.elements.desktopDetail.innerHTML.includes('165 × 72 × 15.9–17.1 mm'));
}

// Samsung charging protocol labels must come from canonical source-backed protocols, not wattage inference.
{
  const h = await createHarness(['synthetic-foldable']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /規格<\/span><b>—/);
}

// Charger guidance must never be promoted to a handset-side wired maximum without wiredMaxW.
{
  const h = await createHarness(['synthetic-foldable']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /充電器目安<\/span><b>25W\+/);
  assert.doesNotMatch(html, /端末側の有線充電上限<\/span><b>25W/);
}

// Foldable schema renders both physical states and keeps folded dimensions in the list.
{
  const h = await createHarness(['synthetic-foldable']);
  assert.ok(h.elements.phoneList.innerHTML.includes('155 × 68 mm (折りたたみ時)'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('外形寸法（折りたたみ時）'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('155 × 68 × 13 mm'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('外形寸法（展開時）'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('155 × 132 × 6 mm'));
  h.langEn.click();
  assert.ok(h.elements.desktopDetail.innerHTML.includes('Dimensions (folded)'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('Dimensions (unfolded)'));
}

// Legacy Japan-market Motorola foldables preserve official dimensions and proprietary TurboPower charging.
{
  const h = await createHarness(['motorola-razr-40-ultra']);
  assert.ok(h.elements.phoneList.innerHTML.includes('88.42 × 73.95 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /88\.42 × 73\.95 × 15\.1 mm/);
  assert.match(html, /170\.83 × 73\.95 × 6\.99 mm/);
  assert.match(html, /3800 mAh/);
  assert.match(html, /30W/);
  assert.match(html, /TurboPower/);
  assert.match(html, /Qi \/ 5W/);
}

// Current Y!mobile nubia Flip generation keeps carrier-published PPS and 33W device-side charging facts.
{
  const h = await createHarness(['zte-nubia-flip-3']);
  assert.ok(h.elements.phoneList.innerHTML.includes('87 × 76 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /87 × 76 × 15\.9 mm/);
  assert.match(html, /170 × 76 × 7\.5 mm/);
  assert.match(html, /4610 mAh/);
  assert.match(html, /33W/);
  assert.match(html, /PPS/);
}

// Japan-market OPPO Find N6 preserves foldable dimensions and proprietary wired/wireless charging classes.
{
  const h = await createHarness(['oppo-find-n6']);
  assert.ok(h.elements.phoneList.innerHTML.includes('160 × 74 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /160 × 74 × 8\.9 mm/);
  assert.match(html, /160 × 146 × 4\.2 mm/);
  assert.match(html, /6000 mAh/);
  assert.match(html, /80W/);
  assert.match(html, /SUPERVOOC/);
  assert.match(html, /AIRVOOC \/ 50W/);
}

// Japan-market motorola razr 5G preserves legacy foldable dimensions and 15W TurboPower semantics.
{
  const h = await createHarness(['motorola-razr-5g']);
  assert.ok(h.elements.phoneList.innerHTML.includes('91.7 × 72.6 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /91\.7 × 72\.6 × 16 mm/);
  assert.match(html, /169\.2 × 72\.6 × 7\.9 mm/);
  assert.match(html, /2800 mAh/);
  assert.match(html, /15W/);
  assert.match(html, /TurboPower/);
}

// Japan-market nubia Fold preserves foldable dimensions, 55W handset max, PPS, and carrier-proven package exclusions.
{
  const h = await createHarness(['zte-nubia-fold']);
  assert.ok(h.elements.phoneList.innerHTML.includes('160 × 73 mm (折りたたみ時)'));
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /160 × 73 × 11\.1 mm/);
  assert.match(html, /160 × 144 × 5\.4 mm/);
  assert.match(html, /6560 mAh/);
  assert.match(html, /55W/);
  assert.match(html, /PPS/);
  assert.match(html, /IPX4 \/ IP5X/);
}

// Samsung package closure: exact Japan-market carrier evidence.
{
  const s21Ultra = byId.get('samsung-galaxy-s21-ultra-5g');
  assert.ok(s21Ultra, 'Galaxy S21 Ultra fixture missing');
  assert.equal(s21Ultra.included?.cable, 'included');

  const a41 = byId.get('samsung-galaxy-a41');
  assert.ok(a41, 'Galaxy A41 fixture missing');
  assert.equal(a41.included?.adapter, 'not_included');
}

// AQUOS wish SoftBank-aligned canonical package: charger included, USB cable not included.
{
  const wish = byId.get('sharp-aquos-wish');
  assert.ok(wish, 'AQUOS wish fixture missing');
  assert.equal(wish.included?.adapter, 'included');
  assert.equal(wish.included?.cable, 'not_included');
}

// Galaxy M23 5G: Japan-market KDDI/povo primary material explicitly states no water/dust resistance.
{
  const phone = byId.get('samsung-galaxy-m23-5g');
  assert.ok(phone, 'Galaxy M23 5G fixture missing');
  assert.equal(phone.waterStatus, 'not_resistant');
  assert.match(phone.sources?.waterUrl || '', /^https:\/\/povo\.jp\//);
  const h = await createHarness(['samsung-galaxy-m23-5g']);
  assert.match(h.elements.desktopDetail.innerHTML, /非防水・非防塵/);
}

// AQUOS zero6 SHG04: au manual explicitly lists the USB Type-C cable as not included.
{
  const phone = byId.get('sharp-aquos-zero6');
  assert.ok(phone, 'AQUOS zero6 fixture missing');
  assert.equal(phone.included?.cable, 'not_included');
  assert.equal(phone.included?.adapter, 'not_included');
}

// Pixel 8a keeps PPS unknown: exact maintained primary material supports USB-PD but not a device PPS claim.
{
  const phone = byId.get('google-pixel-8a');
  assert.ok(phone, 'Pixel 8a fixture missing');
  assert.equal(phone.charging?.pps, 'unknown');
  assert.deepEqual(phone.charging?.protocols, ['USB PD']);
  const h = await createHarness(['google-pixel-8a']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /規格<\/span><b>USB PD/);
  assert.match(html, /PPS<\/span><b>不明/);
}

console.log('Phone QuickCheck behavior tests passed: search/i18n, recharge estimates, Apple unknown capacity, Lightning guidance, proprietary charging, and mobile sheet.');

// Explicit manufacturer-backed non-resistance is localized; model-specific unknown remains unknown.
{
  const explicitIds = ['samsung-galaxy-z-fold2-5g', 'samsung-galaxy-z-flip', 'samsung-galaxy-fold-scv44'];
  for (const id of explicitIds) {
    const phone = byId.get(id);
    assert.ok(phone, `fixture phone missing: ${id}`);
    assert.equal(phone.waterRating, null);
    assert.equal(phone.waterStatus, 'not_resistant');
    assert.match(phone.sources?.waterUrl || '', /^https:\/\/www\.samsung\.com\//);
    const h = await createHarness([id]);
    assert.match(h.elements.desktopDetail.innerHTML, /非防水・非防塵/);
    h.langEn.click();
    assert.match(h.elements.desktopDetail.innerHTML, /Not water or dust resistant/);
  }

  const resolved = byId.get('samsung-galaxy-z-flip-5g');
  assert.ok(resolved, 'Galaxy Z Flip 5G fixture missing');
  assert.equal(resolved.waterStatus, 'not_resistant');
  assert.match(resolved.sources?.waterUrl || '', /^https:\/\/www\.au\.com\//);
  const h = await createHarness(['samsung-galaxy-z-flip-5g']);
  assert.match(h.elements.desktopDetail.innerHTML, /非防水・非防塵/);
}

// Galaxy Z Flip 5G preserves its source-backed 9W Qi maximum and explicit au non-resistant state.
{
  const phone = byId.get('samsung-galaxy-z-flip-5g');
  assert.ok(phone, 'Galaxy Z Flip 5G fixture missing');
  assert.equal(phone.waterStatus, 'not_resistant');
  assert.equal(phone.charging?.wirelessMaxW, 9);
  assert.match(phone.sources?.wirelessUrl || '', /^https:\/\/www\.samsung\.com\//);
  assert.match(phone.sources?.waterUrl || '', /^https:\/\/www\.au\.com\//);
  const h = await createHarness(['samsung-galaxy-z-flip-5g']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /Qi \/ 9W/);
  assert.match(html, /非防水・非防塵/);
}

// Original Galaxy Z Flip renders its Samsung-source-backed 9W Qi maximum.
{
  const phone = byId.get('samsung-galaxy-z-flip');
  assert.ok(phone, 'Galaxy Z Flip fixture missing');
  assert.equal(phone.waterStatus, 'not_resistant');
  assert.equal(phone.charging?.wirelessMaxW, 9);
  assert.match(phone.sources?.wirelessUrl || '', /^https:\/\/news\.samsung\.com\//);
  const h = await createHarness(['samsung-galaxy-z-flip']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /Qi \/ 9W/);
  assert.match(html, /非防水・非防塵/);
}

// nubia Flip 2 domestic package excludes both USB cable and AC adapter per Y!mobile.
{
  const phone = byId.get('zte-nubia-flip-2');
  assert.ok(phone, 'nubia Flip 2 fixture missing');
  assert.equal(phone.included?.cable, 'not_included');
  assert.equal(phone.included?.adapter, 'not_included');
  assert.match(phone.sources?.releaseUrl || '', /^https:\/\/www\.ymobile\.jp\//);
  const h = await createHarness(['zte-nubia-flip-2']);
  const html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /同梱ケーブル<\/span><b>別売/);
  assert.match(html, /ACアダプター<\/span><b>別売/);
}


// Final control-flow QA: manufacturer/connector/year filters and sort modes run through the real runtime.
{
  const h = await createHarness(['google-pixel-7', 'apple-iphone-12']);

  // Default newest order: Pixel 7 (2022) before iPhone 12 (2020).
  assert.ok(h.elements.phoneList.innerHTML.indexOf('Pixel 7') < h.elements.phoneList.innerHTML.indexOf('iPhone 12'));

  h.elements.manufacturerFilter.value = 'Apple';
  h.elements.manufacturerFilter.dispatch('change');
  assert.match(h.elements.phoneList.innerHTML, /iPhone 12/);
  assert.doesNotMatch(h.elements.phoneList.innerHTML, /Pixel 7/);

  h.elements.manufacturerFilter.value = 'all';
  h.elements.manufacturerFilter.dispatch('change');
  h.elements.connectorFilter.value = 'Lightning';
  h.elements.connectorFilter.dispatch('change');
  assert.match(h.elements.phoneList.innerHTML, /iPhone 12/);
  assert.doesNotMatch(h.elements.phoneList.innerHTML, /Pixel 7/);

  h.elements.connectorFilter.value = 'all';
  h.elements.connectorFilter.dispatch('change');
  h.elements.yearFilter.value = '2022';
  h.elements.yearFilter.dispatch('change');
  assert.match(h.elements.phoneList.innerHTML, /Pixel 7/);
  assert.doesNotMatch(h.elements.phoneList.innerHTML, /iPhone 12/);

  h.elements.yearFilter.value = 'all';
  h.elements.yearFilter.dispatch('change');
  h.elements.sortSelect.value = 'lightest';
  h.elements.sortSelect.dispatch('change');
  assert.ok(h.elements.phoneList.innerHTML.indexOf('iPhone 12') < h.elements.phoneList.innerHTML.indexOf('Pixel 7'));

  h.elements.sortSelect.value = 'compact';
  h.elements.sortSelect.dispatch('change');
  assert.ok(h.elements.phoneList.innerHTML.indexOf('iPhone 12') < h.elements.phoneList.innerHTML.indexOf('Pixel 7'));

  h.elements.searchInput.value = 'no-such-phone-fixture';
  h.elements.searchInput.dispatch('input');
  assert.match(h.elements.phoneList.innerHTML, /該当する機種がありません/);
}

// Data-load failure remains an explicit, readable state rather than silently rendering an empty list.
{
  const h = await createHarness(['google-pixel-7'], { failFetch: true });
  assert.equal(h.elements.dataState.textContent, 'データ読込エラー');
  assert.match(h.elements.phoneList.innerHTML, /データを読み込めませんでした/);
  assert.match(h.elements.desktopDetail.innerHTML, /データを読み込めませんでした/);
}

// Mobile dismissal paths: backdrop and Escape both close the same bottom sheet.
{
  const h = await createHarness(['google-pixel-7', 'apple-iphone-12'], { mobile: true });
  const iphoneRow = h.phoneRows.find((row) => row.dataset.phoneId === 'apple-iphone-12');
  assert.ok(iphoneRow);
  iphoneRow.click();
  assert.equal(h.elements.mobileSheet.hidden, false);
  h.elements.sheetBackdrop.click();
  assert.equal(h.elements.mobileSheet.hidden, true);

  iphoneRow.click();
  assert.equal(h.elements.mobileSheet.hidden, false);
  h.document.dispatch('keydown', { key: 'Escape' });
  assert.equal(h.elements.mobileSheet.hidden, true);
}

console.log('Phone QuickCheck final automated QA passed: controls, sort modes, empty/error states, and mobile dismissal paths.');


// 2026 freshness Wave 1: source-backed Sony and Xiaomi additions.
{
  const xperia1 = byId.get('sony-xperia-1-viii');
  assert.ok(xperia1, 'Xperia 1 VIII fixture missing');
  assert.equal(xperia1.releaseYear, 2026);
  assert.equal(xperia1.charging?.battery?.capacityMah, 5000);
  assert.equal(xperia1.charging?.wiredRecommendedW, 30);
  assert.deepEqual(xperia1.charging?.protocols, ['USB PD']);
  assert.equal(xperia1.included?.adapter, 'not_included');
  assert.equal(xperia1.included?.cable, 'not_included');
  assert.match(xperia1.sources?.packageUrl || '', /^https:\/\/www\.sony\.jp\//);

  const xperia10 = byId.get('sony-xperia-10-viii');
  assert.ok(xperia10, 'Xperia 10 VIII fixture missing');
  assert.equal(xperia10.charging?.battery?.capacityMah, 5000);
  assert.equal(xperia10.waterRating, 'IPX5/IPX8 / IP6X');
  assert.equal(xperia10.charging?.wiredRecommendedW, null);
  assert.deepEqual(xperia10.charging?.protocols, []);

  const xiaomi17t = byId.get('xiaomi-17t');
  assert.ok(xiaomi17t, 'Xiaomi 17T fixture missing');
  assert.equal(xiaomi17t.charging?.wiredMaxW, 67);
  assert.equal(xiaomi17t.charging?.pps, 'supported');
  assert.equal(xiaomi17t.charging?.battery?.capacityMah, 6500);
  assert.equal(xiaomi17t.included?.adapter, 'included');
  assert.equal(xiaomi17t.included?.cable, 'included');

  const xiaomi17tPro = byId.get('xiaomi-17t-pro');
  assert.ok(xiaomi17tPro, 'Xiaomi 17T Pro fixture missing');
  assert.equal(xiaomi17tPro.charging?.wiredMaxW, 100);
  assert.equal(xiaomi17tPro.charging?.pps, 'supported');
  assert.equal(xiaomi17tPro.charging?.battery?.capacityMah, 7000);
  assert.equal(xiaomi17tPro.charging?.wirelessStandard, 'Wireless charging');

  const h = await createHarness(['sony-xperia-1-viii', 'sony-xperia-10-viii', 'xiaomi-17t', 'xiaomi-17t-pro']);
  assert.match(h.elements.phoneList.innerHTML, /Xperia 1 VIII/);
  assert.match(h.elements.phoneList.innerHTML, /Xiaomi 17T Pro/);
}


// 2026 freshness Wave 2: non-foldable physical variants preserve exact color thickness↔weight pairs.
{
  const reno15 = byId.get('oppo-reno15-a');
  assert.ok(reno15, 'OPPO Reno15 A fixture missing');
  assert.equal(reno15.weightG, undefined);
  assert.equal(reno15.dimensions?.depthMm, undefined);
  assert.deepEqual(
    reno15.physicalVariants.map((variant) => [variant.key, variant.depthMm, variant.weightG]),
    [
      ['twilight-navy-afterglow-pink', 8.1, 195],
      ['aurora-blue', 8.3, 202]
    ]
  );
  assert.equal(reno15.charging?.wiredMaxW, 80);
  assert.equal(reno15.charging?.pps, 'supported');
  assert.equal(reno15.charging?.battery?.capacityMah, 7000);
  assert.equal(reno15.included?.cable, 'not_included');
  assert.equal(reno15.included?.adapter, 'not_included');

  const reno16 = byId.get('oppo-reno16-5g');
  assert.ok(reno16, 'OPPO Reno16 5G fixture missing');
  assert.deepEqual(
    reno16.physicalVariants.map((variant) => [variant.key, variant.depthMm, variant.weightG]),
    [
      ['twilight-purple', 8.2, 182],
      ['pop-white', 8.4, 193]
    ]
  );
  assert.equal(reno16.waterRating, 'IPX8/IPX9/IPX9K / IP6X');
  assert.equal(reno16.charging?.battery?.capacityMah, 6700);

  const h = await createHarness(['oppo-reno15-a', 'oppo-reno16-5g']);
  assert.match(h.elements.phoneList.innerHTML, /195–202 g/);
  assert.match(h.elements.phoneList.innerHTML, /182–193 g/);

  const reno16Row = h.phoneRows.find((row) => row.dataset.phoneId === 'oppo-reno16-5g');
  assert.ok(reno16Row, 'Reno16 list row missing');
  reno16Row.click();
  let html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /151 × 72 × 8\.2–8\.4 mm/);
  assert.match(html, /トワイライトパープル/);
  assert.match(html, /8\.2 mm \/ 182 g/);
  assert.match(html, /ポップホワイト/);
  assert.match(html, /8\.4 mm \/ 193 g/);

  h.langEn.click();
  html = h.elements.desktopDetail.innerHTML;
  assert.match(html, /Twilight Purple/);
  assert.match(html, /Pop White/);

  h.elements.sortSelect.value = 'lightest';
  h.elements.sortSelect.dispatch('change');
  assert.ok(
    h.elements.phoneList.innerHTML.indexOf('OPPO Reno16 5G') < h.elements.phoneList.innerHTML.indexOf('OPPO Reno15 A'),
    'lightest sort must use the minimum published physical-variant weight'
  );
}

// Post-v1 2026 maintenance Wave 3.
{
  const a57 = byId.get('samsung-galaxy-a57-5g');
  assert.ok(a57, 'Galaxy A57 5G fixture missing');
  assert.equal(a57.releaseYear, 2026);
  assert.equal(a57.weightG, 179);
  assert.equal(a57.charging?.wiredMaxW, 45);
  assert.equal(a57.included?.cable, 'not_included');
  assert.equal(a57.included?.adapter, 'not_included');
  assert.equal(a57.waterRating, 'IP68');

  const r11 = byId.get('sharp-aquos-r11');
  assert.ok(r11, 'AQUOS R11 fixture missing');
  assert.equal(r11.charging?.battery?.capacityMah, 5100);
  assert.equal(r11.charging?.wiredRecommendedW, 36);
  assert.equal(r11.included?.cable, 'unknown');
  assert.equal(r11.included?.adapter, 'unknown');

  const wish6 = byId.get('sharp-aquos-wish6');
  assert.ok(wish6, 'AQUOS wish6 fixture missing');
  assert.equal(wish6.charging?.battery?.capacityMah, 5000);
  assert.equal(wish6.charging?.wiredRecommendedW, 27);
  assert.equal(wish6.waterRating, 'IPX5/IPX8/IPX9 / IP6X');

  const g37j = byId.get('motorola-moto-g37j');
  assert.ok(g37j, 'moto g37j fixture missing');
  assert.equal(g37j.charging?.wiredMaxW, 20);
  assert.equal(g37j.physicalVariants?.length, 4);
  assert.deepEqual(g37j.physicalVariants?.map((variant) => variant.weightG), [194, 196, 196, 196]);
  const h = await createHarness(['motorola-moto-g37j']);
  assert.match(h.elements.desktopDetail.innerHTML, /194–196 g/);
  assert.match(h.elements.desktopDetail.innerHTML, /インペネトラブルグレイ/);
}

