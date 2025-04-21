import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { libPath } from '../config'
import { logger } from './log'
import { PlatformX } from './platform'

// export function startExternalProgram() {
//   // 可执行文件的路径
//   const serverPath = path.join(libPath, 'file-server.exe')

//   const args = ['--arg1', '--arg2=value2'] // 传递的参数
//   return new Promise((resolve, reject) => {
//     const child = execFile(serverPath, args, { cwd: path.dirname(serverPath) }, (error, stdout, stderr) => {
//       if (error) {
//         logger.info('execFileError', error)
//         reject(error) // 如果有错误，进入 catch
//         return
//       }
//       resolve({ stdout, stderr }) // 成功时返回 stdout 和 stderr
//     })
//     if (child.stdout) {
//       child.stdout.on('data', data => {
//         logger.info('File Server Stdout', data)
//       })
//     }
//     if(child.stderr) {
//       child.stderr.on('data', data => {
//         logger.info('File Server Stderr', data)
//       })
//     }
//   })
// }

export function startExternalProgram() {
  let serverPath

  if (PlatformX.isWin) {
    serverPath = path.join(libPath, 'file-server.exe')
  }
  if (PlatformX.isLinux) {
    serverPath = path.join(libPath, 'file-server')
    try {
      fs.accessSync(serverPath, fs.constants.X_OK)
    }
    catch {
      logger.info('赋予文件执行权限:', serverPath)
      // execSync(`chmod +x ${serverPath}`)
      fs.chmodSync(serverPath, 0o755)
    }
  }

  return new Promise((resolve, reject) => {
    const options = { cwd: path.dirname(serverPath) }
    const args = ['--arg1', '--arg2=value2']
    // 启动子进程
    const child = spawn(serverPath, args, options)

    // 捕获子进程启动错误
    child.on('error', (processError) => {
      logger.error('Spawn Error:', processError)
      reject(processError)
    })

    // 捕获子进程的标准输出
    child.stdout?.on('data', (data) => {
      logger.info('File Server Stdout:', data.toString())
    })

    // 捕获子进程的错误输出
    child.stderr?.on('data', (data) => {
      logger.error('File Server Stderr:', data.toString())
    })

    // 立即 resolve，因为成功进入此处表明子进程已成功启动
    logger.info('Child process started successfully')
    resolve(child)

    // 监听子进程关闭（可选，用于记录退出信息）
    child.on('close', (code) => {
      logger.info(`Child process exited with code ${code}`)
    })
  })
}
