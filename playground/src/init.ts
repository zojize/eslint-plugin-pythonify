import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import * as monaco from 'monaco-editor'
import vitesseLight from './assets/vitesseLight.json'
import vitesseDark from './assets/vitesseDark.json'

// @ts-expect-error: setup worker
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json')
      return new JSONWorker()

    if (label === 'css' || label === 'scss' || label === 'less')
      return new CSSWorker()

    if (label === 'html' || label === 'handlebars' || label === 'razor')
      return new HTMLWorker()

    if (label === 'typescript' || label === 'javascript')
      return new TSWorker ()

    return new EditorWorker()
  },
}

const prefersDark
    = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const setting = localStorage.getItem('color-schema') || 'auto'
if (setting === 'dark' || (prefersDark && setting !== 'light'))
  document.documentElement.classList.toggle('dark', true)

monaco.editor.defineTheme('vitesse', vitesseLight as any)
monaco.editor.defineTheme('vitesse-dark', vitesseDark as any)
