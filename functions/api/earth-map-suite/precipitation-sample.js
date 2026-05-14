const DATASET_ID = "JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily";
const BAND = "PRECIP";
const STAC_BASE_URL = `https://s3.ap-northeast-1.wasabisys.com/je-pds/cog/v1/${DATASET_ID}`;
const COLLECTION_URL = `${STAC_BASE_URL}/collection.json`;
const REQUEST_TIMEOUT_MS = 9000;
const MS_PER_DAY = 86400000;
const LIMITS = { low: { maxDays: 3, maxSpanDegrees: 0.5 }, mid: { maxDays: 1, maxSpanDegrees: 0.25 } };

const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

const error = (code, message, guidance, status = 400, extra = {}) => json({
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
const pad2 = (value) => String(value).padStart(2, "0");
const fmtLon = (value) => `E${String(Math.abs(value).toFixed(0)).padStart(3, "0")}.00`;
const fmtLat = (value) => `${value < 0 ? "S" : "N"}${pad2(Math.abs(value).toFixed(0))}.00`;
const normLon = (lon) => (lon < 0 ? lon + 360 : lon);
const lonIntervals = ([minLon, , maxLon]) => (minLon < 0 && maxLon > 0 ? [[0, normLon(maxLon)], [normLon(minLon), 360]] : [[normLon(minLon), normLon(maxLon)]]) ;
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
const validate = (request) => {
  const url = new URL(request.url);
  const rawBbox = url.searchParams.get("bbox");
  const rawStart = url.searchParams.get("start");
  const rawEnd = url.searchParams.get("end");
  const preset = (url.searchParams.get("preset") || "low").toLowerCase();
  const sample = (url.searchParams.get("sample") || "probe").toLowerCase();
  if (!rawBbox || !rawStart || !rawEnd) return { error: ["missing_params", "bbox, start, and end are required.", "Use a tiny bbox and a 1-3 day range for the research probe."] };
  if (!Object.prototype.hasOwnProperty.call(LIMITS, preset)) return { error: ["limit_exceeded", "preset must be low or mid for the research probe.", "Use preset=low or preset=mid."] };
  if (sample !== "probe") return { error: ["unsupported_sample", "Only sample=probe is enabled.", "This research endpoint does not parse raster values yet."] };
  const bbox = parseBbox(rawBbox);
  if (!bbox) return { error: ["invalid_bbox", "bbox must be valid minLon,minLat,maxLon,maxLat.", "Use a tiny bbox such as 139.5,35.4,140.0,35.9."] };
  const start = parseDate(rawStart);
  const end = parseDate(rawEnd);
  if (!start || !end || end < start) return { error: ["invalid_date", "start/end must be valid YYYY-MM-DD dates.", "Use a real date range."] };
  const spanDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  const limit = LIMITS[preset];
  if (spanDays > limit.maxDays) return { error: ["limit_exceeded", `Research probe allows ${limit.maxDays} day(s) for preset=${preset}.`, "Shorten the range. This endpoint is intentionally stricter than metadata-only."] };
  if (width > limit.maxSpanDegrees || height > limit.maxSpanDegrees) return { error: ["limit_exceeded", `Research probe bbox width/height must be ${limit.maxSpanDegrees} degrees or less for preset=${preset}.`, "Use a smaller bbox."] };
  return { params: { bbox, start: rawStart, end: rawEnd, preset, sample, dates: listDates(start, end) } };
};
const probeAsset = async (href, signal) => {
  const response = await fetch(href, { method: "GET", headers: { range: "bytes=0-15" }, signal });
  const bytes = response.ok || response.status === 206 ? await response.arrayBuffer() : null;
  return {
    http_status: response.status,
    accepts_range_probe: response.ok || response.status === 206,
    content_range: response.headers.get("content-range"),
    content_type: response.headers.get("content-type"),
    byte_length: bytes ? bytes.byteLength : 0
  };
};

export async function onRequestGet({ request }) {
  const validation = validate(request);
  if (validation.error) {
    const [code, message, guidance] = validation.error;
    return error(code, message, guidance);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const collection = await fetchJson(COLLECTION_URL, controller.signal);
    if (!collection.ok) return error("upstream_fail", "Collection metadata could not be retrieved.", "Keep public UI on metadata-only mode.", 502, { collection_url: COLLECTION_URL, http_status: collection.status });
    let matched = null;
    for (const candidate of itemUrls(validation.params)) {
      const item = await fetchJson(candidate.url, controller.signal);
      if (!item.ok) continue;
      const asset = findAsset(item.body);
      if (asset) { matched = { date: candidate.date, item_url: candidate.url, asset }; break; }
    }
    if (!matched) return error("asset_missing", "No PRECIP asset was found for this tiny research probe request.", "Try the verified Tokyo example and keep public UI metadata-only.", 404);
    const range_probe = await probeAsset(matched.asset.href, controller.signal);
    return json({
      data_type: "real_observation_sample_probe",
      status: "ok",
      dataset_id: DATASET_ID,
      band: BAND,
      sampling_status: "range_probe_only",
      sample_status: "not_sampled",
      bbox: validation.params.bbox,
      date_range: { start: validation.params.start, end: validation.params.end },
      matched_date: matched.date,
      item_url: matched.item_url,
      asset_key: matched.asset.key,
      asset_href: matched.asset.href,
      range_probe,
      summary: { unit: null, mean: null, min: null, max: null },
      warnings: [
        "Research endpoint only. It checks whether a PRECIP COG asset can be reached with a tiny Range request.",
        "It does not parse GeoTIFF/COG pixels and does not return real precipitation values.",
        "Do not connect this endpoint to public Storm/Compare/Card UI as real sampled data."
      ],
      retrieved_at: new Date().toISOString()
    });
  } catch (err) {
    return error(err?.name === "AbortError" ? "timeout" : "upstream_fail", "Research probe failed before raster parsing.", "Keep public UI metadata-only and inspect upstream/range behavior.", 502, { reason: err?.message || String(err) });
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequestPost() {
  return error("method_not_allowed", "Use GET for this research endpoint.", "Call with bbox, start, end, preset, and sample=probe.", 405);
}
