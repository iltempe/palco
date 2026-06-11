# Specifiche Tecniche — Emerging Artists Weekly Player

> Versione 1.0 — Giugno 2026

---

## Panoramica

PWA mobile-first che mostra una playlist settimanale di 10 artisti emergenti con 0 view su YouTube. Gli utenti ascoltano, mettono like, in modo completamente anonimo. Ogni lunedì la playlist si rinnova. Un agente AI popola automaticamente la playlist.

---

## Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Frontend | HTML + CSS + Vanilla JS (o React se preferito) |
| PWA | Web App Manifest + Service Worker |
| Backend / DB | Supabase (PostgreSQL + REST API) |
| Player | YouTube IFrame API (embed standard) |
| Agente AI | Claude API con tool use (Anthropic) |
| Hosting | Vercel o Netlify (free tier) |

---

## Database — Supabase

### Tabella `playlists`

```sql
create table playlists (
  id uuid primary key default gen_random_uuid(),
  settimana date not null unique, -- lunedì di riferimento
  titolo text,
  created_at timestamptz default now()
);
```

### Tabella `artisti`

```sql
create table artisti (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade,
  nome text not null,
  citta text,
  genere text,
  youtube_url text not null,
  youtube_video_id text not null, -- estratto dall'URL
  copertina_url text, -- thumbnail YouTube o custom
  scheda_editoriale text, -- testo scritto dall'agente AI
  ordine integer not null, -- 1-10
  created_at timestamptz default now()
);
```

### Tabella `feedback`

```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  artista_id uuid references artisti(id) on delete cascade,
  tipo text not null check (tipo in ('ascolto', 'like')),
  created_at timestamptz default now()
);
```

### View `artisti_con_contatori`

```sql
create view artisti_con_contatori as
select
  a.*,
  count(f.id) filter (where f.tipo = 'ascolto') as ascolti,
  count(f.id) filter (where f.tipo = 'like') as like_count
from artisti a
left join feedback f on f.artista_id = a.id
group by a.id;
```

### RLS (Row Level Security)

```sql
-- Lettura pubblica per tutti
alter table artisti enable row level security;
create policy "Lettura pubblica artisti"
  on artisti for select using (true);

alter table feedback enable row level security;
create policy "Inserimento anonimo feedback"
  on feedback for insert with check (true);
create policy "Lettura pubblica feedback"
  on feedback for select using (true);
```

---

## API Endpoints (via Supabase REST)

### GET playlist corrente con artisti e contatori

```
GET /rest/v1/artisti_con_contatori
  ?playlist_id=eq.<id>
  &order=ordine.asc
Headers:
  apikey: <SUPABASE_ANON_KEY>
```

### GET playlist corrente (trova il lunedì più recente)

```
GET /rest/v1/playlists
  ?settimana=lte.<oggi>
  &order=settimana.desc
  &limit=1
Headers:
  apikey: <SUPABASE_ANON_KEY>
```

### POST feedback (ascolto o like)

```
POST /rest/v1/feedback
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Content-Type: application/json
Body:
  {
    "artista_id": "<uuid>",
    "tipo": "ascolto" | "like"
  }
```

---

## Frontend — Struttura

```
/
├── index.html
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker
├── css/
│   └── style.css
├── js/
│   ├── app.js             # Entry point
│   ├── player.js          # YouTube IFrame API
│   ├── api.js             # Chiamate Supabase
│   └── storage.js         # localStorage anti-spam
└── icons/                 # Icone PWA (192x192, 512x512)
```

---

## Frontend — UI/UX

### Layout principale (mobile-first, max-width 430px)

```
┌─────────────────────────┐
│  🎵 Nome App            │
│  Playlist #4 • 5 giorni │
├─────────────────────────┤
│                         │
│   [Copertina artista]   │
│      (quadrata)         │
│                         │
│   Nome Artista          │
│   Genere • Città        │
│                         │
│   [Scheda editoriale]   │
│   (2-3 righe di testo)  │
│                         │
│   ▶ / ⏸                 │
│   ──────●──────────     │
│   0:47        3:22      │
│                         │
│   ♡ Like (23)  👁 (147) │
│                         │
├─────────────────────────┤
│  ● ○ ○ ○ ○ ○ ○ ○ ○ ○   │
│  < Precedente  Successivo >│
└─────────────────────────┘
```

### Comportamento navigazione
- Swipe orizzontale sinistro/destro per cambiare artista
- Bottoni precedente/successivo
- Indicatore puntini per posizione nella playlist (1-10)

