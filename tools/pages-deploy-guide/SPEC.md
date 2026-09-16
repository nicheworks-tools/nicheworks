# Tool Specification — Pages Deploy Guide

- Slug: `pages-deploy-guide`
- Public URL: `https://nicheworks.app/tools/pages-deploy-guide/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a free pre-deploy checklist, common-error guide, symptom diagnosis tree, deployment handoff pack, and Markdown output for Cloudflare Pages or GitHub Pages.

### Monetization contract

The canonical primary monetization classification is `AFFILIATE`.

This tool no longer has a tool-level Pro gate. The former diagnosis tree, handoff pack, combined copy, and Markdown output are part of the free product contract. The historical `NW-PDG-*` code, `pdg_pro_key`, shared `nicheworks_pro` entitlement, historical `$2.99` Payment Link, `/pro/unlock/` flow, `assets/nw-pro.js`, and `pro-bridge.js` are not part of the current Pages Deploy Guide runtime authority.

A hosting/domain commercial next action may appear only after the generated result when a verified partner/offer configuration exists and is contextually relevant. Without verified configuration, the correct affiliate state is no offer. Never invent a hosting partner, referral URL, price, coupon, or availability claim.

## Current functional contract

- Accept platform, source type, custom-domain presence, and output-directory choice.
- Generate a pre-deploy checklist covering build/output settings, deployment visibility, assets, 404 behavior, canonical/OGP, crawl files, analytics/ads identifiers, mobile checks, and platform-specific concerns.
- Generate a common-errors list.
- Generate a symptom-based diagnosis tree.
- Generate a deployment handoff pack.
- Allow the combined result to be copied and saved as Markdown.
- Store JP/EN display language in `nw_lang`.

## Inputs

- Platform: Cloudflare Pages or GitHub Pages.
- Source type: repository/folder or static/build output.
- Custom domain yes/no.
- Output directory: root, `dist`, `public`, or `docs`.
- JP/EN display language.

## Outputs

- Pre-deploy checklist.
- Common-error guidance.
- Symptom diagnosis tree.
- Deployment handoff pack.
- Combined clipboard output.
- Markdown file.

## State and persistence

The tool persists `nw_lang`. Checklist selections and generated outputs are current-page state. Pages Deploy Guide does not persist a purchase/pro entitlement or legacy local Pro code.

## Privacy and network behavior

Checklist generation runs in the browser. The form does not inspect or fetch a repository, deployment URL, build log, DNS record, or SSL state. Advertising/analytics and support links can communicate independently.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The main interaction is four compact selectors followed by checklist, error, diagnosis, and handoff outputs.

## Limits and non-goals

- The tool does not actually run a build, inspect hosting logs, verify DNS/SSL, crawl the deployed site, or guarantee successful deployment.
- Users must confirm current platform documentation and actual build/deployment logs.
- Do not enter private repository names, internal URLs, customer names, or sensitive DNS information.
- The tool does not recommend one hosting provider over another unless a future verified commercial configuration is explicitly added after the free result.

## Acceptance criteria

- [ ] Each supported platform/source/domain/output selection produces an appropriate checklist and common-error list without contacting the hosting platform.
- [ ] Diagnosis tree and deployment handoff pack are available without purchase or entitlement state.
- [ ] Combined copy and Markdown output are available without purchase or entitlement state.
- [ ] The public runtime does not load the old Pages Deploy Guide Pro bridge, shared Pro helper, historical Payment Link, or `/pro/unlock/` CTA.
- [ ] The UI does not imply that checklist completion verifies a real deployment.
- [ ] No affiliate offer is rendered unless a verified contextual partner/offer configuration exists.
- [ ] The public page has one H1 element while preserving JP/EN switching inside that heading.

## Implementation evidence

- `tools/pages-deploy-guide/index.html`
- `tools/pages-deploy-guide/app.js`
- `tools/pages-deploy-guide/style.css`
