import assert from "node:assert/strict";
import { mkdtemp, copyFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = dirname(dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url))))));
const sourceDir = join(repoRoot, "functions", "api", "earth-map-suite");

const jsonResponseSource = (payload, status = 200) => `export async function onRequestGet() {\n  return new Response(${JSON.stringify(JSON.stringify(payload, null, 2))}, {\n    status: ${status},\n    headers: { \"content-type\": \"application/json; charset=utf-8\" },\n  });\n}\n`;

const loadSampleWithPixelProbe = async ({ payload, status = 200 }) => {
  const tempDir = await mkdtemp(join(tmpdir(), "ems-sample-real-"));
  await Promise.all([
    copyFile(join(sourceDir, "precipitation-sample-real.js"), join(tempDir, "precipitation-sample-real.js")),
    copyFile(join(sourceDir, "probe-status.js"), join(tempDir, "probe-status.js")),
    writeFile(join(tempDir, "precipitation-pixel-probe.js"), jsonResponseSource(payload, status)),
    writeFile(join(tempDir, "package.json"), JSON.stringify({ type: "module" })),
  ]);

  return import(pathToFileURL(join(tempDir, "precipitation-sample-real.js")).href);
};

const callGet = async (onRequestGet, query = "") => {
  const request = new Request(`https://example.test/api/earth-map-suite/precipitation-sample-real${query}`);
  const response = await onRequestGet({ request });
  return { response, body: await response.json() };
};

const requiredNullFields = ["unit", "mean", "min", "max", "nodata_count"];
const requiredMetadataFields = ["dataset_id", "source", "license_status", "retrieved_at", "processing_note"];
const validQuery = "?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01";

const notReadyProbe = {
  data_type: "real_observation_pixel_probe",
  status: "blocked",
  sampling_status: "pixel_probe_blocked",
  sample_status: "not_sampled",
  block_reason: "blocked_by_compression_or_layout",
  summary: { unit: null, first_pixel: null },
};

const rawPixelProbe = {
  data_type: "real_observation_pixel_probe",
  status: "ok",
  sampling_status: "raw_pixel_probe_only",
  sample_status: "single_raw_pixel",
  dataset_id: "JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily",
  summary: { unit: "source unit pending verification", first_pixel: 12.25 },
};

const { onRequestGet: notReadyGet, onRequestPost } = await loadSampleWithPixelProbe({ payload: notReadyProbe });

{
  const { response, body } = await callGet(notReadyGet, "?start=2025-08-01&end=2025-08-01");
  assert.equal(response.status, 400);
  assert.equal(body.data_type, "unavailable");
  assert.equal(body.status, "error");
  assert.equal(body.error_code, "missing_or_invalid_params");
  assert.match(body.message, /bbox is required/);
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,140.0,35.9&end=2025-08-01");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "missing_or_invalid_params");
  assert.match(body.message, /start is required/);
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,140.0,35.9&start=2025-08-01");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "missing_or_invalid_params");
  assert.match(body.message, /end is required/);
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=medium");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "missing_or_invalid_params");
  assert.match(body.message, /preset must be low/);
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-02");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "limit_exceeded");
  assert.match(body.message, /Only one day/);
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.0,35.0,139.6,35.4&start=2025-08-01&end=2025-08-01");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "limit_exceeded");
  assert.match(body.message, /0\.5 degrees/);
}

{
  const { response, body } = await callGet(notReadyGet, validQuery);
  assert.equal(response.status, 501);
  assert.equal(body.data_type, "unavailable");
  assert.equal(body.status, "error");
  assert.equal(body.error_code, "validated_sampling_not_ready");
  assert.deepEqual(body.bbox, [139.5, 35.4, 140.0, 35.9]);
  assert.deepEqual(body.date_range, { start: "2025-08-01", end: "2025-08-01" });
  assert.equal(body.preset, "low");

  for (const field of requiredMetadataFields) {
    assert.ok(Object.hasOwn(body, field), `${field} must be present`);
  }
  for (const field of requiredNullFields) {
    assert.ok(Object.hasOwn(body, field), `${field} must be present`);
    assert.equal(body[field], null, `${field} must be null until validated sampling is implemented`);
  }

  assert.equal(body.validated_sample_ready, false);
  assert.equal(body.readiness?.phase, "decoder_strategy_required");
  assert.equal(body.readiness?.reason, "blocked_by_compression_or_layout");
  assert.equal(body.readiness?.can_continue_to_public_ui, false);
  assert.equal(body.readiness_blocker, "decoder_strategy_required");
  assert.equal(body.probe_decision?.phase, "decoder_strategy_required");
  assert.equal(Object.hasOwn(body, "debug_first_pixel"), false);

  const serialized = JSON.stringify(body).toLowerCase();
  assert.equal(serialized.includes("synthetic_precip"), false);
  assert.equal(serialized.includes("synthetic_preview"), false);
  assert.equal(serialized.includes("real_observation_precipitation_sample"), false);
}

{
  const { onRequestGet: rawPixelGet } = await loadSampleWithPixelProbe({ payload: rawPixelProbe });
  const { response, body } = await callGet(rawPixelGet, validQuery);
  assert.equal(response.status, 200);
  assert.equal(body.data_type, "research-only");
  assert.equal(body.status, "ok");
  assert.equal(body.validated_sample_ready, false);
  assert.equal(body.readiness?.phase, "raw_pixel_read");
  assert.equal(body.readiness?.can_continue_to_public_ui, false);
  assert.equal(body.probe_decision?.phase, "raw_pixel_read");
  assert.equal(body.readiness_blocker, "unit_scale_nodata_projection_not_validated");
  assert.equal(body.debug_first_pixel, 12.25);

  for (const field of requiredNullFields) {
    assert.ok(Object.hasOwn(body, field), `${field} must be present`);
    assert.equal(body[field], null, `${field} must remain null until validated sampling is implemented`);
  }

  const serialized = JSON.stringify(body).toLowerCase();
  assert.equal(serialized.includes("data_type\":\"real_observation"), false);
  assert.equal(serialized.includes("synthetic_precip"), false);
  assert.equal(serialized.includes("synthetic_preview"), false);
}

{
  const response = await onRequestPost();
  const body = await response.json();
  assert.equal(response.status, 405);
  assert.equal(body.data_type, "unavailable");
  assert.equal(body.status, "error");
  assert.equal(body.error_code, "method_not_allowed");
}

console.log("precipitation-sample-real harness passed");
