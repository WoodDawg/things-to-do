/**
 * Generate app icons (spruce square + white trail blaze) as PNGs, no deps.
 * Run once: npx tsx scripts/generate-icons.ts
 * Outputs public/icon-192.png, public/icon-512.png, app/apple-icon.png (180).
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const SPRUCE = [0x2c, 0x5e, 0x45, 255];
const WHITE = [255, 255, 255, 255];

function crc32(buf: Uint8Array): number {
  let c: number;
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  const crcInput = out.subarray(4, 8 + data.length);
  dv.setUint32(8 + data.length, crc32(crcInput));
  return out;
}

/** Signed distance inside a rounded rect centered at (cx, cy). */
function inRoundedRect(
  x: number,
  y: number,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  r: number,
): boolean {
  const dx = Math.abs(x - cx) - (hw - r);
  const dy = Math.abs(y - cy) - (hh - r);
  if (dx <= 0 && dy <= 0) return true;
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) <= r;
}

function makeIcon(size: number): Uint8Array {
  const raw = new Uint8Array(size * (1 + size * 4));
  const cx = size / 2;
  const cy = size / 2;
  const hw = size * 0.11; // blaze half-width
  const hh = size * 0.22; // blaze half-height
  const r = size * 0.035;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const px = inRoundedRect(x + 0.5, y + 0.5, cx, cy, hw, hh, r) ? WHITE : SPRUCE;
      raw.set(px, rowStart + 1 + x * 4);
    }
  }

  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, size);
  dv.setUint32(4, size);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const parts = [
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', new Uint8Array(deflateSync(raw))),
    chunk('IEND', new Uint8Array(0)),
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

writeFileSync('public/icon-192.png', makeIcon(192));
writeFileSync('public/icon-512.png', makeIcon(512));
writeFileSync('app/apple-icon.png', makeIcon(180));
console.log('Wrote public/icon-192.png, public/icon-512.png, app/apple-icon.png');
