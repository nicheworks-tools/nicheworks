import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const phone = payload.phones.find((item) => item.id === 'zte-nubia-flip-2');
if (!phone) throw new Error('zte-nubia-flip-2 missing');
if (!phone.included) throw new Error('nubia Flip 2 included block missing');
if (!['unknown', 'not_included'].includes(phone.included.cable)) throw new Error(`unexpected cable state: ${phone.included.cable}`);
if (!['unknown', 'not_included'].includes(phone.included.adapter)) throw new Error(`unexpected adapter state: ${phone.included.adapter}`);

phone.included.cable = 'not_included';
phone.included.adapter = 'not_included';
phone.sources.releaseUrl = 'https://www.ymobile.jp/lineup/smartphone/nubiaflip2/';
phone.sources.verifiedAt = '2026-09-15';
payload.updatedAt = '2026-09-15';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);

const testPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let tests = fs.readFileSync(testPath, 'utf8');
const marker = '// nubia Flip 2 domestic package excludes both USB cable and AC adapter per Y!mobile.';
if (tests.includes(marker)) throw new Error('nubia Flip 2 package regression already present');
tests += `\n${marker}\n{\n  const phone = byId.get('zte-nubia-flip-2');\n  assert.ok(phone, 'nubia Flip 2 fixture missing');\n  assert.equal(phone.included?.cable, 'not_included');\n  assert.equal(phone.included?.adapter, 'not_included');\n  assert.match(phone.sources?.releaseUrl || '', /^https:\\/\\/www\\.ymobile\\.jp\\//);\n  const h = await createHarness(['zte-nubia-flip-2']);\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /同梱ケーブル<\\/span><b>別売/);\n  assert.match(html, /ACアダプター<\\/span><b>別売/);\n}\n`;
fs.writeFileSync(testPath, tests);
