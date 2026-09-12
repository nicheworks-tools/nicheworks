# Tool Specification — Pages Deploy Guide

- Slug: `pages-deploy-guide`
- Public URL: `https://nicheworks.app/tools/pages-deploy-guide/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a pre-deploy checklist for Cloudflare Pages or GitHub Pages and, when shared NicheWorks Pro is active, provide a symptom diagnosis tree and deployment handoff pack.

## Current functional contract

- Accept platform, source type, custom-domain presence, and output-directory choice.
- Generate a free pre-deploy checklist covering build/output settings, deployment visibility, assets, 404 behavior, canonical/OGP, crawl files, analytics/ads identifiers, mobile checks, and platform-specific concerns.
- Generate a free common-errors list and allow the combined free result to be copied.
- Pro mode adds a symptom-based diagnosis tree, deployment handoff pack, Pro copy, and Markdown download.
- Pro access is authorized by the shared NicheWorks Pro browser entitlement and requires the expected `nicheworks_pro` entitlement.
- The legacy `NW-PDG-...` browser-checksum code is no longer an authoritative purchase/unlock mechanism; the compatibility adapter only supplies the old app state when shared Pro is already active and removes that temporary compatibility state after initialization.
- The page links to the shared Stripe purchase and `/pro/unlock/` flows.
- Store JP/EN display language in `nw_lang`.

## Inputs

- Platform: Cloudflare Pages or GitHub Pages.
- Source type: repository/folder or static/build output.
- Custom domain yes/no.
- Output directory: root, `dist`, `public`, or `docs`.
- Shared NicheWorks Pro state when using Pro outputs.
- JP/EN display language.

## Outputs

- Free deployment checklist.
- Free common-error guidance.
- Free combined clipboard output.
- Pro diagnosis tree and deployment handoff pack.
- Pro Markdown file.

## State and persistence

The tool persists `nw_lang`. Pro availability follows the shared NicheWorks Pro browser-bound entitlement contract. A temporary `pdg_pro_key` compatibility value may be created only during page initialization after a valid shared entitlement is already present; it is removed immediately after the legacy app has read it and is not an independent entitlement source.

## Privacy and network behavior

Checklist generation runs in the browser. The form does not inspect or fetch a repository/deployment. Shared Pro state uses the common NicheWorks Pro client/status contract; advertising/analytics and external purchase/support links can communicate independently.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The main interaction is four compact selectors followed by free and optional Pro text outputs.

## Limits and non-goals

- The tool does not actually run a build, inspect hosting logs, verify DNS/SSL, crawl the deployed site, or guarantee successful deployment.
- Users must confirm current platform documentation and actual build/deployment logs.
- A locally fabricated legacy Pages Deploy Guide code must not independently unlock Pro.
- An active entitlement for another product must not be treated as `nicheworks_pro`.
- Do not enter private repository names, internal URLs, customer names, or sensitive DNS information.

## Acceptance criteria

- [ ] Each supported platform/source/domain/output selection produces an appropriate free checklist and common-error list without contacting the hosting platform.
- [ ] Free copy remains available without Pro.
- [ ] Pro diagnosis/handoff/copy/Markdown actions require active shared `nicheworks_pro`; a legacy `NW-PDG-...` code or `pdg_pro_key` alone cannot unlock them.
- [ ] Another product-scoped entitlement does not unlock Pages Deploy Guide Pro.
- [ ] The UI does not imply that checklist completion verifies a real deployment.

## Implementation evidence

- `tools/pages-deploy-guide/index.html`
- `tools/pages-deploy-guide/app.js`
- `tools/pages-deploy-guide/pro-bridge.js`
- `assets/nw-pro.js`
- `tools/pages-deploy-guide/style.css`
