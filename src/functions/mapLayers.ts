import { allTrips } from '~/allTrips'
import { featureCollection, point } from '@turf/turf'
import { getMap } from './map'
import type { StyleImageInterface } from 'mapbox-gl'

export async function addLayersAndSources() {
  const map = getMap()
  if (!map) return

  const images: [string, string, boolean?][] = [
    ['diamond', 'diamond.png'],
    ['loc-arrow', 'locArrow.png'],
    ['campsite', 'campsite.png'],
    ['target', 'target.png'],
    ['plane', 'plane.png'],
    ['mountain', 'mountain.png'],
    ['picnic', 'picnic-site.png'],
    ['flag', 'racetrack.png']
  ]
  const imgPromises: Promise<null>[] = []
  images.forEach((image) => {
    imgPromises.push(
      new Promise((resolve) => {
        map?.loadImage('/images/' + image[1], (error, imageData) => {
          resolve(null)
          if (error) throw error
          if (!map?.hasImage(image[0]) && imageData)
            map?.addImage(image[0], imageData, { sdf: image[2] })
        })
      })
    )
  })

  map.addSource('overview-tracks', {
    type: 'geojson',
    data: featureCollection([])
  })

  map.addLayer({
    id: 'overview-tracks',
    type: 'line',
    source: 'overview-tracks',
    paint: {
      'line-color': 'rgb(110, 25, 25)',
      'line-width': 2
    }
  })

  map.addSource('detail-tracks', {
    type: 'geojson',
    lineMetrics: true,
    data: featureCollection([])
  })
  const lineBaseWidth = 4
  map.addLayer({
    id: 'detail-tracks-walk',
    type: 'line',
    source: 'detail-tracks',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      // 'line-width': 6,
      'line-occlusion-opacity': 0.5,
      'line-dasharray': [0, 2],
      'line-color': 'rgb(110, 25, 25)',
      'line-width': [
        'interpolate',
        ['exponential', 2],
        ['zoom'],
        0,
        lineBaseWidth * 1,
        0.9999,
        lineBaseWidth * 2,
        1,
        lineBaseWidth * 1,
        1.9999,
        lineBaseWidth * 2,
        2,
        lineBaseWidth * 1,
        2.9999,
        lineBaseWidth * 2,
        3,
        lineBaseWidth * 1,
        3.9999,
        lineBaseWidth * 2,
        4,
        lineBaseWidth * 1,
        4.9999,
        lineBaseWidth * 2,
        5,
        lineBaseWidth * 1,
        5.9999,
        lineBaseWidth * 2,
        6,
        lineBaseWidth * 1,
        6.9999,
        lineBaseWidth * 2,
        7,
        lineBaseWidth * 1,
        7.9999,
        lineBaseWidth * 2,
        8,
        lineBaseWidth * 1,
        8.9999,
        lineBaseWidth * 2,
        9,
        lineBaseWidth * 1,
        9.9999,
        lineBaseWidth * 2,
        10,
        lineBaseWidth * 1,
        10.9999,
        lineBaseWidth * 2,
        11,
        lineBaseWidth * 1,
        11.9999,
        lineBaseWidth * 2,
        12,
        lineBaseWidth * 1,
        12.9999,
        lineBaseWidth * 2,
        13,
        lineBaseWidth * 1,
        13.9999,
        lineBaseWidth * 2,
        14,
        lineBaseWidth * 1,
        14.9999,
        lineBaseWidth * 2,
        15,
        lineBaseWidth * 1,
        15.9999,
        lineBaseWidth * 2,
        16,
        lineBaseWidth * 1,
        16.9999,
        lineBaseWidth * 2,
        17,
        lineBaseWidth * 1,
        17.9999,
        lineBaseWidth * 2,
        18,
        lineBaseWidth * 1,
        18.9999,
        lineBaseWidth * 2,
        19,
        lineBaseWidth * 1,
        19.9999,
        lineBaseWidth * 2,
        20,
        lineBaseWidth * 1,
        20.9999,
        lineBaseWidth * 2,
        21,
        lineBaseWidth * 1,
        22,
        lineBaseWidth * 2
      ]
    },
    filter: [
      'all',
      ['==', ['get', 'type'], 'walk'],
      ['case', ['has', 'overview'], ['==', true, ['get', 'overview']], true]
    ]
  })

  map.addLayer({
    id: 'detail-tracks-drive',
    type: 'line',
    source: 'detail-tracks',
    paint: {
      // 'line-color': '#aa8c53',
      'line-color': 'rgb(110, 25, 25)',
      'line-width': 6
    },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    filter: ['==', 'type', 'drive']
  })
  map.addLayer({
    id: 'detail-tracks-boat',
    type: 'line',
    source: 'detail-tracks',
    paint: {
      'line-color': '#aa8c53',
      // 'line-color': 'rgb(110, 25, 25)',
      'line-width': 6
    },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    filter: ['==', 'type', 'boat']
  })
  map.addLayer({
    id: 'detail-tracks-train',
    type: 'line',
    source: 'detail-tracks',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': 'rgb(110, 25, 25)',
      'line-width': 6
    },
    filter: ['==', 'type', 'train']
  })
  map.addLayer({
    id: 'detail-tracks-train-dashes',
    type: 'line',
    source: 'detail-tracks',
    paint: {
      'line-color': '#aa8c53',
      'line-width': 4,
      'line-dasharray': [0, 2, 2]
    },
    filter: ['==', 'type', 'train']
  })
  map.addLayer({
    id: 'detail-tracks-bus',
    type: 'line',
    source: 'detail-tracks',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      // 'line-color': '#aa8c53',
      'line-color': 'rgb(110, 25, 25)',
      'line-width': 6
    },
    filter: ['==', 'type', 'bus']
  })
  map.addLayer({
    id: 'detail-tracks-bus-dashes',
    type: 'line',
    source: 'detail-tracks',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#aa8c53',
      // 'line-color': 'rgb(110, 25, 25)',
      'line-width': 4
      // 'line-dasharray': [0, 2, 4]
    },
    filter: ['==', 'type', 'bus']
  })
  map.addLayer({
    id: 'detail-tracks-flight-yellow',
    type: 'line',
    source: 'detail-tracks',
    paint: {
      'line-color': '#aa8c53',
      'line-width': 3
    },
    filter: ['==', 'type', 'flight']
  })
  map.addLayer({
    id: 'detail-tracks-flight',
    type: 'line',
    source: 'detail-tracks',
    paint: {
      'line-color': 'rgb(110, 25, 25)',
      'line-width': 1.5,
      'line-gap-width': 3
    },
    filter: ['==', 'type', 'flight']
  })

  //only load the img layers once all the images have finish loading.
  await Promise.all(imgPromises)

  map.addLayer({
    id: 'detail-tracks-flight-icon',
    type: 'symbol',
    source: 'detail-tracks',
    paint: { 'text-color': '#fff', 'text-translate': [0, 0], 'icon-translate': [0, 0] },
    layout: {
      'symbol-placement': 'line',
      'icon-image': 'plane',
      'icon-rotate': 90,

      'icon-anchor': 'bottom',
      // 'text-field': ['get', 'name'],
      // 'text-font': ['Crimson Bold', 'Open Sans Regular', 'Arial Unicode MS Regular'],
      // 'text-anchor': 'left',
      // 'text-size': 12,
      // 'symbol-spacing': 50
      'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 5, 50, 10, 200]
      // 'text-radial-offset': 2
    },
    filter: ['==', 'type', 'flight']
  })
  map.addLayer({
    id: 'detail-points',
    type: 'symbol',
    source: 'detail-tracks',
    layout: {
      'icon-image': ['get', 'icon'],
      'icon-size': 1,
      'text-anchor': 'left',
      'text-radial-offset': 0.75,
      'text-field': ['get', 'name'],
      'text-font': ['Crimson Italic', 'Open Sans Regular', 'Arial Unicode MS Regular']
    },
    paint: {
      'text-color': 'rgb(66, 10, 17)',
      'text-halo-color': 'rgba(255,255,255, 0.6)',
      'text-halo-width': 1.5,
      'text-translate': [0, 2]
    },
    filter: ['has', 'icon']
  })

  map.addSource('centers', {
    type: 'geojson',
    data: featureCollection(allTrips.map((trip) => point(trip.geography.overview.center)))
  })

  map.addLayer({
    id: 'centers',
    type: 'symbol',
    source: 'centers',
    layout: {
      'icon-image': 'diamond',
      'icon-size': 1
    },
    paint: { 'icon-halo-color': 'rgba(255, 255, 255, 0.8)', 'icon-halo-width': 2 }
  })

  map.addImage('pulsing-dot', new pulsingDot(), { pixelRatio: 2 })

  map.addSource('dot-point', {
    type: 'geojson',
    data: featureCollection([])
  })
  map.addLayer({
    id: 'layer-with-pulsing-dot',
    type: 'symbol',
    source: 'dot-point',
    layout: {
      'icon-image': 'pulsing-dot'
    },
    paint: {
      'icon-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0, 7, 1, 12, 0]
    }
  })
}

