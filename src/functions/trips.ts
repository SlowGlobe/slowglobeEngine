import type { FeatureCollection } from 'geojson'
import { allTrips } from '~/allTrips'

export interface Trip {
  id: string
  name: string
  headerImage: string
  date: string
  locationText: string
  geography: { overview: TripGeographyOverview; detail?: () => Promise<FeatureCollection> }
}

export interface TripGeographyOverview {
  center: [number, number]
  zoom: number
  tracks?: FeatureCollection
}

export function getTripById(id: string) {
  return allTrips.find((trip) => trip.id === id)
}

export async function getTripDetailsById(id: string) {
  const trip = getTripById(id)
  if (!trip || !trip.geography.detail) return
  return await trip.geography.detail()
}

export function getTripHeaderInfoById(id: string) {
  const trip = getTripById(id)
  if (!trip) {
    return { locationText: '', date: '', headerImage: '' }
  }

  const { locationText, date, headerImage } = trip
  return { locationText, date, headerImage }
}
