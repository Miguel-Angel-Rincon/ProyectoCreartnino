import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 importante para producción
  build: {
    chunkSizeWarningLimit: 1600 // aumenta el límite en KB
  }
})
