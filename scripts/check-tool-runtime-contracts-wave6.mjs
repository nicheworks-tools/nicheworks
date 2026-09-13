import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const check = (condition, message) => { if (!condition) failures.push(message); };
const has = (rel, needle, label = String(needle)) => {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  const text = read(rel);
  check(needle instanceof RegExp ? needle.test(text) : text.includes(needle), `${rel}: missing ${label}`);
};
const lacks = (rel, needle, label = String(needle)) => {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  const text = read(rel);
  check(!(needle instanceof RegExp ? needle.test(text) : text.includes(needle)), `${rel}: forbidden ${label}`);
};
const hasScript = (rel, filename) => {
  const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  has(rel, new RegExp(`<script\\b[^>]*\\bsrc=["'](?:[^"']*/)?${escaped}(?:\\?[^"']*)?["']`, 'i'), `active ${filename} script`);
};

// 76. Sukima Baito Income — income rows stay page-memory only; CSV/OCR contracts remain bounded.
hasScript('tools/sukima-baito-income/index.html', 'app.js');
has('tools/sukima-baito-income/app.js', 'let entries = []; // (spec: no persistent storage for entries)');
has('tools/sukima-baito-income/app.js', 'const WP_KEY = "nw-sukima-workplaces-v1"');
has('tools/sukima-baito-income/app.js', 'maxFiles: 10');
has('tools/sukima-baito-income/app.js', 'maxFileMB: 10');
has('tools/sukima-baito-income/app.js', /navigator\.onLine/);
has('tools/sukima-baito-income/app.js', 'date,workplace,category,amount,memo');
lacks('tools/sukima-baito-income/app.js', /localStorage\.setItem\([^\n]*(?:entries|income)/i, 'persistent income-entry storage');

// 77. Tiny Audio Meter — measurement-oriented input, bounded pitch/snapshots, local records, affiliate disabled.
hasScript('tools/tiny-audio-meter/index.html', 'app.js');
has('tools/tiny-audio-meter/app.js', 'navigator.mediaDevices.getUserMedia');
has('tools/tiny-audio-meter/app.js', 'echoCancellation: false');
has('tools/tiny-audio-meter/app.js', 'noiseSuppression: false');
has('tools/tiny-audio-meter/app.js', 'autoGainControl: false');
has('tools/tiny-audio-meter/app.js', /PITCH_MIN_HZ\s*=\s*60/,'60 Hz pitch lower bound');
has('tools/tiny-audio-meter/app.js', /100|PITCH.*INTERVAL/i, 'pitch analysis cadence');
has('tools/tiny-audio-meter/app.js', /20|MAX_.*SNAP|SNAP_MAX/i, 'snapshot bound');
has('tools/tiny-audio-meter/records-export.js', /csv|CSV/);
has('tools/tiny-audio-meter/affiliate-config.js', 'enabled: false');
lacks('tools/tiny-audio-meter/affiliate-config.js', /https:\/\/www\.amazon\.|https:\/\/amzn\./i, 'live Amazon target');

// 78. TrashNavi — live directory stays repository-data-driven and municipality publication stays gated.
hasScript('tools/trashnavi/index.html', 'app.js');
has('tools/trashnavi/app.js', /fetch\(/, 'same-site data loading');
if (exists('tools/trashnavi/municipality-page-manifest.json')) {
  const manifest = JSON.parse(read('tools/trashnavi/municipality-page-manifest.json'));
  check(
    Array.isArray(manifest) && manifest.some((entry) => entry.pref_slug === 'tokyo' && entry.city_slug === 'chuo' && entry.publish === true),
    'tools/trashnavi/municipality-page-manifest.json: missing published tokyo/chuo entry'
  );
} else {
  failures.push('tools/trashnavi/municipality-page-manifest.json: missing file');
}
has('tools/trashnavi/scripts/generate-municipality-pages.mjs', /3|preferred/i, 'preferred three-type publication gate');
has('tools/trashnavi/scripts/check-runtime-contract.mjs', /TrashNavi|trashnavi/i);
has('scripts/check-trashnavi-direct-links.mjs', /404/);
has('scripts/check-trashnavi-direct-links.mjs', /410/);

// 79. UI Atlas — Free compare 2, legacy Pro compare 5, exact entitlement isolation.
hasScript('tools/ui-atlas/index.html', 'app.js');
has('tools/ui-atlas/app.js', 'const getCompareMax = () => (commonProActive ? 5 : 2);');
has('tools/ui-atlas/app.js', "local.entitlement === 'nicheworks_pro'");
has('tools/ui-atlas/pro-bridge.js', "const EXPECTED_ENTITLEMENT = 'nicheworks_pro'");
has('tools/ui-atlas/pro-bridge.js', 'local.entitlement === EXPECTED_ENTITLEMENT');
has('tools/ui-atlas/app.js', 'ui-atlas:${lang}:favorites');
has('tools/ui-atlas/app.js', 'ui-atlas:${lang}:recent');
lacks('tools/ui-atlas/pro-bridge.js', /Boolean\(local && local\.active\)(?!\s*&&)/, 'active-only shared Pro gate');

// 80. Unicode Kanji Checker — code-point-safe browser analysis plus same-site reference data.
hasScript('tools/unicode-kanji-checker/index.html', 'app.js');
has('tools/unicode-kanji-checker/app.js', 'Array.from(raw)');
has('tools/unicode-kanji-checker/app.js', 'char.codePointAt(0)');
has('tools/unicode-kanji-checker/app.js', "fetch(base + 'dict.json')");
has('tools/unicode-kanji-checker/app.js', 'getUtf16CodeUnits');
has('tools/unicode-kanji-checker/app.js', 'このツールは文字コード・表示環境の確認を補助する参考ツールです。');
lacks('tools/unicode-kanji-checker/app.js', /fetch\(['"]https?:\/\//, 'external input-processing API');

// 81. UnitMaster — JSON runtime, seven categories, input guards, five-item local history, safe fallback.
hasScript('tools/unitmaster/index.html', 'app-json-runtime.js');
has('tools/unitmaster/app-json-runtime.js', 'const UNIT_DATA_URL = "./data/units.json"');
has('tools/unitmaster/app-json-runtime.js', 'const LEGACY_APP_URL = "./app.js"');
has('tools/unitmaster/app-json-runtime.js', 'const MAX_ABS_VALUE = 1e100');
has('tools/unitmaster/app-json-runtime.js', 'value < -273.15');
has('tools/unitmaster/app-json-runtime.js', 'list.slice(0, 5)');
for (const cat of ['length','weight','temp','volume','area','speed','pressure']) has('tools/unitmaster/app-json-runtime.js', `cat_${cat}`);

// 82. URL Title Collector — URLs go through the Worker; result statuses and CSV/TSV escaping remain explicit.
hasScript('tools/url-title-collector/index.html', 'app.js');
has('tools/url-title-collector/app.js', 'https://floral-voice-bfc0.nicheworks-tools.workers.dev/?url=');
for (const state of ['success','no-title','http-error','network-error']) has('tools/url-title-collector/app.js', `"${state}"`);
has('tools/url-title-collector/app.js', "td.innerText.replace(/\"/g, '\"\"')");
has('tools/url-title-collector/index.html', /Worker|ワーカー|外部サイト/i, 'visible network disclosure');
has('tools/url-title-collector/en/index.html', /Worker|external site|network/i, 'English network disclosure');
lacks('tools/url-title-collector/SPEC.md', /「ローカル処理」「Fully browser-based」という表現はruntime behaviorと一致せず/, 'stale local-only privacy drift note');

// 83. Variant Kanji Compare — browser-side Unicode/glyph comparison with same-site old-kanji reference data.
hasScript('tools/variant-kanji-compare/index.html', 'app.js');
has('tools/variant-kanji-compare/app.js', /codePointAt\(0\)/);
has('tools/variant-kanji-compare/app.js', /UTF-16|utf16/i);
has('tools/variant-kanji-compare/app.js', /HTML|html/i);
has('tools/variant-kanji-compare/app.js', /old-kanji-reference|dict\.json/i);
lacks('tools/variant-kanji-compare/app.js', /fetch\(['"]https?:\/\//, 'external input-processing API');

// 84. Vibe Lexicon — compare stays 2, paid copy/export requires exact shared entitlement, legacy local flag is not authority.
hasScript('tools/vibe-lexicon/index.html', 'app.js');
has('tools/vibe-lexicon/app.js', 'const maxCompare = 2;');
has('tools/vibe-lexicon/app.js', "status.entitlement === 'nicheworks_pro'");
has('tools/vibe-lexicon/pro-bridge.js', "var EXPECTED_ENTITLEMENT = 'nicheworks_pro'");
has('tools/vibe-lexicon/pro-bridge.js', 'status.entitlement === EXPECTED_ENTITLEMENT');
has('tools/vibe-lexicon/pro-bridge.js', 'localStorage.removeItem(LEGACY_KEY)');
lacks('tools/vibe-lexicon/pro-bridge.js', 'legacyActive()', 'legacy tool-local self-unlock');
lacks('tools/vibe-lexicon/pro-bridge.js', 'localCommonActive() ||', 'legacy OR entitlement bypass');

// 85. WeatherDiff — explicit live network sources, HTTPS geolocation guard, bounded geolocation wait, safety warning.
hasScript('tools/weatherdiff/index.html', 'app.js');
has('tools/weatherdiff/app.js', "import './app-final.js'", 'active app-final.js module import');
has('tools/weatherdiff/app-final.js', 'location.protocol !== "https:"');
has('tools/weatherdiff/app-final.js', 'timeout: 5000');
has('tools/weatherdiff/app-final.js', 'https://nominatim.openstreetmap.org/search');
has('tools/weatherdiff/app-final.js', 'https://api.open-meteo.com/v1/forecast');
has('tools/weatherdiff/app-final.js', 'https://api.met.no/weatherapi/locationforecast/2.0/compact');
has('tools/weatherdiff/app-final.js', '防災、避難判断、警報、交通判断、業務判断には使わず');
has('tools/weatherdiff/app-final.js', 'localStorage.setItem(LANG_KEY, currentLang)');

// 86. WebP/AVIF Converter — one local file, format guard, JPEG white flatten, object URL cleanup.
hasScript('tools/webp-avif-converter/index.html', 'app.js');
has('tools/webp-avif-converter/app.js', 'if (files.length > 1)');
has('tools/webp-avif-converter/app.js', 'type === "image/webp"');
has('tools/webp-avif-converter/app.js', 'type === "image/avif"');
has('tools/webp-avif-converter/app.js', 'ctx.fillStyle = "#fff"');
has('tools/webp-avif-converter/app.js', 'URL.revokeObjectURL');
has('tools/webp-avif-converter/app.js', '/tools/filetype-sniffer/');
lacks('tools/webp-avif-converter/app.js', /fetch\(/, 'remote image-processing request');

// 87. WiFi Meter — Network Information API estimate only, manual one-second sampling, max 50 in-memory points.
hasScript('tools/wifi-meter/index.html', 'app.js');
has('tools/wifi-meter/app.js', 'navigator.connection || navigator.mozConnection || navigator.webkitConnection');
has('tools/wifi-meter/app.js', 'const MAX_POINTS = 50');
has('tools/wifi-meter/app.js', 'setInterval(updateValues, 1000)');
has('tools/wifi-meter/app.js', 'The Network Information API is not supported in this browser.');
has('tools/wifi-meter/app.js', 'graphData = []');
lacks('tools/wifi-meter/app.js', /fetch\(/, 'speed-test/network probe request');

if (failures.length) {
  console.error(`Wave 6 runtime contract audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Wave 6 runtime contract audit passed for registry tools 76-87.');
