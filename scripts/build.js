(async function () {
  const FileSystem = require('node:fs')
  const Path = require('node:path')
  const Chalk = require('chalk')
  const Vite = await import('vite')
  const compileTs = require('./private/tsc')

  function buildRenderer() {
    return Vite.build({
      configFile: Path.join(__dirname, '..', 'vite.config.mjs'),
      base: './',
      mode: 'production',
    })
  }

  function buildMain() {
    const mainPath = Path.join(__dirname, '..', 'main')
    return compileTs(mainPath)
  }

  FileSystem.rmSync(Path.join(__dirname, '..', 'build'), {
    recursive: true,
    force: true,
  })

  console.log(Chalk.blueBright('Transpiling renderer & main...'))

  Promise.allSettled([
    buildRenderer(),
    buildMain(),
  ]).then(() => {
    console.log(Chalk.greenBright('Renderer & main successfully transpiled! (ready to be built with electron-builder)'))
  })
})()
