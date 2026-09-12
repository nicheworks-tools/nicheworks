import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const check = (condition, message) => { if (!condition) failures.push(message); };
const has = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  check(read(rel).includes(needle), `${rel}: missing ${label}`);
};
const lacks = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  check(!read(rel).includes(needle), `${rel}: forbidden ${label}`);
};

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.hidden = false;
    this.className = '';
    this.href = '';
    this.target = '';
    this.rel = '';
    this.textContent = '';
    this.lang = '';
    this.listeners = Object.create(null);
  }
  replaceChildren(...nodes) { this.children = nodes; }
  appendChild(node) { this.children.push(node); return node; }
  addEventListener(type, listener) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }
  click() {
    for (const listener of this.listeners.click || []) listener({ type: 'click', currentTarget: this });
  }
}

function loadAffiliateHelper() {
  const events = [];
  const document = { createElement: (tag) => new FakeElement(tag) };
  const window = {
    location: { href: 'https://nicheworks.app/tools/size-converter/' },
    gtag: (...args) => events.push(args)
  };
  const sandbox = { URL, Element: FakeElement, document, window, console };
  window.document = document;
  window.Element = FakeElement;
  vm.runInNewContext(read('assets/amazon-affiliate.js'), sandbox, { filename: 'assets/amazon-affiliate.js' });
  return { helper: window.NWAmazonAffiliate, events };
}

// Shared helper behavior: disabled means invisible even if a valid URL is present.
{
  const { helper, events } = loadAffiliateHelper();
  const cta = new FakeElement('div');
  const disclosure = new FakeElement('div');
  helper.configure({
    enabled: false,
    tool: 'size-converter',
    targets: { shoes: 'https://www.amazon.co.jp/s?k=shoes' }
  });
  check(helper.mount({ container: cta, target: 'shoes', label: 'Amazonでシューズを探す', placement: 'quick_result' }) === false,
    'Amazon helper: disabled config must not mount CTA');
  check(cta.hidden === true && cta.children.length === 0,
    'Amazon helper: disabled CTA container must stay hidden/empty');
  check(helper.renderDisclosure(disclosure, { includeEnglish: true }) === false,
    'Amazon helper: disabled config must not render disclosure');
  check(disclosure.hidden === true && disclosure.children.length === 0,
    'Amazon helper: disabled disclosure must stay hidden/empty');
  check(events.length === 0, 'Amazon helper: disabled state must not emit analytics');
}

// Enabled with no valid Amazon HTTPS target must still remain invisible.
{
  const { helper } = loadAffiliateHelper();
  const cta = new FakeElement('div');
  const disclosure = new FakeElement('div');
  helper.configure({
    enabled: true,
    tool: 'size-converter',
    targets: {
      shoes: '',
      clothing: 'https://example.com/not-amazon',
      insecure: 'http://www.amazon.co.jp/s?k=shoes'
    }
  });
  check(helper.mount({ container: cta, target: 'shoes' }) === false,
    'Amazon helper: empty target must not mount CTA');
  check(helper.mount({ container: cta, target: 'clothing' }) === false,
    'Amazon helper: non-Amazon target must not mount CTA');
  check(helper.mount({ container: cta, target: 'insecure' }) === false,
    'Amazon helper: non-HTTPS Amazon target must not mount CTA');
  check(helper.renderDisclosure(disclosure) === false,
    'Amazon helper: no valid target must not render disclosure');
}

// Enabled + valid Amazon HTTPS target must mount, disclose, and emit one coarse click event.
{
  const { helper, events } = loadAffiliateHelper();
  const cta = new FakeElement('div');
  const disclosure = new FakeElement('div');
  helper.configure({
    enabled: true,
    tool: 'size-converter',
    targets: { shoes: 'https://www.amazon.co.jp/s?k=shoes' }
  });
  check(helper.mount({
    container: cta,
    target: 'shoes',
    label: 'Amazonでシューズを探す',
    placement: 'quick_result',
    className: 'amazon-cta'
  }) === true, 'Amazon helper: valid enabled target must mount CTA');
  check(cta.hidden === false && cta.children.length === 1,
    'Amazon helper: mounted CTA must be visible');
  const link = cta.children[0];
  check(link.href === 'https://www.amazon.co.jp/s?k=shoes', 'Amazon helper: CTA href must preserve configured target');
  check(link.rel === 'sponsored noopener', 'Amazon helper: CTA must carry sponsored noopener rel');
  check(link.target === '_blank', 'Amazon helper: CTA must open as configured external link');
  check(link.textContent.includes('Amazon'), 'Amazon helper: CTA label must identify Amazon');

  check(helper.renderDisclosure(disclosure, { includeEnglish: true }) === true,
    'Amazon helper: valid enabled target must render disclosure');
  check(disclosure.hidden === false && disclosure.children.length === 2,
    'Amazon helper: bilingual disclosure must be visible');
  check(disclosure.children[0].textContent.includes('Amazonのアソシエイトとして'),
    'Amazon helper: Japanese Associates disclosure missing');

  link.click();
  check(events.length === 1, 'Amazon helper: one CTA click must emit exactly one analytics call');
  if (events.length === 1) {
    const [command, eventName, params] = events[0];
    check(command === 'event' && eventName === 'affiliate_click',
      'Amazon helper: click must emit affiliate_click event');
    check(JSON.stringify(Object.keys(params).sort()) === JSON.stringify(['affiliate', 'placement', 'target', 'tool']),
      'Amazon helper: affiliate_click must contain only coarse contract keys');
    check(params.tool === 'size-converter' && params.affiliate === 'amazon' && params.target === 'shoes' && params.placement === 'quick_result',
      'Amazon helper: affiliate_click coarse values mismatch');
  }
}

