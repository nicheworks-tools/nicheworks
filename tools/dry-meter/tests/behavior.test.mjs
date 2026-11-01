import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const app = fs.readFileSync("tools/dry-meter/app.js", "utf8");
const html = fs.readFileSync("tools/dry-meter/index.html", "utf8");
const affiliate = fs.readFileSync("tools/dry-meter/affiliate-config.js", "utf8");

function extractFunction(name) {
  const start = app.indexOf("  function " + name + "(");
  assert.ok(start >= 0, name + " function must exist");
  const end = app.indexOf("\n  }\n", start);
  assert.ok(end > start, name + " function must have a closing brace");
  return app.slice(start, end + 4);
}

// Transition from fetched weather to manually edited conditions.
{
  const state = {
    source: "weather",
    fetchedAt: "2026-11-01T09:00:00",
    precipitation: 5,
    cloud: 95,
    humidity: 42
  };
  vm.runInNewContext(
    extractFunction("switchToManualInputs") + "\nswitchToManualInputs();",
    { state }
  );
  assert.equal(state.source, "manual");
  assert.equal(state.fetchedAt, null);
  assert.equal(state.precipitation, 0);
  assert.equal(state.cloud, 0);
  assert.equal(state.humidity, 42, "keep the newly entered reading");
}

for (const input of ["tempEl", "humidityEl", "windEl"]) {
  const line = app.split("\n").find(row => row.includes(input + '?.addEventListener("input"'));
  assert.ok(line && line.includes("switchToManualInputs();") && line.includes("renderResult();"),
    input + " must switch to manual before rendering");
}
assert.equal((app.match(/switchToManualInputs\(\);/g) || []).length, 4,
  "the three slider handlers and preset handler must clear stale weather data");

// Score is determined by the supplied input, not an ambient weather state.
{
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const labels = {
    target: { laundry: { ja: "洗濯物" } },
    drying: { indoor: { ja: "部屋干し" } }
  };
  const scoreFunction = extractFunction("computeDryScore");
  const base = {
    temp: 20, humidity: 50, wind: 2, precipitation: 5, cloud: 95,
    target: "laundry", drying: "indoor"
  };
  const run = source => vm.runInNewContext(scoreFunction + "\ncomputeDryScore(input);", {
    input: { ...base, source }, clamp, labels,
    state: { source: "weather" }
  });
  assert.ok(run("manual").score > run("weather").score,
    "manual mode must not apply fetched rain and cloud penalties");
}

// Keep fixed general-purpose offers next to drying guidance, not score-based.
const mount = 'id="nwAmazonAffiliate"';
const conditions = html.indexOf('aria-label="Laundry drying conditions"');
const affiliatePosition = html.indexOf(mount);
const faq = html.indexOf('aria-label="FAQ"');
assert.ok(conditions >= 0 && affiliatePosition > conditions && affiliatePosition < faq,
  "general accessories should follow explanatory context, before FAQ");
assert.equal(html.split(mount).length - 1, 1, "only one Amazon mount is allowed");
assert.match(html, /手動入力に切り替わり、降水量・雲量の天気補正は使われなくなります。/);
assert.match(html, /Editing fetched temperature, humidity or wind switches to manual/);
assert.match(affiliate, /nicheworks09-22/, "retain the existing verified tracking ID");
assert.doesNotMatch(affiliate, /state\.score|location\.search/,
  "Amazon offers must not be derived from scores or user URL parameters");

console.log("PASS: Dry Meter manual weather provenance and contextual affiliate placement");
