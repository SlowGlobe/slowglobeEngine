<script lang="ts" setup>
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useElementBounding, useIntersectionObserver } from '@vueuse/core'
import { getMap } from '@/functions/map'
import mapboxgl, { GeoJSONSource, Marker, type PointLike } from 'mapbox-gl'

type PhotoCoords = [number, number]

const props = defineProps<{
  coords?: PhotoCoords
}>()
const photoPinTargetRef = useTemplateRef('pin')

// Set up intersection observer for the photo element
useIntersectionObserver(photoPinTargetRef, ([entry]) => {
  if (entry) {
    photoIsOnscreen.value = entry.isIntersecting
  }
})
const { y, top, left, width, height } = useElementBounding(photoPinTargetRef)

const randomId = Math.random().toString(36).slice(2)
const lineSourceId = `photo-pin-line-source-${randomId}`
const lineLayerId = `photo-pin-line-layer-${randomId}`
const marker = ref<Marker | null>(null)
let map: mapboxgl.Map | null = null

let mapPinIsOnscreen = false
const photoIsOnscreen = ref(false)

function getPhotoLineFeatures(mapInstance: mapboxgl.Map) {
  if (!props.coords || props.coords.length !== 2 || !photoPinTargetRef.value) return []

  const mapRect = mapInstance.getContainer().getBoundingClientRect()
  const photoCenter = [
    left.value + width.value / 2 - mapRect.left,
    top.value + height.value / 2 - mapRect.top
  ]

  const targetCoord = mapInstance.unproject(photoCenter as PointLike)

  return [
    {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [props.coords, [targetCoord.lng, targetCoord.lat]]
      },
      properties: {}
    }
  ]
}

function updateLine() {
  const mapInstance = map || getMap()
  if (!mapInstance || !mapInstance.getSource(lineSourceId)) return

  const source = mapInstance.getSource(lineSourceId) as GeoJSONSource
  if (!props.coords || props.coords.length !== 2) {
    console.warn('Missing coords or targetRef for photo line, cannot update line')
    return
  }

  const showLine = mapPinIsOnscreen && photoIsOnscreen.value

  if (showLine) {
    mapInstance.setPaintProperty(lineLayerId, 'line-opacity', 0.9)
  } else {
    mapInstance.setPaintProperty(lineLayerId, 'line-opacity', 0)
  }

  source.setData({
    type: 'FeatureCollection',
    features: getPhotoLineFeatures(mapInstance)
  })
}

onMounted(() => {
  map = getMap()
  if (!map) {
    console.warn("Map not found, can't add photo line")
    return
  }

  if (props.coords && props.coords.length === 2) {
    const el = document.createElement('div')
    el.className = 'mapPin'
    marker.value = new Marker(el).setLngLat(props.coords).addTo(map)
  }

  if (!map.getSource(lineSourceId)) {
    map.addSource(lineSourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    })
  }

  if (!map.getLayer(lineLayerId)) {
    map.addLayer({
      id: lineLayerId,
      type: 'line',
      source: lineSourceId,
      paint: {
        'line-color': '#a4000d',
        'line-width': 4,
        'line-opacity': 0.9,
        'line-opacity-transition': { duration: 500 } // 500 milliseconds = 1/2 seconds
      }
    })
  }

  const onMapMove = () => {
    // Check if the map pin is on screen
    // Can't use map.getBounds().contains() because it accounts for padding
    const map = getMap()
    if (!map) return
    const coordsAsPixel = map.project(props.coords as [number, number])
    mapPinIsOnscreen = map?.isPointOnSurface(coordsAsPixel) ?? false
    updateLine()
  }
  map.on('move', onMapMove)

  watch(y, updateLine)

  onUnmounted(() => {
    marker.value?.remove()
    map?.off('move', onMapMove)
    if (map?.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
    if (map?.getSource(lineSourceId)) map.removeSource(lineSourceId)
  })
})
</script>

<style>
.mapPin {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 33%, #f0a070 0%, #c85030 45%, #7a2010 100%);
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.45),
    inset 0 -1px 2px rgba(255, 255, 255, 0.15);
  z-index: 20;
  cursor: pointer;
}
</style>

<style scoped>
.pin {
  content: '';
  position: absolute;
  top: -9px;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: transparent;
}
</style>

<template>
  <div class="pin" ref="pin"></div>
</template>
