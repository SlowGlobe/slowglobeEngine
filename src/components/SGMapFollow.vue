<template>
  <div class="startSeg"></div>
  <div ref="entireComponent" class="entireComponent">
    <div class="mapIntToggle" @click="setMapInteractive(!mapInteractive)">
      <iconify-icon v-if="mapInteractive" icon="material-symbols:lock" inline></iconify-icon>
      <iconify-icon v-else icon="material-symbols:lock-open" inline></iconify-icon>
      {{ mapInteractive ? 'Lock' : 'Unlock' }} Map
    </div>
    <div
      v-if="overview"
      class="mapCutout boundsFrame"
      v-intersection-observer="[onTopBoundsFrame, { rootMargin: '-45% 0px -45% 0px' }]"
    ></div>
    <div class="mapCutout" v-intersection-observer="onIntersectionObserver" ref="el"></div>
    <div v-if="currentTime != ''" class="timeBox">
      <iconify-icon icon="mdi:clock" inline></iconify-icon> {{ currentTime }}
    </div>
  </div>
  <div class="endSeg"></div>
</template>

<script setup lang="ts">
import {
  useHikingLayers,
  fitBounds,
  getMap,
  useMapInteractive,
  type MapOverlays
} from '@/functions/map'
import type { Feature, LineString } from 'geojson'
import { bbox, bezierSpline, featureCollection, length, point, simplify } from '@turf/turf'
import { vIntersectionObserver } from '@vueuse/components'
import { useElementBounding, useIntersectionObserver, useWindowSize } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { type CameraOptions, type GeoJSONSource } from 'mapbox-gl'
import { getCameraForCameraOptions, getPercGeom, llLikeToObject } from '@/functions/geometryHelpers'
const { setMapInteractive, mapInteractive } = useMapInteractive()
const { showHikingLayers } = useHikingLayers()

const props = defineProps<{
  geometry?: Feature<LineString>
  follow?: boolean
  overview?: boolean
  overviewPitch?: number
  useTime?: boolean
  showTime?: boolean
  followPitch?: number
  followZoom?: number
  lockBearing?: number
  satellite?: MapOverlays
  noPreScroll?: boolean
}>()

const fPitch = props.followPitch ?? 60
const fZoom = props.followZoom ?? 14.5

let fullGeometry: Feature<LineString>
let percentShown = 0
let shouldAnimate = ref(false)
const currentTime = ref('')
let followCameraLine: Feature<LineString>
let followCameraLineLength = 0
let cameraPos = { lat: 0, lng: 0 }
let camBearing = 0

const initialCameraPosition: CameraOptions = {}
let perScrollFinalCameraPosition: { lng: number; lat: number; bearing: number } | null = null

const randomId = Math.random().toString(36).slice(2)

const entireComponent = ref(null)
const el = ref(null)
const { top, height } = useElementBounding(el)
const { height: winHeight } = useWindowSize()

const scrollProgress = computed(() => {
  if (!shouldAnimate.value) return percentShown
  const position = -top.value
  const endStop = height.value - Math.floor(winHeight.value)
  if (position < 0) return 0
  const ratio = position / endStop
  if (ratio > 1) return 1
  return ratio
})

const preScrollProgress = computed(() => {
  if (!shouldAnimate.value || !props.follow) return 0
  const startPos = top.value - Math.floor(winHeight.value / 2)
  const ratio = -startPos / Math.floor(winHeight.value / 2)
  if (ratio > 1) return 1
  if (ratio < 0) return 0
  return ratio
})

