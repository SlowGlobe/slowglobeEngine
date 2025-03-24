<template>
  <div class="readout">
    Hello

    <br />
    currentPoint: {{ currentPoint }} <br />
    <input type="text" v-model="geoPoint" />
    <button @click="copy()">Copy Point</button>

    <br />
    Show Hiking Layers <input type="checkbox" v-model="hlShow" label="Show Hiking Layers" />
  </div>
</template>

<script setup lang="ts">
import { useHikingLayers, getMap, useMapInteractive } from '@/functions/map'
import { point } from '@turf/turf'
import { useClipboard } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

const { showHikingLayers, visible } = useHikingLayers()

const currentPoint = ref([0, 0])

const { setMapInteractive } = useMapInteractive()

setMapInteractive(true)

const geoPoint = computed(() => {
  return JSON.stringify(point(currentPoint.value))
})

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
  map?.on('click', (e) => {
    currentPoint.value = e.lngLat.wrap().toArray()
    copy(currentPoint.value.toString())
  })
  map?.setConfigProperty('basemap', 'showLabels', true)
  map?.setConfigProperty('basemap', 'showPlaceLabels', true)
  map?.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
  map?.setConfigProperty('basemap', 'showTransitLabels', true)
  map?.setConfigProperty('basemap', 'showRoadLabels', true)
})

// map?.on('mousemove', (e) => {
//   currentPoint.value = e.lngLat.wrap().toArray()
// })

const { copy } = useClipboard({ source: geoPoint })
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
