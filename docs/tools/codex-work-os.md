# Codex Work OS — canonical tool specification

- **Slug:** `codex-work-os`
- **Display name (JA):** Codex作業OS
- **Display name (EN):** Codex Work OS
- **Implementation:** `tools/codex-work-os/`
- **Registry state:** active (registered implementation present)
- **Category:** codex, workflow, tasks, release
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `codex-work-os` implementation at `/tools/codex-work-os/`. It does not authorize a production rewrite.

## 2. Purpose

Explain the codex-work-os repository: a skills-first operating layer for turning messy sales, project-management, executive-support, research, and customer-support inputs into structured draft artifacts for human review.

## 3. Inputs

None beyond normal documentation navigation. The NicheWorks page itself is a read-only repository guide.

## 4. Processing behavior

- Explain the five core packs: sales-pack, pm-pack, exec-assist-pack, research-pack, and cs-pack.
- Describe the supporting repository layers for flows, gates, artifacts, shared references, install helpers, and validation scripts.
- Explain that the repository is skills-first rather than one linear playbook pipeline.
- Present the cross-pack `pilot-rollout` example and the intended human-review operating model.
- Link to the public GitHub repository.
- State clearly that outputs remain drafts and do not replace human, legal, security, customer-support, or management review.
- Provide English and Japanese guide pages.

## 5. Outputs

- Documentation describing the pack architecture, workflow layers, and worked scenario.
- Navigation to the public codex-work-os repository.
- English and Japanese explanatory pages.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty/invalid input:** Not applicable because the current contract has no operational user input.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

The NicheWorks guide does not accept or upload business notes, customer data, or repository content. GitHub navigation leaves NicheWorks and is governed by GitHub's own behavior. Suite-wide analytics and advertising may load on the guide page.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The page is documentation-focused, with summary/card layouts on wide screens and readable long-form sections on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The canonical root is English and `/ja/` provides the Japanese counterpart.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/codex-work-os/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] The guide identifies all five current domain packs and explains the supporting flows/gates/artifacts architecture.
- [ ] The public GitHub repository is reachable from the page and the `pilot-rollout` example is presented as a worked scenario.
- [ ] English and Japanese guides retain the same draft-only and human-review boundaries.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/codex-work-os/index.html`
- `tools/codex-work-os/style.css`
