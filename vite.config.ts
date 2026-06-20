import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { site } from "./site.config";

// `base` consente il deploy in sottocartella (es. GitHub Pages di progetto).
// Per dominio proprio / Vercel / Netlify lascia "/" (default).
const base = process.env.VITE_BASE || "/";

// Il manifest della web app (nome, colore, icone) è generato dal tuo config:
// quando un utente "installa" il sito, l'app porta il TUO nome e la TUA icona.
const shortName = site.artist.name.length > 12
  ? site.artist.name.split(" ")[0]
  : site.artist.name;

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: site.artist.name,
        short_name: shortName,
        description: site.artist.tagline || `La musica di ${site.artist.name}`,
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        background_color: "#0f0f12",
        theme_color: site.artist.accentColor || "#6c47ff",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // l'audio può essere grande: niente precache, ma cache a runtime quando ascoltato
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\.(?:mp3|wav|ogg|m4a)$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "audio",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              rangeRequests: true,
            },
          },
        ],
      },
    }),
  ],
  server: { port: 5173, host: true },
});
