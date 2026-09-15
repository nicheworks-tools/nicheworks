import fs from 'node:fs';
import assert from 'node:assert/strict';

const path = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(path, 'utf8'));
assert.equal(payload.phones.length, 182, 'expected 182-phone baseline');

const razr60u = payload.phones.find((p) => p.id === 'motorola-razr-60-ultra');
assert.ok(razr60u, 'motorola-razr-60-ultra missing');
assert.equal(razr60u.included.cable, 'unknown');
assert.equal(razr60u.included.adapter, 'unknown');
razr60u.included.cable = 'not_included';
razr60u.included.adapter = 'not_included';
razr60u.sources.verifiedAt = '2026-09-15';

const flip2 = payload.phones.find((p) => p.id === 'zte-nubia-flip-2');
assert.ok(flip2, 'zte-nubia-flip-2 missing');
assert.deepEqual(flip2.charging.protocols, ['PPS']);
assert.equal(flip2.charging.pps, 'required');
flip2.charging.protocols = ['USB-PD', 'PPS'];
flip2.sources.chargingUrl = 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-flip-2.html';
flip2.sources.verifiedAt = '2026-09-15';

fs.writeFileSync(path, JSON.stringify(payload, null, 2) + '\n');
console.log('Applied foldable audit wave3b: razr 60 ultra package + nubia Flip 2 PD/PPS semantics.');