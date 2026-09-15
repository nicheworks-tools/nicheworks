# Construction Tools Atlas — Publication Quality Contract v2.3

Status: **authoritative publication-quality contract**  
Effective: 2026-09-15

This contract separates **stored corpus size** from **public dictionary corpus size**. A record being present in repository data is not sufficient for public publication.

## 1. Current frozen state

The deterministic publication inventory is `data/publication-inventory-v2.3.json`.

- stored corpus: **5,536** records
- quarantined synthetic filler: **4,600** records
- public runtime corpus: **936** records
- duplicate-ID removals at this publication boundary: **0**
- duplicate-term removals at this publication boundary: **0**

The 4,600 quarantined records are retained in source data for auditability and possible future curation. They are not part of the public searchable dictionary while quarantined.

## 2. Why synthetic filler is quarantined

The Atlas v2.3 specification states that generic fallback copy is not sufficient for a quality-ready entry. The `direct-5000` / `atlas-expand-5000` generated records were created to expand corpus count through combinatorial domain / noun / qualifier / action construction. Their generated provenance is therefore a publication-quality signal, not a maintained dictionary identity.

A large stored count must never be used as a substitute for independently maintained dictionary quality.

## 3. Known synthetic provenance

The currently recognized generated filler batches are:

- `direct-5000`
- `atlas-expand-5000`

A record is quarantined when it explicitly carries generated provenance for one of these known batches.

Unknown `generated_term` provenance fails closed in CI. It must not silently become public merely because a new generator or batch name appears.

## 4. Promotion back to public corpus

A quarantined generated record may return to the public corpus only after explicit curation. Promotion requires all of the following:

1. establish that the subject is a real, useful construction tool / material / component / task / term rather than a combinatorial phrase;
2. assign an appropriate maintained entry type instead of leaving it as generated filler;
3. replace generic generated copy with subject-specific bilingual content;
4. review aliases, taxonomy, task/context fields and relationships as applicable;
5. remove generated-filler provenance only as part of that reviewed curation;
6. pass the normal Construction Tools Atlas data, runtime and publication audits.

Promotion is per canonical subject. Bulk removal of generated provenance is prohibited.

## 5. Runtime rule

`data/quality-loader.js` is the public-data boundary. It filters known synthetic filler before normal ID/term deduplication and records quarantine diagnostics.

The runtime publication ID set must exactly equal the independently audited ID set produced by `scripts/audit-publication-corpus-v2.3.cjs`.

## 6. CI rule

The following must stay synchronized:

- source corpus
- generated provenance policy
- public loader behavior
- `data/publication-inventory-v2.3.json`
- publication ID hashes

Any change that makes the frozen publication inventory stale must fail CI until the delta is explicitly reviewed and the snapshot is refreshed.

## 7. Images and future quality work

Publication state and image state are separate axes. Quarantining synthetic filler does not classify it as `image not required`; it removes it from the current public image-acquisition priority until its content identity is curated.

Image migration should therefore distinguish:

- full stored-corpus inventory, retained for auditability;
- current public runtime corpus, used for user-facing completion work.

As of this contract, the public runtime corpus is **936** records. Image and content completion must be measured against the public corpus as well as the full stored corpus.
