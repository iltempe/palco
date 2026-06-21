import { useEffect, useState } from "react";
import type { Track } from "../lib/types";
import { buildShareImage, shareFan } from "../lib/share";

export default function FanBadge({
  track,
  rank,
  onClose,
}: {
  track: Track;
  rank: number | null;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    buildShareImage(track, rank).then(({ dataUrl, file }) => {
      setDataUrl(dataUrl);
      setFile(file);
    });
  }, [track, rank]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onShare() {
    const r = await shareFan(track, rank, file);
    if (r === "copied") setMsg("Link copiato negli appunti!");
    else if (r === "error") setMsg("Condivisione annullata.");
  }

  function onDownload() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "palco-fan.png";
    a.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-2xl font-extrabold">
          {rank != null ? <>🎉 Sei il {rank}° fan!</> : <>🎉 Grazie del like!</>}
        </p>
        <p className="mt-1 text-sm text-dim">
          {rank != null
            ? "Sei tra i primi ad ascoltarlo. Falla girare!"
            : "Condividila con un amico."}
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl bg-elev">
          {dataUrl ? (
            <img src={dataUrl} alt="Card da condividere" className="w-full" />
          ) : (
            <div className="aspect-square animate-pulse" />
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button onClick={onShare} className="btn-primary py-3">
            <span aria-hidden>📲</span> Condividi
          </button>
          <div className="flex gap-2">
            <button onClick={onDownload} className="btn-ghost flex-1">
              Salva immagine
            </button>
            <button onClick={onClose} className="btn-ghost flex-1">
              Chiudi
            </button>
          </div>
        </div>

        {msg && <p className="mt-3 text-xs text-accent-soft">{msg}</p>}
      </div>
    </div>
  );
}
