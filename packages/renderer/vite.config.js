/* eslint-env node */

import { chrome } from '../../electron-vendors.config.json'
import { join } from 'path'
import { builtinModules } from 'module'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import windicss from 'vite-plugin-windicss'

const PACKAGE_ROOT = __dirname

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '@/': join(PACKAGE_ROOT, 'src') + '/',
      'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    vueI18n({
      include: join(PACKAGE_ROOT, '..', 'i18n', '**')
    }),
    windicss()
  ],
  base: '',
  server: {
    fs: {
      strict: true
    }
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    terserOptions: {
      ecma: 2020,
      compress: {
        passes: 2
      },
      safari10: false
    },
    rollupOptions: {
      external: [
        ...builtinModules
      ]
    },
    emptyOutDir: true,
    brotliSize: false
  }
}

export default config