### Player YouTube
- Embed caricato con `youtube.com/embed/<video_id>?enablejsapi=1`
- Controlli nativi YouTube visibili (legalmente sicuro)
- Su mobile: il player si apre nel contesto della pagina
- Fallback: link diretto a YouTube se embed bloccato

---

## Anti-Spam Like (localStorage)

```javascript
// storage.js

const STORAGE_KEY = 'eaw_feedback';

function hasFeedback(artistaId, tipo) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return !!data[`${artistaId}_${tipo}`];
}

function saveFeedback(artistaId, tipo) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  data[`${artistaId}_${tipo}`] = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Reset automatico ogni lunedì (pulizia vecchi dati)
function cleanOldFeedback() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const settimanaFa = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([_, ts]) => ts > settimanaFa)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
}
```

---

## PWA — manifest.json

```json
{
  "name": "Emerging Artists Weekly",
  "short_name": "EAW",
  "description": "Scopri artisti emergenti prima di tutti",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f12",
  "theme_color": "#6c47ff",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## PWA — sw.js (Service Worker base)

```javascript
const CACHE_NAME = 'eaw-v1';
const STATIC_ASSETS = ['/', '/css/style.css', '/js/app.js'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
```

---

## Agente AI — Selezione Artisti (Fase 2)

### Flusso settimanale (ogni lunedì)

```
1. SCOUT
   - Chiama YouTube Data API v3 con query per generi target
   - Filtra: viewCount < 1000, channelSubscriberCount < 100
   - Filtra: video pubblicato negli ultimi 6 mesi
   - Filtra: durata > 2min (esclude clip casuali)
   - Output: lista 30-50 candidati

2. CURATOR (Claude API)
   - Per ogni candidato analizza: titolo, descrizione, thumbnail
   - Verifica: è un cantautore con musica originale? (no cover, no tutorial)
   - Scrive scheda editoriale (max 150 caratteri)
   - Seleziona i 10 migliori
   - Output: 10 artisti con scheda

3. WRITER (Supabase)
   - Crea nuova riga in `playlists` con settimana corrente
   - Inserisce i 10 artisti in `artisti`
   - Estrae video_id dall'URL YouTube
   - Recupera thumbnail HD: https://img.youtube.com/vi/<video_id>/maxresdefault.jpg
```

### YouTube Data API — Query esempio

```
GET https://www.googleapis.com/youtube/v3/search
  ?part=snippet
  &q=cantautore+emergente+originale
  &type=video
  &videoCategoryId=10  (Music)
  &order=date
  &publishedAfter=<6 mesi fa>
  &regionCode=IT
  &relevanceLanguage=it
  &key=<YOUTUBE_API_KEY>
```

### Prompt Claude per la selezione

```
Sei un curatore musicale specializzato in cantautori emergenti italiani.
Ti passo una lista di video YouTube con titolo, descrizione e metadati.
Per ogni video dimmi:
1. È un cantautore con musica originale? (sì/no)
2. Se sì, scrivi una scheda editoriale di max 150 caratteri
   — tono caldo, come un amico che consiglia qualcosa.
   Es: "Voce graffiante da Napoli, testi che parlano di quartiere e sogni. Questo è il suo primo EP."

Seleziona i 10 migliori e restituisci JSON.
```

---

## Variabili d'Ambiente

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<chiave pubblica>
SUPABASE_SERVICE_KEY=<chiave privata — solo agente AI>
YOUTUBE_API_KEY=<chiave YouTube Data API v3>
ANTHROPIC_API_KEY=<chiave Claude API>
```

---

## Fasi di Sviluppo

### Fase 1 — MVP manuale (1-2 giorni)
- [ ] Setup Supabase con tabelle e RLS
- [ ] Inserimento manuale di 10 artisti nella playlist
- [ ] PWA frontend con player YouTube embed
- [ ] Contatori ascolti e like anonimi
- [ ] Anti-spam localStorage
- [ ] Deploy su Vercel/Netlify

### Fase 2 — Automazione (1 settimana)
- [ ] Script agente AI con YouTube Data API
- [ ] Integrazione Claude API per selezione e schede
- [ ] Cron job settimanale (lunedì ore 08:00)
- [ ] Archivio playlist passate

### Fase 3 — Miglioramenti UX
- [ ] Animazioni swipe
- [ ] Notifiche push "nuova playlist disponibile"
- [ ] Pagina archivio playlist passate
- [ ] Condivisione artista singolo (link diretto)

---

## Note Legali

- L'embed YouTube è usato in forma standard, conforme ai ToS YouTube
- Nessun file audio detenuto dalla piattaforma
- Feedback completamente anonimi — nessun dato personale raccolto
- Nessuna autenticazione utente richiesta

---

*Specifiche tecniche v1.0 — pronte per implementazione.*
