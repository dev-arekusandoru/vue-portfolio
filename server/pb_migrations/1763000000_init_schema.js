/// <reference path="../pb_data/types.d.ts" />

// Public read, superuser-only writes — mirrors the old manifest.yml policies.
const PUBLIC_READ = { listRule: '', viewRule: '' }

// Every collection keeps created/updated so the API can sort deterministically.
const TIMESTAMPS = [
  { type: 'autodate', name: 'created', onCreate: true },
  { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
]

migrate(
  (app) => {
    app.save(
      new Collection({
        type: 'base',
        name: 'home',
        ...PUBLIC_READ,
        fields: [
          ...TIMESTAMPS,
          { type: 'text', name: 'overview', max: 20000 },
          { type: 'text', name: 'now', max: 20000 },
          { type: 'text', name: 'interests', max: 20000 },
          { type: 'text', name: 'futureGoals', max: 20000 },
          { type: 'text', name: 'languages', max: 20000 },
          { type: 'text', name: 'frameworks', max: 20000 },
          { type: 'text', name: 'databases', max: 20000 },
          { type: 'text', name: 'devops', max: 20000 },
        ],
      }),
    )

    const groups = new Collection({
      type: 'base',
      name: 'experience_groups',
      ...PUBLIC_READ,
      fields: [
        ...TIMESTAMPS,
        { type: 'text', name: 'name', required: true, max: 200 },
        { type: 'text', name: 'description', max: 10000 },
      ],
    })
    app.save(groups)

    app.save(
      new Collection({
        type: 'base',
        name: 'experiences',
        ...PUBLIC_READ,
        fields: [
          ...TIMESTAMPS,
          { type: 'text', name: 'company', required: true, max: 200 },
          { type: 'text', name: 'title', required: true, max: 200 },
          { type: 'date', name: 'start_date' },
          { type: 'date', name: 'end_date' },
          { type: 'bool', name: 'current' },
          { type: 'json', name: 'description', maxSize: 20000 },
          { type: 'json', name: 'skills', maxSize: 5000 },
          {
            type: 'relation',
            name: 'group',
            collectionId: groups.id,
            maxSelect: 1,
            cascadeDelete: false,
          },
        ],
        indexes: ['CREATE INDEX idx_experiences_group ON experiences (group)'],
      }),
    )

    app.save(
      new Collection({
        type: 'base',
        name: 'projects',
        ...PUBLIC_READ,
        fields: [
          ...TIMESTAMPS,
          { type: 'text', name: 'name', required: true, max: 200 },
          { type: 'url', name: 'code_url' },
          { type: 'url', name: 'demo_url' },
          { type: 'date', name: 'start_date' },
          { type: 'date', name: 'end_date' },
          { type: 'bool', name: 'current' },
          { type: 'json', name: 'stack', maxSize: 5000 },
          { type: 'json', name: 'highlights', maxSize: 20000 },
        ],
        indexes: ['CREATE INDEX idx_projects_start_date ON projects (start_date)'],
      }),
    )
  },
  (app) => {
    for (const name of ['projects', 'experiences', 'experience_groups', 'home']) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch {
        // already gone
      }
    }
  },
)
