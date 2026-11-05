import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = p => readFileSync(p,'utf8');
const base = JSON.parse(read('tools/phone-quickcheck/data/phones.json')).phones;
const growth = JSON.parse(read('tools/phone-quickcheck/data/phones-growth-20261103.json')).phones;
const phones = [...base, ...growth];
const accessory = JSON.parse(read('tools/phone-quickcheck/data/accessories.json')).accessories;
const all = new Map(phones.map(phone=>[phone.id,phone]));
assert.equal(phones.length,265);
assert.equal(all.size,265);
assert.equal(new Set(phones.map(x => x.manufacturer+':'+x.model)).size,265);
assert.equal(new Set(phones.map(x=>x.manufacturer)).size,11);
assert.equal(growth.length,14);
for(const item of growth){
  assert.ok(item.market?.includes('JP'),item.id+' JP market');
  assert.ok(item.sources?.specificationsUrl.startsWith('https://'),item.id+' primary specs');
  assert.equal(item.sources.verifiedAt,'2026-11-03',item.id+' verified date');
  assert.ok(item.charging?.connector,item.id+' charging connector');
}
assert.equal(accessory.length,27);
for (const k of ['charger-pps-65w','charger-oppo-airvooc']){
  assert.ok(accessory.some(x=>x.key===k),'missing accessory '+k);
}

const index=read('tools/phone-quickcheck/models/index.html');
assert.equal((index.match(/data-phone-id=/g)||[]).length,265);
assert.match(index,/<title>スマホ265機種/);
assert.match(index,/CollectionPage/);
for(const phone of phones){
  assert.ok(index.includes('data-phone-id="'+phone.id+'"'),'missing static model '+phone.id);
  assert.ok(index.includes('?model='+encodeURIComponent(phone.model)),'missing valid model link '+phone.id);
  assert.ok(index.includes(phone.sources.specificationsUrl.replace(/&/g,'&amp;')),'missing primary source '+phone.id);
}
const main=read('tools/phone-quickcheck/index.html');
assert.match(main,/265機種/);
assert.ok(main.includes('href="./models/"'));
assert.ok(main.includes('href="./charging-guide/"'));
const app=read('tools/phone-quickcheck/app.js');
assert.ok(app.includes('phones-growth-20261103.json'));
const guide=read('tools/phone-quickcheck/charging-guide/index.html');
assert.match(guide,/<title>スマホ充電器の選び方/);
assert.ok(guide.includes('AIRVOOC'));
assert.ok(guide.includes('PPS'));
assert.ok(guide.includes('適格販売により収入を得ています'));
const amazonLinks=[...guide.matchAll(/href="(https:\/\/www\.amazon\.co\.jp\/s\?[^"]+)"[^>]+rel="([^"]+)"/g)];
assert.ok(amazonLinks.length>=7);
for(const [,url,rel] of amazonLinks){
  const parsed=new URL(url.replace(/&amp;/g,'&'));
  assert.equal(parsed.searchParams.get('tag'),'nicheworks09-22');
  assert.ok(parsed.searchParams.get('k'));
  assert.ok(rel.split(' ').includes('sponsored'));
  assert.ok(rel.split(' ').includes('noopener'));
}
const confScript=read('tools/phone-quickcheck/affiliate-config.js');
const context={window:{},URL};
vm.runInNewContext(confScript,context);
for(const k of ['charger-pps-65w','charger-oppo-airvooc']){
  const offer=context.window.NWPhoneQuickCheckAffiliate.getOffer(k);
  assert.ok(offer);
  assert.equal(new URL(offer.url).searchParams.get('tag'),'nicheworks09-22');
}
const sitemap=read('sitemap.xml');
for(const path of ['','models/','charging-guide/']){
  assert.ok(sitemap.includes('<loc>https://nicheworks.app/tools/phone-quickcheck/'+path+'</loc>'),'missing sitemap '+path);
}
assert.ok(!index.includes('<meta name="robots" content="noindex'));
console.log('Phone QuickCheck SEO growth PASS: 265 official-source phones, 11 makers, 27 accessories, fully crawlable model index, guide, sitemap and affiliate disclosure.');
