import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png",
      ],

      manifest: {
        name: "MobileHub",
        short_name: "MobileHub",
        description:
          "Everything Your Phone Needs — mobile accessories store",
        start_url: "/",
        display: "standalone",
        background_color: "#f5f5fb",
        theme_color: "#4338ca",

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api/products") ||
              url.pathname.startsWith("/api/categories"),

            handler: "NetworkFirst",

            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3600,
              },
            },
          },

          {
            urlPattern: ({ request }) =>
              ["style", "script", "image", "font"].includes(
                request.destination
              ),

            handler: "CacheFirst",

            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 3600,
              },
            },
          },
        ],
      },
    }),
  ],

  server: {
    port: 5182,

    proxy: {
      "/api": {
        target: "https://mobilehub-backend-swwo.onrender.com/",
        changeOrigin: true,
      },

      "/uploads": {
        target: "https://mobilehub-backend-swwo.onrender.com/",
        changeOrigin: true,
      },
    },
  },
});