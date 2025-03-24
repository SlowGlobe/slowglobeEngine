<template>
  <div class="inFront">
    <h1>Convert GPX or (KML) to timestamped geojson</h1>

    <p>Upload GPX/KML file</p>

    gpx: <input type="file" accept=".gpx, .kml" /> <button @click="onConvert">Convert</button>
    {{ fileType }}
    <br />
    <input type="text" v-model="geoJsonStringVersion" />
    <button @click="copy()">Copy Output</button>

    <!-- geoJsonVersion: {{ geoJsonVersion }} -->
  </div>
  <br />
  <br />
  <br />
  {{ gpxText }}
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { gpx, kml } from '@tmcw/togeojson'
import { useClipboard } from '@vueuse/core'
import { getMap, useMapInteractive } from '@/functions/map'
import { center, featureCollection } from '@turf/turf'
import type { GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'

const gpxText: Ref<string> = ref('')
const fileType: Ref<string> = ref('')

const { setMapInteractive } = useMapInteractive()
setMapInteractive(true)

// Read the input file when the convert button is clicked

function onConvert() {
  const file = document.querySelector('input[type="file"]') as HTMLInputElement
  const gpx = file.files?.[0]
  // get the file type
  if (gpx) fileType.value = gpx.type
  console.log('gpx:', gpx)
  if (!gpx) return
  const reader = new FileReader()

  reader.onload = function () {
    gpxText.value = reader.result as string
  }

  reader.readAsText(gpx)
}

onMounted(() => {
  const map = getMap()
  if (!map) return
  if (!map.getSource('conversion')) {
    map.addSource('conversion', {
      type: 'geojson',
      data: featureCollection([])
    })
  }
  if (!map.getLayer('conversion')) {
    map.addLayer({
      id: 'conversion',
      type: 'line',
      source: 'conversion',
      paint: {
        'line-color': 'rgb(110, 25, 25)',
        'line-width': 8
      }
    })
  }
})

const geoJsonVersion = computed(() => {
  try {
    let geojson
    if (fileType.value == 'application/vnd.google-earth.kml+xml') {
      geojson = kml(new DOMParser().parseFromString(gpxText.value, 'text/xml'))
    } else {
      geojson = gpx(new DOMParser().parseFromString(gpxText.value, 'text/xml'))
    }
    return geojson
  } catch (e) {
    console.warn('gpx parse error', e)
    return ''
  }
})

watch(geoJsonVersion, (geojson) => {
  const map = getMap()
  if (!map) return
  const source = map.getSource('conversion') as GeoJSONSource
  if (source && geojson) {
    source.setData(geojson as FeatureCollection)
    const cnt = center(geojson as FeatureCollection)
    if (cnt) {
      map.panTo(cnt.geometry.coordinates as [number, number])
    }
  }
})

const geoJsonStringVersion = computed(() => {
  try {
    return JSON.stringify(geoJsonVersion.value, null, 2)
  } catch (e) {
    console.warn('gpx parse error', e)
    return ''
  }
})
const { copy } = useClipboard({ source: geoJsonStringVersion })
</script>

<style scoped>
.inFront {
  position: relative;
  z-index: 2;
}
</style>
