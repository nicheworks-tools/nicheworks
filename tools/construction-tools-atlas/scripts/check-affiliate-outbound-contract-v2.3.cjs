#!/usr/bin/env node
"use strict";
// Offline event-contract audit: never clicks real merchant links or sends GA4 events.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),repoRoot=path.resolve(root,"..","..");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,"data",name),"utf8"));
const manifest=read("seo-detail-pages-v2.3.json"),offers=read("affiliate-offers-v2.3.json");
const active=new Map(offers.offers.filter(x=>x.status==="active").map(x=>[x.entry_id,x]));
const helperSource=fs.readFileSync(path.join(repoRoot,"assets","amazon-affiliate.js"),"utf8");
const detailSource=fs.readFileSync(path.join(root,"seo-detail-v2.3.js"),"utf8");
assert.equal(manifest.summary.public_runtime_entries,865,"Unexpected public canonical dictionary count");
assert.ok(manifest.summary.published_static_detail_pages>=55,"Fewer than the retained 55 static commerce pages");
assert.equal(manifest.entries.length,manifest.summary.published_static_detail_pages,"SEO manifest count mismatch");
class FakeElement{
 constructor(tag="div"){this.tag=tag;this.children=[];this.handlers={};this.hidden=false;this.dataset={};this.textContent="";}
 replaceChildren(...children){this.children=[...children]}
 appendChild(child){this.children.push(child)}
 addEventListener(event,handler){this.handlers[event]=handler}
 closest(){return null}
}
function field(html,key){const match=html.match(new RegExp('data-'+key+'="([^"]+)"'));return match?.[1]?.replaceAll("&amp;","&")||""}
const seen=new Set();let clicks=0,disclosures=0,blockedExternal=0;
for(const entry of manifest.entries){
 const id=entry.id;assert(!seen.has(id),"Duplicate static detail canonical: "+id);seen.add(id);
 const offer=active.get(id);assert(offer,"Missing active offer for "+id);
 const html=fs.readFileSync(path.join(root,"entries",id,"index.html"),"utf8");
 assert.equal(field(html,"affiliate-entry"),id,id+" affiliate identity differs from page");
 const url=field(html,"affiliate-url");
 assert.equal(url,offer.amazon_url,id+" static Amazon target differs from approved mapping");
 assert.equal(new URL(url).searchParams.get("tag"),offers.tracking_id,id+" affiliate tag drift");
 assert.ok(html.includes('<script src="/assets/amazon-affiliate.js"></script>'),id+" shared affiliate helper missing");
 assert.ok(html.includes('<script src="/tools/construction-tools-atlas/seo-detail-v2.3.js"></script>'),id+" detail controller missing");
 assert.ok(html.includes('https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB'),id+" GA4 measurement snippet missing");
 const mount=new FakeElement("div"),disclosure=new FakeElement("div"),section=new FakeElement("section"),eventCalls=[];
 section.dataset={affiliateEntry:id,affiliateUrl:url,affiliateLabelJa:field(html,"affiliate-label-ja")};
 section.querySelector=selector=>selector===".affiliateMount"?mount:selector===".affiliateDisclosure"?disclosure:null;
 const listeners={};
 const document={
  documentElement:{lang:"ja"},
  createElement:tag=>new FakeElement(tag),
  querySelector:selector=>selector==="[data-affiliate-entry]"?section:null,
  querySelectorAll:()=>[],
  addEventListener:(event,fn)=>{listeners[event]=fn}
 };
 const window={location:{href:"https://nicheworks.app/tools/construction-tools-atlas/entries/"+id+"/"},gtag:(...args)=>eventCalls.push(args)};
 const context={window,document,Element:FakeElement,URL,Set,Map,Object,Number,String,Array};
 vm.runInNewContext(helperSource,context,{filename:"amazon-affiliate.js"});
 vm.runInNewContext(detailSource,context,{filename:"seo-detail-v2.3.js"});
 assert.equal(typeof listeners.DOMContentLoaded,"function",id+" DOM ready handler absent");
 listeners.DOMContentLoaded();
 assert.equal(mount.hidden,false,id+" affiliate link did not mount");
 assert.equal(mount.children.length,1,id+" expected exactly one merchant link");
 const link=mount.children[0];
 assert.equal(link.href,url,id+" merchant URL mutated");
 assert.equal(link.target,"_blank",id+" external navigation must use a new tab");
 assert.equal(link.rel,"sponsored noopener",id+" merchant link must carry sponsored noopener");
 assert.equal(link.textContent,offer.label_ja,id+" label mismatches maintained offer");
 assert.ok(link.handlers.click,id+" outbound click listener missing");
 assert.equal(disclosure.hidden,false,id+" sponsored disclosure must be visible");
 assert.equal(disclosure.children.length,2,id+" disclosure must be bilingual");
 disclosures++;
 link.handlers.click();
 assert.equal(eventCalls.length,1,id+" click must emit exactly one GA4 event");
 const [type,eventName,payload]=eventCalls[0];
 assert.equal(type,"event");assert.equal(eventName,"affiliate_outbound");
 assert.equal(payload.tool_slug,"construction-tools-atlas",id+" tool slug mismatch");
 assert.equal(payload.affiliate_id,id+"_static_detail",id+" affiliate ID mismatch");
 assert.equal(payload.placement,"static_detail",id+" placement mismatch");
 assert.equal(payload.merchant,"amazon",id+" merchant mismatch");
 assert.equal(payload.destination_key,id,id+" destination key mismatch");
 assert.equal(payload.language,"ja",id+" language mismatch");
 assert.deepEqual(Object.keys(payload).sort(),["affiliate_id","destination_key","language","merchant","placement","tool_slug"],id+" unexpected outbound payload fields");
 clicks++;
 const blocked=new FakeElement("div");
 const bad=window.NWAmazonAffiliate.mountUrl({container:blocked,target:id,url:"https://www.amazon.co.jp.evil.example/s?tag=bad",placement:"static_detail"});
 assert.equal(bad,false,id+" off-domain merchant redirect was incorrectly accepted");
 assert.equal(blocked.children.length,0,id+" blocked link remained visible");blockedExternal++;
}
console.log("CTA_AFFILIATE_OUTBOUND_OFFLINE_QA_PASS="+JSON.stringify({
 pages:seen.size,click_events:clicks,event_name:"affiliate_outbound",placement:"static_detail",
bilingual_disclosures:disclosures,blocked_external_urls:blockedExternal,
 ga4_received_confirmed:false,real_merchant_requests:0
}));
