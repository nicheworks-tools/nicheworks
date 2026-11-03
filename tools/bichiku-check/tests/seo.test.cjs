"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const prefix="https://nicheworks.app/tools/bichiku-check/";
const langs=[
 {slug:"",lang:"ja",url:prefix,heading:"防災備蓄リスト",description:"代用品"},
 {slug:"en/",lang:"en",url:prefix+"en/",heading:"Emergency",description:"outage"},
 {slug:"zh-cn/",lang:"zh-CN",url:prefix+"zh-cn/",heading:"防灾",description:"停电"},
 {slug:"vi/",lang:"vi",url:prefix+"vi/",heading:"thiên tai",description:"mất điện"}
];
function meta(html,attribute,name){
 const re=new RegExp('<meta\\s+'+attribute+'="'+name+'"\\s+content="([^"]*)">',"g");
 return [...html.matchAll(re)].map(x=>x[1]);
}
for(const {slug,lang,url,heading,description} of langs){
 const file="tools/bichiku-check/"+slug+"index.html";
 test(file+" has unique title, description, canonical and structured metadata",()=>{
  const html=read(file);
  const titles=[...html.matchAll(/<title>([^<]*)<\/title>/g)].map(x=>x[1]);
  assert.equal(titles.length,1);
  assert.ok(titles[0].includes(heading));
  const descriptions=meta(html,"name","description");
  assert.equal(descriptions.length,1);
  assert.ok(descriptions[0].includes(description));
  assert.ok(descriptions[0].length>60);
  assert.equal(html.split('<link rel="canonical" href="'+url+'">').length-1,1);
  assert.match(html,/<meta name="robots" content="index,follow">/);
  assert.doesNotMatch(html,/<meta name="robots" content="noindex/);
  assert.equal(meta(html,"property","og:title")[0],titles[0]);
  assert.equal(meta(html,"name","twitter:title")[0],titles[0]);
  assert.equal(meta(html,"property","og:description")[0],descriptions[0]);
  assert.equal(meta(html,"name","twitter:description")[0],descriptions[0]);
  const ldMatches=[...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)];
  assert.equal(ldMatches.length,1);
  const structured=JSON.parse(ldMatches[0][1]);
  assert.equal(structured["@type"],"WebApplication");
  assert.equal(structured.url,url);
  assert.equal(structured.inLanguage,lang);
  assert.equal(structured.description,descriptions[0]);
  assert.equal(structured.isAccessibleForFree,true);
  assert.doesNotMatch(html,/FAQPage/);
 });
 test(file+" contains crawlable guidance and official references",()=>{
  const html=read(file);
  assert.ok(html.includes('<html lang="'+lang+'">'));
  assert.ok(html.indexOf('class="workspace"')<html.indexOf('id="bichiku-guide"'));
  assert.ok(html.indexOf('id="bichiku-guide"')<html.indexOf('id="references"'));
  assert.ok(html.includes("seo-guide-grid"));
  assert.ok((html.match(/<article>/g)||[]).length>=3);
  assert.ok((html.match(/<li>/g)||[]).length>=4);
  for(const u of ["https://www.bousai.go.jp/kyoiku/hokenkyousai/check.html",
   "https://www.bousai.metro.tokyo.lg.jp/1028036/1028901/1008042/1008079/1008086.html",
   "https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_063/"]){
   assert.ok(html.includes('href="'+u+'"'),"missing official source "+u);
  }
  assert.ok(html.includes('id="setup"')&&html.includes('id="results"'));
  assert.ok(!html.includes('\\n<link rel="alternate"'),"literal escaped newline in head");
  for(const [code,href] of [["ja",prefix],["en",prefix+"en/"],["zh-CN",prefix+"zh-cn/"],["vi",prefix+"vi/"],["x-default",prefix]]){
   const value='<link rel="alternate" hreflang="'+code+'" href="'+href+'">';
   assert.equal(html.split(value).length-1,1,"hreflang "+code);
  }
 });
}
test("canonical metadata and descriptive home links agree",()=>{
 const m=JSON.parse(read("tools/tools-meta.json")).items["bichiku-check"];
 const index=JSON.parse(read("tools/tools-index.json"));
 assert.equal(index.total,90);
 assert.deepEqual(index.items.find(x=>x.slug==="bichiku-check"),Object.assign({slug:"bichiku-check"},m));
 for(const [file,url] of [["index.html","/tools/bichiku-check/"],["en/index.html","/tools/bichiku-check/en/"],
 ["categories/index.html","/tools/bichiku-check/"],["en/categories/index.html","/tools/bichiku-check/en/"]]){
  assert.ok(read(file).includes('<a href="'+url+'">'),"missing static navigation "+file);
 }
});
