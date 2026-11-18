#!/usr/bin/env bash
# iOS launch smoke test: build the Capacitor app for the iOS Simulator, install
# it, launch it, and prove it actually comes up — process still alive, no crash
# report, and Capacitor's WebView finished loading the bundle.
#
# Why this exists: the Xcode 27 / iOS 27 SDK made UIScene adoption mandatory and
# every build from the Mac mini runner crashed at launch
# (__UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption) while CI
# stayed green, because nothing ever ran the built app. This runs in CI on the
# same Mac mini that archives the App Store build, so a launch regression blocks
# the merge instead of reaching TestFlight.
#
# Usage: scripts/ios-launch-smoke.sh [--skip-build]
# Expects `npm run build && npx cap sync ios && (cd ios/App && pod install)`
# to have been run already.
set -euo pipefail

cd "$(dirname "$0")/.."

BUNDLE_ID="com.johncorser.countdowns"
SIM_NAME="${SIM_NAME:-iPhone 17 Pro}"
DERIVED="${DERIVED_DATA:-DerivedData}"
APP="$DERIVED/Build/Products/Debug-iphonesimulator/App.app"
SETTLE_SECONDS="${SETTLE_SECONDS:-20}"
OUT_DIR="${SMOKE_OUT_DIR:-smoke-results}"
mkdir -p "$OUT_DIR"

log() { printf '\n==> %s\n' "$*"; }
fail() { printf '\n❌ %s\n' "$*" >&2; exit 1; }

if [[ "${1:-}" != "--skip-build" ]]; then
  log "Building Debug for iOS Simulator"
  BUILD_LOG="$OUT_DIR/xcodebuild.log"
  if ! xcodebuild build \
    -workspace ios/App/App.xcworkspace -scheme App -configuration Debug \
    -destination "platform=iOS Simulator,name=$SIM_NAME" \
    -derivedDataPath "$DERIVED" CODE_SIGNING_ALLOWED=NO -quiet \
    > "$BUILD_LOG" 2>&1; then
    grep -E "error:|BUILD" "$BUILD_LOG" || tail -40 "$BUILD_LOG"
    fail "simulator build failed (full log: $BUILD_LOG)"
  fi
fi
[[ -d "$APP" ]] || fail "No simulator build at $APP"

UDID=$(xcrun simctl list devices available -j \
  | python3 -c "import json,sys; ds=[d for v in json.load(sys.stdin)['devices'].values() for d in v if d['name']=='$SIM_NAME']; print(ds[0]['udid'])")
log "Simulator $SIM_NAME ($UDID)"
xcrun simctl boot "$UDID" 2>/dev/null || true
xcrun simctl bootstatus "$UDID" -b >/dev/null

log "Installing $APP"
xcrun simctl terminate "$UDID" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl uninstall "$UDID" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl install "$UDID" "$APP"

CRASH_DIR="$HOME/Library/Logs/DiagnosticReports"
START_MARKER=$(mktemp)

log "Launching $BUNDLE_ID"
CONSOLE="$OUT_DIR/console.log"
: > "$CONSOLE"
# --console-pty streams the app's stdout (Capacitor's ⚡️ log lines) into our file.
xcrun simctl launch --console-pty "$UDID" "$BUNDLE_ID" > "$CONSOLE" 2>&1 &
LAUNCH_PID=$!
sleep "$SETTLE_SECONDS"

# --console-pty swallows simctl's "bundle: pid" line, so ask the simulator's
# launchd for the app's pid instead (0 if the process has already gone).
PID=$(xcrun simctl spawn "$UDID" launchctl list 2>/dev/null \
  | awk -v b="UIKitApplication:$BUNDLE_ID" '$3 ~ b {print $1}' | head -1)

xcrun simctl io "$UDID" screenshot "$OUT_DIR/launch.png" >/dev/null 2>&1 || true

STATUS=0
if [[ -z "$PID" || "$PID" == "-" || "$PID" == "0" ]] || ! ps -p "$PID" >/dev/null 2>&1; then
  echo "app process is not running ${SETTLE_SECONDS}s after launch (pid='$PID')"; STATUS=1
else
  echo "app process $PID alive after ${SETTLE_SECONDS}s"
fi
NEW_CRASHES=$(find "$CRASH_DIR" -name 'App-*.ips' -newer "$START_MARKER" 2>/dev/null || true)
if [[ -n "$NEW_CRASHES" ]]; then
  echo "crash report(s) written during launch:"; echo "$NEW_CRASHES"
  for f in $NEW_CRASHES; do cp "$f" "$OUT_DIR/"; done
  STATUS=1
fi
if ! grep -q "WebView loaded" "$CONSOLE"; then
  echo "Capacitor never logged 'WebView loaded'"; STATUS=1
fi
if grep -q "⚡️  \[error\]" "$CONSOLE"; then
  echo "JS console errors during launch:"; grep "⚡️  \[error\]" "$CONSOLE"; STATUS=1
fi

log "Console (first 60 lines)"
head -60 "$CONSOLE"

kill "$LAUNCH_PID" 2>/dev/null || true
xcrun simctl terminate "$UDID" "$BUNDLE_ID" 2>/dev/null || true
rm -f "$START_MARKER"

[[ $STATUS -eq 0 ]] || fail "iOS launch smoke FAILED (see $OUT_DIR)"
printf '\n✅ %s launched, stayed alive %ss, WebView loaded, no crash report.\n' "$BUNDLE_ID" "$SETTLE_SECONDS"
