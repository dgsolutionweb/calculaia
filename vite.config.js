import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['calculator.svg'],
      manifest: {
        name: 'CalculaIA - DGSolutionWEB',
        short_name: 'CalculaIA',
        description: 'Calculadora inteligente com IA',
        theme_color: '#007bff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'calculator.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        start_url: '/',
        orientation: 'portrait'
      }
    })
  ],
  base: '/calculaia/'
})
