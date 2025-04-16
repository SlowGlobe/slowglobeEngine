declare module '*?gallery' {
  const images: {
    width: string
    src: string
  }[]
  export default images
}

declare module '*.jpg?gallery' {
  const images: {
    width: string
    src: string
  }[]
  export default images
}

declare module '*.JPG?gallery' {
  const images: {
    width: string
    src: string
  }[]
  export default images
}

declare module '*.jpeg?gallery' {
  const images: {
    width: string
    src: string
  }[]
  export default images
}

declare module '*.png?gallery' {
  const images: {
    width: string
    src: string
  }[]
  export default images
}

declare module '*.PNG?gallery' {
  const images: {
    width: string
    src: string
  }[]
  export default images
}

declare module '*&gallery' {
  const images: string
  export default images
}

declare module '*.geojson' {
  import { FeatureCollection } from 'geojson'
  const getGeoJson: () => Promise<FeatureCollection>
  export default getGeoJson
}

declare module '*.geojson?simplify' {
  import { FeatureCollection } from 'geojson'
  const geojson: FeatureCollection
  export default geojson
}
