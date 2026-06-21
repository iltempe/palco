import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { analyticsCreds, analyticsEnabled } from "./config";
import type { Counts } from "./types";

export { analyticsEnabled };

const client: SupabaseClient | null = analyticsEnabled
  ? createClient(analyticsCreds.url, analyticsCreds.key, {
      auth: { persistSession: false },
    })
  : null;

/** Contatori (play/like) per ogni track_id. Vuoto se l'analytics è disattivata. */
export async function fetchCounts(): Promise<Record<string, Counts>> {
  if (!client) return {};
  const { data, error } = await client.from("event_counts").select("*");
  if (error) {
    console.warn("analytics:", error.message);
    return {};
  }
  const map: Record<string, Counts> = {};
  for (const row of data ?? []) {
    map[row.track_id] = { plays: Number(row.plays) || 0, likes: Number(row.likes) || 0 };
  }
  return map;
}

/** Registra un evento anonimo. No-op se l'analytics è disattivata. */
export async function recordEvent(trackId: string, tipo: "play" | "like"): Promise<void> {
  if (!client) return;
  const { error } = await client.from("events").insert({ track_id: trackId, tipo });
  if (error) console.warn("analytics:", error.message);
}

/** Numero di like attuali di un brano (= la tua posizione subito dopo il like). */
export async function fetchTrackLikes(trackId: string): Promise<number | null> {
  if (!client) return null;
  const { data, error } = await client
    .from("event_counts")
    .select("likes")
    .eq("track_id", trackId)
    .maybeSingle();
  if (error) {
    console.warn("analytics:", error.message);
    return null;
  }
  return data ? Number(data.likes) || 0 : 0;
}
