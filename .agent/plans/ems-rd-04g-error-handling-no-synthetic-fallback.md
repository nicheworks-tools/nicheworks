# EMS-RD-04G Error Handling / No Synthetic Fallback

## Scope
- `functions/api/earth-map-suite/*` research endpoints only.
- `tools/earth-map-suite/EMS_RD_04_ERROR_HANDLING.md` shared documentation.

## Files to touch
- Add `tools/earth-map-suite/EMS_RD_04_ERROR_HANDLING.md`.
- Update only endpoint response wording in `functions/api/earth-map-suite/*` if review finds ambiguous success on failure paths.

## Constraints
- Do not change Storm / Compare / Card UI.
- Do not add public UI connections.
- Do not add dependencies.
- Do not modify common specs.
- Do not fabricate real data or synthetic fallbacks.

## Steps
1. Inspect Earth Map Suite research endpoints for error-code handling and ambiguous success wording.
2. Document required error codes and no-fallback behavior.
3. Patch only endpoint response wording/status where an endpoint claims real-data success despite probe/synthetic/failure output.
4. Run lightweight validation (search and syntax checks if applicable).
5. Commit changes and create one PR.

## Manual verification
- Confirm the documentation lists all required error codes.
- Confirm real endpoint failures return explicit unavailable/error states.
- Confirm any synthetic preview is documented as separate from real outputs.
- Confirm no public UI wiring was added.
