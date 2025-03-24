<template>
  <div class="card">
    <iframe
      style="border-radius: 12px"
      :style="{ height: props.small ? '152px' : '50vh' }"
      :src="embedSrc"
      width="100%"
      class="bcPlayer"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  url: string
  small?: boolean
  darkMode?: boolean
}>()

const embedSrc = computed(
  () =>
    `https://open.spotify.com/embed/${props.url}?utm_source=generator${props.darkMode ? '&theme=0' : ''}`
)
</script>

<style scoped>
.bcPlayer {
  /* display: flex;
  width: 100%;
  justify-content: center; */
  /* margin: 1em 0; */
}
.card {
  position: relative;
  z-index: 2;
  color: var(--md-sys-color-on-surface);
}
</style>
