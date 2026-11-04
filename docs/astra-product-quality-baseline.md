# NicheWorks product-quality baseline — Wave 1

Audit reference date: 2026-09-17. Repository baseline: `59c95840bdff50cb2660eda12605d0ee1b071dc2`.

This is an audit, not a redesign or a release approval. The quality criterion is: **a real user can finish the tool's primary job, from input to usable output, with minimal unnecessary friction under realistic conditions**. Working as specified is necessary evidence, not proof of adequacy. No implementation, individual specification, dependency, billing configuration, or deployment was changed.

**Decision:** establish job-specific completion contracts and evidence gates before broad implementation. There are 88 registered tools, not an assumed historical total. Two public tools lose their entire interface at startup. Two additional output paths have source-confirmed completion gaps. Specification files exist for every tool, but many lack independent expected results. The suite is not demonstrated product-complete.

## 1. Repository State

| Item | Verified value |
| --- | --- |
| Repository | `nicheworks-tools/nicheworks` |
| Remote | `https://github.com/nicheworks-tools/nicheworks.git` |
| Branch | `main` |
| HEAD | `59c95840bdff50cb2660eda12605d0ee1b071dc2` |
| HEAD subject | `Construction Atlas: add Wave5N q015 support and testing content (#1134)` |
| HEAD author date | `2026-09-17T01:26:59Z` |
| Initial working tree | Clean fresh shallow clone; no pre-existing NicheWorks checkout was available in this workspace |
| Checkout used | `/workspace/scratch/0490b207d766/nicheworks` |
| Branch/history operations | No branch switch, merge, rebase, reset, or discard; no push/commit |
| Authorized additions | This report and the audit ExecPlan required by root `AGENTS.md` |

The branch and clean-tree statement describe this fresh audit checkout. They do **not** establish the state of any separate developer checkout or its uncommitted work. GitHub connection was available. Running the site locally was not a prerequisite: rendered product inspection used the public `nicheworks.app` pages. Public deployment SHA was not exposed/verified, so browser observations and repository evidence are kept separate. The browser clock and execution-container clock were not consistently aligned with the session date; use the full commit and recorded scenarios, not wall-clock ordering, to reproduce repository findings.

Instructions inspected: root `AGENTS.md`, `.agent/PLANS.md` where referenced, and the additional `tools/pattern-atlas/AGENTS.md`. Existing historical audit/specification material was used as evidence, not blindly accepted as current truth. A shallow clone does not provide a complete Git history investigation.

## 2. Tool Registry Summary

Canonical source: [tools/tools-index.json](../tools/tools-index.json). Its `total` is **88**; independently counted `items` and unique slugs are both **88**. The registry's `generatedAt` is `2026-09-13`.

| Inventory fact | Count | Meaning |
| --- | ---: | --- |
| Registered tools | 88 | Sole denominator in this report |
| Root `index.html` present | 88 | Includes informational repository-asset landing pages |
| Individual `tools/<slug>/SPEC.md` present | 88 | Presence does not mean sufficient or current |
| `docs/tools/<slug>.md` present | 88 | Additional specification/documentation family |
| Tool-local `README.md` present | 12 | Documentation presence is not limited to README files |
| Tool-local assertion suites present | 21 | 19 behavior-runner tools plus Pattern Dictionary and Reconcile |
| Dedicated `tests/behavior.test.mjs` suites executed | 19 | All passed; not full browser/end-to-end coverage |
| Public root pages navigated and initial DOM inspected | 88 | Transient loading is not counted as success or failure |
| Public root pages with startup interface destroyed | 2 | Independently consistent with current source defects |

`tools/staged-tools.json` identifies `earth-alerts` and `earth-timeseries` as staged; they are not in the 88-tool registry and are excluded. Shared assets, templates, staged tools, standalone apps/CLIs, and individual dictionary entries are not extra registered tools. Five registered entries are informational repository-asset landing pages (`ai-project-pack`, `codex-product-shipping-playbooks`, `codex-work-os`, `product-founder-os`, `release-guardian`); evaluate reading and adoption handoff, not an invented in-page processing function.

## 3. Common-Spec Observations

Primary authority: [common-spec/spec-ja.md](../common-spec/spec-ja.md), read including its later precedence/FAQ sections. The repository copy governs this baseline; an older attached copy or its version label does not override newer dated repository rules.

| Topic | Resolved requirement / uncertainty |
| --- | --- |
| Precedence | Section 9's v2 rules supersede older v1 text where they conflict. However, the explicitly dated **2026-09 AdSense review contract in sections 1/1.1** is newer and more specific than the older mandatory ad-slot text in sections 8/9. Apply that dated contract; do not reinstate placeholder ads from legacy text. The document still needs a consolidated authority map in a later documentation-only change. |
| Architecture | Static/browser-first utilities; no new framework, backend processing, accounts, cloud storage, or AI service implied by quality work. Inspect the actual loaded entry points, including inline scripts and late patches. |
| Privacy | Tool input should remain client-side under the common default. Same-origin static dictionary downloads are not user-data uploads. Existing URL proxy, weather, location, and metadata workflows need explicit scoped network disclosures/authority; do not relabel them local-only or silently remove their core dependency. |
| State | General browser storage permission and older reload-discard wording are not fully reconciled. Treat each explicit current persistence contract as evidence; document retained fields, clearing, failure, and privacy. No automatic history expansion. |
| Layout | Mobile-oriented tools must function at approximately 320–414px; 480/768 breakpoints appear in common rules. PC-oriented tables/logs/batch tools may use approximately 960–1200px layouts and internal horizontal scrolling. Do not force all tools into a narrow 600px column. |
| Languages | JA/EN behavior follows the declared mode; not every Japanese-context utility requires an invented English mode. Switching language should preserve relevant state/identity where the tool contract says so. |
| Analytics | GA4 `G-57QT78M3JB` is specified. Cloudflare Web Analytics may be injected/configured by Pages, so lack of an HTML snippet alone is not a violation. Host configuration was not verified. |
| Event exceptions | [privacy-safe-tool-events.md](../common-spec/privacy-safe-tool-events.md) (2026-09-13) and [affiliate-outbound.md](../common-spec/affiliate-outbound.md) (2026-09-16) are scoped newer exceptions to older pageview-only language: fixed allowlisted events/parameters, no user input, filenames, generated content or arbitrary URLs. Their authority does not permit general tracking expansion. |
| Advertising | No dummy ad labels, empty future manual-ad containers, or universal mandatory ad-top block. Only completed, eligible, indexable public surfaces may load ads; staged/noindex/template/billing outcome pages are excluded. |
| Donation UI | OFUSE and Ko-fi are parallel explicit choices in the stated limited placements, not automatic regional selection. |
| SEO/assets | Canonical `nicheworks.app` supersedes legacy `pages.dev`; shared assets/favicon and correct canonical/OGP/structured metadata follow page eligibility. A static check does not prove indexing or deployed metadata health. |
| Help/FAQ | A short purpose explanation is required. Usage/help depth and FAQ are conditional on the job, not mandatory feature padding for every utility. Section 10/11 advice is subordinate to applicable core rules; initial-placement vs bottom-placement recommendations need contextual interpretation. |
| Navigation | Root agent rules prohibit broad cross-tool header navigation; limited related-tool footer links are allowed. Explicit scoped pair-navigation exceptions must be considered before calling every header link invalid. |

**Authority drift is itself a quality risk.** [docs/tool-spec-standard.md](../docs/tool-spec-standard.md) establishes the 11-section tool `SPEC.md`; [docs/tools/README.md](../docs/tools/README.md) also calls the 15-section `docs/tools` family canonical. Where they diverge, neither “complete” marker is enough. Record a concrete conflict and resolve it narrowly before accepting a fix. Example: Pattern Dictionary's 20-prototype contract conflicts with current 100-record content and newer publication documentation.

The public/source inspection found leftover advertising placeholders despite the new contract. This is a current UX/constraint issue, not a reason to add monetization UI. Network exceptions, actual analytics payloads, Pages settings, and full cookie/storage behavior remain unverified beyond the source review.

## 4. Suite-Level Quality Risks

| ID | Classification | Evidence and completion impact | Next-phase disposition |
| --- | --- | --- | --- |
| F01 | **BLOCKER** | AI Interaction Atlas renders only a Pro-migration sentence. Its bridge assigns `data-pro-status` to the document element and then sets `textContent` on every matching element, including that root, removing the application. | REQUIRED repair of existing behavior; test free-mode browser boot and continued interaction. |
| F02 | **BLOCKER** | Outsource Spec Generator similarly renders only the preview/Pro status sentence. Its root receives the same attribute targeted by a broad text setter. The specification form and free result are unreachable. | REQUIRED repair of existing behavior; same startup regression gate, not a Pro redesign. |
| F03 | **CORE GAP** | Mini Game Utility directly joins score values with commas. Names containing commas/quotes and ordinary locale-formatted timestamps do not preserve the intended three CSV columns. | REQUIRED standards-correct serialization of the existing export. |
| F04 | **CORE GAP** | MetadataSnap displays fetched `og:image` content directly as `img.src`; relative paths resolve against the tool page, not the fetched page. A displayed preview can be missing or wrong. The spec explicitly accepts this limitation. | REQUIRED source-aware handling for the advertised preview, or explicit unsupported-value feedback; retain raw metadata for inspection. |
| F05 | **UX GAP** | At least 13 public tools still expose ad placeholder labels/containers inconsistent with the newer common contract; list in section 8. | REQUIRED common-constraint repair; no added ad slots. |
| F06 | **CORE GAP** (quality definition) | Generic error contracts defer to “implemented guards” and “current bounds,” rather than defining expected input/output/failure behavior. Logistics scoring fields are an explicit example; Pattern Dictionary's current definition is stale. | REQUIRED narrow completion/acceptance contracts before respective implementation, not a rewrite of all specs. |
| F07 | **CORE GAP** (verification) | Existing suite contract reports say 88 PASS while F01/F02 make primary jobs inaccessible. Behavior-runner coverage is only 19 tools and is not equivalent to booting the complete page. | REQUIRED job-level checks where changed, including full entry-point startup and output reuse. |
| F08 | **UX GAP** (documented messaging/authority) | Earth Map mixes a general no-input-upload message with a disclosed metadata request containing time/bbox; common rules and tool-specific network dependencies are not expressed consistently. | REQUIRED accurate scoped disclosure and authoritative exception decision; no speculative backend replacement. |

F06/F07 are program-level gaps, not claims that every untested tool is defective. Unknown accessibility, responsiveness, data freshness, performance, codec support, permission handling and external dependency behavior are **unresolved evidence**, not invented bugs. Privacy mistakes could materially increase severity if an actual undisclosed transfer is established; this wave does not claim to have measured all network traffic.

Previously recorded audits are useful but not interchangeable:

- [audits/tool-quality-matrix.md](../audits/tool-quality-matrix.md) reports 88 PASS and only eight behavior records (80 missing); structural/contract coverage cannot establish task completion.
- [docs/non-affiliate-audit-standard.md](../docs/non-affiliate-audit-standard.md) and [audits/NON_AFFILIATE_AUDIT_SUMMARY.md](../audits/NON_AFFILIATE_AUDIT_SUMMARY.md) cover the 72-tool non-affiliate slice, with 57 MAJOR, 12 MINOR and 3 HOLD at an older baseline. Those categories and that SHA are not this report's severity model or current findings.
- Some historical findings are already addressed: the current Color Replace zero-tolerance path and its behavior test must not be reported as the old defect. Current Reconcile purchase/preview conditions must not be inferred from an older monetization audit.

## 5. Tool Inventory

All paths are relative to the repository. Each linked tool path supplies the slug. **I/S/D** = implementation / individual spec / README-or-docs present (`Y` means yes; docs may be `docs/tools/<slug>.md`). **Tests**: `B` = dedicated behavior suite executed/passed this wave; `L` = other local assertion suites present but not run this wave; `S` = shared specification/quality checks apply and passed (mostly structural; not proof of behavior). The redactor's `generate_testdata.js` is a fixture generator, not an assertion suite.

**Live**: `R` = public initial rendered page/DOM observed, full workflow unverified; `W` = selected workflow interactions observed, not full release acceptance; `X` = interface-destroying public startup blocker. All root entries were reached; a loading snapshot alone does not prove the dataset loaded. `W` is limited to LineBreak Doctor, CSV Tidy, ManualFinder and Mini Game Utility. No local app server is required to reproduce these public observations.

**SC** uses the requested HIGH/MEDIUM/LOW specification-confidence definitions. **IC/PC** mean implementation/product-quality confidence: HIGH would require independently checked completion and relevant robustness/layout evidence; MEDIUM means targeted behavior or a directly inspectable static-content job supplies useful but incomplete support; LOW means material contradictory evidence or insufficient exercised behavior. LOW is not an assertion that the product is bad. No tool receives HIGH IC/PC in this wave.

**Disposition**: BLOCKER/CORE GAP/UX GAP are established findings above; SAMPLE means a promising bounded workflow sample; OPEN means adequacy not yet established. These are not scores. Shared documentation/test risks can coexist with any disposition.

