import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
/// <reference types="vite/client" />
declare module "*.png"  { const src: string; export default src; }
declare module "*.jpg"  { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.svg"  { const src: string; export default src; }