function generateFrame(time: number) {
  if (!shouldAnimate.value) return
  if (mapInteractive.value) {
    requestAnimationFrame(generateFrame)
    return
  }

  const map = getMap()
  if (!map) return
  //animate from the fit bounds frame down to the start of the follow camera section
  if (preScrollProgress.value > 0 && preScrollProgress.value < 1) {
    doPreScrollAnimation()
  }
  let perc = scrollProgress.value
  const autoMode = false
  if (autoMode) {
    const period = 10000
    perc = (time % period) / period
  }

  if (perc === percentShown) {
    requestAnimationFrame(generateFrame)
    return
  }
  const results = getPercGeom(fullGeometry, perc, {
    useTime: props.useTime,
    showTime: props.showTime,
    follow: { shouldFollow: props.follow, followCameraLine, followCameraLineLength }
  })
  if (results.progressTime) currentTime.value = results.progressTime
  if (results.camPos) cameraPos = { lat: results.camPos[1], lng: results.camPos[0] }
  if (results.camBearing) camBearing = results.camBearing
  if (typeof props.lockBearing === 'number') camBearing = props.lockBearing
  const source = map.getSource(randomId + 'Follow') as GeoJSONSource
  if (source) {
    // Could use line-progress here instead, see https://docs.mapbox.com/mapbox-gl-js/example/query-terrain-elevation/
    // map.setPaintProperty(randomId + 'follow-tracks', 'line-gradient', [  'step',  ['line-progress'],  'red',  perc,  'rgba(255, 0, 0, 0)'])
    source.setData(results.progressLine)
  }
  percentShown = perc
  if (perc >= 0 && perc < 1) {
    if (props.follow) {
      const camera = getCameraForCameraOptions({
        center: cameraPos,
        pitch: fPitch,
        zoom: fZoom,
        bearing: camBearing
      })

      if (camera) map.setFreeCameraOptions(camera)
    }
  }
  const locArrowSource = map.getSource(randomId + 'locArrow') as GeoJSONSource
  if (locArrowSource && results.progressPosition && results.progressBearing) {
    locArrowSource.setData(
      featureCollection([point(results.progressPosition, { bearing: results.progressBearing })])
    )
  }

  setLighting()
  requestAnimationFrame(generateFrame)
}

function setLighting() {
  return
  // const map = getMap()
  // if (!map) return
  // if (props.follow && props.useTime) {
  //   const currentLight = map.getLights() as DirectionalLightSpecification[]
  //   console.log('currentLight:', currentLight)
  //   // if (!currentLight || !currentLight[0]) return
  //   // let startColour = { h: 0, s: 0, l: 100 }
  //   let startColour = { h: 33, s: 98, l: 77 }
  //   // let endColour = { h: 33, s: 98, l: 77 }
  //   let endColour = { h: 0, s: 0, l: 29 }
  //   //smoothly transition between the colours based on percentShown
  //   let colour = {
  //     h: (endColour.h - startColour.h) * percentShown + startColour.h,
  //     s: (endColour.s - startColour.s) * percentShown + startColour.s,
  //     l: (endColour.l - startColour.l) * percentShown + startColour.l
  //   }

  //   console.log(
  //     '`hsl(${colour.h}, ${colour.s}%, ${colour.l}%)`:',
  //     `hsl(${colour.h}, ${colour.s}%, ${colour.l}%)`
  //   )
  //   map.setLights([
  //     {
  //       id: 'sun_light',
  //       type: 'directional',
  //       properties: {
  //         color: `hsl(${colour.h}, ${colour.s}%, ${colour.l}%)`,
  //         // color: 'rgba(255.0, 0.0, 0.0, 1.0)',
  //         intensity: 0.9,
  //         direction: [120, 40.0],
  //         'cast-shadows': true,
  //         'shadow-intensity': 1
  //       }
  //     },
  //     {
  //       id: 'ambient_l',
  //       type: 'ambient',
  //       properties: {
  //         color: `hsl(${colour.h}, ${colour.s}%, ${colour.l}%)`,
  //         // color: 'rgba(255.0, 0.0, 0.0, 1.0)',
  //         intensity: 0.1
  //       }
  //     }
  //   ])

  //   const arr = [
  //     'match',
  //     ['config', 'lightPreset'],
  //     'dawn',
  //     'hsl(33, 98%, 77%)',
  //     'day',
  //     'hsl(0, 0%, 100%)',
  //     'dusk',
  //     'hsl(30, 98%, 76%)',
  //     'night',
  //     'hsl(0, 0%, 29%)'
  //   ]

  // currentLight[0].properties.direction = [360 * percentShown, 40]

  // const light: DirectionalLightSpecification = {
  //   type: 'directional',
  //   properties: {
  //     direction: [360 * percentShown, 40],
  //     color: 'hsl(33, 98%, 77%)',
  //     intensity: 1,
  //     'cast-shadows': true
  //   },
  //   id: 'danlight'
  // }

  // map.setLights([light])
  // }
}

