import { onRequestGet as runPixelProbe } from "./precipitation-pixel-probe.js";
import { classifyProbeStatus } from "./probe-status.js";

const DATASET_ID = "JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily";
const SOURCE = "JAXA/EORC GSMaP public COG/STAC research source";
const DEFAULT_PRESET = "low";
const ALLOWED_PRESETS = new Set(["low"]);
const MAX_BBOX_SPAN_DEGREES = 0.5;

const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  },
});

const responseContract = () => ({
  dataset_id: DATASET_ID,
  source: SOURCE,
  license_status: "not_validated_for_public_real_sampling",
  retrieved_at: new Date().toISOString(),
  processing_note: "Validated real precipitation sample processing is not implemented yet; no raster values were decoded or aggregated.",
  unit: null,
  mean: null,
  min: null,
  max: null,
  nodata_count: null,
});

const unavailable = ({ code, message, guidance, status = 400, extra = {} }) => json({
  data_type: "unavailable",
  status: "error",
  error_code: code,
  message,
  guidance,
  ...responseContract(),
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

const blockerForDecision = (decision) => (
  decision?.phase === "decoder_strategy_required"
    ? "decoder_strategy_required"
    : "raw_pixel_read_not_confirmed"
);

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
      error_code: "sample_real_probe_failed",
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
});

export async function onRequestGet(context) {
  const { request } = context;
  const validation = validate(request);
  if (validation.error) {
    const [code, message, guidance] = validation.error;
    return unavailable({ code, message, guidance, status: 400 });
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

  if (probeReadiness.decision.phase === "raw_pixel_read") {
    return json({
      data_type: "research-only",
      status: "ok",
      message: "A raw pixel probe returned a finite first pixel, but validated real precipitation sampling is still unavailable.",
      guidance: "Use debug_first_pixel only for EMS research. Do not publish it as precipitation and keep Storm, Compare, Card, and public UI disconnected.",
      ...responseContract(),
      ...baseExtra,
      readiness_blocker: "unit_scale_nodata_projection_not_validated",
      debug_first_pixel: probeReadiness.summary.first_pixel,
    }, 200);
  }

  return unavailable({
    code: "validated_sampling_not_ready",
    message: "Validated real precipitation sample validation is not complete, so this endpoint fails safely and returns no precipitation values.",
    guidance: "Keep Storm, Compare, Card, and public UI disconnected until raw pixel reading, decoder, projection, unit, nodata, aggregation, and license validation are complete.",
    status: 501,
    extra: baseExtra,
  });
}

export async function onRequestPost() {
  return unavailable({
    code: "method_not_allowed",
    message: "Use GET for the validated real precipitation sample skeleton endpoint.",
    guidance: "Call with bbox, start, end, and optional preset=low.",
    status: 405,
  });
}
