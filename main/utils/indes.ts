import os from 'node:os'

export function getLocalIps() {
  // 获取本地ip地址
  // 获取本地网络接口列表
  const networkInterfaces = os.networkInterfaces()
  const allIpV4Address = Object.keys(networkInterfaces).map((interfaceName) => {
    const interfaces = networkInterfaces[interfaceName]
    return interfaces!.filter((interfaceInfo) => {
      return interfaceInfo.family === 'IPv4' && !interfaceInfo.internal
    }).map(interfaceInfo => interfaceInfo.address)
  }).flat()
  const ipData = {
    all192Address: allIpV4Address.filter(ip => ip.startsWith('192.168.')),
    allIpV4Address,
  }

  return ipData
}
