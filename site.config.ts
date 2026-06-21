// =============================================================
//  CONFIGURAZIONE DEL TUO SITO  —  modifica solo questo file.
//
//  1. Scrivi le tue info qui sotto (nome, bio, link).
//  2. Trascina i tuoi file audio in  public/music/
//     e le copertine in  public/images/
//  3. Aggiungi un blocco per ogni brano nell'elenco `tracks`.
//  4. (Opzionale) Per contare ascolti e like, compila `analytics`.
//
//  Nessun account, nessun login: è il TUO sito.
// =============================================================

import type { SiteConfig } from "./src/lib/types";

export const site: SiteConfig = {
  // Lingua dell'interfaccia: "it" oppure "en"
  lang: "it",

  artist: {
    name: "Marta Lo Russo",
    tagline: "Cantautrice da Napoli",
    location: "Napoli, IT",
    bio: "Voce graffiante e chitarra, testi che parlano di quartiere e di sogni.\nQuesto è il mio primo EP, registrato in cameretta. Buon ascolto.",
    avatar: "/images/avatar.svg", // metti qui la tua foto (es. "/images/io.jpg")
    accentColor: "#6c47ff", // il colore del tuo sito
    links: {
      instagram: "https://instagram.com/",
      spotify: "https://open.spotify.com/",
      youtube: "https://youtube.com/",
      email: "ciao@martalorusso.it",
    },
  },

  // I tuoi brani. Copia un blocco per aggiungerne uno.
  tracks: [
    {
      id: "quartiere",
      title: "Quartiere",
      file: "/music/quartiere.wav",
      cover: "/images/quartiere.svg",
      description: "Il primo singolo. Una passeggiata tra i vicoli al tramonto.",
      releaseDate: "2026-05-01",
      links: { spotify: "https://open.spotify.com/" },
    },
    {
      id: "sogni-a-forcella",
      title: "Sogni a Forcella",
      file: "/music/sogni-a-forcella.wav",
      cover: "/images/sogni.svg",
      description: "Un brano sulla voglia di andarsene e quella di restare.",
      releaseDate: "2026-05-15",
    },
    {
      id: "ultimo-treno",
      title: "Ultimo treno",
      file: "/music/ultimo-treno.wav",
      description: "Registrato in presa diretta, una notte di pioggia.",
      releaseDate: "2026-06-01",
    },
  ],

  // OPZIONALE — contatori di ascolti e like.
  // Lascia vuoto per un sito 100% statico (i contatori non vengono mostrati).
  // Per attivarli: crea un progetto gratuito su supabase.com, incolla qui
  // URL e anon key, ed esegui il file  supabase/schema.sql  (vedi README).
  analytics: {
    supabaseUrl: "",
    supabaseAnonKey: "",
  },
};
