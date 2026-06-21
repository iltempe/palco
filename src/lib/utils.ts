import { recordEvent } from "./analytics";
import { lang } from "./i18n";

/** Formatta i secondi in m:ss. */
export function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Numeri compatti (1.2k). */
export function compact(n: number): string {
  return Intl.NumberFormat(lang, { notation: "compact" }).format(n ?? 0);
}

/** True se il path è un URL esterno. */
export function isExternal(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

/** Risolve un path locale rispetto alla base del sito (per deploy in sottocartella). */
export function assetUrl(path: string): string {
  if (!path) return "";
  if (isExternal(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}

// ---- anti-spam like/play via localStorage ----
const KEY = "openstage_events";
function read(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
export function hasLocal(trackId: string, tipo: "play" | "like"): boolean {
  return !!read()[`${trackId}_${tipo}`];
}
function mark(trackId: string, tipo: "play" | "like"): void {
  const data = read();
  data[`${trackId}_${tipo}`] = Date.now();
  localStorage.setItem(KEY, JSON.stringify(data));
}

/** Registra l'evento una sola volta per dispositivo. Ritorna true se nuovo. */
export async function logEvent(trackId: string, tipo: "play" | "like"): Promise<boolean> {
  if (hasLocal(trackId, tipo)) return false;
  mark(trackId, tipo);
  await recordEvent(trackId, tipo);
  return true;
}
