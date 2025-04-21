import process from 'node:process'

export class PlatformX {
  static isWin = process.platform === 'win32'
  static isMac = process.platform === 'darwin'
  static isLinux = process.platform === 'linux'
}
