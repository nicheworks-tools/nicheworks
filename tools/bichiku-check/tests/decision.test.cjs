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
test("battery-powered lights count only explicitly working units, not all owned units",()=>{
 const legacy=assess({stocks:{"home:batteries":{qty:100}},
   variants:{"home:headlamp":{qty:3},"home:ledLantern":{qty:2},"home:flashlight":{qty:4}}});
 assert.equal(row(legacy,"light").owned,9);
 assert.equal(row(legacy,"light").effective,0,"neither nine lights nor 100 battery sets proves a working lamp");
 assert.equal(row(legacy,"light").excludedVariants,9);
 assert.equal(row(legacy,"light").required,2);
 const checked=assess({stocks:{"home:batteries":{qty:100}},
   variants:{"home:headlamp":{qty:3,powerReadyQty:2,powerReadyConfirmed:true},
     "home:ledLantern":{qty:2,powerReadyQty:0,powerReadyConfirmed:true},
     "home:flashlight":{qty:4,powerReadyQty:1,powerReadyConfirmed:false}}});
 assert.equal(row(checked,"light").effective,2,"only two verified headlamps are credited");
 assert.equal(row(checked,"light").excludedVariants,7);
 const all=assess({variants:{"home:headlamp":{qty:3,powerReadyQty:2,powerReadyConfirmed:true},
   "home:flashlight":{qty:4,powerReadyQty:1,powerReadyConfirmed:true}}});
 assert.equal(row(all,"light").effective,3);
 assert.equal(row(all,"light").owned,7);
});
test("manual flashlight, lantern and radio stock require verified operating quantities",()=>{
 const stock={stocks:{"home:light":{qty:4,powerReadyQty:1,powerReadyConfirmed:true},
   "home:lantern":{qty:2,powerReadyQty:2,powerReadyConfirmed:true},
   "home:radio":{qty:3,powerReadyQty:1,powerReadyConfirmed:false}}};
 const a=assess(stock);
 assert.equal(row(a,"light").effective,1);
 assert.equal(row(a,"light").missing,1);
 assert.equal(row(a,"lantern").effective,2);
 assert.equal(row(a,"radio").effective,0);
 const b=assess({stocks:{...stock.stocks,
  "home:radio":{qty:3,powerReadyQty:1,powerReadyConfirmed:true},
  "home:lantern":{qty:2,powerReadyQty:3,powerReadyConfirmed:true}}});
 assert.equal(row(b,"radio").effective,1);
 assert.equal(row(b,"lantern").effective,2,"clamp operational count to the number owned");
 const expired=assess({stocks:{"home:radio":{qty:2,powerReadyQty:2,powerReadyConfirmed:true,expiry:"2026-10-31"}}});
 assert.equal(row(expired,"radio").effective,0);
});
test("power bank usability requires checked charge and compatible output/cable, not just mAh or quantity",()=>{
 const old=assess({variants:{"home:batteryBank":{qty:5}},stocks:{"home:cable":{qty:10}}});
 assert.equal(row(old,"powerbank").owned,5);
 assert.equal(row(old,"powerbank").effective,0,"loose USB cables cannot establish a charged, compatible bank");
 const ready=assess({stocks:{"home:powerbank":{qty:2,powerReadyQty:1,powerReadyConfirmed:true,manualCountBasis:"additional"}},
  variants:{"home:batteryBank":{qty:5,powerReadyQty:3,powerReadyConfirmed:true}}});
 assert.equal(row(ready,"powerbank").effective,4);
 assert.equal(row(ready,"powerbank").owned,7);
 const damaged=assess({variants:{"home:batteryBank":{qty:5,powerReadyQty:3,powerReadyConfirmed:true,expiry:"2026-10-31"}}});
 assert.equal(row(damaged,"powerbank").effective,0);
 const fractional=assess({variants:{"home:batteryBank":{qty:2,powerReadyQty:1.5,powerReadyConfirmed:true}}});
 assert.equal(row(fractional,"powerbank").effective,0,"fractional or malformed count is not silently rounded upward");
 const separated=assess({mode:"go",variants:{"home:batteryBank":{qty:5,powerReadyQty:5,powerReadyConfirmed:true}}});
 assert.equal(row(separated,"powerbank").effective,0,"home bank is not in the go-bag");
 const packed=assess({mode:"go",variants:{"go:batteryBank":{qty:1,powerReadyQty:1,powerReadyConfirmed:true}}});
 assert.equal(row(packed,"powerbank").effective,1);
});
test("shared typed spare cells are allocated once across lights and radios",()=>{
 const stocks={"home:batteries":{qty:99,batteryCells:{AA:6,AAA:6}},
  "home:radio":{qty:1,powerReadyQty:1,powerReadyConfirmed:true,
    batteryType:"AAA",cellsPerChange:3,plannedChanges:2,batteryPlanConfirmed:true,batteryPlanDays:3}};
 const variants={"home:headlamp":{qty:2,powerReadyQty:2,powerReadyConfirmed:true,
    batteryType:"AA",cellsPerChange:2,plannedChanges:1,batteryPlanConfirmed:true,batteryPlanDays:3},
  "home:flashlight":{qty:1,powerReadyQty:1,powerReadyConfirmed:true,
    batteryType:"AA",cellsPerChange:2,plannedChanges:1,batteryPlanConfirmed:true,batteryPlanDays:3}};
 const a=assess({powerOut:true,stocks,variants});
 const rows=Object.fromEntries(a.batteryReview.rows.map(r=>[r.type,r]));
 assert.equal(rows.AA.required,6);
 assert.equal(rows.AA.available,6);
 assert.equal(rows.AAA.required,6);
 assert.equal(row(a,"light").effective,3);
 assert.equal(row(a,"radio").effective,1);
 assert.equal(row(a,"light").currentEffective,3);
 assert.equal(a.batteryReview.workingUnits,4);
 assert.equal(a.batteryReview.sustainedUnits,4);
 const short=assess({powerOut:true,stocks:{...stocks,"home:batteries":{qty:99,batteryCells:{AA:4,AAA:6}}},variants});
 assert.equal(short.batteryReview.rows.find(x=>x.type==="AA").shortage,2);
 assert.equal(row(short,"light").currentEffective,3);
 assert.equal(row(short,"light").effective,0,"short shared AA budget blocks false period coverage for both devices");
 assert.equal(row(short,"radio").effective,1,"sufficient AAA units remain covered");
 assert.equal(short.batteryReview.sustainedUnits,1);
 assert.equal(short.batteryReview.spareLegacySets,99,"legacy sets preserved but not converted to cells");
 const normal=assess({powerOut:false,stocks:{...stocks,"home:batteries":{qty:99,batteryCells:{AA:4,AAA:6}}},variants});
 assert.equal(row(normal,"light").effective,3,"current working units are distinct from blackout-period coverage");
 assert.equal(row(normal,"light").sustainedEffective,0);
});
test("expired, wrong-size, unknown and fractional spares never cover a battery plan",()=>{
 const headlamp={"home:headlamp":{qty:2,powerReadyQty:2,powerReadyConfirmed:true,
   batteryType:"AA",cellsPerChange:3,plannedChanges:1,batteryPlanConfirmed:true,batteryPlanDays:3}};
 const a=assess({powerOut:true,variants:headlamp,stocks:{"home:batteries":{qty:20,batteryCells:{AAA:20}}}});
 assert.equal(row(a,"light").effective,0,"AAA and legacy packs cannot stand in for six AA");
 const expired=assess({powerOut:true,variants:headlamp,stocks:{"home:batteries":{batteryCells:{AA:12},expiry:"2026-10-31"}}});
 assert.equal(expired.batteryReview.rows.find(r=>r.type==="AA").available,0);
 assert.equal(row(expired,"light").effective,0);
 const invalid=assess({powerOut:true,variants:headlamp,stocks:{"home:batteries":{batteryCells:{AA:5.5}}}});
 assert.equal(invalid.batteryReview.rows.find(r=>r.type==="AA").available,0,"fractional count must not be rounded up");
 const unclassified=assess({powerOut:true,variants:{"home:headlamp":{...headlamp["home:headlamp"],batteryType:"other"}},stocks:{"home:batteries":{batteryCells:{AA:99}}}});
 assert.equal(row(unclassified,"light").effective,0);
 assert.equal(unclassified.batteryReview.uncheckedDevices,1);
 const fractionalCycles=assess({powerOut:true,variants:{"home:headlamp":{...headlamp["home:headlamp"],plannedChanges:0.5}},stocks:{"home:batteries":{batteryCells:{AA:99}}}});
 assert.equal(row(fractionalCycles,"light").effective,0);
});
test("zero replacement cycles and rechargeable endurance must be explicitly reviewed for selected days",()=>{
 const checked={"home:headlamp":{qty:1,powerReadyQty:1,powerReadyConfirmed:true,
   batteryType:"AA",cellsPerChange:2,plannedChanges:0,batteryPlanConfirmed:true,batteryPlanDays:3}};
 const zero=assess({powerOut:true,variants:checked});
 assert.equal(row(zero,"light").effective,1,"checked zero changes consume zero spares, not implicit runtime prediction");
 assert.equal(zero.batteryReview.rows.find(r=>r.type==="AA").required,0);
 const stale=assess({powerOut:true,days:7,variants:checked});
 assert.equal(row(stale,"light").effective,0,"a 3-day approval cannot certify 7 days");
 assert.equal(stale.batteryReview.uncheckedDevices,1);
 const rechargeable=assess({powerOut:true,variants:{"home:headlamp":{qty:1,powerReadyQty:1,powerReadyConfirmed:true,
   batteryType:"rechargeable",batteryPlanConfirmed:true,batteryPlanDays:3}}});
 assert.equal(row(rechargeable,"light").effective,1,"confirmed built-in charge/endurance needs no disposable cells");
 const notConfirmed=assess({powerOut:true,variants:{"home:headlamp":{qty:1,powerReadyQty:1,powerReadyConfirmed:true,batteryType:"rechargeable"}}});
 assert.equal(row(notConfirmed,"light").effective,0);
});
test("battery inventory and device replacement plans are isolated by home and go-bag",()=>{
 const stocks={"home:batteries":{batteryCells:{AA:100}},
  "go:batteries":{batteryCells:{AA:4}}};
 const variants={"go:headlamp":{qty:1,powerReadyQty:1,powerReadyConfirmed:true,
  batteryType:"AA",cellsPerChange:2,plannedChanges:2,batteryPlanConfirmed:true,batteryPlanDays:1}};
 const a=assess({powerOut:true,mode:"go",stocks,variants});
 assert.equal(a.batteryReview.planDays,1);
 assert.equal(a.batteryReview.rows.find(r=>r.type==="AA").available,4);
 assert.equal(row(a,"light").effective,1);
 const missing=assess({powerOut:true,mode:"go",stocks:{"home:batteries":{batteryCells:{AA:100}}},variants});
 assert.equal(row(missing,"light").effective,0);
 const wrongDays=assess({powerOut:true,mode:"go",stocks,variants:{"go:headlamp":{...variants["go:headlamp"],batteryPlanDays:7}}});
 assert.equal(row(wrongDays,"light").effective,0,"home-day approvals cannot certify an evacuation bag");
});

