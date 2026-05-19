# EMS-RD-18 Task Selection

Path A VERIFY: trigger browser_result_missing/network_unverified -> use autorun safe URL + downloaded JSON -> next EMS-RD-18-VERIFY.
Path B ROUTE: trigger health_manifest_failed -> fix Pages Functions route/deploy -> next EMS-RD-18-ROUTE.
Path C PROBE: trigger health_manifest_reachable -> run probes manually -> next EMS-RD-18-PROBE.
Path D SAMPLE: trigger raw_pixel_read -> start sample validation only -> next EMS-RD-18-SAMPLE.
Path E DECODER: trigger decoder_strategy_required -> isolated decoder probe -> next EMS-RD-18-DECODER.
Path F PROBEFIX: trigger endpoint_error/blocked/inconclusive/probe_checked_without_phase -> fix probe chain -> next EMS-RD-18-PROBEFIX.

Non-negotiables: storm blocked, public real disabled, no raw pixel as rainfall, no synthetic fallback hiding failures, no paid infra.
