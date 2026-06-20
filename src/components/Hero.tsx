import type { Artist, SocialLinks } from "../lib/types";
import { assetUrl } from "../lib/utils";
import InstallApp from "./InstallApp";

const LINK_LABELS: Record<keyof SocialLinks, string> = {
  instagram: "Instagram",
  spotify: "Spotify",
  youtube: "YouTube",
  appleMusic: "Apple Music",
  bandcamp: "Bandcamp",
  soundcloud: "SoundCloud",
  website: "Sito",
  email: "Email",
};

export default function Hero({ artist }: { artist: Artist }) {
  const links = Object.entries(artist.links ?? {}).filter(([, v]) => !!v) as [
    keyof SocialLinks,
    string
  ][];

  return (
    <header className="flex flex-col items-center gap-6 py-10 text-center sm:flex-row sm:items-end sm:gap-8 sm:py-14 sm:text-left">
      <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-elev shadow-xl shadow-black/40 sm:h-40 sm:w-40">
        {artist.avatar ? (
          <img src={assetUrl(artist.avatar)} alt={artist.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl">🎤</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {artist.tagline && (
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-soft">
            {artist.tagline}
          </p>
        )}
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{artist.name}</h1>
        {artist.location && <p className="mt-2 text-sm text-dim">{artist.location}</p>}
        {artist.bio && (
          <p className="mx-auto mt-4 max-w-xl whitespace-pre-line text-dim sm:mx-0">{artist.bio}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {links.map(([key, value]) => (
            <a
              key={key}
              href={key === "email" ? `mailto:${value}` : value}
              target={key === "email" ? undefined : "_blank"}
              rel="noopener"
              className="chip"
            >
              {LINK_LABELS[key]} ↗
            </a>
          ))}
          <InstallApp />
        </div>
      </div>
    </header>
  );
}
