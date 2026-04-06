<script lang="ts" setup></script>
<template>
  <div class="startSeg"></div>

  <div class="tl-desk">
    <slot></slot>
  </div>

  <div class="endSeg"></div>
</template>

<style>
@import '@/assets/timeline.css';
</style>

<style scoped>
.startSeg {
  height: 0em;
  mask: var(--topCutoutMask);
  margin-bottom: 2em;
}
.endSeg {
  height: 0em;
  mask: var(--bottomCutoutMask);
  margin-top: 2em;
}
</style>
