import path from 'node:path'
import process from 'node:process'
import log from 'electron-log'
import { NsisUpdater } from 'electron-updater'
import { isDev } from '../config'
import { mainApi } from '../handel'

const autoUpdater = new NsisUpdater({
  url: 'https://center.lingman.tech:9002/public/app/p210-electron/dist',
  requestHeaders: {
    'Content-Type': 'application/json',
  },
  channel: 'latest',
  provider: 'generic',
})

log.transports.file.level = 'info'
autoUpdater.logger = log
autoUpdater.forceDevUpdateConfig = isDev
// autoUpdater.autoInstallOnAppQuit = true
// autoUpdater.autoRunAppAfterInstall = true
// 设置dev-app-update.yml文件的路径
if (isDev)
  autoUpdater.updateConfigPath = path.join(process.cwd(), 'dev-app-update.yml')

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...')
})
autoUpdater.on('update-available', (_info) => {
  sendStatusToWindow('Update available.')
})
autoUpdater.on('update-not-available', (_info) => {
  sendStatusToWindow('Update not available.')
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow(`Error in auto-updater. ${err}`)
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`
  log_message = `${log_message} - Downloaded ${progressObj.percent}%`
  log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`
  sendStatusToWindow(log_message)
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded', info)
  mainApi.send({
    type: 'downloaded',
  })
  mainApi.on('quitAndInstall', () => {
    log.info('退出并安装')
    autoUpdater.quitAndInstall(true, true)
  })
})

function sendStatusToWindow(text, info?) {
  if (isDev)
    console.log(text, info)
}

export function checkUpdate() {
  // autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.checkForUpdates()
  // autoUpdater.install(true)
}
