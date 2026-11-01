import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const html = fs.readFileSync(new URL("index.html", root), "utf8");
const app = fs.readFileSync(new URL("app.js", root), "utf8");
const css = fs.readFileSync(new URL("style.css", root), "utf8");
const affiliate = fs.readFileSync(new URL("affiliate-config.js", root), "utf8");

const checkboxes = [...html.matchAll(/name="packingReady" value="([^"]+)"/g)].map(m => m[1]);
assert.equal(checkboxes.length, 4, "four basic packing-supply checks");
assert.equal(new Set(checkboxes).size, 4, "no duplicate supply items");
assert.ok(["boxes", "tape", "cushion", "clothes"].every(key => checkboxes.includes(key)));

const keys = [
  "packingTitle", "packingIntro", "packingBoxes", "packingTape",
  "packingCushion", "packingClothes", "packingDisclaimer"
];
for (const key of keys) {
  assert.ok(html.includes('data-i18n="' + key + '"'), "missing visible bilingual label " + key);
  assert.equal(app.split(key + ": ").length - 1, 2, "both JP and EN dictionaries must define " + key);
}

const packingPos = html.indexOf('aria-label="Packing supply readiness"');
const affiliatePos = html.indexOf('id="nwAmazonAffiliate"');
const officialFormPos = html.indexOf('aria-label="Generator form"');
assert.ok(packingPos >= 0 && affiliatePos > packingPos && officialFormPos > affiliatePos,
  "existing Amazon block must follow packing help and precede official checklist form");
assert.equal(html.split('id="nwAmazonAffiliate"').length - 1, 1);
assert.ok(html.includes('class="panel packing-readiness no-print"'),
  "packing shopping guide must not pollute printable moving checklist");
assert.ok(html.includes('Buying products does not complete municipal'),
  "must clearly distinguish shopping from administrative tasks");
assert.ok(html.includes("手元にある物を確認") && html.includes("再利用"), "re-use before buy");
assert.ok(css.includes(".packing-list label"), "mobile packing-list styling");

assert.ok(affiliate.includes('nicheworks09-22'), "keep verified Amazon tracking unchanged");
assert.ok(affiliate.includes('enabled: true'));
assert.ok(!app.includes('name="packingReady"') && !app.includes('getElementsByName("packingReady")'),
  "temporary supplies checks must not affect state/persistence or recommendation logic");

console.log("PASS: Moving packing-readiness guide, affiliate boundary and bilingual content");
