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
