import { createContext, useContext, useState, type ReactNode } from "react";
import type { Track } from "../lib/types";
import FanBadge from "../components/FanBadge";

interface BadgeState {
  /** Mostra la card "sei il N° fan" (rank null = nessun contatore attivo). */
  celebrate: (track: Track, rank: number | null) => void;
}

const Ctx = createContext<BadgeState | undefined>(undefined);

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<{ track: Track; rank: number | null } | null>(null);

  return (
    <Ctx.Provider value={{ celebrate: (track, rank) => setData({ track, rank }) }}>
      {children}
      {data && (
        <FanBadge track={data.track} rank={data.rank} onClose={() => setData(null)} />
      )}
    </Ctx.Provider>
  );
}

export function useBadge(): BadgeState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBadge deve stare dentro <BadgeProvider>");
  return ctx;
}
