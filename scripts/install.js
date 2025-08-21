const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')
const fetch = require('node-fetch')

async function downloadFile(url, outputPath) {
  return fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/octet-stream' } })
    .then(res => res.buffer())
    .then((buffer) => {
      return fs.writeFile(outputPath, buffer, 'binary', (err) => {
        if (err)
          console.log(err)
      })
    })
    .catch((err) => {
      console.log('Error downloading file:', err)
      throw err
    })
}
const outDit = path.join(process.cwd(), 'main', 'lib')
if (!fs.existsSync(outDit)) {
  fs.mkdirSync(outDit, { recursive: true })
}

const need = [
  // {
  //   name: 'file-server',
  //   url: 'http://xx',
  // },
  // {
  //   name: 'file-server.exe',
  //   url: 'http://xx',
  // }
]

function install() {
  for (const item of need) {
    const outPath = path.join(outDit, item.name)
    if (fs.existsSync(outPath))
      fs.unlinkSync(outPath)

    downloadFile(item.url, outPath).catch((_err) => {
      console.log('Error downloading file:', _err)
      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath)
      }
    })
  }
}

install()
