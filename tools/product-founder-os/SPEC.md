# Tool Specification — Product Founder OS

- Slug: `product-founder-os`
- Public URL: `https://nicheworks.app/tools/product-founder-os/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Document and link to the Product Founder OS repository asset for structuring multi-session product work with GPT and/or Codex.

## Current functional contract

- Explain the repository's discover → define → plan → build → adjust → ship operating model.
- Describe source-of-truth product documents such as project seed, product brief, functional spec, roadmap, backlog, current sprint, change requests, and done definition.
- Describe included repository instructions, docs, examples, templates, helper scripts, and validation utilities.
- Explain the bootstrap helper as a starter-document generator rather than a finished-product generator.
- Link users to the external public GitHub repository.
- Provide separate English and Japanese explanatory pages.
- Act as documentation/reference; the NicheWorks page itself does not run the repository workflow against a user project.

## Inputs

No interactive product-definition input is accepted by the NicheWorks page. Users navigate the documentation and external GitHub repository.

## Outputs

- Product Founder OS workflow documentation.
- Usage guidance and FAQ.
- Links to the external GitHub repository and support options.

## State and persistence

The NicheWorks page does not maintain project state, product docs, or repository history. Durable work occurs only in the external repository/project where the user applies Product Founder OS.

## Privacy and network behavior

The page is informational. Following GitHub/support links navigates to external services subject to their own policies. Ads/analytics may load on the NicheWorks page. No user product content is collected by this page's workflow because it has no product-input form.

## Language mode

`separate JA/EN pages`

The English root and `/ja/` page are separate public language surfaces.

## Layout class

`hybrid`

The site is long-form repository documentation designed to remain readable across desktop and mobile widths.

## Limits and non-goals

- Product Founder OS is not a one-shot prompt collection, autonomous product manager, or hosted product-building service.
- The NicheWorks page does not edit a user's repository.
- Helper scripts create/check structure and do not generate a finished product or guarantee product-market fit.
- The workflow does not provide legal, security, privacy, accessibility, or launch-success guarantees.
- Repository contents can evolve independently and should be reviewed at the linked GitHub source.

## Acceptance criteria

- [ ] The page clearly positions Product Founder OS as a repository operating system rather than a hosted interactive generator.
- [ ] Bootstrap/helper-script descriptions do not claim that they create a finished product automatically.
- [ ] English and Japanese public pages link to the same external repository asset.
- [ ] The page does not imply that NicheWorks stores or manages a user's product/project state.

## Implementation evidence

- `tools/product-founder-os/index.html`
- `tools/product-founder-os/ja/index.html`
- `tools/product-founder-os/style.css`
