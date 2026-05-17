const DATASET_ID = "JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily";
const BAND = "PRECIP";
const STAC_BASE_URL = `https://s3.ap-northeast-1.wasabisys.com/je-pds/cog/v1/${DATASET_ID}`;
const COLLECTION_URL = `${STAC_BASE_URL}/collection.json`;
const REQUEST_TIMEOUT_MS = 9000;
const MS_PER_DAY = 86400000;
const LIMITS = { low: { maxDays: 1, maxSpanDegrees: 0.5 } };

const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

const fail = (code, message, guidance, status = 400, extra = {}) => json({
  data_type: "unavailable",
  status: "error",
  error_code: code,
  message,
  guidance,
  ...extra
}, status);

const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");
const parseDate = (value) => {
  if (!isDate(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
};
const listDates = (start, end) => {
  const out = [];
  for (let t = start.getTime(); t <= end.getTime(); t += MS_PER_DAY) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
};
const parseBbox = (value) => {
  const parts = String(value || "").split(",").map((v) => Number(v.trim()));
  if (parts.length !== 4 || parts.some((v) => !Number.isFinite(v))) return null;
  const [minLon, minLat, maxLon, maxLat] = parts;
  if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90) return null;
  if (minLon >= maxLon || minLat >= maxLat) return null;
  return parts;
};
const validate = (request) => {
  const url = new URL(request.url);
  const bbox = parseBbox(url.searchParams.get("bbox"));
  const start = parseDate(url.searchParams.get("start"));
  const end = parseDate(url.searchParams.get("end"));
  const preset = (url.searchParams.get("preset") || "low").toLowerCase();
  if (!bbox || !start || !end) return { error: ["missing_or_invalid_params", "bbox, start, and end are required and must be valid.", "Example: ?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low"] };
  if (!LIMITS[preset]) return { error: ["limit_exceeded", "Only preset=low is enabled for this TIFF probe.", "Use preset=low."] };
  const spanDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  const limit = LIMITS[preset];
  if (spanDays > limit.maxDays) return { error: ["limit_exceeded", "This TIFF probe allows only one day.", "Use the same start and end date."] };
  if (width > limit.maxSpanDegrees || height > limit.maxSpanDegrees) return { error: ["limit_exceeded", "This TIFF probe allows only a 0.5 degree bbox per axis.", "Use a smaller bbox."] };
  return { params: { bbox, start: url.searchParams.get("start"), end: url.searchParams.get("end"), preset, dates: listDates(start, end) } };
};

const pad2 = (value) => String(value).padStart(2, "0");
const fmtLon = (value) => `E${String(Math.abs(value).toFixed(0)).padStart(3, "0")}.00`;
const fmtLat = (value) => `${value < 0 ? "S" : "N"}${pad2(Math.abs(value).toFixed(0))}.00`;
const normLon = (lon) => (lon < 0 ? lon + 360 : lon);
const lonIntervals = ([minLon, , maxLon]) => (minLon < 0 && maxLon > 0 ? [[0, normLon(maxLon)], [normLon(minLon), 360]] : [[normLon(minLon), normLon(maxLon)]]);
const tileIndexes = (min, max, step, lower, upper) => {
  const a = Math.max(lower, Math.min(upper, min));
  const b = Math.max(lower, Math.min(upper, max));
  const start = Math.floor((a - lower) / step);
  const end = Math.max(start, Math.ceil((b - lower) / step) - 1);
  const maxIndex = Math.floor((upper - lower) / step) - 1;
  const out = [];
  for (let i = start; i <= end && i <= maxIndex; i += 1) out.push(i);
  return out;
};
const tilePaths = (bbox) => {
  const lonSet = new Set();
  for (const [min, max] of lonIntervals(bbox)) for (const i of tileIndexes(min, max, 90, 0, 360)) lonSet.add(i);
  const lat = tileIndexes(bbox[1], bbox[3], 90, -90, 90);
  const out = [];
  for (const lonIndex of [...lonSet].sort((a, b) => a - b)) {
    const lonMin = lonIndex * 90;
    const lonMax = lonMin + 90;
    const lonPart = `${fmtLon(lonMin)}-${fmtLon(lonMax)}`;
    for (const latIndex of lat) {
      const latMin = -90 + latIndex * 90;
      const latMax = latMin + 90;
      out.push(`${lonPart}/${fmtLat(latMin)}-${fmtLat(latMax)}.json`);
    }
  }
  return out;
};
const itemUrls = ({ dates, bbox }) => {
  const paths = tilePaths(bbox);
  const out = [];
  for (const date of dates) {
    const [year, month, day] = date.split("-");
    for (const path of paths) out.push({ date, url: `${STAC_BASE_URL}/${year}-${month}/${day}/1/${path}` });
  }
  return out;
};
const looksLikeBand = ([key, asset]) => [key, asset?.title, asset?.description, asset?.href, ...(asset?.roles || [])].filter(Boolean).join(" ").toUpperCase().includes(BAND);
const findAsset = (item) => Object.entries(item?.assets || {}).filter(looksLikeBand).map(([key, asset]) => ({ key, href: asset.href, type: asset.type || null, title: asset.title || null })).find((asset) => asset.href);
const fetchJson = async (url, signal) => {
  const response = await fetch(url, { headers: { accept: "application/json" }, signal });
  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, status: response.status, body: await response.json() };
};
const locateAsset = async (params, signal) => {
  const collection = await fetchJson(COLLECTION_URL, signal);
  if (!collection.ok) return { error: { code: "upstream_fail", status: 502, message: "Collection metadata could not be retrieved.", extra: { collection_url: COLLECTION_URL, http_status: collection.status } } };
  for (const candidate of itemUrls(params)) {
    const item = await fetchJson(candidate.url, signal);
    if (!item.ok) continue;
    const asset = findAsset(item.body);
    if (asset) return { date: candidate.date, item_url: candidate.url, asset };
  }
  return { error: { code: "asset_missing", status: 404, message: "No PRECIP asset was found for this tiny TIFF probe request.", extra: {} } };
};
const parseTiffHeader = (buffer) => {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 16) return { ok: false, reason: "header_too_short", byte_length: bytes.length };
  const endianMark = String.fromCharCode(bytes[0], bytes[1]);
  const little = endianMark === "II";
  const big = endianMark === "MM";
  if (!little && !big) return { ok: false, reason: "not_tiff_endian", endian_mark: endianMark, byte_length: bytes.length };
  const view = new DataView(buffer);
  const magic = view.getUint16(2, little);
  const firstIfdOffset = magic === 42 ? view.getUint32(4, little) : magic === 43 ? Number(view.getBigUint64(8, little)) : null;
  return {
    ok: magic === 42 || magic === 43,
    endian: little ? "little" : "big",
    tiff_type: magic === 42 ? "classic_tiff" : magic === 43 ? "bigtiff" : "unknown",
    magic,
    first_ifd_offset: firstIfdOffset,
    byte_length: bytes.length,
    first_16_bytes_hex: [...bytes.slice(0, 16)].map((b) => b.toString(16).padStart(2, "0")).join(" ")
  };
};
const probeTiffHeader = async (href, signal) => {
  const response = await fetch(href, { method: "GET", headers: { range: "bytes=0-1023" }, signal });
  if (!response.ok && response.status !== 206) {
    return { ok: false, http_status: response.status, content_type: response.headers.get("content-type"), content_range: response.headers.get("content-range") };
  }
  const buffer = await response.arrayBuffer();
  return {
    ok: true,
    http_status: response.status,
    content_type: response.headers.get("content-type"),
    content_range: response.headers.get("content-range"),
    byte_length: buffer.byteLength,
    tiff_header: parseTiffHeader(buffer)
  };
};

