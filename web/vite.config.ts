import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: { protocol: 'wss', clientPort: 443 }
  },
  optimizeDeps: { include: ['xlsx'] },
  define: { 'process.env': {} }
});