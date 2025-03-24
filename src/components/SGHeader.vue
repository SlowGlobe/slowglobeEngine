<!-- Heading component, styles and formats text placed inside it from the parent component -->

<template>
  <div class="wrap">
    <div class="titleRow">
      <div class="above">
        <div class="byline">
          {{ locationText }}
        </div>
        <div class="date">{{ date }}</div>
      </div>
      <PostageStamp :image="headerImage" />
    </div>
    <h1>
      <slot></slot>
    </h1>
  </div>
</template>

<style scoped>
.wrap {
  z-index: 1;
  position: relative;
  --mask: conic-gradient(from 130deg at top, #000000, #000000 1deg 99deg, #00000000 100deg)
    50%/2.38em 100%;
  -webkit-mask: var(--mask);
  mask: var(--mask);
  padding-top: 3em;
}

.titleRow {
  display: flex;
  flex-direction: row;
  gap: 1em;
  justify-content: space-between;
}

.byline {
  color: var(--primary);
  font-size: 1.2em;
  font-family: 'Public Sans', sans-serif;

  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}

.date {
  color: var(--primary);
  font-size: 0.9em;
  font-family: 'Public Sans', sans-serif;
  font-style: italic;
}
</style>

<script setup lang="ts">
import { getTripHeaderInfoById } from '@/functions/trips'
import PostageStamp from './PostageStamp.vue'
import { inject } from 'vue'
import { tripIdSymbol } from '@/functions/classes'

const tripId = inject(tripIdSymbol)
const { locationText, date, headerImage } = getTripHeaderInfoById(tripId?.value ?? '')
</script>
