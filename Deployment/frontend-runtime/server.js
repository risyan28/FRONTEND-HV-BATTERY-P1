import express from 'express'
import { createRequestHandler } from '@react-router/express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import os from 'os'

// __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Backend origin — samakan dgn target proxy Vite di vite.config.ts
const BE_TARGET = process.env.BE_TARGET || 'http://localhost:4001'

// Proxy /api -> Backend (menggantikan proxy Vite yg hanya ada saat dev)
app.use('/api', createProxyMiddleware({
  target: BE_TARGET,
  changeOrigin: true,
  secure: false,
}))

// Proxy WebSocket (socket.io)
app.use('/socket.io', createProxyMiddleware({
  target: BE_TARGET,
  changeOrigin: true,
  ws: true,
  secure: false,
}))

// Serve static client build
app.use(express.static(path.join(__dirname, 'build/client')))

// Handle Chrome DevTools & other well-known routes (suppress 404 errors)
app.use('/.well-known', (req, res) => res.status(404).send(''))

// Convert Windows path ke file:// URL
const serverBuildPath = pathToFileURL(
  path.join(__dirname, 'build/server/index.js'),
).href

// React Router handler
const build = await import(serverBuildPath)
app.use(createRequestHandler({ build }))

function logStartupInfo(port = PORT) {
  const localIPs = getLocalIPs()
  if (localIPs.length > 0) {
    console.log(`🌐 [LAN]  Accessible via HTTP:`)
    localIPs.forEach((ip) => console.log(`         http://${ip}:${port}`))
  } else {
    console.log(`🌐 [LAN]  Could not detect local IP`)
  }
}
function getLocalIPs() {
  const interfaces = os.networkInterfaces()
  const ips = []

  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name]
    if (!nets) continue
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address)
      }
    }
  }
  return ips
}

// Listen di semua IP
app.listen(PORT, '0.0.0.0', () => {
  logStartupInfo()
})
