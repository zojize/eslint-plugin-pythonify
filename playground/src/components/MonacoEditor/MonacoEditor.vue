<script lang="ts">
import { useEventListener, useVModel } from '@vueuse/core'
import * as monaco from 'monaco-editor'
import type { InjectionKey, Ref } from 'vue'
import { provide, ref, toRef } from 'vue'
import { useMonacoEditor } from './useMonacoEditor'
import { useTextModel } from './useTextModel'

export const MonacoEditorContextKey: InjectionKey<{
  editor: Ref<monaco.editor.IStandaloneCodeEditor | null>
}> = Symbol('MonacoEditorContextKey')

export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
interface Props {
  modelValue: string | monaco.editor.ITextModel
  language?: string
  keepViewState?: boolean
  options?: monaco.editor.IEditorOptions
  editorOptions?: monaco.editor.IStandaloneEditorConstructionOptions
}

interface Emits {
  (event: 'update:modelValue'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLDivElement>()

const vModel = useVModel(props, 'modelValue', emit)
const language = toRef(props, 'language', 'plaintext')

const {
  editor,
  model,
}
  = useMonacoEditor(
    editorContainer,
    props.editorOptions ?? {},
    toRef(props, 'options', {}) as any,
    [
      'onMouseDown',
      'onMouseLeave',
      'onMouseMove',
      'onMouseUp',
      'onDidScrollChange',
    ])

model.value
  = useTextModel(vModel as Ref<string>, { language }).model.value

useEventListener('resize', () => {
  editor.value.layout({} as any)
})

const ctx = {
  editor,
  monaco,
}

provide(MonacoEditorContextKey, ctx)
defineExpose(ctx)
</script>

<template>
  <div ref="editorContainer" class="min-w-full min-h-full">
    <!-- placeholder slot for headless components -->
    <slot />
  </div>
</template>
