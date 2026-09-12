# NicheWorks per-tool specification standard

`common-spec/spec-ja.md` remains the suite-wide source of truth. This document defines the **tool-specific** contract that lives at `tools/{slug}/SPEC.md`.

The purpose of a per-tool spec is to stop future quality work from changing the tool's job, language scope, persistence, privacy behavior, or interaction model merely to satisfy a generic cleanup rule.

## What a SPEC.md represents

A `SPEC.md` describes **current implemented behavior**. It is not a roadmap and must not promise features that are not present in the implementation.

When implementation and `SPEC.md` disagree, the mismatch must be investigated. Do not silently edit the spec to excuse a regression and do not silently edit production code to satisfy an aspirational sentence.

## Required identity block

Every spec starts with:

```md
# Tool Specification — Tool Name

- Slug: `tool-slug`
- Public URL: `https://nicheworks.app/tools/tool-slug/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
```

The slug and public URL are machine-checked against `tools/tools-index.json`.

## Required sections

Every complete spec contains these exact second-level headings:

1. `## Purpose`
2. `## Current functional contract`
3. `## Inputs`
4. `## Outputs`
5. `## State and persistence`
6. `## Privacy and network behavior`
7. `## Language mode`
8. `## Layout class`
9. `## Limits and non-goals`
10. `## Acceptance criteria`
11. `## Implementation evidence`

### Purpose

State the concrete user job and what the tool is for. Avoid generic wording such as “a useful browser tool.”

### Current functional contract

List the behaviors that define the tool. Prefer observable actions and transformations. Do not include future features.

### Inputs

List user-provided values, files, URLs, selections, or browser state actually consumed by the current tool. Use `None` when the tool is a reference/read-only experience.

### Outputs

List visible results, copied text, downloads, generated files, navigation, or saved state produced by the current tool.

### State and persistence

State whether tool-specific data is ephemeral, kept in memory, stored in `localStorage`/`sessionStorage`, downloaded by the user, or persisted elsewhere. Name the storage key when it is stable and important to the contract.

### Privacy and network behavior

Record the tool-specific data path. Distinguish tool processing from suite-wide analytics/advertising. If the tool calls an API, name that dependency and what is sent. If processing is local, say so explicitly.

### Language mode

Choose and explain the current mode rather than inferring a suite-wide default:

- bilingual single-page;
- separate JA/EN pages;
- Japanese-only;
- English-only;
- mixed/reference-specific mode.

A Japanese-only exception must be explicit here, matching the common specification requirement.

### Layout class

Classify the implemented interaction as:

- `mobile-oriented` — narrow primary workflow, one-column behavior is the normal form;
- `pc-oriented` — wide/table/canvas/reference interaction is primary, with mobile adaptation;
- `hybrid` — both narrow and wide use are first-class.

This is the per-tool decision required by the common responsive-layout rules. It does not authorize rewriting existing CSS in the specification PR.

### Limits and non-goals

Record important exclusions, disclaimers, unsupported inputs, non-authoritative interpretations, or intentional boundaries.

### Acceptance criteria

Use testable statements. Cover the core happy path, empty/error behavior where relevant, output correctness at the contract level, persistence/privacy expectations, and language/layout behavior that is critical to the tool.

### Implementation evidence

List the repository files that were inspected to write the spec, usually `index.html`, the main JS module, data files, and existing usage/how-to pages. This section is evidence, not a list of every file in the directory.

## Coverage manifest

`tools/tool-spec-manifest.json` is the complete 87-tool inventory.

Each registered tool has exactly one manifest record:

```json
{
  "slug": "tool-slug",
  "state": "complete",
  "spec": "tools/tool-slug/SPEC.md"
}
```

Allowed states:

- `complete`: a substantive `SPEC.md` exists and passes the contract checker;
- `pending`: the tool is registered but has not yet received a substantive individual specification. `spec` is `null`.

Do **not** create placeholder `SPEC.md` files for pending tools.

`required_complete` is a monotonic coverage floor. It prevents a later change from deleting completed specs while leaving the manifest syntactically valid. Each specification wave increases this floor.

## Change discipline

- A production behavior change that intentionally changes the contract should update the affected `SPEC.md` in the same PR.
- Cross-cutting common rules belong in `common-spec/spec-ja.md`, not duplicated in 87 files.
- A SPEC-only wave should not change production HTML/JS/CSS merely to make prose easier to write. Implementation defects discovered while specifying should be logged for a later repair PR unless they block truthful specification.
- Keep acceptance criteria tool-specific. Generic SEO/AdSense/GA4 requirements are already covered by the common specification and repository CI.
