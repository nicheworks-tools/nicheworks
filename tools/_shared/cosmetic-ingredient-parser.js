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
    "dimethicone": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/4583/dimethicone/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cetearyl alcohol": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2895/cetearyl-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cetyl alcohol": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2973/cetyl-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "disodium lauryl sulfosuccinate": Object.freeze({ category: "cleanser", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/4979/disodium-lauryl-sulfosuccinate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrogenated polyisobutene": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6702/hydrogenated-polyisobutene/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cetearyl olivate": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2907/cetearyl-olivate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "stearyl alcohol": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15539/stearyl-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium lauroyl glutamate": Object.freeze({ category: "cleanser", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14885/sodium-lauroyl-glutamate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium coco-sulfate": Object.freeze({ category: "cleanser", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14690/sodium-coco-sulfate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polysorbate 80": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12497/polysorbate-80/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sorbitan olivate": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15312/sorbitan-olivate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "steareth-2": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15492/steareth-2/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "steareth-21": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15496/steareth-21/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "caprylyl glycol": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2612/caprylyl-glycol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide np": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25522/ceramide-np/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cholesterol": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3117/cholesterol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hexylene glycol": Object.freeze({ category: "solvent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6450/hexylene-glycol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydroxyacetophenone": Object.freeze({ category: "antioxidant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17301/hydroxyacetophenone/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "palmitic acid": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10137/palmitic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "stearic acid": Object.freeze({ category: "cleanser", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15514/stearic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "myristic acid": Object.freeze({ category: "cleanser", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/9266/myristic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "niacinamide": Object.freeze({ category: "smoothing", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/9443/niacinamide/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydroxyethyl acrylate/sodium acryloyldimethyl taurate copolymer": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7079/hydroxyethyl-acrylate-sodium-acryloyldimethyl-taurate-copolymer/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ammonium polyacryloyldimethyl taurate": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/933/ammonium-polyacryloyldimethyl-taurate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ethylhexyl methoxycrylene": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5485/ethylhexyl-methoxycrylene/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glyceryl stearate se": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6059/glyceryl-stearate-se/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyacrylate crosspolymer-6": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17882/polyacrylate-crosspolymer-6/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyhydroxystearic acid": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12317/polyhydroxystearic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "potassium cetyl phosphate": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12639/potassium-cetyl-phosphate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sorbitan isostearate": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15309/sorbitan-isostearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide ap": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2820/ceramide-ap/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide eop": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25521/ceramide-eop/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "phytosphingosine": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11660/phytosphingosine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "silica": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14425/silica/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "alumina": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/738/alumina/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "aluminum stearate": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/792/aluminum-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "dimethicone crosspolymer": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/4584/dimethicone-crosspolymer/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glycol distearate": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6123/glycol-distearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "myristyl myristate": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/9328/myristyl-myristate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "lecithin": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8209/lecithin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "calcium gluconate": Object.freeze({ category: "chelating agent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2389/calcium-gluconate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide as": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25520/ceramide-as/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide ng": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/21295/ceramide-ng/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glyceryl acrylate/acrylic acid copolymer": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5966/glyceryl-acrylate-acrylic-acid-copolymer/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hectorite": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6288/hectorite/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "tapioca starch": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15859/tapioca-starch/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "helianthus annuus sunflower seed wax": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/22005/helianthus-annuus-seed-wax/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "melaleuca alternifolia tea tree leaf oil": Object.freeze({ category: "antioxidant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8748/melaleuca-alternifolia-leaf-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-120 methyl glucose dioleate": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10422/peg-120-methyl-glucose-dioleate"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-30 dipolyhydroxystearate": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10720/peg-30-dipolyhydroxystearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "pentaerythrityl tetraethylhexanoate": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11370/pentaerythrityl-tetraethylhexanoate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyacrylate crosspolymer-11": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19988/polyacrylate-crosspolymer-11/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyglyceryl-4 caprate": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12210/polyglyceryl-4-caprate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sphingolipids": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15386/sphingolipids"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyglyceryl-10 oleate": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12120/polyglyceryl-10-oleate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "gluconic acid": Object.freeze({ category: "chelating agent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5889/gluconic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-40 hydrogenated castor oil": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10814/peg-40-hydrogenated-castor-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium carbonate": Object.freeze({ category: "buffer", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14651/sodium-carbonate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sulisobenzone": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1578/benzophenone-4/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "benzyl alcohol": Object.freeze({ category: "preservative", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1592/benzyl-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "urea": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16737/urea/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glyceryl caprate": Object.freeze({ category: "emollient", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5976/glyceryl-caprate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polysilicone-15": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12473/polysilicone-15/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "drometrizole trisiloxane": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5138/drometrizole-trisiloxane/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "limonene": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8297/limonene/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "linalool": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8307/linalool/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "citral": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3373/citral/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "geraniol": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5834/geraniol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "citronellol": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19208/citronellol"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "eugenol": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5549/eugenol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "coumarin": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19218/coumarin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "farnesol": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5607/farnesol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hexyl cinnamal": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19147/hexyl-cinnamal/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "alpha-isomethyl ionone": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/707/alpha-isomethyl-ionone/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "triethoxycaprylylsilane": Object.freeze({ category: "binder", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16387/triethoxycaprylylsilane/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "p-anisic acid": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10050/p-anisic-acid"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyquaternium-39": Object.freeze({ category: "film former", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12405/polyquaternium-39/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyquaternium-53": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12420/polyquaternium-53/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ppg-5-ceteth-20": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13095/ppg-5-ceteth-20/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "snail secretion filtrate": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://kcia.or.kr/cid/search/ingd_view.php?no=6319"]), authority: "Korea Cosmetic Association / Ingredient Dictionary" }),
    "synthetic beeswax": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15761/synthetic-beeswax/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hexadecyloxy pg hydroxyethyl hexadecanamide": Object.freeze({ category: "moisturizer", sources: Object.freeze(["https://www.kao-kirei.com/ja/official/curel/special/26oilserum/"]), authority: "Kao / Curel official product information" }),
    "peg-6 caprylic/capric glycerides": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10945/peg-6-caprylic-capric-glycerides/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium lauroyl lactylate": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14891/sodium-lauroyl-lactylate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "zinc oxide": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17131/zinc-oxide/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "zea mays starch": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17078/zea-mays-starch"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-8": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11059/peg-8/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "microcrystalline wax": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/fr/inci/ingredient/22305/microcrystalline-wax/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sulfur": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15709/sulfur/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "aminobenzoic acid": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://eur-lex.europa.eu/eli/reg/2009/1223"]), authority: "European Union / EUR-Lex" }),
    "ammonium hydroxide": Object.freeze({ category: "buffer", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/906/ammonium-hydroxide/"]), authority: "Cosmetics Europe / COSMILE Europe" })
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
    "zinc pca": Object.freeze({ note_short: "Humectant and skin-conditioning ingredient; COSMILE Europe lists both functions for Zinc PCA.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17133/zinc-pca/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glycerin": Object.freeze({ note_short: "Humectant and solvent; COSMILE Europe lists Glycerin as moisture-retaining, skin-conditioning, hair-conditioning, solvent and viscosity-controlling in cosmetics.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5951/glycerin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "caprylyl glycol": Object.freeze({ note_short: "Skin-conditioning emollient; COSMILE Europe lists Caprylyl Glycol as softening and smoothing skin, alongside skin- and hair-conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2612/caprylyl-glycol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "citric acid": Object.freeze({ note_short: "Buffering and chelating ingredient; COSMILE Europe lists Citric Acid as controlling cosmetic-product pH and binding metal ions that can affect product stability or appearance.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3374/citric-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "water": Object.freeze({ note_short: "Solvent; COSMILE Europe describes purified water as a solvent and common basis for many cosmetic products.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/23035/water/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "xanthan gum": Object.freeze({ note_short: "Viscosity-controlling and emulsion-stabilising polysaccharide; COSMILE Europe notes that Xanthan Gum forms highly viscous, gel-like solutions and supports gel formation and emulsion stability.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16999/xanthan-gum/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "niacinamide": Object.freeze({ note_short: "Smoothing ingredient; COSMILE Europe lists Niacinamide as seeking a more even skin surface by decreasing roughness or irregularities.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/9443/niacinamide/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide np": Object.freeze({ note_short: "Ceramide lipid and skin/hair-conditioning ingredient; COSMILE Europe describes ceramides as sphingolipids present in the epidermis and lists Ceramide NP for skin and hair conditioning.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25522/ceramide-np/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ethylhexylglycerin": Object.freeze({ note_short: "Skin-conditioning and deodorant ingredient; COSMILE Europe lists both functions for Ethylhexylglycerin.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5500/ethylhexylglycerin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "propanediol": Object.freeze({ note_short: "Humectant, solvent and viscosity-controlling ingredient; COSMILE Europe lists these functions for Propanediol.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13169/propanediol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium chloride": Object.freeze({ note_short: "Mineral salt used for viscosity control and bulking; COSMILE Europe notes that Sodium Chloride has viscosity-regulating and swelling effects in cosmetic products.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14677/sodium-chloride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "tocopherol": Object.freeze({ note_short: "Vitamin E antioxidant and skin-conditioning ingredient; COSMILE Europe lists Tocopherol as limiting oxidation and deterioration of ingredients and maintaining skin condition.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16234/tocopherol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "carbomer": Object.freeze({ note_short: "Polyacrylic-acid polymer used for gel formation, viscosity control and emulsion stability; COSMILE Europe describes Carbomer as a gelling and emulsion-stabilising component.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2648/carbomer/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "chlorphenesin": Object.freeze({ note_short: "Preservative and antimicrobial ingredient; COSMILE Europe lists Chlorphenesin as protecting cosmetics from microbial spoilage and helping control microorganism growth.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3114/chlorphenesin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cetearyl alcohol": Object.freeze({ note_short: "Fatty-alcohol mixture used for emollience, emulsion stability and viscosity control; COSMILE Europe also lists cleansing, emulsifying and foam-boosting surfactant functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2895/cetearyl-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "disodium edta": Object.freeze({ note_short: "Chelating ingredient; COSMILE Europe lists Disodium EDTA as binding metal ions that can affect cosmetic stability or appearance, with an additional viscosity-controlling function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/4934/disodium-edta/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "panthenol": Object.freeze({ note_short: "Provitamin B5 skin- and hair-conditioning ingredient; COSMILE Europe also describes humectant and skin-smoothing properties for Panthenol.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10243/panthenol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "pentylene glycol": Object.freeze({ note_short: "Solvent and skin-conditioning ingredient; COSMILE Europe lists both functions for Pentylene Glycol.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11416/pentylene-glycol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium hyaluronate": Object.freeze({ note_short: "Humectant and skin-conditioning ingredient; COSMILE Europe lists Sodium Hyaluronate as retaining moisture and maintaining skin condition.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14809/sodium-hyaluronate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "dimethicone": Object.freeze({ note_short: "Skin-conditioning silicone; COSMILE Europe lists Dimethicone for skin conditioning, emollience and skin protection, with an antifoaming function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/4583/dimethicone/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polysorbate 20": Object.freeze({ note_short: "Cleansing and emulsifying surfactant; COSMILE Europe lists both functions for Polysorbate 20.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12491/polysorbate-20/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide ap": Object.freeze({ note_short: "Ceramide lipid used for skin and hair conditioning; COSMILE Europe identifies Ceramide AP as a ceramide sphingolipid and lists both conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2820/ceramide-ap/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide eop": Object.freeze({ note_short: "Ceramide lipid used for skin and hair conditioning; COSMILE Europe identifies Ceramide EOP as a ceramide sphingolipid and lists both conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25521/ceramide-eop/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "squalane": Object.freeze({ note_short: "Skin- and hair-conditioning emollient; COSMILE Europe also lists refatting for Squalane and describes a skin-smoothing effect.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15418/squalane/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "trisodium ethylenediamine disuccinate": Object.freeze({ note_short: "Chelating ingredient; COSMILE Europe describes Trisodium Ethylenediamine Disuccinate as binding metal ions to support product stability and cleansing performance in hard water.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16590/trisodium-ethylenediamine-disuccinate/"]), authority: "Cosmetics Europe / COSMILE Europe" })
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
      if (categoryEvidence) {
        const verifiedCategory = normalizeText(categoryEvidence.category);
        const verifiedKey = verifiedCategory.toLowerCase();
        const legacyCategories = atomicCategoryValues(semantics.category).filter((value) => value.toLowerCase() !== verifiedKey);
        current.category = verifiedCategory;
        current.category_verified = true;
        current.category_sources = normalizeNoteSources(categoryEvidence.sources);
        current.category_authority = categoryEvidence.authority;
        if (legacyCategories.length) current.legacy_category_values = legacyCategories;
        else delete current.legacy_category_values;
      } else {
        delete current.category_verified;
        delete current.category_sources;
        delete current.category_authority;
        delete current.legacy_category_values;
      }
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
    version: "1.48.0",
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