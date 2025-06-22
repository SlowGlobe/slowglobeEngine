import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { imagetools } from 'vite-imagetools'
import { resolve } from 'path'
import { realpathSync } from 'fs'
import geoJsonSimplify from './vite-plugin-geojson-simplify'
import { VitePWA } from 'vite-plugin-pwa'

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
    }),
    VitePWA({
      srcDir: 'src',
      filename: 'custom-sw.ts',
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Slow Globe Adventures',
        short_name: 'SLow Globe',
        description: 'Blog about my adventures around the globe',
        theme_color: '#893d3c',
        background_color: '#dad2b4'
      },
      pwaAssets: {
        image: 'public/images/logoStamp.svg'
      },
      workbox: {
        // Add any Workbox options here
        // runtimeCaching: [
        //   {
        //     urlPattern: /^https:\/\/api\.your-domain\.com\/.*/i,
        //     handler: 'NetworkFirst',
        //     options: {
        //       cacheName: 'api-cache',
        //       expiration: {
        //         maxEntries: 100,
        //         maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
        //       },
        //       cacheableResponse: {
        //         statuses: [0, 200]
        //       }
        //     }
        //   }
        // ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
})
