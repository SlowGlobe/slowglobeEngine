import { lineSliceAlong, bearing, lineSlice, length } from '@turf/turf'
import { parseISO, differenceInMinutes, addMinutes } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import type { Feature, LineString, Position } from 'geojson'
import { findClosestFrame } from './timeSearch'
import type { CameraOptions, LngLatLike } from 'mapbox-gl'
import mapboxgl from 'mapbox-gl'
import { getMap } from './map'

function getForwardBearing(
  geom: Feature<LineString>,
  lineLength: number,
  progress: number
): {
  bearing: number
  location: Position
  progressLine: Feature<LineString>
} {
  // Along function also exists, maybe faster? https://turfjs.org/docs/api/along
  const currentPosLine = lineSliceAlong(
    geom,
    0,
    Math.min(Math.max((progress - 0) * lineLength, 0.001), lineLength)
  )
  const forwardPosLine = lineSliceAlong(
    geom,
    0,
    Math.min(Math.max((progress + 0.01) * lineLength, 0.001), lineLength)
  )
  const currPos =
    currentPosLine.geometry.coordinates[currentPosLine.geometry.coordinates.length - 1]
  const forwardPos =
    forwardPosLine.geometry.coordinates[forwardPosLine.geometry.coordinates.length - 1]
  const forwardBearing = bearing(currPos, forwardPos)

  return {
    bearing: forwardBearing,
    location: currPos,
    progressLine: currentPosLine
  }
}

interface PercGeom {
  progressTime?: string
  progressPosition?: Position
  progressBearing?: number
  progressLine: Feature<LineString>
  camPos?: Position
  camBearing?: number
}

export function getPercGeom(
  geom: Feature<LineString>,
  perc: number,
  options: {
    useTime?: boolean
    showTime?: boolean
    follow?: {
      shouldFollow: boolean
      followCameraLine?: Feature<LineString>
      followCameraLineLength?: number
    }
  } = {
    useTime: false,
    showTime: false,
    follow: {
      shouldFollow: false,
      followCameraLine: undefined,
      followCameraLineLength: 0
    }
  }
): PercGeom {
  const result: PercGeom = { progressLine: geom }
  const fullGeometryDistance = length(geom)
  let progress = perc
  if (
    (options.useTime || options.showTime) &&
    geom?.properties?.coordinateProperties?.times &&
    Array.isArray(geom?.properties?.coordinateProperties?.times)
  ) {
    const timeArray = geom?.properties?.coordinateProperties?.times
    if (!timeArray) return result
    const firstDate = parseISO(timeArray[0])
    const lastDate = parseISO(timeArray[timeArray.length - 1])
    const dateDiff = differenceInMinutes(lastDate, firstDate)
    const progressDate = addMinutes(firstDate, perc * dateDiff)
    result.progressTime = formatInTimeZone(progressDate, 'Australia/Adelaide', 'HH:mm')

    if (options.useTime) {
      const coordIndexAtTime = findClosestFrame(timeArray, progressDate)
      const coord = geom.geometry.coordinates[coordIndexAtTime]

      // /find distance along line to coord, which will give us percentage distance travelled
      const progressLine = lineSlice(geom.geometry.coordinates[0], coord, geom)
      const progressLineLength = length(progressLine)
      progress = progressLineLength / fullGeometryDistance
    }
  }
  const pos = getForwardBearing(geom, fullGeometryDistance, progress)
  Object.assign(result, {
    progressBearing: pos.bearing,
    progressLine: pos.progressLine,
    progressPosition: pos.location
  })

  if (options.follow && options.follow.followCameraLine && options.follow.followCameraLineLength) {
    const camera = getForwardBearing(
      options.follow.followCameraLine,
      options.follow.followCameraLineLength,
      progress - 0.001
    )

    Object.assign(result, {
      camPos: camera.location,
      camBearing: camera.bearing
    })
  }
  return result
}

function compassBearingToDeg(bearing: number) {
  // return (450 - bearing) % 360
  return (90 - bearing) % 360
}
const degreesToRads = (deg: number) => (deg * Math.PI) / 180.0

const alts: number[] = []

export function getCameraForCameraOptions(camOptions: CameraOptions): any {
  const map = getMap()
  if (!map) return
  const sx = map.transform._mercatorZfromZoom(camOptions.zoom || map.getZoom())
  const backDist = sx * Math.sin(degreesToRads(camOptions.pitch || map.getPitch()))

  // Calculate the camera position directly using Mercator coordinates
  // Base altitude 0
  const mercatorCenter = mapboxgl.MercatorCoordinate.fromLngLat(
    camOptions.center || map.getCenter(),
    0
  )

  const adjustedCenter = new mapboxgl.MercatorCoordinate(
    mercatorCenter.x -
      backDist *
        Math.cos(-degreesToRads(compassBearingToDeg(camOptions.bearing || map.getBearing()))),
    mercatorCenter.y -
      backDist *
        Math.sin(-degreesToRads(compassBearingToDeg(camOptions.bearing || map.getBearing()))),
    Math.cos(degreesToRads(camOptions.pitch || map.getPitch())) * sx
  )

  // Query the terrain elevation at the center point (in meters)
  const terrainElevationMeters =
    map.queryTerrainElevation(camOptions.center || map.getCenter()) || 0

  alts.push(terrainElevationMeters)
  if (alts.length > 100) alts.shift()
  const avgAlt = alts.reduce((a, b) => a + b, 0) / alts.length

  const conversionObj = mapboxgl.MercatorCoordinate.fromLngLat(
    camOptions.center || map.getCenter(),
    avgAlt
  )

  const camera = new mapboxgl.FreeCameraOptions()

  camera.position = new mapboxgl.MercatorCoordinate(
    adjustedCenter.x,
    adjustedCenter.y,
    adjustedCenter.z + conversionObj.z
  )
  camera.setPitchBearing(camOptions.pitch || map.getPitch(), camOptions.bearing || map.getBearing())
  return camera
}

export function llLikeToObject(ll: LngLatLike | undefined): { lng: number; lat: number } {
  const intCamCent: {
    lat: number
    lng: number
  } = (ll as {
    lat: number
    lng: number
  }) ?? {
    lat: 0,
    lng: 0
  }
  return intCamCent
}
