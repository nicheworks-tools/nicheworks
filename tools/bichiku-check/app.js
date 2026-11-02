/* Mobile-first NicheWorks BichikuCheck: no APIs, no tracking of entered data. */
(function() {
  "use strict";
  var lang = document.body.getAttribute("data-lang") || "ja";
  var L = (window.BICHIKU_I18N || {})[lang] || window.BICHIKU_I18N.ja;
  var core = window.BichikuCore;
  var catalog = window.BICHIKU_CATALOG || [];
  if (!L || !core || !catalog.length) return;

  var STORE = "bichiku-check-v1";
  var settings = {mode:"home",adults:1,children:0,infants:0,pets:0,days:7,noHeat:false,diet:false,budget:0,stocks:{}};
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      settings = core.normalize(Object.assign(settings,saved));
    }
  } catch (_) {}
  var displayed=false;
  var showCompleted=false;
  var filter="missing";
  var advancedOpen=false;
  var expanded={critical:true,other:false,complete:false};
  var expandedItems={};
  var observed=false;
  var $ = function(id){return document.getElementById(id);};
  var setup=$("setup"), results=$("results"), disclosure=$("affiliate-disclosure");
  function safe(s) {return String(s==null?"":s).replace(/[&<>"']/g,function(x){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x];});}
  function save() { try {localStorage.setItem(STORE,JSON.stringify(settings));}catch(_){} }
  function format(n) { return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2))); }
  function todayLocal(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function unit(id) {
    if(id==="water") return "L";
    if(id==="food") return lang==="ja"?"食":lang==="zh"?"餐":lang==="vi"?"bữa":"meals";
    if(id==="toilet") return lang==="ja"?"回":lang==="zh"?"次":lang==="vi"?"lượt":"uses";
    if(id==="diapers") return lang==="ja"?"枚":lang==="zh"?"片":lang==="vi"?"miếng":"pcs";
    if(id==="petFood") return lang==="ja"?"匹・日":lang==="zh"?"宠物天":lang==="vi"?"ngày-thú":"pet-days";
    return "";
  }
  function stepper(id,label,n,min,max) {
    return '<div class="counter"><span>'+safe(label)+'</span><div class="counter-actions"><button type="button" data-step="-1" data-field="'+id+'" aria-label="'+safe(label)+' -">−</button><output>'+n+'</output><button type="button" data-step="1" data-field="'+id+'" aria-label="'+safe(label)+' +">+</button></div></div>';
  }
  function radioButtons(key,values,labels) {
    return '<div class="segment" role="group" aria-label="'+safe(L[key]||key)+'">'+values.map(function(v,i) {
      return '<button type="button" data-field="'+key+'" data-value="'+v+'" class="'+(String(settings[key])===String(v)?"active":"")+'" aria-pressed="'+(String(settings[key])===String(v))+'">'+safe(labels[i])+'</button>';
    }).join("")+'</div>';
  }
  function renderSetup() {
    setup.innerHTML =
      '<h2>'+safe(L.config)+'</h2>'+
      '<div class="field"><label class="field-title">'+safe(L.home)+' / '+safe(L.go)+'</label>'+radioButtons("mode",["home","go"],[L.home,L.go])+'</div>'+
      '<fieldset class="field"><legend class="field-title">'+safe(L.family)+'</legend><div class="counters">'+
        stepper("adults",L.adults,settings.adults,1,15)+stepper("children",L.children,settings.children,0,15)+
        stepper("infants",L.infants,settings.infants,0,10)+stepper("pets",L.pets,settings.pets,0,10)+'</div></fieldset>'+
      (settings.mode==="home"?'<div class="field"><label class="field-title">'+safe(L.days)+'</label>'+radioButtons("days",[3,7,14],["3","7","14"])+'</div>':'')+
      '<details class="advanced" '+(advancedOpen?'open':'')+'><summary>'+safe(L.conditions)+'</summary>'+
        '<label class="checkline"><input id="noHeat" type="checkbox" '+(settings.noHeat?'checked':'')+'>'+safe(L.noHeat)+'</label>'+
        '<label class="checkline"><input id="diet" type="checkbox" '+(settings.diet?'checked':'')+'>'+safe(L.diet)+'</label>'+
      '</details>'+
      '<button type="button" class="primary wide calculate" id="calculate">'+safe(L.calculate)+' <span aria-hidden="true">↓</span></button>';
  }
  var AMAZON = window.NWAmazonAffiliate;
  var searches={};
  catalog.forEach(function(i) {
    if (!i.search) return;
    var u=new URL("https://www.amazon.co.jp/s");
    u.searchParams.set("k",i.search);
    u.searchParams.set("tag","nicheworks09-22");
    searches[i.id]=u.toString();
  });
  if (AMAZON) AMAZON.configure({enabled:true,tool:"bichiku-check",targets:searches});
  function displayWarnings(calc) {
    var notes=[settings.mode==="home"?L.homeNote:L.goNote,L.qtyRule];
    if(settings.mode==="go") notes.push(L.goExample);
    if(settings.noHeat && settings.mode==="home") notes.push(L.noHeatNote);
    if(settings.infants) notes.push(L.infantNote);
    if(settings.diet) notes.push(L.dietNote);
    return notes.map(function(s) {return '<p>'+safe(s)+'</p>';}).join("");
  }
  function row(x) {
    var i=x.item, stock=x.owned, need=x.missing;
    var urgency=i.priority===1?L.priority1:(i.priority===2?L.priority2:L.priority3);
    var a=x.missing>0 && !!i.search;
    var qtyId="qty-"+i.id, targetId="target-"+i.id, dateId="expiry-"+i.id;
    return '<li class="item '+(x.missing===0?"covered":"")+'" data-item="'+i.id+'">'+
      '<div class="item-main"><span class="item-name">'+safe(i.names[lang] || i.names.ja)+'</span>'+
      '<span class="priority priority-'+i.priority+'">'+safe(urgency)+'</span></div>'+
      '<div class="item-count"><span>'+safe(L.needed)+': <strong>'+format(x.required)+safe(unit(i.id))+'</strong></span>'+
      '<span class="'+(need?"shortage":"ok")+'">'+safe(need?L.missing:L.complete)+': <strong>'+format(need)+safe(unit(i.id))+'</strong></span></div>'+
      '<div class="item-actions"><label for="'+qtyId+'">'+safe(L.owned)+'<input id="'+qtyId+'" class="qty" data-id="'+i.id+'" type="number" min="0" max="10000000" step="'+(i.id==="water"?"0.5":"1")+'" inputmode="decimal" value="'+format(stock)+'"></label>'+
      (a?'<span class="aff-slot" data-aff="'+i.id+'"></span>':"")+'</div>'+
      '<details class="item-detail" data-detail="'+i.id+'" '+(expandedItems[i.id]?'open':'')+'><summary>'+safe(L.adjust)+'</summary>'+
      '<div class="item-detail-controls"><label for="'+targetId+'">'+safe(L.targetEdit)+'<input id="'+targetId+'" class="target" data-id="'+i.id+'" type="number" min="0" max="10000000" step="'+(i.id==="water"?"0.5":"1")+'" inputmode="decimal" value="'+(x.hasCustomTarget?format(x.required):"")+'" placeholder="'+format(x.autoTarget)+'"></label>'+
      '<label for="'+dateId+'">'+safe(L.expiry)+'<input id="'+dateId+'" class="expiry" data-id="'+i.id+'" type="date" value="'+safe(x.expiry)+'"></label></div></details>'+
      (x.expired?'<p class="expired">'+safe(L.expired)+' · '+safe(L.expiredHelp)+'</p>':"")+
      '</li>';
  }
    function section(group,heading,list,open) {
    if(!list.length) return "";
    return '<details class="list-section" data-group="'+group+'" '+(open?'open':'')+'><summary><span>'+safe(heading)+'</span><strong>'+list.length+'</strong></summary>'+
      '<ul class="item-list">'+list.map(row).join("")+'</ul></details>';
  }
  function renderResults() {
    if(!displayed) return;
    var calc=core.calculate(catalog,settings,todayLocal());
    var critical=calc.items.filter(function(x){return x.missing>0 && x.priority===1;});
    var other=calc.items.filter(function(x){return x.missing>0 && x.priority!==1;});
    var covered=calc.items.filter(function(x){return x.missing===0;});
    var criticalVisible=filter==="all" || filter==="missing";
    var otherVisible=criticalVisible;
    var completeVisible=filter==="all" || filter==="covered";
    results.innerHTML =
      '<h2>'+safe(L.results)+'</h2>'+
      '<div class="metrics"><div><strong>'+calc.coreMissingCount+'</strong><span>'+safe(L.core)+'</span></div>'+
      '<div><strong>'+calc.missingCount+'</strong><span>'+safe(L.shortages)+'</span></div>'+
      '<div><strong>'+calc.filledCount+'</strong><span>'+safe(L.complete)+'</span></div></div>'+
      '<div class="notice">'+displayWarnings(calc)+'</div>'+
      '<div class="segment filters" role="group" aria-label="'+safe(L.results)+'">'+
      [["all",L.all],["missing",L.onlyMissing],["covered",L.onlyComplete]].map(function(e){
        return '<button type="button" data-filter="'+e[0]+'" class="'+(filter===e[0]?"active":"")+'" aria-pressed="'+(filter===e[0])+'">'+safe(e[1])+'</button>';
      }).join("")+'</div>'+
      (!calc.missingCount?'<p class="fine">'+safe(L.noMissing)+'</p>':"")+
      (criticalVisible?section("critical",L.priority1,critical,expanded.critical):"")+
      (otherVisible?section("other",L.extra,other,expanded.other):"")+
      (completeVisible?section("complete",L.complete,covered,expanded.complete):"")+
      '<div class="result-buttons"><button type="button" id="copyList">'+safe(L.copy)+'</button><button type="button" id="exportCsv">'+safe(L.download)+'</button><button type="button" id="printList">'+safe(L.print)+'</button><button type="button" id="reset">'+safe(L.reset)+'</button></div>'+
      '<div class="fine compliance"><p>'+safe(L.pricesNote)+'</p><p>'+safe(L.affiliateNote)+'</p><p>'+safe(L.privacy)+'</p></div>';
    results.hidden=false;
    results.querySelectorAll(".aff-slot").forEach(function(slot) {
      if(!AMAZON) return;
      var id=slot.getAttribute("data-aff");
      AMAZON.mount({container:slot,target:id,label:L.amazon,placement:"shortage_list",destinationKey:id,affiliateId:"bichiku_"+id,language:lang,className:"aff-link"});
    });
    if(AMAZON) AMAZON.renderDisclosure(disclosure,{includeEnglish:lang==="en"});
    if(!observed && AMAZON) {
      var count=results.querySelectorAll(".aff-link").length;
      if(count) { AMAZON.trackImpression({placement:"shortage_list",offerCount:count,language:lang}); observed=true; }
    }
  }
  function preserveOpen() {
    var adv=setup.querySelector(".advanced");
    if(adv) advancedOpen=adv.open;
    results.querySelectorAll(".list-section").forEach(function(d){expanded[d.dataset.group]=d.open;});
    results.querySelectorAll(".item-detail").forEach(function(d){expandedItems[d.dataset.detail]=d.open;});
  }
  function setField(field,value) {
    preserveOpen();
    if(field==="mode") settings.mode=value;
    else if(field==="days") settings.days=Number(value);
    else if(["adults","children","infants","pets"].includes(field)) {
      var lower=field==="adults"?1:0;
      var upper=["adults","children"].includes(field)?15:10;
      settings[field]=Math.min(upper,Math.max(lower,Number(value)));
    }
    save(); renderSetup(); renderResults();
  }
  setup.addEventListener("click",function(ev){
    var step=ev.target.closest("[data-step]");
    if(step) {var f=step.dataset.field;setField(f,Number(settings[f])+Number(step.dataset.step));return;}
    var b=ev.target.closest("[data-field][data-value]");
    if(b) {setField(b.dataset.field,b.dataset.value);return;}
    if(ev.target.closest("#calculate")) {
      preserveOpen(); displayed=true; renderResults();
      results.scrollIntoView({behavior:"smooth",block:"start"});
    }
  });
  setup.addEventListener("change",function(ev) {
    if(ev.target.id==="noHeat" || ev.target.id==="diet") {settings[ev.target.id]=ev.target.checked;save();renderResults();}
  });
  results.addEventListener("change",function(ev){
    var id=ev.target.dataset.id;
    if(!id) return;
    preserveOpen();
    var key=settings.mode+":"+id;
    var old=settings.stocks[key]||{};
    var next=Object.assign({},old);
    if(ev.target.classList.contains("qty")) next.qty=Math.max(0,Math.min(10000000,Number(ev.target.value)||0));
    if(ev.target.classList.contains("expiry")) next.expiry=ev.target.value;
    if(ev.target.classList.contains("target")) {if(ev.target.value==="") delete next.target; else next.target=Math.max(0,Math.min(10000000,Number(ev.target.value)||0));}
    settings.stocks[key]=next;save();renderResults();
  });
  results.addEventListener("click",function(ev){
    var b=ev.target.closest("button");
    if(!b) return;
    if(b.dataset.filter) {preserveOpen();filter=b.dataset.filter;if(filter==="covered")expanded.complete=true;renderResults();return;}
    var calc=core.calculate(catalog,settings,todayLocal());
    var rows=calc.items.filter(function(x){return x.missing>0;});
    if(b.id==="reset") {
      if(confirm(L.confirmReset)) {try{localStorage.removeItem(STORE);}catch(_){}settings=core.normalize({adults:1});displayed=false;results.hidden=true;renderSetup();disclosure.hidden=true;window.scrollTo({top:0,behavior:"smooth"});}
      return;
    }
    if(b.id==="printList") {
      preserveOpen();
      var priorFilter=filter, priorExpanded=Object.assign({},expanded);
      filter="all"; expanded={critical:true,other:true,complete:true};
      renderResults();
      window.addEventListener("afterprint",function(){filter=priorFilter;expanded=priorExpanded;renderResults();},{once:true});
      window.print();return;
    }
    if(b.id==="copyList") {
      var txt=L.results+"\n"+rows.map(function(x){return x.item.names[lang]+" — "+L.missing+": "+format(x.missing)+unit(x.item.id);}).join("\n");
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function(){b.textContent=L.copied;}).catch(function(){fallbackCopy(txt,b);});
      else fallbackCopy(txt,b);
      return;
    }
    if(b.id==="exportCsv") {
      var columns=["id","name","mode","target","owned","missing","expiry","expired"];
      var raw=[columns].concat(calc.items.map(function(x) {return [x.item.id,x.item.names[lang],settings.mode,x.required,x.owned,x.missing,x.expiry,x.expired];}));
      var csv="\ufeff"+raw.map(function(r){return r.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(",");}).join("\r\n");
      var url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
      var a=document.createElement("a");a.href=url;a.download="bichiku-check-"+settings.mode+".csv";document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},2000);
    }
  });
  function fallbackCopy(txt,b) {
    var t=document.createElement("textarea");t.value=txt;t.style.position="fixed";t.style.left="-9999px";document.body.append(t);t.select();
    try{if(document.execCommand("copy"))b.textContent=L.copied;}catch(_){}
    t.remove();
  }
  $("references").innerHTML = '<h2>'+safe(L.references)+'</h2><ul>'+
    '<li><a href="https://www.kantei.go.jp/jp/headline/bousai/sonae.html" target="_blank" rel="noopener">'+safe(L.source1)+'</a></li>'+
    '<li><a href="https://www.gov-online.go.jp/tokusyu/bousai/preparation.html" target="_blank" rel="noopener">'+safe(L.source2)+'</a></li></ul>'+
    '<p class="fine">'+safe(L.sourced)+'</p><p class="fine">'+safe(L.disclaimer)+'</p>';
  $("donate").innerHTML='<p>'+safe(L.donate)+'</p><div class="donate-links"><a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">OFUSE</a><a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">Ko-fi</a></div>';
  renderSetup();
})();
