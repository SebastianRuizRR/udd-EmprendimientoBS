import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⬇️ Si quieres, pon tu dominio exacto de Codespaces aquí.
// const CODESPACE_HOST = 'damp-skeleton-5g9grvx6wj942qqj-5173.app.github.dev'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443,                 // ⬅️ el cliente se conecta por 443 (no escucha)
      // clientHostname: CODESPACE_HOST // ⬅️ opcional (a veces ayuda con proxies)
    }
  },
  optimizeDeps: {
    include: ['xlsx']                  // ⬅️ evita el 504 al cargar xlsx
  },
  define: {
    'process.env': {}                  // ⬅️ por si alguna lib espera process.env
  }
})
