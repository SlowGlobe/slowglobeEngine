<template>
  <div class="startSeg"></div>
  <section id="sectionPin">
    <div class="pin-wrap-sticky">
      <div class="pin-wrap">
        <template v-for="item in galleryImages" :key="item.href">
          <div class="photoContainer">
            <img :src="item.thumbnail" class="photo" />
          </div>
        </template>
      </div>
    </div>
  </section>
  <!-- <img :src="photoSrc" :alt="altText" class="photo" /> -->
  <!-- <div v-if="caption" class="caption">{{ caption }}</div> -->
  <div class="endSeg"></div>
</template>

<script setup lang="ts">
import { asyncComputed } from '@vueuse/core'
import {
  allTripImages,
  allTripVideos,
  allTripVideoThumbs,
  fullPathLookup,
  fullVideoPathLookup,
  fullVideoPathThumbsLookup
} from '@/functions/images'
import { computed } from 'vue'
interface Img {
  img: string
  coords?: [number, number]
  caption?: string
}

const props = defineProps<{
  list: Array<string | Img>
  addPhotosToMap?: boolean
  smallThumbnails?: boolean
}>()

const imageList = computed(() =>
  (props.list ?? []).map((i) => {
    const base = typeof i == 'string' ? i : i.img
    if (base.endsWith('.m4v')) {
      const imgName = base.split('.')[0] + '_thumb'
      return {
        imageModule: allTripVideoThumbs[fullVideoPathThumbsLookup[imgName] ?? 0],
        videoModule: allTripVideos[fullVideoPathLookup[base] ?? 0],
        coords: typeof i == 'string' ? undefined : i?.coords,
        caption: typeof i == 'string' ? undefined : i?.caption
      }
    }
    return {
      imageModule: allTripImages[fullPathLookup[base] ?? 0],
      coords: typeof i == 'string' ? undefined : i?.coords,
      caption: typeof i == 'string' ? undefined : i?.caption
    }
  })
)

const galleryImages = asyncComputed(
  async () => {
    if (!imageList.value) return []
    const gImages: Array<{
      href: string
      thumbnail: string
      coords?: [number, number]
      captionText: string
      hasCaption: boolean
      type: 'image' | 'video'
      size: string
    }> = []
    for (const path of imageList.value) {
      if (!path.imageModule) {
        console.warn("Couldn't find image " + JSON.stringify(path))
        continue
      }
      const imageModule = await path.imageModule()
      const coords = path.coords
      const caption = path?.caption ?? '&nbsp;'

      const thumbnail = !Array.isArray(imageModule)
        ? imageModule
        : imageList.value.length == 1
          ? imageModule[1]
          : imageModule[0]

      const output = {
        coords,
        captionText: caption,
        hasCaption: !!path?.caption,
        size: '',
        href: '',
        thumbnail: thumbnail.src,
        type: 'image' as 'video' | 'image'
      }
      console.log('imageModule[1]:', imageModule)

      if (path.videoModule) {
        const videoModule = await path.videoModule()
        output.type = 'video'
        output.href = videoModule as string
        output.size = `${thumbnail.width * 3}-${thumbnail.height * 3}`
      } else if (Array.isArray(imageModule) && imageModule[1]) {
        const { width, height } = imageModule[1]
        output.size = `${width}-${height}`
        output.href = imageModule[1].src
      }
      gImages.push(output)
    }
    return gImages
  },
  null,
  { onError: (e) => console.error(e) }
)
</script>

<style scoped>
@keyframes move {
  to {
    /* Move horizontally so that right edge is aligned against the viewport */
    transform: translateX(calc(-100% + 100vw));
  }
}

#sectionPin {
  /* Stretch it out, so that we create room for the horizontal scroll animation */
  height: 500vh;
  /* width: min-content; */
  aspect-ratio: 1 / 1;
  overflow: visible; /* To make position sticky work … */

  view-timeline-name: --section-pin-tl;
  view-timeline-axis: block;
}

.pin-wrap-sticky {
  /* Stick to Top */
  height: 100vh;
  /* width: 100vw; */
  position: sticky;
  top: 0;

  width: 100vw;
  overflow-x: hidden;
}

.pin-wrap {
  height: 100vh;
  width: 250vmax;

  /* Hook animation */
  will-change: transform;
  animation: linear move forwards;

  /* Link animation to view-timeline */
  animation-timeline: --section-pin-tl;
  animation-range: contain 0% contain 100%;

  display: flex;
  gap: 1em;
}
.photoContainer {
  position: relative;
  /* right: 30%; */
  background-color: transparent;
  margin-top: 3em;
  margin-bottom: 3em;
  align-self: end;
  /* display: inline-block; */
}
.photoContainer:nth-child(odd) {
  align-self: start;
}

.photo {
  /* width: 100%; */
  height: auto;
  height: 60vh;
  padding: 1em;
  background-color: whitesmoke;
  /* filter: drop-shadow(4px); */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  rotate: -3deg;
}
.photoContainer:nth-child(odd) .photo {
  rotate: 3deg;
}

.caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
}

.startSeg {
  height: 0em;
  mask: var(--topCutoutMask);
}
.endSeg {
  height: 0em;
  mask: var(--bottomCutoutMask);
}
</style>
