const json = (body, status = 200) => new Response(JSON.stringify(body, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const methodNotAllowed = () => json({
  data_type: "earth_map_suite_self_check",
  status: "error",
  error_code: "method_not_allowed",
  message: "Use GET for this route-level self-check endpoint.",
  public_real_data_enabled: false,
  storm_compare_card_connected: false,
  checked_at: new Date().toISOString()
}, 405);

export async function onRequestGet() {
  return json({
    data_type: "earth_map_suite_self_check",
    status: "ok",
    route_namespace: "/api/earth-map-suite",
    function_name: "self-check",
    purpose: "route-level API reachability check without upstream Earth observation fetches",
    external_fetch: false,
    research_only: true,
    public_real_data_enabled: false,
    storm_compare_card_connected: false,
    real_observation_public_ready: false,
    next_safe_check: "/api/earth-map-suite/health",
    next_manifest_check: "/api/earth-map-suite/manifest",
    guardrails: [
      "This endpoint does not sample precipitation.",
      "This endpoint does not approve Storm / Compare / Card real-data connection.",
      "This endpoint does not enable public real observation output."
    ],
    checked_at: new Date().toISOString()
  });
}

export async function onRequestPost() {
  return methodNotAllowed();
}
