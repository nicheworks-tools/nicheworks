import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const base=new URL("../",import.meta.url);
const en=fs.readFileSync(new URL("index.html",base),"utf8");
const ja=fs.readFileSync(new URL("ja/index.html",base),"utf8");
const css=fs.readFileSync(new URL("style.css",base),"utf8");
const code=fs.readFileSync(new URL("copy-handoff.js",base),"utf8");
const packs=["research-pack","pm-pack","exec-assist-pack","sales-pack","cs-pack"];
for(const [lang,page,script] of [
 ["en",en,'src="./copy-handoff.js"'],["ja",ja,'src="../copy-handoff.js"']
]){
 assert.ok(page.includes(script),lang+": relative script path");
 assert.equal(page.split('id="nwFivePackTemplate"').length-1,1);
 assert.equal(page.split('id="nwFivePackCopy"').length-1,1);
 assert.equal(page.split('id="nwFivePackStatus"').length-1,1);
 const start=page.indexOf('<pre id="nwFivePackTemplate"');
 const block=page.slice(start,page.indexOf("</pre>",start));
 let index=-1;
 for(const pack of packs){
  const next=block.indexOf(pack);
  assert.ok(next>index,lang+": five core pack IDs must be in order");
  index=next;
 }
 assert.match(block,/review pending|レビュー未了/,lang+": human-review disclaimer");
 assert.match(page,/does not submit business data|業務データの送信/,lang+": no uploads");
}
assert.match(css,/\.nw-handoff-pre/);
assert.match(css,/@media \(max-width: 760px\)/);
assert.doesNotMatch(code,/fetch\(|sendBeacon|XMLHttpRequest/);

let callback;
let copied="";
let fallbackValue="";
const status={textContent:""};
const button={addEventListener(event,fn){assert.equal(event,"click");callback=fn}};
const template={textContent:"\n[Five-pack handoff — DRAFT]\nresearch-pack\npm-pack\n"};
const node={
 value:"",style:{},setAttribute(){},select(){fallbackValue=this.value},remove(){}
};
const doc={
 documentElement:{lang:"en"},
 getElementById(id){
  return ({nwFivePackCopy:button,nwFivePackTemplate:template,nwFivePackStatus:status})[id];
 },
 createElement(tag){assert.equal(tag,"textarea");return node},
 body:{appendChild(){}},
 execCommand(name){assert.equal(name,"copy");return true}
};
const browser={
 document:doc,window:{isSecureContext:true},
 navigator:{clipboard:{writeText:async value=>{copied=value}}}
};
vm.runInNewContext(code,browser);
await callback();
assert.equal(copied,template.textContent.trim());
assert.equal(status.textContent,"Template copied.");

browser.navigator.clipboard.writeText=async()=>{throw new Error("blocked")};
doc.documentElement.lang="ja";
await callback();
assert.equal(fallbackValue,template.textContent.trim());
assert.equal(status.textContent,"テンプレートをコピーしました。");
console.log("PASS: Codex Work OS five core packs JA/EN, human review and local clipboard fallback");
