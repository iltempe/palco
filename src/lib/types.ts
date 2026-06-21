// Tipi del file di configurazione del sito (vedi `site.config.ts`).

export interface SocialLinks {
  instagram?: string;
  spotify?: string;
  youtube?: string;
  appleMusic?: string;
  bandcamp?: string;
  soundcloud?: string;
  website?: string;
  email?: string;
}

export interface Artist {
  /** Nome d'arte mostrato nell'header. */
  name: string;
  /** Sottotitolo breve (es. "Cantautrice da Napoli"). */
  tagline?: string;
  location?: string;
  /** Bio (può andare a capo). */
  bio?: string;
  /** Percorso immagine in /public (es. "/images/avatar.jpg") o URL. */
  avatar?: string;
  /** Colore tema in HEX (es. "#6c47ff"). */
  accentColor?: string;
  links?: SocialLinks;
}

export interface Track {
  /** Identificatore stabile e univoco (usato per i contatori e i link). */
  id: string;
  title: string;
  /** File audio locale ("/music/brano.mp3") o URL esterno. */
  file: string;
  /** Copertina opzionale: percorso in /public o URL. */
  cover?: string;
  description?: string;
  /** Data di uscita in formato YYYY-MM-DD (opzionale). */
  releaseDate?: string;
  /** Link al brano sulle piattaforme (opzionale). */
  links?: Pick<SocialLinks, "spotify" | "youtube" | "appleMusic" | "bandcamp" | "soundcloud">;
}

export interface Analytics {
  /** URL del progetto Supabase. Lascia vuoto per un sito statico. */
  supabaseUrl?: string;
  /** Chiave anon/publishable Supabase (pubblica, protetta da RLS). */
  supabaseAnonKey?: string;
}

export interface SiteConfig {
  /** Lingua dell'interfaccia: "it" (default) o "en". */
  lang?: "it" | "en";
  artist: Artist;
  tracks: Track[];
  analytics?: Analytics;
}

export interface Counts {
  plays: number;
  likes: number;
}
