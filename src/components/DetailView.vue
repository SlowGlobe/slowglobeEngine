<template>
  <div class="pswp"></div>
  <div class="topTrigger" v-intersection-observer="onIntersectionObserver"></div>

  <div class="cont2">
    <slot></slot>
    <div class="footer">
      <!-- <PostageStamp :image="headerImage"></PostageStamp> <br /> -->
      <SubscriptionBox :header-image="headerImage" />
    </div>
  </div>
</template>

<style scoped>
.topTrigger {
  height: 1px;
}
.cont2 {
  margin: 0 auto;
  margin-top: 45vh;
  max-width: calc(60ch + 6em);
  color: var(--md-sys-color-on-surface);
}
.cont2 > * {
  background-color: var(--md-sys-color-surface);
  padding: 1em 2em;
  @media (width >= 500px) {
    padding: 1em 3em;
  }
}
.footer {
  z-index: 2;
  position: relative;
  padding-bottom: 3em;
  text-align: center;

  @media (width >= 900px) {
    mask: var(--topCutoutMask);
    margin-bottom: 4em;
  }
}
</style>

<script setup lang="ts">
import {
  setMapSpin,
  showArticleStart,
  showOverviews,
  showTracks,
  useHikingLayers,
  useMapInteractive,
  type Reveal
} from '@/functions/map'
import PostageStamp from './PostageStamp.vue'
import { vIntersectionObserver } from '@vueuse/components'
import { inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tripIdSymbol } from '@/functions/classes'
import { getTripHeaderInfoById } from '@/functions/trips'
import SubscriptionBox from './SubscriptionBox.vue'

const props = defineProps<{
  reveal?: Reveal
}>()

const tripId = inject(tripIdSymbol)
const { setMapInteractive } = useMapInteractive()
const { showHikingLayers } = useHikingLayers()

onMounted(() => {
  setMapInteractive(false)
  setMapSpin(false)
  showOverviews(false)
  showTracks(tripId?.value ?? '')
})
const router = useRouter()

function onIntersectionObserver([{ isIntersecting }]: IntersectionObserverEntry[]) {
  const pathId = router.currentRoute.value.path.split('/')?.[2] ?? ''
  if (isIntersecting && pathId == tripId?.value) {
    showArticleStart(tripId?.value ?? '')
    showTracks(tripId?.value ?? '')
    showHikingLayers(false)
    if (props.reveal) {
      showTracks(tripId?.value ?? '', props.reveal)
    }
  }
}

const { headerImage } = getTripHeaderInfoById(tripId?.value ?? '')
</script>
