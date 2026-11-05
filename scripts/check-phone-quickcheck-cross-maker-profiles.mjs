import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = path => fs.readFileSync(path,'utf8');

const base = JSON.parse(read('tools/phone-quickcheck/data/phones.json')).phones;
const growth = JSON.parse(read('tools/phone-quickcheck/data/phones-growth-20261103.json')).phones;
const phones = [...base,...growth];
const index = read('tools/phone-quickcheck/models/index.html');
const sitemap = read('sitemap.xml');

const cases = [
  {id:'google-pixel-9a', maker:'Google', points:['23W','45W','Qi','USB-Cケーブル同梱']},
  {id:'sharp-aquos-sense9', maker:'SHARP', points:['Revision 3.0','36W','PPS']},
  {id:'sony-xperia-1-vii', maker:'Sony', points:['30W','最大入力','ワイヤレス充電']},
  {id:'oppo-reno14-5g', maker:'OPPO', points:['SUPERVOOC','80W','33W','PPS']}
];
assert.equal(phones.length,255,'Maintained catalog must remain 255 verified models');
for (const item of cases) {
  const phone=phones.find(x=>x.id===item.id);
  assert.ok(phone,'Missing source-backed phone: '+item.id);
  assert.equal(phone.manufacturer,item.maker,'Maker mismatch: '+item.id);
  assert.ok(phone.sources?.specificationsUrl?.startsWith('https://'));
  assert.ok(phone.market?.includes('JP') || (item.id==='sony-xperia-1-vii' && phone.sources.specificationsUrl==='https://www.sony.jp/xperia/products/xperia1m7/spec.html'), 'Japanese primary source required: '+item.id);

  const canonical='https://nicheworks.app/tools/phone-quickcheck/models/'+item.id+'/';
  const page=read('tools/phone-quickcheck/models/'+item.id+'/index.html');
  assert.ok(page.includes('<link rel="canonical" href="'+canonical+'">'));
  assert.ok(page.includes('mainEntityOfPage'),item.id+' requires article entity');
  assert.ok(page.includes('"@type":"TechArticle"'));
  assert.ok(page.includes(phone.sources.specificationsUrl.replaceAll('&','&amp;')) ||
    page.includes(phone.sources.specificationsUrl.replaceAll('&','\\u0026')),
    item.id+' official primary source not linked');
  assert.ok(page.includes('G-57QT78M3JB'),item.id+' GA4 tag removed');
  assert.ok(page.includes('ca-pub-9879006623791275'),item.id+' Ads tag removed');
  assert.ok(page.includes('model-profile-affiliate.js'),item.id+' click tracker missing');
  assert.ok(page.includes('適格販売により収入を得ています'),item.id+' Amazon disclosure missing');
  assert.ok(page.includes('rel="sponsored noopener noreferrer"'));
  assert.ok(page.includes('href="/tools/phone-quickcheck/?model='+encodeURIComponent(phone.model)+'"'),
    item.id+' canonical application deep-link absent');
  assert.ok(index.includes('data-phone-id="'+item.id+'"'));
  assert.ok(index.includes('href="./'+item.id+'/">充電器・サイズの個別ガイド</a>'),
    item.id+' static inbound SEO link missing');
  assert.ok(sitemap.includes('<loc>'+canonical+'</loc>'),item.id+' sitemap absent');
  for (const phrase of item.points)
    assert.ok(page.includes(phrase),item.id+' distinct device specification missing: '+phrase);

  const matches=[...page.matchAll(/<a class="amazon"[^>]+href="([^"]+)"[^>]+rel="([^"]+)"[^>]+data-offer-key=/g)];
  // HTML ordering is offer key before href; check using complete anchor tags instead.
  const anchors=[...page.matchAll(/<a class="amazon"[^>]*>/g)].map(x=>x[0]);
  assert.equal(anchors.length,2,item.id+' requires two maintained Amazon discovery links');
  for(const anchor of anchors){
    const href=anchor.match(/href="([^"]+)"/)?.[1];
    const key=anchor.match(/data-offer-key="([^"]+)"/)?.[1];
    const rel=anchor.match(/rel="([^"]+)"/)?.[1];
    assert.ok(['cable-usbc-usbc','charger-pd-check-wattage'].includes(key),item.id+' untracked offer key');
    const url=new URL(href.replaceAll('&amp;','&'));
    assert.equal(url.hostname,'www.amazon.co.jp');
    assert.equal(url.protocol,'https:');
    assert.equal(url.pathname,'/s');
    assert.equal(url.searchParams.get('tag'),'nicheworks09-22');
    assert.ok(url.searchParams.get('k'));
    assert.ok(['sponsored','noopener','noreferrer'].every(x=>rel.split(' ').includes(x)));
  }
  assert.ok(page.includes('保証しません'),item.id+' compatibility disclaimer missing');
}
assert.equal((index.match(/data-phone-id=/g)||[]).length,255,'255 static entries unchanged');
console.log('Phone QuickCheck cross-maker SEO PASS: four official JP profiles, four maker landing pages, eight tagged Amazon searches and unchanged 255-phone catalog.');
