<template>
  <div class="readout">
    <label>
      Name (optional)
      <input type="text" v-model="name" />
    </label>
    <label>
      Icon (optional)
      <select v-model="icon">
        <option value="">None</option>
        <option v-for="iconName in iconNames" :key="iconName" :value="iconName">
          {{ iconName }}
        </option>
      </select>
    </label>
    <label>
      GeoJSON feature
      <input type="text" :value="geoPoint" readonly />
    </label>
    <button @click="copy()">Copy Point</button>

    <br />
    Show Hiking Layers <input type="checkbox" v-model="hlShow" label="Show Hiking Layers" />
  </div>
</template>

<script setup lang="ts">
import { useHikingLayers, getMap, useMapInteractive } from '@/functions/map'
import { point } from '@turf/turf'
import { useClipboard, useLocalStorage } from '@vueuse/core'
import { computed, onMounted, type Ref } from 'vue'

const { showHikingLayers, visible } = useHikingLayers()

const currentPoint: Ref<[number, number]> = useLocalStorage('lastPointSelected', [0, 0] as [
  number,
  number
])
const iconNames = ['campsite', 'circle', 'diamond', 'mountain', 'picnic', 'plane', 'flag', 'target']
const icon = useLocalStorage('pointSelectIcon', 'circle')
const name = useLocalStorage('pointSelectName', '')

const { setMapInteractive } = useMapInteractive()

setMapInteractive(true)

const geoPoint = computed(() => {
  const properties: { icon?: string; name?: string } = {}
  if (icon.value) properties.icon = icon.value
  const trimmedName = name.value.trim()
  if (trimmedName) properties.name = trimmedName
  return JSON.stringify(point(currentPoint.value, properties))
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
    copy(geoPoint.value)
  })
  map?.setConfigProperty('basemap', 'showLabels', true)
  map?.setConfigProperty('basemap', 'showPlaceLabels', true)
  map?.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
  map?.setConfigProperty('basemap', 'showTransitLabels', true)
  map?.setConfigProperty('basemap', 'showRoadLabels', true)

  map?.flyTo({ center: currentPoint.value, zoom: 14 })
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

label {
  display: block;
  margin-bottom: 0.5rem;
}

input,
select {
  display: block;
  width: 100%;
  max-width: 32rem;
}
</style>
