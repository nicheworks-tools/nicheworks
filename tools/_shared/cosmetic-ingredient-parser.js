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
    "ammonium hydroxide": Object.freeze({ category: "buffer", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/906/ammonium-hydroxide/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed keratin": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6885/hydrolyzed-keratin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed silk": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6982/hydrolyzed-silk/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed collagen": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6824/hydrolyzed-collagen/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "menthol": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8827/menthol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "beeswax": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/21574/beeswax/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "aluminum starch octenylsuccinate": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/791/aluminum-starch-octenylsuccinate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "benzyl benzoate": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1593/benzyl-benzoate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "benzyl salicylate": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1601/benzyl-salicylate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydroxycitronellal": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19143/hydroxycitronellal/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "isoeugenol": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7436/isoeugenol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "amyl cinnamal": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19189/amyl-cinnamal/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed wheat protein": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7030/hydrolyzed-wheat-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed rice protein": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6964/hydrolyzed-rice-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed vegetable protein": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7022/hydrolyzed-vegetable-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed soy protein": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6993/hydrolyzed-soy-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed pea protein": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6937/hydrolyzed-pea-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed elastin": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6846/hydrolyzed-elastin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "collagen": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3743/collagen/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "magnesium chloride": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8518/magnesium-chloride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "calcium chloride": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2378/calcium-chloride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "aluminum hydroxide": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/767/aluminum-hydroxide/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "boron nitride": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1864/boron-nitride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cinnamyl alcohol": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3353/cinnamyl-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyisobutene": Object.freeze({ category: "binder", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12319/polyisobutene/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-60 hydrogenated castor oil": Object.freeze({ category: "emulsifier", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10991/peg-60-hydrogenated-castor-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "kaolin": Object.freeze({ category: "colorant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7698/kaolin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "nylon-12": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/9521/nylon-12/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "guar hydroxypropyltrimonium chloride": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6212/guar-hydroxypropyltrimonium-chloride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "calcium carbonate": Object.freeze({ category: "buffer", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2372/calcium-carbonate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyquaternium-37": Object.freeze({ category: "film former", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12404/polyquaternium-37/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "microcrystalline cellulose": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/9079/microcrystalline-cellulose/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "zinc stearate": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17145/zinc-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polymethyl methacrylate": Object.freeze({ category: "film former", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12336/polymethyl-methacrylate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyacrylate-13": Object.freeze({ category: "film former", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11976/polyacrylate-13/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "magnesium stearate": Object.freeze({ category: "colorant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8561/magnesium-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glycosphingolipids": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6143/glycosphingolipids/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide ns": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25523/ceramide-ns/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "soluble collagen": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15238/soluble-collagen/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ozokerite": Object.freeze({ category: "viscosity adjuster", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10032/ozokerite/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyacrylamide": Object.freeze({ category: "film former", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11964/polyacrylamide/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "padimate o": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5470/ethylhexyl-dimethyl-paba/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "honey extract": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/22039/honey-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "royal jelly extract": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13866/royal-jelly-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "propolis extract": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13177/propolis-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium stearate": Object.freeze({ category: "cleanser", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15088/sodium-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "potassium laurate": Object.freeze({ category: "cleanser", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12701/potassium-laurate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sea salt": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/22800/sea-salt/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "camphor": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2509/camphor/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrochloric acid": Object.freeze({ category: "buffer", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6563/hydrochloric-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "eucalyptus globulus leaf oil": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5516/eucalyptus-globulus-leaf-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "citrus aurantium dulcis orange peel oil": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/21738/citrus-aurantium-dulcis-peel-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "citrus limon lemon peel oil": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/18168/citrus-limon-peel-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "mentha piperita peppermint oil": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/18166/mentha-piperita-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "evernia prunastri extract": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19229/evernia-prunastri-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "evernia furfuracea extract": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19227/evernia-furfuracea-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "dioxybenzone": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun"]), authority: "U.S. Food and Drug Administration (FDA)" }),
    "ensulizole": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun"]), authority: "U.S. Food and Drug Administration (FDA)" }),
    "meradimate": Object.freeze({ category: "uv filter", sources: Object.freeze(["https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun"]), authority: "U.S. Food and Drug Administration (FDA)" }),
    "3-o-ethyl ascorbic acid": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25166/3-o-ethyl-ascorbic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "trametes versicolor extract": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16277/trametes-versicolor-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "madecassic acid": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8503/madecassic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "asiatic acid": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1251/asiatic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "anisyl alcohol": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19193/anise-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "isoamyl salicylate": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/26150/isoamyl-salicylate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "lavandula angustifolia lavender oil": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8190/lavandula-angustifolia-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "copernicia cerifera carnauba wax": Object.freeze({ category: "film former", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3787/copernicia-cerifera-cera/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "euphorbia cerifera candelilla wax": Object.freeze({ category: "film former", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17595/euphorbia-cerifera-cera/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-12": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10395/peg-12/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-75": Object.freeze({ category: "humectant", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11036/peg-75/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ppg-26-buteth-26": Object.freeze({ category: "hair conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12992/ppg-26-buteth-26/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "elastin": Object.freeze({ category: "skin conditioning", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5210/elastin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "disodium edta dihydrate": Object.freeze({ category: "chelating agent", sources: Object.freeze(["https://webprod.hc-sc.gc.ca/nhpid-bdipsn/ingredReq?id=5761"]), authority: "Health Canada / Natural Health Products Ingredients Database" }),
    "benzyl cinnamate": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://kcia.or.kr/cid/search/ingd_view.php?no=524"]), authority: "Korea Cosmetic Association / Ingredient Dictionary" }),
    "citrus aurantium bergamia bergamot fruit oil": Object.freeze({ category: "fragrance", sources: Object.freeze(["https://webprod.hc-sc.gc.ca/nhpid-bdipsn/ingredReq?id=4517"]), authority: "Health Canada / Natural Health Products Ingredients Database" }),
    "talc": Object.freeze({ category: "bulking agent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15804/talc/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "nylon-6": Object.freeze({ category: "bulking agent", sources: Object.freeze(["https://journals.sagepub.com/doi/10.1177/1091581814563524"]), authority: "Cosmetic Ingredient Review / International Journal of Toxicology" }),
    "ptfe": Object.freeze({ category: "bulking agent", sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13392/ptfe/"]), authority: "Cosmetics Europe / COSMILE Europe" })
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
    "allantoin": Object.freeze({ note_short: "Skin-conditioning, skin-protecting and soothing ingredient; COSMILE Europe lists all three functions for Allantoin.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/636/allantoin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cholesterol": Object.freeze({ note_short: "Skin-conditioning emollient; COSMILE Europe also lists Cholesterol for emulsifying, viscosity control and light stabilisation.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3117/cholesterol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "arginine": Object.freeze({ note_short: "Amino acid used for skin and hair conditioning; COSMILE Europe also lists an antistatic function for Arginine.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1160/arginine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "benzoic acid": Object.freeze({ note_short: "Preservative and pH-adjusting ingredient; COSMILE Europe also lists a fragrance function for Benzoic Acid.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1569/benzoic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "butylene glycol": Object.freeze({ note_short: "Humectant, skin-conditioning solvent and viscosity-controlling ingredient; COSMILE Europe lists these functions for Butylene Glycol.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2015/butylene-glycol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "acrylates/c10-30 alkyl acrylate crosspolymer": Object.freeze({ note_short: "Polymer used for emulsion stability, film formation and viscosity control; COSMILE Europe lists all three functions for Acrylates/C10-30 Alkyl Acrylate Crosspolymer.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/377/acrylates-c10-30-alkyl-acrylate-crosspolymer/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glyceryl stearate": Object.freeze({ note_short: "Skin-conditioning emollient and emulsifying surfactant; COSMILE Europe lists both functions for Glyceryl Stearate.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6054/glyceryl-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "phytosphingosine": Object.freeze({ note_short: "Skin- and hair-conditioning ingredient; COSMILE Europe lists both functions for Phytosphingosine.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11660/phytosphingosine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polysorbate 60": Object.freeze({ note_short: "Cleansing and emulsifying surfactant; COSMILE Europe also lists a perfume-oil excipient function for Polysorbate 60.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12494/polysorbate-60/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "salicylic acid": Object.freeze({ note_short: "Keratolytic, preservative and conditioning ingredient; COSMILE Europe lists Salicylic Acid for keratolytic, preservative, skin-conditioning, hair-conditioning and fragrance functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14076/salicylic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium lactate": Object.freeze({ note_short: "Buffering and humectant ingredient with a keratolytic function; COSMILE Europe lists all three functions for Sodium Lactate.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14848/sodium-lactate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sorbitan olivate": Object.freeze({ note_short: "Emulsifying surfactant; COSMILE Europe lists Sorbitan Olivate as enabling stable oil-and-water emulsions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15312/sorbitan-olivate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "caprylic/capric triglyceride": Object.freeze({ note_short: "Skin-conditioning oil component; COSMILE Europe lists a skin-conditioning function and describes smoothing and refatting use for Caprylic/Capric Triglyceride.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2584/caprylic-capric-triglyceride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "alanine": Object.freeze({ note_short: "Amino acid used for skin and hair conditioning; COSMILE Europe also lists antistatic and fragrance functions for Alanine.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/572/alanine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "betaine": Object.freeze({ note_short: "Humectant and skin/hair-conditioning ingredient; COSMILE Europe also lists antistatic and viscosity-controlling functions for Betaine.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1648/betaine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cetearyl olivate": Object.freeze({ note_short: "Skin-conditioning emollient and emulsifying ingredient; COSMILE Europe also lists emulsion-stabilising, hair-conditioning and slip-modifying functions for Cetearyl Olivate.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2907/cetearyl-olivate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "coco-glucoside": Object.freeze({ note_short: "Cleansing and foaming surfactant; COSMILE Europe lists cleansing, foaming and surfactant-cleansing functions for Coco-Glucoside.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3641/coco-glucoside/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed hyaluronic acid": Object.freeze({ note_short: "Humectant and skin/hair-conditioning ingredient; COSMILE Europe lists all three functions for Hydrolyzed Hyaluronic Acid.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17975/hydrolyzed-hyaluronic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydroxyacetophenone": Object.freeze({ note_short: "Antioxidant ingredient; COSMILE Europe lists Hydroxyacetophenone as helping limit oxidation and deterioration of cosmetic ingredients.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17301/hydroxyacetophenone/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "potassium sorbate": Object.freeze({ note_short: "Preservative ingredient; COSMILE Europe also lists a perfume-oil excipient function for Potassium Sorbate.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12776/potassium-sorbate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium pca": Object.freeze({ note_short: "Humectant and skin/hair-conditioning ingredient; COSMILE Europe also lists an antistatic function for Sodium PCA.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15008/sodium-pca/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "pca": Object.freeze({ note_short: "Humectant and moisturising ingredient; COSMILE Europe lists both functions for PCA.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10309/pca/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "serine": Object.freeze({ note_short: "Amino acid used for skin and hair conditioning; COSMILE Europe also lists antistatic and fragrance functions for Serine.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14316/serine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium methyl cocoyl taurate": Object.freeze({ note_short: "Cleansing surfactant; COSMILE Europe lists Sodium Methyl Cocoyl Taurate as a surfactant used to clean skin, hair or teeth.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14933/sodium-methyl-cocoyl-taurate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "tetrasodium edta": Object.freeze({ note_short: "Chelating ingredient; COSMILE Europe lists Tetrasodium EDTA as binding metal ions that could affect product stability or appearance, with a perfume-oil excipient function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16076/tetrasodium-edta/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "threonine": Object.freeze({ note_short: "Amino acid used for hair conditioning; COSMILE Europe also lists antistatic and hair-waving-or-straightening functions for Threonine.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16137/threonine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cocamidopropyl betaine": Object.freeze({ note_short: "Cleansing and foam-boosting surfactant used for hair conditioning and antistatic effects; COSMILE Europe lists these functions for Cocamidopropyl Betaine.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3599/cocamidopropyl-betaine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "dicaprylyl carbonate": Object.freeze({ note_short: "Skin-conditioning emollient; COSMILE Europe lists Dicaprylyl Carbonate as maintaining, softening and smoothing the skin.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/4341/dicaprylyl-carbonate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glutamic acid": Object.freeze({ note_short: "Amino acid used as a humectant and hair-conditioning ingredient; COSMILE Europe also lists an antistatic function for Glutamic Acid.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5909/glutamic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "adenosine": Object.freeze({ note_short: "Skin-conditioning ingredient; COSMILE Europe lists Adenosine as maintaining the skin in good condition.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/484/adenosine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "behentrimonium methosulfate": Object.freeze({ note_short: "Antistatic and hair-conditioning cleansing surfactant; COSMILE Europe lists all three functions for Behentrimonium Methosulfate.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1532/behentrimonium-methosulfate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "butyrospermum parkii shea butter": Object.freeze({ note_short: "Shea butter used for skin conditioning and viscosity control; COSMILE Europe lists both functions for Butyrospermum Parkii Butter.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/18767/butyrospermum-parkii-butter/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glyceryl stearate se": Object.freeze({ note_short: "Emulsifying surfactant; COSMILE Europe lists Glyceryl Stearate SE as supporting stable oil-and-water emulsions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6059/glyceryl-stearate-se/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glycine": Object.freeze({ note_short: "Amino acid used for skin and hair conditioning and buffering; COSMILE Europe also lists an antistatic function for Glycine.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6084/glycine/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "lactic acid": Object.freeze({ note_short: "Buffering, humectant and skin-conditioning ingredient; COSMILE Europe also lists a fragrance-functional role for Lactic Acid.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7749/lactic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-100 stearate": Object.freeze({ note_short: "Cleansing surfactant; COSMILE Europe lists PEG-100 Stearate as a surface-active cleansing ingredient.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10380/peg-100-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "proline": Object.freeze({ note_short: "Amino acid used for skin and hair conditioning; COSMILE Europe lists both functions for Proline.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13164/proline/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "1,2-hexanediol": Object.freeze({ note_short: "Solvent and skin-conditioning ingredient; COSMILE Europe also lists a fragrance-functional role for 1,2-Hexanediol.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5/1-2-hexanediol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium citrate": Object.freeze({ note_short: "Buffering and chelating ingredient; COSMILE Europe lists pH control and metal-ion binding among Sodium Citrate's cosmetic functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/14681/sodium-citrate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "urea": Object.freeze({ note_short: "Moisture-binding ingredient and natural component of skin's moisture factor; COSMILE Europe lists Urea as a humectant, buffer and skin-conditioning ingredient.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16737/urea/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed keratin": Object.freeze({ note_short: "Hydrolyzed Keratin is used for hair conditioning and film formation; COSMILE Europe also lists humectant and skin-conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6885/hydrolyzed-keratin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed silk": Object.freeze({ note_short: "Hydrolyzed Silk serves hair conditioning and moisture retention; COSMILE Europe also lists antistatic and skin-conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6982/hydrolyzed-silk/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed collagen": Object.freeze({ note_short: "Hydrolyzed Collagen is a humectant and film-forming ingredient; COSMILE Europe also lists hair- and skin-conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6824/hydrolyzed-collagen/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "menthol": Object.freeze({ note_short: "Menthol can impart fragrance and a refreshing sensation; COSMILE Europe also lists soothing and denaturant functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8827/menthol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "beeswax": Object.freeze({ note_short: "Beeswax can control formulation viscosity and bind powders; COSMILE Europe also lists emulsion-stabilising and skin-conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/21574/beeswax/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "aluminum starch octenylsuccinate": Object.freeze({ note_short: "Aluminum Starch Octenylsuccinate can control formulation viscosity, absorb dispersed substances and reduce powder caking.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/791/aluminum-starch-octenylsuccinate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "benzyl benzoate": Object.freeze({ note_short: "Benzyl Benzoate serves as a fragrance ingredient or solvent; COSMILE Europe also lists an antimicrobial function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1593/benzyl-benzoate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "benzyl salicylate": Object.freeze({ note_short: "Benzyl Salicylate serves as a fragrance ingredient and a UV absorber that can help protect the cosmetic formulation.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1601/benzyl-salicylate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydroxycitronellal": Object.freeze({ note_short: "Hydroxycitronellal is used to impart fragrance to cosmetic products.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19143/hydroxycitronellal/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "isoeugenol": Object.freeze({ note_short: "Isoeugenol is a fragrance ingredient; COSMILE Europe also lists a flavouring function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7436/isoeugenol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "amyl cinnamal": Object.freeze({ note_short: "Amyl Cinnamal is used to impart fragrance to cosmetic products.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19189/amyl-cinnamal/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed wheat protein": Object.freeze({ note_short: "Hydrolyzed Wheat Protein is used for hair and skin conditioning; COSMILE Europe also lists an antistatic function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7030/hydrolyzed-wheat-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed rice protein": Object.freeze({ note_short: "Hydrolyzed Rice Protein serves hair and skin conditioning and helps reduce static charge in hair.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6964/hydrolyzed-rice-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed vegetable protein": Object.freeze({ note_short: "Hydrolyzed Vegetable Protein can condition hair and skin and is also listed for its antistatic function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7022/hydrolyzed-vegetable-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed soy protein": Object.freeze({ note_short: "Hydrolyzed Soy Protein is a moisture-retaining ingredient; COSMILE Europe also lists hair and skin conditioning and antistatic functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6993/hydrolyzed-soy-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed pea protein": Object.freeze({ note_short: "Hydrolyzed Pea Protein is used for hair conditioning; COSMILE Europe also lists skin conditioning, emollience and antistatic functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6937/hydrolyzed-pea-protein/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrolyzed elastin": Object.freeze({ note_short: "Hydrolyzed Elastin serves hair and skin conditioning; COSMILE Europe also lists emollient use.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6846/hydrolyzed-elastin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "collagen": Object.freeze({ note_short: "Collagen is listed for hair and skin conditioning and moisturising functions in cosmetics.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3743/collagen/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "magnesium chloride": Object.freeze({ note_short: "Magnesium Chloride can adjust a cosmetic formulation's viscosity; COSMILE Europe also lists flavouring and fragrance-functional uses.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8518/magnesium-chloride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "calcium chloride": Object.freeze({ note_short: "Calcium Chloride is used to control cosmetic formulation viscosity; COSMILE Europe also lists an astringent function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2378/calcium-chloride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "aluminum hydroxide": Object.freeze({ note_short: "Aluminum Hydroxide is used for viscosity control, opacifying and skin-protecting functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/767/aluminum-hydroxide/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "boron nitride": Object.freeze({ note_short: "Boron Nitride has skin-conditioning, absorbent and opacifying functions in cosmetics.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1864/boron-nitride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "cinnamyl alcohol": Object.freeze({ note_short: "Cinnamyl Alcohol is used as a fragrance ingredient; COSMILE Europe also lists a flavouring function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3353/cinnamyl-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyisobutene": Object.freeze({ note_short: "Polyisobutene is a binding ingredient; COSMILE Europe also lists film formation and viscosity control.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12319/polyisobutene/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-60 hydrogenated castor oil": Object.freeze({ note_short: "PEG-60 Hydrogenated Castor Oil can help emulsify water and oil; COSMILE Europe also lists cleansing surfactant and fragrance-functional roles.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10991/peg-60-hydrogenated-castor-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "kaolin": Object.freeze({ note_short: "Kaolin can act as a colourant; COSMILE Europe also lists absorbent, abrasive and opacifying functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/7698/kaolin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "nylon-12": Object.freeze({ note_short: "Nylon-12 helps control product viscosity; COSMILE Europe also lists bulking and opacifying functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/9521/nylon-12/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "guar hydroxypropyltrimonium chloride": Object.freeze({ note_short: "Guar Hydroxypropyltrimonium Chloride conditions skin; COSMILE Europe also lists antistatic, film-forming and viscosity-controlling functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6212/guar-hydroxypropyltrimonium-chloride/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "calcium carbonate": Object.freeze({ note_short: "Calcium Carbonate can buffer the pH of a cosmetic formula; COSMILE Europe also lists abrasive, bulking and opacifying functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2372/calcium-carbonate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyquaternium-37": Object.freeze({ note_short: "Polyquaternium-37 forms a film on skin, hair or nails and has an antistatic function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12404/polyquaternium-37/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "microcrystalline cellulose": Object.freeze({ note_short: "Microcrystalline Cellulose can control formula viscosity; COSMILE Europe also lists absorbent, bulking, emulsion-stabilising and opacifying functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/9079/microcrystalline-cellulose/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "zinc stearate": Object.freeze({ note_short: "Zinc Stearate can control cosmetic viscosity; COSMILE Europe also lists anticaking, slip-modifying and colourant functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17145/zinc-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polymethyl methacrylate": Object.freeze({ note_short: "Polymethyl Methacrylate is used to form a continuous film on skin, hair or nails.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12336/polymethyl-methacrylate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyacrylate-13": Object.freeze({ note_short: "Polyacrylate-13 is used as a film-forming ingredient.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11976/polyacrylate-13/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "magnesium stearate": Object.freeze({ note_short: "Magnesium Stearate can be used as a colourant; COSMILE Europe also lists anticaking, bulking and moisturising functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8561/magnesium-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "glycosphingolipids": Object.freeze({ note_short: "Glycosphingolipids are used for skin conditioning.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6143/glycosphingolipids/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ceramide ns": Object.freeze({ note_short: "Ceramide NS conditions skin; COSMILE Europe also lists a hair-conditioning function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25523/ceramide-ns/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "soluble collagen": Object.freeze({ note_short: "Soluble Collagen acts as a humectant; COSMILE Europe also lists film-forming, hair-conditioning, antistatic and skin-conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15238/soluble-collagen/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ozokerite": Object.freeze({ note_short: "Ozokerite can adjust cosmetic viscosity; COSMILE Europe also lists binding, emulsion-stabilising and opacifying functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10032/ozokerite/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "polyacrylamide": Object.freeze({ note_short: "Polyacrylamide forms a continuous film on skin, hair or nails; COSMILE Europe also lists binding and antistatic functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11964/polyacrylamide/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "padimate o": Object.freeze({ note_short: "Padimate O (also called Ethylhexyl Dimethyl PABA) serves as a UV filter; COSMILE Europe also lists UV-absorbing and light-stabilising functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5470/ethylhexyl-dimethyl-paba/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "honey extract": Object.freeze({ note_short: "Honey Extract retains moisture in cosmetic formulations; COSMILE Europe also lists flavouring and skin-conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/22039/honey-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "royal jelly extract": Object.freeze({ note_short: "Royal Jelly Extract is used to condition skin.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13866/royal-jelly-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "propolis extract": Object.freeze({ note_short: "Propolis Extract is used to condition skin.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13177/propolis-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sodium stearate": Object.freeze({ note_short: "Sodium Stearate is a cleansing ingredient; COSMILE Europe also lists emulsifying and viscosity-controlling functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15088/sodium-stearate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "potassium laurate": Object.freeze({ note_short: "Potassium Laurate is a cleansing surfactant; COSMILE Europe also lists an emulsifying function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12701/potassium-laurate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "sea salt": Object.freeze({ note_short: "Sea Salt helps hold moisture in cosmetic products; COSMILE Europe also lists abrasive and skin-conditioning functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/22800/sea-salt/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "camphor": Object.freeze({ note_short: "Camphor has a fragrance function; COSMILE Europe also lists denaturant and plasticiser functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/2509/camphor/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "hydrochloric acid": Object.freeze({ note_short: "Hydrochloric Acid is used to help control the pH of cosmetic formulations.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/6563/hydrochloric-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "eucalyptus globulus leaf oil": Object.freeze({ note_short: "Eucalyptus Globulus Leaf Oil provides fragrance; COSMILE Europe also lists skin conditioning.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5516/eucalyptus-globulus-leaf-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "citrus aurantium dulcis orange peel oil": Object.freeze({ note_short: "Orange peel oil is used for fragrance; COSMILE Europe also lists a skin-conditioning function for Citrus Aurantium Dulcis Peel Oil.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/21738/citrus-aurantium-dulcis-peel-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "citrus limon lemon peel oil": Object.freeze({ note_short: "Lemon peel oil is used for fragrance; COSMILE Europe also lists skin conditioning for Citrus Limon Peel Oil.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/18168/citrus-limon-peel-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "mentha piperita peppermint oil": Object.freeze({ note_short: "Peppermint Oil is used for fragrance; COSMILE Europe also lists refreshing and tonic functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/18166/mentha-piperita-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "evernia prunastri extract": Object.freeze({ note_short: "Evernia Prunastri (oakmoss) Extract is a fragrance ingredient.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19229/evernia-prunastri-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "evernia furfuracea extract": Object.freeze({ note_short: "Evernia Furfuracea (tree moss) Extract is a fragrance ingredient.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19227/evernia-furfuracea-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "dioxybenzone": Object.freeze({ note_short: "Dioxybenzone is listed by the FDA as a sunscreen active ingredient; this identifies its UV-filtering purpose, not a safety or approval determination.", note_sources: Object.freeze(["https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun"]), authority: "U.S. Food and Drug Administration (FDA)" }),
    "ensulizole": Object.freeze({ note_short: "Ensulizole is listed by the FDA as a sunscreen active ingredient used for UV protection; the listing alone does not establish product safety.", note_sources: Object.freeze(["https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun"]), authority: "U.S. Food and Drug Administration (FDA)" }),
    "meradimate": Object.freeze({ note_short: "Meradimate is listed by the FDA as a sunscreen active ingredient for UV protection; this is a function description, not a product safety assessment.", note_sources: Object.freeze(["https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun"]), authority: "U.S. Food and Drug Administration (FDA)" }),
    "3-o-ethyl ascorbic acid": Object.freeze({ note_short: "3-O-Ethyl Ascorbic Acid is listed for skin-conditioning use in cosmetics.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/25166/3-o-ethyl-ascorbic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "trametes versicolor extract": Object.freeze({ note_short: "Trametes Versicolor Extract is listed as a hair-conditioning ingredient in cosmetics.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/16277/trametes-versicolor-extract/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "madecassic acid": Object.freeze({ note_short: "Madecassic Acid is listed for skin-conditioning use in cosmetics.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8503/madecassic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "asiatic acid": Object.freeze({ note_short: "Asiatic Acid is used for skin conditioning; COSMILE Europe also lists light-stabilizing properties.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/1251/asiatic-acid/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "anisyl alcohol": Object.freeze({ note_short: "Anisyl Alcohol (also called Anise Alcohol) is used to impart fragrance to cosmetic products.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/19193/anise-alcohol/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "isoamyl salicylate": Object.freeze({ note_short: "Isoamyl Salicylate is used as a fragrance ingredient in cosmetics.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/26150/isoamyl-salicylate/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "lavandula angustifolia lavender oil": Object.freeze({ note_short: "Lavandula Angustifolia (Lavender) Oil is used for fragrance; COSMILE Europe also lists a tonic function.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/8190/lavandula-angustifolia-oil/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "copernicia cerifera carnauba wax": Object.freeze({ note_short: "Copernicia Cerifera (Carnauba) Wax can form a film; COSMILE Europe also lists skin-conditioning and emollient functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/3787/copernicia-cerifera-cera/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "euphorbia cerifera candelilla wax": Object.freeze({ note_short: "Euphorbia Cerifera (Candelilla) Wax can form a film; COSMILE Europe also lists emulsion stabilization, gel formation and viscosity control.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/17595/euphorbia-cerifera-cera/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-12": Object.freeze({ note_short: "PEG-12 retains moisture in cosmetic products and is also listed as a solvent and fragrance-functional ingredient.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/10395/peg-12/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "peg-75": Object.freeze({ note_short: "PEG-75 retains moisture and can also bind powdered ingredients or act as a solvent in cosmetics.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/11036/peg-75/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "ppg-26-buteth-26": Object.freeze({ note_short: "PPG-26-Buteth-26 is listed for hair and skin conditioning, with a fragrance-functional role.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/12992/ppg-26-buteth-26/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "elastin": Object.freeze({ note_short: "Elastin is used for skin conditioning and smoothing in cosmetic products.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/5210/elastin/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "disodium edta dihydrate": Object.freeze({ note_short: "Disodium EDTA Dihydrate binds metal ions (chelating agent); Health Canada lists this exact hydrated ingredient for non-medicinal chelation.", note_sources: Object.freeze(["https://webprod.hc-sc.gc.ca/nhpid-bdipsn/ingredReq?id=5761"]), authority: "Health Canada / Natural Health Products Ingredients Database" }),
    "benzyl cinnamate": Object.freeze({ note_short: "Benzyl Cinnamate is used for fragrance in cosmetic products; this function does not predict allergy in a particular individual.", note_sources: Object.freeze(["https://kcia.or.kr/cid/search/ingd_view.php?no=524"]), authority: "Korea Cosmetic Association / Ingredient Dictionary" }),
    "citrus aurantium bergamia bergamot fruit oil": Object.freeze({ note_short: "Citrus Aurantium Bergamia (Bergamot) Fruit Oil is listed by Health Canada for non-medicinal fragrance use; product-specific restrictions and quality still require separate review.", note_sources: Object.freeze(["https://webprod.hc-sc.gc.ca/nhpid-bdipsn/ingredReq?id=4517"]), authority: "Health Canada / Natural Health Products Ingredients Database" }),
    "talc": Object.freeze({ note_short: "Talc can provide a bulking function in cosmetics; COSMILE Europe also lists absorbent, anticaking, opacifying and slip-modifying functions.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/15804/talc/"]), authority: "Cosmetics Europe / COSMILE Europe" }),
    "nylon-6": Object.freeze({ note_short: "Nylon-6 belongs to the nylon polymers used mainly as bulking and opacifying agents in cosmetics, according to the Cosmetic Ingredient Review assessment.", note_sources: Object.freeze(["https://journals.sagepub.com/doi/10.1177/1091581814563524"]), authority: "Cosmetic Ingredient Review / International Journal of Toxicology" }),
    "ptfe": Object.freeze({ note_short: "PTFE is listed by COSMILE Europe for its bulking function in cosmetic formulations; this is not a product safety determination.", note_sources: Object.freeze(["https://cosmileeurope.eu/inci/detail/13392/ptfe/"]), authority: "Cosmetics Europe / COSMILE Europe" })
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
    version: "1.64.0",
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