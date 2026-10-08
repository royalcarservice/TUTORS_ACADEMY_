import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/* The sandbox preview proxies this dev server, so the host must be permissive
   and every asset URL must stay relative. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    hmr: { clientPort: 443, protocol: "wss" },
  },
  preview: { host: "0.0.0.0", port: 4173, allowedHosts: true },
  build: {
    target: "es2022",
    sourcemap: false,
    /* Three.js + React Three Fiber are the bulk of the bundle and are already
       split into their own lazily-imported chunk (see App.tsx), so the page
       shell is ~130 kB gzipped. The limit is raised for that one chunk rather
       than the warning being ignored. */
    chunkSizeWarningLimit: 1000,
  },
});
