import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const source = read("app.js");
const css = read("styles.css");
const motions = JSON.parse(read("data/motions.json"));
const en = read("index.html");
const ja = read("ja/index.html");

// Syntax-check the actual browser runtime (does not execute browser APIs).
new vm.Script(source, { filename: "tools/motion-atlas/app.js" });

assert.equal(motions.length, 42, "catalog should contain the original 30 and 12 new patterns");
const ids = new Set(motions.map((m) => m.id));
const slugs = new Set(motions.map((m) => m.slug));
assert.equal(ids.size, motions.length, "duplicate motion ID");
assert.equal(slugs.size, motions.length, "duplicate motion slug");
assert.equal(new Set(motions.map((m) => m.summary_ja)).size, motions.length, "duplicate Japanese summaries");

const required = [
  "id", "slug", "name_en", "name_ja", "category", "motion_type", "trigger",
  "summary_en", "summary_ja", "practical_intent_en", "practical_intent_ja",
  "use_case_en", "use_case_ja", "not_for_en", "not_for_ja",
  "bad_request_en", "bad_request_ja", "better_request_en", "better_request_ja",
  "short_ai_prompt_en", "short_ai_prompt_ja", "code_hint_css", "demo_type",
  "demo_config", "reduced_motion_fallback_en", "reduced_motion_fallback_ja",
  "implementation_notes_en", "implementation_notes_ja", "compare_ids",
];

for (const m of motions) {
  for (const key of required) assert.ok(m[key], m.slug + ": missing " + key);
  assert.ok(Array.isArray(m.motion_type) && m.motion_type.length, m.slug + ": missing motion types");
  assert.ok(Array.isArray(m.compare_ids) && m.compare_ids.length, m.slug + ": missing comparisons");
  for (const id of m.compare_ids) assert.ok(ids.has(id), m.slug + ": dangling " + id);
  assert.ok(m.demo_config.duration_ms >= 100, m.slug + ": invalid duration");
  assert.match(css, new RegExp("is-replaying\\[data-demo=\\\"" + m.demo_type + "\\\"\\]"), m.slug + ": missing replay animation");
  assert.ok(m.code_hint_css.length >= 70, m.slug + ": CSS hint too thin");
  assert.ok(m.summary_en.length >= 35, m.slug + ": generic English summary");
  assert.ok(m.summary_ja.length >= 12, m.slug + ": Japanese summary too short");
  assert.notEqual(m.name_en, m.name_ja, m.slug + ": missing localization");
}

const newSlugs = [
  "burst", "line-draw", "mask-reveal", "kinetic-typography", "easing-comparison",
  "overshoot", "squash-stretch", "morph", "liquid-motion", "motion-trail",
  "particle-burst", "parallax",
];
for (const slug of newSlugs) assert.ok(slugs.has(slug), "missing expanded catalog pattern " + slug);

assert.match(source, /function compareLimit\(\)\{ return 4; \}/);
assert.doesNotMatch(source, /showLockedPro|buy\.stripe\.com|nicheworks_pro/);
assert.match(source, /entitlement:"free"/);
assert.match(source, /URL\.createObjectURL\(blob\)/);
assert.match(source, /anchor\.download=/);
assert.match(source, /requestAnimationFrame\(tick\)/);
assert.match(source, /document\.createElementNS\(ns,"path"\)/);
assert.match(source, /demo-stagger-step/);
assert.match(source, /if\(!reduced\)replay\(els\.detail\)/);
assert.match(css, /@keyframes atlasBurst/);
assert.match(css, /@keyframes atlasMorph/);
assert.match(css, /@keyframes atlasEasingTravel/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(en, /data-pro-active="true"/);
assert.match(ja, /data-pro-active="true"/);
assert.doesNotMatch(en, /buy\.stripe\.com/);
assert.doesNotMatch(ja, /buy\.stripe\.com/);
for (const [language, html] of [["en", en], ["ja", ja]]) {
  assert.match(html, /\/assets\/nw-tool-analytics\.js/, language + ": existing event helper not loaded");
  assert.match(html, /\/assets\/nw-tool-analytics-pilot\.js/, language + ": missing search/compare/detail event wiring");
}
assert.match(source, /function trackUsage\(name\)\{ window\.NWToolAnalytics\?\.track\(name\); \}/);
assert.match(source, /trackUsage\("tool_execute"\)/, "handoff action should be measurable");
assert.match(source, /trackUsage\("result_shown"\)/, "handoff rendering should be measurable");
assert.match(source, /trackUsage\("download_result"\)/, "file export should be measurable");
assert.match(source, /trackUsage\("copy_result"\)/, "successful handoff copies should be measurable");
assert.doesNotMatch(source, /gtag\(['"]event['"]/, "tool must use shared allowlisted event helper");

console.log("Motion Atlas behavior-contract tests passed: 42 bilingual motions, demo wiring, free outputs, safety fallbacks.");

// Include the separately gated Studio tests in the existing tool behavior runner.
await import("./studio-contract.test.mjs");
