import { usePlayer } from "../context/PlayerContext";
import { config } from "../lib/config";
import { assetUrl, formatTime } from "../lib/utils";
import { t } from "../lib/i18n";

export default function PlayerBar() {
  const { current, isPlaying, toggle, seek, next, prev, progress, currentTime, duration } =
    usePlayer();
  if (!current) return null;

  const many = config.tracks.length > 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-elev/70 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-elev">
          {current.cover ? (
            <img src={assetUrl(current.cover)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-lg">🎵</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{current.title}</div>
          <div className="truncate text-xs text-dim">{config.artist.name}</div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="w-9 text-right text-[11px] tabular-nums text-dim">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(progress * 1000)}
              onChange={(e) => seek(Number(e.target.value) / 1000)}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-elev accent-[rgb(var(--accent))]"
              aria-label="Avanzamento brano"
            />
            <span className="w-9 text-[11px] tabular-nums text-dim">{formatTime(duration)}</span>
          </div>
        </div>

        {many && (
          <button onClick={prev} aria-label={t.prev} className="hidden p-2 text-dim hover:text-white sm:block">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
        )}
        <button
          onClick={toggle}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white transition active:scale-95"
          aria-label={isPlaying ? t.pause : t.play}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        {many && (
          <button onClick={next} aria-label={t.next} className="hidden p-2 text-dim hover:text-white sm:block">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
