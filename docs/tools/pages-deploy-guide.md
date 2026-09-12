# Pages Deploy Guide — canonical tool specification

- **Slug:** `pages-deploy-guide`
- **Display name (JA):** Pages公開ガイド
- **Display name (EN):** Pages Deploy Guide
- **Implementation:** `tools/pages-deploy-guide/`
- **Registry state:** active (registered implementation present)
- **Category:** pages, deploy, cloudflare, guide
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `pages-deploy-guide` implementation at `/tools/pages-deploy-guide/`. It does not authorize a production rewrite.

## 2. Purpose

Generate a pre-deploy checklist for Cloudflare Pages or GitHub Pages and, when shared NicheWorks Pro is active, provide a symptom diagnosis tree and deployment handoff pack.

## 3. Inputs

- Platform: Cloudflare Pages or GitHub Pages.
- Source type: repository/folder or static/build output.
- Custom domain yes/no.
- Output directory: root, `dist`, `public`, or `docs`.
- Shared NicheWorks Pro state when using Pro outputs.
- JP/EN display language.

## 4. Processing behavior

- Accept platform, source type, custom-domain presence, and output-directory choice.
- Generate a free pre-deploy checklist covering build/output settings, deployment visibility, assets, 404 behavior, canonical/OGP, crawl files, analytics/ads identifiers, mobile checks, and platform-specific concerns.
- Generate a free common-errors list and allow the combined free result to be copied.
- Pro mode adds a symptom-based diagnosis tree, deployment handoff pack, Pro copy, and Markdown download.
- Pro access is authorized by the shared NicheWorks Pro browser entitlement and requires the expected `nicheworks_pro` entitlement.
- The legacy `NW-PDG-...` browser-checksum code is no longer an authoritative purchase/unlock mechanism; the compatibility adapter only supplies the old app state when shared Pro is already active and removes that temporary compatibility state after initialization.
- The page links to the shared Stripe purchase and `/pro/unlock/` flows.
- Store JP/EN display language in `nw_lang`.

## 5. Outputs

- Free deployment checklist.
- Free common-error guidance.
- Free combined clipboard output.
- Pro diagnosis tree and deployment handoff pack.
- Pro Markdown file.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Invalid or unsupported input:** The implementation has no separate unsupported-input mode beyond its current controls and validation path; that observed path is canonical.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/pages-deploy-guide/app.js`, `tools/pages-deploy-guide/index.html`.

## 7. Privacy/data handling

Checklist generation runs in the browser. The form does not inspect or fetch a repository/deployment. Shared Pro state uses the common NicheWorks Pro client/status contract; advertising/analytics and external purchase/support links can communicate independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The main interaction is four compact selectors followed by free and optional Pro text outputs.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The implemented `bilingual single-page` mode above is the canonical language behavior; repository HTML/JavaScript establishes the switching or page-separation mechanism.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/pages-deploy-guide/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Each supported platform/source/domain/output selection produces an appropriate free checklist and common-error list without contacting the hosting platform.
- [ ] Free copy remains available without Pro.
- [ ] Pro diagnosis/handoff/copy/Markdown actions require active shared `nicheworks_pro`; a legacy `NW-PDG-...` code or `pdg_pro_key` alone cannot unlock them.
- [ ] Another product-scoped entitlement does not unlock Pages Deploy Guide Pro.
- [ ] The UI does not imply that checklist completion verifies a real deployment.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/pages-deploy-guide/index.html`
- `tools/pages-deploy-guide/app.js`
- `tools/pages-deploy-guide/style.css`
