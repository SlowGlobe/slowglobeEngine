<template>
  <div class="startSeg"></div>
  <div class="mapIntToggle" @click="setMapInteractive(!mapInteractive)">
    <iconify-icon v-if="mapInteractive" icon="material-symbols:lock" inline></iconify-icon>
    <iconify-icon v-else icon="material-symbols:lock-open" inline></iconify-icon>
    {{ mapInteractive ? 'Lock' : 'Unlock' }} Map
  </div>
  <div
    class="mapCutout"
    v-intersection-observer="[onIntersectionObserver, { rootMargin: '-45% 0px -45% 0px' }]"
  ></div>
  <div class="endSeg"></div>
</template>

<script setup lang="ts">
import { useHikingLayers, getMap, useMapInteractive, type MapOverlays } from '@/functions/map'
import { featureCollection, point } from '@turf/turf'
import { vIntersectionObserver } from '@vueuse/components'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { LngLat, type GeoJSONSource } from 'mapbox-gl'
import { useWindowSize } from '@vueuse/core'
const { setMapInteractive, mapInteractive } = useMapInteractive()
const { showHikingLayers } = useHikingLayers()

const props = defineProps<{
  center: [number, number]
  zoom?: number
  pitch?: number
  hideMarker?: boolean
  satellite?: MapOverlays
  vanishingOffset?: number
}>()

const { height } = useWindowSize()

const randomId = Math.random().toString(36).slice(2)
const shouldAnimate = ref(false)
let initialBearing = -99
let lastTimestamp = 0

function generateFrame(timestamp: number) {
  if (!shouldAnimate.value) return
  if (mapInteractive.value) return

  const map = getMap()
  if (!map) return
  if (initialBearing === -99) {
    initialBearing = timestamp - map.getBearing() * 100
    lastTimestamp = 0
  }

  const desiredPitch = props.pitch ?? 0
  const currentPitch = map.getPitch()
  let newPitch = currentPitch
  if (Math.abs(desiredPitch - currentPitch) > 1) {
    if (lastTimestamp == 0) lastTimestamp = timestamp
    const degsPs = 25
    const degs = (degsPs * (timestamp - lastTimestamp)) / 1000
    if (desiredPitch > currentPitch) {
      newPitch = currentPitch + degs
    } else {
      newPitch = currentPitch - degs
    }
    map.setPitch(newPitch)
  }
  const nb = ((timestamp - initialBearing) / 100) % 360

  const padding = { top: 0, bottom: 0, left: 0, right: 0 }
  if (props.vanishingOffset) {
    padding.top = props.vanishingOffset * height.value
  }

  map.jumpTo({
    center: LngLat.convert(props.center),
    zoom: props.zoom ?? 12,
    bearing: nb,
    padding,
    retainPadding: false
  })
  // map.rotateTo(((timestamp - initialBearing) / 100) % 360, { duration: 0 })
  lastTimestamp = timestamp
  requestAnimationFrame(generateFrame)
}

watch(mapInteractive, () => {
  if (!mapInteractive.value) flyToCenter()
})

function flyToCenter() {
  if (props.center) {
    initialBearing = -99
    if (!shouldAnimate.value) return
    const map = getMap()
    if (!map) return

    const mapCenterDistance = map.getCenter().distanceTo(LngLat.convert(props.center))
    const shouldFlyToCenter = mapCenterDistance > 10
    let pitch
    if (shouldFlyToCenter) pitch = props.pitch ? 5 : 0
    else pitch = props.pitch ?? 0

    const padding = { top: 0, bottom: 0, left: 0, right: 0 }
    if (props.vanishingOffset) {
      padding.top = props.vanishingOffset * height.value
    }

    map.flyTo({
      center: props.center,
      zoom: props.zoom ?? 12,
      pitch,
      bearing: map.getBearing(),
      speed: 1,
      padding,
      easing: (t) => {
        return t
      }
    })
    map.once('moveend', () => {
      requestAnimationFrame(generateFrame)
    })
    const dotSource = map.getSource(randomId + 'location') as GeoJSONSource
    dotSource?.setData(featureCollection([point(props.center)]))
  }
}

function onIntersectionObserver([{ isIntersecting }]: IntersectionObserverEntry[]) {
  if (isIntersecting) {
    shouldAnimate.value = true
    flyToCenter()
    showHikingLayers(props.satellite ?? false)
    showLocation(true)
  } else {
    showLocation(false)
    shouldAnimate.value = false
    initialBearing = -99
  }
}

function showLocation(visible: boolean) {
  const map = getMap()
  if (!map) return
  if (map.getLayer(randomId + 'location')) {
    map.setLayoutProperty(randomId + 'location', 'visibility', visible ? 'visible' : 'none')
  }
}

onMounted(() => {
  const map = getMap()
  if (map && props.hideMarker !== true) {
    if (!map.getSource(randomId + 'location'))
      map.addSource(randomId + 'location', {
        type: 'geojson',
        data: featureCollection([point(props.center)])
      })
    if (!map.getLayer(randomId + 'location'))
      map.addLayer({
        id: randomId + 'location',
        type: 'symbol',
        source: randomId + 'location',
        layout: {
          'icon-image': 'pulsing-dot',
          //   'icon-rotate': ['get', 'bearing'],
          'icon-rotation-alignment': 'map'
        }
      })
  }
})

onUnmounted(() => {
  const map = getMap()
  if (map) {
    if (map.getLayer(randomId + 'location')) map.removeLayer(randomId + 'location')
    if (map.getSource(randomId + 'location')) map.removeSource(randomId + 'location')
  }
})
</script>

<style scoped>
.startSeg {
  height: 0em;
  mask: var(--topCutoutMask);
}
.endSeg {
  height: 0em;
  mask: var(--bottomCutoutMask);
}
.mapCutout {
  height: max(60vh, 300px);
  min-width: 200px;
  background-color: transparent;
  z-index: -10;
  position: relative;
  top: 0;
  left: 0;
}

.mapIntToggle {
  width: max-content;
  position: relative;
  top: 1em;
  right: 0em;
  @media (width <= 900px) {
    right: 1em;
  }
  padding: 0.5em;
  margin-left: auto;
  border-radius: 0.25em;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
  color: var(--md-sys-color-on-surface);
  font-size: 1em;
  font-family: 'Public Sans', sans-serif;
  font-weight: 400;
  cursor: pointer;
  z-index: 10;
}
</style>
