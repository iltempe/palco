import { config } from "./config";

export type Lang = "it" | "en";
export const lang: Lang = config.lang === "en" ? "en" : "it";

interface Dict {
  tracksHeading: (n: number) => string;
  emptyTracks: string;
  linkWebsite: string;
  play: string;
  pause: string;
  prev: string;
  next: string;
  like: string;
  install: string;
  ios: { before: string; share: string; middle: string; addHome: string };
  badge: {
    title: (rank: number | null) => string;
    sub: (rank: number | null) => string;
    share: string;
    save: string;
    close: string;
    copied: string;
    cancelled: string;
    alt: string;
  };
  img: {
    headline: (rank: number | null) => string;
    of: (name: string) => string;
    listen: string;
  };
  shareText: (rank: number | null, name: string, title: string) => string;
  footerBy: (name: string) => string;
}

const it: Dict = {
  tracksHeading: (n) => (n > 1 ? "Brani" : "Brano"),
  emptyTracks: "Aggiungi i tuoi brani in site.config.ts.",
  linkWebsite: "Sito",
  play: "Riproduci",
  pause: "Pausa",
  prev: "Precedente",
  next: "Successivo",
  like: "Mi piace",
  install: "Installa l'app",
  ios: {
    before: "Tocca",
    share: "Condividi",
    middle: "nella barra di Safari, poi",
    addHome: "Aggiungi alla schermata Home",
  },
  badge: {
    title: (rank) => (rank != null ? `🎉 Sei il ${rank}° fan!` : "🎉 Grazie del like!"),
    sub: (rank) =>
      rank != null
        ? "Sei tra i primi ad ascoltarlo. Falla girare!"
        : "Condividila con un amico.",
    share: "Condividi",
    save: "Salva immagine",
    close: "Chiudi",
    copied: "Link copiato negli appunti!",
    cancelled: "Condivisione annullata.",
    alt: "Card da condividere",
  },
  img: {
    headline: (rank) => (rank != null ? `Sono il ${rank}° fan` : "Tra i primi fan"),
    of: (name) => `di ${name}`,
    listen: "ascolta su Palco 🎤",
  },
  shareText: (rank, name, title) =>
    rank != null
      ? `Sono il ${rank}° fan di ${name}! 🎤 Ascolta “${title}”`
      : `Ascolta ${name}: “${title}” 🎤`,
  footerBy: (name) => `Sito di ${name} · creato con`,
};

const en: Dict = {
  tracksHeading: (n) => (n > 1 ? "Tracks" : "Track"),
  emptyTracks: "Add your tracks in site.config.ts.",
  linkWebsite: "Website",
  play: "Play",
  pause: "Pause",
  prev: "Previous",
  next: "Next",
  like: "Like",
  install: "Install the app",
  ios: {
    before: "Tap",
    share: "Share",
    middle: "in the Safari bar, then",
    addHome: "Add to Home Screen",
  },
  badge: {
    title: (rank) => (rank != null ? `🎉 You're fan #${rank}!` : "🎉 Thanks for the like!"),
    sub: (rank) =>
      rank != null ? "You're one of the first. Spread the word!" : "Share it with a friend.",
    share: "Share",
    save: "Save image",
    close: "Close",
    copied: "Link copied to clipboard!",
    cancelled: "Sharing cancelled.",
    alt: "Shareable card",
  },
  img: {
    headline: (rank) => (rank != null ? `I'm fan #${rank}` : "Among the first fans"),
    of: (name) => `of ${name}`,
    listen: "listen on Palco 🎤",
  },
  shareText: (rank, name, title) =>
    rank != null
      ? `I'm fan #${rank} of ${name}! 🎤 Listen to “${title}”`
      : `Listen to ${name}: “${title}” 🎤`,
  footerBy: (name) => `${name}'s site · made with`,
};

export const t: Dict = lang === "en" ? en : it;
