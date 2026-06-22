import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/smashtracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'smashtracker',
        short_name: 'smashtracker',
        start_url: '/smashtracker/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: []
      }
    })
  ]
})