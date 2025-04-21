import fs from 'node:fs'
import path from 'node:path'
import Url from 'node:url'
import { app } from 'electron'
import { formatFileSize, parseTime } from 'lingman'

import mime from 'mime'
import { iframePreviews, isDev, localPreviews, PreviewEnum, zipPreviews } from '../config'
import { PORT } from '../server'
import { logger } from '../utils/log'

export async function setFileStat(paths): Promise<any[]> {
  const result = [] as any[]
  for (let i = 0; i < paths.length; i++) {
    const item = paths[i]
    const filePath = item.path
    const data = { ...item } as any
    data.isExist = fs.existsSync(filePath)
    if (!data.isExist) {
      if (isDev)
        logger.info('文件不存在', filePath)

      result.push(item)
      continue
    }
    const stat = await getStatByPath(filePath)
    data.path = filePath
    data.name = path.basename(filePath)
    // 判断是否是文件夹

    data.isDir = stat.isDirectory()
    data.isFile = stat.isFile()
    // 最后一次更新时间
    data.mtime = parseTime(stat.mtime)
    // 创建时间
    data.birthtime = parseTime(stat.birthtime)
    data.count = 1
    // 获取图标
    if (data.isFile) {
      data.icon = (await app.getFileIcon(filePath, { size: 'large' })).toDataURL()
      data.size = stat.size
      data.url = Url.format({
        protocol: 'file:',
        slashes: true,
        pathname: filePath,
      })
      data.type = mime.getType(filePath)
      data.ext = path.extname(filePath).toLowerCase()
      if (iframePreviews.includes(data.ext)) {
        data.previewType = 'iframe'
      }
      if (localPreviews.includes(data.ext)) {
        data.previewType = 'iframe'
        data.url = `http://127.0.0.1:${PORT}/view?path=${encodeURIComponent(data.path)}&ext=${data.ext}`
      }
      if (zipPreviews.includes(data.ext)) {
        data.previewType = data.ext
      }
      else if (Object.values(PreviewEnum).includes(data.ext)) {
        data.previewType = data.ext
      }
      else { /* empty */ }
    }
    if (data.isDir && fs.accessSync(filePath, fs.constants.R_OK)) {
      // 如果是文件夹，获取文件夹子文件数量
      const files = fs.readdirSync(filePath)
      data.count = files.length
    }
    data.strSize = formatFileSize(data.size)
    result.push(data)
  }
  return result
}

function getStatByPath(path: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        logger.info('File stat error', err)
        reject(err)
      }
      resolve(stats)
    })
  })
}
