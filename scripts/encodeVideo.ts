import { spawn } from 'handbrake-js'
import { glob } from 'glob'
import cliProgress, { MultiBar } from 'cli-progress'
import ffmpeg from 'fluent-ffmpeg'
import { existsSync, mkdirSync, rename, stat } from 'fs'

console.log('Converting all videos to .mp4')

// scan the trips/**/videos/ folder for.mov files
const videoFiles = await glob('../trips/**/videos/*.{MOV,mov,mp4,mkv}', {
  stat: true,
  withFileTypes: true,
  ignore: {
    ignored: (p) => {
      return p.name.startsWith('o_')
    }
  }
})

console.log(`Found ${videoFiles.length} videos`)

// create new container
const multibar = new MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {filename} | {value}/{total} | {size} | {compSize}'
  },
  cliProgress.Presets.shades_grey
)

for (const video of videoFiles) {
  // create progress bar
  const bar = multibar.create(100, 0)
  bar.update(0, { filename: video.name, size: formatBytes(video.size ?? 0) })

  //   Create a thumbnail
  await new ffmpeg(video.fullpath()).screenshots({
    timestamps: ['2%'],
    filename: 'o_' + video.name.split('.')[0] + '_thumb.png',
    folder: video.parentPath
  })
  bar.update(10, { filename: video.name })

  //   Convert the video to mp4
  const options = {
    input: video.fullpath(),
    output: video.parentPath + '/o_' + video.name.split('.')[0] + '.m4v',
    preset: 'Social 100 MB 5 Minutes 1080p30'
  }
  const newSize = await doVidEnc(options, bar)

  // copy the original to the source_files folder
  if (!existsSync(video.parentPath + '/source_files/')) {
    mkdirSync(video.parentPath + '/source_files/')
  }
  rename(video.fullpath(), video.parentPath + '/source_files/' + video.name, function (err) {
    if (err) throw err
    bar.update(100, { filename: video.name })
  })
}

setTimeout(() => {
  multibar.stop()
  console.log('Complete')
}, 300)

function doVidEnc(options: any, bar: any): Promise<number> {
  return new Promise((resolve, reject) => {
    spawn(options, null)
      .on('progress', (progress) => {
        bar.update(Math.round(progress.percentComplete * 0.8) + 10)
      })
      .on('end', () => {
        stat(options.output, (err, stats) => {
          if (err) {
            console.log(err)
            reject(err)
          }
          const size = stats.size
          bar.update(90, { compSize: formatBytes(size) })
          resolve(size)
        })
      })
  })
}

function formatBytes(bytes: number, decimals?: number) {
  if (bytes == 0) return '0 Bytes'
  const k = 1024,
    dm = decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
