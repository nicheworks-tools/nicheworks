# Construction Tools Atlas — Workflow

## A) Add / Update pack entries (recommended)

1) edit TSV draft
- `tools/construction-tools-atlas/_work/pack-001.tsv`

2) generate pack JSON
```bash
node tools/construction-tools-atlas/scripts/tsv-to-pack.mjs \
  --tsv tools/construction-tools-atlas/_work/pack-001.tsv \
  --out tools/construction-tools-atlas/data/packs/pack-001.json
````

3. validate

```bash
node tools/construction-tools-atlas/scripts/validate-data.mjs
```

4. commit + PR


