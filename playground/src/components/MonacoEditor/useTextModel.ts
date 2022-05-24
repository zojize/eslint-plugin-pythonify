import { tryOnScopeDispose } from '@vueuse/core'
import type { DeepMaybeRef, MaybeRef } from '@vueuse/core'
import * as monaco from 'monaco-editor'
import { isRef, reactive, ref, shallowRef, unref, watch } from 'vue'

interface UseTextModelOptions {
  language?: MaybeRef<string>
  uri?: monaco.Uri
  options?: DeepMaybeRef<monaco.editor.ITextModelUpdateOptions>
}

export const useTextModel = (
  code: MaybeRef<string>,
  options?: UseTextModelOptions,
) => {
  const { language, uri, options: updateOptions } = options ?? {}

  const model = shallowRef<monaco.editor.ITextModel>(
    monaco.editor.createModel(unref(code), unref(language), uri),
  )

  const isDisposed = ref(false)
  model.value.onWillDispose(() => isDisposed.value = true)

  if (language && isRef(language)) {
    watch(language, language =>
      monaco.editor.setModelLanguage(model.value, language),
    )
  }

  if (isRef(code)) {
    let skip = false

    watch(code, code => {
      if (skip) {
        skip = false
        return
      }
      skip = true
      model.value.setValue(code)
    })

    model.value.onDidChangeContent(() => {
      if (skip) {
        skip = false
        return
      }
      skip = true
      code.value = model.value.getValue()
    })
  }

  if (updateOptions) {
    const _updateOptions = reactive(updateOptions)
    watch(_updateOptions, options => model.value.updateOptions(options))
  }

  tryOnScopeDispose(() => model.value.dispose())

  return {
    model,
    isDisposed,
  }
}
