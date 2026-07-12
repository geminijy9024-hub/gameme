import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "Kotoba Tower",
        short_name: "Kotoba Tower",
        description: "일본어 학습으로 오르는 자동전투 무한 탑 RPG",
        theme_color: "#080b18",
        background_color: "#080b18",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        icons: [{ src: "icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }]
      },
      workbox: { navigateFallback: "index.html", globPatterns: ["**/*.{js,css,html,svg,png,woff2}"] }
    })
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: 5173 }
});
