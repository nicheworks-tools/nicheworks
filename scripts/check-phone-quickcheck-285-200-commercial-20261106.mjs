import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const base=JSON.parse(read('tools/phone-quickcheck/data/phones.json')).phones;
const growth=JSON.parse(read('tools/phone-quickcheck/data/phones-growth-20261103.json')).phones;
const all=[...base,...growth],index=read('tools/phone-quickcheck/models/index.html'),site=read('sitemap.xml');
const reviews=JSON.parse(read('tools/phone-quickcheck/data/reviewed-unknowns.json')).entries;
const newModels=["xiaomi-redmi-15-5g","xiaomi-redmi-note-15-5g","xiaomi-redmi-note-15-pro-5g","xiaomi-poco-f7","xiaomi-poco-f7-ultra","xiaomi-xiaomi-15t","xiaomi-xiaomi-15t-pro","sharp-aquos-r9-pro","xiaomi-xiaomi-14t","xiaomi-xiaomi-15"];
const profileIds=["xiaomi-redmi-15-5g","xiaomi-redmi-note-15-5g","xiaomi-redmi-note-15-pro-5g","xiaomi-poco-f7","xiaomi-poco-f7-ultra","xiaomi-xiaomi-15t","xiaomi-xiaomi-15t-pro","sharp-aquos-r9-pro","xiaomi-xiaomi-14t","xiaomi-xiaomi-15","google-pixel-11-pro","samsung-galaxy-a57-5g","apple-iphone-duo","xiaomi-17-ultra","motorola-edge-60","sony-xperia-1-iv","sharp-aquos-r11","oppo-find-n6","zte-nubia-flip-3","fcnt-arrows-alpha2-m10","nothing-phone-3a-lite","google-pixel-11-pro-fold","samsung-galaxy-s26-plus","apple-iphone-16-plus","xiaomi-17t","motorola-edge-70-fusion","sony-xperia-10-iv","sharp-aquos-wish6","oppo-find-x9-ultra","zte-nubia-fold","fcnt-arrows-we3-m09","nothing-phone-4a","google-pixel-11-pro-xl","samsung-galaxy-z-flip8","apple-iphone-16-pro","xiaomi-17t-pro","motorola-moto-g06","sony-xperia-5-iv","sharp-aquos-r8-pro","oppo-reno15-a","zte-libero-flip","fcnt-arrows-we2-plus-m06","nothing-phone-4a-pro","google-pixel-10-pro","samsung-galaxy-z-fold8","apple-iphone-16-pro-max","xiaomi-poco-f9-ultra","motorola-moto-g37j","sony-xperia-ace-iii","sharp-aquos-wish3","oppo-reno16-5g","zte-nubia-flip-5g","fcnt-arrows-n-f51c","nothing-phone-4b","google-pixel-10-pro-fold","samsung-galaxy-z-fold8-ultra","apple-iphone-15-plus","xiaomi-poco-m8-5g","motorola-razr-fold","sony-xperia-1-iii","sharp-aquos-sense7","oppo-reno10-pro-5g","fcnt-arrows-be4-plus-f41b","nothing-cmf-phone-2-pro","google-pixel-10-pro-xl","samsung-galaxy-z-flip7","apple-iphone-15-pro","xiaomi-poco-x8-pro","motorola-razr-60","sony-xperia-10-iii","sharp-aquos-wish","oppo-reno9-a","fcnt-arrows-we-f51b","nothing-phone-3","google-pixel-9-pro-fold","samsung-galaxy-z-fold7","apple-iphone-15-pro-max","xiaomi-poco-x8-pro-max","motorola-razr-60-ultra","sony-xperia-5-iii","sharp-aquos-wish2","oppo-a77","fcnt-arrows-5g-f51a","nothing-phone-2a","google-pixel-8-pro","samsung-galaxy-z-flip6","apple-iphone-14-pro","xiaomi-redmi-note-17-pro-max-5g","motorola-razr-50","sony-xperia-ace-ii","sharp-aquos-r6","oppo-reno7-a","fcnt-arrows-be4-f41a","google-pixel-fold","samsung-galaxy-z-fold6","apple-iphone-14-pro-max","xiaomi-redmi-note-11-pro-5g","motorola-razr-50-ultra","sony-xperia-1-ii","sharp-aquos-sense5g","apple-iphone-13"];
assert.equal(all.length,285);assert.equal(new Set(all.map(p=>p.id)).size,285);
assert.equal(base.length,271);assert.equal(growth.length,14);
assert.equal((index.match(/data-phone-id=/g)||[]).length,285);
assert.equal(newModels.length,10);assert.equal(profileIds.length,101);assert.equal(new Set(profileIds).size,100);
assert.equal(new Set(all.map(p=>p.manufacturer)).size,11);
for(const id of newModels){
const p=all.find(q=>q.id===id);
assert.ok(p&&p.market.includes('JP'),'new model missing '+id);
assert.equal(p.sources.verifiedAt,'2026-11-06');
assert.ok(p.sources.specificationsUrl.startsWith('https://'));
assert.ok(p.charging.battery.capacityMah>0);
for(const [field,isUnknown] of [['included.adapter',p.included?.adapter==='unknown'],['included.cable',p.included?.cable==='unknown'],['water',!p.waterRating&&p.waterStatus!=='not_resistant']]){
if(isUnknown)assert.ok(reviews.some(x=>x.phoneId===id&&x.field===field&&x.status==='reviewed_unresolved'),'Unknown without review '+id+field);
}
}
const oldProfileCount=99;
assert.equal(oldProfileCount,99);
const indexAnchors=[...index.matchAll(/class="profile-link" href="\.\/([^/]+)\/">充電器・ケース・画面フィルムのガイド/g)].map(x=>x[1]);
assert.equal(indexAnchors.length,200);
for(const id of profileIds){
const p=all.find(q=>q.id===id);assert.ok(p);
const h=read('tools/phone-quickcheck/models/'+id+'/index.html');
const url='https://nicheworks.app/tools/phone-quickcheck/models/'+id+'/';
assert.ok(h.includes('href="'+url+'"'),'canonical '+id);
assert.ok(site.includes('<loc>'+url+'</loc>'),'sitemap '+id);
assert.ok(index.includes('href="./'+id+'/">充電器・ケース・画面フィルムのガイド</a>'),'directory link '+id);
assert.ok(h.includes('"@type":"WebApplication"')&&h.includes('"@type":"TechArticle"'),'schema '+id);
assert.ok(h.includes(p.sources.specificationsUrl.replaceAll('&','&amp;'))||h.includes(p.sources.specificationsUrl.replaceAll('&','\\u0026')),'official source '+id);
assert.ok(h.includes('href="/tools/phone-quickcheck/?model='+encodeURIComponent(p.model)+'"'),'model deep-link '+id);
for(const name of ['twitter:title','twitter:description','twitter:image'])assert.equal((h.match(new RegExp('name="'+name+'"','g'))||[]).length,1);
assert.ok(h.includes('適格販売により収入を得ています')&&h.includes('保証しません'),'disclosure '+id);
assert.ok(h.includes('model-profile-affiliate.js'));
const links=[...h.matchAll(/<a class="amazon" data-offer-key="([^"]+)" href="([^"]+)"[^>]*rel="([^"]+)"[^>]*>/g)];
assert.equal(links.length,5,'exactly five Amazon searches '+id);
const keys=links.map(x=>x[1]);
for(const key of ['phone-case-model-search','screen-film-model-search','powerbank-10000-usbc'])assert.ok(keys.includes(key),'accessory type '+id+key);
for(const [,key,href,rel] of links){
assert.ok(['cable-usbc-usbc','cable-usbc-lightning','charger-pd-check-wattage','charger-compat-check','phone-case-model-search','screen-film-model-search','powerbank-10000-usbc'].includes(key));
const u=new URL(href.replaceAll('&amp;','&'));
assert.equal(u.origin,'https://www.amazon.co.jp');assert.equal(u.pathname,'/s');assert.equal(u.searchParams.get('tag'),'nicheworks09-22');assert.ok(u.searchParams.get('k'));
for(const part of ['sponsored','noopener','noreferrer'])assert.ok(rel.split(' ').includes(part));
}
}
console.log('Phone growth PASS: 285 official-source phones, 200 indexed model guides, 101 new pages and 505 new sponsored Amazon searches.');
