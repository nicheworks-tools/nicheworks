# UnitMaster runtime units.json migration plan

Status: planning / pre-runtime-change  
Scope: `tools/unitmaster/app.js` and `tools/unitmaster/data/units.json`

## Purpose

UnitMaster currently has two unit data sources:

- `tools/unitmaster/app.js`: live converter runtime data
- `tools/unitmaster/data/units.json`: seed data and future canonical unit catalog

The goal is to migrate the converter runtime toward `units.json` without breaking the current browser-only converter.

## Current state

Completed:

- `tools/unitmaster/data/units.json` exists.
- `tools/unitmaster/scripts/validate-units-json.mjs` validates the JSON structure.
- `tools/unitmaster/scripts/check-app-units-sync.mjs` compares `app.js` runtime keys with `units.json` keys.
- GitHub Actions run the JSON validation and app/JSON sync checks.
- `/tools/unitmaster/units/search/` already loads unit data from `units.json`.

Not migrated yet:

- Main converter runtime in `tools/unitmaster/app.js` still uses local constants.
- Unit labels in `app.js` still use `unitLabels`.
- Category labels in the converter are still driven by `labels` and `categoryKeys`.

## Migration principle

Do not replace the runtime in one large change.

Use small PRs:

1. Keep current runtime behavior.
2. Add helper functions that can build runtime dictionaries from JSON.
3. Compare generated dictionaries with current constants.
4. Switch read path only after generated dictionaries are proven equivalent.
5. Keep fallback constants for one release cycle.
6. Remove fallback constants only after stable deployment.

## Proposed PR sequence

### PR A: Add JSON runtime adapter

Create a small adapter file:

```text
tools/unitmaster/runtime-units-adapter.js
```

Responsibilities:

- Accept parsed `units.json`.
- Build a `units` dictionary compatible with current `app.js`:
  - non-temperature categories become `{ key: factor }`
  - `temp` becomes `["c", "f", "k"]`
- Build `unitLabels` compatible with current language handling.
- Build `categoryKeys` from `categories` order.
- Return data without mutating DOM.

Acceptance:

- No runtime behavior changes.
- Adapter can be loaded by test scripts.

### PR B: Add adapter validation script

Create:

```text
tools/unitmaster/scripts/check-runtime-adapter.mjs
```

Checks:

- Generated runtime unit keys match current `app.js` constants.
- Generated factors match current factors.
- Generated temperature units are `c/f/k`.
- Generated labels are non-empty.
- `tsubo_length` is absent.

Acceptance:

- Script passes locally with Node.
- CI runs it when adapter, app.js, or units.json changes.

### PR C: Add optional JSON loading path behind fallback

Modify `app.js` minimally:

- Keep current constants.
- Add async loading for `./data/units.json`.
- If JSON loads and adapter output validates in-browser, use generated data.
- If JSON fails, use current constants.
- Show no user-facing error unless converter cannot initialize.

Acceptance:

- Converter still works offline from static files where fetch is available.
- If JSON fetch fails, converter still works with constants.
- No visual/UI changes.

### PR D: Move labels/metadata toward JSON

After PR C is stable:

- Reduce duplicate `unitLabels` entries in `app.js`.
- Use `labelJa` / `labelEn` from `units.json`.
- Keep existing `labels` object for UI text only.

Acceptance:

- JA/EN switching still works.
- History display still works.
- Bulk conversion still works.

### PR E: Make JSON the runtime source

After deployment stability:

- Set `runtimeSource: true` in `units.json`.
- App runtime uses adapter output by default.
- Constants are kept only as fallback.

Acceptance:

- CI passes.
- Search page and converter use the same source.
- `app.js` / `units.json` sync checker may be updated or retired.

### PR F: Remove fallback constants

Only after a stable period:

- Remove duplicated unit constants from `app.js`.
- Keep fallback error state for failed JSON loading.
- Add clear user-facing failure message if data cannot be loaded.

Acceptance:

- No duplicate runtime unit catalog remains.
- `units.json` is the single source of truth.

## Runtime risk points

### 1. Browser fetch path

`app.js` lives at:

```text
/tools/unitmaster/app.js
```

The JSON path should be:

```text
./data/units.json
```

Risk:

- Path may fail depending on local file testing or deployed routing.

Mitigation:

- Keep fallback constants until deployment is proven.

### 2. Initialization order

Current app setup is synchronous.

Risk:

- async JSON loading can make selects render before data is ready.

Mitigation:

- Introduce an `init()` function.
- Load data first, then call `applyLanguage()`, `applyCategory()`, `loadHistory()`.

### 3. History compatibility

History stores category/from/to keys.

Risk:

- If keys change, old history breaks.

Mitigation:

- Do not rename keys during migration.
- Keep `isKnownHistoryItem()`.
- Keep `tsubo_length` forbidden.

### 4. Temperature conversion

Temperature does not use simple factor conversion.

Risk:

- Adapter may accidentally treat temp as factor-based units.

Mitigation:

- `conversionType: "temperature"` is required for temp units.
- Adapter returns temp as an ordered array.

### 5. Label switching

Current labels are split between UI labels and unit labels.

Risk:

- Moving labels too early may break JA/EN switching.

Mitigation:

- First migrate numeric runtime data.
- Migrate unit labels later.

## Rollback plan

If converter behavior breaks after JSON loading:

1. Disable JSON use in `app.js` by forcing fallback constants.
2. Keep `units.json` and validator untouched.
3. Keep search page using JSON unless it is also affected.
4. Re-run sync checker and adapter checker before retrying.

## Do not do yet

- Do not remove current constants from `app.js` in the first runtime PR.
- Do not rename existing unit keys.
- Do not add new categories during runtime migration.
- Do not combine runtime migration with UI redesign.
- Do not change history storage format in the same PR.

## Next implementation task

Proceed with PR A:

```text
Add tools/unitmaster/runtime-units-adapter.js
```

The adapter should be pure, dependency-free, and safe to test from Node scripts and the browser.
