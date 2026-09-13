import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app-final.js', import.meta.url), 'utf8');
const closePattern = /\n\}\)\(\);\s*$/;
assert.match(source, closePattern, 'weatherdiff test export hook must match production IIFE');
source = source.replace(
  closePattern,
  `\n  globalThis.__test = { resolveLocation, makeOpenMeteoDay, calcMetDay, applyOneDiff, isFiniteNumber, round1, kmhToMs, formatValue, codeToIcon, mapMetSymbolToIcon };\n})();`,
);

function makeElement() {
  return {
    textContent: '',
    value: '',
    hidden: false,
    disabled: false,
    readOnly: false,
    href: '',
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    setAttribute() {},
    replaceChildren() {},
    append() {},
    querySelector() { return null; },
  };
}

const documentStub = {
  documentElement: { lang: 'ja' },
  addEventListener() {},
  getElementById() { return makeElement(); },
  querySelectorAll() { return []; },
  createElement() { return makeElement(); },
  createTextNode(text) { return { textContent: text }; },
};

const storage = new Map();
const sandbox = {
  console,
  document: documentStub,
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  },
  navigator: {},
  location: { protocol: 'https:' },
  performance: { now: () => 0 },
  fetch: async () => { throw new Error('network not expected in pure behavior test'); },
  setTimeout,
  clearTimeout,
  URL,
  Date,
  encodeURIComponent,
};

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/weatherdiff/app-final.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

assert.equal(api.round1(12.345), 12.3);
assert.equal(api.round1('8.96'), 9);
assert.equal(api.round1(undefined), null);
assert.ok(Math.abs(api.kmhToMs(36) - 10) < 1e-12);
assert.equal(api.kmhToMs(undefined), null);
assert.equal(api.formatValue(2), '2.0');
assert.equal(api.formatValue(undefined), '-');

assert.equal(api.codeToIcon(0), '☀️');
assert.equal(api.codeToIcon(2), '🌤️');
assert.equal(api.codeToIcon(45), '🌫️');
assert.equal(api.codeToIcon(63), '🌧️');
assert.equal(api.codeToIcon(73), '❄️');
assert.equal(api.codeToIcon(999), '☁️');
assert.equal(api.mapMetSymbolToIcon('clearsky_day'), '☀️');
assert.equal(api.mapMetSymbolToIcon('partlycloudy_night'), '🌤️');
assert.equal(api.mapMetSymbolToIcon('heavyrain'), '🌧️');
assert.equal(api.mapMetSymbolToIcon('snowshowers_day'), '❄️');
assert.equal(api.mapMetSymbolToIcon('fog'), '☁️');

const omDay = JSON.parse(JSON.stringify(api.makeOpenMeteoDay({
  temperature_2m_max: [31.26],
  temperature_2m_min: [22.84],
  precipitation_sum: [3.26],
  wind_speed_10m_max: [36],
  weathercode: [61],
}, 0)));
assert.deepEqual(omDay, { max: 31.3, min: 22.8, rain: 3.3, wind: 10, icon: '🌧️' });

const block = [
  {
    data: {
      instant: { details: { air_temperature: 20.2, wind_speed: 3.1 } },
      next_1_hours: { details: { precipitation_amount: 0.5 } },
      next_6_hours: { summary: { symbol_code: 'partlycloudy_day' } },
    },
  },
  {
    data: {
      instant: { details: { air_temperature: 25.8, wind_speed: 7.4 } },
      next_6_hours: { details: { precipitation_amount: 1.2 }, summary: { symbol_code: 'rain' } },
    },
  },
];
const metDay = JSON.parse(JSON.stringify(api.calcMetDay(block)));
assert.deepEqual(metDay, { max: 25.8, min: 20.2, rain: 1.7, wind: 7.4, icon: '🌤️' });
assert.deepEqual(
  JSON.parse(JSON.stringify(api.calcMetDay([]))),
  { max: null, min: null, rain: 0, wind: 0, icon: '☁️' },
  'empty MET blocks should produce the explicit neutral fallback',
);

const diffEl = makeElement();
api.applyOneDiff(diffEl, 'High temp', 31.3, 28.8, '°C');
assert.equal(diffEl.textContent, 'High temp: 2.5°C');
api.applyOneDiff(diffEl, 'High temp', undefined, 28.8, '°C');
assert.equal(diffEl.textContent, 'High temp: -');

const direct = await api.resolveLocation({ lat: '35.6812', lon: '139.7671' });
assert.equal(direct.lat, 35.6812);
assert.equal(direct.lon, 139.7671);
assert.equal(direct.displayName, '');

console.log('WeatherDiff behavior test passed.');
