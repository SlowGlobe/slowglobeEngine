import type { ImageModules } from './classes'

export const allTripImages = import.meta.glob(
  [
    '~/**/images/*.jpg',
    '~/**/images/*.jpeg',
    '~/**/images/*.JPG',
    '~/**/images/*.png',
    '~/**/images/*.PNG',
    '~/**/images/*.gif'
  ],
  {
    query: {
      // w: '400;',
      // aspect: '1',
      h: '400;',
      format: 'webp',
      as: 'metadata',
      noAutoOrient: 'false'
    },
    // query: '?w=400&h=400&format=webp&as=metadata',
    import: 'default'
  }
) as ImageModules

export const fullPathLookup = Object.keys(allTripImages).reduce(
  (acc: Record<string, string>, curr) => {
    const imgName = curr.split('/').pop() as string
    acc[imgName] = curr
    return acc
  },
  {}
)

export function getImage(imgName: string) {
  return allTripImages[fullPathLookup[imgName]]
}

export const allTripVideos = import.meta.glob('~/**/videos/o_*.m4v', {
  import: 'default'
  // query: '?raw'
})
export const fullVideoPathLookup = Object.keys(allTripVideos).reduce(
  (acc: Record<string, string>, curr) => {
    const imgName = curr.split('/').pop() as string
    acc[imgName] = curr
    return acc
  },
  {}
)

export const allTripVideoThumbs = import.meta.glob('~/**/videos/*_thumb.png', {
  import: 'default',
  query: '?w=400&format=webp&as=metadata'
})
export const fullVideoPathThumbsLookup = Object.keys(allTripVideoThumbs).reduce(
  (acc: Record<string, string>, curr) => {
    const imgName = curr.split('/').pop()?.split('.')[0] as string
    acc[imgName] = curr
    return acc
  },
  {}
)
// export async function getImageSrc(imgName: string | undefined, thumb = false) {
//   console.log('imgName:', imgName)
//   if (!imgName) return ''
//   const img = allTripImages[fullPathLookup[imgName]]
//   if (!img) return ''
//   const ressed = await img()
//   const index = thumb ? 0 : 1

//   return ressed[index].src
// }
