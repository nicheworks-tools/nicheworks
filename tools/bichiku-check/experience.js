/* Guided BichikuCheck: household -> goals -> concrete choices -> shopping */
(function(){
"use strict";
const lang=document.body.getAttribute("data-lang")||"ja",L=window.BICHIKU_I18N[lang],T=window.BICHIKU_GUIDED_TEXT[lang];
const O=window.BICHIKU_OPTIONS_UI[lang],catalog=window.BICHIKU_CATALOG,choices=window.BICHIKU_OPTIONS;
const decision=window.BichikuDecision,affiliate=window.NWAmazonAffiliate;
const setup=document.getElementById("setup"),result=document.getElementById("results");
const defaults={mode:"home",adults:1,children:0,infants:0,pets:0,days:7,powerOut:false,waterOut:false,noHeat:false,offGridHeatConfirmed:false,diet:false,safeWaterConfirmed:false,prepWaterLiters:0,toiletAssemblyConfirmed:false,stocks:{},variants:{}};
const key=id=>state.mode+":"+id,esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n=x=>Number.isFinite(Number(x))?Math.min(10000000,Math.max(0,Number(x))):0;
const fmt=x=>Number.isInteger(x)?String(x):String(Math.round(x*100)/100);
const unit=id=>id==="water"?"L":id==="food"?T.unitMeals:id==="toilet"?T.unitUses:"";
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
let state=Object.assign({},defaults),stage="setup",goal="food",tab="emergency",search="",showAll=false;
let openOptions=new Set(),openParents=new Set(),selected=null,impression=false,advancedOpen=false;
try{const saved=JSON.parse(localStorage.getItem("bichiku-check-v1")||"null");if(saved&&typeof saved==="object"&&!Array.isArray(saved))state=Object.assign({},defaults,saved)}catch(_){}
if(!state.stocks||Array.isArray(state.stocks))state.stocks={};
if(!state.variants||Array.isArray(state.variants))state.variants={};
const save=()=>{try{localStorage.setItem("bichiku-check-v1",JSON.stringify(state))}catch(_){}};
const calc=()=>decision.assessment(catalog,choices,state,today());
const getBasic=id=>state.stocks[key(id)]||{},getOption=id=>state.variants[key(id)]||{};
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
function resultsPage(a){
 const total=a.groups.reduce((sum,g)=>sum+g.missingCategories,0);
 return '<div class="g-head"><h2>'+esc(T.step2)+'</h2><button type="button" data-edit class="g-link">'+esc(T.edit)+'</button></div>'+
 '<p class="g-lead">'+esc(T.guide)+'</p><div class="g-total"><strong>'+total+'</strong><span>'+esc(T.missingItems)+'</span></div>'+
 '<div class="g-goals">'+groupCards(a)+'</div><button type="button" class="primary wide" data-shopping>'+esc(T.toShopping)+' →</button>';
}
function preserveOpen(){
 result.querySelectorAll("details[data-option]").forEach(el=>{if(el.open)openOptions.add(el.dataset.option);else openOptions.delete(el.dataset.option)});
 result.querySelectorAll("details[data-parent]").forEach(el=>{if(el.open)openParents.add(el.dataset.parent);else openParents.delete(el.dataset.parent)});
}
function foodGroupsHtml(a){
 const groups=a.foodGroups||[];
 return '<div class="g-food-review" aria-label="'+esc(T.foodGroupTitle)+'">'+
 '<h4>'+esc(T.foodGroupTitle)+'</h4>'+
 groups.map(g=>{
   const status=g.usableKinds>0?T.groupListed:g.recordedKinds>0?T.groupReview:T.groupEmpty;
   return '<div class="g-food-role"><strong>'+esc(T["group"+g.role.charAt(0).toUpperCase()+g.role.slice(1)])+'</strong>'+
    '<span>'+esc(status)+(g.usableKinds>0?' · '+g.usableKinds+' '+esc(T.groupKinds):"")+'</span></div>';
 }).join("")+
 '<p class="g-fine">'+esc(T.groupCaution)+'</p>'+
 '<a href="https://www.maff.go.jp/j/zyukyu/foodstock/chapter03.html" target="_blank" rel="noopener">'+esc(T.groupSource)+'</a>'+
 '</div>';
}
function conditions(a){
 if(goal==="food")return '<p>'+esc(a.waterConflict?T.waterShort:T.foodRequires)+'</p>'+
 '<label class="g-check"><input type="checkbox" data-setting="safeWaterConfirmed" '+(state.safeWaterConfirmed?"checked":"")+'>'+esc(T.waterConfirm)+'</label>'+
 (state.powerOut&&!state.noHeat?'<p class="g-pending">'+esc(T.heatUnconfirmed)+'</p><label class="g-check"><input type="checkbox" data-setting="offGridHeatConfirmed" '+(state.offGridHeatConfirmed?"checked":"")+'>'+esc(T.heatConfirm)+'</label><p class="g-fine">'+esc(T.heatSafety)+' <a href="https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_063/" rel="noopener" target="_blank">'+esc(T.heatHelp)+'</a></p>':"")+
 '<p class="g-fine">'+esc(T.prepExplanation)+'</p>'+
 '<p class="g-water-summary">'+esc(T.prepAllocated)+': <strong>'+fmt(a.waterAllocation)+'L</strong></p>'+
 '<p class="g-water-summary">'+esc(T.waterRemaining)+': <strong>'+fmt(a.waterRemainingAfterPrep)+'L</strong></p>'+
 (a.uncheckedFoods.length?'<p class="g-fine">'+esc(T.prepUnchecked)+'</p>':"")+foodGroupsHtml(a);
 if(goal==="toilet")return '<p>'+esc(T.toiletExplanation)+'</p>'+
 '<label class="g-check"><input type="checkbox" data-setting="toiletAssemblyConfirmed" '+(state.toiletAssemblyConfirmed?"checked":"")+'>'+esc(T.toiletConfirm)+'</label>';
 if(goal==="warmth")return '<p>'+esc(T.floorExplanation)+'</p><div class="g-layers">'+["sleepPad","blanket"].map(id=>{
  const x=a.calc.items.find(r=>r.item.id===id);return x?'<div><b>'+esc(x.item.names[lang])+'</b><span>'+esc(T.missing)+': '+fmt(x.missing)+'</span></div>':"";
 }).join("")+'</div>';
 if(goal==="water")return '<p>'+esc(T.waterHint)+'</p><p>'+esc(T.waterRemaining)+': '+fmt(a.waterRemainingAfterPrep)+'L</p>';
 return '<p>'+esc(T[goal+"Hint"]||T.otherConditions)+'</p>';
}
function parentRows(a){
 const g=a.groups.find(x=>x.id===goal);
 return g.rows.map(row=>{
 const id=row.item.id,x=getBasic(id);
 return '<div class="g-parent"><div class="g-parent-head"><strong>'+esc(row.item.names[lang]||row.item.names.ja)+'</strong>'+
 '<span class="'+(row.missing?"g-danger":"g-ok")+'">'+esc(T.missing)+': '+fmt(row.missing)+unit(id)+'</span></div>'+meter(row)+
 '<div class="g-parent-fields"><label>'+esc(T.manual)+' · '+esc(id==="water"?T.litersTotal:id==="food"?T.mealPortions:id==="toilet"?T.toiletUses:T.quantity)+'<input type="number" min="0" max="10000000" inputmode="decimal" step="'+(id==="water"?"0.5":"1")+'" data-basic="'+id+'" value="'+fmt(n(x.qty))+'"></label>'+
 '<span>'+esc(T.need)+': '+fmt(row.required)+unit(id)+'</span></div>'+
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
 const qLabel=bottleFactor?T.bottleCount:o.parent==="water"?T.litersTotal:o.parent==="food"?T.mealPortions:o.parent==="toilet"?T.toiletUses:T.quantity;
 const qValue=bottleFactor?fmt(n(v.qty)/bottleFactor):fmt(n(v.qty));
 const qAttr=bottleFactor?"data-option-bottles":"data-option-qty";
 const vWaterNote=bottleFactor?'<p class="g-fine">'+esc(T.bottleSubtotal)+': <strong>'+fmt(n(v.qty))+'L</strong>. '+esc(T.bottleNote)+'</p>':"";
 const countable=o.equivalence==="full"&&(!state.noHeat||!["heat","verify"].includes(o.prep))&&(!state.powerOut||state.offGridHeatConfirmed||o.prep!=="heat")&&(!o.requiresWater||(a.waterForPrep&&v.prepConfirmed===true&&n(v.prepWaterLiters)>0));
 const unexpired=!v.expiry||v.expiry>=today();
 const ready=n(v.qty)>0&&unexpired&&(countable||(o.id==="toiletBags"&&state.toiletAssemblyConfirmed));
 const itemStatus=n(v.qty)===0?T.enterQuantity:!unexpired?T.expiredOption:o.equivalence!=="full"&&o.id!=="toiletBags"?T.notEquivalent:ready?T.counted:T.notReady;
 const name=o.names[lang]||o.names.ja;
 const warning=(O.notes||{})[o.warning]||"";
 return '<details class="g-option" data-option="'+o.id+'" '+(openOptions.has(o.id)?"open":"")+'>'+
 '<summary><strong>'+esc(name)+'</strong><small>'+esc(O[o.kind]||o.kind)+'</small></summary>'+
 '<div class="g-option-body"><p>'+esc(warning)+'</p><p class="'+(ready?"g-ok":"g-pending")+'">'+esc(itemStatus)+'</p>'+
 (o.sourceUrl?'<a href="'+esc(o.sourceUrl)+'" target="_blank" rel="noopener">'+esc(T.official)+'</a>':"")+
 '<div class="g-parent-fields"><label>'+esc(qLabel)+'<input type="number" min="0" max="10000000" step="'+(bottleFactor?"1":o.parent==="water"?"0.5":"1")+'" inputmode="decimal" '+qAttr+'="'+o.id+'" value="'+qValue+'"></label>'+
 '<label>'+esc(T.expiry)+'<input type="date" data-option-expiry="'+o.id+'" value="'+esc(v.expiry||"")+'"></label></div>'+vWaterNote+
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
 '<div class="g-detail-status"><strong>'+esc(T.missing)+': '+fmt(r.missing)+unit(r.item.id)+'</strong>'+meter(r)+'<p>'+count(r)+'</p></div>'+
 '<section class="g-conditions"><h3>'+esc(T.conditionsTitle)+'</h3>'+conditions(a)+'</section>'+
 '<section><h3>'+esc(T.stock)+'</h3>'+parentRows(a)+'</section>'+
 '<section><h3>'+esc(T.step3)+'</h3><p class="g-fine">'+esc(T.disclosure)+'</p><div id="affiliate-inline" class="affiliate-inline"></div><div class="g-tabs">'+["emergency","everyday","fallback"].map(id=>
 '<button type="button" data-tab="'+id+'" class="'+(tab===id?"active":"")+'" aria-pressed="'+(tab===id)+'">'+esc(T[id])+'</button>').join("")+'</div>'+
 '<label class="g-search">'+esc(T.search)+'<input id="g-search" type="search" value="'+esc(search)+'" placeholder="'+esc(T.search)+'"></label>'+
 '<div id="g-choice-list">'+renderChoices(a)+'</div></section>'+
 '<button type="button" class="primary wide" data-shopping>'+esc(T.toShopping)+' →</button>';
}
function shoppingRows(a){
 const arr=a.calc.items.filter(x=>x.missing>0);
 // Never include undisplayed items in copy/CSV/print by default.
 if(selected===null)selected=new Set(arr.slice(0,8).map(x=>x.item.id));
 return (showAll?arr:arr.slice(0,8)).map(row=>{
 const id=row.item.id,check=selected.has(id);
 return '<div class="g-shop-row"><label class="g-shop-check"><input type="checkbox" data-shop="'+id+'" '+(check?"checked":"")+'>'+
 '<span><strong>'+esc(row.item.names[lang]||row.item.names.ja)+'</strong><small>'+esc(T.missing)+': '+fmt(row.missing)+unit(id)+'</small></span></label>'+
 (check&&row.item.search?'<div class="g-aff" data-category-aff="'+id+'"></div>':"")+'</div>';
 }).join("");
}
function shoppingPage(a){
 const missing=a.calc.items.filter(x=>x.missing>0);
 return '<div class="g-head"><button type="button" data-back class="g-link">← '+esc(T.back)+'</button>'+
 '<button data-edit type="button" class="g-link">'+esc(T.edit)+'</button></div><h2>'+esc(T.step4)+'</h2>'+
 '<p class="g-lead">'+esc(T.shopHelp)+'</p>'+
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
 if(inc){const id=inc.dataset.field;state[id]=Math.max(id==="adults"?1:0,Math.min(["adults","children"].includes(id)?15:10,n(state[id])+Number(inc.dataset.inc)));save();renderSetup();return}
 const select=e.target.closest("[data-select]");
 if(select){state[select.dataset.select]=select.dataset.select==="days"?Number(select.dataset.value):select.dataset.value;save();renderSetup();return}
 if(e.target.closest("#calculate")){selected=null;showAll=false;changeStage("results")}
});
setup.addEventListener("change",e=>{if(e.target.dataset.condition){const id=e.target.dataset.condition;state[id]=e.target.checked;if(id==="powerOut"||id==="noHeat")state.offGridHeatConfirmed=false;save()}});
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
  const rows=calc().calc.items.filter(x=>x.missing>0&&selected&&selected.has(x.item.id));
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
 const id=t.dataset.basic||t.dataset.target||t.dataset.basicExpiry;
 if(id){const item=Object.assign({},getBasic(id));if(t.dataset.basic)item.qty=n(t.value);
  if(t.dataset.target){if(t.value==="")delete item.target;else item.target=n(t.value)}
  if(t.dataset.basicExpiry)item.expiry=t.value;state.stocks[key(id)]=item;save();preserveOpen();render();return}
 const optionId=t.dataset.optionQty||t.dataset.optionBottles||t.dataset.optionExpiry||t.dataset.prepLiters||t.dataset.prepConfirm;
 if(optionId){
  const item=Object.assign({},getOption(optionId));
  if(t.dataset.optionQty){item.qty=n(t.value);item.prepConfirmed=false}
  if(t.dataset.optionBottles){
    const option=choices.find(o=>o.id===optionId),factor=option&&option.bottleLiters;
    if(!factor)return;
    item.qty=Math.round(n(t.value)*factor*100)/100;
  }
  if(t.dataset.optionExpiry)item.expiry=t.value;
  if(t.dataset.prepLiters){item.prepWaterLiters=n(t.value);item.prepConfirmed=false}
  if(t.dataset.prepConfirm)item.prepConfirmed=t.checked;
  state.variants[key(optionId)]=item;save();preserveOpen();render()
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