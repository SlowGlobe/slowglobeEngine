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
    if (to.path !== '/') {
      if (savedPosition) {
        return savedPosition
      } else {
        return { left: 0, top: 0 }
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // console.log('savedPosition:', savedPosition)
        if (savedPosition) {
          resolve(savedPosition)
        } else {
          resolve({ left: 0, top: 0 })
        }
      }, 1000)
    })
  },

  routes
})

export default router
