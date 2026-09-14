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

async function createHarness(ids, { mobile = false, savedLang = 'ja' } = {}) {
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

// Foldable depth ranges render without collapsing an official variable-thickness specification.
{
  const h = await createHarness(['synthetic-foldable-depth-range']);
  assert.ok(h.elements.phoneList.innerHTML.includes('165 × 72 mm (折りたたみ時)'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('165 × 72 × 15.9–17.1 mm'));
  assert.ok(h.elements.desktopDetail.innerHTML.includes('165 × 72 × 6.9 mm'));
  h.langEn.click();
  assert.ok(h.elements.desktopDetail.innerHTML.includes('165 × 72 × 15.9–17.1 mm'));
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

console.log('Phone QuickCheck behavior tests passed: search/i18n, recharge estimates, Apple unknown capacity, Lightning guidance, proprietary charging, and mobile sheet.');
