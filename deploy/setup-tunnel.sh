#!/usr/bin/env bash
# Creates the named tunnel (if missing), DNS record, config and user service.
# Prerequisite: cloudflared tunnel login (writes ~/.cloudflared/cert.pem).
set -euo pipefail

CF="$HOME/.local/bin/cloudflared"
NAME="${TUNNEL_NAME:-portfolio}"
DOMAIN="${DOMAIN:-alexmuresan.dev}"
ORIGIN="${ORIGIN:-http://127.0.0.1:8091}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

[[ -x "$CF" ]] || { echo "missing $CF"; exit 1; }
[[ -f "$HOME/.cloudflared/cert.pem" ]] || { echo "run: $CF tunnel login"; exit 1; }

tunnel_id() {
  "$CF" tunnel list --output json |
    jq -r --arg n "$NAME" 'if type == "array" then . else .tunnels end | map(select(.name == $n)) | .[0].id // empty'
}

id="$(tunnel_id)"
if [[ -z "$id" ]]; then
  echo "==> creating tunnel $NAME"
  "$CF" tunnel create "$NAME" >/dev/null
  id="$(tunnel_id)"
fi
[[ -n "$id" ]] || { echo "could not resolve tunnel id"; exit 1; }
echo "==> tunnel $NAME = $id"

cat >"$HOME/.cloudflared/config.yml" <<EOF
tunnel: $id
credentials-file: $HOME/.cloudflared/$id.json

ingress:
  - hostname: $DOMAIN
    service: $ORIGIN
  - hostname: www.$DOMAIN
    service: $ORIGIN
  - service: http_status:404
EOF


install -m 0644 "$ROOT/deploy/cloudflared-portfolio.service" "$HOME/.config/systemd/user/cloudflared-portfolio.service"
systemctl --user daemon-reload
systemctl --user enable --now cloudflared-portfolio.service
systemctl --user restart cloudflared-portfolio.service

sleep 5
systemctl --user --no-pager --lines=5 status cloudflared-portfolio.service | sed -n '1,10p'
echo "==> checking https://$DOMAIN"
curl -fsS -o /dev/null -w 'site %{http_code}\n' "https://$DOMAIN/" || true
curl -fsS -o /dev/null -w 'api  %{http_code}\n' "https://$DOMAIN/api/health" || true
