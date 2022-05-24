<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { computed, reactive, ref } from 'vue'
import rule, { RULE_NAME } from '../../src/rules/pythonify'
import defaultCode from '../../test/assets/bubble.ts?raw'
// wtf eslint
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import MonacoEditor from './components/MonacoEditor'
import { dark, toggleDark } from './composables/dark'
import InlineDecoration from './components/MonacoEditor/InlineDecoration.vue'

const linter = new window.eslint.Linter()
linter.defineRule(RULE_NAME, rule)

const code = ref(defaultCode)

const ruleOptions = reactive({
  gap: 20,
})

const verifyResult = computed(() =>
  linter.verify(
    code.value,
    {
      rules: {
        pythonify: ['error', ruleOptions],
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
  ),
)

const lintResult = computed(() => {
  const result = linter.verifyAndFix(
    code.value,
    {
      rules: {
        pythonify: ['error', ruleOptions],
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    { fix: true },
  )

  return result
})

const decorationOptions = computed(() => verifyResult.value
  .map<monaco.editor.IModelDeltaDecoration>(({ line, endLine, column, endColumn, message }) => ({
    range: new monaco.Range(line, column, endLine, endColumn),
    options: {
      hoverMessage: { value: message },
      inlineClassName: 'border-b-1 border-red border-dashed',
    },
  })),
)

const fixedCode = computed(() => lintResult.value.output)

const editorOptions = {
  renderIndentGuides: false,
  automaticLayout: true,
  renderMinimap: false,
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'hidden',
  },
}

const mainEditor = ref<InstanceType<typeof MonacoEditor>>()
const fixedEditor = ref<InstanceType<typeof MonacoEditor>>()

const onScrollChange = (editorRef: InstanceType<typeof MonacoEditor> | undefined, e: monaco.IScrollEvent) =>
  editorRef?.editor?.setScrollTop?.(e.scrollTop)
</script>

<template>
  <header class=":uno: flex items-center justify-between h-8 px-4 my-2 text-xl font-bold">
    Eslint Plugin Pythonify
    <div class="space-x-2">
      <a class="icon-btn i-carbon:logo-github" href="https://github.com/zojize/eslint-plugin-pythonify" target="_blank" />
      <button class="icon-btn" :class="dark ? 'i-carbon:moon' : 'i-carbon:sun'" @click="toggleDark()" />
    </div>
  </header>

  <main class=":uno: flex flex-col w-screen h-screen">
    <div class=":uno: flex flex-row items-center h-8 px-4 gap-2">
      <label>
        gap <input v-model="ruleOptions.gap" type="number" class=":uno: bg-transparent w-18">
      </label>
    </div>

    <div class=":uno: flex flex-row flex-1 justify-between p-8">
      <div class=":uno: flex-1 h-full w-full">
        <MonacoEditor
          ref="mainEditor"
          v-model="code"
          language="javascript"
          :editor-options="editorOptions"
          :options="{ minimap: { enabled: false } }"
          @did-scroll-change="onScrollChange(fixedEditor, $event)"
        >
          <InlineDecoration :options="decorationOptions" />
        </MonacoEditor>
      </div>
      <div class=":uno: flex-1 h-full w-full">
        <MonacoEditor
          ref="fixedEditor"
          :model-value="fixedCode ?? code" language="javascript"
          :editor-options="editorOptions"
          :options="{ readOnly: true, minimap: { enabled: false } }"
          @did-scroll-change="onScrollChange(mainEditor, $event)"
        />
      </div>
    </div>
  </main>
</template>
