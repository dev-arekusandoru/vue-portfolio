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
- `projects` — `stack` and `highlights` are JSON arrays (one entry per row in the UI). Optional: `headline`, `summary`, `role`, `kind`, `metric_value` + `metric_label`, `challenges`, `cover`, `screenshots`, `accent`; each falls back to something derived from the rest
- `interests` — the "Off the clock" cards: `title`, `line`, `phrase`, `art` (small CSS illustration), `order`, and an optional stat (`stat_value`, `stat_label`, `stat_live`)
- `experience_groups` — company/org wrappers
- `experiences` — `group` relation is optional; ungrouped ones render standalone

Public read, superuser-only writes. Edits are live immediately.

## Local development

```sh
cd server && ./pocketbase serve --http=127.0.0.1:8091   # API + admin on :8091
cd client && npm install && npm run dev                # app on :5173, /api proxied to :8091
```

The frontend always talks to its own origin: the Vite dev server proxies `/api` to `:8091`, and in production PocketBase serves both.
Override with `VITE_PB_URL`.

Tech icons are bundled SVGs in `client/src/assets/tech`. To add one, list it in `client/scripts/tech-icons.json` and run `npm run icons` in `client/`.

`mockups/` holds the HTML design prototypes the Vue app was ported from (`python3 mockups/serve.py`, then <http://127.0.0.1:5180>).

## Frontend architecture

Idiomatic Vue 3 (`client/src`):

- `views/`, `components/` — pages and UI as SFCs; `ProjectDialog.vue` + `ProjectModalHost.vue` are the project detail modal
- `composables/useTechFilter.ts` — shared tech-filter selection state
- `lib/data.ts` — PocketBase loading and normalisation; `lib/icons.ts` + `TechIcon.vue` render the bundled tech icons
- `lib/*.css` — feature stylesheets imported by the components that use them

Two modules are deliberately imperative (rAF/canvas loops that own their DOM): `lib/filters/graph.ts` (tech graph, mounted by `TechGraph.vue`) and `lib/emanator.ts` (experience rail orb, mounted by `ExperienceTimeline.vue`, which also owns the scroll geometry).

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
