#!/usr/bin/env bash
# Collect a run of element sets per object, so positional uncertainty can be
# MEASURED instead of modelled.
#
# The committed snapshot is one instant — every TLE captured together so their
# epochs are mutually consistent, which is what makes a screening run mean
# anything. Successive TLE differencing needs the opposite: several element sets
# for the same object at different epochs. So the history lives beside the
# snapshot rather than replacing it, and nothing the console screens changes.
#
# Like fetch-snapshot.sh this is the only kind of thing in the repo that touches
# the network, and it is run by hand.
#
# Space-Track serves historical element sets and requires an account; CelesTrak
# serves only the current set per object. So this script builds the history by
# APPENDING today's element sets to whatever is already there, and is meant to
# be run daily for a week or two — a cron line, or by hand before a demo.
# Duplicate epochs are dropped on read, so running it twice in a day is safe.
#
# For an immediate history, Space-Track's gp_history class is the right source:
#   https://www.space-track.org/basicspacedata/query/class/gp_history/
#     NORAD_CAT_ID/25544/orderby/EPOCH desc/limit/30/format/tle
# Save that output as src/data/history/25544.txt and it will be picked up.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=src/data/history
BASE="https://celestrak.org/NORAD/elements/gp.php"
mkdir -p "$OUT"

# The objects worth measuring: everything that appears in a high-severity event.
# Measuring all 859 would be 859 requests, which is not a reasonable thing to do
# to a free service, and the fragments that never reach an event do not affect
# any number the console reports.
NORADS="${KESSLER_HISTORY_NORADS:-25544 41599 34550 33764 34874 43719 40930}"

for N in $NORADS; do
  printf 'fetching %s ... ' "$N"
  if curl -fsS "$BASE?CATNR=$N&FORMAT=tle" -o /tmp/kessler-tle.$$ 2>/dev/null; then
    # Append only if this exact epoch is not already recorded.
    EPOCH=$(sed -n '2p' /tmp/kessler-tle.$$ | cut -c19-32)
    if [ -f "$OUT/$N.txt" ] && grep -q "$EPOCH" "$OUT/$N.txt"; then
      echo "already have epoch $EPOCH"
    else
      cat /tmp/kessler-tle.$$ >> "$OUT/$N.txt"
      echo "appended epoch $EPOCH ($(( $(wc -l < "$OUT/$N.txt") / 3 )) sets total)"
    fi
    rm -f /tmp/kessler-tle.$$
  else
    echo "FAILED — object may have decayed or the endpoint is unreachable"
  fi
  sleep 2   # CelesTrak asks clients not to hammer the endpoint
done

echo
echo "History in $OUT. Two element sets per object is the minimum; a week's"
echo "worth is where the numbers settle. Then:"
echo
echo "    npm run uncertainty"
echo
echo "which writes src/data/measuredSigma.json and prints what it measured."
