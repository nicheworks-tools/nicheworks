# Tool Specification — ATS Paste Doctor

- Slug: `ats-paste-doctor`
- Public URL: `https://nicheworks.app/tools/ats-paste-doctor/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Clean and inspect resume, cover-letter, and application text before it is pasted into an ATS or job form, while surfacing formatting and character issues that may affect readability.

## Current functional contract

- Accept pasted application text and report character/count information and warnings.
- Provide three output modes: ATS-friendly plain text, keep-line-breaks, and clean.
- Accept an optional character-limit target and show limit-related status.
- Generate cleaned output plus a compact ATS-style readability preview.
- Free mode supports copy and TXT download up to the implemented free character limit.
- Shared NicheWorks Pro raises the character limit and unlocks PDF/Markdown/JSON outputs, reusable templates, local history, full output packs, and pre-submit material.
- Provide bilingual UI and explicit privacy/ATS-guarantee notices.

## Inputs

- Resume, cover-letter, application, or other pasted text.
- Output-mode selection.
- Optional character-limit value.
- UI language selection.
- Shared NicheWorks Pro entitlement state.

## Outputs

- Cleaned text.
- Counts, warnings, and short readability preview.
- Clipboard copy and TXT download in free mode.
- Pro-only export, template, history, and output-pack material when entitlement is active.

## State and persistence

The current edit/output workflow is in page memory. Pro templates and history are designed as browser-local state; shared Pro entitlement is managed by the common NicheWorks Pro client. User-triggered exports are saved by the browser.

## Privacy and network behavior

Text formatting runs in the browser and pasted application content is not intentionally uploaded by the tool workflow. The page may load suite-wide ads, analytics, and shared Pro entitlement resources independently, so users are still advised to redact personal details when appropriate.

## Language mode

`bilingual single-page`

JP/EN buttons switch the same tool UI and notices.

## Layout class

`hybrid`

The desktop form uses paired panels while the same workflow remains usable on narrow screens through responsive stacking.

## Limits and non-goals

- The tool does not guarantee acceptance by any ATS or employer form.
- It does not submit job applications or assess candidate quality.
- Free and Pro character limits are implementation constraints, not ATS platform limits.

## Acceptance criteria

- [ ] Pasted text can be processed in each of the three supported modes and produces output, counts, warnings, and a preview.
- [ ] Copy/TXT export uses the generated output and reset returns the current tool state to its initial working state.
- [ ] Free/Pro limits and Pro-only actions remain gated by the shared entitlement rather than by UI language.
- [ ] JP/EN switching retains the same formatting functionality and safety notices.

## Implementation evidence

- `tools/ats-paste-doctor/index.html`
- `tools/ats-paste-doctor/app.js`
- `tools/ats-paste-doctor/style.css`
- `tools/ats-paste-doctor/usage.html`
