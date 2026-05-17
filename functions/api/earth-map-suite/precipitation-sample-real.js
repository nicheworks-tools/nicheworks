import { onRequestGet as runPixelProbe } from "./precipitation-pixel-probe.js";
import { classifyProbeStatus } from "./probe-status.js";

const DATASET_ID = "JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily";
const SOURCE = "JAXA/EORC GSMaP public COG/STAC research source";
const BAND = "PRECIP";
const LICENSE_STATUS = "pending_verification";
const ATTRIBUTION = "JAXA/EORC GSMaP attribution pending verification; not validated for public output.";
const DEFAULT_PRESET = "low";
const ALLOWED_PRESETS = new Set(["low"]);
const MAX_BBOX_SPAN_DEGREES = 0.5;
const PUBLIC_REAL_OUTPUT_NOT_READY = "not_ready_for_public_real_output";
const PROCESSING_NOTE_PUBLIC_BLOCKED = "Public real precipitation output remains blocked because unit, scale, offset, NoData/fill handling, and tile geolocation are not verified from authoritative metadata; no mean/min/max precipitation values are decoded or aggregated.";

const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  },
});

const validationMetadata = ({ geolocationStatus = "pending_verification" } = {}) => ({
  unit_status: "pending_verification",
  scale_status: "pending_verification",
  offset_status: "pending_verification",
  nodata_status: "pending_verification",
  geolocation_status: geolocationStatus,
  validation_status: PUBLIC_REAL_OUTPUT_NOT_READY,
});

const provenanceContract = (retrievedAt) => ({
  source: SOURCE,
  dataset_id: DATASET_ID,
  band: BAND,
  license_status: LICENSE_STATUS,
  attribution: ATTRIBUTION,
  retrieved_at: retrievedAt,
  processing_note: PROCESSING_NOTE_PUBLIC_BLOCKED,
});

const debugContract = ({ endpointStage, probeDecision = null } = {}) => ({
  endpoint_stage: endpointStage,
  probe_decision_phase: probeDecision?.phase || null,
  probe_decision_next: probeDecision?.next || null,
  validated_sample_ready: false,
  public_ui_allowed: false,
});

const responseContract = (metadataOptions = {}) => {
  const retrievedAt = new Date().toISOString();
  const provenance = provenanceContract(retrievedAt);

  return {
    dataset_id: DATASET_ID,
    source: SOURCE,
    license_status: LICENSE_STATUS,
    retrieved_at: retrievedAt,
    processing_note: PROCESSING_NOTE_PUBLIC_BLOCKED,
    provenance,
    public_ui_allowed: false,
    debug: debugContract({
      endpointStage: metadataOptions.endpointStage || "response_contract",
      probeDecision: metadataOptions.probeDecision,
    }),
    ...validationMetadata(metadataOptions),
    unit: null,
    mean: null,
    min: null,
    max: null,
    nodata_count: null,
  };
};

const unavailable = ({ code, message, guidance, status = 400, extra = {}, endpointStage = "unavailable", probeDecision = null }) => json({
  data_type: "unavailable",
  status: "error",
  error_code: code,
  message,
  guidance,
  ...responseContract({
    geolocationStatus: extra.bbox ? "pending_verification" : "not_available",
    endpointStage,
    probeDecision,
  }),
  ...extra,
}, status);

const isDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");

