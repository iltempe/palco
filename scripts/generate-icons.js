// Genera le icone PWA (192, 512) senza dipendenze: encoder PNG via zlib.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

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
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(size, draw) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter byte
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y);
      const off = y * (size * 4 + 1) + 1 + x * 4;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = a;
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Sfondo viola con una "nota musicale" stilizzata bianca (testa + gambo).
function makeIcon(size) {
  const bg = [0x6c, 0x47, 0xff, 255];
  const bg2 = [0x46, 0x2c, 0xc0, 255];
  const white = [243, 243, 246, 255];
  const cx = size * 0.42, cy = size * 0.66, r = size * 0.13;       // testa nota
  const stemX = cx + r * 0.92, stemTop = size * 0.30, stemW = size * 0.035;

  return encodePNG(size, (x, y) => {
    // gradiente diagonale di sfondo
    const t = (x + y) / (2 * size);
    const base = [
      Math.round(bg[0] * (1 - t) + bg2[0] * t),
      Math.round(bg[1] * (1 - t) + bg2[1] * t),
      Math.round(bg[2] * (1 - t) + bg2[2] * t),
      255,
    ];
    // testa nota (ellisse leggermente inclinata -> cerchio per semplicita)
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= r * r) return white;
    // gambo
    if (x >= stemX - stemW && x <= stemX + stemW && y >= stemTop && y <= cy) return white;
    // bandierina del gambo
    if (
      x >= stemX - stemW && x <= stemX + size * 0.12 &&
      y >= stemTop && y <= stemTop + size * 0.10 &&
      (y - stemTop) <= (x - (stemX - stemW)) * 0.8
    ) return white;
    return base;
  });
}

const outDir = path.join(__dirname, "..", "icons");
fs.mkdirSync(outDir, { recursive: true });
for (const size of [192, 512]) {
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), makeIcon(size));
  console.log(`icon-${size}.png ok`);
}
