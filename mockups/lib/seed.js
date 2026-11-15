// Mockup-only: extends the real timeline into a made-up future so the Experience page can be judged with a long career.
// Real data is left alone except that its "current" contract is closed. `?seed=0` turns this off.
// All employers below are invented. The pretend "today" is NOW.

export const NOW = new Date('2034-03-01T00:00:00Z')

const E = (id, company, title, start_date, end_date, group, skills, headline, description) =>
  ({ id, company, title, start_date, end_date: end_date || '', current: !end_date, group, skills, headline, description })

export function seed(rawG, rawE) {
  const sys = rawG.find((g) => /SYSTOLIC/i.test(g.name))
  const cur = rawE.find((e) => e.current)
  if (cur) { cur.current = false; cur.end_date = '2026-03-31' }
  const s = sys?.id ?? ''
  const h = 'seed-halcyon'

  const groups = [
    { id: h, name: 'Halcyon Federal', description: 'Prime contractor for civilian-agency modernization programs. Engineers rotate between programs as contracts are won and wrapped up.' },
  ]
  const exps = [
    E('s1', 'Aldera Systems', 'Senior Software Engineer', '2026-04-01', '2027-03-31', s, ['Ruby', 'Ruby on Rails', 'PostgreSQL', 'Redis', 'Docker', 'AWS'], 'Led the move of a staffing platform from a monolith to service boundaries.', ['Split the scheduling and clearance workflows into separate services behind a shared API gateway.', 'Cut p95 page latency from 1.9s to 400ms by moving report generation to background jobs.', 'Mentored three engineers and ran the weekly architecture review.']),
    E('s2', 'Corvane Technologies', 'Tech Lead', '2027-04-01', '2028-08-31', s, ['TypeScript', 'React', 'Node', 'PostgreSQL', 'Kubernetes', 'Terraform'], 'Led a team of six building a records-retention portal for a federal agency.', ['Owned delivery for a six-person team across two release trains.', 'Introduced contract tests between the portal and three upstream systems.', 'Wrote the infrastructure as code for the staging and production clusters.', 'Ran the accreditation paperwork with the security office.']),
    E('s3', 'Ironbridge Analytics', 'Senior Software Engineer', '2028-09-01', '2029-06-30', s, ['Python', 'Django', 'PostgreSQL', 'Celery', 'Docker'], 'Built ingestion pipelines for a sensor-data analytics product.', ['Built an ingestion pipeline handling 40M events a day.', 'Replaced a hand-rolled scheduler with Celery and cut missed jobs to zero.']),
    E('s4', 'Tessera Labs', 'Staff Engineer', '2029-07-01', '2030-05-31', '', ['Go', 'gRPC', 'PostgreSQL', 'Kafka', 'Kubernetes'], 'Designed the event backbone for a logistics-tracking platform.', ['Designed an event-sourced shipment ledger on Kafka and Postgres.', 'Set the service template that eight teams then adopted.', 'Led the incident review process after a 3-hour outage.']),
    E('s5', 'Vantage Robotics', 'Principal Engineer', '2030-06-01', '2031-04-30', '', ['Rust', 'C++', 'ROS', 'Linux', 'Git'], 'Worked on the fleet-control software for warehouse robots.', ['Rewrote the path-planning service in Rust, halving CPU use on the robots.', 'Defined the on-robot update protocol and rollback rules.']),
    E('s6', 'Brightwater Analytics', 'Staff Engineer', '2031-05-01', '2032-01-31', h, ['TypeScript', 'Vue', 'Node', 'GraphQL', 'PostgreSQL'], 'Rebuilt the public data explorer for a state health department.', ['Rebuilt the explorer UI in Vue with a shared design system.', 'Introduced a GraphQL layer in front of eleven legacy endpoints.']),
    E('s7', 'Orion Dynamics', 'Principal Engineer', '2032-02-01', '2032-11-30', h, ['Java', 'Spring', 'PostgreSQL', 'Terraform', 'AWS'], 'Led the eligibility-engine rewrite for a benefits program.', ['Wrote the rules engine that replaced 14,000 lines of stored procedures.', 'Ran a six-month parallel run against the old system with no regressions.', 'Trained the agency team to maintain it.']),
    E('s8', 'Halcyon Federal', 'Solutions Architect', '2032-12-01', '2033-09-30', h, ['AWS', 'Terraform', 'Kubernetes', 'Python', 'Git'], 'Set technical direction across four concurrent programs.', ['Wrote the reference architecture four programs now share.', 'Reviewed 60+ design documents and ran the cross-program guild.', 'Cut cloud spend by a fifth through right-sizing and reserved capacity.']),
    E('s9', 'Meridian Labs', 'Engineering Manager', '2033-10-01', '', '', ['TypeScript', 'React', 'Node', 'PostgreSQL', 'Kubernetes', 'Datadog'], 'Manage a team of nine building a clinical-trial data platform.', ['Hiring, growth and delivery for two squads and a platform group.', 'Own the roadmap with product and the compliance office.', 'Still ship code on the highest-risk migrations.']),
  ]
  return { rawG: [...rawG, ...groups], rawE: [...rawE, ...exps] }
}

