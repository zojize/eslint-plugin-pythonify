type TS = typeof import('typescript')

declare global {
  type WindowRequireCb = () => void
  interface WindowRequire {
    (files: string[], cb: WindowRequireCb): void
    config: (arg: {
      paths?: Record<string, string>
      ignoreDuplicateModules?: string[]
    }) => void
  }

  interface Window {
    ts: TS
    require: WindowRequire
  }
}

export const loadTS = () => {
  const id = '__ts_loader'

  // https://www.typescriptlang.org/dev/sandbox/
  return new Promise<TS>((resolve, reject) => {
    if (document.getElementById(id)) {
      if (window.ts)
        resolve(window.ts)
      else
        reject(new Error('unable to load ts'))
      return
    }

    // First set up the VSCode loader in a script tag
    const getLoaderScript = document.createElement('script')
    getLoaderScript.src = 'https://www.typescriptlang.org/js/vs.loader.js'
    getLoaderScript.async = true
    getLoaderScript.id = id
    getLoaderScript.onload = () => {
      // Now the loader is ready, tell require where it can get the version of monaco, and the sandbox
      // This version uses the latest version of the sandbox, which is used on the TypeScript website

      // For the monaco version you can use unpkg or the TypeSCript web infra CDN
      // You can see the available releases for TypeScript here:
      // https://typescript.azureedge.net/indexes/releases.json
      //
      window.require.config({
        paths: {
          vs: 'https://typescript.azureedge.net/cdn/4.6.2/monaco/min/vs',
          // vs: 'https://unpkg.com/@typescript-deploys/monaco-editor@4.0.5/min/vs',
        },
        // This is something you need for monaco to work
        ignoreDuplicateModules: ['vs/editor/editor.main'],
      })

      // Grab a copy of monaco, TypeScript and the sandbox
      window.require([
        'vs/editor/editor.main',
        'vs/language/typescript/tsWorker',
      ], () => {
        const isOK = !!window.ts
        if (isOK)
          resolve(window.ts)
        else
          reject(new Error('Could not get all the dependencies of sandbox set up!'))
      })
    }

    document.body.appendChild(getLoaderScript)
  })
}
