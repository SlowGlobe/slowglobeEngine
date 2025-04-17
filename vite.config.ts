import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { imagetools } from 'vite-imagetools'
import { resolve } from 'path'
import { realpathSync } from 'fs'
import geoJsonSimplify from './vite-plugin-geojson-simplify'

const dirname = realpathSync('.')

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.m4v', '**/*.geojson', '**/*.JPG'],
  resolve: {
    // extensions: ['.js', '.ts', '.vue', '.json', '.geojson'],
    alias: {
      '~': resolve(dirname, '../trips'),
      '@': resolve(dirname, './src')
    }
  },
  build: { outDir: '../dist', emptyOutDir: true },
  plugins: [
    imagetools({
      include: [
        '**/*.{heif,avif,jpeg,jpg,JPG,png,PNG,tiff,webp,gif}?*',
        '../trips/**/images/*.{heif,avif,jpeg,jpg,JPG,png,PNG,tiff,webp,gif}?*'
      ]
    }),
    geoJsonSimplify(),
    VueRouter({
      routesFolder: ['src/pages', { src: '../trips', path: 'trip/' }]
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('iconify-')
        }
      }
    })
  ]
})
