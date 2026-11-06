/* Guided BichikuCheck: household -> goals -> concrete choices -> shopping */
(function(){
"use strict";
const lang=document.body.getAttribute("data-lang")||"ja",L=window.BICHIKU_I18N[lang],T=window.BICHIKU_GUIDED_TEXT[lang];
const O=window.BICHIKU_OPTIONS_UI[lang],catalog=window.BICHIKU_CATALOG,choices=window.BICHIKU_OPTIONS;
const decision=window.BichikuDecision,affiliate=window.NWAmazonAffiliate;
const setup=document.getElementById("setup"),result=document.getElementById("results");
const defaults={mode:"home",adults:1,children:0,infants:0,pets:0,days:7,powerOut:false,waterOut:false,noHeat:false,offGridHeatConfirmed:false,diet:false,safeWaterConfirmed:false,prepWaterLiters:0,toiletAssemblyConfirmed:false,toiletSeatConfirmed:false,toiletStorageConfirmed:false,toiletDisposalConfirmed:false,stocks:{},variants:{}};
const key=id=>state.mode+":"+id,esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n=x=>Number.isFinite(Number(x))?Math.min(10000000,Math.max(0,Number(x))):0;
const fmt=x=>Number.isInteger(x)?String(x):String(Math.round(x*100)/100);
const unit=id=>id.startsWith("battery:")?T.batteryCellsUnit:id==="water"?"L":id==="food"?T.unitMeals:id==="toilet"?T.unitUses:"";
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
let state=Object.assign({},defaults),stage="setup",goal="food",tab="emergency",search="",showAll=false;
let openOptions=new Set(),openParents=new Set(),selected=null,impression=false,advancedOpen=false,batteryPanelOpen=false;
try{const saved=JSON.parse(localStorage.getItem("bichiku-check-v1")||"null");if(saved&&typeof saved==="object"&&!Array.isArray(saved))state=Object.assign({},defaults,saved)}catch(_){}
if(!state.stocks||Array.isArray(state.stocks))state.stocks={};
if(!state.variants||Array.isArray(state.variants))state.variants={};
const save=()=>{try{localStorage.setItem("bichiku-check-v1",JSON.stringify(state))}catch(_){}};
const calc=()=>decision.assessment(catalog,choices,state,today());
const getBasic=id=>state.stocks[key(id)]||{},getOption=id=>state.variants[key(id)]||{};
// A change to the household or the outage scenario requires a new deliberate
// review of the previously approved drinking quantity. Preserve every litre.
function revokeDrinkingApproval(){
 const k=key("water"),entry=state.stocks[k];
 if(entry&&entry.drinkingReserveConfirmed===true)
  state.stocks[k]=Object.assign({},entry,{drinkingReserveConfirmed:false});
}
const targetUrls={};
function addTarget(id,query){
 if(!query)return;
 const u=new URL("https://www.amazon.co.jp/s");u.searchParams.set("k",query);u.searchParams.set("tag","nicheworks09-22");targetUrls[id]=u.toString();
}
catalog.forEach(i=>addTarget(i.id,i.search));choices.forEach(i=>addTarget("option_"+i.id,i.query));
if(affiliate)affiliate.configure({enabled:true,tool:"bichiku-check",targets:targetUrls});
function stepper(id,label){
 return '<div class="g-counter"><span>'+esc(label)+'</span><div><button data-inc="-1" data-field="'+id+'" type="button" aria-label="'+esc(label)+' -">−</button><output>'+fmt(state[id])+'</output><button data-inc="1" data-field="'+id+'" type="button" aria-label="'+esc(label)+' +">+</button></div></div>';
}
function segment(id,vals,labels){
 return '<div class="g-segment">'+vals.map((v,i)=>'<button type="button" data-select="'+id+'" data-value="'+v+'" aria-pressed="'+(String(state[id])===String(v))+'" class="'+(String(state[id])===String(v)?"active":"")+'">'+esc(labels[i])+'</button>').join("")+'</div>';
}
function renderSetup(){
 setup.innerHTML='<h2>'+esc(T.step1)+'</h2><p class="g-lead">'+esc(T.heading)+'</p>'+
 '<div class="field"><label class="field-title">'+esc(L.home)+' / '+esc(L.go)+'</label>'+segment("mode",["home","go"],[T.home,T.go])+'</div>'+
 '<fieldset class="field"><legend class="field-title">'+esc(T.people)+'</legend>'+stepper("adults",L.adults)+stepper("children",L.children)+
 (state.mode==="home"?'<label class="field-title">'+esc(L.days)+'</label>'+segment("days",[3,7,14],["3","7","14"]):"")+'</fieldset>'+
 '<fieldset class="field"><legend class="field-title">'+esc(T.scenario)+'</legend><div class="g-scenarios">'+["powerOut","waterOut","noHeat"].map(k=>
 '<label class="g-check"><input type="checkbox" data-condition="'+k+'" '+(state[k]?"checked":"")+'><span>'+esc(T[k])+'</span></label>').join("")+'</div></fieldset>'+
 '<details class="advanced" '+(advancedOpen?"open":"")+'><summary>'+esc(T.moreSettings)+'</summary>'+stepper("infants",L.infants)+stepper("pets",L.pets)+
 '<label class="g-check"><input type="checkbox" data-condition="diet" '+(state.diet?"checked":"")+'>'+esc(T.diet)+'</label></details>'+
 '<button class="primary wide" id="calculate" type="button">'+esc(T.calculate)+' ↓</button><p class="g-fine">'+esc(T.localOnly)+'</p>';
}
function meter(row){
 const progress=row.required?Math.min(100,Math.max(0,Math.round(row.effective/row.required*100))):100;
 return '<div class="g-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progress+'"><span style="width:'+progress+'%"></span></div>';
}
function count(row){
 return '<span>'+esc(T.have)+' <strong>'+fmt(row.effective)+unit(row.item.id)+'</strong> / '+esc(T.need)+' '+fmt(row.required)+unit(row.item.id)+'</span>';
}
function groupCards(a){
 return a.groups.map(g=>{
 const r=g.primary,missing=g.missingCategories>0;
 return '<article class="g-goal"><div class="g-goal-head"><strong>'+esc(T[g.id])+'</strong><span class="'+(missing?"g-danger":"g-ok")+'">'+(missing?esc(r.missing?T.missing:T.groupGaps)+' '+(r.missing?fmt(r.missing)+unit(r.item.id):g.missingCategories):esc(T.ready))+'</span></div>'+
 meter(r)+'<div class="g-count">'+count(r)+'</div><p class="g-fine">'+esc(T[g.id+"Hint"])+'</p>'+
 '<button type="button" data-goal="'+g.id+'" class="g-open">'+esc(T.open)+' →</button></article>';
 }).join("");
}
function overlapWarning(a){
 const items=a.calc.items.filter(x=>x.requiresManualReview);
 return items.length?'<p class="g-pending">'+esc(T.overlapAlert)+': <strong>'+
  fmt(items.length)+'</strong> · '+esc(T.overlapShoppingCaution)+'</p>':"";
}
function waterBudgetWarning(a){
 return state.waterOut&&a.waterAllocation>0&&!a.waterForPrep?
  '<p class="g-pending">'+esc(T.drinkBudgetAlert)+'</p>':"";
}
function resultsPage(a){
 const total=a.groups.reduce((sum,g)=>sum+g.missingCategories,0);
 return '<div class="g-head"><h2>'+esc(T.step2)+'</h2><button type="button" data-edit class="g-link">'+esc(T.edit)+'</button></div>'+
 '<p class="g-lead">'+esc(T.guide)+'</p>'+overlapWarning(a)+waterBudgetWarning(a)+batteryShoppingNotice(a)+'<div class="g-total"><strong>'+total+'</strong><span>'+esc(T.missingItems)+'</span></div>'+
 '<div class="g-goals">'+groupCards(a)+'</div><button type="button" class="primary wide" data-shopping>'+esc(T.toShopping)+' →</button>';
}
function preserveOpen(){
 result.querySelectorAll("details[data-option]").forEach(el=>{if(el.open)openOptions.add(el.dataset.option);else openOptions.delete(el.dataset.option)});
 result.querySelectorAll("details[data-parent]").forEach(el=>{if(el.open)openParents.add(el.dataset.parent);else openParents.delete(el.dataset.parent)});
 const batteryPanel=result.querySelector("details[data-battery-stock-panel]");
 if(batteryPanel)batteryPanelOpen=batteryPanel.open;
}
function foodGroupsHtml(a){
 const groups=a.foodGroups||[];
 return '<div class="g-food-review" aria-label="'+esc(T.foodGroupTitle)+'">'+
 '<h4>'+esc(T.foodGroupTitle)+'</h4>'+
 groups.map(g=>{
   const status=g.usableKinds>0?T.groupListed:g.recordedKinds>0?T.groupReview:T.groupEmpty;
   const portions=g.role==="protein"?
     '<p class="g-fine">'+esc(T.mainDishRegistered)+': <strong>'+fmt(g.usablePortions)+' '+esc(T.mealCount)+'</strong>'+
     (a.settings.mode==="go"?' · '+esc(T.mainDishGoOnly):a.mainDishReferencePortions===null?' · '+esc(T.mainDishIndividual):
       ' / <a href="https://www.maff.go.jp/tokai/shohi/seikatsu/heya/rental/attach/pdf/saigairesipi-7.pdf" target="_blank" rel="noopener">'+esc(T.mainDishAdultExample)+'</a>: '+fmt(a.mainDishReferencePortions)+' '+esc(T.mealCount))+'</p>':"";
   return '<div class="g-food-role"><strong>'+esc(T["group"+g.role.charAt(0).toUpperCase()+g.role.slice(1)])+'</strong>'+
    '<span>'+esc(status)+(g.usableKinds>0?' · '+g.usableKinds+' '+esc(T.groupKinds):"")+'</span></div>'+portions;
 }).join("")+
 '<p class="g-fine">'+esc(T.groupCaution)+'</p>'+
 '<p class="g-fine">'+esc(T.groupPortionNote)+'</p>'+
 '<a href="https://www.maff.go.jp/j/zyukyu/foodstock/chapter03.html" target="_blank" rel="noopener">'+esc(T.groupSource)+'</a>'+
 '</div>';
}
function heatControls(a){
 const stove=getBasic("stove"),gas=getBasic("gas"),h=a.heatReview;
 return '<div class="g-heat-review">'+
  '<p>'+esc(T.heatPlanExplanation)+'</p>'+
  '<div class="g-parent-fields"><label>'+esc(T.heatStoveCount)+
  '<input type="number" inputmode="numeric" min="0" max="10000000" step="1" data-heat-stock="stoveCount" value="'+fmt(n(stove.qty))+'"></label>'+
  '<label>'+esc(T.heatCanisterCount)+
  '<input type="number" inputmode="numeric" min="0" max="10000000" step="1" data-heat-stock="gasCount" value="'+fmt(n(gas.qty))+'"></label>'+
  '<label>'+esc(T.heatCapacityUses)+
  '<input type="number" inputmode="numeric" min="0" max="10000000" step="1" data-heat-stock="gasCapacity" value="'+fmt(n(gas.heatCapacityUses))+'"></label></div>'+
  '<label class="g-check"><input type="checkbox" data-heat-check="stove" '+(stove.heatEquipmentConfirmed===true?"checked":"")+'>'+esc(T.heatEquipmentConfirm)+'</label>'+
  '<label class="g-check"><input type="checkbox" data-heat-check="gas" '+(gas.heatFuelCompatibleConfirmed===true?"checked":"")+'>'+esc(T.heatFuelConfirm)+'</label>'+
  '<p class="g-water-summary">'+esc(T.heatNeeded)+': <strong>'+fmt(h.requiredUses)+' '+esc(T.unitUses)+'</strong></p>'+
  '<p class="g-water-summary">'+esc(T.heatAvailable)+': <strong>'+fmt(h.verifiedCapacityUses)+' '+esc(T.unitUses)+'</strong></p>'+
  (h.uncheckedFoods.length?'<p class="g-pending">'+esc(T.heatUnchecked)+': '+fmt(h.uncheckedFoods.length)+'</p>':"")+
  (state.offGridHeatConfirmed?'<p class="g-fine">'+esc(T.heatLegacy)+'</p>':"")+
  '<p class="g-fine">'+esc(T.heatSafety)+' <a href="https://www.nite.go.jp/jiko/chuikanki/press/2024fy/prs241226.html" rel="noopener" target="_blank">'+esc(T.heatSafetySource)+'</a></p>'+
  '<p class="g-fine">'+esc(T.heatReference)+' <a href="https://www.maff.go.jp/j/zyukyu/foodstock/chapter07.html" rel="noopener" target="_blank">'+esc(T.heatReferenceSource)+'</a></p></div>';
}
function batterySummary(a){
 const b=a.batteryReview,spare=getBasic("batteries");
 return '<div class="g-battery-review"><h4>'+esc(T.batteryTitle)+'</h4>'+
  '<p class="g-fine">'+esc(T.batteryExplanation)+'</p>'+
  '<details class="g-option" data-battery-stock-panel '+(batteryPanelOpen?"open":"")+'><summary>'+esc(T.batteryInventory)+'</summary>'+
  '<div class="g-option-body"><p class="g-fine">'+esc(T.batteryLegacy)+' '+fmt(n(spare.qty))+'</p>'+
  '<div class="g-parent-fields">'+decision.batteryTypes.map(type=>
   '<label>'+esc(type)+' · '+esc(T.batteryUnits)+
   '<input type="number" min="0" max="10000000" step="1" inputmode="numeric" data-battery-stock="'+type+'" value="'+fmt(n((spare.batteryCells||{})[type]))+'"></label>'
   ).join("")+'</div></div></details>'+
  '<p class="g-water-summary">'+esc(T.batteryWorking)+': <strong>'+fmt(b.workingUnits)+'</strong> · '+
   esc(T.batterySustained)+': <strong>'+fmt(b.sustainedUnits)+'</strong></p>'+
  '<div class="g-layers">'+b.rows.filter(r=>r.required>0||r.available>0).map(r=>
   '<div><b>'+esc(r.type)+'</b><span>'+esc(T.batteryRequired)+': '+fmt(r.required)+
   ' / '+esc(T.batteryAvailable)+': '+fmt(r.available)+
   (r.shortage?' · '+esc(T.batteryShortage)+': '+fmt(r.shortage):"")+'</span></div>').join("")+'</div>'+
  (b.uncheckedDevices?'<p class="g-pending">'+esc(T.batteryUnchecked)+': '+fmt(b.uncheckedDevices)+'</p>':"")+
  (b.devices.some(d=>d.verified&&d.reserved<d.working)?
    '<p class="g-fine">'+esc(T.batteryPartialNote)+'</p>':"")+
  '<p class="g-fine">'+esc(T.batteryNoDouble)+'</p>'+
  '<p class="g-fine">'+esc(T.batterySafety)+' <a href="https://baj.or.jp/safety/primarybattery_light/safety20.html" target="_blank" rel="noopener">'+esc(T.batterySource)+'</a></p></div>';
}
function drinkingBudgetControls(a){
 const d=a.drinkingReview,water=getBasic("water");
 return '<div class="g-water-item g-drinking-review">'+
 '<p class="g-fine">'+esc(T.drinkBudgetExplanation)+
 ' <a href="https://www.maff.go.jp/j/zyukyu/foodstock/imadoki/imadoki02_10.html" target="_blank" rel="noopener">'+esc(T.drinkBudgetSource)+'</a></p>'+
 '<div class="g-parent-fields"><label>'+esc(T.drinkReserveLabel)+
 '<input type="number" min="0" max="10000000" step="0.1" inputmode="decimal" data-drink-reserve="1" value="'+fmt(n(water.drinkingReserveLiters))+'"></label>'+
 '<span>'+esc(T.drinkPlanDays)+': '+fmt(d.planDays)+'</span></div>'+
 '<label class="g-check"><input type="checkbox" data-drink-confirm="1" '+(d.confirmed?"checked":"")+'>'+esc(T.drinkConfirm)+'</label>'+
 '<p class="g-water-summary">'+esc(T.drinkStored)+': <strong>'+fmt(d.available)+'L</strong></p>'+
 '<p class="g-water-summary">'+esc(T.drinkPrep)+': <strong>'+fmt(a.waterAllocation)+'L</strong></p>'+
 '<p class="g-water-summary">'+esc(T.drinkTotal)+': <strong>'+fmt(d.combinedAllocation)+'L</strong></p>'+
 '<p class="g-water-summary">'+esc(T.drinkBaselineTarget)+': <strong>'+fmt(d.baseRequired)+'L</strong></p>'+
 (state.waterOut&&d.confirmed?
  '<p class="g-water-summary">'+esc(T.drinkUpdatedTarget)+': <strong>'+fmt(d.resolvedRequired)+'L</strong></p>'+
  (d.extraRequired>0?'<p class="g-pending">'+esc(T.drinkTargetRise)+': <strong>'+fmt(d.extraRequired)+'L</strong></p>':"")+
  '<p class="g-water-summary">'+esc(T.drinkShopShortage)+': <strong>'+fmt(d.shoppingMissing)+'L</strong></p>':"")+
 (d.confirmed?'<p class="g-water-summary">'+esc(T.drinkFree)+': <strong>'+fmt(d.afterBoth)+'L</strong></p>':
 '<p class="g-pending">'+esc(d.householdChanged?T.drinkHouseholdChanged:T.drinkUnconfirmed)+'</p>')+
 (d.overcommitted?'<p class="g-pending">'+esc(T.drinkOvercommitted)+'</p>':"")+
 '<p class="g-fine">'+esc(T.drinkReserveCaution)+'</p></div>';
}
function conditions(a){
 if(goal==="food")return '<p>'+esc(a.waterConflict?T.waterShort:T.foodRequires)+'</p>'+
 '<label class="g-check"><input type="checkbox" data-setting="safeWaterConfirmed" '+(state.safeWaterConfirmed?"checked":"")+'>'+esc(T.waterConfirm)+'</label>'+
 (state.waterOut?drinkingBudgetControls(a):"")+
 (state.powerOut&&!state.noHeat?'<p class="g-pending">'+esc(T.heatUnconfirmed)+'</p>'+heatControls(a):"")+
 '<p class="g-fine">'+esc(T.prepExplanation)+'</p>'+
 '<p class="g-water-summary">'+esc(T.prepAllocated)+': <strong>'+fmt(a.waterAllocation)+'L</strong></p>'+
 '<p class="g-water-summary">'+esc(T.waterRemaining)+': <strong>'+fmt(a.waterRemainingAfterPrep)+'L</strong></p>'+
 (a.uncheckedFoods.length?'<p class="g-fine">'+esc(T.prepUnchecked)+'</p>':"")+foodGroupsHtml(a);
 if(goal==="power")return '<p>'+esc(T.energyExplanation)+'</p>'+
  '<p class="g-fine">'+esc(T.energyNoConversion)+'</p>'+
  '<p class="g-fine">'+esc(T.energySafety)+' <a href="https://www.hkd.meti.go.jp/hokih/20220826/index.htm" rel="noopener" target="_blank">'+esc(T.energySafetySource)+'</a></p>'+
  batterySummary(a)+(state.powerOut&&!state.noHeat?heatControls(a):"");
 if(goal==="toilet"){
  const review=a.toiletReview;
  const checks=[
   ["toiletAssemblyConfirmed",T.toiletPairConfirm],
   ["toiletSeatConfirmed",T.toiletSeatConfirm],
   ["toiletStorageConfirmed",T.toiletStorageConfirm],
   ["toiletDisposalConfirmed",T.toiletDisposalConfirm]
  ];
  return '<p>'+esc(T.toiletExplanation)+'</p>'+
    '<p class="g-water-summary">'+esc(T.toiletPairPotential)+': <strong>'+fmt(review.pairedUses)+' '+esc(T.unitUses)+'</strong></p>'+
    '<p class="g-water-summary">'+esc(T.toiletPairCredited)+': <strong>'+fmt(review.usableUses)+' '+esc(T.unitUses)+'</strong></p>'+
    checks.map(([id,label])=>'<label class="g-check"><input type="checkbox" data-setting="'+id+'" '+(state[id]?"checked":"")+'>'+esc(label)+'</label>').join("")+
    '<p class="g-fine">'+esc(T.toiletKitNote)+'</p>'+
    '<p class="g-fine">'+esc(T.toiletWasteNote)+' <a href="https://www.koho.metro.tokyo.lg.jp/2025/09/01-1.html" rel="noopener" target="_blank">'+esc(T.toiletSource)+'</a></p>';
 }
 if(goal==="warmth")return '<p>'+esc(T.floorExplanation)+'</p><div class="g-layers">'+["sleepPad","blanket"].map(id=>{
  const x=a.calc.items.find(r=>r.item.id===id);return x?'<div><b>'+esc(x.item.names[lang])+'</b><span>'+esc(T.missing)+': '+fmt(x.missing)+'</span></div>':"";
 }).join("")+'</div>';
 if(goal==="water")return '<p>'+esc(T.waterHint)+'</p>'+
 (state.waterOut?drinkingBudgetControls(a):"")+
 '<p>'+esc(T.waterRemaining)+': '+fmt(a.waterRemainingAfterPrep)+'L</p>';
 return '<p>'+esc(T[goal+"Hint"]||T.otherConditions)+'</p>';
}
const energyParents=new Set(["light","lantern","radio","powerbank"]);
function isEnergyOption(o){return o.parent==="light"||o.id==="batteryBank"}
function batteryPlanFields(item,id,isBasic){
 const source=(isBasic?"basic:":"option:")+id;
 const currentDays=state.mode==="go"?1:n(state.days);
 const confirmed=item.batteryPlanConfirmed===true&&item.batteryPlanDays===currentDays;
 const types=["",...decision.batteryTypes,"rechargeable"];
 return '<div class="g-battery-device"><p class="g-fine">'+esc(T.batteryPerDevice)+'</p>'+
  '<div class="g-parent-fields"><label>'+esc(T.batteryType)+
   '<select data-battery-type="'+source+'">'+types.map(type=>
    '<option value="'+esc(type)+'" '+(type===(item.batteryType||"")?"selected":"")+'>'+
     esc(type===""?T.batteryUnknown:type==="rechargeable"?T.batteryRechargeable:type)+'</option>').join("")+'</select></label>'+
   '<label>'+esc(T.batteryPerChange)+
    '<input type="number" min="0" max="10000000" step="1" inputmode="numeric" data-battery-cells="'+source+'" value="'+fmt(n(item.cellsPerChange))+'"></label>'+
   '<label>'+esc(T.batteryCycles)+
    '<input type="number" min="0" max="10000000" step="1" inputmode="numeric" data-battery-changes="'+source+'" value="'+fmt(n(item.plannedChanges))+'"></label>'+
   '<label>'+esc(T.batteryReserveUnits)+
    '<input type="number" min="0" max="10000000" step="1" inputmode="numeric" data-battery-reserve="'+source+'" value="'+(item.batteryReservedUnits==null?"":fmt(n(item.batteryReservedUnits)))+'" placeholder="'+esc(T.batteryReserveAll)+'"></label></div>'+
   '<label class="g-check"><input type="checkbox" data-battery-confirm="'+source+'" '+(confirmed?"checked":"")+'>'+esc(T.batteryPlanConfirm)+'</label>'+
   '<p class="g-fine">'+esc(T.batteryRechargeableNote)+'</p></div>';
}
function energyFields(item,id,isBasic,isBank){
 const input=isBasic?"data-energy-basic-ready":"data-energy-option-ready";
 const check=isBasic?"data-energy-basic-confirm":"data-energy-option-confirm";
 return '<div class="g-water-item"><label class="g-input">'+esc(T.energyUsableCount)+
  '<input type="number" min="0" max="10000000" step="1" inputmode="numeric" '+input+'="'+id+'" value="'+fmt(n(item.powerReadyQty))+'"></label>'+
  '<label class="g-check"><input type="checkbox" '+check+'="'+id+'" '+(item.powerReadyConfirmed===true?"checked":"")+'>'+
    esc(isBank?T.energyBankConfirm:T.energyDeviceConfirm)+'</label>'+
  '<p class="g-fine">'+esc(T.energyItemCaution)+'</p>'+
  (isBank?"":batteryPlanFields(item,id,isBasic))+'</div>';
}
function manualOverlapFields(row,item){
 const listed=row.listedOwned==null?row.variantOwned:row.listedOwned;
 if(n(item.qty)<=0||listed<=0)return "";
 const basis=["additional","includes_options"].includes(item.manualCountBasis)?item.manualCountBasis:"";
 return '<div class="g-water-item">'+
  '<p class="'+(basis?"g-fine":"g-pending")+'">'+esc(T.overlapDetected)+
   ': '+esc(T.overlapManual)+' '+fmt(n(item.qty))+
   ' / '+esc(T.overlapListed)+' '+fmt(listed)+'</p>'+
  '<label class="g-input">'+esc(T.overlapMeaning)+
   '<select data-manual-basis="'+row.item.id+'">'+
   '<option value="" '+(!basis?"selected":"")+'>'+esc(T.overlapUnreviewed)+'</option>'+
   '<option value="includes_options" '+(basis==="includes_options"?"selected":"")+'>'+esc(T.overlapIncludes)+'</option>'+
   '<option value="additional" '+(basis==="additional"?"selected":"")+'>'+esc(T.overlapAdditional)+'</option>'+
   '</select></label><p class="g-fine">'+esc(T.overlapExplanation)+'</p></div>';
}
function parentRows(a){
 const g=a.groups.find(x=>x.id===goal);
 return g.rows.map(row=>{
 const id=row.item.id,x=getBasic(id);
 const powerFields=energyParents.has(id)?energyFields(x,id,true,id==="powerbank"):"";
 const batteryDuration=state.powerOut&&["light","lantern","radio"].includes(id)?
  '<p class="g-fine">'+esc(T.batteryWorking)+': '+fmt(row.currentEffective)+
  ' / '+esc(T.batterySustained)+': '+fmt(row.sustainedEffective)+'</p>':"";
 return '<div class="g-parent"><div class="g-parent-head"><strong>'+esc(row.item.names[lang]||row.item.names.ja)+'</strong>'+
 '<span class="'+(row.missing?"g-danger":"g-ok")+'">'+esc(T.missing)+': '+fmt(row.missing)+unit(id)+'</span></div>'+meter(row)+
 '<div class="g-parent-fields"><label>'+esc(T.manual)+' · '+esc(id==="water"?T.litersTotal:id==="food"?T.mealPortions:id==="toilet"?T.toiletUses:T.quantity)+'<input type="number" min="0" max="10000000" inputmode="decimal" step="'+(id==="water"?"0.5":"1")+'" data-basic="'+id+'" value="'+fmt(n(x.qty))+'"></label>'+
 '<span>'+esc(T.need)+': '+fmt(row.required)+unit(id)+'</span></div>'+manualOverlapFields(row,x)+batteryDuration+powerFields+
 '<details data-parent="'+id+'" '+(openParents.has(id)?"open":"")+'><summary>'+esc(T.target)+' / '+esc(T.expiry)+'</summary>'+
 '<div class="g-parent-fields"><label>'+esc(T.target)+'<input type="number" min="0" data-target="'+id+'" value="'+(x.target==null?"":fmt(n(x.target)))+'" placeholder="'+fmt(row.autoTarget)+'"></label>'+
 '<label>'+esc(T.expiry)+'<input type="date" data-basic-expiry="'+id+'" value="'+esc(x.expiry||"")+'"></label></div></details></div>';
 }).join("");
}
function allowedTab(o){
 if(tab==="emergency")return o.kind==="dedicated";
 if(tab==="everyday")return o.kind==="normal";
 return o.kind==="improvised"||o.equivalence!=="full"||(goal==="food"&&o.prep==="heat"&&!!o.sourceUrl);
}
function renderChoices(a){
 const g=decision.groups.find(x=>x.id===goal);
 const arr=choices.filter(o=>g.members.includes(o.parent)&&allowedTab(o)&&(!search||Object.values(o.names).join(" ").toLowerCase().includes(search.toLowerCase())));
 if(!arr.length)return '<p class="g-fine">'+esc(T.noOptions)+'</p>';
 return arr.map(o=>{
 const v=getOption(o.id),bottleFactor=o.bottleLiters||0;
 const qLabel=bottleFactor?T.bottleCount:o.parent==="water"?T.litersTotal:o.parent==="food"?(o.role==="staple"?T.mealPortions:o.role==="protein"?T.proteinPortions:T.produceQuantity):o.parent==="toilet"?T.toiletUses:T.quantity;
 const calculatedBottles=bottleFactor?n(v.qty)/bottleFactor:0;
 const hasLegacyFraction=bottleFactor&&n(v.qty)>0&&!Number.isInteger(calculatedBottles);
 // Older saved litres may not represent whole sealed bottles; preserve the original litres.
 const qValue=bottleFactor?(hasLegacyFraction?"":fmt(calculatedBottles)):fmt(n(v.qty));
 const qAttr=bottleFactor?"data-option-bottles":"data-option-qty";
 const vWaterNote=bottleFactor?'<p class="g-fine">'+esc(T.bottleSubtotal)+': <strong>'+fmt(n(v.qty))+'L</strong>. '+esc(T.bottleNote)+' '+esc(T.bottleWhole)+(hasLegacyFraction?' '+esc(T.bottleLegacy):'')+'</p>':"";
 const isToiletParts=o.id==="toiletBags",energyOption=isEnergyOption(o);
 const energyReady=energyOption&&v.powerReadyConfirmed===true&&
   Number.isInteger(Number(v.powerReadyQty))&&Math.min(n(v.qty),n(v.powerReadyQty))>0;
 const kitReady=o.id!=="toiletKit"||(state.toiletSeatConfirmed&&state.toiletStorageConfirmed&&state.toiletDisposalConfirmed);
 const countable=o.equivalence==="full"&&kitReady&&(!state.noHeat||!["heat","verify"].includes(o.prep))&&(!state.powerOut||a.heatReady||o.prep!=="heat")&&(!o.requiresWater||(a.waterForPrep&&v.prepConfirmed===true&&n(v.prepWaterLiters)>0));
 const unexpired=!v.expiry||v.expiry>=today();
 const sustained=state.powerOut&&o.parent==="light"?
   a.batteryReview.devices.some(d=>d.source==="option"&&d.id===o.id&&d.sustained>0):true;
 const ready=isToiletParts?a.toiletReview.usableUses>0:
   (n(v.qty)>0&&unexpired&&countable&&(!energyOption||energyReady)&&sustained);
 const registered=isToiletParts?n(v.bagQty)+n(v.solidifierQty)+n(v.qty):n(v.qty);
 const itemStatus=registered===0?T.enterQuantity:!unexpired?T.expiredOption:o.equivalence!=="full"&&!isToiletParts?T.notEquivalent:ready?T.counted:T.notReady;
 const quantityFields=isToiletParts?
   '<div class="g-parent-fields"><label>'+esc(T.toiletBagsQty)+'<input type="number" min="0" max="10000000" step="1" inputmode="numeric" data-toilet-component="bagQty" value="'+fmt(n(v.bagQty))+'"></label>'+
   '<label>'+esc(T.toiletSolidifierQty)+'<input type="number" min="0" max="10000000" step="1" inputmode="numeric" data-toilet-component="solidifierQty" value="'+fmt(n(v.solidifierQty))+'"></label></div>'+
   '<div class="g-parent-fields"><label>'+esc(T.expiry)+'<input type="date" data-option-expiry="'+o.id+'" value="'+esc(v.expiry||"")+'"></label></div>'+
   (n(v.qty)>0?'<p class="g-fine">'+esc(T.toiletLegacy)+' <strong>'+fmt(n(v.qty))+'</strong></p>':"")+
   '<p class="g-fine">'+esc(T.toiletPairNoDouble)+'</p>':
   '<div class="g-parent-fields"><label>'+esc(qLabel)+'<input type="number" min="0" max="10000000" step="'+(bottleFactor?"1":o.parent==="water"?"0.5":"1")+'" inputmode="decimal" '+qAttr+'="'+o.id+'" value="'+qValue+'"></label>'+
   '<label>'+esc(T.expiry)+'<input type="date" data-option-expiry="'+o.id+'" value="'+esc(v.expiry||"")+'"></label></div>'+vWaterNote;
 const name=o.names[lang]||o.names.ja;
 const warning=(O.notes||{})[o.warning]||"";
 return '<details class="g-option" data-option="'+o.id+'" '+(openOptions.has(o.id)?"open":"")+'>'+
 '<summary><strong>'+esc(name)+'</strong><small>'+esc(O[o.kind]||o.kind)+'</small></summary>'+
 '<div class="g-option-body"><p>'+esc(warning)+'</p><p class="'+(ready?"g-ok":"g-pending")+'">'+esc(itemStatus)+'</p>'+
 (o.sourceUrl?'<a href="'+esc(o.sourceUrl)+'" target="_blank" rel="noopener">'+esc(T.official)+'</a>':"")+
 quantityFields+
 (energyOption?energyFields(v,o.id,false,o.id==="batteryBank"):"")+
 (o.parent==="food"&&o.prep==="heat"&&state.powerOut&&!state.noHeat?
   '<div class="g-water-item"><label class="g-input">'+esc(T.heatPerFood)+
   '<input type="number" min="0" max="10000000" step="1" inputmode="numeric" data-heat-sessions="'+o.id+'" value="'+fmt(n(v.heatSessions))+'"></label>'+
   '<label class="g-check"><input type="checkbox" data-heat-confirm="'+o.id+'" '+(v.heatConfirmed===true?"checked":"")+'>'+esc(T.heatPerFoodConfirm)+'</label>'+
   '<p class="g-fine">'+esc(T.heatPerFoodNote)+'</p></div>':"")+
 (o.requiresWater?'<div class="g-water-item"><label class="g-input">'+esc(T.prepPerFood)+'<input type="number" min="0" max="10000000" step="0.1" inputmode="decimal" data-prep-liters="'+o.id+'" value="'+fmt(n(v.prepWaterLiters))+'"></label>'+
 '<label class="g-check"><input type="checkbox" data-prep-confirm="'+o.id+'" '+(v.prepConfirmed===true?"checked":"")+'>'+esc(T.prepItemConfirm)+'</label>'+
 '<p class="g-fine">'+esc(T.prepNumberWarning)+'</p></div>':"")+
 (o.query?'<div class="g-aff" data-option-aff="'+o.id+'"></div>':"")+'</div></details>';
 }).join("");
}
function detailPage(a){
 const g=a.groups.find(x=>x.id===goal)||a.groups[0],r=g.primary;
 return '<div class="g-head"><button type="button" data-back class="g-link">← '+esc(T.back)+'</button>'+
 '<button type="button" data-shopping class="g-link">'+esc(T.shopping)+'</button></div>'+
 '<h2>'+esc(T.step3)+'</h2><h3>'+esc(T[goal])+'</h3>'+
 '<div class="g-detail-status"><strong>'+esc(T.missing)+': '+fmt(r.missing)+unit(r.item.id)+'</strong>'+meter(r)+'<p>'+count(r)+'</p></div>'+overlapWarning(a)+waterBudgetWarning(a)+
 '<section class="g-conditions"><h3>'+esc(T.conditionsTitle)+'</h3>'+conditions(a)+'</section>'+
 '<section><h3>'+esc(T.stock)+'</h3>'+parentRows(a)+'</section>'+
 '<section><h3>'+esc(T.step3)+'</h3><p class="g-fine">'+esc(T.disclosure)+'</p><div id="affiliate-inline" class="affiliate-inline"></div><div class="g-tabs">'+["emergency","everyday","fallback"].map(id=>
 '<button type="button" data-tab="'+id+'" class="'+(tab===id?"active":"")+'" aria-pressed="'+(tab===id)+'">'+esc(T[id])+'</button>').join("")+'</div>'+
 '<label class="g-search">'+esc(T.search)+'<input id="g-search" type="search" value="'+esc(search)+'" placeholder="'+esc(T.search)+'"></label>'+
 '<div id="g-choice-list">'+renderChoices(a)+'</div></section>'+
 '<button type="button" class="primary wide" data-shopping>'+esc(T.toShopping)+' →</button>';
}
// Shopping and export consume the SAME list: exact cell counts for every
// shortage in a verified shared-size battery budget, never a guessed "set".
function shoppingItems(a){
 const categoryRows=a.calc.items.filter(x=>x.missing>0);
 if(!state.powerOut)return categoryRows;
 const typed=(a.batteryReview.shoppingShortages||[]).map(r=>({
  item:{id:"battery:"+r.type,names:{[lang]:T.batteryShopItem+" ("+r.type+")"},search:""},
  missing:r.missing,batteryType:r.type
 }));
 // Preserve an independently customized generic-set goal and put it
 // alongside the typed deficits within the eight default visible items.
 // It remains a distinct unit and never covers missing AA/AAA cells.
 const explicitSet=categoryRows.filter(r=>r.item.id==="batteries"&&r.hasCustomTarget);
 return typed.concat(explicitSet,categoryRows.filter(r=>!explicitSet.includes(r)));
}
function batteryShoppingNotice(a){
 if(!state.powerOut)return "";
 return (a.batteryReview.typedPlan?'<p class="g-fine">'+esc(T.batteryShoppingMeasured)+'</p>':"")+
  (a.batteryReview.uncheckedDevices?'<p class="g-pending">'+esc(T.batteryShoppingUnchecked)+
   ': '+fmt(a.batteryReview.uncheckedDevices)+'</p>':"");
}
function shoppingRows(a){
 const arr=shoppingItems(a);
 // Never include undisplayed items in copy/CSV/print by default.
 if(selected===null)selected=new Set(arr.slice(0,8).map(x=>x.item.id));
 return (showAll?arr:arr.slice(0,8)).map(row=>{
 const id=row.item.id,check=selected.has(id);
 return '<div class="g-shop-row"><label class="g-shop-check"><input type="checkbox" data-shop="'+id+'" '+(check?"checked":"")+'>'+
 '<span><strong>'+esc(row.item.names[lang]||row.item.names.ja)+'</strong><small>'+esc(T.missing)+': '+fmt(row.missing)+unit(id)+'</small>'+
 (id==="water"&&row.allocationExtraRequired>0?'<small>'+esc(T.drinkShoppingReason)+': +'+fmt(row.allocationExtraRequired)+'L</small>':"")+
 (id==="batteries"?'<small>'+esc(T.batteryGenericSetNote)+'</small>':"")+'</span></label>'+
 (check&&row.item.search?'<div class="g-aff" data-category-aff="'+id+'"></div>':"")+'</div>';
 }).join("");
}
function shoppingPage(a){
 const missing=shoppingItems(a);
 return '<div class="g-head"><button type="button" data-back class="g-link">← '+esc(T.back)+'</button>'+
 '<button data-edit type="button" class="g-link">'+esc(T.edit)+'</button></div><h2>'+esc(T.step4)+'</h2>'+
 '<p class="g-lead">'+esc(T.shopHelp)+'</p>'+overlapWarning(a)+waterBudgetWarning(a)+batteryShoppingNotice(a)+
 '<p class="g-fine">'+esc(T.shopShowing)+'</p>'+
 '<p id="g-shop-selected" class="g-shop-counter">'+esc(T.shopSelected)+': <strong>'+(selected===null?Math.min(missing.length,8):missing.filter(x=>selected.has(x.item.id)).length)+'</strong></p>'+
 '<p class="g-fine">'+esc(T.disclosure)+'</p>'+
 '<div id="affiliate-inline" class="affiliate-inline"></div>'+
 '<div class="g-shopping">'+(missing.length?shoppingRows(a):'<p>'+esc(T.noShortage)+'</p>')+'</div>'+
 (missing.length>8?'<button class="g-link" type="button" data-more>'+esc(showAll?T.shopCollapse:T.allItems)+'</button>':"")+
 '<div id="g-print-list" class="g-print-list" aria-hidden="true"></div>'+
 '<div class="g-actions"><button id="copyList" type="button">'+esc(T.copy)+'</button><button id="exportCsv" type="button">'+esc(T.csv)+'</button>'+
 '<button id="printList" type="button">'+esc(T.print)+'</button><button id="reset" type="button">'+esc(T.reset)+'</button></div>';
}
function mountAffiliate(){
 if(!affiliate)return;
 result.querySelectorAll("[data-option-aff]").forEach(el=>{
 const id=el.dataset.optionAff;
 affiliate.mount({container:el,target:"option_"+id,label:T.buy,placement:"specific_options",destinationKey:"option_"+id,affiliateId:"bichiku_option_"+id,language:lang});
 });
 result.querySelectorAll("[data-category-aff]").forEach(el=>{
 const id=el.dataset.categoryAff;
 affiliate.mount({container:el,target:id,label:T.buy,placement:"shortage_list",destinationKey:id,affiliateId:"bichiku_"+id,language:lang});
 });
 const notice=result.querySelector("#affiliate-inline");
 if(notice)affiliate.renderDisclosure(notice,{includeEnglish:lang==="en"});
 if(!impression){
  const count=result.querySelectorAll(".g-aff a").length;
  if(count){affiliate.trackImpression({placement:stage==="shopping"?"shortage_list":"specific_options",offerCount:count,language:lang});impression=true}
 }
}
function render(scroll){
 document.body.dataset.stage=stage;renderSetup();
 if(stage==="setup"){result.hidden=true;return}
 const a=calc();result.hidden=false;
 result.innerHTML=stage==="results"?resultsPage(a):stage==="detail"?detailPage(a):shoppingPage(a);
 mountAffiliate();
 if(scroll)result.scrollIntoView({behavior:"smooth",block:"start"});
}
function changeStage(next,id){
 preserveOpen();
 if(id){goal=id;tab="emergency";search="";openOptions.clear()}
 stage=next;render(true);
}
setup.addEventListener("click",e=>{
 const advanced=setup.querySelector("details.advanced");if(advanced)advancedOpen=advanced.open;
 const inc=e.target.closest("[data-inc]");
 if(inc){
  const id=inc.dataset.field,previous=n(state[id]);
  state[id]=Math.max(id==="adults"?1:0,Math.min(["adults","children"].includes(id)?15:10,previous+Number(inc.dataset.inc)));
  if(n(state[id])!==previous&&["adults","children","infants","pets"].includes(id))revokeDrinkingApproval();
  save();renderSetup();return;
 }
 const select=e.target.closest("[data-select]");
 if(select){
  const id=select.dataset.select,value=id==="days"?Number(select.dataset.value):select.dataset.value;
  if(id==="days"&&state.days!==value)revokeDrinkingApproval();
  state[id]=value;save();renderSetup();return;
 }
 if(e.target.closest("#calculate")){selected=null;showAll=false;changeStage("results")}
});
setup.addEventListener("change",e=>{if(e.target.dataset.condition){
 const id=e.target.dataset.condition,next=e.target.checked;
 if(id==="waterOut"&&state.waterOut!==next){
  revokeDrinkingApproval();
  state.safeWaterConfirmed=false;
 }
 state[id]=next;
 if(id==="powerOut"||id==="noHeat")state.offGridHeatConfirmed=false;
 save();
}});
result.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.hasAttribute("data-edit")){stage="setup";render();setup.scrollIntoView({behavior:"smooth",block:"start"});return}
 if(b.dataset.goal){changeStage("detail",b.dataset.goal);return}
 if(b.hasAttribute("data-back")){changeStage("results");return}
 if(b.hasAttribute("data-shopping")){changeStage("shopping");return}
 if(b.dataset.tab){preserveOpen();tab=b.dataset.tab;search="";render();return}
 if(b.hasAttribute("data-more")){showAll=!showAll;render();return}
 if(b.id==="reset"){if(confirm(T.resetConfirm)){try{localStorage.removeItem("bichiku-check-v1")}catch(_){}state=Object.assign({},defaults);state.stocks={};state.variants={};selected=null;stage="setup";render();setup.scrollIntoView({behavior:"smooth",block:"start"})}return}
 if(["copyList","exportCsv","printList"].includes(b.id)){
  const rows=shoppingItems(calc()).filter(x=>selected&&selected.has(x.item.id));
  if(b.id==="printList"){
   const preview=result.querySelector("#g-print-list");
   if(preview)preview.innerHTML='<h2>'+esc(T.printHeading)+'</h2><ul>'+rows.map(x=>'<li>'+esc(x.item.names[lang]||x.item.names.ja)+' — '+fmt(x.missing)+unit(x.item.id)+'</li>').join("")+'</ul>';
   window.print();return
  }
  if(b.id==="copyList"){
   const content=T.step4+"\n"+rows.map(x=>(x.item.names[lang]||x.item.names.ja)+" : "+fmt(x.missing)+unit(x.item.id)).join("\n");
   if(navigator.clipboard)navigator.clipboard.writeText(content).then(()=>{b.textContent=L.copied}).catch(()=>{});
   return;
  }
  const csv="\ufeff"+[["name","missing","unit"],...rows.map(x=>[x.item.names[lang]||x.item.names.ja,x.missing,unit(x.item.id)])].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="bichiku-shopping.csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
});
result.addEventListener("input",e=>{
 if(e.target.id==="g-search"){search=e.target.value;preserveOpen();const el=result.querySelector("#g-choice-list");if(el){el.innerHTML=renderChoices(calc());mountAffiliate()}}
});
result.addEventListener("change",e=>{
 const t=e.target;if(t.dataset.shop){if(!selected)selected=new Set();if(t.checked)selected.add(t.dataset.shop);else selected.delete(t.dataset.shop);render();return}
 if(t.dataset.setting){state[t.dataset.setting]=t.type==="checkbox"?t.checked:n(t.value);save();preserveOpen();render();return}
 if(t.dataset.drinkReserve||t.dataset.drinkConfirm){
  const item=Object.assign({},getBasic("water"));
  if(t.dataset.drinkReserve){
   if(!t.checkValidity()||t.value.trim()===""){t.reportValidity();return}
   item.drinkingReserveLiters=n(t.value);item.drinkingReserveConfirmed=false;
  }else{
   item.drinkingReserveConfirmed=t.checked;
   item.drinkingReservePlanDays=state.mode==="go"?1:n(state.days);
   item.drinkingReserveHousehold=decision.drinkingHouseholdKey(state);
  }
  state.stocks[key("water")]=item;save();preserveOpen();render();return;
 }
 if(t.dataset.manualBasis){
  const id=t.dataset.manualBasis;
  if(!catalog.some(i=>i.id===id)||!["","additional","includes_options"].includes(t.value))return;
  const item=Object.assign({},getBasic(id),{manualCountBasis:t.value});
  state.stocks[key(id)]=item;save();preserveOpen();render();return;
 }
 if(t.dataset.batteryStock){
  const type=t.dataset.batteryStock;
  if(!decision.batteryTypes.includes(type)||!t.checkValidity()||!Number.isInteger(Number(t.value))){t.reportValidity();return}
  const item=Object.assign({},getBasic("batteries"));
  item.batteryCells=Object.assign({},item.batteryCells||{},{[type]:n(t.value)});
  state.stocks[key("batteries")]=item;save();preserveOpen();render();return;
 }
 const batteryTarget=t.dataset.batteryType||t.dataset.batteryCells||t.dataset.batteryChanges||t.dataset.batteryReserve||t.dataset.batteryConfirm;
 if(batteryTarget){
  const [kind,id]=batteryTarget.split(":");
  const valid=(kind==="basic"&&["light","lantern","radio"].includes(id))||
   (kind==="option"&&choices.some(o=>o.id===id&&o.parent==="light"&&o.equivalence==="full"));
  if(!valid)return;
  const item=Object.assign({},kind==="basic"?getBasic(id):getOption(id));
  if(t.dataset.batteryType){
   if(!["",...decision.batteryTypes,"rechargeable"].includes(t.value))return;
   item.batteryType=t.value;item.batteryPlanConfirmed=false;
  }
  if(t.dataset.batteryCells||t.dataset.batteryChanges){
   if(!t.checkValidity()||!Number.isInteger(Number(t.value))){t.reportValidity();return}
   if(t.dataset.batteryCells)item.cellsPerChange=n(t.value);
   if(t.dataset.batteryChanges)item.plannedChanges=n(t.value);
   item.batteryPlanConfirmed=false;
  }
  if(t.dataset.batteryReserve){
   if(t.value.trim()==="")delete item.batteryReservedUnits;
   else{
    if(!t.checkValidity()||!Number.isInteger(Number(t.value))){t.reportValidity();return}
    item.batteryReservedUnits=n(t.value);
   }
   item.batteryPlanConfirmed=false;
  }
  if(t.dataset.batteryConfirm){
   item.batteryPlanConfirmed=t.checked;
   item.batteryPlanDays=state.mode==="go"?1:n(state.days);
  }
  if(kind==="basic")state.stocks[key(id)]=item;else state.variants[key(id)]=item;
  save();preserveOpen();render();return;
 }
 const energyBasic=t.dataset.energyBasicReady||t.dataset.energyBasicConfirm;
 if(energyBasic&&energyParents.has(energyBasic)){
  const item=Object.assign({},getBasic(energyBasic));
  if(t.dataset.energyBasicReady){
   if(!t.checkValidity()||!Number.isInteger(Number(t.value))){t.reportValidity();return}
   item.powerReadyQty=n(t.value);item.powerReadyConfirmed=false;
  }else item.powerReadyConfirmed=t.checked;
  item.batteryPlanConfirmed=false;
  state.stocks[key(energyBasic)]=item;save();preserveOpen();render();return;
 }
 if(t.dataset.heatStock){
  const field=t.dataset.heatStock;
  if(!["stoveCount","gasCount","gasCapacity"].includes(field)||!t.checkValidity()||
    !Number.isInteger(Number(t.value))){t.reportValidity();return}
  const id=field==="stoveCount"?"stove":"gas";
  const item=Object.assign({},getBasic(id));
  if(field==="gasCapacity"){item.heatCapacityUses=n(t.value);item.heatFuelCompatibleConfirmed=false}
  else if(field==="stoveCount"){item.qty=n(t.value);item.heatEquipmentConfirmed=false}
  else {item.qty=n(t.value);item.heatCapacityUses=0;item.heatFuelCompatibleConfirmed=false}
  state.stocks[key(id)]=item;save();preserveOpen();render();return;
 }
 if(t.dataset.heatCheck){
  const id=t.dataset.heatCheck==="stove"?"stove":t.dataset.heatCheck==="gas"?"gas":null;
  if(!id)return;
  const item=Object.assign({},getBasic(id));
  if(id==="stove")item.heatEquipmentConfirmed=t.checked;
  else item.heatFuelCompatibleConfirmed=t.checked;
  state.stocks[key(id)]=item;save();preserveOpen();render();return;
 }
 if(t.dataset.toiletComponent){
  const field=t.dataset.toiletComponent;
  if(!["bagQty","solidifierQty"].includes(field)||!t.checkValidity()||!Number.isInteger(Number(t.value))){t.reportValidity();return}
  const item=Object.assign({},getOption("toiletBags"));
  item[field]=n(t.value);
  state.variants[key("toiletBags")]=item;
  const parent=Object.assign({},getBasic("toilet"));
  if(n(parent.qty)>0){parent.manualCountBasis="";state.stocks[key("toilet")]=parent}
  save();preserveOpen();render();return;
 }
 const id=t.dataset.basic||t.dataset.target||t.dataset.basicExpiry;
 if(id){const item=Object.assign({},getBasic(id));
  if(t.dataset.basic){
    if((["gas","stove"].includes(id)||energyParents.has(id))&&
       (!t.checkValidity()||!Number.isInteger(Number(t.value)))){t.reportValidity();return}
    const oldQty=n(item.qty),newQty=n(t.value);
    item.qty=newQty;
    if(newQty!==oldQty)item.manualCountBasis="";
    if(newQty!==oldQty&&id==="water")item.drinkingReserveConfirmed=false;
    if(newQty!==oldQty&&id==="gas"){item.heatCapacityUses=0;item.heatFuelCompatibleConfirmed=false}
    if(newQty!==oldQty&&id==="stove")item.heatEquipmentConfirmed=false;
    if(newQty!==oldQty&&energyParents.has(id)){item.powerReadyConfirmed=false;item.batteryPlanConfirmed=false}
  }
  if(t.dataset.target){if(t.value==="")delete item.target;else item.target=n(t.value)}
  if(t.dataset.basicExpiry){item.expiry=t.value;item.manualCountBasis="";
    if(id==="water")item.drinkingReserveConfirmed=false;
    if(energyParents.has(id)){item.powerReadyConfirmed=false;item.batteryPlanConfirmed=false}}
  state.stocks[key(id)]=item;save();preserveOpen();render();return}
 const optionId=t.dataset.optionQty||t.dataset.optionBottles||t.dataset.optionExpiry||t.dataset.prepLiters||t.dataset.prepConfirm||
   t.dataset.heatSessions||t.dataset.heatConfirm||t.dataset.energyOptionReady||t.dataset.energyOptionConfirm;
 if(optionId){
  const item=Object.assign({},getOption(optionId));
  const energyOption=choices.some(o=>o.id===optionId&&isEnergyOption(o));
  if(t.dataset.optionQty&&energyOption&&(!t.checkValidity()||!Number.isInteger(Number(t.value)))){t.reportValidity();return}
  if(t.dataset.optionQty){
    item.qty=n(t.value);item.prepConfirmed=false;
    if(choices.some(o=>o.id===optionId&&o.parent==="food"&&o.prep==="heat"))item.heatConfirmed=false;
    if(energyOption){item.powerReadyConfirmed=false;item.batteryPlanConfirmed=false}
  }
  if(t.dataset.optionBottles){
    // step=1 is not enforced on change events; reject fractional bottle counts.
    if(!t.checkValidity()||!Number.isInteger(Number(t.value))){t.reportValidity();return}
    const option=choices.find(o=>o.id===optionId),factor=option&&option.bottleLiters;
    if(!factor)return;
    item.qty=Math.round(n(t.value)*factor*100)/100;
  }
  if(t.dataset.optionExpiry){
    item.expiry=t.value;
    if(energyOption){item.powerReadyConfirmed=false;item.batteryPlanConfirmed=false}
  }
  if(t.dataset.prepLiters){item.prepWaterLiters=n(t.value);item.prepConfirmed=false}
  if(t.dataset.prepConfirm)item.prepConfirmed=t.checked;
  if(t.dataset.heatSessions){
    if(!t.checkValidity()||!Number.isInteger(Number(t.value))){t.reportValidity();return}
    item.heatSessions=n(t.value);item.heatConfirmed=false;
  }
  if(t.dataset.heatConfirm)item.heatConfirmed=t.checked;
  if(t.dataset.energyOptionReady){
    if(!energyOption||!t.checkValidity()||!Number.isInteger(Number(t.value))){t.reportValidity();return}
    item.powerReadyQty=n(t.value);item.powerReadyConfirmed=false;item.batteryPlanConfirmed=false;
  }
  if(t.dataset.energyOptionConfirm&&energyOption){
   item.powerReadyConfirmed=t.checked;item.batteryPlanConfirmed=false;
  }
  state.variants[key(optionId)]=item;
  if(t.dataset.optionQty||t.dataset.optionBottles||t.dataset.optionExpiry){
   const o=choices.find(x=>x.id===optionId);
   if(o&&n(getBasic(o.parent).qty)>0){
    const parent=Object.assign({},getBasic(o.parent),{manualCountBasis:""});
    if(o.parent==="water")parent.drinkingReserveConfirmed=false;
    state.stocks[key(o.parent)]=parent;
   }
  }
  if(t.dataset.optionQty||t.dataset.optionBottles||t.dataset.optionExpiry){
   const changedOption=choices.find(o=>o.id===optionId);
   if(changedOption&&changedOption.parent==="water"){
    const water=Object.assign({},getBasic("water"),{drinkingReserveConfirmed:false});
    state.stocks[key("water")]=water;
   }
  }
  save();preserveOpen();render()
 }
});
const ref=document.getElementById("references");
if(ref)ref.innerHTML='<h2>'+esc(L.references)+'</h2><p class="g-fine">'+esc(T.advice)+'</p><ul>'+
 '<li><a href="https://www.bousai.go.jp/kyoiku/hokenkyousai/check.html" target="_blank" rel="noopener">'+esc(L.source1)+'</a></li>'+
 '<li><a href="https://www.gov-online.go.jp/tokusyu/bousai/preparation.html" target="_blank" rel="noopener">'+esc(L.source2)+'</a></li></ul>';
const donate=document.getElementById("donate");
if(donate)donate.innerHTML='<p>'+esc(L.donate)+'</p><div class="donate-links"><a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">OFUSE</a><a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">Ko-fi</a></div>';
render();
})();