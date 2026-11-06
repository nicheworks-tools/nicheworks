import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const base=JSON.parse(read('tools/phone-quickcheck/data/phones.json')).phones;
const growth=JSON.parse(read('tools/phone-quickcheck/data/phones-growth-20261103.json')).phones;
const all=[...base,...growth],idx=read('tools/phone-quickcheck/models/index.html');
const sitemap=read('sitemap.xml'),cats=JSON.parse(read('tools/phone-quickcheck/data/accessories.json')).accessories;
const newPhones=["google-pixel-3-xl","oppo-a79-5g","oppo-a73","oppo-reno3-a","xiaomi-poco-x7-pro","xiaomi-poco-f7-pro","motorola-moto-g66j-5g","zte-nubia-s-5g-a403zt","sharp-aquos-sense6s-shg07","sony-xperia-10-iii-lite-xqbt44"],profiles=["google-pixel-3-xl","oppo-a79-5g","oppo-a73","oppo-reno3-a","xiaomi-poco-x7-pro","xiaomi-poco-f7-pro","motorola-moto-g66j-5g","zte-nubia-s-5g-a403zt","sharp-aquos-sense6s-shg07","sony-xperia-10-iii-lite-xqbt44","apple-iphone-17-pro","apple-iphone-17-pro-max","apple-iphone-air","apple-iphone-14-plus","google-pixel-9-pro","google-pixel-9-pro-xl","google-pixel-8","samsung-galaxy-s24","samsung-galaxy-s24-ultra","samsung-galaxy-a36-5g","samsung-galaxy-a54-5g","samsung-galaxy-s23","samsung-galaxy-s23-ultra-sc52d","sony-xperia-10-vi","sony-xperia-1-v","sony-xperia-10-v","sony-xperia-5-v","sharp-aquos-r9","sharp-aquos-wish4","sharp-aquos-r8","oppo-a3-5g","oppo-reno11-a","oppo-a5x","xiaomi-redmi-note-13-pro-5g","xiaomi-redmi-12-5g","xiaomi-15-ultra","motorola-moto-g24","motorola-edge-50-pro","fcnt-arrows-we2-m07","nothing-cmf-phone-1"];
assert.equal(all.length,285);assert.equal(new Set(all.map(p=>p.id)).size,285);assert.equal(growth.length,14);assert.equal(cats.length,27);
assert.equal(newPhones.length,10);assert.equal(profiles.length,40);assert.equal((idx.match(/data-phone-id=/g)||[]).length,285);
const reviews=JSON.parse(read('tools/phone-quickcheck/data/reviewed-unknowns.json')).entries;
for(const id of newPhones){const p=all.find(x=>x.id===id);assert.ok(p);assert.ok(p.market.includes('JP'));assert.equal(p.sources.verifiedAt,'2026-11-06');assert.ok(p.sources.specificationsUrl.startsWith('https://'));
for(const [field,unknown] of [['included.adapter',p.included.adapter==='unknown'],['included.cable',p.included.cable==='unknown'],['water',p.waterRating==null&&p.waterStatus!=='not_resistant']])if(unknown)assert.ok(reviews.some(x=>x.phoneId===id&&x.field===field&&x.status==='reviewed_unresolved'),'Unreviewed unknown '+id+field);
}
for(const id of profiles){const p=all.find(x=>x.id===id);assert.ok(p);const h=read('tools/phone-quickcheck/models/'+id+'/index.html'),url='https://nicheworks.app/tools/phone-quickcheck/models/'+id+'/';
assert.ok(h.includes('<link rel="canonical" href="'+url+'">'),'Canonical '+id);
assert.ok(h.includes('"@type":"TechArticle"')&&h.includes('"@type":"WebApplication"'),'Structured data '+id);
assert.ok(h.includes(p.sources.specificationsUrl.replaceAll('&','&amp;'))||h.includes(p.sources.specificationsUrl.replaceAll('&','\\u0026')),'Source '+id);
assert.ok(h.includes('href="/tools/phone-quickcheck/?model='+encodeURIComponent(p.model)+'"'),'Exact model '+id);
assert.ok(idx.includes('href="./'+id+'/">充電器・ケース・画面フィルムのガイド</a>'),'Static referral '+id);
assert.ok(sitemap.includes('<loc>'+url+'</loc>'),'Sitemap '+id);
assert.ok(h.includes('適格販売により収入を得ています')&&h.includes('保証しません')&&h.includes('model-profile-affiliate.js'));
for(const m of ['twitter:title','twitter:description','twitter:image'])assert.equal((h.match(new RegExp('name="'+m+'"','g'))||[]).length,1);
const links=[...h.matchAll(/<a class="amazon" data-offer-key="([^"]+)" href="([^"]+)"[^>]*rel="([^"]+)"[^>]*>/g)];
assert.equal(links.length,5,'Five Amazon discovery links '+id);
for(const [,key,href,rel] of links){assert.ok(cats.some(x=>x.key===key));const u=new URL(href.replaceAll('&amp;','&'));assert.equal(u.origin,'https://www.amazon.co.jp');assert.equal(u.pathname,'/s');assert.equal(u.searchParams.get('tag'),'nicheworks09-22');assert.ok(u.searchParams.get('k'));for(const x of ['sponsored','noopener','noreferrer'])assert.ok(rel.split(' ').includes(x));}
for(const k of ['phone-case-model-search','screen-film-model-search','powerbank-10000-usbc'])assert.ok(links.some(x=>x[1]===k));
}
const script=read('tools/phone-quickcheck/models/model-profile-affiliate.js');
assert.ok(script.includes('"powerbank-10000-usbc"'));assert.ok(!script.includes('phone.model')&&!script.includes('window.location'));
const ctx={window:{},URL};vm.runInNewContext(read('tools/phone-quickcheck/affiliate-config.js'),ctx);
assert.equal(new URL(ctx.window.NWPhoneQuickCheckAffiliate.getOffer('powerbank-10000-usbc').url).searchParams.get('tag'),'nicheworks09-22');
console.log('Phone commercial growth PASS: 285 phones, 40 more SEO profiles, 200 Amazon category-search handoffs.');
