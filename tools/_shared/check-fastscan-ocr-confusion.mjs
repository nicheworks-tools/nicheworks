import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const parser = require("./cosmetic-ingredient-parser.js");
const matcherSource = fs.readFileSync("tools/inci-fastscan/js/core_matcher.js", "utf8");
const context = vm.createContext({ console, NWCosmeticIngredientParser: parser });
vm.runInContext(matcherSource, context, { filename: "core_matcher.js" });

const dict = [
  { en: "Phenoxyethanol", jp: ["フェノキシエタノール"], alias: [], safety: "safe", category: "preservative" },
  { en: "Glycerin", jp: ["グリセリン"], alias: [], safety: "safe", category: "humectant" },
  { en: "Niacinamide", jp: ["ナイアシンアミド"], alias: [], safety: "safe", category: "active" }
];

const [phenoxy, glycerin, niacinamide, ordinaryTypo, exact] = await context.coreMatchIngredients(
  ["PhenoxyethanoI", "Glycerln", "Niacinamlde", "Phenoxyethanox", "Phenoxyethanol"],
  dict
);

assert.equal(phenoxy.found, false);
assert.equal(phenoxy.ocr_confusion?.en, "Phenoxyethanol");
assert.equal(glycerin.ocr_confusion?.en, "Glycerin");
assert.equal(niacinamide.ocr_confusion?.en, "Niacinamide");
assert.equal(ordinaryTypo.found, false);
assert.equal(ordinaryTypo.ocr_confusion, null, "ordinary spelling edits must not be labelled as OCR character confusion");
assert.equal(exact.found, true);
assert.equal(exact.en, "Phenoxyethanol");

console.log("FastScan OCR confusion regression checks passed");
