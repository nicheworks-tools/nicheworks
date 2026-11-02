"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
global.window = {};
require("../catalog.js");
require("../i18n.js");
require("../options.js");
require("../options-i18n.js");
const core = require("../core.js");
const cat = global.window.BICHIKU_CATALOG;
const choices = global.window.BICHIKU_OPTIONS;

function find(plan,id) { return plan.items.find((row) => row.item.id === id); }

test("44 categories have four localized names and no user-generated Amazon queries", () => {
  assert.equal(cat.length,44);
  for(const item of cat) {
    for(const locale of ["ja","en","zh","vi"]) assert.ok(item.names[locale].length > 0, item.id+" "+locale);
    assert.ok(!item.search || !item.search.includes("{"), item.id);
  }
  for(const locale of ["ja","en","zh","vi"]) {
    const d=global.window.BICHIKU_I18N[locale];
    assert.ok(d && d.config && d.adjust && d.targetEdit, locale);
  }
});
test("two adults staying home seven days: 42L, 42 meals, 70 toilet uses", () => {
  const p=core.calculate(cat,{adults:2,days:7,mode:"home"},"2026-11-02");
  assert.equal(find(p,"water").required,42);
  assert.equal(find(p,"food").required,42);
  assert.equal(find(p,"toilet").required,70);
  assert.ok(p.coreMissingCount>0);
});
test("existing holdings are subtracted but cannot become negative", () => {
  const p=core.calculate(cat,{adults:2,days:7,stocks:{"home:water":{qty:50},"home:toilet":{qty:20}}},"2026-11-02");
  assert.equal(find(p,"water").missing,0);
  assert.equal(find(p,"toilet").missing,50);
});
test("expired holdings do not count toward preparedness", () => {
  const p=core.calculate(cat,{adults:1,days:3,stocks:{"home:water":{qty:9,expiry:"2026-11-01"}}},"2026-11-02");
  assert.equal(find(p,"water").expired,true);
  assert.equal(find(p,"water").missing,9);
});
test("custom targets can be zero or reset to default", () => {
  const p=core.calculate(cat,{adults:1,days:3,stocks:{"home:water":{qty:2,target:0},"home:radio":{target:2}}},"2026-11-02");
  assert.equal(find(p,"water").required,0);
  assert.equal(find(p,"water").missing,0);
  assert.equal(find(p,"radio").required,2);
  assert.equal(find(p,"radio").hasCustomTarget,true);
});
test("infant and pet supplies appear only where applicable", () => {
  const a=core.calculate(cat,{adults:1,days:7,infants:1,pets:2},"2026-11-02");
  assert.equal(find(a,"diapers").required,42);
  assert.equal(find(a,"petFood").required,14);
  const b=core.calculate(cat,{adults:1,days:7},"2026-11-02");
  assert.equal(find(b,"diapers"),undefined);
  assert.equal(find(b,"petFood"),undefined);
});
test("go-bag calculation does not require a full seven-day water stockpile", () => {
  const p=core.calculate(cat,{adults:2,mode:"go",days:14},"2026-11-02");
  assert.equal(find(p,"water").required,1);
  assert.equal(find(p,"food").required,6);
  assert.equal(find(p,"toilet").required,4);
});

test("specific alternatives have complete labels, valid parent roles and localized warnings",()=>{
  assert.equal(choices.length,81);
  assert.equal(new Set(choices.map(o=>o.id)).size,81);
  for(const o of choices){
    assert.ok(cat.some(i=>i.id===o.parent),"missing parent "+o.id);
    assert.ok(["full","conditional","supplement"].includes(o.equivalence),o.id);
    for(const lang of ["ja","en","zh","vi"]){
      assert.ok(o.names[lang],o.id+" "+lang);
      assert.ok(global.window.BICHIKU_OPTIONS_UI[lang].notes[o.warning],o.id+" warning "+lang);
    }
    assert.ok(!o.query || !o.query.includes("{"),o.id);
  }
});
test("staple and water alternatives aggregate by usable amounts with no double count",()=>{
  const p=core.calculate(cat,{adults:2,days:3,stocks:{"home:food":{qty:2}},variants:{
    "home:alphaRice":{qty:4},"home:cupNoodles":{qty:3},"home:tunaCan":{qty:100},
    "home:water2L":{qty:10},"home:longTermWater":{qty:5}
  }},"2026-11-02",choices);
  assert.equal(find(p,"food").required,18);
  assert.equal(find(p,"food").ownedManual,2);
  assert.equal(find(p,"food").variantOwned,7);
  assert.equal(find(p,"food").effective,9); // tuna is a side dish, not a staple
  assert.equal(find(p,"food").missing,9);
  assert.equal(find(p,"water").effective,15);
  assert.equal(find(p,"water").missing,3);
});
test("heat-only noodles are not usable when no cooking is available",()=>{
  const p=core.calculate(cat,{adults:1,days:3,noHeat:true,variants:{
    "home:cupNoodles":{qty:5},"home:bagNoodles":{qty:5},
    "home:alphaRice":{qty:3},"home:kanpan":{qty:1},
    "home:instantOats":{qty:10}
  }},"2026-11-02",choices);
  const food=find(p,"food");
  assert.equal(food.variantOwned,14);
  assert.equal(food.effective,4);
  assert.equal(food.excludedVariants,10);
  assert.equal(food.missing,5);
});
test("expired variants and other-mode variants do not cover shortages",()=>{
  const p=core.calculate(cat,{adults:1,days:3,variants:{
   "home:water2L":{qty:9,expiry:"2026-11-01"},
   "go:water2L":{qty:25},
   "home:water500":{qty:4,expiry:"2026-11-02"}
  }},"2026-11-02",choices);
  assert.equal(find(p,"water").owned,13);
  assert.equal(find(p,"water").effective,4);
  assert.equal(find(p,"water").missing,5);
});
test("floor insulating mats count, but foil sheet, cardboard and newspaper do not automatically replace a mat",()=>{
  const p=core.calculate(cat,{adults:2,days:7,variants:{
    "home:foamMat":{qty:1},"home:inflatableMat":{qty:1},
    "home:aluminumSheet":{qty:10},"home:cardboard":{qty:10},"home:newspaper":{qty:10}
  }},"2026-11-02",choices);
  assert.equal(find(p,"sleepPad").required,2);
  assert.equal(find(p,"sleepPad").missing,0);
  assert.equal(find(p,"blanket").missing,1);
  const q=core.calculate(cat,{adults:2,days:7,variants:{"home:aluminumSheet":{qty:10},"home:cardboard":{qty:10}}},"2026-11-02",choices);
  assert.equal(find(q,"sleepPad").missing,2);
  assert.equal(find(q,"blanket").missing,1);
});
