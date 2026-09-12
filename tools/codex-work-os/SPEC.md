# Tool Specification — codex-work-os

- Slug: `codex-work-os`
- Public URL: `https://nicheworks.app/tools/codex-work-os/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Explain the codex-work-os repository: a skills-first operating layer for turning messy sales, project-management, executive-support, research, and customer-support inputs into structured draft artifacts for human review.

## Current functional contract

- Explain the five core packs: sales-pack, pm-pack, exec-assist-pack, research-pack, and cs-pack.
- Describe the supporting repository layers for flows, gates, artifacts, shared references, install helpers, and validation scripts.
- Explain that the repository is skills-first rather than one linear playbook pipeline.
- Present the cross-pack `pilot-rollout` example and the intended human-review operating model.
- Link to the public GitHub repository.
- State clearly that outputs remain drafts and do not replace human, legal, security, customer-support, or management review.
- Provide English and Japanese guide pages.

## Inputs

None beyond normal documentation navigation. The NicheWorks page itself is a read-only repository guide.

## Outputs

- Documentation describing the pack architecture, workflow layers, and worked scenario.
- Navigation to the public codex-work-os repository.
- English and Japanese explanatory pages.

## State and persistence

The guide page does not persist user workflow data. Any durable artifacts are created in the separate repository or in the user's own downstream workflow.

## Privacy and network behavior

The NicheWorks guide does not accept or upload business notes, customer data, or repository content. GitHub navigation leaves NicheWorks and is governed by GitHub's own behavior. Suite-wide analytics and advertising may load on the guide page.

## Language mode

`separate JA/EN pages`

The canonical root is English and `/ja/` provides the Japanese counterpart.

## Layout class

`hybrid`

The page is documentation-focused, with summary/card layouts on wide screens and readable long-form sections on narrow screens.

## Limits and non-goals

- This is not a generic life-assistant prompt pack or autonomous business operator.
- The repository structures draft work but does not authorize sending, publishing, or acting on outputs without review.
- The NicheWorks page does not execute the five packs itself.

## Acceptance criteria

- [ ] The guide identifies all five current domain packs and explains the supporting flows/gates/artifacts architecture.
- [ ] The public GitHub repository is reachable from the page and the `pilot-rollout` example is presented as a worked scenario.
- [ ] English and Japanese guides retain the same draft-only and human-review boundaries.

## Implementation evidence

- `tools/codex-work-os/index.html`
- `tools/codex-work-os/ja/`
- `tools/codex-work-os/style.css`
