/* Progressive option explorer. It does not make unverified substitute safety claims. */
(function(){
"use strict";
const lang=document.body.getAttribute("data-lang")||"ja";
const ui=(window.BICHIKU_OPTIONS_UI||{})[lang]||window.BICHIKU_OPTIONS_UI.ja;
const options=window.BICHIKU_OPTIONS||[];
const catalog=window.BICHIKU_CATALOG||[];
const root=document.getElementById("specific-options");
if(!ui||!root||!options.length)return;

let settings,update;
let group="food",query="",expanded=new Set();
const panels=[
 {id:"food",parents:["food","snack"]},
 {id:"warmth",parents:["sleepPad","blanket"]},
 {id:"toilet",parents:["toilet","trashBags","wetWipes","sanitizer"]},
 {id:"water",parents:["water","waterBag"]},
 {id:"power",parents:["light","powerbank","utensils"]},
 {id:"other",parents:["raincoat"]}
];
const priorities=["staple","protein","vegetable","fruit","snack","floor","warmth","sanitation","hydration","light","power","equipment","hygiene","shelter"];
const findParent=id=>catalog.find(x=>x.id===id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const today=()=>{let d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const unit=(option)=>{
 if(option.parent==="water")return "L";
 if(option.parent==="food")return ({ja:"食分",en:"portions",zh:"份",vi:"phần"})[lang];
 if(option.parent==="toilet")return ({ja:"回",en:"uses",zh:"次",vi:"lượt"})[lang];
 return ({ja:"人分・セット",en:"people/sets",zh:"人份／套",vi:"người/bộ"})[lang];
};
const kindLabel=o=>ui[o.kind]||o.kind;
const prepLabel=o=>({ready:ui.ready,water:ui.waterNeed,heat:ui.heat,verify:ui.verify,none:ui.none})[o.prep]||ui.verify;
function classify(o){return panels.find(p=>p.parents.includes(o.parent))?.id||"other";}
function canCount(o){
 const parent=findParent(o.parent);
 return !!(parent&&parent[settings.mode]&&window.BichikuCore.optionAvailable(o,settings));
}
function getStock(o){return settings.variants?.[settings.mode+":"+o.id]||{};}
function useQuery(o) {
 const name=Object.values(o.names).concat([o.role,o.parent]).join(" ").toLocaleLowerCase();
 return name.includes(query.toLocaleLowerCase());
}
function getCandidates(){
 return options.filter(o=>(group==="all"||classify(o)===group)&&useQuery(o)).sort((a,b)=>priorities.indexOf(a.role)-priorities.indexOf(b.role)||a.id.localeCompare(b.id));
}
function preserve(){
 root.querySelectorAll("details[data-option]").forEach(d=>{if(d.open)expanded.add(d.dataset.option);else expanded.delete(d.dataset.option);});
}
function listHtml(){
 const items=getCandidates();
 if(!items.length)return '<p class="specific-empty">'+esc(ui.noMatches)+'</p>';
 let prevRole="";
 return items.map(function(o){
   const stock=getStock(o);
   const active=canCount(o);
   const expiry=/^\d{4}-\d{2}-\d{2}$/.test(String(stock.expiry||""))?stock.expiry:"";
   const count=Number.isFinite(Number(stock.qty))&&Number(stock.qty)>0?Math.min(10000000,Number(stock.qty)):0;
   const status=o.equivalence==="full"?ui.full:(o.equivalence==="conditional"?ui.conditional:ui.supplement);
   const warning=ui.notes[o.warning]||ui.package;
   const label=o.names[lang]||o.names.ja;
   const roleHeader=prevRole!==o.role?'<h3 class="specific-role">'+esc(ui[o.role==="warmth"?"warmthRole":o.role==="power"?"powerRole":o.role]||o.role)+'</h3>':"";
   prevRole=o.role;
   let entry="";
   if(active){
     const hint=o.parent==="food"?ui.foodUnit:o.parent==="water"?ui.waterUnit:o.parent==="toilet"?ui.toiletUnit:ui.pieceUnit;
     entry='<div class="specific-entry"><label>'+esc(ui.units)+' <small>('+esc(unit(o))+')</small>'+
       '<input type="number" class="specific-qty" data-id="'+o.id+'" inputmode="decimal" min="0" max="10000000" step="'+(o.parent==="water"?"0.5":"1")+'" value="'+esc(count)+'" aria-label="'+esc(label+": "+ui.owned)+'"></label>'+
       '<label>'+esc(ui.expiry)+'<input type="date" class="specific-expiry" data-id="'+o.id+'" value="'+esc(expiry)+'" aria-label="'+esc(label+": "+ui.expiry)+'"></label></div>'+
       '<p class="specific-hint">'+esc(hint)+'</p><p class="specific-hint">'+esc(ui.counts)+'</p>';
   }else entry='<p class="specific-limit">'+esc(ui.notCounted)+'</p>';
   const prepareWarn=settings.noHeat&&o.parent==="food"&&["heat","verify"].includes(o.prep)
      ?'<p class="specific-limit">'+esc(ui.noHeatWarning)+'</p>':"";
   return roleHeader+'<details class="specific-option" data-option="'+o.id+'" '+(expanded.has(o.id)?'open':'')+'>'+
      '<summary><span class="specific-option-name">'+esc(label)+'</span><span class="specific-mini">'+esc(kindLabel(o))+' · '+esc(prepLabel(o))+'</span></summary>'+
      '<div class="specific-body"><div class="specific-tags"><span>'+esc(status)+'</span><span>'+esc(prepLabel(o))+'</span></div>'+
      '<p>'+esc(warning)+'</p>'+prepareWarn+entry+
      (o.query?'<div class="specific-aff" data-option-aff="'+o.id+'"></div>':"")+'</div></details>';
 }).join("");
}
function renderList() {
 preserve();
 const list=root.querySelector("#specific-list");
 if(!list)return;
 list.innerHTML=listHtml();
 const helper=window.NWAmazonAffiliate;
 if(helper)list.querySelectorAll("[data-option-aff]").forEach(slot=>{
   let id=slot.getAttribute("data-option-aff");
   helper.mount({container:slot,target:"option_"+id,placement:"specific_options",destinationKey:"option_"+id,affiliateId:"bichiku_option_"+id,label:ui.amazon,language:lang,className:"specific-aff-link"});
 });
}
function render(settingsArg,onUpdate){
 settings=settingsArg;
 update=onUpdate;
 if(!settings.variants||typeof settings.variants!=="object")settings.variants={};
 const collapsed=!!root.dataset.collapsed;
 const tabs=[{id:"all",label:ui.all},...panels.map(p=>({id:p.id,label:ui[p.id]}))];
 root.hidden=false;
 root.innerHTML='<div class="specific-top"><div><h2>'+esc(ui.title)+'</h2><p>'+esc(ui.intro)+'</p></div></div>'+
 '<button type="button" class="specific-toggle" id="specific-toggle" aria-expanded="'+(!collapsed)+'">'+esc(collapsed?ui.show:ui.hide)+'</button>'+
 '<div id="specific-area" '+(collapsed?'hidden':'')+'><label class="specific-search-label" for="specific-search">'+esc(ui.search)+'</label>'+
 '<input id="specific-search" type="search" autocomplete="off" value="'+esc(query)+'" placeholder="'+esc(ui.search)+'">'+
 '<div class="specific-tabs" role="group">'+tabs.map(t=>'<button type="button" data-options-filter="'+t.id+'" aria-pressed="'+(group===t.id)+'" class="'+(group===t.id?"selected":"")+'">'+esc(t.label)+'</button>').join("")+'</div>'+
 '<div class="specific-list" id="specific-list"></div><p class="specific-disclaimer">'+esc(ui.limited)+'</p></div>';
 renderList();
}
root.addEventListener("click",e=>{
 const tab=e.target.closest("[data-options-filter]");
 if(tab){preserve();group=tab.dataset.optionsFilter;expanded.clear();render(settings,update);return;}
 if(e.target.closest("#specific-toggle")){
   preserve();root.dataset.collapsed= root.dataset.collapsed==="true"?"false":"true";render(settings,update);
 }
});
root.addEventListener("input",e=>{
 if(e.target.id==="specific-search"){query=e.target.value;expanded.clear();renderList();}
});
root.addEventListener("change",e=>{
 const id=e.target.dataset.id;
 if(!id||!settings||!update)return;
 const o=options.find(x=>x.id===id);
 if(!o||!canCount(o))return;
 preserve();
 let next={...settings.variants};
 let key=settings.mode+":"+id;
 let existing={...(next[key]||{})};
 if(e.target.classList.contains("specific-qty")){
   const raw=Number(e.target.value);
   existing.qty=Number.isFinite(raw)?Math.min(10000000,Math.max(0,raw)):0;
 }
 if(e.target.classList.contains("specific-expiry"))existing.expiry=/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)?e.target.value:"";
 next[key]=existing;
 update(next);
});
window.BichikuChoices=Object.freeze({render:render});
})();
