# Emerging Artists Weekly 🎵

PWA mobile-first che mostra una playlist settimanale di 10 cantautori emergenti.
Gli utenti ascoltano e mettono like in modo completamente anonimo. Ogni lunedì
la playlist si rinnova; un agente AI la popola automaticamente.

Implementazione delle [specifiche tecniche](specifiche-tecniche.md) — Fase 1 (MVP)
completa, Fase 2 (agente AI) inclusa come scaffold pronto all'uso.

---

## Stack

| Layer | Tecnologia |
|---|---|
| Frontend | HTML + CSS + Vanilla JS (PWA) |
| Backend / DB | Supabase (PostgreSQL + REST) |
| Player | YouTube IFrame API |
| Agente AI | Claude API (tool use) + YouTube Data API v3 |
| Hosting | Vercel / Netlify (statico) |

## Struttura

```
.
├── index.html            # UI principale
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
├── vercel.json           # Config hosting statico
├── css/style.css
├── js/
│   ├── config.js         # URL + anon key Supabase (pubbliche)
│   ├── api.js            # Chiamate REST Supabase
│   ├── storage.js        # Anti-spam localStorage
│   ├── player.js         # Wrapper YouTube IFrame API
│   └── app.js            # Entry point / orchestrazione UI
├── icons/                # Icone PWA generate
├── scripts/
│   └── generate-icons.js # Genera le icone PNG
├── agent/
│   └── run.js            # Agente AI settimanale (Fase 2)
└── supabase/
    └── schema.sql        # Schema DB di riferimento
```

## Sviluppo locale

```bash
npm run dev      # serve la PWA su http://localhost:5173
```

Il frontend è già configurato sul progetto Supabase
`emerging-artists-weekly` (vedi `js/config.js`). La chiave usata è la chiave
**pubblica** (`anon`/publishable): è sicura lato client perché protetta da RLS.

## Database

Lo schema è in [`supabase/schema.sql`](supabase/schema.sql) ed è già applicato
sul progetto. Tabelle: `playlists`, `artisti`, `feedback`; view
`artisti_con_contatori`. RLS: lettura pubblica, inserimento feedback anonimo
vincolato a `tipo in ('ascolto','like')`.

## Agente AI (Fase 2)

```bash
npm install
cp .env.example .env   # inserisci le chiavi SEGRETE
npm run agent          # SCOUT -> CURATOR (Claude) -> WRITER (Supabase)
```

`agent/run.js` cerca su YouTube candidati con < 1000 view, fa selezionare e
descrivere i 10 migliori a Claude (`claude-opus-4-8`, tool use) e li scrive
nella playlist del lunedì corrente. Schedulabile ogni lunedì (cron / Vercel Cron
/ Supabase Edge Function).

> ⚠️ La `SUPABASE_SERVICE_KEY` e le chiavi API non vanno **mai** nel frontend né
> committate: restano in `.env` (gitignored).

## Deploy

Sito statico: collega il repo a **Vercel** o **Netlify**, nessuna build
necessaria. La root del progetto è la root del sito.

## Note legali

- Embed YouTube in forma standard (conforme ai ToS).
- Nessun file audio detenuto dalla piattaforma.
- Feedback anonimi, nessun dato personale, nessuna autenticazione.
