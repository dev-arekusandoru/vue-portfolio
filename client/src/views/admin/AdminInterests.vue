<script setup lang="ts">
import type { RecordModel } from 'pocketbase'
import { onMounted, reactive, ref } from 'vue'
import pb from '@/config/pocketbase'
import { useRecords, useStatus } from '@/lib/admin'

// "Off the clock" cards. Order on the site = `order`, changed with the arrows in the list.
const { items, load, save, remove } = useRecords('interests', 'order,created')
const { busy, msg, err, run } = useStatus()

const blank = () => ({
  title: '',
  line: '',
  phrase: '',
  art: 'none',
  stat_value: '',
  stat_label: '',
  stat_live: false,
})
const draft = reactive(blank())
const selected = ref<string | null>(null) // record id, 'new', or nothing selected
const arts = ref<string[]>(['none'])

onMounted(async () => {
  await run(async () => {
    await load()
    const field = (await pb.collections.getOne('interests')).fields.find((f) => f.name === 'art')
    if (field?.values?.length) arts.value = field.values
  }, '')
})

function pick(rec: RecordModel | null) {
  msg.value = err.value = ''
  selected.value = rec ? rec.id : 'new'
  Object.assign(
    draft,
    blank(),
    rec && Object.fromEntries(Object.keys(blank()).map((k) => [k, rec[k]])),
  )
}

async function submit() {
  const id = selected.value === 'new' ? null : selected.value
  const order = id ? undefined : Math.max(0, ...items.value.map((r) => Number(r.order) || 0)) + 1
  await run(async () => {
    const rec = await save(id, { ...draft, ...(order && { order }) })
    selected.value = rec.id
  }, 'Saved')
}

async function del() {
  const id = selected.value
  if (!id || id === 'new' || !confirm(`Delete “${draft.title}”?`)) return
  if (await run(() => remove(id), 'Deleted')) selected.value = null
}

/** Swaps two neighbours, renumbering the whole list so equal or missing `order` values can't stall a move. */
async function move(i: number, d: number) {
  const a = [...items.value]
  const j = i + d
  if (j < 0 || j >= a.length) return
  ;[a[i], a[j]] = [a[j], a[i]]
  await run(async () => {
    for (const [n, r] of a.entries()) if (r.order !== n + 1) await save(r.id, { order: n + 1 })
  }, '')
}
</script>

<template>
  <div class="adm-split">
    <aside class="adm-list">
      <button type="button" class="adm-btn primary" @click="pick(null)">+ New interest</button>
      <div v-for="(r, i) in items" :key="r.id" class="adm-item" :aria-current="selected === r.id">
        <button type="button" class="adm-pick" @click="pick(r)">
          <b>{{ r.title }}</b>
          <small>{{ r.line }}</small>
        </button>
        <button
          type="button"
          class="adm-btn small"
          :disabled="busy || i === 0"
          title="Move up"
          @click="move(i, -1)"
        >
          ↑
        </button>
        <button
          type="button"
          class="adm-btn small"
          :disabled="busy || i === items.length - 1"
          title="Move down"
          @click="move(i, 1)"
        >
          ↓
        </button>
      </div>
    </aside>

    <form v-if="selected" class="adm-form" @submit.prevent="submit">
      <header>
        <h1>{{ selected === 'new' ? 'New interest' : draft.title || 'Interest' }}</h1>
      </header>
      <label class="adm-field"
        ><span>Title *</span><input v-model="draft.title" type="text" required maxlength="120"
      /></label>
      <label class="adm-field"
        ><span>Line</span><input v-model="draft.line" type="text" maxlength="300"
      /></label>
      <div class="adm-row">
        <label class="adm-field"
          ><span>Phrase</span><input v-model="draft.phrase" type="text" maxlength="120"
        /></label>
        <label class="adm-field">
          <span>Art</span>
          <select v-model="draft.art">
            <option v-for="a in arts" :key="a" :value="a">{{ a }}</option>
          </select>
        </label>
      </div>
      <div class="adm-row">
        <label class="adm-field"
          ><span>Stat value</span><input v-model="draft.stat_value" type="text" maxlength="40"
        /></label>
        <label class="adm-field"
          ><span>Stat label</span><input v-model="draft.stat_label" type="text" maxlength="80"
        /></label>
      </div>
      <label class="adm-check"
        ><input v-model="draft.stat_live" type="checkbox" /> Stat is a live number</label
      >
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
      {{ err || msg || 'Pick an interest or add a new one.' }}
    </p>
  </div>
</template>
