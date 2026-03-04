// frontend/vite.config.ts
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    // ✅ PWA Plugin - generates service worker and manifest
    VitePWA({
      registerType: 'autoUpdate', // Auto-update service worker
      injectRegister: 'auto', // Auto inject register script
      devOptions: {
        enabled: true, // Enable PWA in dev mode for testing
        type: 'module',
      },
      includeAssets: ['images/**/*', 'favicon.ico'], // Cache images and favicon
      manifest: false, // Use public/manifest.json instead
      workbox: {
        // Runtime caching strategies
        globPatterns: ['**/*.{js,css,ico,png,jpg,jpeg,svg,woff,woff2}'], // Exclude html files
        globIgnores: ['**/index.html', '**/*.html'], // Explicitly ignore HTML files
        navigateFallback: null, // Disable navigate fallback to avoid index.html route conflict
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./, // Cache API requests
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif)$/, // Cache images
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
    // ✅ Suppress .well-known Chrome DevTools requests
    {
      name: 'suppress-well-known-errors',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Intercept .well-known requests before they reach React Router
          if (req.url?.startsWith('/.well-known/')) {
            res.statusCode = 404
            res.end()
            return
          }
          next()
        })
      },
    },
  ],
  server: {
    host: '0.0.0.0', // ← biar bisa diakses dari device lain di LAN
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:4001',
        changeOrigin: true, // ← rewrite Origin header agar tidak diblock CORS di BE
        ws: true, // ← penting untuk WebSocket proxy (HTTP upgrade → ws://)
        secure: false,
      },
    },
  },
})
