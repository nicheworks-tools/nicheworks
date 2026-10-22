# UNKNOWN-origin anomalies — preservation record

Baseline: `59c95840bdff50cb2660eda12605d0ee1b071dc2` in `nicheworks-tools/nicheworks`.
Preservation date: 2026-09-17. Earlier inspection and metadata: [RECOVERY.md](RECOVERY.md).

## Construction Tools Atlas

Path: `tools/construction-tools-atlas/data/tools.basic.json`.

- Baseline HEAD: valid JSON array, 14,177,079 bytes; mode `100644`.
- HEAD blob: `da6dd7e10dc8f4227ea8993523ddce0a13726879`.
- HEAD SHA-256: `d9c8317a365b8aba7d943eaf3d27abf61ba131f6b63063ede31dae9063fd7b58`.
- Recovered anomaly: 11,088,896 bytes, exactly the first 11,088,896 bytes of the baseline file; final 3,088,183 bytes missing.
- Recovered SHA-256: `ae0c5de21929f63eed305b9a62c7a25355d9597faafc6b3bebb5bf569f2aa64d`.
- Malformed JSON: ends inside a string; parser reports an unterminated string at line 329249, column 13.
- Attribution: **UNKNOWN**.

Exact reconstruction is possible by reading the blob for this path at the recorded baseline HEAD and taking exactly its first 11,088,896 bytes. This is a byte operation, not a character or line operation. The reconstruction was not performed and the malformed 11 MB file was not copied into evidence.

## Old Kanji Reference

Path: `tools/old-kanji-reference/dict.json`.

- Baseline HEAD: symbolic link, Git mode `120000`.
- Exact link target: `../kanji-modernizer/dict.json`.
- HEAD blob: `b3cba3b761ccd9d8885541ac87edb1c19c56ef43`.
- Link blob: 29 bytes with no trailing newline; SHA-256 `e09ef65613a7cf7cc60ba0c5206c3907b3a70231d633526c59195665c74b38c2`.
- Recovered anomaly: symlink absent. Its target dictionary still existed and parsed successfully as JSON.
- Attribution: **UNKNOWN**.

## Attribution and authorized restoration

There is no evidence proving the audit caused either anomaly. There is no evidence proving either anomaly predated the audit. No causation is asserted.

Restoration is being performed only to return these two tracked production paths to their exact state at the recorded baseline HEAD before preserving audit artifacts. It is not a product-quality fix. No other production path is authorized for restoration.

The recovery record remains an unchanged historical snapshot. The report recovery addendum records this subsequent restoration. Baseline equality, JSON validity, symlink target and Git mode must be verified before the preservation commit.
