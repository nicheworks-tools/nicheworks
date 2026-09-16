#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const MIN_ACTIVE_OFFERS = 40;
const AFFILIATE_REVIEW_START_WAVE = "content-wave-005e";

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function entries(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && raw.schema === "cta-compact-v1" && Array.isArray(raw.rows)) {
    return raw.rows.map((row) => ({
      id: text(row.id),
      type: text(row.t || row.type)
    }));
  }
  if (Array.isArray(raw?.entries)) return raw.entries;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

function manifestPaths(raw) {
  const base = Array.isArray(raw?.base) ? raw.base : [];
  const packs = Array.isArray(raw?.packs) ? raw.packs : [];
  return [...base, ...packs.map((item) => typeof item === "string" ? item : item?.path)]
    .map((value) => text(value).replace(/^\.\/data\//, ""))
    .filter(Boolean);
}

function fail(message) {
  console.error(`affiliate audit: ${message}`);
  process.exitCode = 1;
}

const qualityManifest = readJson("quality-manifest.json");
const redirects = readJson("canonical-redirects-v2.3.json");
const affiliate = readJson("affiliate-offers-v2.3.json");
const enrichmentManifest = readJson("content-enrichment-manifest-v2.3.json");

const activeIds = new Set();
const typeById = new Map();
for (const file of manifestPaths(qualityManifest)) {
  const raw = readJson(file);
  for (const entry of entries(raw)) {
    const id = text(entry?.id);
    if (!id) continue;
    activeIds.add(id);
    typeById.set(id, text(entry?.type || entry?.t));
  }
}

for (const row of Array.isArray(redirects?.redirects) ? redirects.redirects : []) {
  const from = text(row?.from);
  if (from) activeIds.delete(from);
}

if (affiliate?.schema !== "cta-affiliate-offers-v2.3") fail("unexpected schema");
if (affiliate?.provider !== "amazon.co.jp") fail("provider must remain amazon.co.jp");
if (affiliate?.policy?.query_source !== "maintained_canonical_mapping_only") fail("query source must remain maintained_canonical_mapping_only");
if (affiliate?.policy?.free_text_forwarding !== false) fail("free-text forwarding must remain disabled");
if (!text(affiliate?.tracking_id)) fail("tracking_id is required");

const seenEntries = new Set();
const seenOffers = new Set();
let activeOffers = 0;

for (const offer of Array.isArray(affiliate?.offers) ? affiliate.offers : []) {
  const entryId = text(offer?.entry_id);
  const offerId = text(offer?.offer_id);
  const query = text(offer?.query);
  const status = text(offer?.status);

  if (!entryId) { fail("offer missing entry_id"); continue; }
  if (!offerId) fail(`${entryId}: offer_id is required`);
  if (seenEntries.has(entryId)) fail(`${entryId}: duplicate active mapping`);
  seenEntries.add(entryId);
  if (seenOffers.has(offerId)) fail(`${entryId}: duplicate offer_id ${offerId}`);
  seenOffers.add(offerId);

  if (!activeIds.has(entryId)) fail(`${entryId}: target is not an active public canonical`);
  if (status !== "active") fail(`${entryId}: unsupported status ${status || "(blank)"}`);
  if (!query) fail(`${entryId}: maintained Amazon query is required`);
  if (!text(offer?.label_ja) || !text(offer?.label_en)) fail(`${entryId}: bilingual labels are required`);

  let url;
  try { url = new URL(text(offer?.amazon_url)); }
  catch (_) { fail(`${entryId}: invalid amazon_url`); continue; }
  if (url.protocol !== "https:" || url.hostname !== "www.amazon.co.jp" || url.pathname !== "/s") {
    fail(`${entryId}: amazon_url must be an https://www.amazon.co.jp/s search URL`);
  }
  if (text(url.searchParams.get("k")) !== query) fail(`${entryId}: URL search query does not match maintained query`);
  if (text(url.searchParams.get("tag")) !== text(affiliate.tracking_id)) fail(`${entryId}: affiliate tag mismatch`);

  activeOffers += 1;
}

if (activeOffers < MIN_ACTIVE_OFFERS) fail(`active offers ${activeOffers} is below floor ${MIN_ACTIVE_OFFERS}`);

if (enrichmentManifest?.schema !== "cta-content-enrichment-manifest-v2.3") fail("unexpected content enrichment manifest schema");
let reviewPolicyActive = false;
let reviewStartSeen = false;
const affiliateReviewedRows = [];
for (const pack of Array.isArray(enrichmentManifest?.packs) ? enrichmentManifest.packs : []) {
  const wave = text(typeof pack === "string" ? "" : pack?.wave);
  const source = text(typeof pack === "string" ? pack : pack?.path);
  if (wave === AFFILIATE_REVIEW_START_WAVE) {
    reviewPolicyActive = true;
    reviewStartSeen = true;
  }
  if (!reviewPolicyActive || !source) continue;
  const raw = readJson(source.replace(/^\.\/data\//, ""));
  for (const row of entries(raw)) {
    const id = text(row?.id);
    const review = text(row?.affiliate_review);
    if (!id) { fail(`${source}: enrichment row missing id`); continue; }
    if (!review) { fail(`${id}: affiliate_review is required for ${AFFILIATE_REVIEW_START_WAVE} and later`); continue; }
    if (review !== "mapped" && review !== "not_applicable") {
      fail(`${id}: affiliate_review must be mapped or not_applicable, got ${review}`);
      continue;
    }
    affiliateReviewedRows.push({ id, review, wave: wave || source });
  }
}
if (!reviewStartSeen) fail(`content enrichment manifest is missing ${AFFILIATE_REVIEW_START_WAVE}`);

let reviewedMapped = 0;
let reviewedNotApplicable = 0;
for (const row of affiliateReviewedRows) {
  if (!activeIds.has(row.id)) fail(`${row.id}: affiliate-reviewed enrichment target is not an active public canonical`);
  if (row.review === "mapped") {
    reviewedMapped += 1;
    if (!seenEntries.has(row.id)) fail(`${row.id}: affiliate_review=mapped but no active Amazon mapping exists`);
  } else {
    reviewedNotApplicable += 1;
    if (seenEntries.has(row.id)) fail(`${row.id}: affiliate_review=not_applicable conflicts with an active Amazon mapping`);
  }
}

const productLikeTypes = new Set(["tool","equipment","material","materials","consumable","component","hardware","fastener","accessory","safety","fixture","access"]);
const eligibleIds = [...activeIds].filter((id) => productLikeTypes.has(typeById.get(id)));
const eligibleMapped = eligibleIds.filter((id) => seenEntries.has(id)).length;
const ratio = eligibleIds.length ? eligibleMapped / eligibleIds.length : 0;

console.log(JSON.stringify({
  public_canonicals: activeIds.size,
  product_like_canonicals: eligibleIds.length,
  active_affiliate_offers: activeOffers,
  product_like_offer_coverage: Number((ratio * 100).toFixed(2)),
  affiliate_reviewed_entries: affiliateReviewedRows.length,
  affiliate_review_mapped: reviewedMapped,
  affiliate_review_not_applicable: reviewedNotApplicable,
  policy: "maintained canonical Amazon search mappings only; content waves 5e+ require explicit affiliate review"
}, null, 2));

if (process.exitCode) process.exit(process.exitCode);
