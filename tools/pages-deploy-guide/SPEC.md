# Tool Specification — Pages Deploy Guide

- Slug: `pages-deploy-guide`
- Public URL: `https://nicheworks.app/tools/pages-deploy-guide/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a browser-local pre-deploy checklist, common-error guide, symptom-based diagnosis tree, and deployment handoff pack for Cloudflare Pages or GitHub Pages.

## Search intent contract

The public search intent is deployment preparation and troubleshooting for Cloudflare Pages / GitHub Pages. Metadata and visible copy may describe build command, publishing source/output directory, 404, asset-path, DNS, SSL, OGP, robots.txt, sitemap.xml, analytics, and deployment handoff checks.

The tool MUST NOT claim that it inspects a repository, runs a build, reads hosting logs, validates live DNS/SSL, or guarantees deployment success.

## Current platform rules

Platform-specific guidance was rechecked against official documentation on 2026-09-17.

### Cloudflare Pages

- A Pages project can define a build command and build output directory.
- For a project that does not require a build, Cloudflare's current static-HTML guidance documents `exit 0` as the no-build command.
- Pages Functions use the Workers runtime and can depend on compatibility date / compatibility flags and environment-variable configuration.
- A custom apex domain requires the domain to be a Cloudflare zone with nameservers configured for Cloudflare; subdomain behavior depends on the configured DNS target and Pages custom-domain mapping.
- Dashboard Direct Upload does not support uploading a `/functions` directory; a supported deployment flow such as Wrangler is required when Functions are part of an uploaded-output workflow.

Official references:

- `https://developers.cloudflare.com/pages/configuration/build-configuration/`
- `https://developers.cloudflare.com/pages/framework-guides/deploy-anything/`
- `https://developers.cloudflare.com/pages/functions/`
- `https://developers.cloudflare.com/pages/configuration/custom-domains/`

### GitHub Pages

- Publishing can use `Deploy from a branch` or a GitHub Actions workflow.
- For branch publishing, the source folder can only be `/ (root)` or `/docs` on the selected branch.
- If the built output lives in another folder such as `dist` or `public`, it must not be described as a valid branch source. A GitHub Actions workflow can instead build and upload the Pages artifact.
- For branch publishing, the entry file must be at the top level of the selected source folder. For Actions publishing, the deployed artifact must contain the entry file at the artifact root.
- A custom domain is configured through GitHub Pages settings/API. A `CNAME` file is relevant to branch publishing; GitHub documents that a CNAME file is ignored and not required when publishing through a custom GitHub Actions workflow.

Official references:

- `https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site`
- `https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`
- `https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages`

## Current functional contract

- Accept platform, source type, custom-domain presence, and a directory/folder to review.
- Generate a pre-deploy checklist covering build/output settings, publishing mode, deployment visibility, assets, 404 behavior, canonical/OGP, crawl files, analytics/ads identifiers, mobile checks, and platform-specific concerns.
- When GitHub Pages is selected, explicitly distinguish branch publishing (`/` or `/docs`) from GitHub Actions artifact publishing and warn when `dist` or `public` is selected.
- When Cloudflare Pages is selected, distinguish build-output guidance from no-build/static output and surface Pages Functions / Direct Upload caveats where relevant.
- Generate a common-errors list.
- Generate a symptom-based diagnosis tree for build failure, 404, blank-page/asset, and domain/SSL problems.
- Generate a deployment handoff pack covering deployment mode, deploy URL/commit/domain records, build settings, environment-variable names, DNS/SSL status, and launch verification items.
- Allow the complete generated result to be copied.
- Allow the complete generated result to be saved as Markdown.
- All current outputs are free; there is no paid entitlement, local Pro code, purchase link, or Pro-gated output.
- Store JP/EN display language in `nw_lang`.

## Inputs

- Platform: Cloudflare Pages or GitHub Pages.
- Source type: repository/folder or static/build output.
- Custom domain yes/no.
- Directory/folder to review: root, `dist`, `public`, or `docs`.
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
- The selected `dist` / `public` / `docs` value is contextual input, not a claim that the platform accepts that folder as a publishing source in every deployment mode.
- Do not enter private repository names, internal URLs, customer names, environment-variable values, or sensitive DNS information.

## Acceptance criteria

- [ ] Each supported platform/source/domain/directory selection produces an appropriate checklist and common-error list without contacting the hosting platform.
- [ ] GitHub branch-publishing guidance never presents `dist` or `public` as a valid source folder; it names `/` and `/docs` and directs other build outputs to an Actions artifact workflow.
- [ ] GitHub custom-domain guidance distinguishes branch CNAME handling from custom Actions publishing.
- [ ] Cloudflare guidance retains current build-output, Pages Functions compatibility, custom-domain, and Direct Upload caveats.
- [ ] The same generation also produces a symptom diagnosis tree and deployment handoff pack without a paid gate.
- [ ] Combined copy includes checklist, errors, diagnosis, and handoff content.
- [ ] Markdown export is available without entitlement or purchase state.
- [ ] No legacy `NW-PDG-...` code, `pdg_pro_key`, shared Pro entitlement, Stripe purchase link, or Pro bridge is required or rendered.
- [ ] The UI does not imply that checklist completion verifies a real deployment.

## Implementation evidence

- `tools/pages-deploy-guide/index.html`
- `tools/pages-deploy-guide/app.js`
- `tools/pages-deploy-guide/style.css`
