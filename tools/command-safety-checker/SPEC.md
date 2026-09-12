# Tool Specification — Command Safety Checker

- Slug: `command-safety-checker`
- Public URL: `https://nicheworks.app/tools/command-safety-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Help users inspect AI-generated shell or PowerShell commands before execution by detecting destructive, remote-execution, privilege, disk, and possible secret-exposure patterns in the browser.

## Current functional contract

- Accept multi-line command text and an OS mode for Linux/macOS shell or Windows PowerShell.
- Detect implemented risky patterns including destructive deletion, remote script execution, privilege escalation, disk operations, selected PowerShell hazards, environment/private-key exposure, and data-exfiltration-like command patterns.
- Return risk level, category, reason, verification guidance, and safer-alternative guidance for findings.
- Keep the free checker usable without Pro.
- With the current live legacy NicheWorks Pro gate active, generate review-oriented deliverables including review Markdown, Codex safety-check task text, GitHub Issue draft, and JSON/Markdown exports.
- Provide JP/EN UI and explicit wording that a finding/result does not certify command safety.

## Inputs

- OS mode: Unix-style shell or PowerShell.
- One or more command lines.
- UI language selection.
- Current live runtime: legacy shared NicheWorks Pro entitlement state for the paid review/export surface.

## Outputs

- Risk summary and categorized findings.
- Reasons, verification steps, and safer/dry-run alternatives where implemented.
- Pro-only review report, Codex task, GitHub Issue draft, JSON, and Markdown outputs.

## State and persistence

Command text and findings are current-page working state. The tool does not define persistent command history as part of the free contract. The current paid surface still uses the legacy shared browser entitlement mechanism; explicit exports are user-controlled files/copies.

## Paid-operation boundary

The existing paid delta is exactly these five operations:

1. review Markdown;
2. Codex safety-check task text;
3. GitHub Issue draft;
4. JSON export;
5. Markdown export.

The command risk checker, findings, reasons, verification guidance, and safer/dry-run guidance remain Free.

## Product-scoped Pro migration staging

This section defines the migration target and does not claim that product-scoped billing is already active.

`tools/command-safety-checker/product-scoped-controller.mjs` is a **non-live staging module** for the future migration away from the legacy shared `nicheworks_pro` authority.

The staged controller:

- requires an explicit future `productId`; it has no default product;
- requires an explicit, unique feature-ID mapping for all five paid operations;
- calls the common server-backed entitlement client through `refreshProState({ productId })`;
- treats entitlement as active only when the returned state matches the requested product and reports `active: true`, `source: "server"`, and `reason: "verified_entitlement"`;
- enables only operations whose mapped feature IDs are present in the server-returned feature list;
- rejects wrong-product, local-only, unverified, missing-map, duplicate-map, and failed-refresh states;
- does not read localStorage, `NWPro.getLocalStatus()`, the legacy shared Payment Link, command input, or finding content.

This staged controller is **not loaded by the current public page** and does not replace `pro-bridge.js` yet. Product ID, product display name, price, currency, billing model, price tier, Stripe Price environment mapping, production feature namespace, and test/live enablement remain unresolved until explicitly authorized.

When migration eventually goes live:

- the checkout flow must return to `/tools/command-safety-checker/` through the common billing success/cancel flow;
- the public page must re-verify the matching product entitlement after reload instead of trusting legacy shared state;
- the legacy shared Payment Link and `nicheworks_pro` authority must stop being authoritative for this tool;
- inactive or failed entitlement checks must leave the complete Free checker usable.

Detailed implementation authority: `docs/billing/pro-product-contracts-wave1.md`.

## Privacy and network behavior

Risk matching runs locally in the browser and the pasted command is not intentionally submitted to an application backend by this checker. Suite-wide analytics, advertising, Cloudflare resources, and current legacy shared Pro resources may load independently.

The staged product-scoped controller handles fixed entitlement metadata only. Command text, normalized command content, findings, review Markdown, Codex task content, GitHub Issue content, and export payloads must not be added to billing or entitlement requests.

## Language mode

`bilingual single-page`

JP/EN controls switch the same checker interface and warnings.

## Layout class

`hybrid`

Large code input and review output benefit from desktop width, while the primary command-check flow remains operable on a narrow layout.

## Limits and non-goals

- The checker is heuristic and cannot prove a command is safe or detect every dangerous side effect.
- It does not execute commands, fetch remote scripts for inspection, inspect the user's filesystem, or know the actual target environment.
- Users must independently verify paths, URLs, permissions, secrets, disk impact, and residual risk before execution.
- `app-core.js` is the active checker runtime loaded by the public page; the older `app.js` file is not the runtime evidence for the current page.
- The staged product-scoped contract does not authorize a product ID, price, Stripe Price ID, production feature namespace, or live checkout by itself.

## Acceptance criteria

- [ ] A supported risky Unix or PowerShell sample produces a finding with risk/category/reason guidance rather than executing the command.
- [ ] Empty or benign input does not imply a cryptographic or formal safety guarantee.
- [ ] Free checking remains available when Pro is inactive; Pro-only review/export actions remain gated.
- [ ] JP/EN modes preserve the same detection behavior and safety disclaimer.
- [ ] Product-scoped migration does not move the current risk checker behind a paid gate.
- [ ] The staged controller represents all five paid operations exactly once and fails closed without authoritative server verification.
- [ ] The staged controller remains disconnected from the public runtime until commercial configuration and migration are explicitly authorized.

## Implementation evidence

- `tools/command-safety-checker/index.html`
- `tools/command-safety-checker/app-core.js`
- `tools/command-safety-checker/pro-bridge.js` — current live legacy shared gate.
- `tools/command-safety-checker/product-scoped-controller.mjs` — staged, non-live product-scoped controller.
- `tools/command-safety-checker/usage.html`
- `scripts/check-command-safety-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave1.md`
