(() => {
  const items = [];
  const seen = new Set();
  const slug = value => String(value).normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 96);

  function add(en, category, safety = "safe", jp = [], alias = []) {
    const key = String(en).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({
      id: `generated_v1_${slug(en)}`,
      en,
      jp: Array.from(new Set([en, ...jp].filter(Boolean))),
      alias: Array.from(new Set(alias.filter(Boolean))),
      safety,
      category,
      note_short: "Generated dictionary entry. Use official ingredient labels for final confirmation."
    });
  }

  function series(prefix, numbers, category, safety = "safe", jpPrefix = "") {
    numbers.forEach(n => add(`${prefix}-${n}`, category, safety, jpPrefix ? [`${jpPrefix}-${n}`] : []));
  }

  const nums = [2,3,4,5,6,7,8,9,10,12,14,15,16,18,20,21,23,25,30,32,35,40,45,50,55,60,75,80,90,100,120,150];
  series("PEG", nums, "humectant/solvent", "safe", "PEG");
  series("PPG", [2,3,4,5,6,7,8,9,10,12,14,15,17,20,25,26,30,33,40,50,70], "solvent", "safe", "PPG");
  [["Laureth","ラウレス"],["Steareth","ステアレス"],["Ceteareth","セテアレス"],["Ceteth","セテス"],["Oleth","オレス"],["Beheneth","ベヘネス"],["Trideceth","トリデセス"],["Isoceteth","イソセテス"]].forEach(([p,j]) => series(p, [2,3,4,5,6,7,8,9,10,12,15,20,21,23,25,30,40,50,60], "emulsifier", "safe", j));

  [20,21,40,60,61,65,80,81,85].forEach(n => add(`Polysorbate ${n}`, "emulsifier", "safe", [`ポリソルベート${n}`]));
  ["Caprylate","Cocoate","Isostearate","Laurate","Oleate","Olivate","Palmitate","Sesquioleate","Stearate","Tristearate"].forEach(x => add(`Sorbitan ${x}`, "emulsifier"));

  const acids = ["Caprylate","Caprate","Laurate","Myristate","Palmitate","Stearate","Isostearate","Oleate","Linoleate","Ethylhexanoate","Ricinoleate"];
  const bases = ["Ethylhexyl","Isopropyl","Isocetyl","Isostearyl","Cetyl","Cetearyl","Stearyl","Myristyl","Octyldodecyl","Neopentyl Glycol","Glyceryl","Polyglyceryl-2","Polyglyceryl-3","Polyglyceryl-4","Polyglyceryl-6","Polyglyceryl-10"];
  bases.forEach(base => acids.forEach(acid => add(`${base} ${acid}`, base.startsWith("Polyglyceryl") ? "emulsifier" : "emollient")));

  ["Caprylic Acid","Capric Acid","Lauric Acid","Myristic Acid","Palmitic Acid","Stearic Acid","Arachidic Acid","Behenic Acid","Oleic Acid","Linoleic Acid","Linolenic Acid","Isostearic Acid","12-Hydroxystearic Acid"].forEach(x => add(x, "emollient"));
  ["Lauryl Alcohol","Myristyl Alcohol","Cetyl Alcohol","Stearyl Alcohol","Cetearyl Alcohol","Behenyl Alcohol","Arachidyl Alcohol","Oleyl Alcohol","Isostearyl Alcohol","Octyldodecanol","Decyltetradecanol"].forEach(x => add(x, "emollient"));

  ["Dimethicone Crosspolymer","Dimethicone/Vinyl Dimethicone Crosspolymer","PEG-10 Dimethicone","PEG-12 Dimethicone","PEG/PPG-18/18 Dimethicone","Bis-PEG-18 Methyl Ether Dimethyl Silane","Bis-PEG/PPG-14/14 Dimethicone","Cetyl Dimethicone","Lauryl PEG-9 Polydimethylsiloxyethyl Dimethicone","Polysilicone-11","Polysilicone-15","Silicone Quaternium-18","Stearyl Dimethicone"].forEach(x => add(x, "silicone"));

  ["Agar","Algin","Alginic Acid","Ammonium Polyacrylate","Carbomer Homopolymer","Carrageenan","Cellulose","Dextran","Dextrin","Hydroxypropyl Cellulose","Hydroxypropyl Methylcellulose","Magnesium Aluminum Silicate","Polyacrylate Crosspolymer-6","Polyacrylate-13","Polyacrylate-33","Polyacrylamide","Polyethylene","Sodium Acrylate/Sodium Acryloyldimethyl Taurate Copolymer","Sodium Carbomer","Sodium Polyacrylate","Tara Gum","Tragacanth Gum"].forEach(x => add(x, "thickener", x.includes("Acrylamide") ? "caution" : "safe"));
  ["Bromochlorophene","Bromonitropropane","Calcium Benzoate","Chlorobutanol","Chloroxylenol","Ethyl Lauroyl Arginate HCl","Hexamidine Diisethionate","Laurylpyridinium Chloride","o-Cymen-5-ol","Phenethyl Alcohol","Phenylpropanol","Potassium Benzoate","Sodium Metabisulfite","Sodium Sulfite","Sorbityl Furfural","Thymol","Zinc Undecylenate"].forEach(x => add(x, "preservative", "caution"));
  ["Disodium EDTA","Trisodium EDTA","Tetrasodium EDTA","Disodium Phosphate","Disodium Pyrophosphate","Etidronic Acid","HEDTA","Pentasodium Pentetate","Sodium Gluconate","Sodium Hexametaphosphate","Sodium Metaphosphate","Sodium Polyphosphate","Sodium Tripolyphosphate","Tetrasodium Glutamate Diacetate"].forEach(x => add(x, "chelator"));
  ["Benzophenone-1","Benzophenone-2","Benzophenone-5","Benzophenone-6","Benzophenone-9","Benzylidene Camphor Sulfonic Acid","Butyl Methoxydibenzoylmethane","Camphor Benzalkonium Methosulfate","Diethylhexyl Butamido Triazone","Drometrizole Trisiloxane","Ethylhexyl Dimethyl PABA","Ethylhexyl Methoxycinnamate","Ethylhexyl Salicylate","Ethylhexyl Triazone","Isoamyl p-Methoxycinnamate","Octocrylene","Phenylbenzimidazole Sulfonic Acid","Polysilicone-15","Terephthalylidene Dicamphor Sulfonic Acid"].forEach(x => add(x, "uv filter", x.includes("Benzophenone") ? "risk" : "caution"));

  ["CI 10316","CI 11680","CI 11710","CI 12085","CI 12490","CI 14700","CI 14720","CI 15510","CI 15525","CI 15630","CI 15800","CI 15865","CI 16185","CI 16255","CI 17200","CI 18050","CI 18736","CI 18965","CI 19140","CI 20040","CI 20470","CI 21108","CI 26100","CI 27755","CI 28440","CI 40215","CI 42051","CI 42053","CI 42090","CI 45100","CI 45170","CI 45350","CI 45370","CI 45380","CI 45410","CI 47000","CI 47005","CI 61565","CI 61570","CI 69800","CI 73000","CI 73015","CI 74160","CI 75120","CI 75125","CI 75130","CI 75170","CI 75300","CI 75470","CI 75810","CI 77000","CI 77002","CI 77004","CI 77007","CI 77015","CI 77163","CI 77220","CI 77231","CI 77266","CI 77288","CI 77289","CI 77400","CI 77480","CI 77510","CI 77742","CI 77947"].forEach(x => add(x, "colorant", "caution"));

  ["Acer Saccharum (Sugar Maple) Extract","Achillea Millefolium Extract","Althaea Officinalis Root Extract","Ananas Sativus (Pineapple) Fruit Extract","Anthemis Nobilis Flower Extract","Arctium Lappa Root Extract","Arnica Montana Flower Extract","Aspalathus Linearis Extract","Bambusa Vulgaris Leaf Extract","Boswellia Serrata Extract","Brassica Oleracea Italica (Broccoli) Extract","Carica Papaya (Papaya) Fruit Extract","Citrus Grandis (Grapefruit) Fruit Extract","Curcuma Longa (Turmeric) Root Extract","Echinacea Purpurea Extract","Equisetum Arvense Extract","Ficus Carica (Fig) Fruit Extract","Ginkgo Biloba Leaf Extract","Hibiscus Sabdariffa Flower Extract","Nelumbo Nucifera Flower Extract","Opuntia Ficus-Indica Stem Extract","Pyrus Malus (Apple) Fruit Extract","Rosa Canina Fruit Extract","Rosa Damascena Flower Extract","Rubus Idaeus (Raspberry) Fruit Extract","Salix Alba (Willow) Bark Extract","Sambucus Nigra Flower Extract","Silybum Marianum Extract","Thymus Vulgaris (Thyme) Extract","Tilia Cordata Flower Extract","Vaccinium Angustifolium (Blueberry) Fruit Extract","Vaccinium Macrocarpon (Cranberry) Fruit Extract","Vitis Vinifera (Grape) Fruit Extract","Zingiber Officinale (Ginger) Root Extract"].forEach(x => add(x, "plant extract", x.includes("Citrus") || x.includes("Willow") ? "caution" : "safe"));

  ["Aspergillus Ferment","Bacillus Ferment","Bifida Ferment Filtrate","Bifida Ferment Lysate","Lactococcus Ferment Lysate","Lactobacillus Ferment Lysate","Lactobacillus/Soybean Ferment Extract","Pseudoalteromonas Ferment Extract","Saccharomyces Copper Ferment","Saccharomyces Iron Ferment","Saccharomyces Magnesium Ferment","Saccharomyces Potassium Ferment","Saccharomyces Zinc Ferment","Streptococcus Thermophilus Ferment"].forEach(x => add(x, "ferment"));
  ["Acetyl Dipeptide-1 Cetyl Ester","Acetyl Tetrapeptide-2","Acetyl Tetrapeptide-5","Acetyl Tetrapeptide-9","Acetyl Tetrapeptide-11","Acetyl Octapeptide-3","Carnosine","Dipeptide-2","Dipeptide Diaminobutyroyl Benzylamide Diacetate","Hexapeptide-9","Nonapeptide-1","Palmitoyl Dipeptide-5","Palmitoyl Hexapeptide-12","Palmitoyl Oligopeptide","Palmitoyl Pentapeptide-4","Palmitoyl Tripeptide-5","Pentapeptide-18","Tripeptide-1","Tripeptide-10 Citrulline"].forEach(x => add(x, "peptide"));

  window.NW_INCI_GENERATED_DICTIONARY = items;
})();
