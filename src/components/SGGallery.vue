<template>
  <div class="container" ref="target">
    <lightgallery
      :settings="{
        speed: 500,
        plugins: plugins,
        licenseKey: '1',
        mobileSettings: { showCloseIcon: true, download: false, controls: false }
      }"
      :onInit="onInit"
    >
      <template v-for="item in galleryImages" :key="item.href">
        <a
          v-if="item.type === 'image'"
          :data-lg-size="item.size"
          :class="imageList.length > 1 ? 'gallery-item' : 'gallery-item gallery-item-single'"
          :data-src="item.href"
          :data-sub-html="'<h4>' + item.captionText + '</h4>'"
        >
          <div v-if="item.hasCaption" class="note-icon">
            <div class="tooltipText">{{ item.captionText }}</div>
            <iconify-icon icon="ph:note" inline></iconify-icon>
          </div>
          <img className="img-responsive" :src="item.thumbnail" />
        </a>

        <a
          v-if="item.type === 'video'"
          :class="imageList.length > 1 ? 'gallery-item' : 'gallery-item gallery-item-single'"
          :data-video="getVideoData(item.href)"
          :data-poster="item.thumbnail"
          :data-lg-size="item.size"
          :data-sub-html="'<h4>' + item.captionText + '</h4>'"
        >
          <div class="play-icon">
            <iconify-icon icon="mingcute:play-fill" inline></iconify-icon>
          </div>
          <div v-if="item.hasCaption" class="note-icon">
            <div class="tooltipText">{{ item.captionText }}</div>
            <iconify-icon icon="ph:note" inline></iconify-icon>
          </div>
          <img className="img-responsive" :src="item.thumbnail" />
        </a>
      </template>
    </lightgallery>
  </div>
</template>

<script setup lang="ts">
import Lightgallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import lgVideo from 'lightgallery/plugins/video'

import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-video.css'
import type { InitDetail } from 'lightgallery/lg-events'
import type { LightGallery } from 'lightgallery/lightgallery'
import { asyncComputed, useIntersectionObserver } from '@vueuse/core'
import {
  allTripImages,
  allTripVideos,
  allTripVideoThumbs,
  fullPathLookup,
  fullVideoPathLookup,
  fullVideoPathThumbsLookup
} from '@/functions/images'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Marker } from 'mapbox-gl'
import { getMap } from '@/functions/map'
import mapboxgl from 'mapbox-gl'

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

const plugins = [lgThumbnail, lgZoom, lgVideo]
let lg: LightGallery | null = null

function onInit(detail: InitDetail) {
  // console.log('lightGallery has been initialized')
  lg = detail.instance
  updateSlides()
}

function getVideoData(href: string) {
  return `{"source": [{"src":"${href}", "type":"video/mp4"}],  "attributes": {"preload": false, "playsinline": true, "controls": true}}`
}

function updateSlides() {
  lg?.refresh()
}

const imageList = computed(() =>
  (props.list ?? []).map((i) => {
    const base = typeof i == 'string' ? i : i.img
    if (base.endsWith('.m4v')) {
      const imgName = base.split('.')[0] + '_thumb'
      return {
        imageModule: allTripVideoThumbs[fullVideoPathThumbsLookup[imgName]],
        videoModule: allTripVideos[fullVideoPathLookup[base]],
        coords: typeof i == 'string' ? undefined : i?.coords,
        caption: typeof i == 'string' ? undefined : i?.caption
      }
    }
    return {
      imageModule: allTripImages[fullPathLookup[base]],
      coords: typeof i == 'string' ? undefined : i?.coords,
      caption: typeof i == 'string' ? undefined : i?.caption
    }
  })
)

const galleryImages = asyncComputed(async () => {
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
})

watch(galleryImages, () => nextTick(updateSlides))
onMounted(updateSlides)

const target = ref(null)
let markers: Marker[] = []

if (props.addPhotosToMap) {
  useIntersectionObserver(target, ([{ isIntersecting }]) => {
    if (isIntersecting && galleryImages.value) {
      for (const [index, entry] of galleryImages.value.entries()) {
        // Create a DOM element for each marker.
        if (!entry.coords) continue
        const el = document.createElement('div')
        el.onclick = () => lg?.openGallery(index)

        el.className = 'photoMarker'

        const img = document.createElement('img')
        img.src = entry.thumbnail
        el.appendChild(img)

        // Add markers to the map.
        const map = getMap()
        if (!map) continue
        const m = new mapboxgl.Marker(el).setLngLat(entry.coords).addTo(map)
        markers.push(m)
      }
    } else {
      removeAllMarkers()
    }
  })
}

function removeAllMarkers() {
  if (markers.length > 0) {
    markers.forEach((m) => {
      m.remove()
    })
    markers = []
  }
}

onUnmounted(removeAllMarkers)
</script>

<style lang="css" scoped>
.container {
  position: relative;
}

.lightgallery-vue {
  padding: 1em;
  width: 100%;
  margin-left: -1em;
  background-color: white;
  border-radius: 0.5em;
  gap: 1em;
  flex-wrap: wrap;
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(v-bind('smallThumbnails ?  "150px":"200px"'), 1fr)
  );
}

.gallery-item,
.gallery-item img {
  aspect-ratio: 1 / 1;
  object-position: 50% 50%;
  image-orientation: from-image;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5em;
  position: relative;
}

.gallery-item-single,
.gallery-item-single img {
  aspect-ratio: unset;
}

.note-icon {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 1.2em;
  border-radius: 0 0 0 0.5em;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px;
  z-index: 10;
  display: inline-block;
  display: flex;
  max-width: 100%;
}
.note-icon:hover {
  border-radius: 0;
}

.note-icon:hover .tooltipText {
  visibility: visible;
  display: block;
}

.note-icon .tooltipText {
  font-size: 0.7em;
  visibility: hidden;
  display: none;
  font-family: 'Public Sans', sans-serif;
  text-align: left;
  border-radius: 6px;
  padding: 0.2em 0.5em;
}

.play-icon {
  cursor: pointer;
  border-radius: 0.5rem;
  position: absolute;
  top: 0;
  left: 0;
  text-align: center;
  z-index: 4;
  display: flex;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  vertical-align: center;
  opacity: 0.8;
  font-size: 6rem;
  color: #ffffff;
  filter: drop-shadow(1px 2px 8px #000000);
  transition:
    opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out;

  &:hover {
    opacity: 0.9;
    transform: scale(1.1);
  }
}
</style>
