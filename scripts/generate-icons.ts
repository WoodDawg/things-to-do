/**
 * Generate the app icon as PNGs, no image deps — a white map pin carrying the
 * trail blaze, over a spruce gradient with mountain silhouettes. 3x3
 * supersampled for smooth edges.
 *
 * Run: npx tsx scripts/generate-icons.ts
 * Outputs: public/icon-192.png, public/icon-512.png, app/apple-icon.png (180),
 *          app/icon.png (512, used by Next as the favicon).
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

type RGB = [number, number, number];

const SKY_TOP: RGB = [0x3a, 0x7d, 0x5e];
const SKY_BOTTOM: RGB = [0x1e, 0x45, 0x34];
const MTN_BACK: RGB = [0x17, 0x36, 0x27];
const MTN_FRONT: RGB = [0x11, 0x2a, 0x1e];
const CHALK: RGB = [0xfb, 0xfb, 0xf7];
const SPRUCE: RGB = [0x2c, 0x5e, 0x45];

function lerp(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function inRoundedRect(
  u: number,
  v: number,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  r: number,
): boolean {
  const dx = Math.abs(u - cx) - (hw - r);
  const dy = Math.abs(v - cy) - (hh - r);
  if (dx <= 0 && dy <= 0) return true;
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) <= r;
}

// Classic map pin: circle head + triangle to a tip.
const PIN_CX = 0.5;
const PIN_CY = 0.4;
const PIN_R = 0.205;
const TRI_TOP = 0.47;
const TRI_HALF = 0.145;
const TIP_Y = 0.78;

function inPin(u: number, v: number): boolean {
  if (Math.hypot(u - PIN_CX, v - PIN_CY) <= PIN_R) return true;
  if (v >= TRI_TOP && v <= TIP_Y) {
    return Math.abs(u - PIN_CX) <= (TRI_HALF * (TIP_Y - v)) / (TIP_Y - TRI_TOP);
  }
  return false;
}

/** Scene color at normalized coordinates (u, v) in [0, 1]. */
function colorAt(u: number, v: number): RGB {
  let c = lerp(SKY_TOP, SKY_BOTTOM, v);
  if (v >= 0.62 + 1.05 * Math.abs(u - 0.26)) c = MTN_BACK;
  if (v >= 0.6 + 1.2 * Math.abs(u - 0.78)) c = MTN_FRONT;
  if (inPin(u, v)) {
    c = CHALK;
    if (inRoundedRect(u, v, PIN_CX, 0.385, 0.052, 0.105, 0.02)) c = SPRUCE;
  }
  return c;
}

function crc32(buf: Uint8Array): number {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
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
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

const SS = 3; // supersampling grid

function makeIcon(size: number): Uint8Array {
  const raw = new Uint8Array(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) / size;
          const v = (y + (sy + 0.5) / SS) / size;
          const c = colorAt(u, v);
          r += c[0];
          g += c[1];
          b += c[2];
        }
      }
      const n = SS * SS;
      const i = rowStart + 1 + x * 4;
      raw[i] = Math.round(r / n);
      raw[i + 1] = Math.round(g / n);
      raw[i + 2] = Math.round(b / n);
      raw[i + 3] = 255;
    }
  }

  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, size);
  dv.setUint32(4, size);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const parts = [
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', new Uint8Array(deflateSync(raw))),
    chunk('IEND', new Uint8Array(0)),
  ];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
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
writeFileSync('app/icon.png', makeIcon(512));
console.log('Wrote icon-192, icon-512, apple-icon (180), app/icon.png (favicon)');
