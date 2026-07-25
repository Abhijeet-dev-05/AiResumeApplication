import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/analyze':              'http://localhost:8000',
      '/cover-letter':         'http://localhost:8000',
      '/score-resume':         'http://localhost:8000',
      '/build-profile':        'http://localhost:8000',
      '/my-profile':           'http://localhost:8000',
      '/profile':              'http://localhost:8000',
      '/interview-questions':  'http://localhost:8000',
      '/career-coach':         'http://localhost:8000',
      '/auth':                 'http://localhost:8000',
      '/health':               'http://localhost:8000',
      '/jobs':                 'http://localhost:8000',
    },
  },
})
