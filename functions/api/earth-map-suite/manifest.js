const json = (payload, status = 200) => new Response(JSON.stringify(payload, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  },
});

const ENDPOINTS = [
  {
    path: "/api/earth-map-suite/self-check",
    purpose: "route-level API namespace reachability check without upstream fetches",
    stage: "ems-rd-14-verify",
    external_fetch: false,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/health",
    purpose: "lightweight deployment reachability check",
    stage: "ems-rd-06",
    external_fetch: false,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/safe-result",
    purpose: "safe browser-result-like bundle without upstream fetches",
    stage: "ems-rd-21-verify",
    external_fetch: false,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/probe-status",
    purpose: "classify precipitation probe branch status",
    stage: "ems-rd-04b-research",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/precipitation",
    purpose: "metadata-only precipitation access status",
    stage: "metadata-only-mvp",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/precipitation-sample",
    purpose: "research sampling skeleton endpoint",
    stage: "research",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/precipitation-sample-real",
    purpose: "safe-unavailable real-observation contract gate",
    stage: "ems-rd-05",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/precipitation-pixel-probe",
    purpose: "raw pixel probe for decoder/geolocation research",
    stage: "research",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/precipitation-tiff-probe",
    purpose: "GeoTIFF structure probe",
    stage: "research",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/precipitation-ifd-probe",
    purpose: "IFD metadata probe for raster decoding",
    stage: "research",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/precipitation-tile-probe",
    purpose: "tile offset/layout probe",
    stage: "research",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
  {
    path: "/api/earth-map-suite/precipitation-feasibility-probe",
    purpose: "sampling feasibility checkpoint",
    stage: "research",
    external_fetch: true,
    public_ui_allowed: false,
    real_observation_public_ready: false,
  },
];

export async function onRequestGet() {
  return json({
    data_type: "earth_map_suite_api_manifest",
    status: "ok",
    real_data_first: true,
    public_real_data_enabled: false,
    storm_compare_card_connected: false,
    generated_at: new Date().toISOString(),
    endpoints: ENDPOINTS,
  });
}