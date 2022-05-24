/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  eslint: {
    Linter: typeof import('@typescript-eslint/utils').TSESLint.Linter
  }
}
