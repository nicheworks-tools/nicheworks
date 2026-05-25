#!/usr/bin/env bash
set -euo pipefail

# NicheWorks fresh clone helper
# This does not modify an existing local ~/nicheworks folder.
# It creates a fresh GitHub main copy in a timestamped folder.

DEST_BASE="${1:-$HOME}"
TS="$(date +%Y%m%d-%H%M%S)"
DEST="$DEST_BASE/nicheworks-main-$TS"

echo "Creating fresh GitHub main clone at: $DEST"
git clone --branch main --single-branch https://github.com/nicheworks-tools/nicheworks.git "$DEST"

echo ""
echo "Done. Fresh copy: $DEST"
echo "Next: cd '$DEST'"
echo "Run SEO audit: node scripts/audit-seo.mjs"
