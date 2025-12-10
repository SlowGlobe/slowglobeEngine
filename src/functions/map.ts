import { getTripById, getTripDetailsById } from './trips'
import { bbox, featureCollection, featureEach, point } from '@turf/turf'
import { useWindowSize } from '@vueuse/core'
import type { Feature, FeatureCollection } from 'geojson'
import mapboxgl, {
  GeoJSONSource,
  type EasingOptions,
  type RasterLayerSpecification
} from 'mapbox-gl'
import { onMounted, onUnmounted, readonly, ref } from 'vue'
import { addLayersAndSources } from './mapLayers'

let map: null | mapboxgl.Map = null
const mapShouldSpin = ref(false)
const mapInteractive = ref(false)
let firstLoad = true
const hikingLayersVisible = ref(false)

const { width, height } = useWindowSize()

export function useMap() {
  onMounted(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZGxiczAiLCJhIjoiY20wdGlpMmc2MHJqaDJsczVtNXRvN2ZneCJ9.47aVkXUGN8JNldnZUjj-nA'
    map = new mapboxgl.Map({
      container: 'backmap', // container ID
      style: 'mapbox://styles/dlbs0/cm0zbvi4501a501pj3rkd5sls',
      center: [130, 0], // starting position [lng, lat]
      zoom: 1.5, // starting zoom
      projection: 'globe', // display the map as a 3D globe
      attributionControl: false
      // antialias: true
    }).addControl(
      new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: 'dlbs'
      })
    )

    map.on('style.load', () => {
      // console.log('style loaded')
      map?.setFog({
        range: [0.5, 10],
        'horizon-blend': 0.1,
        color: '#c8d8de',
        'high-color': 'transparent',
        'space-color': 'transparent',
        'star-intensity': 0.0
      })
      addLayersAndSources()
    })
    map.on('moveend', () => {
      if (mapShouldSpin.value) spinGlobe()
    })
  })
  onUnmounted(() => {
    map?.remove()
    map = null
    console.log(map)
  })
  return { interactive: readonly(mapInteractive) }
}

export function useMapInteractive() {
  function setMapInteractive(value: boolean) {
    mapInteractive.value = value
    if (!map) return
    const ints = [
      map.scrollZoom,
      map.dragRotate,
      map.dragPan,
      map.doubleClickZoom,
      map.touchZoomRotate
    ]
    if (value) {
      ints.forEach((int) => int.enable())
    } else {
      ints.forEach((int) => int.disable())
    }
  }
  return { mapInteractive: readonly(mapInteractive), setMapInteractive }
}

export function setMapSpin(value: boolean) {
  mapShouldSpin.value = value
  if (value) spinGlobe()
}

function spinGlobe() {
  if (!map) return
  if (!mapShouldSpin.value) return
  if (map.isMoving()) return
  const secondsPerRevolution = 180
  const distancePerSecond = 360 / secondsPerRevolution

  const center = map.getCenter()
  center.lng += distancePerSecond
  // Smoothly animate the map over one second.
  // When this animation is complete, it calls a 'moveend' event.
  map.easeTo({
    center,
    duration: 1000,
    easing: (n) => n,
    zoom: 1.5,
    pitch: 0,
    padding: 0,
    bearing: 0
  })
}

export function showArticleStart(id: string) {
  if (!map) return
  const trip = getTripById(id)
  if (!trip) return

  const zoom = 12

  map.flyTo({
    center: trip.geography.overview.center,
    duration: firstLoad ? 10 : 3000,
    pitch: 0,
    zoom,
    bearing: 0,
    padding: { left: 0, right: 0, top: 0, bottom: height.value * 0.25 }
  })
  firstLoad = false
}

export function showGlobe() {
  if (!map) return
  map.flyTo({
    center: [map.getCenter().lng, 0], // starting position [lng, lat]
    zoom: 1.5, // starting zoom    duration: 2000,
    pitch: 0,
    bearing: 0,
    duration: 3000,
    padding: { left: 0, right: 0, top: 0, bottom: 0 }
  })
}

export function zoomToId(id: string) {
  if (!map) return
  const trip = getTripById(id)
  if (!trip) return
  setMapSpin(false)
  const bottomPadding = width.value > 900 ? 0 : height.value * 0.5
  const leftPadding = width.value > 900 ? width.value * 0.25 : 0

  let zoom = trip.geography.overview.zoom
  if (width.value < 900) zoom -= 1

  map.flyTo({
    center: trip.geography.overview.center,
    zoom: zoom,
    duration: 2000,
    pitch: 50,
    bearing: 0,
    padding: { left: leftPadding, right: 0, top: 0, bottom: bottomPadding }
  })
  const dotSource = map.getSource('dot-point') as GeoJSONSource
  dotSource?.setData(featureCollection([point(trip.geography.overview.center)]))
  const tracksSource = map.getSource('overview-tracks') as GeoJSONSource
  tracksSource?.setData(trip.geography.overview.tracks ?? featureCollection([]))
  firstLoad = false
}

