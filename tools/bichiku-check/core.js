/* Pure calculation: no DOM, no network, no shopping redirects. */
(function (root) {
  "use strict";
  function num(value, fallback, min, max) {
    var n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  }
  function normalize(options) {
    var s = options || {};
    return {
      mode: s.mode === "go" ? "go" : "home",
      adults: Math.round(num(s.adults, 1, 0, 15)),
      children: Math.round(num(s.children, 0, 0, 15)),
      infants: Math.round(num(s.infants, 0, 0, 10)),
      pets: Math.round(num(s.pets, 0, 0, 10)),
      days: [3, 7, 14].includes(Number(s.days)) ? Number(s.days) : 7,
      noHeat: !!s.noHeat,
      diet: !!s.diet,
      budget: num(s.budget, 0, 0, 10000000),
      stocks: s.stocks && typeof s.stocks === "object" && !Array.isArray(s.stocks) ? s.stocks : {},
      variants: s.variants && typeof s.variants === "object" && !Array.isArray(s.variants) ? s.variants : {}
    };
  }
  function needs(rule, s) {
    var people = s.adults + s.children;
    switch (rule) {
      case "water": return 3 * people * s.days;
      case "food": return 3 * people * s.days;
      case "toilet": return 5 * people * s.days;
      case "carryWater": return 0.5 * people; // packing example, NOT a full-day target
      case "goToilet": return 2 * people; // packing example
      case "people": return people;
      case "one": return 1;
      case "two": return 2;
      case "infants": return s.infants;
      case "diapers": return 6 * s.infants * s.days; // example, customize by child
      case "infantGo": return 6 * s.infants; // example one-day carry
      case "children": return s.children;
      case "pets": return s.pets;
      case "petDays": return s.pets * s.days; // unit is pet-days, not feedings
      case "petGo": return s.pets; // one pet-day example
      default: return 0;
    }
  }
  function active(item,s) {
    if (!item[s.mode]) return false;
    if (item.conditional === "infants" && !s.infants) return false;
    if (item.conditional === "children" && !s.children) return false;
    if (item.conditional === "pets" && !s.pets) return false;
    if (item.conditional === "diet" && !s.diet) return false;
    return true;
  }
  function optionAvailable(option, settings) {
    if (option.equivalence !== "full") return false;
    if (option.parent === "food" && settings.noHeat && ["heat","verify"].includes(option.prep)) return false;
    return true;
  }
  function calculate(catalog, options, today, optionCatalog) {
    var s = normalize(options);
    var stamp = /^\d{4}-\d{2}-\d{2}$/.test(String(today||"")) ? String(today) : new Date().toISOString().slice(0,10);
    var fullOptionsByParent = new Map();
    (optionCatalog || []).forEach(function(option) {
      if(option.equivalence !== "full") return;
      var group = fullOptionsByParent.get(option.parent) || [];
      group.push(option);
      fullOptionsByParent.set(option.parent, group);
    });
    var items = (catalog||[]).filter(function(i) { return active(i,s); }).map(function(i) {
      var key = s.mode+":"+i.id;
      var entry = s.stocks[key] || {};
      var autoTarget = needs(i[s.mode],s);
      var custom = entry.target !== "" && entry.target !== null && entry.target !== undefined && Number.isFinite(Number(entry.target));
      var required = custom ? num(entry.target,autoTarget,0,10000000) : autoTarget;
      var ownedManual = num(entry.qty,0,0,10000000);
      var variantOwned = 0, variantEffective = 0, excludedVariants = 0;
      (fullOptionsByParent.get(i.id) || []).forEach(function(option) {
        var variant = s.variants[s.mode+":"+option.id] || {};
        var qty = num(variant.qty,0,0,10000000);
        if(!qty) return;
        var optionExpiry = /^\d{4}-\d{2}-\d{2}$/.test(String(variant.expiry||"")) ? variant.expiry : "";
        var usable = (!optionExpiry || optionExpiry >= stamp) && optionAvailable(option,s);
        variantOwned += qty;
        if(usable) variantEffective += qty;
        else excludedVariants += qty;
      });
      var owned = ownedManual + variantOwned;
      var expiry = /^\d{4}-\d{2}-\d{2}$/.test(String(entry.expiry||"")) ? entry.expiry : "";
      var expired = expiry !== "" && expiry < stamp;
      var effective = (expired ? 0 : ownedManual) + variantEffective;
      var missing = Math.max(0,Math.round((required-effective)*100)/100);
      return {item:i,key:key,required:required,autoTarget:autoTarget,hasCustomTarget:custom,ownedManual:ownedManual,variantOwned:variantOwned,excludedVariants:excludedVariants,owned:owned,effective:effective,expiry:expiry,expired:expired,missing:missing,priority:i.priority};
    });
    items.sort(function(a,b) {return a.priority-b.priority || b.missing-a.missing || a.item.id.localeCompare(b.item.id);});
    return {
      settings:s, items:items,
      missingCount:items.filter(function(x){return x.missing>0;}).length,
      coreMissingCount:items.filter(function(x){return x.priority===1&&x.missing>0;}).length,
      filledCount:items.filter(function(x){return x.missing===0;}).length
    };
  }
  var api = Object.freeze({normalize:normalize,needs:needs,optionAvailable:optionAvailable,calculate:calculate});
  root.BichikuCore = api;
  if(typeof module==="object" && module.exports) module.exports=api;
})(typeof globalThis === "object" ? globalThis : this);
