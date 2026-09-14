# FastScan OCR Line Repair — Wave 3

INCI FastScan may receive long ingredient names split across OCR lines. Wave 3 adds one conservative repair step after parsing and before matching.

## Rule

Two adjacent parsed fragments are rejoined only when:

1. each fragment is individually unmatched against the maintained dictionary; and
2. joining the two fragments produces an exact maintained INCI/Japanese/alias key.

The repair tests both a normal space join and a direct join. A trailing OCR wrap hyphen may also be removed only when that produces an exact maintained key.

## Non-goals

- No fuzzy line concatenation.
- No automatic spelling correction.
- No joining two ingredients that already match individually.
- No medical/safety inference.

The repaired list is then passed through the existing exact matcher. Repair metadata is kept in the analysis result for debugging/review, but the tool does not silently invent a dictionary identity.

## Privacy and Amazon invariant

This repair runs locally in the browser against already-loaded dictionary data. It sends no OCR text or ingredient text externally. The Amazon affiliate slot/configuration remains isolated and disabled until Associates activation is explicitly performed.
