const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  },
});

export async function onRequestGet() {
  return json({
    data_type: "earth_map_suite_api_health",
    status: "ok",
    api_namespace: "/api/earth-map-suite",
    deployed_function: "health",
    research_only: true,
    public_real_data_enabled: false,
    storm_compare_card_connected: false,
    checked_at: new Date().toISOString(),
  });
}

export async function onRequestPost() {
  return json({
    data_type: "earth_map_suite_api_health",
    status: "method_not_allowed",
    api_namespace: "/api/earth-map-suite",
    deployed_function: "health",
    research_only: true,
    public_real_data_enabled: false,
    storm_compare_card_connected: false,
    checked_at: new Date().toISOString(),
  }, 405);
}
