# ManualFinder Affiliate Coverage

Updated: 2026-09-13

This file tracks ManualFinder commerce coverage separately from the official manual/source dataset. Official manufacturer destinations remain the primary output. Amazon offers are optional next actions and are activated only after an exact Special Link has been generated and verified for the NicheWorks Associates account.

## Status contract

- `verified`: an exact HTTPS Amazon Special Link has been generated and checked; the offer may enter runtime configuration.
- `pending_special_link`: the ManualFinder model is accepted for the planned commerce wave, but no verified Special Link is recorded yet; runtime must not show an Amazon CTA.
- Missing/unrecognized status or empty/invalid URL: fail closed; no Amazon CTA.

The runtime allowlist accepts verified HTTPS destinations on `amzn.to`, `amazon.co.jp`, or `www.amazon.co.jp`. No Amazon URL may be inferred from maker/model text, and no tag may be mechanically appended to an unverified URL.

## Current coverage

| Maker | Model | Category | Offer type | Status | Special Link | Verified |
| --- | --- | --- | --- | --- | --- | --- |
| Nikon | Z8 | Camera / video | Amazon search | verified | `https://amzn.to/3T7sxbB` | 2026-09-13 |
| Brother | MFC-J1500N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J1605DN | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J4440N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J4443N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J4450N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J4510N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J4540N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J4543N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J4720N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J4725N | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J6995CDW | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J6997CDW | Printer / MFP | Amazon search | pending_special_link | — | — |
| Brother | MFC-J6999CDW | Printer / MFP | Amazon search | pending_special_link | — | — |

Current runtime coverage: **1 verified offer / 14 ledger rows**.

## Wave order

1. Prove the Nikon Z8 search handoff end to end — complete.
2. Capture exact Amazon search Special Links for the 13 accepted Brother MFC-J models above.
3. Activate Brother rows only as their exact links are supplied and checked; partial activation is allowed.
4. After search handoffs are stable, evaluate model-specific consumables/accessories as separate offers. Compatibility must be independently verified; never infer cartridge, toner, battery, charger, filter, or other accessory compatibility from a model name alone.
5. Rotate next to other commercially useful ManualFinder families rather than attempting blanket coverage of all records.

## Runtime boundary

`affiliate-config.js` is fail-closed. It exposes the full ledger as `window.MANUALFINDER_AFFILIATE_LEDGER`, but builds `MANUALFINDER_AFFILIATE_CONFIG.targets` and `.offers` only from `verified` rows with an approved HTTPS Amazon host. Pending rows therefore remain visible to maintainers but cannot appear to users.
