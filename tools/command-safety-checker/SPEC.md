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
- With active NicheWorks Pro, generate review-oriented deliverables including review Markdown, Codex safety-check task text, GitHub Issue draft, and JSON/Markdown exports.
- Provide JP/EN UI and explicit wording that a finding/result does not certify command safety.

## Inputs

- OS mode: Unix-style shell or PowerShell.
- One or more command lines.
- UI language selection.
- Shared NicheWorks Pro entitlement state.

## Outputs

- Risk summary and categorized findings.
- Reasons, verification steps, and safer/dry-run alternatives where implemented.
- Pro-only review report, Codex task, GitHub Issue draft, JSON, and Markdown outputs.

## State and persistence

Command text and findings are current-page working state. The tool does not define persistent command history as part of the free contract. Shared Pro entitlement is managed by the common browser entitlement mechanism; explicit exports are user-controlled files/copies.

## Privacy and network behavior

Risk matching runs locally in the browser and the pasted command is not intentionally submitted to an application backend by this checker. Suite-wide analytics, advertising, Cloudflare resources, and shared Pro resources may load independently.

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

## Acceptance criteria

- [ ] A supported risky Unix or PowerShell sample produces a finding with risk/category/reason guidance rather than executing the command.
- [ ] Empty or benign input does not imply a cryptographic or formal safety guarantee.
- [ ] Free checking remains available when Pro is inactive; Pro-only review/export actions remain gated.
- [ ] JP/EN modes preserve the same detection behavior and safety disclaimer.

## Implementation evidence

- `tools/command-safety-checker/index.html`
- `tools/command-safety-checker/app-core.js`
- `tools/command-safety-checker/pro-bridge.js`
- `tools/command-safety-checker/usage.html`
