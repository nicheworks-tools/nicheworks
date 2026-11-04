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
      powerOut: !!s.powerOut,
      offGridHeatConfirmed: !!s.offGridHeatConfirmed,
      waterOut: !!s.waterOut,
      safeWaterConfirmed: !!s.safeWaterConfirmed,
      prepWaterSufficient: !!s.prepWaterSufficient,
      prepWaterLiters: num(s.prepWaterLiters,0,0,10000000),
      enforceConditions: !!s.enforceConditions,
      toiletAssemblyConfirmed: !!s.toiletAssemblyConfirmed,
      toiletSeatConfirmed: !!s.toiletSeatConfirmed,
      toiletStorageConfirmed: !!s.toiletStorageConfirmed,
      toiletDisposalConfirmed: !!s.toiletDisposalConfirmed,
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
      case "goFood": return 3 * people; // one-day go-bag staple portions (illustrative)
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
  function optionAvailable(option, settings, stockEntry) {
    if (option.equivalence !== "full") return false;
    // A complete toilet kit is unusable without an identified safe installation
    // and a sealed-storage/disposal plan. No assumptions about local waste rules.
    if (option.id === "toiletKit" && settings.enforceConditions &&
        (!settings.toiletSeatConfirmed || !settings.toiletStorageConfirmed || !settings.toiletDisposalConfirmed)) return false;
    if (option.parent === "food" && settings.noHeat && ["heat","verify"].includes(option.prep)) return false;
    // Power outage removes ordinary electricity-dependent cooking until the user
    // explicitly confirms a fuelled, safely usable off-grid heating alternative.
    if (option.parent === "food" && option.prep === "heat" && settings.enforceConditions &&
        settings.powerOut && !settings.offGridHeatConfirmed) return false;
    // Only the user's per-item confirmed total volume may qualify a water-dependent product.
    // The older single global litres value must never credit unlimited servings.
    if (option.parent === "food" && option.requiresWater && settings.enforceConditions) {
      if (!settings.safeWaterConfirmed || !settings.prepWaterSufficient) return false;
      if (!stockEntry || stockEntry.prepConfirmed !== true || !(num(stockEntry.prepWaterLiters,0,0,10000000)>0)) return false;
    }
    return true;
  }
  // Energy-dependent stock must have individually checked working units.
  // A pack of spare batteries or a charging cable does not establish compatibility.
  function energyDependentParent(id) {
    return ["light","lantern","radio","powerbank"].includes(id);
  }
  function energyDependentOption(option) {
    return option.parent === "light" || option.id === "batteryBank";
  }
  function readyEnergyUnits(entry,quantity) {
    if (!entry || entry.powerReadyConfirmed !== true ||
        !Number.isInteger(Number(entry.powerReadyQty))) return 0;
    return Math.min(quantity, Math.floor(num(entry.powerReadyQty,0,0,10000000)));
  }
  // Parent totals can already include separately itemized stock. Unknown
  // overlap never authorizes additive double credit for legacy saved entries.
  function remainingManualQuantity(manualQty,listedQty,basis) {
    var m=num(manualQty,0,0,10000000), listed=num(listedQty,0,0,10000000);
    if(!m || !listed || basis==="additional") return m;
    if(basis==="includes_options") return Math.max(0,m-listed);
    return 0;
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
        var usable = (!optionExpiry || optionExpiry >= stamp) && optionAvailable(option,s,variant);
        variantOwned += qty;
        var effectiveQty = usable ?
          (s.enforceConditions && energyDependentOption(option) ? readyEnergyUnits(variant,qty) : qty) : 0;
        variantEffective += effectiveQty;
        excludedVariants += qty-effectiveQty;
      });
      var overlap = ownedManual>0 && variantOwned>0;
      var manualCountBasis = ["additional","includes_options"].includes(entry.manualCountBasis)?
        entry.manualCountBasis:"";
      var requiresManualReview = s.enforceConditions && overlap && !manualCountBasis;
      var manualExtraOwned = s.enforceConditions?
        remainingManualQuantity(ownedManual,variantOwned,manualCountBasis):ownedManual;
      var owned = s.enforceConditions&&overlap&&manualCountBasis!=="additional"?
        Math.max(ownedManual,variantOwned):ownedManual+variantOwned;
      var expiry = /^\d{4}-\d{2}-\d{2}$/.test(String(entry.expiry||"")) ? entry.expiry : "";
      var expired = expiry !== "" && expiry < stamp;
      var rawManualEffective = expired ? 0 :
        (s.enforceConditions && energyDependentParent(i.id) ? readyEnergyUnits(entry,ownedManual) : ownedManual);
      var manualEffective = s.enforceConditions?
        remainingManualQuantity(rawManualEffective,variantOwned,manualCountBasis):rawManualEffective;
      var effective = manualEffective + variantEffective;
      var missing = Math.max(0,Math.round((required-effective)*100)/100);
      return {item:i,key:key,required:required,autoTarget:autoTarget,hasCustomTarget:custom,
        ownedManual:ownedManual,variantOwned:variantOwned,variantEffective:variantEffective,excludedVariants:excludedVariants,
        owned:owned,effective:effective,manualEffective:manualEffective,
        rawManualEffective:rawManualEffective,manualExtraOwned:manualExtraOwned,
        manualCountBasis:manualCountBasis,requiresManualReview:requiresManualReview,
        expiry:expiry,expired:expired,missing:missing,priority:i.priority};
    });
    items.sort(function(a,b) {return a.priority-b.priority || b.missing-a.missing || a.item.id.localeCompare(b.item.id);});
    return {
      settings:s, items:items,
      missingCount:items.filter(function(x){return x.missing>0;}).length,
      coreMissingCount:items.filter(function(x){return x.priority===1&&x.missing>0;}).length,
      filledCount:items.filter(function(x){return x.missing===0;}).length
    };
  }
  var api = Object.freeze({normalize:normalize,needs:needs,optionAvailable:optionAvailable,
    remainingManualQuantity:remainingManualQuantity,calculate:calculate});
  root.BichikuCore = api;
  if(typeof module==="object" && module.exports) module.exports=api;
})(typeof globalThis === "object" ? globalThis : this);
