import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('tools/phone-quickcheck/charging-guide/index.html', 'utf8');
const source = fs.readFileSync('tools/phone-quickcheck/charging-guide/affiliate-guide-tracking.js', 'utf8');
const tags = [...html.matchAll(/<a class="amazon" data-offer-key="([^"]+)" href="([^"]+)"[^>]*>/g)];
assert.equal(tags.length, 9, 'All nine existing guide Amazon search links must be measured');
assert.ok(html.includes('<script src="./affiliate-guide-tracking.js" defer></script>'));

function link(key, url) {
  const handlers = [];
  return {
    dataset: { offerKey: key },
    href: url,
    addEventListener(event, callback) {
      if (event === 'click') handlers.push(callback);
    },
    click() { for (const callback of handlers) callback(); },
    get handlers() { return handlers.length; }
  };
}
const links = tags.map(([,key,url])=>link(key,url.replaceAll('&amp;','&')));
links.push(
  link('charger-qi2','https://www.amazon.co.jp/s?k=Qi2&tag=wrongid-22'),
  link('charger-qi2','https://fake.amazon.co.jp.invalid/s?k=Qi2&tag=nicheworks09-22'),
  link('unreviewed-accessory','https://www.amazon.co.jp/s?k=test&tag=nicheworks09-22'),
  link('charger-qi2','http://www.amazon.co.jp/s?k=Qi2&tag=nicheworks09-22'),
  link('charger-qi2','https://www.amazon.co.jp/dp/B012345678?tag=nicheworks09-22')
);
const events = [];
const ctx = {
  URL,
  window: { gtag: (...args)=>events.push(args) },
  document: { readyState:'complete', querySelectorAll:()=>links }
};
vm.runInNewContext(source,ctx,{filename:'affiliate-guide-tracking.js'});
for (let i=0;i<9;i++) {
  assert.equal(links[i].handlers,1, 'Allowed link must have exactly one click handler');
  links[i].click();
}
for(let i=9;i<links.length;i++) {
  assert.equal(links[i].handlers,0, 'Mismatched link must not be tracked');
  links[i].click();
}
assert.equal(events.length,9,'Exactly one event for each eligible Amazon click');
const allowedParams=['affiliate_id','destination_key','language','merchant','placement','tool_slug'];
for(let i=0;i<events.length;i++){
  const [command,event,payload]=events[i];
  const category=tags[i][1];
  assert.equal(command,'event');
  assert.equal(event,'affiliate_outbound');
  assert.deepEqual(Object.keys(payload).sort(),allowedParams);
  assert.equal(payload.affiliate_id,'phone_guide_'+category);
  assert.equal(payload.destination_key,category);
  assert.equal(payload.placement,'charging_guide');
  assert.equal(payload.merchant,'amazon');
  assert.equal(payload.tool_slug,'phone-quickcheck');
  assert.equal(payload.language,'ja');
  assert.equal(JSON.stringify(payload).includes('amazon.co.jp'),false,'No affiliate link URL in analytics');
}
// No GA4 function means no blocked navigation and no event invocation.
delete ctx.window.gtag;
links[0].click();
assert.equal(events.length,9);
console.log('Phone QuickCheck guide analytics PASS: 9 fixed sponsored links, one GA4 event per click, bad URL rejected, no model/query leak.');
