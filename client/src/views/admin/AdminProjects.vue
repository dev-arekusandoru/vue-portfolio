<script setup lang="ts">
import type { RecordModel } from 'pocketbase'
import { computed, onMounted, reactive, ref } from 'vue'
import pb from '@/config/pocketbase'
import ListField from '@/components/admin/ListField.vue'
import { dateIn, dateOut, useRecords, useStatus } from '@/lib/admin'
import { list } from '@/lib/data'

const { items, load, save, remove } = useRecords('projects', '-start_date,created')
const { busy, msg, err, run } = useStatus()

const TEXT = [
  'name',
  'headline',
  'summary',
  'role',
  'kind',
  'code_url',
  'demo_url',
  'metric_value',
  'metric_label',
  'challenges',
  'accent',
] as const
const blank = () => ({
  name: '',
  headline: '',
  summary: '',
  role: '',
  kind: '',
  code_url: '',
  demo_url: '',
  metric_value: '',
  metric_label: '',
  challenges: '',
  accent: '',
  start_date: '',
  end_date: '',
  current: false,
  stack: [] as string[],
  highlights: [] as string[],
})
const draft = reactive(blank())
const selected = ref<string | null>(null) // record id, 'new', or nothing selected
const rec = ref<RecordModel | null>(null) // the saved record behind the form (for its files)

// pending file changes; `fileKey` remounts the file inputs to clear them
const coverFile = ref<File | null>(null)
const removeCover = ref(false)
const newShots = ref<File[]>([])
const removeShots = ref<string[]>([])
const fileKey = ref(0)

onMounted(() => run(load, ''))

function pick(r: RecordModel | null) {
  msg.value = err.value = ''
  selected.value = r ? r.id : 'new'
  rec.value = r
  Object.assign(draft, blank(), {
    ...(r && Object.fromEntries(TEXT.map((k) => [k, r[k] ?? '']))),
    ...(r && {
      start_date: dateIn(r.start_date),
      end_date: dateIn(r.end_date),
      current: !!r.current,
    }),
    stack: r ? list(r.stack) : [],
    highlights: r ? list(r.highlights) : [],
  })
  coverFile.value = null
  removeCover.value = false
  newShots.value = []
  removeShots.value = []
  fileKey.value++
}

const clean = (a: string[]) => a.map((s) => s.trim()).filter(Boolean)
const coverUrl = computed(() =>
  rec.value?.cover && !removeCover.value
    ? pb.files.getURL(rec.value, rec.value.cover, { thumb: '640x0' })
    : '',
)
const shots = computed(() => (rec.value ? list(rec.value.screenshots) : []))

async function submit() {
  const fd = new FormData()
  for (const k of TEXT) fd.append(k, draft[k].trim())
  fd.append('start_date', dateOut(draft.start_date))
  fd.append('end_date', dateOut(draft.end_date))
  fd.append('current', String(draft.current))
  fd.append('stack', JSON.stringify(clean(draft.stack)))
  fd.append('highlights', JSON.stringify(clean(draft.highlights)))
  if (coverFile.value) fd.append('cover', coverFile.value)
  else if (removeCover.value && rec.value?.cover) fd.append('cover-', rec.value.cover)
  for (const f of newShots.value) fd.append('screenshots+', f)
  for (const name of removeShots.value) fd.append('screenshots-', name)

  await run(
    async () => pick(await save(selected.value === 'new' ? null : selected.value, fd)),
    'Saved',
  )
}

async function del() {
  const id = selected.value
  if (!id || id === 'new' || !confirm(`Delete “${draft.name}”?`)) return
  if (await run(() => remove(id), 'Deleted')) selected.value = null
}

const toggle = (arr: string[], v: string) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
</script>

