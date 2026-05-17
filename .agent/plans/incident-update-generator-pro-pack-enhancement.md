# Incident Update Generator Pro Pack Enhancement

## Scope
- Target directory only: `tools/incident-update-generator/`
- Plan file: `.agent/plans/incident-update-generator-pro-pack-enhancement.md`

## Files to touch
- `tools/incident-update-generator/index.html`
- `tools/incident-update-generator/app.js`
- `tools/incident-update-generator/style.css` only if required for restored links/FAQ layout

## Goals
1. Preserve the existing common Pro integration (`/assets/nw-pro.js`, `pro-bridge.js`, `NWPro.getLocalStatus()`, and `data-pro-*` hooks).
2. Expand `buildMarkdownPack()` from a simple Customer/Internal/Social bundle into an Incident Communication Pack with Statuspage, Slack/Teams, support macro, checklist, postmortem outline, GitHub issue ticket, and next update draft sections.
3. Strengthen Pro Preview sample copy for Statuspage, Slack, support macro, and postmortem outline.
4. Update the Pro card wording to clearly advertise generation of an Incident Communication Pack.
5. Restore the allowed footer-near related links block for the specified related tools.
6. Add the requested FAQ entries.
7. Re-run legacy residue searches.
8. Verify free Customer/Internal/Social generation, copy, TXT save, and required field checks remain intact.

## Steps
1. Inspect current HTML/JS/CSS and existing Pro integration.
2. Make minimal targeted edits in `tools/incident-update-generator/`.
3. Run syntax/search checks and targeted browser/DOM-style checks where practical.
4. Commit changes on the current branch and create a PR record.

## Manual verification for user
- Open `/tools/incident-update-generator/` in free state and confirm required validation, generated Customer/Internal/Social text, copy, and TXT download.
- Confirm Pro Preview shows the expanded samples.
- Activate Pro via the existing common Pro status and confirm the generated Markdown pack includes all enhanced Incident Communication Pack sections.