export async function onRequestGet({ request }) {
  const validation = validate(request);
  if (validation.error) {
    const [code, message, guidance] = validation.error;
    return fail(code, message, guidance);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const located = await locateAsset(validation.params, controller.signal);
    if (located.error) return fail(located.error.code, located.error.message, "Keep public UI metadata-only and inspect asset reachability.", located.error.status, located.error.extra);
    const tiff_probe = await probeTiffHeader(located.asset.href, controller.signal);
    if (!tiff_probe.ok) return fail("range_failed", "Could not read TIFF header range.", "Keep public UI metadata-only and inspect upstream/range behavior.", 502, { tiff_probe });
    if (!tiff_probe.tiff_header?.ok) return fail("tiff_parse_failed", "TIFF header probe did not recognize a supported TIFF header.", "Keep public UI metadata-only until TIFF parsing is investigated.", 502, { tiff_probe });
    return json({
      data_type: "real_observation_tiff_probe",
      status: "ok",
      dataset_id: DATASET_ID,
      band: BAND,
      sampling_status: "tiff_header_probe_only",
      sample_status: "not_sampled",
      bbox: validation.params.bbox,
      date_range: { start: validation.params.start, end: validation.params.end },
      matched_date: located.date,
      item_url: located.item_url,
      asset_key: located.asset.key,
      asset_href: located.asset.href,
      tiff_probe,
      summary: { unit: null, mean: null, min: null, max: null },
      warnings: [
        "EMS-RD-03B research endpoint only.",
        "This reads the COG/TIFF header range and does not decode raster pixels.",
        "Do not connect this endpoint to public Storm/Compare/Card as real sampled values."
      ],
      next_decision: tiff_probe.ok && tiff_probe.tiff_header?.ok ? "TIFF header is readable; next research can inspect IFD tags needed for sample windows." : "TIFF header probe failed or is not recognized; keep metadata-only until investigated.",
      retrieved_at: new Date().toISOString()
    });
  } catch (err) {
    return fail(err?.name === "AbortError" ? "timeout" : "upstream_fail", "TIFF probe failed before raster decoding.", "Keep public UI metadata-only and inspect upstream/range behavior.", 502, { reason: err?.message || String(err) });
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequestPost() {
  return fail("method_not_allowed", "Use GET for this research endpoint.", "Call with bbox, start, end, and preset=low.", 405);
}
