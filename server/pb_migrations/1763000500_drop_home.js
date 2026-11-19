/// <reference path="../pb_data/types.d.ts" />

// The `home` collection predates the client's current home page; nothing reads it any more.
migrate(
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('home'))
    } catch {
      // already gone (fresh installs run the seed first, so normally it exists)
    }
  },
  (app) => {
    app.save(
      new Collection({
        type: 'base',
        name: 'home',
        listRule: '',
        viewRule: '',
        fields: [
          { type: 'autodate', name: 'created', onCreate: true },
          { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
          ...['overview', 'now', 'interests', 'futureGoals', 'languages', 'frameworks', 'databases', 'devops'].map(
            (name) => ({ type: 'text', name, max: 20000 }),
          ),
        ],
      }),
    )
  },
)
