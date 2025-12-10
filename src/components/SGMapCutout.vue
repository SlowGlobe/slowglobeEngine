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
import {
  fitBounds,
  getMap,
  showTracks,
  useHikingLayers,
  useMapInteractive,
  type MapOverlays,
  type Reveal
} from '@/functions/map'
import type { Feature, FeatureCollection } from 'geojson'
import { featureCollection } from '@turf/turf'
import { vIntersectionObserver } from '@vueuse/components'
import { useWindowSize } from '@vueuse/core'
import { inject } from 'vue'
import { tripIdSymbol } from '@/functions/classes'
const { setMapInteractive, mapInteractive } = useMapInteractive()
const { showHikingLayers } = useHikingLayers()

const props = defineProps<{
  fitBoundsGeometry?: FeatureCollection | Feature // optional, will fit the map to the bounds of this geometry
  center?: [number, number] // optional, will set the map center to this location
  zoom?: number
  pitch?: number
  bearing?: number
  fitOnlyToIndexes?: number[] // only use some of the features in the fitBoundsGeometry when fitting
  reveal?: Reveal // show only some parts of the trip on the map, requires the 'order' property in the features
  satellite?: MapOverlays
}>()

const { height } = useWindowSize()
const tripId = inject(tripIdSymbol)

function onIntersectionObserver([entry]: IntersectionObserverEntry[]) {
  if (entry && entry.isIntersecting) {
    showHikingLayers(props.satellite ?? false)
    if (props.fitBoundsGeometry) {
      let fitGeom = props.fitBoundsGeometry ?? featureCollection([])
      if (
        props.fitOnlyToIndexes &&
        props.fitOnlyToIndexes.length > 0 &&
        fitGeom.type == 'FeatureCollection'
      ) {
        // take only the features from the fitBoundsGeometry that are in the array at the given indexes
        // @ts-expect-error we have already checked for the type in the if above
        fitGeom = featureCollection(props.fitOnlyToIndexes.map((i) => fitGeom?.features[i]))
      }

      const vh = height.value * 0.2
      fitBounds(
        fitGeom,
        {
          top: vh,
          bottom: vh,
          left: 50,
          right: 50
        },
        props.pitch ?? 0
      )
    } else if (props.center && props.zoom) {
      getMap()?.flyTo({
        center: props.center,
        zoom: props.zoom,
        pitch: props.pitch ?? 0,
        bearing: props.bearing ?? 0,
        padding: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20
        },
        duration: 3000
      })
    }

    if (props.reveal) {
      showTracks(tripId?.value ?? '', props.reveal)
    }
  }
}
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
