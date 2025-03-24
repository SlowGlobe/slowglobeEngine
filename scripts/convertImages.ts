import { glob, Path } from 'glob'
import cliProgress, { MultiBar } from 'cli-progress'
import { existsSync, mkdirSync } from 'fs'
import { readFile, rename, stat, writeFile } from 'fs/promises'
import heicConvert from 'heic-convert'

console.log('Converting all heic images to .jpg')

// scan the trips/**/videos/ folder for.mov files
const imageFiles = await glob('../trips/**/images/*.{heic,HEIC}', {
  stat: true,
  withFileTypes: true,
  ignore: {
    ignored: (p) => {
      return p.name.startsWith('o_')
    }
  }
})

console.log(`Found ${imageFiles.length} heic images`)

// create new container
const multibar = new MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {filename} | {value}/{total} | {size} | {jpgSize}'
  },
  cliProgress.Presets.shades_grey
)

async function convertImage(image: Path) {
  const bar = multibar.create(100, 0)
  bar.update(0, { filename: image.name, size: formatBytes(image.size ?? 0) })

  const inputBuffer = await readFile(image.fullpath())
  bar.update(30)
  const outputBuffer = await heicConvert({ buffer: inputBuffer, format: 'JPEG', quality: 0.85 })
  bar.update(60)
  const outputPath = image.parentPath + '/' + image.name.split('.')[0] + '.jpg'
  await writeFile(outputPath, outputBuffer)
  bar.update(70)

  const stats = await stat(outputPath)
  bar.update(90, { jpgSize: formatBytes(stats.size) })

  // copy the original to the source_files folder
  if (!existsSync(image.parentPath + '/source_files/')) {
    mkdirSync(image.parentPath + '/source_files/')
  }
  await rename(image.fullpath(), image.parentPath + '/source_files/' + image.name)
  bar.update(100)
}

const promises: Promise<void>[] = []

imageFiles.forEach((image) => {
  promises.push(convertImage(image))
})
await Promise.any(promises)

setTimeout(() => {
  multibar.stop()
  console.log('Complete')
}, 300)

function formatBytes(bytes: number, decimals?: number) {
  if (bytes == 0) return '0 Bytes'
  const k = 1024,
    dm = decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
