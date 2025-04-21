import type { BrowserWindowConstructorOptions } from 'electron'
import { join } from 'node:path'
import process from 'node:process'
import Url from 'node:url'
import { app, BrowserWindow, dialog, screen, shell } from 'electron'
import electronLocalshortcut from 'electron-localshortcut'
import { debounce } from 'throttle-debounce'
import { isDev } from './config'
import { mainApi } from './handel'
import { logger } from './utils/log'
import { getDebugScript, injectScriptOnce } from './utils/script'
import { storeGet, storeSet } from './utils/store'
import { checkUpdate } from './utils/update'

const url = storeGet('url') as string

const localURL = `http://localhost:${process.argv[2]}`
const defaultUrl = Url.format({
  protocol: 'file:',
  slashes: true,
  pathname: join(app.getAppPath(), 'renderer', 'index.html'),
})

logger.info('Store Url', url)
logger.info('appPath', app.getAppPath())

// 大4px
const floatWidth = 70
const floatHeight = 70

export function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const options = {
    width: 800,
    height: 600,
    icon: join(__dirname, '../../static', 'logo.png'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  } as BrowserWindowConstructorOptions

  const mainWindow = new BrowserWindow(options)
  // mainWindow.maximize()

  if (isDev) {
    const debugScript = storeGet('debugScript')
    if (debugScript) {
      injectScriptOnce(mainWindow.webContents, debugScript)
    }
    mainWindow.webContents.openDevTools()
  }
  logger.info('loadUrl', isDev ? localURL : defaultUrl)
  mainWindow.loadURL(isDev ? localURL : defaultUrl)
  // mainWindow.loadURL(dragUrl)

  // F5刷新页面
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' && !input.alt && !input.control && !input.meta && !input.shift) {
      mainWindow.reload()
    }
  })

  // 解决Mac下无法复制粘贴问题
  electronLocalshortcut.register(mainWindow, 'CmdOrCtrl+C', () => {
    mainWindow.webContents.copy()
  })

  // mainWindow.setIgnoreMouseEvents(true, { forward: true })

  let count = 0
  let isFloat = false

  mainApi.on('drag', (opt: { x: number, y: number }) => {
    if (mainWindow.isMaximized()) return
    // const [x, y] = mainWindow.getPosition()
    // mainWindow.setPosition(x + opt.x, y + opt.y)
    // mainWindow.setBounds({ x: x + opt.x, y: y + opt.y }, false)
    mainWindow.setBounds({ x: opt.x, y: opt.y }, false)
  })

  mainApi.on('resize-window', () => {
    // 判断是否是最大化
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
      mainWindow.setSize(800, 600)
      mainWindow.center()
    }
    else {
      mainWindow.maximize()
    }
    mainWindow.setResizable(!mainWindow.isMaximized())
    mainApi.send({ type: 'maximized', data: mainWindow.isMaximized() })
  })

  mainApi.on('quit', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message: '确认退出？',
      buttons: ['确认', '取消'], // 选择按钮，点击确认则下面的idx为0，取消为1
      defaultId: 1, // 默认选中的按钮，这里是确认
      cancelId: 1, // 这个的值是如果直接把提示框×掉返回的值，这里设置成和“取消”按钮一样的值，下面的idx也会是1
    }).then((idx) => {
      // 注意上面↑是用的then，网上好多是直接把方法做为showMessageBox的第二个参数，我的测试下不成功
      console.log(idx)
      if (idx.response === 1) { /* empty */ }
      else {
        mainWindow.destroy()
        app.exit()
        app.quit()
      }
    })
  })

  mainApi.on('force-quit', () => {
    app.exit()
    app.quit()
  })

  mainApi.on('minimize', () => {
    isFloat = true
    mainApi.send({
      type: 'float-status',
      data: {
        status: isFloat,
      },
    })
    mainWindow.setResizable(false)
    setTimeout(() => {
      // mainWindow.setPosition(width - floatHeight - 50, floatHeight)
      mainWindow.setAlwaysOnTop(true)
      // mainWindow.setResizable(false);
      // mainWindow.setFullScreen(false)
      // mainWindow.unmaximize();
      // mainWindow.setSize(floatWidth, floatHeight)
      const position = storeGet('position') as number[]
      let x = width - floatWidth - 50
      let y = height - floatHeight - 50
      if (position) {
        x = position[0]
        y = position[1]
      }

      mainWindow.setBounds({ width: floatWidth, height: floatHeight, x, y }, false)
      logger.info('minimize', '设置悬浮', floatWidth, floatHeight, mainWindow.getSize())
    }, 800)
  })

  const setPosition = debounce(1000, (position) => {
    storeSet('position', position)
  })

  mainWindow.on('move', () => {
    if (isFloat) {
      setPosition(mainWindow.getPosition())
    }
  })

  // mainApi.on('record-position', () => {
  //   const position = mainWindow.getPosition()
  //   storeSet('position', position)
  // })

  mainApi.on('maximize', (route) => {
    isFloat = false
    mainApi.send({
      type: 'float-status',
      data: {
        status: isFloat,
        route,
      },
    })
    mainWindow.setResizable(true)
    mainWindow.setAlwaysOnTop(false)
    mainWindow.maximize()
    mainApi.send({ type: 'maximized', data: mainWindow.isMaximized() })
  })

  mainApi.on('window-reload', () => {
    count = 0
    // mainApi.send({ type: 'reload' })
    logger.info('loadUrl reload', isDev ? localURL : defaultUrl)
    mainWindow.loadURL(isDev ? localURL : defaultUrl)
    if (isDev) {
      const debugScript = storeGet('debugScript')
      if (debugScript) {
        injectScriptOnce(mainWindow.webContents, debugScript)
      }
    }
  })

  mainApi.on('check-update', () => {
    checkUpdate()
  })

  mainApi.on('open-devtools', () => {
    mainWindow.webContents.openDevTools()
  })

  mainApi.on('version', () => {
    count++
    if (isDev || count % 10 === 0) {
      logger.info('打开开发者工具')
      mainWindow.webContents.openDevTools()
      count = 0
    }
  })

  mainApi.on('window-debug', () => {
    getDebugScript().then((script) => {
      storeSet('debugScript', script)
      injectScriptOnce(mainWindow.webContents, script)
    })
  })

  mainApi.on('window-un-debug', () => {
    storeSet('debugScript', '')
    mainWindow.webContents.reload()
  })

  mainApi.on('window-log', () => {
    // 获取日志文件路径
    const logPath = logger.transports.file.getFile().path
    // 打开日志文件
    shell.openPath(logPath)
  })

  mainWindow.on('closed', () => {
    mainWindow.destroy()
    mainApi.clear()
  })

  // mainWindow.on('close', (e) => {
  //   e.preventDefault() // 先阻止一下默认行为，不然直接关了，提示框只会闪一下

  // })

  return mainWindow
}

app.commandLine.appendSwitch('allow-insecure-localhost', 'true')
app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', url)
