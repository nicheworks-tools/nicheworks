# Codex Product Shipping Playbooks — canonical tool specification

- **Slug:** `codex-product-shipping-playbooks`
- **Display name (JA):** Codex開発出荷プレイブック
- **Display name (EN):** Codex Product Shipping Playbooks
- **Implementation:** `tools/codex-product-shipping-playbooks/`
- **Registry state:** active (registered implementation present)
- **Category:** codex, shipping, playbook, product
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `codex-product-shipping-playbooks` implementation at `/tools/codex-product-shipping-playbooks/`. It does not authorize a production rewrite.

## 2. Purpose

Explain a repository-first set of reusable playbooks for taking Codex-assisted software changes from repository intake through specification delta, implementation planning, acceptance, shipping checks, release writing, diff review, and retrospective.

## 3. Inputs

None beyond page navigation and links. This NicheWorks page is a read-only guide to a separate repository.

## 4. Processing behavior

- Present the ordered workflow path: intake-repo, spec-delta, plan-change, define-acceptance, ship-check, write-release-artifacts, review-diff, and post-ship-retro.
- Explain the repository layers for playbooks, artifacts, gates, flows, and examples.
- Provide a worked synthetic `filter-persistence` example rather than presenting copied production material.
- Link users to the public repository and explain how to consume it as a workflow guide.
- State explicitly that the material does not replace tests, code review, security review, release ownership, legal review, or human release judgment.
- Provide equivalent English and Japanese guide pages.

## 5. Outputs

- Workflow documentation and release-process reference material.
- Navigation to the public GitHub repository.
- English and Japanese explanatory pages.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty, invalid, unsupported, or over-limit input:** Not applicable because the current implementation has no operational user-input workflow.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/codex-product-shipping-playbooks/index.html`, `tools/codex-product-shipping-playbooks/ja/index.html`.

## 7. Privacy/data handling

No project source code or release material is submitted through the NicheWorks guide. Following the GitHub link navigates to GitHub. Suite-wide advertising and analytics may load on the guide page.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The tool is long-form documentation with wide summary cards but remains fully readable on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The root page is English and `/ja/` is the Japanese counterpart.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/codex-product-shipping-playbooks/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] The guide presents the complete current issue-to-release workflow path in the documented order.
- [ ] Users can reach the public repository and understand the roles of playbooks, artifacts, gates, flows, and examples.
- [ ] English and Japanese pages retain the same core scope and the same human-review/release-safety disclaimer.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/codex-product-shipping-playbooks/index.html`
- `tools/codex-product-shipping-playbooks/style.css`
