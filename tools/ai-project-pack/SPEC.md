# Tool Specification — AI Project Pack

- Slug: `ai-project-pack`
- Public URL: `https://nicheworks.app/tools/ai-project-pack/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Explain and distribute the AI Project Pack repository workflow: a single-repository operating pack that keeps project truth, decisions, unresolved items, next actions, sources, and append-only update logs in one AI-readable place.

## Current functional contract

- Present the repository-first operating model and explain that the repository, not this page, is the primary product.
- Describe the core files and reading order for current truth, decisions, pending items, next actions, sources, examples, playbooks, adapters, and updates.
- Define the first-use loop as report-only review, one bounded safe update, and an appended update log.
- Link to the public GitHub repository and explain supported use with ChatGPT, Claude, Codex, and similar repository-reading AI tools.
- Provide equivalent English and Japanese explanatory page families.

## Inputs

None beyond normal page navigation and links. The public NicheWorks page is a read-only guide and does not edit a project pack repository.

## Outputs

- Explanatory documentation, workflow steps, FAQ, and navigation to the external GitHub repository.
- Language-specific guide pages.

## State and persistence

The guide itself does not persist project content or user-entered state. Repository state lives in the separate AI Project Pack repository when the user chooses to use it.

## Privacy and network behavior

The NicheWorks guide page does not collect project-pack content. Opening GitHub transfers navigation to GitHub, where GitHub's own terms and network behavior apply. Suite-wide analytics and advertising may load on the NicheWorks page.

## Language mode

`separate JA/EN pages`

The root page is English and `/ja/` contains the Japanese guide.

## Layout class

`hybrid`

The experience is documentation-first and remains usable on narrow screens while taking advantage of wider layouts for summary cards and long-form sections.

## Limits and non-goals

- This page is not a SaaS project manager, memory service, or autonomous agent runtime.
- It does not modify repositories or guarantee that AI-generated changes are correct.
- Any future lightweight builder is not part of the current contract unless implemented.

## Acceptance criteria

- [ ] The page clearly states that the repository is the core product and describes the report-only → bounded safe-update → update-log loop.
- [ ] Users can reach the public AI Project Pack GitHub repository from the guide.
- [ ] English and Japanese pages communicate the same repository operating model without implying autonomous project management.

## Implementation evidence

- `tools/ai-project-pack/index.html`
- `tools/ai-project-pack/ja/`
- `tools/ai-project-pack/style.css`
