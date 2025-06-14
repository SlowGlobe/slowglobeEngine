import path from 'path'
import type { Plugin } from 'vite'
import { featureCollection, featureEach, simplify } from '@turf/turf'
import { readFile } from 'fs/promises'

export default function viteGeoJsonSimplify(): Plugin {
  const fileRegex = /\.geojson/

  return {
    name: 'vite-plugin-geojson-simplify',

    async resolveId(id, importer) {
      if (!fileRegex.test(id)) {
        return null
      }

      // console.log('resolive Id:', id, fileRegex.test(id))
      const [filePath] = id.split('?', 1)
      const resolved = await this.resolve(filePath, importer)

      return resolved ? `${resolved.id}${id.slice(filePath.length)}` : null
    },
    async transform(code, id) {
      if (!fileRegex.test(id)) return null

      // console.log('Processing:', id)
      const [filePath, query] = id.split('?', 2)
      const fileContent = await readFile(path.resolve(filePath), 'utf-8')

      const params = new URLSearchParams(query)

      if (params.get('raw') != null) {
        const geojson = JSON.parse(fileContent)
        return `
        const geojson = ${JSON.stringify(geojson)};
        export default geojson;
        `
      }

      if (params.get('simplify') != null) {
        const geojson = JSON.parse(fileContent)
        const output = featureCollection([])
        featureEach(geojson, (currentFeature) => {
          if (currentFeature.geometry.type == 'LineString') {
            currentFeature.properties = {}
            output.features.push(currentFeature)
          }
        })
        const simplified = simplify(output, { tolerance: 0.01 })
        return `
        const simplifiedGeojson = ${JSON.stringify(simplified)};
        export default simplifiedGeojson;
        `
      }

      // Ensure path is relative to Vite's root
      const relativePath = `${path.relative(process.cwd(), filePath).replace(/\\/g, '/')}`.replace(
        '../trips',
        '~'
      )

      // Return a function that dynamically imports the file
      return `
        export default async function() {
          const module = await import(${JSON.stringify(relativePath + '?raw')}); 
          let geojson = module.default;
          return geojson;
        };
      `
    }
  }
}
