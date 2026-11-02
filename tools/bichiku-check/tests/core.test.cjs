"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
global.window = {};
require("../catalog.js");
require("../i18n.js");
const core = require("../core.js");
const cat = global.window.BICHIKU_CATALOG;

function find(plan,id) { return plan.items.find((row) => row.item.id === id); }

test("43 categories have four localized names and no user-generated Amazon queries", () => {
  assert.equal(cat.length,43);
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
  assert.equal(find(p,"food"),undefined);
  assert.equal(find(p,"toilet").required,4);
});
