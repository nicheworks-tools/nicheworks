# Tool Specification — Notion Form Design Kit

- Slug: `notion-form-design-kit`
- Public URL: `https://nicheworks.app/tools/notion-form-design-kit/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Draft a Notion-oriented intake database design, workflow, and notification-message set without connecting to or modifying a Notion workspace.

## Current functional contract

- Accept a free-text use case.
- Provide use-case presets: simple, detailed, inquiry, application, recruiting, bug report, and creative request.
- Let users include or exclude common fields such as name, email, company, request, priority, deadline, and attachment.
- Generate three artifacts: property design, status pipeline, and message templates.
- Allow all generated content to be copied and saved as Markdown or TXT.
- Switch JP/EN UI on the same page.
- Generate locally; there is no Notion API authentication or workspace mutation.

## Inputs

- Use-case text.
- Preset selection.
- Field-selection checkboxes.
- JP/EN display language.

## Outputs

- Notion property design draft.
- Status/workflow pipeline draft.
- Notification/message templates.
- Combined clipboard, Markdown, and TXT outputs.

## State and persistence

Design inputs and outputs are transient page state. The language preference may be stored in localStorage by the shared language layer. No Notion credentials, workspace identifiers, or generated database IDs are stored.

## Privacy and network behavior

Design generation runs in the browser. The tool does not send the design to Notion and does not call the Notion API. Ads/analytics may load separately.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The workflow is a compact use-case/preset form followed by three vertically stacked text outputs.

## Limits and non-goals

- The tool does not create Notion pages, databases, forms, automations, or permissions.
- It does not verify current Notion product/API behavior.
- It does not guarantee privacy, permissions, sharing scope, retention, or deletion policy correctness.
- Personal or confidential information should be masked during design drafting.

## Acceptance criteria

- [ ] Every documented preset can generate property, pipeline, and message-template output without Notion credentials.
- [ ] Field checkboxes materially change the generated design rather than being decorative controls.
- [ ] Copy, Markdown save, and TXT save operate on locally generated content.
- [ ] The UI and specification do not imply that a Notion database/workspace is modified automatically.

## Implementation evidence

- `tools/notion-form-design-kit/index.html`
- `tools/notion-form-design-kit/app.js`
- `tools/notion-form-design-kit/style.css`
