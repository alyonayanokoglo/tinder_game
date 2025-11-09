import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@fonts': fileURLToPath(new URL('./src/fonts', import.meta.url)),
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: true,
  },
  build: {
    // Увеличиваем лимит для inline SVG, чтобы большие SVG оставались отдельными файлами
    assetsInlineLimit: 4096,
    // Отключаем минификацию для SVG файлов в CSS
    cssMinify: 'lightningcss',
  },
  // Оптимизация обработки SVG
  assetsInclude: ['**/*.svg'],
})
