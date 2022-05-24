import type { DeepMaybeRef, MaybeElementRef, MaybeRef } from '@vueuse/core'
import { tryOnScopeDispose, until } from '@vueuse/core'
import * as monaco from 'monaco-editor'
import { computed, getCurrentInstance, ref, shallowRef, unref, watch } from 'vue'

export type EditorEvents = {
  [K in keyof monaco.editor.IStandaloneCodeEditor as K extends `on${string}`
    ? K
    : never
  ]: monaco.editor.IStandaloneCodeEditor[K];
}

const toEmitName = (s: string) => s[2].toLowerCase() + s.slice(3)

export const useMonacoEditor = (
  target: MaybeElementRef<HTMLElement>,
  constructionOptions?: monaco.editor.IStandaloneEditorConstructionOptions,
  options?:
  | DeepMaybeRef<monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions>
  | MaybeRef<monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions>,
  emitEvents: (keyof EditorEvents)[] = [],
) => {
  const vm = getCurrentInstance()
  const emit = vm?.emit

  const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  // TODO: git rid of as any
  const _options = ref<monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions>(options ?? {} as any)

  if (target) {
    until(target)
      .toBeTruthy()
      .then(() => {
        const el = unref(target)!
        editor.value = monaco.editor.create(el, constructionOptions)
        _options.value && editor.value?.updateOptions(_options.value)
        if (emitEvents.length && emit) {
          Array.from(new Set(emitEvents)).forEach(event => {
            const emitName = toEmitName(event)
            editor.value![event]((...args) => emit(emitName, ...args))
          })
        }
      })
  }

  watch(_options, options => editor.value?.updateOptions(options))

  const model = shallowRef<monaco.editor.ITextModel | null>(null)

  watch(model, async model => {
    await until(editor).toBeTruthy()
    editor.value!.setModel(model)
  })

  const viewState = computed({
    get: () => editor.value?.saveViewState() ?? null,
    set: value => {
      if (value)
        editor.value?.restoreViewState(value)
    },
  })

  tryOnScopeDispose(() => editor.value?.dispose())

  return {
    editor,
    model,
    viewState,
  }
}
