<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useMap } from '@/functions/map'
import { computed, provide } from 'vue'
import { tripIdSymbol } from './functions/classes'
const route = useRoute()

const { interactive } = useMap()
const shouldScrollSnap = computed(() => route.path === '/')
const ssnapText = computed(() => (shouldScrollSnap.value ? 'y mandatory' : 'none'))
const transitionName = computed(() => (route.path === '/' ? 'slide' : 'up'))

const tripId = computed(() =>
  route.path.startsWith('/trip/') ? (route.path.split('/')[2] ?? '') : ''
)
provide(tripIdSymbol, tripId)
</script>

<template>
  <header>
    <RouterLink to="/">
      <img src="/images/logoStamp.svg" />
    </RouterLink>
  </header>
  <main>
    <div class="map" id="backmap"></div>
    <router-view v-slot="{ Component, route }">
      <Transition :name="transitionName" mode="out-in">
        <div :key="route.name">
          <component :is="Component" :key="route.path"></component>
        </div>
      </Transition>
    </router-view>
  </main>
  <component :is="'style'" type="text/css">
    html { --some-var: {{ ssnapText }}; scroll-snap-type: var(--some-var) !important; }
  </component>
</template>

<style>
.slide-enter-to,
.slide-leave-from,
.up-enter-to,
.up-leave-from {
  position: relative;
  left: 0;
}

.slide-enter-from,
.up-leave-to {
  position: relative;
  left: calc(var(--polaroid-width) * 1.362 * -1.1);
}

.up-enter-from,
.slide-leave-to {
  position: relative;
  margin-top: 100vh;
  opacity: 0;
}

.slide-leave-active,
.up-enter-active {
  transition:
    margin 0.3s ease-out,
    opacity 0.3s ease-out;
}
.slide-enter-active,
.up-leave-active {
  transition: left 0.3s ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
  opacity: 1;
  position: relative;
}

.fade-enter-from,
.fade-leave-to {
  position: relative;
  opacity: 0;
}
</style>

<style scoped>
header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  margin: 0 auto;
  width: min-content;

  img {
    padding-top: 1em;
    width: 4rem;
    transition: width 0.5s ease;
    width: v-bind('shouldScrollSnap ?  "min(7rem,25vw)":"4rem"');
    filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.4));
  }
}

.router-link-active {
  text-decoration: none;
}
.map {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: v-bind('interactive ?  "auto":"none"');
  z-index: 0;
}
</style>
