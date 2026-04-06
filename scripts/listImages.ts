import { glob } from 'glob'
import { readdirSync } from 'fs'
import { basename } from 'path'
import promptSync from 'prompt-sync'

// Initialize prompt
const prompt = promptSync()

// Get all trip directories
const tripDirs = readdirSync('../trips/', { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .sort()

// Display available trips
console.log('\n🌍 Available Trips:\n')
tripDirs.forEach((trip, index) => {
  console.log(`  ${index + 1}. ${trip}`)
})

// Prompt user to select a trip
const selection = prompt('\nSelect a trip number (or trip name): ')
let selectedTrip: string | undefined

// Try to parse as number
const tripIndex = parseInt(selection) - 1
if (!isNaN(tripIndex) && tripIndex >= 0 && tripIndex < tripDirs.length) {
  selectedTrip = tripDirs[tripIndex]
} else if (tripDirs.includes(selection)) {
  // Direct name match
  selectedTrip = selection
} else {
  console.error(`❌ Invalid selection: "${selection}"`)
  process.exit(1)
}

console.log(`\n📸 Listing images and videos for trip: ${selectedTrip}\n`)

// Get all image files
const imageFiles = await glob(
  `../trips/${selectedTrip}/images/*.{jpg,jpeg,JPG,JPEG,png,PNG,gif,GIF}`,
  {
    ignore: {
      ignored: (p) => p.name.startsWith('source_files')
    }
  }
)

// Get all video files
const videoFiles = await glob(
  `../trips/${selectedTrip}/videos/*.{mp4,m4v,mov,MOV,MP4,M4V,webm,WEBM}`,
  {
    ignore: {
      ignored: (p) => !p.name.startsWith('o_')
    }
  }
)

// Extract just the filenames and sort
const images = imageFiles.map((file) => basename(file)).sort()

const videos = videoFiles.map((file) => basename(file)).sort()

const allMedia = [...images, ...videos]

if (allMedia.length === 0) {
  console.log(`No images or videos found in ${selectedTrip}`)
  process.exit(0)
}

console.log(`Found ${images.length} images and ${videos.length} videos\n`)

// Format as SGGallery compatible list
console.log(':list="[')
allMedia.forEach((file, index) => {
  const isLastItem = index === allMedia.length - 1
  console.log(`    '${file}'${isLastItem ? '' : ','}`)
})
console.log(']"')
