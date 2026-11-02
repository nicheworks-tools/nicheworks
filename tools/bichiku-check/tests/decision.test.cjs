"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
global.window={};
require("../catalog.js");
require("../options.js");
const core=require("../core.js"),decision=require("../decision.js");
const cat=window.BICHIKU_CATALOG,opts=window.BICHIKU_OPTIONS;
function assess(settings){return decision.assessment(cat,opts,Object.assign({adults:1,days:3,mode:"home"},settings),"2026-11-02")}
const row=(a,id)=>a.calc.items.find(x=>x.item.id===id);
test("decision engine partitions active needs into purposeful result cards",()=>{
 const a=assess({adults:2,days:7});
 assert.equal(a.groups.length,7);
 assert.equal(row(a,"food").required,42);
 assert.equal(row(a,"water").required,42);
 assert.equal(row(a,"toilet").required,70);
 assert.equal(row(a,"sleepPad").required,2);
});
test("water-prepared alpha rice is never silently credited without a confirmed safe-water budget",()=>{
 const a=assess({noHeat:true,waterOut:true,variants:{"home:alphaRice":{qty:4}}});
 assert.equal(row(a,"food").effective,0);
 assert.equal(row(a,"food").excludedVariants,4);
 assert.equal(a.waterForPrep,false);
});
test("safe water + quantified allocation permits only explicitly usable food, from the SAME water pool",()=>{
 const a=assess({noHeat:true,waterOut:true,safeWaterConfirmed:true,prepWaterLiters:1,
  stocks:{"home:water":{qty:4}},variants:{"home:alphaRice":{qty:4,prepConfirmed:true,prepWaterLiters:1},"home:cupNoodles":{qty:8}}});
 assert.equal(row(a,"food").effective,4);
 assert.equal(row(a,"food").missing,5);
 assert.equal(row(a,"water").effective,4); // No phantom extra water or double subtraction
 assert.equal(a.waterRemainingAfterPrep,3);
 assert.equal(a.waterAllocation,1);
});
test("insufficient stored water during water outage invalidates water-prepared food",()=>{
 const a=assess({noHeat:true,waterOut:true,safeWaterConfirmed:true,prepWaterLiters:6,
  stocks:{"home:water":{qty:4}},variants:{"home:alphaRice":{qty:4,prepConfirmed:true,prepWaterLiters:6}}});
 assert.equal(a.waterConflict,true);
 assert.equal(a.waterForPrep,false);
 assert.equal(row(a,"food").effective,0);
 assert.equal(a.waterRemainingAfterPrep,0);
});
test("normal no-heat rice alternative can count but cup noodles cannot automatically",()=>{
 const a=assess({noHeat:true,variants:{"home:kanpan":{qty:5},"home:cupNoodles":{qty:10},"home:tunaCan":{qty:8}}});
 assert.equal(row(a,"food").effective,5);
 assert.equal(row(a,"food").missing,4);
});
test("portable toilet bag + solidifier pair requires explicit compatibility, disposal and installation confirmation",()=>{
 const base={variants:{"home:toiletKit":{qty:5},"home:toiletBags":{qty:8}}};
 const a=assess(base);
 assert.equal(row(a,"toilet").effective,5);
 const b=assess(Object.assign({},base,{toiletAssemblyConfirmed:true}));
 assert.equal(row(b,"toilet").effective,13);
 assert.equal(row(b,"toilet").assembledUses,8);
 const c=assess({toiletAssemblyConfirmed:true,variants:{"home:toiletBags":{qty:8,expiry:"2026-10-31"}}});
 assert.equal(row(c,"toilet").effective,0);
});
test("temporary cardboard and foil never silently satisfy floor insulation or body warmth",()=>{
 const a=assess({adults:2,variants:{"home:cardboard":{qty:5},"home:aluminumSheet":{qty:5}}});
 assert.equal(row(a,"sleepPad").missing,2);
 assert.equal(row(a,"blanket").missing,1);
 const b=assess({adults:2,variants:{"home:foamMat":{qty:2},"home:woolBlanket":{qty:1}}});
 assert.equal(row(b,"sleepPad").missing,0);
 assert.equal(row(b,"blanket").missing,0);
 assert.equal(b.combinations.find(x=>x.id==="floorWarmth").condition,true);
});
test("go-bag quantities are separate from home inventory",()=>{
 const a=assess({mode:"go",adults:1,stocks:{"home:water":{qty:999}}});
 assert.equal(row(a,"water").effective,0);
 assert.equal(row(a,"water").required,0.5);
});

test("water-dependent cooked noodles are NOT credited during an outage without safe prep water",()=>{
 const a=assess({waterOut:true,noHeat:false,variants:{"home:cupNoodles":{qty:9},"home:packRice":{qty:2}}});
 assert.equal(row(a,"food").effective,2); // The heating-only pack rice is not modeled as water-dependent
 assert.equal(row(a,"food").missing,7);
 const b=assess({waterOut:true,noHeat:false,safeWaterConfirmed:true,prepWaterLiters:1,
  stocks:{"home:water":{qty:3}},variants:{"home:cupNoodles":{qty:9,prepConfirmed:true,prepWaterLiters:1}}});
 assert.equal(row(b,"food").effective,9);
 assert.equal(b.waterRemainingAfterPrep,2);
});

test("legacy global water volume is insufficient: each water-dependent item needs its own confirmation",()=>{
 const a=assess({waterOut:true,noHeat:true,safeWaterConfirmed:true,prepWaterLiters:500,
  stocks:{"home:water":{qty:20}},variants:{"home:alphaRice":{qty:8},"home:emergencyPorridge":{qty:3}}});
 assert.equal(row(a,"food").effective,0);
 assert.equal(a.waterAllocation,0);
 assert.ok(a.uncheckedFoods.includes("alphaRice"));
 assert.ok(a.uncheckedFoods.includes("emergencyPorridge"));
});
test("one confirmed food does not grant water-preparation permission to unconfirmed foods",()=>{
 const a=assess({noHeat:true,waterOut:true,safeWaterConfirmed:true,stocks:{"home:water":{qty:6}},
  variants:{"home:alphaRice":{qty:3,prepWaterLiters:0.9,prepConfirmed:true},
            "home:emergencyPorridge":{qty:6}}});
 assert.equal(a.waterAllocation,0.9);
 assert.equal(row(a,"food").effective,3);
 assert.equal(row(a,"food").missing,6);
});
test("all water-dependent foods are conservatively blocked when summed allocations exceed bottled water",()=>{
 const a=assess({noHeat:true,waterOut:true,safeWaterConfirmed:true,stocks:{"home:water":{qty:2}},
  variants:{"home:alphaRice":{qty:3,prepWaterLiters:1.2,prepConfirmed:true},
            "home:emergencyPorridge":{qty:3,prepWaterLiters:1.2,prepConfirmed:true}}});
 assert.equal(a.waterAllocation,2.4);
 assert.equal(a.waterConflict,true);
 assert.equal(row(a,"food").effective,0);
});
test("expired confirmed water-dependent food cannot consume water or cover a shortage",()=>{
 const a=assess({noHeat:true,waterOut:true,safeWaterConfirmed:true,stocks:{"home:water":{qty:6}},
  variants:{"home:alphaRice":{qty:3,prepWaterLiters:1.2,prepConfirmed:true,expiry:"2026-10-01"}}});
 assert.equal(a.waterAllocation,0);
 assert.equal(row(a,"food").effective,0);
});
