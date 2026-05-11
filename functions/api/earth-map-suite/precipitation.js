const DATASET_ID = "JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily";
const BAND = "PRECIP";
const COLLECTION_URL = `https://s3.ap-northeast-1.wasabisys.com/je-pds/cog/v1/${DATASET_ID}/collection.json`;
const SOURCE_NAME = "JAXA Earth API / EORC GSMaP STAC metadata probe";
const MAX_BBOX_SPAN_DEGREES = 5;
const MAX_DATE_SPAN_DAYS = 31;
const PRESETS = new Set(["low", "mid", "detail"]);

const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const unavailable = (errorCode, message, status = 502, details = undefined) => json({
  data_type: "unavailable",
  source: SOURCE_NAME,
  dataset_id: DATASET_ID,
  license_status: "not_verified_for_public_ui; check dataset STAC license before enabling",
  retrieved_at: new Date().toISOString(),
  status: "error",
  error_code: errorCode,
  message,
  ...(details ? { details } : {})
}, status);

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");

const parseDate = (value) => {
  if (!isIsoDate(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseBbox = (value) => {
  if (!value) return null;
  const parts = value.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return null;
  const [west, south, east, north] = parts;
  if (west < -180 || east > 180 || south < -90 || north > 90) return null;
  if (west >= east || south >= north) return null;
  if ((east - west) > MAX_BBOX_SPAN_DEGREES || (north - south) > MAX_BBOX_SPAN_DEGREES) return null;
  return [west, south, east, north];
};

const validateRequest = (request) => {
  const url = new URL(request.url);
  const bbox = parseBbox(url.searchParams.get("bbox") || "139.60,35.50,139.95,35.80");
  const start = parseDate(url.searchParams.get("start") || "");
  const end = parseDate(url.searchParams.get("end") || "");
  const preset = (url.searchParams.get("preset") || "low").toLowerCase();

  if (!bbox) return { error: ["invalid_bbox", `bbox must be west,south,east,north within ${MAX_BBOX_SPAN_DEGREES} degrees per axis.`] };
  if (!start || !end) return { error: ["invalid_date", "start and end must be valid YYYY-MM-DD dates."] };
  if (end < start) return { error: ["invalid_date_range", "end must be on or after start."] };
  const spanDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  if (spanDays > MAX_DATE_SPAN_DAYS) return { error: ["limit_exceeded", `date range must be ${MAX_DATE_SPAN_DAYS} days or less.`] };
  if (!PRESETS.has(preset)) return { error: ["invalid_preset", "preset must be one of low, mid, detail."] };

  return {
    params: {
      bbox,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      preset,
      span_days: spanDays
    }
  };
};

export async function onRequestGet({ request }) {
  const validation = validateRequest(request);
  if (validation.error) {
    const [errorCode, message] = validation.error;
    return unavailable(errorCode, message, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(COLLECTION_URL, {
      headers: { accept: "application/json" },
      signal: controller.signal
    });

    if (!upstream.ok) {
      return unavailable("upstream_fail", "JAXA Earth API STAC collection metadata could not be retrieved.", 502, {
        http_status: upstream.status
      });
    }

    const collection = await upstream.json();
    const license = collection.license || collection.links?.find((link) => link.rel === "license")?.href || null;

    return json({
      data_type: "metadata_connection_probe",
      source: SOURCE_NAME,
      dataset_id: DATASET_ID,
      band: BAND,
      license_status: license ? "reported_by_stac" : "not_found_in_collection_metadata",
      license,
      retrieved_at: new Date().toISOString(),
      status: "ok",
      sample: {
        requested: validation.params,
        collection_url: COLLECTION_URL,
        stac_id: collection.id || null,
        title: collection.title || null,
        description: collection.description ? String(collection.description).slice(0, 500) : null,
        extent: collection.extent || null
      }
    });
  } catch (error) {
    const aborted = error && error.name === "AbortError";
    return unavailable(aborted ? "timeout" : "upstream_fail", aborted
      ? "Timed out while contacting the JAXA Earth API STAC collection metadata endpoint."
      : "Failed to contact the JAXA Earth API STAC collection metadata endpoint.", 502, {
      reason: error && error.message ? error.message : String(error)
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequestPost() {
  return unavailable("method_not_allowed", "Use GET for this JSON-only proof endpoint.", 405);
}
