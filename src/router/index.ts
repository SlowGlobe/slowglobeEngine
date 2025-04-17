import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useTripDetails } from '@/functions/loaders'

// Add a data loader to each of the trip routes to load the geojson
const index = routes.findIndex((r) => r.path === '/trip')
routes[index].meta = {
  loaders: [useTripDetails]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    console.log('savedPosition:', savedPosition)
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
    // }

    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     console.log('savedPositionT:', savedPosition)
    //     if (savedPosition) {
    //       resolve(savedPosition)
    //     } else {
    //       resolve({ left: 0, top: 0 })
    //     }
    //   }, 1000)
    // })
  },

  routes
})
router.beforeResolve(async (to) => {
  const elements = ['polaroid-img', 'postage-stamp-container']
  if (to.path == '/') {
    elements.reverse()
  }
  const first = elements[0]
  console.log('first:', first)
  const last = elements[elements.length - 1]

  const polaroids = document.getElementsByClassName(first)
  const s = document.getElementsByClassName(last)[0]
  if (s) s.style = ''
  const p = polaroids?.[0]
  if (p) p.style = 'view-transition-name: polaroid-stamp; '
  document.startViewTransition(() => {
    if (p) p.style = ''

    const stamps = document.getElementsByClassName(last)
    stamps[0].style = 'view-transition-name: polaroid-stamp;'
  })
  // await viewTransition.captured
  // ...
})

export default router
