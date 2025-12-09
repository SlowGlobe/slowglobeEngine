<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { vIntersectionObserver } from '@vueuse/components'
import { computed, onBeforeMount, onUnmounted } from 'vue'
import PolaroidPicture from '@/components/PolaroidPicture.vue'
import {
  setMapSpin,
  showGlobe,
  showOverviews,
  useHikingLayers,
  useMapInteractive,
  zoomToId
} from '@/functions/map'
import { allTrips } from '~/allTrips'
import { useRouter } from 'vue-router'
import AboutDetail from '~/AboutDetail.vue'

const { showHikingLayers } = useHikingLayers()
const { setMapInteractive } = useMapInteractive()

const router = useRouter()

onBeforeMount(() => {
  showGlobe()
  showHikingLayers(false)
  setMapInteractive(false)
  setMapSpin(true)
  showOverviews(true)
})

onUnmounted(() => {
  setMapInteractive(false)
  setMapSpin(false)
  showOverviews(false)
})

function onIntersectionObserver([{ isIntersecting, target }]: IntersectionObserverEntry[]) {
  if (isIntersecting && target.id) {
    if (target.id === 'topOfPage' && router.currentRoute.value.name == '/') {
      showGlobe()
      setMapSpin(true)
    } else {
      zoomToId(target.id)
    }
  }
}

const { width } = useWindowSize()

const intMarg = computed(() => {
  if (width.value <= 900) {
    return '-60% 0px -30px 0px'
  }
  return '-45% 0px -45% 0px'
})
</script>

<template>
  <!-- When scroll animation has better browser support, look at this https://scroll-driven-animations.style/demos/stacking-cards/css/ -->
  <!-- Can also look at scrollsnapchange event when that has better support instead of intersection observers on every card -->
  <div class="polaroidGrid">
    <div
      class="mapSpacer"
      id="topOfPage"
      v-intersection-observer="[onIntersectionObserver, { rootMargin: intMarg }]"
    >
      Scroll Down
      <br />
      <iconify-icon icon="guidance:down-arrow"></iconify-icon>
    </div>
    <div class="mapSpacer"></div>
    <template v-for="i in allTrips" :key="i">
      <PolaroidPicture
        :img-url="i.headerImage"
        :caption="i.name"
        :link="`/trip/${i.id}`"
      ></PolaroidPicture>

      <div
        class="snapper"
        :id="i.id"
        v-intersection-observer="[onIntersectionObserver, { rootMargin: intMarg }]"
      ></div>
    </template>
    <div class="mapSpacer halfHeight"></div>
    <div class="mapSpacer halfHeight"></div>
    <div class="attributionContainer">
      <AboutDetail />
    </div>
  </div>
</template>

<style></style>

<style scoped>
.attributionContainer {
  min-height: 100vh;
  position: relative;
  scroll-snap-align: start;
  z-index: 110;
  width: 100%;
  color: var(--md-sys-color-on-surface);
  background-color: var(--md-sys-color-surface);
  display: flex;
  justify-content: center;
  align-items: center;
}

.polaroidGrid {
  --desktop-pol-peek: 75vh;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-columns: 100% 10px;
  grid-template-rows: var(--desktop-pol-peek) auto;
  gap: 4em 0px;
  @media (width <= 900px) {
    grid-template-rows: 90vh auto;
    gap: 55vh 0px;
  }
  justify-items: start;
  align-items: center;
  z-index: 2;
}

.snapper {
  translate: -100px 0;
  width: 1px;
  height: 90px;
  scroll-snap-align: center;
  @media (width <= 900px) {
    scroll-snap-align: end;
    height: 100%;
    @supports (-webkit-touch-callout: none) {
      /* CSS specific to iOS devices */
      /* background-color: blue; */
      scroll-snap-align: start;
      height: 100vh;
      z-index: 20;
    }
  }
  scroll-snap-stop: always;
  z-index: -20;
}

.mapSpacer {
  align-self: flex-start;
  translate: -100px 0;
  width: 1px;
  height: 100%;
  scroll-snap-align: end;
  z-index: 2;
}
.halfHeight {
  scroll-snap-align: none;
  height: 50vh;
  background-color: blue;
}

.mapSpacer:first-child {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: var(--polaroid-width);
  height: unset;
  translate: none;
  padding: 0px 10vw;
  padding-top: calc(50vh - 2em);

  @media (width <= 900px) {
    height: 100%;
    width: 100%;
    padding: 0;
    justify-content: end;
  }

  font-family: 'Reenie Beanie', 'Courier New', Courier, monospace;
  line-height: 2em;
  font-size: 2em;
  /* scroll-snap-align: none; */

  /* animation:
    hover 3s ease-in-out infinite alternate,
    fadeOut 5s forwards ease-in-out 15s; */

  animation: hover 3s ease-in-out infinite alternate;
}

@keyframes hover {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-10px);
  }
}
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.mapSpacer:last-child {
  height: 50vh;
}
</style>
