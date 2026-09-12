# Command Safety Checker — canonical tool specification

- **Slug:** `command-safety-checker`
- **Display name (JA):** コマンド安全確認ツール
- **Display name (EN):** Command Safety Checker
- **Implementation:** `tools/command-safety-checker/`
- **Registry state:** active (registered implementation present)
- **Category:** command, shell, safety, terminal
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `command-safety-checker` implementation at `/tools/command-safety-checker/`. It does not authorize a production rewrite.

## 2. Purpose

Help users inspect AI-generated shell or PowerShell commands before execution by detecting destructive, remote-execution, privilege, disk, and possible secret-exposure patterns in the browser.

## 3. Inputs

- OS mode: Unix-style shell or PowerShell.
- One or more command lines.
- UI language selection.
- Current live runtime: legacy shared NicheWorks Pro entitlement state for the paid review/export surface.

## 4. Processing behavior

- Accept multi-line command text and an OS mode for Linux/macOS shell or Windows PowerShell.
- Detect implemented risky patterns including destructive deletion, remote script execution, privilege escalation, disk operations, selected PowerShell hazards, environment/private-key exposure, and data-exfiltration-like command patterns.
- Return risk level, category, reason, verification guidance, and safer-alternative guidance for findings.
- Keep the free checker usable without Pro.
- With the current live legacy NicheWorks Pro gate active, generate review-oriented deliverables including review Markdown, Codex safety-check task text, GitHub Issue draft, and JSON/Markdown exports.
- Provide JP/EN UI and explicit wording that a finding/result does not certify command safety.

## 5. Outputs

- Risk summary and categorized findings.
- Reasons, verification steps, and safer/dry-run alternatives where implemented.
- Pro-only review report, Codex task, GitHub Issue draft, JSON, and Markdown outputs.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/command-safety-checker/app-core.js`, `tools/command-safety-checker/app.js`, `tools/command-safety-checker/howto/en/index.html`, `tools/command-safety-checker/howto/index.html`, `tools/command-safety-checker/index.html`.

## 7. Privacy/data handling

Risk matching runs locally in the browser and the pasted command is not intentionally submitted to an application backend by this checker. Suite-wide analytics, advertising, Cloudflare resources, and current legacy shared Pro resources may load independently.

The staged product-scoped controller handles fixed entitlement metadata only. Command text, normalized command content, findings, review Markdown, Codex task content, GitHub Issue content, and export payloads must not be added to billing or entitlement requests.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Large code input and review output benefit from desktop width, while the primary command-check flow remains operable on a narrow layout.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same checker interface and warnings.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/command-safety-checker/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/command-safety-checker/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] A supported risky Unix or PowerShell sample produces a finding with risk/category/reason guidance rather than executing the command.
- [ ] Empty or benign input does not imply a cryptographic or formal safety guarantee.
- [ ] Free checking remains available when Pro is inactive; Pro-only review/export actions remain gated.
- [ ] JP/EN modes preserve the same detection behavior and safety disclaimer.
- [ ] Product-scoped migration does not move the current risk checker behind a paid gate.
- [ ] The staged controller represents all five paid operations exactly once and fails closed without authoritative server verification.
- [ ] The staged controller remains disconnected from the public runtime until commercial configuration and migration are explicitly authorized.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/command-safety-checker/index.html`
- `tools/command-safety-checker/app-core.js`
- `tools/command-safety-checker/app.js`
- `tools/command-safety-checker/style.css`
- `tools/command-safety-checker/usage.html`
