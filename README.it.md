# Palco 🎤

**Il tuo sito musicale, online in pochi minuti.**

[🇬🇧 English](README.md) · 🇮🇹 Italiano

Palco è un template open-source per **un singolo cantautore**: metti i tuoi brani, scrivi le tue info in un file, pubblichi. Niente account da gestire, niente piattaforma di terzi che decide chi ti ascolta. È il **tuo** sito, sul **tuo** dominio — e i fan possono **installarlo come app** sul telefono.

> Per chi non programma: i passaggi sono "modifica un file di testo, trascina i tuoi MP3, clicca deploy".

![Player con i tuoi brani](docs/preview.svg)

---

## 🚀 Mettiti online in 4 passi

1. **Crea la tua copia** — clicca *Use this template* (o fai un fork) su GitHub.
2. **Scrivi le tue info** — apri [`site.config.ts`](site.config.ts) e metti nome, bio e link.
3. **Aggiungi la tua musica** — trascina i file in `public/music/` e le copertine in `public/images/`, poi aggiungi un blocco per ogni brano nell'elenco `tracks`.
4. **Pubblica** — un click:

[![Deploy con Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/iltempe/palco)
&nbsp;
[![Deploy su Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/iltempe/palco)

Vercel e Netlify costruiscono il sito da soli e ti danno un indirizzo `https://…`. In più puoi collegare il **tuo dominio** (es. `www.tuonome.it`) dalle loro impostazioni in due click.

> Preferisci **GitHub Pages**? È gratis e già pronto: vai su *Settings → Pages → Source: GitHub Actions*. Il workflow incluso pubblica a ogni modifica. Demo live: <https://iltempe.github.io/palco/>

---

## ✏️ Come si configura

Tutto in **un solo file**, [`site.config.ts`](site.config.ts):

```ts
export const site = {
  artist: {
    name: "Marta Lo Russo",
    tagline: "Cantautrice da Napoli",
    bio: "Voce e chitarra, testi di quartiere e di sogni.",
    avatar: "/images/io.jpg",
    accentColor: "#6c47ff",          // il colore del tuo sito
    links: { instagram: "…", spotify: "…", email: "…" },
  },
  tracks: [
    {
      id: "quartiere",                // id univoco (usato per contatori e app)
      title: "Quartiere",
      file: "/music/quartiere.mp3",   // file locale… oppure un URL esterno
      cover: "/images/quartiere.jpg",
      description: "Il primo singolo.",
      releaseDate: "2026-05-01",
    },
  ],
};
```

- I **file audio** vanno in `public/music/` (MP3, WAV, OGG). Puoi anche usare un URL esterno.
- Le **copertine/foto** vanno in `public/images/`.
- Il **colore** del sito si cambia con `accentColor`.
- La **lingua** dell'interfaccia si imposta col campo `lang`: `"it"` o `"en"` (tutta la UI, badge "sei il N° fan" e testo di condivisione inclusi, cambia di conseguenza). I tuoi testi — bio, descrizioni dei brani — restano come li scrivi tu.

## 📲 Installa come app (PWA)

Il tuo sito è una **Progressive Web App**: chi lo visita può installarlo sul telefono come player a sé stante, con il **tuo nome e la tua icona** — senza app store.

- **Android / Chrome desktop**: sul sito compare un bottone **"Installa l'app"** (e il browser mostra l'icona di installazione nella barra degli indirizzi).
- **iPhone / iPad**: in Safari tocca **Condividi** → **Aggiungi alla schermata Home**. (Lo stesso bottone "Installa l'app" mostra questi passaggi.)

Come artista non devi fare nulla di speciale: **nome, colore e descrizione dell'app arrivano dal tuo `site.config.ts`** in automatico. Per impostare l'**icona dell'app**:

```bash
npm run icons -- "#6c47ff"   # genera le icone nel tuo colore
```

…oppure sostituisci a mano i file in `public/icons/` (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`) con il tuo logo/foto **quadrato**.

I brani già ascoltati vengono messi in cache, così l'app continua a funzionare anche offline.

## 📊 Contatori ascolti/like (opzionale)

Di default il sito è **100% statico**: nessun backend, nessun contatore. Se vuoi sapere quanti ascolti e like ricevi:

1. Crea un progetto gratuito su [supabase.com](https://supabase.com).
2. Apri *SQL Editor*, incolla [`supabase/schema.sql`](supabase/schema.sql) ed esegui.
3. Copia **Project URL** e **anon key** nel campo `analytics` di `site.config.ts` (oppure come variabili `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`).

I dati sono anonimi: nessun login, nessuna informazione personale di chi ascolta.

Con i contatori attivi, mettere like a un brano mostra una card **"Sei il N° fan"** con un'immagine pronta da condividere — un piccolo motore virale che trasforma il like in un motivo per parlare di te.

## 💻 Sviluppo locale

Serve **Node 18+**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera il sito statico in dist/
```

## 🧱 Com'è fatto

React + TypeScript + Vite + Tailwind, con `vite-plugin-pwa` per l'installabilità. Sito statico: gira ovunque, anche su hosting gratuiti.

```
site.config.ts        # ← l'unico file che modifichi
public/music/         # i tuoi file audio
public/images/        # copertine e foto
public/icons/         # icone dell'app (sostituibili)
src/                  # il codice del sito (player, layout, tema, install)
supabase/schema.sql   # contatori opzionali
```

## 🤝 Contribuire

Palco è open source: idee, temi, traduzioni e codice sono benvenuti. Vedi [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 Licenza

[MIT](LICENSE) — usalo, modificalo, fanne quello che vuoi.
