import tzlookup from 'tz-lookup'
import { toZonedTime } from 'date-fns-tz'
import { format, parseISO } from 'date-fns'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

const UTC_ISO_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/

function isRawUtcIso(value: unknown): value is string {
  return typeof value === 'string' && UTC_ISO_PATTERN.test(value)
}

// Converts a raw UTC ISO string (e.g. from GPX) into a floating local-time
// ISO string with no offset, using the IANA zone for the given coordinate.
// A floating string has no timezone information, so a consumer that parses
// and formats it using only local (non-UTC) getters gets back the same
// wall-clock value regardless of its own timezone.
export function toFloatingLocalTime(utcIso: string, lon: number, lat: number): string {
  const tz = tzlookup(lat, lon)
  const zoned = toZonedTime(parseISO(utcIso), tz)
  return format(zoned, "yyyy-MM-dd'T'HH:mm:ss")
}

// Recursively converts a raw UTC ISO string, or a (possibly nested, for
// MultiLineString) array of them, to floating local time. Already-floating
// values are left untouched so this is safe to run more than once.
export function convertTimesToLocal(times: unknown, lon: number, lat: number): unknown {
  if (Array.isArray(times)) return times.map((t) => convertTimesToLocal(t, lon, lat))
  if (isRawUtcIso(times)) return toFloatingLocalTime(times, lon, lat)
  return times
}

// Finds the first [lon, lat, ...] position nested inside a geometry's
// coordinates, to use as the anchor point for a timezone lookup.
function firstCoordinate(coords: unknown): [number, number] | undefined {
  if (!Array.isArray(coords)) return undefined
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    return [coords[0], coords[1]]
  }
  for (const child of coords) {
    const found = firstCoordinate(child)
    if (found) return found
  }
  return undefined
}

// Walks every feature in a FeatureCollection and converts any raw UTC
// properties.time / properties.coordinateProperties.times to floating
// local time, anchored on that feature's first coordinate.
export function localizeFeatureCollectionTimes<T extends FeatureCollection<Geometry | null>>(
  fc: T
): T {
  for (const feature of fc.features as Feature[]) {
    const props = feature.properties as Record<string, unknown> | null
    if (!props) continue

    const anchor = firstCoordinate(
      feature.geometry && (feature.geometry as { coordinates?: unknown }).coordinates
    )
    if (!anchor) continue
    const [lon, lat] = anchor

    if (isRawUtcIso(props.time)) {
      props.time = toFloatingLocalTime(props.time, lon, lat)
    }

    const coordinateProperties = props.coordinateProperties as Record<string, unknown> | undefined
    if (coordinateProperties?.times) {
      coordinateProperties.times = convertTimesToLocal(coordinateProperties.times, lon, lat)
    }
  }
  return fc
}
