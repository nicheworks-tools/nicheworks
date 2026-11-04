import json,pathlib,re,collections
ROOT=pathlib.Path('/workspace/scratch/0490b207d766/nicheworks')
rows=json.load(open('/workspace/scratch/0490b207d766/audit-index.json'))
obs={x['slug']:x for x in json.load(open('/workspace/scratch/0490b207d766/browser-observations.json'))}
contracts={p[0].strip():p[1:] for p in [l.strip().split('|') for l in open('/workspace/scratch/0490b207d766/contracts.tsv') if l.strip()]}
guides=set('ai-project-pack codex-product-shipping-playbooks codex-work-os product-founder-os release-guardian'.split())
high=guides|set('construction-tools-atlas cosmetic-ingredient-checker-lite inci-fastscan laundry-code-decode manual-finder phone-quickcheck size-converter reconcile tiny-audio-meter wifi-meter webp-avif-converter money-template-checker'.split())
low=set('pattern-dictionary mini-game-utility logistics-compliance-kit-jp'.split())
behavior={r['slug'] for r in rows if any(p.endswith('/tests/behavior.test.mjs') for p in r['tests'])}
medium_evidence=behavior|guides
blockers={'ai-interaction-atlas','outsource-spec-generator'}
core={'mini-game-utility','metadatasnap'}
ux=set('color-replace contract-cleaner filetype-sniffer light-check kanji-modernizer motion-atlas pattern-dictionary pattern-atlas tiny-audio-meter ui-atlas wifi-meter webp-avif-converter vibe-lexicon earth-map-suite'.split())
promising={'linebreak-doctor','csv-tidy','manual-finder'}
assert len(high)==17 and len(low)==3 and len(behavior)==19 and len(medium_evidence)==24 and len(ux)==14

def sc(s):return 'HIGH' if s in high else 'LOW' if s in low else 'MEDIUM'
def cf(s):return 'MEDIUM' if s in medium_evidence else 'LOW'
def disp(s):return 'BLOCKER' if s in blockers else 'CORE GAP' if s in core else 'UX GAP' if s in ux else 'SAMPLE' if s in promising else 'OPEN'
def test(s,r):return 'B+S' if s in behavior else 'L+S' if s in {'reconcile','pattern-dictionary'} else 'S'
def link(p):return '['+p+'](../'+p+')'
def plain(s):return re.sub(r'\s+',' ',s).replace('|','/').strip()
head='''# NicheWorks product-quality baseline — Wave 1

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
'''
lines=[head]
for r in rows:
 s=r['slug']; c=contracts[s]; live='X' if s in blockers else 'W' if s in promising|{'mini-game-utility'} else 'R'
 # Workflow is the shortest concrete formulation of the job; full completion contract follows.
 lines.append(f"| {plain(r['name'])} | [{s}](../tools/{s}/) | Y/Y/Y | {test(s,r)} | {live} | {plain(c[1])} | {sc(s)} | {cf(s)} | {cf(s)} | {disp(s)} |\n")
