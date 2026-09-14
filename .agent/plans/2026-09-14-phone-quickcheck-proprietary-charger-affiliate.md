# ExecPlan — Phone QuickCheck proprietary fast-charger affiliate coverage

## Goal

Close the charger-CTA gap for maintained OPPO, Xiaomi, and Motorola phones without relabeling proprietary charging protocols as generic USB-PD.

## Scope

- add reusable charger classes for OPPO SUPERVOOC, Xiaomi HyperCharge/TurboCharge, and Motorola TurboPower;
- add fixed Amazon Japan tagged-search offers for those classes;
- resolve the classes from maintained protocol labels in `app.js`;
- keep exact device charging wattage visible in phone facts and require users to confirm the charger's matching wattage;
- add behavior regression coverage proving proprietary classes appear while generic USB-PD classes do not appear unless USB-PD is explicitly maintained.

## Non-goals

- no per-phone Amazon URLs;
- no live Amazon price/stock/rating data;
- no assumption that one proprietary charger wattage fits every phone in the protocol family;
- no changes to device source facts.

## Acceptance

- every accessory class has a fixed tagged Amazon search offer;
- OPPO SUPERVOOC, Xiaomi HyperCharge/TurboCharge, and Motorola TurboPower fixtures render their dedicated charger guidance;
- Xiaomi proprietary-only fixture still does not receive generic USB-PD charger guidance;
- Phone QuickCheck data, source semantics, affiliate and behavior checks all pass.
