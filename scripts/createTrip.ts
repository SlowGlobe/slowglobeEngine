console.log('Welcome to the trip creator! Simple to use... just follow the prompts.\n')

import { writeFileSync, existsSync, mkdirSync } from 'fs'

import promptSync from 'prompt-sync'

// Created prompt to handle user input
const prompt = promptSync()

// Function to handle bool required prompt
function yesNoPrompt(question) {
  const response = prompt(question + ' (y/n): ')
    .trim()
    .toLowerCase()
  if (response === 'y' || response === 'yes') {
    return true
  } else if (response === 'n' || response === 'no') {
    return false
  } else {
    console.log('Please enter "y" for yes or "n" for no.')
  }
}

const id = prompt('Trip ID (used in the url): ')
const name = prompt('Trip Name (used in the title): ')
const createGeojsonFile = yesNoPrompt('Do you want to show routes on the map?')
const flight = yesNoPrompt('Did you fly anywhere on this trip?')
const hike = yesNoPrompt('Did you go for a hike on this trip?')

const typescriptContent = `import type { Trip } from '@/functions/trips'
import imgUrl from '@/assets/images/other/20240922_172726-2.jpg?w=600&gallery'
${
  createGeojsonFile
    ? `import overviewGeo from './geometry.geojson?simplify'
import detailGeo from './geometry.geojson'`
    : ''
}

export const ${id}: Trip = {
  id: '${id}',
  name: '${name}',
  headerImage: imgUrl,
  date: '2024-09-22',
  locationText: 'Bräcke, Sweden',
  geography: {
    overview: {
      center: [15.4185552491721, 62.750063825451555],
      ${createGeojsonFile ? 'tracks: overviewGeo,' : ''}
      zoom: 7
    }
    ${createGeojsonFile ? `,detail: detailGeo` : ''}
  }
}`

const vueContent = `<script setup lang="ts">
import { useTripDetails } from '@/functions/loaders'
import DetailView from '@/components/DetailView.vue'
import SGHeader from '@/components/SGHeader.vue'
import SGGallery from '@/components/SGGallery.vue'
import SGMapCutout from '@/components/SGMapCutout.vue'
import SGText from '@/components/SGText.vue'
const { data: geom } = useTripDetails()
</script>

<template>
  <DetailView>
    <SGHeader>${name}</SGHeader>
    <SGText>
      Words here.
      <br />
      <br />
    </SGText>
  </DetailView>
</template>`

try {
  const path = '../trips/' + id
  if (!existsSync(path)) mkdirSync(path)
  if (!existsSync(path + '/images')) mkdirSync(path + '/images')
  if (!existsSync(path + '/videos')) mkdirSync(path + '/videos')
  // Create folders for flight and hike data if needed
  if (!existsSync(path + '/flight_data') && flight) mkdirSync(path + '/flight_data')
  if (!existsSync(path + '/hike_data') && hike) mkdirSync(path + '/hike_data')

  if (createGeojsonFile) writeFileSync(path + '/geometry.geojson', '')
  writeFileSync(path + '/' + id + '.ts', typescriptContent)
  writeFileSync(
    '../trips/' +
      id +
      '/(Trip' +
      id.charAt(0).toUpperCase() +
      id.substring(1).toLowerCase() +
      ').vue',
    vueContent
  )

  // File written successfully, log to user
  console.log('\nTrip created successfully with ID: ' + id + ' and Name: ' + name)
  console.log('\nREMEMBER to add the trip to the allTrips.ts file.')
} catch (err) {
  console.error(err)
}
