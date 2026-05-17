const DATASET_ID = "JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily";
const BAND = "PRECIP";
const STAC_BASE_URL = `https://s3.ap-northeast-1.wasabisys.com/je-pds/cog/v1/${DATASET_ID}`;
const COLLECTION_URL = `${STAC_BASE_URL}/collection.json`;
const SOURCE_NAME = "JAXA Earth API / EORC GSMaP STAC COG";
const ATTRIBUTION = "GSMaP by JAXA/EORC, accessed via JAXA Earth API STAC/COG metadata.";
const REQUEST_TIMEOUT_MS = 9000;
const ALLOWED_PARAMS = new Set(["bbox", "start", "end", "preset"]);
const PRESET_LIMITS = {
  low: { maxDays: 14, maxSpanDegrees: 2.0 },
  mid: { maxDays: 7, maxSpanDegrees: 1.0 }
};
const MS_PER_DAY = 86400000;

const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const invalid = (errorCode, message, guidance, status = 400) => json({
  data_type: "unavailable",
  status: "error",
  error_code: errorCode,
  message,
  guidance
}, status);

const unavailable = (errorCode, message, guidance, status = 502, details = undefined) => json({
  data_type: "unavailable",
  status: "error",
  error_code: errorCode,
  message,
  guidance,
  dataset_id: DATASET_ID,
  retrieved_at: new Date().toISOString(),
  ...(details ? { details } : {})
}, status);

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");