function getProgress(perc: number, end?: number, start?: number) {
  return ((end ?? 0) - (start ?? 0)) * perc + (start ?? 0)
}

let lastEaseTime = 0
function doPreScrollAnimation() {
  const map = getMap()
  if (!map) return
  const intCamCent = llLikeToObject(initialCameraPosition.center)
  if (intCamCent.lat === 0 && intCamCent.lng === 0) {
    Object.assign(initialCameraPosition, {
      center: map.getCenter(),
      pitch: map.getPitch(),
      zoom: map.getZoom(),
      bearing: map.getBearing()
    })
  }

  if (perScrollFinalCameraPosition == null) {
    const result = getPercGeom(fullGeometry, 0, {
      follow: { shouldFollow: true, followCameraLine, followCameraLineLength }
    })
    if (result.camPos && result.camBearing)
      perScrollFinalCameraPosition = {
        lat: result.camPos[1],
        lng: result.camPos[0],
        bearing: typeof props.lockBearing === 'number' ? props.lockBearing : result.camBearing
      }
  }
  if (perScrollFinalCameraPosition == null) return
  const perc = props.noPreScroll ? 1 : preScrollProgress.value

  const easedPitch = getProgress(perc, fPitch, initialCameraPosition.pitch)
  const easedZoom = getProgress(perc, fZoom, initialCameraPosition.zoom)
  const easedBearing = getProgress(
    perc,
    perScrollFinalCameraPosition.bearing,
    initialCameraPosition.bearing
  )
  const easedLat = getProgress(perc, perScrollFinalCameraPosition.lat, intCamCent.lat)
  const easedLng = getProgress(perc, perScrollFinalCameraPosition.lng, intCamCent.lng)

  if (props.noPreScroll) {
    const now = Date.now()
    if (now - lastEaseTime < 1000) return
    lastEaseTime = now
    map.easeTo({
      center: { lat: easedLat, lng: easedLng },
      pitch: easedPitch,
      zoom: easedZoom,
      bearing: easedBearing,
      maxDuration: 900
    })
  } else
    map.jumpTo({
      center: { lat: easedLat, lng: easedLng },
      pitch: easedPitch,
      zoom: easedZoom,
      bearing: easedBearing
    })
}

function onTopBoundsFrame([{ isIntersecting }]: IntersectionObserverEntry[]) {
  if (isIntersecting) {
    fitBounds(fullGeometry, undefined, props.overviewPitch ?? 0, 500)
    const map = getMap()
    if (!map) return
    const bounds = bbox(fullGeometry)
    if (!bounds || bounds.length != 4) return
    Object.assign(
      initialCameraPosition,
      map.cameraForBounds(bounds, { padding: 20, pitch: props.overviewPitch ?? 0 })
    )
  }
}

function onIntersectionObserver([{ isIntersecting }]: IntersectionObserverEntry[]) {
  if (isIntersecting) {
    const map = getMap()
    if (!map) return
    if (!map.getSource(randomId + 'Follow')) {
      map.addSource(randomId + 'Follow', {
        type: 'geojson',
        // lineMetrics: true,
        // data: featureCollection([fullGeometry])
        data: featureCollection([]),
        dynamic: false
      })
    }
    if (!map.getLayer(randomId + 'follow-tracks')) {
      map.addLayer({
        id: randomId + 'follow-tracks',
        type: 'line',
        source: randomId + 'Follow',
        paint: {
          'line-color': 'rgb(110, 25, 25)',
          'line-width': 8
        }
      })
    }
    if (!map.getSource(randomId + 'locArrow')) {
      map.addSource(randomId + 'locArrow', {
        type: 'geojson',
        data: featureCollection([]),
        dynamic: false
      })
    }
    if (!map.getLayer(randomId + 'locArrow')) {
      map.addLayer({
        id: randomId + 'locArrow',
        type: 'symbol',
        source: randomId + 'locArrow',
        layout: {
          'icon-image': 'loc-arrow',
          'icon-size': 1,

          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          // 'icon-rotate': 90,
          'icon-rotate': ['get', 'bearing'],
          // 'icon-pitch-alignment': 'viewport',
          // 'icon-pitch-alignment': 'map',
          'icon-rotation-alignment': 'map'
          // 'icon-rotation-alignment': 'viewport',
          // 'symbol-placement': 'point'
        },
        paint: {
          // 'icon-opacity': 0.5
          // 'icon-color': '#aa8c53',
          // 'icon-halo-width': 5,
          // 'icon-halo-color': '#721817',
          // 'icon-halo-blur': 0
        }
      })
    }
    shouldAnimate.value = true
    requestAnimationFrame(generateFrame)
  } else {
    requestAnimationFrame(generateFrame)
    shouldAnimate.value = false
  }
}