| Tool name (registry) | Slug/path | I/S/D | Tests | Live | Likely primary job | SC | IC | PC | Disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ai Interaction Atlas | [ai-interaction-atlas](../tools/ai-interaction-atlas/) | Y/Y/Y | S | X | Search/filter → inspect detail → compare → copy a handoff | MEDIUM | LOW | LOW | BLOCKER |
| AI Project Pack | [ai-project-pack](../tools/ai-project-pack/) | Y/Y/Y | S | R | Read fit and scope → follow repository/setup links | HIGH | MEDIUM | MEDIUM | OPEN |
| Analytics Privacy Kit | [analytics-privacy-kit](../tools/analytics-privacy-kit/) | Y/Y/Y | S | R | Choose services and context → generate → review/copy text | MEDIUM | LOW | LOW | OPEN |
| API Key Token Redactor | [api-key-token-redactor](../tools/api-key-token-redactor/) | Y/Y/Y | S | R | Paste → scan → review detected spans → redact/copy | MEDIUM | LOW | LOW | OPEN |
| ATS Paste Doctor | [ats-paste-doctor](../tools/ats-paste-doctor/) | Y/Y/Y | S | R | Paste → inspect/clean → compare/reuse text | MEDIUM | LOW | LOW | OPEN |
| Codex Product Shipping Playbooks | [codex-product-shipping-playbooks](../tools/codex-product-shipping-playbooks/) | Y/Y/Y | S | R | Read playbook scope → open repository → choose a playbook | HIGH | MEDIUM | MEDIUM | OPEN |
| Codex Usage Forecaster | [codex-usage-forecaster](../tools/codex-usage-forecaster/) | Y/Y/Y | S | R | Enter usage samples → inspect rate/reset estimate | MEDIUM | LOW | LOW | OPEN |
| Codex Work OS | [codex-work-os](../tools/codex-work-os/) | Y/Y/Y | S | R | Read role/workflow descriptions → follow repository links | HIGH | MEDIUM | MEDIUM | OPEN |
| Cold Email Requirement Checker | [cold-email-requirement-checker](../tools/cold-email-requirement-checker/) | Y/Y/Y | S | R | Paste context/draft → check → review findings | MEDIUM | LOW | LOW | OPEN |
| Color Replace | [color-replace](../tools/color-replace/) | Y/Y/Y | B+S | R | Choose image → pick source/target/tolerance → preview → save PNG | MEDIUM | MEDIUM | MEDIUM | UX GAP |
| Command Safety Checker | [command-safety-checker](../tools/command-safety-checker/) | Y/Y/Y | S | R | Paste/select shell → analyze → inspect warnings | MEDIUM | LOW | LOW | OPEN |
| Construction Tools Atlas | [construction-tools-atlas](../tools/construction-tools-atlas/) | Y/Y/Y | S | R | Describe appearance/use → filter candidates → inspect reference | HIGH | LOW | LOW | OPEN |
| Contract Cleaner | [contract-cleaner](../tools/contract-cleaner/) | Y/Y/Y | S | R | Paste contract → scan attention terms → inspect questions | MEDIUM | LOW | LOW | UX GAP |
| Contract Risk Highlighter | [contract-risk-highlighter](../tools/contract-risk-highlighter/) | Y/Y/Y | S | R | Paste → highlight rule matches → inspect review/handoff | MEDIUM | LOW | LOW | OPEN |
| Cosmetic Ingredient Checker Lite | [cosmetic-ingredient-checker-lite](../tools/cosmetic-ingredient-checker-lite/) | Y/Y/Y | S | R | Paste → normalize → inspect known/unknown categories | HIGH | LOW | LOW | OPEN |
| Cover Letter Lite | [cover-letter-lite](../tools/cover-letter-lite/) | Y/Y/Y | S | R | Enter role/details → select template → generate/edit → copy | MEDIUM | LOW | LOW | OPEN |
| CSV Tidy | [csv-tidy](../tools/csv-tidy/) | Y/Y/Y | B+S | W | Load → set encoding/delimiter/header → adjust columns/rules → preview → download | MEDIUM | MEDIUM | MEDIUM | SAMPLE |
| Design Request Builder | [design-request-builder](../tools/design-request-builder/) | Y/Y/Y | S | R | Fill scope/deliverables/constraints → generate → review/copy | MEDIUM | LOW | LOW | OPEN |
| Laundry Drying Checker | [dry-meter](../tools/dry-meter/) | Y/Y/Y | S | R | Choose weather/manual conditions → select item → inspect estimate | MEDIUM | LOW | LOW | OPEN |
| Earth Map Suite | [earth-map-suite](../tools/earth-map-suite/) | Y/Y/Y | S | R | Set area/time/mode → view synthetic preview/metadata availability | MEDIUM | LOW | LOW | UX GAP |
| EXIF Cleaner Mini | [exif-cleaner-mini](../tools/exif-cleaner-mini/) | Y/Y/Y | B+S | R | Choose image(s) → canvas regeneration → inspect/download | MEDIUM | MEDIUM | MEDIUM | OPEN |
| FileType Sniffer | [filetype-sniffer](../tools/filetype-sniffer/) | Y/Y/Y | B+S | R | Select file → inspect signature/extension comparison | MEDIUM | MEDIUM | MEDIUM | UX GAP |
| Form Tool Selector | [form-tool-selector](../tools/form-tool-selector/) | Y/Y/Y | S | R | Select needs/priorities → generate category and decision memo | MEDIUM | LOW | LOW | OPEN |
| Growth Log Template Generator | [growth-log-template-generator](../tools/growth-log-template-generator/) | Y/Y/Y | S | R | Enter KPIs/hypotheses/learning → apply privacy controls → copy draft | MEDIUM | LOW | LOW | OPEN |
| Habit Plan Generator | [habit-plan-generator](../tools/habit-plan-generator/) | Y/Y/Y | S | R | Enter goal/time/days/obstacles → generate plan | MEDIUM | LOW | LOW | OPEN |
| Image Compression Inspector | [image-compression-inspector](../tools/image-compression-inspector/) | Y/Y/Y | S | R | Load → choose format/quality → compare → download | MEDIUM | LOW | LOW | OPEN |
| Image Redact | [image-redact](../tools/image-redact/) | Y/Y/Y | S | R | Load → mark regions → choose redaction → inspect/export PNG | MEDIUM | LOW | LOW | OPEN |
| INCI FastScan | [inci-fastscan](../tools/inci-fastscan/) | Y/Y/Y | S | R | Paste or OCR image → correct text → analyze known/unknown ingredients | HIGH | LOW | LOW | OPEN |
| Incident Update Generator | [incident-update-generator](../tools/incident-update-generator/) | Y/Y/Y | S | R | Enter confirmed facts → choose audience → generate/copy drafts | MEDIUM | LOW | LOW | OPEN |
| JP Postal Lite | [jp-postal-lite](../tools/jp-postal-lite/) | Y/Y/Y | B+S | R | Filter prefecture/address → choose matches → export CSV | MEDIUM | MEDIUM | MEDIUM | OPEN |
| JSON Repair | [json-repair](../tools/json-repair/) | Y/Y/Y | S | R | Paste → validate/repair → inspect → copy/download | MEDIUM | LOW | LOW | OPEN |
| JSON to Mermaid | [json2mermaid](../tools/json2mermaid/) | Y/Y/Y | S | R | Paste JSON → choose options → generate → copy/save Mermaid | MEDIUM | LOW | LOW | OPEN |
| Kanji Modernizer | [kanji-modernizer](../tools/kanji-modernizer/) | Y/Y/Y | S | R | Paste → choose direction → convert → inspect replacements/copy | MEDIUM | LOW | LOW | UX GAP |
| Laundry Code Decode | [laundry-code-decode](../tools/laundry-code-decode/) | Y/Y/Y | B+S | R | Find/select symbol → inspect meaning and combination guidance | HIGH | MEDIUM | MEDIUM | OPEN |
| Camera Lighting Check | [light-check](../tools/light-check/) | Y/Y/Y | B+S | R | Permit camera → inspect relative metrics → compare conditions | MEDIUM | MEDIUM | MEDIUM | UX GAP |
| Linebreak Doctor | [linebreak-doctor](../tools/linebreak-doctor/) | Y/Y/Y | B+S | W | Paste → choose policy → format → inspect/copy platform variant | MEDIUM | MEDIUM | MEDIUM | SAMPLE |
| Log Formatter | [log-formatter](../tools/log-formatter/) | Y/Y/Y | S | R | Paste → parse → filter status/errors → inspect rows | MEDIUM | LOW | LOW | OPEN |
| Logistics Compliance Kit JP | [logistics-compliance-kit-jp](../tools/logistics-compliance-kit-jp/) | Y/Y/Y | S | R | Enter logistics conditions/memo → generate priority/actions/draft | LOW | LOW | LOW | OPEN |
| LP Skeleton Generator | [lp-skeleton-generator](../tools/lp-skeleton-generator/) | Y/Y/Y | S | R | Enter product/audience/value → generate structure/copy → review | MEDIUM | LOW | LOW | OPEN |
| ManualFinder | [manual-finder](../tools/manual-finder/) | Y/Y/Y | B+S | W | Search model/category → inspect candidate → open official destination | HIGH | MEDIUM | MEDIUM | SAMPLE |
| Membership Offer Builder | [membership-offer-builder](../tools/membership-offer-builder/) | Y/Y/Y | S | R | Enter audience/benefits/price/limits → generate → review/copy | MEDIUM | LOW | LOW | OPEN |
| Message Generator | [message-generator](../tools/message-generator/) | Y/Y/Y | S | R | Choose purpose/culture/formality/relationship → generate/copy | MEDIUM | LOW | LOW | OPEN |
| MetadataSnap | [metadatasnap](../tools/metadatasnap/) | Y/Y/Y | S | R | Enter URL → proxy fetch → inspect title/description/image/canonical | MEDIUM | LOW | LOW | CORE GAP |
| Microtool Launch Checklist | [microtool-launch-checklist](../tools/microtool-launch-checklist/) | Y/Y/Y | S | R | Select tool context → generate checklist → review/copy | MEDIUM | LOW | LOW | OPEN |
| Mini Game Utility | [mini-game-utility](../tools/mini-game-utility/) | Y/Y/Y | S | W | Start/pause/reset timer → add score → inspect history → export CSV | LOW | LOW | LOW | CORE GAP |
| Minutes to Ops | [minutes-to-ops](../tools/minutes-to-ops/) | Y/Y/Y | S | R | Paste minutes → extract rule-based items → review/copy artifacts | MEDIUM | LOW | LOW | OPEN |
| Money Template Checker | [money-template-checker](../tools/money-template-checker/) | Y/Y/Y | B+S | R | Enter income/spending/savings target → calculate → inspect summary | HIGH | MEDIUM | MEDIUM | OPEN |
| Motion Atlas | [motion-atlas](../tools/motion-atlas/) | Y/Y/Y | S | R | Search → run demo → compare → copy guidance | MEDIUM | LOW | LOW | UX GAP |
| Moving Checklist Generator | [moving-checklist-generator](../tools/moving-checklist-generator/) | Y/Y/Y | S | R | Set date/household → generate → mark tasks → print | MEDIUM | LOW | LOW | OPEN |
| Moving Lease Final Check | [moving-lease-final-check](../tools/moving-lease-final-check/) | Y/Y/Y | S | R | Choose circumstances → inspect/check tasks → review handoff | MEDIUM | LOW | LOW | OPEN |
| Name Old Kanji Checker | [name-old-kanji-checker](../tools/name-old-kanji-checker/) | Y/Y/Y | B+S | R | Enter name → inspect candidates/details → copy reference | MEDIUM | MEDIUM | MEDIUM | OPEN |
| Newsletter Kit Generator | [newsletter-kit-generator](../tools/newsletter-kit-generator/) | Y/Y/Y | S | R | Enter theme/audience/frequency → generate kit → copy/edit | MEDIUM | LOW | LOW | OPEN |
| Niche Job Starter Kit | [niche-job-starter-kit](../tools/niche-job-starter-kit/) | Y/Y/Y | S | R | Enter role/context → generate post/questions/sheet columns | MEDIUM | LOW | LOW | OPEN |
| Notion Form Design Kit | [notion-form-design-kit](../tools/notion-form-design-kit/) | Y/Y/Y | S | R | Enter intake requirements → generate schema/workflow/messages | MEDIUM | LOW | LOW | OPEN |
| OG Image Maker | [og-image-maker](../tools/og-image-maker/) | Y/Y/Y | S | R | Enter text/colors/logo → preview → download 1200×630 image | MEDIUM | LOW | LOW | OPEN |
| Old Document Kanji Highlighter | [old-document-kanji-highlighter](../tools/old-document-kanji-highlighter/) | Y/Y/Y | S | R | Paste historical-style text → highlight → inspect modern reference | MEDIUM | LOW | LOW | OPEN |
| Old Kanji Ocr Scanner | [old-kanji-ocr-scanner](../tools/old-kanji-ocr-scanner/) | Y/Y/Y | S | R | Choose image → OCR → correct text → inspect variants | MEDIUM | LOW | LOW | OPEN |
| Old Kanji Reference | [old-kanji-reference](../tools/old-kanji-reference/) | Y/Y/Y | S | R | Search or paste → inspect entry/variants → reuse reference | MEDIUM | LOW | LOW | OPEN |
| Ops Weekly Report Generator | [ops-weekly-report-generator](../tools/ops-weekly-report-generator/) | Y/Y/Y | S | R | Enter KPIs/results/risks/actions → generate bilingual draft | MEDIUM | LOW | LOW | OPEN |
| Outsource Spec Generator | [outsource-spec-generator](../tools/outsource-spec-generator/) | Y/Y/Y | S | X | Enter scope/deliverables/acceptance → generate → copy draft | MEDIUM | LOW | LOW | BLOCKER |
| Pages Deploy Guide | [pages-deploy-guide](../tools/pages-deploy-guide/) | Y/Y/Y | S | R | Choose host/context → generate checks → review diagnosis/handoff | MEDIUM | LOW | LOW | OPEN |
| Pattern Atlas | [pattern-atlas](../tools/pattern-atlas/) | Y/Y/Y | S | R | Search reference → edit SVG colors → preview → export | MEDIUM | LOW | LOW | UX GAP |
| Pattern Dictionary | [pattern-dictionary](../tools/pattern-dictionary/) | Y/Y/Y | L+S | R | Browse/search description → inspect references → compare two | LOW | LOW | LOW | UX GAP |
| PDF Page Tools Mini | [pdf-page-tools-mini](../tools/pdf-page-tools-mini/) | Y/Y/Y | S | R | Load PDFs → select/order/rotate pages → export | MEDIUM | LOW | LOW | OPEN |
| PDF to CSV Local | [pdf2csv-local](../tools/pdf2csv-local/) | Y/Y/Y | S | R | Load PDF → inspect/edit extracted rows → export CSV/XLSX | MEDIUM | LOW | LOW | OPEN |
| Phone QuickCheck | [phone-quickcheck](../tools/phone-quickcheck/) | Y/Y/Y | B+S | R | Search handset → inspect specs/connector/power guidance | HIGH | MEDIUM | MEDIUM | OPEN |
| Place Old Kanji Checker | [place-old-kanji-checker](../tools/place-old-kanji-checker/) | Y/Y/Y | S | R | Enter place/address → inspect variant candidates | MEDIUM | LOW | LOW | OPEN |
| Product Founder OS | [product-founder-os](../tools/product-founder-os/) | Y/Y/Y | S | R | Read overview → follow repository/start links | HIGH | MEDIUM | MEDIUM | OPEN |
| CSV / Excel Reconciliation — Reconcile | [reconcile](../tools/reconcile/) | Y/Y/Y | L+S | R | Load A/B → map/normalize → match → review exceptions → export | HIGH | LOW | LOW | OPEN |
| Redirect Unwrapper | [redirect-unwrapper](../tools/redirect-unwrapper/) | Y/Y/Y | B+S | R | Paste URL → decode/extract → inspect/copy candidate | MEDIUM | MEDIUM | MEDIUM | OPEN |
| Release Guardian | [release-guardian](../tools/release-guardian/) | Y/Y/Y | S | R | Read verdict/safe-fix scope → open repository → adopt | HIGH | MEDIUM | MEDIUM | OPEN |
| Rename Wizard | [rename-wizard](../tools/rename-wizard/) | Y/Y/Y | S | R | Select files → choose rules → inspect original/candidate list → reuse | MEDIUM | LOW | LOW | OPEN |
| Screenshot Stitcher | [screenshot-stitcher](../tools/screenshot-stitcher/) | Y/Y/Y | S | R | Load several → reorder/crop/control output → preview/save | MEDIUM | LOW | LOW | OPEN |
| Size Converter | [size-converter](../tools/size-converter/) | Y/Y/Y | B+S | R | Choose category/system/input → convert or estimate → inspect comparison | HIGH | MEDIUM | MEDIUM | OPEN |
| Sponsor Page Builder | [sponsor-page-builder](../tools/sponsor-page-builder/) | Y/Y/Y | S | R | Enter project/funding use/tiers → generate → review/copy | MEDIUM | LOW | LOW | OPEN |
| SQL DB Risk Checker | [sql-db-risk-checker](../tools/sql-db-risk-checker/) | Y/Y/Y | S | R | Paste/select policy → analyze warnings → inspect spans | MEDIUM | LOW | LOW | OPEN |
| Sukima Baito Income | [sukima-baito-income](../tools/sukima-baito-income/) | Y/Y/Y | S | R | Add dated income → review month/year totals → export CSV | MEDIUM | LOW | LOW | OPEN |
| Tiny Audio Meter | [tiny-audio-meter](../tools/tiny-audio-meter/) | Y/Y/Y | S | R | Permit mic → inspect relative level/pitch/spectrum → capture/compare | HIGH | LOW | LOW | UX GAP |
| TrashNavi | [trashnavi](../tools/trashnavi/) | Y/Y/Y | S | R | Choose prefecture/municipality/type or keyword → open official link | MEDIUM | LOW | LOW | OPEN |
| UI Atlas | [ui-atlas](../tools/ui-atlas/) | Y/Y/Y | S | R | Search → inspect details/examples → compare → copy guidance | MEDIUM | LOW | LOW | UX GAP |
| Unicode Kanji Checker | [unicode-kanji-checker](../tools/unicode-kanji-checker/) | Y/Y/Y | B+S | R | Enter text/character → inspect code points/entities/UTF-16 | MEDIUM | MEDIUM | MEDIUM | OPEN |
| UnitMaster | [unitmaster](../tools/unitmaster/) | Y/Y/Y | S | R | Choose category/units → enter value → inspect single/batch conversion | MEDIUM | LOW | LOW | OPEN |
| URL Title Collector | [url-title-collector](../tools/url-title-collector/) | Y/Y/Y | S | R | Paste one per line → collect → inspect statuses → copy CSV/TSV | MEDIUM | LOW | LOW | OPEN |
| Variant Kanji Compare | [variant-kanji-compare](../tools/variant-kanji-compare/) | Y/Y/Y | B+S | R | Enter/select characters → inspect side-by-side glyph/encoding/reference | MEDIUM | MEDIUM | MEDIUM | OPEN |
| Vibe Lexicon | [vibe-lexicon](../tools/vibe-lexicon/) | Y/Y/Y | S | R | Search vibe term → compare related terms → copy practical wording | MEDIUM | LOW | LOW | UX GAP |
| WeatherDiff | [weatherdiff](../tools/weatherdiff/) | Y/Y/Y | B+S | R | Choose location → fetch both sources → inspect today/tomorrow differences | MEDIUM | MEDIUM | MEDIUM | OPEN |
| WebP AVIF Converter | [webp-avif-converter](../tools/webp-avif-converter/) | Y/Y/Y | B+S | R | Choose one file → select output → preview → download | HIGH | MEDIUM | MEDIUM | UX GAP |
| Wi-Fi Meter | [wifi-meter](../tools/wifi-meter/) | Y/Y/Y | B+S | R | Start/read estimates → inspect trend/unsupported state | HIGH | MEDIUM | MEDIUM | UX GAP |

The per-tool job cards after section 13 provide the target situation, current/intended workflow, completion definition, required capabilities, output usability, failure probes, non-goals, and confidence rationale for all 88 tools. “Current workflow” describes the implemented surface, except the two explicitly inaccessible startup cases. Proposed completion criteria are audit hypotheses grounded in the job, not silently approved new specifications. Required capabilities can already exist; listing them does not request new features.

## 6. Specification Quality Distribution

| Confidence | Tools | Interpretation |
| --- | ---: | --- |
| HIGH | 17 | Clear job plus substantial explicit behavior/boundary definitions consistent enough to evaluate; still not proof of correct implementation or complete browser evidence |
| MEDIUM | 68 | Usable definition, but meaningful uncertainty in input/output examples, failure rules, realistic size, handoff, or current implementation agreement |
| LOW | 3 | Pattern Dictionary: stale publication/data contract; Mini Game Utility: output contract accepts structurally unusable CSV; Logistics Compliance Kit JP: implementation-defined input/scoring contract |
| Total | 88 | Counts derived from the inventory rows |

The 17 HIGH entries are the five informational repository-asset pages plus Construction Tools Atlas, Cosmetic Ingredient Checker Lite, INCI FastScan, Laundry Code Decode, ManualFinder, Phone QuickCheck, Size Converter, Reconcile, Tiny Audio Meter, WiFi Meter, WebP/AVIF Converter and Money Template Checker. Their job/boundary definitions are relatively concrete; the individual cards still identify verification gaps. HIGH does not endorse medical/legal/financial conclusions from reference utilities.

A checked “Specification status: complete” and a passing coverage script do not raise confidence. Missing requirements were not invented to improve these categories. MEDIUM is deliberately not collapsed into HIGH simply because an acceptance checklist exists.

## 7. Preliminary Product Quality Distribution

| Preliminary disposition (exclusive, highest established issue first) | Tools |
| --- | ---: |
| Confirmed public primary-job startup BLOCKER | 2 |
| Source-confirmed output CORE GAP | 2 |
| Confirmed placeholder or disclosure UX GAP, no stronger issue established here | 14 |
| Promising bounded interaction sample, no major feature need established | 3 |
| Completion adequacy remains OPEN | 67 |
| Total | 88 |

Separately, **product-quality confidence: HIGH 0 / MEDIUM 24 / LOW 64**. Implementation confidence uses the same counts for this baseline but asks a different question (reliability of behavior versus adequacy of the whole job). The 24 comprise 19 tools with executed behavior suites and the five directly inspectable informational pages. A MEDIUM tool can still have F05; LOW can mean untested rather than broken. These counts are evidence distributions, not failure rates or quality ratings.

### Executed and rendered evidence

| Evidence | Result | What it does not prove |
| --- | --- | --- |
| `node scripts/check-tool-spec-contract.mjs` | Passed, 88 complete contracts | Product adequacy or independent expected behavior |
| `node scripts/check-tool-spec-coverage.mjs` | Passed, 88 specs/docs | Freshness or absence of contradictions |
| `node scripts/check-tool-quality-contract.mjs` | Passed, 88 PASS | Complete rendered startup or task completion |
| `node scripts/run-tool-behavior-tests.mjs` | 19 tool suites passed | All tests in the repository, browser/device behavior, or every output path |
| `node scripts/check-adsense-review-surface.mjs` | Passed, 2 staged / 88 public | Absence of all placeholder variants; browser examples demonstrate false negatives |
| Public root navigation/DOM inspection | 88 entries inspected | Full language families, every control, successful asynchronous dataset completion |
| Desktop visual samples | LineBreak Doctor and the AI Interaction Atlas blocker inspected as screenshots at the available desktop viewport (about 1348–1363px wide) | All-tool visual review or mobile layouts |
| 375px and 320px rendered evaluation | **Not completed**: available browser interface did not expose viewport resizing | CSS/source review and historical mobile claims are not substitutes |
| Download-file verification | Incomplete: download-event wait timed out; a later CSV click hit a browser transport timeout | Neither successful exported bytes nor a product-side download failure can be concluded |

The browser transport later timed out even on tab listing. It was not bypassed or treated as a NicheWorks defect. Desktop samples, public DOM observations already collected, and source/test evidence remain valid at their stated scope. No screenshots were cropped or relabelled as mobile tests.

Detailed manual scenarios:

- **LineBreak Doctor:** empty Format gives “Please enter text to format.” Input `  Hello 👋\n\n\n世界  \nSecond line` produced five platform results. X clipboard text was `Hello 👋\n世界\nSecond line`; switching to plain-text policy and copying Instagram yielded `Hello 👋\n\n世界\nSecond line`. Japanese language switching retained the input/generated results. This is actual clipboard verification, not just a “copied” label. Actual social-platform posting was not tested.
- **CSV Tidy:** accounting sample loaded 3 data rows and 5 columns (the loaded-row display included the header). Renaming the first column to `date` and excluding `税額` yielded a 4-column output preview preserving the three rows; the summary named the excluded column and showed BOM/delimiter/newline choices. Actual downloaded-file reopening remains unverified because of the browser automation issue.
- **ManualFinder:** `Z8` returned Nikon Z8 with direct official manual `https://onlinemanual.nikonimglib.com/z8/ja/`, support reference, and a displayed checked date. `zzzz-nw-audit-no-model` produced a clear zero-result message directing the user to adjust query/category. This verifies search/results, not successful final navigation or all 1,582 source records' freshness.
- **Mini Game Utility:** adding name `Team, "A"` and score `12` retained that name in history with a locale-formatted timestamp containing a comma. Source export interpolates each stored field without escaping. This establishes the output defect; the failed download-event observation is not used as a second defect.
- **AI Interaction Atlas / Outsource Spec Generator:** the first rendered document contained only status prose instead of the tool. Atlas was revisited and visually confirmed as a nearly blank page with that sentence. The corresponding source paths explain the same failure in both tools.

## 8. Recurring Quality Gaps

**A — Specification quality.** Input/output rules often refer back to implementation, giving no independent oracle for a change. Generic error sections even describe reset behavior for informational pages that have no such workflow. Treat these as documentation problems, not evidence of actual controls. Resolve F06 by documenting relevant representative cases, boundary/failure expectations and completion; do not mechanically expand every spec.

**B — Functional/implementation quality.** Full-page boot can fail despite component/contract checks (F01/F02). The two status bridges use broad selectors that include a root they just annotated. Shared code and late-loaded patches make the actual script chain important; a filename such as `app.js` alone does not identify all runtime behavior.

**C — Product completeness.** A generated blob/string is not completion. CSV must reopen correctly, a metadata image must refer to the inspected page, a PDF extraction must preserve the table's meaning, and a directory must hand off to the appropriate official destination. Only the first two are established defects here (F03/F04); the latter examples are required evaluation criteria, not untested allegations.

