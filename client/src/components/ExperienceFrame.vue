<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import TechIcon from '@/components/TechIcon.vue'
import { dur, grpMeta, range, techName } from '@/lib/data'
import type { FlatItem } from '@/lib/emanator'

// One contract: an establishing shot with the role, stack and (collapsible on narrow screens) details.
const props = defineProps<{
  item: FlatItem
  /** the contracts of `item.e` */
  total: number
  compact: boolean
  /** has entered view (entrance animation) */
  entered: boolean
}>()

const uid = useId()
const hid = `${uid}-h`
const pid = `${uid}-p`
const c = computed(() => props.item.c)
const e = computed(() => props.item.e)
const ci = computed(() => props.item.ci)
const group = computed(() => e.value.kind === 'group')
const open = ref(false)
</script>

<template>
  <article
    class="mo-frame"
    :class="{ 'mo-live': c.current, 'mo-in': entered }"
    :data-i="item.i"
    :aria-labelledby="hid"
  >
    <div v-if="c.current" class="mo-scan" aria-hidden="true"></div>
    <div class="mo-body">
      <template v-if="group && !compact">
        <div
          class="mo-lin mo-x"
          style="--d: 0"
          role="group"
          :aria-label="`Employer: ${e.name}, contract ${ci + 1} of ${total}`"
        >
          <span class="mo-lk">Employer</span><span class="mo-lv">{{ e.name }}</span
          ><span class="mo-lg" aria-hidden="true"
            ><span class="mo-dts"
              ><i
                v-for="(_, k) in e.contracts"
                :key="k"
                class="mo-ld"
                :class="{ past: k <= ci, on: k === ci }"
              ></i></span></span
          ><span class="mo-ln"
            ><span class="mo-cw">Contract </span>{{ ci + 1 }} of {{ total }}</span
          >
        </div>
        <template v-if="ci === 0">
          <p class="mo-emp-meta mo-x" style="--d: 40">{{ grpMeta(e) }}</p>
          <p v-if="e.desc" class="mo-emp-desc mo-x" style="--d: 60">{{ e.desc }}</p>
        </template>
      </template>
      <p v-if="group && compact" class="mo-strap mo-x" style="--d: 0">
        <span class="mo-sk">Employer</span><span class="mo-sv">{{ e.name }}</span
        ><span v-if="total > 1" class="mo-sn"
          ><span class="mo-cw">Contract </span>{{ ci + 1 }} of {{ total }}</span
        >
      </p>
      <component
        :is="compact ? 'h3' : 'h2'"
        :id="hid"
        class="mo-name mo-x"
        tabindex="-1"
        :data-t="c.co"
        style="--d: 100"
        >{{ c.co }}</component
      >
      <p class="mo-meta mo-x" style="--d: 220">
        <span class="mo-title">{{ c.title }}</span
        ><span>{{ range(c) }}</span
        ><span>{{ dur(c.start, c.end) }}</span
        ><span v-if="c.current" class="badge">Live</span>
      </p>
      <p class="mo-lede mo-x" style="--d: 300">{{ c.headline }}</p>
      <ul class="mo-stack" :aria-label="`Technologies used at ${c.co}`">
        <li v-for="(s, k) in c.skills" :key="s" class="mo-x" :style="{ '--d': 300 + k * 45 }">
          <span aria-hidden="true"><TechIcon :name="s" /></span
          ><span class="mo-cap">{{ techName(s) }}</span>
        </li>
      </ul>
      <div v-if="c.pts.length" class="mo-dtl mo-x" :style="{ '--d': 420 + c.skills.length * 45 }">
        <button
          type="button"
          class="mo-more"
          :aria-expanded="open"
          :aria-controls="pid"
          @click="open = !open"
        >
          <span class="mo-pm" aria-hidden="true"></span
          ><span class="mo-more-t"
            >{{ open ? 'Hide details' : 'Show details'
            }}<span class="sr"> for {{ c.co }}</span></span
          >
        </button>
        <div :id="pid" class="mo-panel" :class="{ 'mo-open': open }">
          <div class="mo-pin">
            <ul class="mo-pts">
              <li v-for="p in c.pts" :key="p">{{ p }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <slot />
  </article>
</template>
