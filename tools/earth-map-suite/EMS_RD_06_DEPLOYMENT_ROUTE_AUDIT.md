# EMS-RD-06 Deployment / Route Audit (Repo-side)

Last updated: 2026-05-18

## Scope audited

- `functions/api/earth-map-suite/`
- `tools/earth-map-suite/`
- root deployment config candidates:
  - `package.json` (root)
  - `wrangler.toml` (root)
  - `_routes.json` (root)
  - `public/_routes.json`
- `.github/workflows/` (for deploy/build clues)

## Current functions directory layout

Current Earth Map Suite functions files under `functions/api/earth-map-suite/`:

- `health.js`
- `manifest.js`
- `probe-status.js`
- `precipitation.js`
- `precipitation-sample.js`
- `precipitation-sample-real.js`
- `precipitation-pixel-probe.js`
- `precipitation-tiff-probe.js`
- `precipitation-ifd-probe.js`
- `precipitation-tile-probe.js`
- `precipitation-feasibility-probe.js`

Related research test harness:

- `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`

## Cloudflare Pages Functions convention check

### Path convention

Cloudflare Pages Functions convention maps:

- `functions/api/earth-map-suite/probe-status.js` -> `/api/earth-map-suite/probe-status`
- `functions/api/earth-map-suite/precipitation-pixel-probe.js` -> `/api/earth-map-suite/precipitation-pixel-probe`
- `functions/api/earth-map-suite/precipitation-sample-real.js` -> `/api/earth-map-suite/precipitation-sample-real`
- `functions/api/earth-map-suite/precipitation-tiff-probe.js` -> `/api/earth-map-suite/precipitation-tiff-probe`
- `functions/api/earth-map-suite/precipitation-ifd-probe.js` -> `/api/earth-map-suite/precipitation-ifd-probe`
- `functions/api/earth-map-suite/precipitation-tile-probe.js` -> `/api/earth-map-suite/precipitation-tile-probe`
- `functions/api/earth-map-suite/precipitation-feasibility-probe.js` -> `/api/earth-map-suite/precipitation-feasibility-probe`
- `functions/api/earth-map-suite/health.js` -> `/api/earth-map-suite/health`
- `functions/api/earth-map-suite/manifest.js` -> `/api/earth-map-suite/manifest`

Repo-side placement appears convention-compatible.

### Export convention

Existing endpoint files use Pages Functions handlers such as `onRequestGet` / `onRequestPost`, which is convention-compatible.

## Route exclusion check (`/api/*`)

### `_routes.json` / `public/_routes.json`

- No root `_routes.json` found.
- No `public/_routes.json` found.

Result: no repository route include/exclude file was found that would explicitly exclude `/api/*`.

## Build/deploy config check

### Root `package.json`

- No root `package.json` found.

### Root `wrangler.toml`

- No root `wrangler.toml` found.

### GitHub workflows

- `.github/workflows/` contains maintenance/data/index workflows.
- No obvious Cloudflare Pages deploy workflow file was identified in-repo.

Repo-side implication:

- Deployment may be managed directly in Cloudflare Pages dashboard (Git integration), outside this repo's workflow config.
- Because root build/deploy files are absent, dashboard project settings (build command/output dir/functions behavior/compat date) become a key verification point.

## Could build output omit `functions/`?

Potential risk exists if Cloudflare Pages project is configured with a different root/build artifact path that does not include this repository `functions/` directory at deploy time.

Observed repo-side state:

- `functions/` exists in the repository root.
- No in-repo deploy script confirms or overrides dashboard behavior.

Conclusion:

- Repo itself does not show a direct blocker.
- Actual deploy inclusion of `functions/` cannot be proven from repo alone; dashboard/manual verification is required.

## Repo-side blocker judgment for `/api/earth-map-suite/*`

### Judgment

- **No explicit repository-side route block found** for `/api/earth-map-suite/*`.
- **File placement appears correct** for Cloudflare Pages Functions path mapping.
- **Primary suspected blocker is external to repo config** (Cloudflare project settings, deployment target branch, or Functions enablement).

## Unresolved items requiring Cloudflare dashboard/manual verification

1. Cloudflare Pages project root directory is repository root (`/`), not a subdirectory.
2. Functions are enabled for the project and recognized at deploy.
3. Production branch matches merged branch containing `functions/api/earth-map-suite/*`.
4. Build command/output settings do not bypass standard Pages Functions discovery.
5. Domain routing (`nicheworks.app` / `nicheworks.pages.dev`) points to the same up-to-date deployment.
6. Latest deployment logs show function bundling for `api/earth-map-suite/*`.
7. Runtime compatibility and limits are not rejecting these functions at deploy/runtime.

