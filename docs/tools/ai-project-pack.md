# AI Project Pack — canonical tool specification

- **Slug:** `ai-project-pack`
- **Display name (JA):** AIプロジェクトパック
- **Display name (EN):** AI Project Pack
- **Implementation:** `tools/ai-project-pack/`
- **Registry state:** active (registered implementation present)
- **Category:** ai, project, handoff, docs
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `ai-project-pack` implementation at `/tools/ai-project-pack/`. It does not authorize a production rewrite.

## 2. Purpose

Explain and distribute the AI Project Pack repository workflow: a single-repository operating pack that keeps project truth, decisions, unresolved items, next actions, sources, and append-only update logs in one AI-readable place.

## 3. Inputs

None beyond normal page navigation and links. The public NicheWorks page is a read-only guide and does not edit a project pack repository.

## 4. Processing behavior

- Present the repository-first operating model and explain that the repository, not this page, is the primary product.
- Describe the core files and reading order for current truth, decisions, pending items, next actions, sources, examples, playbooks, adapters, and updates.
- Define the first-use loop as report-only review, one bounded safe update, and an appended update log.
- Link to the public GitHub repository and explain supported use with ChatGPT, Claude, Codex, and similar repository-reading AI tools.
- Provide equivalent English and Japanese explanatory page families.

## 5. Outputs

- Explanatory documentation, workflow steps, FAQ, and navigation to the external GitHub repository.
- Language-specific guide pages.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

The NicheWorks guide page does not collect project-pack content. Opening GitHub transfers navigation to GitHub, where GitHub's own terms and network behavior apply. Suite-wide analytics and advertising may load on the NicheWorks page.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The experience is documentation-first and remains usable on narrow screens while taking advantage of wider layouts for summary cards and long-form sections.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The root page is English and `/ja/` contains the Japanese guide.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/ai-project-pack/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] The page clearly states that the repository is the core product and describes the report-only → bounded safe-update → update-log loop.
- [ ] Users can reach the public AI Project Pack GitHub repository from the guide.
- [ ] English and Japanese pages communicate the same repository operating model without implying autonomous project management.

Automated test evidence: `tools/ai-project-pack/test`.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/ai-project-pack/index.html`
- `tools/ai-project-pack/style.css`
