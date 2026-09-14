import fs from 'node:fs';
import assert from 'node:assert/strict';

const path='tools/phone-quickcheck/data/phones.json';
const payload=JSON.parse(fs.readFileSync(path,'utf8'));
assert.equal(payload.phones.length,181);

const ids=[
  'samsung-galaxy-z-fold4',
  'samsung-galaxy-z-flip4',
  'samsung-galaxy-z-fold3-5g',
  'samsung-galaxy-z-flip3-5g',
  'samsung-galaxy-z-fold2-5g',
  'samsung-galaxy-z-flip-5g',
  'samsung-galaxy-z-flip'
];
for (const id of ids) {
  const p=payload.phones.find(x=>x.id===id);
  assert.ok(p,`${id} missing`);
  assert.equal(p.included.cable,'unknown',`${id} cable no longer unknown`);
  assert.equal(p.included.adapter,'unknown',`${id} adapter no longer unknown`);
  p.included.cable='included';
  p.included.adapter='not_included';
  p.sources.verifiedAt='2026-09-15';
}
fs.writeFileSync(path,JSON.stringify(payload,null,2)+'\n');
console.log('Applied foldable audit wave 2: JP package evidence for seven Samsung foldables.');
