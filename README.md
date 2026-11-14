# Portfolio

Personal site: Vue 3 + Vite frontend, PocketBase backend (SQLite) that also serves the built site.

```
client/          Vue app
client/public/   static files copied as-is (resume PDF)
server/
  pb_migrations/ schema + seed, versioned in git
  pocketbase     binary (gitignored, fetched by deploy script)
deploy/          deploy script + systemd user units
```

## Content editing

Everything visible is a PocketBase record — no rebuild needed.

- Admin: <http://127.0.0.1:8091/_/> (in production: `https://alexmuresan.dev/_/`, behind Cloudflare Access)
- `home` — single record: bio, now, interests, goals, skill lists (one skill per line)
- `projects` — `stack` and `highlights` are JSON arrays (one entry per row in the UI)
- `experience_groups` — company/org wrappers
- `experiences` — `group` relation is optional; ungrouped ones render standalone

Public read, superuser-only writes. Edits are live immediately.

## Local development

```sh
cd server && ./pocketbase serve --http=127.0.0.1:8091   # API + admin on :8091
cd client && npm install && npm run dev                # app on :5173, talks to :8091
```

The frontend picks its API origin automatically: `http://127.0.0.1:8091` in dev, same-origin in production.
Override with `VITE_PB_URL`.

## Schema changes

Add a file to `server/pb_migrations/`:

```sh
cd server && ./pocketbase migrate create "add_something"
```

Dashboard-driven schema edits also write a migration file there (automigrate is on) — commit it.

## Deploy

```sh
deploy/deploy.sh
```

Builds the client, syncs `dist/` into `~/portfolio/pb_public/`, syncs migrations, installs the binary,
and restarts the user service.

Layout on the box:

| Path | Purpose |
|---|---|
| `~/portfolio/pb_data` | SQLite DB, uploads, backups |
| `~/portfolio/pb_public` | built site (replaced on every deploy) |
| `~/portfolio/pb_migrations` | applied migrations |
| `~/.config/systemd/user/portfolio.service` | PocketBase on `127.0.0.1:8091` |

Linger is enabled, so the service starts at boot without a login session.

## Tunnel

`cloudflared` (host binary, user service) publishes `alexmuresan.dev` → `http://127.0.0.1:8091`.
Nothing listens on a public interface; PocketBase stays on loopback.

## Backups

PocketBase: Settings → Backups (built-in, keeps zips in `pb_data/backups`).
Bare minimum manual copy:

```sh
sqlite3 ~/portfolio/pb_data/data.db ".backup '/tmp/portfolio-$(date +%F).db'"
```
