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

test("power outage is not cosmetic: hot food is excluded without verified independent heat",()=>{
 const stock={variants:{"home:packRice":{qty:3},"home:kanpan":{qty:2}}};
 const normal=assess(stock);
 assert.equal(row(normal,"food").effective,5);
 const blackout=assess({...stock,powerOut:true});
 assert.equal(row(blackout,"food").effective,2,"Only ready-to-eat food should count during unmitigated outage");
 assert.equal(blackout.heatReady,false);
 const prepared=assess({...stock,powerOut:true,offGridHeatConfirmed:true});
 assert.equal(row(prepared,"food").effective,5);
 assert.equal(prepared.heatReady,true);
});
test("declared no-heat scenario overrides any power-out alternative heating confirmation",()=>{
 const a=assess({powerOut:true,noHeat:true,offGridHeatConfirmed:true,
  variants:{"home:packRice":{qty:3},"home:kanpan":{qty:2}}});
 assert.equal(row(a,"food").effective,2);
 assert.equal(a.heatReady,false);
});
test("water-dependent noodles in blackout require BOTH safe measured water and off-grid heat",()=>{
 const stock={powerOut:true,waterOut:true,safeWaterConfirmed:true,stocks:{"home:water":{qty:5}},
  variants:{"home:cupNoodles":{qty:3,prepConfirmed:true,prepWaterLiters:1.5}}};
 const noHeat=assess(stock);
 assert.equal(row(noHeat,"food").effective,0);
 assert.equal(noHeat.waterAllocation,0,"Heating-inaccessible products must not reserve cooking water");
 const ready=assess({...stock,offGridHeatConfirmed:true});
 assert.equal(row(ready,"food").effective,3);
 assert.equal(ready.waterAllocation,1.5);
 assert.equal(ready.waterRemainingAfterPrep,3.5);
 const noSafeWater=assess({...stock,offGridHeatConfirmed:true,safeWaterConfirmed:false});
 assert.equal(row(noSafeWater,"food").effective,0);
});

test("food-group audit records named staple complements separately, without changing staple shortages",()=>{
 const a=assess({variants:{"home:tunaCan":{qty:4},"home:cannedVeg":{qty:6},"home:driedFruit":{qty:2}}});
 const byRole=Object.fromEntries(a.foodGroups.map(g=>[g.role,g]));
 assert.deepEqual(a.foodGroups.map(g=>g.role),["protein","vegetable","fruit"]);
 assert.equal(byRole.protein.usableKinds,1);
 assert.equal(byRole.vegetable.usableKinds,1);
 assert.equal(byRole.fruit.usableKinds,1);
 assert.equal(row(a,"food").effective,0,"side dishes and fruit must not become staple meals");
 assert.equal(row(a,"food").missing,9);
});
test("food audit excludes expired or unverified items and does not guess category of manual stock",()=>{
 const a=assess({stocks:{"home:food":{qty:9}},
  variants:{"home:tunaCan":{qty:6,expiry:"2026-11-01"},"home:tofu":{qty:5},"home:cannedVeg":{qty:1}}});
 const byRole=Object.fromEntries(a.foodGroups.map(g=>[g.role,g]));
 assert.equal(byRole.protein.recordedKinds,2);
 assert.equal(byRole.protein.usableKinds,0);
 assert.equal(byRole.protein.needsReview,true);
 assert.equal(byRole.vegetable.usableKinds,1);
 assert.equal(byRole.fruit.usableKinds,0);
 assert.equal(row(a,"food").effective,9,"manual food remains staple inventory, without unearned food-group claims");
});
test("confirmed water for dried vegetable side dish is allocated but never counted as a staple",()=>{
 const stock={safeWaterConfirmed:true,waterOut:true,stocks:{"home:water":{qty:3}},
   variants:{"home:driedVeg":{qty:2,prepWaterLiters:1.1,prepConfirmed:true}}};
 const a=assess(stock);
 const veg=a.foodGroups.find(g=>g.role==="vegetable");
 assert.equal(a.waterAllocation,1.1);
 assert.equal(a.waterRemainingAfterPrep,1.9);
 assert.equal(veg.usableKinds,1);
 assert.equal(row(a,"food").effective,0);
 const b=assess({...stock,noHeat:true});
 assert.equal(b.waterAllocation,0,"unusable heated vegetables must not reserve drinking water");
 assert.equal(b.foodGroups.find(g=>g.role==="vegetable").usableKinds,0);
});
test("named bottle capacities are explicit metadata, but core still stores litres for backward compatibility",()=>{
 const bottled=Object.fromEntries(opts.filter(o=>o.bottleLiters).map(o=>[o.id,o.bottleLiters]));
 assert.deepEqual(bottled,{water2L:2,water500:0.5});
 const a=assess({stocks:{"home:water":{qty:1}},
  variants:{"home:water2L":{qty:6},"home:water500":{qty:2}}});
 assert.equal(row(a,"water").effective,9,"3 two-litre and 4 half-litre bottles, plus 1L manual");
 assert.equal(a.waterStored,9);
});

test("main-dish portions track user-entered usable servings separately and never reduce staples",()=>{
 const a=assess({variants:{"home:tunaCan":{qty:5},"home:beansCan":{qty:3},
   "home:tofu":{qty:4},"home:mackerelCan":{qty:9,expiry:"2026-11-01"}}});
 const protein=a.foodGroups.find(g=>g.role==="protein");
 assert.equal(protein.usableKinds,2);
 assert.equal(protein.usablePortions,8);
 assert.equal(a.mainDishReferencePortions,9,"MAFF adult example extrapolated for 1 adult and 3 days");
 assert.equal(row(a,"food").effective,0,"main dishes never become staple portions");
 const family=assess({children:1,variants:{"home:tunaCan":{qty:5}}});
 assert.equal(family.mainDishReferencePortions,null,"age-specific needs are not estimated from an adult example");
 assert.equal(family.foodGroups.find(g=>g.role==="protein").usablePortions,5);
 assert.equal(assess({mode:"go"}).mainDishReferencePortions,null,"at-home reference must not be applied to a go-bag");
});