const parseDate = (value) => {
  if (!isIsoDate(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
};

const listDates = (start, end) => {
  const dates = [];
  for (let time = start.getTime(); time <= end.getTime(); time += MS_PER_DAY) {
    dates.push(new Date(time).toISOString().slice(0, 10));
  }
  return dates;
};

const parseBbox = (value) => {
  if (!value) return null;
  const parts = value.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return null;
  const [minLon, minLat, maxLon, maxLat] = parts;
  if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90) return null;
  if (minLon >= maxLon || minLat >= maxLat) return null;
  return [minLon, minLat, maxLon, maxLat];
};

const validateRequest = (request) => {
  const url = new URL(request.url);
  for (const key of url.searchParams.keys()) {
    if (!ALLOWED_PARAMS.has(key)) {
      return { error: ["missing_or_invalid_params", `Unsupported query parameter: ${key}.`, "Use only bbox, start, end, and preset for this JSON endpoint."] };
    }
  }

  const rawBbox = url.searchParams.get("bbox");
  const rawStart = url.searchParams.get("start");
  const rawEnd = url.searchParams.get("end");
  const preset = (url.searchParams.get("preset") || "low").toLowerCase();

  if (!rawBbox || !rawStart || !rawEnd) {
    return { error: ["missing_or_invalid_params", "bbox, start, and end are required.", "Example: ?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-03&preset=low"] };
  }
  if (!Object.prototype.hasOwnProperty.call(PRESET_LIMITS, preset)) {
    return { error: ["limit_exceeded", "preset must be low or mid.", "Use preset=low for up to 14 days / 2 degrees, or preset=mid for up to 7 days / 1 degree."] };
  }

  const bbox = parseBbox(rawBbox);
  if (!bbox) {
    return { error: ["missing_or_invalid_params", "bbox must be four finite numbers in minLon,minLat,maxLon,maxLat order with valid latitude/longitude ranges.", "Use longitude -180..180, latitude -90..90, minLon < maxLon, and minLat < maxLat."] };
  }

  const start = parseDate(rawStart);
  const end = parseDate(rawEnd);
  if (!start || !end || end < start) {
    return { error: ["missing_or_invalid_params", "start and end must be real YYYY-MM-DD dates, and end must be on or after start.", "Use an ISO date such as 2025-08-01, with end on the same day or later."] };
  }

  const limits = PRESET_LIMITS[preset];
  const spanDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  if (spanDays > limits.maxDays) {
    return { error: ["limit_exceeded", `Date range is ${spanDays} days; preset=${preset} allows ${limits.maxDays} days maximum.`, "Shorten the date range or use preset=low when a larger low-cost request is acceptable."] };
  }
  if (width > limits.maxSpanDegrees || height > limits.maxSpanDegrees) {
    return { error: ["limit_exceeded", `bbox width/height must be ${limits.maxSpanDegrees} degrees or less for preset=${preset}.`, "Reduce the bbox size or use preset=low for up to 2.0 degrees per axis."] };
  }

  return {
    params: {
      bbox,
      start: rawStart,
      end: rawEnd,
      preset,
      dates: listDates(start, end)
    }
  };
};

const pad2 = (value) => String(value).padStart(2, "0");
const formatLonDegree = (value) => `${String(Math.abs(value).toFixed(0)).padStart(3, "0")}.00`;
const formatLatDegree = (value) => `${pad2(Math.abs(value).toFixed(0))}.00`;
const formatLon = (value) => `E${formatLonDegree(value)}`;
const formatLat = (value) => `${value < 0 ? "S" : "N"}${formatLatDegree(value)}`;

const normalizeLon360 = (lon) => (lon < 0 ? lon + 360 : lon);

const lonIntervals360 = ([minLon, , maxLon]) => {
  if (minLon < 0 && maxLon > 0) {
    return [[0, normalizeLon360(maxLon)], [normalizeLon360(minLon), 360]];
  }
  return [[normalizeLon360(minLon), normalizeLon360(maxLon)]];
};

const tileIndexesForInterval = (min, max, step, lowerLimit, upperLimit) => {
  const clampedMin = Math.max(lowerLimit, Math.min(upperLimit, min));
  const clampedMax = Math.max(lowerLimit, Math.min(upperLimit, max));
  const startIndex = Math.floor((clampedMin - lowerLimit) / step);
  const endIndex = Math.max(startIndex, Math.ceil((clampedMax - lowerLimit) / step) - 1);
  const indexes = [];
  const maxIndex = Math.floor((upperLimit - lowerLimit) / step) - 1;
  for (let index = startIndex; index <= endIndex && index <= maxIndex; index += 1) indexes.push(index);
  return indexes;
};

const tilePathsForBbox = (bbox) => {
  const lonIndexes = new Set();
  for (const [min, max] of lonIntervals360(bbox)) {
    for (const index of tileIndexesForInterval(min, max, 90, 0, 360)) lonIndexes.add(index);
  }
  const latIndexes = tileIndexesForInterval(bbox[1], bbox[3], 90, -90, 90);
  const paths = [];
  for (const lonIndex of [...lonIndexes].sort((a, b) => a - b)) {
    const lonMin = lonIndex * 90;
    const lonMax = lonMin + 90;
    const lonPart = `${formatLon(lonMin)}-${formatLon(lonMax)}`;
    for (const latIndex of latIndexes) {
      const latMin = -90 + latIndex * 90;
      const latMax = latMin + 90;
      const latPart = `${formatLat(latMin)}-${formatLat(latMax)}`;
      paths.push(`${lonPart}/${latPart}.json`);
    }
  }
  return paths;
};

const itemUrlsForRequest = ({ dates, bbox }) => {
  const tilePaths = tilePathsForBbox(bbox);
  const urls = [];
  for (const date of dates) {
    const [year, month, day] = date.split("-");
    for (const tilePath of tilePaths) {
      urls.push({ date, url: `${STAC_BASE_URL}/${year}-${month}/${day}/1/${tilePath}` });
    }
  }
  return urls;
};

const assetLooksLikeBand = ([key, asset]) => {
  const haystack = [key, asset?.title, asset?.description, asset?.href, ...(asset?.roles || [])]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
  return haystack.includes(BAND);
};

const findPrecipAssets = (item) => Object.entries(item?.assets || {})
  .filter(assetLooksLikeBand)
  .map(([key, asset]) => ({ key, href: asset.href || null, type: asset.type || null, title: asset.title || null }))
  .filter((asset) => asset.href);

const extractItemDate = (item, fallbackDate) => {
  const datetime = item?.properties?.datetime || item?.properties?.start_datetime || item?.datetime;
  return isIsoDate(String(datetime || "").slice(0, 10)) ? String(datetime).slice(0, 10) : fallbackDate;
};

const fetchJson = async (url, signal) => {
  const response = await fetch(url, { headers: { accept: "application/json" }, signal });
  if (!response.ok) return { ok: false, status: response.status, url };
  return { ok: true, status: response.status, url, body: await response.json() };
};

export async function onRequestGet({ request }) {
  const validation = validateRequest(request);
  if (validation.error) {
    const [errorCode, message, guidance] = validation.error;
    return invalid(errorCode, message, guidance);
  }

  const retrievedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const collectionResult = await fetchJson(COLLECTION_URL, controller.signal);
    if (!collectionResult.ok) {
      return unavailable("upstream_fail", "GSMaP STAC collection metadata could not be retrieved.", "Retry later. If this persists, keep the public UI in placeholder mode and re-check the JAXA Earth API / Wasabi STAC endpoint.", 502, {
        collection_url: COLLECTION_URL,
        http_status: collectionResult.status
      });
    }

    const collection = collectionResult.body;
    const itemCandidates = itemUrlsForRequest(validation.params);
    const itemResults = [];
    for (const candidate of itemCandidates) {
      const result = await fetchJson(candidate.url, controller.signal);
      if (result.ok) itemResults.push({ date: candidate.date, url: candidate.url, item: result.body });
    }

    if (itemResults.length === 0) {
      return unavailable("asset_missing", "No GSMaP daily STAC items were found for the requested bbox/date range.", "Try a different date, confirm the dataset coverage, or inspect the candidate STAC item URL pattern documented in REAL_DATA_INVESTIGATION.md.", 404, {
        checked_item_count: itemCandidates.length,
        sample_item_urls: itemCandidates.slice(0, 6).map((candidate) => candidate.url)
      });
    }

    const precipAssets = itemResults.flatMap(({ date, url, item }) => findPrecipAssets(item).map((asset) => ({ ...asset, date: extractItemDate(item, date), item_url: url })));
    if (precipAssets.length === 0) {
      return unavailable("asset_missing", "GSMaP STAC items were found, but no PRECIP COG asset was identified.", "Inspect the returned STAC item asset keys before enabling raster sampling; do not substitute synthetic precipitation values.", 502, {
        item_count: itemResults.length,
        asset_keys_by_item: itemResults.slice(0, 6).map(({ date, item }) => ({ date, asset_keys: Object.keys(item?.assets || {}) }))
      });
    }

    const license = collection.license || collection.links?.find((link) => link.rel === "license")?.href || null;
    const matchedDates = [...new Set(precipAssets.map((asset) => asset.date))].sort();

    return json({
      data_type: "real_observation_metadata",
      status: "ok",
      dataset_id: DATASET_ID,
      band: BAND,
      source: SOURCE_NAME,
      license,
      license_status: license ? "verified" : "needs_review",
      attribution: ATTRIBUTION,
      bbox: validation.params.bbox,
      date_range: {
        start: validation.params.start,
        end: validation.params.end
      },
      item_count: itemResults.length,
      asset_count: precipAssets.length,
      matched_dates: matchedDates,
      sampling_status: "metadata_only",
      summary: {
        unit: "source unit pending verification; no raster values sampled in RD-02",
        mean: null,
        max: null,
        min: null
      },
      retrieved_at: retrievedAt,
      notes: [
        "RD-02 intentionally returns STAC/COG metadata only; it does not parse COG raster pixels or fabricate precipitation values.",
        "Cloudflare Pages Functions can fetch JSON metadata with platform fetch, but GeoTIFF/COG window sampling needs a separate lightweight strategy or dependency review.",
        `Discovered ${precipAssets.length} PRECIP-like asset(s) across ${itemResults.length} STAC item(s).`
      ]
    });
  } catch (error) {
    const aborted = error && error.name === "AbortError";
    return unavailable(aborted ? "timeout" : "upstream_fail", aborted
      ? "Timed out while retrieving GSMaP STAC metadata."
      : "Failed while retrieving GSMaP STAC metadata.", "Retry with a smaller bbox/date range. If the problem persists, leave the public UI disconnected from real data and inspect upstream reachability.", 502, {
      reason: error && error.message ? error.message : String(error)
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequestPost() {
  return unavailable("missing_or_invalid_params", "Use GET for this JSON-only proof endpoint.", "Call /api/earth-map-suite/precipitation with bbox, start, end, and optional preset query parameters.", 405);
}
