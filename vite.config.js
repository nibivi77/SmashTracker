import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
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
        icons: []
      }
    })
  ]
})