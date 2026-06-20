# OpenStage 🎤

**Your music website, online in minutes.**

🇬🇧 English · [🇮🇹 Italiano](README.it.md)

OpenStage is an open-source template for **a single singer-songwriter**: add your tracks, write your info in one file, publish. No accounts to manage, no third-party platform deciding who hears you. It's **your** site, on **your** domain — and fans can **install it as an app** on their phone.

> Not a coder? The steps are literally "edit a text file, drop in your MP3s, click deploy".

![Player with your tracks](docs/preview.svg)

---

## 🚀 Go live in 4 steps

1. **Create your copy** — click *Use this template* (or fork) on GitHub.
2. **Write your info** — open [`site.config.ts`](site.config.ts) and set your name, bio and links.
3. **Add your music** — drop files into `public/music/` and cover art into `public/images/`, then add one block per track in the `tracks` list.
4. **Publish** — one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/iltempe/emerging-artists-weekly)
&nbsp;
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/iltempe/emerging-artists-weekly)

Vercel and Netlify build the site for you and give you an `https://…` address. You can also connect **your own domain** (e.g. `www.yourname.com`) from their dashboard in two clicks.

> Prefer **GitHub Pages**? It's free and ready: go to *Settings → Pages → Source: GitHub Actions*. The included workflow publishes on every change. Live demo: <https://iltempe.github.io/emerging-artists-weekly/>

---

## ✏️ Configuration

Everything lives in **one file**, [`site.config.ts`](site.config.ts):

```ts
export const site = {
  artist: {
    name: "Marta Lo Russo",
    tagline: "Singer-songwriter from Naples",
    bio: "Voice and guitar, songs about the neighborhood and dreams.",
    avatar: "/images/me.jpg",
    accentColor: "#6c47ff",          // your site's color
    links: { instagram: "…", spotify: "…", email: "…" },
  },
  tracks: [
    {
      id: "quartiere",                // unique id (used for counters & the app)
      title: "Quartiere",
      file: "/music/quartiere.mp3",   // a local file… or an external URL
      cover: "/images/quartiere.jpg",
      description: "The first single.",
      releaseDate: "2026-05-01",
    },
  ],
};
```

- **Audio files** go in `public/music/` (MP3, WAV, OGG). You can also use an external URL.
- **Cover art / photos** go in `public/images/`.
- The site **color** is set by `accentColor`.

## 📲 Install as an app (PWA)

Your site is a **Progressive Web App**: visitors can install it on their phone as a standalone player with **your name and your icon** — no app store needed.

- **Android / desktop Chrome**: an **"Install app"** button appears on your site (and the browser shows an install icon in the address bar).
- **iPhone / iPad**: in Safari tap **Share** → **Add to Home Screen**. (The same "Install app" button shows these steps.)

As the artist you don't have to do anything extra — the app **name, color and description come from your `site.config.ts`** automatically. To set the **app icon**:

```bash
npm run icons -- "#6c47ff"   # generates icons in your color
```

…or just replace the files in `public/icons/` (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`) with your own **square** logo/photo.

Songs that have been played once are also cached, so the app keeps working offline.

## 📊 Play / like counters (optional)

By default the site is **100% static**: no backend, no counters. If you want to know how many plays and likes you get:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open *SQL Editor*, paste [`supabase/schema.sql`](supabase/schema.sql) and run it.
3. Copy **Project URL** and **anon key** into the `analytics` field of `site.config.ts` (or as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars).

Data is anonymous: no login, no personal info about listeners.

## 💻 Local development

Requires **Node 18+**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs the static site to dist/
```

## 🧱 How it's built

React + TypeScript + Vite + Tailwind, with `vite-plugin-pwa` for installability. Static output: runs anywhere, even on free hosting.

```
site.config.ts        # ← the only file you edit
public/music/         # your audio files
public/images/        # cover art and photos
public/icons/         # app icons (replaceable)
src/                  # the site code (player, layout, theme, install)
supabase/schema.sql   # optional counters
```

## 🤝 Contributing

OpenStage is open source: ideas, themes, translations and code are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

[MIT](LICENSE) — use it, change it, do what you want with it.
