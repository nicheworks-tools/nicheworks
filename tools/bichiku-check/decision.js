/* Dependency-aware planning. Sources are examples, not certifications.
 * Do not convert unidentified food packages to meals or temporary substitutes to complete gear.
 */
(function(root){
"use strict";
const numeric=(v)=>Number.isFinite(Number(v))?Math.max(0,Math.min(10000000,Number(v))):0;
const validDate=(v)=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||""))?String(v):"";
const round=(x)=>Math.round(x*100)/100;
const groups=[
 {id:"food",primary:"food",members:["food","snack","childFood","allergyFood"]},
 {id:"water",primary:"water",members:["water","waterBag"]},
 {id:"toilet",primary:"toilet",members:["toilet","toiletPaper","trashBags"]},
 {id:"warmth",primary:"sleepPad",members:["sleepPad","blanket","clothes","cooling"]},
 {id:"power",primary:"light",members:["light","lantern","batteries","radio","powerbank","cable","stove","gas"]},
 {id:"hygiene",primary:"wetWipes",members:["wetWipes","sanitizer","masks","sanitary","toothbrush","towels","firstAid","medicine"]},
 {id:"evac",primary:"goBag",members:["goBag","whistle","helmet","raincoat","shoes","documents","contacts","cash","glasses","infantFeeding","diapers","petFood","petCarrier","canOpener","utensils"]}
];
function optionUsable(option,s){
 if(option.equivalence!=="full")return false;
 if(option.parent==="food"){
   if(s.noHeat&&(option.prep==="heat"||option.prep==="verify"))return false;
   if(s.powerOut&&!s.offGridHeatConfirmed&&option.prep==="heat")return false;
   if(option.requiresWater&&(!s.safeWaterConfirmed||!s.prepWaterSufficient))return false;
 }
 return true;
}
function choiceQty(s,optionId){
 const item=(s.variants||{})[s.mode+":"+optionId]||{};
 return numeric(item.qty);
}
function unexpired(item,now){
 const expiry=validDate(item&&item.expiry);
 return !expiry||expiry>=now;
}
function storedWater(s,options,now){
 let sum=0;
 const general=(s.stocks||{})[s.mode+":water"]||{};
 if(unexpired(general,now))sum+=numeric(general.qty);
 for(const o of (options||[])){
   if(o.parent!=="water"||o.equivalence!=="full")continue;
   const entry=(s.variants||{})[s.mode+":"+o.id]||{};
   if(unexpired(entry,now))sum+=numeric(entry.qty);
 }
 return round(sum);
}
// Presence of food groups is an inventory audit, NOT a nutrient or calorie score.
// Only explicitly catalogued ready-to-use foods count; unclassified stocks remain unknown.
function foodRoleOverview(options,s,now){
 const roles=["protein","vegetable","fruit"];
 return roles.map(role=>{
   const saved=(options||[]).filter(o=>o.parent==="food"&&o.role===role)
     .map(o=>({option:o,entry:(s.variants||{})[s.mode+":"+o.id]||{}}))
     .filter(x=>numeric(x.entry.qty)>0);
   const usable=saved.filter(({option:o,entry:e})=>
     unexpired(e,now)&&o.prep!=="verify"&&
     (!s.noHeat||o.prep!=="heat")&&
     (!s.powerOut||s.offGridHeatConfirmed||o.prep!=="heat")&&
     (!o.requiresWater||(s.safeWaterConfirmed&&s.prepWaterSufficient&&e.prepConfirmed===true&&numeric(e.prepWaterLiters)>0))
   );
   return {role,recordedKinds:saved.length,usableKinds:usable.length,
     usablePortions:role==="protein"?round(usable.reduce((sum,{entry})=>sum+numeric(entry.qty),0)):null,
     needsReview:saved.length>0&&usable.length===0};
 });
}
// Reserve spare cells per battery SIZE across every registered working device.
 // Spare cells are NOT installed batteries; unknown-size legacy "sets" are never
 // converted to cells. Device runtime and replacement cycles come from the user.
