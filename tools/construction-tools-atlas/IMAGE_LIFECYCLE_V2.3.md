# Image review lifecycle

This is an architecture migration, not a backlog classification wave. Every public
canonical has a record, but an `unreviewed` record is explicitly **not** a completed
applicability review. Do not claim final coverage until every record is either
`not_required` or `promoted`. Missing imagery does not imply that imagery is required.

## Authority and schema

- `data/image-lifecycle-v2.3.json`: canonical review histories and candidate evidence.
- `data/image-lifecycle-v2.3.schema.json`: structural JSON Schema (2020-12).
- `data/image-lifecycle-policy-v2.3.json`: machine-readable states, transitions and
  pinned migration imports. `scripts/image-lifecycle-v2.3.cjs` enforces structure,
  transitions and cross-file semantics without installing a schema dependency.
- `image-registry-v2.3.json`: active formal assets; reviewed/verified registry states
  are publication eligibility, not a substitute for the lifecycle history.
- `image-wave*-sources-v2.3.json`: existing acquisition provenance. Never rewrite a
  historical source ID merely because it redirects to a cleaner public canonical.
- `image-inventory-exceptions-v2.3.json`: authoritative `not_required` reasons.
  Keep its current decision synchronized with the latest lifecycle event.
- The actual public loader, publication count and published-ID hash define scope.
  Stored generated/quarantined records and retired duplicates are not public tasks.

## States

| State | Applicability | Provenance/license verified | Subject verified |
| --- | --- | --- | --- |
| unreviewed | unknown, not yet reviewed | no | no |
| not_required | image not required | no | no |
| awaiting_source | required, no accepted candidate yet | no | no |
| candidate | required, candidate found | no | no |
| provenance_verified | required | yes | no |
| subject_verified | required | no | yes |
| verified | required | yes | yes |
| promoted | required, formal image published | yes | yes |

`awaiting_source` includes both not-yet-searched and searched-without-success;
record search attempts and outcomes as same-state history events. It must not be
interpreted as proof that a source cannot exist. A concept, process or document may
be not_required if a photograph would be arbitrary/misleading. Review the current
canonical definition, not raw type alone (some historical concepts are typed tool).

A hold is an orthogonal object `{reason, resume_when}` on a nonterminal event.
Use it for an actual blocker (identity uncertainty, rights clarification, access),
not merely for lack of a search attempt. Release a hold in a separate same-state
event before progressing. It never counts as final coverage. There
is deliberately no `unobtainable` in v1: failed searches cannot prove permanent
unavailability. Reconsider the policy in a separate change if that becomes useful.
No not_required/formal-image coexistence exception is allowed in v1.

## Review evidence and transitions

Each item's `history` is append-only. Each event is a complete snapshot:
`state`, `at` (UTC seconds), `actor`, `reason`, `candidate_id`,
`candidate_sha256`, `hold`. Null fields must be explicitly null. The actor and
reason of the event entering a verification state are the review attestation;
record what was checked and why it supports provenance or canonical identity.
The transition to `verified` attests the other outstanding review. Reviews may
happen in either order; neither one alone permits promotion. CI checks evidence
structure and consistency; it cannot independently judge whether a photograph
actually depicts the intended subject or whether a reviewer's claim is truthful.

New entries start unreviewed, then go to not_required or awaiting_source. Required
work goes through candidate, one verification state, verified, promoted. See the
policy's `next` arrays for every legal edge. Same-state events log continued work.
To replace/reject a candidate, return to candidate (new evidence) or awaiting_source
(no candidate); verification resets. To reopen a promoted entry, remove/demote the
active registry image in the same change and append the reasoned transition.
Never delete the prior review history or acquired source provenance.

Candidates have stable IDs, original `source_entry_id`, media `kind` and exactly
one of `source_ref: {file, entry_id}` or inline `source`. Existing migrated
candidates refer to the wave source row, avoiding a duplicate provenance ledger.
An inline source must start with HTTPS source_url/source_page. Before provenance
verification it must also contain license, license_url, author, attribution and
pinned source_sha1. Use a new candidate ID when evidence changes, return to
candidate, and redo verification; old candidates remain referenced by history.
`candidate_sha256` is computed by `candidateDigest(candidate, context)` over both
the reference and resolved source row. Old evidence changes invalidate history.

An illustration may be tracked as a candidate but cannot be promoted under this
policy. A photographed cutaway or real representative model already accepted by
subject review remains a photograph; an arbitrary icon or generic SVG does not.
The existing 30-image migration carries forward prior judgments, not a new visual
review. Existing source rows, hashes, license metadata, and review_note are checked.

Promotion additionally requires a reviewed wave source record, exact registry
provenance parity, matched subject, retained JPEG/PNG whose SHA-1 matches, and
separate local WebP display/thumbnail files with valid file signatures. Existing
build/promotion tools remain asset writers; they do not automatically grant a
lifecycle review. A promotion without the corresponding reviewed history fails CI.
Attribution continues to use the original wave source ID, including retired IDs.

