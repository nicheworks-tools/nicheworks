# Tool Specification — Pages Deploy Guide

- Slug: `pages-deploy-guide`
- Public URL: `https://nicheworks.app/tools/pages-deploy-guide/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a pre-deploy checklist for Cloudflare Pages or GitHub Pages and, when locally unlocked, provide a symptom diagnosis tree and deployment handoff pack.

## Current functional contract

- Accept platform, source type, custom-domain presence, and output-directory choice.
- Generate a free pre-deploy checklist covering build/output settings, deployment visibility, assets, 404 behavior, canonical/OGP, crawl files, analytics/ads identifiers, mobile checks, and platform-specific concerns.
- Generate a free common-errors list and allow the combined free result to be copied.
- Pro mode adds a symptom-based diagnosis tree, deployment handoff pack, Pro copy, and Markdown download.
- Current Pro activation is tool-specific: a locally validated `NW-PDG-...` code is stored under `pdg_pro_key` and checked entirely in the browser.
- The page links to the Stripe purchase URL and `/pro/unlock/`, but this tool's runtime gating does not use the shared `NWPro` entitlement client.
- Store JP/EN display language in `nw_lang`.

## Inputs

- Platform: Cloudflare Pages or GitHub Pages.
- Source type: repository/folder or static/build output.
- Custom domain yes/no.
- Output directory: root, `dist`, `public`, or `docs`.
- Optional tool-specific Pro code.
- JP/EN display language.

## Outputs

- Free deployment checklist.
- Free common-error guidance.
- Free combined clipboard output.
- Pro diagnosis tree and deployment handoff pack.
- Pro Markdown file.

## State and persistence

The tool persists `nw_lang` and, when a valid local Pro code is activated, `pdg_pro_key`. Generated checklist/pro text is current-page state. Clearing Pro removes the stored tool-specific code.

## Privacy and network behavior

Checklist and Pro-code validation logic run in the browser. The form does not inspect or fetch a repository/deployment. Advertising/analytics and external purchase/support links can communicate independently.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The main interaction is four compact selectors followed by free and optional Pro text outputs.

## Limits and non-goals

- The tool does not actually run a build, inspect hosting logs, verify DNS/SSL, crawl the deployed site, or guarantee successful deployment.
- Users must confirm current platform documentation and actual build/deployment logs.
- The current Pro mechanism is an independent locally validated code (`pdg_pro_key`), not the repository's shared NicheWorks Pro entitlement path.
- Do not enter private repository names, internal URLs, customer names, or sensitive DNS information.

## Acceptance criteria

- [ ] Each supported platform/source/domain/output selection produces an appropriate free checklist and common-error list without contacting the hosting platform.
- [ ] Free copy remains available without any Pro code.
- [ ] A valid tool-specific code persists as `pdg_pro_key`, invalid codes do not unlock Pro, and Clear Pro removes the local code.
- [ ] Pro diagnosis/handoff/Markdown actions remain inaccessible when the tool-specific Pro state is inactive.
- [ ] The UI does not imply that checklist completion verifies a real deployment.

## Implementation evidence

- `tools/pages-deploy-guide/index.html`
- `tools/pages-deploy-guide/app.js`
- `tools/pages-deploy-guide/style.css`
