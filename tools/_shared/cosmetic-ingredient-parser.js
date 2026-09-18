(function attachCosmeticIngredientParser(root) {
  "use strict";

  const LOCANT_COMMA = "\uE000";

  function normalizeText(value = "") {
    return String(value)
      .normalize("NFKC")
      .replace(/\r/g, "\n")
      .replace(/[\t\u3000]+/g, " ")
      .replace(/[ ]{2,}/g, " ")
      .trim();
  }

  function normalizeBaseKey(value = "") {
    return normalizeText(value)
      .toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
      .replace(/[()（）［］\[\]{}【】]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ",")
      .trim();
  }

  const ALIAS_EQUIVALENTS = Object.freeze({
    "精製水": "water",
    "グリセロール": "glycerin",
    "1,3-ブチレングリコール": "butylene glycol",
    "塩化ナトリウム": "sodium chloride",
    "クエン酸ナトリウム": "sodium citrate",
    "水酸化ナトリウム": "sodium hydroxide",
    "水酸化ナトリウム液": "sodium hydroxide",
    "エデト酸2ナトリウム": "disodium edta",
    "エデト酸二ナトリウム": "disodium edta",
    "ニコチン酸アミド": "niacinamide",
    "ヒアルロン酸ナトリウム": "sodium hyaluronate",
    "ヒアルロン酸ソーダ": "sodium hyaluronate",
    "乳酸ナトリウム": "sodium lactate",
    "ポリアクリル酸ナトリウム": "sodium polyacrylate",
    "ラウレス硫酸ナトリウム": "sodium laureth sulfate",
    "安息香酸ナトリウム": "sodium benzoate",
    "ソルビン酸カリウム": "potassium sorbate",
    "水酸化カリウム": "potassium hydroxide",
    "水酸化カリウム液a": "potassium hydroxide",
    "リン酸ナトリウム": "sodium phosphate",
    "リン酸二ナトリウム": "disodium phosphate",
    "pcaナトリウム": "sodium pca",
    "pg": "propylene glycol",
    "グリセリルエチルヘキシルエーテル": "ethylhexylglycerin",
    "ヤシ油脂肪酸アシルグルタミン酸na": "sodium cocoyl glutamate",
    "シュガースクワラン": "squalane",
    "alcohol denat": "alcohol denat."
  });

  const CANONICAL_EQUIVALENTS = Object.freeze({
    "bemotrizinol": "bis-ethylhexyloxyphenol methoxyphenyl triazine",
    "bisoctrizole": "methylene bis-benzotriazolyl tetramethylbutylphenol",
    "ci 77891": "titanium dioxide",
    "ci 77019": "mica"
  });

  const AMBIGUOUS_EXACT_KEYS = Object.freeze([
    "aha",
    "bha",
    "pha",
    "iron oxides",
    "酸化鉄"
  ]);
  const ambiguousExactKeySet = new Set(AMBIGUOUS_EXACT_KEYS);

  const VERIFIED_CATEGORY_EVIDENCE = Object.freeze({
    "water": Object.freeze({ category: "solvent", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/water/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "glycerin": Object.freeze({ category: "humectant", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/glycerin/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "propylene glycol": Object.freeze({ category: "humectant", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/propylene-glycol/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "phenoxyethanol": Object.freeze({ category: "preservative", sources: Object.freeze(["https://health.ec.europa.eu/publications/phenoxyethanol_en"]), authority: "European Commission Scientific Committee on Consumer Safety" }),
    "carbomer": Object.freeze({ category: "thickener", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/carbomer/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "citric acid": Object.freeze({ category: "pH adjuster", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/citric-acid/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "tocopherol": Object.freeze({ category: "antioxidant", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/tocopherol/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "sodium chloride": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/sodium-chloride/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "disodium edta": Object.freeze({ category: "chelating agent", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/disodium-edta/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "tocopheryl acetate": Object.freeze({ category: "antioxidant", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/tocopherol/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "butylene glycol": Object.freeze({ category: "solvent", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/dipropylene-glycol/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "dipropylene glycol": Object.freeze({ category: "solvent", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/dipropylene-glycol/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "sodium hydroxide": Object.freeze({ category: "pH adjuster", sources: Object.freeze(["https://www.cosmeticsinfo.org/product/cuticle-oils-creams-and-lotions/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "aminomethyl propanol": Object.freeze({ category: "pH adjuster", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/aminomethyl-propanol/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "triethanolamine": Object.freeze({ category: "pH adjuster", sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/triethanolamine-and-tea-containing-ingredients/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "potassium hydroxide": Object.freeze({ category: "pH adjuster", sources: Object.freeze(["https://www.cosmeticsinfo.org/product/cuticle-oils-creams-and-lotions/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "bht": Object.freeze({ category: "antioxidant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1672/bht/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "betaine": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1648/betaine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "pentylene glycol": Object.freeze({ category: "solvent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11416/pentylene-glycol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "propanediol": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13169/propanediol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "1,2-hexanediol": Object.freeze({ category: "solvent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5/1-2-hexanediol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "alcohol": Object.freeze({ category: "solvent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/590/alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ascorbyl palmitate": Object.freeze({ category: "antioxidant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1244/ascorbyl-palmitate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium gluconate": Object.freeze({ category: "chelating agent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14787/sodium-gluconate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "xanthan gum": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16999/xanthan-gum/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ethylhexylglycerin": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5500/ethylhexylglycerin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "squalane": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15418/squalane/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium cocoyl glutamate": Object.freeze({ category: "cleanser", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14710/sodium-cocoyl-glutamate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "dimethicone": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/4583/dimethicone/"]), authority: "Cosmetics Europe / COSMILE Europe" })
  });

  const VERIFIED_NOTE_EVIDENCE = Object.freeze({
    "phenoxyethanol": Object.freeze({ note_short: "Preservative; SCCS considers it safe for use up to 1.0% in cosmetic products.", note_sources: Object.freeze(["https://health.ec.europa.eu/publications/phenoxyethanol_en"]), authority: "European Commission Scientific Committee on Consumer Safety" }),
    "sodium hydroxide": Object.freeze({ note_short: "pH adjuster; EU cosmetic rules list sodium hydroxide for pH-adjusting uses subject to specified restrictions.", note_sources: Object.freeze(["https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0622"]), authority: "European Union / EUR-Lex" }),
    "potassium hydroxide": Object.freeze({ note_short: "pH adjuster; EU cosmetic rules list potassium hydroxide for pH-adjusting uses subject to specified restrictions.", note_sources: Object.freeze(["https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0622"]), authority: "European Union / EUR-Lex" }),
    "methylisothiazolinone": Object.freeze({ note_short: "Preservative; EU cosmetic rules limit methylisothiazolinone to rinse-off products at up to 0.0015%.", note_sources: Object.freeze(["https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017R1224"]), authority: "European Union / EUR-Lex" }),
    "methylchloroisothiazolinone": Object.freeze({ note_short: "Preservative; in EU cosmetics, the methylchloroisothiazolinone/methylisothiazolinone 3:1 mixture is limited to rinse-off products at up to 0.0015%.", note_sources: Object.freeze(["https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32014R1003"]), authority: "European Union / EUR-Lex" }),
    "sodium benzoate": Object.freeze({ note_short: "Preservative; EU Annex V sets sodium benzoate limits of 2.5% for rinse-off products, 1.7% for oral products and 0.5% for leave-on products, expressed as acid.", note_sources: Object.freeze(["https://eur-lex.europa.eu/eli/reg/2009/1223/2026-05-18"]), authority: "European Union / EUR-Lex" }),
    "sodium dehydroacetate": Object.freeze({ note_short: "Preservative; EU Annex V permits sodium dehydroacetate up to 0.6% expressed as acid and excludes aerosol sprays.", note_sources: Object.freeze(["https://eur-lex.europa.eu/eli/reg/2009/1223/2026-05-18"]), authority: "European Union / EUR-Lex" }),
    "sulfur": Object.freeze({ note_short: "OTC acne active; FDA Monograph M006 permits sulfur at 3% to 10% as a single active ingredient.", note_sources: Object.freeze(["https://www.accessdata.fda.gov/drugsatfda_docs/omuf/OTC%20Monograph_M006-Topical%20Acne%20drug%20products%20for%20OTC%20Human%20Use%2011.23.2021.pdf"]), authority: "U.S. Food and Drug Administration" }),
    "alpha-arbutin": Object.freeze({ note_short: "SCCS-reviewed cosmetic ingredient; alpha-arbutin is considered safe up to 2% in face creams and 0.5% in body lotions.", note_sources: Object.freeze(["https://health.ec.europa.eu/publications/safety-alpha-arbutin-and-beta-arbutin-cosmetic-products_en"]), authority: "European Commission Scientific Committee on Consumer Safety" }),
    "ceteareth-20": Object.freeze({ note_short: "Surfactant; Cosmetics Info reports Ceteareth-20 as a solubilizing and cleansing agent.", note_sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/ceteareth-20/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "steareth-21": Object.freeze({ note_short: "Surfactant; Cosmetics Info reports Steareth-21 as a cleansing, emulsifying and solubilizing agent.", note_sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/steareth-21/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "isopropyl myristate": Object.freeze({ note_short: "Binder and skin-conditioning emollient; these functions are reported for isopropyl myristate by Cosmetics Info.", note_sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/isopropyl-myristate/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "simmondsia chinensis jojoba seed oil": Object.freeze({ note_short: "Hair-conditioning and occlusive skin-conditioning ingredient; these functions are reported for jojoba seed oil by Cosmetics Info.", note_sources: Object.freeze(["https://www.cosmeticsinfo.org/ingredient/simmondsia-chinensis-jojoba-seed-oil/"]), authority: "Personal Care Products Council / Cosmetics Info" }),
    "aminobenzoic acid": Object.freeze({ note_short: "UV filter; EU Annex VI lists PABA (4-Aminobenzoic acid) at up to 5%.", note_sources: Object.freeze(["https://eur-lex.europa.eu/eli/reg/2009/1223"]), authority: "European Union / EUR-Lex" }),
    "ecamsule": Object.freeze({ note_short: "UV filter; EU Annex VI lists Ecamsule at up to 10% expressed as acid.", note_sources: Object.freeze(["https://eur-lex.europa.eu/eli/reg/2009/1223"]), authority: "European Union / EUR-Lex" }),
    "octisalate": Object.freeze({ note_short: "UV filter; EU Annex VI lists Ethylhexyl Salicylate (Octisalate) at up to 5%.", note_sources: Object.freeze(["https://eur-lex.europa.eu/eli/reg/2009/1223"]), authority: "European Union / EUR-Lex" }),
    "diethylamino hydroxybenzoyl hexyl benzoate": Object.freeze({ note_short: "UV filter; EU Regulation 2026/909 sets DHHB at up to 10% and limits unavoidable DnHexP impurity to 10 ppm.", note_sources: Object.freeze(["https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32026R0909"]), authority: "European Union / EUR-Lex" }),
    "diazolidinyl urea": Object.freeze({ note_short: "Preservative; EU Annex V lists Diazolidinyl Urea at up to 0.5%.", note_sources: Object.freeze(["https://eur-lex.europa.eu/eli/reg/2009/1223"]), authority: "European Union / EUR-Lex" }),
    "imidazolidinyl urea": Object.freeze({ note_short: "Preservative; EU Annex V lists Imidazolidinyl Urea at up to 0.6%.", note_sources: Object.freeze(["https://eur-lex.europa.eu/eli/reg/2009/1223"]), authority: "European Union / EUR-Lex" }),
    "ammonium hydroxide": Object.freeze({ note_short: "Buffering and denaturant ingredient; COSMILE Europe lists both functions for Ammonium Hydroxide and notes that it is subject to EU Annex III restrictions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/906/ammonium-hydroxide"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glutathione": Object.freeze({ note_short: "Reducing agent; COSMILE Europe lists Glutathione as a reducing ingredient in cosmetic products.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5915/glutathione/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "zinc pca": Object.freeze({ note_short: "Humectant and skin-conditioning ingredient; COSMILE Europe lists both functions for Zinc PCA.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17133/zinc-pca/"]), authority: "Cosmetics Europe / COSMILE Europe" })
  });

  function canonicalIdentityKey(value = "") {
    const base = normalizeBaseKey(value);
    if (!base) return "";
    return CANONICAL_EQUIVALENTS[base] || base;
  }

  function normalizeKey(value = "") {
    const base = normalizeBaseKey(value);
    if (!base || ambiguousExactKeySet.has(base)) return "";
    const aliasEquivalent = ALIAS_EQUIVALENTS[base] || base;
    if (ambiguousExactKeySet.has(aliasEquivalent)) return "";
    return canonicalIdentityKey(aliasEquivalent);
  }

  function isAmbiguousExactName(value = "") { return ambiguousExactKeySet.has(normalizeBaseKey(value)); }

  function mergeNameLists(...lists) {
    const output = [];
    const seen = new Set();
    for (const list of lists) {
      for (const value of Array.isArray(list) ? list : []) {
        const text = normalizeText(value);
        const key = normalizeBaseKey(text);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        output.push(text);
      }
    }
    return output;
  }

  function addSemanticValue(map, canonicalKey, field, value) {
    const normalized = normalizeText(value);
    if (!normalized) return;
    if (!map.has(canonicalKey)) map.set(canonicalKey, { safety: [], category: [], safetySet: new Set(), categorySet: new Set() });
    const state = map.get(canonicalKey);
    const normalizedKey = normalized.toLowerCase();
    const set = field === "safety" ? state.safetySet : state.categorySet;
    const list = field === "safety" ? state.safety : state.category;
    if (set.has(normalizedKey)) return;
    set.add(normalizedKey);
    list.push(field === "safety" ? normalizedKey : normalized);
  }

  function atomicCategoryValues(values) {
    const output = [];
    const seen = new Set();
    for (const raw of values) {
      for (const part of String(raw).split(/\s*\/\s*/)) {
        const text = normalizeText(part);
        const key = text.toLowerCase();
        if (!text || seen.has(key)) continue;
        seen.add(key);
        output.push(text);
      }
    }
    return output;
  }

  function normalizeHttpsSource(value = "") {
    if (typeof value !== "string") return "";
    const text = value.trim();
    if (!text) return "";
    try {
      const parsed = new URL(text);
      if (parsed.protocol !== "https:" || !parsed.hostname) return "";
      return parsed.href;
    } catch { return ""; }
  }

  function normalizeNoteSources(values = []) {
    const output = [];
    const seen = new Set();
    for (const value of Array.isArray(values) ? values : []) {
      const source = normalizeHttpsSource(value);
      if (!source || seen.has(source)) continue;
      seen.add(source);
      output.push(source);
    }
    return output;
  }

  function verifiedNoteCandidate(raw) {
    if (raw?.note_verified !== true) return null;
    const note = normalizeText(raw.note_short);
    const sources = normalizeNoteSources(raw.note_sources);
    if (!note || sources.length === 0) return null;
    return { note, sources };
  }

  function addVerifiedNoteCandidate(map, canonicalKey, raw) {
    const candidate = verifiedNoteCandidate(raw);
    if (!candidate) return;
    if (!map.has(canonicalKey)) map.set(canonicalKey, new Map());
    const candidates = map.get(canonicalKey);
    const noteKey = candidate.note;
    if (!candidates.has(noteKey)) candidates.set(noteKey, { note: candidate.note, sources: [] });
    candidates.get(noteKey).sources = normalizeNoteSources([...candidates.get(noteKey).sources, ...candidate.sources]);
  }

  function mergeDictionaryRecords(items = []) {
    const byCanonical = new Map();
    const semanticValues = new Map();
    const verifiedNotes = new Map();
    const order = [];

    for (const raw of Array.isArray(items) ? items : []) {
      if (!raw || !raw.en) continue;
      const rawBaseKey = normalizeBaseKey(raw.en);
      const canonicalKey = canonicalIdentityKey(raw.en);
      if (!canonicalKey) continue;
      addSemanticValue(semanticValues, canonicalKey, "safety", raw.safety);
      addSemanticValue(semanticValues, canonicalKey, "category", raw.category);
      addVerifiedNoteCandidate(verifiedNotes, canonicalKey, raw);
      if (!byCanonical.has(canonicalKey)) {
        const first = { ...raw, jp: mergeNameLists(raw.jp), alias: mergeNameLists(raw.alias) };
        byCanonical.set(canonicalKey, first);
        order.push(canonicalKey);
        continue;
      }
      const current = byCanonical.get(canonicalKey);
      const currentBaseKey = normalizeBaseKey(current.en);
      const rawIsPreferredCanonical = rawBaseKey === canonicalKey && currentBaseKey !== canonicalKey;
      if (rawIsPreferredCanonical) {
        current.alias = mergeNameLists(current.alias, [current.en], raw.alias);
        current.en = raw.en;
        if (raw.note_short) current.note_short = raw.note_short;
      } else current.alias = mergeNameLists(current.alias, rawBaseKey !== currentBaseKey ? [raw.en] : [], raw.alias);
      current.jp = mergeNameLists(current.jp, raw.jp);
      if (!current.note_short && raw.note_short) current.note_short = raw.note_short;
    }

    for (const [canonicalKey, evidence] of Object.entries(VERIFIED_CATEGORY_EVIDENCE)) {
      if (!byCanonical.has(canonicalKey)) continue;
      addSemanticValue(semanticValues, canonicalKey, "category", evidence.category);
    }
    for (const [canonicalKey, evidence] of Object.entries(VERIFIED_NOTE_EVIDENCE)) {
      if (!byCanonical.has(canonicalKey)) continue;
      addVerifiedNoteCandidate(verifiedNotes, canonicalKey, { note_short: evidence.note_short, note_verified: true, note_sources: evidence.note_sources });
    }

    return order.map((key) => {
      const current = byCanonical.get(key);
      const semantics = semanticValues.get(key) || { safety: [], category: [] };
      const provenanceCandidates = [...(verifiedNotes.get(key)?.values() || [])];
      const categoryEvidence = VERIFIED_CATEGORY_EVIDENCE[key] || null;
      const noteEvidence = VERIFIED_NOTE_EVIDENCE[key] || null;
      const conflicts = {};
      if (semantics.safety.length === 1) current.safety = semantics.safety[0];
      else if (semantics.safety.length > 1) { delete current.safety; current.legacy_safety_values = semantics.safety.slice(); conflicts.safety = semantics.safety.slice(); }
      else delete current.safety;
      if (semantics.category.length === 1) { current.category = semantics.category[0]; current.categories = semantics.category.slice(); }
      else if (semantics.category.length > 1) { const categories = atomicCategoryValues(semantics.category); current.categories = categories; current.category = categories.join(" / "); conflicts.category = semantics.category.slice(); }
      else { delete current.category; current.categories = []; }
      if (categoryEvidence) { current.category_verified = true; current.category_sources = normalizeNoteSources(categoryEvidence.sources); current.category_authority = categoryEvidence.authority; }
      else { delete current.category_verified; delete current.category_sources; delete current.category_authority; }
      if (provenanceCandidates.length === 1) {
        current.note_short = provenanceCandidates[0].note;
        current.note_verified = true;
        current.note_sources = provenanceCandidates[0].sources.slice();
        if (noteEvidence) current.note_authority = noteEvidence.authority; else delete current.note_authority;
        delete current.note_provenance_conflict;
      } else if (provenanceCandidates.length > 1) {
        delete current.note_verified; delete current.note_sources; delete current.note_authority;
        current.note_provenance_conflict = provenanceCandidates.map((candidate) => ({ note_short: candidate.note, note_sources: candidate.sources.slice() }));
        conflicts.note_provenance = provenanceCandidates.map((candidate) => candidate.note);
      } else { delete current.note_verified; delete current.note_sources; delete current.note_authority; delete current.note_provenance_conflict; }
      if (Object.keys(conflicts).length) current.semantic_conflicts = conflicts; else delete current.semantic_conflicts;
      return current;
    });
  }

  function protectNumericLocantCommas(value) { return String(value).replace(/(\d),(?=\d)/g, `$1${LOCANT_COMMA}`); }
  function restoreNumericLocantCommas(value) { return String(value).replaceAll(LOCANT_COMMA, ","); }
  function splitIngredients(value = "", options = {}) {
    const dedupe = Boolean(options.dedupe);
    const normalized = normalizeText(value);
    if (!normalized) return [];
    const protectedText = protectNumericLocantCommas(normalized);
    const parts = protectedText.split(/[\n,、，;；]+/).map((item) => restoreNumericLocantCommas(normalizeText(item))).filter(Boolean);
    if (!dedupe) return parts;
    const seen = new Set(); const unique = [];
    for (const item of parts) { const key = normalizeKey(item) || `ambiguous:${normalizeBaseKey(item)}`; if (!key || seen.has(key)) continue; seen.add(key); unique.push(item); }
    return unique;
  }
  function isExactIngredientMatch(value, candidate) { const valueKey = normalizeKey(value); const candidateKey = normalizeKey(candidate); return Boolean(valueKey && candidateKey && valueKey === candidateKey); }
  function ensureStylesheet(documentRef, href) { if (documentRef.querySelector(`link[href="${href}"]`)) return; const link = documentRef.createElement("link"); link.rel = "stylesheet"; link.href = href; documentRef.head.appendChild(link); }
  function loadScript(documentRef, src) {
    return new Promise((resolve, reject) => {
      const existing = documentRef.querySelector(`script[src="${src}"]`);
      if (existing) { if (existing.dataset.nwLoaded === "true") resolve(); else existing.addEventListener("load", resolve, { once: true }); return; }
      const script = documentRef.createElement("script"); script.src = src; script.async = true;
      script.addEventListener("load", () => { script.dataset.nwLoaded = "true"; resolve(); }, { once: true });
      script.addEventListener("error", reject, { once: true }); documentRef.head.appendChild(script);
    });
  }
  function bootstrapOptionalAffiliateRuntime() {
    const documentRef = root?.document; if (!documentRef || !documentRef.getElementById("amazonAffiliateSlot")) return;
    ensureStylesheet(documentRef, "/tools/_shared/cosmetics-affiliate-slot.css");
    loadScript(documentRef, "/tools/_shared/cosmetics-affiliate-config.js").then(() => loadScript(documentRef, "/tools/_shared/cosmetics-affiliate-slot.js")).catch((error) => console.warn("Optional affiliate runtime unavailable", error));
  }
  function bootstrapOptionalToolEnhancements() {
    const documentRef = root?.document; if (!documentRef) return;
    if (documentRef.getElementById("inciInput") && documentRef.getElementById("summaryBox")) { ensureStylesheet(documentRef, "/tools/cosmetic-ingredient-checker-lite/enhancements.css"); loadScript(documentRef, "/tools/cosmetic-ingredient-checker-lite/enhancements.js").catch((error) => console.warn("Lite enhancements unavailable", error)); }
    if (documentRef.getElementById("fast-input") && documentRef.getElementById("ocr-file-fast")) { ensureStylesheet(documentRef, "/tools/inci-fastscan/enhancements.css"); loadScript(documentRef, "/tools/inci-fastscan/enhancements.js").catch((error) => console.warn("FastScan enhancements unavailable", error)); }
  }

  const api = {
    version: "1.28.0",
    normalizeText, normalizeBaseKey, normalizeKey, canonicalIdentityKey, normalizeNoteSources, splitIngredients, isExactIngredientMatch, isAmbiguousExactName, mergeDictionaryRecords,
    verifiedCategoryEvidence: VERIFIED_CATEGORY_EVIDENCE,
    verifiedNoteEvidence: VERIFIED_NOTE_EVIDENCE,
    aliasEquivalents: ALIAS_EQUIVALENTS,
    canonicalEquivalents: CANONICAL_EQUIVALENTS,
    ambiguousExactKeys: AMBIGUOUS_EXACT_KEYS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.NWCosmeticIngredientParser = api;
  bootstrapOptionalAffiliateRuntime();
  bootstrapOptionalToolEnhancements();
})(typeof globalThis !== "undefined" ? globalThis : this);