test("manual category totals and named food stock never add twice without explicit reconciliation",()=>{
 const named={"home:cannedBread":{qty:4}};
 const stocks={"home:food":{qty:9}};
 const legacy=assess({stocks,variants:named});
 assert.equal(row(legacy,"food").owned,9);
 assert.equal(row(legacy,"food").effective,4,"unclear manual total is held back");
 assert.equal(row(legacy,"food").requiresManualReview,true);
 assert.equal(row(legacy,"food").manualEffective,0);
 const inclusive=assess({stocks:{"home:food":{qty:9,manualCountBasis:"includes_options"}},variants:named});
 assert.equal(row(inclusive,"food").effective,9,"four itemized plus five other portions");
 assert.equal(row(inclusive,"food").requiresManualReview,false);
 const distinct=assess({stocks:{"home:food":{qty:9,manualCountBasis:"additional"}},variants:named});
 assert.equal(row(distinct,"food").effective,13,"explicitly independent registered stock may be added");
 assert.equal(row(distinct,"food").owned,13);
 const expired=assess({stocks:{"home:food":{qty:9,manualCountBasis:"includes_options"}},
   variants:{"home:cannedBread":{qty:4,expiry:"2026-10-31"}}});
 assert.equal(row(expired,"food").effective,5,"expired itemized stock is subtracted from the manual total, not laundered");
 const old=assess({stocks:{"home:food":{qty:9}}});
 assert.equal(row(old,"food").effective,9,"standalone manual totals remain usable");
 const perMode=assess({mode:"go",stocks:{"home:food":{qty:9}},variants:{"go:cannedBread":{qty:2}}});
 assert.equal(row(perMode,"food").effective,2,"home stock is independent from go-bag");
});
test("water-for-preparation matches deduplicated water stock rather than phantom total",()=>{
 const base={waterOut:true,safeWaterConfirmed:true,
  stocks:{"home:water":{qty:10}},
  variants:{"home:water2L":{qty:8},"home:alphaRice":{qty:4,prepConfirmed:true,prepWaterLiters:9}}};
 const legacy=assess(base);
 assert.equal(legacy.waterStored,8,"unknown overlap counts only itemized water");
 assert.equal(row(legacy,"water").effective,8);
 assert.equal(legacy.waterConflict,true);
 assert.equal(row(legacy,"food").effective,0);
 const includes=assess({...base,stocks:{"home:water":{qty:10,manualCountBasis:"includes_options",
   drinkingReserveLiters:1,drinkingReserveConfirmed:true,drinkingReservePlanDays:3}}});
 assert.equal(includes.waterStored,10);
 assert.equal(row(includes,"water").effective,10);
 assert.equal(includes.waterConflict,false);
 assert.equal(row(includes,"food").effective,4);
 const additional=assess({...base,stocks:{"home:water":{qty:10,manualCountBasis:"additional"}}});
 assert.equal(additional.waterStored,18);
 assert.equal(row(additional,"water").effective,18);
 const expired=assess({...base,stocks:{"home:water":{qty:10,manualCountBasis:"includes_options"}},
  variants:{...base.variants,"home:water2L":{qty:8,expiry:"2026-10-31"}}});
 assert.equal(expired.waterStored,2,"expired itemized 8 L are not recycled into the general balance");
 assert.equal(row(expired,"water").effective,2);
 assert.equal(row(expired,"food").effective,0);
});
test("assembled toilet pairs and complete kits cannot duplicate manual category use counts",()=>{
 const checks={toiletSeatConfirmed:true,toiletStorageConfirmed:true,toiletDisposalConfirmed:true,
  toiletAssemblyConfirmed:true};
 const variants={"home:toiletKit":{qty:5},"home:toiletBags":{bagQty:8,solidifierQty:6}};
 const legacy=assess({...checks,stocks:{"home:toilet":{qty:10}},variants});
 assert.equal(legacy.toiletReview.usableUses,6);
 assert.equal(row(legacy,"toilet").variantEffective,5,"named usable kit capacity must remain available to later assembly reconciliation");
 assert.equal(row(legacy,"toilet").manualEffective,0,"overlapping manual uses stay uncredited until review");
 assert.equal(row(legacy,"toilet").effective,11,"count named kits and pairs, but not an ambiguous manual ten");
 assert.equal(row(legacy,"toilet").listedOwned,11);
 assert.equal(row(legacy,"toilet").requiresManualReview,true);
 const includes=assess({...checks,stocks:{"home:toilet":{qty:15,manualCountBasis:"includes_options"}},variants});
 assert.equal(row(includes,"toilet").effective,15,"five kits plus six pairs plus four other uses");
 const additional=assess({...checks,stocks:{"home:toilet":{qty:10,manualCountBasis:"additional"}},variants});
 assert.equal(row(additional,"toilet").effective,21);
 const onlyPairs=assess({...checks,stocks:{"home:toilet":{qty:10}},variants:{"home:toiletBags":{bagQty:8,solidifierQty:6}}});
 assert.equal(row(onlyPairs,"toilet").effective,6,"unreconciled manual uses do not double assembled loose components");
 const noCheck=assess({...checks,toiletAssemblyConfirmed:false,
  stocks:{"home:toilet":{qty:10,manualCountBasis:"includes_options"}},variants});
 assert.equal(row(noCheck,"toilet").effective,5,"manual ten includes five kits and six unverified loose pairs; only five complete kits qualify");
});
test("charged banks and blackout lights honor manual/itemized overlap in every calculation path",()=>{
 const manual={"home:powerbank":{qty:2,powerReadyQty:2,powerReadyConfirmed:true}};
 const named={"home:batteryBank":{qty:2,powerReadyQty:2,powerReadyConfirmed:true}};
 assert.equal(row(assess({stocks:manual,variants:named}),"powerbank").effective,2);
 assert.equal(row(assess({stocks:{"home:powerbank":{...manual["home:powerbank"],manualCountBasis:"includes_options"}},variants:named}),"powerbank").effective,2);
 assert.equal(row(assess({stocks:{"home:powerbank":{...manual["home:powerbank"],manualCountBasis:"additional"}},variants:named}),"powerbank").effective,4);
 const m={"home:light":{qty:2,powerReadyQty:2,powerReadyConfirmed:true,
  batteryType:"rechargeable",batteryPlanConfirmed:true,batteryPlanDays:3}};
 const opts={"home:headlamp":{qty:2,powerReadyQty:2,powerReadyConfirmed:true,
  batteryType:"rechargeable",batteryPlanConfirmed:true,batteryPlanDays:3}};
 const blackout=assess({powerOut:true,stocks:m,variants:opts});
 assert.equal(row(blackout,"light").currentEffective,2);
 assert.equal(row(blackout,"light").sustainedEffective,2);
 assert.equal(row(blackout,"light").requiresManualReview,true);
 const distinct=assess({powerOut:true,stocks:{"home:light":{...m["home:light"],manualCountBasis:"additional"}},variants:opts});
 assert.equal(row(distinct,"light").sustainedEffective,4);
 assert.equal(row(distinct,"light").effective,4);
});
test("outage drinking reserve and food prep share exactly one confirmed water pool",()=>{
 const base={noHeat:true,waterOut:true,safeWaterConfirmed:true,
   stocks:{"home:water":{qty:5}},
   variants:{"home:alphaRice":{qty:4,prepConfirmed:true,prepWaterLiters:2}}};
 const old=assess(base);
 assert.equal(old.waterStored,5);
 assert.equal(old.waterAllocation,2);
 assert.equal(old.drinkingReview.needsReview,true);
 assert.equal(old.drinkingReview.afterBoth,null);
 assert.equal(old.waterConflict,false,"preparation alone fits the stock, but drinking allocation is still unresolved");
 assert.equal(old.waterForPrep,false);
 assert.equal(row(old,"food").effective,0);
 assert.equal(row(old,"water").effective,5,"do not add preparation litres to the common 3 L/day baseline");
 const confirmed=assess({...base,stocks:{"home:water":{qty:5,drinkingReserveLiters:3,
   drinkingReserveConfirmed:true,drinkingReservePlanDays:3}}});
 assert.equal(confirmed.drinkingReview.confirmed,true);
 assert.equal(confirmed.drinkingReview.combinedAllocation,5);
 assert.equal(confirmed.drinkingReview.afterBoth,0);
 assert.equal(confirmed.waterForPrep,true);
 assert.equal(row(confirmed,"food").effective,4);
 assert.equal(row(confirmed,"water").effective,5,"physically held stock stays five litres, not five minus preparation");
 const excessive=assess({...base,stocks:{"home:water":{qty:5,drinkingReserveLiters:4,
   drinkingReserveConfirmed:true,drinkingReservePlanDays:3}}});
 assert.equal(excessive.drinkingReview.overcommitted,true);
 assert.equal(excessive.waterConflict,true);
 assert.equal(excessive.waterForPrep,false);
 assert.equal(row(excessive,"food").effective,0,"the same litre cannot be allocated for both uses");
 assert.equal(row(excessive,"water").effective,5);
 const normal=assess({...base,waterOut:false});
 assert.equal(normal.waterForPrep,true,"do not require an outage bottled-water plan with working water supply");
 assert.equal(row(normal,"food").effective,4);
});
test("drinking reserve confirmations do not transfer across days or evacuation modes",()=>{
 const base={noHeat:true,waterOut:true,safeWaterConfirmed:true,
   stocks:{"home:water":{qty:4,drinkingReserveLiters:2,drinkingReserveConfirmed:true,drinkingReservePlanDays:3}},
   variants:{"home:alphaRice":{qty:2,prepWaterLiters:1,prepConfirmed:true}}};
 const a=assess(base);
 assert.equal(a.waterForPrep,true);
 assert.equal(a.drinkingReview.planDays,3);
 const changed=assess({...base,days:7});
 assert.equal(changed.drinkingReview.confirmed,false);
 assert.equal(changed.waterForPrep,false);
 assert.equal(row(changed,"food").effective,0);
 const packed=assess({...base,mode:"go",stocks:{...base.stocks,
   "go:water":{qty:3,drinkingReserveLiters:1,drinkingReserveConfirmed:true,drinkingReservePlanDays:1}},
   variants:{...base.variants,"go:alphaRice":{qty:2,prepWaterLiters:1,prepConfirmed:true}}});
 assert.equal(packed.waterStored,3);
 assert.equal(packed.drinkingReview.planDays,1);
 assert.equal(packed.waterForPrep,true);
 const absent=assess({...base,mode:"go",
  variants:{"go:alphaRice":{qty:2,prepWaterLiters:1,prepConfirmed:true}}});
 assert.equal(absent.waterStored,0);
 assert.equal(absent.waterForPrep,false);
});
test("zero, malformed, expired and duplicate water cannot validate a drinking plan",()=>{
 const base={noHeat:true,waterOut:true,safeWaterConfirmed:true,
   variants:{"home:alphaRice":{qty:2,prepWaterLiters:1,prepConfirmed:true}}};
 const zero=assess({...base,stocks:{"home:water":{qty:9,drinkingReserveLiters:0,
   drinkingReserveConfirmed:true,drinkingReservePlanDays:3}}});
 assert.equal(zero.drinkingReview.confirmed,false);
 assert.equal(zero.waterForPrep,false);
 const malformed=assess({...base,stocks:{"home:water":{qty:9,drinkingReserveLiters:"n/a",
   drinkingReserveConfirmed:true,drinkingReservePlanDays:3}}});
 assert.equal(malformed.drinkingReview.confirmed,false);
 assert.equal(malformed.waterForPrep,false);
 const expired=assess({...base,stocks:{"home:water":{qty:6,expiry:"2026-10-31",
   drinkingReserveLiters:2,drinkingReserveConfirmed:true,drinkingReservePlanDays:3}}});
 assert.equal(expired.waterStored,0);
 assert.equal(expired.waterForPrep,false);
 const double=assess({...base,stocks:{"home:water":{qty:5,drinkingReserveLiters:4,
    drinkingReserveConfirmed:true,drinkingReservePlanDays:3}},
   variants:{...base.variants,"home:water2L":{qty:4}}});
 assert.equal(double.waterStored,4,"unreconciled parent/variant overlap does not create five litres");
 assert.equal(double.drinkingReview.combinedAllocation,5);
 assert.equal(double.waterConflict,true);
 assert.equal(row(double,"food").effective,0);
});
test("water-prepared alpha rice is never silently credited without a confirmed safe-water budget",()=>{
 const a=assess({noHeat:true,waterOut:true,variants:{"home:alphaRice":{qty:4}}});
 assert.equal(row(a,"food").effective,0);
 assert.equal(row(a,"food").excludedVariants,4);
 assert.equal(a.waterForPrep,false);
});
test("safe water + quantified allocation permits only explicitly usable food, from the SAME water pool",()=>{
 const a=assess({noHeat:true,waterOut:true,safeWaterConfirmed:true,prepWaterLiters:1,
  stocks:{"home:water":{qty:4,drinkingReserveLiters:3,drinkingReserveConfirmed:true,drinkingReservePlanDays:3}},
  variants:{"home:alphaRice":{qty:4,prepConfirmed:true,prepWaterLiters:1},"home:cupNoodles":{qty:8}}});
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
  stocks:{"home:water":{qty:3,drinkingReserveLiters:2,drinkingReserveConfirmed:true,drinkingReservePlanDays:3}},
  variants:{"home:cupNoodles":{qty:9,prepConfirmed:true,prepWaterLiters:1}}});
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
 const a=assess({noHeat:true,waterOut:true,safeWaterConfirmed:true,stocks:{"home:water":{qty:6,drinkingReserveLiters:3,drinkingReserveConfirmed:true,drinkingReservePlanDays:3}},
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
 assert.equal(withoutFuel.heatReview.verifiedCapacityUses,0,"fuel sessions cannot appear usable without physical canisters");
 const withoutSafety=assess({...stock,powerOut:true,stocks:{...equipment,"home:stove":{qty:1}}});
 assert.equal(row(withoutSafety,"food").effective,2);
 const withoutCompatibility=assess({...stock,powerOut:true,stocks:{...equipment,"home:gas":{qty:2,heatCapacityUses:2}}});
 assert.equal(row(withoutCompatibility,"food").effective,2);
});
test("fuel session budget is shared across EVERY heated food, not reused per product",()=>{
 const data={powerOut:true,waterOut:true,safeWaterConfirmed:true,
   stocks:{"home:water":{qty:4,drinkingReserveLiters:3,drinkingReserveConfirmed:true,drinkingReservePlanDays:3},
     "home:stove":{qty:1,heatEquipmentConfirmed:true},
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
   stocks:{"home:water":{qty:5,drinkingReserveLiters:3,drinkingReserveConfirmed:true,drinkingReservePlanDays:3},
     "home:stove":{qty:1,heatEquipmentConfirmed:true},
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
 const a=assess({stocks:{"home:water":{qty:1,manualCountBasis:"additional"}},
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
