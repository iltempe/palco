import { useEffect, useState } from "react";
import { config } from "../lib/config";
import { fetchCounts } from "../lib/analytics";
import { t } from "../lib/i18n";
import type { Counts } from "../lib/types";
import Hero from "../components/Hero";
import TrackRow from "../components/TrackRow";

export default function Home() {
  const [counts, setCounts] = useState<Record<string, Counts>>({});

  useEffect(() => {
    fetchCounts().then(setCounts);
  }, []);

  const { artist, tracks } = config;

  return (
    <div className="mx-auto max-w-3xl px-4">
      <Hero artist={artist} />

      <section className="pb-32">
        <h2 className="mb-3 px-3 text-sm font-bold uppercase tracking-wider text-dim">
          {t.tracksHeading(tracks.length)}
        </h2>
        {tracks.length === 0 ? (
          <p className="rounded-2xl bg-surface p-8 text-center text-dim">{t.emptyTracks}</p>
        ) : (
          <div className="space-y-1">
            {tracks.map((t) => (
              <TrackRow key={t.id} track={t} counts={counts[t.id]} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
