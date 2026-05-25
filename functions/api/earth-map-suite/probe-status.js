import { onRequestGet as runPixelProbe } from "./precipitation-pixel-probe.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const readFirstPixel = (probe) => {
  if (probe && Object.prototype.hasOwnProperty.call(probe, "first_pixel")) {
    return probe.first_pixel;
  }
  return probe?.summary?.first_pixel;
};

const summarizeProbe = (probe) => {
  const firstPixel = readFirstPixel(probe);
  return {
    data_type: probe?.data_type ?? null,
    status: probe?.status ?? null,
    sampling_status: probe?.sampling_status ?? null,
    sample_status: probe?.sample_status ?? null,
    block_reason: probe?.block_reason ?? null,
    first_pixel: firstPixel === undefined ? null : firstPixel,
  };
};

export const classifyProbeStatus = ({ probe, http_status: httpStatus = 200 } = {}) => {
  const summary = summarizeProbe(probe);
  const firstPixelIsNumeric = isFiniteNumber(summary.first_pixel);

  if (!probe || httpStatus >= 500 || probe.status === "error") {
    return {
      summary,
      decision: {
        phase: "endpoint_error",
        next: "inspect_pixel_probe_endpoint",
        reason: probe?.error_code || probe?.message || `pixel_probe_http_${httpStatus}`,
        can_continue_to_public_ui: false,
      },
    };
  }

  if (probe.status === "blocked" && summary.block_reason === "blocked_by_compression_or_layout") {
    return {
      summary,
      decision: {
        phase: "decoder_strategy_required",
        next: "choose_verified_geotiff_decoder_before_sampling",
        reason: summary.block_reason,
        can_continue_to_public_ui: false,
      },
    };
  }

  if (probe.status === "blocked" || summary.block_reason) {
    return {
      summary,
      decision: {
        phase: "blocked",
        next: "resolve_probe_blocker_before_sampling",
        reason: summary.block_reason || probe.message || "pixel_probe_blocked",
        can_continue_to_public_ui: false,
      },
    };
  }

  if (
    probe.status === "ok" &&
    summary.sampling_status === "raw_pixel_probe_only" &&
    summary.sample_status === "single_raw_pixel" &&
    firstPixelIsNumeric
  ) {
    return {
      summary,
      decision: {
        phase: "raw_pixel_read",
        next: "validate_decoder_projection_units_and_no_data_rules",
        reason: "finite_numeric_first_pixel_read_from_research_probe",
        can_continue_to_public_ui: false,
      },
    };
  }

  return {
    summary,
    decision: {
      phase: "inconclusive",
      next: "inspect_probe_payload_before_branching",
      reason: firstPixelIsNumeric ? "unrecognized_probe_shape" : "first_pixel_missing_or_non_numeric",
      can_continue_to_public_ui: false,
    },
  };
};

export async function onRequestGet(context) {
  let probe = null;
  let httpStatus = 200;

  try {
    const response = await runPixelProbe(context);
    httpStatus = response.status;
    probe = await response.json();
  } catch (error) {
    probe = {
      data_type: null,
      status: "error",
      error_code: "probe_status_wrapper_failed",
      message: error?.message || String(error),
    };
    httpStatus = 502;
  }

  const { summary, decision } = classifyProbeStatus({ probe, http_status: httpStatus });

  return json({
    data_type: "earth_map_suite_probe_status",
    status: "ok",
    decision,
    pixel_probe_summary: summary,
    research_only: true,
    warnings: [
      "EMS-RD-04B research endpoint only.",
      "This classifier never authorizes public real precipitation display.",
      "Do not connect this endpoint to Storm, Compare, Card, app.js, or public UI without a separate validation plan.",
    ],
    retrieved_at: new Date().toISOString(),
  });
}

export async function onRequestPost() {
  return json({
    data_type: "earth_map_suite_probe_status",
    status: "ok",
    decision: {
      phase: "endpoint_error",
      next: "use_get_with_bbox_start_end",
      reason: "method_not_allowed",
      can_continue_to_public_ui: false,
    },
    pixel_probe_summary: {
      data_type: null,
      status: "error",
      sampling_status: null,
      sample_status: null,
      block_reason: null,
      first_pixel: null,
    },
    research_only: true,
  }, 405);
}
