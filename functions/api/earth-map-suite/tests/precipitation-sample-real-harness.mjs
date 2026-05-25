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

const callAny = async (handler, { method = "GET", query = "" } = {}) => {
  const request = new Request(`https://example.test/api/earth-map-suite/precipitation-sample-real${query}`, { method });
  const response = await handler({ request });
  return { response, body: await response.json() };
};

const requiredNullFields = ["unit", "mean", "min", "max", "nodata_count"];
const requiredMetadataFields = ["dataset_id", "source", "license_status", "retrieved_at", "processing_note"];
const requiredProvenanceFields = ["source", "dataset_id", "band", "license_status", "attribution", "retrieved_at", "processing_note"];
const requiredDebugFields = ["endpoint_stage", "probe_decision_phase", "probe_decision_next", "validated_sample_ready", "public_ui_allowed"];
const requiredReadinessFields = ["unit_status", "scale_status", "offset_status", "nodata_status", "geolocation_status", "validation_status"];

const assertProvenanceAndDebug = (body, { endpointStage, probeDecisionPhase = null, probeDecisionNext = null } = {}) => {
  assert.equal(typeof body.provenance, "object", "provenance must be present");
  assert.equal(Array.isArray(body.provenance), false, "provenance must be an object");
  assert.deepEqual(Object.keys(body.provenance), requiredProvenanceFields);
  assert.equal(body.provenance.source, body.source);
  assert.equal(body.provenance.dataset_id, body.dataset_id);
  assert.equal(body.provenance.band, "PRECIP");
  assert.equal(body.provenance.license_status, "pending_verification");
  assert.equal(body.provenance.attribution, "JAXA/EORC GSMaP attribution pending verification; not validated for public output.");
  assert.equal(body.provenance.retrieved_at, body.retrieved_at);
  assert.equal(body.provenance.processing_note, body.processing_note);

  assert.equal(typeof body.debug, "object", "debug must be present");
  assert.equal(Array.isArray(body.debug), false, "debug must be an object");
  assert.deepEqual(Object.keys(body.debug), requiredDebugFields);
  assert.equal(body.debug.endpoint_stage, endpointStage);
  assert.equal(body.debug.probe_decision_phase, probeDecisionPhase);
  assert.equal(body.debug.probe_decision_next, probeDecisionNext);
  assert.equal(body.debug.validated_sample_ready, false);
  assert.equal(body.debug.public_ui_allowed, false);
  assert.equal(body.public_ui_allowed, false);
};

const assertPublicRealOutputBlocked = (body, { geolocationStatus = "pending_verification" } = {}) => {
  for (const field of requiredReadinessFields) {
    assert.ok(Object.hasOwn(body, field), `${field} must be present`);
  }
  assert.equal(body.unit_status, "pending_verification");
  assert.equal(body.scale_status, "pending_verification");
  assert.equal(body.offset_status, "pending_verification");
  assert.equal(body.nodata_status, "pending_verification");
  assert.equal(body.geolocation_status, geolocationStatus);
  assert.equal(body.validation_status, "not_ready_for_public_real_output");
  assert.match(body.processing_note, /Public real precipitation output remains blocked/);
};

const assertCanonicalUnavailableError = (body, code) => {
  assert.equal(body.data_type, "unavailable");
  assert.equal(body.status, "error");
  assert.equal(body.error_code, code);
  assert.equal(typeof body.message, "string");
  assert.ok(body.message.length > 0, "message must be non-empty");
  assert.equal(typeof body.guidance, "string");
  assert.ok(body.guidance.length > 0, "guidance must be non-empty");

  for (const field of requiredNullFields) {
    assert.ok(Object.hasOwn(body, field), `${field} must be present`);
    assert.equal(body[field], null, `${field} must remain null for unavailable/errors`);
  }

  const serialized = JSON.stringify(body).toLowerCase();
  assert.equal(serialized.includes("synthetic_precip"), false);
  assert.equal(serialized.includes("synthetic_preview"), false);
  assert.equal(serialized.includes("data_type\":\"real_observation"), false);
};
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

const {
  onRequest,
  onRequestGet: notReadyGet,
  onRequestPost,
  onRequestPut,
  onRequestOptions,
} = await loadSampleWithPixelProbe({ payload: notReadyProbe });

{
  const { response, body } = await callGet(notReadyGet, "?start=2025-08-01&end=2025-08-01");
  assert.equal(response.status, 400);
  assertCanonicalUnavailableError(body, "missing_or_invalid_params");
  assert.match(body.message, /bbox is required/);
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
  assertProvenanceAndDebug(body, { endpointStage: "request_validation_failed" });
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,140.0,35.9&end=2025-08-01");
  assert.equal(response.status, 400);
  assertCanonicalUnavailableError(body, "missing_or_invalid_params");
  assert.match(body.message, /start is required/);
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,140.0,35.9&start=2025-08-01");
  assert.equal(response.status, 400);
  assertCanonicalUnavailableError(body, "missing_or_invalid_params");
  assert.match(body.message, /end is required/);
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}


