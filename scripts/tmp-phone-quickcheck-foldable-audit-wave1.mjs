import fs from 'node:fs';
import assert from 'node:assert/strict';

const path='tools/phone-quickcheck/data/phones.json';
const payload=JSON.parse(fs.readFileSync(path,'utf8'));
assert.equal(payload.phones.length,181);

const flip=payload.phones.find(p=>p.id==='samsung-galaxy-z-flip');
assert.ok(flip);
assert.ok(!flip.sources.releaseUrl);
flip.sources.releaseUrl='https://news.samsung.com/global/the-future-changes-shape-express-yourself-with-galaxy-z-flip';

const razr=payload.phones.find(p=>p.id==='motorola-razr-5g');
assert.ok(razr);
assert.equal(razr.included.cable,'unknown');
assert.equal(razr.included.adapter,'unknown');
razr.included.cable='included';
razr.included.adapter='included';
razr.sources.chargingUrl='https://jp-jp.support.motorola.com/app/answers/detail/a_id/158957';
razr.sources.verifiedAt='2026-09-15';
flip.sources.verifiedAt='2026-09-15';

fs.writeFileSync(path,JSON.stringify(payload,null,2)+'\n');
console.log('Applied foldable audit wave 1: Galaxy Z Flip release source + razr 5G JP package evidence.');
