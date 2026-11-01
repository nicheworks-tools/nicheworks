import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const js = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../style.css", import.meta.url), "utf8");
const elements = new Map();
const events = new Map();
let dynamicNodes = [];
let printCount = 0;
let onReady;

const newElement = id => ({
  id, value:"", textContent:"", innerHTML:"", dataset:{}, style:{},
  classList:{toggle(){},add(){},remove(){}},
  addEventListener(type, cb){events.set(id+"/"+type,cb);},
  querySelectorAll(){return []}, focus(){}, checked:false
});
const root = newElement("toolRoot");
Object.defineProperty(root, "innerHTML", {
  get(){return this._markup||"";},
  set(markup){
    this._markup=markup;
    dynamicNodes=[...markup.matchAll(/<[^>]*data-i18n="(ja|en)"[^>]*>([^<]*)/g)]
      .map(match => ({ dataset:{i18n:match[1]}, style:{display:"none"}, textContent:match[2].trim() }));
  }
});
elements.set("toolRoot",root);
const langBtns=[newElement("lang-ja"),newElement("lang-en")];
langBtns[0].dataset.lang="ja"; langBtns[1].dataset.lang="en";
const documentStub = {
  documentElement:{lang:"ja"},
  body:{appendChild(){},removeChild(){}},
  addEventListener(type,cb){if(type==="DOMContentLoaded")onReady=cb},
  getElementById(id){
    if(!elements.has(id))elements.set(id,newElement(id));
    return elements.get(id);
  },
  querySelectorAll(query){
    if(query==="[data-i18n]")return dynamicNodes;
    if(query===".nw-lang-switch button")return langBtns;
    return [];
  },
  createElement(){return newElement("ephemeral");}
};
const storage = new Map();
const sandbox = {
  document:documentStub,
  navigator:{language:"en-US",clipboard:{writeText:async()=>{}}},
  localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,String(v))}},
  window:{print(){printCount++}},
  console,setTimeout,clearTimeout,Blob,URL,
};
const context=vm.createContext(sandbox);
vm.runInContext(js,context);
assert.equal(typeof onReady,"function");
onReady();
assert.equal(documentStub.documentElement.lang,"en");
const enPresets = dynamicNodes.find(node => node.textContent==="Presets");
const jaPresets = dynamicNodes.find(node => node.textContent==="プリセット");
assert.ok(enPresets && jaPresets);
assert.equal(enPresets.style.display,"","first-load English dynamic controls must be visible");
assert.equal(jaPresets.style.display,"none","first-load Japanese dynamic controls must be hidden");

const print = events.get("printPlanBtn/click");
assert.equal(typeof print,"function","native print action must be bound");
elements.get("goal").value="Read for 10 minutes";
print();
assert.equal(printCount,1,"user print action opens the browser print dialog");
assert.match(elements.get("goal-en").textContent,/Read for 10 minutes/,
  "printing refreshes plan from latest input");

assert.ok(root.innerHTML.includes('id="printPlanBtn"'));
assert.ok(root.innerHTML.includes("Print / Save as PDF"));
assert.ok(root.innerHTML.includes('class="print-only"'));
assert.ok(css.includes("@media print") && css.includes("html[lang=\"en\"] #plan-en"));
assert.ok(css.includes(".nw-donate") && css.includes(".output-actions"),"donation/form controls excluded from printed sheet");
assert.match(html,/2分の最小行動/,"static search copy accurately describes plan");
assert.match(html,/<meta name="description" content="運動・学習・睡眠/);
console.log("PASS: Habit Plan initial English, refreshed print, and isolated layout");