{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,139.4,35.9&start=2025-08-01&end=2025-08-01");
  assert.equal(response.status, 400);
  assertCanonicalUnavailableError(body, "missing_or_invalid_params");
  assert.match(body.message, /bbox must be valid/);
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=medium");
  assert.equal(response.status, 400);
  assertCanonicalUnavailableError(body, "missing_or_invalid_params");
  assert.match(body.message, /preset must be low/);
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-02");
  assert.equal(response.status, 400);
  assertCanonicalUnavailableError(body, "limit_exceeded");
  assert.match(body.message, /Only one day/);
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}

{
  const { response, body } = await callGet(notReadyGet, "?bbox=139.0,35.0,139.6,35.4&start=2025-08-01&end=2025-08-01");
  assert.equal(response.status, 400);
  assertCanonicalUnavailableError(body, "limit_exceeded");
  assert.match(body.message, /0\.5 degrees/);
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}

{
  const { response, body } = await callGet(notReadyGet, validQuery);
  assert.equal(response.status, 501);
  assertCanonicalUnavailableError(body, "validated_sampling_not_ready");
  assert.deepEqual(body.bbox, [139.5, 35.4, 140.0, 35.9]);
  assert.deepEqual(body.date_range, { start: "2025-08-01", end: "2025-08-01" });
  assert.equal(body.preset, "low");
  assertPublicRealOutputBlocked(body);
  assertProvenanceAndDebug(body, {
    endpointStage: "readiness_blocked",
    probeDecisionPhase: "decoder_strategy_required",
    probeDecisionNext: "choose_verified_geotiff_decoder_before_sampling",
  });

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
  assert.equal(response.status, 501);
  assertCanonicalUnavailableError(body, "validated_sampling_not_ready");
  assert.equal(body.validated_sample_ready, false);
  assert.equal(body.readiness?.phase, "raw_pixel_read");
  assert.equal(body.readiness?.can_continue_to_public_ui, false);
  assert.equal(body.probe_decision?.phase, "raw_pixel_read");
  assert.equal(body.readiness_blocker, "unit_scale_nodata_projection_not_validated");
  assert.equal(body.raw_pixel_probe_observed, true);
  assert.equal(Object.hasOwn(body, "debug_first_pixel"), false);
  assertPublicRealOutputBlocked(body);
  assertProvenanceAndDebug(body, {
    endpointStage: "raw_pixel_probe_not_validated",
    probeDecisionPhase: "raw_pixel_read",
    probeDecisionNext: "validate_decoder_projection_units_and_no_data_rules",
  });
}

{
  const upstreamErrorProbe = {
    data_type: "unavailable",
    status: "error",
    error_code: "upstream_fail",
    message: "Pixel probe failed.",
  };
  const { onRequestGet: upstreamFailGet } = await loadSampleWithPixelProbe({ payload: upstreamErrorProbe, status: 502 });
  const { response, body } = await callGet(upstreamFailGet, validQuery);
  assert.equal(response.status, 502);
  assertCanonicalUnavailableError(body, "upstream_fail");
  assert.equal(body.upstream_status, 502);
  assert.equal(body.upstream_error_code, "upstream_fail");
  assertProvenanceAndDebug(body, {
    endpointStage: "upstream_probe_failed",
    probeDecisionPhase: "endpoint_error",
    probeDecisionNext: "inspect_pixel_probe_endpoint",
  });
}

{
  const response = await onRequestPost();
  const body = await response.json();
  assert.equal(response.status, 405);
  assertCanonicalUnavailableError(body, "method_not_allowed");
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
  assertProvenanceAndDebug(body, { endpointStage: "method_not_allowed" });
}

{
  const { response, body } = await callAny(onRequest, { method: "POST", query: validQuery });
  assert.equal(response.status, 405);
  assertCanonicalUnavailableError(body, "method_not_allowed");
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}

{
  const response = await onRequestPut();
  const body = await response.json();
  assert.equal(response.status, 405);
  assertCanonicalUnavailableError(body, "method_not_allowed");
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}

{
  const response = await onRequestOptions();
  const body = await response.json();
  assert.equal(response.status, 405);
  assertCanonicalUnavailableError(body, "method_not_allowed");
  assertPublicRealOutputBlocked(body, { geolocationStatus: "not_available" });
}

console.log("precipitation-sample-real harness passed");
