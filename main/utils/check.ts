import net from 'node:net'

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket()

    socket.setTimeout(2000)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })

    socket.connect(port, host)
  })
}

export async function waitForService(port, timeout = 30000) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    if (await checkPort(port)) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error('Service did not start in time')
}