**D — Interaction/UX quality.** F05 is observed in Color Replace, Contract Cleaner, FileType Sniffer, Light Check, Kanji Modernizer, Motion Atlas, Pattern Dictionary, Pattern Atlas, Tiny Audio Meter, UI Atlas, WiFi Meter, WebP/AVIF Converter and Vibe Lexicon. Public DOM labels include `Ad space (top)`, `広告枠（自動）`, `Ad slot (preparing)` and empty labelled future-ad regions. The checker only catches some placeholder strings/structures; a passing result missed these variants. Cosmetic restyling is not the remedy for job-level confusion.

**E — Real-world robustness.** Large CSV/log/PDF/image workloads, permission denial/reacquisition, unknown dictionary entries, false positives/negatives, API partial failure, storage failure, repeated execution and 320px interaction have no suite-wide current evidence. These are scoped test gaps, not blanket requirements for every tool. Use the per-tool probes below. Do not impose large-table compression on PC-oriented tools.

No significant POLISH item is recommended in this wave. Minor spacing/visual preferences would not change the next-phase priorities.

## 9. Cases Where Existing Specifications Appear Product-Inadequate

| Case | Why matching the specification is insufficient | Classification / minimal capability decision |
| --- | --- | --- |
| Mini Game Utility | The spec explicitly allows raw CSV emission. Even a normal locale timestamp can introduce extra fields; a scorekeeper cannot reliably reuse the export. | F03 CORE GAP; correct escaping is REQUIRED, not a spreadsheet feature. |
| MetadataSnap | “Relative metadata URLs are not resolved” describes current behavior but does not make a wrong-source image preview useful. The user needs raw metadata plus an accurate or explicitly unavailable preview. | F04 CORE GAP; source-aware resolution/error disclosure is REQUIRED for the existing preview. |
| Logistics Compliance Kit JP | Inputs are “implemented shipper/logistics condition fields”; levels/signals lack an independent field/threshold mapping in the definition. It cannot be verified without treating the runtime as the oracle. | F06 CORE GAP in specification; define the existing heuristic contract and representative outcomes before altering it. No legal-rule validation is claimed here. |
| Pattern Dictionary | SPEC still asserts 20 prototype entries, DEV visuals, noindex details and disabled live affiliate links; current `data/patterns.json` has 100 records and README/publication materials describe later waves. | F06 CORE GAP in current definition; reconcile publication/data authority. Do not add another 80 entries to satisfy a stale roadmap. |
| AI Interaction Atlas / Outsource Spec Generator | Specs spend considerable detail on paid boundaries and promise usable free workflows, but the entire free interface disappears at startup. | F01/F02 BLOCKER; top-level availability is a prerequisite to all paid-boundary acceptance. |
| Generated briefs/checklists generally | “Generate draft” does not establish whether the intended next person can act on it. This is an evaluation risk, not a finding that every generator is bad. | Require preservation of supplied facts, explicit missing decisions and reusable output. Add no speculative AI personalization. |
| Earth Map Suite | A technically correct synthetic preview/metadata-reachability contract may not meet the job implied by a map/weather-facing presentation. Repository evidence does not yet establish a practical user completion story. | Unresolved product definition; validate the intended preview audience before proposing real-data expansion. |

No external competitor research was necessary to establish the concrete defects or the baseline method. Repository evidence sufficed for this wave. If the Earth Map job or another pilot's baseline remains ambiguous, inspect 3–5 current comparable tools only for recurring task-critical capabilities, separating them from differentiation; do not import their feature lists/designs.

## 10. Cases Where Feature Expansion Appears Unnecessary

- **LineBreak Doctor:** paste, policy selection, inspect and copy already form a focused workflow. Empty-input feedback and actual clipboard output worked in the bounded sample. Validate downstream paste/narrow layouts; accounts, scheduling, automatic posting and more platforms are not needed to establish strong quality.
- **WebP/AVIF Converter:** a one-image decode/preview/download job is coherent. Validate codecs, corrupt input, alpha handling and export. A batch editor or history is not intrinsically required.
- **FileType Sniffer / Redirect Unwrapper:** deliberately inspect bytes/strings without executing a file or navigating to a destination. Clear unknowns and copyable/readable evidence are enough; antivirus, crawling and security certification would expand scope.
- **Laundry Code Decode / WiFi Meter:** accurate bounded reference/estimates and honest unsupported states are preferable to adding image AI or a real network-speed service. Their current feature boundaries are defensible, pending actual task checks.
- **The five repository-asset landing pages:** useful reading and working adoption links are the job. Adding dashboards, editable workspaces or a second in-page execution engine is unnecessary.
- **Mini Game Utility:** a correct score export repairs completion. The defect does not justify multiplayer, accounts, leaderboards, cloud sync or a tournament system.

These are scope conclusions, not “finished” certifications. Remaining correctness, clarity and responsive checks can be substantial without increasing feature count.

## 11. Recommended Pilot Tools

| Pilot | Representative product type / why chosen | Uncertainty it exposes | Reusable lesson |
| --- | --- | --- | --- |
| **Mini Game Utility** (`mini-game-utility`) | Small stateful utility with a concrete output defect; chosen for high learning value rather than merely easy implementation | Is a durable score record usable after export, across locale/Unicode/boundaries? What are safe reset/clear semantics? | Define output reuse, storage/reset distinctions and an independent round-trip oracle. A tiny product can need correctness work without feature growth. |
| **CSV Tidy** (`csv-tidy`) | PC-oriented data preparation with parsing, column operations, preview and export | Do preview and saved data agree for realistic CSV/encoding/size cases? Are exclusions and duplicate headers obvious? Can narrow-screen users reach essential controls without flattening the table? | Establish preservation, explicit loss, round-trip export, performance envelope and wide-table/narrow-fallback standards. |
| **ManualFinder** (`manual-finder`) | Search/information product whose completion occurs outside the tool | Does a real model query reach the correct official page? How are ambiguity, coverage, stale links and maker-index fallback communicated? | Evaluate search relevance and successful destination handoff, provenance/freshness and no-result recovery instead of adding catalog features. |

LineBreak Doctor is a useful **control sample** of a focused existing workflow, not a fourth implementation pilot. F01/F02 should enter a separate urgent blocker-repair gate in the next authorized wave; selecting the pilots does not excuse leaving startup failures out of priority planning. No repairs or pilot changes are performed here.

## 12. Proposed Method for Pilot Improvement

1. **Freeze evidence and scope.** Record the next wave's branch/HEAD and worktree, identify deployment provenance, resolve applicable authority conflicts. Write one short job/target/completion statement for the pilot. Identify what the user must take away, not just which function runs.
2. **Create a minimal independent oracle.** State supported inputs, exact outputs, meaningful failures, limits and non-goals. Use a few representative fixtures rather than restating code. Retain current useful capabilities; do not raise confidence with invented requirements.
3. **Exercise the rendered job.** Normal, empty, malformed, unusual, boundary and repeated inputs as applicable; inspect output use after copying/downloading/opening. Distinguish source reasoning, automated tests, rendered DOM, visual observation, and actual downstream reuse. Test relevant language modes and destructive actions.
4. **Inspect desktop, 375px and 320px.** For CSV Tidy keep wide-table semantics and test internal scrolling, focus, order controls, summary visibility and download reachability. For search/score utilities test first-use clarity, targets, feedback and repeated use. Record unsupported environments honestly.
5. **Classify each demonstrated gap.** BLOCKER = job cannot reliably finish; CORE GAP = existing algorithm works but necessary completion capability is absent/inadequate; UX GAP = completion is possible with material friction/confusion; POLISH = minor refinement. Record affected scenario, expected/actual result and evidence.
6. **Choose the smallest justified change.** REQUIRED or JUSTIFIED only. Separate fixes from new capabilities. Resolve whether a capability already exists before adding it. Seek current external comparison only when the repository cannot settle baseline adequacy.
7. **Implement only in a later authorized wave, then verify.** Add tests that catch the demonstrated defect or independent output invariant, run applicable repository gates, repeat affected browser scenarios and relevant widths. Check untouched input, state preservation, clear recovery, accessibility and privacy appropriate to the job. No mass redesign.
8. **Accept by completion evidence.** Close the demonstrated gaps, document remaining limits, compare the same scenarios before/after, and stop feature growth when the focused job works well. Expand to the next cohort only after the method proves useful.

| Candidate change/capability | Classification | Decision and reason |
| --- | --- | --- |
| Repair root-targeted status setters in the two blocked tools | REQUIRED | Restore existing free primary workflow; no new product surface |
| Valid CSV escaping in existing Mini Game export | REQUIRED | Necessary to preserve records in its advertised output |
| Correct source-relative metadata preview or explicit unsupported state | REQUIRED | Avoid wrong-source/missing images presented as inspected metadata |
| Remove prohibited placeholder ad containers/labels | REQUIRED | Current cross-tool requirement; not feature expansion |
| More independent, concrete pilot input/output/failure contracts | REQUIRED | Necessary to verify completion and avoid circular acceptance |
| Narrow-screen access to existing essential controls | REQUIRED | Common responsive requirement; exact layout depends on product type |
| CSV conflict/exclusion notice where a real silent-loss case is established | REQUIRED if absent for the demonstrated case | Preview/sample already has exclusion warnings; do not duplicate working UI |
| Per-result official-link type/provenance in ManualFinder | REQUIRED for ambiguous destinations | Already partly present; improve only proven ambiguity |
| Remembering a frequently repeated safe CSV setting | JUSTIFIED only after repeated-use evidence | No implementation recommendation yet; current evidence does not establish repeated friction |
| Extra export formats beyond a usable current format | OPTIONAL | Excluded from the program unless later requested |
| Extra dashboards, animations, generalized settings, history | REJECT absent a specific completion need | Complexity/feature count is not a quality metric |
| New AI services, accounts, cloud storage or backend processing | REJECT | Outside this wave and the focused utility architecture |

Specific pilot acceptance probes:

- **Mini Game Utility:** ordinary and comma/quote/newline/Unicode names; locale-independent column preservation; independent CSV parse returns the exact three fields for every row; empty export; repeated add; 50/51 record boundary; reload persistence; timer start/pause/reset; distinguish timer reset from clearing scores. No precision-stopwatch promise. Confirm deletion feedback before proposing an extra confirmation dialog.
- **CSV Tidy:** UTF-8 with/without BOM and supported Shift_JIS; comma/tab/semicolon; quoted delimiter and multiline cells; empty/duplicate headers and values; reorder/rename/exclude; all columns excluded; changed parsing settings; file reselection; realistic large/wide fixture chosen from the supported job; preview and full export equality under an independent parser. Define a measured supported envelope rather than an arbitrary benchmark. The auto-detector counts raw delimiters, so quoted-content detection deserves a concrete fixture; no defect verdict here without that exercise.
- **ManualFinder:** a direct model (observed Z8), similar model variants, partial model, maker-only fallback, supported/unsupported category, no result, pagination, Japanese/English state and exact official destination. Stratify record samples by maker/category/link type rather than claiming all links work after one lookup. Distinguish transient block/timeout from a proven broken official link; no affiliate clicks or purchases are needed.

## 13. Questions / Unresolved Evidence

1. **Deployment identity:** which public deployment corresponds to the recorded HEAD? Source-supported boot defects are actionable, but the audit does not claim every live response is that exact build.
2. **Responsive/device evidence:** 375px/320px rendered checks remain outstanding. The current browser interface did not expose resizing; desktop DOM/source or older checked QA boxes cannot replace fresh viewport tests. Camera, microphone, actual network changes and device codecs were not exercised.
3. **Output downloads:** browser download-event/transport failures prevented independently reopening CSV exports in this session. This limits CSV Tidy's completion evidence, not its source-based export availability. PDF/image file reuse also remains untested.
4. **Authoritative specification family:** resolve `SPEC.md` vs `docs/tools` and specific current publication contracts before edits, particularly Pattern Dictionary. Resolve old/new ad and state wording without erasing explicit later exceptions.
5. **Network/privacy exceptions:** determine the authoritative allowance and exact visible disclosure for URL proxies, weather/location and Earth metadata. Inspect actual network payloads and hosting analytics/ads configuration in an appropriate next audit; no new services are proposed.
6. **Large-input and persistence envelopes:** many tools lack independently verifiable limits, progress/cancel behavior and storage-failure contracts. Select realistic fixtures per job rather than arbitrary global quotas.
7. **Search/data quality:** official destination freshness, dictionary unknowns, confusable terms and source provenance require stratified checks. One current result is not a suite-wide quality guarantee.
8. **Heuristic references:** command/SQL/contract/logistics/ingredient tools require explicit uncertainty and false-positive/negative cases. This report does not validate current law, medical safety, financial advice, or external technical standards; it evaluates product boundaries and observable behavior only.
9. **Free/paid availability:** test free boot and authorized entitlement states through normal surfaces later. This audit did not purchase, activate, forge entitlements or exercise locked paid capabilities. Commercial migrations remain separate from product-quality scope.
10. **Complete history and languages:** repository documents and historical audit files were inspected, not every past commit. Root pages were covered, not every language/help/detail route. Future evidence must state its actual scope just as this report does.

These questions do not require a local app runtime before the next phase. GitHub source and a browser with the necessary viewport/download capabilities can supply the missing evidence. Do not begin pilot implementation as part of this baseline report.

## Appendix A. Per-tool job and evidence cards

Each card supplies a deliberately focused completion criterion, not a feature wish list. Failure scenarios are **probes to complete**, unless explicit results are listed in section 7. Generic documentation claims of guards/fallbacks are not recast as observed behavior. For most tools, precise failure outcomes remain unresolved at this baseline; that limitation is part of the MEDIUM/LOW confidence assignment.

Evidence for every card includes its current `SPEC.md`, `docs/tools/<slug>.md`, root HTML and listed runtime entry points, available local Markdown/usage/FAQ material and test/check inventory. Main-script bindings, outputs and guard paths were sampled, not every line formally verified. Inline-script tools must be reviewed through HTML. The public URL is the source of its initial rendered observation. Historic audit findings were considered only as leads.

### A01. Ai Interaction Atlas — `ai-interaction-atlas`

