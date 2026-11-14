#!/usr/bin/env bash
# Build the site and publish it to the PocketBase instance that serves it.
# Usage: deploy/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-$HOME/portfolio}"
PB_VERSION="${PB_VERSION:-0.40.6}"

cd "$ROOT/client"
npm ci
npm run build

mkdir -p "$APP_DIR/pb_public" "$APP_DIR/pb_migrations"

# Binary: keep a local copy in server/ (gitignored) or fetch it once.
if [[ ! -x "$ROOT/server/pocketbase" ]]; then
  echo "==> fetching PocketBase $PB_VERSION"
  tmp="$(mktemp -d)"
  curl -fsSLo "$tmp/pb.zip" \
    "https://github.com/pocketbase/pocketbase/releases/download/v$PB_VERSION/pocketbase_${PB_VERSION}_linux_amd64.zip"
  unzip -oq "$tmp/pb.zip" -d "$tmp"
  install -m 0755 "$tmp/pocketbase" "$ROOT/server/pocketbase"
  rm -rf "$tmp"
fi

install -m 0755 "$ROOT/server/pocketbase" "$APP_DIR/pocketbase"
rsync -a --delete "$ROOT/client/dist/" "$APP_DIR/pb_public/"
rsync -a --delete "$ROOT/server/pb_migrations/" "$APP_DIR/pb_migrations/"

systemctl --user restart portfolio.service
sleep 1
curl -fsS -o /dev/null "http://127.0.0.1:8091/api/health" && echo "==> deployed and healthy"