// This implements `StyleImageInterface`
// to draw a pulsing dot icon on the map.
class pulsingDot implements StyleImageInterface {
  size = 200
  public width = this.size
  public height = this.size
  public data = new Uint8ClampedArray(this.size * this.size * 4)
  public context: CanvasRenderingContext2D | null = null

  // When the layer is added to the map,
  // get the rendering context for the map canvas.
  public onAdd() {
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    this.context = canvas.getContext('2d')
  }

  // Call once before every frame where the icon will be used.
  public render() {
    const duration = 2000
    const t = (performance.now() % duration) / duration
    const t2 = ((performance.now() + duration / 2) % duration) / duration

    const radius = (this.size / 2) * 0.3
    const outerRadius = (this.size / 2) * 0.7 * t + radius
    const outerRadius2 = (this.size / 2) * 0.7 * t2 + radius
    const context = this.context
    if (!context) return true

    // Draw the outer circle.
    context.clearRect(0, 0, this.width, this.height)
    context.beginPath()
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2)
    context.fillStyle = `rgba(114, 24, 23, ${1 - t})`
    context.fill()

    context.beginPath()
    context.arc(this.width / 2, this.height / 2, outerRadius2, 0, Math.PI * 2)
    context.fillStyle = `rgba(114, 24, 23, ${1 - t2})`
    context.fill()

    // Draw the inner circle.
    context.beginPath()
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2)
    context.fillStyle = 'rgba(114, 24, 23, 1)'
    context.strokeStyle = '#ddd'
    context.lineWidth = 2 + 2 * (1 - t / 2)
    // context.lineWidth = 4
    context.fill()
    context.stroke()

    // Update this image's data with data from the canvas.
    this.data = context.getImageData(0, 0, this.width, this.height).data

    // Continuously repaint the map, resulting
    // in the smooth animation of the dot.
    const map = getMap()
    map?.triggerRepaint()

    // Return `true` to let the map know that the image was updated.
    return true
  }
}

//export function showExtraTripDetail(val: boolean) {
//   if (!map) return
//   if (map.getLayer('detail-tracks-walk')) {
//     const filter = map.getFilter('detail-tracks-walk')
//     if (!filter || !filter[2] || !filter[2][2] || typeof filter[2][2][1] != 'boolean') return
//     filter[2][2][1] = !val
//     map?.setFilter('detail-tracks-walk', filter)
//   }
//   if (map.getLayer('detail-points')) {
//     map?.setLayoutProperty('detail-points', 'visibility', val ? 'visible' : 'none')
//   }
// }
