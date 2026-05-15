const DEFAULT_QUERY = "bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01";
const json = (body, status = 200) => new Response(JSON.stringify(body, null, 2), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const classify = (payload) => {
  if (!payload || payload.status === "error") return { phase: "blocked", next: "inspect_endpoint_error", reason: payload?.message || "pixel probe did not return JSON" };
  if (payload.status === "blocked" || payload.block_reason) return { phase: "decoder_strategy_required", next: "EMS-RD-03G-decoder-strategy", reason: payload.block_reason || "pixel probe blocked by compression/layout" };
  if (payload.sample_status === "single_raw_pixel" && payload.summary && Number.isFinite(payload.summary.first_pixel)) return { phase: "raw_pixel_read", next: "EMS-RD-03H-validated-sample-probe", reason: "raw first pixel was returned; validation/units/georeferencing still required" };
  return { phase: "inconclusive", next: "inspect_pixel_probe_payload", reason: "pixel probe response did not match a known branch" };
};
export async function onRequestGet({ request }) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.search ? requestUrl.search.slice(1) : DEFAULT_QUERY;
  const endpoint = new URL(`/api/earth-map-suite/precipitation-pixel-probe?${query}`, request.url);
  try {
    const res = await fetch(endpoint, { headers: { accept: "application/json" } });
    const payload = await res.json();
    const decision = classify(payload);
    return json({
      data_type: "earth_map_suite_probe_status",
      status: "ok",
      checked_endpoint: endpoint.pathname + endpoint.search,
      checked_http_status: res.status,
      decision,
      source_payload_summary: {
        data_type: payload?.data_type || null,
        status: payload?.status || null,
        sampling_status: payload?.sampling_status || null,
        sample_status: payload?.sample_status || null,
        block_reason: payload?.block_reason || null,
        first_pixel: payload?.summary?.first_pixel ?? null
      },
      guardrails: [
        "This status endpoint does not sample real precipitation by itself.",
        "Public Storm/Compare/Card must remain disconnected until a validated sample endpoint exists.",
        "If decoder_strategy_required, do not fabricate values or fall back silently."
      ],
      retrieved_at: new Date().toISOString()
    });
  } catch (e) {
    return json({ data_type: "earth_map_suite_probe_status", status: "error", error_code: "probe_status_failed", message: e?.message || String(e), retrieved_at: new Date().toISOString() }, 502);
  }
}
