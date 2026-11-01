import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const en = fs.readFileSync(new URL("index.html", root), "utf8");
const ja = fs.readFileSync(new URL("ja/index.html", root), "utf8");
const app = fs.readFileSync(new URL("handoff.js", root), "utf8");
const css = fs.readFileSync(new URL("style.css", root), "utf8");
const stages = [
  "intake-repo", "spec-delta", "plan-change", "define-acceptance",
  "ship-check", "write-release-artifacts", "review-diff", "post-ship-retro"
];
for (const [lang,page,scriptPath] of [
  ["en",en,'src="./handoff.js"'], ["ja",ja,'src="../handoff.js"']
]) {
  assert.ok(page.includes(scriptPath), lang + ": correct relative script");
  assert.equal(page.split('id="handoffTemplate"').length-1,1);
  assert.equal(page.split('id="copyHandoff"').length-1,1);
  assert.equal(page.split('id="handoffStatus"').length-1,1);
  const content=page.slice(page.indexOf('<pre id="handoffTemplate"'),
    page.indexOf('</pre>',page.indexOf('<pre id="handoffTemplate"')));
  let previous=-1;
  for(const stage of stages){
    const i=content.indexOf("[ ] "+stage+" —");
    assert.ok(i>previous, lang+": exact source step order "+stage);
    previous=i;
  }
  assert.match(page,/human release decision|責任者が判断/,lang+": must keep human release authority");
}
assert.match(css,/\.handoff-template/);
assert.doesNotMatch(app,/fetch\(|XMLHttpRequest|sendBeacon/,
  "clipboard implementation must not upload anything");

let click;
let clipboardText="";
const status={textContent:""};
const text="8-stage handoff template";
const button={addEventListener(name,fn){assert.equal(name,"click");click=fn;}};
const sandbox = {
  document:{
    documentElement:{lang:"en"},
    getElementById(id){
      return ({copyHandoff:button,handoffTemplate:{textContent:text},handoffStatus:status})[id];
    }
  },
  window:{isSecureContext:true},
  navigator:{clipboard:{writeText:async value=>{clipboardText=value;}}},
};
vm.runInNewContext(app,sandbox);
assert.equal(typeof click,"function");
await click();
assert.equal(clipboardText,text);
assert.equal(status.textContent,"Checklist copied.");

console.log("PASS: Codex Playbooks 8-stage JA/EN checklist, local clipboard and human-review gate");
