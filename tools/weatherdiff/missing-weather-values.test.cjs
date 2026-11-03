const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function runtime() {
  const source = fs.readFileSync(path.join(__dirname, 'app-final.js'), 'utf8');
  const tail = /\}\)\(\);\s*$/;
  assert.match(source, tail);
  const code = source.replace(tail, '\nwindow.weatherTest = { isFiniteNumber, round1, kmhToMs, formatValue, makeOpenMeteoDay, calcMetDay, applyOneDiff };\n})();');
  const window = {};
  vm.runInNewContext(code, {
    document: { addEventListener() {} }, window, location: { pathname: '/tools/weatherdiff/' },
    navigator: {}, localStorage: {}, Date
  });
  return window.weatherTest;
}

test('null, undefined, and missing API fields are not interpreted as numeric zero', () => {
  const h = runtime();
  for (const value of [null, undefined, '', NaN, Infinity]) {
    assert.equal(h.isFiniteNumber(value), false);
    assert.equal(h.formatValue(value), '-');
    assert.equal(h.round1(value), null);
    assert.equal(h.kmhToMs(value), null);
  }
  assert.equal(h.isFiniteNumber(0), true);
  assert.equal(h.formatValue(0), '0.0');
  assert.equal(h.round1(0), 0);
  assert.equal(h.kmhToMs(0), 0);
});

test('Open-Meteo and MET Norway missing day values render missing, not fabricated dry/windless weather', () => {
  const h = runtime();
  const om = h.makeOpenMeteoDay({
    temperature_2m_max: [24], temperature_2m_min: [15],
    precipitation_sum: [0], wind_speed_10m_max: [36],
    weathercode: [1]
  }, 1);
  assert.equal(om.max, null);
  assert.equal(om.min, null);
  assert.equal(om.rain, null);
  assert.equal(om.wind, null);

  const empty = h.calcMetDay([]);
  assert.equal(empty.max, null);
  assert.equal(empty.min, null);
  assert.equal(empty.rain, null);
  assert.equal(empty.wind, null);
  const missing = h.calcMetDay([{ data: { instant: { details: {} } } }]);
  assert.equal(missing.rain, null);
  assert.equal(missing.wind, null);
  assert.equal(missing.max, null);
});

test('valid zero precipitation stays zero while provider difference with missing data stays unknown', () => {
  const h = runtime();
  const full = h.calcMetDay([{ data: {
    instant: { details: { air_temperature: 0, wind_speed: 0 } },
    next_1_hours: { details: { precipitation_amount: 0 } }
  } }]);
  assert.equal(full.rain, 0);
  assert.equal(full.wind, 0);
  assert.equal(full.max, 0);
  assert.equal(full.min, 0);

  const missingEl = { textContent: '' };
  h.applyOneDiff(missingEl, 'Rainfall', null, 0, 'mm');
  assert.equal(missingEl.textContent, 'Rainfall: -');
  const zeroEl = { textContent: '' };
  h.applyOneDiff(zeroEl, 'Rainfall', 0, 0, 'mm');
  assert.equal(zeroEl.textContent, 'Rainfall: 0.0mm');
});
