import type { Track, Counts } from "../lib/types";
import { usePlayer } from "../context/PlayerContext";
import { analyticsEnabled } from "../lib/analytics";
import { assetUrl, compact } from "../lib/utils";
import LikeButton from "./LikeButton";

function formatDate(d?: string): string {
  if (!d) return "";
  const date = new Date(d + "T00:00:00");
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("it", { month: "short", year: "numeric" });
}

export default function TrackRow({ track, counts }: { track: Track; counts?: Counts }) {
  const { current, isPlaying, play, toggle } = usePlayer();
  const active = current?.id === track.id;
  const showPause = active && isPlaying;

  return (
    <div
      className={`group flex items-center gap-4 rounded-2xl p-3 transition ${
        active ? "bg-elev" : "hover:bg-surface"
      }`}
    >
      <button
        onClick={() => (active ? toggle() : play(track))}
        aria-label={showPause ? "Pausa" : "Riproduci"}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-elev"
      >
        {track.cover ? (
          <img src={assetUrl(track.cover)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-accent/40 to-bg text-xl">
            🎵
          </div>
        )}
        <span
          className={`absolute inset-0 grid place-items-center bg-black/45 text-white transition ${
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {showPause ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className={`truncate font-semibold ${active ? "text-accent-soft" : ""}`}>
            {track.title}
          </h3>
          {track.releaseDate && (
            <span className="shrink-0 text-xs text-dim">{formatDate(track.releaseDate)}</span>
          )}
        </div>
        {track.description && (
          <p className="truncate text-sm text-dim">{track.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {analyticsEnabled && (
          <span className="hidden text-xs text-dim sm:inline">
            ▶ {compact(counts?.plays ?? 0)}
          </span>
        )}
        <LikeButton track={track} initial={counts?.likes ?? 0} />
      </div>
    </div>
  );
}
