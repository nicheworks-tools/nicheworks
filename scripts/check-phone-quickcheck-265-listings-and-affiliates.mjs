import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const records=[...JSON.parse(read('tools/phone-quickcheck/data/phones.json')).phones,...JSON.parse(read('tools/phone-quickcheck/data/phones-growth-20261103.json')).phones];
const categories=JSON.parse(read('tools/phone-quickcheck/data/accessories.json')).accessories;
const index=read('tools/phone-quickcheck/models/index.html'),sitemap=read('sitemap.xml');
const added=["google-pixel-3","google-pixel-3a","google-pixel-3a-xl","google-pixel-4","google-pixel-4-xl","xiaomi-redmi-note-14-pro-5g","xiaomi-redmi-14c","sharp-aquos-sense2-shm08","sharp-aquos-sense3-lite","motorola-moto-g05"],profiles=["google-pixel-3","google-pixel-3a","google-pixel-3a-xl","google-pixel-4","google-pixel-4-xl","xiaomi-redmi-note-14-pro-5g","xiaomi-redmi-14c","sharp-aquos-sense2-shm08","sharp-aquos-sense3-lite","motorola-moto-g05","apple-iphone-18-pro","google-pixel-11","samsung-galaxy-s26","sony-xperia-1-viii","sharp-aquos-sense10","oppo-reno13-a","xiaomi-17","motorola-edge-60-pro","fcnt-arrows-alpha-m08","nothing-phone-3a","zte-nubia-flip-2","apple-iphone-18-pro-max","apple-iphone-17","apple-iphone-17e","apple-iphone-16","apple-iphone-16e","apple-iphone-15","apple-iphone-14","google-pixel-10","google-pixel-10a","google-pixel-9","google-pixel-8a","google-pixel-7a","samsung-galaxy-s26-ultra","samsung-galaxy-s25","samsung-galaxy-s25-ultra","samsung-galaxy-a55-5g","samsung-galaxy-a25-5g-au","sony-xperia-10-viii","sony-xperia-10-vii","sony-xperia-1-vi","sharp-aquos-r10","sharp-aquos-wish5","sharp-aquos-sense8","oppo-find-x9","oppo-a5-5g","oppo-find-x8","xiaomi-14t-pro","xiaomi-redmi-note-13-pro-plus-5g","motorola-moto-g64-5g"];
assert.equal(records.length,265);assert.equal(categories.length,27);
assert.equal(added.length,10);assert.equal(profiles.length,50);
assert.equal(new Set(profiles).size,50);
assert.equal((index.match(/data-phone-id=/g)||[]).length,265);
for(const id of added){const p=records.find(x=>x.id===id);assert.ok(p);assert.equal(p.sources.verifiedAt,'2026-11-05');assert.ok(p.market.includes('JP'));assert.ok(p.sources.specificationsUrl.startsWith('https://'));assert.ok(index.includes('?model='+encodeURIComponent(p.model)));}
for(const id of profiles){
const p=records.find(x=>x.id===id);assert.ok(p);
const html=read('tools/phone-quickcheck/models/'+id+'/index.html'),url='https://nicheworks.app/tools/phone-quickcheck/models/'+id+'/';
assert.ok(html.includes('href="'+url+'"'),'Missing canonical '+id);
assert.ok(html.includes('"@type":"TechArticle"'),'Missing source-backed article '+id);
assert.ok(html.includes(p.sources.specificationsUrl.replaceAll('&','&amp;')) || html.includes(p.sources.specificationsUrl.replaceAll('&','\\u0026')),'Missing official source '+id);
assert.ok(html.includes('href="/tools/phone-quickcheck/?model='+encodeURIComponent(p.model)+'"'),'Wrong exact-model deep-link '+id);
assert.ok(index.includes('href="./'+id+'/">充電器・ケース・画面フィルムのガイド</a>'),'Index link missing '+id);
assert.ok(sitemap.includes('<loc>'+url+'</loc>'),'Sitemap missing '+id);
assert.ok(html.includes('適格販売により収入を得ています'));
assert.ok(html.includes('rel="sponsored noopener noreferrer"'));
assert.ok(html.includes('model-profile-affiliate.js'));
const anchors=[...html.matchAll(/<a class="amazon" data-offer-key="([^"]+)" href="([^"]+)"[^>]*>/g)];
assert.equal(anchors.length,4,'Expected 4 fixed category searches '+id);
assert.ok(anchors.some(x=>x[1]==='phone-case-model-search'));
assert.ok(anchors.some(x=>x[1]==='screen-film-model-search'));
for(const [,key,href] of anchors){assert.ok(categories.some(c=>c.key===key),'Unknown accessory key '+key);const u=new URL(href.replaceAll('&amp;','&'));assert.equal(u.origin,'https://www.amazon.co.jp');assert.equal(u.pathname,'/s');assert.equal(u.searchParams.get('tag'),'nicheworks09-22');assert.ok(u.searchParams.get('k'));}
assert.ok(html.includes('保証しません'));
for(const meta of ['twitter:title','twitter:description','twitter:image'])assert.equal((html.match(new RegExp('name="'+meta+'"','g'))||[]).length,1);
}
const context={window:{},URL};vm.runInNewContext(read('tools/phone-quickcheck/affiliate-config.js'),context);
for(const key of ['charger-compat-check','phone-case-model-search','screen-film-model-search']){const offer=context.window.NWPhoneQuickCheckAffiliate.getOffer(key);assert.ok(offer);assert.equal(new URL(offer.url).searchParams.get('tag'),'nicheworks09-22');}
const clicker=read('tools/phone-quickcheck/models/model-profile-affiliate.js');
for(const key of ['charger-compat-check','phone-case-model-search','screen-film-model-search','cable-usbc-lightning'])assert.ok(clicker.includes('"'+key+'"'));
assert.ok(!clicker.includes('window.location')&&!clicker.includes('phone.model'));
console.log('Phone coverage and affiliate PASS: 265 models, 27 categories, 50 new guide pages, 200 tracked tagged searches.');
