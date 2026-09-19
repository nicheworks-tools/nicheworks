#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8"));
}
function text(value) {
  return typeof value === "string" ? value.trim() : "";
}
function fail(message) {
  throw new Error(message);
}
function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b, "en"));
}

const policy = readJson("revenue-priority-policy-v2.3.json");
const image = readJson("public-image-inventory-v2.3.json");
const affiliate = readJson("affiliate-offers-v2.3.json");
const content = readJson("public-content-quality-v2.3.json");

if (policy?.schema !== "cta-revenue-priority-policy-v2.3") fail("unexpected revenue policy schema");
if (image?.schema !== "cta-public-image-inventory-v2.3") fail("unexpected public image inventory schema");
if (affiliate?.schema !== "cta-affiliate-offers-v2.3") fail("unexpected affiliate schema");
if (content?.schema !== "cta-public-content-quality-v2.3") fail("unexpected content quality schema");
if (affiliate?.policy?.query_source !== "maintained_canonical_mapping_only") fail("affiliate query source must remain maintained canonical mapping only");
if (affiliate?.policy?.free_text_forwarding !== false) fail("free-text affiliate forwarding must remain disabled");

const rows = Array.isArray(image?.lifecycle?.rows) ? image.lifecycle.rows : [];
const publicIds = new Set();
for (const row of rows) {
  const id = text(row?.id);
  if (!id) fail("public image lifecycle row missing id");
  if (publicIds.has(id)) fail(`${id}: duplicate public lifecycle row`);
  publicIds.add(id);
}

const quality = content?.summary || {};
if (quality.public_entries !== rows.length) fail("content/image public entry count mismatch");
if (quality.fallback_independent_core !== rows.length) fail("revenue planning requires fallback-independent core content for every public entry");
if (quality.runtime_fallback_dependent !== 0) fail("revenue planning requires zero runtime fallback-dependent public entries");
if (quality.missing_core_bilingual_content !== 0) fail("revenue planning requires zero missing bilingual core entries");

const activeOffers = new Map();
for (const offer of Array.isArray(affiliate?.offers) ? affiliate.offers : []) {
  const id = text(offer?.entry_id);
  if (!id) fail("affiliate offer missing entry_id");
  if (offer?.status !== "active") continue;
  if (activeOffers.has(id)) fail(`${id}: duplicate active affiliate mapping`);
  if (!publicIds.has(id)) fail(`${id}: active affiliate target is not a public canonical`);
  activeOffers.set(id, offer);
}

const groups = {
  affiliate_in_progress: [],
  seo_commerce_ready_with_image: [],
  seo_commerce_ready_image_not_required: [],
  affiliate_image_backlog: [],
  organic_image_ready: [],
  non_affiliate_image_backlog: [],
  not_required_non_affiliate: []
};

const inProgressStages = new Set(["candidate", "provenance_verified", "subject_verified", "verified"]);

for (const row of rows) {
  const id = text(row.id);
  const stage = text(row.stage);
  const hasAffiliate = activeOffers.has(id);

  if (stage === "not_required") {
    (hasAffiliate ? groups.seo_commerce_ready_image_not_required : groups.not_required_non_affiliate).push(id);
    continue;
  }
  if (stage === "promoted") {
    (hasAffiliate ? groups.seo_commerce_ready_with_image : groups.organic_image_ready).push(id);
    continue;
  }
  if (stage === "awaiting_source") {
    (hasAffiliate ? groups.affiliate_image_backlog : groups.non_affiliate_image_backlog).push(id);
    continue;
  }
  if (inProgressStages.has(stage)) {
    if (hasAffiliate) groups.affiliate_in_progress.push(id);
    else groups.non_affiliate_image_backlog.push(id);
    continue;
  }
  fail(`${id}: unsupported image lifecycle stage ${stage || "<blank>"}`);
}

for (const key of Object.keys(groups)) groups[key] = sorted(groups[key]);

const classified = Object.values(groups).reduce((sum, ids) => sum + ids.length, 0);
if (classified !== rows.length) fail(`revenue grouping lost rows: ${classified}/${rows.length}`);

const launchCohort = sorted([
  ...groups.seo_commerce_ready_with_image,
  ...groups.seo_commerce_ready_image_not_required
]);

const report = {
  schema: "cta-revenue-readiness-report-v2.3",
  generated_from: {
    revenue_policy_version: policy.version,
    image_inventory_version: image.version,
    affiliate_version: affiliate.version,
    content_quality_version: content.version
  },
  guardrails: {
    earnings_forecast: false,
    guessed_search_volume: false,
    free_text_affiliate_forwarding: false,
    content_ready_public_entries: rows.length,
    active_affiliate_mappings: activeOffers.size
  },
  summary: {
    ...Object.fromEntries(Object.entries(groups).map(([key, ids]) => [key, ids.length])),
    seo_commerce_ready_total: launchCohort.length
  },
  execution_order: policy.execution_order,
  launch_cohort: launchCohort,
  groups
};

console.log(JSON.stringify(report, null, 2));
console.log("Construction Tools Atlas revenue readiness v2.3: PASS");
