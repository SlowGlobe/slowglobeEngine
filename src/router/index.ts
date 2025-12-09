import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useTripDetails } from '@/functions/loaders'
import { getTripById } from '@/functions/trips'

// Add a data loader to each of the trip routes to load the geojson
const index = routes.findIndex((r) => r.path === '/trip')
routes[index].meta = {
  loaders: [useTripDetails]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition)
        } else {
          resolve({ left: 0, top: 0 })
        }
      }, 350)
    })
  },
  routes
})

router.beforeEach((to) => {
  if (to.path.startsWith('/trip/')) {
    const [, , tripId = ''] = to.path.split('/')
    const result = getTripById(tripId)
    if (result && result.name) {
      document.title = result.name
      return
    }
  }
  document.title = 'Slow Globe'
})

export default router