<template>
  <div class="adm-split">
    <aside class="adm-list">
      <button type="button" class="adm-btn primary" @click="pick(null)">+ New project</button>
      <button
        v-for="r in items"
        :key="r.id"
        type="button"
        class="adm-item"
        :aria-current="selected === r.id"
        @click="pick(r)"
      >
        <span>
          <b>{{ r.name }}</b>
          <small
            >{{ dateIn(r.start_date).slice(0, 4)
            }}{{
              r.current ? ' – now' : r.end_date ? ' – ' + dateIn(r.end_date).slice(0, 4) : ''
            }}</small
          >
        </span>
      </button>
    </aside>

    <form v-if="selected" class="adm-form" @submit.prevent="submit">
      <header>
        <h1>{{ selected === 'new' ? 'New project' : draft.name || 'Project' }}</h1>
      </header>

      <label class="adm-field"
        ><span>Name *</span><input v-model="draft.name" type="text" required maxlength="200"
      /></label>
      <label class="adm-field">
        <span>Headline</span>
        <input v-model="draft.headline" type="text" maxlength="200" />
        <span class="adm-hint">Empty: first sentence of the first highlight.</span>
      </label>
      <label class="adm-field"
        ><span>Summary</span><textarea v-model="draft.summary" maxlength="4000"></textarea>
      </label>
      <label class="adm-field"
        ><span>Challenges (“the hard part”)</span
        ><textarea v-model="draft.challenges" maxlength="4000"></textarea>
      </label>

      <div class="adm-row">
        <label class="adm-field"
          ><span>Role</span
          ><input v-model="draft.role" type="text" maxlength="120" placeholder="Solo developer"
        /></label>
        <label class="adm-field"
          ><span>Kind</span
          ><input v-model="draft.kind" type="text" maxlength="60" placeholder="Web app"
        /></label>
        <label class="adm-field"
          ><span>Accent colour</span
          ><input
            v-model="draft.accent"
            type="text"
            maxlength="20"
            placeholder="#ff8c2b (generated if empty)"
        /></label>
      </div>

      <div class="adm-row">
        <label class="adm-field"
          ><span>Start</span><input v-model="draft.start_date" type="date"
        /></label>
        <label class="adm-field"
          ><span>End</span><input v-model="draft.end_date" type="date" :disabled="draft.current"
        /></label>
        <label class="adm-check"><input v-model="draft.current" type="checkbox" /> Ongoing</label>
      </div>
      <div class="adm-row">
        <label class="adm-field"
          ><span>Code URL</span><input v-model="draft.code_url" type="url"
        /></label>
        <label class="adm-field"
          ><span>Demo URL</span><input v-model="draft.demo_url" type="url"
        /></label>
      </div>
      <div class="adm-row">
        <label class="adm-field"
          ><span>Result value</span
          ><input v-model="draft.metric_value" type="text" maxlength="40" placeholder="40%"
        /></label>
        <label class="adm-field"
          ><span>Result label</span
          ><input
            v-model="draft.metric_label"
            type="text"
            maxlength="120"
            placeholder="faster builds"
        /></label>
      </div>

      <ListField v-model="draft.stack" label="Stack" add-label="Technology" />
      <ListField v-model="draft.highlights" label="Highlights" multiline add-label="Highlight" />

      <fieldset class="adm-field" :key="fileKey">
        <legend>Cover</legend>
        <div class="adm-files">
          <figure v-if="coverUrl"><img :src="coverUrl" alt="Current cover" /></figure>
        </div>
        <input
          type="file"
          accept="image/*"
          aria-label="Cover image"
          @change="coverFile = ($event.target as HTMLInputElement).files?.[0] ?? null"
        />
        <label v-if="rec?.cover" class="adm-check"
          ><input v-model="removeCover" type="checkbox" /> Remove current cover</label
        >
      </fieldset>

      <fieldset class="adm-field" :key="'s' + fileKey">
        <legend>Screenshots</legend>
        <div class="adm-files">
          <figure v-for="s in shots" :key="s">
            <img
              :src="pb.files.getURL(rec!, s)"
              :alt="s"
              :style="removeShots.includes(s) ? 'opacity:.3' : ''"
            />
            <label class="adm-check">
              <input
                type="checkbox"
                :checked="removeShots.includes(s)"
                @change="removeShots = toggle(removeShots, s)"
              />
              Remove
            </label>
          </figure>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          aria-label="Add screenshots"
          @change="newShots = [...(($event.target as HTMLInputElement).files ?? [])]"
        />
      </fieldset>

      <div class="adm-actions">
        <button class="adm-btn primary" :disabled="busy">Save</button>
        <button
          v-if="selected !== 'new'"
          type="button"
          class="adm-btn danger"
          :disabled="busy"
          @click="del"
        >
          Delete
        </button>
        <span class="grow"></span>
        <span v-if="msg" class="adm-msg" role="status">{{ msg }}</span>
        <span v-if="err" class="adm-err" role="alert">{{ err }}</span>
      </div>
    </form>
    <p v-else :class="err ? 'adm-err' : 'adm-hint'" :role="err ? 'alert' : undefined">
      {{ err || msg || 'Pick a project or add a new one.' }}
    </p>
  </div>
</template>
