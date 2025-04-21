import { exec } from 'node:child_process'
import path from 'node:path'
import { ref } from '@vue/reactivity'
import { app } from 'electron'

import iconv from 'iconv-lite'
import { CODE_PAGE } from '../config'
import { PlatformX } from '../utils/platform'
import { setFileStat } from './stat'

// console.log(mimeTypes)

const es = path.join(app.getAppPath(), 'static', 'everything', 'es.exe')
const codePage = ref('')

if (PlatformX.isWin)
  getCodePage()

export function handleSearch(data) {
  return new Promise((resolve, reject) => {
    exec(`${es} ${data} -n 200`, { encoding: 'buffer' }, async (error, stdout, _stderr) => {
      if (error) {
        reject(error)
      }
      if (stdout) {
        if (!codePage.value) {
          await getCodePage()
        }
        const _de = iconv.decode(stdout, codePage.value)
        const data = iconv.encode(_de, 'utf-8').toString().trim() || ''
        const list = data.split(/\r?\n/).filter(Boolean)
        const result = await setFileStat(list.map(i => ({ path: i })))
        // 用正则按照换行符分割字符串
        resolve(result)
      }
    })
  })
}

function getCodePage() {
  return new Promise((resolve, reject) => {
    exec('chcp', { shell: 'cmd.exe' }, (error, stdout, _stderr) => {
      if (error) {
        reject(error)
      }
      if (stdout) {
        const page = stdout.replace(/\D/g, '')
        if (!CODE_PAGE[page]) {
          reject(new Error('未知的代码页'))
        }
        codePage.value = CODE_PAGE[page]
        resolve(CODE_PAGE[page])
      }
    })
  })
}
