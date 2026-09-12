# Per-tool specification contract — wave 6

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

Finish the machine-checked per-tool specification layer after PR #512. Wave 6 covers the final 11 pending tools and records current implemented contracts at `tools/{slug}/SPEC.md`. Production HTML/JS/CSS changes remain out of scope for this documentation wave.

## Base and scope

- Base main SHA: `44c2fd501096d0e59fa9ee9114b550323c91b46f`.
- Starting coverage: 76 complete / 11 pending.
- Target coverage: 87 complete / 0 pending.
- Branch: `feat/tool-spec-contract-wave6-20260912`.

## Wave 6 tools

1. `tiny-audio-meter`
2. `trashnavi`
3. `ui-atlas`
4. `unicode-kanji-checker`
5. `unitmaster`
6. `url-title-collector`
7. `variant-kanji-compare`
8. `vibe-lexicon`
9. `weatherdiff`
10. `webp-avif-converter`
11. `wifi-meter`

## Progress

- [x] PR #512 merged at `44c2fd501096d0e59fa9ee9114b550323c91b46f`.
- [x] Created the wave-6 branch from that exact merge SHA.
- [x] Inspected current implementation of all 11 tools.
- [x] Added substantive current-state `SPEC.md` files for all 11 tools.
- [x] Raised manifest to 87 complete / 0 pending with `required_complete: 87`.
- [ ] Run Tool spec audit and existing repository checks.
- [ ] Confirm documentation-only diff, open PR, squash merge, and confirm main-side audit.

## Decision Log

- Decision: finish the remaining pending registry entries in one final wave.
  Rationale: only 11 remain and the checker already enforces parity and complete-spec requirements.
  Date: 2026-09-12.

- Decision: continue to record runtime behavior rather than marketing copy where they diverge.
  Rationale: the final 87/87 contract must be an implementation-grounded SSOT for later quality repair.
  Date: 2026-09-12.

- Decision: document measurement APIs as estimates rather than physical sensors where the browser does not expose the claimed physical quantity.
  Rationale: Tiny Audio Meter and WiFi Meter must not imply calibrated dB SPL, RSSI, ping, or speed-test measurements that their runtimes do not perform.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires all final 11 specs to pass `scripts/check-tool-spec-contract.mjs`, manifest coverage to reach 87/87 with zero pending entries, and no production HTML/JS/CSS changes.

## Surprises & Discoveries

- `tiny-audio-meter` derives relative loudness from microphone RMS and estimates pitch only around 60–1200 Hz. It stores up to 20 numeric snapshots in page memory and never records audio files.
- `trashnavi` is a browser-filtered directory over self-hosted nationwide municipality data plus verified direct waste links. It is not a waste-sorting decision engine or application service.
- `ui-atlas` has 100 examples, language-specific local favorites/recent history, Free 2-item compare, and common-Pro 5-item compare.
- `unicode-kanji-checker` and `variant-kanji-compare` consume same-site Old Kanji Reference dictionaries/metadata and keep their Old Kanji Toolkit Pro panels in `billing-unavailable` state.
- `unitmaster` persists only the latest five conversion-history items plus language/theme settings and treats traditional units as representative approximations.
- `url-title-collector` has a material disclosure mismatch: the page describes processing as local / fully browser-based, but runtime sends every entered URL to `floral-voice-bfc0.nicheworks-tools.workers.dev` so the Worker can fetch target HTML. The SPEC records the Worker transmission as truth; production copy repair is intentionally separate.
- `vibe-lexicon` keeps Free compare at two terms; current Pro unlocks output work packs but does not expand the compare-count constant.
- `weatherdiff` sends place-name queries to geocoding and coordinates to Open-Meteo and MET Norway; it is explicitly unsuitable for disaster, evacuation, warning, transport, or business-critical decisions.
- `webp-avif-converter` uses browser decode plus Canvas for one image at a time. JPEG conversion flattens transparency to white at quality 0.92; AVIF support depends on the browser.
- `wifi-meter` does not measure Wi-Fi signal strength, RSSI, SSID, real ping, packet loss, or throughput. It polls Network Information API estimates once per second and classifies them with local thresholds.

## Outcomes & Retrospective

Pending CI and merge. The final implementation review now has substantive current-state contracts for all 87 registry tools, with the manifest raised to 87 complete / 0 pending and no production HTML/JS/CSS changes in this wave.
