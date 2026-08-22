#!/usr/bin/env bash
# Refresh the committed orbital snapshot from CelesTrak.
#
# The app screens a COMMITTED snapshot, never the live network — a demo must not
# depend on conference wifi. This script is the only thing that touches the
# network, and it is run by hand, not by the app.
#
# After running it, update src/data/snapshot/manifest.json (capturedAtUtc and the
# per-group object counts) so the app's provenance footer stays true.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=src/data/snapshot
BASE="https://celestrak.org/NORAD/elements/gp.php"

for GROUP in stations cosmos-1408-debris iridium-33-debris cosmos-2251-debris; do
  echo "fetching $GROUP"
  curl -fsS "$BASE?GROUP=$GROUP&FORMAT=tle" -o "$OUT/$GROUP.txt"
  echo "  $(( $(wc -l < "$OUT/$GROUP.txt") / 3 )) objects"
  sleep 2   # CelesTrak asks clients not to hammer the endpoint
done

echo
echo "Snapshot refreshed. Now update capturedAtUtc and the object counts in"
echo "$OUT/manifest.json, then re-run: npm run screen && npm run build"
