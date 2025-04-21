import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import WordExtractor from 'word-extractor'

const app = express()

const output = path.resolve('shared')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/shared', express.static(output))

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/list', async (req, res) => {
  res.json({ data: 1 })
})

app.get('/view', async (req, res) => {
  const filePath = decodeURIComponent(req.query.path)
  const ext = req.query.ext
  if (ext === '.doc') {
    const extractor = new WordExtractor()
    const extracted = extractor.extract(filePath)
    extracted.then((doc) => {
      const docBody = doc.getBody()
      // 响应文本内容给前端预览
      res.send(`<div style="white-space: pre-line;">${docBody}</div>`)
    }).catch(() => {
      res.send(`预览失败` + `  ${filePath}`)
    })
  }
  if (ext === '.xls') {
    // 响应文件
    const file = fs.readFileSync(filePath, 'binary')

    res.setHeader('Content-Length', file.length)
    res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.write(file, 'binary')
    res.end()
  }
})

// 配置 multer 中间件
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // 指定上传文件保存的目录
    cb(null, output)
  },
  filename(req, file, cb) {
    // 指定上传文件的文件名
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

app.post('/upload', upload.single('file'), async (req, res) => {
  res.json({ message: '上传成功', data: req.file.originalname })
})

app.get('/device', async (req, res) => {
  if (process.platform === 'win32') {
    res.send('')
    return
  }
  const cmd = 'df -h'
  const result = execSync(cmd, { encoding: 'utf8' }).toString()
  res.send(result)
})

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err)
})

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err)
})

export const PORT = 4172

export function startServer() {
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`)
  })
}