const parseDate = (value) => {
  if (!isDateString(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
};

const parseBbox = (value) => {
  const parts = String(value || "").split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return null;

  const [minLon, minLat, maxLon, maxLat] = parts;
  if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90) return null;
  if (minLon >= maxLon || minLat >= maxLat) return null;

  return parts;
};

const validate = (request) => {
  const url = new URL(request.url);
  const rawBbox = url.searchParams.get("bbox");
  const rawStart = url.searchParams.get("start");
  const rawEnd = url.searchParams.get("end");
  const preset = (url.searchParams.get("preset") || DEFAULT_PRESET).trim().toLowerCase();

  if (!rawBbox) {
    return { error: ["missing_or_invalid_params", "bbox is required.", "Use bbox=minLon,minLat,maxLon,maxLat, for example bbox=139.5,35.4,140.0,35.9."] };
  }
  if (!rawStart) {
    return { error: ["missing_or_invalid_params", "start is required.", "Use start=YYYY-MM-DD, for example start=2025-08-01."] };
  }
  if (!rawEnd) {
    return { error: ["missing_or_invalid_params", "end is required.", "Use end=YYYY-MM-DD. Only one day is allowed, so end must match start for now."] };
  }
  if (!ALLOWED_PRESETS.has(preset)) {
    return { error: ["missing_or_invalid_params", "preset must be low for the current skeleton endpoint.", "Omit preset or use preset=low."] };
  }

  const bbox = parseBbox(rawBbox);
  if (!bbox) {
    return { error: ["missing_or_invalid_params", "bbox must be valid minLon,minLat,maxLon,maxLat within world bounds.", "Use a small bbox such as 139.5,35.4,140.0,35.9."] };
  }

  const start = parseDate(rawStart);
  const end = parseDate(rawEnd);
  if (!start || !end) {
    return { error: ["missing_or_invalid_params", "start and end must be valid YYYY-MM-DD dates.", "Use matching one-day dates such as start=2025-08-01&end=2025-08-01."] };
  }
  if (rawStart !== rawEnd) {
    return { error: ["limit_exceeded", "Only one day is allowed for validated real sampling skeleton requests.", "Use the same YYYY-MM-DD value for start and end."] };
  }

  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  if (width > MAX_BBOX_SPAN_DEGREES || height > MAX_BBOX_SPAN_DEGREES) {
    return { error: ["limit_exceeded", "bbox must be 0.5 degrees or less per axis for now.", "Shrink bbox so maxLon-minLon <= 0.5 and maxLat-minLat <= 0.5."] };
  }

  return { params: { bbox, start: rawStart, end: rawEnd, preset } };
};

const blockerForDecision = (decision) => {
  if (decision?.phase === "decoder_strategy_required") return "decoder_strategy_required";
  if (decision?.phase === "raw_pixel_read") return "unit_scale_nodata_projection_not_validated";
  if (decision?.phase === "endpoint_error") return "upstream_probe_failed";
  return "raw_pixel_read_not_confirmed";
};

const readProbePayload = async (context) => {
  let probe = null;
  let httpStatus = 200;

  try {
    const response = await runPixelProbe(context);
    httpStatus = response.status;
    probe = await response.json();
  } catch (error) {
    httpStatus = 502;
    probe = {
      data_type: null,
      status: "error",
      error_code: "upstream_fail",
      message: error?.message || String(error),
    };
  }

  const classified = classifyProbeStatus({ probe, http_status: httpStatus });
  return { probe, httpStatus, ...classified };
};

const readinessFromDecision = (decision) => ({
  phase: decision.phase,
  next: decision.next,
  reason: decision.reason,
  can_continue_to_public_ui: decision.can_continue_to_public_ui,
});

const commonReadinessFields = ({ readiness, blocker, probeDecision }) => ({
  readiness,
  readiness_blocker: blocker,
  probe_decision: probeDecision,
  validated_sample_ready: false,
  public_ui_allowed: false,
});

export async function onRequestGet(context) {
  const { request } = context;
  const validation = validate(request);
  if (validation.error) {
    const [code, message, guidance] = validation.error;
    return unavailable({ code, message, guidance, status: 400, endpointStage: "request_validation_failed" });
  }

  const probeReadiness = await readProbePayload(context);
  const readiness = readinessFromDecision(probeReadiness.decision);
  const baseExtra = {
    bbox: validation.params.bbox,
    date_range: { start: validation.params.start, end: validation.params.end },
    preset: validation.params.preset,
    ...commonReadinessFields({
      readiness,
      blocker: blockerForDecision(probeReadiness.decision),
      probeDecision: probeReadiness.decision,
    }),
    warnings: [
      "No mean/min/max precipitation values are returned by this endpoint.",
      "No synthetic fallback values are returned.",
      "This endpoint is not connected to public UI.",
      "Raw pixel access is not a validated precipitation observation until unit, scale, NoData, projection, aggregation, and license gates are complete.",
    ],
  };

  if (probeReadiness.decision.phase === "endpoint_error") {
    return unavailable({
      code: "upstream_fail",
      message: "The upstream precipitation probe failed before validated sampling could be checked.",
      guidance: "Keep Storm, Compare, Card, and public UI disconnected. Retry later or inspect the pixel probe before enabling validated real sampling.",
      status: 502,
      extra: {
        ...baseExtra,
        upstream_status: probeReadiness.httpStatus,
        upstream_error_code: probeReadiness.probe?.error_code || null,
      },
      endpointStage: "upstream_probe_failed",
      probeDecision: probeReadiness.decision,
    });
  }

  return unavailable({
    code: "validated_sampling_not_ready",
    message: "Validated real precipitation sample validation is not complete, so this endpoint fails safely and returns no precipitation values.",
    guidance: "Keep Storm, Compare, Card, and public UI disconnected until raw pixel reading, decoder, projection, unit, nodata, aggregation, and license validation are complete.",
    status: 501,
    extra: {
      ...baseExtra,
      raw_pixel_probe_observed: probeReadiness.decision.phase === "raw_pixel_read",
    },
    endpointStage: probeReadiness.decision.phase === "raw_pixel_read" ? "raw_pixel_probe_not_validated" : "readiness_blocked",
    probeDecision: probeReadiness.decision,
  });
}

const methodNotAllowed = () => unavailable({
  code: "method_not_allowed",
  message: "Use GET for the validated real precipitation sample skeleton endpoint.",
  guidance: "Call with bbox, start, end, and optional preset=low. POST and other non-GET methods are not accepted.",
  status: 405,
  endpointStage: "method_not_allowed",
});

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return methodNotAllowed();
}

export async function onRequestPost() {
  return methodNotAllowed();
}

export async function onRequestPut() {
  return methodNotAllowed();
}

export async function onRequestPatch() {
  return methodNotAllowed();
}

export async function onRequestDelete() {
  return methodNotAllowed();
}

export async function onRequestHead() {
  return methodNotAllowed();
}

export async function onRequestOptions() {
  return methodNotAllowed();
}
