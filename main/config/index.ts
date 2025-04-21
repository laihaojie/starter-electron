import path from 'node:path'
import process from 'node:process'
import { app } from 'electron'
import { logger } from '../utils/log'

export const CODE_PAGE = {
  936: 'gbk',
  65001: 'utf-8',
}

export enum PreviewEnum {
  docx = '.docx',
  xls = '.xls',
  xlsx = '.xlsx',
}

export const iframePreviews = [
  '.html',
  '.htm', // HTML 文件
  '.pdf', // PDF 文件
  '.jpg',
  '.jpeg', // 图片文件
  '.png',
  '.gif',
  '.bmp',
  '.svg',
  '.txt', // 文本文件
  '.mp4',
  '.webm',
  '.ogg', // 视频文件
  '.mp3',
  '.wav', // 音频文件（需测试，部分受支持）
  '.js',
  '.vue',
  '.bat',
  '.efu', // 代码文件
  '.md',
  '.cmd',
  '.CMD',
  '.tsv',
]

export const localPreviews = [
  '.doc',
]

export const zipPreviews = [
  '.zip',
]

export const isDev = process.env.NODE_ENV === 'development'

logger.info('isDev', isDev)

export const rootPath = app.getAppPath()

export const libPath = isDev ? path.join(rootPath, 'lib') : path.join(rootPath, '..', '..', 'lib')
