<template>
  <div :class="['tl-desk-item', `tl-span-${span}`, attachment ? `tl-${attachment}` : 'tl-taped']">
    <div class="tl-desk-note">
      <p v-if="date?.length" class="tl-note-date">{{ date }}</p>
      <p class="tl-note-text">
        <slot> </slot>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  date?: string
  span: number
  attachment?: string
}>()
</script>
