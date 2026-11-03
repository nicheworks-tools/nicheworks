import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = path => fs.readFileSync(path,'utf8');
const phones = JSON.parse(read('tools/phone-quickcheck/data/phones-growth-20261103.json')).phones.slice(-5);
const directory=read('tools/phone-quickcheck/models/index.html');
const sitemap=read('sitemap.xml');
const refs=[];
for (const phone of phones) {
  assert.equal(phone.manufacturer,'Samsung');
  assert.ok(phone.market.includes('JP'));
  assert.equal(phone.sources.verifiedAt,'2026-11-03');
  assert.ok(phone.charging.battery.sourceRef.startsWith('https://'));
  assert.equal(phone.charging.wiredMaxW,null,'Do not invent input power');
  assert.equal(phone.included.adapter,'unknown','Do not infer boxed adapter');
  const path='tools/phone-quickcheck/models/'+phone.id+'/index.html';
  const html=read(path);
  const canonical='https://nicheworks.app/tools/phone-quickcheck/models/'+phone.id+'/';
  assert.ok(html.includes('href="'+canonical+'"'),'Page canonical missing '+phone.id);
  assert.ok(html.includes('<h1>'+phone.model+'の充電器・USB-Cケーブルは？</h1>'));
  assert.ok(html.includes(phone.sources.specificationsUrl.replaceAll('&','&amp;')),'Primary spec URL missing');
  assert.ok(html.includes('name="description"'));
  assert.ok(html.includes('"@type":"TechArticle"'));
  assert.ok(html.includes('rel="sponsored noopener noreferrer"'));
  assert.equal((html.match(/data-offer-key=/g)||[]).length,2,'Exactly two affiliate handoffs');
  assert.ok(html.includes('model-profile-affiliate.js'));
  assert.ok(directory.includes('data-phone-id="'+phone.id+'"'),'Static directory missing device');
  assert.ok(directory.includes('href="./'+phone.id+'/"'),'Static SEO directory missing long-tail profile');
  assert.ok(directory.includes('?model='+encodeURIComponent(phone.model)),'Main tool deep link absent');
  assert.ok(sitemap.includes('<loc>'+canonical+'</loc>'),'Sitemap missing '+canonical);
  for (const [,href] of html.matchAll(/<a class="amazon"[^>]+href="([^"]+)"/g)) {
    const url=new URL(href.replaceAll('&amp;','&'));
    assert.equal(url.origin,'https://www.amazon.co.jp');
    assert.equal(url.pathname,'/s');
    assert.equal(url.searchParams.get('tag'),'nicheworks09-22');
    assert.ok(url.searchParams.get('k'));
  }
  refs.push(phone.id);
}
const source=read('tools/phone-quickcheck/models/model-profile-affiliate.js');
function link(key,url){
  const handlers=[];
  return { dataset:{offerKey:key},href:url,
   addEventListener:(event,callback)=>{if(event==='click') handlers.push(callback)},
   get count(){return handlers.length},
   click(){for(const fn of handlers) fn()}};
}
const links=[
 link('cable-usbc-usbc','https://www.amazon.co.jp/s?k=usb-c&tag=nicheworks09-22'),
 link('charger-pd-check-wattage','https://www.amazon.co.jp/s?k=usb-pd&tag=nicheworks09-22'),
 link('charger-pd-check-wattage','https://fake.example/s?k=bad&tag=nicheworks09-22'),
 link('charger-pd-check-wattage','https://www.amazon.co.jp/s?k=usb-pd&tag=wrongid-22'),
 link('unrecognized','https://www.amazon.co.jp/s?k=usb-pd&tag=nicheworks09-22')
];
const events=[];
vm.runInNewContext(source,{document:{readyState:'complete',querySelectorAll:()=>links},
 window:{gtag:(...args)=>events.push(args)},URL},{filename:'model-profile-affiliate.js'});
for(const a of links)a.click();
assert.deepEqual(links.map(x=>x.count),[1,1,0,0,0]);
assert.equal(events.length,2);
for(const [name,event,payload] of events){
  assert.equal(name,'event');assert.equal(event,'affiliate_outbound');
  assert.equal(payload.tool_slug,'phone-quickcheck');
  assert.equal(payload.placement,'model_profile');
  assert.equal(payload.merchant,'amazon');
  assert.ok(!JSON.stringify(payload).includes('Galaxy'),'No model identity in GA4 event');
  assert.ok(!JSON.stringify(payload).includes('amazon.co.jp'),'No URL in GA4 event');
}
console.log('Phone profiles PASS: '+refs.length+' official-source JP model pages, ten tagged Amazon searches, sitemap and safe GA4 events.');
