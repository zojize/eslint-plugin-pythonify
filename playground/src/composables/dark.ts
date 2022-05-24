import * as monaco from 'monaco-editor'
import { watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

export const dark = useDark()
export const toggleDark = useToggle(dark)

watch(dark, dark => monaco.editor.setTheme(dark ? 'vitesse-dark' : 'vitesse'))
monaco.editor.onDidCreateEditor(() => monaco.editor.setTheme(dark.value ? 'vitesse-dark' : 'vitesse'))
