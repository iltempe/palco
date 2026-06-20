// Genera le icone della PWA (192, 512, 180 Apple) senza dipendenze.
//   npm run icons              -> usa il colore di default
//   npm run icons -- "#ff5500" -> usa il tuo colore
// In alternativa sostituisci a mano i PNG in public/icons/ con un tuo logo quadrato.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const accentHex = process.argv[2] || "#6c47ff";

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(size, draw) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const [ar, ag, ab] = hexToRgb(accentHex);
const dark = [Math.round(ar * 0.35), Math.round(ag * 0.35), Math.round(ab * 0.45)];
const white = [243, 243, 246, 255];

function icon(size) {
  const cx = size * 0.40, cy = size * 0.66, r = size * 0.12;
  const stemX = cx + r * 0.92, stemTop = size * 0.30, stemW = size * 0.038;
  return encodePNG(size, (x, y) => {
    const t = (x + y) / (2 * size);
    const bg = [
      Math.round(ar * (1 - t) + dark[0] * t),
      Math.round(ag * (1 - t) + dark[1] * t),
      Math.round(ab * (1 - t) + dark[2] * t),
      255,
    ];
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= r * r) return white;
    if (x >= stemX - stemW && x <= stemX + stemW && y >= stemTop && y <= cy) return white;
    if (
      x >= stemX - stemW && x <= stemX + size * 0.13 &&
      y >= stemTop && y <= stemTop + size * 0.11 &&
      (y - stemTop) <= (x - (stemX - stemW)) * 0.85
    ) return white;
    return bg;
  });
}

const out = `${__dirname}/../public/icons`;
mkdirSync(out, { recursive: true });
for (const size of [192, 512]) writeFileSync(`${out}/icon-${size}.png`, icon(size));
writeFileSync(`${out}/apple-touch-icon.png`, icon(180));
console.log(`Icone generate in public/icons/ con colore ${accentHex}`);
