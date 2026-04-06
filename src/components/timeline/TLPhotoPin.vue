<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import TLPhoto from './TLPhoto.vue'
import TLPhotoLine from './TLPhotoLine.vue'

type PhotoAspect = 'landscape' | 'portrait' | 'square' | 'pano'

const props = defineProps<{
  filename: string
  span: number
  aspect: PhotoAspect
  caption?: string
  coords?: [number, number]
}>()

const photo = ref<{ target: HTMLElement | null } | null>(null)
const photoTarget = ref<HTMLElement | null>(null)

onMounted(() => {
  photoTarget.value = photo.value?.target ?? null
})
</script>

<template>
  <TLPhoto
    ref="photo"
    :filename="props.filename"
    :span="props.span"
    :aspect="props.aspect"
    :caption="props.caption"
    attachment="pinned"
  >
    <TLPhotoLine :coords="props.coords" :targetRef="photoTarget" />
  </TLPhoto>
</template>