lines.append('''
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

- **LineBreak Doctor:** empty Format gives “Please enter text to format.” Input `  Hello 👋\\n\\n\\n世界  \\nSecond line` produced five platform results. X clipboard text was `Hello 👋\\n世界\\nSecond line`; switching to plain-text policy and copying Instagram yielded `Hello 👋\\n\\n世界\\nSecond line`. Japanese language switching retained the input/generated results. This is actual clipboard verification, not just a “copied” label. Actual social-platform posting was not tested.
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

''')
for n,r in enumerate(rows,1):
 s=r['slug']; target,workflow,done,cap,fail,non,gap=contracts[s]
 # Purpose first paragraph; retain source spelling but omit internal headings.
 purpose=r['sections'].get('Purpose','').split('\n\n')[0]
 conf=f"SC {sc(s)} / IC {cf(s)} / PC {cf(s)}; {disp(s)}"
 evidence=[f'[SPEC](../tools/{s}/SPEC.md)',f'[docs/error contract](../docs/tools/{s}.md)',f'[HTML](../tools/{s}/index.html)',f'[public page](https://nicheworks.app/tools/{s}/)']
 rt=r['runtime']
 for p in rt:
  if p.startswith('tools/'+s+'/') and not any(x in p for x in ['/data/','affiliate','vendor/']): evidence.append(f'[{pathlib.Path(p).name}](../{p})')
 # Keep runtime references to first six to avoid long catalogs, but capture status bridges.
 evidence=evidence[:10]
 tests=r['tests'] if s!='api-key-token-redactor' else []
 if tests:
  p=next((x for x in tests if x.endswith('/behavior.test.mjs')),tests[0]);evidence.append(f'[test example](../{p})')
 doc_readme=next((p for p in r['docs'] if p.endswith('/README.md')),None)
 if doc_readme:evidence.append(f'[README](../{doc_readme})')
 lines.append(f"### A{n:02d}. {r['name']} — `{s}`\n\n")
 lines.append(f"- **Primary job / target:** {plain(purpose)} Target situation: {target}.\n")
 lines.append(f"- **Workflow:** {workflow}.\n")
 lines.append(f"- **Completion / usable output:** {done}.\n")
 lines.append(f"- **Required capabilities (existing or to verify):** {cap}.\n")
 lines.append(f"- **Failure/robustness:** {fail}. Exact outcomes not observed in this wave remain unverified; see the linked error contract and section 7 for actually executed cases.\n")
 lines.append(f"- **Non-goals:** {non}.\n")
 lines.append(f"- **Confidence / uncertainty:** {conf}. {gap}.\n")
 lines.append('- **Evidence:** '+', '.join(evidence)+'.\n\n')
lines.append('''## Appendix B. Reproduction and final scope

At the recorded checkout, read `tools/tools-index.json` and count `items` and distinct `slug` values. Verify each `tools/<slug>/index.html`, `tools/<slug>/SPEC.md`, and `docs/tools/<slug>.md`; classify tests by assertions, not filename alone. Execute the read-only commands in section 7. They passed during this audit but do not supersede the observed failures.

For F01, inspect `tools/ai-interaction-atlas/pro-bridge.js` around the root dataset assignment and `[data-pro-status]` loop. For F02, inspect `tools/outsource-spec-generator/pro-bridge.js` functions `setText` and `publish`. Both add `data-pro-status` to `document.documentElement` before a selector writes status text to that same element. Open the public pages in ordinary free mode to reproduce the observed missing interface. The source mechanism is deterministic without requiring activation of Pro.

For F03, inspect `tools/mini-game-utility/app.js` score creation and CSV handler. A stored entry with name `Team, "A"`, score `12`, and timestamp `9/16/2026, 7:01:00 PM` is interpolated as `Team, "A",12,9/16/2026, 7:01:00 PM`; that is not three preserved CSV fields. The spec's “not spreadsheet-grade quoting” caveat does not change the completion requirement.

For F04, inspect `tools/metadatasnap/app.js` metadata extraction and `resOgp.src = state.ogImage`. A fetched source page declaring `/images/preview.png` has no source-base resolution step before the tool assigns the value to its own document image. This is source-confirmed, not a live proxy-fixture test. The next wave should confirm the exact downstream behavior with a controlled public fixture.

For F05, compare the named public labels/containers with common-spec sections 1/1.1 and the placeholder matching in `scripts/check-adsense-review-surface.mjs`. Pattern Dictionary's visible/accessible empty ad regions also need the new no-placeholder rule; the old generic ad-top obligation does not authorize them.

**Repository changes for this wave:** `docs/astra-product-quality-baseline.md` and `.agent/plans/astra-product-quality-baseline.md` only, both newly added and uncommitted. No tracked implementation files changed. `git diff` alone excludes untracked additions; final verification must inspect `git status --short` and include the two new files in the summary. Branch and HEAD remain unchanged. Audit stops here.
''')
out=ROOT/'docs/astra-product-quality-baseline.md';out.write_text(''.join(lines))
print('report',out,'lines',len(out.read_text().splitlines()),'bytes',out.stat().st_size)
print('spec',collections.Counter(sc(r['slug']) for r in rows))
print('confidence',collections.Counter(cf(r['slug']) for r in rows))
print('disposition',collections.Counter(disp(r['slug']) for r in rows))
