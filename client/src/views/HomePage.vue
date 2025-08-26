<script setup lang="ts">
import { defineComponent, h } from 'vue'
import SkillIcon from '@/components/SkillIcon.vue'
import Manifest from '@mnfst/sdk'
import { dev } from '@/App.vue'
import { formatLinks } from '../../functions/format'
import Collapsible from '@/components/Collapsible.vue'
import { motion } from 'motion-v'

const manifest = new Manifest()

type HomePage = {
  overview: string
  now: string
  interests: string
  futureGoals: string
  languages: string
  frameworks: string
  databases: string
  devops: string
}

const homePage = (await manifest.single('home').get()) as HomePage
console.log(homePage)

const varDef = (name: string, type: string, value: string) =>
  defineComponent({
    name: 'VarDef',
    setup() {
      return () =>
        h('p', [
          h('span', { class: 'text-purple' }, 'private static '),
          h('span', { class: 'text-yellow' }, type + ' '),
          h('span', { class: 'text-red' }, name),
          h('span', { class: 'text-white' }, ' = '),
          h('span', { class: 'text-green' }, `"${value}"`),
        ])
    },
  })

const languages = homePage.languages?.split('\n')
const frameworks = homePage.frameworks?.split('\n')
const databases = homePage.databases?.split('\n')
const devops = homePage.devops?.split('\n')
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.5, ease: 'easeInOut' }"
  >
    <div v-if="dev" class="home dev">
      <h2>
        <span class="text-purple">class </span>
        <span class="text-yellow">Home</span>
        <span class="text-orange"> {</span>
      </h2>
      <div class="indented">
        <br />
        <component
          :is="
            varDef(
              'overview',
              'String',
              'Software engineer at SYSTOLIC who loves turning ideas into intuitive, user-friendly software.',
            )
          "
        />
        <br />
        <component
          :is="
            varDef(
              'now',
              'String',
              'I spend most of my time building web and mobile apps, including my latest project, Ekklesia, which connects communities in fresh ways.',
            )
          "
        />
        <br />
        <component
          :is="
            varDef(
              'interests',
              'String',
              'When I’m not coding, I\'m either studying a new language(currently Romanian), hunting for limited edition vinyl, discovering new music(current playlist), watching Formula 1, or out on the golf course.',
            )
          "
        />
        <br />
        <component
          :is="
            varDef(
              'futureGoals',
              'String',
              'I’m always excited to tackle new challenges and explore all corners of software engineering—dreaming big about creating products that genuinely make people’s lives better.',
            )
          "
        />
        <br />

        <div class="flex flex-row justify-start items-center">
          <p>
            <span class="text-purple">public static </span>
            <span class="text-yellow">Skill</span>
            <span class="text-purple">[]</span>
            <span class="text-red"> languages</span>
            <span class="text-white"> = </span>
            <span class="text-purple">[</span>
          </p>
          <div
            v-for="skill in languages"
            :key="skill"
            class="flex flex-row flex-wrap justify-end items-end"
          >
            <SkillIcon :icon="skill" />
            <span v-if="skill !== languages[languages.length - 1]" class="text-white">, </span>
          </div>
          <p>
            <span class="text-purple">]</span>
            <span class="text-white">;</span>
          </p>
        </div>
        <br />
        <div class="flex flex-row flex-wrap justify-start items-center">
          <p>
            <span class="text-purple">public static </span>
            <span class="text-yellow">Skill</span>
            <span class="text-purple">[]</span>
            <span class="text-red"> frameworksAndLibs</span>
            <span class="text-white"> = </span>
            <span class="text-purple">[</span>
          </p>
          <div v-for="skill in frameworks" :key="skill" class="flex flex-row justify-end items-end">
            <SkillIcon :icon="skill" />
            <span v-if="skill !== frameworks[frameworks.length - 1]" class="text-white">, </span>
          </div>
          <p>
            <span class="text-purple">]</span>
            <span class="text-white">;</span>
          </p>
        </div>
        <br />
        <div class="flex flex-row justify-start items-center">
          <p>
            <span class="text-purple">public static </span>
            <span class="text-yellow">Skill</span>
            <span class="text-purple">[]</span>
            <span class="text-red"> databases</span>
            <span class="text-white"> = </span>
            <span class="text-purple">[</span>
          </p>
          <div
            v-for="skill in databases"
            :key="skill"
            class="flex flex-row flex-wrap justify-end items-end"
          >
            <SkillIcon :icon="skill" />
            <span v-if="skill !== databases[databases.length - 1]" class="text-white">, </span>
          </div>
          <p>
            <span class="text-purple">]</span>
            <span class="text-white">;</span>
          </p>
        </div>
        <br />
        <div class="flex flex-row flex-wrap justify-start items-center">
          <p>
            <span class="text-purple">public static </span>
            <span class="text-yellow">Skill</span>
            <span class="text-purple">[]</span>
            <span class="text-red"> devops</span>
            <span class="text-white"> = </span>
            <span class="text-purple">[</span>
          </p>
          <div v-for="skill in devops" :key="skill" class="flex flex-row justify-end items-end">
            <SkillIcon :icon="skill" />
            <span v-if="skill !== devops[devops.length - 1]" class="text-white">, </span>
          </div>
          <p>
            <span class="text-purple">]</span>
            <span class="text-white">;</span>
          </p>
        </div>
        <br />

        <p>
          <span class="text-purple">public static void </span>
          <span class="text-blue">main</span>
          <span class="text-purple"> (</span>
          <span class="text-yellow">String </span>
          <span class="text-cyan">[] </span>
          <span class="text-red">args</span>
          <span class="text-purple">) {</span>
        </p>
        <div class="indented">
          <p>
            <span class="text-yellow">System</span>
            <span class="text-white">.</span>
            <span class="text-red">out</span>
            <span class="text-white">.</span>
            <span class="text-blue">println</span>
            <span class="text-cyan">(</span>
            <span class="text-red">overview</span>
            <span class="text-cyan">)</span>
            <span class="text-cyan">;</span>
          </p>
          <p>
            <span class="text-yellow">System</span>
            <span class="text-white">.</span>
            <span class="text-red">out</span>
            <span class="text-white">.</span>
            <span class="text-blue">println</span>
            <span class="text-cyan">(</span>
            <span class="text-red">now</span>
            <span class="text-cyan">)</span>
            <span class="text-cyan">;</span>
          </p>
          <p>
            <span class="text-yellow">System</span>
            <span class="text-white">.</span>
            <span class="text-red">out</span>
            <span class="text-white">.</span>
            <span class="text-blue">println</span>
            <span class="text-cyan">(</span>
            <span class="text-red">interests</span>
            <span class="text-cyan">)</span>
            <span class="text-cyan">;</span>
          </p>
          <p>
            <span class="text-yellow">System</span>
            <span class="text-white">.</span>
            <span class="text-red">out</span>
            <span class="text-white">.</span>
            <span class="text-blue">println</span>
            <span class="text-cyan">(</span>
            <span class="text-red">futureGoals</span>
            <span class="text-cyan">)</span>
            <span class="text-cyan">;</span>
          </p>
        </div>
        <span class="text-purple">}</span>
      </div>
      <span class="text-orange">}</span>
    </div>
    <div v-else class="home">
      <div class="mt-4 flex flex-col">
        <p class="my-4 leading-relaxed" v-html="formatLinks(homePage.overview)"></p>
        <div class="border-t border-gray">
          <p class="pt-3 pb-2 font-bold leading-relaxed">Skills</p>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="px-2 py-1 rounded-lg" style="background-color: #222">
              <p class="font-[500]">Languages</p>
              <div class="flex flex-row flex-wrap justify-start items-center">
                <SkillIcon v-for="skill in languages" :key="skill" :icon="skill" />
              </div>
            </div>
            <div class="px-2 py-1 rounded-lg" style="background-color: #222">
              <p class="font-[500]">Databases</p>
              <div class="flex flex-row flex-wrap justify-start items-center">
                <SkillIcon v-for="skill in databases" :key="skill" :icon="skill" />
              </div>
            </div>
            <div class="px-2 py-1 rounded-lg" style="background-color: #222">
              <p class="font-[500]">Frameworks and Libraries</p>
              <div class="flex flex-row flex-wrap justify-start items-center">
                <SkillIcon v-for="skill in frameworks" :key="skill" :icon="skill" />
              </div>
            </div>
            <div class="px-2 py-1 rounded-lg" style="background-color: #222">
              <p class="font-[500]">DevOps</p>
              <div class="flex flex-row flex-wrap justify-start items-center">
                <SkillIcon v-for="skill in devops" :key="skill" :icon="skill" />
              </div>
            </div>
          </div>
        </div>
        <Collapsible title="Now" :content="homePage.now" />
        <Collapsible title="My Interests" :content="homePage.interests" />
        <Collapsible title="Future Goals" :content="homePage.futureGoals" />
      </div>
    </div>
  </motion.div>
</template>

<style>
.markdown-link {
  color: var(--color-white);
  text-decoration: underline;
  text-decoration-color: #505050;
  text-underline-offset: 2.5px;
  text-decoration-thickness: 1px;
  transition: all 0.3s ease-in-out;
}
.markdown-link:hover {
  /* color: var(--color-blue); */
  text-decoration-color: var(--color-blue);
}

br {
}
</style>
