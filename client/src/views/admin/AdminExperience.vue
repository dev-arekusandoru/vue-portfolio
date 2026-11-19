<script setup lang="ts">
import type { RecordModel } from 'pocketbase'
import { onMounted, reactive, ref } from 'vue'
import ListField from '@/components/admin/ListField.vue'
import { dateIn, dateOut, useRecords, useStatus } from '@/lib/admin'
import { list } from '@/lib/data'

// Two kinds of record share the page: employer groups (optional wrapper) and the experiences themselves.
const groups = useRecords('experience_groups', 'created')
const exps = useRecords('experiences', '-start_date,created')
const { busy, msg, err, run } = useStatus()

type Sel = { kind: 'group' | 'exp'; id: string | null } // id null = new record
const selected = ref<Sel | null>(null)

const blankGroup = () => ({ name: '', description: '' })
const blankExp = () => ({
  company: '',
  title: '',
  headline: '',
  start_date: '',
  end_date: '',
  current: false,
  group: '',
  description: [] as string[],
  skills: [] as string[],
})
const gDraft = reactive(blankGroup())
const eDraft = reactive(blankExp())

onMounted(() => run(() => Promise.all([groups.load(), exps.load()]), ''))

function pickGroup(r: RecordModel | null) {
  msg.value = err.value = ''
  selected.value = { kind: 'group', id: r?.id ?? null }
  Object.assign(gDraft, blankGroup(), r && { name: r.name, description: r.description ?? '' })
}
function pickExp(r: RecordModel | null) {
  msg.value = err.value = ''
  selected.value = { kind: 'exp', id: r?.id ?? null }
  Object.assign(
    eDraft,
    blankExp(),
    r && {
      company: r.company,
      title: r.title,
      headline: r.headline ?? '',
      group: r.group ?? '',
      start_date: dateIn(r.start_date),
      end_date: dateIn(r.end_date),
      current: !!r.current,
      description: list(r.description),
      skills: list(r.skills),
    },
  )
}

const clean = (a: string[]) => a.map((s) => s.trim()).filter(Boolean)

async function submitGroup() {
  const id = selected.value?.id ?? null
  await run(async () => pickGroup(await groups.save(id, { ...gDraft })), 'Saved')
}
async function submitExp() {
  const id = selected.value?.id ?? null
  const body = {
    ...eDraft,
    start_date: dateOut(eDraft.start_date),
    end_date: dateOut(eDraft.end_date),
    description: clean(eDraft.description),
    skills: clean(eDraft.skills),
  }
  await run(async () => pickExp(await exps.save(id, body)), 'Saved')
}

async function del() {
  const sel = selected.value
  if (!sel?.id) return
  const id = sel.id
  const group = sel.kind === 'group'
  const what = group ? gDraft.name : `${eDraft.title} at ${eDraft.company}`
  const note = group ? '\nIts experiences stay, as standalone entries.' : ''
  if (!confirm(`Delete “${what}”?${note}`)) return
  const ok = await run(async () => {
    if (group) {
      await groups.remove(id)
      await exps.load() // their `group` was cleared by the server
    } else await exps.remove(id)
  }, 'Deleted')
  if (ok) selected.value = null
}

const isSel = (kind: Sel['kind'], id: string) =>
  selected.value?.kind === kind && selected.value.id === id
const range = (r: RecordModel) =>
  `${dateIn(r.start_date).slice(0, 4)}${r.current ? ' – now' : r.end_date ? ' – ' + dateIn(r.end_date).slice(0, 4) : ''}`
</script>

<template>
  <div class="adm-split">
    <aside class="adm-list">
      <h2>Groups</h2>
      <button type="button" class="adm-btn primary" @click="pickGroup(null)">+ New group</button>
      <button
        v-for="g in groups.items.value"
        :key="g.id"
        type="button"
        class="adm-item"
        :aria-current="isSel('group', g.id)"
        @click="pickGroup(g)"
      >
        <span
          ><b>{{ g.name }}</b></span
        >
      </button>

      <h2>Experiences</h2>
      <button type="button" class="adm-btn primary" @click="pickExp(null)">+ New experience</button>
      <button
        v-for="r in exps.items.value"
        :key="r.id"
        type="button"
        class="adm-item"
        :aria-current="isSel('exp', r.id)"
        @click="pickExp(r)"
      >
        <span>
          <b>{{ r.title }}</b>
          <small>{{ r.company }} · {{ range(r) }}</small>
        </span>
      </button>
    </aside>

    <form v-if="selected?.kind === 'group'" class="adm-form" @submit.prevent="submitGroup">
      <header>
        <h1>{{ selected.id ? gDraft.name || 'Group' : 'New group' }}</h1>
      </header>
      <label class="adm-field"
        ><span>Name *</span><input v-model="gDraft.name" type="text" required maxlength="200"
      /></label>
      <label class="adm-field"
        ><span>Description</span
        ><textarea v-model="gDraft.description" maxlength="10000"></textarea>
      </label>
      <div class="adm-actions">
        <button class="adm-btn primary" :disabled="busy">Save</button>
        <button
          v-if="selected.id"
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

    <form v-else-if="selected?.kind === 'exp'" class="adm-form" @submit.prevent="submitExp">
      <header>
        <h1>{{ selected.id ? eDraft.title || 'Experience' : 'New experience' }}</h1>
      </header>
      <div class="adm-row">
        <label class="adm-field"
          ><span>Company *</span
          ><input v-model="eDraft.company" type="text" required maxlength="200"
        /></label>
        <label class="adm-field"
          ><span>Title *</span><input v-model="eDraft.title" type="text" required maxlength="200"
        /></label>
      </div>
      <label class="adm-field">
        <span>Headline</span>
        <input v-model="eDraft.headline" type="text" maxlength="200" />
        <span class="adm-hint">Empty: first sentence of the first bullet.</span>
      </label>
      <label class="adm-field">
        <span>Group</span>
        <select v-model="eDraft.group">
          <option value="">None (standalone)</option>
          <option v-for="g in groups.items.value" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </label>
      <div class="adm-row">
        <label class="adm-field"
          ><span>Start</span><input v-model="eDraft.start_date" type="date"
        /></label>
        <label class="adm-field"
          ><span>End</span><input v-model="eDraft.end_date" type="date" :disabled="eDraft.current"
        /></label>
        <label class="adm-check"><input v-model="eDraft.current" type="checkbox" /> Current</label>
      </div>
      <ListField v-model="eDraft.description" label="Bullets" multiline add-label="Bullet" />
      <ListField v-model="eDraft.skills" label="Skills" add-label="Skill" />
      <div class="adm-actions">
        <button class="adm-btn primary" :disabled="busy">Save</button>
        <button
          v-if="selected.id"
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
      {{ err || msg || 'Pick a group or experience, or add a new one.' }}
    </p>
  </div>
</template>
