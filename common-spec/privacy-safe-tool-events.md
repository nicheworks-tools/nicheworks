# Privacy-safe tool usage events — scoped exception

Status: active pilot specification
Date: 2026-09-13

## 1. Purpose

This document defines a narrow exception to the common specification rule that prohibits adding JavaScript for tracking purposes.

The exception exists only to measure whether visitors actually use a NicheWorks tool after arriving from search engines, AI assistants, referrals, or direct traffic. It does not permit analytics of user-entered content.

## 2. Scope and precedence

For the event implementation described here, this document is a scoped exception to `common-spec/spec-ja.md` section 3 only.

The following rules remain unchanged and take precedence everywhere else:

- user input data must not be sent to a server;
- files, file names, file contents, clipboard contents, search text, generated output, microphone/audio data, image data, exact measurement values, device IDs, and error details must not be included in analytics events;
- tool processing remains local-first;
- the existing GA4 property and tag must not be replaced or duplicated.

## 3. Allowed implementation

The shared files authorized by this exception are:

- `/assets/nw-tool-analytics.js` — fixed allowlist + GA4 event sender;
- `/assets/nw-tool-analytics-pilot.js` — DOM-only bindings for the explicitly listed pilot tools.

The event sender may call the existing global `gtag()` function only with event names from the fixed allowlist below and fixed non-user parameters. The pilot binding file may detect only fixed UI state/action changes needed to map a user action to one of those event names. It must not pass DOM text, input values, file properties, selected item identifiers, measurements, or output values to analytics.

Allowed event names:

- `tool_start`
- `file_selected`
- `tool_execute`
- `result_shown`
- `copy_result`
- `download_result`
- `compare_use`
- `snapshot_capture`
- `segment_complete`
- `detail_open`
- `search_use`

The helper may send only these fixed parameters:

- `event_category = tool_usage`
- `event_version = 1`

No tool may attach additional parameters without a separate specification change and review.

## 4. Event semantics

- `tool_start`: the user successfully starts the primary tool function; do not fire on page load.
- `file_selected`: a local file was selected for use; never send file name, type, size, path, metadata, or contents.
- `tool_execute`: the user explicitly starts the core transformation/analysis action.
- `result_shown`: a usable result becomes available; use `trackOnce` when repeated rendering would inflate counts.
- `copy_result`: a result/prompt/output copy action succeeds or is explicitly requested by a fixed copy control. No copied content may be sent.
- `download_result`: a generated result download/export action is initiated successfully.
- `compare_use`: the user explicitly adds/uses a comparison feature.
- `snapshot_capture`: the user explicitly captures a local numeric snapshot. No captured value may be sent.
- `segment_complete`: a user-requested analysis segment completes successfully.
- `detail_open`: the user explicitly opens an item detail; do not fire for automatic initial selection.
- `search_use`: the user explicitly uses a tool search/filter interaction; avoid firing on initial rendering and never send the query.

## 5. Privacy requirements

Events are action-only telemetry. The implementation must never send:

- text entered by the user;
- search queries entered inside a tool;
- names or contents of files;
- image pixels, audio samples, microphone values, color values, postal/address text, or other derived content;
- copied/downloaded content;
- selected catalog item names/slugs;
- exact result counts or measurement values;
- browser/device identifiers beyond what the existing GA4 installation already collects;
- stack traces or free-form error messages.

If an event cannot be represented by an allowlisted fixed name without user-derived parameters, do not track it.

## 6. Failure behavior

The analytics helper and pilot bindings must be fail-silent. A blocked, unavailable, or misconfigured GA4 tag must never block or alter tool behavior.

## 7. Initial pilot

Initial pilot pages:

- Tiny Audio Meter
- Motion Atlas
- Color Replace Lite

These are selected because AI-assistant referral traffic has already reached them. Expansion to other tools requires the same action-only contract and should be based on observed traffic/usefulness rather than blanket rollout.
