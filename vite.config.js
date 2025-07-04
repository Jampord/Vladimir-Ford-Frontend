import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

dotenv.config();

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    // basicSsl(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      workbox: {
        cleanupOutdatedCaches: false,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB
      },

      manifest: {
        name: "Vladimir Inventory System",
        short_name: "Vladimir",
        description: "RDF Inventory System",
        display: "standalone",
        theme_color: "primary",
        background_color: "primary",
        icons: [
          {
            src: "/src/Img/favicon1.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/src/Img/favicon1.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "/src/Img/favicon1.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    viteCompression({
      algorithm: "brotliCompress", // or 'gzip'
      ext: ".br",
    }),
    visualizer({
      open: true,
      filename: "stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    // port: 3030,
    host: true,
  },
  define: {
    "process.env.PORT": `"${process.env.PORT}"`,
    "process.env.YMIR_BASE_URL": `"${process.env.YMIR_BASE_URL}"`,
    "process.env.YMIR_KEY": `"${process.env.YMIR_KEY}"`,
    "process.env.SEDAR_KEY": `"${process.env.SEDAR_KEY}"`,
    "process.env.FISTO_KEY": `"${process.env.FISTO_KEY}"`,
    "process.env.FISTO_KEY_ADMIN": `"${process.env.FISTO_KEY_ADMIN}"`,
    "process.env.VLADIMIR_BASE_URL": `"${process.env.VLADIMIR_BASE_URL}"`,
    "process.env.GL_KEY": `"${process.env.GL_KEY}"`,
    "process.env.ONE_RDF_BASE_URL": `"${process.env.ONE_RDF_BASE_URL}"`,
  },
});
