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
test("portable toilet shortages count only matched compatible pieces with all four confirmations",()=>{
 const base={variants:{"home:toiletKit":{qty:5},"home:toiletBags":{qty:8,bagQty:8,solidifierQty:6}}};
 const a=assess(base);
 assert.equal(row(a,"toilet").effective,0,"kits and loose parts require installation and hygiene review");
 assert.equal(a.toiletReview.legacyQty,8,"old combined stock remains available for review");
 assert.equal(a.toiletReview.pairedUses,6,"component bottleneck is the usable number of pairs");
 const settings={toiletAssemblyConfirmed:true,toiletSeatConfirmed:true,toiletStorageConfirmed:true,toiletDisposalConfirmed:true};
 const b=assess({...base,...settings});
 assert.equal(row(b,"toilet").effective,11,"five complete kits plus six verified separate pairs");
 assert.equal(row(b,"toilet").assembledUses,6);
 assert.equal(b.toiletReview.usableUses,6);
 assert.equal(b.combinations.find(x=>x.id==="toiletAssembly").condition,true);
 const c=assess({...base,...settings,toiletStorageConfirmed:false});
 assert.equal(row(c,"toilet").effective,0,"missing sealed-storage plan blocks both complete kit and loose pairs");
 const d=assess({...base,...settings,toiletAssemblyConfirmed:false});
 assert.equal(row(d,"toilet").effective,5,"complete kits do not require separate compatibility check");
 assert.equal(d.toiletReview.usableUses,0,"loose bags still require compatibility review");
});
test("unmatched, missing, expired, and legacy toilet components never silently cover shortages",()=>{
 const checks={toiletAssemblyConfirmed:true,toiletSeatConfirmed:true,toiletStorageConfirmed:true,toiletDisposalConfirmed:true};
 const alone=assess({...checks,variants:{"home:toiletBags":{bagQty:10}}});
 assert.equal(alone.toiletReview.pairedUses,0);
 assert.equal(row(alone,"toilet").effective,0);
 const expired=assess({...checks,variants:{"home:toiletBags":{bagQty:10,solidifierQty:10,expiry:"2026-10-31"}}});
 assert.equal(expired.toiletReview.expired,true);
 assert.equal(row(expired,"toilet").effective,0);
 const legacy=assess({...checks,variants:{"home:toiletBags":{qty:12}}});
 assert.equal(legacy.toiletReview.legacyQty,12);
 assert.equal(legacy.toiletReview.pairedUses,0);
 assert.equal(row(legacy,"toilet").effective,0,"legacy combined quantities require fresh item-by-item review");
 const partial=assess({...checks,variants:{"home:toiletBags":{bagQty:3.8,solidifierQty:2.4}}});
 assert.equal(partial.toiletReview.pairedUses,2,"fractional raw values cannot increase the count of uses");
 assert.equal(row(partial,"toilet").effective,2);
});
test("toilet component stock is separate for home and evacuation go-bag",()=>{
 const checks={toiletAssemblyConfirmed:true,toiletSeatConfirmed:true,toiletStorageConfirmed:true,toiletDisposalConfirmed:true};
 const a=assess({...checks,mode:"go",variants:{"home:toiletBags":{bagQty:99,solidifierQty:99}}});
 assert.equal(row(a,"toilet").effective,0);
 const b=assess({...checks,mode:"go",variants:{"go:toiletBags":{bagQty:2,solidifierQty:3}}});
 assert.equal(row(b,"toilet").effective,2);
 assert.equal(row(b,"toilet").missing,0);
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

test("blackout heat requires actual stove, fuel, capacity and food-by-food plans",()=>{
 const food={"home:packRice":{qty:3,heatSessions:2,heatConfirmed:true},
   "home:kanpan":{qty:2}};
 const stock={variants:food};
 assert.equal(row(assess(stock),"food").effective,5,"ordinary power allows regular cooking");
 const blackout=assess({...stock,powerOut:true,offGridHeatConfirmed:true});
 assert.equal(row(blackout,"food").effective,2,"legacy single checkbox cannot assert fuel sufficiency");
 assert.equal(blackout.heatReady,false);
 const equipment={"home:stove":{qty:1,heatEquipmentConfirmed:true},
   "home:gas":{qty:2,heatCapacityUses:2,heatFuelCompatibleConfirmed:true}};
 const prepared=assess({...stock,powerOut:true,stocks:equipment});
 assert.equal(prepared.heatReady,true);
 assert.equal(prepared.heatReview.requiredUses,2);
 assert.equal(prepared.heatReview.capacityUses,2);
 assert.equal(row(prepared,"food").effective,5);
 const withoutStove=assess({...stock,powerOut:true,stocks:{...equipment,"home:stove":{qty:0,heatEquipmentConfirmed:true}}});
 assert.equal(row(withoutStove,"food").effective,2);
 const withoutFuel=assess({...stock,powerOut:true,stocks:{...equipment,"home:gas":{qty:0,heatCapacityUses:2,heatFuelCompatibleConfirmed:true}}});
 assert.equal(row(withoutFuel,"food").effective,2);
 const withoutSafety=assess({...stock,powerOut:true,stocks:{...equipment,"home:stove":{qty:1}}});
 assert.equal(row(withoutSafety,"food").effective,2);
 const withoutCompatibility=assess({...stock,powerOut:true,stocks:{...equipment,"home:gas":{qty:2,heatCapacityUses:2}}});
 assert.equal(row(withoutCompatibility,"food").effective,2);
});
test("fuel session budget is shared across EVERY heated food, not reused per product",()=>{
 const data={powerOut:true,waterOut:true,safeWaterConfirmed:true,
   stocks:{"home:water":{qty:4},"home:stove":{qty:1,heatEquipmentConfirmed:true},
     "home:gas":{qty:1,heatCapacityUses:2,heatFuelCompatibleConfirmed:true}},
   variants:{"home:packRice":{qty:3,heatSessions:2,heatConfirmed:true},
     "home:cupNoodles":{qty:4,heatSessions:1,heatConfirmed:true,prepConfirmed:true,prepWaterLiters:1}}};
 const blocked=assess(data);
 assert.equal(blocked.heatReview.requiredUses,3);
 assert.equal(blocked.heatReview.capacityUses,2);
 assert.equal(row(blocked,"food").effective,0,"shared fuel budget cannot be counted twice");
 assert.equal(blocked.waterAllocation,0,"blocked cooking does not allocate imaginary hot water");
 const enough=assess({...data,stocks:{...data.stocks,"home:gas":{qty:1,heatCapacityUses:3,heatFuelCompatibleConfirmed:true}}});
 assert.equal(enough.heatReady,true);
 assert.equal(row(enough,"food").effective,7);
 assert.equal(enough.waterAllocation,1);
 assert.equal(enough.waterRemainingAfterPrep,3);
 const withoutPlan=assess({...data,stocks:{...data.stocks,"home:gas":{qty:1,heatCapacityUses:10,heatFuelCompatibleConfirmed:true}},
   variants:{...data.variants,"home:cupNoodles":{qty:4,prepConfirmed:true,prepWaterLiters:1}}});
 assert.deepEqual(withoutPlan.heatReview.uncheckedFoods,["cupNoodles"]);
 assert.equal(row(withoutPlan,"food").effective,0,"unknown sessions for one food block blanket approval");
});
test("heating requires whole session counts and valid, mode-specific fuel stock",()=>{
 const base={powerOut:true,variants:{"home:packRice":{qty:3,heatSessions:1,heatConfirmed:true}},
   stocks:{"home:stove":{qty:1,heatEquipmentConfirmed:true},"home:gas":{qty:1,heatCapacityUses:1,heatFuelCompatibleConfirmed:true}}};
 assert.equal(row(assess(base),"food").effective,3);
 const expiredFuel=assess({...base,stocks:{...base.stocks,
   "home:gas":{qty:1,heatCapacityUses:1,heatFuelCompatibleConfirmed:true,expiry:"2026-10-31"}}});
 assert.equal(expiredFuel.heatReady,false);
 assert.equal(row(expiredFuel,"food").effective,0);
 const expiredStove=assess({...base,stocks:{...base.stocks,
   "home:stove":{qty:1,heatEquipmentConfirmed:true,expiry:"2026-10-31"}}});
 assert.equal(expiredStove.heatReady,false);
 const fractional=assess({...base,variants:{"home:packRice":{qty:3,heatSessions:1.5,heatConfirmed:true}}});
 assert.equal(fractional.heatReady,false);
 assert.deepEqual(fractional.heatReview.uncheckedFoods,["packRice"]);
 const carry=assess({...base,mode:"go",variants:{"go:packRice":{qty:3,heatSessions:1,heatConfirmed:true}}});
 assert.equal(carry.heatReady,false,"home stove/gas cannot be reused as packed go-bag items");
 const goReady=assess({...base,mode:"go",variants:{"go:packRice":{qty:3,heatSessions:1,heatConfirmed:true}},
   stocks:{"go:stove":{qty:1,heatEquipmentConfirmed:true},"go:gas":{qty:1,heatCapacityUses:1,heatFuelCompatibleConfirmed:true}}});
 assert.equal(goReady.heatReady,true);
 assert.equal(row(goReady,"food").effective,3);
});
test("declared no-heat scenario overrides even fully measured fuel and cooking plan",()=>{
 const a=assess({powerOut:true,noHeat:true,offGridHeatConfirmed:true,
  stocks:{"home:stove":{qty:1,heatEquipmentConfirmed:true},
    "home:gas":{qty:5,heatCapacityUses:25,heatFuelCompatibleConfirmed:true}},
  variants:{"home:packRice":{qty:3,heatSessions:1,heatConfirmed:true},"home:kanpan":{qty:2}}});
 assert.equal(row(a,"food").effective,2);
 assert.equal(a.heatReady,false);
 assert.equal(a.heatReview.ready,false);
});
test("water-dependent noodles in blackout require BOTH safe measured water and measured cooking fuel",()=>{
 const stock={powerOut:true,waterOut:true,safeWaterConfirmed:true,
   stocks:{"home:water":{qty:5},"home:stove":{qty:1,heatEquipmentConfirmed:true},
     "home:gas":{qty:2,heatCapacityUses:2,heatFuelCompatibleConfirmed:true}},
   variants:{"home:cupNoodles":{qty:3,heatSessions:1,heatConfirmed:true,prepConfirmed:true,prepWaterLiters:1.5}}};
 const ready=assess(stock);
 assert.equal(row(ready,"food").effective,3);
 assert.equal(ready.waterAllocation,1.5);
 assert.equal(ready.waterRemainingAfterPrep,3.5);
 const noSafeWater=assess({...stock,safeWaterConfirmed:false});
 assert.equal(row(noSafeWater,"food").effective,0);
 const noFuel=assess({...stock,stocks:{...stock.stocks,"home:gas":{qty:0,heatCapacityUses:2,heatFuelCompatibleConfirmed:true}}});
 assert.equal(row(noFuel,"food").effective,0);
 assert.equal(noFuel.waterAllocation,0);
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