export type Reveal = RevealIndex | number[] | number | 'none' | 'all'
interface RevealIndex {
  index: number
  onlyCurrent?: boolean
}

export async function showTracks(id: string, sequence?: Reveal) {
  if (!map) return
  const trip = await getTripDetailsById(id)
  if (!trip) return

  const tracksSource = map.getSource('detail-tracks') as GeoJSONSource
  if (typeof tracksSource == 'undefined') setTimeout(() => showTracks(id, sequence), 100)

  // Handle showing only portions of the full detailled tracks, in a few different formats
  if (typeof sequence !== 'undefined' && Array.isArray(trip.features) && trip.features.length > 0) {
    if (sequence == 'all') {
      tracksSource?.setData(trip ?? featureCollection([]))
    } else if (sequence == 'none') {
      tracksSource?.setData(featureCollection([]))
    } else {
      const output: Feature[] = []

      featureEach(trip, (currentFeature) => {
        if (!currentFeature.properties) return

        if (typeof sequence == 'number' && currentFeature.properties.order <= sequence)
          output.push(currentFeature)
        else if (Array.isArray(sequence) && sequence.length == 2) {
          if (
            currentFeature.properties.order <= sequence[1]! &&
            currentFeature.properties.order >= sequence[0]!
          )
            output.push(currentFeature)
        } else if (
          typeof sequence == 'object' &&
          'onlyCurrent' in sequence &&
          sequence.onlyCurrent
        ) {
          if (currentFeature.properties.order == sequence.index) output.push(currentFeature)
        } else if (
          typeof sequence == 'object' &&
          'index' in sequence &&
          currentFeature.properties.order <= sequence.index
        )
          output.push(currentFeature)
      })
      tracksSource?.setData(featureCollection(output))
    }
  } else {
    tracksSource?.setData(trip ?? featureCollection([]))
  }
}
export type MapOverlays = 'satellite' | 'contours' | boolean
export function useHikingLayers() {
  function showHikingLayers(visible: MapOverlays) {
    const map = getMap()
    if (!map) return
    const coolLayers = ['mapbox-satellite', 'hillshade', 'contour', 'contour-labels']
    hikingLayersVisible.value = visible == true

    coolLayers.forEach((layer) => {
      const lay = map.getLayer(layer) as RasterLayerSpecification
      if (lay) {
        let shouldShow = visible === true
        if (visible == 'satellite' && layer == 'mapbox-satellite') shouldShow = true
        if (
          visible == 'contours' &&
          (layer == 'contour' || layer == 'contour-labels' || layer == 'hillshade')
        )
          shouldShow = true
        map.setLayoutProperty(layer, 'visibility', shouldShow ? 'visible' : 'none')
      }
    })
  }

  return { visible: readonly(hikingLayersVisible), showHikingLayers }
}

export function fitBounds(
  geography: FeatureCollection | Feature,
  padding: { left: number; right: number; top: number; bottom: number } = {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20
  },
  pitch: number = 0,
  duration?: number
) {
  if (!map) return
  const bounds = bbox(geography)
  if (!bounds || bounds.length != 4) return
  const options: EasingOptions = { padding, pitch }
  if (duration) options.duration = duration
  else options.speed = 1
  map.fitBounds(bounds, options)
}

export function showOverviews(value: boolean) {
  if (!map) return
  const overviewLayers = ['layer-with-pulsing-dot', 'centers', 'overview-tracks']

  overviewLayers.forEach((layer) => {
    const lay = map?.getLayer(layer)
    if (!lay) {
      setTimeout(() => {
        console.log('retrying setting overviews', layer)
        showOverviews(value)
      }, 100)
    } else map?.setLayoutProperty(layer, 'visibility', value ? 'visible' : 'none')
  })

  const detailLayers = [
    'detail-tracks-walk',
    'detail-tracks-drive',
    'detail-tracks-boat',
    'detail-tracks-train',
    'detail-tracks-train-dashes',
    'detail-tracks-bus',
    'detail-tracks-bus-dashes',
    'detail-points',
    'detail-tracks-flight',
    'detail-tracks-flight-yellow',
    'detail-tracks-flight-icon'
  ]
  detailLayers.forEach((layer) => {
    const lay = map?.getLayer(layer)
    if (!lay) {
      setTimeout(() => {
        console.log('retrying setting overviews', layer)
        showOverviews(value)
      }, 100)
    } else map?.setLayoutProperty(layer, 'visibility', value ? 'none' : 'visible')
  })
}

export function getMap() {
  return map
}
