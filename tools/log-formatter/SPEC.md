# Tool Specification — LogFormatter

- Slug: `log-formatter`
- Public URL: `https://nicheworks.app/tools/log-formatter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Make pasted Nginx-style access logs and mixed text logs easier to inspect locally by parsing recognized lines, coloring/status-grouping results, filtering visible rows, and extracting likely error traffic without uploading the pasted log through the formatter workflow.

## Current functional contract

- Accept pasted logs and built-in Nginx, error-heavy, API, and mixed parsed/unparsed samples.
- Primarily parse Nginx combined-access-log style lines while preserving unrecognized lines as unparsed content rather than discarding them from normal copy/TXT output.
- Filter visible results by include keyword, exclude keyword, numeric HTTP-status range, and quick 2xx/3xx/4xx/5xx/4xx+5xx presets.
- Show status-oriented summaries/lists and visually formatted log rows.
- Copy the currently visible result, copy 4xx/5xx rows, and save TXT.
- Provide JP/EN UI and a dark display toggle.
- Current live Pro uses the legacy shared NicheWorks Pro gate for regex filtering, structured CSV/JSON exports, Markdown reporting, and detailed User-Agent/bot/IP/URL/sensitive-string analysis.

## Inputs

- Pasted log text or built-in sample.
- Include/exclude text filters and status range/preset.
- Current legacy Pro regex controls when entitled.
- JP/EN display language and dark-mode control.

## Outputs

- Parsed/formatted log view and status summaries.
- Filtered visible log set and error-only subset.
- Free clipboard copies and TXT download.
- Current legacy Pro structured CSV/JSON export, Markdown report, regex-filter and detailed-analysis outputs.

## State and persistence

Pasted logs, filters, and current result are browser working state. The current contract does not define persistent server-side log history. Current live Pro entitlement still uses the legacy shared browser NicheWorks Pro mechanism.

## Paid-operation boundary

Current runtime evidence supports five product-scoped paid operations:

1. **regex filter** — enable include/exclude regular-expression filtering.
2. **CSV export** — structured CSV output, including the 4xx/5xx-only CSV variant.
3. **JSON export** — structured JSON export of current rows and summary.
4. **Markdown report** — generated report copy and Markdown save.
5. **advanced analysis** — detailed User-Agent/bot, IP/URL and sensitive-string analysis currently presented in the Pro layer.

The following remain Free and must not be moved behind Pro as part of migration:

- normal include/exclude keyword filtering;
- numeric/status-preset filtering;
- current basic summary cards/lists;
- formatted visible rows;
- visible-result copy;
- 4xx/5xx copy;
- TXT download.

## Product-scoped migration staging

`tools/log-formatter/product-scoped-controller.mjs` is a **non-live staging wrapper** over `assets/nw-product-scoped-controller.mjs`. It does not replace the current public `pro-bridge.js` or activate a real LogFormatter product.

The staged wrapper requires:

- an explicit future `productId` with no default product;
- a complete and unique feature-ID mapping for the five paid operations;
- common server-backed `refreshProState({ productId })` verification through the shared controller core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, and entitlement-refresh failure states fail closed through the shared core.

The current `$2.99` UI copy and historical shared Stripe Payment Link are legacy commerce copy only. They do not establish the future LogFormatter product price, billing model, product ID, price tier, Stripe Price mapping, production feature namespace, or live/test policy.

## Privacy and network behavior

Pasted log parsing/filtering runs in the browser and logs are not intentionally submitted to a NicheWorks application backend by the formatter. Advertising, analytics, and current legacy Pro resources may load independently. Users must still review IP addresses, cookies, Authorization headers, emails, tokens, and other secrets before copying or saving output.

The staged product-scoped controller handles only fixed product/feature entitlement metadata. Pasted logs, parsed rows, IPs, URLs, User-Agent values, sensitive-string findings, generated reports, filenames, and exports must not be added to billing or entitlement requests.

## Language mode

`bilingual single-page`

JP/EN controls switch the same formatter and guidance.

## Layout class

`pc-oriented`

Large logs, filter controls, summaries, and formatted rows are desktop-oriented; the page itself explicitly recommends desktop for large-log inspection while mobile is suitable for shorter checks/copies.

## Limits and non-goals

- Parsing is optimized for Nginx combined-style access logs; other formats can remain unparsed.
- The tool does not guarantee that a highlighted/error row identifies root cause or security impact.
- It is not a SIEM, log-ingestion service, malware detector, or live server-monitoring system.
- Local processing does not make copied/saved logs safe to share; secrets and personal data can remain in output.
- The staged product-scoped contract does not authorize a product ID, price, Stripe Price ID, production feature namespace, or live checkout.

## Acceptance criteria

- [ ] Recognized Nginx-style lines are parsed/formatted while unrecognized lines remain visible/preservable rather than being silently dropped.
- [ ] Keyword/status filters and quick status presets change the visible result set and error-only copy targets the implemented 4xx/5xx subset.
- [ ] Free visible/error copy and TXT save remain available without Pro.
- [ ] Current basic summaries remain available without Pro.
- [ ] Current legacy Pro gates regex filtering, structured CSV/JSON exports, Markdown reporting, and detailed analysis.
- [ ] JP/EN and dark-display controls do not change the underlying log content or privacy warning.
- [ ] The staged product-scoped wrapper defines exactly the five paid operations and delegates entitlement-state logic to the shared controller core.
- [ ] Public runtime remains on the legacy gate until authoritative commercial configuration and an explicit migration are authorized.

## Implementation evidence

- `tools/log-formatter/index.html`
- `tools/log-formatter/app.js`
- `tools/log-formatter/pro-bridge.js`
- `tools/log-formatter/style.css`
- `tools/log-formatter/product-scoped-controller.mjs`
- `scripts/check-log-formatter-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave1.md`
