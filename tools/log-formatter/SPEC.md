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
- Keep regex filtering and the current structured/detailed Pro analysis/report features gated behind shared NicheWorks Pro.

## Inputs

- Pasted log text or built-in sample.
- Include/exclude text filters and status range/preset.
- Pro regex controls when entitled.
- JP/EN display language and dark-mode control.

## Outputs

- Parsed/formatted log view and status summaries.
- Filtered visible log set and error-only subset.
- Clipboard copies and TXT download.
- Pro-only regex/structured-analysis/report outputs implemented by the current Pro layer.

## State and persistence

Pasted logs, filters, and current result are browser working state. The current contract does not define persistent server-side log history. Shared Pro entitlement is browser-local through the common NicheWorks mechanism.

## Privacy and network behavior

Pasted log parsing/filtering runs in the browser and logs are not intentionally submitted to a NicheWorks application backend by the formatter. Advertising, analytics, and shared Pro resources may load independently. Users must still review IP addresses, cookies, Authorization headers, emails, tokens, and other secrets before copying or saving output.

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

## Acceptance criteria

- [ ] Recognized Nginx-style lines are parsed/formatted while unrecognized lines remain visible/preservable rather than being silently dropped.
- [ ] Keyword/status filters and quick status presets change the visible result set and error-only copy targets the implemented 4xx/5xx subset.
- [ ] Free visible/error copy and TXT save remain available without Pro while regex/advanced report tooling stays gated.
- [ ] JP/EN and dark-display controls do not change the underlying log content or privacy warning.

## Implementation evidence

- `tools/log-formatter/index.html`
- `tools/log-formatter/app.js`
- `tools/log-formatter/style.css`
- shared NicheWorks Pro integration used by the tool
