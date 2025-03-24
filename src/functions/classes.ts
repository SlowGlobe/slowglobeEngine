export type ImageModules = Record<
  string,
  () => Promise<
    {
      width: number
      height: number
      src: string
    }[]
  >
>

import { featureCollection, point } from '@turf/turf'
export const dFeatureCollection = featureCollection
export const dPoint = point

import type { InjectionKey, Ref } from 'vue'

export const tripIdSymbol = Symbol() as InjectionKey<Ref<string>>
