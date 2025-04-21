const ChildProcess = require('node:child_process')

const minio = {
  url: 'http://xxxx.cn:9001',
  account: 'xx',
  password: 'xx',
  target: 'myminio/public/app/p210-electron/',
}

ChildProcess.execSync(`mc alias set myminio ${minio.url} ${minio.account} ${minio.password}`)
ChildProcess.execSync(`mc cp -r ./dist ${minio.target}`)

// 推送通知
fetch('http://xxx')