## Canonical redirects

A candidate's original source ID must exist in the corpus and resolve through
explicit canonical redirects to its public lifecycle owner. Name/type overrides
and distinct-concept decisions remain in canonical-identity-resolutions; neither
similar spelling nor shared vocabulary permits image transfer. Current public
identity comes from the quality loader, which applies those decisions.

Direct formal ownership takes precedence, matching the existing runtime. If no
direct image exists, exactly one inherited formal source may win. Two inherited
formal sources are an error instead of relying on array order. Superseded source
rows may remain as provenance when a direct image takes precedence; every such
row must still resolve to a public canonical. The active promoted event must name
the actual winning source owner. No UI changes are needed for this architecture.

## Migration and continuation

Starting main is pinned in policy. The first events for the 30 formal images and
8 not_required decisions are checksum-pinned imports, with actor
`lifecycle-migration`. This identifies the migration process, not an invented
historical reviewer. Existing formal-image inclusion is carried forward as its
applicability decision. The other 832 records only record absence of review.
Do not rebootstrap the ledger or widen the import allowlist for routine work.
Future canonicals start with an unreviewed event. A canonical retirement needs an
explicit policy/history migration retaining the old evidence and redirect; do not
silently delete a historical import to pass validation.

Next classification phase, one small reviewed batch at a time:
1. Read the public canonical's current identity and applicable resolution notes.
2. Append a reasoned not_required decision (also update exception ledger), or an
   awaiting_source decision. Do not classify entire categories automatically.
3. Add candidate evidence and append candidate event. Record search failures/holds.
4. Append separate provenance and subject attestations; verify the source against
   the surviving canonical, not merely a legacy label. For inherited assets cite
   the redirect and why the reviewed subject remains the same.
5. Use existing reviewed acquisition/build/promotion and attribution conventions;
   append promoted only with all assets, provenance and both review attestations.
6. Run the lifecycle and existing registry/attribution/runtime auditors, regenerate
   inventories, inspect the diff, and commit. No bulk classification is part of
   the architecture task.

Commands (repository root):

```
node tools/construction-tools-atlas/scripts/image-lifecycle-v2.3.cjs
node tools/construction-tools-atlas/scripts/check-image-lifecycle-v2.3.cjs
node tools/construction-tools-atlas/scripts/audit-public-image-inventory-v2.3.cjs --check
```

## Inventories and CI

The existing public image auditor now validates the lifecycle on every invocation.
Its `--check` mode also runs the 58 isolated positive/negative fixtures. This is
already called by the path-triggered Construction Tools Atlas audit workflow;
no workflow outside this tool directory has been changed. Missing/stale lifecycle
records or snapshots therefore fail the existing CI gate.

`public-image-inventory-v2.3.json.lifecycle` contains all public canonical rows,
review flags, acquisition stage, blocker, reason, source owner and attachment mode.
Its `summary.final_dispositions` counts promoted + not_required only;
`disposition_records` includes unreviewed records and is not completion coverage.
The old `missing_formal_image` compatibility counter is still an asset-coverage
counter, never an applicability decision. `image-inventory-v2.3.json.public_lifecycle`
reports the same public summary, keeping 4666 non-public stored records separate.
All output is deterministic; timestamps belong to review events, not regeneration.

After editing reviews, regenerate both snapshots and check them:

```
node tools/construction-tools-atlas/scripts/audit-image-inventory-v2.3.cjs --write
node tools/construction-tools-atlas/scripts/audit-public-image-inventory-v2.3.cjs --write
node tools/construction-tools-atlas/scripts/audit-image-inventory-v2.3.cjs --check
node tools/construction-tools-atlas/scripts/audit-public-image-inventory-v2.3.cjs --check
node tools/construction-tools-atlas/scripts/check-image-registry-v2.3.cjs
node tools/construction-tools-atlas/scripts/check-image-attribution-v2.3.cjs
node tools/construction-tools-atlas/scripts/check-image-runtime-v2.3.cjs
```

Frozen inventories detect edits to prior events/candidate evidence through their
hashes. Reviewers must also inspect the git diff for append-only history: replay
validation does not prove that intermediate events were never removed when an
author intentionally rewrites both the ledger and snapshots. Initial migrated
reviews have an additional independent hash anchor in policy. Do not alter these
anchors or transition policy to make a routine classification pass.

For a new canonical retirement, stop routine classification and make a dedicated
identity/lifecycle migration: retain old events under the surviving canonical,
keep historical candidate owners and explicit redirects, and review any import
anchor updates together. The validator intentionally fails unexplained removal
of an imported canonical. This task does not retire any additional canonicals.

Full command results: `IMAGE_LIFECYCLE_VALIDATION_V2.3.md`.
Resumption checkpoint: `.agent/plans/image-lifecycle.md`.
