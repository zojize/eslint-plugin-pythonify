import type { MaybeRef } from '@vueuse/core'
import { tryOnScopeDispose, until } from '@vueuse/core'
import type * as monaco from 'monaco-editor'
import { inject, isReactive, isRef, unref, watch } from 'vue'
import { MonacoEditorContextKey } from './MonacoEditor.vue'

export const useInlineDecoration = async (decorations: MaybeRef<monaco.editor.IModelDeltaDecoration[]>) => {
  const ctx = inject(MonacoEditorContextKey)

  if (!ctx)
    throw new Error('Where is my editor context?')

  const { editor } = ctx

  await until(ctx.editor).toBeTruthy()

  let oldDecorations: string[] | undefined

  if (isRef(decorations) || isReactive(decorations)) {
    watch(
      decorations,
      () => oldDecorations = editor.value.deltaDecorations(oldDecorations ?? [], unref(decorations)),
    )
  }
  oldDecorations = editor.value.deltaDecorations(oldDecorations ?? [], unref(decorations))
  tryOnScopeDispose(() => editor.value.deltaDecorations(oldDecorations ?? [], []))
}

