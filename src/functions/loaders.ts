import { defineBasicLoader } from 'unplugin-vue-router/data-loaders/basic'
import { getTripDetailsById } from './trips'

export const useTripDetails = defineBasicLoader('/trip/[tripId]', async (to) => {
  const tripId = to.path.startsWith('/trip/') ? to.path.split('/')[2] : ''
  const result = await getTripDetailsById(tripId)
  return result
})
