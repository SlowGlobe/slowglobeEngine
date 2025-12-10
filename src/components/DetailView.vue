<template>
  <div class="pswp"></div>
  <div class="topTrigger" v-intersection-observer="onIntersectionObserver"></div>

  <div class="cont2">
    <slot></slot>
    <div class="footer">
      <!-- <PostageStamp :image="headerImage"></PostageStamp> <br /> -->
      <SubscriptionBox v-slot="{ showDialog }">
        <div class="center">
          <div class="signOffCont">
            <button class="stampImage" @click="showDialog">
              <img class="stampImage" src="/images/subscribeStampWithWaves.svg" />
            </button>
            <!-- <img class="stampImage" src="/images/subscribeStampWithWaves.svg" /> -->
            <PostageStamp :image="headerImage" style="left: 0.75em"></PostageStamp>
          </div>
        </div>
      </SubscriptionBox>
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

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.signOffCont {
  rotate: -2deg;
  padding: 1.5em;
}
.stampImage {
  height: calc(5.5rem + 8px);
  width: calc(5.5rem + 8px);
  object-fit: cover;
  object-position: left;
  overflow: visible;
  position: relative;
  right: 0.75em;
  z-index: 2;
  border: none;
  background-color: transparent;
  cursor: pointer;
}

.stampImage:hover {
  background-color: transparent;
  scale: 1.05;
  transition: scale 0.15s linear;
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

function onIntersectionObserver([entry]: IntersectionObserverEntry[]) {
  if (!entry) return
  const pathId = router.currentRoute.value.path.split('/')?.[2] ?? ''
  if (entry.isIntersecting && pathId == tripId?.value) {
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
