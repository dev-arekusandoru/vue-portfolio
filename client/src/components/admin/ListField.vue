<script setup lang="ts">
// Editable list of strings: one input per row, with reorder / remove / add.
const model = defineModel<string[]>({ required: true })
defineProps<{ label: string; multiline?: boolean; addLabel?: string }>()

const set = (i: number, v: string) => (model.value = model.value.map((x, j) => (j === i ? v : x)))
const remove = (i: number) => (model.value = model.value.filter((_, j) => j !== i))
const move = (i: number, d: number) => {
  const a = [...model.value]
  const j = i + d
  if (j < 0 || j >= a.length) return
  ;[a[i], a[j]] = [a[j], a[i]]
  model.value = a
}
</script>

<template>
  <fieldset class="adm-field">
    <legend>{{ label }}</legend>
    <div class="adm-listfield">
      <div v-for="(item, i) in model" :key="i">
        <textarea
          v-if="multiline"
          :value="item"
          :aria-label="`${label} ${i + 1}`"
          @input="set(i, ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
        <input
          v-else
          type="text"
          :value="item"
          :aria-label="`${label} ${i + 1}`"
          @input="set(i, ($event.target as HTMLInputElement).value)"
        />
        <button
          type="button"
          class="adm-btn small"
          :disabled="i === 0"
          title="Move up"
          @click="move(i, -1)"
        >
          ↑
        </button>
        <button
          type="button"
          class="adm-btn small"
          :disabled="i === model.length - 1"
          title="Move down"
          @click="move(i, 1)"
        >
          ↓
        </button>
        <button type="button" class="adm-btn small danger" title="Remove" @click="remove(i)">
          ✕
        </button>
      </div>
      <div>
        <button type="button" class="adm-btn small" @click="model = [...model, '']">
          + {{ addLabel || 'Add' }}
        </button>
      </div>
    </div>
  </fieldset>
</template>