const P = (id, name, start, end, stack, highlights, code, demo) =>
  ({ id, name, start_date: `${start} 00:00:00.000Z`, end_date: end ? `${end} 00:00:00.000Z` : '', current: !end, stack, highlights, code_url: code || '', demo_url: demo || '' })

/** Invented side projects spanning many stacks, so tech filtering can be judged. Real projects are kept. */
export function seedProjects(rawP) {
  const ps = [
    P('sp1', 'Tidepool', '2026-04-02', '2026-09-30', ['Rust', 'WebAssembly', 'TypeScript', 'Vite'], ['A browser tide-and-weather planner that runs its physics in WebAssembly.', 'Renders 60fps charts from 40 years of tide data.'], 'https://example.com/tidepool', 'https://example.com/tidepool'),
    P('sp2', 'Cairn', '2026-10-02', '2027-03-31', ['Go', 'SQLite', 'HTMX', 'Docker'], ['A single-binary notes server with full-text search and no JavaScript build.', 'Backs up to any S3-compatible bucket.'], 'https://example.com/cairn', ''),
    P('sp3', 'Lumen', '2027-05-02', '2027-12-31', ['Swift', 'SwiftUI', 'CoreData'], ['An iOS habit tracker with widgets and a lock-screen streak.', 'Syncs over CloudKit without an account.'], '', 'https://example.com/lumen'),
    P('sp4', 'Fathom', '2028-02-02', '2028-08-31', ['Python', 'FastAPI', 'PostgreSQL', 'Celery', 'Docker'], ['A self-hosted log-search tool for small teams.', 'Ingests 5k lines a second on a 2-core VM.'], 'https://example.com/fathom', ''),
    P('sp5', 'Sable', '2028-09-02', '2029-02-28', ['Kotlin', 'Jetpack Compose', 'Room'], ['An Android reading list with offline article archives.', 'Archives pages as clean text, images included.'], '', 'https://example.com/sable'),
    P('sp6', 'Ledgerlight', '2029-03-02', '2029-11-30', ['TypeScript', 'Next.js', 'Prisma', 'PostgreSQL', 'TailwindCSS'], ['A bookkeeping app for freelancers.', 'Reads bank exports and proposes categories.'], 'https://example.com/ledgerlight', 'https://example.com/ledgerlight'),
    P('sp7', 'Quill Engine', '2030-01-02', '2030-07-31', ['C++', 'OpenGL', 'CMake'], ['A tiny 2D renderer with a text-first scene format.', 'Draws a 10k-sprite scene in under 2ms.'], 'https://example.com/quill', ''),
    P('sp8', 'Marrow', '2030-09-02', '2031-03-31', ['Elixir', 'Phoenix', 'LiveView', 'PostgreSQL'], ['A real-time collaborative recipe board.', 'Edits merge live without conflicts.'], 'https://example.com/marrow', 'https://example.com/marrow'),
    P('sp9', 'Orrery', '2031-06-02', '2032-01-31', ['Python', 'PyTorch', 'Jupyter'], ['A small model that predicts bus arrival times from public feeds.', 'Cut median error from 4 to 1.5 minutes.'], 'https://example.com/orrery', ''),
    P('sp10', 'Haven', '2032-03-02', '2032-10-31', ['Java', 'Spring', 'Kafka', 'Kubernetes'], ['An event-driven home-automation hub.', 'Runs on three Raspberry Pis.'], 'https://example.com/haven', ''),
    P('sp11', 'Glasswing', '2033-01-02', '', ['Vue', 'TypeScript', 'Rust', 'PocketBase'], ['A design-token editor that exports to CSS, Swift and Kotlin.', 'Used by two open-source projects.'], 'https://example.com/glasswing', 'https://example.com/glasswing'),
    P('sp12', 'Nightjar', '2033-11-02', '', ['Go', 'React', 'TypeScript', 'Terraform', 'AWS'], ['An uptime monitor that runs probes from the edge.', 'Alerts to Slack, email and a push app.'], 'https://example.com/nightjar', ''),
  ]
  const X = {
    sp1: { kind: 'Web app', metric_value: '60fps', metric_label: 'charts from 40 yrs of data', summary: 'Tide tables are usually a PDF. Tidepool turns them into an interactive planner: pick a harbour, a date and a draft, and it shows safe windows. The physics core is Rust compiled to WebAssembly so scrubbing the timeline never drops a frame.', challenges: 'Keeping the WASM boundary cheap: passing typed arrays instead of objects cut the frame time from 14ms to 3ms.' },
    sp2: { kind: 'CLI + server', metric_value: '9 MB', metric_label: 'single binary', summary: 'A notes server that ships as one Go binary with SQLite inside. Search is SQLite FTS5, the UI is server-rendered with HTMX, and a nightly job pushes a backup to any S3-compatible bucket.', challenges: 'Making full-text ranking feel right on short notes took a custom BM25 weighting.' },
    sp3: { kind: 'Mobile app', metric_value: '4.8', metric_label: 'App Store rating', summary: 'A habit tracker built around the lock screen: one glance shows the streak, one tap logs the day. CloudKit syncs devices without an account.' },
    sp4: { kind: 'Web app', metric_value: '5k/s', metric_label: 'log lines ingested', summary: 'Self-hosted log search for teams who do not want a SaaS bill. FastAPI ingests, Celery indexes into Postgres, and a small UI does the querying.' },
    sp5: { kind: 'Mobile app', metric_value: '1,200', metric_label: 'saved articles offline', summary: 'An Android reading list that stores clean, offline copies of every article, images included, and syncs read state through Room.' },
    sp6: { kind: 'Web app', metric_value: '90%', metric_label: 'transactions auto-categorised', summary: 'Bookkeeping for freelancers: drop in a bank export and it proposes categories, invoices and quarterly tax estimates.', challenges: 'Teaching the categoriser from corrections, with no model hosting.' },
    sp7: { kind: 'Library', metric_value: '<2ms', metric_label: '10k-sprite frame', summary: 'A small 2D renderer for games that read like text files. Scenes are plain text, hot-reloaded on save.' },
    sp8: { kind: 'Web app', metric_value: '0', metric_label: 'edit conflicts', summary: 'A recipe board where several cooks edit at once. LiveView pushes diffs, and CRDT merges mean nobody ever sees a conflict dialog.' },
    sp9: { kind: 'Research', metric_value: '1.5 min', metric_label: 'median error (from 4)', summary: 'A small model that predicts bus arrivals from public GTFS feeds and weather. Trained on a laptop, served as a single endpoint.' },
    sp10: { kind: 'System', metric_value: '3', metric_label: 'Raspberry Pis', summary: 'An event-driven home-automation hub. Devices publish to Kafka, small Spring services react, and Kubernetes keeps it all running on three Pis.' },
    sp11: { kind: 'Web app', metric_value: '2', metric_label: 'open-source adopters', summary: 'A design-token editor: edit colours and spacing once, export CSS, Swift and Kotlin. The exporter is Rust, the editor is Vue, and PocketBase stores the sets.' },
    sp12: { kind: 'Web app', metric_value: '12', metric_label: 'edge regions', summary: 'An uptime monitor that runs its probes from the edge, so an outage in one region is not mistaken for yours.' },
  }
  return [...ps.map((p) => ({ ...p, ...X[p.id] })), ...rawP]
}
