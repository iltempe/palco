import { useState } from "react";
import type { Track } from "../lib/types";
import { analyticsEnabled, fetchTrackLikes } from "../lib/analytics";
import { useBadge } from "../context/BadgeContext";
import { compact, hasLocal, logEvent } from "../lib/utils";

export default function LikeButton({
  track,
  initial,
}: {
  track: Track;
  initial: number;
}) {
  const { celebrate } = useBadge();
  const [count, setCount] = useState(initial);
  const [liked, setLiked] = useState(() => hasLocal(track.id, "like"));

  async function onLike(e: React.MouseEvent) {
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    setCount((c) => c + 1);
    const isNew = await logEvent(track.id, "like");
    if (!isNew) return;
    // Posizione del fan (= numero di like dopo il tuo). Null se analytics off.
    const rank = analyticsEnabled ? await fetchTrackLikes(track.id) : null;
    celebrate(track, rank);
  }

  return (
    <button
      onClick={onLike}
      aria-pressed={liked}
      aria-label="Mi piace"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition active:scale-95 ${
        liked ? "bg-like/15 text-like" : "bg-elev text-dim hover:text-[#f3f3f6]"
      }`}
    >
      <span className="text-base leading-none">{liked ? "♥" : "♡"}</span>
      {analyticsEnabled && <span className="tabular-nums">{compact(count)}</span>}
    </button>
  );
}
