import process from 'node:process'
import { app, BrowserWindow, ipcMain, session } from 'electron'
import bindHandle from './handel'
import { startServer } from './server'
import { logger } from './utils/log'
import { PlatformX } from './utils/platform'
import { storeSet } from './utils/store'
import { checkUpdate } from './utils/update'
import { createWindow } from './window'

function tryAcquireLock(retries = 5, delay = 200) {
  if (app.requestSingleInstanceLock()) return true

  if (retries <= 0) return false

  return new Promise((resolve) => {
    setTimeout(() => resolve(tryAcquireLock(retries - 1, delay)), delay)
  })
};

let mainWindow: BrowserWindow

function main() {
  if (PlatformX.isWin) {
    // 检查更新
    checkUpdate()
  }
  // startExternalProgram()
  startServer()
  mainWindow = createWindow()
  bindHandle(mainWindow)
}

async function primaryApp() {
  if (!(await tryAcquireLock())) {
    logger.info('检测到第二个实例，退出')
    app.quit()
    return
  }
  app.on('second-instance', () => {
    // 当第二个实例启动时，尝试激活第一个实例窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    logger.info('start main')
    main()
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // 'Content-Security-Policy': ['script-src \'self\''],
        },
      })
    })

    session.defaultSession.on('will-download', (event, item, _webContents) => {
      item.on('done', (event, state) => {
        if (state === 'completed') {
          mainWindow.webContents.send('send', { type: 'file-download', data: item.getFilename() })
        }
        else {
          logger.info(`Download failed: ${state}`)
        }
      })
      item.resume() // 开始下载
    })

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0)
        createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  ipcMain.on('message', (event, message) => {
    console.log(message)
  })

  ipcMain.on('save-url', (event, message) => {
    storeSet('url', message)
    // 重新启动应用
    app.relaunch()
    app.exit()
  })
}
primaryApp()

process.on('uncaughtException', (error) => {
  logger.info('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason) => {
  logger.info('Unhandled Rejection:', reason)
})
