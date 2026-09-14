import fs from 'node:fs';
import assert from 'node:assert/strict';

const path='tools/phone-quickcheck/data/phones.json';
const payload=JSON.parse(fs.readFileSync(path,'utf8'));
assert.equal(payload.phones.length,181);

const fixes={
  'samsung-galaxy-z-fold4':'https://www.au.com/online-manual/scg16/scg16_04/m_00_00_01.html',
  'samsung-galaxy-z-flip4':'https://www.au.com/online-manual/scg17/scg17_04/m_00_00_01.html',
  'samsung-galaxy-z-fold3-5g':'https://www.au.com/online-manual/scg11/scg11_01/m_00_00_01.html',
  'samsung-galaxy-z-flip3-5g':'https://www.au.com/online-manual/scg12/scg12_01/m_00_00_01.html',
  'samsung-galaxy-z-fold2-5g':'https://www.au.com/content/dam/au-com/support/service/mobile/guide/manual/scg05/pdf/scg05_torisetsu_shousai.pdf',
  'samsung-galaxy-z-flip-5g':'https://www.au.com/content/dam/au-com/support/service/mobile/guide/manual/scg04/pdf/scg04_torisetsu_shousai.pdf',
  'samsung-galaxy-z-flip':'https://www.au.com/online-manual/scv47/scv47_01/m_00_00_01.html'
};
for (const [id,manualUrl] of Object.entries(fixes)) {
  const p=payload.phones.find(x=>x.id===id);
  assert.ok(p,`${id} missing`);
  assert.equal(p.included.cable,'unknown',`${id} cable no longer unknown`);
  assert.equal(p.included.adapter,'unknown',`${id} adapter no longer unknown`);
  p.included.cable='included';
  p.included.adapter='not_included';
  p.sources.manualUrl=manualUrl;
  p.sources.verifiedAt='2026-09-15';
}
fs.writeFileSync(path,JSON.stringify(payload,null,2)+'\n');
console.log('Applied foldable audit wave 2: JP package evidence for seven Samsung foldables.');
