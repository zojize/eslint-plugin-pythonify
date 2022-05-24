import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    Inspect(),

    Vue({
      reactivityTransform: '*.vue',
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss('..'),
  ],
})
