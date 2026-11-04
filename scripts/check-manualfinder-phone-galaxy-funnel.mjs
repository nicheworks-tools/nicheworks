import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(path,'utf8');

const sandbox={window:{}};
vm.runInNewContext(read('tools/manual-finder/phone-quickcheck-match.js'), sandbox);
const match=sandbox.window.MANUALFINDER_QC;
assert.ok(match && typeof match.linkFor==='function');
vm.runInNewContext(read('tools/manual-finder/data/manuals.coverage-pass.samsung-jp-galaxy-smartphones.js'), sandbox);
const catalog=sandbox.window.MANUALFINDER_COVERAGE_PASS_SAMSUNG_JP_GALAXY;
assert.ok(catalog.length>=80,'Samsung manual source must include verified 89-model batch');

const expected=[
 ['Galaxy A23 5G','SM-A233DZKDDCM','samsung-galaxy-a23-5g-sc56c'],
 ['Galaxy A22 5G','SM-A223DZKADCM','samsung-galaxy-a22-5g-sc56b'],
 ['Galaxy A21','SM-A102DZRJDCM','samsung-galaxy-a21-sc42a'],
 ['Galaxy A20','SM-A102DZRADCM','samsung-galaxy-a20-sc02m']
];
for(const [model,sku,slug] of expected){
  const official=catalog.find(x=>x.maker==='Samsung Mobile'&&x.model===model);
  assert.ok(official,'no verified manual for '+model);
  assert.ok(official.manualUrl.includes('/support/model/'+sku+'/'),'manual SKU mismatch: '+model);
  const expectedUrl='/tools/phone-quickcheck/models/'+slug+'/';
  assert.equal(match.linkFor(official.maker,official.model,official.manualUrl),expectedUrl);
  assert.equal(match.linkFor(official.maker,official.model,official.supportUrl),expectedUrl);
  assert.equal(match.linkFor('Samsung Mobile',model),null,'missing official SKU must fail closed');
  assert.equal(match.linkFor('Samsung Mobile',model,'https://www.samsung.com/jp/support/model/SM-A233C/'),null,'wrong carrier variant must fail closed');
  assert.equal(match.linkFor('Samsung Mobile',model,'http://www.samsung.com/jp/support/model/'+sku+'/'),null,'non-HTTPS source must fail');
  assert.equal(match.linkFor('Samsung Mobile',model,'https://www.samsung.com.evil.test/jp/support/model/'+sku+'/'),null,'different host must fail');
  assert.ok(read('tools/phone-quickcheck/models/'+slug+'/index.html').includes('rel="sponsored noopener noreferrer"'),
    'linked target must be the tested product guide');
}
const s24=catalog.find(x=>x.model==='Galaxy S24 FE');
assert.ok(s24);
assert.equal(match.linkFor(s24.maker,s24.model,s24.manualUrl),null,
 'SM-S721J carrier variant must not be attributed to SM-S721Q profile');
assert.equal(match.linkFor('Samsung Mobile','Galaxy A21 シンプル',
 'https://www.samsung.com/jp/support/model/SM-A102JZKKKDI/#downloads'),null);
assert.equal(match.linkFor('Samsung Mobile','Galaxy A23 5G',''),null);
assert.equal(match.linkFor('Apple','iPhone 11'),'/tools/phone-quickcheck/?model=iPhone%2011');
assert.equal(match.linkFor('Google Pixel','Google Pixel 8 Pro'),
 '/tools/phone-quickcheck/?model=Pixel%208%20Pro');
assert.equal(match.linkFor('Samsung Mobile','Galaxy S24','https://www.samsung.com/jp/'),null);
const app=read('tools/manual-finder/app.paged.js');
assert.ok(app.includes('linkFor(x.maker, x.model, x.manualUrl)'));
for(const path of ['tools/manual-finder/index.html','tools/manual-finder/en/index.html']){
 const html=read(path);
 assert.ok(html.includes('mf-galaxy-sku-20261104a'));
 assert.ok(html.includes('phone-quickcheck-match.js'));
}
console.log('ManualFinder→Phone QuickCheck Galaxy funnel PASS: 4 verified DCM SKUs, 4 sponsored target guides, variants excluded, iPhone/Pixel unchanged.');
