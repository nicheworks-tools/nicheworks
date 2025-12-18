# API Key & Token Redactor — Tests

This tool detects & redacts secrets **in-browser**.  
For security and repo hygiene, we **do not commit secret-looking test strings** (GitHub Secret Scanning will block / alert).

## Policy
- ❌ Do NOT commit `testdata.txt`, `TESTCASES.md`, or any file containing real/realistic tokens.
- ✅ Commit only:
  - this README
  - a generator script that creates local test data
- ✅ Generated files must be ignored by git.

## How to run (local)
From this folder:

```bash
node ./generate_testdata.js
````

It will create:

* `testdata.generated.txt` (ignored by git)

Copy/paste sections into the tool UI to verify:

* detection counts
* masking output

## Notes

* Generated samples are **dummy** and intended to mimic patterns.
* Even dummy strings may trigger secret scanners; therefore the generated file stays local.

