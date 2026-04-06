<template>
  <div
    ref="mapWindow"
    :class="`tl-desk-item tl-span-${props.span} tl-desk-spacer`"
    v-intersection-observer="[onIntersectionObserver, { rootMargin: '-45% 0px -45% 0px' }]"
  ></div>
</template>
<script lang="ts" setup>
import { tripIdSymbol } from '@/functions/classes'
import {
  type Reveal,
  type MapOverlays,
  fitBounds,
  getMap,
  showTracks,
  useHikingLayers
} from '@/functions/map'
import { featureCollection } from '@turf/turf'
import { vIntersectionObserver } from '@vueuse/components'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import type { FeatureCollection, Feature } from 'geojson'
import { inject, useTemplateRef } from 'vue'
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
  span: number
}>()

const mapWindow = useTemplateRef('mapWindow')
const { height: windowHeight, width: windowWidth } = useWindowSize()
const { x, width } = useElementBounding(mapWindow)

const tripId = inject(tripIdSymbol)

function onIntersectionObserver([entry]: IntersectionObserverEntry[]) {
  if (entry && entry.isIntersecting) {
    console.log('row intersecting, showing hiking layers')
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

      const vh = windowHeight.value * 0.2
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
          left: Math.max(20, x.value),
          right: Math.max(20, windowWidth.value - (x.value + width.value)),
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
