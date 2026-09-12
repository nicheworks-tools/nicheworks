# Product Founder OS — canonical tool specification

- **Slug:** `product-founder-os`
- **Display name (JA):** 個人開発者OS
- **Display name (EN):** Product Founder OS
- **Implementation:** `tools/product-founder-os/`
- **Registry state:** active (registered implementation present)
- **Category:** product, founder, startup, workflow
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `product-founder-os` implementation at `/tools/product-founder-os/`. It does not authorize a production rewrite.

## 2. Purpose

Document and link to the Product Founder OS repository asset for structuring multi-session product work with GPT and/or Codex.

## 3. Inputs

No interactive product-definition input is accepted by the NicheWorks page. Users navigate the documentation and external GitHub repository.

## 4. Processing behavior

- Explain the repository's discover → define → plan → build → adjust → ship operating model.
- Describe source-of-truth product documents such as project seed, product brief, functional spec, roadmap, backlog, current sprint, change requests, and done definition.
- Describe included repository instructions, docs, examples, templates, helper scripts, and validation utilities.
- Explain the bootstrap helper as a starter-document generator rather than a finished-product generator.
- Link users to the external public GitHub repository.
- Provide separate English and Japanese explanatory pages.
- Act as documentation/reference; the NicheWorks page itself does not run the repository workflow against a user project.

## 5. Outputs

- Product Founder OS workflow documentation.
- Usage guidance and FAQ.
- Links to the external GitHub repository and support options.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

The page is informational. Following GitHub/support links navigates to external services subject to their own policies. Ads/analytics may load on the NicheWorks page. No user product content is collected by this page's workflow because it has no product-input form.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The site is long-form repository documentation designed to remain readable across desktop and mobile widths.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The English root and `/ja/` page are separate public language surfaces.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/product-founder-os/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] The page clearly positions Product Founder OS as a repository operating system rather than a hosted interactive generator.
- [ ] Bootstrap/helper-script descriptions do not claim that they create a finished product automatically.
- [ ] English and Japanese public pages link to the same external repository asset.
- [ ] The page does not imply that NicheWorks stores or manages a user's product/project state.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/product-founder-os/index.html`
- `tools/product-founder-os/style.css`
