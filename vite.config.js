import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/SmashTracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SmashTracker',
        short_name: 'SmashTracker',
        start_url: '/SmashTracker/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          { src: '/SmashTracker/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/SmashTracker/pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})