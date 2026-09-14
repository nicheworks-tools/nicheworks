import fs from 'node:fs';
import assert from 'node:assert/strict';

const path='tools/phone-quickcheck/data/phones.json';
const payload=JSON.parse(fs.readFileSync(path,'utf8'));
assert.equal(payload.phones.length,182);

for (const id of ['motorola-razr-40','motorola-razr-60-ultra']) {
  const p=payload.phones.find(x=>x.id===id);
  assert.ok(p,`${id} missing`);
  assert.equal(p.included.cable,'unknown',`${id} cable no longer unknown`);
  assert.equal(p.included.adapter,'unknown',`${id} adapter no longer unknown`);
  p.included.cable='not_included';
  p.included.adapter='not_included';
  p.sources.verifiedAt='2026-09-15';
}
fs.writeFileSync(path,JSON.stringify(payload,null,2)+'\n');
console.log('Applied foldable audit wave 3: Motorola razr 40 and razr 60 ultra package evidence.');
