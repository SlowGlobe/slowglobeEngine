<template>
  <div class="readout">
    <!-- currentPoint: {{ currentPoint }} <br /> -->
    <input type="text" v-model="currentPoint" />
    <button @click="copy()">Copy Point</button>
    <br />
    <button @click="snapshot()">Snapshot</button>
    Zoom: {{ currentZoom }} Pitch: {{ currentPitch }} Bearing: {{ currentBearing }}
    <br />
    Show Hiking Layers <input type="checkbox" v-model="hlShow" label="Show Hiking Layers" />
  </div>
</template>

<script setup lang="ts">
import { useHikingLayers, getMap, useMapInteractive } from '@/functions/map'
import { useClipboard } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

const { showHikingLayers, visible } = useHikingLayers()

const currentPoint = ref('')
const currentZoom = ref(14)
const currentPitch = ref(0)
const currentBearing = ref(0)

const { setMapInteractive } = useMapInteractive()

setMapInteractive(true)

function snapshot() {
  const map = getMap()
  if (!map) return
  currentPitch.value = map.getPitch()
  currentZoom.value = map.getZoom()
  currentPoint.value = map.getCenter().wrap().toArray().toString()
  currentBearing.value = map.getBearing()
}

const hlShow = computed({
  get() {
    return visible.value
  },
  set(newValue) {
    console.log('newValue:', newValue)
    showHikingLayers(newValue)
  }
})

onMounted(() => {
  const map = getMap()

  map?.on('moveend', snapshot)
  map?.setConfigProperty('basemap', 'showLabels', true)
  map?.setConfigProperty('basemap', 'showPlaceLabels', true)
  map?.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
  map?.setConfigProperty('basemap', 'showTransitLabels', true)
  map?.setConfigProperty('basemap', 'showRoadLabels', true)
})

// map?.on('mousemove', (e) => {
//   currentPoint.value = e.lngLat.wrap().toArray()
// })

const { copy } = useClipboard({ source: currentPoint })
</script>

<style lang="css" scoped>
.readout {
  position: relative;
  top: 0;
  right: 0;
  z-index: 2;
  background-color: white;
}
</style>