// Short Amazon URLs are allowed only over HTTPS.
{
  const { helper } = loadAffiliateHelper();
  const cta = new FakeElement('div');
  helper.configure({ enabled: true, tool: 'tiny-audio-meter', targets: { usb_microphone: 'https://amzn.to/example' } });
  check(helper.mount({ container: cta, target: 'usb_microphone', label: 'Amazon USB', placement: 'post_meter' }) === true,
    'Amazon helper: valid HTTPS amzn.to target should mount');
}

function loadConfig(rel, globalName) {
  const sandbox = { window: {} };
  vm.runInNewContext(read(rel), sandbox, { filename: rel });
  return sandbox.window[globalName];
}

// Production configs stay inert until the account/links are ready.
{
  const config = loadConfig('tools/size-converter/affiliate-config.js', 'NWSizeConverterAffiliate');
  check(config?.enabled === false, 'Size Converter affiliate config must remain disabled until activation PR');
  check(config?.targets?.shoes === '' && config?.targets?.clothing === '',
    'Size Converter affiliate targets must remain empty until verified URLs exist');
}
{
  const config = loadConfig('tools/tiny-audio-meter/affiliate-config.js', 'NWTinyAudioAffiliate');
  check(config?.enabled === false, 'Tiny Audio affiliate config must remain disabled until activation PR');
  check(config?.targets?.sound_level_meter === '' && config?.targets?.usb_microphone === '',
    'Tiny Audio affiliate targets must remain empty until verified URLs exist');
}

// Size Converter current product/affiliate contract.
has('tools/size-converter/index.html', '/assets/amazon-affiliate.js');
has('tools/size-converter/index.html', './affiliate-config.js');
has('tools/size-converter/app.js', 'function parseSizeEntry(raw)');
has('tools/size-converter/app.js', 'outOfRange: true');
has('tools/size-converter/app.js', 'function chartEnvelope(chart, key)');
has('tools/size-converter/app.js', 'placement: "quick_result"');
has('tools/size-converter/SPEC.md', 'Measurement inputs/results are never encoded into affiliate URLs or affiliate analytics.');
lacks('tools/size-converter/app.js', 'gtag("event", "affiliate_click"', 'tool-owned affiliate analytics payload');
lacks('tools/size-converter/app.js', 'length_offset_cm', 'brand-wide numeric offset');

// Tiny Audio current product/affiliate contract.
has('tools/tiny-audio-meter/index.html', './comparison.js');
has('tools/tiny-audio-meter/app.js', 'echoCancellation: false');
has('tools/tiny-audio-meter/app.js', 'noiseSuppression: false');
has('tools/tiny-audio-meter/app.js', 'autoGainControl: false');
has('tools/tiny-audio-meter/app.js', 'const SNAP_MAX = 20;');
has('tools/tiny-audio-meter/comparison.js', 'function clearBaseline()');
has('tools/tiny-audio-meter/comparison.js', 'els.deviceSelect?.addEventListener("change"');
has('tools/tiny-audio-meter/comparison.js', 'relative change');
has('tools/tiny-audio-meter/comparison.js', 'peakHz');
has('tools/tiny-audio-meter/app.js', 'placement: "post_meter"');
has('tools/tiny-audio-meter/SPEC.md', 'Baselineやmicrophone-derived valuesは永続保存・affiliate analytics送信されない。');
lacks('tools/tiny-audio-meter/comparison.js', 'gtag(', 'comparison analytics payload');
lacks('tools/tiny-audio-meter/comparison.js', 'localStorage.setItem', 'baseline persistence');

// Load order: helper/config before tool runtime; comparison hook before audio runtime.
{
  const html = read('tools/size-converter/index.html');
  const helper = html.indexOf('/assets/amazon-affiliate.js');
  const config = html.indexOf('./affiliate-config.js');
  const app = html.indexOf('./app.js');
  check(helper >= 0 && helper < config && config < app,
    'Size Converter: affiliate helper/config must load before app.js');
}
{
  const html = read('tools/tiny-audio-meter/index.html');
  const helper = html.indexOf('/assets/amazon-affiliate.js');
  const config = html.indexOf('./affiliate-config.js');
  const comparison = html.indexOf('./comparison.js');
  const app = html.indexOf('./app.js');
  check(helper >= 0 && helper < config && config < comparison && comparison < app,
    'Tiny Audio: helper/config/comparison hook must load before app.js in that order');
}

if (failures.length) {
  console.error(`Amazon-ready tool contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Amazon-ready tool contract passed: helper behavior, disabled configs, Size Converter, Tiny Audio Meter.');
