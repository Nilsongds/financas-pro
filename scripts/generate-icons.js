import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const ICONS_DIR = path.resolve('public', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// 1. Create crisp SVG Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  
  <!-- Outer Accent Glow / Ring -->
  <rect x="24" y="24" width="464" height="464" rx="96" fill="none" stroke="url(#emeraldGrad)" stroke-width="6" opacity="0.4" />

  <!-- Wallet Body -->
  <g filter="url(#shadow)">
    <!-- Main Wallet Card Body -->
    <rect x="96" y="140" width="320" height="232" rx="28" fill="url(#emeraldGrad)" />
    
    <!-- Top Pocket Tab -->
    <path d="M 128 140 L 160 112 L 352 112 L 384 140 Z" fill="#047857" opacity="0.8" />
    
    <!-- Inner Card Peak -->
    <rect x="144" y="116" width="224" height="60" rx="12" fill="#ecfdf5" opacity="0.9" />
    <rect x="164" y="132" width="100" height="8" rx="4" fill="#059669" opacity="0.5" />
    
    <!-- Front Wallet Flap -->
    <rect x="96" y="176" width="320" height="196" rx="24" fill="url(#emeraldGrad)" />
    
    <!-- Wallet Stitching Line -->
    <rect x="108" y="188" width="296" height="172" rx="16" fill="none" stroke="#a7f3d0" stroke-width="3" stroke-dasharray="8 6" opacity="0.6" />
    
    <!-- Lock Clasp Flap -->
    <path d="M 280 236 L 396 236 C 410 236 420 248 420 262 L 420 286 C 420 300 410 312 396 312 L 280 312 C 268 312 258 302 258 290 L 258 258 C 258 246 268 236 280 236 Z" fill="#065f46" />
    
    <!-- Gold Coin Emblem / Button -->
    <circle cx="370" cy="274" r="22" fill="url(#goldGrad)" />
    <circle cx="370" cy="274" r="16" fill="none" stroke="#fef3c7" stroke-width="2" />
    <text x="370" y="281" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#78350f" text-anchor="middle">R$</text>

    <!-- Upward Growth Spark/Chart -->
    <g transform="translate(136, 228)">
      <path d="M 12 64 L 40 40 L 64 52 L 100 16" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
      <polygon points="96,16 108,14 104,26" fill="#ffffff" />
      <circle cx="12" cy="64" r="5" fill="#ffffff" />
      <circle cx="40" cy="40" r="5" fill="#ffffff" />
      <circle cx="64" cy="52" r="5" fill="#ffffff" />
      <circle cx="100" cy="16" r="6" fill="#fbbf24" />
    </g>
  </g>
</svg>`;

const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="emeraldGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="goldGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <!-- Full bleed background for maskable -->
  <rect width="512" height="512" fill="url(#bgGradM)" />
  
  <!-- Centered Wallet Safe Zone Icon -->
  <g transform="translate(40, 40) scale(0.84)">
    <rect x="96" y="140" width="320" height="232" rx="28" fill="url(#emeraldGradM)" />
    <path d="M 128 140 L 160 112 L 352 112 L 384 140 Z" fill="#047857" opacity="0.8" />
    <rect x="144" y="116" width="224" height="60" rx="12" fill="#ecfdf5" opacity="0.9" />
    <rect x="164" y="132" width="100" height="8" rx="4" fill="#059669" opacity="0.5" />
    <rect x="96" y="176" width="320" height="196" rx="24" fill="url(#emeraldGradM)" />
    <rect x="108" y="188" width="296" height="172" rx="16" fill="none" stroke="#a7f3d0" stroke-width="3" stroke-dasharray="8 6" opacity="0.6" />
    <path d="M 280 236 L 396 236 C 410 236 420 248 420 262 L 420 286 C 420 300 410 312 396 312 L 280 312 C 268 312 258 302 258 290 L 258 258 C 258 246 268 236 280 236 Z" fill="#065f46" />
    <circle cx="370" cy="274" r="22" fill="url(#goldGradM)" />
    <circle cx="370" cy="274" r="16" fill="none" stroke="#fef3c7" stroke-width="2" />
    <text x="370" y="281" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#78350f" text-anchor="middle">R$</text>
    <g transform="translate(136, 228)">
      <path d="M 12 64 L 40 40 L 64 52 L 100 16" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
      <polygon points="96,16 108,14 104,26" fill="#ffffff" />
      <circle cx="12" cy="64" r="5" fill="#ffffff" />
      <circle cx="40" cy="40" r="5" fill="#ffffff" />
      <circle cx="64" cy="52" r="5" fill="#ffffff" />
      <circle cx="100" cy="16" r="6" fill="#fbbf24" />
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(ICONS_DIR, 'icon.svg'), svgIcon);
fs.writeFileSync(path.join(ICONS_DIR, 'icon-maskable.svg'), svgMaskable);
fs.writeFileSync(path.join('public', 'favicon.svg'), svgIcon);

// Pure Node.js PNG encoder helper
function createPngBuffer(width, height, drawFn) {
  // Buffer of RGBA pixels with 1-byte per scanline filter (0)
  const rawData = Buffer.alloc(height * (1 + width * 4));
  
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x / width, y / height, x, y);
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

// Pixel Renderer for Emerald Wallet Finanças App
function renderAppIcon(u, v, isMaskable) {
  // Background gradient: slate-900 (#0f172a) to slate-800 (#1e293b)
  const bgR = 15 + (30 - 15) * ((u + v) / 2);
  const bgG = 23 + (41 - 23) * ((u + v) / 2);
  const bgB = 42 + (59 - 42) * ((u + v) / 2);

  // If not maskable, round corners with anti-aliasing
  if (!isMaskable) {
    const rx = 0.22;
    const dx = Math.max(0, Math.abs(u - 0.5) - (0.5 - rx));
    const dy = Math.max(0, Math.abs(v - 0.5) - (0.5 - rx));
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > rx) {
      return [0, 0, 0, 0];
    }
  }

  // Wallet coordinates
  const scale = isMaskable ? 0.76 : 0.88;
  const nu = (u - 0.5) / scale + 0.5;
  const nv = (v - 0.5) / scale + 0.5;

  // Wallet rectangle: x: 0.20 to 0.80, y: 0.32 to 0.72
  const wLeft = 0.20, wRight = 0.80, wTop = 0.32, wBottom = 0.72;
  
  if (nu >= wLeft && nu <= wRight && nv >= wTop && nv <= wBottom) {
    // Emerald wallet gradient: #34d399 to #059669
    const gradFactor = (nu - wLeft) / (wRight - wLeft) * 0.4 + (nv - wTop) / (wBottom - wTop) * 0.6;
    const wr = 16 + (5 - 16) * gradFactor;
    const wg = 185 + (150 - 185) * gradFactor;
    const wb = 129 + (105 - 129) * gradFactor;

    // Clasp area
    if (nu >= 0.58 && nu <= 0.82 && nv >= 0.46 && nv <= 0.60) {
      // Dark green clasp
      if (nu >= 0.70 && nu <= 0.78 && nv >= 0.50 && nv <= 0.56) {
        // Gold button
        return [251, 191, 36, 255];
      }
      return [6, 95, 70, 255];
    }

    // Growth chart trend line inside wallet (white with glow)
    // Points: (0.30, 0.62) -> (0.38, 0.54) -> (0.45, 0.57) -> (0.54, 0.44)
    const chartY = nu < 0.38 
      ? 0.62 - (nu - 0.30) / 0.08 * 0.08
      : (nu < 0.45 
          ? 0.54 + (nu - 0.38) / 0.07 * 0.03 
          : (nu < 0.54 ? 0.57 - (nu - 0.45) / 0.09 * 0.13 : 999));

    if (Math.abs(nv - chartY) < 0.015 && nu >= 0.28 && nu <= 0.56) {
      return [255, 255, 255, 255];
    }

    return [wr, wg, wb, 255];
  }

  // Top card peaking out: x: 0.30 to 0.70, y: 0.24 to 0.32
  if (nu >= 0.28 && nu <= 0.72 && nv >= 0.25 && nv < wTop) {
    return [236, 253, 245, 255]; // Soft mint paper
  }

  return [bgR, bgG, bgB, 255];
}

console.log('Generating PNG icons...');
const icon192 = createPngBuffer(192, 192, (u, v) => renderAppIcon(u, v, false));
const icon512 = createPngBuffer(512, 512, (u, v) => renderAppIcon(u, v, false));
const iconMaskable192 = createPngBuffer(192, 192, (u, v) => renderAppIcon(u, v, true));
const iconMaskable512 = createPngBuffer(512, 512, (u, v) => renderAppIcon(u, v, true));

fs.writeFileSync(path.join(ICONS_DIR, 'icon-192x192.png'), icon192);
fs.writeFileSync(path.join(ICONS_DIR, 'icon-512x512.png'), icon512);
fs.writeFileSync(path.join(ICONS_DIR, 'icon-maskable-192.png'), iconMaskable192);
fs.writeFileSync(path.join(ICONS_DIR, 'icon-maskable-512.png'), iconMaskable512);
fs.writeFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), icon192);

console.log('Icons generated successfully!');
