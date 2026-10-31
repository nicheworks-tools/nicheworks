# CSV Tidy Pro — Product Definition (draft / non-purchasable)

**Status:** planning only. No shipping Pro capabilities, active checkout, Stripe price binding, upgrade prompt, or entitlement can be claimed from this document.

## Customer job and purchase rationale

CSV Tidy Free completes the core job: import one CSV locally, verify encoding/delimiter/header, reorder/rename/exclude/clean columns, preview, and export with correct bytes. **All existing features remain free**, including template support and normal file sizes. Pro must not degrade these.

Pro targets recurring office operations: applying *the same verified CSV mapping* to several exports and producing actionable results without manually repeating every column edit. A one-time purchase is preferred over monthly fees because no cloud processing or ongoing storage is offered.

## MVP feature IDs

| Feature ID | Planned product behavior | Release gate |
| --- | --- | --- |
| `csvTidy.savedPresets` | Named presets containing column identities/order/renames/exclusions, cleaning options, CSV format options, and an input header/width fingerprint. Stored locally; CSV data rows not saved. | Safe validation, import/export, overwrite/delete, Unicode names |
| `csvTidy.batchApply` | Select multiple local CSV files, validate each against the preset, process **sequentially** in the browser, never silently substitute a mismatched schema. | Reuse production parser/serializer, reject ragged/quoted/ambiguous input, preserve source |
| `csvTidy.batchReport` | Each file's OK/rejected status with explicit reason, no partial outputs for invalid files; verified ZIP or equivalent user-visible batch download. | Independent reparse of browser-downloaded output, fail recovery |

No arbitrary ETL, AI cleaning, cloud uploads, account requirements or background job server.

## First-pass compatibility rules

- Versioned preset format, reject unknown version and unknown cleaning operations.
- Source columns use **source-position + original-header signature**, not name as identity; duplicate/blank headers remain distinct.
- Reject width/header mismatch before transforming or downloading that file. Do not silently fill, drop or coerce values.
- No automatic row removal/deduplication. Do not cross-inherit settings from a partially failed prior file.
- Batch processes one file at a time; stop/skip safely on errors, produce a per-file report. Resource budget must be validated in the browser: previous Node-scale 25MB long-field used about 1.92GB RSS, so total byte size alone is not a safe cap.
- Presets and CSV contents stay in the user's browser/storage. No raw CSV/header/value is logged, transmitted through licensing, analytics, or payment APIs.

## Billing contract / safety

- Product: `csv_tidy.pro_v1`, with **separate entitlement feature IDs**.
- Tentative price: **¥1,980 one time**. This is **not a price decision or sales announcement**.
- Catalog records `status: planning`, product `stripe.mode: not_connected`, and **`checkout.enabled: false`**. The server API must return `403 product_checkout_disabled` even if global checkout and Stripe env variables are set.
- Leverage the existing Stripe checkout / webhook signature verification / D1 entitlement infrastructure when authorized. Do not create a second processor.
- Client UI must request server-verifiable entitlement on each relevant session; never treat localStorage, a URL query parameter, or a client-controlled flag as proof of payment.
- **Important limitation:** public static JavaScript can be inspected and modified by a technically capable visitor. A local-only CSV engine cannot provide tamper-proof enforcement. Do not claim it can. We accept this limitation only after explicitly evaluating the revenue/security tradeoff.
- Current NicheWorks entitlement helper persists the Stripe Checkout session ID locally; **cross-device purchase recovery and durable access are not yet certified**. A secure recover-by-purchase mechanism, refund handling and a clear support process must exist before taking any money.
- Never activate checkout merely by editing a plan price: require a separate verified decision, product implementation, real checkout+webhook+refund tests and purchaser restore test.

## Prioritized rollout

1. Define and test the disabled product/billing contract without modifying the Free tool (**this PR**).
2. Build the preset core using the existing CSV Tidy functions, with independent data-integrity tests.
3. Add sequential batch engine and browser download/reparse tests, with memory safety.
4. Integrate server-verified Pro entitlement, billing UI and purchaser recovery; test modes only.
5. Run product acceptance and a paid demand/price check. Only then decide whether to enable live checkout.