const batteryTypes=Object.freeze(["AA","AAA","C","D","9V","CR2032","CR123A"]);
function batterySupplyReview(s,options,now){
 const mode=s.mode==="go"?"go":"home";
 const planDays=mode==="go"?1:([3,7,14].includes(Number(s.days))?Number(s.days):7);
 const spare=(s.stocks||{})[mode+":batteries"]||{};
 const validSpare=unexpired(spare,now);
 const avail=Object.fromEntries(batteryTypes.map(type=>[type,
   validSpare&&Number.isInteger(Number((spare.batteryCells||{})[type]))?
     Math.floor(numeric((spare.batteryCells||{})[type])):0]));
 const devices=[];
 function include(source,id,parent,entry){
  const owned=Math.floor(numeric(entry.qty));
  if(!owned)return;
  const working=unexpired(entry,now)&&entry.powerReadyConfirmed===true&&
    Number.isInteger(Number(entry.powerReadyQty))?
    Math.min(owned,Math.floor(numeric(entry.powerReadyQty))):0;
  if(!working)return;
  const type=String(entry.batteryType||"");
  const cells=Math.floor(numeric(entry.cellsPerChange));
  const changes=Math.floor(numeric(entry.plannedChanges));
  const freshWhole=Number.isInteger(Number(entry.cellsPerChange))&&Number.isInteger(Number(entry.plannedChanges));
  const verified=entry.batteryPlanConfirmed===true&&entry.batteryPlanDays===planDays&&
    (type==="rechargeable" || (batteryTypes.includes(type)&&freshWhole&&cells>0));
  const required=verified&&type!=="rechargeable"?working*cells*changes:0;
  devices.push({source,id,parent,owned,working,type,cells,changes,required,
    verified,sustained:0,needsReview:!verified});
 }
 for(const id of ["light","lantern","radio"])
  include("basic",id,id,(s.stocks||{})[mode+":"+id]||{});
 for(const o of (options||[])){
  if(o.parent!=="light"||o.equivalence!=="full")continue;
  include("option",o.id,o.parent,(s.variants||{})[mode+":"+o.id]||{});
 }
 const rows=batteryTypes.map(type=>{
  const required=devices.filter(d=>d.type===type&&d.verified).reduce((sum,d)=>sum+d.required,0);
  const available=avail[type];
  return {type,available,required,shortage:Math.max(0,required-available),enough:available>=required};
 });
 const budget=Object.fromEntries(rows.map(x=>[x.type,x]));
 for(const d of devices){
  d.sustained=d.verified&&(d.type==="rechargeable"||budget[d.type]?.enough)?d.working:0;
 }
 return {planDays,devices,rows,spareLegacySets:numeric(spare.qty),
   workingUnits:devices.reduce((v,d)=>v+d.working,0),
   sustainedUnits:devices.reduce((v,d)=>v+d.sustained,0),
   uncheckedDevices:devices.filter(d=>d.needsReview).length,
   shortages:rows.filter(r=>r.shortage>0)};
}
// A blackout heating budget is a USER-VERIFIED number of cooking sessions.
// Never infer sessions per gas canister from its count or a national reference number.
function heatSupplyReview(s,options,now){
 const stove=(s.stocks||{})[s.mode+":stove"]||{};
 const gas=(s.stocks||{})[s.mode+":gas"]||{};
 const stoveCount=unexpired(stove,now)?Math.floor(numeric(stove.qty)):0;
 const canisterCount=unexpired(gas,now)?Math.floor(numeric(gas.qty)):0;
 const capacityUses=unexpired(gas,now)?Math.floor(numeric(gas.heatCapacityUses)):0;
 const heating=(options||[]).filter(o=>o.parent==="food"&&o.prep==="heat")
   .map(o=>({option:o,entry:(s.variants||{})[s.mode+":"+o.id]||{}}))
   .filter(({entry})=>numeric(entry.qty)>0&&unexpired(entry,now));
 const uncheckedFoods=heating.filter(({entry})=>entry.heatConfirmed!==true||
   !Number.isInteger(Number(entry.heatSessions))||numeric(entry.heatSessions)<=0).map(({option})=>option.id);
 const requiredUses=heating.reduce((sum,{entry})=>sum+
   (entry.heatConfirmed===true&&Number.isInteger(Number(entry.heatSessions))?
     Math.floor(numeric(entry.heatSessions)):0),0);
 const equipmentConfirmed=!!stove.heatEquipmentConfirmed;
 const fuelConfirmed=!!gas.heatFuelCompatibleConfirmed;
 const available=stoveCount>0&&canisterCount>0&&capacityUses>0&&equipmentConfirmed&&fuelConfirmed;
 const enough=uncheckedFoods.length===0&&requiredUses>0&&capacityUses>=requiredUses;
 return {stoveCount,canisterCount,capacityUses,verifiedCapacityUses:available?capacityUses:0,
   requiredUses,uncheckedFoods,equipmentConfirmed,fuelConfirmed,available,enough,
   ready:!s.noHeat&&available&&enough};
}
// Do not treat an unverified legacy "bag + solidifier" quantity as assembled uses.
// Existing qty remains in localStorage until the person rechecks each component.
function toiletSupplyReview(s,now){
 const entry=(s.variants||{})[s.mode+":toiletBags"]||{};
 const bagUses=Math.floor(numeric(entry.bagQty));
 const solidifierUses=Math.floor(numeric(entry.solidifierQty));
 const expired=!unexpired(entry,now);
 const pairedUses=expired?0:Math.min(bagUses,solidifierUses);
 const checks={
   compatibility:!!s.toiletAssemblyConfirmed,
   installation:!!s.toiletSeatConfirmed,
   storage:!!s.toiletStorageConfirmed,
   disposal:!!s.toiletDisposalConfirmed
 };
 const verified=Object.values(checks).every(Boolean);
 return {bagUses,solidifierUses,pairedUses,usableUses:verified?pairedUses:0,
   legacyQty:numeric(entry.qty),expired,verified,checks};
}
function normalize(s){
 s=s||{};
 return Object.assign({},s,{
   powerOut:!!s.powerOut,waterOut:!!s.waterOut,noHeat:!!s.noHeat,
   offGridHeatConfirmed:!!s.offGridHeatConfirmed,
   safeWaterConfirmed:!!s.safeWaterConfirmed,
   prepWaterLiters:numeric(s.prepWaterLiters),
   toiletAssemblyConfirmed:!!s.toiletAssemblyConfirmed,
   toiletSeatConfirmed:!!s.toiletSeatConfirmed,
   toiletStorageConfirmed:!!s.toiletStorageConfirmed,
   toiletDisposalConfirmed:!!s.toiletDisposalConfirmed
 });
}
function assessment(catalog,options,source,today){
 const s=normalize(source),now=validDate(today)||new Date().toISOString().slice(0,10);
 const stored=storedWater(s,options,now);
 const heatReview=heatSupplyReview(s,options,now);
 const batteryReview=batterySupplyReview(s,options,now);
 const heatReady=!s.noHeat&&(!s.powerOut||heatReview.ready);
 // Each water-dependent food must have its own complete, package-checked water allocation.
 // An old saved global water number cannot automatically verify any food item.
 const waterDetails=(options||[]).filter(o=>o.parent==="food"&&o.requiresWater)
   .map(o=>({option:o,entry:(s.variants||{})[s.mode+":"+o.id]||{}}))
   .filter(x=>numeric(x.entry.qty)>0&&unexpired(x.entry,now)&&
     (!s.noHeat||!["heat","verify"].includes(x.option.prep))&&
     (!s.powerOut||heatReady||x.option.prep!=="heat"));
 const checked=waterDetails.filter(x=>x.entry.prepConfirmed===true&&numeric(x.entry.prepWaterLiters)>0);
 const waterAllocation=round(checked.reduce((sum,x)=>sum+numeric(x.entry.prepWaterLiters),0));
 const uncheckedFoods=waterDetails.filter(x=>!checked.includes(x)).map(x=>x.option.id);
 const waterConflict=s.waterOut&&waterAllocation>stored;
 const waterForPrep=s.safeWaterConfirmed&&waterAllocation>0&&!waterConflict;
 // Overwrite the legacy one-checkbox approval for actual calculation; it remains
 // saved for the person's reference but never authorizes unmeasured heating.
 const readiness=Object.assign({},s,{prepWaterSufficient:waterForPrep,
   offGridHeatConfirmed:heatReady,enforceConditions:true});
 const core=root.BichikuCore;
 if(!core)throw Error("BichikuCore is required");
 const calc=core.calculate(catalog,readiness,now,options);
 // Keep immediate working stock visible separately from preparedness across
 // the selected time horizon. A blackout needs an explicit replacement plan.
 for(const row of calc.items){
  if(!["light","lantern","radio"].includes(row.item.id))continue;
  row.currentEffective=row.effective;
  row.sustainedEffective=batteryReview.devices.filter(d=>d.parent===row.item.id)
    .reduce((sum,d)=>sum+d.sustained,0);
  if(s.powerOut){
   row.effective=row.sustainedEffective;
   row.missing=round(Math.max(0,row.required-row.effective));
  }
 }
 const foodGroups=foodRoleOverview(options,readiness,now);
 // MAFF adult staple/main-dish stock example: 3 portions per adult per day.
 // Suppress this simplified comparison when children or infants need individualized planning.
 const mainDishReferencePortions=calc.settings.mode==="home"&&calc.settings.adults>0&&calc.settings.children===0&&calc.settings.infants===0
   ?3*calc.settings.adults*calc.settings.days:null;
 const toiletReview=toiletSupplyReview(s,now);
 const assemblyUses=toiletReview.usableUses;
 const toilet=calc.items.find(x=>x.item.id==="toilet");
 if(toilet){
   toilet.assembledUses=assemblyUses;
   // Count a matched pair as owned even if it needs installation/disposal review;
   // only verified uses cover the shortage. Old unverified qty is NOT auto-credited.
   toilet.owned=round(toilet.owned+toiletReview.pairedUses);
   toilet.effective=round(toilet.effective+assemblyUses);
   toilet.missing=round(Math.max(0,toilet.required-toilet.effective));
 }
 const byId=new Map(calc.items.map(x=>[x.item.id,x]));
 const status=groups.map(g=>{
   const rows=g.members.map(id=>byId.get(id)).filter(Boolean);
   if(!rows.length)return null;
   const p=byId.get(g.primary)||rows[0];
   const needed=rows.filter(x=>x.missing>0).length;
   return {id:g.id,primary:p,rows,missingCategories:needed,hasGap:needed>0};
 }).filter(Boolean);
 const water=byId.get("water");
 const food=byId.get("food");
 const pad=byId.get("sleepPad"),warmth=byId.get("blanket");
 const combinations=[
   {id:"foodPrep",type:waterForPrep?"ready":"review",
    amount:waterAllocation,available:stored,condition:waterForPrep,requires:["safeWaterConfirmed","perItemPrepConfirmed","perItemWaterLiters"],
    note:waterConflict?"prepWaterInsufficient":s.safeWaterConfirmed?"waterAllocation":"prepWaterUnconfirmed"},
   {id:"batteryBudget",type:batteryReview.uncheckedDevices===0&&
      batteryReview.shortages.length===0&&batteryReview.workingUnits>0?"ready":"review",
    amount:batteryReview.rows.reduce((n,r)=>n+r.required,0),
    available:batteryReview.rows.reduce((n,r)=>n+r.available,0),
    condition:batteryReview.uncheckedDevices===0&&batteryReview.shortages.length===0,
    requires:["batteries.batteryCells","devices.batteryType","devices.cellsPerChange",
      "devices.plannedChanges","devices.batteryPlanConfirmed"],
    note:"batterySharedBudget"},
   {id:"heatFuel",type:heatReview.ready?"ready":"review",amount:heatReview.requiredUses,
    available:heatReview.capacityUses,condition:heatReview.ready,
    requires:["stove.qty","stove.heatEquipmentConfirmed","gas.qty","gas.heatCapacityUses",
      "gas.heatFuelCompatibleConfirmed","food.heatSessions","food.heatConfirmed"],
    note:heatReview.ready?"heatReady":"heatReview"},
   {id:"toiletAssembly",type:assemblyUses>0?"ready":"review",amount:assemblyUses,condition:toiletReview.verified,
    requires:["toiletBags.bagQty","toiletBags.solidifierQty","toiletAssemblyConfirmed",
      "toiletSeatConfirmed","toiletStorageConfirmed","toiletDisposalConfirmed"],
    note:assemblyUses?"toiletReady":"toiletReview"},
   {id:"floorWarmth",type:pad&&warmth&&pad.missing===0&&warmth.missing===0?"ready":"review",
    condition:!!pad&&!!warmth&&pad.missing===0&&warmth.missing===0,
    note:"sleepLayers",requires:["sleepPad","blanket"]}
 ];
 // Recompute metadata after optional assemblies. Never mark a category "ready" from a conditional substitute alone.
 calc.missingCount=calc.items.filter(x=>x.missing>0).length;
 calc.coreMissingCount=calc.items.filter(x=>x.priority===1&&x.missing>0).length;
 calc.filledCount=calc.items.filter(x=>x.missing===0).length;
 return {settings:s,calc,groups:status,combinations,foodGroups,mainDishReferencePortions,toiletReview,heatReview,batteryReview,
   heatReady,waterForPrep,waterStored:stored,
   waterAllocation,uncheckedFoods,waterRemainingAfterPrep:round(Math.max(0,stored-waterAllocation)),
   food,water,pad,warmth,waterConflict};
}
const api=Object.freeze({assessment,groups,optionUsable,storedWater,foodRoleOverview,toiletSupplyReview,heatSupplyReview,batterySupplyReview,batteryTypes});
root.BichikuDecision=api;
if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis==="object"?globalThis:this);
