/// <reference path="../pb_data/types.d.ts" />

// One-line summary of each role, shown on collapsed experience cards.
const HEADLINES = {
  'SYSTOLIC Inc|Software Engineer': 'Built an internal app for staffing, acquisitions, security and management operations.',
  'Peraton|Software Engineer': 'Prototyped a Cyber Threat Intelligence exchange web app for a government agency.',
  'Katapult Engineering|Software Development Intern': 'Fixed bugs and built custom features for client products as an engineering intern.',
}

migrate(
  (app) => {
    const experiences = app.findCollectionByNameOrId('experiences')
    experiences.fields.add(new TextField({ name: 'headline', max: 200 }))
    app.save(experiences)

    for (const record of app.findAllRecords('experiences')) {
      const headline = HEADLINES[`${record.get('company')}|${record.get('title')}`]
      if (headline) {
        record.set('headline', headline)
        app.save(record)
      }
    }
  },
  (app) => {
    const experiences = app.findCollectionByNameOrId('experiences')
    experiences.fields.removeByName('headline')
    app.save(experiences)
  },
)
