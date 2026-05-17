import assert from "node:assert/strict";
import { mkdtemp, copyFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = dirname(dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url))))));
const sourceDir = join(repoRoot, "functions", "api", "earth-map-suite");
const tempDir = await mkdtemp(join(tmpdir(), "ems-sample-real-"));

await Promise.all([
  copyFile(join(sourceDir, "precipitation-sample-real.js"), join(tempDir, "precipitation-sample-real.js")),
  copyFile(join(sourceDir, "probe-status.js"), join(tempDir, "probe-status.js")),
  copyFile(join(sourceDir, "precipitation-pixel-probe.js"), join(tempDir, "precipitation-pixel-probe.js")),
]);

await writeFile(join(tempDir, "package.json"), JSON.stringify({ type: "module" }));

const sampleModuleUrl = pathToFileURL(join(tempDir, "precipitation-sample-real.js")).href;
const { onRequestGet, onRequestPost } = await import(sampleModuleUrl);

const callGet = async (query = "") => {
  const request = new Request(`https://example.test/api/earth-map-suite/precipitation-sample-real${query}`);
  const response = await onRequestGet({ request });
  return { response, body: await response.json() };
};

const requiredNullFields = ["unit", "mean", "min", "max", "nodata_count"];
const requiredMetadataFields = ["dataset_id", "source", "license_status", "retrieved_at", "processing_note"];

{
  const { response, body } = await callGet("?start=2025-08-01&end=2025-08-01");
  assert.equal(response.status, 400);
  assert.equal(body.data_type, "unavailable");
  assert.equal(body.status, "error");
  assert.equal(body.error_code, "missing_or_invalid_params");
  assert.match(body.message, /bbox is required/);
}

{
  const { response, body } = await callGet("?bbox=139.5,35.4,140.0,35.9&end=2025-08-01");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "missing_or_invalid_params");
  assert.match(body.message, /start is required/);
}

{
  const { response, body } = await callGet("?bbox=139.5,35.4,140.0,35.9&start=2025-08-01");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "missing_or_invalid_params");
  assert.match(body.message, /end is required/);
}

{
  const { response, body } = await callGet("?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=medium");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "missing_or_invalid_params");
  assert.match(body.message, /preset must be low/);
}

{
  const { response, body } = await callGet("?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-02");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "limit_exceeded");
  assert.match(body.message, /Only one day/);
}

{
  const { response, body } = await callGet("?bbox=139.0,35.0,139.6,35.4&start=2025-08-01&end=2025-08-01");
  assert.equal(response.status, 400);
  assert.equal(body.error_code, "limit_exceeded");
  assert.match(body.message, /0\.5 degrees/);
}

{
  const { response, body } = await callGet("?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01");
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

  assert.equal(body.readiness?.phase, "blocked");
  assert.equal(body.readiness?.reason, "validated_sampling_not_ready");
  assert.equal(body.readiness?.can_continue_to_public_ui, false);
  assert.equal(body.future_real_response_shape?.mean, null);
  assert.equal(body.future_real_response_shape?.min, null);
  assert.equal(body.future_real_response_shape?.max, null);

  const serialized = JSON.stringify(body).toLowerCase();
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
