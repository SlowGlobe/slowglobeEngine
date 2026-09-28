import { glob } from 'glob'
import { readFileSync, writeFileSync } from 'fs'
import type { FeatureCollection } from 'geojson'
import { localizeFeatureCollectionTimes } from '../src/functions/timezoneHelpers'

const isDryRun = process.argv.includes('--dry-run')

const files = await glob('../trips/*/geometry.geojson')
files.sort()

console.log(
  isDryRun
    ? '🔍 Dry run — no files will be written\n'
    : '✏️  Converting GPX UTC timestamps to floating local time\n'
)

let changedCount = 0

for (const file of files) {
  const original = readFileSync(file, 'utf-8')
  const hasCRLF = original.includes('\r\n')
  const geojson = JSON.parse(original) as FeatureCollection

  // Reserialize before mutating too, so the comparison below is purely
  // about content (times) and ignores the source file's original
  // whitespace/line-ending style.
  const before = JSON.stringify(geojson, null, 2)
  localizeFeatureCollectionTimes(geojson)
  let after = JSON.stringify(geojson, null, 2)

  if (after === before) {
    console.log(`  ⏭  ${file} (no raw UTC timestamps found, already migrated or none present)`)
    continue
  }

  changedCount++
  console.log(`  ✅ ${file}`)
  if (!isDryRun) {
    if (hasCRLF) after = after.replace(/\n/g, '\r\n')
    writeFileSync(file, after + (hasCRLF ? '\r\n' : '\n'))
  }
}

console.log(
  `\n${changedCount} file(s) ${isDryRun ? 'would be' : 'were'} updated out of ${files.length} checked.`
)
