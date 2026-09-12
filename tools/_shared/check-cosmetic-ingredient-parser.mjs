import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const parser = require("./cosmetic-ingredient-parser.js");

assert.deepEqual(
  parser.splitIngredients("Water, Glycerin\nNiacinamide"),
  ["Water", "Glycerin", "Niacinamide"],
  "comma/newline parsing should work"
);

assert.deepEqual(
  parser.splitIngredients("水、グリセリン；香料"),
  ["水", "グリセリン", "香料"],
  "Japanese punctuation parsing should work"
);

assert.deepEqual(
  parser.splitIngredients("PEG/PPG-17/6 Copolymer, Water"),
  ["PEG/PPG-17/6 Copolymer", "Water"],
  "slash-containing INCI names must stay intact"
);

assert.deepEqual(
  parser.splitIngredients("ラウロイルメチルアラニンNa・水, グリセリン"),
  ["ラウロイルメチルアラニンNa・水", "グリセリン"],
  "middle-dot text must not be split unconditionally"
);

assert.deepEqual(
  parser.splitIngredients("1,2-Hexanediol, Glycerin"),
  ["1,2-Hexanediol", "Glycerin"],
  "numeric locant commas inside ingredient names must stay intact"
);

assert.deepEqual(
  parser.splitIngredients("Water, water, WATER", { dedupe: true }),
  ["Water"],
  "dedupe should use normalized ingredient keys"
);

assert.equal(
  parser.isExactIngredientMatch("Alcohol", "ALCOHOL"),
  true,
  "exact matching should normalize case"
);

assert.equal(
  parser.isExactIngredientMatch("Cetearyl Alcohol", "Alcohol"),
  false,
  "fatty alcohol names must not match plain alcohol by substring"
);

const aliasPairs = [
  ["精製水", "Water"],
  ["グリセロール", "Glycerin"],
  ["1,3-ブチレングリコール", "Butylene Glycol"],
  ["塩化ナトリウム", "Sodium Chloride"],
  ["クエン酸ナトリウム", "Sodium Citrate"],
  ["水酸化ナトリウム", "Sodium Hydroxide"],
  ["エデト酸2ナトリウム", "Disodium EDTA"],
  ["エデト酸二ナトリウム", "Disodium EDTA"],
  ["ニコチン酸アミド", "Niacinamide"],
  ["ヒアルロン酸ナトリウム", "Sodium Hyaluronate"],
  ["ヒアルロン酸ソーダ", "Sodium Hyaluronate"],
  ["乳酸ナトリウム", "Sodium Lactate"],
  ["Alcohol Denat", "Alcohol Denat."]
];

for (const [alias, canonicalOrDeclaredAlias] of aliasPairs) {
  assert.equal(
    parser.normalizeKey(alias),
    parser.normalizeKey(canonicalOrDeclaredAlias),
    `shared alias equivalence should normalize identically: ${alias}`
  );
}

console.log("cosmetic ingredient parser regression checks passed");
