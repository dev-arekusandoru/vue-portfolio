/// <reference path="../pb_data/types.d.ts" />

// "Off the clock" cards on the home page. Public read, superuser-only writes.
// Optional stat (value + label, `stat_live` marks a live number) and a small CSS illustration chosen with `art`.
const ITEMS = [
  { title: 'Languages', line: 'Currently Romanian. Corrections welcome.', phrase: 'Bună ziua.', art: 'language' },
  { title: 'Formula 1', line: 'Every race weekend, sectors and all.', art: 'f1' },
  { title: 'Vinyl & new music', line: 'Limited pressings, and always something new on the shelf.', art: 'vinyl' },
  { title: '3D printing', line: 'If a part is missing, I print it.', art: 'print' },
  { title: 'All things tech', line: 'New tools, new boards, new rabbit holes.', art: 'tech' },
]

migrate(
  (app) => {
    app.save(
      new Collection({
        type: 'base',
        name: 'interests',
        listRule: '',
        viewRule: '',
        fields: [
          { type: 'autodate', name: 'created', onCreate: true },
          { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
          { type: 'text', name: 'title', required: true, max: 120 },
          { type: 'text', name: 'line', max: 300 },
          { type: 'text', name: 'phrase', max: 120 },
          { type: 'select', name: 'art', maxSelect: 1, values: ['none', 'language', 'f1', 'vinyl', 'print', 'tech'] },
          { type: 'number', name: 'order', onlyInt: true },
          { type: 'text', name: 'stat_value', max: 40 },
          { type: 'text', name: 'stat_label', max: 80 },
          { type: 'bool', name: 'stat_live' },
        ],
      }),
    )

    const interests = app.findCollectionByNameOrId('interests')
    ITEMS.forEach((item, i) => {
      const record = new Record(interests)
      record.set('title', item.title)
      record.set('line', item.line)
      record.set('phrase', item.phrase || '')
      record.set('art', item.art)
      record.set('order', i + 1)
      app.save(record)
    })
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('interests'))
  },
)
