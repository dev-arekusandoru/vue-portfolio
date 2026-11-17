/// <reference path="../pb_data/types.d.ts" />

// Optional presentation fields for projects. Everything falls back to a sensible default in the client when empty.
//   headline / summary / role / kind  one-liner, intro paragraph, "Solo developer", "Web app"
//   metric_value + metric_label       the "Result" cell of the title block, e.g. "40%" + "faster builds"
//   challenges                        "The hard part" paragraph
//   cover / screenshots               images (cover also tints the hover plate); thumbs are optional
//   accent                            CSS colour for the row/dialog accent; generated when empty
const IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

migrate(
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')
    projects.fields.add(new TextField({ name: 'headline', max: 200 }))
    projects.fields.add(new TextField({ name: 'summary', max: 4000 }))
    projects.fields.add(new TextField({ name: 'role', max: 120 }))
    projects.fields.add(new TextField({ name: 'kind', max: 60 }))
    projects.fields.add(new TextField({ name: 'metric_value', max: 40 }))
    projects.fields.add(new TextField({ name: 'metric_label', max: 120 }))
    projects.fields.add(new TextField({ name: 'challenges', max: 4000 }))
    projects.fields.add(new FileField({ name: 'cover', maxSelect: 1, maxSize: 8 * 1024 * 1024, mimeTypes: IMAGES, thumbs: ['640x0'] }))
    projects.fields.add(new FileField({ name: 'screenshots', maxSelect: 12, maxSize: 8 * 1024 * 1024, mimeTypes: IMAGES }))
    projects.fields.add(new TextField({ name: 'accent', max: 20 }))
    app.save(projects)
  },
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')
    for (const name of ['headline', 'summary', 'role', 'kind', 'metric_value', 'metric_label', 'challenges', 'cover', 'screenshots', 'accent']) {
      projects.fields.removeByName(name)
    }
    app.save(projects)
  },
)
