<script lang="ts" setup>
import { computed } from 'vue'
import {
  allTripImages,
  allTripVideos,
  allTripVideoThumbs,
  fullPathLookup,
  fullVideoPathLookup,
  fullVideoPathThumbsLookup
} from '@/functions/images'
import { computedAsync } from '@vueuse/core'

type PhotoAspect = 'landscape' | 'portrait' | 'square' | 'pano'

type Attachment = 'pinned' | 'taped' | ''

const props = defineProps<{
  filename: string
  span: number
  aspect: PhotoAspect
  caption?: string
  attachment?: Attachment
}>()

// const target = useTemplateRef('target')
// defineExpose({ target })

const module = computed(() => {
  if (props.filename.endsWith('.m4v')) {
    const imgName = props.filename.split('.')[0] + '_thumb'
    return {
      imageModule: allTripVideoThumbs[fullVideoPathThumbsLookup[imgName] ?? 0],
      videoModule: allTripVideos[fullVideoPathLookup[props.filename] ?? 0]
    }
  }
  return {
    imageModule: allTripImages[fullPathLookup[props.filename] ?? 0]
  }
})

const image = computedAsync(async () => {
  if (!module.value.imageModule) {
    console.warn("Couldn't find image " + JSON.stringify(module.value))
    return null
  }
  const imageModule = await module.value.imageModule()
  const thumbnail = !Array.isArray(imageModule) ? imageModule : imageModule[0]

  const output = {
    size: '',
    href: '',
    thumbnail: thumbnail.src,
    type: 'image' as 'video' | 'image'
  }

  if (module.value.videoModule) {
    const videoModule = await module.value.videoModule()
    output.type = 'video'
    output.href = videoModule as string
    output.size = `${thumbnail.width * 3}-${thumbnail.height * 3}`
  } else if (Array.isArray(imageModule) && imageModule[1]) {
    const { width, height } = imageModule[1]
    output.size = `${width}-${height}`
    output.href = imageModule[1].src
  }
  return output
})
</script>

<template>
  <div
    :class="['tl-desk-item', `tl-span-${span}`, attachment ? `tl-${attachment}` : 'tl-taped']"
    ref="target"
  >
    <div class="tl-desk-photo">
      <div :class="`tl-photo-img ${aspect}`">
        <img :src="image?.thumbnail" :alt="caption" />
      </div>
      <p class="tl-photo-caption">{{ caption }}</p>
    </div>
    <slot></slot>
  </div>
</template>
