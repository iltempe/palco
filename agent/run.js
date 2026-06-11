#!/usr/bin/env node
/**
 * Agente AI settimanale — popola la playlist con 10 cantautori emergenti.
 *
 *   SCOUT   -> YouTube Data API v3 (candidati con poche view)
 *   CURATOR -> Claude API con tool use (selezione + scheda editoriale)
 *   WRITER  -> Supabase REST (crea playlist + artisti della settimana)
 *
 * Esecuzione:  node agent/run.js
 * Richiede le variabili in .env (vedi .env.example).
 */
import Anthropic from "@anthropic-ai/sdk";

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  YOUTUBE_API_KEY,
  ANTHROPIC_API_KEY,
} = process.env;

for (const [k, v] of Object.entries({
  SUPABASE_URL, SUPABASE_SERVICE_KEY, YOUTUBE_API_KEY, ANTHROPIC_API_KEY,
})) {
  if (!v) { console.error(`Manca la variabile ${k}`); process.exit(1); }
}

const GENERI_QUERY = [
  "cantautore emergente inedito",
  "indie italiano esordio",
  "singer songwriter original italy",
];

// --------------------------------------------------------------------------
// Util
// --------------------------------------------------------------------------
function monthsAgoISO(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
}

function lunediCorrente() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = lunedi
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function extractVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// --------------------------------------------------------------------------
// SCOUT — YouTube Data API
// --------------------------------------------------------------------------
async function scout() {
  const candidati = new Map();
  for (const q of GENERI_QUERY) {
    const params = new URLSearchParams({
      part: "snippet",
      q,
      type: "video",
      videoCategoryId: "10", // Music
      order: "date",
      publishedAfter: monthsAgoISO(6),
      regionCode: "IT",
      relevanceLanguage: "it",
      maxResults: "25",
      key: YOUTUBE_API_KEY,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!res.ok) { console.warn(`search "${q}" -> ${res.status}`); continue; }
    const data = await res.json();
    for (const it of data.items || []) {
      candidati.set(it.id.videoId, {
        videoId: it.id.videoId,
        titolo: it.snippet.title,
        descrizione: (it.snippet.description || "").slice(0, 400),
        canale: it.snippet.channelTitle,
        pubblicato: it.snippet.publishedAt,
      });
    }
  }

  // Recupera statistiche e durata, filtra per poche view.
  const ids = [...candidati.keys()];
  const filtrati = [];
  for (let i = 0; i < ids.length; i += 50) {
    const slice = ids.slice(i, i + 50);
    const params = new URLSearchParams({
      part: "statistics,contentDetails",
      id: slice.join(","),
      key: YOUTUBE_API_KEY,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    if (!res.ok) continue;
    const data = await res.json();
    for (const v of data.items || []) {
      const views = Number(v.statistics?.viewCount ?? 0);
      const durata = v.contentDetails?.duration || "";
      const tooShort = /^PT(\d+S|1M\d+S|[0-1]M)?$/i.test(durata) && !/[2-9]M|\dH/.test(durata);
      if (views < 1000 && !tooShort) {
        const c = candidati.get(v.id);
        filtrati.push({ ...c, views });
      }
    }
  }
  console.log(`SCOUT: ${filtrati.length} candidati con < 1000 view`);
  return filtrati;
}

// --------------------------------------------------------------------------
// CURATOR — Claude API con tool use
// --------------------------------------------------------------------------
async function curate(candidati) {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const tool = {
    name: "seleziona_artisti",
    description: "Restituisce i 10 migliori cantautori con musica originale e la loro scheda editoriale.",
    input_schema: {
      type: "object",
      properties: {
        artisti: {
          type: "array",
          minItems: 1,
          maxItems: 10,
          items: {
            type: "object",
            properties: {
              videoId: { type: "string" },
              nome: { type: "string", description: "Nome dell'artista o della band" },
              citta: { type: "string" },
              genere: { type: "string" },
              scheda_editoriale: {
                type: "string",
                description: "Max 150 caratteri, tono caldo da amico che consiglia.",
              },
            },
            required: ["videoId", "nome", "scheda_editoriale"],
          },
        },
      },
      required: ["artisti"],
    },
  };

  const lista = candidati
    .map((c, i) => `${i + 1}. [${c.videoId}] "${c.titolo}" — canale: ${c.canale} (${c.views} view)\n   ${c.descrizione}`)
    .join("\n\n");

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2000,
    tools: [tool],
    tool_choice: { type: "tool", name: "seleziona_artisti" },
    messages: [{
      role: "user",
      content:
`Sei un curatore musicale specializzato in cantautori emergenti italiani.
Ti passo una lista di video YouTube con titolo, descrizione e metadati.
Per ognuno valuta: e un cantautore con musica ORIGINALE? (no cover, no tutorial, no live altrui, no playlist).
Scegli i 10 migliori e per ciascuno scrivi una scheda editoriale di max 150 caratteri,
tono caldo come un amico che consiglia qualcosa.
Es: "Voce graffiante da Napoli, testi che parlano di quartiere e sogni. Questo e il suo primo EP."

Candidati:

${lista}`,
    }],
  });

  const toolUse = msg.content.find((b) => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude non ha restituito una selezione");
  return toolUse.input.artisti.slice(0, 10);
}

// --------------------------------------------------------------------------
// WRITER — Supabase REST
// --------------------------------------------------------------------------
const sbHeaders = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function writePlaylist(selezione) {
  const settimana = lunediCorrente();

  // Crea (o riusa) la playlist della settimana.
  let res = await fetch(`${SUPABASE_URL}/rest/v1/playlists`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify({ settimana, titolo: `Playlist ${settimana}` }),
  });
  if (!res.ok) throw new Error(`playlist ${res.status}: ${await res.text()}`);
  const [playlist] = await res.json();

  const rows = selezione.map((a, i) => ({
    playlist_id: playlist.id,
    nome: a.nome,
    citta: a.citta || null,
    genere: a.genere || null,
    youtube_url: `https://www.youtube.com/watch?v=${a.videoId}`,
    youtube_video_id: a.videoId,
    copertina_url: `https://img.youtube.com/vi/${a.videoId}/maxresdefault.jpg`,
    scheda_editoriale: a.scheda_editoriale,
    ordine: i + 1,
  }));

  res = await fetch(`${SUPABASE_URL}/rest/v1/artisti`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`artisti ${res.status}: ${await res.text()}`);

  console.log(`WRITER: playlist ${settimana} con ${rows.length} artisti pubblicata`);
}

// --------------------------------------------------------------------------
// Orchestrazione
// --------------------------------------------------------------------------
(async () => {
  const candidati = await scout();
  if (!candidati.length) { console.error("Nessun candidato trovato."); process.exit(1); }
  const selezione = await curate(candidati);
  await writePlaylist(selezione);
  console.log("Fatto.");
})().catch((e) => { console.error(e); process.exit(1); });