## Acceptance for this planning wave

- CSV Tidy Free HTML/JS/CSS unchanged.
- Product entry validates and cannot be checked out through server API.
- No new Stripe request can be made for the disabled product regardless of site-wide checkout flags.
- Existing products without an explicit `checkout` gate preserve previous code path.
- Focused tests and repo CI green; no live payments.

## Implemented engineering checkpoints

- **2026-10-31, preset core:** `pro/preset-core.mjs` supplies a pure ESM, local-only and versioned preset contract: capture, strict allow-list validation, JSON import/export and atomic positional compatibility planning. Duplicate and blank headers/renames are preserved; source-header/order/width mismatches reject. No CSV rows are stored, and raw file processing is not implemented here.
- The preset library is not wired to the Free UI or entitlement, and does **not** mean `csvTidy.savedPresets` is user-visible or purchasable. A later controlled integration must reuse the accepted CSV state, add local persistence and test safely against the production browser.

- **2026-10-31, sequential batch engine:** `pro/batch-core.mjs` provides an offline, bounded, per-file-isolated CSV batch conversion library accepting the same pure codec functions used by the current Free CSV parser/serializer/width converter. It performs the same explicit encoding/delimiter policy, strict quote and width rejection, positional mapping and cleaning, no stale/partial output, with per-file metadata reports. Inputs are capped at **4 MiB per file** / **32 files** and output at **16 MiB per file** as preliminary memory guards, not a performance guarantee or arbitrary CSV size claim. The library requires a caller-provided `onOutput`; it does **not** currently provide ZIP, an end-user chooser, storage or payment entitlement. The follow-on browser codec adapter and user-visible, licensed Pro workflow are still missing. No raw rows are included in reports or network requests.

- **2026-10-31, ZIP output transport:** `pro/zip-store.mjs` writes CRC32-validated, UTF-8 filename ZIP STORE archives without third-party dependencies. `pro/batch-archive.mjs` collects accepted batch CSVs only and appends `csv-tidy-report.json` listing individual accepted/rejected/cancelled outcomes. It caps retained aggregate CSV output at **32 MiB**, with overall ZIP cap **48 MiB**. Invalid sources are reported, never included as input files. The archive writer is not yet attached to the public browser UI; checkout remains disabled pending end-to-end licensed UX and purchase recovery.

- **2026-10-31, verified-only browser workflow:** The Free page now loads an *invisible-by-default* Pro module and exposes a read-only bridge to its accepted source mapping and pure existing CSV codec. `pro/ui.mjs` mounts a bilingual local preset editor/batch ZIP panel **only after** `NicheWorksProEntitlement.refreshProState` reports `source=server`, `active=true`, and all three CSV Tidy Pro feature IDs. Every privileged action rechecks server entitlement. User-saved presets are locally stored with an explicit cap (12 presets / 512 KiB) and are never uploaded. Local-only QA server fixture is under `scripts/ops` and is not a production billing bypass. Live checkout stays disabled. **Browser UI acceptance requires CI PASS**; cross-device purchase restoration and real Stripe payment are not yet certified.

- **2026-10-31, manual cross-device purchase recovery (verified-only):** `/billing/success.html` now removes GA4 and scrubs checkout session identifiers from the URL before any asynchronous verification. Only after a real server-confirmed active entitlement does it offer an explicit secret-code backup. `/billing/restore.html` allows a user to paste the confidential Checkout Session ID on another device; the existing first-party entitlement endpoint confirms the matching product and active status before saving access. Invalid/wrong-product/revoked codes must not unlock. No new purchase is made from the restore page. **This is code-backup recovery, not email/passwordless account recovery**: users who lose both their backup and original device still require manual support. The test-only entitlement fixture proves browser wiring, not a paid Stripe transaction or live D1 deployment. The product remains `checkout.enabled=false`, `stripe.mode=not_connected` and `status=planning`.
