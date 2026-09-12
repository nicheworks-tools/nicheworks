# Tool Specification — Codex Product Shipping Playbooks

- Slug: `codex-product-shipping-playbooks`
- Public URL: `https://nicheworks.app/tools/codex-product-shipping-playbooks/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Explain a repository-first set of reusable playbooks for taking Codex-assisted software changes from repository intake through specification delta, implementation planning, acceptance, shipping checks, release writing, diff review, and retrospective.

## Current functional contract

- Present the ordered workflow path: intake-repo, spec-delta, plan-change, define-acceptance, ship-check, write-release-artifacts, review-diff, and post-ship-retro.
- Explain the repository layers for playbooks, artifacts, gates, flows, and examples.
- Provide a worked synthetic `filter-persistence` example rather than presenting copied production material.
- Link users to the public repository and explain how to consume it as a workflow guide.
- State explicitly that the material does not replace tests, code review, security review, release ownership, legal review, or human release judgment.
- Provide equivalent English and Japanese guide pages.

## Inputs

None beyond page navigation and links. This NicheWorks page is a read-only guide to a separate repository.

## Outputs

- Workflow documentation and release-process reference material.
- Navigation to the public GitHub repository.
- English and Japanese explanatory pages.

## State and persistence

The guide does not store repository changes or workflow state. Any actual use of the playbooks happens in the separate repository or in the user's own project context.

## Privacy and network behavior

No project source code or release material is submitted through the NicheWorks guide. Following the GitHub link navigates to GitHub. Suite-wide advertising and analytics may load on the guide page.

## Language mode

`separate JA/EN pages`

The root page is English and `/ja/` is the Japanese counterpart.

## Layout class

`hybrid`

The tool is long-form documentation with wide summary cards but remains fully readable on narrow screens.

## Limits and non-goals

- It is a workflow guide, not a release-safety certification system.
- It does not execute tests, review code automatically, or decide whether a release is safe.
- It is not a generic project-management framework or unrelated prompt library.

## Acceptance criteria

- [ ] The guide presents the complete current issue-to-release workflow path in the documented order.
- [ ] Users can reach the public repository and understand the roles of playbooks, artifacts, gates, flows, and examples.
- [ ] English and Japanese pages retain the same core scope and the same human-review/release-safety disclaimer.

## Implementation evidence

- `tools/codex-product-shipping-playbooks/index.html`
- `tools/codex-product-shipping-playbooks/ja/`
- `tools/codex-product-shipping-playbooks/style.css`
