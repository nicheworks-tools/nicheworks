# Reconcile XLSX vendor contract

The browser XLSX runtime for NicheWorks Reconcile is intentionally vendored locally. Do not replace this with a runtime CDN dependency.

## Pinned dependency

- Library: SheetJS Community Edition
- Version: `0.20.3`
- Required file: `xlsx.mini.min.js`
- Destination: `tools/reconcile/vendor/xlsx.mini.min.js`
- Authoritative distribution family: `https://cdn.sheetjs.com/xlsx-0.20.3/`
- License: Apache License 2.0
- Expected size: `279523` bytes
- Expected SHA-256: `0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939`
- Independently observed Git blob SHA: `5bf1c223ce4bd59685ba711b77dce6da7a9747b8`

## Verification evidence

The selected mini build was cross-checked in two independent public GitHub repositories. Both copies have the same file size and the same Git blob SHA. One vendor manifest records the SHA-256 above for the SheetJS CE 0.20.3 mini build obtained from the SheetJS distribution.

This evidence is used only to verify the bytes. Do not add a runtime dependency on either mirror.

## Required verification before commit

1. Obtain the exact `xlsx.mini.min.js` bytes whose SHA-256 is `0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939`.
2. Verify file size is `279523` bytes.
3. Verify SHA-256 before creating the repository blob.
4. Preserve the upstream copyright/license header.
5. Add the applicable Apache-2.0 license/attribution alongside the vendored file before publication.
6. Run `tools/reconcile/tests/xlsx-adapter.test.mjs` and real browser XLSX read/write validation.

Do not commit a third-party mirror merely because it claims to be version 0.20.3. The exact bytes must match the pinned checksum.

`xlsx-adapter.mjs` additionally rejects a loaded runtime whose `XLSX.version` is not exactly `0.20.3`. The runtime version check is defense in depth and does not replace byte-level checksum verification.
