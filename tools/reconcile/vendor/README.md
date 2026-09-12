# Reconcile XLSX vendor contract

The browser XLSX runtime for NicheWorks Reconcile is intentionally vendored locally. Do not replace this with a runtime CDN dependency.

## Pinned dependency

- Library: SheetJS Community Edition
- Version: `0.20.3`
- Required file: `xlsx.full.min.js`
- Destination: `tools/reconcile/vendor/xlsx.full.min.js`
- Authoritative distribution URL: `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`
- Official release commit documented by SheetJS: `8a7cfd47bde8258c0d91df6a737bf0136699cdf8`
- Expected MD5 documented by SheetJS: `6b3130af1ceadf07caa0ec08af7addff`
- License: Apache License 2.0

## Required verification before commit

1. Obtain `xlsx.full.min.js` from the authoritative SheetJS distribution or reproduce the official 0.20.3 build.
2. Compute MD5 over the unmodified file bytes.
3. The result must equal `6b3130af1ceadf07caa0ec08af7addff`.
4. Preserve the upstream copyright/license header.
5. Add the applicable Apache-2.0 license/attribution alongside the vendored file before publication.
6. Run `tools/reconcile/tests/xlsx-adapter.test.mjs` and browser XLSX read/write validation.

Do not commit a third-party mirror merely because it claims to be version 0.20.3. A mirror is acceptable only when its exact bytes are independently verified against the official checksum.

`xlsx-adapter.mjs` additionally rejects a loaded runtime whose `XLSX.version` is not exactly `0.20.3`. The runtime version check is defense in depth and does not replace byte-level checksum verification.
