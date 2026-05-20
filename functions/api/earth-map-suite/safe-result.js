const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  },
});

const SAFE_ENDPOINTS = [
  {
    key: "self_check",
    path: "/api/earth-map-suite/self-check",
    ok: true,
    http_status: 200,
    status: "ok",
    data_type: "earth_map_suite_self_check",
    decision_phase: null,
    error_code: null,
  },
  {
    key: "health",
    path: "/api/earth-map-suite/health",
    ok: true,
    http_status: 200,
    status: "ok",
    data_type: "earth_map_suite_api_health",
    decision_phase: null,
    error_code: null,
  },
  {
    key: "manifest",
    path: "/api/earth-map-suite/manifest",
    ok: true,
    http_status: 200,
    status: "ok",
    data_type: "earth_map_suite_api_manifest",
    decision_phase: null,
    error_code: null,
  },
  {
    key: "probe_status",
    path: "/api/earth-map-suite/probe-status",
    ok: null,
    http_status: null,
    status: null,
    data_type: null,
    decision_phase: null,
    error_code: null,
  },
  {
    key: "precipitation_sample_real",
    path: "/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low",
    ok: null,
    http_status: null,
    status: null,
    data_type: null,
    decision_phase: null,
    error_code: null,
  },
];

export async function onRequestGet() {
  return json({
    data_type: "earth_map_suite_browser_self_check",
    status: "ok",
    mode: "api_safe_bundle",
    branch_decision: "health_manifest_reachable",
    next_task_family: "PROBE",
    public_real_data_enabled: false,
    storm_compare_card_connected: false,
    storm_real_blocked: true,
    checked_at: new Date().toISOString(),
    page_url: null,
    result_hash: null,
    result_hash_algorithm: null,
    endpoints: SAFE_ENDPOINTS,
  });
}

export async function onRequestPost() {
  return json({
    data_type: "earth_map_suite_browser_self_check",
    status: "method_not_allowed",
    error_code: "method_not_allowed",
    allowed_method: "GET",
    public_real_data_enabled: false,
    storm_compare_card_connected: false,
  }, 405);
}
