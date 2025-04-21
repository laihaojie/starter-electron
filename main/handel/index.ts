import type { BrowserWindow } from 'electron'
import fs from 'node:fs'
import path, { join } from 'node:path'
import process from 'node:process'
import Url from 'node:url'
import { app, clipboard, dialog, ipcMain, shell } from 'electron'
import { isDev } from '../config'
import { getLocalIps } from '../utils/indes'
import { handleSearch } from './search'
import { setFileStat } from './stat'

const packageJson = JSON.parse(fs.readFileSync(join(__dirname, '../../../package.json'), 'utf-8'))

export const mainApi = {} as {
  send: (data: { type: string, data?: any }) => void
  on: (type: string, callback: (data: any, event: Electron.IpcMainInvokeEvent, win: BrowserWindow) => void) => void
  clear: () => void
}
const onMap = new Map()

mainApi.on = (type, callback) => {
  if (onMap.has(type)) {
    onMap.get(type).push(callback)
  }
  else {
    onMap.set(type, [callback])
  }
}

export default function bindHandle(mainWindow: BrowserWindow) {
  mainApi.send = ({ type, data }) => {
    mainWindow.webContents.send('send', { type, data })
  }

  mainApi.clear = () => {
    onMap.clear()
  }
  ipcMain.handle('send', async (event, { type, data }) => {
    if (isDev)
      console.log(type, data)
    if (onMap.has(type)) {
      onMap.get(type).forEach(cb => cb(data, event, mainWindow))
    }
    if (type === 'search') {
      return handleSearch(data)
    }
    if (type === 'fileStat') {
      return setFileStat(data)
    }
    if (type === 'openFile') {
      shell.openPath(data)
    }
    if (type === 'openInExplorer') {
      shell.showItemInFolder(data)
    }
    if (type === 'copyText') {
      clipboard.writeText(data)
    }
    if (type === 'selectFolder') {
      return dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      }).then((r) => {
        if (!r.canceled) {
          return r.filePaths.at(0)
        }
        return Promise.reject(new Error('selectFolder error'))
      })
    }
    if (type === 'get-info') {
      let icon
      if (isDev) {
        icon = Url.format({
          protocol: 'file:',
          slashes: true,
          pathname: join(process.cwd(), 'static', 'logo.png'),
        })
      }
      else {
        icon = Url.format({
          protocol: 'file:',
          slashes: true,
          pathname: join(app.getAppPath(), 'public', 'logo.png'),
        })
      }
      return {
        version: packageJson.version,
        icon,
        title: mainWindow.getTitle(),
        ip: getLocalIps(),
      }
    }
    if (type === 'get-file-object') {
      const filePath = data
      if (!filePath) {
        return null
      }
      if (!fs.existsSync(filePath)) {
        return null
      }
      try {
        const fileName = path.basename(filePath)
        const fileType = path.extname(filePath).slice(1)
        const fileBuffer = fs.readFileSync(filePath)
        return { fileName, fileType, fileBuffer }
      }
      catch (error) {
        console.error('获取文件失败:', error)
        return null
      }
    }
  })
}
