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
function normalize(s){
 s=s||{};
 return Object.assign({},s,{
   powerOut:!!s.powerOut,waterOut:!!s.waterOut,noHeat:!!s.noHeat,
   offGridHeatConfirmed:!!s.offGridHeatConfirmed,
   safeWaterConfirmed:!!s.safeWaterConfirmed,
   prepWaterLiters:numeric(s.prepWaterLiters),
   toiletAssemblyConfirmed:!!s.toiletAssemblyConfirmed
 });
}
function assessment(catalog,options,source,today){
 const s=normalize(source),now=validDate(today)||new Date().toISOString().slice(0,10);
 const stored=storedWater(s,options,now);
 // Each water-dependent food must have its own complete, package-checked water allocation.
 // An old saved global water number cannot automatically verify any food item.
 const waterDetails=(options||[]).filter(o=>o.parent==="food"&&o.requiresWater)
   .map(o=>({option:o,entry:(s.variants||{})[s.mode+":"+o.id]||{}}))
   .filter(x=>numeric(x.entry.qty)>0&&unexpired(x.entry,now)&&
     (!s.noHeat||!["heat","verify"].includes(x.option.prep))&&
     (!s.powerOut||s.offGridHeatConfirmed||x.option.prep!=="heat"));
 const checked=waterDetails.filter(x=>x.entry.prepConfirmed===true&&numeric(x.entry.prepWaterLiters)>0);
 const waterAllocation=round(checked.reduce((sum,x)=>sum+numeric(x.entry.prepWaterLiters),0));
 const uncheckedFoods=waterDetails.filter(x=>!checked.includes(x)).map(x=>x.option.id);
 const waterConflict=s.waterOut&&waterAllocation>stored;
 const waterForPrep=s.safeWaterConfirmed&&waterAllocation>0&&!waterConflict;
 const readiness=Object.assign({},s,{prepWaterSufficient:waterForPrep,enforceConditions:true});
 const core=root.BichikuCore;
 if(!core)throw Error("BichikuCore is required");
 const calc=core.calculate(catalog,readiness,now,options);
 const foodGroups=foodRoleOverview(options,readiness,now);
 // MAFF adult staple/main-dish stock example: 3 portions per adult per day.
 // Suppress this simplified comparison when children or infants need individualized planning.
 const mainDishReferencePortions=calc.settings.adults>0&&calc.settings.children===0&&calc.settings.infants===0
   ?3*calc.settings.adults*calc.settings.days:null;
 const toiletBags=(s.variants||{})[s.mode+":toiletBags"]||{};
 const assemblyUses=s.toiletAssemblyConfirmed&&unexpired(toiletBags,now)?numeric(toiletBags.qty):0;
 const toilet=calc.items.find(x=>x.item.id==="toilet");
 if(toilet&&assemblyUses>0){
   toilet.assembledUses=assemblyUses;
   toilet.effective=round(toilet.effective+assemblyUses);
   toilet.owned=round(toilet.owned+assemblyUses);
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
   {id:"toiletAssembly",type:assemblyUses>0?"ready":"review",amount:assemblyUses,condition:s.toiletAssemblyConfirmed,
    requires:["toiletAssemblyConfirmed","toiletBags"],note:assemblyUses?"toiletReady":"toiletReview"},
   {id:"floorWarmth",type:pad&&warmth&&pad.missing===0&&warmth.missing===0?"ready":"review",
    condition:!!pad&&!!warmth&&pad.missing===0&&warmth.missing===0,
    note:"sleepLayers",requires:["sleepPad","blanket"]}
 ];
 // Recompute metadata after optional assemblies. Never mark a category "ready" from a conditional substitute alone.
 calc.missingCount=calc.items.filter(x=>x.missing>0).length;
 calc.coreMissingCount=calc.items.filter(x=>x.priority===1&&x.missing>0).length;
 calc.filledCount=calc.items.filter(x=>x.missing===0).length;
 return {settings:s,calc,groups:status,combinations,foodGroups,mainDishReferencePortions,
   heatReady:!s.noHeat&&(!s.powerOut||s.offGridHeatConfirmed),waterForPrep,waterStored:stored,
   waterAllocation,uncheckedFoods,waterRemainingAfterPrep:round(Math.max(0,stored-waterAllocation)),
   food,water,pad,warmth,waterConflict};
}
const api=Object.freeze({assessment,groups,optionUsable,storedWater,foodRoleOverview});
root.BichikuDecision=api;
if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis==="object"?globalThis:this);
