# Log Formatter — canonical tool specification

- **Slug:** `log-formatter`
- **Display name (JA):** ログ整形ツール
- **Display name (EN):** Log Formatter
- **Implementation:** `tools/log-formatter/`
- **Registry state:** active (registered implementation present)
- **Category:** log, formatter, developer, debug
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `log-formatter` implementation at `/tools/log-formatter/`. It does not authorize a production rewrite.

## 2. Purpose

Make pasted Nginx-style access logs and mixed text logs easier to inspect locally by parsing recognized lines, coloring/status-grouping results, filtering visible rows, and extracting likely error traffic without uploading the pasted log through the formatter workflow.

## 3. Inputs

- Pasted log text or built-in sample.
- Include/exclude text filters and status range/preset.
- Current legacy Pro regex controls when entitled.
- JP/EN display language and dark-mode control.

## 4. Processing behavior

- Accept pasted logs and built-in Nginx, error-heavy, API, and mixed parsed/unparsed samples.
- Primarily parse Nginx combined-access-log style lines while preserving unrecognized lines as unparsed content rather than discarding them from normal copy/TXT output.
- Filter visible results by include keyword, exclude keyword, numeric HTTP-status range, and quick 2xx/3xx/4xx/5xx/4xx+5xx presets.
- Show status-oriented summaries/lists and visually formatted log rows.
- Copy the currently visible result, copy 4xx/5xx rows, and save TXT.
- Provide JP/EN UI and a dark display toggle.
- Current live Pro uses the legacy shared NicheWorks Pro gate for regex filtering, structured CSV/JSON exports, Markdown reporting, and detailed User-Agent/bot/IP/URL/sensitive-string analysis.

## 5. Outputs

- Parsed/formatted log view and status summaries.
- Filtered visible log set and error-only subset.
- Free clipboard copies and TXT download.
- Current legacy Pro structured CSV/JSON export, Markdown report, regex-filter and detailed-analysis outputs.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/log-formatter/app.js`, `tools/log-formatter/howto/en/index.html`, `tools/log-formatter/howto/index.html`, `tools/log-formatter/index.html`.

## 7. Privacy/data handling

Pasted log parsing/filtering runs in the browser and logs are not intentionally submitted to a NicheWorks application backend by the formatter. Advertising, analytics, and current legacy Pro resources may load independently. Users must still review IP addresses, cookies, Authorization headers, emails, tokens, and other secrets before copying or saving output.

The staged product-scoped controller handles only fixed product/feature entitlement metadata. Pasted logs, parsed rows, IPs, URLs, User-Agent values, sensitive-string findings, generated reports, filenames, and exports must not be added to billing or entitlement requests.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- Large logs, filter controls, summaries, and formatted rows are desktop-oriented; the page itself explicitly recommends desktop for large-log inspection while mobile is suitable for shorter checks/copies.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same formatter and guidance.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/log-formatter/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-absent`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Recognized Nginx-style lines are parsed/formatted while unrecognized lines remain visible/preservable rather than being silently dropped.
- [ ] Keyword/status filters and quick status presets change the visible result set and error-only copy targets the implemented 4xx/5xx subset.
- [ ] Free visible/error copy and TXT save remain available without Pro.
- [ ] Current basic summaries remain available without Pro.
- [ ] Current legacy Pro gates regex filtering, structured CSV/JSON exports, Markdown reporting, and detailed analysis.
- [ ] JP/EN and dark-display controls do not change the underlying log content or privacy warning.
- [ ] The staged product-scoped wrapper defines exactly the five paid operations and delegates entitlement-state logic to the shared controller core.
- [ ] Public runtime remains on the legacy gate until authoritative commercial configuration and an explicit migration are authorized.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/log-formatter/index.html`
- `tools/log-formatter/README.md`
- `tools/log-formatter/app.js`
- `tools/log-formatter/style.css`