useIntersectionObserver(
  entireComponent,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      showLocationArrow(true)
      showHikingLayers(props.satellite ?? true)
    } else {
      // showHikingLayers(false)
      showLocationArrow(false)
    }
  },
  { rootMargin: '-50% 0px -45% 0px' }
)

function showLocationArrow(visible: boolean) {
  const map = getMap()
  if (!map) return
  if (map.getLayer(randomId + 'locArrow')) {
    map.setLayoutProperty(randomId + 'locArrow', 'visibility', visible ? 'visible' : 'none')
  }
}

onMounted(() => {
  if (props.geometry) {
    fullGeometry = props.geometry
    if (props.follow) {
      followCameraLine = bezierSpline(simplify(fullGeometry, { tolerance: 0.005 }), {
        resolution: 100000,
        sharpness: 0.5
      })
      followCameraLineLength = length(followCameraLine)
      // const map = getMap()
      // if (!map) return
      // map.setTerrain(null)
      // if (!map.getSource('fcam' + randomId)) {
      //   map.addSource('fcam' + randomId, {
      //     type: 'geojson',
      //     data: featureCollection([followCameraLine])
      //   })
      // }
      // if (!map.getLayer('fcam' + randomId)) {
      //   map.addLayer({
      //     id: 'fcam' + randomId,
      //     type: 'line',
      //     source: 'fcam' + randomId,
      //     paint: {
      //       'line-color': 'rgb(10, 255, 25)',
      //       'line-width': 8
      //     }
      //   })
      // }
    }
  }
})

onUnmounted(() => {
  const map = getMap()
  if (map) {
    if (map.getLayer(randomId + 'follow-tracks')) map.removeLayer(randomId + 'follow-tracks')
    if (map.getSource(randomId + 'Follow')) map.removeSource(randomId + 'Follow')
    if (map.getLayer(randomId + 'locArrow')) map.removeLayer(randomId + 'locArrow')
  }
  showLocationArrow(false)
  // showHikingLayers(false)
  shouldAnimate.value = false
})
</script>

<style scoped>
.startSeg {
  mask: var(--topCutoutMask);
}
.endSeg {
  height: 0em;
  mask: var(--bottomCutoutMask);
}
.mapCutout {
  height: max(300vh, 300px);
  min-width: 200px;
  background-color: transparent;
  padding: 0;
  margin: 0;
  z-index: -10;
  position: relative;
  top: 0;
  left: 0;
}

.boundsFrame {
  background-color: transparent;
  height: 60vh;
}

.entireComponent {
  background-color: transparent;
  margin: 0;
  padding: 0;
}

.timeBox {
  width: max-content;
  position: sticky;
  /* top: calc(100vh - 12em); */
  bottom: 1em;
  margin-bottom: 1em;
  right: 0em;
  @media (width <= 900px) {
    right: 1em;
  }
  margin-left: auto;
  border-radius: 0.25em;

  padding: 0.5em;
  background-color: var(--md-sys-color-on-surface);
  color: white;
  right: 0em;
  font-size: 1em;
  font-family: 'Public Sans', sans-serif;
}

.mapIntToggle {
  background-color: var(--md-sys-color-surface);

  width: max-content;
  position: sticky;
  top: 5em;

  right: 0em;
  @media (width <= 900px) {
    right: 1em;
  }
  padding: 0.5em;
  margin-top: 1em;
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

.bottom {
  top: unset;
  bottom: 40em;
}
</style>
