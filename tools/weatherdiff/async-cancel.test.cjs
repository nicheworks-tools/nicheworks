const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const elements = new Map();
  const events = new Map();
  const requests = [];
  const locations = [];
  let onReady;
  class Element {
    constructor(id) {
      this.id = id;
      this.value = '';
      this.textContent = '';
      this.href = '';
      this.placeholder = '';
      this.disabled = false;
      this.readOnly = false;
      this.parentElement = null;
      this.children = [];
      this.classList = {
        values: new Set(id === 'progressArea' || id === 'resultSection' ? ['hidden'] : []),
        add(name) { this.values.add(name); },
        remove(name) { this.values.delete(name); },
        contains(name) { return this.values.has(name); },
        toggle(name, force) {
          if (force === undefined ? !this.values.has(name) : force) this.values.add(name);
          else this.values.delete(name);
        }
      };
    }
    addEventListener(event, cb) { events.set(this.id + ':' + event, cb); }
    emit(event) { return events.get(this.id + ':' + event)?.(); }
    replaceChildren(...items) { this.children = items; }
    append(...items) { this.children.push(...items); }
    querySelector() { return new Element('progressBar'); }
  }
  const get = id => {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  };
  const document = {
    documentElement: { lang: 'ja' },
    getElementById: get,
    addEventListener(event, cb) { if (event === 'DOMContentLoaded') onReady = cb; },
    querySelectorAll() { return []; },
    createElement: id => new Element(id),
    createTextNode: text => ({ textContent: text })
  };
  const localStorage = {
    values: new Map(),
    getItem(k) { return this.values.get(k) || null; },
    setItem(k, v) { this.values.set(k, String(v)); },
    removeItem(k) { this.values.delete(k); }
  };
  class AbortControllerFake {
    constructor() { this.signal = { aborted: false }; }
    abort() { this.signal.aborted = true; }
  }
  function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      requests.push({ url: String(url), options, resolve, reject });
    });
  }
  const navigator = {
    geolocation: {
      getCurrentPosition(resolve, reject) { locations.push({ resolve, reject }); }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app-final.js'), 'utf8'), {
    document, localStorage, fetch, navigator, AbortController: AbortControllerFake,
    location: { protocol: 'https:' }, performance: { now: () => 5000 }
  }, { filename: 'app-final.js' });
  onReady();
  function answer(index, data) {
    assert.ok(requests[index], 'request ' + index + ' must exist');
    requests[index].resolve({ ok: true, json: async () => data });
  }
  function setLocation(value) {
    get('locationInput').value = value;
    get('locationInput').emit('input');
  }
  return { get, requests, locations, answer, setLocation };
}

const search = name => [{ lat: '35.68', lon: '139.76', display_name: name, address: { country: 'Japan' } }];
const weather = { utc_offset_seconds: 32400, daily: {
  temperature_2m_max: [20, 21], temperature_2m_min: [12, 13],
  precipitation_sum: [0, 1.5], wind_speed_10m_max: [14.4, 18],
  weathercode: [0, 3]
} };
const met = { properties: { timeseries: [
  { time: new Date().toISOString(), data: {
    instant: { details: { air_temperature: 16, wind_speed: 4 } },
    next_1_hours: { details: { precipitation_amount: 0 } }
  } }
] } };
async function tick() { for (let i = 0; i < 8; i++) await Promise.resolve(); }

test('Reset during geocoding aborts request and old result cannot start weather calls', async () => {
  const h = harness();
  h.setLocation('old location');
  const pending = h.get('btnCompare').emit('click');
  assert.equal(h.requests.length, 1);
  assert.equal(h.get('btnReset').disabled, false);
  h.get('btnReset').emit('click');
  assert.equal(h.requests[0].options.signal.aborted, true);
  h.answer(0, search('stale'));
  await pending;
  assert.equal(h.requests.length, 1);
  assert.equal(h.get('resultSection').classList.contains('hidden'), true);
  assert.equal(h.get('progressArea').classList.contains('hidden'), true);
  assert.equal(h.get('locationInput').value, '');
  assert.equal(h.get('errorText').textContent, '');
});

test('Reset during Open-Meteo aborts its fetch and never starts MET Norway', async () => {
  const h = harness();
  h.setLocation('Tokyo');
  const pending = h.get('btnCompare').emit('click');
  h.answer(0, search('Tokyo'));
  await tick();
  assert.equal(h.requests.length, 2);
  assert.match(h.requests[1].url, /open-meteo/);
  h.get('btnReset').emit('click');
  assert.equal(h.requests[1].options.signal.aborted, true);
  h.answer(1, weather);
  await pending;
  assert.equal(h.requests.length, 2);
  assert.equal(h.get('resultSection').classList.contains('hidden'), true);
  h.get('langEN').emit('click');
  assert.equal(h.get('resultSection').classList.contains('hidden'), true);
});

test('editing the location cancels a pending run; only the replacement can be displayed', async () => {
  const h = harness();
  h.setLocation('old');
  const stale = h.get('btnCompare').emit('click');
  h.setLocation('new');
  assert.equal(h.requests[0].options.signal.aborted, true);
  assert.equal(h.get('btnCompare').disabled, false);
  const fresh = h.get('btnCompare').emit('click');
  assert.equal(h.requests.length, 2);
  h.answer(1, search('New Tokyo'));
  await tick();
  assert.equal(h.requests.length, 3);
  h.answer(2, weather);
  await tick();
  assert.equal(h.requests.length, 4);
  assert.match(h.requests[3].url, /api\.met\.no/);
  h.answer(3, met);
  await fresh;
  assert.equal(h.get('resultSection').classList.contains('hidden'), false);
  assert.equal(h.get('locName').textContent, 'New Tokyo');
  assert.match(h.get('omTodayRain').textContent, /0\.0/);
  h.answer(0, search('Old Tokyo'));
  await stale;
  assert.equal(h.requests.length, 4);
  assert.equal(h.get('locName').textContent, 'New Tokyo');
  assert.equal(h.get('resultSection').classList.contains('hidden'), false);
});

test('Reset invalidates an outstanding geolocation permission callback', async () => {
  const h = harness();
  const pending = h.get('btnGeo').emit('click');
  assert.equal(h.locations.length, 1);
  h.get('btnReset').emit('click');
  h.locations[0].resolve({ coords: { latitude: 35.5, longitude: 139.5 } });
  await pending;
  assert.equal(h.requests.length, 0);
  assert.equal(h.get('errorText').textContent, '');
  assert.equal(h.get('progressArea').classList.contains('hidden'), true);
  assert.equal(h.get('btnGeo').disabled, false);
});

test('two language pages expose Reset before the result and use the module entrypoint', () => {
  for (const page of ['index.html', path.join('en', 'index.html')]) {
    const html = fs.readFileSync(path.join(__dirname, page), 'utf8');
    const resetPos = html.indexOf('id="btnReset"');
    const resultPos = html.indexOf('id="resultSection"');
    assert.ok(resetPos > 0 && resetPos < resultPos, page + ' must offer Reset while loading');
    assert.equal((html.match(/id="btnReset"/g) || []).length, 1);
    assert.match(html, /<script type="module" src="(?:\.\.\/)?app\.js"><\/script>/);
  }
});
