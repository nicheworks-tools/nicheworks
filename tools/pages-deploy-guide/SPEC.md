# Tool Specification — Pages Deploy Guide

- Slug: `pages-deploy-guide`
- Public URL: `https://nicheworks.app/tools/pages-deploy-guide/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a browser-local pre-deploy checklist, common-error guide, symptom-based diagnosis tree, and deployment handoff pack for Cloudflare Pages or GitHub Pages.

## Search intent contract

The public search intent is deployment preparation and troubleshooting for Cloudflare Pages / GitHub Pages. Metadata and visible copy may describe build command, output directory, 404, asset-path, DNS, SSL, OGP, robots.txt, sitemap.xml, analytics, and deployment handoff checks.

The tool MUST NOT claim that it inspects a repository, runs a build, reads hosting logs, validates live DNS/SSL, or guarantees deployment success.

## Current functional contract

- Accept platform, source type, custom-domain presence, and output-directory choice.
- Generate a pre-deploy checklist covering build/output settings, deployment visibility, assets, 404 behavior, canonical/OGP, crawl files, analytics/ads identifiers, mobile checks, and platform-specific concerns.
- Generate a common-errors list.
- Generate a symptom-based diagnosis tree for build failure, 404, blank-page, asset, and domain/SSL problems.
- Generate a deployment handoff pack covering deploy URL/commit/domain records, build settings, environment-variable names, DNS/SSL status, and launch verification items.
- Allow the complete generated result to be copied.
- Allow the complete generated result to be saved as Markdown.
- All current outputs are free; there is no paid entitlement, local Pro code, purchase link, or Pro-gated output.
- Store JP/EN display language in `nw_lang`.

## Inputs

- Platform: Cloudflare Pages or GitHub Pages.
- Source type: repository/folder or static/build output.
- Custom domain yes/no.
- Output directory: root, `dist`, `public`, or `docs`.
- JP/EN display language.

## Outputs

- Deployment checklist.
- Common-error guidance.
- Symptom-based diagnosis tree.
- Deployment handoff pack.
- Combined clipboard output.
- Markdown file.

## State and persistence

The tool persists only the selected display language in `nw_lang`. Generated deployment content and selected deployment conditions are current-page state and are not saved as projects.

## Privacy and network behavior

Checklist generation runs in the browser. The form does not inspect or fetch a repository/deployment and does not run a network speed, DNS, SSL, or hosting-log test. Advertising and analytics resources may load separately. Users should not enter private repository names, internal URLs, customer names, secret values, or sensitive DNS information.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The main interaction is four compact selectors followed by locally generated checklist, troubleshooting, and handoff outputs.

## Monetization boundary

Amazon affiliate monetization is not part of the current product contract. The primary user intent is technical deployment guidance rather than physical-product shopping. The tool may use the site-wide advertising and donation surfaces defined by the common specification.

## Limits and non-goals

- The tool does not actually run a build, inspect hosting logs, verify DNS/SSL, crawl the deployed site, or guarantee successful deployment.
- Platform behavior can change; users must confirm current Cloudflare Pages / GitHub Pages documentation and actual build/deployment logs.
- The diagnosis tree is a troubleshooting checklist, not an automated diagnosis.
- Do not enter private repository names, internal URLs, customer names, environment-variable values, or sensitive DNS information.

## Acceptance criteria

- [ ] Each supported platform/source/domain/output selection produces an appropriate checklist and common-error list without contacting the hosting platform.
- [ ] The same generation also produces a symptom diagnosis tree and deployment handoff pack without a paid gate.
- [ ] Combined copy includes checklist, errors, diagnosis, and handoff content.
- [ ] Markdown export is available without entitlement or purchase state.
- [ ] No legacy `NW-PDG-...` code, `pdg_pro_key`, shared Pro entitlement, Stripe purchase link, or Pro bridge is required or rendered.
- [ ] The UI does not imply that checklist completion verifies a real deployment.

## Implementation evidence

- `tools/pages-deploy-guide/index.html`
- `tools/pages-deploy-guide/app.js`
- `tools/pages-deploy-guide/style.css`
