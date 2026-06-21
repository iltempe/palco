import type { Track } from "./types";
import { config } from "./config";
import { assetUrl } from "./utils";
import { t } from "./i18n";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function hexToRgb(hex?: string): [number, number, number] {
  const m = (hex || "#6c47ff").replace("#", "").match(/^([0-9a-fA-F]{6})$/);
  const n = m ? parseInt(m[1], 16) : 0x6c47ff;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Disegna la card "fan n°N" su canvas e la restituisce come dataURL + File. */
export async function buildShareImage(
  track: Track,
  rank: number | null
): Promise<{ dataUrl: string; file: File | null }> {
  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const [r, g, b] = hexToRgb(config.artist.accentColor);

  // sfondo a gradiente
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, `rgb(${r},${g},${b})`);
  grad.addColorStop(1, "#0f0f12");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // copertina (se presente) come riquadro arrotondato
  if (track.cover) {
    try {
      const img = await loadImage(assetUrl(track.cover));
      const size = 360;
      const x = (S - size) / 2;
      const y = 150;
      ctx.save();
      const radius = 36;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + size, y, x + size, y + size, radius);
      ctx.arcTo(x + size, y + size, x, y + size, radius);
      ctx.arcTo(x, y + size, x, y, radius);
      ctx.arcTo(x, y, x + size, y, radius);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    } catch {
      /* niente copertina: lasciamo il gradiente */
    }
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  ctx.font = rank != null ? "800 96px Inter, system-ui, sans-serif" : "800 84px Inter, system-ui, sans-serif";
  ctx.fillText(t.img.headline(rank), S / 2, 660);

  ctx.font = "600 56px Inter, system-ui, sans-serif";
  ctx.fillText(t.img.of(config.artist.name), S / 2, 740);

  ctx.font = "500 34px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(`“${track.title}”`, S / 2, 820);

  ctx.font = "700 30px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(t.img.listen, S / 2, 980);

  const dataUrl = canvas.toDataURL("image/png");
  const file = await new Promise<File | null>((resolve) =>
    canvas.toBlob(
      (blob) => resolve(blob ? new File([blob], "palco-fan.png", { type: "image/png" }) : null),
      "image/png"
    )
  );
  return { dataUrl, file };
}

/** Condivide testo+link (+ immagine se supportata). Fallback: copia il link. */
export async function shareFan(
  track: Track,
  rank: number | null,
  file: File | null
): Promise<"shared" | "copied" | "error"> {
  const url = window.location.href;
  const text = t.shareText(rank, config.artist.name, track.title);

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };

  try {
    if (file && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], text, url });
      return "shared";
    }
    if (nav.share) {
      await nav.share({ text, url });
      return "shared";
    }
  } catch {
    return "error"; // l'utente ha annullato o errore
  }

  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  } catch {
    return "error";
  }
}