- **Primary job / target:** Provide a searchable reference atlas of AI interaction patterns so builders can compare UI patterns, inspect risks and failure states, and turn a selected pattern into implementation-oriented handoff material. Target situation: Builders choosing an AI interaction pattern.
- **Workflow:** Search/filter → inspect detail → compare → copy a handoff.
- **Completion / usable output:** Identify an appropriate pattern, understand failure states, and reuse its implementation guidance.
- **Required capabilities (existing or to verify):** Search, detail, bounded comparison, accurate copy; currently blocked before input.
- **Failure/robustness:** Boot without entitlement; empty/no-match search; comparison limits; unavailable Pro. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Model execution, generated AI answers, commercial migration.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; BLOCKER. Runtime startup and useful free-mode availability must be acceptance gates.
- **Evidence:** [SPEC](../tools/ai-interaction-atlas/SPEC.md), [docs/error contract](../docs/tools/ai-interaction-atlas.md), [HTML](../tools/ai-interaction-atlas/index.html), [public page](https://nicheworks.app/tools/ai-interaction-atlas/), [pro-bridge.js](../tools/ai-interaction-atlas/pro-bridge.js), [app.js](../tools/ai-interaction-atlas/app.js), [complete-details.js](../tools/ai-interaction-atlas/complete-details.js).

### A02. AI Project Pack — `ai-project-pack`

- **Primary job / target:** Explain and distribute the AI Project Pack repository workflow: a single-repository operating pack that keeps project truth, decisions, unresolved items, next actions, sources, and append-only update logs in one AI-readable place. Target situation: Maintainers setting up a repository workflow.
- **Workflow:** Read fit and scope → follow repository/setup links.
- **Completion / usable output:** Reach the actual pack and understand how to adopt it without mistaking the landing page for an executing tool.
- **Required capabilities (existing or to verify):** Clear scope, working repository handoff, installation/use explanation.
- **Failure/robustness:** Broken destination; first-use prerequisites; narrow reading layout. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Cloud workspace, automatic project execution.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. Verify destination and setup against linked repository before calling adoption complete.
- **Evidence:** [SPEC](../tools/ai-project-pack/SPEC.md), [docs/error contract](../docs/tools/ai-project-pack.md), [HTML](../tools/ai-project-pack/index.html), [public page](https://nicheworks.app/tools/ai-project-pack/).

### A03. Analytics Privacy Kit — `analytics-privacy-kit`

- **Primary job / target:** Generate draft privacy-policy add-on text and analytics/advertising notices for small sites using services such as GA4, Cloudflare Web Analytics, Plausible, Google AdSense, Google Tag Manager, Microsoft Clarity, and Meta Pixel. Target situation: Small-site owners preparing notices.
- **Workflow:** Choose services and context → generate → review/copy text.
- **Completion / usable output:** Obtain an editable notice matching selected services, with unresolved choices visible.
- **Required capabilities (existing or to verify):** Selection-to-output consistency, editable/copyable draft, explicit review limits.
- **Failure/robustness:** No service; mixed services; long organization/contact strings; repeat/reset. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Legal certification or consent-management platform.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Service combinations and exact expected wording need independent examples.
- **Evidence:** [SPEC](../tools/analytics-privacy-kit/SPEC.md), [docs/error contract](../docs/tools/analytics-privacy-kit.md), [HTML](../tools/analytics-privacy-kit/index.html), [public page](https://nicheworks.app/tools/analytics-privacy-kit/), [app.js](../tools/analytics-privacy-kit/app.js).

### A04. API Key Token Redactor — `api-key-token-redactor`

- **Primary job / target:** Detect likely secrets in pasted logs, configuration text, `.env`, JSON, curl commands, and similar text, then produce a locally redacted copy that is safer to review or share. Target situation: Developers sharing logs or configuration.
- **Workflow:** Paste → scan → review detected spans → redact/copy.
- **Completion / usable output:** Share a usable redacted copy while recognizing that undetected secrets may remain.
- **Required capabilities (existing or to verify):** Preserve non-secret context, visible detections, correct copy, explicit detection limits.
- **Failure/robustness:** Empty text; false positives; unusual key formats; huge logs; repeated redaction. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Secret verification, remote scanning, guaranteed secret absence.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Representative positive/negative detection fixtures and output preservation boundaries need an explicit oracle.
- **Evidence:** [SPEC](../tools/api-key-token-redactor/SPEC.md), [docs/error contract](../docs/tools/api-key-token-redactor.md), [HTML](../tools/api-key-token-redactor/index.html), [public page](https://nicheworks.app/tools/api-key-token-redactor/), [pro-bridge.js](../tools/api-key-token-redactor/pro-bridge.js), [app.js](../tools/api-key-token-redactor/app.js), [README](../tools/api-key-token-redactor/tests/README.md).

### A05. ATS Paste Doctor — `ats-paste-doctor`

- **Primary job / target:** Clean and inspect resume, cover-letter, and application text before it is pasted into an ATS or job form, while surfacing formatting and character issues that may affect readability. Target situation: Applicants pasting a resume into a job form.
- **Workflow:** Paste → inspect/clean → compare/reuse text.
- **Completion / usable output:** Paste readable text with intended names and content preserved and risky transformations visible.
- **Required capabilities (existing or to verify):** Issue locations, reviewable cleaned output, copy and clear limitation wording.
- **Failure/robustness:** Empty input; bullets; Unicode names; long resume; repeat cleaning. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** ATS ranking guarantees or job-application automation.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Define which transformations may change meaning and how the user reviews them.
- **Evidence:** [SPEC](../tools/ats-paste-doctor/SPEC.md), [docs/error contract](../docs/tools/ats-paste-doctor.md), [HTML](../tools/ats-paste-doctor/index.html), [public page](https://nicheworks.app/tools/ats-paste-doctor/), [app.js](../tools/ats-paste-doctor/app.js), [pro-bridge.js](../tools/ats-paste-doctor/pro-bridge.js), [README](../tools/ats-paste-doctor/README.md).

### A06. Codex Product Shipping Playbooks — `codex-product-shipping-playbooks`

- **Primary job / target:** Explain a repository-first set of reusable playbooks for taking Codex-assisted software changes from repository intake through specification delta, implementation planning, acceptance, shipping checks, release writing, diff review, and retrospective. Target situation: Developers adopting a shipping workflow.
- **Workflow:** Read playbook scope → open repository → choose a playbook.
- **Completion / usable output:** Reach a usable playbook and know its prerequisites and human review points.
- **Required capabilities (existing or to verify):** Readable guide, specific repository handoff, accurate execution boundaries.
- **Failure/robustness:** Stale links; missing setup requirements; narrow reading layout. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Hosted project manager or automatic deployment.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. Destination availability and adoption were not exercised end to end.
- **Evidence:** [SPEC](../tools/codex-product-shipping-playbooks/SPEC.md), [docs/error contract](../docs/tools/codex-product-shipping-playbooks.md), [HTML](../tools/codex-product-shipping-playbooks/index.html), [public page](https://nicheworks.app/tools/codex-product-shipping-playbooks/).

### A07. Codex Usage Forecaster — `codex-usage-forecaster`

- **Primary job / target:** Record user-entered Codex usage percentages and estimate consumption rate, depletion timing, and reset-related context for five-hour and weekly usage windows. Target situation: Codex users planning work around reported usage.
- **Workflow:** Enter usage samples → inspect rate/reset estimate.
- **Completion / usable output:** Understand an estimate with its sampling assumptions and uncertainty, without reading it as authoritative quota state.
- **Required capabilities (existing or to verify):** Valid time/percentage samples, transparent estimate, reset context.
- **Failure/robustness:** One sample; zero/negative time delta; out-of-order samples; reset; extreme percentages. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Fetching account quotas or billing predictions.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Define sufficient samples, reset detection, and impossible inputs independently of runtime.
- **Evidence:** [SPEC](../tools/codex-usage-forecaster/SPEC.md), [docs/error contract](../docs/tools/codex-usage-forecaster.md), [HTML](../tools/codex-usage-forecaster/index.html), [public page](https://nicheworks.app/tools/codex-usage-forecaster/), [app-fixed.js](../tools/codex-usage-forecaster/app-fixed.js).

### A08. Codex Work OS — `codex-work-os`

- **Primary job / target:** Explain the codex-work-os repository: a skills-first operating layer for turning messy sales, project-management, executive-support, research, and customer-support inputs into structured draft artifacts for human review. Target situation: Operators seeking repeatable draft workflows.
- **Workflow:** Read role/workflow descriptions → follow repository links.
- **Completion / usable output:** Find and adopt a suitable workflow with required human review understood.
- **Required capabilities (existing or to verify):** Clear audience, correct repository links, scope and prerequisites.
- **Failure/robustness:** Unavailable links; unfamiliar user; mobile reading. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Accounts, executing workflows inside this landing page.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. External repository adoption remains unverified.
- **Evidence:** [SPEC](../tools/codex-work-os/SPEC.md), [docs/error contract](../docs/tools/codex-work-os.md), [HTML](../tools/codex-work-os/index.html), [public page](https://nicheworks.app/tools/codex-work-os/).

### A09. Cold Email Requirement Checker — `cold-email-requirement-checker`

- **Primary job / target:** Review a cold-outreach or sales-email draft for structural completeness and risky wording before the user sends it, while keeping legal/compliance judgment outside the tool. Target situation: People reviewing an outreach draft before sending.
- **Workflow:** Paste context/draft → check → review findings.
- **Completion / usable output:** Find actionable omissions/risky phrases with evidence while retaining editorial judgment.
- **Required capabilities (existing or to verify):** Located findings, understandable rules, copyable/reviewable checklist.
- **Failure/robustness:** Blank draft; short/long mail; negation; repeated checks. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Sending email, legal assurance, deliverability scoring.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Rule coverage and false-positive behavior need representative cases.
- **Evidence:** [SPEC](../tools/cold-email-requirement-checker/SPEC.md), [docs/error contract](../docs/tools/cold-email-requirement-checker.md), [HTML](../tools/cold-email-requirement-checker/index.html), [public page](https://nicheworks.app/tools/cold-email-requirement-checker/), [app.js](../tools/cold-email-requirement-checker/app.js), [pro-addon.js](../tools/cold-email-requirement-checker/pro-addon.js).

### A10. Color Replace — `color-replace`

- **Primary job / target:** Replace a selected color in a local image with another color using an adjustable tolerance, then save the processed result as PNG without uploading the image through the tool workflow. Target situation: People changing a color in a local image.
- **Workflow:** Choose image → pick source/target/tolerance → preview → save PNG.
- **Completion / usable output:** Download the intended recoloring without changing unrelated areas or the original.
- **Required capabilities (existing or to verify):** Decode, color selection, tolerance including zero, preview, PNG export.
- **Failure/robustness:** Invalid file; transparent pixels; zero/max tolerance; large image; reselect. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Full image editor, automatic object segmentation.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; UX GAP. Cross-browser pixel/export fidelity and a stated memory envelope remain unproven.
- **Evidence:** [SPEC](../tools/color-replace/SPEC.md), [docs/error contract](../docs/tools/color-replace.md), [HTML](../tools/color-replace/index.html), [public page](https://nicheworks.app/tools/color-replace/), [app.js](../tools/color-replace/app.js), [file-reselect-fix.js](../tools/color-replace/file-reselect-fix.js), [test example](../tools/color-replace/tests/behavior.test.mjs).

### A11. Command Safety Checker — `command-safety-checker`

- **Primary job / target:** Help users inspect AI-generated shell or PowerShell commands before execution by detecting destructive, remote-execution, privilege, disk, and possible secret-exposure patterns in the browser. Target situation: Developers reviewing a command before executing elsewhere.
- **Workflow:** Paste/select shell → analyze → inspect warnings.
- **Completion / usable output:** See dangerous command spans and limitations clearly enough to decide on manual review.
- **Required capabilities (existing or to verify):** Shell-aware rules, evidence spans, no-execution guarantee, reviewable output.
- **Failure/robustness:** Quoted strings; pipelines; multiline; obfuscation; false negatives; empty input. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Executing commands or certifying safety.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. No warning must not imply safe; rule examples need independent expected verdicts.
- **Evidence:** [SPEC](../tools/command-safety-checker/SPEC.md), [docs/error contract](../docs/tools/command-safety-checker.md), [HTML](../tools/command-safety-checker/index.html), [public page](https://nicheworks.app/tools/command-safety-checker/), [app-core.js](../tools/command-safety-checker/app-core.js), [pro-bridge.js](../tools/command-safety-checker/pro-bridge.js), [pro-authority-guard.js](../tools/command-safety-checker/pro-authority-guard.js).

### A12. Construction Tools Atlas — `construction-tools-atlas`

- **Primary job / target:** Provide a browser-local bilingual construction reference that can identify tools, materials, tasks and site terminology from exact names, aliases, slang, purpose, target material, work situation and visual cues. The v2.3 redesign specifically serves users who may recognize an item or know what it does without knowing its formal name. Target situation: Workers/learners who recognize a tool or task but not its name.
- **Workflow:** Describe appearance/use → filter candidates → inspect reference.
- **Completion / usable output:** Identify plausible tools/materials and distinguish close alternatives using source-backed detail.
- **Required capabilities (existing or to verify):** Alias/task search, visual/detail evidence, uncertainty, official-reference handoff.
- **Failure/robustness:** Vague query; synonyms; no match; wrong material; long results; keyboard/narrow access. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Replacing manuals, safety standards, or professional judgment.
- **Confidence / uncertainty:** SC HIGH / IC LOW / PC LOW; OPEN. Search intent coverage and media/detail parity still need user-task validation.
- **Evidence:** [SPEC](../tools/construction-tools-atlas/SPEC.md), [docs/error contract](../docs/tools/construction-tools-atlas.md), [HTML](../tools/construction-tools-atlas/index.html), [public page](https://nicheworks.app/tools/construction-tools-atlas/), [semantic-search-core.js](../tools/construction-tools-atlas/semantic-search-core.js), [app.runtime.js](../tools/construction-tools-atlas/app.runtime.js).

### A13. Contract Cleaner — `contract-cleaner`

- **Primary job / target:** Mechanically scan pasted contract or terms text for implemented attention keywords and categories, then organize review points and questions without making legal conclusions. Target situation: People preparing a contract for human review.
- **Workflow:** Paste contract → scan attention terms → inspect questions.
- **Completion / usable output:** Locate relevant clauses and carry concrete questions into review without a legal verdict.
- **Required capabilities (existing or to verify):** Locations/context, categories, readable questions, stated heuristic limits.
- **Failure/robustness:** Empty/long contract; negation; repeated keywords; false positives. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Contract approval, legal advice, automatic negotiation.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; UX GAP. Keywords alone do not define useful clause coverage or false-negative expectations.
- **Evidence:** [SPEC](../tools/contract-cleaner/SPEC.md), [docs/error contract](../docs/tools/contract-cleaner.md), [HTML](../tools/contract-cleaner/index.html), [public page](https://nicheworks.app/tools/contract-cleaner/), [app.js](../tools/contract-cleaner/app.js).

### A14. Contract Risk Highlighter — `contract-risk-highlighter`

- **Primary job / target:** Highlight implemented contract-clause risk patterns in pasted contract text and organize them into a preliminary review result, with optional Pro handoff material for human consultation and follow-up. Target situation: People organizing contract concerns.
- **Workflow:** Paste → highlight rule matches → inspect review/handoff.
- **Completion / usable output:** Understand which text triggered concerns and preserve enough context for a reviewer.
- **Required capabilities (existing or to verify):** Traceable highlights, human-review framing, usable free result.
- **Failure/robustness:** Long document; overlapping matches; no match; repeat input; locked exports. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Legal conclusions or automatic contract rewriting.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Independent examples must cover overlap, negation, and unrecognized risky clauses.
- **Evidence:** [SPEC](../tools/contract-risk-highlighter/SPEC.md), [docs/error contract](../docs/tools/contract-risk-highlighter.md), [HTML](../tools/contract-risk-highlighter/index.html), [public page](https://nicheworks.app/tools/contract-risk-highlighter/), [pro-bridge.js](../tools/contract-risk-highlighter/pro-bridge.js), [app.js](../tools/contract-risk-highlighter/app.js).

### A15. Cosmetic Ingredient Checker Lite — `cosmetic-ingredient-checker-lite`

- **Primary job / target:** Provide a fast bilingual paste-first cosmetic ingredient checker that normalizes an ingredient list, matches exact INCI / Japanese / alias names against the local NicheWorks ingredient data, and summarizes useful reference categories without presenting medical, diagnostic, regulatory, allergy, concentration, or product-safety conclusions. Target situation: Consumers quickly checking a pasted ingredient label.
- **Workflow:** Paste → normalize → inspect known/unknown categories.
- **Completion / usable output:** Recognize matched and unmatched ingredients without interpreting the list as a safety/allergy judgment.
- **Required capabilities (existing or to verify):** Bilingual exact/alias matching, unknowns, original-to-normalized traceability.
- **Failure/robustness:** Mixed separators; duplicate ingredients; unknown names; empty list. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** OCR, medical/allergy advice, concentration inference.
- **Confidence / uncertainty:** SC HIGH / IC LOW / PC LOW; OPEN. Dataset provenance and parser examples are useful; realistic mixed-label/browser checks remain.
- **Evidence:** [SPEC](../tools/cosmetic-ingredient-checker-lite/SPEC.md), [docs/error contract](../docs/tools/cosmetic-ingredient-checker-lite.md), [HTML](../tools/cosmetic-ingredient-checker-lite/index.html), [public page](https://nicheworks.app/tools/cosmetic-ingredient-checker-lite/), [app.js](../tools/cosmetic-ingredient-checker-lite/app.js).

### A16. Cover Letter Lite — `cover-letter-lite`

- **Primary job / target:** Create an editable English cover-letter draft from structured role information using deterministic templates rather than an AI API. Target situation: Applicants needing an English first draft.
- **Workflow:** Enter role/details → select template → generate/edit → copy.
- **Completion / usable output:** Obtain an editable letter with supplied facts preserved and placeholders visible.
- **Required capabilities (existing or to verify):** Required-field feedback, template selection, editing, accurate copy.
- **Failure/robustness:** Blank facts; long names; punctuation; regenerate after editing. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** AI personalization or hiring guarantees.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Specify edit-loss behavior and which facts/placeholders appear in every template.
- **Evidence:** [SPEC](../tools/cover-letter-lite/SPEC.md), [docs/error contract](../docs/tools/cover-letter-lite.md), [HTML](../tools/cover-letter-lite/index.html), [public page](https://nicheworks.app/tools/cover-letter-lite/), [app.js](../tools/cover-letter-lite/app.js).

### A17. CSV Tidy — `csv-tidy`

- **Primary job / target:** Load a CSV locally, reorganize and clean its columns/values, preview the result, and download a new UTF-8 CSV without modifying the source file. Target situation: Office/data users preparing an importable CSV.
- **Workflow:** Load → set encoding/delimiter/header → adjust columns/rules → preview → download.
- **Completion / usable output:** Reopen a valid output with correct row values, column order, headers and encoding, with omissions understood.
- **Required capabilities (existing or to verify):** Robust parsing/serialization, preview and output agreement, explicit exclusions, file download.
- **Failure/robustness:** Quoted delimiters/newlines; invalid quoting; wide/large data; empty/duplicate headers; reselect. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Spreadsheet suite, backend processing, arbitrary encoding conversion.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; SAMPLE. No measured size envelope or full output round-trip acceptance; auto-detection accuracy remains uncertain.
- **Evidence:** [SPEC](../tools/csv-tidy/SPEC.md), [docs/error contract](../docs/tools/csv-tidy.md), [HTML](../tools/csv-tidy/index.html), [public page](https://nicheworks.app/tools/csv-tidy/), [app.js](../tools/csv-tidy/app.js), [complete.js](../tools/csv-tidy/complete.js), [test example](../tools/csv-tidy/tests/behavior.test.mjs).

### A18. Design Request Builder — `design-request-builder`

- **Primary job / target:** Turn structured design-project requirements into a reviewable production brief so clients and creators can clarify deliverables, schedule, budget, references, constraints, revisions, and handoff conditions before work starts. Target situation: Clients and designers agreeing a brief.
- **Workflow:** Fill scope/deliverables/constraints → generate → review/copy.
- **Completion / usable output:** Share a brief that exposes missing decisions and concrete acceptance expectations.
- **Required capabilities (existing or to verify):** Input validation, consistent sections, editable/reusable draft, unresolved items.
- **Failure/robustness:** Missing deadline/budget; contradictory constraints; long references; repeat. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Contract generation or project-management service.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Completion examples must distinguish actionable acceptance from generic template text.
- **Evidence:** [SPEC](../tools/design-request-builder/SPEC.md), [docs/error contract](../docs/tools/design-request-builder.md), [HTML](../tools/design-request-builder/index.html), [public page](https://nicheworks.app/tools/design-request-builder/), [app.js](../tools/design-request-builder/app.js).

### A19. Laundry Drying Checker — `dry-meter`

- **Primary job / target:** Estimate how easy it may be to dry ordinary laundry, thick items, or bedding from current weather or manually entered temperature, humidity, and wind conditions. Target situation: People deciding whether/how to dry laundry.
- **Workflow:** Choose weather/manual conditions → select item → inspect estimate.
- **Completion / usable output:** Understand a bounded drying estimate and which conditions it assumes.
- **Required capabilities (existing or to verify):** Input units/ranges, weather failure fallback, estimate explanation.
- **Failure/robustness:** Unavailable location/API; extreme humidity/wind; invalid numbers; stale weather. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Calibrated drying-time prediction or safety guidance.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Weather dependency and numeric boundary behavior need explicit fixtures.
- **Evidence:** [SPEC](../tools/dry-meter/SPEC.md), [docs/error contract](../docs/tools/dry-meter.md), [HTML](../tools/dry-meter/index.html), [public page](https://nicheworks.app/tools/dry-meter/), [app.js](../tools/dry-meter/app.js).

### A20. Earth Map Suite — `earth-map-suite`

- **Primary job / target:** Organize Earth/map-view conditions and provide Storm, Compare, and Card preview workflows while keeping synthetic visualization separate from the real metadata-reachability checks currently available through the Earth Map Suite precipitation endpoint. Target situation: Users exploring map/precipitation conditions and preview cards.
- **Workflow:** Set area/time/mode → view synthetic preview/metadata availability.
- **Completion / usable output:** Understand exactly which output is synthetic and which only confirms remote metadata availability.
- **Required capabilities (existing or to verify):** Unambiguous provenance, valid bounds/time, clear service errors.
- **Failure/robustness:** No data; reversed bbox; unsupported interval; service failure; synthetic/real confusion. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Claiming real observations from synthetic preview.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; UX GAP. Resolve whether the current preview job itself is useful; do not silently redefine it as a real weather product.
- **Evidence:** [SPEC](../tools/earth-map-suite/SPEC.md), [docs/error contract](../docs/tools/earth-map-suite.md), [HTML](../tools/earth-map-suite/index.html), [public page](https://nicheworks.app/tools/earth-map-suite/), [app.js](../tools/earth-map-suite/app.js), [README](../tools/earth-map-suite/README.md).

### A21. EXIF Cleaner Mini — `exif-cleaner-mini`

- **Primary job / target:** Regenerate supported photos in browser canvas so most EXIF metadata is not carried into the downloaded copy, reducing accidental sharing of GPS, timestamp, device, and related metadata. Target situation: People removing metadata before sharing a photo.
- **Workflow:** Choose image(s) → canvas regeneration → inspect/download.
- **Completion / usable output:** Share a readable regenerated file with stated metadata-removal and format limits understood.
- **Required capabilities (existing or to verify):** Supported decode, orientation/quality review, export, explicit limitations.
- **Failure/robustness:** Unsupported/corrupt image; rotation; transparency; many/large files. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Forensic sanitization guarantees or full media editor.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; OPEN. Verify actual output metadata and visual fidelity, not just completion labels.
- **Evidence:** [SPEC](../tools/exif-cleaner-mini/SPEC.md), [docs/error contract](../docs/tools/exif-cleaner-mini.md), [HTML](../tools/exif-cleaner-mini/index.html), [public page](https://nicheworks.app/tools/exif-cleaner-mini/), [app.js](../tools/exif-cleaner-mini/app.js), [test example](../tools/exif-cleaner-mini/tests/behavior.test.mjs).

### A22. FileType Sniffer — `filetype-sniffer`

- **Primary job / target:** Inspect a file's leading signature bytes in the browser to estimate its actual file format and help users notice extension/signature mismatches without opening or executing the file. Target situation: Users checking an unfamiliar file without executing it.
- **Workflow:** Select file → inspect signature/extension comparison.
- **Completion / usable output:** Identify a supported probable format or a clear unknown/mismatch result.
- **Required capabilities (existing or to verify):** Bounded byte inspection, confidence/unknown explanation, readable signature.
- **Failure/robustness:** Empty/short file; ambiguous signature; misleading extension; unknown format. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Antivirus, content validation, automatic opening.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; UX GAP. Signature tests do not establish all formats; output must avoid certainty beyond available bytes.
- **Evidence:** [SPEC](../tools/filetype-sniffer/SPEC.md), [docs/error contract](../docs/tools/filetype-sniffer.md), [HTML](../tools/filetype-sniffer/index.html), [public page](https://nicheworks.app/tools/filetype-sniffer/), [app.js](../tools/filetype-sniffer/app.js), [test example](../tools/filetype-sniffer/tests/behavior.test.mjs).

### A23. Form Tool Selector — `form-tool-selector`

- **Primary job / target:** Translate basic form requirements into the types of form builders/tools a user should compare, plus a decision memo describing the capabilities and risks to verify before choosing an actual service. Target situation: Site owners narrowing form-builder requirements.
- **Workflow:** Select needs/priorities → generate category and decision memo.
- **Completion / usable output:** Know which capabilities and tradeoffs to verify before choosing a real provider.
- **Required capabilities (existing or to verify):** Consistent requirement mapping, explained tradeoffs, reusable memo.
- **Failure/robustness:** Conflicting needs; no selections; all selections; repeated use. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Vendor ranking, live pricing, automatic form creation.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Need example decisions that show meaningful tradeoffs instead of generic advice.
- **Evidence:** [SPEC](../tools/form-tool-selector/SPEC.md), [docs/error contract](../docs/tools/form-tool-selector.md), [HTML](../tools/form-tool-selector/index.html), [public page](https://nicheworks.app/tools/form-tool-selector/), [app.js](../tools/form-tool-selector/app.js).

### A24. Growth Log Template Generator — `growth-log-template-generator`

- **Primary job / target:** Turn KPI notes, hypotheses, learnings, and freeform notes into a structured growth-log draft for internal or public reporting, with privacy-oriented controls before publishing. Target situation: Small teams drafting a growth update.
- **Workflow:** Enter KPIs/hypotheses/learning → apply privacy controls → copy draft.
- **Completion / usable output:** Reuse a coherent update that preserves facts and deliberately excludes sensitive notes.
- **Required capabilities (existing or to verify):** Field preservation, section generation, privacy controls, copy.
- **Failure/robustness:** Missing KPIs; multiline notes; sensitive free text; output regeneration. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Analytics dashboard or automatic data collection.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Privacy controls require explicit before/after examples and no accidental note leakage.
- **Evidence:** [SPEC](../tools/growth-log-template-generator/SPEC.md), [docs/error contract](../docs/tools/growth-log-template-generator.md), [HTML](../tools/growth-log-template-generator/index.html), [public page](https://nicheworks.app/tools/growth-log-template-generator/).

### A25. Habit Plan Generator — `habit-plan-generator`

- **Primary job / target:** Turn a habit goal, available time, preferred days, obstacles, and motivation style into a lightweight weekly habit plan with a minimum action, trigger, recovery plan, schedule, and tracking checklist. Target situation: Individuals making a small weekly habit plan.
- **Workflow:** Enter goal/time/days/obstacles → generate plan.
- **Completion / usable output:** Leave with an achievable schedule, minimum action and recovery plan that can be reused.
- **Required capabilities (existing or to verify):** Time/day consistency, readable checklist, reusable output.
- **Failure/robustness:** No days; zero time; long goal; contradictory constraints. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Coaching platform, reminders, accounts, behavioral guarantees.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Feasibility and contradictory-input behavior need examples.
- **Evidence:** [SPEC](../tools/habit-plan-generator/SPEC.md), [docs/error contract](../docs/tools/habit-plan-generator.md), [HTML](../tools/habit-plan-generator/index.html), [public page](https://nicheworks.app/tools/habit-plan-generator/), [app.js](../tools/habit-plan-generator/app.js).

### A26. Image Compression Inspector — `image-compression-inspector`

- **Primary job / target:** Re-compress a browser-readable static image as JPEG or WebP and compare original size/resolution with generated output size and reduction before downloading the new image. Target situation: People reducing an image for publication.
- **Workflow:** Load → choose format/quality → compare → download.
- **Completion / usable output:** Save an acceptable-looking image at a known actual size, including when output grows.
- **Required capabilities (existing or to verify):** Decode, preview, size/ratio calculation, format-aware export.
- **Failure/robustness:** Transparency to JPEG; quality extremes; already-compressed or huge image. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Batch DAM or subjective quality guarantee.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Define output fidelity and growth/unsupported-format feedback.
- **Evidence:** [SPEC](../tools/image-compression-inspector/SPEC.md), [docs/error contract](../docs/tools/image-compression-inspector.md), [HTML](../tools/image-compression-inspector/index.html), [public page](https://nicheworks.app/tools/image-compression-inspector/), [app.js](../tools/image-compression-inspector/app.js).

### A27. Image Redact — `image-redact`

- **Primary job / target:** Hide sensitive visual regions in screenshots/photos with solid blackout, blur, or pixelation and export a redacted PNG without uploading the source image through the tool workflow. Target situation: People hiding private visual information before sharing.
- **Workflow:** Load → mark regions → choose redaction → inspect/export PNG.
- **Completion / usable output:** Share an image whose intended sensitive regions are actually obscured in the saved output.
- **Required capabilities (existing or to verify):** Accurate region mapping, review at useful scale, export matching preview.
- **Failure/robustness:** Scaled image; edge regions; undo/reset; many regions; large export. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Guaranteed irreversibility of blur or automated PII detection.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Blackout vs blur security semantics and coordinate/export agreement need independent validation.
- **Evidence:** [SPEC](../tools/image-redact/SPEC.md), [docs/error contract](../docs/tools/image-redact.md), [HTML](../tools/image-redact/index.html), [public page](https://nicheworks.app/tools/image-redact/), [app.js](../tools/image-redact/app.js).

### A28. INCI FastScan — `inci-fastscan`

- **Primary job / target:** Parse pasted or OCR-extracted cosmetic ingredient labels and compare normalized ingredients with the local/generated INCI dictionary so dictionary matches, additional-review entries, and unmatched items can be inspected quickly. INCI FastScan is the photo/OCR and detailed-review member of the NicheWorks cosmetics pair; Cosmetic Ingredient Checker Lite remains the faster paste-only bilingual entry point. Target situation: Users reading photographed or pasted cosmetic labels.
- **Workflow:** Paste or OCR image → correct text → analyze known/unknown ingredients.
- **Completion / usable output:** Review corrected source text and clearly separated matches/unmatched items without a safety verdict.
- **Required capabilities (existing or to verify):** OCR correction, parser traceability, dictionary coverage/unknowns, bilingual detail.
- **Failure/robustness:** OCR errors; poor image; duplicate/unknown ingredients; model download failure. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Medical judgments or automatic allergy/product-safety approval.
- **Confidence / uncertainty:** SC HIGH / IC LOW / PC LOW; OPEN. OCR path, dictionary provenance, and low-confidence correction require browser/device evidence.
- **Evidence:** [SPEC](../tools/inci-fastscan/SPEC.md), [docs/error contract](../docs/tools/inci-fastscan.md), [HTML](../tools/inci-fastscan/index.html), [public page](https://nicheworks.app/tools/inci-fastscan/), [strings.js](../tools/inci-fastscan/js/strings.js), [core_parser.js](../tools/inci-fastscan/js/core_parser.js), [core_matcher.js](../tools/inci-fastscan/js/core_matcher.js), [core_analyze.js](../tools/inci-fastscan/js/core_analyze.js), [core_ocr_post.js](../tools/inci-fastscan/js/core_ocr_post.js), [web_ui.js](../tools/inci-fastscan/js/web_ui.js).

### A29. Incident Update Generator — `incident-update-generator`

- **Primary job / target:** Turn confirmed incident facts into draft customer, internal, and social-status updates while preserving human review for factual, legal, PR, security, SLA, and compensation decisions. Target situation: Incident responders preparing status updates.
- **Workflow:** Enter confirmed facts → choose audience → generate/copy drafts.
- **Completion / usable output:** Share a reviewed update that preserves facts and does not invent ETA/cause/resolution.
- **Required capabilities (existing or to verify):** Fact preservation, explicit unknowns, audience-specific output, copy.
- **Failure/robustness:** Unknown ETA; blank cause; long chronology; regenerate after edits. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Sending updates, legal/PR decisions, automatic incident detection.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Need fixtures ensuring unknown facts are never promoted to certainty.
- **Evidence:** [SPEC](../tools/incident-update-generator/SPEC.md), [docs/error contract](../docs/tools/incident-update-generator.md), [HTML](../tools/incident-update-generator/index.html), [public page](https://nicheworks.app/tools/incident-update-generator/), [app.js](../tools/incident-update-generator/app.js), [pro-bridge.js](../tools/incident-update-generator/pro-bridge.js).

### A30. JP Postal Lite — `jp-postal-lite`

- **Primary job / target:** Search Japanese postal-code reference data by prefecture and partial address, collect selected matches, and export a small CSV for follow-up work while requiring official confirmation for important uses. Target situation: Office users collecting a small Japanese address reference list.
- **Workflow:** Filter prefecture/address → choose matches → export CSV.
- **Completion / usable output:** Reuse selected postal/address rows with leading zeros and official-confirmation limits preserved.
- **Required capabilities (existing or to verify):** Search, selectable results, correct CSV, coverage indication.
- **Failure/robustness:** No match; partial/duplicate address; leading-zero postal codes; many selections. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Authoritative address validation or nationwide automatic address entry.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; OPEN. Dataset coverage/freshness and real CSV consumer interoperability remain unverified.
- **Evidence:** [SPEC](../tools/jp-postal-lite/SPEC.md), [docs/error contract](../docs/tools/jp-postal-lite.md), [HTML](../tools/jp-postal-lite/index.html), [public page](https://nicheworks.app/tools/jp-postal-lite/), [app.js](../tools/jp-postal-lite/app.js), [test example](../tools/jp-postal-lite/tests/behavior.test.mjs).

### A31. JSON Repair — `json-repair`

- **Primary job / target:** Validate, format, minify, and repair common broken-JSON cases in the browser, with stronger repair, candidate/schema/history, and report tooling gated behind NicheWorks Pro. Target situation: Developers salvaging malformed JSON.
- **Workflow:** Paste → validate/repair → inspect → copy/download.
- **Completion / usable output:** Obtain parseable JSON while understanding any lossy or ambiguous changes.
- **Required capabilities (existing or to verify):** Precise errors, bounded repairs, review/diff of changed meaning, valid serialization.
- **Failure/robustness:** Empty; deeply nested; duplicate keys; truncated string; huge text; repeated repair. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Guaranteeing intended meaning or arbitrary-language parsing.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Define change accountability and safe handling of ambiguous repair separately from parser success.
- **Evidence:** [SPEC](../tools/json-repair/SPEC.md), [docs/error contract](../docs/tools/json-repair.md), [HTML](../tools/json-repair/index.html), [public page](https://nicheworks.app/tools/json-repair/), [app.js](../tools/json-repair/app.js).

### A32. JSON to Mermaid — `json2mermaid`

- **Primary job / target:** Convert JSON structure into Mermaid `flowchart` source code locally so users can inspect, copy, and save a diagram definition for use in Mermaid-compatible tools. Target situation: Developers documenting a JSON structure.
- **Workflow:** Paste JSON → choose options → generate → copy/save Mermaid.
- **Completion / usable output:** Use syntactically valid diagram source that represents the intended structure at a manageable size.
- **Required capabilities (existing or to verify):** JSON validation, safe labels/IDs, clear limits, reusable Mermaid text.
- **Failure/robustness:** Primitive roots; arrays; special labels; deep/wide/large JSON; invalid JSON. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Full visual editor or automatic architecture inference.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Generated diagrams need downstream parse checks and explicit truncation rules.
- **Evidence:** [SPEC](../tools/json2mermaid/SPEC.md), [docs/error contract](../docs/tools/json2mermaid.md), [HTML](../tools/json2mermaid/index.html), [public page](https://nicheworks.app/tools/json2mermaid/), [app.js](../tools/json2mermaid/app.js).

### A33. Kanji Modernizer — `kanji-modernizer`

- **Primary job / target:** Convert registered old-form and modern-form kanji character-by-character using the tool's dictionary while exposing replacements and ambiguity instead of claiming context-aware official-name conversion. Target situation: Users normalizing registered old/modern forms.
- **Workflow:** Paste → choose direction → convert → inspect replacements/copy.
- **Completion / usable output:** Reuse intended text while recognizing ambiguous mappings and unchanged characters.
- **Required capabilities (existing or to verify):** Traceable replacements, dictionary boundaries, Unicode preservation, copy.
- **Failure/robustness:** One-to-many forms; unknown/supplementary characters; long text. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Context-aware legal-name correction or translation.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; UX GAP. Representative ambiguity cases and output non-loss need stronger acceptance examples.
- **Evidence:** [SPEC](../tools/kanji-modernizer/SPEC.md), [docs/error contract](../docs/tools/kanji-modernizer.md), [HTML](../tools/kanji-modernizer/index.html), [public page](https://nicheworks.app/tools/kanji-modernizer/), [app.js](../tools/kanji-modernizer/app.js).

### A34. Laundry Code Decode — `laundry-code-decode`

- **Primary job / target:** Let users identify the meaning of current Japanese textile care-label symbols without uploading the label to a server. The canonical data set is the Consumer Affairs Agency overview of JIS L 0001:2024 used for Japanese care labels from 2024-08-20 onward. Target situation: People reading a Japanese care label.
- **Workflow:** Find/select symbol → inspect meaning and combination guidance.
- **Completion / usable output:** Identify the matching current symbol and understand its care constraints without invented certainty.
- **Required capabilities (existing or to verify):** Complete cited symbol set, recognizable icons, accurate category/temperature meaning.
- **Failure/robustness:** Similar icons; mixed labels; no match; small-screen icon selection. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Laundry guarantees or automatic image recognition.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. Strong data contract; real visual identification and combination comprehension remain unverified.
- **Evidence:** [SPEC](../tools/laundry-code-decode/SPEC.md), [docs/error contract](../docs/tools/laundry-code-decode.md), [HTML](../tools/laundry-code-decode/index.html), [public page](https://nicheworks.app/tools/laundry-code-decode/), [data.js](../tools/laundry-code-decode/data.js), [app.js](../tools/laundry-code-decode/app.js), [test example](../tools/laundry-code-decode/tests/behavior.test.mjs).

### A35. Camera Lighting Check — `light-check`

- **Primary job / target:** Use live camera frames to compare relative brightness, color cast, contrast/shadow characteristics, and brightness variation before shooting or streaming, without presenting the browser camera as a calibrated light meter. Target situation: Creators checking lighting before recording.
- **Workflow:** Permit camera → inspect relative metrics → compare conditions.
- **Completion / usable output:** Understand relative changes under known acquisition conditions rather than calibrated lux.
- **Required capabilities (existing or to verify):** Permission/start/stop feedback, live frames, metric limitations, readable comparison.
- **Failure/robustness:** Permission denial; unavailable camera; darkness; exposure changes; stop/restart. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Calibrated light meter or objective exposure guarantee.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; UX GAP. Device permission lifecycle and auto-exposure effects require real-device testing.
- **Evidence:** [SPEC](../tools/light-check/SPEC.md), [docs/error contract](../docs/tools/light-check.md), [HTML](../tools/light-check/index.html), [public page](https://nicheworks.app/tools/light-check/), [app.js](../tools/light-check/app.js), [test example](../tools/light-check/tests/behavior.test.mjs), [README](../tools/light-check/README.md).

### A36. Linebreak Doctor — `linebreak-doctor`

- **Primary job / target:** Generate platform-oriented copies of social-post text with adjusted line breaks, blank lines, and spacing before the user pastes the text into X, Instagram, LINE, Facebook, or LinkedIn. Target situation: Social-post authors moving text between platforms.
- **Workflow:** Paste → choose policy → format → inspect/copy platform variant.
- **Completion / usable output:** Paste the intended text with deliberate blank-line/invisible-character behavior preserved.
- **Required capabilities (existing or to verify):** Visible policy, accurate previews/copy, empty-input feedback.
- **Failure/robustness:** Empty; emoji/Japanese; repeated blank lines; long text; repeat/copy. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Posting service, accounts, platform rendering guarantees.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; SAMPLE. Clipboard sample passed; downstream paste, limits and narrow layout still need validation.
- **Evidence:** [SPEC](../tools/linebreak-doctor/SPEC.md), [docs/error contract](../docs/tools/linebreak-doctor.md), [HTML](../tools/linebreak-doctor/index.html), [public page](https://nicheworks.app/tools/linebreak-doctor/), [app.js](../tools/linebreak-doctor/app.js), [test example](../tools/linebreak-doctor/tests/behavior.test.mjs).

### A37. Log Formatter — `log-formatter`

- **Primary job / target:** Make pasted Nginx-style access logs and mixed text logs easier to inspect locally by parsing recognized lines, coloring/status-grouping results, filtering visible rows, and extracting likely error traffic without uploading the pasted log through the formatter workflow. Target situation: Developers inspecting local access/mixed logs.
- **Workflow:** Paste → parse → filter status/errors → inspect rows.
- **Completion / usable output:** Find relevant events while retaining malformed/unparsed lines and enough original context.
- **Required capabilities (existing or to verify):** Readable parsed fields, filters, explicit parse failures, original text access.
- **Failure/robustness:** Mixed formats; invalid lines; long paths; large logs; repeated filtering. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Log ingestion service, observability dashboard, automated diagnosis.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Measure large-input responsiveness and prove that unmatched lines are not silently lost.
- **Evidence:** [SPEC](../tools/log-formatter/SPEC.md), [docs/error contract](../docs/tools/log-formatter.md), [HTML](../tools/log-formatter/index.html), [public page](https://nicheworks.app/tools/log-formatter/), [pro-bridge.js](../tools/log-formatter/pro-bridge.js), [app.js](../tools/log-formatter/app.js), [README](../tools/log-formatter/README.md).

### A38. Logistics Compliance Kit JP — `logistics-compliance-kit-jp`

- **Primary job / target:** Help Japanese shippers organize logistics-efficiency conditions such as waiting time, delivery-window constraints, visibility gaps, outsourcing, and congestion into a practical review level, next actions, and planning draft without presenting the result as a legal/compliance determination. Target situation: Japanese shippers preparing an internal efficiency review.
- **Workflow:** Enter logistics conditions/memo → generate priority/actions/draft.
- **Completion / usable output:** Produce a reviewable planning memo with traceable reasons and unresolved questions.
- **Required capabilities (existing or to verify):** Explicit field/scoring definitions, reason mapping, draft preservation and handoff.
- **Failure/robustness:** Missing conditions; boundary thresholds; conflicting answers; long memo. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Legal/compliance certification or automatic regulatory filing.
- **Confidence / uncertainty:** SC LOW / IC LOW / PC LOW; OPEN. Specification refers to implemented fields instead of defining them; cannot independently verify score or output.
- **Evidence:** [SPEC](../tools/logistics-compliance-kit-jp/SPEC.md), [docs/error contract](../docs/tools/logistics-compliance-kit-jp.md), [HTML](../tools/logistics-compliance-kit-jp/index.html), [public page](https://nicheworks.app/tools/logistics-compliance-kit-jp/), [app.js](../tools/logistics-compliance-kit-jp/app.js), [pro-bridge.js](../tools/logistics-compliance-kit-jp/pro-bridge.js).

### A39. LP Skeleton Generator — `lp-skeleton-generator`

- **Primary job / target:** Turn product/service information into a draft landing-page structure, headings, and copy skeleton for review before publication, without claiming advertising, legal, or claim-substantiation compliance. Target situation: Small publishers drafting a landing page.
- **Workflow:** Enter product/audience/value → generate structure/copy → review.
- **Completion / usable output:** Reuse a coherent page outline with unsupported claims and missing evidence visible.
- **Required capabilities (existing or to verify):** Section consistency, preservation of supplied facts, editable/reusable draft.
- **Failure/robustness:** Sparse input; long copy; contradictory promises; repeat generation. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Publishing websites or certifying advertising claims.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Expected section ordering and unsupported-claim handling need examples.
- **Evidence:** [SPEC](../tools/lp-skeleton-generator/SPEC.md), [docs/error contract](../docs/tools/lp-skeleton-generator.md), [HTML](../tools/lp-skeleton-generator/index.html), [public page](https://nicheworks.app/tools/lp-skeleton-generator/), [app.js](../tools/lp-skeleton-generator/app.js).

### A40. ManualFinder — `manual-finder`

- **Primary job / target:** Provide a searchable, paginated directory of verified official manufacturer manual/support destinations. Prefer real model/product records and direct official manual/model-support targets; where a manufacturer intentionally groups multiple models on one canonical page, preserve that official grouping rather than inventing per-model URLs. Target situation: Owners seeking an official manual for a real device.
- **Workflow:** Search model/category → inspect candidate → open official destination.
- **Completion / usable output:** Reach the correct official manual or a clearly labelled official support/grouping page.
- **Required capabilities (existing or to verify):** Model disambiguation, useful no-match state, direct source handoff, provenance.
- **Failure/robustness:** Partial/ambiguous model; zero results; pagination; stale/moved official link. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Hosting manuals, generic shopping search, pretending maker indexes are exact models.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; SAMPLE. Search works in sampled cases; destination freshness and link-level coverage need a stratified audit.
- **Evidence:** [SPEC](../tools/manual-finder/SPEC.md), [docs/error contract](../docs/tools/manual-finder.md), [HTML](../tools/manual-finder/index.html), [public page](https://nicheworks.app/tools/manual-finder/), [app.paged.js](../tools/manual-finder/app.paged.js), [analytics.js](../tools/manual-finder/analytics.js), [test example](../tools/manual-finder/tests/behavior.test.mjs).

### A41. Membership Offer Builder — `membership-offer-builder`

- **Primary job / target:** Turn membership/community assumptions into a draft offer that organizes target members, deliverables, frequency, pricing candidate, operating limits, cancellation/refund terms, onboarding, and retention ideas before launch. Target situation: Creators preparing a membership offer.
- **Workflow:** Enter audience/benefits/price/limits → generate → review/copy.
- **Completion / usable output:** Share a coherent offer whose delivery and cancellation promises can be fulfilled.
- **Required capabilities (existing or to verify):** Consistent cadence/benefit boundaries, explicit unresolved terms, reusable copy.
- **Failure/robustness:** Missing price; excessive benefits; conflicting frequencies; long terms. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Membership platform, payments, subscriptions.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Acceptance needs consistency examples across price, scope and delivery limits.
- **Evidence:** [SPEC](../tools/membership-offer-builder/SPEC.md), [docs/error contract](../docs/tools/membership-offer-builder.md), [HTML](../tools/membership-offer-builder/index.html), [public page](https://nicheworks.app/tools/membership-offer-builder/), [app.js](../tools/membership-offer-builder/app.js).

### A42. Message Generator — `message-generator`

- **Primary job / target:** Generate a short message draft from purpose, culture, formality, optional relationship, and optional keywords using a local phrase/template dictionary with small randomized wording variation. Target situation: Users drafting a short social/personal message.
- **Workflow:** Choose purpose/culture/formality/relationship → generate/copy.
- **Completion / usable output:** Reuse an appropriate draft with supplied names/keywords preserved.
- **Required capabilities (existing or to verify):** Predictable option effects, coherent text, usable copy.
- **Failure/robustness:** Missing options; unusual names; long keywords; repeated random variants. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Sending messages or guaranteeing cultural appropriateness.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Define fallback combinations and keyword integration without overstating personalization.
- **Evidence:** [SPEC](../tools/message-generator/SPEC.md), [docs/error contract](../docs/tools/message-generator.md), [HTML](../tools/message-generator/index.html), [public page](https://nicheworks.app/tools/message-generator/), [app.js](../tools/message-generator/app.js).

### A43. MetadataSnap — `metadatasnap`

- **Primary job / target:** Fetch a user-supplied HTTP(S) page through an HTTP proxy, parse its HTML, and show a compact set of page metadata: title, meta description, Open Graph image, and canonical URL. Target situation: Site editors inspecting a page's metadata.
- **Workflow:** Enter URL → proxy fetch → inspect title/description/image/canonical.
- **Completion / usable output:** Recognize fetched/missing metadata and inspect the correct image/destination for that source page.
- **Required capabilities (existing or to verify):** Input validation, disclosed fetch route, source-relative URL handling, errors.
- **Failure/robustness:** Relative URLs; missing tags; blocked fetch; fallback failure; reset while loading. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Crawler, authenticated browsing, JavaScript rendering.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; CORE GAP. Documented unresolved relative URLs conflict with a trustworthy image preview.
- **Evidence:** [SPEC](../tools/metadatasnap/SPEC.md), [docs/error contract](../docs/tools/metadatasnap.md), [HTML](../tools/metadatasnap/index.html), [public page](https://nicheworks.app/tools/metadatasnap/), [app.js](../tools/metadatasnap/app.js).

### A44. Microtool Launch Checklist — `microtool-launch-checklist`

- **Primary job / target:** Generate a lightweight pre-launch checklist for small web tools so a publisher can review common release concerns before shipping. Target situation: Small-tool authors reviewing a release.
- **Workflow:** Select tool context → generate checklist → review/copy.
- **Completion / usable output:** Leave with relevant, actionable checks and explicit unverified items.
- **Required capabilities (existing or to verify):** Context mapping, concrete check wording, reusable checklist.
- **Failure/robustness:** No context; conflicting choices; repeat generation; long notes. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** CI platform, automatic compliance approval.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Checklist generation is not verification; expected context-specific differences need examples.
- **Evidence:** [SPEC](../tools/microtool-launch-checklist/SPEC.md), [docs/error contract](../docs/tools/microtool-launch-checklist.md), [HTML](../tools/microtool-launch-checklist/index.html), [public page](https://nicheworks.app/tools/microtool-launch-checklist/), [app.js](../tools/microtool-launch-checklist/app.js).

### A45. Mini Game Utility — `mini-game-utility`

- **Primary job / target:** Provide a simple browser timer and persistent score log for lightweight games, events, or manual scorekeeping. Target situation: People timing casual games and recording scores.
- **Workflow:** Start/pause/reset timer → add score → inspect history → export CSV.
- **Completion / usable output:** Keep a usable score record and export rows without corrupting names, values or timestamps.
- **Required capabilities (existing or to verify):** Independent timer/history controls, correct durable entries, valid CSV.
- **Failure/robustness:** Comma/quote/newline names; locale timestamps; empty score; >50 records; reload; clear. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Multiplayer service, precision stopwatch, tournament platform.
- **Confidence / uncertainty:** SC LOW / IC LOW / PC LOW; CORE GAP. Spec explicitly accepts unescaped CSV; this is inadequate for its own score-export job.
- **Evidence:** [SPEC](../tools/mini-game-utility/SPEC.md), [docs/error contract](../docs/tools/mini-game-utility.md), [HTML](../tools/mini-game-utility/index.html), [public page](https://nicheworks.app/tools/mini-game-utility/), [app.js](../tools/mini-game-utility/app.js).

### A46. Minutes to Ops — `minutes-to-ops`

- **Primary job / target:** Turn pasted meeting minutes into operational artifacts using deterministic rule-based extraction rather than AI summarization. Target situation: Teams converting meeting notes into follow-up work.
- **Workflow:** Paste minutes → extract rule-based items → review/copy artifacts.
- **Completion / usable output:** Reuse tasks/decisions with source context and missing owners/dates visible.
- **Required capabilities (existing or to verify):** Traceable extraction, unknowns, editable/reusable artifacts.
- **Failure/robustness:** Unstructured notes; absent owner/date; multiline bullets; duplicate actions. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** AI summarization, executing tasks, project-management backend.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Need representative meeting fixtures and explicit non-extraction behavior.
- **Evidence:** [SPEC](../tools/minutes-to-ops/SPEC.md), [docs/error contract](../docs/tools/minutes-to-ops.md), [HTML](../tools/minutes-to-ops/index.html), [public page](https://nicheworks.app/tools/minutes-to-ops/), [pro-bridge.js](../tools/minutes-to-ops/pro-bridge.js), [app.js](../tools/minutes-to-ops/app.js).

### A47. Money Template Checker — `money-template-checker`

- **Primary job / target:** Provide a simple JPY household-budget organization check from monthly income, spending totals, and a savings target. Target situation: Households organizing a simple monthly JPY budget.
- **Workflow:** Enter income/spending/savings target → calculate → inspect summary.
- **Completion / usable output:** Understand totals, remainder and savings feasibility without financial advice.
- **Required capabilities (existing or to verify):** Numeric validation, transparent arithmetic, explicit zero/deficit handling.
- **Failure/robustness:** Zero income; negatives; decimals; huge values; empty categories. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Financial planning, tax guidance, bank aggregation.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. Defined numeric cases are useful; user interpretation and full browser flow remain unverified.
- **Evidence:** [SPEC](../tools/money-template-checker/SPEC.md), [docs/error contract](../docs/tools/money-template-checker.md), [HTML](../tools/money-template-checker/index.html), [public page](https://nicheworks.app/tools/money-template-checker/), [app.js](../tools/money-template-checker/app.js), [test example](../tools/money-template-checker/tests/behavior.test.mjs).

### A48. Motion Atlas — `motion-atlas`

- **Primary job / target:** Provide a visual UI-motion reference and decision tool where users can search motion patterns, inspect live demos, compare alternatives, and create implementation-oriented handoff text. Target situation: Designers choosing a UI motion pattern.
- **Workflow:** Search → run demo → compare → copy guidance.
- **Completion / usable output:** Select motion for a stated purpose with accessibility/performance tradeoffs understood.
- **Required capabilities (existing or to verify):** Controllable demos, meaningful alternatives, reduced-motion behavior, reusable guidance.
- **Failure/robustness:** Reduced-motion setting; repeated demos; no match; long detail; narrow comparison. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Animation editor, speculative pattern proliferation.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; UX GAP. Need rendered accessibility and comparison evidence rather than catalog count.
- **Evidence:** [SPEC](../tools/motion-atlas/SPEC.md), [docs/error contract](../docs/tools/motion-atlas.md), [HTML](../tools/motion-atlas/index.html), [public page](https://nicheworks.app/tools/motion-atlas/), [pro-bridge.js](../tools/motion-atlas/pro-bridge.js), [app.js](../tools/motion-atlas/app.js), [README](../tools/motion-atlas/README.md).

### A49. Moving Checklist Generator — `moving-checklist-generator`

- **Primary job / target:** Generate a chronological moving checklist from 30 days before the move through post-move follow-up, based on a move date and household/home conditions, with browser-local completion tracking and print/PDF support. Target situation: Households organizing a move over time.
- **Workflow:** Set date/household → generate → mark tasks → print.
- **Completion / usable output:** Use a dated, relevant checklist and retain deliberate progress without missed reset consequences.
- **Required capabilities (existing or to verify):** Date arithmetic, condition-based tasks, local state, usable print/export.
- **Failure/robustness:** Past date; timezone boundary; changed date after progress; reload; printing. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Moving service booking, calendar integrations, accounts.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Verify regeneration/progress semantics and date boundaries.
- **Evidence:** [SPEC](../tools/moving-checklist-generator/SPEC.md), [docs/error contract](../docs/tools/moving-checklist-generator.md), [HTML](../tools/moving-checklist-generator/index.html), [public page](https://nicheworks.app/tools/moving-checklist-generator/), [app.js](../tools/moving-checklist-generator/app.js).

### A50. Moving Lease Final Check — `moving-lease-final-check`

- **Primary job / target:** Provide a final pre-move/pre-vacate checklist for common cancellation, inspection, photo, meter, key-return, and handoff tasks immediately around move-out. Target situation: Tenants preparing final move-out checks.
- **Workflow:** Choose circumstances → inspect/check tasks → review handoff.
- **Completion / usable output:** Complete final inspection/evidence/key/meter tasks and reuse a clear handoff note.
- **Required capabilities (existing or to verify):** Relevant final-stage tasks, preserved progress, clear evidence reminders.
- **Failure/robustness:** Incomplete tasks; changed conditions; reload/reset; locked optional outputs. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Whole-move planner, legal/deposit dispute determination.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Clarify free completion and progress-loss behavior independently of Pro artifacts.
- **Evidence:** [SPEC](../tools/moving-lease-final-check/SPEC.md), [docs/error contract](../docs/tools/moving-lease-final-check.md), [HTML](../tools/moving-lease-final-check/index.html), [public page](https://nicheworks.app/tools/moving-lease-final-check/), [pro-bridge.js](../tools/moving-lease-final-check/pro-bridge.js), [app.js](../tools/moving-lease-final-check/app.js).

### A51. Name Old Kanji Checker — `name-old-kanji-checker`

- **Primary job / target:** Check characters in a name against the Old Kanji Reference data and surface old-form, modern-form, and variant candidates as a reference aid. Target situation: People inspecting unfamiliar characters in names.
- **Workflow:** Enter name → inspect candidates/details → copy reference.
- **Completion / usable output:** Identify registered variants while retaining original spelling and uncertainty.
- **Required capabilities (existing or to verify):** Unicode-safe character mapping, unknowns, per-character provenance.
- **Failure/robustness:** Supplementary characters; unknowns; repeats; mixed kana; long name. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Official identity validation or automatic name correction.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; OPEN. Character data tests do not validate all ambiguous-name decisions.
- **Evidence:** [SPEC](../tools/name-old-kanji-checker/SPEC.md), [docs/error contract](../docs/tools/name-old-kanji-checker.md), [HTML](../tools/name-old-kanji-checker/index.html), [public page](https://nicheworks.app/tools/name-old-kanji-checker/), [app.js](../tools/name-old-kanji-checker/app.js), [test example](../tools/name-old-kanji-checker/tests/behavior.test.mjs).

### A52. Newsletter Kit Generator — `newsletter-kit-generator`

- **Primary job / target:** Generate a lightweight bilingual newsletter planning kit from a theme, audience, and delivery frequency. Target situation: Writers planning a newsletter issue/series.
- **Workflow:** Enter theme/audience/frequency → generate kit → copy/edit.
- **Completion / usable output:** Reuse a coherent plan with actionable issue structure and supplied context preserved.
- **Required capabilities (existing or to verify):** Input consistency, practical sections, editable output.
- **Failure/robustness:** Sparse input; long audience; incompatible frequency; repeat. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Mailing service, subscriber management, content AI.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Concrete examples needed for meaningful tailoring and missing-input behavior.
- **Evidence:** [SPEC](../tools/newsletter-kit-generator/SPEC.md), [docs/error contract](../docs/tools/newsletter-kit-generator.md), [HTML](../tools/newsletter-kit-generator/index.html), [public page](https://nicheworks.app/tools/newsletter-kit-generator/), [app.js](../tools/newsletter-kit-generator/app.js).

### A53. Niche Job Starter Kit — `niche-job-starter-kit`

- **Primary job / target:** Create a browser-local draft job kit for niche roles, side work, and contractor recruiting, including a job post, screening questions, and candidate-sheet columns. Target situation: Small teams drafting a niche-role hiring kit.
- **Workflow:** Enter role/context → generate post/questions/sheet columns.
- **Completion / usable output:** Share internally consistent recruiting materials for human review.
- **Required capabilities (existing or to verify):** Role/requirement consistency, usable questions, reusable candidate-sheet structure.
- **Failure/robustness:** Missing duties; contradictory conditions; long text; regenerate. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Applicant tracking, employment/legal guarantees, candidate scoring.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Expected artifact consistency and unsupported assumptions need explicit cases.
- **Evidence:** [SPEC](../tools/niche-job-starter-kit/SPEC.md), [docs/error contract](../docs/tools/niche-job-starter-kit.md), [HTML](../tools/niche-job-starter-kit/index.html), [public page](https://nicheworks.app/tools/niche-job-starter-kit/), [app.js](../tools/niche-job-starter-kit/app.js).

### A54. Notion Form Design Kit — `notion-form-design-kit`

- **Primary job / target:** Draft a Notion-oriented intake database design, workflow, and notification-message set without connecting to or modifying a Notion workspace. Target situation: Operators designing a Notion intake workflow.
- **Workflow:** Enter intake requirements → generate schema/workflow/messages.
- **Completion / usable output:** Recreate a coherent database/intake design in Notion from the draft.
- **Required capabilities (existing or to verify):** Clear property types, consistent mappings, copyable instructions/messages.
- **Failure/robustness:** Duplicate field names; conflicting types; missing routing; long labels. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Connecting to Notion or creating a live form automatically.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Need a manual reconstruction acceptance example proving the handoff is usable.
- **Evidence:** [SPEC](../tools/notion-form-design-kit/SPEC.md), [docs/error contract](../docs/tools/notion-form-design-kit.md), [HTML](../tools/notion-form-design-kit/index.html), [public page](https://nicheworks.app/tools/notion-form-design-kit/), [app.js](../tools/notion-form-design-kit/app.js).

### A55. OG Image Maker — `og-image-maker`

- **Primary job / target:** Create and download a 1200×630 Open Graph image in the browser from text, color, template, and optional logo inputs. Target situation: Publishers preparing a social sharing image.
- **Workflow:** Enter text/colors/logo → preview → download 1200×630 image.
- **Completion / usable output:** Save an image with legible, unclipped intended text and correct dimensions.
- **Required capabilities (existing or to verify):** Text fitting, preview/export agreement, image decode, download.
- **Failure/robustness:** Long title; CJK/emoji; missing logo; unsupported file; comma-bearing batch fields. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Design suite, live social posting, activation of paid batch features.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Text-fit/export and gated CSV parsing need concrete tests; paid paths not activated in this audit.
- **Evidence:** [SPEC](../tools/og-image-maker/SPEC.md), [docs/error contract](../docs/tools/og-image-maker.md), [HTML](../tools/og-image-maker/index.html), [public page](https://nicheworks.app/tools/og-image-maker/), [app.js](../tools/og-image-maker/app.js), [pro-bridge.js](../tools/og-image-maker/pro-bridge.js).

### A56. Old Document Kanji Highlighter — `old-document-kanji-highlighter`

- **Primary job / target:** Highlight registered old/variant kanji in pasted historical-style text and provide a mechanical modern-form reference without claiming translation or scholarly interpretation. Target situation: Readers inspecting old/variant characters in text.
- **Workflow:** Paste historical-style text → highlight → inspect modern reference.
- **Completion / usable output:** Locate registered variants and reuse a reference without losing source text.
- **Required capabilities (existing or to verify):** Accurate spans, original/converted comparison, unknowns, Unicode-safe output.
- **Failure/robustness:** Supplementary forms; repeated characters; long paragraphs; mixed scripts. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Translation, scholarly interpretation, authoritative transcription.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Define long-text behavior and ambiguous mapping presentation.
- **Evidence:** [SPEC](../tools/old-document-kanji-highlighter/SPEC.md), [docs/error contract](../docs/tools/old-document-kanji-highlighter.md), [HTML](../tools/old-document-kanji-highlighter/index.html), [public page](https://nicheworks.app/tools/old-document-kanji-highlighter/), [app.js](../tools/old-document-kanji-highlighter/app.js).

### A57. Old Kanji Ocr Scanner — `old-kanji-ocr-scanner`

- **Primary job / target:** Run browser-side Japanese OCR on one selected image, let the user correct the recognized text, detect registered old/variant kanji in the resulting text, and optionally expose contextual Amazon search handoffs for physical document-reading tools. Target situation: Readers transcribing an image containing old kanji.
- **Workflow:** Choose image → OCR → correct text → inspect variants.
- **Completion / usable output:** Obtain reviewable corrected text and distinguish OCR errors from dictionary matches.
- **Required capabilities (existing or to verify):** OCR progress/error handling, editable recognition, original-image comparison.
- **Failure/robustness:** Poor scan; rotated image; model/network failure; unusual glyphs; reselect. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Guaranteed historical-glyph recognition or expert transcription.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. OCR correction is intrinsic; actual accuracy and large-image limits remain unmeasured.
- **Evidence:** [SPEC](../tools/old-kanji-ocr-scanner/SPEC.md), [docs/error contract](../docs/tools/old-kanji-ocr-scanner.md), [HTML](../tools/old-kanji-ocr-scanner/index.html), [public page](https://nicheworks.app/tools/old-kanji-ocr-scanner/), [app.js](../tools/old-kanji-ocr-scanner/app.js).

### A58. Old Kanji Reference — `old-kanji-reference`

- **Primary job / target:** Provide a searchable bilingual reference for old Japanese kanji forms and their modern equivalents, including selected metadata, text detection, local study state, export utilities, and optional contextual Amazon search handoffs for physical reference tools. Target situation: Learners/readers identifying an old kanji form.
- **Workflow:** Search or paste → inspect entry/variants → reuse reference.
- **Completion / usable output:** Find the relevant mapping and its uncertainty/provenance without overwriting the original name.
- **Required capabilities (existing or to verify):** Search, recognizable glyphs, explanatory detail, unknowns and optional copy.
- **Failure/robustness:** No match; similar forms; missing glyph font; supplementary characters. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Official-name certification or full historical dictionary.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Validate ambiguity and font fallback against actual reading tasks.
- **Evidence:** [SPEC](../tools/old-kanji-reference/SPEC.md), [docs/error contract](../docs/tools/old-kanji-reference.md), [HTML](../tools/old-kanji-reference/index.html), [public page](https://nicheworks.app/tools/old-kanji-reference/), [app-meaning-v4.js](../tools/old-kanji-reference/app-meaning-v4.js), [verified-badge.js](../tools/old-kanji-reference/verified-badge.js).

### A59. Ops Weekly Report Generator — `ops-weekly-report-generator`

- **Primary job / target:** Create a bilingual weekly operations-report draft from manually entered KPIs, changes, results, risks, open items, decisions, and next actions. Target situation: Operations teams drafting a weekly report.
- **Workflow:** Enter KPIs/results/risks/actions → generate bilingual draft.
- **Completion / usable output:** Reuse a consistent report with facts, open items and next actions preserved.
- **Required capabilities (existing or to verify):** Stable section mapping, explicit omissions, copy/edit behavior.
- **Failure/robustness:** Missing KPI; multiline risks; mixed-language values; regenerate. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Analytics collection, automated management decisions.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Need field-to-section examples and edit/regeneration rules.
- **Evidence:** [SPEC](../tools/ops-weekly-report-generator/SPEC.md), [docs/error contract](../docs/tools/ops-weekly-report-generator.md), [HTML](../tools/ops-weekly-report-generator/index.html), [public page](https://nicheworks.app/tools/ops-weekly-report-generator/), [app.js](../tools/ops-weekly-report-generator/app.js).

### A60. Outsource Spec Generator — `outsource-spec-generator`

- **Primary job / target:** Draft an outsourcing specification from scope, deliverables, deadline, budget, acceptance method, revision rules, and related handoff details. Target situation: Clients preparing a vendor brief.
- **Workflow:** Enter scope/deliverables/acceptance → generate → copy draft.
- **Completion / usable output:** Share an actionable brief whose acceptance and revision terms can be agreed.
- **Required capabilities (existing or to verify):** Required fields, concrete acceptance output, free copy; currently blocked at startup.
- **Failure/robustness:** Boot without entitlement; missing core fields; long terms; repeated generation. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Contract execution, payment, legal/IP conclusions.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; BLOCKER. Free boot and accessible form must be checked before detailed entitlement assertions.
- **Evidence:** [SPEC](../tools/outsource-spec-generator/SPEC.md), [docs/error contract](../docs/tools/outsource-spec-generator.md), [HTML](../tools/outsource-spec-generator/index.html), [public page](https://nicheworks.app/tools/outsource-spec-generator/), [pro-bridge.js](../tools/outsource-spec-generator/pro-bridge.js), [app.js](../tools/outsource-spec-generator/app.js).

### A61. Pages Deploy Guide — `pages-deploy-guide`

- **Primary job / target:** Generate a pre-deploy checklist for Cloudflare Pages or GitHub Pages and, when shared NicheWorks Pro is active, provide a symptom diagnosis tree and deployment handoff pack. Target situation: Developers preparing a static-site deployment.
- **Workflow:** Choose host/context → generate checks → review diagnosis/handoff.
- **Completion / usable output:** Know concrete pre-deploy checks and unresolved environment details.
- **Required capabilities (existing or to verify):** Host-specific steps, usable checklist, honest diagnosis limits.
- **Failure/robustness:** Wrong host; incomplete settings; unsupported error symptom. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Deploying sites or guaranteeing a release passed.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Generated checks must be independently actionable; docs should not equate output with successful deploy.
- **Evidence:** [SPEC](../tools/pages-deploy-guide/SPEC.md), [docs/error contract](../docs/tools/pages-deploy-guide.md), [HTML](../tools/pages-deploy-guide/index.html), [public page](https://nicheworks.app/tools/pages-deploy-guide/), [pro-bridge.js](../tools/pages-deploy-guide/pro-bridge.js), [app.js](../tools/pages-deploy-guide/app.js).

### A62. Pattern Atlas — `pattern-atlas`

- **Primary job / target:** Provide a visual dictionary for world pattern references with searchable metadata, live SVG previews, color editing, cultural-context cautions, and client-side asset export. Target situation: Designers exploring and exporting pattern illustrations.
- **Workflow:** Search reference → edit SVG colors → preview → export.
- **Completion / usable output:** Reuse the intended generated asset with source/cultural limitations understood.
- **Required capabilities (existing or to verify):** Accurate preview/export, valid SVG/PNG, accessible controls, context notes.
- **Failure/robustness:** Complex SVG; color edits; large export; no match; narrow controls. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Claiming cultural authenticity or merging with Pattern Dictionary.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; UX GAP. Content confidence and export/render equivalence require more than structural checks.
- **Evidence:** [SPEC](../tools/pattern-atlas/SPEC.md), [docs/error contract](../docs/tools/pattern-atlas.md), [HTML](../tools/pattern-atlas/index.html), [public page](https://nicheworks.app/tools/pattern-atlas/), [app.js](../tools/pattern-atlas/js/app.js), [README](../tools/pattern-atlas/README.md).

### A63. Pattern Dictionary — `pattern-dictionary`

- **Primary job / target:** Pattern Dictionary is a bilingual visual pattern-identification dictionary for users who do not know a pattern's formal name. It supports two equal discovery paths: ambiguous natural-language description and visual browsing. The tool is not an asset-download marketplace and is separate from the existing Pattern Atlas creation/export tool. Target situation: People recognizing a pattern without knowing its name.
- **Workflow:** Browse/search description → inspect references → compare two.
- **Completion / usable output:** Identify plausible pattern names and distinguish confusable patterns with reliable visuals.
- **Required capabilities (existing or to verify):** Image-backed discovery, uncertainty, sourced detail, comparison and language continuity.
- **Failure/robustness:** Vague/zero-match query; confusable pair; missing image; direct detail link. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Asset generator, image-upload AI, shopping catalog.
- **Confidence / uncertainty:** SC LOW / IC LOW / PC LOW; UX GAP. SPEC says 20 prototypes/DEV/noindex; current data contains 100 and newer publication docs disagree.
- **Evidence:** [SPEC](../tools/pattern-dictionary/SPEC.md), [docs/error contract](../docs/tools/pattern-dictionary.md), [HTML](../tools/pattern-dictionary/index.html), [public page](https://nicheworks.app/tools/pattern-dictionary/), [app.js](../tools/pattern-dictionary/app.js), [test example](../tools/pattern-dictionary/tests/affiliate-test.mjs), [README](../tools/pattern-dictionary/README.md).

### A64. PDF Page Tools Mini — `pdf-page-tools-mini`

- **Primary job / target:** Edit page order and composition of one or more PDFs entirely in the browser, then download a new PDF without modifying the originals. Target situation: Users rearranging or composing PDFs.
- **Workflow:** Load PDFs → select/order/rotate pages → export.
- **Completion / usable output:** Open a new PDF with the intended page sequence and content, originals intact.
- **Required capabilities (existing or to verify):** Reliable page preview/order, operation feedback, valid downloadable PDF.
- **Failure/robustness:** Encrypted/corrupt PDF; many pages; mixed rotations/sizes; repeated imports. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Full PDF text editor, OCR, cloud storage.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Need independent exported-page order/content checks and a usable memory envelope.
- **Evidence:** [SPEC](../tools/pdf-page-tools-mini/SPEC.md), [docs/error contract](../docs/tools/pdf-page-tools-mini.md), [HTML](../tools/pdf-page-tools-mini/index.html), [public page](https://nicheworks.app/tools/pdf-page-tools-mini/), [app.js](../tools/pdf-page-tools-mini/app.js).

### A65. PDF to CSV Local — `pdf2csv-local`

- **Primary job / target:** Extract table-like text from selectable-text PDFs in the browser and export the reviewed result as CSV or XLSX. Target situation: Office users extracting a selectable-text PDF table.
- **Workflow:** Load PDF → inspect/edit extracted rows → export CSV/XLSX.
- **Completion / usable output:** Reopen a table whose rows/columns match the source, with uncertain extraction exposed.
- **Required capabilities (existing or to verify):** Source comparison, review/correction, valid export, unsupported-scan feedback.
- **Failure/robustness:** Scanned PDF; merged cells; multipage tables; long text; malformed file. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Guaranteed arbitrary PDF-table extraction or cloud OCR.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Algorithm success is insufficient; real table fidelity and correction effort need representative PDFs.
- **Evidence:** [SPEC](../tools/pdf2csv-local/SPEC.md), [docs/error contract](../docs/tools/pdf2csv-local.md), [HTML](../tools/pdf2csv-local/index.html), [public page](https://nicheworks.app/tools/pdf2csv-local/), [app.js](../tools/pdf2csv-local/app.js), [copy-fix.js](../tools/pdf2csv-local/copy-fix.js).

### A66. Phone QuickCheck — `phone-quickcheck`

- **Primary job / target:** Phone QuickCheck is a practical smartphone quick-reference tool. It is designed to answer the small set of questions a user is likely to have when checking a handset or buying charging accessories: physical size and weight, charging connector, charger requirements, wireless charging, approximate power-bank charge counts, and the manufacturer's official specification/manual destination. Target situation: People checking a phone or charging accessory requirement.
- **Workflow:** Search handset → inspect specs/connector/power guidance.
- **Completion / usable output:** Find the right model and official source and understand supported vs unknown charging facts.
- **Required capabilities (existing or to verify):** Model disambiguation, explicit unknowns, conservative estimates, official handoff.
- **Failure/robustness:** Similar variants; missing battery capacity; proprietary charging; no match. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Phone encyclopedia, live prices, performance benchmarking.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. Good focused contract; real model lookup and source freshness remain to be sampled.
- **Evidence:** [SPEC](../tools/phone-quickcheck/SPEC.md), [docs/error contract](../docs/tools/phone-quickcheck.md), [HTML](../tools/phone-quickcheck/index.html), [public page](https://nicheworks.app/tools/phone-quickcheck/), [app.js](../tools/phone-quickcheck/app.js), [test example](../tools/phone-quickcheck/tests/behavior.test.mjs).

### A67. Place Old Kanji Checker — `place-old-kanji-checker`

- **Primary job / target:** Check place names, addresses, station names, old-map labels, and sign text for registered old/variant kanji candidates as a reference aid. Target situation: People reading old maps, signs or addresses.
- **Workflow:** Enter place/address → inspect variant candidates.
- **Completion / usable output:** Understand registered character alternatives while preserving the literal original location text.
- **Required capabilities (existing or to verify):** Per-character mapping, unknowns, Unicode-safe display, clear uncertainty.
- **Failure/robustness:** Historic names; unknown/supplementary forms; mixed numbers; long address. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Geocoding, current official address validation.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Need examples separating character variants from historical place identity.
- **Evidence:** [SPEC](../tools/place-old-kanji-checker/SPEC.md), [docs/error contract](../docs/tools/place-old-kanji-checker.md), [HTML](../tools/place-old-kanji-checker/index.html), [public page](https://nicheworks.app/tools/place-old-kanji-checker/), [app.js](../tools/place-old-kanji-checker/app.js).

### A68. Product Founder OS — `product-founder-os`

- **Primary job / target:** Document and link to the Product Founder OS repository asset for structuring multi-session product work with GPT and/or Codex. Target situation: Founders adopting a repository-based product workflow.
- **Workflow:** Read overview → follow repository/start links.
- **Completion / usable output:** Reach the operating pack and understand setup and decision ownership.
- **Required capabilities (existing or to verify):** Clear audience, adoption path, working links, scope limits.
- **Failure/robustness:** Stale links; unclear prerequisites; narrow reading. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Hosted project-management app or autonomous product decisions.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. Actual external pack adoption remains unverified.
- **Evidence:** [SPEC](../tools/product-founder-os/SPEC.md), [docs/error contract](../docs/tools/product-founder-os.md), [HTML](../tools/product-founder-os/index.html), [public page](https://nicheworks.app/tools/product-founder-os/).

### A69. CSV / Excel Reconciliation — Reconcile — `reconcile`

- **Primary job / target:** Reconcile two transaction datasets locally in the browser and isolate exact matches, tolerant matches, ambiguous candidates, conflicts, duplicates, and unmatched records so users can focus manual review on exceptions rather than comparing rows by hand. Target situation: Finance/operations staff reconciling two transaction sets.
- **Workflow:** Load A/B → map/normalize → match → review exceptions → export.
- **Completion / usable output:** Account for every input row and review ambiguous/conflicting/unmatched records in reusable output.
- **Required capabilities (existing or to verify):** Stable row identity, explicit ambiguity, transparent tolerance, review and valid export.
- **Failure/robustness:** Duplicates; one-to-many candidates; rounding/date boundaries; XLSX/CSV variants; large data. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Accounting system, bank connectivity, automated settlement.
- **Confidence / uncertainty:** SC HIGH / IC LOW / PC LOW; OPEN. Strong contract and dedicated tests; current full UI/export/stress behavior was not executed here.
- **Evidence:** [SPEC](../tools/reconcile/SPEC.md), [docs/error contract](../docs/tools/reconcile.md), [HTML](../tools/reconcile/index.html), [public page](https://nicheworks.app/tools/reconcile/), [app.mjs](../tools/reconcile/app.mjs), [test example](../tools/reconcile/tests/rules-store.test.mjs), [README](../tools/reconcile/vendor/README.md).

### A70. Redirect Unwrapper — `redirect-unwrapper`

- **Primary job / target:** Inspect redirect/tracking URL strings locally and extract embedded destination URL candidates without opening or following the URL. Target situation: Users inspecting a tracking URL safely.
- **Workflow:** Paste URL → decode/extract → inspect/copy candidate.
- **Completion / usable output:** Read the embedded destination without navigation and distinguish it from a verified final destination.
- **Required capabilities (existing or to verify):** Safe string parsing, candidate explanation, copy, no automatic navigation.
- **Failure/robustness:** Nested encoding; malformed URL; multiple destination keys; cycles/length. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Following redirects, malware certification, browsing the destination.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; OPEN. Nested/ambiguous extraction cases need downstream user comprehension checks.
- **Evidence:** [SPEC](../tools/redirect-unwrapper/SPEC.md), [docs/error contract](../docs/tools/redirect-unwrapper.md), [HTML](../tools/redirect-unwrapper/index.html), [public page](https://nicheworks.app/tools/redirect-unwrapper/), [app.js](../tools/redirect-unwrapper/app.js), [test example](../tools/redirect-unwrapper/tests/behavior.test.mjs).

### A71. Release Guardian — `release-guardian`

- **Primary job / target:** Document and link to the Release Guardian repository asset for practical web-repository release preflight, structured verdicts, and narrow safe-fix workflows. Target situation: Maintainers seeking repository release checks.
- **Workflow:** Read verdict/safe-fix scope → open repository → adopt.
- **Completion / usable output:** Reach a usable preflight workflow and understand that reports require review.
- **Required capabilities (existing or to verify):** Accurate prerequisites, working handoff, clear execution boundaries.
- **Failure/robustness:** Stale links; unavailable environment; first-use ambiguity. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Guaranteeing release safety or running deployment on the landing page.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. Linked workflow adoption and execution were not tested.
- **Evidence:** [SPEC](../tools/release-guardian/SPEC.md), [docs/error contract](../docs/tools/release-guardian.md), [HTML](../tools/release-guardian/index.html), [public page](https://nicheworks.app/tools/release-guardian/).

### A72. Rename Wizard — `rename-wizard`

- **Primary job / target:** Generate batch filename cleanup candidates from selected local file names without renaming or reading the files themselves. Target situation: Users preparing batch filename cleanup candidates.
- **Workflow:** Select files → choose rules → inspect original/candidate list → reuse.
- **Completion / usable output:** Obtain an unambiguous original-to-candidate mapping with collisions visible for downstream renaming.
- **Required capabilities (existing or to verify):** Preserve identity/extensions, expose duplicate/conflicting names, usable mapping.
- **Failure/robustness:** Duplicate candidates; empty names; Unicode; many files; repeated rules. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Reading contents or silently renaming files.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Validate mapping handoff first; direct filesystem rename is not automatically a required feature.
- **Evidence:** [SPEC](../tools/rename-wizard/SPEC.md), [docs/error contract](../docs/tools/rename-wizard.md), [HTML](../tools/rename-wizard/index.html), [public page](https://nicheworks.app/tools/rename-wizard/), [app.js](../tools/rename-wizard/app.js).

### A73. Screenshot Stitcher — `screenshot-stitcher`

- **Primary job / target:** Combine multiple screenshots vertically in the browser, with ordering and output controls, then save one stitched image or split output without uploading source screenshots through the tool workflow. Target situation: People combining sequential screenshots.
- **Workflow:** Load several → reorder/crop/control output → preview/save.
- **Completion / usable output:** Open a correctly ordered legible combined image or clearly ordered split files.
- **Required capabilities (existing or to verify):** Order controls, dimension/memory safeguards, preview/export parity.
- **Failure/robustness:** Huge total height; mixed widths; duplicates; transparent images; reorder/reselect. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Screenshot capture service or full image editor.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Define practical canvas limits and export behavior before adding editing features.
- **Evidence:** [SPEC](../tools/screenshot-stitcher/SPEC.md), [docs/error contract](../docs/tools/screenshot-stitcher.md), [HTML](../tools/screenshot-stitcher/index.html), [public page](https://nicheworks.app/tools/screenshot-stitcher/), [app.js](../tools/screenshot-stitcher/app.js), [README](../tools/screenshot-stitcher/README.md).

### A74. Size Converter — `size-converter`

- **Primary job / target:** Provide a fast approximate JP/US/EU clothing and shoe size converter with local retail-input normalization, a four-row comparison tray, conservative measurement-based estimates, valid-fit handoff into direct conversion, and cm/inch shoe-measurement input. Target situation: Shoppers comparing approximate clothing/shoe sizes.
- **Workflow:** Choose category/system/input → convert or estimate → inspect comparison.
- **Completion / usable output:** Understand a conservative cross-system estimate and verify fit against a brand chart.
- **Required capabilities (existing or to verify):** Input normalization, units, uncertainty, category-correct conversion, bounded comparison.
- **Failure/robustness:** Ambiguous size; out-of-range measurements; cm/in switch; unknown brand conventions. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Universal fit guarantee or retailer price catalog.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; OPEN. Strong explicit approximation boundary; task-level interpretation still requires checking.
- **Evidence:** [SPEC](../tools/size-converter/SPEC.md), [docs/error contract](../docs/tools/size-converter.md), [HTML](../tools/size-converter/index.html), [public page](https://nicheworks.app/tools/size-converter/), [app.js](../tools/size-converter/app.js), [query-intent.js](../tools/size-converter/query-intent.js), [test example](../tools/size-converter/tests/behavior.test.mjs).

### A75. Sponsor Page Builder — `sponsor-page-builder`

- **Primary job / target:** Draft sponsor/support page copy for an OSS or independent project, including funding use, tier ideas, benefit boundaries, FAQ content, and pre-publication cautions. Target situation: Independent maintainers drafting support copy.
- **Workflow:** Enter project/funding use/tiers → generate → review/copy.
- **Completion / usable output:** Publishable draft explains funding purpose and realistic benefit boundaries after review.
- **Required capabilities (existing or to verify):** Consistent tiers, explicit limits, reusable sections/FAQ.
- **Failure/robustness:** Empty funding need; conflicting benefits; long project text. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Payment platform, donor accounts, fundraising guarantees.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Need examples preventing invented commitments and contradictory tier wording.
- **Evidence:** [SPEC](../tools/sponsor-page-builder/SPEC.md), [docs/error contract](../docs/tools/sponsor-page-builder.md), [HTML](../tools/sponsor-page-builder/index.html), [public page](https://nicheworks.app/tools/sponsor-page-builder/), [app.js](../tools/sponsor-page-builder/app.js).

### A76. SQL DB Risk Checker — `sql-db-risk-checker`

- **Primary job / target:** SQLを実行する前に文字列として解析し、破壊的DDL、WHERE句のないUPDATE/DELETE、読み取り専用方針への違反など、DB事故につながりやすいパターンをブラウザ内で警告する。実DBへ接続したりSQLを実行・自動修正したりするツールではない。 Target situation: Developers reviewing SQL before execution.
- **Workflow:** Paste/select policy → analyze warnings → inspect spans.
- **Completion / usable output:** Identify supported destructive patterns and unknown limitations without executing SQL.
- **Required capabilities (existing or to verify):** Statement-aware detection, clear severity/evidence, no-execution boundary.
- **Failure/robustness:** Comments/strings; multiline; dialect differences; missing WHERE; empty/large SQL. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** DB connection, execution, auto-fix, certainty of safety.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Independent dialect/false-negative fixtures matter more than a green verdict label.
- **Evidence:** [SPEC](../tools/sql-db-risk-checker/SPEC.md), [docs/error contract](../docs/tools/sql-db-risk-checker.md), [HTML](../tools/sql-db-risk-checker/index.html), [public page](https://nicheworks.app/tools/sql-db-risk-checker/), [pro-bridge.js](../tools/sql-db-risk-checker/pro-bridge.js), [app-sdrc.js](../tools/sql-db-risk-checker/app-sdrc.js).

### A77. Sukima Baito Income — `sukima-baito-income`

- **Primary job / target:** タイミー、出前館、Uber Eats等を含むスキマバイト収入を1件ずつ記録し、月別・年間合計をブラウザ内で整理する。税務判断や確定申告判定ではなく、収入メモとCSV整理の補助を目的とする。 Target situation: Workers keeping a simple side-income ledger.
- **Workflow:** Add dated income → review month/year totals → export CSV.
- **Completion / usable output:** Retain accurate entries and reuse totals/CSV while knowing storage and tax limits.
- **Required capabilities (existing or to verify):** Numeric/date validation, durable entries, correction/delete clarity, valid export.
- **Failure/robustness:** Blank/negative amount; month/year boundary; reload; duplicate entry; Unicode label. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Tax determination, filing or bank integration.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Durability, CSV correctness and destructive actions need end-to-end evidence.
- **Evidence:** [SPEC](../tools/sukima-baito-income/SPEC.md), [docs/error contract](../docs/tools/sukima-baito-income.md), [HTML](../tools/sukima-baito-income/index.html), [public page](https://nicheworks.app/tools/sukima-baito-income/), [app.js](../tools/sukima-baito-income/app.js), [dom-fixes.js](../tools/sukima-baito-income/dom-fixes.js).

### A78. Tiny Audio Meter — `tiny-audio-meter`

- **Primary job / target:** ブラウザのマイク入力を使い、relative input level、単音に近いpitch/note、pitch confidence、spectrum、短区間傾向、baseline差、2秒ambient relative reference、numeric snapshot/CSV、そしてbefore/after比較時の取得条件を確認する。騒音計、法定測定器、業務用音響計、専用チューナーの代替ではない。 Target situation: Creators comparing microphone/input conditions.
- **Workflow:** Permit mic → inspect relative level/pitch/spectrum → capture/compare.
- **Completion / usable output:** Understand relative measurements and compare snapshots under disclosed acquisition conditions.
- **Required capabilities (existing or to verify):** Permission lifecycle, honest units/confidence, controllable capture, usable numeric outputs.
- **Failure/robustness:** Permission denial; silence; noise/polyphony; changed device/gain; stop/restart. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Calibrated SPL meter, professional tuner, recording service.
- **Confidence / uncertainty:** SC HIGH / IC LOW / PC LOW; UX GAP. Detailed measurement contract; actual device/audio behavior not exercised in this audit.
- **Evidence:** [SPEC](../tools/tiny-audio-meter/SPEC.md), [docs/error contract](../docs/tools/tiny-audio-meter.md), [HTML](../tools/tiny-audio-meter/index.html), [public page](https://nicheworks.app/tools/tiny-audio-meter/), [comparison.js](../tools/tiny-audio-meter/comparison.js), [app.js](../tools/tiny-audio-meter/app.js).

### A79. TrashNavi — `trashnavi`

- **Primary job / target:** 日本の自治体公式ごみ関連ページを、都道府県・市区町村・link type・keywordから探すためのdirectoryを提供する。ごみの分別可否をNicheWorks自身が判定したり、粗大ごみ申込みを代行したりするものではない。 Target situation: Residents finding their municipality's official waste guidance.
- **Workflow:** Choose prefecture/municipality/type or keyword → open official link.
- **Completion / usable output:** Reach the correct local authority page with link purpose and coverage clear.
- **Required capabilities (existing or to verify):** Municipality disambiguation, accurate official destinations, no-match/coverage status.
- **Failure/robustness:** Same-named places; missing locality; stale official URL; wrong link type. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Deciding disposal rules or submitting bookings.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Directory count is not coverage; verify common and underserved municipalities and stale links.
- **Evidence:** [SPEC](../tools/trashnavi/SPEC.md), [docs/error contract](../docs/tools/trashnavi.md), [HTML](../tools/trashnavi/index.html), [public page](https://nicheworks.app/tools/trashnavi/), [app.js](../tools/trashnavi/app.js).

### A80. UI Atlas — `ui-atlas`

- **Primary job / target:** 実務で使うUI patternを検索・比較し、用途、mobile適性、実装難易度、使い分け、AI prompt wording、implementation noteまで確認できるreference workspaceを提供する。 Target situation: Builders choosing an interface pattern.
- **Workflow:** Search → inspect details/examples → compare → copy guidance.
- **Completion / usable output:** Choose a fitting pattern with mobile/accessibility tradeoffs and actionable handoff.
- **Required capabilities (existing or to verify):** Search relevance, comparable criteria, readable examples, reusable notes.
- **Failure/robustness:** No match; long detail; narrow comparison; locked preview content. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Design editor, framework migration, catalog expansion for its own sake.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; UX GAP. Need rendered demo/comparison evidence and clear preview vs usable-content boundaries.
- **Evidence:** [SPEC](../tools/ui-atlas/SPEC.md), [docs/error contract](../docs/tools/ui-atlas.md), [HTML](../tools/ui-atlas/index.html), [public page](https://nicheworks.app/tools/ui-atlas/), [pro-bridge.js](../tools/ui-atlas/pro-bridge.js), [pro-samples.js](../tools/ui-atlas/pro-samples.js), [app.js](../tools/ui-atlas/app.js), [extended-catalog-final.js](../tools/ui-atlas/extended-catalog-final.js), [display-guard.js](../tools/ui-atlas/display-guard.js), [pro-preview-bridge.js](../tools/ui-atlas/pro-preview-bridge.js), [README](../tools/ui-atlas/README.md).

### A81. Unicode Kanji Checker — `unicode-kanji-checker`

- **Primary job / target:** 漢字、旧字体、異体字についてUnicode code point、HTML entity、UTF-16、旧字体対応、表示環境上の注意をbrowser内で確認するreference toolを提供する。 Target situation: Users investigating a glyph/encoding issue.
- **Workflow:** Enter text/character → inspect code points/entities/UTF-16.
- **Completion / usable output:** Reuse correct encoded values and understand glyph/environment limitations.
- **Required capabilities (existing or to verify):** Code-point-safe iteration, exact values, unknown/multi-character behavior, copy.
- **Failure/robustness:** Surrogate pairs; combining sequences; variation selectors; emoji; long text. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Font guarantee, character normalization without review.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; OPEN. Runtime tests support samples; complex grapheme behavior and copy need fuller validation.
- **Evidence:** [SPEC](../tools/unicode-kanji-checker/SPEC.md), [docs/error contract](../docs/tools/unicode-kanji-checker.md), [HTML](../tools/unicode-kanji-checker/index.html), [public page](https://nicheworks.app/tools/unicode-kanji-checker/), [app.js](../tools/unicode-kanji-checker/app.js), [test example](../tools/unicode-kanji-checker/tests/behavior.test.mjs).

### A82. UnitMaster — `unitmaster`

- **Primary job / target:** 長さ、重さ、温度、体積、面積、速度、圧力の代表的な単位を相互変換し、複数候補への一括換算や最近の換算履歴をbrowser内で確認できるutilityを提供する。 Target situation: Users converting everyday physical units.
- **Workflow:** Choose category/units → enter value → inspect single/batch conversion.
- **Completion / usable output:** Reuse a numerically correct value with clear units and suitable precision.
- **Required capabilities (existing or to verify):** Correct factors/offsets, validation, consistent inverse conversion, readable units.
- **Failure/robustness:** Negative temperature; zero; extreme values; decimals; same unit; locale input. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Scientific metrology or exhaustive unit database.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Independent factor/rounding/boundary examples needed; history is not a quality metric.
- **Evidence:** [SPEC](../tools/unitmaster/SPEC.md), [docs/error contract](../docs/tools/unitmaster.md), [HTML](../tools/unitmaster/index.html), [public page](https://nicheworks.app/tools/unitmaster/), [runtime-units-adapter.js](../tools/unitmaster/runtime-units-adapter.js), [app-json-runtime.js](../tools/unitmaster/app-json-runtime.js).

### A83. URL Title Collector — `url-title-collector`

- **Primary job / target:** 複数URLを1行ずつ入力し、各target pageのHTMLから`<title>`を取得してURL / title / status一覧を作り、CSVまたはTSVとしてcopyできるcollectorを提供する。 Target situation: People building a titled reference list from URLs.
- **Workflow:** Paste one per line → collect → inspect statuses → copy CSV/TSV.
- **Completion / usable output:** Reuse a list preserving URL identity and each success/failure, with safely serialized titles.
- **Required capabilities (existing or to verify):** Per-row status, progress/cancellation behavior, correct CSV/TSV, disclosed fetch route.
- **Failure/robustness:** Invalid/duplicate URLs; timeout; empty/comma/newline title; many URLs; repeat. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Crawler, authenticated browsing, backend bookmark service.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; OPEN. Bounded concurrency/timeout and copy round-trip must be specified and tested.
- **Evidence:** [SPEC](../tools/url-title-collector/SPEC.md), [docs/error contract](../docs/tools/url-title-collector.md), [HTML](../tools/url-title-collector/index.html), [public page](https://nicheworks.app/tools/url-title-collector/), [app.js](../tools/url-title-collector/app.js).

### A84. Variant Kanji Compare — `variant-kanji-compare`

- **Primary job / target:** 見た目が近い漢字、旧字体、異体字を並べ、glyph、Unicode、HTML entity、UTF-16、旧新対応、画数・字形note、表示環境上の注意を比較するreference toolを提供する。 Target situation: Readers comparing visually similar characters.
- **Workflow:** Enter/select characters → inspect side-by-side glyph/encoding/reference.
- **Completion / usable output:** Distinguish identity/mapping while understanding that fonts can alter visual appearance.
- **Required capabilities (existing or to verify):** Accurate per-character metadata, useful comparison, unknowns, copy.
- **Failure/robustness:** Identical entries; supplementary forms; variation selectors; missing glyphs. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Official-name adjudication or universal glyph rendering.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; OPEN. Tests support samples; actual font and narrow comparison behavior still unverified.
- **Evidence:** [SPEC](../tools/variant-kanji-compare/SPEC.md), [docs/error contract](../docs/tools/variant-kanji-compare.md), [HTML](../tools/variant-kanji-compare/index.html), [public page](https://nicheworks.app/tools/variant-kanji-compare/), [app.js](../tools/variant-kanji-compare/app.js), [test example](../tools/variant-kanji-compare/tests/behavior.test.mjs).

### A85. Vibe Lexicon — `vibe-lexicon`

- **Primary job / target:** 「modern」「洗練」「trustworthy」等の曖昧なvibe wordingを、AI-assisted workで使いやすい実務的な意図・依頼文へ分解し、似た語の比較やcopy-ready draftを作るreference catalogを提供する。 Target situation: People making vague creative requests more precise.
- **Workflow:** Search vibe term → compare related terms → copy practical wording.
- **Completion / usable output:** Reuse wording that clarifies desired effect and avoids confusing similar terms.
- **Required capabilities (existing or to verify):** Search aliases, meaningful distinctions, editable/copyable draft.
- **Failure/robustness:** Ambiguous terms; no match; mixed language; long combination. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** AI prompt execution, aesthetic guarantees, limitless vocabulary.
- **Confidence / uncertainty:** SC MEDIUM / IC LOW / PC LOW; UX GAP. Measure distinctions and copy usefulness on real requests rather than term count.
- **Evidence:** [SPEC](../tools/vibe-lexicon/SPEC.md), [docs/error contract](../docs/tools/vibe-lexicon.md), [HTML](../tools/vibe-lexicon/index.html), [public page](https://nicheworks.app/tools/vibe-lexicon/), [app.js](../tools/vibe-lexicon/app.js), [README](../tools/vibe-lexicon/README.md).

### A86. WeatherDiff — `weatherdiff`

- **Primary job / target:** 日本国内の地点についてOpen-MeteoとMET Norwayの予報を並べ、今日・明日の気温、降水、風とAPI間の差分を参考比較する。防災・避難・警報・交通・業務上の意思決定を行うtoolではない。 Target situation: People comparing two ordinary weather forecasts in Japan.
- **Workflow:** Choose location → fetch both sources → inspect today/tomorrow differences.
- **Completion / usable output:** Compare like-for-like times/units and recognize missing, stale or divergent sources.
- **Required capabilities (existing or to verify):** Location/time alignment, source labels, partial-failure states, clear limits.
- **Failure/robustness:** One/both APIs fail; timezone/date boundary; missing hours; repeated location. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Warnings, evacuation guidance, professional weather decisions.
- **Confidence / uncertainty:** SC MEDIUM / IC MEDIUM / PC MEDIUM; OPEN. Live API/time alignment and stale-response handling remain unverified.
- **Evidence:** [SPEC](../tools/weatherdiff/SPEC.md), [docs/error contract](../docs/tools/weatherdiff.md), [HTML](../tools/weatherdiff/index.html), [public page](https://nicheworks.app/tools/weatherdiff/), [app.js](../tools/weatherdiff/app.js), [test example](../tools/weatherdiff/tests/behavior.test.mjs).

### A87. WebP AVIF Converter — `webp-avif-converter`

- **Primary job / target:** WebPまたはAVIF画像をbrowser native decodeとCanvasでPNGまたはJPEGへ1枚ずつ変換し、previewしてdownloadできるlocal image utilityを提供する。 Target situation: Users needing a shareable PNG/JPEG from WebP/AVIF.
- **Workflow:** Choose one file → select output → preview → download.
- **Completion / usable output:** Open a valid intended-format image with acceptable dimensions/alpha handling.
- **Required capabilities (existing or to verify):** Native-decode support feedback, correct encoding, preview/download agreement.
- **Failure/robustness:** Unsupported AVIF; corrupt file; alpha to JPEG; large dimensions; reselect. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Batch media suite or guaranteed universal codec support.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; UX GAP. Behavior fixtures passed; actual codec/browser export matrix remains unverified.
- **Evidence:** [SPEC](../tools/webp-avif-converter/SPEC.md), [docs/error contract](../docs/tools/webp-avif-converter.md), [HTML](../tools/webp-avif-converter/index.html), [public page](https://nicheworks.app/tools/webp-avif-converter/), [app.js](../tools/webp-avif-converter/app.js), [test example](../tools/webp-avif-converter/tests/behavior.test.mjs).

### A88. Wi-Fi Meter — `wifi-meter`

- **Primary job / target:** browserのNetwork Information APIが提供する推定RTTと推定downlinkを定期的に読み、Wi-Fiや回線の通信状態の変化を簡易表示する。Wi-Fi電波強度、RSSI、実ping、実speed testを測定するtoolではない。 Target situation: Users observing browser-reported connection changes.
- **Workflow:** Start/read estimates → inspect trend/unsupported state.
- **Completion / usable output:** Understand available estimated RTT/downlink and their limitations without mistaking them for measured speed/RSSI.
- **Required capabilities (existing or to verify):** Feature detection, honest units/labels, readable updates, stop/restart.
- **Failure/robustness:** Unsupported API; null/constant estimates; network change; background tab. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.
- **Non-goals:** Real speed test, ping, RSSI, packet-loss measurement.
- **Confidence / uncertainty:** SC HIGH / IC MEDIUM / PC MEDIUM; UX GAP. Good scope boundary; real network/device variability and unsupported-browser UX need validation.
- **Evidence:** [SPEC](../tools/wifi-meter/SPEC.md), [docs/error contract](../docs/tools/wifi-meter.md), [HTML](../tools/wifi-meter/index.html), [public page](https://nicheworks.app/tools/wifi-meter/), [app.js](../tools/wifi-meter/app.js), [test example](../tools/wifi-meter/tests/behavior.test.mjs).

## Appendix B. Reproduction and final scope

At the recorded checkout, read `tools/tools-index.json` and count `items` and distinct `slug` values. Verify each `tools/<slug>/index.html`, `tools/<slug>/SPEC.md`, and `docs/tools/<slug>.md`; classify tests by assertions, not filename alone. Execute the read-only commands in section 7. They passed during this audit but do not supersede the observed failures.

For F01, inspect `tools/ai-interaction-atlas/pro-bridge.js` around the root dataset assignment and `[data-pro-status]` loop. For F02, inspect `tools/outsource-spec-generator/pro-bridge.js` functions `setText` and `publish`. Both add `data-pro-status` to `document.documentElement` before a selector writes status text to that same element. Open the public pages in ordinary free mode to reproduce the observed missing interface. The source mechanism is deterministic without requiring activation of Pro.

For F03, inspect `tools/mini-game-utility/app.js` score creation and CSV handler. A stored entry with name `Team, "A"`, score `12`, and timestamp `9/16/2026, 7:01:00 PM` is interpolated as `Team, "A",12,9/16/2026, 7:01:00 PM`; that is not three preserved CSV fields. The spec's “not spreadsheet-grade quoting” caveat does not change the completion requirement.

For F04, inspect `tools/metadatasnap/app.js` metadata extraction and `resOgp.src = state.ogImage`. A fetched source page declaring `/images/preview.png` has no source-base resolution step before the tool assigns the value to its own document image. This is source-confirmed, not a live proxy-fixture test. The next wave should confirm the exact downstream behavior with a controlled public fixture.

For F05, compare the named public labels/containers with common-spec sections 1/1.1 and the placeholder matching in `scripts/check-adsense-review-surface.mjs`. Pattern Dictionary's visible/accessible empty ad regions also need the new no-placeholder rule; the old generic ad-top obligation does not authorize them.

**Repository changes for this wave:** `docs/astra-product-quality-baseline.md` and `.agent/plans/astra-product-quality-baseline.md` only, both newly added and uncommitted. No tracked implementation files changed. `git diff` alone excludes untracked additions; final verification must inspect `git status --short` and include the two new files in the summary. Branch and HEAD remain unchanged. Audit stops here.

## Recovery Addendum — 2026-09-17

The audit was interrupted by session/capacity limits. All 88 inventory records and all 88 Appendix A job cards were recovered; the report and recovered evidence were validated without rerunning the product audit.

Two UNKNOWN-origin tracked anomalies were found during recovery. Exact states, hashes, attribution limits and reconstruction details are preserved in [.agent/evidence/astra-product-quality-baseline/RECOVERY.md](../.agent/evidence/astra-product-quality-baseline/RECOVERY.md) and [.agent/evidence/astra-product-quality-baseline/ANOMALIES.md](../.agent/evidence/astra-product-quality-baseline/ANOMALIES.md).

The original statement that no tracked implementation files changed describes the original audit's recorded claim; it does not describe the later recovered working tree. No causation is asserted. The two tracked paths were restored to their exact state at baseline HEAD `59c95840bdff50cb2660eda12605d0ee1b071dc2` before the preservation commit, with equality and validity verified. No product-quality fixes are included.

The originally requested phase was referred to as Wave 0; the recovered report title says Wave 1. No substantive finding depends on that label. The 13 existing report sections and original findings are unchanged. RECOVERY.md hashes for the report describe its pre-addendum version; the seven copied evidence artifacts retain their recorded hashes. The next product-quality wave and all pilot implementation remain excluded.
