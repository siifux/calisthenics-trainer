import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Sett base til repo-navnet for GitHub Pages-deploy under
// https://<bruker>.github.io/calisthenics-trainer/
// Endre til "/" hvis du bruker custom domain eller user-side.
const BASE = "/calisthenics-trainer/";

export default defineConfig({
  base: BASE,
  // GitHub Pages "Deploy from branch" serverer fra docs/ på main.
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Calisthenics Trainer",
        short_name: "Calisthenics",
        description: "Lightweight calisthenics timer — EMOM, AMRAP and more.",
        theme_color: "#0b0b0f",
        background_color: "#0b0b0f",
        display: "standalone",
        orientation: "portrait",
        start_url: BASE,
        scope: BASE,
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
