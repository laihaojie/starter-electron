import { join } from 'node:path'
import process from 'node:process'
import fs from 'node:fs'
import { BrowserWindow, Menu, app, ipcMain, session } from 'electron'
import electronLocalshortcut from 'electron-localshortcut'

const packageJson = JSON.parse(fs.readFileSync(join(__dirname, '../../package.json'), 'utf-8'))
let loadURL = ''

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.maximize()

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2]
    loadURL = `http://localhost:${rendererPort}`
    mainWindow.loadURL(loadURL)
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'))
  }

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

  let count = 0

  const menuTemp = [
    {
      label: '刷新-F5',
      click: () => {
        count = 0
        mainWindow.reload()
      },
    },
    {
      label: `版本 ${packageJson.version}`,
      click: () => {
        count++
        if (count % 10 === 0) {
          console.log('打开开发者工具')
          mainWindow.webContents.openDevTools()
          count = 0
        }
      },
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemp))
}

// 允许localhost发送请求
app.commandLine.appendSwitch('disable-features', 'BlockInsecurePrivateNetworkRequests');

// 开放需要https的api授权
app.commandLine.appendSwitch('allow-insecure-localhost', 'true')
app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', loadURL)

app.whenReady().then(() => {
  createWindow()

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // 'Content-Security-Policy': ['script-src \'self\''],
      },
    })
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
